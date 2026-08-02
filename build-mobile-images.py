"""Generate half-width "-sm" variants of every content image, for mobile srcset.

Phones were being served the full desktop files — a 1920px hero on a 390px
screen. Run after build-images.py. Idempotent: skips anything already current.
"""
from PIL import Image
import os

OUT = r"C:\Users\lawnm\jt-land-and-lawn\public\images"

# Logos, icons and the lightbox originals are already the right size or are
# only fetched on demand, so they stay as they are.
SKIP_SUBSTRINGS = ("-sm.", "-large.", "logo-", "chat-avatar", "og-")


def wanted(name):
    if not name.endswith(".webp"):
        return False
    return not any(s in name for s in SKIP_SUBSTRINGS)


made = saved = 0
for name in sorted(os.listdir(OUT)):
    if not wanted(name):
        continue

    src = os.path.join(OUT, name)
    dst = os.path.join(OUT, name[:-5] + "-sm.webp")
    if os.path.exists(dst) and os.path.getmtime(dst) >= os.path.getmtime(src):
        continue

    im = Image.open(src)
    w = max(1, im.width // 2)
    h = max(1, round(im.height * w / im.width))
    im.resize((w, h), Image.LANCZOS).save(dst, "WEBP", quality=74, method=6)

    before = os.path.getsize(src)
    after = os.path.getsize(dst)
    saved += before - after
    made += 1
    print(f"  {os.path.basename(dst):<62} {w}x{h}  {after // 1024}KB  (from {before // 1024}KB)")

print(f"\n{made} mobile variants, {saved / 1024 / 1024:.1f} MB lighter than serving the originals")
