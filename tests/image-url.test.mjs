import assert from "node:assert/strict";
import test from "node:test";

import {
  getImageUrl,
  isPlacePictureImageUrl,
  pickCoursePlaceImage,
  normalizeImageUrl,
} from "../src/lib/courses/image-url.js";

test("community upload URLs use the S3 provider host, not the map/place CDN", () => {
  assert.equal(
    normalizeImageUrl(
      "https://d1bxld598du04o.cloudfront.net/images/community/posts/2026-08-27/photo.jpg",
    ),
    "https://hdf-ditto-images.s3.ap-northeast-2.amazonaws.com/images/community/posts/2026-08-27/photo.jpg",
  );
});

test("community upload object keys become public S3 URLs", () => {
  assert.equal(
    normalizeImageUrl("images/community/posts/2026-08-27/photo.jpg"),
    "https://hdf-ditto-images.s3.ap-northeast-2.amazonaws.com/images/community/posts/2026-08-27/photo.jpg",
  );
});

test("place-picture object keys stay on the CloudFront host", () => {
  assert.equal(
    normalizeImageUrl("place-picture/109_애플스토어.jpg"),
    "https://d1bxld598du04o.cloudfront.net/place-picture/109_%EC%95%A0%ED%94%8C%EC%8A%A4%ED%86%A0%EC%96%B4.jpg",
  );
});

test("place-picture URLs are recognized after normalization", () => {
  assert.equal(isPlacePictureImageUrl("place-picture/109_애플스토어.jpg"), true);
  assert.equal(
    isPlacePictureImageUrl(
      "https://hdf-ditto-images.s3.ap-northeast-2.amazonaws.com/images/community/posts/2026-08-27/photo.jpg",
    ),
    false,
  );
});

test("catalog images replace stale saved place-picture URLs", () => {
  assert.equal(
    pickCoursePlaceImage(
      {
        imageUrl:
          "https://d1bxld598du04o.cloudfront.net/place-picture/old_애플스토어.jpg",
      },
      {
        image:
          "https://d1bxld598du04o.cloudfront.net/place-picture/109_%EC%95%A0%ED%94%8C%EC%8A%A4%ED%86%A0%EC%96%B4.jpg",
      },
    ),
    "https://d1bxld598du04o.cloudfront.net/place-picture/109_%EC%95%A0%ED%94%8C%EC%8A%A4%ED%86%A0%EC%96%B4.jpg",
  );
});

test("catalog images replace community upload images for course places", () => {
  assert.equal(
    pickCoursePlaceImage(
      {
        imageUrl:
          "https://d1bxld598du04o.cloudfront.net/images/community/posts/2026-08-27/photo.jpg",
      },
      {
        image:
          "https://d1bxld598du04o.cloudfront.net/place-picture/109_%EC%95%A0%ED%94%8C%EC%8A%A4%ED%86%A0%EC%96%B4.jpg",
      },
    ),
    "https://d1bxld598du04o.cloudfront.net/place-picture/109_%EC%95%A0%ED%94%8C%EC%8A%A4%ED%86%A0%EC%96%B4.jpg",
  );
});

test("image object URLs are extracted before object keys", () => {
  assert.equal(
    getImageUrl({
      image: { url: "images/community/posts/2026-08-27/photo.jpg" },
      imageKey: "place-picture/109_애플스토어.jpg",
    }),
    "https://hdf-ditto-images.s3.ap-northeast-2.amazonaws.com/images/community/posts/2026-08-27/photo.jpg",
  );
});
