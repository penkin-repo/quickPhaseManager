
import React from 'react';
import type { Group } from '../types';
import { SearchIcon, FolderPlusIcon, EditIcon, TrashIcon } from './icons/Icons';

interface SidebarProps {
  groups: Group[];
  activeGroupId: string | null;
  onSelectGroup: (id: string) => void;
  onAddGroup: () => void;
  onEditGroup: (id: string, name: string) => void;
  onDeleteGroup: (id: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  groups,
  activeGroupId,
  onSelectGroup,
  onAddGroup,
  onEditGroup,
  onDeleteGroup,
  searchTerm,
  onSearchChange,
  isOpen,
  onClose,
}) => {
  const handleSelect = (id: string) => {
    onSelectGroup(id);
    onClose(); // Close sidebar on selection, mainly for mobile
  };

  return (
    <>
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      <aside className={`fixed inset-y-0 left-0 w-80 bg-gray-800 flex flex-col border-r border-gray-700 z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-4 border-b border-gray-700">
          <h1 className="text-xl font-bold text-white">Quick Phrases</h1>
        </div>
        <div className="p-4 border-b border-gray-700">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search phrases..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-gray-700 border border-gray-600 rounded-md pl-10 pr-4 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2">
          {groups.length > 0 ? (
            <ul>
              {groups.map(group => (
                <li key={group.id} className="my-1">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      handleSelect(group.id);
                    }}
                    className={`flex justify-between items-center w-full text-left px-3 py-2 rounded-md text-sm transition-colors group ${
                      activeGroupId === group.id && !searchTerm
                        ? 'bg-primary text-white'
                        : 'text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span className="truncate">{group.name}</span>
                    <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => { e.stopPropagation(); onEditGroup(group.id, group.name); }} className="p-1 hover:bg-gray-600 rounded" aria-label="Edit group"><EditIcon className="h-4 w-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); onDeleteGroup(group.id); }} className="p-1 hover:bg-red-500 rounded" aria-label="Delete group"><TrashIcon className="h-4 w-4" /></button>
                    </div>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
             <div className="text-center text-gray-500 p-4">No groups yet.</div>
          )}
        </nav>
        <div className="p-4 border-t border-gray-700">
          <button
            onClick={onAddGroup}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary focus:ring-offset-gray-800 transition-colors"
          >
            <FolderPlusIcon className="h-5 w-5 mr-2" />
            New Group
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
