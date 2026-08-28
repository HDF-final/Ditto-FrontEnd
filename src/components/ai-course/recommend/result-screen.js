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
  ChevronUp,
  ChevronDown,
} from "./recommend-icons";
import { PanelChat } from "./boni-chat";
import { AddPlaceModal } from "./add-place-modal";
import { CourseLoadingOverlay } from "./course-loading-overlay";
import { CourseSaveSuccessModal } from "./course-save-success-modal";
import { CourseNavigationMap } from "@/components/navigation/course-navigation-map";
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
  getCourseDetail,
  updateCourse,
} from "@/lib/api/courses";
import { getImageUrl, pickCoursePlaceImage } from "@/lib/courses/image-url";

const MAX_COURSE_PLACES = 8;
const MOBILE_LIST_MIN_PERCENT = 36;
const MOBILE_LIST_MAX_PERCENT = 92;
const MOBILE_LIST_STEP_PERCENT = 12;

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function sameOrder(a, b) {
  return a.length === b.length && a.every((item, i) => item.id === b[i].id);
}

function reorderWithFixedSlots(list, lockedPlaceIds, fromIndex, toIndex) {
  if (
    fromIndex === toIndex ||
    fromIndex < 0 ||
    toIndex < 0 ||
    fromIndex >= list.length ||
    toIndex >= list.length
  ) {
    return list;
  }

  const fixedSlots = new Map();
  for (let i = 1; i < list.length; i += 1) {
    if (lockedPlaceIds.has(list[i]?.id)) {
      fixedSlots.set(i, list[i]);
    }
  }

  if (fixedSlots.has(fromIndex) || fixedSlots.has(toIndex)) {
    return list;
  }

  const unlockedSlots = [];
  for (let i = 0; i < list.length; i += 1) {
    if (!fixedSlots.has(i)) {
      unlockedSlots.push(i);
    }
  }

  const unlockedItems = unlockedSlots.map((i) => list[i]);
  const fromUnlockedIdx = unlockedSlots.indexOf(fromIndex);
  const toUnlockedIdx = unlockedSlots.indexOf(toIndex);

  if (fromUnlockedIdx === -1 || toUnlockedIdx === -1) {
    return list;
  }

  const nextUnlocked = [...unlockedItems];
  const [moved] = nextUnlocked.splice(fromUnlockedIdx, 1);
  nextUnlocked.splice(toUnlockedIdx, 0, moved);

  const result = new Array(list.length);
  for (const [slotIdx, place] of fixedSlots.entries()) {
    result[slotIdx] = place;
  }
  for (let k = 0; k < unlockedSlots.length; k += 1) {
    result[unlockedSlots[k]] = nextUnlocked[k];
  }

  return result;
}

function normalizePlaceName(name) {
  return String(name || "").replace(/\s+/g, "").toLowerCase();
}

function getSourcePlaceId(place) {
  return place?.placeId ?? place?.place_id ?? place?.id ?? null;
}

function getSourceNavigationKey(place) {
  return place?.navigationKey ?? place?.navigation_key ?? null;
}

function getSourcePlaceImage(place) {
  return getImageUrl(place);
}

function findCatalogPlace(sourcePlace, placeCatalog) {
  const navigationKey = getSourceNavigationKey(sourcePlace);
  const placeId = getSourcePlaceId(sourcePlace);
  const sourceName = normalizePlaceName(
    sourcePlace?.name ?? sourcePlace?.placeName ?? sourcePlace?.place_name,
  );

  return placeCatalog.find((candidate) => {
    if (navigationKey && candidate.navigationKey === navigationKey) return true;
    if (placeId !== null && String(candidate.placeId) === String(placeId)) return true;
    return sourceName && normalizePlaceName(candidate.name) === sourceName;
  });
}

function hydrateSourceCoursePlaces(coursePlaces, placeCatalog) {
  return coursePlaces
    .map((rawPlace, index) => {
      const place = rawPlace?.place && typeof rawPlace.place === "object"
        ? { ...rawPlace.place, ...rawPlace }
        : rawPlace;
      const catalogPlace = findCatalogPlace(place, placeCatalog);
      const image = pickCoursePlaceImage(place, catalogPlace);
      const fallbackName =
        place?.name ?? place?.placeName ?? place?.place_name ?? catalogPlace?.name;
      const fallbackFloor =
        place?.floorCode ?? place?.floor_code ?? place?.floor ?? catalogPlace?.floor;

      if (catalogPlace) {
        return {
          ...catalogPlace,
          ...place,
          id: catalogPlace.id,
          placeId: catalogPlace.placeId ?? getSourcePlaceId(place),
          navigationKey: catalogPlace.navigationKey,
          floor: catalogPlace.floor ?? fallbackFloor,
          name: fallbackName,
          desc: place?.description ?? place?.desc ?? catalogPlace.desc,
          description: place?.description ?? place?.desc ?? catalogPlace.description,
          image: image ?? catalogPlace.image,
          imageUrl: image ?? catalogPlace.imageUrl,
          placeImg: image ?? catalogPlace.placeImg,
          isAiRecommended: false,
        };
      }

      return {
        id: getSourceNavigationKey(place) ?? getSourcePlaceId(place) ?? `source-course-${index}`,
        placeId: getSourcePlaceId(place),
        navigationKey: getSourceNavigationKey(place),
        floor: fallbackFloor,
        name: fallbackName,
        category: place?.category,
        desc: place?.description ?? place?.desc ?? `${fallbackFloor ?? ""} ${fallbackName ?? ""}`.trim(),
        description: place?.description ?? place?.desc,
        image,
        imageUrl: image,
        location: `더현대서울 ${fallbackFloor ?? ""}`.trim(),
        isAiRecommended: false,
      };
    })
    .filter((place) => place.name);
}

/**
 * 코스 편집 화면.
 *
 * 코스는 항상 빈 상태로 시작합니다. 자동 모드는 Boni 추천 응답(`chat.course`)이,
 * 수동 모드는 사용자의 '장소 추가'가 코스를 채웁니다. Boni 요청이 진행 중인
 * 동안(`chat.pending`)에는 화면 전체 버퍼링 오버레이가 덮이고, 응답이 오면 풀립니다.
 */
export function ResultScreen({ chat, onPlaceClick, seedFromScan = false, sourceCourseId = "" }) {
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
  const scanLocation = useScanLocationStore((state) => state.location);
  const hydrateLocation = useScanLocationStore((state) => state.hydrate);
  const isDesktop = useIsDesktop();

  const dragIndex = useRef(null);
  const dragStartOrder = useRef(null);
  const itemsRef = useRef(items);
  const listRef = useRef(null);
  const studioRef = useRef(null);
  const mobileResizeDrag = useRef({
    pointerId: null,
    startY: 0,
    startPercent: 64,
    containerHeight: 1,
    removeListeners: null,
  });
  const pointerDrag = useRef({
    pointerId: null,
    startX: 0,
    startY: 0,
    from: null,
    active: false,
    timer: null,
  });
  const didDragRef = useRef(false);
  const chatOccluderRef = useRef(null);
  const seededFromScanRef = useRef(false);
  const seededSourceCourseRef = useRef("");
  const [mobileListPercent, setMobileListPercent] = useState(64);

  // 드래그 이벤트 핸들러가 최신 items 를 stale 없이 읽도록 ref 를 동기화합니다.
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    if (seedFromScan) hydrateLocation();
  }, [hydrateLocation, seedFromScan]);

  useEffect(
    () => () => {
      if (pointerDrag.current.timer) clearTimeout(pointerDrag.current.timer);
      mobileResizeDrag.current.removeListeners?.();
    },
    [],
  );

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
    seededFromScanRef.current = true;
    queueMicrotask(() => {
      setItems([place]);
      setCourseTitle(`${place.name}에서 시작하는 코스`);
    });
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

  useEffect(() => {
    if (!sourceCourseId || datasetStatus !== "ready") return;
    if (seededSourceCourseRef.current === sourceCourseId) return;
    let active = true;
    seededSourceCourseRef.current = sourceCourseId;
    setNotice("");

    getCourseDetail(sourceCourseId)
      .then((course) => {
        if (!active) return;
        const sourcePlaces = Array.isArray(course?.places)
          ? course.places
          : Array.isArray(course?.coursePlaces)
            ? course.coursePlaces
            : Array.isArray(course?.placeList)
              ? course.placeList
              : Array.isArray(course?.coursePlaceList)
                ? course.coursePlaceList
                : [];
        const hydratedPlaces = hydrateSourceCoursePlaces(sourcePlaces, placeCatalog);

        setItems(hydratedPlaces);
        setCourseTitle(course?.name || course?.title || t("recommendedCourseName"));
        setSavedCourse(null);
        setSaveStatus("idle");
        setSaveSuccessOpen(false);
        setHistory([]);
        setVisited(new Set());
        setLockedPlaceIds(new Set());
        setNotice(hydratedPlaces.length > 0 ? "" : t("placeLoadFailed"));
      })
      .catch((error) => {
        if (!active) return;
        seededSourceCourseRef.current = "";
        setNotice(error?.message || t("placeLoadFailed"));
      });

    return () => {
      active = false;
    };
  }, [datasetStatus, placeCatalog, sourceCourseId, t]);

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
      const storeImage = pickCoursePlaceImage(place, catalogPlace);
      // placeId와 함께 카탈로그 매장 사진 및 AI 추천 플래그를 보존한다.
      return catalogPlace
        ? {
            ...catalogPlace,
            ...place,
            placeId: catalogPlace.placeId,
            image: storeImage,
            imageUrl: storeImage,
            placeImg: storeImage,
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
    if (index === 0) return;
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
        const created = await createCourse({
          name,
          placeIds,
          courseType: sourceCourseId ? "COPIED" : "MANUAL",
          sourceCourseId: sourceCourseId || null,
        });
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

  // ── Drag to reorder (pointer events: mouse + touch) ──
  // HTML5 DnD does not run on iOS/Android, and an inner <button> also blocks
  // desktop drag. Pointer capture + a short press/move threshold works in the PWA.
  const handleDragEnter = (index) => {
    const from = dragIndex.current;
    if (from === null || from === index) return;
    const list = itemsRef.current;
    const fromPlace = list[from];
    const targetPlace = list[index];

    const isFromFixed = from > 0 && lockedPlaceIds.has(fromPlace?.id);
    const isTargetFixed = index > 0 && lockedPlaceIds.has(targetPlace?.id);
    if (isFromFixed || isTargetFixed) return;

    const next = reorderWithFixedSlots(list, lockedPlaceIds, from, index);
    if (!next || sameOrder(next, list)) return;

    setItems(next);
    dragIndex.current = index;
  };

  const moveItemOrder = (fromIndex, toIndex) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      toIndex >= items.length
    ) {
      return;
    }
    const list = itemsRef.current;
    const fromPlace = list[fromIndex];
    const toPlace = list[toIndex];
    const isFromFixed = fromIndex > 0 && lockedPlaceIds.has(fromPlace?.id);
    const isToFixed = toIndex > 0 && lockedPlaceIds.has(toPlace?.id);
    if (isFromFixed || isToFixed) return;

    const next = reorderWithFixedSlots(list, lockedPlaceIds, fromIndex, toIndex);
    if (!next || sameOrder(next, list)) return;

    const before = itemsRef.current;
    if (before) {
      setHistory((h) => [...h, before]);
    }
    setItems(next);
  };

  const handleDragEnd = () => {
    const before = dragStartOrder.current;
    if (before && !sameOrder(before, itemsRef.current)) {
      setHistory((h) => [...h, before]);
    }
    dragIndex.current = null;
    dragStartOrder.current = null;
    setDraggingId(null);
  };

  const clearPointerTimer = () => {
    if (pointerDrag.current.timer) {
      clearTimeout(pointerDrag.current.timer);
      pointerDrag.current.timer = null;
    }
  };

  const beginPointerReorder = (index) => {
    const list = itemsRef.current;
    if (!list[index] || list.length < 2) return;
    pointerDrag.current.active = true;
    pointerDrag.current.from = index;
    dragIndex.current = index;
    dragStartOrder.current = list;
    setDraggingId(list[index].id);

    if (pointerDrag.current.pointerId !== null && listRef.current) {
      const row = listRef.current.querySelector(`[data-place-index="${index}"]`);
      try {
        row?.setPointerCapture(pointerDrag.current.pointerId);
      } catch {
        // ignore
      }
    }
  };

  const movePointerReorder = (clientY) => {
    if (dragIndex.current === null || !listRef.current) return;
    const rows = listRef.current.querySelectorAll("[data-place-index]");
    for (const row of rows) {
      const rect = row.getBoundingClientRect();
      if (clientY >= rect.top && clientY <= rect.bottom) {
        const to = Number(row.getAttribute("data-place-index"));
        if (Number.isFinite(to)) handleDragEnter(to);
        break;
      }
    }
  };

  const resetPointerDrag = () => {
    pointerDrag.current = {
      pointerId: null,
      startX: 0,
      startY: 0,
      from: null,
      active: false,
      timer: null,
    };
  };

  const onPlacePointerDown = (event, index) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    if (event.target.closest("[data-no-drag]")) return;

    const list = itemsRef.current;
    const place = list[index];
    const isFixed = index > 0 && lockedPlaceIds.has(place?.id);
    if (isFixed) return;

    clearPointerTimer();
    pointerDrag.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      from: index,
      active: false,
      timer: null,
    };

    if (event.target.closest("[data-drag-handle]")) {
      event.preventDefault();
      beginPointerReorder(index);
      return;
    }

    if (event.pointerType === "mouse") {
      return;
    }

    pointerDrag.current.timer = setTimeout(() => {
      beginPointerReorder(index);
    }, 120);
  };

  const onPlacePointerMove = (event) => {
    const drag = pointerDrag.current;
    if (drag.from === null) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;

    if (!drag.active) {
      if (Math.hypot(dx, dy) >= 6) {
        clearPointerTimer();
        beginPointerReorder(drag.from);
      } else {
        return;
      }
    }

    if (event.cancelable) {
      event.preventDefault();
    }
    movePointerReorder(event.clientY);
  };

  const onPlacePointerUp = (event) => {
    const wasActive = pointerDrag.current.active;
    clearPointerTimer();
    if (event && pointerDrag.current.pointerId !== null) {
      try {
        if (event.currentTarget.hasPointerCapture?.(pointerDrag.current.pointerId)) {
          event.currentTarget.releasePointerCapture(pointerDrag.current.pointerId);
        }
      } catch {
        // ignore
      }
    }
    resetPointerDrag();
    if (wasActive) {
      didDragRef.current = true;
      handleDragEnd();
    }
  };

  const onMobileResizePointerDown = (event) => {
    if (isDesktop) return;
    if (event.pointerType === "mouse" && event.button !== 0) return;

    const rect = studioRef.current?.getBoundingClientRect();
    if (!rect?.height) return;

    mobileResizeDrag.current = {
      pointerId: event.pointerId,
      startY: event.clientY,
      startPercent: mobileListPercent,
      containerHeight: rect.height,
      removeListeners: null,
    };

    event.preventDefault();

    const handlePointerMove = (moveEvent) => {
      if (moveEvent.pointerId !== event.pointerId) return;
      moveEvent.preventDefault();

      const drag = mobileResizeDrag.current;
      const deltaY = moveEvent.clientY - drag.startY;
      const nextPercent = drag.startPercent - (deltaY / drag.containerHeight) * 100;
      setMobileListPercent(
        clampNumber(nextPercent, MOBILE_LIST_MIN_PERCENT, MOBILE_LIST_MAX_PERCENT),
      );
    };

    const handlePointerEnd = (endEvent) => {
      if (endEvent.pointerId !== event.pointerId) return;
      mobileResizeDrag.current.removeListeners?.();
      mobileResizeDrag.current = {
        pointerId: null,
        startY: 0,
        startPercent: mobileListPercent,
        containerHeight: 1,
        removeListeners: null,
      };
    };

    const removeListeners = () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerEnd);
      window.removeEventListener("pointercancel", handlePointerEnd);
      document.body.style.removeProperty("user-select");
      document.body.style.removeProperty("cursor");
    };

    mobileResizeDrag.current.removeListeners = removeListeners;
    document.body.style.userSelect = "none";
    document.body.style.cursor = "ns-resize";
    window.addEventListener("pointermove", handlePointerMove, { passive: false });
    window.addEventListener("pointerup", handlePointerEnd);
    window.addEventListener("pointercancel", handlePointerEnd);
  };

  const nudgeMobileListSize = (delta) => {
    setMobileListPercent((current) =>
      clampNumber(
        current + delta,
        MOBILE_LIST_MIN_PERCENT,
        MOBILE_LIST_MAX_PERCENT,
      ),
    );
  };

  return (
    <>
    <main
      ref={studioRef}
      className="course-studio min-h-0 flex-1 gap-2 bg-[#f0ecfa] p-2 sm:gap-3 sm:p-3"
      style={{
        "--course-map-size": `${100 - mobileListPercent}%`,
        "--course-list-size": `${mobileListPercent}%`,
      }}
    >
      <div className="course-studio-map relative min-h-0 overflow-hidden rounded-[16px] sm:rounded-[20px]">
        <div className="h-full min-h-0 w-full">
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
            showFloorSelector={isDesktop}
          />
        </div>
      </div>

      <div
        className="course-studio-list flex min-h-0 min-w-0 flex-col gap-2 rounded-[16px] px-3 py-3 sm:gap-[14px] sm:rounded-[20px] sm:px-4 sm:py-4 lg:px-6 lg:py-4"
        style={{ background: "white", boxShadow: "0 2px 12px rgba(92,46,245,0.06)" }}
      >
        <div
          className="-mx-1 -mt-2 mb-1 grid h-11 shrink-0 cursor-ns-resize touch-none grid-cols-[44px_1fr_44px] items-center rounded-t-[16px] px-1 lg:hidden"
          onPointerDown={onMobileResizePointerDown}
        >
          <button
            type="button"
            title="코스 목록 크게 보기"
            aria-label="코스 목록 크게 보기"
            className="flex size-10 cursor-pointer items-center justify-center rounded-full text-[#5c2ef5] transition-colors hover:bg-[#f0ecfa] active:bg-[#e5ddff]"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => nudgeMobileListSize(MOBILE_LIST_STEP_PERCENT)}
          >
            <ChevronUp size={18} />
          </button>
          <span
            role="separator"
            aria-orientation="horizontal"
            aria-valuemin={MOBILE_LIST_MIN_PERCENT}
            aria-valuemax={MOBILE_LIST_MAX_PERCENT}
            aria-valuenow={Math.round(mobileListPercent)}
            aria-label="지도와 코스 장소 목록 영역 크기 조절"
            className="mx-auto flex h-10 w-full max-w-[132px] items-center justify-center"
          >
            <span className="h-1.5 w-16 rounded-full bg-[#d8d3ee]" />
          </span>
          <button
            type="button"
            title="지도 크게 보기"
            aria-label="지도 크게 보기"
            className="flex size-10 cursor-pointer items-center justify-center rounded-full text-[#5c2ef5] transition-colors hover:bg-[#f0ecfa] active:bg-[#e5ddff]"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => nudgeMobileListSize(-MOBILE_LIST_STEP_PERCENT)}
          >
            <ChevronDown size={18} />
          </button>
        </div>

        {/* Editable title */}
        <input
          className="w-full min-w-0 pb-1 text-[18px] font-bold text-[#1a142e] bg-transparent outline-none placeholder-[#ccc8d8] border-b-2 border-transparent focus:border-[#5c2ef5] transition-colors sm:text-[22px] md:text-[26px]"
          style={{ outline: "none" }}
          placeholder={t("courseTitlePlaceholder")}
          value={courseTitle}
          onChange={(e) => setCourseTitle(e.target.value)}
        />

        {/* Action buttons */}
        <div className="flex min-w-0 flex-wrap gap-1.5 sm:gap-[8px]">
          <button
            onClick={undo}
            disabled={history.length === 0}
            title={t("undoTitle")}
            className="flex items-center gap-[5px] border border-[#ccc8d8] rounded-full px-3 py-1.5 text-[11px] text-[#1a142e] bg-white hover:bg-[#f7f5ff] transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white sm:px-[14px] sm:py-[7px] sm:text-[12px]"
          >
            <RotateCcw size={12} /> {t("undo")}
          </button>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-[5px] border border-[#ccc8d8] rounded-full px-3 py-1.5 text-[11px] text-[#1a142e] bg-white hover:bg-[#f7f5ff] transition-colors sm:px-[14px] sm:py-[7px] sm:text-[12px]"
          >
            <Plus size={12} /> {t("addPlace")}
          </button>
          <button
            onClick={handleOptimize}
            disabled={items.length < 2 || routeState.status === "loading"}
            className="flex items-center gap-[5px] border border-[#ccc8d8] rounded-full px-3 py-1.5 text-[11px] text-[#1a142e] bg-white hover:bg-[#f7f5ff] transition-colors disabled:cursor-not-allowed disabled:opacity-40 sm:px-[14px] sm:py-[7px] sm:text-[12px]"
          >
            <Zap size={12} className="text-yellow-500" /> {t("optimize")}
          </button>
          <button
            onClick={handleSave}
            disabled={saveStatus === "saving" || datasetStatus !== "ready"}
            className="flex items-center gap-[5px] rounded-full px-3 py-1.5 text-[11px] text-white bg-[#5c2ef5] hover:bg-[#4a22d4] transition-colors disabled:cursor-not-allowed disabled:opacity-50 sm:px-[14px] sm:py-[7px] sm:text-[12px]"
          >
            <Save size={12} /> {saveStatus === "saving" ? t("savingShort") : t("saveShort")}
          </button>
        </div>

        {/* Drag hint */}
        <p className="flex items-center gap-1.5 text-[11px] text-[#9994ad] sm:text-[12px]">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden="true">
            <path d="M8 6h.01M8 12h.01M8 18h.01M16 6h.01M16 12h.01M16 18h.01" />
          </svg>
          {t("dragHint")}
        </p>

        <div className="rounded-[12px] border border-[#e5e0f2] bg-[#faf9fe] px-3 py-2 sm:py-3">
          <p className="mb-1.5 text-[11px] font-bold text-[#6b6685] sm:mb-2">{t("transportOptions")}</p>
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

        {/* Empty course — guide the user to add their first place */}
        {items.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 rounded-[16px] border-2 border-dashed border-[#d8d3ee] bg-[#faf8ff] px-5 py-10 text-center lg:min-h-0 lg:flex-1 lg:gap-4 lg:py-8">
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

        <div className="flex shrink-0 items-center justify-between gap-2">
          <span className="text-[11px] font-bold text-[#6b6685]">
            코스 장소 {items.length}곳
          </span>
        </div>

        {/* Place cards */}
        <div
          ref={listRef}
          className="flex flex-col gap-[10px] min-h-0 flex-1 overflow-y-auto overscroll-contain pr-0.5"
        >
          {items.map((place, index) => {
            const isStart = index === 0;
            const isManuallyLocked = lockedPlaceIds.has(place.id);
            const isFixed = !isStart && isManuallyLocked;
            const isLocked = isStart || isManuallyLocked;

            return (
            <div
              key={place.id}
              data-place-index={index}
              className="flex min-w-0 items-start gap-2 sm:gap-[12px]"
              onPointerDown={(event) => onPlacePointerDown(event, index)}
              onPointerMove={onPlacePointerMove}
              onPointerUp={onPlacePointerUp}
              onPointerCancel={onPlacePointerUp}
              style={{
                opacity: draggingId === place.id ? 0.4 : 1,
                cursor: isFixed ? "default" : draggingId === place.id ? "grabbing" : "grab",
                touchAction: isFixed ? "pan-y" : "none",
              }}
            >
              <div
                className="mt-2 flex shrink-0 flex-col items-center sm:mt-[14px]"
              >
                <div
                  data-drag-handle={!isFixed ? true : undefined}
                  className={`group relative flex size-6 items-center justify-center rounded-full text-[11px] font-bold transition-all duration-150 sm:size-7 sm:text-[12px] ${
                    isFixed
                      ? "cursor-default opacity-85"
                      : "cursor-pointer active:scale-95 hover:scale-105"
                  }`}
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
                  title={
                    isFixed
                      ? t("unlockOrder")
                      : `${index + 1}번 (선택하여 순서 변경, 또는 드래그)`
                  }
                >
                  <span className="pointer-events-none select-none">{index + 1}</span>
                  {!isFixed && (
                    <select
                      data-no-drag
                      value={index + 1}
                      onChange={(e) => {
                        const targetOrder = parseInt(e.target.value, 10);
                        if (!Number.isNaN(targetOrder)) {
                          moveItemOrder(index, targetOrder - 1);
                        }
                      }}
                      className="absolute inset-0 z-10 size-full cursor-pointer opacity-0 text-ink"
                      title={`${index + 1}번 순서 변경 (선택하여 이동)`}
                      aria-label={`${place.name} 순서 변경`}
                    >
                      {items.map((optPlace, optIdx) => {
                        const isOptFixed = optIdx > 0 && lockedPlaceIds.has(optPlace.id) && optIdx !== index;
                        return (
                          <option key={optIdx} value={optIdx + 1} disabled={isOptFixed}>
                            {optIdx + 1}번 {optIdx === 0 ? `(${t("start")})` : optIdx === items.length - 1 ? `(${t("end")})` : `(${t("via")})`}
                            {isOptFixed ? " [고정됨]" : ""}
                          </option>
                        );
                      })}
                    </select>
                  )}
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
                type="button"
                className={`flex min-w-0 flex-1 items-center gap-2 rounded-[14px] border-2 bg-white p-2.5 text-left transition-all duration-150 sm:gap-[12px] sm:p-[16px] ${
                  isFixed ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
                }`}
                style={{
                  borderColor: hoveredId === place.id ? "#5c2ef5" : "transparent",
                  boxShadow:
                    hoveredId === place.id
                      ? "0 6px 20px rgba(92,46,245,0.12)"
                      : "0 2px 8px rgba(0,0,0,0.05)",
                  opacity: visited.has(place.id) ? 0.6 : 1,
                }}
                onClick={(event) => {
                  if (didDragRef.current) {
                    event.preventDefault();
                    event.stopPropagation();
                    didDragRef.current = false;
                    return;
                  }
                  onPlaceClick?.(place);
                }}
                onMouseEnter={() => setHoveredId(place.id)}
                onMouseLeave={() => setHoveredId(null)}
              >
                <div className="flex-1 min-w-0">
                  <span
                    className={`mb-1.5 inline-block max-w-full truncate rounded-full px-2 py-[3px] text-[10px] font-medium sm:mb-[7px] sm:px-[9px] sm:text-[11px] ${place.categoryStyle}`}
                  >
                    {getPlaceCategoryLabel(place.category, t)}
                  </span>
                  <h3
                    className={`mb-1 truncate text-[14px] font-bold sm:mb-[4px] sm:text-[15px] ${
                      visited.has(place.id)
                        ? "line-through text-[#9994ad]"
                        : "text-[#1a142e]"
                    }`}
                  >
                    {place.name}
                  </h3>
                  <p className="line-clamp-1 text-[12px] leading-[1.5] text-[#6b6685] sm:line-clamp-2">
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
                    className="pointer-events-none size-14 shrink-0 rounded-[10px] object-cover sm:size-[68px]"
                  />
                ) : (
                  <div
                    className="size-14 shrink-0 rounded-[10px] sm:size-[68px]"
                    style={{
                      background: `linear-gradient(135deg,${place.accentColor}22,${place.accentColor}0a)`,
                    }}
                  />
                )}
              </button>

              {/* Per-card controls: visited toggle + order lock + delete */}
              <div
                data-no-drag
                className="mt-2 flex shrink-0 flex-col gap-1 sm:mt-[14px] sm:gap-[6px]"
              >
                <button
                  onClick={() => toggleVisited(place.id)}
                  title={visited.has(place.id) ? t("visitedOff") : t("visitedOn")}
                  aria-pressed={visited.has(place.id)}
                  className="flex size-6 items-center justify-center rounded-full border transition-colors cursor-pointer sm:size-[26px]"
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
                  disabled={isStart}
                  title={
                    isStart
                      ? t("endpointFixed", { point: t("startPoint") })
                      : isLocked
                        ? t("unlockOrder")
                        : t("lockOrder")
                  }
                  aria-label={
                    isStart
                      ? t("orderFixed", { name: place.name })
                      : t("orderAction", {
                          name: place.name,
                          action: isLocked ? t("unlock") : t("lock"),
                        })
                  }
                  aria-pressed={isLocked}
                  className="flex size-6 items-center justify-center rounded-full border transition-colors cursor-pointer disabled:cursor-default sm:size-[26px]"
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
                  className="flex size-6 items-center justify-center rounded-full border border-[#ccc8d8] text-[#9994ad] transition-colors cursor-pointer hover:border-[#ef4444] hover:text-[#ef4444] hover:bg-[#fef2f2] sm:size-[26px]"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            );
          })}
        </div>
      </div>

      {/* 하단 보니 챗은 모바일에서 숨김 (데스크톱은 지도 위 오버레이로 유지) */}
      <div ref={chatOccluderRef} className="course-studio-chat min-w-0 max-lg:hidden">
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
    </>
  );
}
