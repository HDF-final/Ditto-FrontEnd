"use client";

import { useCallback, useMemo, useState } from "react";

import { isCelebPhoto, toImageKey } from "@/lib/courses/hero-image";
import { CourseNavigationMap } from "@/components/navigation/course-navigation-map";
import { updateSystemCourse } from "@/lib/api/admin-system-courses";
import { COUNTRY_META, WarningPanel, formatAdminDate } from "./admin-artifact-ui";
import { resolveNavigationKey, useCourseRoute, usePlaceCatalog } from "./admin-course-map";

// **기본 추천 코스 하나를 고치는 편집기.** 캐시된 코스 편집기와 같은 짜임이다 —
// 한쪽에 코스, 한쪽에 실내 지도. 관리자가 두 화면을 오갈 때 손이 같은 자리를 찾는다.
//
// 다른 것이 둘이다.
//
//   고칠 수 있는 것   문안과 나라뿐이다. 자리 구성(어느 매장을 몇 번째로)은 이 창구가
//                     안 받는다 — 갈려면 셀럽 편집기에서 다시 승인해 덮어쓴다.
//   지도의 쓰임       보여 주기만 한다. 여기서 동선을 고칠 수 없으니, 지도는 "지금
//                     걸려 있는 코스가 이렇게 돈다"를 확인하는 자리다.
//
// **지도에 쓸 navigation_key 는 프론트에서 잇는다.** 백엔드는 place_id 만 주는데 지도는
// navigation_key 로만 그려진다. 로컬 원장 + /places/navigation 이 그 표를 갖고 있다
// (`admin-course-map`). 못 이은 자리는 지도에서만 빠지고 목록에는 그대로 남는다.

const INPUT_CLASS =
  "w-full rounded-xl border border-[#dfe2ec] bg-white px-3 py-2 text-[13px] leading-6 text-[#20243a] outline-none focus:border-brand";

function Field({ label, hint, children }) {
  return (
    <label className="mb-4 block">
      <span className="mb-1 flex flex-wrap items-baseline gap-2">
        <span className="text-[11px] font-bold tracking-[0.04em] text-[#4d536a]">{label}</span>
        {hint ? <span className="text-[10px] text-[#9aa0b0]">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

/** 자리 썸네일. 실패한 주소를 기억한다 — 참/거짓으로 두면 자리를 옮겨도 계속 빈 자리다. */
function Thumb({ url, alt }) {
  const [failedUrl, setFailedUrl] = useState(null);
  if (!url || failedUrl === url) {
    return (
      <span className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-[#f1f2f6] text-[10px] font-bold text-[#9aa0b0]">
        사진
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
      className="size-12 shrink-0 rounded-lg border border-[#eceef4] object-cover"
    />
  );
}

/**
 * 자리 하나. **누르면 지도가 그 자리의 층만 남긴다.**
 *
 * 카메라를 그 매장으로 날려 보내는 창구는 지도가 안 열어 뒀다. 층을 좁히는 것은 지도를
 * 다시 마운트하지 않아 끊김이 없고, 6층 코스에서 1층 자리를 확인할 때 실제로 필요한 것이
 * "그 층만 보기" 라 이걸로 충분하다.
 */
/**
 * 코스의 얼굴을 고른다. 어드민 카드·손님 추천 리스트·코스 상세가 이 사진을 같이 쓴다.
 *
 * **미리보기가 고른 값을 즉시 따라간다.** 예전에는 서버가 준 `mainImageUrl` 을 그렸는데,
 * 그건 *저장된* 값이라 다른 사진을 누르는 순간 화면이 비었다 — 지금 코스는 전부 기본값
 * (NULL)이라 늘 비었다. 무엇을 고른 건지 확인할 방법이 없는 상태였다.
 *
 * **셀럽 사진과 매장 사진을 구별해 보여준다.** 둘 다 그냥 사진으로 보이면 관리자는
 * 어느 것이 그 인물의 근거 사진인지 알 수 없다. 기본값이 셀럽 사진을 먼저 고르므로,
 * 화면도 같은 것을 알려 줘야 고르는 판단이 선다.
 */
function HeroPicker({ slots, mainImage, savedKey, savedUrl, defaultUrl, onChange }) {
  const [draft, setDraft] = useState(mainImage);
  const [error, setError] = useState(null);

  // 썸네일을 누르거나 "기본값으로" 를 눌러 밖에서 값이 바뀌면 입력칸도 따라가야 한다.
  // 효과로 맞추면 렌더가 한 번 더 도는 데다, 그 사이 한 프레임 동안 입력칸이 옛 값을
  // 들고 있다. **바뀐 것을 알아차린 그 렌더에서 바로 맞춘다** — React 가 권하는 쪽이다.
  const [syncedTo, setSyncedTo] = useState(mainImage);
  if (mainImage !== syncedTo) {
    setSyncedTo(mainImage);
    setDraft(mainImage);
    setError(null);
  }

  const picked = slots.find((slot) => slot.imageKey && slot.imageKey === mainImage);
  // 자리에 없는 키를 손으로 넣었을 때, 서버가 준 주소는 **저장된 키의 것**이라
  // 지금 고른 것과 다르면 쓰면 안 된다. 그때는 미리보기를 비우고 그렇다고 말한다.
  const previewUrl = mainImage
    ? (picked?.imageUrl ?? (mainImage === savedKey ? savedUrl : null))
    : defaultUrl;
  // 기본값이 고르는 차례와 같다 — 셀럽 사진이 먼저, 없으면 첫 자리 사진.
  const defaultSlot =
    slots.find((slot) => isCelebPhoto(slot.imageKey)) || slots.find((slot) => slot.imageUrl);

  const commit = (value) => {
    const { key, error: err } = toImageKey(value, slots);
    setError(err);
    if (!err) onChange(key);
  };

  return (
    <div className="mb-4">
      <span className="mb-1 flex flex-wrap items-baseline gap-2">
        <span className="text-[11px] font-bold tracking-[0.04em] text-[#4d536a]">대표 사진</span>
        <span className="text-[10px] text-[#9aa0b0]">
          어드민 카드 · 추천 리스트 · 코스 상세가 같은 사진을 씁니다
        </span>
      </span>

      <div className="flex gap-3">
        <div className="shrink-0">
          {previewUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={previewUrl}
              alt="대표 사진 미리보기"
              className="size-24 rounded-xl border border-[#eceef4] object-cover"
            />
          ) : (
            <span className="flex size-24 items-center justify-center rounded-xl border border-dashed border-[#dfe2ec] bg-[#f8f9fc] px-2 text-center text-[10px] font-bold leading-4 text-[#9aa0b0]">
              저장하면 보입니다
            </span>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold text-[#4d536a]">
            {mainImage ? (
              <>
                {isCelebPhoto(mainImage) ? "셀럽 사진" : "매장 사진"}
                {picked ? (
                  <span className="font-medium text-[#9aa0b0]">
                    {" · "}
                    {picked.visitOrder}번 {picked.name}
                  </span>
                ) : (
                  <span className="font-medium text-[#9aa0b0]"> · 자리 밖에서 지정</span>
                )}
              </>
            ) : (
              <>
                기본값 사용 중
                {defaultSlot ? (
                  <span className="font-medium text-[#9aa0b0]">
                    {" · "}
                    {defaultSlot.visitOrder}번 {defaultSlot.name}의{" "}
                    {isCelebPhoto(defaultSlot.imageKey) ? "셀럽 사진" : "매장 사진"}
                  </span>
                ) : null}
              </>
            )}
          </p>

          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={(event) => commit(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                commit(event.currentTarget.value);
              }
            }}
            placeholder={defaultSlot?.imageKey || "자리 사진에서 고르세요"}
            aria-label="대표 사진 키"
            aria-invalid={error ? "true" : undefined}
            className={`mt-1.5 w-full rounded-lg border px-2.5 py-1.5 font-mono text-[11px] text-[#171b30] outline-none ${
              error ? "border-[#d98a95] focus:border-[#b3384f]" : "border-[#dfe2ec] focus:border-brand"
            }`}
          />
          {error ? (
            <p className="mt-1 text-[10px] font-bold leading-4 text-[#b3384f]">{error}</p>
          ) : null}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {slots.map((slot) =>
              slot.imageUrl ? (
                <button
                  key={slot.placeId}
                  type="button"
                  onClick={() => onChange(slot.imageKey || "")}
                  disabled={!slot.imageKey}
                  title={`${slot.visitOrder}번 ${slot.name}${
                    isCelebPhoto(slot.imageKey) ? " · 셀럽 사진" : " · 매장 사진"
                  }`}
                  aria-pressed={Boolean(slot.imageKey) && slot.imageKey === mainImage}
                  className={`relative overflow-hidden rounded-md border transition disabled:opacity-40 ${
                    slot.imageKey && slot.imageKey === mainImage
                      ? "border-brand ring-2 ring-brand/25"
                      : "border-[#e6e8f0] hover:border-brand"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={slot.imageUrl} alt="" loading="lazy" className="size-11 object-cover" />
                  <span className="absolute left-0 top-0 bg-[#171b30]/70 px-1 text-[9px] font-bold text-white">
                    {slot.visitOrder}
                  </span>
                  {isCelebPhoto(slot.imageKey) ? (
                    <span className="absolute bottom-0 right-0 bg-brand px-1 text-[9px] font-bold text-white">
                      셀럽
                    </span>
                  ) : null}
                </button>
              ) : null,
            )}
            {mainImage ? (
              <button
                type="button"
                onClick={() => onChange("")}
                className="rounded-lg border border-[#dfe2ec] bg-white px-2 py-1 text-[10px] font-bold text-[#4d536a] hover:border-brand hover:text-brand"
              >
                기본값으로
              </button>
            ) : null}
          </div>

          <p className="mt-1.5 text-[10px] leading-4 text-[#9aa0b0]">
            비우면 기본값으로 돌아갑니다 — 셀럽 사진이 있으면 그것, 없으면 첫 자리 사진입니다.
          </p>
        </div>
      </div>
    </div>
  );
}

function SlotRow({ slot, index, active, onSelect, reason, onReasonChange }) {
  return (
    <li
      className={`rounded-xl border p-2.5 transition ${
        active ? "border-brand bg-[#faf9ff]" : "border-[#eef0f5] bg-white"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(active ? null : index)}
        className="flex w-full items-center gap-3 text-left"
        aria-pressed={active}
      >
        <span
          className={`flex size-7 shrink-0 items-center justify-center rounded-full text-[11px] font-black ${
            active ? "bg-brand text-white" : "bg-[#eef0f8] text-[#4a5170]"
          }`}
        >
          {slot.visitOrder}
        </span>
        <Thumb url={slot.imageUrl} alt={slot.name} />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[13px] font-bold text-[#171b30]">{slot.name}</span>
          <span className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#9aa0b0]">
            <span className="font-semibold text-[#6d7387]">{slot.floorCode}</span>
            {slot.navigationKey ? (
              <span className="font-mono text-[10px] text-[#adb2c0]">{slot.navigationKey}</span>
            ) : (
              <span className="rounded-full bg-[#fff1f2] px-1.5 py-0.5 text-[10px] font-bold text-[#b3384f]">
                지도에 못 그림
              </span>
            )}
          </span>
        </span>
        <span className="shrink-0 text-[10px] font-bold text-[#c0c4d2]">
          {active ? "지도 전체" : "지도에서 보기"}
        </span>
      </button>

      {/*
        **추천 사유다. 꼬리표가 아니다.**

        예전에는 한 줄짜리 `<input>` 이었다. 그때는 반영 람다가 LLM 으로 15~30자 딱지를
        지어 넣었기 때문인데("제니가 글로벌 앰배서더로 있는 브랜드"), 지금은 승인 화면에서
        확정한 원문이 그대로 저장된다 — 기사 요약과 "그래서 이 자리를 담았다" 가 든 몇
        문장이다. 한 줄 칸에 두면 관리자가 쓸 수 있는 길이를 UI 가 막는다.

        손님이 코스 상세에서 자리를 누르면 여기 적힌 글이 그대로 뜬다.
      */}
      <textarea
        value={reason}
        onChange={(event) => onReasonChange(slot.placeId, event.target.value)}
        rows={4}
        placeholder="이 자리를 담은 이유. 손님이 자리를 누르면 이 글이 그대로 보입니다."
        className="mt-2 w-full resize-y rounded-lg border border-[#dfe2ec] px-2.5 py-1.5 text-[12px] leading-[1.6] text-[#171b30] outline-none focus:border-brand"
      />
      <p className="mt-1 text-right text-[10px] text-[#adb2c0]">
        {reason.trim().length}자
        {reason.trim().length > 0 && reason.trim().length < 40 ? (
          <span className="ml-1 text-[#b3384f]">
            — 옛 꼬리표만 남은 자리일 수 있습니다
          </span>
        ) : null}
      </p>
    </li>
  );
}

export function AdminSystemCourseEditor({ detail, onClose, onSaved }) {
  const [name, setName] = useState(detail.name || "");
  const [description, setDescription] = useState(detail.description || "");
  const [countryCodes, setCountryCodes] = useState(() =>
    Array.isArray(detail.countryCodes) ? detail.countryCodes : [],
  );
  // 관리자가 직접 고른 대표 사진의 S3 키. **빈 문자열이 "기본값을 쓴다"** 는 뜻이다.
  const [mainImage, setMainImage] = useState(detail.mainImage || "");
  const [postContent, setPostContent] = useState(detail.postContent || "");
  const [reasons, setReasons] = useState(() =>
    Object.fromEntries(
      (detail.places || []).map((place) => [place.placeId, place.recommendationReason || ""]),
    ),
  );
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const catalog = usePlaceCatalog();

  // 자리마다 navigation_key 를 붙인다. 원장이 아직 안 왔으면 전부 null 이고, 그때는
  // 지도가 빈 채로 뜬다 — 잠깐이고, 목록은 그 사이에도 고칠 수 있어야 한다.
  const slots = useMemo(
    () =>
      (detail.places || []).map((place) => ({
        ...place,
        navigationKey: catalog.loading ? null : resolveNavigationKey(catalog, place),
      })),
    [detail.places, catalog],
  );

  const navigationKeys = useMemo(
    () => slots.map((slot) => slot.navigationKey).filter(Boolean),
    [slots],
  );
  const routeKey = navigationKeys.join(">");
  const route = useCourseRoute(routeKey);

  const unmapped = slots.length - navigationKeys.length;

  // 자리를 고르면 그 층만, 안 골랐으면 경로가 닿는 층 전부.
  const selectedSlot = selected === null ? null : slots[selected];
  const routeFloorIds = useMemo(
    () =>
      selectedSlot?.floorCode ? [selectedSlot.floorCode] : (route.itinerary?.floorIds ?? undefined),
    [selectedSlot, route.itinerary],
  );

  const nameTrimmed = name.trim();
  const nameEmpty = !nameTrimmed;
  const nameTooLong = nameTrimmed.length > 100;

  const dirty =
    name !== (detail.name || "") ||
    description !== (detail.description || "") ||
    countryCodes.join(",") !== (detail.countryCodes || []).join(",") ||
    mainImage !== (detail.mainImage || "") ||
    postContent !== (detail.postContent || "") ||
    (detail.places || []).some(
      (place) => (reasons[place.placeId] ?? "") !== (place.recommendationReason || ""),
    );

  const changeReason = useCallback((placeId, value) => {
    setReasons((prev) => ({ ...prev, [placeId]: value }));
  }, []);

  const reset = useCallback(() => {
    setName(detail.name || "");
    setDescription(detail.description || "");
    setCountryCodes(Array.isArray(detail.countryCodes) ? detail.countryCodes : []);
    setMainImage(detail.mainImage || "");
    setPostContent(detail.postContent || "");
    setReasons(
      Object.fromEntries(
        (detail.places || []).map((place) => [place.placeId, place.recommendationReason || ""]),
      ),
    );
    setError(null);
  }, [detail]);

  const save = useCallback(async () => {
    if (saving || nameEmpty || nameTooLong) return;
    setSaving(true);
    setError(null);
    try {
      const saved = await updateSystemCourse(detail.courseId, {
        name: nameTrimmed,
        description,
        countryCodes,
        mainImage,
        postContent,
        places: Object.entries(reasons).map(([placeId, recommendationReason]) => ({
          placeId: Number(placeId),
          recommendationReason,
        })),
      });
      onSaved(saved);
    } catch (nextError) {
      setError(nextError);
    } finally {
      setSaving(false);
    }
  }, [saving, nameEmpty, nameTooLong, detail.courseId, nameTrimmed, description, countryCodes,
      mainImage, postContent, reasons, onSaved]);

  return (
    <div className="flex h-[92dvh] flex-col">
      <header className="flex flex-wrap items-center gap-3 border-b border-[#eceef4] px-6 py-4">
        <h2 id="system-course-editor" className="truncate text-lg font-bold text-[#171b30]">
          {detail.name || "이름 없음"}
        </h2>
        <span className="rounded-full bg-[#e9f9f0] px-2.5 py-1 text-[11px] font-bold text-[#12804b]">
          기본 추천 코스
        </span>
        <span className="text-xs font-semibold text-[#687087]">
          #{detail.courseId}
          {detail.celebrity ? ` · ${detail.celebrity}` : ""}
          {detail.shareCode ? ` · ${detail.shareCode}` : ""}
        </span>
        <span className="h-3 w-px bg-[#dfe2eb]" />
        <span className="text-xs text-[#8a90a3]">
          올린 때 {formatAdminDate(detail.createdAt)}
        </span>
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

      {/* 캐시된 코스 편집기와 같은 짜임 — 한쪽에 코스, 한쪽에 지도. */}
      <div className="grid min-h-0 flex-1 grid-rows-[300px_minmax(0,1fr)] lg:grid-cols-[minmax(420px,38%)_minmax(0,1fr)] lg:grid-rows-1">
        <div className="relative order-1 min-h-0 border-b border-[#eceef4] bg-[#F7F3EF] lg:order-2 lg:border-b-0 lg:border-l">
          <CourseNavigationMap
            route={route.itinerary}
            routeFloorIds={routeFloorIds}
            routeGraph={route.graph}
            initialView="route"
            variant="course"
            showFloorSelector
            showControls
          />
          {selectedSlot ? (
            <span className="pointer-events-none absolute left-4 top-4 z-10 rounded-full bg-white/95 px-3 py-1.5 text-[11px] font-bold text-[#4d536a] shadow-[0_4px_14px_rgba(20,24,45,0.14)]">
              {selectedSlot.visitOrder}. {selectedSlot.name} · {selectedSlot.floorCode} 층만 보는 중
            </span>
          ) : null}
        </div>

        <div className="order-2 min-h-0 overflow-y-auto px-5 py-5 lg:order-1">
          {/* 이 화면이 못 하는 것을 먼저 말해 준다. 지도를 붙여 놓으면 여기서 동선도
              고칠 수 있으리라고 읽히는데, 그 창구가 없다. */}
          <p className="mb-4 rounded-xl bg-[#f1f7f3] px-4 py-3 text-xs leading-5 text-[#2c6146]">
            <b>이 코스는 만료가 없습니다.</b> 내릴 때까지 메인·코스 추천 리스트에 계속
            걸립니다(커뮤니티에는 안 나옵니다). 여기서 고치는 것은 <b>문안과 나라</b>이고,
            저장하면 손님 화면에 바로 나갑니다. 어느 매장을 몇 번째로 넣을지는{" "}
            <b>승인 대기·저장된 코스</b> 화면의 편집기에서 고쳐 다시 승인하면 이 코스를
            덮어씁니다.
          </p>

          <Field label="코스 이름" hint="목록 카드와 코스 상세의 제목 · 100자까지">
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={`${INPUT_CLASS} ${nameEmpty || nameTooLong ? "border-[#d4485a]" : ""}`}
            />
            {nameTooLong ? (
              <span className="mt-1 block text-[11px] font-semibold text-[#a3323f]">
                {nameTrimmed.length}자 — 100자를 넘을 수 없습니다
              </span>
            ) : null}
            {nameEmpty ? (
              <span className="mt-1 block text-[11px] font-semibold text-[#a3323f]">
                이름이 비면 목록 카드가 제목 없이 그려집니다
              </span>
            ) : null}
          </Field>

          <Field label="한 줄 설명" hint="카드 밑에 붙는 문장">
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={2}
              className={INPUT_CLASS}
            />
          </Field>

          {/* **여러 나라를 걸 수 있다.** 손님 화면의 나라 버튼에 "전체" 가 없어서,
              하나도 안 고르면 어느 버튼에서도 안 보인다 — 사실상 내리는 것이다. */}
          <Field label="나라" hint="여러 나라를 고를 수 있습니다">
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(COUNTRY_META).map(([code, meta]) => {
                const on = countryCodes.includes(code);
                return (
                  <button
                    key={code}
                    type="button"
                    aria-pressed={on}
                    onClick={() =>
                      setCountryCodes((prev) =>
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
            {!countryCodes.length ? (
              <span className="mt-1.5 block text-[11px] font-semibold text-[#a3323f]">
                나라가 없으면 손님 화면의 어느 나라 버튼에서도 안 보입니다.
              </span>
            ) : null}
          </Field>

          <HeroPicker
            slots={slots}
            mainImage={mainImage}
            savedKey={detail.mainImage || ""}
            savedUrl={detail.mainImageUrl}
            defaultUrl={detail.heroImageUrl}
            onChange={setMainImage}
          />

          <Field label="코스 소개 문안" hint="코스를 소개하는 본문 · 커뮤니티에는 안 나갑니다">
            <textarea
              value={postContent}
              onChange={(event) => setPostContent(event.target.value)}
              rows={5}
              className={INPUT_CLASS}
              disabled={!detail.postId}
            />
            {!detail.postId ? (
              <span className="mt-1 block text-[11px] text-[#9aa0b0]">
                이 코스에는 소개 문안이 없습니다 (게시글이 안 붙어 있습니다)
              </span>
            ) : null}
          </Field>

          <div className="mt-5 flex flex-wrap items-baseline gap-2">
            <span className="text-[11px] font-bold tracking-[0.04em] text-[#4d536a]">
              자리 {slots.length}곳
            </span>
            <span className="text-[10px] text-[#9aa0b0]">
              누르면 지도가 그 층만 남깁니다 · 추천 이유는 15~30자가 적당합니다
            </span>
          </div>

          {/* 지도에 못 그린 자리가 있으면 알린다. 지도가 조용히 짧아지면 관리자가
              코스에서 자리가 빠진 줄 안다. */}
          {unmapped > 0 && !catalog.loading ? (
            <p className="mt-2 rounded-xl bg-[#fff9f9] px-3 py-2 text-[11px] leading-4 text-[#a3323f]">
              {unmapped}곳을 지도에 못 그렸습니다 — 실내 길찾기 원장에 없는 매장입니다.
              코스에는 그대로 남아 있고 손님 화면에도 나갑니다.
            </p>
          ) : null}
          {catalog.error ? (
            <p className="mt-2 rounded-xl bg-[#fff9f9] px-3 py-2 text-[11px] leading-4 text-[#a3323f]">
              길찾기 원장을 못 읽어 지도를 그리지 못했습니다 — 문안 수정은 그대로 됩니다.
            </p>
          ) : null}
          {route.error ? (
            <p className="mt-2 rounded-xl bg-[#fff9f9] px-3 py-2 text-[11px] leading-4 text-[#a3323f]">
              동선을 계산하지 못했습니다: {route.error.message || "알 수 없는 오류"}
            </p>
          ) : null}

          <ul className="mt-2 space-y-2">
            {slots.map((slot, index) => (
              <SlotRow
                key={slot.placeId}
                slot={slot}
                index={index}
                active={selected === index}
                onSelect={setSelected}
                reason={reasons[slot.placeId] ?? ""}
                onReasonChange={changeReason}
              />
            ))}
          </ul>

          {!slots.length ? (
            <p className="mt-2 rounded-2xl border border-dashed border-[#dfe2ec] p-10 text-center text-sm text-[#9095a6]">
              자리가 없는 코스입니다. 셀럽 편집기에서 다시 승인해 채우세요.
            </p>
          ) : null}

          <WarningPanel warnings={detail.warnings} label="반영할 때 남은 경고" />
        </div>
      </div>

      <footer className="flex flex-wrap items-center gap-2 border-t border-[#eceef4] bg-[#fafbfe] px-6 py-3.5">
        {error ? (
          <p className="w-full rounded-xl bg-[#fff9f9] px-3 py-2 text-[12px] text-[#a3323f]">
            {error.message || "저장에 실패했습니다."} — 목록을 새로고침해 반영됐는지
            확인하세요.
          </p>
        ) : null}
        <button
          type="button"
          onClick={reset}
          disabled={!dirty || saving}
          className="rounded-xl border border-[#dfe2ec] bg-white px-4 py-2 text-xs font-bold text-[#4d536a] hover:border-brand hover:text-brand disabled:opacity-40"
        >
          되돌리기
        </button>
        <button
          type="button"
          onClick={save}
          disabled={saving || nameEmpty || nameTooLong}
          className="rounded-xl bg-brand px-4 py-2 text-xs font-bold text-white shadow-[0_8px_20px_rgba(92,46,245,0.22)] disabled:bg-[#c9ccd8] disabled:opacity-60 disabled:shadow-none"
        >
          {saving ? "저장하는 중…" : "저장하고 바로 반영"}
        </button>
        <span className="ml-auto text-[11px] text-[#9aa0b0]">
          마지막 수정 {detail.updatedAt ? formatAdminDate(detail.updatedAt) : "없음"} · 저장하면
          손님 화면에 바로 나갑니다
        </span>
      </footer>
    </div>
  );
}
