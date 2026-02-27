export default function checkMime(mime: any, isAvatar: boolean) {
  const rules = [
    { mime: "video/mp4", ext: "mp4" },
    { mime: "video/webm", ext: "webm" },
    { mime: "video/quicktime", ext: "mov" },

    { mime: "image/jpeg", ext: "jpg" },
    { mime: "image/png", ext: "png" },
    { mime: "image/webp", ext: "webp" },
    { mime: "image/gif", ext: "gif" },
    { mime: "image/avif", ext: "avif" },
  ];

  if (!mime) throw { message: "Mime type missing", statusCode: 400 };

  if (typeof mime !== "string") throw { message: "mimeType is not a string", statusCode: 400 };

  const rule = rules.find((r) => r.mime === mime);
  if (!rule) throw { message: "Wrong mimeType", statusCode: 400 };

  let folder = mime.startsWith("video/") ? "videos" : mime.startsWith("image/") ? "images" : "files";

  if (isAvatar && mime.startsWith("image/")) folder = "avatar";

  return { folder, ext: rule.ext };
}
