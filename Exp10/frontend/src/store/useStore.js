import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

const initialData = {
  boardBackground: '#194d33',
  lists: [
    { id: 'list-1', title: 'To Do', cardIds: ['card-1', 'card-2'] },
    { id: 'list-2', title: 'In Progress', cardIds: ['card-3', 'card-4'] },
    { id: 'list-3', title: 'Done', cardIds: ['card-5'] },
  ],
  cards: {
    'card-1': { id: 'card-1', title: 'Design Landing Page', description: 'Create a high-fidelity mockup for the new Trello clone landing page. Need to incorporate responsive layouts for mobile and desktop.', labels: ['#0079bf', '#eb5a46'], details: {}, dueDate: new Date(Date.now() + 86400000).toISOString(), checklist: [{id: 'chk-1', text: 'Wireframing', isCompleted: true}, {id: 'chk-2', text: 'Color palette', isCompleted: false}], memberIds: ['m1'], comments: [{id: 'com-1', text: 'Should we use dark mode by default?', date: new Date().toISOString()}], coverImage: null },
    'card-2': { id: 'card-2', title: 'Setup GitHub Actions', description: 'Implement testing workflows for Prisma + backend.', labels: ['#f2d600'], details: {}, dueDate: null, checklist: [], memberIds: [], comments: [], coverImage: null },
    'card-3': { id: 'card-3', title: 'Implement Zustand Persistence', description: 'Ensure the entire state syncs with localStorage automatically so users never lose data.', labels: ['#61bd4f'], details: {}, dueDate: null, checklist: [], memberIds: ['m2', 'm3'], comments: [{id: 'com-2', text: 'Done! It works seamlessly.', date: new Date().toISOString()}], coverImage: null },
    'card-4': { id: 'card-4', title: 'Fix Drag boundaries', description: '', labels: [], details: {}, dueDate: new Date().toISOString(), checklist: [], memberIds: ['m1'], comments: [], coverImage: null },
    'card-5': { id: 'card-5', title: 'Initialize Vite app', description: 'Run npm create vite@latest and clear out the boilerplate CSS.', labels: ['#c377e0'], details: {}, dueDate: null, checklist: [], memberIds: ['m3'], comments: [], coverImage: null },
  },
  members: [
    { id: 'm1', name: 'Alice', color: '#ff9f1a' },
    { id: 'm2', name: 'Bob', color: '#0079bf' },
    { id: 'm3', name: 'Charlie', color: '#eb5a46' }
  ],
  searchQuery: '',
};

export const useStore = create(
  persist(
    (set, get) => ({
      ...initialData,
      resetBoardData: () => set(initialData),

      setSearchQuery: (query) => set({ searchQuery: query }),

      setBoardBackground: (color) => set({ boardBackground: color }),

      addList: (title) => {
        const newList = { id: uuidv4(), title, cardIds: [] };
        set((state) => ({ lists: [...state.lists, newList] }));
      },

      deleteList: (listId) => {
        set((state) => {
          const newLists = state.lists.filter(l => l.id !== listId);
          return { lists: newLists };
        });
      },

      addCard: (listId, title) => {
        const newCardId = uuidv4();
        const newCard = { id: newCardId, title, description: '', labels: [], dueDate: null, checklist: [], memberIds: [], comments: [], coverImage: null };
        set((state) => {
          const newLists = state.lists.map(list => {
            if (list.id === listId) {
              return { ...list, cardIds: [...list.cardIds, newCardId] };
            }
            return list;
          });
          return {
            cards: { ...state.cards, [newCardId]: newCard },
            lists: newLists,
          };
        });
      },

      updateCard: (id, updates) => set((state) => ({
        cards: {
          ...state.cards,
          [id]: { ...state.cards[id], ...updates }
        }
      })),

      deleteCard: (listId, cardId) => set((state) => {
        const newLists = state.lists.map(list => {
          if (list.id === listId) {
            return { ...list, cardIds: list.cardIds.filter(id => id !== cardId) };
          }
          return list;
        });
        const newCards = { ...state.cards };
        delete newCards[cardId];
        return { lists: newLists, cards: newCards };
      }),

      moveCard: (sourceListId, destListId, sourceIdx, destIdx, draggableId) => {
        set((state) => {
          const sourceList = state.lists.find(l => l.id === sourceListId);
          const destList = state.lists.find(l => l.id === destListId);

          if (sourceListId === destListId) {
            const newCardIds = Array.from(sourceList.cardIds);
            newCardIds.splice(sourceIdx, 1);
            newCardIds.splice(destIdx, 0, draggableId);

            const newLists = state.lists.map(l => l.id === sourceListId ? { ...l, cardIds: newCardIds } : l);
            return { lists: newLists };
          } else {
            const sourceCardIds = Array.from(sourceList.cardIds);
            sourceCardIds.splice(sourceIdx, 1);
            const destCardIds = Array.from(destList.cardIds);
            destCardIds.splice(destIdx, 0, draggableId);

            const newLists = state.lists.map(l => {
              if (l.id === sourceListId) return { ...l, cardIds: sourceCardIds };
              if (l.id === destListId) return { ...l, cardIds: destCardIds };
              return l;
            });
            return { lists: newLists };
          }
        });
      },

      moveList: (sourceIdx, destIdx, draggableId) => {
        set((state) => {
          const newLists = Array.from(state.lists);
          const [removed] = newLists.splice(sourceIdx, 1);
          newLists.splice(destIdx, 0, removed);
          return { lists: newLists };
        });
      }
    }),
    {
      name: 'trello-storage', // unique name for localStorage
    }
  )
);
