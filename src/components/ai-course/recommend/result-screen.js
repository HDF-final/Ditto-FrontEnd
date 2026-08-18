"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { Plus, Zap, Save, RotateCcw, Check, Trash2 } from "./recommend-icons";
import { PanelChat } from "./boni-chat";
import { AddPlaceModal } from "./add-place-modal";
import { CourseLoadingOverlay } from "./course-loading-overlay";
import { CourseNavigationMap } from "@/components/navigation/course-navigation-map";
import {
  attachPlaceIdsToCourseDataset,
  calculateCourseRoute,
  loadCourseRoutingDataset,
  optimizeCourseRoute,
} from "@/lib/navigation/course-routing-service";
import { getNavigablePlaces } from "@/lib/api/place-navigation";
import {
  addCoursePlace,
  createCourse,
  deleteCoursePlace,
  updateCourse,
} from "@/lib/api/courses";

const MAX_COURSE_PLACES = 8;

function sameOrder(a, b) {
  return a.length === b.length && a.every((item, i) => item.id === b[i].id);
}

/**
 * 코스 편집 화면.
 *
 * 코스는 항상 빈 상태로 시작합니다. 자동 모드는 Boni 추천 응답(`chat.course`)이,
 * 수동 모드는 사용자의 '장소 추가'가 코스를 채웁니다. Boni 요청이 진행 중인
 * 동안(`chat.pending`)에는 화면 전체 버퍼링 오버레이가 덮이고, 응답이 오면 풀립니다.
 */
export function ResultScreen({ chat, onPlaceClick }) {
  const [items, setItems] = useState([]);
  const [placeCatalog, setPlaceCatalog] = useState([]);
  const [datasetStatus, setDatasetStatus] = useState("loading");
  const [routeState, setRouteState] = useState({
    status: "idle",
    itinerary: null,
    graph: null,
    floors: [],
  });
  const [preferences, setPreferences] = useState({
    excludeElevator: false,
    excludeEscalator: false,
  });
  const [notice, setNotice] = useState("");
  const [history, setHistory] = useState([]); // stack of previous orders for undo
  const [hoveredId, setHoveredId] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [courseTitle, setCourseTitle] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [visited, setVisited] = useState(() => new Set()); // ids marked "다녀옴"
  const [appliedCourse, setAppliedCourse] = useState(null); // 이미 반영한 Boni 코스
  const [savedCourse, setSavedCourse] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle");

  const dragIndex = useRef(null);
  const dragStartOrder = useRef(null);

  const aiCourse = chat?.course ?? null;
  const chatPending = chat?.pending ?? null;

  useEffect(() => {
    let active = true;
    Promise.all([
      loadCourseRoutingDataset(),
      getNavigablePlaces().catch((err) => {
        console.warn(
          "[ResultScreen] Backend places/navigation unavailable, using local dataset:",
          err?.message || err,
        );
        return [];
      }),
    ])
      .then(([dataset, navigationPlaces]) => {
        if (!active) return;
        const hydratedDataset = attachPlaceIdsToCourseDataset(
          dataset,
          navigationPlaces || [],
        );
        setPlaceCatalog(hydratedDataset.places);
        if (hydratedDataset.unmappedPlaceCount > 0 && (navigationPlaces?.length ?? 0) > 0) {
          setNotice(
            `${hydratedDataset.unmappedPlaceCount}개 매장의 DB 연결 정보가 없어 저장에서 제외됩니다.`,
          );
        }
        setDatasetStatus("ready");
      })
      .catch((error) => {
        if (active) {
          setDatasetStatus("error");
          setNotice(error.message || "장소 정보를 불러오지 못했습니다.");
        }
      });
    return () => {
      active = false;
    };
  }, []);

  // Boni가 새 코스를 내려줄 때마다 목록을 통째로 교체합니다. 되돌리기 스택과
  // 방문 체크는 이전 코스 기준이라 함께 비웁니다.
  // effect 대신 렌더 중 조정 패턴을 쓰는 이유: 응답 직후 한 번에 반영돼야
  // 버퍼링이 풀리는 프레임에서 이전 코스가 잠깐 비쳐 보이지 않습니다.
  if (aiCourse && aiCourse !== appliedCourse && datasetStatus === "ready") {
    const hydratedPlaces = aiCourse.places.map((place) => {
      const catalogPlace = placeCatalog.find(
        (candidate) => candidate.navigationKey === place.navigationKey,
      );
      // placeId와 함께 장소 사진 및 AI 추천 플래그를 보존한다.
      return catalogPlace
        ? {
            ...catalogPlace,
            ...place,
            placeId: catalogPlace.placeId,
            image: catalogPlace.image || place.image,
            aiReason: place.aiReason || catalogPlace.aiReason,
            isAiRecommended: true,
          }
        : { ...place, isAiRecommended: true };
    });
    setAppliedCourse(aiCourse);
    setItems(hydratedPlaces);
    setSavedCourse(null);
    setSaveStatus("idle");
    setHistory([]);
    setVisited(new Set());
    setNotice("");
  }

  useEffect(() => {
    let active = true;
    const updateRoute = async () => {
      await Promise.resolve();
      if (!active) return;
      if (datasetStatus !== "ready" || items.length === 0) {
        setRouteState((state) => ({
          ...state,
          status: "idle",
          itinerary: null,
        }));
        return;
      }

      setRouteState((state) => ({ ...state, status: "loading" }));
      try {
        const route = await calculateCourseRoute(items, preferences);
        if (!active) return;
        setRouteState({
          status: route.itinerary ? "ready" : "unavailable",
          ...route,
        });
      } catch {
        if (active) {
          setRouteState((state) => ({
            ...state,
            status: "error",
            itinerary: null,
          }));
        }
      }
    };

    updateRoute();
    return () => {
      active = false;
    };
  }, [datasetStatus, items, preferences]);

  // Push the current order onto the undo stack, then apply `next`.
  const commit = (next) => {
    setHistory((h) => [...h, items]);
    setItems(next);
  };

  // "이전으로" — revert to the state before the last move (undo), not navigation.
  const undo = () => {
    setHistory((h) => {
      if (h.length === 0) return h;
      setItems(h[h.length - 1]);
      return h.slice(0, -1);
    });
  };

  // Candidate places (department-store shops) not already in the course.
  const availablePlaces = placeCatalog.filter(
    (p) => !items.some((item) => item.id === p.id)
  );

  const handleAddPlace = (place) => {
    if (items.length >= MAX_COURSE_PLACES) {
      setNotice("출발지와 도착지를 포함해 최대 8곳까지 담을 수 있어요.");
      return;
    }
    setNotice("");
    commit([...items, place]);
  };

  const handleDelete = (id) => {
    commit(items.filter((p) => p.id !== id));
  };

  const toggleVisited = (id) => {
    setVisited((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleOptimize = async () => {
    if (items.length < 2) return;
    try {
      setNotice("실제 이동 거리를 계산해 최적 순서를 찾는 중이에요.");
      const optimized = await optimizeCourseRoute(items, preferences);
      if (!optimized) {
        setNotice("현재 이동수단 조건으로 모든 장소를 연결할 수 없어요.");
        return;
      }
      if (!sameOrder(optimized.places, items)) commit(optimized.places);
      setNotice("최단 이동거리 기준으로 코스 순서를 정리했어요.");
    } catch {
      setNotice("코스 최적화 중 문제가 생겼어요. 잠시 후 다시 시도해주세요.");
    }
  };

  const handleLoadSampleAiCourse = () => {
    const samplePlaces = [
      {
        id: "1F_PRADA_001",
        navigationKey: "1F_STORE_0031",
        name: "프라다 (PRADA)",
        floor: "1F",
        category: "패션",
        categoryStyle: "bg-[#1a142e] text-white",
        desc: "에스파 카리나가 글로벌 앰버서더로 활약 중인 프라다 매장으로, 최신 컬렉션과 인기 아이템을 만나보실 수 있습니다.",
        aiReason: "에스파 카리나가 프라다 글로벌 앰버서더로 활약 중이며, 최근 착용한 인기 컬렉션과 아이템을 직접 만나볼 수 있는 대표 매장입니다.",
        celebrityName: "카리나 (Karina)",
        celebrityRole: "PRADA 글로벌 앰버서더",
        ambassadorImage: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
        isAiRecommended: true,
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=400&auto=format&fit=crop",
        location: "더현대서울 1F",
      },
      {
        id: "B2_ADIDAS_002",
        navigationKey: "B2_STORE_0032",
        name: "아디다스 스타디움",
        floor: "B2",
        category: "패션",
        categoryStyle: "bg-[#ede9f8] text-[#5c2ef5]",
        desc: "블랙핑크 제니와 손흥민이 착용한 아디다스 오리지널스 및 스타디움 익스클루시브 라인업을 체험할 수 있는 공간입니다.",
        aiReason: "블랙핑크 제니와 손흥민이 착용한 아디다스 오리지널스 및 스타디움 익스클루시브 라인업을 체험할 수 있는 공간입니다.",
        celebrityName: "손흥민 & 제니",
        celebrityRole: "Adidas 글로벌 앰버서더",
        ambassadorImage: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=800&auto=format&fit=crop",
        isAiRecommended: true,
        image: "https://images.unsplash.com/photo-1472851294608-062f824d29cc?q=80&w=400&auto=format&fit=crop",
        location: "더현대서울 B2",
      },
      {
        id: "5F_SOUNDS_003",
        navigationKey: "5F_STORE_0044",
        name: "사운즈 포레스트",
        floor: "5F",
        category: "휴식",
        categoryStyle: "bg-[#e8f5e9] text-[#2e7d32]",
        desc: "자연 채광과 그리너리 감성이 가득한 실내 정원으로, 여유로운 힐링과 사진 촬영을 즐기기 좋은 핫플레이스입니다.",
        aiReason: "자연 채광과 그리너리 감성이 가득한 실내 정원으로, 여유로운 힐링과 인증샷을 남기기 가장 좋은 핫플레이스입니다.",
        celebrityName: "NewJeans & 아이브",
        celebrityRole: "K-컬처 핫플레이스",
        ambassadorImage: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=800&auto=format&fit=crop",
        isAiRecommended: true,
        image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?q=80&w=400&auto=format&fit=crop",
        location: "더현대서울 5F",
      },
    ];
    setItems(samplePlaces);
    setCourseTitle("K-POP 앰버서더 핫플 투어");
    setNotice("✨ AI 추천 샘플 코스를 불러왔습니다. 장소를 클릭해 AI 설명 모달을 확인해보세요!");
  };

  const handleSave = async () => {
    if (items.length === 0) {
      setNotice("저장할 장소를 한 곳 이상 담아주세요.");
      return;
    }
    const placeIds = items.map((item) => item.placeId);
    if (placeIds.some((placeId) => placeId === null || placeId === undefined)) {
      setNotice("DB 장소 정보가 연결되지 않은 매장이 있어 저장할 수 없어요.");
      return;
    }

    const name = courseTitle.trim() || "이름 없는 코스";
    let reconciledPlaceIds = savedCourse?.placeIds.map(Number) ?? [];
    setSaveStatus("saving");
    setNotice("코스를 저장하고 있어요.");
    try {
      if (!savedCourse) {
        const created = await createCourse({ name, placeIds });
        setSavedCourse({
          courseId: created.courseId,
          placeIds: created.places.map((place) => place.placeId),
        });
        setCourseTitle(created.name);
      } else {
        const desiredIds = placeIds.map(Number);
        const desiredSet = new Set(desiredIds);

        for (const placeId of reconciledPlaceIds.filter(
          (id) => !desiredSet.has(id),
        )) {
          await deleteCoursePlace(savedCourse.courseId, placeId);
          reconciledPlaceIds = reconciledPlaceIds.filter(
            (id) => id !== placeId,
          );
        }

        for (const placeId of desiredIds.filter(
          (id) => !reconciledPlaceIds.includes(id),
        )) {
          await addCoursePlace(savedCourse.courseId, {
            placeId,
            position: reconciledPlaceIds.length + 1,
          });
          reconciledPlaceIds.push(placeId);
        }

        await updateCourse(savedCourse.courseId, {
          name,
          orderedPlaceIds: desiredIds,
        });
        setSavedCourse({
          courseId: savedCourse.courseId,
          placeIds: desiredIds,
        });
      }
      setNotice("코스와 방문 순서를 저장했어요.");
      setSaveStatus("saved");
    } catch (error) {
      if (savedCourse) {
        setSavedCourse({
          courseId: savedCourse.courseId,
          placeIds: reconciledPlaceIds,
        });
      }
      setNotice(error.message || "코스를 저장하지 못했습니다.");
      setSaveStatus("error");
    }
  };

  // ── Drag to reorder (native HTML5 DnD) ──
  const handleDragStart = (event, index) => {
    dragIndex.current = index;
    dragStartOrder.current = items;
    setDraggingId(items[index].id);
    event.dataTransfer.effectAllowed = "move";
    try {
      event.dataTransfer.setData("text/plain", String(index));
    } catch {
      // Some browsers disallow setData outside a user gesture — safe to ignore.
    }
  };

  const handleDragEnter = (index) => {
    const from = dragIndex.current;
    if (from === null || from === index) return;
    setItems((prev) => {
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(index, 0, moved);
      return next;
    });
    dragIndex.current = index;
  };

  const handleDragEnd = () => {
    const before = dragStartOrder.current;
    if (before && !sameOrder(before, items)) {
      setHistory((h) => [...h, before]);
    }
    dragIndex.current = null;
    dragStartOrder.current = null;
    setDraggingId(null);
  };

  return (
    <>
    <main
      className="flex-1 md:flex-none flex flex-col md:flex-row overflow-y-auto md:overflow-hidden md:h-[calc(100vh-94px)]"
      style={{ background: "#f0ecfa", gap: "12px", padding: "12px" }}
    >
      {/* ── Left: course list ── */}
      <div
        className="flex flex-col gap-[14px] md:overflow-y-auto px-5 md:px-7 py-5 md:py-6 rounded-[20px] md:w-1/4 md:min-w-[300px] md:shrink-0 order-2 md:order-1"
        style={{ background: "white", boxShadow: "0 2px 12px rgba(92,46,245,0.06)" }}
      >
        {/* Editable title */}
        <input
          className="text-[22px] md:text-[26px] font-bold text-[#1a142e] bg-transparent outline-none placeholder-[#ccc8d8] border-b-2 border-transparent focus:border-[#5c2ef5] transition-colors pb-1"
          style={{ outline: "none" }}
          placeholder="코스 제목을 입력하세요"
          value={courseTitle}
          onChange={(e) => setCourseTitle(e.target.value)}
        />

        {/* Action buttons */}
        <div className="flex flex-wrap gap-[8px]">
          <button
            onClick={undo}
            disabled={history.length === 0}
            title="코스를 옮기기 전 상태로 되돌립니다"
            className="flex items-center gap-[5px] border border-[#ccc8d8] rounded-full px-[14px] py-[7px] text-[12px] text-[#1a142e] bg-white hover:bg-[#f7f5ff] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            <RotateCcw size={12} /> 이전으로
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-[5px] border border-[#ccc8d8] rounded-full px-[14px] py-[7px] text-[12px] text-[#1a142e] bg-white hover:bg-[#f7f5ff] transition-colors"
          >
            <Plus size={12} /> 장소 추가
          </button>
          <button
            onClick={handleOptimize}
            disabled={items.length < 2 || routeState.status === "loading"}
            className="flex items-center gap-[5px] border border-[#ccc8d8] rounded-full px-[14px] py-[7px] text-[12px] text-[#1a142e] bg-white hover:bg-[#f7f5ff] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Zap size={12} className="text-yellow-500" /> 최적화
          </button>
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving" || datasetStatus !== "ready"}
            className="flex items-center gap-[5px] rounded-full px-[14px] py-[7px] text-[12px] text-white bg-[#5c2ef5] hover:bg-[#4a22d4] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={12} /> {saveStatus === "saving" ? "저장 중" : "저장"}
          </button>
        </div>

        {/* Drag hint */}
        <p className="text-[#9994ad] text-[12px] border border-dashed border-[#ccc8d8] rounded-[8px] px-[14px] py-[9px] bg-white/60">
          카드를 드래그해 순서를 바꾸세요 · 첫 장소는 출발, 마지막은 도착
        </p>

        <div className="rounded-[12px] border border-[#e5e0f2] bg-[#faf9fe] px-3 py-3">
          <p className="mb-2 text-[11px] font-bold text-[#6b6685]">이동수단 조건</p>
          <div className="flex flex-wrap gap-2">
            {[
              ["excludeElevator", "엘리베이터 제외"],
              ["excludeEscalator", "에스컬레이터 제외"],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                aria-pressed={preferences[key]}
                onClick={() => {
                  setPreferences((current) => ({
                    ...current,
                    [key]: !current[key],
                  }));
                  setNotice("");
                }}
                className={`rounded-full border px-3 py-1.5 text-[11px] font-semibold transition-colors ${
                  preferences[key]
                    ? "border-[#5c2ef5] bg-[#5c2ef5] text-white"
                    : "border-[#d8d3e8] bg-white text-[#6b6685] hover:border-[#5c2ef5]"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          {preferences.excludeElevator && preferences.excludeEscalator ? (
            <p className="mt-2 text-[10px] leading-relaxed text-[#e05a47]">
              두 수단을 모두 제외하면 다른 층으로 이동할 수 없어요.
            </p>
          ) : null}
        </div>

        {chat?.error ? (
          <div className="rounded-[12px] border border-[#f3ccc4] bg-[#fef5f3] p-3.5">
            <p className="text-[11px] font-medium leading-relaxed text-[#c0392b]">
              {chat.error}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-2">
              {chat.canRetry ? (
                <button
                  type="button"
                  onClick={chat.retry}
                  className="rounded-full border border-[#e0d9f8] bg-white px-3 py-1 text-[11px] font-semibold text-[#5c2ef5] transition-colors hover:border-[#5c2ef5] cursor-pointer"
                >
                  다시 시도
                </button>
              ) : null}
              <button
                type="button"
                onClick={handleLoadSampleAiCourse}
                className="rounded-full bg-[#5c2ef5] px-3.5 py-1 text-[11px] font-bold text-white shadow-xs transition hover:bg-[#4a22d4] cursor-pointer"
              >
                ✨ AI 추천 샘플 코스로 체험하기
              </button>
            </div>
          </div>
        ) : null}

        {notice ? (
          <p className="rounded-[10px] bg-[#f0ecfa] px-3 py-2 text-[11px] font-medium text-[#5c2ef5]">
            {notice}
          </p>
        ) : null}

        {items.length >= 2 ? (
          <div className="grid grid-cols-3 gap-2 rounded-[12px] bg-[#f6f4fa] px-3 py-3 text-center">
            <div>
              <strong className="block text-[15px] text-[#1a142e]">{items.length}</strong>
              <span className="text-[10px] text-[#6b6685]">방문 장소</span>
            </div>
            <div>
              <strong className="block text-[15px] text-[#1a142e]">
                {routeState.itinerary?.floorIds.length ?? 0}
              </strong>
              <span className="text-[10px] text-[#6b6685]">이용 층</span>
            </div>
            <div>
              <strong className="block text-[15px] text-[#1a142e]">
                {routeState.itinerary?.connectorSteps.length ?? 0}
              </strong>
              <span className="text-[10px] text-[#6b6685]">층간 이동</span>
            </div>
          </div>
        ) : null}

        {/* Empty course — guide the user to add their first place */}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-[16px] border-2 border-dashed border-[#d8d3ee] bg-[#faf8ff] px-5 py-10 text-center">
            <p className="text-[14px] font-semibold text-[#1a142e]">
              아직 담은 장소가 없어요
            </p>
            <p className="text-[12px] text-[#9994ad] leading-[1.5]">
              &lsquo;장소 추가&rsquo;를 눌러 백화점 안 상점을
              <br />
              카테고리·층별로 골라 담아보세요
            </p>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setAddOpen(true)}
                className="flex items-center gap-[5px] rounded-full px-[16px] py-[8px] text-[13px] font-semibold text-white bg-[#5c2ef5] hover:bg-[#4a22d4] transition-colors active:scale-95 cursor-pointer"
              >
                <Plus size={13} /> 장소 추가
              </button>
              <button
                type="button"
                onClick={handleLoadSampleAiCourse}
                className="flex items-center gap-[5px] rounded-full px-[16px] py-[8px] text-[13px] font-semibold text-[#5c2ef5] bg-[#f0ecfa] hover:bg-[#e0d9f8] transition-colors cursor-pointer border border-[#e0d9f8]"
              >
                ✨ AI 추천 코스 불러오기
              </button>
            </div>
          </div>
        )}

        {/* Place cards */}
        <div className="flex flex-col gap-[10px]">
          {items.map((place, index) => (
            <div
              key={place.id}
              className="flex items-start gap-[12px]"
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragOver={(e) => e.preventDefault()}
              onDragEnd={handleDragEnd}
              style={{
                opacity: draggingId === place.id ? 0.4 : 1,
                cursor: "grab",
              }}
            >
              <div className="flex flex-col items-center shrink-0 mt-[14px]">
                <div
                  className="w-[28px] h-[28px] rounded-full flex items-center justify-center text-[12px] font-bold transition-all duration-150"
                  style={{
                    backgroundColor: visited.has(place.id)
                      ? "#4a2fa8"
                      : hoveredId === place.id
                        ? "#5c2ef5"
                        : "white",
                    color:
                      visited.has(place.id) || hoveredId === place.id
                        ? "white"
                        : "#5c2ef5",
                    border: `2px solid ${visited.has(place.id) ? "#4a2fa8" : "#5c2ef5"}`,
                    boxShadow: hoveredId === place.id ? "0 4px 12px #5c2ef544" : "none",
                  }}
                >
                  {index + 1}
                </div>
                <span className="mt-1 whitespace-nowrap text-[9px] font-bold text-[#6b6685]">
                  {index === 0
                    ? "출발"
                    : index === items.length - 1
                      ? "도착"
                      : "경유"}
                </span>
              </div>
              <button
                className="flex-1 bg-white rounded-[14px] p-[16px] flex items-center gap-[12px] text-left transition-all duration-150 border-2"
                style={{
                  borderColor: hoveredId === place.id ? "#5c2ef5" : "transparent",
                  boxShadow:
                    hoveredId === place.id
                      ? "0 6px 20px rgba(92,46,245,0.12)"
                      : "0 2px 8px rgba(0,0,0,0.05)",
                  opacity: visited.has(place.id) ? 0.6 : 1,
                }}
                onClick={() => onPlaceClick?.(place)}
                onMouseEnter={() => setHoveredId(place.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="flex-1 min-w-0">
                  <span
                    className={`inline-block text-[11px] font-medium px-[9px] py-[3px] rounded-full mb-[7px] ${place.categoryStyle}`}
                  >
                    {place.category}
                  </span>
                  <h3
                    className={`text-[14px] font-bold mb-[4px] truncate ${
                      visited.has(place.id)
                        ? "line-through text-[#9994ad]"
                        : "text-[#1a142e]"
                    }`}
                  >
                    {place.name}
                  </h3>
                  <p className="text-[12px] text-[#6b6685] leading-[1.5] line-clamp-2">
                    {place.desc}
                  </p>
                </div>
                {place.image ? (
                  <img
                    src={place.image}
                    alt={place.name}
                    className="w-[68px] h-[68px] rounded-[10px] object-cover shrink-0 pointer-events-none"
                  />
                ) : (
                  <div
                    className="w-[68px] h-[68px] rounded-[10px] shrink-0"
                    style={{
                      background: `linear-gradient(135deg,${place.accentColor}22,${place.accentColor}0a)`,
                    }}
                  />
                )}
              </button>

              {/* Per-card controls: visited toggle + delete */}
              <div className="flex flex-col gap-[6px] shrink-0 mt-[14px]">
                <button
                  onClick={() => toggleVisited(place.id)}
                  title={visited.has(place.id) ? "다녀옴 해제" : "다녀왔어요 체크"}
                  aria-pressed={visited.has(place.id)}
                  className="w-[26px] h-[26px] rounded-full border flex items-center justify-center transition-colors cursor-pointer"
                  style={
                    visited.has(place.id)
                      ? { backgroundColor: "#22c55e", borderColor: "#22c55e", color: "white" }
                      : { backgroundColor: "white", borderColor: "#ccc8d8", color: "#9994ad" }
                  }
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={() => handleDelete(place.id)}
                  title="코스에서 삭제"
                  aria-label={`${place.name} 삭제`}
                  className="w-[26px] h-[26px] rounded-full border border-[#ccc8d8] text-[#9994ad] flex items-center justify-center transition-colors cursor-pointer hover:border-[#ef4444] hover:text-[#ef4444] hover:bg-[#fef2f2]"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right: map + chat overlay ── */}
      <div className="relative h-[260px] rounded-[20px] overflow-hidden order-1 md:order-2 md:h-auto md:flex-1 md:min-w-0">
        <div className="w-full h-full">
          <CourseNavigationMap
            route={routeState.itinerary}
            routeFloorIds={routeState.itinerary?.floorIds}
            routeGraph={routeState.graph}
          />
        </div>

        {/* PanelChat: absolute on desktop, hidden on mobile (shown below instead) */}
        <div className="hidden md:flex absolute bottom-5 left-0 right-0 justify-center px-6">
          <PanelChat
            messages={chat?.messages}
            pending={chatPending}
            onSend={chat?.send}
          />
        </div>
      </div>

      {/* Mobile-only PanelChat — below the map */}
      <div className="md:hidden order-3 w-full">
        <PanelChat
          messages={chat?.messages}
          pending={chatPending}
          onSend={chat?.send}
        />
      </div>
    </main>

    <AddPlaceModal
      open={addOpen}
      places={availablePlaces}
      onAdd={handleAddPlace}
      onClose={() => setAddOpen(false)}
      onPlaceClick={onPlaceClick}
    />

    {chatPending ? (
      <CourseLoadingOverlay
        message={chatPending.message}
        isFirstTurn={chatPending.isFirstTurn}
        onCancel={chat?.cancel}
      />
    ) : null}
    </>
  );
}
