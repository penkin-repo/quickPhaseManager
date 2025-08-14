
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import type { Group, Phrase } from './types';
import * as phraseService from './services/phraseService';
import Sidebar from './components/Sidebar';
import PhraseContent from './components/PhraseContent';
import Modal from './components/Modal';

type ModalState = 
  | { type: 'addGroup' }
  | { type: 'editGroup', group: Group }
  | { type: 'addPhrase', groupId: string }
  | { type: 'editPhrase', phrase: Phrase };

const App: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [modalState, setModalState] = useState<ModalState | null>(null);
  const [modalGroupName, setModalGroupName] = useState('');
  const [modalPhrase, setModalPhrase] = useState({ title: '', text: '' });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const initialGroups = await phraseService.getInitialData();
        setGroups(initialGroups);
        if (initialGroups.length > 0) {
          setActiveGroupId(initialGroups[0].id);
        }
        setError(null);
      } catch (e) {
        const err = e as Error;
        if (err.message.includes('Fetch failed') || err.message.includes('Failed to fetch')) {
             setError('Failed to connect to the database. Please check your Supabase credentials and network connection.');
        } else {
            setError('Failed to load data. ' + err.message);
        }
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // --- Modal & CRUD Operations ---
  const openModal = (state: ModalState) => {
    setModalState(state);
    if (state.type === 'editGroup') {
      setModalGroupName(state.group.name);
    } else if (state.type === 'editPhrase') {
      setModalPhrase({ title: state.phrase.title, text: state.phrase.text });
    } else {
      setModalGroupName('');
      setModalPhrase({ title: '', text: '' });
    }
  };

  const closeModal = () => {
    setModalState(null);
    setModalGroupName('');
    setModalPhrase({ title: '', text: '' });
  };
  
  const handleModalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!modalState) return;

    try {
        setError(null);
        switch (modalState.type) {
            case 'addGroup':
                if (modalGroupName.trim()) {
                    const newGroup = await phraseService.addGroup(modalGroupName.trim());
                    setGroups(prev => [...prev, newGroup]);
                    setActiveGroupId(newGroup.id);
                }
                break;
            case 'editGroup':
                 if (modalGroupName.trim() && modalGroupName.trim() !== modalState.group.name) {
                    const updatedGroup = await phraseService.updateGroup(modalState.group.id, modalGroupName.trim());
                    setGroups(prev => prev.map(g => g.id === modalState.group.id ? updatedGroup : g));
                }
                break;
            case 'addPhrase':
                if (modalPhrase.title.trim() && modalPhrase.text.trim()) {
                    const newPhrase = await phraseService.addPhrase(modalState.groupId, modalPhrase.title.trim(), modalPhrase.text.trim());
                    setGroups(prev => prev.map(g => g.id === modalState.groupId ? { ...g, phrases: [...g.phrases, newPhrase] } : g));
                }
                break;
            case 'editPhrase':
                if (modalPhrase.title.trim() && modalPhrase.text.trim()) {
                    const updatedPhrase = await phraseService.updatePhrase(modalState.phrase.id, modalPhrase.title.trim(), modalPhrase.text.trim());
                    setGroups(prev => prev.map(g => ({
                        ...g,
                        phrases: g.phrases.map(p => p.id === modalState.phrase.id ? updatedPhrase : p)
                    })));
                }
                break;
        }
        closeModal();
    } catch (err) {
        console.error("Failed to submit modal:", err);
        const error = err as Error;
        setError(error.message || "Failed to save changes. Please try again.");
    }
  };

  const handleDeleteGroup = useCallback(async (groupId: string) => {
    if (window.confirm('Are you sure you want to delete this group and all its phrases?')) {
      try {
        setError(null);
        await phraseService.deleteGroup(groupId);
        const remainingGroups = groups.filter(g => g.id !== groupId);
        setGroups(remainingGroups);
        if (activeGroupId === groupId) {
          setSearchTerm('');
          setActiveGroupId(remainingGroups.length > 0 ? remainingGroups[0].id : null);
        }
      } catch (err) {
          console.error("Failed to delete group:", err);
          const error = err as Error;
          setError(error.message || "Failed to delete group. Please try again.");
      }
    }
  }, [activeGroupId, groups]);

  const handleDeletePhrase = useCallback(async (phraseId: string) => {
    if (window.confirm('Are you sure you want to delete this phrase?')) {
        try {
            setError(null);
            await phraseService.deletePhrase(phraseId);
            setGroups(prev => prev.map(g => ({
                ...g,
                phrases: g.phrases.filter(p => p.id !== phraseId)
            })));
        } catch(err) {
            console.error("Failed to delete phrase:", err);
            const error = err as Error;
            setError(error.message || "Failed to delete phrase. Please try again.");
        }
    }
  }, []);

  // --- Search & Filtering ---
  const searchResults = useMemo(() => {
    if (!searchTerm) return [];
    const lowercasedFilter = searchTerm.toLowerCase();
    const results: (Phrase & { groupName: string; groupId: string })[] = [];
    
    groups.forEach(group => {
        group.phrases.forEach(phrase => {
            if (
            phrase.title.toLowerCase().includes(lowercasedFilter) ||
            phrase.text.toLowerCase().includes(lowercasedFilter)
            ) {
            results.push({ ...phrase, groupName: group.name, groupId: group.id });
            }
        });
    });
    return results;
  }, [searchTerm, groups]);

  const activeGroup = useMemo(() => {
    return groups.find(g => g.id === activeGroupId) || null;
  }, [activeGroupId, groups]);

  const handleSelectGroup = (id: string) => {
    setActiveGroupId(id);
    setSearchTerm('');
    setError(null);
  };
  
  // --- Render Logic ---
  if (isLoading) {
    return <div className="flex items-center justify-center h-screen"><div className="text-xl">Loading...</div></div>;
  }

  const getModalTitle = () => {
      if (!modalState) return '';
      switch (modalState.type) {
          case 'addGroup': return 'Create New Group';
          case 'editGroup': return 'Edit Group Name';
          case 'addPhrase': return 'Add New Phrase';
          case 'editPhrase': return 'Edit Phrase';
      }
  }

  return (
    <div className="relative flex h-screen font-sans antialiased bg-gray-900 overflow-hidden">
      <Sidebar
        groups={groups}
        activeGroupId={activeGroupId}
        onSelectGroup={handleSelectGroup}
        onAddGroup={() => openModal({ type: 'addGroup' })}
        onEditGroup={(id, name) => openModal({ type: 'editGroup', group: { id, name, phrases: [] } })}
        onDeleteGroup={handleDeleteGroup}
        searchTerm={searchTerm}
        onSearchChange={(term) => { setSearchTerm(term); setError(null); }}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      <main className="flex-1 flex flex-col transition-all duration-300 min-w-0">
        {error ? (
             <div className="flex-1 flex items-center justify-center p-4">
                <div className="text-center bg-red-900/50 border border-red-700 p-6 rounded-lg max-w-md">
                    <h2 className="text-2xl font-semibold text-red-300">An Error Occurred</h2>
                    <p className="text-red-400 mt-2">{error}</p>
                    <button
                        onClick={() => setError(null)}
                        className="mt-4 px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 transition-colors"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        ) : (
            <PhraseContent
            activeGroup={activeGroup}
            onAddPhrase={() => activeGroupId && openModal({ type: 'addPhrase', groupId: activeGroupId })}
            onEditPhrase={(phrase) => openModal({ type: 'editPhrase', phrase })}
            onDeletePhrase={handleDeletePhrase}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            searchResults={searchResults}
            searchTerm={searchTerm}
            />
        )}
      </main>
      <Modal isOpen={!!modalState} onClose={closeModal} title={getModalTitle()}>
        <form onSubmit={handleModalSubmit}>
          {modalState?.type.includes('Group') ? (
            <input
              type="text"
              value={modalGroupName}
              onChange={(e) => setModalGroupName(e.target.value)}
              className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-gray-200 focus:ring-2 focus:ring-primary focus:outline-none"
              autoFocus
            />
          ) : (
            <div className='space-y-4'>
                <input
                    type="text"
                    value={modalPhrase.title}
                    onChange={(e) => setModalPhrase(p => ({ ...p, title: e.target.value }))}
                    placeholder="Title"
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-gray-200 focus:ring-2 focus:ring-primary focus:outline-none"
                    autoFocus
                />
                <textarea
                    value={modalPhrase.text}
                    onChange={(e) => setModalPhrase(p => ({ ...p, text: e.target.value }))}
                    placeholder="Phrase content..."
                    className="w-full p-2 border border-gray-600 rounded-md bg-gray-800 text-gray-200 focus:ring-2 focus:ring-primary focus:outline-none"
                    rows={6}
                />
            </div>
          )}
          <div className="mt-4 flex justify-end space-x-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-primary hover:bg-primary-hover transition-colors font-semibold"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default App;