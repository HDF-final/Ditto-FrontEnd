import { create } from "zustand";

export const MOCK_USER = {
  id: 123,
  userId: 123,
  email: "yuki@example.com",
  name: "구본희",
  nickname: "구본희",
  role: "ROLE_ADMIN",
  country: "KR",
  countryCode: "KR",
  languageCode: "ko",
  persona: "flex",
  shoppingType: "flex",
  personaId: "flex",
  description: "한국 · DITTO 탐험가",
  profileImageUrl: "/assets/common/borangi-2.svg",
  image: "/assets/common/borangi-2.svg",
};

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  hydrated: false,
  setUser: (user) => {
    const nextUser = user === undefined ? MOCK_USER : user;
    set({
      user: nextUser,
      isAuthenticated: Boolean(nextUser),
      hydrated: true,
    });
  },
  clearUser: () =>
    set({
      user: null,
      isAuthenticated: false,
      hydrated: true,
    }),
}));
