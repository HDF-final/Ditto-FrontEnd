import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// 지도 원장은 배포본에서 **CloudFront 를 타야 합니다.** 예전 기본값은 `public/` 사본이라
// 도커 빌드가 `NEXT_PUBLIC_CDN_BASE` 를 못 받으면(우리 배포가 그렇습니다 — .env 는 컨테이너를
// 띄울 때만 들어갑니다) 손님이 매번 588KB 를 EC2 에서 퍼 갔습니다. 그 회귀를 여기서 잡습니다.
//
// 모듈이 임포트 시점에 환경변수를 한 번 읽으므로, 경우마다 쿼리를 붙여 새로 들여옵니다.
let importCounter = 0;

async function loadDataset(cdnBase) {
  const previous = process.env.NEXT_PUBLIC_CDN_BASE;
  if (cdnBase === undefined) delete process.env.NEXT_PUBLIC_CDN_BASE;
  else process.env.NEXT_PUBLIC_CDN_BASE = cdnBase;

  try {
    importCounter += 1;
    return await import(
      `../src/lib/navigation/navigation-dataset.js?case=${importCounter}`
    );
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_CDN_BASE;
    else process.env.NEXT_PUBLIC_CDN_BASE = previous;
  }
}

const CDN = "https://d1bxld598du04o.cloudfront.net/course-resource";

test("환경변수가 없으면 CDN 을 쓴다 (배포 기본값)", async () => {
  const dataset = await loadDataset(undefined);

  assert.equal(dataset.USING_CDN_ASSETS, true);
  assert.equal(dataset.NAVIGATION_ASSET_BASE, `${CDN}/navigation/v2`);
  assert.equal(dataset.MAP_IMAGE_BASE, `${CDN}/maps`);
  assert.equal(dataset.NAVIGATION_MANIFEST_URL, `${CDN}/navigation/v2/manifest.json`);
  assert.equal(
    dataset.STORE_NAVIGATION_KEYS_URL,
    `${CDN}/navigation/v2/store-navigation-keys.json`,
  );
  assert.equal(dataset.FLOOR_ROOMS_URL, `${CDN}/navigation/v2/floor-rooms.json`);

  for (const floor of dataset.FLOOR_DEFINITIONS) {
    assert.ok(
      floor.navigationUrl.startsWith(`${CDN}/`),
      `${floor.id} 원장이 로컬 경로입니다: ${floor.navigationUrl}`,
    );
    assert.ok(
      floor.imageUrl.startsWith(`${CDN}/`),
      `${floor.id} 텍스처가 로컬 경로입니다: ${floor.imageUrl}`,
    );
  }
});

test("빈 값을 주면 public/ 사본으로 떨어진다 (CDN 이 막혔을 때의 안전장치)", async () => {
  const dataset = await loadDataset("");

  assert.equal(dataset.USING_CDN_ASSETS, false);
  assert.equal(dataset.NAVIGATION_ASSET_BASE, "/navigation/v2");
  assert.equal(dataset.MAP_IMAGE_BASE, "/maps");
  assert.equal(dataset.FLOOR_DEFINITIONS[0].navigationUrl, "/navigation/v2/b2.json");
  assert.equal(dataset.FLOOR_DEFINITIONS[0].imageUrl, "/maps/floor-b2.png");
});

test("주소를 주면 그걸 쓰고, 끝의 빗금은 떼어 낸다", async () => {
  const dataset = await loadDataset("https://cdn.example.com/course-resource//");

  assert.equal(
    dataset.NAVIGATION_MANIFEST_URL,
    "https://cdn.example.com/course-resource/navigation/v2/manifest.json",
  );
  assert.equal(dataset.MAP_IMAGE_BASE, "https://cdn.example.com/course-resource/maps");
});

// CDN 으로 넘어가도 `public/` 사본은 안전장치로 남겨 둡니다. 코드가 부르는 파일과 사본이
// 어긋나면 폴백이 404 를 냅니다 — 정작 CDN 이 막혔을 때 알게 됩니다.
test("코드가 부르는 파일이 public/ 사본에 전부 있다", async () => {
  const dataset = await loadDataset("");

  const wanted = new Set([
    ...dataset.FLOOR_DEFINITIONS.map((floor) => floor.navigationUrl),
    dataset.NAVIGATION_MANIFEST_URL,
    dataset.STORE_NAVIGATION_KEYS_URL,
    dataset.FLOOR_ROOMS_URL,
  ]);
  const onDisk = new Set(
    (await readdir(path.join(root, "public/navigation/v2"))).map(
      (name) => `/navigation/v2/${name}`,
    ),
  );
  for (const url of wanted) {
    assert.ok(onDisk.has(url), `public 사본에 없습니다: ${url}`);
  }

  const textures = new Set(
    (await readdir(path.join(root, "public/maps"))).map((name) => `/maps/${name}`),
  );
  for (const floor of dataset.FLOOR_DEFINITIONS) {
    assert.ok(textures.has(floor.imageUrl), `public 사본에 없습니다: ${floor.imageUrl}`);
  }
});
