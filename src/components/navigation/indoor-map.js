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
  Suspense,
  useEffect,
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
const ROUTE_LINE_COLOR = "#00815a"; // bright green route line
const ROUTE_DASH_COLOR = "#EEFAF3"; // pale dashes flowing over the green line
const ROUTE_DASH_SPEED = 1.4; // moving-dash animation speed
const ROUTE_MARKER_COLOR = "#00815a"; // travelling marker (white halo, green core)
// Stop-chip badge gradient: 출발 mid-green → 도착 deep green.
const MARKER_START_COLOR = "#3AA378";
const MARKER_END_COLOR = "#00563A";

// Rooms are lifted off each floor plan by COLOUR GROUP (segmented from the PNG):
// grey stores sit low, green vertical-circulation rises to a middle band, and the
// pink special zones pop highest — the "colour-group explosion" stacked on top of
// the plan. `height` is the extrude depth (the tier), `color` the top face.
const FLOOR_ROOMS_URL = "/navigation/v2/floor-rooms.json";
// Modest, near-uniform room heights differentiated mainly by COLOUR (like the
// 2.5D reference), so the stack reads at a glance rather than as tall towers.
const ROOM_GROUP_STYLE = {
  store: { color: "#EBE1D2", height: 1.7 }, // retail rooms — bright champagne
  green: { color: "#C7C0B5", height: 1.85 }, // escalators / vertical circ — soft taupe
  pink: { color: "#CDA7C6", height: 1.95 }, // lounges / special — muted mauve accent
};
const MIN_ROOM_AREA = 0.00022; // skip sliver traces that read as dirt
const ROOM_BASE_LIFT = 0.12; // sit just above the plan surface
// Route runs at corridor height so it weaves into the building, not over the roof.
const ROUTE_HEIGHT = 0.9;
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
const OVERVIEW_MIN_ZOOM = 0.55;
const OVERVIEW_MAX_ZOOM = 12;
const OVERVIEW_DEFAULT_FOCUS_Y = ((FLOOR_ORDER.length - 1) * TIER_GAP) / 2;

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
    max.max(new THREE.Vector3(x + halfW, floor.y + OVERVIEW_ROOM_LIFT, z + halfD));
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

function fitOverviewCamera(floors, viewport, viewMode = "all") {
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

  const padL = 28;
  const padR = 72;
  const padT = 28;
  const padB = 56;
  const fitW = Math.max(160, viewport.width - padL - padR);
  const fitH = Math.max(160, viewport.height - padT - padB);
  // More floors need more air so the whole stack stays in view at a glance.
  // Route view nudges in a little; still framed to keep every floor visible.
  const fill =
    (floors.length >= 6 ? 0.76 : floors.length >= 3 ? 0.84 : 0.92) *
    (viewMode === "route" ? 1.06 : 1);
  const zoom = THREE.MathUtils.clamp(
    Math.min(
      fitW / (2 * Math.max(maxX, 0.01)),
      fitH / (2 * Math.max(maxY, 0.01)),
    ) * fill,
    OVERVIEW_MIN_ZOOM,
    OVERVIEW_MAX_ZOOM,
  );

  // Nudge slightly left so the stack sits in the open map, not under FLOOR.
  const shift = right
    .clone()
    .multiplyScalar((padR - padL) / (2 * zoom))
    .add(up.clone().multiplyScalar((padT - padB) / (2 * zoom)));

  return {
    target: center.clone().add(shift),
    position: position.add(shift),
    zoom,
  };
}

// Lighten/darken a hex colour by factor `f` for the two-tone flat shading.
function shade(hex, f) {
  const value = parseInt(hex.slice(1), 16);
  const r = Math.min(255, Math.round(((value >> 16) & 255) * f));
  const g = Math.min(255, Math.round(((value >> 8) & 255) * f));
  const b = Math.min(255, Math.round((value & 255) * f));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
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

function pointInPolygon(u, v, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i, i += 1) {
    const [ui, vi] = points[i];
    const [uj, vj] = points[j];
    const crosses = vi > v !== vj > v;
    if (
      crosses &&
      u < ((uj - ui) * (v - vi)) / (vj - vi || Number.EPSILON) + ui
    ) {
      inside = !inside;
    }
  }
  return inside;
}

function uvDistance(a, b) {
  const du = a.u - b.u;
  const dv = a.v - b.v;
  return Math.hypot(du, dv);
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

const ROOF_LABEL_WRAPS = {
  "ALT. 1": ["ALT. 1"],
  "정돈 프리미엄": ["정돈", "프리미엄"],
  "포인트 오브 뷰": ["포인트", "오브", "뷰"],
  "6층 TAX REFUND": ["6층", "TAX", "REFUND"],
  "아티스트베이커리": ["아티스트", "베이커리"],
  "런던베이글뮤지엄": ["런던", "베이글", "뮤지엄"],
  "마유유마라탕": ["마유", "마라탕"],
  "도조커피": ["도조", "커피"],
  "비틀스타코": ["비틀스", "타코"],
  "보테가베네타": ["보테가", "베네타"],
  "안내데스크": ["안내", "데스크"],
  "3층 팝업 스튜디오 A": ["3층", "팝업", "스튜디오", "A"],
  "3층 팝업 스튜디오 B": ["3층", "팝업", "스튜디오", "B"],
  "스와로브스키": ["스", "와", "로", "브", "스", "키"],
  "아크테릭스": ["아크", "테릭스"],
  "노스페이스": ["노스", "페이스"],
  "파타고니아": ["파타", "고니아"],
  "윌리엄스소노마": ["윌리엄스", "소노마"],
  "사운즈포레스트": ["사운즈", "포레스트"],
};
const ROOF_LABEL_MATCH_LIMIT = 0.08;

function wrapRoofLabel(name) {
  if (ROOF_LABEL_WRAPS[name]) return ROOF_LABEL_WRAPS[name];
  const words = name.split(/\s+/).filter(Boolean);
  if (words.length >= 3) {
    const mid = Math.ceil(words.length / 2);
    return [words.slice(0, mid).join(" "), words.slice(mid).join(" ")];
  }
  if (words.length === 2 && name.length >= 6) return words;
  return [name];
}

function makeNameTexture(name) {
  const lines = wrapRoofLabel(name);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const font = "700 36px sans-serif";
  const lineHeight = 42;
  context.font = font;
  const textWidth = Math.ceil(
    Math.max(...lines.map((line) => context.measureText(line).width)),
  );
  canvas.width = Math.max(32, textWidth + 12);
  canvas.height = lineHeight * lines.length + 6;
  context.font = font;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillStyle = "#111111";
  lines.forEach((line, index) => {
    context.fillText(
      line,
      canvas.width / 2,
      3 + lineHeight * index + lineHeight / 2,
    );
  });
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  const worldHeight = 1.12 * lines.length;
  return {
    texture,
    width: worldHeight * (canvas.width / canvas.height),
    height: worldHeight,
  };
}

function RoomRoofLabels({ floor, rooms, aspect, dataset }) {
  const labels = useMemo(() => {
    if (!rooms?.length || !dataset) return [];
    const nodesById = new Map(dataset.nodes.map((node) => [node.id, node]));
    const stores = dataset.places.filter(
      (place) => place.placeType === "STORE" && place.name,
    );
    const usableRooms = rooms.filter(
      (room) => room.points?.length >= 3 && roomArea(room.points) >= MIN_ROOM_AREA,
    );
    const namesByRoom = new Map();

    stores.forEach((place) => {
      const node = nodesById.get(place.nodeId);
      const uv = node?.uv;
      if (!uv) return;
      const containing = usableRooms.find((item) =>
        pointInPolygon(uv.u, uv.v, item.points),
      );
      const nearest = usableRooms.reduce((best, item) => {
        const centroid = polygonCentroid(item.points);
        const distance = uvDistance(uv, centroid);
        if (!best || distance < best.distance) return { item, distance };
        return best;
      }, null);
      const room =
        containing ??
        (nearest && nearest.distance <= ROOF_LABEL_MATCH_LIMIT
          ? nearest.item
          : null);
      if (!room) return;
      const current = namesByRoom.get(room) ?? [];
      current.push(place.name);
      namesByRoom.set(room, current);
    });

    return [...namesByRoom.entries()].map(([room, names], index) => {
      const style = ROOM_GROUP_STYLE[room.g] ?? ROOM_GROUP_STYLE.store;
      const centroid = polygonCentroid(room.points);
      const x = (centroid.u - 0.5) * FLOOR_WIDTH;
      const z = (centroid.v - 0.5) * FLOOR_WIDTH * aspect;
      const { texture, width, height } = makeNameTexture(names[0]);
      return {
        id: `${floor.id}-roof-${index}`,
        texture,
        width,
        height,
        position: [x, ROOM_BASE_LIFT + style.height + 0.04, z],
      };
    });
  }, [aspect, dataset, floor.id, rooms]);

  useEffect(
    () => () => labels.forEach((label) => label.texture.dispose()),
    [labels],
  );

  if (!labels.length) return null;

  return (
    <group
      position={[floor.offsetX, floor.y, floor.offsetZ]}
      scale={[floor.scale, 1, floor.scale]}
    >
      {labels.map((label) => (
        <mesh
          key={label.id}
          position={label.position}
          rotation={[-Math.PI / 2, 0, 0]}
          renderOrder={8}
        >
          <planeGeometry args={[label.width, label.height]} />
          <meshBasicMaterial
            map={label.texture}
            transparent
            depthWrite={false}
            toneMapped={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </group>
  );
}

function RoomPrisms({ floor, rooms, aspect }) {
  const built = useMemo(() => {
    if (!rooms?.length) return [];
    return rooms
      .map((room) => {
        const points = room.points;
        if (!points || points.length < 3) return null;
        if (roomArea(points) < MIN_ROOM_AREA) return null;
        const style = ROOM_GROUP_STYLE[room.g] ?? ROOM_GROUP_STYLE.store;
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
        return { geometry, style, side: shade(style.color, 0.94) };
      })
      .filter(Boolean);
  }, [rooms, aspect]);

  useEffect(() => () => built.forEach((item) => item.geometry.dispose()), [built]);

  if (!built.length) return null;
  return (
    <group
      position={[floor.offsetX, floor.y, floor.offsetZ]}
      scale={[floor.scale, 1, floor.scale]}
    >
      {built.map(({ geometry, style, side }, index) => (
        <mesh
          key={index}
          geometry={geometry}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, ROOM_BASE_LIFT, 0]}
          renderOrder={3}
        >
          {/* material 0 = extrude caps (top/bottom), material 1 = side walls */}
          <meshBasicMaterial
            attach="material-0"
            color={style.color}
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
    <Html
      position={[53, floor.y + 1.2, -31]}
      center
      sprite
      style={{ pointerEvents: "none" }}
      zIndexRange={[20, 0]}
    >
      <div className="whitespace-nowrap rounded-full bg-[#3A342F] px-3 py-1 text-[11px] font-bold tracking-wide text-white shadow-[0_3px_10px_rgba(60,45,35,0.22)]">
        {floor.id}
      </div>
    </Html>
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

function RouteMarker({ position, label, name, badgeColor = "#00815a" }) {
  return (
    <Html
      position={position}
      center
      sprite
      style={{ pointerEvents: "none" }}
      zIndexRange={[8, 1]}
    >
      <div className="flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/95 py-1 pl-1 pr-2.5 shadow-[0_4px_12px_rgba(0,70,48,0.22)] ring-1 ring-[#00815a]/25 backdrop-blur-[1px]">
        <span
          className="rounded-full px-2 py-[3px] text-[9px] font-black leading-none text-white"
          style={{ backgroundColor: badgeColor }}
        >
          {label}
        </span>
        {name ? (
          <span className="text-[10px] font-bold leading-none text-[#1f3a30]">
            {name}
          </span>
        ) : null}
      </div>
    </Html>
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
    progressRef.current += delta * 0.12;
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
            depthTest={!overlayOnTop}
            depthWrite={false}
            toneMapped={false}
            renderOrder={overlayOnTop ? 80 : 12}
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
            renderOrder={overlayOnTop ? 81 : 13}
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
            <mesh renderOrder={overlayOnTop ? 200 : 14}>
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
            <mesh position={[0, 0, 0.02]} renderOrder={overlayOnTop ? 201 : 15}>
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
}) {
  const { size } = useThree();
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const appliedPresetRef = useRef("");
  const singleFloor = viewMode === "floor" ? visibleFloors[0] : null;
  const focusY = singleFloor?.y ?? 0;
  const overviewFit = !singleFloor && visibleFloors.length
    ? fitOverviewCamera(visibleFloors, size, viewMode)
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

  useFrame(() => {
    const camera = cameraRef.current;
    const controls = controlsRef.current;
    if (!camera || !controls) return;

    if (appliedPresetRef.current !== presetKey) {
      const target = singleFloor || !overviewFit
        ? new THREE.Vector3(0, focusY, 0)
        : overviewFit.target.clone();
      const position = singleFloor || !overviewFit
        ? new THREE.Vector3(0, focusY + FLOOR_CAMERA_HEIGHT, 0.001)
        : overviewFit.position.clone();

      controls.enabled = false;
      controls.enableDamping = false;
      controls.enablePan = Boolean(singleFloor);
      controls.enableRotate = !singleFloor;
      controls.minPolarAngle = singleFloor ? 0 : OVERVIEW_MIN_POLAR_ANGLE;
      controls.maxPolarAngle = singleFloor
        ? Math.PI
        : OVERVIEW_MAX_POLAR_ANGLE;
      controls.minAzimuthAngle = -Infinity;
      controls.maxAzimuthAngle = Infinity;
      controls.screenSpacePanning = Boolean(singleFloor);
      controls.mouseButtons.LEFT = singleFloor
        ? THREE.MOUSE.PAN
        : THREE.MOUSE.ROTATE;
      controls.mouseButtons.MIDDLE = THREE.MOUSE.DOLLY;
      controls.mouseButtons.RIGHT = singleFloor
        ? THREE.MOUSE.PAN
        : THREE.MOUSE.ROTATE;
      controls.touches.ONE = singleFloor ? THREE.TOUCH.PAN : THREE.TOUCH.ROTATE;
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
      appliedPresetRef.current = presetKey;
      return;
    }

    if (!singleFloor) return;

    const panLimit = FLOOR_WIDTH * singleFloorAspectRatio * 0.45;
    const constrainedZ = THREE.MathUtils.clamp(
      controls.target.z,
      -panLimit,
      panLimit,
    );
    const needsConstraint =
      Math.abs(controls.target.x) > CAMERA_EPSILON ||
      Math.abs(controls.target.y - focusY) > CAMERA_EPSILON ||
      Math.abs(controls.target.z - constrainedZ) > CAMERA_EPSILON ||
      Math.abs(camera.position.x) > CAMERA_EPSILON ||
      Math.abs(camera.position.y - (focusY + FLOOR_CAMERA_HEIGHT)) >
        CAMERA_EPSILON ||
      Math.abs(camera.position.z - (constrainedZ + 0.001)) > CAMERA_EPSILON;

    if (needsConstraint) {
      controls.target.set(0, focusY, constrainedZ);
      camera.position.set(0, focusY + FLOOR_CAMERA_HEIGHT, constrainedZ + 0.001);
      camera.up.set(0, 0, -1);
      controls.update();
    }
  });

  return (
    <>
      <OrthographicCamera
        ref={cameraRef}
        makeDefault
        position={[
          OVERVIEW_CAMERA_OFFSET.x,
          OVERVIEW_DEFAULT_FOCUS_Y + OVERVIEW_CAMERA_OFFSET.y,
          OVERVIEW_CAMERA_OFFSET.z,
        ]}
        near={0.1}
        far={800}
        zoom={1.1}
      />
      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={[0, OVERVIEW_DEFAULT_FOCUS_Y, 0]}
        enableDamping={!singleFloor}
        dampingFactor={0.08}
        enablePan={Boolean(singleFloor)}
        enableRotate={!singleFloor}
        enableZoom
        screenSpacePanning={Boolean(singleFloor)}
        minPolarAngle={singleFloor ? 0 : OVERVIEW_MIN_POLAR_ANGLE}
        maxPolarAngle={singleFloor ? Math.PI : OVERVIEW_MAX_POLAR_ANGLE}
        minAzimuthAngle={-Infinity}
        maxAzimuthAngle={Infinity}
        minZoom={OVERVIEW_MIN_ZOOM}
        maxZoom={14}
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
                LEFT: THREE.MOUSE.ROTATE,
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
                ONE: THREE.TOUCH.ROTATE,
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
  wedgeEscalators,
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
              <>
                <RoomPrisms
                  floor={mappedFloor}
                  rooms={floorRooms.rooms}
                  aspect={floorRooms.aspect}
                />
                <RoomRoofLabels
                  floor={mappedFloor}
                  rooms={floorRooms.rooms}
                  aspect={floorRooms.aspect}
                  dataset={floorDatasets?.find(
                    (entry) => entry.floorId === floor.id,
                  )}
                />
              </>
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
        wedgeEscalators={wedgeEscalators}
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
    <div className="absolute right-3 top-3 z-10 w-[220px] rounded-[20px] border border-white/80 bg-white/95 p-3 shadow-[0_14px_38px_rgba(96,78,66,0.16)] backdrop-blur-md md:right-5 md:top-5 md:w-[240px]">
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
}) {
  // Default to the "route floors" view: with no course it equals the full stack
  // (routeFloorIds falls back to every floor), and once a course exists it shows
  // only the relevant floors — cleaner at a glance. Users can pick 전체층/단면.
  const [selectedView, setSelectedView] = useState("route");
  const [overlayOnTop, setOverlayOnTop] = useState(true);
  const [wedgeEscalators, setWedgeEscalators] = useState(false);
  const [resetSignal, setResetSignal] = useState(0);
  const [datasetStatus, setDatasetStatus] = useState("loading");
  const [roomsByFloor, setRoomsByFloor] = useState(null);
  const [floorDatasets, setFloorDatasets] = useState(null);
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

    Promise.all([
      loadNavigationManifest({ signal: controller.signal }),
      ...FLOOR_ORDER.map((floorId) =>
        loadFloorNavigation(floorId, { signal: controller.signal }),
      ),
    ])
      .then(([manifest, ...floors]) => {
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

        setFloorDatasets(floors);
        setDatasetStatus("ready");
      })
      .catch((error) => {
        if (error.name !== "AbortError") setDatasetStatus("error");
      });

    return () => controller.abort();
  }, []);

  // Colour-group room boxes segmented from the floor PNGs (offline asset).
  useEffect(() => {
    const controller = new AbortController();

    fetch(FLOOR_ROOMS_URL, { cache: "no-cache", signal: controller.signal })
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (!data) return;
        const normalized = {};
        for (const [floorId, entry] of Object.entries(data)) {
          normalized[floorId] = {
            rooms: entry.rooms ?? [],
            aspect: entry.w > 0 ? entry.h / entry.w : DEFAULT_ASPECT_RATIO,
          };
        }
        setRoomsByFloor(normalized);
      })
      .catch((error) => {
        // Non-fatal: the plan textures still render without the room volumes.
        if (error.name !== "AbortError") setRoomsByFloor(null);
      });

    return () => controller.abort();
  }, []);

  if (datasetStatus === "loading") {
    return (
      <div className="flex h-full min-h-[260px] w-full items-center justify-center bg-[#F7F3EF]">
        <div className="flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-semibold text-[#8C817A] shadow-sm">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#00815a]" />
          지도 원장 데이터를 확인하는 중
        </div>
      </div>
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
      <div className="relative h-full min-h-[260px] w-full bg-[radial-gradient(circle_at_center,#FDFBF8_0%,#F7F3EF_52%,#F1E9E2_100%)]">
        <div
          className={
            viewMode === "floor"
              ? "absolute bottom-[82px] left-0 right-0 top-0 cursor-grab active:cursor-grabbing md:bottom-[92px] md:right-[252px]"
              : "absolute inset-0"
          }
        >
          <Canvas
            dpr={[1, 1.75]}
            gl={{ antialias: true, alpha: true }}
          >
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
                wedgeEscalators={wedgeEscalators}
              />
            </Suspense>
          </Canvas>
        </div>

        <FloorSelector selectedView={selectedView} onSelect={setSelectedView} />

        <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[9px] font-medium text-[#8C817A] shadow-sm backdrop-blur-md md:bottom-5 md:text-[10px]">
          {viewMode === "floor"
            ? "드래그 이동 · 스크롤 확대/축소"
            : "드래그 회전 · 스크롤 확대/축소"}
        </div>

        <div className="absolute bottom-3 left-3 z-10 flex flex-wrap items-center gap-1.5 md:bottom-5 md:left-5">
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
          {viewMode !== "floor" ? (
            <button
              type="button"
              aria-pressed={wedgeEscalators}
              aria-label={
                wedgeEscalators
                  ? "에스컬레이터를 층 사이 삼각형 웨지로 표시 중. 끄면 기존 밴드로 돌아갑니다."
                  : "에스컬레이터를 기존 밴드로 표시 중. 켜면 층과 층을 잇는 삼각형 웨지로 바꿉니다."
              }
              onClick={() => setWedgeEscalators((value) => !value)}
              className={`rounded-full border px-3 py-1.5 text-[9px] font-semibold shadow-sm transition-colors md:text-[10px] ${
                wedgeEscalators
                  ? "border-[#00815a]/30 bg-[#00815a] text-white"
                  : "border-white/80 bg-white/90 text-[#8C817A] hover:text-[#00815a]"
              }`}
            >
              에스컬레이터 보기
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => setResetSignal((value) => value + 1)}
            className="rounded-full border border-white/80 bg-white/90 px-3 py-1.5 text-[9px] font-semibold text-[#8C817A] shadow-sm transition-colors hover:text-[#00815a] md:text-[10px]"
          >
            시점 초기화
          </button>
        </div>
      </div>
    </MapErrorBoundary>
  );
}
