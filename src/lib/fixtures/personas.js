/**
 * Shopping-type personas from the HTML mock (persona.html).
 * Character art uses shared assets under public/assets/common/ (*-2 variants).
 */

export const PERSONAS = [
  {
    id: "openrun",
    nameEn: "OPEN-RUN LOVER",
    imageSrc: "/assets/common/orange-2.svg",
  },
  {
    id: "flex",
    nameEn: "FLEX SPENDER",
    imageSrc: "/assets/common/green-2.svg",
  },
  {
    id: "sohwak",
    nameEn: "LITTLE JOY",
    imageSrc: "/assets/common/pink-2.svg",
  },
  {
    id: "choae",
    nameEn: "ULTIMATE STAN",
    imageSrc: "/assets/common/borangi-2.svg",
  },
];

export const DEFAULT_PERSONA_ID = "openrun";

const PERSONA_I18N = {
  ko: {
    title: "당신의 쇼핑 타입은?",
    subtitle: "캐릭터를 고르면 딱 맞는 코스를 추천해드려요.",
    hint: "언제든지 마이페이지에서 바꿀 수 있어요.",
    start: "시작하기",
    selectError: "쇼핑 타입을 선택해 주세요.",
    openrun: {
      name: "오픈런러버",
      description: "신상·팝업 뜨면 제일 먼저",
    },
    flex: {
      name: "플렉스족",
      description: "명품·프리미엄 제대로",
    },
    sohwak: {
      name: "소확행러버",
      description: "카페·디저트·감성 소품",
    },
    choae: {
      name: "최애덕후",
      description: "K팝 최애 굿즈·앨범 덕질",
    },
  },
  en: {
    title: "What's your shopping type?",
    subtitle: "Pick your character and we'll tailor your courses.",
    hint: "You can change this anytime in My Page.",
    start: "Get started",
    selectError: "Please choose a shopping type.",
    openrun: {
      name: "Open-Run Lover",
      description: "First in line for drops & pop-ups",
    },
    flex: {
      name: "Flex Spender",
      description: "Goes big on luxury & premium",
    },
    sohwak: {
      name: "Little Joy",
      description: "Cafés, desserts & cozy finds",
    },
    choae: {
      name: "Ultimate Stan",
      description: "K-pop merch, albums & fan pop-ups",
    },
  },
  ja: {
    title: "あなたのショッピングタイプは？",
    subtitle: "キャラクターを選ぶと、ぴったりのコースをおすすめします。",
    hint: "マイページでいつでも変更できます。",
    start: "はじめる",
    selectError: "ショッピングタイプを選んでください。",
    openrun: {
      name: "オープンランラバー",
      description: "新作・ポップアップに一番乗り",
    },
    flex: {
      name: "フレックス派",
      description: "ラグジュアリー＆プレミアム重視",
    },
    sohwak: {
      name: "小確幸ラバー",
      description: "カフェ・スイーツ・こだわり雑貨",
    },
    choae: {
      name: "推し活オタク",
      description: "K-POP推しのグッズ・アルバム",
    },
  },
  zh: {
    title: "你的购物类型是？",
    subtitle: "选择角色，我们为你推荐合适的路线。",
    hint: "随时可以在“我的页面”更改。",
    start: "开始",
    selectError: "请选择购物类型。",
    openrun: {
      name: "抢先族",
      description: "新品·快闪抢先到",
    },
    flex: {
      name: "挥霍达人",
      description: "主打奢侈品与高端",
    },
    sohwak: {
      name: "小确幸控",
      description: "咖啡·甜点·治愈小物",
    },
    choae: {
      name: "头号粉丝",
      description: "K-pop 周边·专辑收集",
    },
  },
};

export function normalizePersonaId(rawId) {
  if (!rawId) return DEFAULT_PERSONA_ID;
  const str = String(rawId).toLowerCase().replace(/[-_\s]/g, "");

  if (str.includes("open") || str.includes("오픈런")) return "openrun";
  if (str.includes("flex") || str.includes("플렉스")) return "flex";
  if (
    str.includes("sohwak") ||
    str.includes("joy") ||
    str.includes("소확행") ||
    str.includes("small") ||
    str.includes("happiness") ||
    str.includes("pink")
  )
    return "sohwak";
  if (
    str.includes("choae") ||
    str.includes("stan") ||
    str.includes("최애") ||
    str.includes("덕후") ||
    str.includes("borangi") ||
    str.includes("purple")
  )
    return "choae";

  return DEFAULT_PERSONA_ID;
}

export function toBackendPersonaEnum(rawId) {
  const normalized = normalizePersonaId(rawId);
  const map = {
    openrun: "OPEN_RUN_LOVER",
    flex: "FLEX_SPENDER",
    sohwak: "LITTLE_JOY",
    choae: "ULTIMATE_STAN",
  };
  return map[normalized] || "OPEN_RUN_LOVER";
}

export function resolvePersonaLang(lang) {
  return PERSONA_I18N[lang] ? lang : "ko";
}

export function getPersonaPageCopy(lang = "ko") {
  const resolved = resolvePersonaLang(lang);
  const dict = PERSONA_I18N[resolved];

  return {
    lang: resolved,
    title: dict.title,
    subtitle: dict.subtitle,
    hint: dict.hint,
    start: dict.start,
    selectError: dict.selectError,
    personas: PERSONAS.map((persona) => ({
      ...persona,
      name: dict[persona.id].name,
      description: dict[persona.id].description,
    })),
  };
}

export function getPersonaById(id = DEFAULT_PERSONA_ID, lang = "ko") {
  const normalizedId = normalizePersonaId(id);
  const copy = getPersonaPageCopy(lang);
  const matched =
    copy.personas.find((persona) => persona.id === normalizedId) ??
    copy.personas[0];

  const themeMap = {
    openrun: {
      bgColor: "#fff1e6",
      badgeBorder: "#fed7aa",
      badgeBg: "#fff7ed",
      badgeText: "#ea580c",
    },
    flex: {
      bgColor: "#eafaf1",
      badgeBorder: "#bbf7d0",
      badgeBg: "#f0fdf4",
      badgeText: "#16a34a",
    },
    sohwak: {
      bgColor: "#fdebf6",
      badgeBorder: "#fbcfe8",
      badgeBg: "#fdf2f8",
      badgeText: "#db2777",
    },
    choae: {
      bgColor: "#f2edff",
      badgeBorder: "#e0d8ff",
      badgeBg: "#f5f3ff",
      badgeText: "#7c3aed",
    },
  };

  return {
    ...matched,
    theme: themeMap[matched.id] || themeMap.openrun,
  };
}
