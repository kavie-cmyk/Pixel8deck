#!/usr/bin/env python3
from __future__ import annotations

from html import unescape
from io import BytesIO
from pathlib import Path
from urllib.parse import unquote, urljoin
from urllib.request import Request, urlopen
import re
import sys

from PIL import Image

BASE = "https://pixel8labs.com"
ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets"
UA = "Mozilla/5.0 (Pixel8DeckPages/1.0)"

CASE_PAGES = {
    "01": "/works/madmeerkat-nft",
    "02": "/works/security",
    "03": "/works/ai-financial-statements",
    "04": "/works/ai-invoice-receipt-scanner",
    "05": "/works/ai-crypto-bookkeeper",
    "06": "/works/ramen-launchpad",
    "07": "/works/stablecoin-payment-platform",
    "08": "/works/mandala-club",
}

# Known first-party URLs are only fallbacks. The script prefers discovering the
# current hashed media path from each live Pixel8Labs page.
FALLBACK_URLS = {
    "02": BASE + "/_next/static/media/gallery-1.3b0bbe59.png",
    "03": BASE + "/_next/static/media/gallery-1.60f5e0ff.png",
    "04": BASE + "/_next/static/media/gallery-1.da532135.png",
    "05": BASE + "/_next/static/media/gallery-1.afef0f6f.png",
    "07": BASE + "/_next/static/media/gallery-1.65259aae.png",
    "10": BASE + "/_next/static/media/stanley.4212d507.jpeg",
    "11": BASE + "/_next/static/media/owen.e58fd656.jpeg",
    "12": BASE + "/_next/static/media/chris.9d76997b.jpeg",
}

FOUNDERS = {
    "10": "stanley.",
    "11": "owen.",
    "12": "chris.",
}


def get_bytes(url: str) -> bytes:
    req = Request(url, headers={"User-Agent": UA, "Accept": "*/*"})
    with urlopen(req, timeout=30) as r:
        return r.read()


def get_text(url: str) -> str:
    return get_bytes(url).decode("utf-8", errors="replace")


def media_paths(html: str) -> list[str]:
    text = unquote(unescape(html))
    text = text.replace("\\u002F", "/").replace("\\/", "/")
    hits = re.findall(
        r"(?:https://pixel8labs\.com)?(/_next/static/media/[^\"'<>\s?&]+?\.(?:png|jpe?g|webp))",
        text,
        flags=re.I,
    )
    out: list[str] = []
    seen: set[str] = set()
    for p in hits:
        if p not in seen:
            seen.add(p)
            out.append(p)
    return out


def choose_case_asset(paths: list[str]) -> str | None:
    blocked = ("logo", "icon", "favicon", "arrow", "chevron", "footer", "social")
    usable = [p for p in paths if not any(x in p.lower() for x in blocked)]
    preferred = [p for p in usable if "gallery-1." in p.lower()]
    galleries = [p for p in usable if "gallery-" in p.lower()]
    ordered = preferred + [p for p in galleries if p not in preferred] + [p for p in usable if p not in galleries]
    return ordered[0] if ordered else None


def save_jpeg(key: str, data: bytes) -> tuple[int, int]:
    im = Image.open(BytesIO(data))
    im.load()
    if im.mode != "RGB":
        if "A" in im.getbands():
            bg = Image.new("RGB", im.size, "#0c0810")
            alpha = im.getchannel("A")
            bg.paste(im.convert("RGB"), mask=alpha)
            im = bg
        else:
            im = im.convert("RGB")
    if max(im.size) > 1800:
        im.thumbnail((1800, 1800), Image.Resampling.LANCZOS)
    OUT.mkdir(parents=True, exist_ok=True)
    target = OUT / f"{key}.jpg"
    im.save(target, "JPEG", quality=90, optimize=True, progressive=True)
    return im.size


def fetch_case(key: str, page_path: str) -> None:
    page_url = urljoin(BASE, page_path)
    html = get_text(page_url)
    paths = media_paths(html)
    chosen = choose_case_asset(paths)
    candidates: list[str] = []
    if chosen:
        candidates.append(urljoin(BASE, chosen))
    if key in FALLBACK_URLS and FALLBACK_URLS[key] not in candidates:
        candidates.append(FALLBACK_URLS[key])
    last_error: Exception | None = None
    for url in candidates:
        try:
            size = save_jpeg(key, get_bytes(url))
            print(f"asset {key}: {size[0]}x{size[1]} <- {url}")
            return
        except Exception as e:  # noqa: BLE001
            last_error = e
            print(f"asset {key}: failed {url}: {e}", file=sys.stderr)
    raise RuntimeError(f"Could not fetch case asset {key} from {page_url}: {last_error}")


def fetch_founders() -> None:
    html = get_text(BASE + "/")
    paths = media_paths(html)
    for key, needle in FOUNDERS.items():
        matches = [p for p in paths if needle in p.lower()]
        candidates = [urljoin(BASE, p) for p in matches]
        fallback = FALLBACK_URLS[key]
        if fallback not in candidates:
            candidates.append(fallback)
        last_error: Exception | None = None
        for url in candidates:
            try:
                size = save_jpeg(key, get_bytes(url))
                print(f"asset {key}: {size[0]}x{size[1]} <- {url}")
                break
            except Exception as e:  # noqa: BLE001
                last_error = e
                print(f"asset {key}: failed {url}: {e}", file=sys.stderr)
        else:
            raise RuntimeError(f"Could not fetch founder asset {key}: {last_error}")


def main() -> None:
    for key, page in CASE_PAGES.items():
        fetch_case(key, page)
    fetch_founders()
    required = ["01", "02", "03", "04", "05", "06", "07", "08", "10", "11", "12"]
    missing = [k for k in required if not (OUT / f"{k}.jpg").exists()]
    if missing:
        raise SystemExit(f"Missing generated assets: {', '.join(missing)}")


if __name__ == "__main__":
    main()
