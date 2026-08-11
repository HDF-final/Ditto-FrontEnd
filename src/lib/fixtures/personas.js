const personas = [
  {
    id: "trend",
    icon: "T",
    name: "트렌드 헌터",
    description: "팝업, 신상 브랜드, 포토 스팟을 빠르게 확인해요.",
  },
  {
    id: "beauty",
    icon: "B",
    name: "뷰티 쇼퍼",
    description: "K-뷰티 매장과 인기 제품 중심으로 움직여요.",
  },
  {
    id: "food",
    icon: "F",
    name: "미식 산책러",
    description: "식당과 카페를 여유롭게 엮은 코스를 선호해요.",
  },
];

const copyByLang = {
  ko: {
    title: "어떤 여행자가 가장 가까운가요?",
    subtitle: "선택한 타입에 맞춰 코스 추천 톤을 조정합니다.",
    helperTitle: "코스 추천 준비 완료",
    helperText: "선택값은 현재 프론트 상태에서만 사용됩니다.",
    cta: "AI 코스 만들기",
    personas,
  },
  en: {
    title: "Pick your travel style",
    subtitle: "DITTO will tune route suggestions to your interests.",
    helperTitle: "Ready for a course",
    helperText: "This foundation keeps the choice on the client for now.",
    cta: "Create AI course",
    personas,
  },
  zh: {
    title: "请选择你的旅行类型",
    subtitle: "DITTO 会根据兴趣调整推荐路线。",
    helperTitle: "路线推荐已准备好",
    helperText: "当前阶段会先在前端保留选择。",
    cta: "创建 AI 路线",
    personas,
  },
  ja: {
    title: "旅行スタイルを選んでください",
    subtitle: "DITTO が興味に合わせてコースを調整します。",
    helperTitle: "コース作成の準備完了",
    helperText: "現在はフロント側の状態として扱います。",
    cta: "AIコースを作る",
    personas,
  },
};

export function getPersonaPageCopy(lang) {
  return copyByLang[lang] ?? copyByLang.ko;
}
