import json, base64, urllib.request, urllib.error, time, os, sys

API_KEY = "AIzaSyDnxdNS-_oB-2XYRoRf7V9XDzfv1ATHv_Q"
MODEL = "gemini-2.5-flash-image"
BASE = os.path.expanduser("~/projects/firmware-foundation-studios/public/sprites")
URL = f"https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={API_KEY}"

TRANS = ", transparent background, PNG"
ANIMAL = "soft 3D claymation %s character, cute %s, round body, big gentle eyes, standing front-facing, Pixar style, smooth clay texture, warm studio lighting, soft shadows, game sprite, centered, isolated subject" + TRANS
OBSTACLE = "soft 3D claymation %s, %s, walking side view, Pixar style, smooth clay texture, warm studio lighting, game sprite, centered, isolated subject" + TRANS
ITEM = "soft 3D claymation %s, %s, Pixar style, smooth clay texture, warm studio lighting, game sprite, centered, isolated subject" + TRANS
ENV = "soft 3D claymation %s, %s, Pixar style, game sprite, centered, isolated subject" + TRANS

SPRITES = [
    # === SHARED ANIMALS ===
    ("shared", "turtle.png", ANIMAL % ("turtle", "green sea turtle, patterned shell, kind eyes")),
    ("shared", "fox.png", ANIMAL % ("fox", "orange fox, fluffy tail, clever smile")),
    ("shared", "elephant.png", ANIMAL % ("elephant", "gray baby elephant, big floppy ears, trunk up")),
    ("shared", "giraffe.png", ANIMAL % ("giraffe", "tall spotted giraffe, long neck, gentle face")),
    ("shared", "horse.png", ANIMAL % ("horse", "brown horse, flowing mane, strong build")),
    ("shared", "eagle.png", ANIMAL % ("eagle", "bald eagle, spread wings, golden beak")),

    # === ARK HOPPER OBSTACLES ===
    ("ark-hopper", "sheep.png", OBSTACLE % ("sheep", "fluffy white sheep, curly horns, walking pose")),
    ("ark-hopper", "goat.png", OBSTACLE % ("goat", "brown goat, short horns, beard, walking pose")),
    ("ark-hopper", "chicken.png", OBSTACLE % ("chicken", "white chicken, red comb, pecking walk")),
    ("ark-hopper", "donkey-cart.png", OBSTACLE % ("donkey with cart", "gray donkey pulling wooden cart, side view")),

    # === ARK HOPPER COLLECTIBLES ===
    ("ark-hopper", "olive-branch.png", ITEM % ("olive branch", "green leaves with olives, golden glow")),

    # === ARK HOPPER EFFECTS ===
    ("ark-hopper", "rainbow.png", ENV % ("rainbow arc", "vibrant colors, puffy cloud ends")),
    ("ark-hopper", "water-splash.png", ENV % ("water splash droplets", "blue crystal clear")),
    ("ark-hopper", "rain-cloud.png", ENV % ("dark rain cloud", "raindrops falling, moody but cute")),

    # === ARK HOPPER DECORATIONS ===
    ("ark-hopper", "grass-tuft.png", ENV % ("grass tuft", "green blades, dewy")),
    ("ark-hopper", "flower.png", ENV % ("cherry blossom flower", "pink petals")),
    ("ark-hopper", "wheat.png", ENV % ("wheat stalk", "golden grain")),

    # === NOAH ANIMAL MATCH ===
    ("noah-animal-match", "card-back.png", "soft 3D claymation wooden plank card back, Noah's Ark wood texture, small dove symbol in center, rounded corners, warm brown, Pixar style, game sprite, centered, isolated subject" + TRANS),
    ("noah-animal-match", "butterfly.png", ANIMAL % ("butterfly", "colorful butterfly, blue and purple wings, delicate")),
    ("noah-animal-match", "bear.png", ANIMAL % ("bear", "brown bear, round fluffy body, cute snout")),
    ("noah-animal-match", "owl.png", ANIMAL % ("owl", "brown owl, big round eyes, feathered tufts")),
    ("noah-animal-match", "deer.png", ANIMAL % ("deer", "brown deer, small antlers, gentle spotted coat")),
    ("noah-animal-match", "camel.png", ANIMAL % ("camel", "tan camel, one hump, friendly face, long eyelashes")),
    ("noah-animal-match", "peacock.png", ANIMAL % ("peacock", "colorful peacock, fanned tail feathers, proud stance")),
    ("noah-animal-match", "dolphin.png", ANIMAL % ("dolphin", "gray dolphin, jumping pose, playful smile")),
    ("noah-animal-match", "rooster.png", ANIMAL % ("rooster", "colorful rooster, red comb, green tail feathers")),

    # === MANNA CATCH GOOD ITEMS ===
    ("manna-catch", "honey.png", ITEM % ("honey jar", "glass jar of golden honey, dripping, bee on lid")),
    ("manna-catch", "grapes.png", ITEM % ("grape bunch", "purple grapes, green leaf, juicy")),
    ("manna-catch", "pomegranate.png", ITEM % ("pomegranate", "red pomegranate, split open showing seeds, jewel-like")),
    ("manna-catch", "figs.png", ITEM % ("olive branch", "green olive branch with ripe olives")),
    ("manna-catch", "scroll.png", ITEM % ("ancient scroll", "rolled scroll, golden ends, slight glow")),

    # === MANNA CATCH BAD ITEMS ===
    ("manna-catch", "thorn.png", ITEM % ("cactus", "green cactus with thorns, slightly menacing but cute")),
    ("manna-catch", "stone.png", ITEM % ("river stone", "gray river stone, rough texture, heavy look")),
    ("manna-catch", "snake.png", ITEM % ("snake", "green snake, coiled, cartoon villain expression")),

    # === MANNA CATCH POWER-UPS ===
    ("manna-catch", "wide-basket.png", ITEM % ("woven basket", "wide opening, golden glow border")),
    ("manna-catch", "slow-mo.png", ITEM % ("glowing turtle", "blue glowing turtle, clock symbol, magical aura")),
    ("manna-catch", "magnet.png", ITEM % ("horseshoe magnet", "red and silver horseshoe magnet, pull lines, glowing")),

    # === MANNA CATCH BASKET ===
    ("manna-catch", "basket.png", "soft 3D claymation woven basket, wide mouth opening, brown wicker texture, sturdy handles, Pixar style, smooth clay texture, warm studio lighting, top-down angled view, game sprite, centered, isolated subject" + TRANS),
]

def generate(prompt, out_path, retries=2):
    body = json.dumps({
        "contents": [{"parts": [{"text": f"Generate a 512x512 game sprite: {prompt}"}]}],
        "generationConfig": {"responseModalities": ["TEXT", "IMAGE"]}
    }).encode()
    req = urllib.request.Request(URL, data=body, headers={"Content-Type": "application/json"})
    for attempt in range(retries + 1):
        try:
            resp = urllib.request.urlopen(req, timeout=120)
            data = json.loads(resp.read())
            for cand in data.get("candidates", []):
                for part in cand.get("content", {}).get("parts", []):
                    if "inlineData" in part:
                        img = base64.b64decode(part["inlineData"]["data"])
                        os.makedirs(os.path.dirname(out_path), exist_ok=True)
                        with open(out_path, "wb") as f:
                            f.write(img)
                        return len(img)
            return -1
        except Exception as e:
            if attempt < retries:
                time.sleep(5)
            else:
                print(f"  FAILED after {retries+1} attempts: {e}", flush=True)
                return 0

total = len(SPRITES)
success = 0
failed = []

for i, (subdir, filename, prompt) in enumerate(SPRITES):
    out_path = os.path.join(BASE, subdir, filename)
    if os.path.exists(out_path) and os.path.getsize(out_path) > 1000:
        print(f"[{i+1}/{total}] SKIP {subdir}/{filename} (already exists)", flush=True)
        success += 1
        continue
    print(f"[{i+1}/{total}] Generating {subdir}/{filename}...", flush=True)
    size = generate(prompt, out_path)
    if size and size > 0:
        print(f"  OK ({size:,} bytes)", flush=True)
        success += 1
    else:
        print(f"  FAILED", flush=True)
        failed.append(f"{subdir}/{filename}")
    time.sleep(2)

print(f"\nDone: {success}/{total} sprites generated", flush=True)
if failed:
    print(f"Failed: {', '.join(failed)}", flush=True)
