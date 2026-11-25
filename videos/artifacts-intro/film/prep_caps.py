"""prep_caps.py : copy captures/*.png into remotion/public/caps/ and write sizes.json (width, height) for the scenes."""
import json, os, shutil
from PIL import Image
R = os.path.dirname(os.path.abspath(__file__)); src = f"{R}/captures"; dst = f"{R}/remotion/public/caps"
os.makedirs(dst, exist_ok=True); sizes = {}
for f in sorted(os.listdir(src)):
    if f.endswith(".png"):
        shutil.copy2(f"{src}/{f}", f"{dst}/{f}"); sizes[f[:-4]] = Image.open(f"{src}/{f}").size
json.dump(sizes, open(f"{dst}/sizes.json", "w"), indent=1)
print(len(sizes), "captures")
