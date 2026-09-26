import { useEffect, useState } from 'react';
import { turso } from '../lib/db/turso';
import SpeakButton from './SpeakButton';
import type { GrammarNote } from '../types';

// Row shape as it comes back from libSQL before we parse the JSON `examples` column.
type GrammarRow = Omit<GrammarNote, 'examples'> & { examples: string };

export default function GrammarNotes({
  languageId,
  unlockedDay,
}: {
  languageId: string;
  unlockedDay: number;
}) {
  const [notes, setNotes] = useState<GrammarNote[]>([]);

  useEffect(() => {
    turso
      .execute({
        sql: 'select * from grammar_notes where language_id = ? and sort_order <= ? order by sort_order',
        args: [languageId, unlockedDay],
      })
      .then((res) => {
        const rows = res.rows as unknown as GrammarRow[];
        setNotes(
          rows.map((r) => ({
            ...r,
            examples: JSON.parse(r.examples || '[]'),
          }))
        );
      });
  }, [languageId, unlockedDay]);

  if (notes.length === 0) {
    return (
      <div className="card-surface">
        <p style={{ opacity: 0.6 }}>No grammar notes yet for this language.</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {notes.map((note) => (
        <div key={note.id} className="card-surface grammar-note">
          <h3>{note.title}</h3>
          <p>{note.explanation}</p>
          {note.examples.map((ex, i) => (
            <div key={i} className="grammar-example">
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {ex.target}
                <SpeakButton text={ex.target} languageId={languageId} />
              </div>
              <div className="eng">{ex.english}</div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
