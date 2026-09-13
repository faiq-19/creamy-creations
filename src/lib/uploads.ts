export function validateImage(bytes: Uint8Array, type: string, size: number) {
  if (size > 5 * 1024 * 1024 || size < 12)
    throw new Error("Images must be between 12 bytes and 5 MB");
  const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
  const png =
    bytes[0] === 137 && bytes[1] === 80 && bytes[2] === 78 && bytes[3] === 71;
  const webp =
    String.fromCharCode(...bytes.slice(0, 4)) === "RIFF" &&
    String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  if (!(
    (type === "image/jpeg" && jpg) ||
    (type === "image/png" && png) ||
    (type === "image/webp" && webp)
  ))
    throw new Error("Use a JPG, PNG or WebP image");
  return type === "image/jpeg" ? "jpg" : type === "image/png" ? "png" : "webp";
}
