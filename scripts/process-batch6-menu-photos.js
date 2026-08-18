const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const root = path.resolve(__dirname, "..");
const sourceDir = path.join(
  root,
  "private-records",
  "marketing",
  "menu-photos",
  "batch-6-originals",
);
const outputDir = path.join(
  root,
  "assets",
  "images",
  "meals",
  "menu",
  "batch-6-2026-08-15",
);

const photos = [
  ["IMG_9239.JPG", "hot-honey-chicken-sliders"],
  ["IMG_9240.JPG", "harissa-honey-chicken"],
  ["IMG_9241.JPG", "garlic-butter-shrimp-and-rice"],
  ["IMG_9243.JPG", "prpd-beef-bacon-breakfast-sandwich"],
  ["IMG_9244.JPG", "beef-seekh-kabab-shawarma"],
  ["IMG_9245.JPG", "mexican-streetcorn-chicken-bowl"],
  ["IMG_9246.JPG", "loaded-beef-cottage-pie"],
  ["IMG_9248.JPG", "grilled-cheese-breakfast-burrito"],
  ["IMG_9249.JPG", "chocolate-dipped-cookie-dough-balls"],
  ["IMG_9250.JPG", "baked-strawberry-lemon-protein-cheesecake-square"],
];

async function findMealCrop(sourcePath) {
  const sampleWidth = 600;
  const { data, info } = await sharp(sourcePath)
    .rotate()
    .resize({ width: sampleWidth })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  let minX = info.width;
  let minY = info.height;
  let maxX = -1;
  let maxY = -1;

  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      const offset = (y * info.width + x) * 3;
      const dark =
        data[offset] < 75 && data[offset + 1] < 75 && data[offset + 2] < 75;
      if (!dark) continue;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (maxX < 0 || maxY < 0) {
    throw new Error(`Could not locate the meal tray in ${sourcePath}`);
  }

  const xMargin = 40;
  const yMargin = 40;
  const sampleLeft = Math.max(0, minX - xMargin);
  const sampleTop = Math.max(0, minY - yMargin);
  const sampleRight = Math.min(info.width, maxX + xMargin + 1);
  const sampleBottom = Math.min(info.height, maxY + yMargin + 1);
  const metadata = await sharp(sourcePath).rotate().metadata();
  const swapsAxes = [5, 6, 7, 8].includes(metadata.orientation);
  const rotatedWidth = swapsAxes ? metadata.height : metadata.width;
  const rotatedHeight = swapsAxes ? metadata.width : metadata.height;
  const scaleX = rotatedWidth / info.width;
  const scaleY = rotatedHeight / info.height;
  const left = Math.floor(sampleLeft * scaleX);
  const top = Math.floor(sampleTop * scaleY);
  const right = Math.ceil(sampleRight * scaleX);
  const bottom = Math.ceil(sampleBottom * scaleY);

  return {
    left,
    top,
    width: Math.min(rotatedWidth - left, right - left),
    height: Math.min(rotatedHeight - top, bottom - top),
  };
}

async function main() {
  fs.mkdirSync(outputDir, { recursive: true });

  for (const [sourceName, slug] of photos) {
    const sourcePath = path.join(sourceDir, sourceName);
    const crop = await findMealCrop(sourcePath);
    const image = sharp(sourcePath)
      .rotate()
      .extract(crop)
      .resize(1200, 900, {
        fit: "contain",
        background: { r: 247, g: 247, b: 244 },
      });

    await image
      .clone()
      .webp({ quality: 82, effort: 6 })
      .toFile(path.join(outputDir, `${slug}.webp`));

    await image
      .clone()
      .jpeg({ quality: 84, progressive: true, mozjpeg: true })
      .toFile(path.join(outputDir, `${slug}.jpg`));
  }

  const tileWidth = 600;
  const imageHeight = 450;
  const gutter = 12;
  const columns = 2;
  const rows = Math.ceil(photos.length / columns);
  const contactSheet = sharp({
    create: {
      width: tileWidth * columns + gutter,
      height: imageHeight * rows + gutter * (rows - 1),
      channels: 3,
      background: "#f3efe7",
    },
  });
  const composites = [];

  for (let index = 0; index < photos.length; index += 1) {
    const [, slug] = photos[index];
    const left = (index % columns) * (tileWidth + gutter);
    const top = Math.floor(index / columns) * (imageHeight + gutter);
    const photo = await sharp(path.join(outputDir, `${slug}.jpg`))
      .resize(tileWidth, imageHeight)
      .toBuffer();
    composites.push({ input: photo, left, top });
  }

  await contactSheet
    .composite(composites)
    .jpeg({ quality: 86, progressive: true })
    .toFile(path.join(sourceDir, "WEB_READY_CONTACT_SHEET.jpg"));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
