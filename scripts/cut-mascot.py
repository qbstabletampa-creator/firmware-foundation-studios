#!/usr/bin/env python
"""
cut-mascot.py - FFS mascot transparent-cut recipe (codified 2026-06-08).

Pipeline: rembg background removal -> alpha threshold <130 (kills the gold-halo
haze fringe) -> autocrop to content -> save RGBA PNG.

Usage:
  python scripts/cut-mascot.py <input.png> <output.png> [threshold]

See wiki: app-shell-standard-splash-onboarding.md (Mascot section).
"""
import sys
from rembg import remove
from PIL import Image

def main():
    if len(sys.argv) < 3:
        print("usage: cut-mascot.py <input> <output> [threshold=130]")
        sys.exit(1)
    src, dst = sys.argv[1], sys.argv[2]
    thresh = int(sys.argv[3]) if len(sys.argv) > 3 else 130

    img = Image.open(src).convert("RGBA")
    cut = remove(img)  # rembg, returns RGBA

    # Threshold the alpha channel: anything below `thresh` becomes fully
    # transparent. This removes the soft halo/glow haze that rembg leaves.
    px = cut.load()
    w, h = cut.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            px[x, y] = (r, g, b, 0 if a < thresh else a)

    # Autocrop to the visible bounding box so the mascot fills the frame.
    bbox = cut.getbbox()
    if bbox:
        cut = cut.crop(bbox)

    cut.save(dst)
    print(f"cut {src} -> {dst}  ({cut.size[0]}x{cut.size[1]}, threshold={thresh})")

if __name__ == "__main__":
    main()
