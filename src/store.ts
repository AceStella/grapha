import { create } from 'zustand';

interface NodeData {
  id: string;
  path: string;
  content: string;
}

interface AppState {
  editingNode: NodeData | null;
  openEditor: (node: NodeData) => void;
  closeEditor: () => void;
}

export const useStore = create<AppState>((set) => ({
  editingNode: null,
  openEditor: (node) => set({ editingNode: node }),
  closeEditor: () => set({ editingNode: null }),
}));
