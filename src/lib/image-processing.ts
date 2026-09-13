import "server-only";
import sharp from "sharp";
export async function prepareImage(
  bytes: Uint8Array,
  kind: string,
  mime: string,
  extension: string,
) {
  const input = sharp(bytes, {
    limitInputPixels: 32_000_000,
    animated: false,
    failOn: "error",
  });
  await input.metadata();
  const thumbnail = await input
    .clone()
    .rotate()
    .resize({
      width: 240,
      height: 240,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({ quality: 70 })
    .toBuffer();
  if (kind === "catalogue" || kind === "reference") {
    const main = await input
      .clone()
      .rotate()
      .resize({
        width: 1600,
        height: 1800,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 82 })
      .toBuffer();
    return { main, thumbnail, mime: "image/webp", extension: "webp" };
  }
  return { main: bytes, thumbnail, mime, extension };
}
