"use client";

import {
  Billboard,
  Html,
  Line,
  OrbitControls,
  OrthographicCamera,
  useTexture,
} from "@react-three/drei";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Component,
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";
import { CirculationModels } from "@/components/navigation/circulation-models";
import {
  FLOOR_DEFINITIONS,
  FLOOR_ORDER,
  loadFloorNavigation,
  loadNavigationManifest,
} from "@/lib/navigation/navigation-dataset";

const FLOOR_WIDTH = 100;
const DEFAULT_ASPECT_RATIO = 1500 / 2400;

// The course path is a bright white halo under a green core with a pale moving
// dash, so it reads clearly across the stacked floor tiers. A vivid, white-haloed
// marker travels the route. "경로 항상 위" keeps them above the floor stack.
const ROUTE_LINE_COLOR = "#BC7C22"; // ochre (황토) route line — earthy, reads on light map
const ROUTE_DASH_COLOR = "#FFF6E6"; // warm pale dashes flowing over the ochre line
const ROUTE_DASH_SPEED = 1.4; // moving-dash animation speed
// Travelling marker speed in world units per second — constant absolute speed
// regardless of route length (short and long courses move at the same pace).
const ROUTE_MARKER_SPEED = 18;
const ROUTE_MARKER_COLOR = "#BC7C22"; // travelling marker (white halo, ochre core)
// Stop-chip badge gradient: 출발 light ochre → 도착 deep earth-brown.
const MARKER_START_COLOR = "#D6A44C";
const MARKER_END_COLOR = "#7E4E12";

// Rooms are lifted off each floor plan by COLOUR GROUP (segmented from the PNG):
// grey stores sit low, green vertical-circulation rises to a middle band, and the
// pink special zones pop highest — the "colour-group explosion" stacked on top of
// the plan. `height` is the extrude depth (the tier), `color` the top face.
const FLOOR_ROOMS_URL = "/navigation/v2/floor-rooms.json";

function normalizeRoomsByFloor(data) {
  if (!data) return null;
  const normalized = {};
  for (const [floorId, entry] of Object.entries(data)) {
    normalized[floorId] = {
      rooms: entry.rooms ?? [],
      aspect: entry.w > 0 ? entry.h / entry.w : DEFAULT_ASPECT_RATIO,
    };
  }
  return normalized;
}

// Room volumes are optional: a missing or failed asset must not block the
// floor plans. Abort still propagates so unmount cancels the whole wave.
function loadFloorRooms(options) {
  return fetch(FLOOR_ROOMS_URL, {
    cache: "no-cache",
    signal: options?.signal,
  })
    .then((response) => (response.ok ? response.json() : null))
    .then(normalizeRoomsByFloor)
    .catch((error) => {
      if (error.name === "AbortError") throw error;
      return null;
    });
}

function preloadFloorTextures() {
  return Promise.all(
    FLOOR_DEFINITIONS.map((floor) =>
      Promise.resolve(useTexture.preload(floor.imageUrl)).catch(() => null),
    ),
  );
}

function MapLoadingNotice({
  className = "",
  message = "지도 원장 데이터를 확인하는 중",
}) {
  return (
    <div
      className={`flex items-center justify-center bg-[#F7F3EF] ${className}`}
    >
      <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-[#8C817A] shadow-sm">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#00815a]" />
        {message}
      </div>
    </div>
  );
}

// Modest, near-uniform room heights differentiated mainly by COLOUR (like the
// 2.5D reference), so the stack reads at a glance rather than as tall towers.
// Top faces now show the plan artwork; each pillar side wall takes a deep,
// hue-matched tint of its colour group so the column reads the same colour as
// the cell painted on top — dark green for circulation, dark grey for stores.
const ROOM_GROUP_STYLE = {
  store: { color: "#EBE1D2", side: "#DDD4C5", height: 1.7 }, // grey retail cells (warm beige)
  green: { color: "#C7C0B5", side: "#70C0A0", height: 1.85 }, // green circulation (matches top)
  pink: { color: "#CDA7C6", side: "#CCBACC", height: 1.95 }, // pink special zones (matches top)
};
const MIN_ROOM_AREA = 0.00022; // skip sliver traces that read as dirt
const ROOM_BASE_LIFT = 0.12; // sit just above the plan surface
// Route floats just above most room blocks so the line reads on top of the floor
// instead of being hidden behind the extruded rooms.
const ROUTE_HEIGHT = 1.5;
const ROUTE_MARKER_LIFT = 0.3; // travelling / stop markers sit just above the path
// Thin neutral plate framing each plan (the "paper" base, no bulky slab).
const PLATE_THICKNESS = 0.5;
const PLATE_MARGIN = 4;
const PLATE_COLOR = "#FAF5EE"; // bright ivory plate
const ROUTE_CORE_LINE_WIDTH = 6;
// Generous spacing so the tiers read as distinct floating layers, not a
// crammed deck. Used for every view mode in `IndoorMap`.
const TIER_GAP = 32;
const OVERVIEW_CAMERA_OFFSET = new THREE.Vector3(112, 58, 152);
const FLOOR_CAMERA_HEIGHT = 118;
const CAMERA_EPSILON = 0.0001;
const OVERVIEW_MIN_POLAR_ANGLE = 0.55;
const OVERVIEW_MAX_POLAR_ANGLE = 1.42;
const OVERVIEW_ROOM_LIFT = 2.3;
// Small vertical trim so the deck sits dead-centre. Now that the camera refits to
// the true canvas size each frame, centroid framing is already near-centred; a
// slight negative value lifts the deck so the bottom tier clears the chat bar.
// Fraction of the deck height (negative = shift the stack up on screen).
const OVERVIEW_VERTICAL_BIAS = -0.1;
const OVERVIEW_MIN_ZOOM = 0.32;
const OVERVIEW_MAX_ZOOM = 12;

// Chat (and similar HUD) sits above the canvas. Floor / 출발 / 도착 HTML
// labels hide themselves when they overlap that opaque overlay.
const OverlayOccluderContext = createContext(null);

function rectsOverlap(a, b) {
  return (
    a.width > 0 &&
    a.height > 0 &&
    b.width > 0 &&
    b.height > 0 &&
    a.right > b.left &&
    a.left < b.right &&
    a.bottom > b.top &&
    a.top < b.bottom
  );
}

function OccludingHtml({ children, ...htmlProps }) {
  const occluderRef = useContext(OverlayOccluderContext);
  const nodeRef = useRef(null);
  const hiddenRef = useRef(false);

  useFrame(() => {
    const node = nodeRef.current;
    const clip = occluderRef?.current;
    if (!node) return;

    const nextHidden = Boolean(
      clip && clip.offsetParent !== null && rectsOverlap(
        node.getBoundingClientRect(),
        clip.getBoundingClientRect(),
      ),
    );
    if (hiddenRef.current === nextHidden) return;
    hiddenRef.current = nextHidden;
    node.style.visibility = nextHidden ? "hidden" : "visible";
  });

  return (
    <Html {...htmlProps}>
      <div ref={nodeRef}>{children}</div>
    </Html>
  );
}

function collectFloorBounds(floors) {
  const min = new THREE.Vector3(Infinity, Infinity, Infinity);
  const max = new THREE.Vector3(-Infinity, -Infinity, -Infinity);

  for (const floor of floors) {
    const aspect = floor.aspect ?? DEFAULT_ASPECT_RATIO;
    const scale = floor.scale ?? 1;
    const halfW = ((FLOOR_WIDTH + PLATE_MARGIN) * scale) / 2;
    const halfD = ((FLOOR_WIDTH * aspect + PLATE_MARGIN) * scale) / 2;
    const x = floor.offsetX ?? 0;
    const z = floor.offsetZ ?? 0;
    min.min(
      new THREE.Vector3(x - halfW, floor.y - PLATE_THICKNESS, z - halfD),
    );
    max.max(
      new THREE.Vector3(
        x + halfW,
        floor.y + OVERVIEW_ROOM_LIFT + 6,
        z + halfD,
      ),
    );
  }

  return { min, max, center: min.clone().add(max).multiplyScalar(0.5) };
}

function overviewViewBasis() {
  const forward = OVERVIEW_CAMERA_OFFSET.clone().negate().normalize();
  const right = new THREE.Vector3()
    .crossVectors(forward, new THREE.Vector3(0, 1, 0))
    .normalize();
  const up = new THREE.Vector3().crossVectors(right, forward).normalize();
  return { forward, right, up };
}

function fitOverviewCamera(floors, viewport) {
  const bounds = collectFloorBounds(floors);
  const { min, max, center } = bounds;
  const position = center.clone().add(OVERVIEW_CAMERA_OFFSET);
  const { right, up } = overviewViewBasis();
  const viewX = (point) => point.clone().sub(position).dot(right);
  const viewY = (point) => point.clone().sub(position).dot(up);

  let maxX = 0;
  let maxY = 0;
  for (const x of [min.x, max.x]) {
    for (const y of [min.y, max.y]) {
      for (const z of [min.z, max.z]) {
        const point = new THREE.Vector3(x, y, z);
        maxX = Math.max(maxX, Math.abs(viewX(point)));
        maxY = Math.max(maxY, Math.abs(viewY(point)));
      }
    }
  }

  const pad = 24;
  const fitW = Math.max(160, viewport.width - pad * 2);
  const fitH = Math.max(160, viewport.height - pad * 2);
  // Fill the frame with the whole stack (6F included), centered on the deck's
  // centroid. A tall isometric deck is bound by height, so keep the margin thin
  // — just enough that the top/bottom tiers and their labels never clip.
  const fill =
    floors.length >= 8 ? 0.86 : floors.length >= 6 ? 0.9 : floors.length >= 3 ? 0.92 : 0.94;
  const zoom = THREE.MathUtils.clamp(
    Math.min(
      fitW / (2 * Math.max(maxX, 0.01)),
      fitH / (2 * Math.max(maxY, 0.01)),
    ) * fill,
    OVERVIEW_MIN_ZOOM,
    OVERVIEW_MAX_ZOOM,
  );

  // Re-centre vertically: nudge the framing point up the Y axis so the deck sits
  // dead-centre instead of riding high with empty space beneath it.
  const framedCenter = center.clone();
  framedCenter.y += (max.y - min.y) * OVERVIEW_VERTICAL_BIAS;

  return {
    target: framedCenter,
    position: framedCenter.clone().add(OVERVIEW_CAMERA_OFFSET),
    zoom,
  };
}

class MapErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (this.state.failed) {
      return (
        <div className="flex h-full min-h-[260px] w-full items-center justify-center bg-[#F7F3EF] px-6 text-center">
          <div className="rounded-2xl bg-white px-6 py-5 shadow-sm">
            <p className="text-sm font-bold text-[#433C38]">
              지도를 불러오지 못했습니다
            </p>
            <p className="mt-1 text-xs text-[#8C817A]">
              잠시 후 페이지를 다시 열어주세요.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function FloorTexture({ floor, flatView = false, onAspectRatioChange }) {
  const gl = useThree((state) => state.gl);
  const sourceTexture = useTexture(floor.imageUrl);
  const texture = useMemo(() => {
    const configuredTexture = sourceTexture.clone();
    configuredTexture.colorSpace = THREE.SRGBColorSpace;
    configuredTexture.anisotropy = Math.min(
      8,
      gl.capabilities.getMaxAnisotropy(),
    );
    configuredTexture.minFilter = THREE.LinearMipmapLinearFilter;
    configuredTexture.magFilter = THREE.LinearFilter;
    configuredTexture.needsUpdate = true;
    return configuredTexture;
  }, [gl, sourceTexture]);

  useEffect(() => () => texture.dispose(), [texture]);

  const aspectRatio = useMemo(() => {
    const image = texture.image;
    const width = image?.naturalWidth || image?.width || 0;
    const height = image?.naturalHeight || image?.height || 0;
    return width > 0 ? height / width : DEFAULT_ASPECT_RATIO;
  }, [texture]);
  const depth = FLOOR_WIDTH * aspectRatio;

  useEffect(() => {
    onAspectRatioChange?.(aspectRatio);
  }, [aspectRatio, onAspectRatioChange]);

  return (
    <group
      position={flatView ? [0, floor.y, 0] : [floor.offsetX, floor.y, floor.offsetZ]}
      scale={flatView ? [1, 1, 1] : [floor.scale, 1, floor.scale]}
    >
      {/* Thin neutral "paper" plate framing the plan. */}
      {!flatView ? (
        <mesh position={[0, -PLATE_THICKNESS / 2, 0]} renderOrder={0}>
          <boxGeometry
            args={[
              FLOOR_WIDTH + PLATE_MARGIN,
              PLATE_THICKNESS,
              depth + PLATE_MARGIN,
            ]}
          />
          <meshBasicMaterial color={PLATE_COLOR} toneMapped={false} />
        </mesh>
      ) : null}
      <mesh
        position={[0, 0.06, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        renderOrder={2}
      >
        <planeGeometry args={[FLOOR_WIDTH, depth]} />
        <meshBasicMaterial
          map={texture}
          color="#ffffff"
          toneMapped={false}
          side={THREE.FrontSide}
          transparent={floor.cutout}
          alphaTest={floor.cutout ? 0.03 : 0}
          opacity={1}
          depthWrite={!floor.cutout}
        />
      </mesh>
    </group>
  );
}

// Colour-group room volumes lifted off one floor plan. Each traced polygon is
// extruded upward by its colour tier (store < green < pink) — the "colour-group
// explosion" — in the floor's registered frame so it lines up with plan + route.
function roomArea(points) {
  let area = 0;
  for (let i = 0; i < points.length; i += 1) {
    const [u1, v1] = points[i];
    const [u2, v2] = points[(i + 1) % points.length];
    area += u1 * v2 - u2 * v1;
  }
  return Math.abs(area) / 2;
}

function polygonCentroid(points) {
  let area = 0;
  let cx = 0;
  let cy = 0;
  for (let i = 0; i < points.length; i += 1) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    const cross = x1 * y2 - x2 * y1;
    area += cross;
    cx += (x1 + x2) * cross;
    cy += (y1 + y2) * cross;
  }
  area *= 0.5;
  if (Math.abs(area) < 1e-12) {
    const count = points.length;
    return {
      u: points.reduce((sum, point) => sum + point[0], 0) / count,
      v: points.reduce((sum, point) => sum + point[1], 0) / count,
    };
  }
  return { u: cx / (6 * area), v: cy / (6 * area) };
}

function RoomPrisms({ floor, rooms, aspect }) {
  // The plan PNG carries every store name as baked-in artwork (far more than the
  // navigation dataset lists), so we texture each room's roof with the matching
  // slice of the plan — names end up printed on the 3D block tops.
  const sourcePlan = useTexture(floor.imageUrl);
  const planTexture = useMemo(() => {
    const configured = sourcePlan.clone();
    configured.colorSpace = THREE.SRGBColorSpace;
    configured.needsUpdate = true;
    return configured;
  }, [sourcePlan]);
  useEffect(() => () => planTexture.dispose(), [planTexture]);

  // Read back the plan pixels once so we can spot the few near-white cells (big
  // open areas like 이탈리 옆 zones) and tint just those down to the shared cell
  // grey — every other cell keeps its own artwork untouched.
  const sampler = useMemo(() => {
    const image = sourcePlan?.image;
    const iw = image?.naturalWidth || image?.width || 0;
    const ih = image?.naturalHeight || image?.height || 0;
    if (!iw || !ih) return null;
    const scale = Math.min(1, 600 / Math.max(iw, ih));
    const cw = Math.max(1, Math.round(iw * scale));
    const ch = Math.max(1, Math.round(ih * scale));
    const canvas = document.createElement("canvas");
    canvas.width = cw;
    canvas.height = ch;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    ctx.drawImage(image, 0, 0, cw, ch);
    try {
      return ctx.getImageData(0, 0, cw, ch);
    } catch {
      return null;
    }
  }, [sourcePlan]);

  const built = useMemo(() => {
    if (!rooms?.length) return [];
    // Only 6F's big open cell (이탈리 옆 흰색 구역) gets the grey fix; every other
    // floor keeps its white cells as-is.
    const fixWhiteCells = floor.id === "6F";
    // Average a small cluster at the room centre; a near-white result means an
    // untinted open cell. Multiply tint chosen from 6F pixels so the ~245 white
    // lands on the neighbouring grey cells' ~219 (245 × E4/FF ≈ 219).
    const WHITE_CELL_GREY = "#E4E3E5";
    const isWhiteCell = (points) => {
      if (!sampler || !fixWhiteCells) return false;
      const c = polygonCentroid(points);
      let sr = 0;
      let sg = 0;
      let sb = 0;
      let n = 0;
      for (const du of [-0.012, 0, 0.012]) {
        for (const dv of [-0.012, 0, 0.012]) {
          const x = Math.min(
            sampler.width - 1,
            Math.max(0, Math.round((c.u + du) * sampler.width)),
          );
          const y = Math.min(
            sampler.height - 1,
            Math.max(0, Math.round((c.v + dv) * sampler.height)),
          );
          const i = (y * sampler.width + x) * 4;
          sr += sampler.data[i];
          sg += sampler.data[i + 1];
          sb += sampler.data[i + 2];
          n += 1;
        }
      }
      return Math.min(sr, sg, sb) / n >= 238;
    };
    return rooms
      .map((room) => {
        const points = room.points;
        if (!points || points.length < 3) return null;
        if (roomArea(points) < MIN_ROOM_AREA) return null;
        const style = ROOM_GROUP_STYLE[room.g] ?? ROOM_GROUP_STYLE.store;
        const top = isWhiteCell(points) ? WHITE_CELL_GREY : "#ffffff";
        const shape = new THREE.Shape();
        points.forEach(([u, v], i) => {
          const x = (u - 0.5) * FLOOR_WIDTH;
          const z = (v - 0.5) * FLOOR_WIDTH * aspect;
          // Shape lives in local X/Y; after the -90° X rotation below, local Y maps
          // to world −Z and the extrude depth maps to world +Y (upward).
          if (i === 0) shape.moveTo(x, -z);
          else shape.lineTo(x, -z);
        });
        shape.closePath();
        const geometry = new THREE.ExtrudeGeometry(shape, {
          depth: style.height,
          bevelEnabled: false,
        });
        // Re-map the extrude-cap UVs so the top face samples the same texel of the
        // floor plan that sits directly beneath it: u = x/W + 0.5, v = y/D + 0.5
        // (derived to match the base plane's mapping). Side walls use material-1
        // (untextured) so their UVs are irrelevant.
        const position = geometry.attributes.position;
        const uv = geometry.attributes.uv;
        for (let i = 0; i < position.count; i += 1) {
          uv.setXY(
            i,
            position.getX(i) / FLOOR_WIDTH + 0.5,
            position.getY(i) / (FLOOR_WIDTH * aspect) + 0.5,
          );
        }
        uv.needsUpdate = true;
        return { geometry, side: style.side, top };
      })
      .filter(Boolean);
  }, [rooms, aspect, sampler, floor.id]);

  useEffect(() => () => built.forEach((item) => item.geometry.dispose()), [built]);

  if (!built.length) return null;
  return (
    <group
      position={[floor.offsetX, floor.y, floor.offsetZ]}
      scale={[floor.scale, 1, floor.scale]}
    >
      {built.map(({ geometry, side, top }, index) => (
        <mesh
          key={index}
          geometry={geometry}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, ROOM_BASE_LIFT, 0]}
          renderOrder={3}
        >
          {/* material 0 = extrude caps (top/bottom): plan artwork with names.
              material 1 = side walls: flat colour-group tier tint. */}
          <meshBasicMaterial
            attach="material-0"
            map={planTexture}
            color={top}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
          <meshBasicMaterial
            attach="material-1"
            color={side}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

function FloorLabel({ floor }) {
  return (
    <OccludingHtml
      position={[53, floor.y + 1.2, -31]}
      center
      sprite
      style={{ pointerEvents: "none" }}
      zIndexRange={[4, 0]}
    >
      <div className="whitespace-nowrap rounded-full bg-[#3A342F] px-3 py-1 text-[11px] font-bold tracking-wide text-white shadow-[0_3px_10px_rgba(60,45,35,0.22)]">
        {floor.id}
      </div>
    </OccludingHtml>
  );
}

function liftEscalatorPoints(from, to) {
  const dx = to[0] - from[0];
  const dy = to[1] - from[1];
  const dz = to[2] - from[2];
  const runH = Math.hypot(dx, dz);
  if (runH < 0.001 && Math.abs(dy) < 0.001) return [from, to];
  const nx = runH < 0.001 ? 0 : (-dy * dx) / runH;
  const ny = runH;
  const nz = runH < 0.001 ? 0 : (-dy * dz) / runH;
  const length = Math.hypot(nx, ny, nz) || 1;
  const lift = 0.75;
  const ox = (nx / length) * lift;
  const oy = (ny / length) * lift;
  const oz = (nz / length) * lift;
  return [
    [from[0] + ox, from[1] + oy, from[2] + oz],
    [to[0] + ox, to[1] + oy, to[2] + oz],
  ];
}

function toWorldPoint(node, floor, flatView, yLift = 0) {
  const scale = flatView ? 1 : floor.scale;
  const offsetX = flatView ? 0 : floor.offsetX;
  const offsetZ = flatView ? 0 : floor.offsetZ;
  const aspect = floor.aspect ?? DEFAULT_ASPECT_RATIO;
  return [
    offsetX + (node.uv.u - 0.5) * FLOOR_WIDTH * scale,
    floor.y + (flatView ? 0.4 : ROUTE_HEIGHT) + yLift,
    offsetZ + (node.uv.v - 0.5) * FLOOR_WIDTH * aspect * scale,
  ];
}

function RouteMarker({ position, label, name, badgeColor = "#BC7C22" }) {
  return (
    <OccludingHtml
      position={position}
      center
      sprite
      style={{ pointerEvents: "none" }}
      zIndexRange={[5, 1]}
    >
      <div
        className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/95 py-1 pl-1 pr-2.5 backdrop-blur-[1px]"
        style={{
          boxShadow:
            "0 4px 12px rgba(90,55,15,0.22), 0 0 0 1px rgba(188,124,34,0.32)",
        }}
      >
        <span
          className="rounded-full px-2 py-[3px] text-[9px] font-black leading-none text-white"
          style={{ backgroundColor: badgeColor }}
        >
          {label}
        </span>
        {name ? (
          <span
            className="text-[10px] font-bold leading-none"
            style={{ color: "#5A3E10" }}
          >
            {name}
          </span>
        ) : null}
      </div>
    </OccludingHtml>
  );
}

function RouteOverlay({
  graph,
  itinerary,
  visibleFloors,
  flatView,
  overlayOnTop,
}) {
  const markerRef = useRef(null);
  const progressRef = useRef(0);
  const dashLineRefs = useRef(new Map());
  const [motionAllowed, setMotionAllowed] = useState(() =>
    typeof window === "undefined"
      ? false
      : !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setMotionAllowed(!query.matches);

    query.addEventListener("change", handleChange);
    return () => query.removeEventListener("change", handleChange);
  }, []);

  // Animate the moving dashes along the route.
  useFrame((_, delta) => {
    if (!motionAllowed) return;
    dashLineRefs.current.forEach((line) => {
      if (line?.material) line.material.dashOffset -= delta * ROUTE_DASH_SPEED;
    });
  });

  const routeGeometry = useMemo(() => {
    if (!graph || !itinerary) return null;
    const nodesById = new Map(graph.nodes.map((node) => [node.id, node]));
    const placesById = new Map(graph.places.map((place) => [place.id, place]));
    const floorsById = new Map(visibleFloors.map((floor) => [floor.id, floor]));

    // Ordered polylines across the whole journey (floor segments + connector
    // bridges), in travel order, so we can colour them by global progress.
    const raw = [];
    itinerary.legs.forEach((leg) => {
      const conns = flatView ? [] : leg.route.connectorSteps;
      leg.route.floorSegments.forEach((segment, si) => {
        const floor = floorsById.get(segment.floorId);
        if (floor && segment.nodeIds.length >= 2) {
          const points = segment.nodeIds
            .map((nodeId) => nodesById.get(nodeId))
            .filter(Boolean)
            .map((node) => toWorldPoint(node, floor, flatView));
          if (points.length >= 2) {
            raw.push({
              key: `${leg.index}-s${si}-${segment.floorId}`,
              points,
            });
          }
        }
        const conn = conns[si];
        if (conn) {
          const fromFloor = floorsById.get(conn.fromFloor);
          const toFloor = floorsById.get(conn.toFloor);
          const fromNode = nodesById.get(conn.fromNodeId);
          const toNode = nodesById.get(conn.toNodeId);
          if (fromFloor && toFloor && fromNode && toNode) {
            const ends = [
              toWorldPoint(fromNode, fromFloor, false),
              toWorldPoint(toNode, toFloor, false),
            ];
            raw.push({
              key: `${leg.index}-c${si}-${conn.connectorId}`,
              points:
                conn.connectorType === "escalator"
                  ? liftEscalatorPoints(ends[0], ends[1])
                  : ends,
            });
          }
        }
      });
    });

    const segLen = (a, b) =>
      Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
    let totalLen = 0;
    const path = [];
    raw.forEach((line) => {
      line.points.forEach((point) => path.push(point));
      for (let i = 1; i < line.points.length; i += 1) {
        totalLen += segLen(line.points[i - 1], line.points[i]);
      }
    });

    // Stop chips: badge background goes light (출발) → deep (도착) with progress.
    const startColor = new THREE.Color(MARKER_START_COLOR);
    const endColor = new THREE.Color(MARKER_END_COLOR);
    const lastIndex = itinerary.stopPlaceIds.length - 1;
    const markers = itinerary.stopPlaceIds.flatMap((placeId, index) => {
      const place = placesById.get(placeId);
      const node = place ? nodesById.get(place.nodeId) : null;
      const floor = place?.floorId ? floorsById.get(place.floorId) : null;
      if (!node || !floor) return [];
      const f = lastIndex > 0 ? index / lastIndex : 1;
      const badge = startColor.clone().lerp(endColor, f);
      return [
        {
          key: placeId,
          position: toWorldPoint(
            node,
            floor,
            flatView,
            flatView ? 0.15 : ROUTE_MARKER_LIFT,
          ),
          label: index === 0 ? "출발" : index === lastIndex ? "도착" : String(index),
          name: place.name ?? null,
          badgeColor: `#${badge.getHexString()}`,
        },
      ];
    });

    return { lines: raw, markers, path, totalLen };
  }, [flatView, graph, itinerary, visibleFloors]);

  // Travel a marker along the whole route path.
  useFrame((_, delta) => {
    if (!motionAllowed) return;
    const geo = routeGeometry;
    const marker = markerRef.current;
    if (!marker || !geo || geo.path.length < 2 || geo.totalLen <= 0) return;
    // Advance by a fixed world-distance per second so the marker keeps the same
    // absolute speed on every course, long or short.
    progressRef.current += (delta * ROUTE_MARKER_SPEED) / geo.totalLen;
    if (progressRef.current > 1) progressRef.current -= 1;
    const target = progressRef.current * geo.totalLen;
    let acc = 0;
    let pos = geo.path[0];
    for (let i = 1; i < geo.path.length; i += 1) {
      const a = geo.path[i - 1];
      const b = geo.path[i];
      const d = Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]);
      if (acc + d >= target) {
        const t = d ? (target - acc) / d : 0;
        pos = [
          a[0] + (b[0] - a[0]) * t,
          a[1] + (b[1] - a[1]) * t,
          a[2] + (b[2] - a[2]) * t,
        ];
        break;
      }
      acc += d;
      pos = b;
    }
    marker.position.set(
      pos[0],
      pos[1] + (flatView ? 0.15 : ROUTE_MARKER_LIFT),
      pos[2],
    );
  });

  if (!routeGeometry) return null;

  return (
    <>
      {routeGeometry.lines.map((line) => (
        <group key={line.key}>
          <Line
            points={line.points}
            color={ROUTE_LINE_COLOR}
            lineWidth={ROUTE_CORE_LINE_WIDTH}
            // Draw in the transparent pass so it sorts AFTER translucent white
            // faces (roof labels, cut-out floors); otherwise those paint over the
            // opaque line and hide the course.
            transparent
            opacity={1}
            depthTest={!overlayOnTop}
            depthWrite={false}
            toneMapped={false}
            renderOrder={overlayOnTop ? 990 : 12}
            onUpdate={(self) => {
              if (self.material) {
                self.material.depthTest = !overlayOnTop;
                self.material.depthWrite = false;
              }
            }}
          />
          <Line
            ref={(value) => {
              if (value) dashLineRefs.current.set(line.key, value);
              else dashLineRefs.current.delete(line.key);
            }}
            points={line.points}
            color={ROUTE_DASH_COLOR}
            lineWidth={ROUTE_CORE_LINE_WIDTH * 0.42}
            dashed
            dashScale={1}
            dashSize={1.1}
            gapSize={1.1}
            transparent
            opacity={0.9}
            depthTest={!overlayOnTop}
            depthWrite={false}
            toneMapped={false}
            renderOrder={overlayOnTop ? 991 : 13}
            onUpdate={(self) => {
              if (self.material) {
                self.material.depthTest = !overlayOnTop;
                self.material.depthWrite = false;
              }
            }}
          />
        </group>
      ))}
      {routeGeometry.markers.map(({ key, ...marker }) => (
        <RouteMarker key={key} {...marker} />
      ))}
      {routeGeometry.path.length > 1 ? (
        <group ref={markerRef}>
          <Billboard follow>
            <mesh renderOrder={overlayOnTop ? 994 : 14}>
              <circleGeometry args={[1.5, 32]} />
              <meshBasicMaterial
                color="#FFFFFF"
                transparent
                opacity={1}
                depthTest={!overlayOnTop}
                depthWrite={false}
                blending={THREE.NoBlending}
                toneMapped={false}
              />
            </mesh>
            <mesh position={[0, 0, 0.02]} renderOrder={overlayOnTop ? 995 : 15}>
              <circleGeometry args={[0.95, 32]} />
              <meshBasicMaterial
                color={ROUTE_MARKER_COLOR}
                transparent
                opacity={1}
                depthTest={!overlayOnTop}
                depthWrite={false}
                blending={THREE.NoBlending}
                toneMapped={false}
              />
            </mesh>
          </Billboard>
        </group>
      ) : null}
    </>
  );
}

function MapCamera({
  viewMode,
  visibleFloors,
  singleFloorAspectRatio,
  resetSignal,
  onReady,
}) {
  const { size, gl } = useThree();
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const appliedPresetRef = useRef("");
  const readySentRef = useRef(false);
  // Once the user drags/zooms the overview we stop auto-refitting; until then we
  // keep the stack fitted to the *live* canvas size every frame, so a late layout
  // settle (side panel, header, flex) can't leave it small or riding high.
  const interactedRef = useRef(false);
  const singleFloor = viewMode === "floor" ? visibleFloors[0] : null;
  const focusY = singleFloor?.y ?? 0;
  const viewportReady = size.width >= 8 && size.height >= 8;
  const overviewFit =
    !singleFloor && visibleFloors.length && viewportReady
      ? fitOverviewCamera(visibleFloors, size)
      : null;
  const targetZoom = singleFloor
    ? Math.max(
        2.4,
        Math.min(
          (size.width * 0.86) / FLOOR_WIDTH,
          (size.height * 0.84) / (FLOOR_WIDTH * singleFloorAspectRatio),
        ),
      )
    : (overviewFit?.zoom ?? 2.2);
  const presetKey = `${viewMode}:${visibleFloors
    .map((floor) => `${floor.id}@${floor.y}`)
    .join(",")}:${size.width}x${size.height}:${targetZoom.toFixed(4)}:${resetSignal}`;

  const applyPreset = () => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls || !viewportReady) return false;
    if (!singleFloor && !overviewFit) return false;

    const target =
      singleFloor || !overviewFit
        ? new THREE.Vector3(0, focusY, 0)
        : overviewFit.target.clone();
    const position =
      singleFloor || !overviewFit
        ? new THREE.Vector3(0, focusY + FLOOR_CAMERA_HEIGHT, 0.001)
        : overviewFit.position.clone();

    controls.enabled = false;
    controls.enableDamping = false;
    // Both modes pan on drag (Naver-map style) so every place stays reachable
    // when zoomed in; overview keeps rotate as a secondary gesture.
    controls.enablePan = true;
    controls.enableRotate = !singleFloor;
    controls.minPolarAngle = singleFloor ? 0 : OVERVIEW_MIN_POLAR_ANGLE;
    controls.maxPolarAngle = singleFloor
      ? Math.PI
      : OVERVIEW_MAX_POLAR_ANGLE;
    controls.minAzimuthAngle = -Infinity;
    controls.maxAzimuthAngle = Infinity;
    controls.screenSpacePanning = true;
    // LEFT drag / one finger = pan (move the map). In overview, RIGHT drag /
    // two-finger twist = rotate the 3D stack. Wheel / pinch = zoom.
    controls.mouseButtons.LEFT = THREE.MOUSE.PAN;
    controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
    controls.mouseButtons.RIGHT = singleFloor
      ? THREE.MOUSE.PAN
      : THREE.MOUSE.ROTATE;
    controls.touches.ONE = THREE.TOUCH.PAN;
    controls.touches.TWO = singleFloor
      ? THREE.TOUCH.DOLLY_PAN
      : THREE.TOUCH.DOLLY_ROTATE;

    camera.up.set(0, singleFloor ? 0 : 1, singleFloor ? -1 : 0);
    camera.position.copy(position);
    camera.zoom = targetZoom;
    camera.clearViewOffset();
    camera.updateProjectionMatrix();
    controls.target.copy(target);
    controls.update();
    controls.saveState();
    controls.enableDamping = !singleFloor;
    controls.enabled = true;
    interactedRef.current = false;
    appliedPresetRef.current = presetKey;
    if (!readySentRef.current) {
      readySentRef.current = true;
      onReady?.();
    }
    return true;
  };

  // Apply before the browser paints so the default close-up (6F crop) never
  // flashes. Camera pose is set here, not via JSX props — those would reset
  // on every parent re-render and replay the wrong angle.
  useLayoutEffect(() => {
    if (appliedPresetRef.current === presetKey) return;
    applyPreset();
  });

  useFrame(() => {
    if (appliedPresetRef.current !== presetKey) {
      applyPreset();
      return;
    }

    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    // Overview: keep the stack fitted to the live canvas size until the user
    // grabs it. We read the real DOM canvas rect each frame (not React's `size`,
    // which can lag a late layout settle) and refit, so the deck can't stay small
    // or ride high when the side panel / header / flex resolve after first paint.
    if (!singleFloor) {
      if (interactedRef.current || !visibleFloors.length) return;
      const el = gl.domElement;
      const liveW = el.clientWidth;
      const liveH = el.clientHeight;
      if (liveW < 8 || liveH < 8) return;
      const fit = fitOverviewCamera(visibleFloors, { width: liveW, height: liveH });
      const needsRefit =
        Math.abs(camera.zoom - fit.zoom) > 1e-3 ||
        camera.position.distanceTo(fit.position) > CAMERA_EPSILON ||
        controls.target.distanceTo(fit.target) > CAMERA_EPSILON;
      if (needsRefit) {
        camera.position.copy(fit.position);
        camera.zoom = fit.zoom;
        camera.updateProjectionMatrix();
        controls.target.copy(fit.target);
        controls.update();
      }
      return;
    }

    // Zoom-aware pan clamp so every edge store stays reachable. The orthographic
    // camera looks straight down (up = -Z), so screen X → world X and screen Y →
    // world Z; the visible half-extents shrink as the user zooms in.
    const halfViewX = size.width / (2 * camera.zoom);
    const halfViewZ = size.height / (2 * camera.zoom);
    const halfFloorX = FLOOR_WIDTH / 2;
    const halfFloorZ = (FLOOR_WIDTH * singleFloorAspectRatio) / 2;
    // Always allow at least a half-floor of pan in every direction so the map can
    // be dragged up/down/left/right freely — even when the whole floor already
    // fits — instead of snapping back to centre. Zoomed in, the range grows so far
    // edges stay reachable; the cap keeps the floor from being flung off-screen.
    const panMargin = FLOOR_WIDTH * 0.12;
    const maxPanX = Math.max(halfFloorX + panMargin - halfViewX, halfFloorX);
    const maxPanZ = Math.max(halfFloorZ + panMargin - halfViewZ, halfFloorZ);
    const constrainedX = THREE.MathUtils.clamp(
      controls.target.x,
      -maxPanX,
      maxPanX,
    );
    const constrainedZ = THREE.MathUtils.clamp(
      controls.target.z,
      -maxPanZ,
      maxPanZ,
    );
    const needsConstraint =
      Math.abs(controls.target.x - constrainedX) > CAMERA_EPSILON ||
      Math.abs(controls.target.y - focusY) > CAMERA_EPSILON ||
      Math.abs(controls.target.z - constrainedZ) > CAMERA_EPSILON ||
      Math.abs(camera.position.x - constrainedX) > CAMERA_EPSILON ||
      Math.abs(camera.position.y - (focusY + FLOOR_CAMERA_HEIGHT)) >
        CAMERA_EPSILON ||
      Math.abs(camera.position.z - (constrainedZ + 0.001)) > CAMERA_EPSILON;

    if (needsConstraint) {
      controls.target.set(constrainedX, focusY, constrainedZ);
      camera.position.set(
        constrainedX,
        focusY + FLOOR_CAMERA_HEIGHT,
        constrainedZ + 0.001,
      );
      camera.up.set(0, 0, -1);
      controls.update();
    }
  });

  return (
    <>
      <OrthographicCamera
        ref={cameraRef}
        makeDefault
        near={0.1}
        far={800}
      />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        onStart={() => {
          interactedRef.current = true;
        }}
        enableDamping={!singleFloor}
        dampingFactor={0.08}
        enablePan
        enableRotate={!singleFloor}
        enableZoom
        screenSpacePanning
        minPolarAngle={singleFloor ? 0 : OVERVIEW_MIN_POLAR_ANGLE}
        maxPolarAngle={singleFloor ? Math.PI : OVERVIEW_MAX_POLAR_ANGLE}
        minAzimuthAngle={-Infinity}
        maxAzimuthAngle={Infinity}
        minZoom={OVERVIEW_MIN_ZOOM}
        maxZoom={34}
        rotateSpeed={0.62}
        zoomSpeed={0.72}
        mouseButtons={
          singleFloor
            ? {
                LEFT: THREE.MOUSE.PAN,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.PAN,
              }
            : {
                LEFT: THREE.MOUSE.PAN,
                MIDDLE: THREE.MOUSE.DOLLY,
                RIGHT: THREE.MOUSE.ROTATE,
              }
        }
        touches={
          singleFloor
            ? {
                ONE: THREE.TOUCH.PAN,
                TWO: THREE.TOUCH.DOLLY_PAN,
              }
            : {
                ONE: THREE.TOUCH.PAN,
                TWO: THREE.TOUCH.DOLLY_ROTATE,
              }
        }
      />
    </>
  );
}

function FloorStack({
  viewMode,
  visibleFloors,
  resetSignal,
  route,
  routeGraph,
  roomsByFloor,
  floorDatasets,
  overlayOnTop,
  onCameraReady,
}) {
  const [singleFloorAspectRatio, setSingleFloorAspectRatio] = useState(
    DEFAULT_ASPECT_RATIO,
  );
  const floorsWithAspect = useMemo(
    () =>
      visibleFloors.map((floor) => ({
        ...floor,
        aspect: roomsByFloor?.[floor.id]?.aspect ?? DEFAULT_ASPECT_RATIO,
      })),
    [roomsByFloor, visibleFloors],
  );

  return (
    <>
      <ambientLight intensity={1.4} />
      {visibleFloors.map((floor) => {
        const floorRooms = roomsByFloor?.[floor.id];
        const mappedFloor = {
          ...floor,
          aspect: floorRooms?.aspect ?? DEFAULT_ASPECT_RATIO,
        };
        return (
          <group key={floor.id}>
            <FloorTexture
              floor={mappedFloor}
              flatView={viewMode === "floor"}
              onAspectRatioChange={
                viewMode === "floor" ? setSingleFloorAspectRatio : undefined
              }
            />
            {viewMode !== "floor" && floorRooms ? (
              <RoomPrisms
                floor={mappedFloor}
                rooms={floorRooms.rooms}
                aspect={floorRooms.aspect}
              />
            ) : null}
            {viewMode !== "floor" ? <FloorLabel floor={mappedFloor} /> : null}
          </group>
        );
      })}
      <CirculationModels
        visibleFloors={floorsWithAspect}
        floorDatasets={floorDatasets}
        itinerary={route}
        flatView={viewMode === "floor"}
      />
      <RouteOverlay
        graph={routeGraph}
        itinerary={route}
        visibleFloors={floorsWithAspect}
        flatView={viewMode === "floor"}
        overlayOnTop={overlayOnTop}
      />
      <MapCamera
        viewMode={viewMode}
        visibleFloors={floorsWithAspect}
        singleFloorAspectRatio={singleFloorAspectRatio}
        resetSignal={resetSignal}
        onReady={onCameraReady}
      />
    </>
  );
}

function FloorSelector({ selectedView, onSelect }) {
  const [expanded, setExpanded] = useState(false);
  const selectedFloor = FLOOR_DEFINITIONS.find(
    (floor) => floor.id === selectedView,
  );
  const currentLabel =
    selectedView === "route"
      ? "경로층"
      : selectedView === "all"
        ? "전체층"
        : `${selectedFloor?.id} · ${selectedFloor?.title}`;

  const selectView = (view) => {
    onSelect(view);
    setExpanded(false);
  };

  return (
    <div className="absolute right-3 top-3 z-20 w-[220px] rounded-[20px] border border-white/80 bg-white/95 p-3 shadow-[0_14px_38px_rgba(96,78,66,0.16)] backdrop-blur-md md:right-5 md:top-5 md:w-[240px]">
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded((value) => !value)}
        className="flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-[#FBF7F3]"
      >
        <span className="min-w-0">
          <span className="block text-[10px] font-bold tracking-[0.22em] text-[#B4A99F]">
            FLOOR
          </span>
          <span className="mt-1 block truncate text-[14px] font-bold text-[#433C38]">
            {currentLabel}
          </span>
        </span>
        <span
          aria-hidden="true"
          className={`ml-2 text-[14px] text-[#8C817A] transition-transform ${expanded ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {expanded ? (
        <div className="mt-1.5 grid grid-cols-2 gap-1.5 border-t border-[#EFE6DD] pt-2.5">
          {[
            { id: "route", label: "경로층" },
            { id: "all", label: "전체층" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={selectedView === item.id}
              onClick={() => selectView(item.id)}
              className={`rounded-xl px-2.5 py-2.5 text-[12px] font-bold transition-colors ${
                selectedView === item.id
                  ? "bg-[#00815a] text-white"
                  : "bg-[#F1E9E2] text-[#8C817A] hover:bg-[#EADFD6]"
              }`}
            >
              {item.label}
            </button>
          ))}

          {[...FLOOR_DEFINITIONS].reverse().map((floor) => (
            <button
              key={floor.id}
              type="button"
              aria-label={`${floor.id} ${floor.title} 단면 지도 보기`}
              aria-pressed={selectedView === floor.id}
              onClick={() => selectView(floor.id)}
              className={`rounded-xl px-2 py-2 text-center transition-colors ${
                selectedView === floor.id
                  ? "bg-[#433C38] text-white"
                  : "bg-[#F1E9E2] text-[#8C817A] hover:bg-[#EADFD6]"
              }`}
            >
              <span className="block text-[12px] font-extrabold leading-tight">
                {floor.id}
              </span>
              <span className="mt-1 block truncate text-[10px] font-semibold leading-tight opacity-85">
                {floor.title}
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export function IndoorMap({
  route,
  routeFloorIds = FLOOR_ORDER,
  routeGraph,
  overlayOccluderRef = null,
}) {
  // Default to the "route floors" view: with no course it equals the full stack
  // (routeFloorIds falls back to every floor), and once a course exists it shows
  // only the relevant floors — cleaner at a glance. Users can pick 전체층/단면.
  const [selectedView, setSelectedView] = useState("route");
  const [overlayOnTop, setOverlayOnTop] = useState(true);
  const [resetSignal, setResetSignal] = useState(0);
  const [datasetStatus, setDatasetStatus] = useState("loading");
  const [viewReady, setViewReady] = useState(false);
  const [roomsByFloor, setRoomsByFloor] = useState(null);
  const [floorDatasets, setFloorDatasets] = useState(null);
  const handleCameraReady = useCallback(() => {
    setViewReady(true);
  }, []);
  const routeFloorIdSet = useMemo(
    () =>
      new Set(
        routeFloorIds.filter((floorId) => FLOOR_ORDER.includes(floorId)),
      ),
    [routeFloorIds],
  );
  const viewMode = FLOOR_ORDER.includes(selectedView) ? "floor" : selectedView;
  const visibleFloors = useMemo(() => {
    const floors =
      viewMode === "floor"
        ? FLOOR_DEFINITIONS.filter((floor) => floor.id === selectedView)
        : viewMode === "route"
          ? FLOOR_DEFINITIONS.filter((floor) => routeFloorIdSet.has(floor.id))
          : FLOOR_DEFINITIONS;

    if (viewMode === "floor") return floors;

    // Re-space the visible tiers evenly with a generous gap so overview and
    // route stacks read as distinct floating layers rather than a crammed deck.
    return floors.map((floor, index) => ({
      ...floor,
      y: index * TIER_GAP,
    }));
  }, [routeFloorIdSet, selectedView, viewMode]);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    // One wave: floor graph + room prisms. Painting before rooms arrive
    // shows only the flat PNG planes, then Suspense remounts RoomPrisms
    // and the stack looks like it "loads twice".
    Promise.all([
      loadNavigationManifest({ signal }),
      loadFloorRooms({ signal }),
      preloadFloorTextures(),
      ...FLOOR_ORDER.map((floorId) => loadFloorNavigation(floorId, { signal })),
    ])
      .then(([manifest, rooms, _textures, ...floors]) => {
        const storeCount = floors.reduce(
          (total, floor) =>
            total +
            floor.places.filter((place) => place.placeType === "STORE").length,
          0,
        );

        if (
          floors.length !== FLOOR_ORDER.length ||
          storeCount !== manifest.summary.storePlaceCount
        ) {
          throw new Error("Navigation dataset summary mismatch");
        }

        setRoomsByFloor(rooms);
        setFloorDatasets(floors);
        setDatasetStatus("ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setDatasetStatus("error");
      });

    return () => controller.abort();
  }, []);

  if (datasetStatus === "loading") {
    return (
      <MapLoadingNotice className="h-full min-h-[260px] w-full" />
    );
  }

  if (datasetStatus === "error") {
    return (
      <div className="flex h-full min-h-[260px] w-full items-center justify-center bg-[#F7F3EF] px-6 text-center">
        <div className="rounded-2xl bg-white px-6 py-5 shadow-sm">
          <p className="text-sm font-bold text-[#433C38]">
            지도 원장 데이터를 확인할 수 없습니다
          </p>
          <p className="mt-1 text-xs text-[#8C817A]">
            잠시 후 페이지를 다시 열어주세요.
          </p>
        </div>
      </div>
    );
  }

  return (
    <MapErrorBoundary>
      <div className="relative isolate z-0 h-full min-h-[260px] w-full bg-[radial-gradient(circle_at_center,#FDFBF8_0%,#F7F3EF_52%,#F1E9E2_100%)]">
        <div
          className={
            viewMode === "floor"
              ? "absolute bottom-[82px] left-0 right-0 top-0 z-0 isolate overflow-hidden cursor-grab active:cursor-grabbing [transform:translateZ(0)] md:bottom-[92px]"
              : "absolute inset-0 z-0 isolate overflow-hidden cursor-grab active:cursor-grabbing [transform:translateZ(0)]"
          }
        >
          <Canvas
            dpr={[1, 1.75]}
            gl={{ antialias: true, alpha: true }}
          >
            <OverlayOccluderContext.Provider value={overlayOccluderRef}>
              <Suspense fallback={null}>
                <FloorStack
                  viewMode={viewMode}
                  visibleFloors={visibleFloors}
                  resetSignal={resetSignal}
                  route={route}
                  routeGraph={routeGraph}
                  roomsByFloor={roomsByFloor}
                  floorDatasets={floorDatasets}
                  overlayOnTop={overlayOnTop}
                  onCameraReady={handleCameraReady}
                />
              </Suspense>
            </OverlayOccluderContext.Provider>
          </Canvas>
        </div>

        <FloorSelector selectedView={selectedView} onSelect={setSelectedView} />

        <div className="absolute bottom-3 left-3 z-20 flex flex-wrap items-center gap-1.5 md:bottom-5 md:left-5">
          <button
            type="button"
            aria-pressed={overlayOnTop}
            aria-label={
              overlayOnTop
                ? "경로와 마커를 층 위에 항상 표시 중. 끄면 위층에 가려집니다."
                : "경로와 마커가 위층에 가려집니다. 켜면 항상 위에 표시합니다."
            }
            onClick={() => setOverlayOnTop((value) => !value)}
            className={`rounded-full border px-3 py-1.5 text-[9px] font-semibold shadow-sm transition-colors md:text-[10px] ${
              overlayOnTop
                ? "border-[#00815a]/30 bg-[#00815a] text-white"
                : "border-white/80 bg-white/90 text-[#8C817A] hover:text-[#00815a]"
            }`}
          >
            경로 항상 위
          </button>
          <button
            type="button"
            onClick={() => setResetSignal((value) => value + 1)}
            className="rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[9px] font-semibold text-[#8C817A] shadow-sm transition-colors hover:text-[#00815a] md:text-[10px]"
          >
            시점 초기화
          </button>
        </div>

        {!viewReady ? (
          <MapLoadingNotice className="absolute inset-0 z-30" />
        ) : null}
      </div>
    </MapErrorBoundary>
  );
}
