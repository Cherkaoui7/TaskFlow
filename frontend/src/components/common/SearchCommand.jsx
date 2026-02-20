import { useState, useEffect } from 'react';
import { Command } from 'cmdk';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import './SearchCommand.css';

export const SearchCommand = ({ open, setOpen }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState({ projects: [], tasks: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const down = (e) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [setOpen]);

  useEffect(() => {
    if (!open) return;

    if (!query.trim()) {
      setResults({ projects: [], tasks: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await api.get(`/search?q=${encodeURIComponent(query.trim())}`);
        setResults(response.data || { projects: [], tasks: [] });
      } catch (error) {
        console.error('Search error', error);
        setResults({ projects: [], tasks: [] });
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[14vh] px-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

      <Command className="search-command relative w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-200 dark:bg-gray-800 dark:border-gray-700">
        <div className="flex items-center border-b border-gray-200 dark:border-gray-700 px-3" cmdk-input-wrapper="">
          <svg
            className="w-5 h-5 text-gray-500 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <Command.Input
            value={query}
            onValueChange={setQuery}
            placeholder="Rechercher des projets ou des taches..."
            className="w-full h-12 bg-transparent outline-none text-gray-900 placeholder-gray-500 dark:text-gray-100"
          />
        </div>

        <Command.List className="max-h-[360px] overflow-y-auto p-2 scroll-py-2">
          {loading && <div className="p-4 text-sm text-gray-500 text-center">Recherche...</div>}

          {!loading && !query && (
            <div className="p-4 text-sm text-gray-500 text-center">Tapez pour rechercher des projets ou des taches.</div>
          )}

          {!loading && query && results.projects.length === 0 && results.tasks.length === 0 && (
            <div className="p-4 text-sm text-gray-500 text-center">Aucun resultat trouve.</div>
          )}

          {results.projects.length > 0 && (
            <Command.Group heading="Projets" className="text-xs font-medium text-gray-500 px-2 py-1.5 mb-2">
              {results.projects.map((project) => (
                <Command.Item
                  key={project.id}
                  onSelect={() => {
                    navigate(`/projects/${project.id}`);
                    setOpen(false);
                  }}
                  className="search-command-item flex flex-col px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-gray-100 aria-selected:bg-blue-50 aria-selected:text-blue-700 dark:aria-selected:bg-blue-900/30 dark:aria-selected:text-blue-200"
                >
                  <span className="font-medium">{project.name}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 break-words">
                    {project.description || 'Sans description'}
                  </span>
                </Command.Item>
              ))}
            </Command.Group>
          )}

          {results.tasks.length > 0 && (
            <Command.Group heading="Taches" className="text-xs font-medium text-gray-500 px-2 py-1.5 mb-2">
              {results.tasks.map((task) => (
                <Command.Item
                  key={task.id}
                  onSelect={() => {
                    navigate(`/tasks/${task.id}`);
                    setOpen(false);
                  }}
                  className="search-command-item flex flex-col px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer text-sm text-gray-900 dark:text-gray-100 aria-selected:bg-blue-50 aria-selected:text-blue-700 dark:aria-selected:bg-blue-900/30 dark:aria-selected:text-blue-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium truncate">{task.title}</span>
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">{task.project?.name || '-'}</span>
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )}
        </Command.List>
      </Command>
    </div>
  );
};
