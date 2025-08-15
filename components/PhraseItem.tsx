
import React, { useState, useCallback } from 'react';
import type { Phrase } from '../types';
import { CopyIcon, CheckIcon, EditIcon, TrashIcon } from './icons/Icons';

interface PhraseItemProps {
  phrase: Phrase;
  onEdit: () => void;
  onDelete: () => void;
  groupName?: string;
  searchTerm?: string;
}

const highlightText = (text: string, highlight: string) => {
  if (!highlight || !highlight.trim()) {
    return <>{text}</>;
  }
  const regex = new RegExp(`(${highlight.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-primary/30 text-primary-hover font-bold rounded-sm px-0.5">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
};

const PhraseItem: React.FC<PhraseItemProps> = ({ phrase, onEdit, onDelete, groupName, searchTerm = '' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(phrase.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [phrase.text]);

  return (
    <div className="bg-gray-800 rounded-lg shadow-lg flex flex-col justify-between h-full group transition-all hover:shadow-primary/20 hover:ring-1 hover:ring-primary/50">
      <div className="p-4 flex-grow">
        <h3 className="font-bold text-white mb-2">{highlightText(phrase.title, searchTerm)}</h3>
        <p className="text-gray-300 text-sm break-words whitespace-pre-wrap line-clamp-3">{highlightText(phrase.text, searchTerm)}</p>
      </div>
      {groupName && (
        <div className="px-4 pb-2 text-xs text-gray-500">
          In: <span className="font-semibold text-gray-400">{groupName}</span>
        </div>
      )}
      <div className="flex items-center justify-end space-x-1 p-2 bg-gray-800/50 rounded-b-lg border-t border-gray-700">
        <button
          onClick={handleCopy}
          className={`p-2 rounded-md transition-colors ${
            copied ? 'text-green-400' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
          }`}
          aria-label={copied ? "Copied" : "Copy"}
        >
          {copied ? <CheckIcon className="h-5 w-5" /> : <CopyIcon className="h-5 w-5" />}
        </button>
        <button
          onClick={onEdit}
          className="p-2 rounded-md text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
          aria-label="Edit"
        >
          <EditIcon className="h-5 w-5" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-md text-gray-400 hover:bg-red-500 hover:text-white transition-colors"
          aria-label="Delete"
        >
          <TrashIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default PhraseItem;
