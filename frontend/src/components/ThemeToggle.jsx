import { Sun, Moon } from 'lucide-react';
import './ThemeToggle.css';

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="theme-toggle"
      onClick={onToggle}
      title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      aria-label="Toggle theme"
    >
      <span className={`theme-toggle-track ${theme}`}>
        <span className="theme-toggle-thumb">
          {theme === 'dark' ? (
            <Moon size={11} strokeWidth={2} />
          ) : (
            <Sun size={11} strokeWidth={2} />
          )}
        </span>
      </span>
    </button>
  );
}
