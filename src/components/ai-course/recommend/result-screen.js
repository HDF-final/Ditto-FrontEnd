"use client";

/* eslint-disable @next/next/no-img-element */

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Plus,
  Zap,
  Save,
  RotateCcw,
  Check,
  Trash2,
  Lock,
  LockOpen,
} from "./recommend-icons";
import { PanelChat } from "./boni-chat";
import { AddPlaceModal } from "./add-place-modal";
import { CourseLoadingOverlay } from "./course-loading-overlay";
import { CourseSaveSuccessModal } from "./course-save-success-modal";
import { CourseNavigationMap } from "@/components/navigation/course-navigation-map";
import { CameraScanner } from "@/components/layout/camera-scanner";
import { ScanResult } from "@/components/layout/scan-result";
import { useIsDesktop } from "@/hooks/use-is-desktop";
import { useScanLocationStore } from "@/stores/use-scan-location-store";
import {
  attachPlaceIdsToCourseDataset,
  calculateCourseRoute,
  loadCourseRoutingDataset,
  optimizeCourseRoute,
} from "@/lib/navigation/course-routing-service";
import { getNavigablePlaces } from "@/lib/api/place-navigation";
import { getBrands, buildBrandLogoMap } from "@/lib/api/brands";
import { getPlaceCategoryLabel } from "@/lib/navigation/place-category";
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
export function ResultScreen({ chat, onPlaceClick, seedFromScan = false }) {
  const t = useTranslations("aiCourse");
  const [items, setItems] = useState([]);
  const [placeCatalog, setPlaceCatalog] = useState([]);
  const [placeLogos, setPlaceLogos] = useState(null);
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
  const [lockedPlaceIds, setLockedPlaceIds] = useState(() => new Set());
  const [appliedCourse, setAppliedCourse] = useState(null); // 이미 반영한 Boni 코스
  const [savedCourse, setSavedCourse] = useState(null);
  const [saveStatus, setSaveStatus] = useState("idle");
  const [saveSuccessOpen, setSaveSuccessOpen] = useState(false);
  const [locateOpen, setLocateOpen] = useState(false);
  const [locateImage, setLocateImage] = useState(null);
  const scanLocation = useScanLocationStore((state) => state.location);
  const hydrateLocation = useScanLocationStore((state) => state.hydrate);
  const isDesktop = useIsDesktop();

  const dragIndex = useRef(null);
  const dragStartOrder = useRef(null);
  const chatOccluderRef = useRef(null);
  const seededFromScanRef = useRef(false);

  useEffect(() => {
    hydrateLocation();
  }, [hydrateLocation]);

  const aiCourse = chat?.course ?? null;
  const chatPending = chat?.pending ?? null;

  useEffect(() => {
    if (!seedFromScan || seededFromScanRef.current) return;
    if (datasetStatus !== "ready") return;
    if (items.length > 0) return;
    const key = scanLocation?.navigationKey;
    if (!key) return;
    const place = placeCatalog.find((entry) => entry.navigationKey === key);
    if (!place) return;
    let active = true;
    Promise.resolve().then(() => {
      if (!active || seededFromScanRef.current) return;
      seededFromScanRef.current = true;
      setItems([place]);
      setCourseTitle(t("courseStartingAt", { name: place.name }));
    });
    return () => {
      active = false;
    };
  }, [
    datasetStatus,
    items.length,
    placeCatalog,
    scanLocation?.navigationKey,
    seedFromScan,
    t,
  ]);

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
            t("unmappedPlaces", { count: hydratedDataset.unmappedPlaceCount }),
          );
        }
        setDatasetStatus("ready");
      })
      .catch((error) => {
        if (active) {
          setDatasetStatus("error");
          setNotice(error.message || t("placeLoadFailed"));
        }
      });
    return () => {
      active = false;
    };
  }, [t]);

  // 브랜드 로고는 지도 핑(출발·도착)에만 쓰는 장식이라, 실패해도 지도/코스 로딩을
  // 막지 않도록 별도 effect로 느슨하게 붙입니다. 이름으로 매칭하는 조회 맵을 만듭니다.
  useEffect(() => {
    let active = true;
    getBrands()
      .then((brands) => {
        if (active) setPlaceLogos(buildBrandLogoMap(brands));
      })
      .catch((err) => {
        console.warn(
          "[ResultScreen] Brand logos unavailable, pings show name only:",
          err?.message || err,
        );
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
            // 추천 응답이 준 사진이 우선입니다. 카탈로그 사진은 presigned URL이라
            // 30분 뒤 만료되고, 브랜드와 무관한 기본 매장 컷인 경우가 많습니다.
            image: place.image || catalogPlace.image,
            aiReason: place.aiReason || catalogPlace.aiReason,
            isAiRecommended: true,
          }
        : { ...place, isAiRecommended: true };
    });
    setAppliedCourse(aiCourse);
    setItems(hydratedPlaces);
    if (!courseTitle) {
      const userPrompt = chat?.messages?.find((m) => m.role === "user")?.text;
      if (userPrompt) {
        const cleaned = userPrompt
          .replace(/(관련한|관련|맞춤)?\s*(코스|추천)?\s*(만들어줘|생성해줘|짜줘|추천해줘).*/, "")
          .trim();
        setCourseTitle(
          cleaned
            ? t("courseNameFromPrompt", { name: cleaned })
            : t("recommendedCourseName"),
        );
      }
    }
    setSavedCourse(null);
    setSaveStatus("idle");
    setSaveSuccessOpen(false);
    setHistory([]);
    setVisited(new Set());
    setLockedPlaceIds(new Set());
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
      setNotice(t("maxPlaces"));
      return;
    }
    setNotice("");
    commit([...items, place]);
  };

  const handleDelete = (id) => {
    setLockedPlaceIds((current) => {
      if (!current.has(id)) return current;
      const next = new Set(current);
      next.delete(id);
      return next;
    });
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

  const toggleLocked = (id, index) => {
    if (index === 0 || index === items.length - 1) return;
    setLockedPlaceIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    setNotice("");
  };

  const handleOptimize = async () => {
    if (items.length < 2) return;
    try {
      const lockedIndexes = items.flatMap((place, index) =>
        lockedPlaceIds.has(place.id) ? [index] : [],
      );
      setNotice(t("optimizing"));
      const optimized = await optimizeCourseRoute(items, preferences, {
        lockedIndexes,
      });
      if (!optimized) {
        setNotice(t("routeUnavailable"));
        return;
      }
      if (!sameOrder(optimized.places, items)) commit(optimized.places);
      setNotice(
        lockedIndexes.length > 0
          ? t("optimizedLocked")
          : t("optimized"),
      );
    } catch {
      setNotice(t("optimizeFailed"));
    }
  };



  const handleSave = async () => {
    if (items.length === 0) {
      setNotice(t("addOneToSave"));
      return;
    }
    const placeIds = items.map((item) => item.placeId);
    if (placeIds.some((placeId) => placeId === null || placeId === undefined)) {
      setNotice(t("unmappedSave"));
      return;
    }

    const name = courseTitle.trim() || t("unnamedCourse");
    let reconciledPlaceIds = savedCourse?.placeIds.map(Number) ?? [];
    setSaveStatus("saving");
    setSaveSuccessOpen(false);
    setNotice(t("savingCourse"));
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
      setNotice(t("savedCourse"));
      setSaveStatus("saved");
      setSaveSuccessOpen(true);
    } catch (error) {
      if (savedCourse) {
        setSavedCourse({
          courseId: savedCourse.courseId,
          placeIds: reconciledPlaceIds,
        });
      }
      setNotice(error.message || t("saveFailed"));
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
    <main className="course-studio flex-1 gap-3 bg-[#f0ecfa] p-3">
      <div className="course-studio-map relative min-h-0 overflow-hidden rounded-[20px]">
        <div className="h-full min-h-[280px] w-full lg:min-h-0">
          <CourseNavigationMap
            route={routeState.itinerary}
            routeFloorIds={
              routeState.itinerary?.floorIds ??
              (seedFromScan && scanLocation?.floor
                ? [scanLocation.floor]
                : undefined)
            }
            routeGraph={routeState.graph}
            placeLogos={placeLogos}
            overlayOccluderRef={chatOccluderRef}
            initialView="route"
            variant={isDesktop ? "course" : "scan"}
            fitPreset={isDesktop ? undefined : "course-mobile"}
            showUserLocation={!seedFromScan}
          />
        </div>
        {items.length > 0 && !seedFromScan ? (
          <button
            type="button"
            onClick={() => setLocateOpen(true)}
            className="absolute bottom-3 right-3 z-30 inline-flex items-center gap-1.5 rounded-full bg-white/95 px-3 py-2 text-[11px] font-black text-[#1E3A8A] shadow-[0_6px_16px_rgba(37,99,235,0.18)]"
          >
            <span className="size-2 rounded-full bg-[#2563EB]" />
            {scanLocation ? t("locateMeAgain") : t("locateMe")}
          </button>
        ) : null}
      </div>

      <div
        className="course-studio-list flex min-h-0 flex-col gap-[14px] overflow-visible rounded-[20px] px-4 py-4 lg:px-7 lg:py-6"
        style={{ background: "white", boxShadow: "0 2px 12px rgba(92,46,245,0.06)" }}
      >
        {/* Editable title */}
        <input
          className="text-[22px] md:text-[26px] font-bold text-[#1a142e] bg-transparent outline-none placeholder-[#ccc8d8] border-b-2 border-transparent focus:border-[#5c2ef5] transition-colors pb-1"
          style={{ outline: "none" }}
          placeholder={t("courseTitlePlaceholder")}
          value={courseTitle}
          onChange={(e) => setCourseTitle(e.target.value)}
        />

        {/* Action buttons */}
        <div className="flex flex-wrap gap-[8px]">
          <button
            onClick={undo}
            disabled={history.length === 0}
            title={t("undoTitle")}
            className="flex items-center gap-[5px] border border-[#ccc8d8] rounded-full px-[14px] py-[7px] text-[12px] text-[#1a142e] bg-white hover:bg-[#f7f5ff] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
          >
            <RotateCcw size={12} /> {t("undo")}
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-[5px] border border-[#ccc8d8] rounded-full px-[14px] py-[7px] text-[12px] text-[#1a142e] bg-white hover:bg-[#f7f5ff] transition-colors"
          >
            <Plus size={12} /> {t("addPlace")}
          </button>
          <button
            onClick={handleOptimize}
            disabled={items.length < 2 || routeState.status === "loading"}
            className="flex items-center gap-[5px] border border-[#ccc8d8] rounded-full px-[14px] py-[7px] text-[12px] text-[#1a142e] bg-white hover:bg-[#f7f5ff] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Zap size={12} className="text-yellow-500" /> {t("optimize")}
          </button>
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving" || datasetStatus !== "ready"}
            className="flex items-center gap-[5px] rounded-full px-[14px] py-[7px] text-[12px] text-white bg-[#5c2ef5] hover:bg-[#4a22d4] transition-colors disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save size={12} /> {saveStatus === "saving" ? t("savingShort") : t("saveShort")}
          </button>
        </div>

        {/* Drag hint */}
        <p className="text-[#9994ad] text-[12px] border border-dashed border-[#ccc8d8] rounded-[8px] px-[14px] py-[9px] bg-white/60">
          {t("dragHint")}
        </p>

        <div className="rounded-[12px] border border-[#e5e0f2] bg-[#faf9fe] px-3 py-3">
          <p className="mb-2 text-[11px] font-bold text-[#6b6685]">{t("transportOptions")}</p>
          <div className="flex flex-wrap gap-2">
            {[
              ["excludeElevator", t("excludeElevator")],
              ["excludeEscalator", t("excludeEscalator")],
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
              {t("bothExcluded")}
            </p>
          ) : null}
        </div>

        {chat?.error ? (
          <div className="rounded-[12px] border border-[#f3ccc4] bg-[#fef5f3] p-3.5">
            <p className="text-[11px] font-medium leading-relaxed text-[#c0392b]">
              {chat.error}
            </p>
            {chat.canRetry ? (
              <div className="mt-2.5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={chat.retry}
                  className="rounded-full border border-[#e0d9f8] bg-white px-3 py-1 text-[11px] font-semibold text-[#5c2ef5] transition-colors hover:border-[#5c2ef5] cursor-pointer"
                >
                  {t("retry")}
                </button>
              </div>
            ) : null}
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
              <span className="text-[10px] text-[#6b6685]">{t("placesVisited")}</span>
            </div>
            <div>
              <strong className="block text-[15px] text-[#1a142e]">
                {routeState.itinerary?.floorIds.length ?? 0}
              </strong>
              <span className="text-[10px] text-[#6b6685]">{t("floorsUsed")}</span>
            </div>
            <div>
              <strong className="block text-[15px] text-[#1a142e]">
                {routeState.itinerary?.connectorSteps.length ?? 0}
              </strong>
              <span className="text-[10px] text-[#6b6685]">{t("floorChanges")}</span>
            </div>
          </div>
        ) : null}

        {/* Empty course — guide the user to add their first place */}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-[16px] border-2 border-dashed border-[#d8d3ee] bg-[#faf8ff] px-5 py-10 text-center lg:min-h-[320px] lg:gap-4 lg:py-20">
            <p className="text-[14px] font-semibold text-[#1a142e] lg:text-[18px]">
              {t("emptyPlaces")}
            </p>
            <p className="text-[12px] leading-[1.5] text-[#9994ad] lg:text-[14px]">
              {t("emptyPlacesDescription")}
            </p>
            <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
              <button
                onClick={() => setAddOpen(true)}
                className="flex cursor-pointer items-center gap-[5px] rounded-full bg-[#5c2ef5] px-[16px] py-[8px] text-[13px] font-semibold text-white transition-colors hover:bg-[#4a22d4] active:scale-95 lg:px-6 lg:py-3 lg:text-[15px]"
              >
                <Plus size={13} /> {t("addPlace")}
              </button>
            </div>
          </div>
        )}

        {/* Place cards */}
        <div className="flex flex-col gap-[10px]">
          {items.map((place, index) => {
            const isEndpoint = index === 0 || index === items.length - 1;
            const isLocked = isEndpoint || lockedPlaceIds.has(place.id);

            return (
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
                    ? t("start")
                    : index === items.length - 1
                      ? t("end")
                      : t("via")}
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
                    {getPlaceCategoryLabel(place.category, t)}
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
                {place.aiImage || place.image ? (
                  <img
                    // 상세 모달의 대표 사진과 같은 그림을 씁니다. 카탈로그 사진은
                    // presigned URL이라 30분 뒤 만료되고, 브랜드와 무관한 기본 컷인
                    // 경우가 많아 추천 응답이 준 사진이 있으면 그쪽이 우선입니다.
                    src={place.aiImage || place.image}
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

              {/* Per-card controls: visited toggle + order lock + delete */}
              <div className="flex flex-col gap-[6px] shrink-0 mt-[14px]">
                <button
                  onClick={() => toggleVisited(place.id)}
                  title={visited.has(place.id) ? t("visitedOff") : t("visitedOn")}
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
                  type="button"
                  onClick={() => toggleLocked(place.id, index)}
                  disabled={isEndpoint}
                  title={
                    isEndpoint
                      ? t("endpointFixed", {
                          point: index === 0 ? t("startPoint") : t("endPoint"),
                        })
                      : isLocked
                        ? t("unlockOrder")
                        : t("lockOrder")
                  }
                  aria-label={
                    isEndpoint
                      ? t("orderFixed", { name: place.name })
                      : t("orderAction", {
                          name: place.name,
                          action: isLocked ? t("unlock") : t("lock"),
                        })
                  }
                  aria-pressed={isLocked}
                  className="w-[26px] h-[26px] rounded-full border flex items-center justify-center transition-colors cursor-pointer disabled:cursor-default"
                  style={
                    isLocked
                      ? { backgroundColor: "#5c2ef5", borderColor: "#5c2ef5", color: "white" }
                      : { backgroundColor: "white", borderColor: "#ccc8d8", color: "#9994ad" }
                  }
                >
                  {isLocked ? <Lock size={12} /> : <LockOpen size={12} />}
                </button>
                <button
                  onClick={() => handleDelete(place.id)}
                  title={t("deleteFromCourse")}
                  aria-label={t("deletePlace", { name: place.name })}
                  className="w-[26px] h-[26px] rounded-full border border-[#ccc8d8] text-[#9994ad] flex items-center justify-center transition-colors cursor-pointer hover:border-[#ef4444] hover:text-[#ef4444] hover:bg-[#fef2f2]"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      <div ref={chatOccluderRef} className="course-studio-chat min-w-0">
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
      loading={datasetStatus === "loading"}
      onAdd={handleAddPlace}
      onClose={() => setAddOpen(false)}
      onPlaceClick={onPlaceClick}
    />

    <CourseSaveSuccessModal
      open={saveSuccessOpen}
      courseName={courseTitle.trim() || t("unnamedCourse")}
      onClose={() => setSaveSuccessOpen(false)}
    />

    {chatPending ? (
      <CourseLoadingOverlay
        message={chatPending.message}
        isFirstTurn={chatPending.isFirstTurn}
        onCancel={chat?.cancel}
      />
    ) : null}

    <CameraScanner
      open={locateOpen}
      overlayClassName=""
      onClose={() => setLocateOpen(false)}
      onCapture={(dataUrl) => setLocateImage(dataUrl)}
    />
    <ScanResult
      open={Boolean(locateImage)}
      image={locateImage}
      afterMatch="stay"
      overlayClassName=""
      onClose={() => setLocateImage(null)}
      onRescan={() => {
        setLocateImage(null);
        setLocateOpen(true);
      }}
    />
    </>
  );
}
