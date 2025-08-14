
import React from 'react';
import type { Group, Phrase } from '../types';
import PhraseItem from './PhraseItem';
import { PlusIcon, MenuIcon } from './icons/Icons';

type SearchResult = Phrase & { groupName: string; groupId: string };

interface PhraseContentProps {
  activeGroup: Group | null;
  onAddPhrase: () => void;
  onEditPhrase: (phrase: Phrase) => void;
  onDeletePhrase: (id: string) => void;
  onToggleSidebar: () => void;
  searchResults: SearchResult[];
  searchTerm: string;
}

const PhraseContent: React.FC<PhraseContentProps> = ({ 
    activeGroup, 
    onAddPhrase, 
    onEditPhrase, 
    onDeletePhrase, 
    onToggleSidebar,
    searchResults,
    searchTerm
}) => {

  const Header = ({ title, showAddButton }: { title: string, showAddButton: boolean }) => (
     <header className="flex items-center justify-between p-4 border-b border-gray-700 bg-gray-800/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="flex items-center gap-4 min-w-0">
            <button
                onClick={onToggleSidebar}
                className="p-1 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors md:hidden"
                aria-label="Toggle menu"
            >
                <MenuIcon className="h-6 w-6" />
            </button>
            <h2 className="text-xl font-semibold text-white truncate">{title}</h2>
        </div>
        {showAddButton && (
            <button
            onClick={onAddPhrase}
            className="flex-shrink-0 flex items-center justify-center p-2 rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-gray-900 transition-colors md:px-4"
            >
            <PlusIcon className="h-5 w-5 md:mr-2" />
            <span className="hidden md:inline">Add Phrase</span>
            </button>
        )}
      </header>
  );

  if (searchTerm) {
    return (
        <div className="flex-1 flex flex-col">
            <Header title={`Results for "${searchTerm}"`} showAddButton={false} />
            <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                {searchResults.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
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
                ) : (
                <div className="text-center text-gray-500 mt-16">
                    <h3 className="text-lg">No phrases found.</h3>
                    <p>Try a different search term or clear the search.</p>
                </div>
                )}
            </div>
        </div>
    )
  }

  if (!activeGroup) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-500 p-4">
         <div className="absolute top-4 left-4 md:hidden">
             <button
                onClick={onToggleSidebar}
                className="p-1 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                aria-label="Toggle menu"
            >
                <MenuIcon className="h-6 w-6" />
            </button>
         </div>
        <div>
          <h2 className="text-2xl font-semibold">Welcome to Quick Phrases</h2>
          <p>Select a group from the sidebar to view its phrases, or create a new one.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <Header title={activeGroup.name} showAddButton={true} />
      <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        {activeGroup.phrases.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeGroup.phrases.map(phrase => (
              <PhraseItem
                key={phrase.id}
                phrase={phrase}
                searchTerm={searchTerm}
                onEdit={() => onEditPhrase(phrase)}
                onDelete={() => onDeletePhrase(phrase.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-16">
            <h3 className="text-lg">No phrases here yet.</h3>
            <p>Click "Add Phrase" to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PhraseContent;