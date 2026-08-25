"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CourseNavigationMap } from "@/components/navigation/course-navigation-map";
import { calculateCourseRoute } from "@/lib/navigation/course-routing-service";
import { WarningPanel, formatAdminDate } from "./admin-artifact-ui";
import { AdminCoursePlacePicker } from "./admin-course-place-picker";

// 초안 하나를 관리자가 손으로 고치는 편집기. /ai-course 의 코스 스튜디오와 같은 짜임이다 —
// 한쪽에 코스 목록, 한쪽에 실내 지도와 경로. 다른 것은 화면을 통째로 바꾸지 않고
// 팝업 안에서만 산다는 것이고, 그래서 관리자가 목록으로 돌아오는 비용이 없다.
//
// **편집은 저장되지 않는다.** 백엔드에도 람다에도 초안을 고치는 창구가 아직 없다
// (읽기와 삭제만 있다). 결과를 JSON 으로 내보내 승인 람다에 넘기는 데까지가 지금의 끝이고,
// 화면 위쪽이 그 사실을 계속 말해 준다.

const KIND_STYLE = {
  매장: "bg-[#eee9ff] text-brand",
  음식점: "bg-[#ffeef2] text-[#c53a63]",
  카페: "bg-[#fff2e2] text-[#a5650f]",
  여가: "bg-[#e6f6ef] text-[#12804b]",
};

const KIND_OPTIONS = ["매장", "음식점", "카페", "여가"];

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

function SlotPhoto({ image, alt }) {
  const [failed, setFailed] = useState(false);
  if (!image?.url || failed) {
    return (
      <span className="flex size-[92px] shrink-0 items-center justify-center rounded-xl border border-dashed border-[#dfe2ec] bg-[#f7f8fb] text-[11px] font-bold text-[#c0392b]">
        사진 없음
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={image.url}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className="size-[92px] shrink-0 rounded-xl border border-[#e6e8f0] bg-[#f6f7fb] object-cover"
    />
  );
}

function SlotCard({
  place,
  index,
  total,
  open,
  onToggleOpen,
  onChange,
  onMove,
  onRemove,
  dragging,
  dropTarget,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}) {
  const [picking, setPicking] = useState(false);
  const image = place.image || {};
  const evidence = place.evidence || {};

  const setField = (path, value) => onChange(path, value);

  return (
    <li
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`relative flex gap-3 ${dragging ? "opacity-45" : ""}`}
    >
      <div className="flex flex-col items-center pt-1">
        <span className="flex size-8 items-center justify-center rounded-full border-2 border-[#dcd4fb] bg-white text-xs font-black text-brand">
          {index + 1}
        </span>
        {index < total - 1 ? <span className="mt-1 w-px flex-1 bg-[#e3e0f5]" /> : null}
      </div>

      <article
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        aria-roledescription="드래그하여 순서를 바꿀 수 있는 자리"
        className={`mb-3 min-w-0 flex-1 cursor-grab rounded-2xl border border-[#e5e7ef] bg-white p-4 shadow-[0_6px_20px_rgba(31,36,66,0.04)] transition active:cursor-grabbing ${
          dropTarget ? "outline outline-2 outline-dashed outline-offset-2 outline-brand" : ""
        }`}
      >
        <div className="flex gap-3">
          <SlotPhoto image={image} alt={image.caption || place.place_name} />

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <strong className="text-[15px] text-[#20243a]">{place.place_name}</strong>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  KIND_STYLE[place.kind] || "bg-[#f3f4f7] text-[#777d90]"
                }`}
              >
                {place.kind}
              </span>
            </div>
            <p className="mt-1 font-mono text-[10px] text-[#a3a8b8]">{place.navigation_key}</p>
            <p className="mt-0.5 text-[11px] text-[#9aa0b0]">
              {[place.floor, place.place_type, place.category, place.price_tier]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <p className="mt-2 line-clamp-2 text-[12.5px] leading-5 text-[#4c5164]">
              {place.reason}
            </p>
            {evidence.brand ? (
              <p className="mt-1.5 text-[11px] font-bold text-brand">
                {evidence.person ? `${evidence.person} × ` : ""}
                {evidence.brand}
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 flex-col gap-1">
            <button
              type="button"
              onClick={() => onMove(index - 1)}
              disabled={index === 0}
              aria-label="한 칸 위로"
              className="rounded-lg border border-[#e3e6ef] bg-white px-2 py-1 text-xs text-[#6d7387] hover:border-brand hover:text-brand disabled:opacity-30"
            >
              ↑
            </button>
            <button
              type="button"
              onClick={() => onMove(index + 1)}
              disabled={index === total - 1}
              aria-label="한 칸 아래로"
              className="rounded-lg border border-[#e3e6ef] bg-white px-2 py-1 text-xs text-[#6d7387] hover:border-brand hover:text-brand disabled:opacity-30"
            >
              ↓
            </button>
            <button
              type="button"
              onClick={onRemove}
              aria-label="이 자리 빼기"
              className="rounded-lg border border-[#f3d8da] bg-white px-2 py-1 text-xs text-[#c0392b] hover:bg-[#fff5f5]"
            >
              ✕
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#eff1f6] pt-3">
          <button
            type="button"
            onClick={onToggleOpen}
            className="rounded-lg border border-[#dfe2ec] bg-white px-3 py-1.5 text-[11px] font-bold text-[#4d536a] hover:border-brand hover:text-brand"
          >
            {open ? "편집 접기" : "사유 · 근거 · 사진 편집"}
          </button>
          <button
            type="button"
            onClick={() => setPicking((value) => !value)}
            className="rounded-lg border border-[#dfe2ec] bg-white px-3 py-1.5 text-[11px] font-bold text-[#4d536a] hover:border-brand hover:text-brand"
          >
            {picking ? "매장 고르기 닫기" : "매장 교체"}
          </button>
          {evidence.article ? (
            <a
              href={evidence.article}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-semibold text-[#6f55d9] hover:underline"
            >
              근거 기사 · {hostOf(evidence.article)}
            </a>
          ) : null}
        </div>

        {picking ? (
          <div className="mt-3">
            <AdminCoursePlacePicker
              slot={place}
              alternates={place.alternates || []}
              onPick={(picked) => {
                setField("__replace__", picked);
                setPicking(false);
              }}
              onClose={() => setPicking(false)}
            />
          </div>
        ) : null}

        {open ? (
          <div className="mt-3 grid gap-3 rounded-2xl bg-[#f9fafd] p-4 xl:grid-cols-2">
            <div className="xl:col-span-2">
              <Field
                label="추천 사유"
                hint="손님에게 그대로 나가는 문장"
                value={place.reason}
                onChange={(value) => setField("reason", value)}
                multiline
              />
            </div>

            <label className="block">
              <span className="mb-1 block text-[11px] font-bold tracking-[0.04em] text-[#4d536a]">
                분류
              </span>
              <select
                value={place.kind || ""}
                onChange={(event) => setField("kind", event.target.value)}
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
                onChange={(event) => setField("reason_kind", event.target.value)}
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
              onChange={(value) => setField("evidence.person", value)}
              placeholder="카리나"
            />
            <Field
              label="근거 브랜드"
              hint="바꾸면 캡션도 같이 손봐야 한다"
              value={evidence.brand}
              onChange={(value) => setField("evidence.brand", value)}
              placeholder="프라다"
            />

            <div className="xl:col-span-2">
              <Field
                label="근거 문장"
                hint="기사에서 뽑은 사실"
                value={evidence.sentence}
                onChange={(value) => setField("evidence.sentence", value)}
                multiline
              />
            </div>
            <div className="xl:col-span-2">
              <Field
                label="근거 기사 URL"
                value={evidence.article}
                onChange={(value) => setField("evidence.article", value)}
                placeholder="https://…"
              />
            </div>

            <div className="mt-1 border-t border-[#e6e8f0] pt-3 xl:col-span-2">
              <Field
                label="사진 URL"
                hint="비우면 사진 없음으로 나간다"
                value={image.url}
                onChange={(value) => setField("image.url", value)}
                placeholder="https://…"
              />
            </div>
            <Field
              label="사진 캡션"
              hint="카리나 × 프라다"
              value={image.caption}
              onChange={(value) => setField("image.caption", value)}
              placeholder="카리나 × 프라다"
            />
            <Field
              label="사진 출처"
              hint="사진이 놓인 호스트"
              value={image.source}
              onChange={(value) => setField("image.source", value)}
              placeholder="elle.co.kr"
            />
            <div className="xl:col-span-2">
              <Field
                label="사진이 실린 기사 URL"
                value={image.article}
                onChange={(value) => setField("image.article", value)}
                placeholder="https://…"
              />
            </div>
            <label className="block xl:col-span-2">
              <span className="mb-1 block text-[11px] font-bold tracking-[0.04em] text-[#4d536a]">
                사진 종류
              </span>
              <select
                value={image.kind || ""}
                onChange={(event) => setField("image.kind", event.target.value)}
                className="w-full rounded-xl border border-[#dfe2ec] bg-white px-3 py-2 text-[13px] text-[#20243a] outline-none focus:border-brand"
              >
                <option value="">없음</option>
                <option value="evidence">근거 사진</option>
                <option value="place">매장 사진</option>
                <option value="manual">관리자가 직접</option>
              </select>
            </label>
          </div>
        ) : null}
      </article>
    </li>
  );
}

// 자리 하나에 점 표기(`evidence.person`)로 값을 넣는다. 없던 칸도 만들어 준다.
function withField(place, path, value) {
  if (path === "__replace__") {
    // 매장을 갈면 **근거는 그대로 두고** 매장 정보만 바꾼다. 근거 사진은 뗀다 —
    // 남의 브랜드 사진이 새 매장에 붙는 것이 이 배치가 실제로 냈던 사고다.
    const keepEvidencePhoto =
      place.image?.kind === "evidence" &&
      place.evidence?.brand &&
      String(value.place_name).includes(place.evidence.brand);
    return {
      ...place,
      navigation_key: value.navigation_key,
      place_name: value.place_name,
      floor: value.floor ?? place.floor,
      place_type: value.place_type ?? place.place_type,
      category: value.category ?? place.category,
      price_tier: value.price_tier ?? place.price_tier,
      image: keepEvidencePhoto
        ? place.image
        : value.image_url
          ? { kind: "place", url: value.image_url, source: "더현대 서울", caption: value.place_name }
          : null,
    };
  }

  const [head, tail] = path.split(".");
  if (!tail) return { ...place, [head]: value };
  return { ...place, [head]: { ...(place[head] || {}), [tail]: value } };
}

/**
 * 코스의 실내 경로. 자리를 바꿀 때마다 다시 계산한다 — 관리자가 동선을 고치는 것이
 * 이 화면의 요지라, 지도가 그 결과를 바로 보여 주지 않으면 고쳐도 알 수가 없다.
 *
 * 계산은 전부 브라우저에서 돈다(`course-routing-service` 가 로컬 원장 JSON 을 읽는다).
 * 백엔드도 람다도 안 부른다.
 */
function useCourseRoute(navigationKeys) {
  const routeKey = navigationKeys.join(">");
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
    loading: navigationKeys.length > 0 && !fresh,
  };
}

function RouteSummary({ itinerary, error, loading, count }) {
  if (loading) {
    return <span className="text-[11px] text-[#8a90a3]">경로 계산 중…</span>;
  }
  if (error) {
    return <span className="text-[11px] text-[#c0392b]">경로를 계산하지 못했습니다.</span>;
  }
  if (!count) {
    return <span className="text-[11px] text-[#8a90a3]">자리가 없습니다.</span>;
  }
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
  const [openSlot, setOpenSlot] = useState(null);
  const [dragIndex, setDragIndex] = useState(null);
  const [dropIndex, setDropIndex] = useState(null);
  const [copied, setCopied] = useState("");

  const dirty =
    reply !== (original.reply || "") ||
    JSON.stringify(places) !== JSON.stringify(original.places || []);

  const edited = useMemo(() => ({ ...original, reply, places }), [original, reply, places]);

  const navigationKeys = useMemo(
    () => places.map((place) => place.navigation_key).filter(Boolean),
    [places],
  );
  const route = useCourseRoute(navigationKeys);

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
  }, []);

  const removeSlot = useCallback((index) => {
    setPlaces((rows) => rows.filter((_, i) => i !== index));
    setOpenSlot(null);
  }, []);

  const reset = useCallback(() => {
    setReply(original.reply || "");
    setPlaces(original.places || []);
    setOpenSlot(null);
  }, [original]);

  const json = useMemo(() => JSON.stringify(edited, null, 2), [edited]);

  const copyJson = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(json);
      setCopied("복사했습니다");
    } catch {
      setCopied("복사에 실패했습니다 — 아래 원문을 직접 긁어 가세요");
    }
  }, [json]);

  const downloadJson = useCallback(() => {
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `draft-${detail?.celebrity || "course"}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [json, detail]);

  const shape = useMemo(() => {
    const counts = places.reduce((acc, place) => {
      acc[place.kind] = (acc[place.kind] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts)
      .map(([kind, count]) => `${kind} ${count}`)
      .join(" · ");
  }, [places]);

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

      {/* /ai-course 의 코스 스튜디오와 같은 짜임 — 한쪽에 목록, 한쪽에 지도. */}
      <div className="grid min-h-0 flex-1 grid-rows-[280px_minmax(0,1fr)] lg:grid-cols-[minmax(400px,40%)_minmax(0,1fr)] lg:grid-rows-1">
        <div className="relative order-1 min-h-0 border-b border-[#eceef4] bg-[#F7F3EF] lg:order-2 lg:border-b-0 lg:border-l">
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
        </div>

        <div className="order-2 min-h-0 overflow-y-auto px-6 py-5 lg:order-1">
          <p className="mb-4 rounded-xl bg-[#fff8ea] px-4 py-3 text-xs leading-5 text-[#856c3a]">
            <b>여기서 고친 것은 저장되지 않습니다.</b> 초안을 고치는 창구가 아직 없어(읽기와
            삭제만 있습니다) 닫으면 사라집니다. 결과는 아래 <b>JSON 내보내기</b>로 가져가세요.
          </p>

          <label className="mb-5 block">
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

          <ol className="mt-5">
            {places.map((place, index) => (
              <SlotCard
                key={place.slot_id ?? place.navigation_key ?? index}
                place={place}
                index={index}
                total={places.length}
                open={openSlot === index}
                onToggleOpen={() => setOpenSlot((value) => (value === index ? null : index))}
                onChange={(path, value) => changeSlot(index, path, value)}
                onMove={(to) => moveSlot(index, to)}
                onRemove={() => removeSlot(index)}
                dragging={dragIndex === index}
                dropTarget={dropIndex === index && dragIndex !== index}
                onDragStart={() => setDragIndex(index)}
                onDragEnd={() => {
                  setDragIndex(null);
                  setDropIndex(null);
                }}
                onDragOver={(event) => {
                  event.preventDefault();
                  setDropIndex(index);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  if (dragIndex !== null) moveSlot(dragIndex, index);
                  setDragIndex(null);
                  setDropIndex(null);
                }}
              />
            ))}
          </ol>

          {!places.length ? (
            <p className="rounded-2xl border border-dashed border-[#dfe2ec] p-10 text-center text-sm text-[#9095a6]">
              자리가 없습니다. 초안 상태와 경고에 사유가 있습니다.
            </p>
          ) : null}

          <details className="mt-5 rounded-2xl border border-[#e5e7ef] bg-white px-5 py-4">
            <summary className="cursor-pointer text-sm font-bold text-[#4d536a]">
              내보낼 JSON 원문
            </summary>
            <pre className="mt-3 max-h-[320px] overflow-auto rounded-xl bg-[#f7f8fb] p-4 text-[11px] leading-5 text-[#4c5164]">
              {json}
            </pre>
          </details>

          {original.research ? (
            <details className="mt-3 rounded-2xl border border-[#e5e7ef] bg-white px-5 py-4">
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
          onClick={reset}
          disabled={!dirty}
          className="rounded-xl border border-[#dfe2ec] bg-white px-4 py-2 text-xs font-bold text-[#4d536a] hover:border-brand hover:text-brand disabled:opacity-40"
        >
          처음으로 되돌리기
        </button>
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
          className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-[0_10px_25px_rgba(92,46,245,0.22)]"
        >
          JSON 내려받기
        </button>
        {copied ? <span className="text-xs text-[#687087]">{copied}</span> : null}
        <span className="ml-auto text-[11px] text-[#9aa0b0]">
          자리 {places.length}곳 · 경고 {original.warnings?.length || 0}건
        </span>
      </footer>
    </div>
  );
}
