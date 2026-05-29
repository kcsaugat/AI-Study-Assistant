import { create } from 'zustand';

interface AppState {
  zenMode: boolean;
  toggleZenMode: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  zenMode: false,
  toggleZenMode: () => set((state) => ({ zenMode: !state.zenMode })),
}));
