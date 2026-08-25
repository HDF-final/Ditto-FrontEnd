"use client";

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { CourseNavigationMap } from "@/components/navigation/course-navigation-map";
import {
  attachPlaceIdsToCourseDataset,
  calculateCourseRoute,
  getFallbackPlaceImage,
  loadCourseRoutingDataset,
  optimizeCourseRoute,
} from "@/lib/navigation/course-routing-service";
import { getNavigablePlaces } from "@/lib/api/place-navigation";
import { WarningPanel, formatAdminDate } from "./admin-artifact-ui";
import { AdminCoursePlacePicker } from "./admin-course-place-picker";

// 초안 하나를 관리자가 손으로 고치는 편집기. /ai-course 의 코스 스튜디오와 같은 짜임이다 —
// 한쪽에 코스, 한쪽에 실내 지도와 경로. 다른 것은 화면을 통째로 바꾸지 않고 팝업 안에서만
// 산다는 것이고, 그래서 관리자가 목록으로 돌아오는 비용이 없다.
//
// 자리를 누르면 오른쪽이 지도에서 **그 자리의 상세**로 바뀐다. 카드 안에 입력칸 열다섯 개를
// 펼치면 코스 전체가 한눈에 안 들어오고, 자리마다 그걸 그리는 비용도 든다.
//
// **편집은 저장되지 않는다.** 백엔드에도 람다에도 초안을 고치는 창구가 아직 없다
// (읽기와 삭제만 있다). 결과를 JSON 으로 내보내 승인 람다에 넘기는 데까지가 지금의 끝이다.

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

function Photo({ url, alt, className }) {
  const [failed, setFailed] = useState(false);
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
      onError={() => setFailed(true)}
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
              <span className="flex flex-wrap items-center gap-1.5">
                <strong className="text-[14.5px] text-[#20243a]">{place.place_name}</strong>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    KIND_STYLE[place.kind] || "bg-[#f3f4f7] text-[#777d90]"
                  }`}
                >
                  {place.kind}
                </span>
              </span>
              <span className="mt-0.5 block truncate text-[10px] text-[#a3a8b8]">
                {place.floor} · {place.navigation_key}
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
function SlotDetail({ place, index, catalog, usedKeys, onChange, onBack }) {
  const [replacing, setReplacing] = useState(false);
  const image = place.image || {};
  const evidence = place.evidence || {};
  const set = (path, value) => onChange(index, path, value);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-3 border-b border-[#eceef4] px-5 py-3.5">
        <button
          type="button"
          onClick={onBack}
          className="rounded-lg border border-[#dfe2ec] bg-white px-3 py-1.5 text-[11px] font-bold text-[#4d536a] hover:border-brand hover:text-brand"
        >
          ← 지도
        </button>
        <strong className="truncate text-sm text-[#20243a]">
          {index + 1}. {place.place_name}
        </strong>
        <span className="ml-auto font-mono text-[10px] text-[#a3a8b8]">
          {place.navigation_key}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        <div className="mb-4 flex gap-4">
          <Photo url={image.url} alt={image.caption || place.place_name} className="size-[132px] shrink-0" />
          <div className="min-w-0 flex-1 text-[11px] text-[#9aa0b0]">
            <p className="text-[13px] font-bold text-[#20243a]">{place.place_name}</p>
            <p className="mt-1">
              {[place.floor, place.place_type, place.category, place.price_tier]
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
              title={`${place.place_name} 자리를 바꿉니다`}
              catalog={catalog.rows}
              loading={catalog.loading}
              error={catalog.error}
              alternates={place.alternates || []}
              currentKey={place.navigation_key}
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
              value={place.reason}
              onChange={(value) => set("reason", value)}
              multiline
            />
          </div>

          <label className="block">
            <span className="mb-1 block text-[11px] font-bold tracking-[0.04em] text-[#4d536a]">
              분류
            </span>
            <select
              value={place.kind || ""}
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
              value={place.reason_kind || "route"}
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

/**
 * 코스의 실내 경로. 자리를 바꿀 때마다 다시 계산한다 — 관리자가 동선을 고치는 것이
 * 이 화면의 요지라, 지도가 그 결과를 바로 보여 주지 않으면 고쳐도 알 수가 없다.
 *
 * 계산은 전부 브라우저에서 돈다(`course-routing-service` 가 로컬 원장 JSON 을 읽는다).
 * 백엔드도 람다도 안 부른다.
 */
function useCourseRoute(routeKey) {
  const [result, setResult] = useState(null);

  // **의존성이 `routeKey` 하나다.** 배열을 넣으면 사유 한 글자를 칠 때마다 새 배열이
  // 만들어져 경로를 다시 판다. 자리가 그대로면 경로도 그대로다.
  useEffect(() => {
    if (!routeKey) return undefined;

    let active = true;
    calculateCourseRoute(routeKey.split(">").map((navigationKey) => ({ navigationKey })))
      .then((next) => {
        if (active) setResult({ key: routeKey, ...next, error: null });
      })
      .catch((error) => {
        if (active) setResult({ key: routeKey, error });
      });

    return () => {
      active = false;
    };
  }, [routeKey]);

  const fresh = result?.key === routeKey;
  return {
    itinerary: fresh ? result.itinerary : null,
    graph: fresh ? result.graph : null,
    error: fresh ? result.error : null,
    loading: Boolean(routeKey) && !fresh,
  };
}

/**
 * 고를 수 있는 매장 전부. <b>`/ai-course` 의 '장소 추가'와 같은 것을 쓴다.</b>
 *
 * 로컬 원장(`loadCourseRoutingDataset`)이 147곳의 진짜 목록이고, 백엔드
 * `/places/navigation` 이 사진과 place_id 를 얹는다. 백엔드가 없어도 원장만으로 돌아간다.
 *
 * 원장은 모듈 안에서 한 번만 받아 두므로(`datasetPromise`) 지도가 이미 올려 둔 것을
 * 그대로 쓴다 — 이 화면이 목록 때문에 따로 왕복하는 일이 없다.
 */
function usePlaceCatalog() {
  const [state, setState] = useState({ rows: [], loading: true, error: null });

  useEffect(() => {
    let active = true;
    Promise.all([
      loadCourseRoutingDataset(),
      getNavigablePlaces().catch(() => []),
    ])
      .then(([dataset, navigationPlaces]) => {
        if (!active) return;
        const hydrated = attachPlaceIdsToCourseDataset(dataset, navigationPlaces || []);
        setState({ rows: hydrated.places, loading: false, error: null });
      })
      .catch((error) => {
        if (active) setState({ rows: [], loading: false, error });
      });
    return () => {
      active = false;
    };
  }, []);

  return state;
}

function RouteSummary({ itinerary, error, loading, count }) {
  if (loading) return <span className="text-[11px] text-[#8a90a3]">경로 계산 중…</span>;
  if (error) return <span className="text-[11px] text-[#c0392b]">경로를 계산하지 못했습니다.</span>;
  if (!count) return <span className="text-[11px] text-[#8a90a3]">자리가 없습니다.</span>;
  if (!itinerary) {
    return (
      <span className="text-[11px] text-[#c0392b]">
        경로를 만들 수 없습니다 — 지도에 없는 매장이 섞였습니다.
      </span>
    );
  }
  return (
    <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-[#687087]">
      <span className="font-bold text-brand">{itinerary.stopPlaceIds.length}곳</span>
      <span>{(itinerary.floorIds || []).join(" → ")}</span>
      <span className="text-[#c9cdd8]">·</span>
      <span>층 이동 {itinerary.connectorSteps?.length ?? 0}회</span>
    </span>
  );
}

export function AdminCourseEditor({ detail, onClose }) {
  // `|| {}` 를 렌더마다 새로 만들면 아래 useMemo·useCallback 의 의존성이 매번 바뀐다.
  const original = useMemo(() => detail?.payload || {}, [detail]);

  const [reply, setReply] = useState(original.reply || "");
  const [places, setPlaces] = useState(() => original.places || []);
  const [selected, setSelected] = useState(null);
  const [adding, setAdding] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const [notice, setNotice] = useState("");
  const [optimizing, setOptimizing] = useState(false);

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
      JSON.stringify(places) !== JSON.stringify(original.places || []),
    [reply, places, original],
  );

  const changeSlot = useCallback((index, path, value) => {
    setPlaces((rows) => rows.map((row, i) => (i === index ? withField(row, path, value) : row)));
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

  // JSON 은 **누를 때만** 만든다. 렌더마다 만들면 조사 원문까지 직렬화하느라 입력이 밀린다.
  const buildJson = useCallback(
    () => JSON.stringify({ ...original, reply, places }, null, 2),
    [original, reply, places],
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
    link.download = `draft-${detail?.celebrity || "course"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [buildJson, detail]);

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
                place={selectedPlace}
                index={selected}
                catalog={catalog}
                usedKeys={navigationKeys}
                onChange={changeSlot}
                onBack={() => setSelected(null)}
              />
            </div>
          ) : (
            <>
              <CourseNavigationMap
                route={route.itinerary}
                routeFloorIds={route.itinerary?.floorIds}
                routeGraph={route.graph}
                initialView="route"
                variant="course"
                showFloorSelector
                showControls
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex flex-wrap items-center gap-2 bg-gradient-to-t from-black/25 to-transparent px-4 pb-3 pt-8">
                <span className="pointer-events-auto rounded-full bg-white/95 px-3 py-1.5 shadow-sm">
                  <RouteSummary
                    itinerary={route.itinerary}
                    error={route.error}
                    loading={route.loading}
                    count={navigationKeys.length}
                  />
                </span>
              </div>
            </>
          )}
        </div>

        <div className="order-2 min-h-0 overflow-y-auto px-5 py-5 lg:order-1">
          <p className="mb-4 rounded-xl bg-[#fff8ea] px-4 py-3 text-xs leading-5 text-[#856c3a]">
            <b>여기서 고친 것은 저장되지 않습니다.</b> 초안을 고치는 창구가 아직 없어(읽기와
            삭제만 있습니다) 닫으면 사라집니다. 결과는 아래 <b>JSON 내보내기</b>로 가져가세요.
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
        <span className="ml-auto text-[11px] text-[#9aa0b0]">
          자리 {places.length}/{MAX_PLACES}곳 · 경고 {original.warnings?.length || 0}건
        </span>
      </footer>
    </div>
  );
}
