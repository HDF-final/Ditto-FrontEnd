"use client";

import { memo, useCallback, useMemo, useState } from "react";
import { CourseNavigationMap } from "@/components/navigation/course-navigation-map";
import {
  getFallbackPlaceImage,
  optimizeCourseRoute,
} from "@/lib/navigation/course-routing-service";
import { approveAdminCourse, publishAdminCourse } from "@/lib/api/admin-courses";
// 경로 계산과 매장 목록은 기본 추천 코스 편집기와 **같은 것을 쓴다.**
import { useCourseRoute, usePlaceCatalog } from "./admin-course-map";
import { COUNTRY_META, WarningPanel, formatAdminDate } from "./admin-artifact-ui";
import { AdminCoursePlacePicker } from "./admin-course-place-picker";

// 초안 하나를 관리자가 손으로 고치는 편집기. /ai-course 의 코스 스튜디오와 같은 짜임이다 —
// 한쪽에 코스, 한쪽에 실내 지도와 경로. 다른 것은 화면을 통째로 바꾸지 않고 팝업 안에서만
// 산다는 것이고, 그래서 관리자가 목록으로 돌아오는 비용이 없다.
//
// 자리를 누르면 오른쪽이 지도에서 **그 자리의 상세**로 바뀐다. 카드 안에 입력칸 열다섯 개를
// 펼치면 코스 전체가 한눈에 안 들어오고, 자리마다 그걸 그리는 비용도 든다.
//
// **초안과 서비스 중인 코스를 같이 고친다.** 되짚기 창구가 캐시를 초안과 같은 칸으로
// 돌려주므로(`celeb_approve.reopen`), 이 편집기는 어느 쪽인지 몰라도 된다. `live` 가
// 참이면 버튼 문구와 경고문만 바뀐다 — 이미 손님에게 나가고 있는 것을 덮어쓰는
// 동작이라 문구가 같으면 안 된다.
//
// 중간 저장은 없다. 고친 것은 승인할 때 한 번에 간다 — "저장했지만 승인 안 한"
// 세 번째 상태를 만들지 않으려는 것이다.

// 경로 최적화가 8곳까지만 된다 (routing-engine.optimizeOpenItinerary). /ai-course 와 같은 값.
const MAX_PLACES = 8;

const KIND_STYLE = {
  매장: "bg-[#eee9ff] text-brand",
  음식점: "bg-[#ffeef2] text-[#c53a63]",
  카페: "bg-[#fff2e2] text-[#a5650f]",
  여가: "bg-[#e6f6ef] text-[#12804b]",
};

const KIND_OPTIONS = ["매장", "음식점", "카페", "여가"];

/** 카탈로그 카테고리(럭셔리·뷰티·팝업…)를 초안의 4분류로 옮긴다. 관리자가 고칠 수 있다. */
function kindFromCategory(category) {
  if (category === "음식점") return "음식점";
  if (category === "카페") return "카페";
  if (category === "여가" || category === "전시" || category === "팝업") return "여가";
  return "매장";
}

/** 카탈로그에서 고른 매장 → 초안의 자리. 근거는 비운다 — 관리자가 직접 넣은 자리다. */
function slotFromPlace(place) {
  const image = place.image || getFallbackPlaceImage(place);
  return {
    slot_id: `manual-${place.navigationKey}`,
    slot_type: "STORE",
    kind: kindFromCategory(place.category),
    navigation_key: place.navigationKey,
    place_name: place.name,
    floor: place.floor,
    place_type: null,
    category: place.category,
    price_tier: null,
    reason: "",
    reason_kind: "manual",
    evidence: null,
    image: image ? { kind: "manual", url: image, source: "더현대 서울", caption: place.name } : null,
    alternates: [],
    filled: false,
  };
}

// 자리 하나에 점 표기(`evidence.person`)로 값을 넣는다. 없던 칸도 만들어 준다.
function withField(place, path, value) {
  if (path === "__replace__") {
    // 매장을 갈면 **근거는 그대로 두고** 매장 정보만 바꾼다. 근거 사진은 뗀다 —
    // 남의 브랜드 사진이 새 매장에 붙는 것이 이 배치가 실제로 냈던 사고다.
    const keepEvidencePhoto =
      place.image?.kind === "evidence" &&
      place.evidence?.brand &&
      String(value.name).includes(place.evidence.brand);
    const image = value.image || getFallbackPlaceImage(value);
    return {
      ...place,
      navigation_key: value.navigationKey,
      place_name: value.name,
      floor: value.floor ?? place.floor,
      category: value.category ?? place.category,
      image: keepEvidencePhoto
        ? place.image
        : image
          ? { kind: "place", url: image, source: "더현대 서울", caption: value.name }
          : null,
    };
  }

  const [head, tail] = path.split(".");
  if (!tail) return { ...place, [head]: value };
  return { ...place, [head]: { ...(place[head] || {}), [tail]: value } };
}

function hostOf(url) {
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

function Field({ label, hint, value, onChange, multiline = false, placeholder }) {
  const Tag = multiline ? "textarea" : "input";
  return (
    <label className="block">
      <span className="mb-1 flex items-baseline gap-2">
        <span className="text-[11px] font-bold tracking-[0.04em] text-[#4d536a]">{label}</span>
        {hint ? <span className="text-[10px] text-[#9aa0b0]">{hint}</span> : null}
      </span>
      <Tag
        value={value ?? ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={multiline ? 3 : undefined}
        className="w-full rounded-xl border border-[#dfe2ec] bg-white px-3 py-2 text-[13px] leading-6 text-[#20243a] outline-none focus:border-brand"
      />
    </label>
  );
}

/**
 * **실패한 주소를 기억한다.** 참/거짓으로 두면 한 번 실패한 뒤로는 주소를 고쳐도
 * 계속 "사진 없음"이다 — 관리자가 URL 을 한 글자씩 치는 동안 중간중간 실패하므로
 * 다 치고 나도 안 풀린다. 어느 주소가 실패했는지를 들고 있으면 새 주소는 다시 시도한다.
 */
function Photo({ url, alt, className }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const failed = Boolean(url) && failedUrl === url;
  if (!url || failed) {
    return (
      <span
        className={`flex items-center justify-center rounded-xl border border-dashed border-[#dfe2ec] bg-[#f7f8fb] text-[11px] font-bold text-[#c0392b] ${className}`}
      >
        사진 없음
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      loading="lazy"
      onError={() => setFailedUrl(url)}
      className={`rounded-xl border border-[#e6e8f0] bg-[#f6f7fb] object-cover ${className}`}
    />
  );
}

// ── 자리 카드 ──────────────────────────────────────────────────────
// `memo` 와 인덱스를 받는 안정된 핸들러를 함께 쓴다. 사유 한 글자를 칠 때 자리 다섯 개를
// 전부 다시 그리면 입력이 눈에 띄게 밀린다.
const SlotCard = memo(function SlotCard({
  place,
  index,
  total,
  active,
  locked,
  onSelect,
  onMove,
  onRemove,
  dragging,
  dropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}) {
  const image = place.image || {};
  const evidence = place.evidence || {};

  return (
    <li
      onDragOver={(event) => onDragOver(event, index)}
      onDrop={(event) => onDrop(event, index)}
      className={`relative flex gap-3 ${dragging ? "opacity-45" : ""}`}
    >
      <div className="flex flex-col items-center pt-1">
        <span
          className={`flex size-8 items-center justify-center rounded-full border-2 text-xs font-black ${
            locked ? "border-brand bg-brand text-white" : "border-[#dcd4fb] bg-white text-brand"
          }`}
          title={locked ? "최적화해도 이 자리는 고정입니다" : undefined}
        >
          {index + 1}
        </span>
        {index < total - 1 ? <span className="mt-1 w-px flex-1 bg-[#e3e0f5]" /> : null}
      </div>

      <article
        draggable
        onDragStart={() => onDragStart(index)}
        onDragEnd={onDragEnd}
        aria-roledescription="드래그하여 순서를 바꿀 수 있는 자리"
        className={`mb-3 min-w-0 flex-1 cursor-grab rounded-2xl border bg-white p-3.5 shadow-[0_6px_20px_rgba(31,36,66,0.04)] transition active:cursor-grabbing ${
          active ? "border-brand ring-2 ring-brand/15" : "border-[#e5e7ef]"
        } ${dropTarget ? "outline outline-2 outline-dashed outline-offset-2 outline-brand" : ""}`}
      >
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => onSelect(index)}
            className="flex min-w-0 flex-1 gap-3 text-left"
          >
            <Photo
              url={image.url}
              alt={image.caption || place.place_name}
              className="size-[76px] shrink-0"
            />
            <span className="min-w-0 flex-1">
              <span className="mb-1 block truncate text-[14px] font-bold text-[#1a142e] sm:mb-[4px] sm:text-[15px]">
                {place.place_name}
              </span>
              <span className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    KIND_STYLE[place.kind] || "bg-[#f3f4f7] text-[#777d90]"
                  }`}
                >
                  {place.kind}
                </span>
                <span className="truncate text-[10px] text-[#a3a8b8]">
                  {place.floor} · {place.navigation_key}
                </span>
              </span>
              <span className="mt-1.5 line-clamp-2 block text-[12px] leading-5 text-[#4c5164]">
                {place.reason || "추천 사유가 비어 있습니다."}
              </span>
              {evidence.brand ? (
                <span className="mt-1 block text-[11px] font-bold text-brand">
                  {evidence.person ? `${evidence.person} × ` : ""}
                  {evidence.brand}
                </span>
              ) : null}
            </span>
          </button>

          <div className="flex shrink-0 flex-col gap-1">
            <button
              type="button"
              onClick={() => onMove(index, index - 1)}
              disabled={index === 0}
              aria-label="한 칸 위로"
              className="rounded-lg border border-[#e3e6ef] bg-white px-2 py-1 text-xs text-[#6d7387] hover:border-brand hover:text-brand disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => onMove(index, index + 1)}
              disabled={index === total - 1}
              aria-label="한 칸 아래로"
              className="rounded-lg border border-[#e3e6ef] bg-white px-2 py-1 text-xs text-[#6d7387] hover:border-brand hover:text-brand disabled:opacity-30"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label="이 자리 빼기"
              className="rounded-lg border border-[#f3d8da] bg-white px-2 py-1 text-xs text-[#c0392b] hover:bg-[#fff5f5]"
            >
              ✕
            </button>
          </div>
        </div>
      </article>
    </li>
  );
});

// ── 자리 상세 (오른쪽 칸) ──────────────────────────────────────────
//
// **고친 것은 '임시 저장'을 눌러야 코스에 들어간다.** 타이핑이 그대로 코스에 흘러가면
// URL 을 반쯤 친 상태가 사진으로 잡히고, 지도 경로도 한 글자마다 다시 계산된다.
// 여기서 만지는 것은 이 자리의 복사본이고, 저장을 눌러야 원본과 바뀐다.
//
// 부모가 `key` 로 자리마다 새로 만들어 주므로 자리를 옮겨 다녀도 앞 자리의 입력이 안 남는다.
function SlotDetail({ place, index, catalog, usedKeys, onApply, onCancel }) {
  const [form, setForm] = useState(place);
  const [replacing, setReplacing] = useState(false);

  const image = form.image || {};
  const evidence = form.evidence || {};
  const set = (path, value) => setForm((current) => withField(current, path, value));

  const dirty = useMemo(() => JSON.stringify(form) !== JSON.stringify(place), [form, place]);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-[#eceef4] px-5 py-3.5">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[#dfe2ec] bg-white px-3 py-1.5 text-[11px] font-bold text-[#4d536a] hover:border-brand hover:text-brand"
        >
          {dirty ? "취소" : "← 지도"}
        </button>
        <strong className="truncate text-sm text-[#1a142e]">
          {index + 1}. {form.place_name}
        </strong>
        {dirty ? (
          <span className="shrink-0 rounded-full bg-[#fff4dc] px-2 py-0.5 text-[10px] font-bold text-[#a96700]">
            저장 안 함
          </span>
        ) : null}
        <button
          type="button"
          onClick={() => onApply(index, form)}
          disabled={!dirty}
          className="ml-auto shrink-0 rounded-lg bg-brand px-3.5 py-1.5 text-[11px] font-bold text-white shadow-[0_8px_20px_rgba(92,46,245,0.22)] disabled:opacity-40 disabled:shadow-none"
        >
          임시 저장
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-4 flex gap-4">
          <Photo url={image.url} alt={image.caption || form.place_name} className="size-[132px] shrink-0" />
          <div className="min-w-0 flex-1 text-[11px] text-[#9aa0b0]">
            <p className="mb-1 truncate text-[14px] font-bold text-[#1a142e] sm:mb-[4px] sm:text-[15px]">
              {form.place_name}
            </p>
            <p className="mt-1">
              {[form.floor, form.place_type, form.category, form.price_tier]
                .filter(Boolean)
                .join(" · ")}
            </p>
            {image.url ? (
              <p className="mt-2">
                사진 {image.caption ? `“${image.caption}” · ` : ""}
                <a
                  href={image.article || image.url}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#6f55d9] hover:underline"
                >
                  {image.source || hostOf(image.url)}
                </a>
              </p>
            ) : null}
            <button
              type="button"
              onClick={() => setReplacing((value) => !value)}
              className="mt-3 rounded-lg border border-[#dfe2ec] bg-white px-3 py-1.5 text-[11px] font-bold text-[#4d536a] hover:border-brand hover:text-brand"
            >
              {replacing ? "매장 고르기 닫기" : "매장 교체"}
            </button>
          </div>
        </div>

        {replacing ? (
          <div className="mb-4">
            <AdminCoursePlacePicker
              title={`${form.place_name} 자리를 바꿉니다`}
              catalog={catalog.rows}
              loading={catalog.loading}
              error={catalog.error}
              alternates={form.alternates || []}
              currentKey={form.navigation_key}
              usedKeys={usedKeys}
              onPick={(picked) => {
                set("__replace__", picked);
                setReplacing(false);
              }}
              onClose={() => setReplacing(false)}
            />
          </div>
        ) : null}

        <div className="grid gap-3 2xl:grid-cols-2">
          <div className="2xl:col-span-2">
            <Field
              label="추천 사유"
              hint="손님에게 그대로 나가는 문장"
              value={form.reason}
              onChange={(value) => set("reason", value)}
              multiline
            />
          </div>

          <label className="block">
            <span className="mb-1 block text-[11px] font-bold tracking-[0.04em] text-[#4d536a]">
              분류
            </span>
            <select
              value={form.kind || ""}
              onChange={(event) => set("kind", event.target.value)}
              className="w-full rounded-xl border border-[#dfe2ec] bg-white px-3 py-2 text-[13px] text-[#20243a] outline-none focus:border-brand"
            >
              {KIND_OPTIONS.map((kind) => (
                <option key={kind} value={kind}>
                  {kind}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-[11px] font-bold tracking-[0.04em] text-[#4d536a]">
              근거 종류
            </span>
            <select
              value={form.reason_kind || "route"}
              onChange={(event) => set("reason_kind", event.target.value)}
              className="w-full rounded-xl border border-[#dfe2ec] bg-white px-3 py-2 text-[13px] text-[#20243a] outline-none focus:border-brand"
            >
              <option value="evidence">셀럽 근거</option>
              <option value="route">동선</option>
              <option value="manual">관리자가 직접</option>
            </select>
          </label>

          <Field
            label="근거 인물"
            value={evidence.person}
            onChange={(value) => set("evidence.person", value)}
            placeholder="카리나"
          />
          <Field
            label="근거 브랜드"
            hint="바꾸면 캡션도 같이 손봐야 한다"
            value={evidence.brand}
            onChange={(value) => set("evidence.brand", value)}
            placeholder="프라다"
          />

          <div className="2xl:col-span-2">
            <Field
              label="근거 문장"
              hint="기사에서 뽑은 사실"
              value={evidence.sentence}
              onChange={(value) => set("evidence.sentence", value)}
              multiline
            />
          </div>
          <div className="2xl:col-span-2">
            <Field
              label="근거 기사 URL"
              value={evidence.article}
              onChange={(value) => set("evidence.article", value)}
              placeholder="https://…"
            />
          </div>

          <div className="mt-1 border-t border-[#e6e8f0] pt-3 2xl:col-span-2">
            <Field
              label="사진 URL"
              hint="비우면 사진 없음으로 나간다"
              value={image.url}
              onChange={(value) => set("image.url", value)}
              placeholder="https://…"
            />
          </div>
          <Field
            label="사진 캡션"
            hint="카리나 × 프라다"
            value={image.caption}
            onChange={(value) => set("image.caption", value)}
            placeholder="카리나 × 프라다"
          />
          <Field
            label="사진 출처"
            hint="사진이 놓인 호스트"
            value={image.source}
            onChange={(value) => set("image.source", value)}
            placeholder="elle.co.kr"
          />
          <div className="2xl:col-span-2">
            <Field
              label="사진이 실린 기사 URL"
              value={image.article}
              onChange={(value) => set("image.article", value)}
              placeholder="https://…"
            />
          </div>
          <label className="block 2xl:col-span-2">
            <span className="mb-1 block text-[11px] font-bold tracking-[0.04em] text-[#4d536a]">
              사진 종류
            </span>
            <select
              value={image.kind || ""}
              onChange={(event) => set("image.kind", event.target.value)}
              className="w-full rounded-xl border border-[#dfe2ec] bg-white px-3 py-2 text-[13px] text-[#20243a] outline-none focus:border-brand"
            >
              <option value="">없음</option>
              <option value="evidence">근거 사진</option>
              <option value="place">매장 사진</option>
              <option value="manual">관리자가 직접</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

export function AdminCourseEditor({ detail, onClose, onApproved, live = false }) {
  // `|| {}` 를 렌더마다 새로 만들면 아래 useMemo·useCallback 의 의존성이 매번 바뀐다.
  const original = useMemo(() => detail?.payload || {}, [detail]);

  const [reply, setReply] = useState(original.reply || "");
  const [places, setPlaces] = useState(() => original.places || []);
  // 코스의 얼굴. **비우면 기본값**(근거 사진 → 첫 자리 매장 사진)으로 떨어진다.
  const [mainImage, setMainImage] = useState(original.main_image || "");
  // 어느 나라 목록에 걸 것인가. 기본 추천 코스로 올릴 때만 쓴다 — 캐시 승인에는
  // 나라 개념이 없다(그날 즉답용 사본이라 나라를 안 가린다).
  const [countries, setCountries] = useState(() =>
    Array.isArray(original.country_codes) && original.country_codes.length
      ? original.country_codes
      : ["KR"],
  );
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const [notice, setNotice] = useState("");
  const [optimizing, setOptimizing] = useState(false);
  // 승인은 손님에게 바로 나가는 동작이라 **두 번 눌러야 나간다.** 편집기가 팝업이고
  // 버튼이 푸터에 몰려 있어 오조작이 쉬운 자리다.
  //   idle → confirm → sending
  const [approving, setApproving] = useState("idle");
  // 어느 창구로 올리나. **확인 단계에 들어갈 때 정해 두고 그대로 보낸다** — 확인
  // 버튼에서 다시 고르게 하면 "캐시로" 를 누르려다 "기본 추천 코스로" 가 나간다.
  //   cache    오늘 자정까지 손님 즉답에만 쓰는 사본
  //   publish  서비스 DB 에 영구히 걸리는 기본 추천 코스 (캐시 승인도 같이 된다)
  const [target, setTarget] = useState("cache");

  const catalog = usePlaceCatalog();

  const navigationKeys = useMemo(
    () => places.map((place) => place.navigation_key).filter(Boolean),
    [places],
  );
  const routeKey = navigationKeys.join(">");
  const route = useCourseRoute(routeKey);

  // 렌더마다 JSON.stringify 를 두 번 돌리면(초안이 조사 원문까지 들고 있어 수십 KB)
  // 사유를 칠 때마다 그 비용을 낸다. 자리가 바뀔 때만 다시 잰다.
  const dirty = useMemo(
    () =>
      reply !== (original.reply || "") ||
      mainImage !== (original.main_image || "") ||
      JSON.stringify(places) !== JSON.stringify(original.places || []),
    [reply, mainImage, places, original],
  );

  // 상세에서 '임시 저장'을 눌렀을 때만 자리가 바뀐다. 타이핑이 그대로 흘러가면
  // URL 을 반쯤 친 상태가 사진으로 잡히고 경로도 한 글자마다 다시 계산된다.
  const applySlot = useCallback((index, next) => {
    setPlaces((rows) => rows.map((row, i) => (i === index ? next : row)));
    setNotice(`${next.place_name} 을(를) 코스에 반영했습니다. 아직 저장되지 않았습니다.`);
  }, []);

  const moveSlot = useCallback((from, to) => {
    setPlaces((rows) => {
      if (to < 0 || to >= rows.length) return rows;
      const next = [...rows];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
    setSelected(null);
  }, []);

  const removeSlot = useCallback((index) => {
    setPlaces((rows) => rows.filter((_, i) => i !== index));
    setSelected(null);
  }, []);

  const addPlace = useCallback(
    (picked) => {
      setNotice("");
      setPlaces((rows) => {
        if (rows.length >= MAX_PLACES) {
          setNotice(`자리는 ${MAX_PLACES}곳까지입니다 — 경로 최적화가 거기까지 됩니다.`);
          return rows;
        }
        return [...rows, slotFromPlace(picked)];
      });
      setAdding(false);
    },
    [],
  );

  const reset = useCallback(() => {
    setReply(original.reply || "");
    setMainImage(original.main_image || "");
    setPlaces(original.places || []);
    setSelected(null);
    setNotice("");
  }, [original]);

  /**
   * 시작을 고정하고 나머지 자리를 다시 배치한다.
   *
   * 첫 자리는 손님이 들어오는 지점이라 옮기면 안 된다. 마지막까지 묶는
   * `preserveEndpoints` 를 끄는 것은, 그걸 켜면 가운데만 섞여 층 이동이 거의 안 줄기
   * 때문이다.
   */
  const optimize = useCallback(async () => {
    if (navigationKeys.length < 3) {
      setNotice("자리가 세 곳은 있어야 최적화할 것이 있습니다.");
      return;
    }
    if (navigationKeys.length > MAX_PLACES) {
      setNotice(`경로 최적화는 ${MAX_PLACES}곳까지만 됩니다.`);
      return;
    }

    setOptimizing(true);
    setNotice("");
    try {
      const optimized = await optimizeCourseRoute(
        navigationKeys.map((navigationKey) => ({ navigationKey })),
        undefined,
        { lockedIndexes: [0], preserveEndpoints: false },
      );
      if (!optimized) {
        setNotice("최적화된 순서를 찾지 못했습니다.");
        return;
      }
      const order = optimized.places.map((place) => place.navigationKey);
      setPlaces((rows) => {
        const byKey = new Map(rows.map((row) => [row.navigation_key, row]));
        const next = order.map((key) => byKey.get(key)).filter(Boolean);
        // 원장에 없는 자리가 섞여 있으면 최적화가 그 자리를 떨어뜨린다. 뒤에 붙여 살린다.
        const kept = new Set(order);
        return [...next, ...rows.filter((row) => !kept.has(row.navigation_key))];
      });
      setSelected(null);
    } catch (error) {
      setNotice(error.message || "최적화에 실패했습니다.");
    } finally {
      setOptimizing(false);
    }
  }, [navigationKeys]);

  /**
   * 창구로 보내는 몸통. **초안 원문 그대로에 고친 것만 얹는다** — 승인 람다가
   * `research` 와 세션 `state` 를 그대로 다시 쓰므로 화면이 새로 조립할 것이 없다.
   *
   * `country_codes` 는 기본 추천 코스로 올릴 때만 쓰인다. 캐시 승인은 나라를 안
   * 본다 — 그날 즉답용 사본이라 나라를 가릴 이유가 없다.
   */
  const body = useCallback(
    () => ({
      ...original,
      reply,
      places,
      main_image: mainImage.trim(),
      country_codes: countries,
    }),
    [original, reply, places, mainImage, countries],
  );

  // JSON 은 **누를 때만** 만든다. 렌더마다 만들면 조사 원문까지 직렬화하느라 입력이 밀린다.
  const buildJson = useCallback(
    () => JSON.stringify(body(), null, 2),
    [body],
  );

  const copyJson = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(buildJson());
      setNotice("JSON 을 복사했습니다.");
    } catch {
      setNotice("복사에 실패했습니다 — 내려받기를 쓰세요.");
    }
  }, [buildJson]);

  const downloadJson = useCallback(() => {
    const blob = new Blob([buildJson()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${live ? "course" : "draft"}-${detail?.celebrity || "course"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [buildJson, detail, live]);

  const approve = useCallback(async (nextTarget) => {
    if (approving === "idle") {
      setTarget(nextTarget === "publish" ? "publish" : "cache");
      setApproving("confirm");
      setNotice("");
      return;
    }
    if (approving !== "confirm") return;

    setApproving("sending");
    setNotice("");
    try {
      const send = target === "publish" ? publishAdminCourse : approveAdminCourse;
      const result = await send(detail.celebrity, body());
      // 목록에서 그 카드가 사라지는 것이 곧 성공 신호다 — 초안을 지웠으니까.
      onApproved?.(detail.celebrity, result);
    } catch (error) {
      setApproving("idle");
      // 타임아웃이면 올라갔는지 안 올라갔는지 알 수 없다. 다시 누르라고만 하면
      // 관리자가 두 번 올릴 수 있으니(멱등이라 결과는 같지만) 목록을 보라고 한다.
      setNotice(
        `${error.message || "승인에 실패했습니다."} — 목록을 새로고침해 ${
          live ? "승인 시각이 바뀌었는지" : "이 인물이 남아 있는지"
        } 확인하세요.`,
      );
    }
  }, [approving, target, detail, body, onApproved, live]);

  /**
   * 대표 사진을 안 고르면 무엇이 나가나. **오라클·캐시가 고르는 순서와 같다** —
   * 근거 사진이 먼저고 없으면 아무 자리 사진이다 (`celeb_approve.hero_of`).
   * 미리 보여 주지 않으면 관리자가 "비워 두면 뭐가 나오지" 를 알 수 없다.
   */
  const defaultHero = useMemo(() => {
    let fallback = "";
    for (const place of places) {
      const url = place?.image?.url;
      if (!url) continue;
      if (place.image.kind === "evidence") return url;
      fallback = fallback || url;
    }
    return fallback;
  }, [places]);

  const shape = useMemo(() => {
    const counts = places.reduce((acc, place) => {
      acc[place.kind] = (acc[place.kind] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([kind, count]) => `${kind} ${count}`)
      .join(" · ");
  }, [places]);

  const handleDragStart = useCallback((index) => setDragIndex(index), []);
  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDropIndex(null);
  }, []);
  const handleDragOver = useCallback((event, index) => {
    event.preventDefault();
    setDropIndex(index);
  }, []);
  // **갱신 함수 안에서 moveSlot 을 부르면 안 된다.** React 는 개발 모드에서 갱신 함수를
  // 두 번 부를 수 있어(StrictMode) 자리가 두 번 옮겨진다. 값을 그대로 읽어 쓴다.
  const handleDrop = useCallback(
    (event, index) => {
      event.preventDefault();
      if (dragIndex !== null) moveSlot(dragIndex, index);
      setDragIndex(null);
      setDropIndex(null);
    },
    [dragIndex, moveSlot],
  );

  const selectedPlace = selected !== null ? places[selected] : null;

  return (
    <div className="flex h-[92dvh] flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b border-[#eceef4] px-6 py-4">
        <h2 id="admin-course-editor-title" className="text-lg font-bold text-[#171b30]">
          {detail?.celebrity}
        </h2>
        <span className="rounded-full bg-[#eee9ff] px-2.5 py-1 text-[11px] font-bold text-brand">
          {detail?.status}
        </span>
        <span className="text-xs font-semibold text-[#687087]">{shape || "코스 없음"}</span>
        <span className="h-3 w-px bg-[#dfe2eb]" />
        <span className="text-xs text-[#8a90a3]">생성 {formatAdminDate(detail?.builtAt)}</span>
        {dirty ? (
          <span className="rounded-full bg-[#fff4dc] px-2.5 py-1 text-[11px] font-bold text-[#a96700]">
            수정함
          </span>
        ) : null}
        <button
          type="button"
          onClick={onClose}
          aria-label="닫기"
          className="ml-auto rounded-lg border border-[#dfe2ec] bg-white px-3 py-1.5 text-xs font-bold text-[#4d536a] hover:border-brand hover:text-brand"
        >
          닫기
        </button>
      </header>

      {/* /ai-course 의 코스 스튜디오와 같은 짜임 — 한쪽에 코스, 한쪽에 지도. */}
      <div className="grid min-h-0 flex-1 grid-rows-[300px_minmax(0,1fr)] lg:grid-cols-[minmax(420px,34%)_minmax(0,1fr)] lg:grid-rows-1">
        <div className="relative order-1 min-h-0 border-b border-[#eceef4] bg-[#F7F3EF] lg:order-2 lg:border-b-0 lg:border-l">
          {selectedPlace ? (
            <div className="h-full min-h-0 bg-white">
              <SlotDetail
                // 자리를 옮겨 다니면 새로 만든다. 안 그러면 앞 자리의 입력이 남는다.
                key={`${selected}:${selectedPlace.navigation_key}`}
                place={selectedPlace}
                index={selected}
                catalog={catalog}
                usedKeys={navigationKeys}
                onApply={applySlot}
                onCancel={() => setSelected(null)}
              />
            </div>
          ) : (
            // 지도 위에 띄우던 경로 요약 알약은 걷어냈다. 지도를 가리기만 하고, 정작 그
            // 숫자가 필요한 순간은 최적화를 누를 때라 그 버튼 옆이 제자리다.
            <CourseNavigationMap
              route={route.itinerary}
              routeFloorIds={route.itinerary?.floorIds}
              routeGraph={route.graph}
              initialView="route"
              variant="course"
              showFloorSelector
              showControls
            />
          )}
        </div>

        <div className="order-2 min-h-0 overflow-y-auto px-5 py-5 lg:order-1">
          <p className="mb-4 rounded-xl bg-[#fff8ea] px-4 py-3 text-xs leading-5 text-[#856c3a]">
            {live ? (
              <>
                <b>이 코스는 지금 손님에게 나가고 있습니다.</b> 다시 올리면 여기서 고친
                그대로 <b>덮어씁니다</b>. 차순위 후보는 승인 때 떼어 내 되살릴 수 없으니,
                자리를 갈려면 매장 목록에서 고르세요. 캐시는 <b>오늘 자정</b>에 만료됩니다.
              </>
            ) : (
              <>
                <b>승인하면 손님에게 바로 나갑니다.</b> 여기서 고친 그대로 캐시에 올라가고
                이 초안은 사라집니다. 캐시는 <b>오늘 자정</b>에 만료됩니다 — 되돌리는
                창구는 없으니, 잘못 올렸으면 고쳐서 다시 승인하세요(덮어씁니다).
              </>
            )}
          </p>

          {/* 버튼이 둘이라 무엇이 다른지 여기서 한 번 말해 준다. 수명이 다른 것이 요점이다. */}
          <p className="mb-4 rounded-xl bg-[#f1f7f3] px-4 py-3 text-xs leading-5 text-[#2c6146]">
            <b>기본 추천 코스로 승인</b>을 누르면 캐시에 올리는 것에 더해 서비스 DB 에도
            넣습니다. 그렇게 올린 코스는 <b>만료가 없고</b> 메인·코스 추천 리스트에 걸립니다
            (커뮤니티에는 안 나옵니다). 반영은 뒤에서 1~2분간 도니, 진행 상태는{" "}
            <b>기본 추천 코스</b> 화면에서 보세요.
          </p>

          <label className="mb-4 block">
            <span className="mb-1 block text-[11px] font-bold tracking-[0.04em] text-[#4d536a]">
              안내 문장{" "}
              <span className="font-normal text-[#9aa0b0]">손님이 코스 위에서 읽는 말</span>
            </span>
            <textarea
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              rows={2}
              className="w-full rounded-xl border border-[#dfe2ec] bg-white px-3 py-2 text-[13px] leading-6 text-[#20243a] outline-none focus:border-brand"
            />
          </label>

          {/* **코스의 얼굴.** 카드와 코스 상세의 배경으로 나가고, 어드민 안팎이 같은
              사진을 쓴다. 비우면 근거 사진 → 첫 자리 매장 사진 차례로 떨어진다. */}
          <label className="mb-4 block">
            <span className="mb-1 flex flex-wrap items-baseline gap-2">
              <span className="text-[11px] font-bold tracking-[0.04em] text-[#4d536a]">
                대표 사진
              </span>
              <span className="text-[10px] text-[#9aa0b0]">
                비우면 첫 자리 사진이 자동으로 쓰입니다
              </span>
            </span>
            <div className="flex gap-3">
              <Photo url={mainImage || defaultHero} alt="대표 사진" className="size-20 shrink-0" />
              <div className="min-w-0 flex-1">
                <input
                  value={mainImage}
                  onChange={(event) => setMainImage(event.target.value)}
                  placeholder={defaultHero || "https://…"}
                  className="w-full rounded-xl border border-[#dfe2ec] bg-white px-3 py-2 text-[13px] leading-6 text-[#20243a] outline-none focus:border-brand"
                />
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] font-bold text-[#9aa0b0]">
                    {mainImage ? "직접 지정" : "기본값 사용 중"}
                  </span>
                  {/* 자리 사진 중에서 고르는 것이 흔한 경우다. 주소를 손으로 옮겨
                      적게 하면 오타가 난다. */}
                  {places.slice(0, 6).map((place, index) =>
                    place.image?.url ? (
                      <button
                        key={place.slot_id ?? index}
                        type="button"
                        onClick={() => setMainImage(place.image.url)}
                        title={place.place_name}
                        className={`overflow-hidden rounded-md border transition ${
                          mainImage === place.image.url
                            ? "border-brand ring-2 ring-brand/25"
                            : "border-[#e6e8f0] hover:border-brand"
                        }`}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={place.image.url} alt="" loading="lazy" className="size-8 object-cover" />
                      </button>
                    ) : null,
                  )}
                  {mainImage ? (
                    <button
                      type="button"
                      onClick={() => setMainImage("")}
                      className="rounded-lg border border-[#dfe2ec] bg-white px-2 py-1 text-[10px] font-bold text-[#4d536a] hover:border-brand hover:text-brand"
                    >
                      기본값으로
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </label>

          {/* **기본 추천 코스로 올릴 때만 쓰인다.** 캐시 승인에는 나라 개념이 없다.
              손님 화면의 나라 버튼에 "전체" 가 없어서, 하나도 안 고르면 어느
              버튼에서도 안 보인다 — 그래서 승인 자체를 막는다. */}
          <div className="mb-4">
            <span className="mb-1 flex flex-wrap items-baseline gap-2">
              <span className="text-[11px] font-bold tracking-[0.04em] text-[#4d536a]">
                어느 나라 추천 코스로
              </span>
              <span className="text-[10px] text-[#9aa0b0]">
                여러 나라를 고를 수 있습니다 · 기본 추천 코스로 승인할 때만 쓰입니다
              </span>
            </span>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(COUNTRY_META).map(([code, meta]) => {
                const on = countries.includes(code);
                return (
                  <button
                    key={code}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setCountries((prev) =>
                        prev.includes(code)
                          ? prev.filter((item) => item !== code)
                          : [...prev, code],
                      )
                    }
                    className={`rounded-full px-3 py-1.5 text-[11px] font-bold transition ${
                      on
                        ? "bg-[#231f35] text-white shadow-[0_4px_12px_rgba(20,24,45,0.18)]"
                        : "border border-[#dfe2ec] bg-white text-[#4d536a] hover:border-brand hover:text-brand"
                    }`}
                  >
                    {meta.flag} {meta.name}
                  </button>
                );
              })}
            </div>
            {!countries.length ? (
              <p className="mt-1.5 text-[11px] font-semibold text-[#a3323f]">
                나라를 하나 이상 골라야 기본 추천 코스로 올릴 수 있습니다.
              </p>
            ) : null}
          </div>

          <WarningPanel warnings={original.warnings} open label="초안 경고" />

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={optimize}
              disabled={optimizing || navigationKeys.length < 3}
              className="rounded-xl bg-brand px-3.5 py-2 text-[11px] font-bold text-white shadow-[0_8px_20px_rgba(92,46,245,0.22)] disabled:opacity-40 disabled:shadow-none"
              title="첫 자리를 고정하고 나머지를 다시 배치합니다"
            >
              {optimizing ? "최적화 중…" : "동선 최적화 (시작 고정)"}
            </button>
            <button
              type="button"
              onClick={() => setAdding((value) => !value)}
              disabled={places.length >= MAX_PLACES}
              className="rounded-xl border border-[#dfe2ec] bg-white px-3.5 py-2 text-[11px] font-bold text-[#4d536a] hover:border-brand hover:text-brand disabled:opacity-40"
            >
              {adding ? "장소 추가 닫기" : "＋ 장소 추가"}
            </button>
            <button
              type="button"
              onClick={reset}
              disabled={!dirty}
              className="rounded-xl border border-[#dfe2ec] bg-white px-3.5 py-2 text-[11px] font-bold text-[#4d536a] hover:border-brand hover:text-brand disabled:opacity-40"
            >
              되돌리기
            </button>
          </div>

          {notice ? (
            <p className="mt-2 rounded-xl bg-[#f4f1ff] px-3 py-2 text-[11px] font-semibold text-brand">
              {notice}
            </p>
          ) : null}

          {adding ? (
            <div className="mt-3">
              <AdminCoursePlacePicker
                title="코스에 넣을 매장을 고르세요"
                catalog={catalog.rows}
                loading={catalog.loading}
                error={catalog.error}
                usedKeys={navigationKeys}
                onPick={addPlace}
                onClose={() => setAdding(false)}
              />
            </div>
          ) : null}

          <ol className="mt-5">
            {places.map((place, index) => (
              <SlotCard
                key={place.slot_id ?? place.navigation_key ?? index}
                place={place}
                index={index}
                total={places.length}
                active={selected === index}
                locked={index === 0}
                onSelect={setSelected}
                onMove={moveSlot}
                onRemove={removeSlot}
                dragging={dragIndex === index}
                dropTarget={dropIndex === index && dragIndex !== index}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              />
            ))}
          </ol>

          {!places.length ? (
            <p className="rounded-2xl border border-dashed border-[#dfe2ec] p-10 text-center text-sm text-[#9095a6]">
              자리가 없습니다. 위의 <b>＋ 장소 추가</b>로 넣을 수 있습니다.
            </p>
          ) : null}

          {original.research ? (
            <details className="mt-4 rounded-2xl border border-[#e5e7ef] bg-white px-5 py-4">
              <summary className="cursor-pointer text-sm font-bold text-[#4d536a]">
                조사 원문 (research) — 승인 람다가 재조사 없이 쓸 재료
              </summary>
              <pre className="mt-3 max-h-[320px] overflow-auto rounded-xl bg-[#f7f8fb] p-4 text-[11px] leading-5 text-[#4c5164]">
                {JSON.stringify(original.research, null, 2)}
              </pre>
            </details>
          ) : null}
        </div>
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t border-[#eceef4] bg-[#fafbfe] px-6 py-3.5">
        <button
          type="button"
          onClick={copyJson}
          className="rounded-xl border border-[#dfe2ec] bg-white px-4 py-2 text-xs font-bold text-[#4d536a] hover:border-brand hover:text-brand"
        >
          JSON 복사
        </button>
        <button
          type="button"
          onClick={downloadJson}
          className="rounded-xl bg-[#231f35] px-4 py-2 text-xs font-bold text-white"
        >
          JSON 내려받기
        </button>
        {/*
          올리는 곳이 둘이고 **수명이 다르다.** 확인 단계에서는 고른 쪽 하나만 남긴다 —
          두 개를 나란히 두면 "정말 올립니다" 를 누르려다 다른 창구를 누른다.

            캐시        오늘 자정까지. 손님 즉답에만 쓴다
            기본 추천   만료 없음. 메인·코스 추천 리스트에 걸린다 (캐시 승인도 같이 된다)
        */}
        {approving !== "confirm" || target === "cache" ? (
          <button
            type="button"
            onClick={() => approve("cache")}
            disabled={approving === "sending" || !places.length}
            className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-[0_8px_20px_rgba(92,46,245,0.22)] disabled:opacity-40 disabled:shadow-none ${
              approving === "confirm" ? "bg-[#c0392b]" : "bg-brand"
            }`}
            title={
              live
                ? "지금 나가고 있는 코스를 덮어씁니다. 오늘 자정에 만료됩니다"
                : "손님이 받는 캐시로 올립니다. 오늘 자정에 만료됩니다"
            }
          >
            {approving === "sending" && target === "cache"
              ? "올리는 중…"
              : approving === "confirm"
                ? live
                  ? "정말 덮어씁니다 — 한 번 더"
                  : "정말 올립니다 — 한 번 더"
                : live
                  ? "고쳐서 다시 올리기"
                  : "승인하고 캐시에 올리기"}
          </button>
        ) : null}
        {approving !== "confirm" || target === "publish" ? (
          <button
            type="button"
            onClick={() => approve("publish")}
            disabled={approving === "sending" || !places.length || !countries.length}
            className={`rounded-xl px-4 py-2 text-xs font-bold text-white shadow-[0_8px_20px_rgba(20,24,45,0.18)] disabled:opacity-40 disabled:shadow-none ${
              approving === "confirm" ? "bg-[#c0392b]" : "bg-[#12804b]"
            }`}
            title={
              countries.length
                ? `캐시에 올리고, 그 위에 서비스 DB 에도 넣습니다. ${countries.join("·")} 추천 리스트에 걸립니다`
                : "나라를 하나 이상 골라야 합니다"
            }
          >
            {approving === "sending" && target === "publish"
              ? "올리는 중…"
              : approving === "confirm"
                ? "정말 기본 추천 코스로 — 한 번 더"
                : "기본 추천 코스로 승인"}
          </button>
        ) : null}
        {approving === "confirm" ? (
          <button
            type="button"
            onClick={() => setApproving("idle")}
            className="rounded-xl border border-[#dfe2ec] bg-white px-3 py-2 text-xs font-bold text-[#4d536a]"
          >
            취소
          </button>
        ) : null}
        <span className="ml-auto text-[11px] text-[#9aa0b0]">
          자리 {places.length}/{MAX_PLACES}곳 · 경고 {original.warnings?.length || 0}건 ·{" "}
          나라 {countries.length ? countries.join("·") : "없음"}
        </span>
      </footer>
    </div>
  );
}
