import { create } from 'zustand';

interface AppState {
  hasCompletedOnboarding: boolean;
  completeOnboarding: () => void;
}

export const useAppStore = create<AppState>()((set) => ({
  hasCompletedOnboarding: false,
  completeOnboarding: () => set({ hasCompletedOnboarding: true }),
}));
