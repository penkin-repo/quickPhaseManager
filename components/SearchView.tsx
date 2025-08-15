import React, { useEffect, useRef } from 'react';
import type { Phrase } from '../types';
import { SearchIcon } from './icons/Icons';
import PhraseItem from './PhraseItem';

type SearchResult = Phrase & { groupName: string; groupId: string };

interface SearchViewProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  searchResults: SearchResult[];
  onClose: () => void;
  onEditPhrase: (phrase: Phrase) => void;
  onDeletePhrase: (id: string) => void;
}

const SearchView: React.FC<SearchViewProps> = ({
  searchTerm,
  onSearchChange,
  searchResults,
  onClose,
  onEditPhrase,
  onDeletePhrase,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <div className="fixed inset-0 bg-gray-900 z-40 flex flex-col md:hidden animate-fade-in" role="dialog" aria-modal="true">
      <header className="flex items-center p-4 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm shrink-0">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search all phrases..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <button
          onClick={onClose}
          className="ml-4 px-4 py-2 rounded-md text-gray-300 hover:bg-gray-700 transition-colors"
          aria-label="Close search"
        >
          Cancel
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4">
        {searchTerm && searchResults.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {searchResults.map(phrase => (
              <PhraseItem
                key={phrase.id}
                phrase={phrase}
                groupName={phrase.groupName}
                searchTerm={searchTerm}
                onEdit={() => onEditPhrase(phrase)}
                onDelete={() => onDeletePhrase(phrase.id)}
              />
            ))}
          </div>
        )}
        
        {searchTerm && searchResults.length === 0 && (
          <div className="text-center text-gray-500 mt-16">
            <h3 className="text-lg">No phrases found.</h3>
            <p>Try a different search term.</p>
          </div>
        )}
        
        {!searchTerm && (
             <div className="text-center text-gray-500 mt-16">
                <h3 className="text-lg">Search for a phrase</h3>
                <p>Start typing to see results.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default SearchView;
