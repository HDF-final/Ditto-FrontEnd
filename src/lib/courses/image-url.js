const S3_IMAGE_BASE = "https://hdf-ditto-images.s3.ap-northeast-2.amazonaws.com";
const CLOUDFRONT_IMAGE_BASE = "https://d1bxld598du04o.cloudfront.net";
const CLOUDFRONT_HOST = "d1bxld598du04o.cloudfront.net";

function encodeObjectKey(key) {
  return encodeURI(String(key || "").replace(/^\/+/, "")).replace(/#/g, "%23");
}

function isCommunityUploadPath(pathname) {
  return pathname === "/images" || pathname.startsWith("/images/");
}

function isPlacePicturePath(pathname) {
  return pathname === "/place-picture" || pathname.startsWith("/place-picture/");
}

export function normalizeImageUrl(value) {
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;
  if (raw.startsWith("data:") || raw.startsWith("blob:")) {
    return raw;
  }
  if (isCommunityUploadPath(raw)) {
    return `${S3_IMAGE_BASE}/${encodeObjectKey(raw)}`;
  }
  if (raw.startsWith("/")) return raw;

  try {
    const url = new URL(raw);
    if (url.hostname === CLOUDFRONT_HOST && isCommunityUploadPath(url.pathname)) {
      return `${S3_IMAGE_BASE}${url.pathname}${url.search}`;
    }
    return url.href;
  } catch {
    const key = raw.replace(/^\/+/, "");
    if (key.startsWith("images/") || key.startsWith("course/")) {
      return `${S3_IMAGE_BASE}/${encodeObjectKey(key)}`;
    }
    if (key.startsWith("place-picture/")) {
      return `${CLOUDFRONT_IMAGE_BASE}/${encodeObjectKey(key)}`;
    }
    return raw;
  }
}

export function isPlacePictureImageUrl(value) {
  const raw = normalizeImageUrl(value);
  if (!raw) return false;

  try {
    return isPlacePicturePath(new URL(raw).pathname);
  } catch {
    return isPlacePicturePath(raw);
  }
}

export function pickCoursePlaceImage(sourcePlace, catalogPlace) {
  const sourceImage = getImageUrl(sourcePlace);
  const catalogImage = getImageUrl(catalogPlace);

  return catalogImage || sourceImage;
}

export function getImageUrl(source) {
  if (!source) return null;
  if (typeof source === "string") return normalizeImageUrl(source);

  const directCandidates = [
    source.imageUrl,
    source.image_url,
    source.placeImg,
    source.place_img,
    source.thumbnailUrl,
    source.thumbnail_url,
    source.representativeImageUrl,
    source.representative_image_url,
    source.coverImageUrl,
    source.cover_image_url,
    source.mainImageUrl,
    source.main_image_url,
    source.url,
    source.src,
    source.path,
    source.s3Url,
    source.s3_url,
    source.objectUrl,
    source.object_url,
  ];

  if (typeof source.image === "string") {
    directCandidates.push(source.image);
  } else if (source.image && typeof source.image === "object") {
    directCandidates.push(
      source.image.url,
      source.image.imageUrl,
      source.image.image_url,
      source.image.s3Url,
      source.image.s3_url,
      source.image.objectUrl,
      source.image.object_url,
      source.image.path,
    );
  }

  directCandidates.push(
    source.imageKey,
    source.image_key,
    source.s3Key,
    source.s3_key,
    source.objectKey,
    source.object_key,
    source.fileKey,
    source.file_key,
    source.storageKey,
    source.storage_key,
  );

  for (const candidate of directCandidates) {
    const url = normalizeImageUrl(candidate);
    if (url) return url;
  }

  if (Array.isArray(source.images)) {
    for (const image of source.images) {
      const url = getImageUrl(image);
      if (url) return url;
    }
  }

  if (Array.isArray(source.imageUrls)) {
    for (const image of source.imageUrls) {
      const url = normalizeImageUrl(image);
      if (url) return url;
    }
  }

  return null;
}
