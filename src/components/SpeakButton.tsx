import { speak } from '../lib/speech';

// A small inline speaker icon. Click to hear `text` read aloud in `languageId`.
// stopPropagation matters here since these buttons often sit inside a
// clickable card (e.g. the flashcard itself flips on click).
export default function SpeakButton({
  text,
  languageId,
  label,
}: {
  text: string;
  languageId: string;
  label?: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        speak(text, languageId);
      }}
      aria-label={label ?? `Listen to "${text}"`}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1.1rem',
        lineHeight: 1,
        padding: '2px 6px',
        opacity: 0.75,
      }}
    >
      🔊
    </button>
  );
}
