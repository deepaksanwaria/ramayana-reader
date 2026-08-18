from pathlib import Path
from urllib.request import urlopen
import ssl

BASE = "https://raw.githubusercontent.com/bhavykhatri/DharmicData/main/ValmikiRamayana/"
FILES = [
    "1_balakanda.json",
    "2_ayodhyakanda.json",
    "3_aranyakanda.json",
    "4_kishkindhakanda.json",
    "5_sundarakanda.json",
    "6_yudhhakanda.json",
    "7_uttarakanda.json",
]

ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "data"
DATA.mkdir(exist_ok=True)

ctx = ssl.create_default_context()

for name in FILES:
    target = DATA / name
    url = BASE + name
    print("Downloading", name)
    try:
        with urlopen(url, context=ctx) as r:
            target.write_bytes(r.read())
    except Exception as e:
        print("  ERROR:", e)
        continue
    print("  saved:", target)

print("\nDone. Start the site with: python -m http.server 8000")
