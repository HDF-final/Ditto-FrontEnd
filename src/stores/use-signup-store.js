import { create } from "zustand";

const initialDraft = {
  email: "",
  password: "",
  nickname: "",
  termsAccepted: true,
  marketingAccepted: false,
  country: "KR",
  language: "ko",
  persona: "openrun",
};

export const useSignupStore = create((set) => ({
  draft: { ...initialDraft },
  setDraft: (data) =>
    set((state) => ({
      draft: { ...state.draft, ...data },
    })),
  resetDraft: () => set({ draft: { ...initialDraft } }),
}));
