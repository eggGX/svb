from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
from PIL import Image

ROOT = Path('cardData')
WIDTH = 240
QUALITY = 80
EXTS = {'.png', '.jpg', '.jpeg', '.webp'}

sources = [p for p in ROOT.glob('*/images/*') if p.is_file() and p.suffix.lower() in EXTS]

def convert(src: Path):
    dst_dir = src.parent.parent / 'thumbnails'
    dst_dir.mkdir(parents=True, exist_ok=True)
    dst = dst_dir / f'{src.stem}.webp'
    with Image.open(src) as im:
        im.load()
        if im.width > WIDTH:
            height = max(1, round(im.height * WIDTH / im.width))
            im = im.resize((WIDTH, height), Image.Resampling.LANCZOS)
        if im.mode not in ('RGB', 'RGBA'):
            im = im.convert('RGBA' if 'A' in im.getbands() else 'RGB')
        im.save(dst, 'WEBP', quality=QUALITY, method=3)
    return src.stat().st_size, dst.stat().st_size

with ThreadPoolExecutor(max_workers=8) as pool:
    sizes = list(pool.map(convert, sources))

before = sum(x for x, _ in sizes)
after = sum(x for _, x in sizes)
print(f'generated: {len(sizes)} thumbnails')
print(f'original: {before / 1024 / 1024:.1f} MB')
print(f'thumbnails: {after / 1024 / 1024:.1f} MB')
if before:
    print(f'ratio: {after / before * 100:.1f}%')
