import { create } from "zustand";

export const MOCK_USER = {
  id: 1,
  userId: 1,
  email: "yuki@ditto.kr",
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
  user: MOCK_USER,
  isAuthenticated: true,
  setUser: (user) =>
    set({
      user: user ? { ...MOCK_USER, ...user } : MOCK_USER,
      isAuthenticated: true,
    }),
  clearUser: () =>
    set({
      user: MOCK_USER,
      isAuthenticated: true,
    }),
}));

