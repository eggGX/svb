from pathlib import Path
from PIL import Image

ROOT = Path('cardData')
WIDTH = 240
QUALITY = 80
EXTS = {'.png', '.jpg', '.jpeg', '.webp'}

count = 0
before = 0
after = 0

for src in ROOT.glob('*/images/*'):
    if not src.is_file() or src.suffix.lower() not in EXTS:
        continue

    dst_dir = src.parent.parent / 'thumbnails'
    dst_dir.mkdir(parents=True, exist_ok=True)
    dst = dst_dir / f'{src.stem}.webp'

    with Image.open(src) as im:
        im.load()
        before += src.stat().st_size
        if im.width > WIDTH:
            height = max(1, round(im.height * WIDTH / im.width))
            im = im.resize((WIDTH, height), Image.Resampling.LANCZOS)
        if im.mode not in ('RGB', 'RGBA'):
            im = im.convert('RGBA' if 'A' in im.getbands() else 'RGB')
        im.save(dst, 'WEBP', quality=QUALITY, method=6)
        after += dst.stat().st_size
        count += 1

print(f'generated: {count} thumbnails')
print(f'original: {before / 1024 / 1024:.1f} MB')
print(f'thumbnails: {after / 1024 / 1024:.1f} MB')
if before:
    print(f'ratio: {after / before * 100:.1f}%')
