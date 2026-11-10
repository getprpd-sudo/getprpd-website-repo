from pathlib import Path

from PIL import Image, ImageEnhance, ImageFilter, ImageOps


ROOT = Path(__file__).resolve().parents[1]
PHOTO_WORK = ROOT / "operations" / "source-documents" / "reference" / "batch-8-photo-work" / "images" / "batch-8"
SOURCE = PHOTO_WORK / "raw"
OUTPUT = PHOTO_WORK / "menu-ready"

NAMES = {
    "batch8-01.jpg": "chicken-enchilada-bake.webp",
    "batch8-02.jpg": "strawberry-cheesecake-protein-pancakes.webp",
    "batch8-03.jpg": "chicken-shakshuka.webp",
    "batch8-04.jpg": "buffalo-chicken-pinwheels.webp",
    "batch8-05.jpg": "pepper-steak-bowl.webp",
    "batch8-06.jpg": "creamy-chicken-parmesan.webp",
    "batch8-07.jpg": "mediterranean-chicken-hummus-box.webp",
    "batch8-08.jpg": "prpd-protein-box.webp",
    "batch8-09.jpg": "lemon-pepper-tilapia.webp",
    "batch8-10.jpg": "tandoori-chicken.webp",
    "batch8-11.jpg": "chocolate-peanut-butter-protein-brownie.webp",
    "batch8-12.jpg": "high-protein-beef-lasagna.webp",
    "batch8-13.jpg": "mediterranean-chicken-bowl.webp",
}

# Source-pixel crops are measured after EXIF orientation is applied. These
# three public-menu photos were shot vertically, so a deliberate 4:3 crop
# keeps the food upright and fills the card without inventing any pixels.
FOCUS_CROPS = {
    "batch8-02.jpg": (100, 1350, 4184, 4413),
    "batch8-04.jpg": (500, 1900, 4100, 4600),
    "batch8-11.jpg": (650, 2000, 3900, 4438),
}


def tray_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    """Find the substantial dark tray/food area while ignoring tiny backdrop marks."""
    thumb = image.copy()
    thumb.thumbnail((720, 960), Image.Resampling.LANCZOS)
    gray = ImageOps.grayscale(thumb)
    mask = gray.point(lambda value: 255 if value < 205 else 0)

    width, height = mask.size
    pixels = mask.load()
    min_col_count = max(8, int(height * 0.025))
    min_row_count = max(8, int(width * 0.025))
    columns = [sum(1 for y in range(height) if pixels[x, y]) for x in range(width)]
    rows = [sum(1 for x in range(width) if pixels[x, y]) for y in range(height)]

    active_x = [index for index, count in enumerate(columns) if count >= min_col_count]
    active_y = [index for index, count in enumerate(rows) if count >= min_row_count]
    if not active_x or not active_y:
        return (0, 0, image.width, image.height)

    scale_x = image.width / width
    scale_y = image.height / height
    left = int(min(active_x) * scale_x)
    right = int((max(active_x) + 1) * scale_x)
    top = int(min(active_y) * scale_y)
    bottom = int((max(active_y) + 1) * scale_y)

    pad_x = int((right - left) * 0.07)
    pad_y = int((bottom - top) * 0.07)
    return (
        max(0, left - pad_x),
        max(0, top - pad_y),
        min(image.width, right + pad_x),
        min(image.height, bottom + pad_y),
    )


def process(source_path: Path, output_path: Path) -> None:
    with Image.open(source_path) as opened:
        image = ImageOps.exif_transpose(opened).convert("RGB")

    # Conservative camera corrections only; no content is synthesized or removed.
    image = ImageOps.autocontrast(image, cutoff=(0.25, 0.25), preserve_tone=True)
    image = ImageEnhance.Brightness(image).enhance(1.025)
    image = ImageEnhance.Contrast(image).enhance(1.025)
    image = ImageEnhance.Color(image).enhance(1.035)
    image = image.filter(ImageFilter.UnsharpMask(radius=1.3, percent=80, threshold=4))

    focus_crop = FOCUS_CROPS.get(source_path.name)
    if focus_crop:
        crop = image.crop(focus_crop)
        canvas = ImageOps.fit(
            crop,
            (1600, 1200),
            method=Image.Resampling.LANCZOS,
            centering=(0.5, 0.5),
        )
    else:
        crop = image.crop(tray_bbox(image))
        crop.thumbnail((1560, 1160), Image.Resampling.LANCZOS)
        canvas = Image.new("RGB", (1600, 1200), (248, 247, 243))
        x = (canvas.width - crop.width) // 2
        y = (canvas.height - crop.height) // 2
        canvas.paste(crop, (x, y))
    canvas.save(output_path, "WEBP", quality=91, method=6)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for source_name, output_name in NAMES.items():
        source_path = SOURCE / source_name
        if not source_path.exists():
            raise FileNotFoundError(source_path)
        process(source_path, OUTPUT / output_name)
    print(f"Created {len(NAMES)} non-generative menu images in {OUTPUT}")


if __name__ == "__main__":
    main()
