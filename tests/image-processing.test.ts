import { vi, it, expect } from "vitest";
import sharp from "sharp";
vi.mock("server-only", () => ({}));
import { prepareImage } from "../src/lib/image-processing";
import { calendarDays } from "../src/lib/presentation";
it("compresses catalogue images and creates small previews", async () => {
  const input = await sharp({
    create: { width: 2200, height: 2400, channels: 3, background: "#93485c" },
  })
    .png()
    .toBuffer();
  const result = await prepareImage(input, "catalogue", "image/png", "png");
  const full = await sharp(result.main).metadata();
  const thumb = await sharp(result.thumbnail).metadata();
  expect(full.format).toBe("webp");
  expect(full.width).toBeLessThanOrEqual(1600);
  expect(full.height).toBeLessThanOrEqual(1800);
  expect(thumb.width).toBeLessThanOrEqual(240);
  expect(thumb.height).toBeLessThanOrEqual(240);
});
it("preserves payment evidence while generating a thumbnail", async () => {
  const input = await sharp({
    create: { width: 400, height: 600, channels: 3, background: "white" },
  })
    .png()
    .toBuffer();
  const result = await prepareImage(input, "payment", "image/png", "png");
  expect(result.main).toEqual(input);
  expect(result.mime).toBe("image/png");
  expect((await sharp(result.thumbnail).metadata()).format).toBe("webp");
});
it("rejects undecodable image contents", async () => {
  await expect(
    prepareImage(new Uint8Array([1, 2, 3]), "reference", "image/jpeg", "jpg"),
  ).rejects.toThrow();
});
it("calendar respects leap years and week boundaries", () => {
  expect(calendarDays("2028-02-15", "month")).toHaveLength(29);
  expect(calendarDays("2026-12-29", "week")).toEqual([
    "2026-12-29",
    "2026-12-30",
    "2026-12-31",
    "2027-01-01",
    "2027-01-02",
    "2027-01-03",
    "2027-01-04",
  ]);
});
