import { useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { turso } from './lib/db/turso';
import type { Language, LearningStyle, UserSettings } from './types';
import StyleSelector from './components/StyleSelector';
import LanguageSwitcher from './components/LanguageSwitcher';
import Flashcards from './components/Flashcards';
import GrammarNotes from './components/GrammarNotes';
import ConversationPractice from './components/ConversationPractice';

type Mode = LearningStyle;

export default function App() {
  const { user, isLoaded } = useUser();
  const userId = user?.id;

  const [languages, setLanguages] = useState<Language[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<Mode>('flashcards');

  useEffect(() => {
    if (!userId) return;
    (async () => {
      const langsRes = await turso.execute('select * from languages order by sort_order');
      setLanguages(langsRes.rows as unknown as Language[]);

      const settingsRes = await turso.execute({
        sql: 'select * from user_settings where user_id = ?',
        args: [userId],
      });
      const row = settingsRes.rows[0] as any;
      if (row) {
        setSettings({
          ...row,
          learning_styles: JSON.parse(row.learning_styles || '[]'),
        });
        setMode((JSON.parse(row.learning_styles || '[]')[0] as Mode) ?? 'flashcards');
      }
      setLoading(false);
    })();
  }, [userId]);

  async function saveStyles(styles: LearningStyle[]) {
    if (!userId) return;
    const activeLanguage = settings?.active_language_id ?? languages[0]?.id ?? 'es';
    await turso.execute({
      sql: `insert into user_settings (user_id, active_language_id, learning_styles, updated_at)
            values (?, ?, ?, ?)
            on conflict(user_id) do update set
              learning_styles = excluded.learning_styles,
              updated_at = excluded.updated_at`,
      args: [userId, activeLanguage, JSON.stringify(styles), new Date().toISOString()],
    });
    setSettings({
      user_id: userId,
      active_language_id: activeLanguage,
      learning_styles: styles,
      updated_at: new Date().toISOString(),
    });
    setMode(styles[0]);
  }

  async function setActiveLanguage(id: string) {
    if (!settings || !userId) return;
    await turso.execute({
      sql: 'update user_settings set active_language_id = ? where user_id = ?',
      args: [id, userId],
    });
    setSettings({ ...settings, active_language_id: id });
  }

  // Wait for Clerk to finish checking the session before deciding what to show.
  if (!isLoaded) return null;

  // Not signed in — swap this for Clerk's <SignIn /> component whenever you
  // wire up a real sign-in page; a plain message is enough to unblock the build.
  if (!userId) {
    return (
      <div className="app-shell">
        <div className="brand">
          <span className="flag">🌿</span> Lingua Nest
        </div>
        <p>Please sign in to continue.</p>
      </div>
    );
  }

  if (loading) return null;

  const activeLanguage = languages.find((l) => l.id === settings?.active_language_id) ?? languages[0];

  return (
    <div className="app-shell">
      <div className="brand">
        <span className="flag">🌿</span> Lingua Nest
      </div>
      <div className="subtitle">A cozy corner for learning languages, one deck at a time.</div>

      {!settings ? (
        <StyleSelector initial={[]} onSave={saveStyles} />
      ) : (
        <>
          <LanguageSwitcher
            languages={languages}
            activeId={activeLanguage?.id ?? ''}
            onChange={setActiveLanguage}
          />

          <div className="nav-row">
            {settings.learning_styles.includes('flashcards') && (
              <button className={`nav-tab ${mode === 'flashcards' ? 'active' : ''}`} onClick={() => setMode('flashcards')}>
                Flashcards
              </button>
            )}
            {settings.learning_styles.includes('grammar') && (
              <button className={`nav-tab ${mode === 'grammar' ? 'active' : ''}`} onClick={() => setMode('grammar')}>
                Grammar
              </button>
            )}
            {settings.learning_styles.includes('conversation') && (
              <button className={`nav-tab ${mode === 'conversation' ? 'active' : ''}`} onClick={() => setMode('conversation')}>
                Conversation
              </button>
            )}
          </div>

          {activeLanguage && mode === 'flashcards' && (
            <Flashcards languageId={activeLanguage.id} userId={userId} />
          )}
          {activeLanguage && mode === 'grammar' && <GrammarNotes languageId={activeLanguage.id} />}
          {activeLanguage && mode === 'conversation' && <ConversationPractice languageId={activeLanguage.id} />}
        </>
      )}
    </div>
  );
}