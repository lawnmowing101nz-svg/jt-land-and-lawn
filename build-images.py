"""Prepare all site images for JT Land and Lawn from the supplied photo folder."""
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
import os

SRC = r"C:\Users\lawnm\Downloads\JT Land and Lawn"
OUT = r"C:\Users\lawnm\jt-land-and-lawn\public\images"
os.makedirs(OUT, exist_ok=True)

# Photos stored sideways in the supplied folder
ROT_CCW = {3,4,5,6,7,8,11,12,13,15,16,17,18,22,25,26,28,29,32,34,36,38,44,45,51,55,63,67}
ROT_CW = {56}


def load(n):
    im = Image.open(os.path.join(SRC, f"jt-lawn-{n:02d}.jpg")).convert("RGB")
    if n in ROT_CCW:
        im = im.rotate(90, expand=True)
    elif n in ROT_CW:
        im = im.rotate(-90, expand=True)
    return im


def cover(im, w, h, anchor=0.5):
    """Crop to the target aspect (cover), then resize. anchor 0=top, 1=bottom."""
    tr = w / h
    sr = im.width / im.height
    if sr > tr:
        nw = int(im.height * tr)
        left = int((im.width - nw) * 0.5)
        im = im.crop((left, 0, left + nw, im.height))
    else:
        nh = int(im.width / tr)
        top = int((im.height - nh) * anchor)
        im = im.crop((0, top, im.width, top + nh))
    return im.resize((w, h), Image.LANCZOS)


def save(im, name, q=76):
    im.save(os.path.join(OUT, name), "WEBP", quality=q, method=6)
    print(f"  {name}  {im.width}x{im.height}  {os.path.getsize(os.path.join(OUT, name))//1024}KB")


# ---------------------------------------------------------------- heroes
print("heroes")
save(cover(load(57), 1920, 1080, 0.45), "hero-lawn-mowing-saginaw-tx.webp", 74)
save(cover(load(34), 1920, 760, 0.5), "hero-about-jt-land-and-lawn-fort-worth.webp", 74)
save(cover(load(17), 1920, 760, 0.5), "hero-lawn-services-saginaw-tx.webp", 74)
save(cover(load(65), 1920, 760, 0.5), "hero-gallery-lawn-care-fort-worth-tx.webp", 74)
save(cover(load(53), 1920, 760, 0.5), "hero-contact-lawn-care-saginaw-tx.webp", 74)

# ---------------------------------------------------------------- service cards
print("service cards")
CARDS = [
    (10, "lawn-mowing-saginaw-tx.webp"),
    (47, "hedge-trimming-fort-worth-tx.webp"),
    (1,  "overgrown-yard-cleanup-saginaw-tx.webp"),
    (60, "leaf-removal-fort-worth-tx.webp"),
    (61, "junk-removal-saginaw-tx.webp"),
    (44, "mulch-installation-fort-worth-tx.webp"),
    (14, "tree-trimming-saginaw-tx.webp"),
]
for n, name in CARDS:
    save(cover(load(n), 800, 600), name)

# ---------------------------------------------------------------- feature photos
print("feature photos")
save(cover(load(13), 1000, 750), "lawn-care-saginaw-tx-tidy-front-yard.webp")
save(cover(load(63), 1000, 750), "jt-land-and-lawn-work-truck-fort-worth-tx.webp")
save(cover(load(67), 1000, 750), "backyard-lawn-mowing-fort-worth-tx.webp")
save(cover(load(32), 1000, 750), "mowed-front-lawn-stripes-saginaw-tx.webp")
save(cover(load(48), 1000, 750), "green-backyard-lawn-care-saginaw-tx.webp")

# ---------------------------------------------------------------- service detail (wide)
print("service detail")
DETAIL = [
    (32, "detail-lawn-mowing-edging-saginaw-tx.webp"),
    (45, "detail-hedge-trimming-saginaw-tx.webp"),
    (64, "detail-overgrown-lot-clearing-fort-worth-tx.webp"),
    (9,  "detail-leaf-removal-saginaw-tx.webp"),
    (69, "detail-junk-removal-fort-worth-tx.webp"),
    (11, "detail-mulch-beds-saginaw-tx.webp"),
    (25, "detail-tree-trimming-fort-worth-tx.webp"),
]
for n, name in DETAIL:
    save(cover(load(n), 900, 640), name)

# ---------------------------------------------------------------- gallery
print("gallery")
GALLERY = [10, 57, 13, 34, 17, 5, 7, 16, 26, 29, 32, 38, 63, 67, 55, 36,
           65, 52, 53, 48, 58, 20, 21, 30, 33, 49, 35, 37, 46, 47, 50, 59,
           62, 66, 68, 70]
for i, n in enumerate(GALLERY, start=1):
    im = load(n)
    save(cover(im, 700, 525), f"gallery-{i:02d}-lawn-care-saginaw-fort-worth-tx.webp", 72)
    save(cover(im, 1400, 1050), f"gallery-{i:02d}-lawn-care-saginaw-fort-worth-tx-large.webp", 76)
print(f"gallery items: {len(GALLERY)}")

# ---------------------------------------------------------------- logo + favicon
print("logo")
logo = Image.open(os.path.join(SRC, "Logo (2).png")).convert("RGB")
# auto-trim the cream border around the artwork
gray = logo.convert("L")
w, h = gray.size
px = gray.load()
minx, miny, maxx, maxy = w, h, 0, 0
for y in range(0, h, 2):
    for x in range(0, w, 2):
        if px[x, y] < 170:
            if x < minx: minx = x
            if x > maxx: maxx = x
            if y < miny: miny = y
            if y > maxy: maxy = y
pad = 26
box = (max(0, minx - pad), max(0, miny - pad), min(w, maxx + pad), min(h, maxy + pad))
print("  trim box:", box)
mark = logo.crop(box)
lw = 560
save(mark.resize((lw, int(mark.height * lw / mark.width)), Image.LANCZOS), "logo-jt-land-and-lawn.webp", 88)

header = Image.open(os.path.join(SRC, "Logo Header.jpg")).convert("RGB")
save(header.resize((240, 240), Image.LANCZOS), "logo-jt-land-and-lawn-mark.webp", 88)
save(header.resize((160, 160), Image.LANCZOS), "chat-avatar-jt-land-and-lawn.webp", 88)

ICO = os.path.join(r"C:\Users\lawnm\jt-land-and-lawn\public")
header.resize((32, 32), Image.LANCZOS).save(os.path.join(ICO, "favicon-32.png"))
header.resize((180, 180), Image.LANCZOS).save(os.path.join(ICO, "apple-touch-icon.png"))
header.resize((64, 64), Image.LANCZOS).save(
    os.path.join(ICO, "favicon.ico"), sizes=[(16, 16), (32, 32), (48, 48)])
print("  favicon.ico / favicon-32.png / apple-touch-icon.png")

# ---------------------------------------------------------------- og image
print("og image")
og = cover(load(57), 1200, 630, 0.45)
og = ImageEnhance.Brightness(og).enhance(0.62)
overlay = Image.new("RGBA", og.size, (11, 67, 39, 130))
og = Image.alpha_composite(og.convert("RGBA"), overlay).convert("RGB")
d = ImageDraw.Draw(og)
try:
    f1 = ImageFont.truetype("georgiab.ttf", 84)
    f2 = ImageFont.truetype("arialbd.ttf", 34)
    f3 = ImageFont.truetype("arial.ttf", 30)
except Exception:
    f1 = f2 = f3 = ImageFont.load_default()
d.text((600, 240), "JT LAND AND LAWN", font=f1, fill="white", anchor="mm")
d.text((600, 330), "LAWN CARE  ·  SAGINAW & FORT WORTH, TX", font=f2, fill="#CBE3D3", anchor="mm")
d.rectangle([470, 380, 730, 384], fill="#F7F3E8")
d.text((600, 430), "Mowing · Cleanups · Hedges · Mulch · Junk Removal", font=f3, fill="#EDE7D6", anchor="mm")
og.save(os.path.join(OUT, "og-jt-land-and-lawn-saginaw-tx.jpg"), "JPEG", quality=84)
print("  og-jt-land-and-lawn-saginaw-tx.jpg")

print("\ndone")
