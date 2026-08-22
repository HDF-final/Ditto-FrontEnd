import { create } from "zustand";

export const MOCK_USER = {
  id: 1,
  userId: 1,
  email: "yuki@example.com",
  name: "사토 유키",
  nickname: "사토 유키",
  country: "JP",
  countryCode: "JP",
  languageCode: "ko",
  persona: "choae",
  shoppingType: "choae",
  personaId: "choae",
  description: "일본 · DITTO 탐험가",
  profileImageUrl: "/assets/common/borangi-2.svg",
  image: "/assets/common/borangi-2.svg",
};

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => {
    const nextUser = user === undefined ? MOCK_USER : user;
    set({
      user: nextUser,
      isAuthenticated: Boolean(nextUser),
    });
  },
  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
    }),
}));

