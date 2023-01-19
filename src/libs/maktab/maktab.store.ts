import create from "zustand";

export interface MaktabStore {
  isMaktabFormOpen: boolean;
  selectedMaktabId?: string;
  openMaktabForm: (maktabId?: string) => void;
  closeMaktabForm: () => void;
  clearSelectedMaktabId: () => void;
}

export const useMaktabStore = create<MaktabStore>()((set) => ({
  isMaktabFormOpen: false,
  selectedMaktabId: undefined,
  openMaktabForm: (maktabId) =>
    set({ isMaktabFormOpen: true, selectedMaktabId: maktabId }),
  closeMaktabForm: () => set({ isMaktabFormOpen: false }),
  clearSelectedMaktabId: () => set({ selectedMaktabId: undefined }),
}));
