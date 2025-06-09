import { create } from "zustand";

// Le store est gardé pour une utilisation future
export const useGlobalDialogStore = create<{
  openDialog: null;
}>(() => ({
  openDialog: null,
}));
