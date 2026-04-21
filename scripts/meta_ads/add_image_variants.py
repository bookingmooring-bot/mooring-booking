"""
Add 3 localized image variants per country to the existing live (paused) ad sets.
Deletes the old "Image-Simplicity" ad (which used the older creatives) and replaces
it with 3 new image ads using ad-visuals-final/ad_{02,07,08}_{lang}_*.png.

Final state per country: 1 video ad + 3 image ads = 4 ads total.

Usage:
    python add_image_variants.py --dry-run --countries IT
    python add_image_variants.py --countries IT
    python add_image_variants.py --countries IT,GR,ES,FR
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

from dotenv import load_dotenv

if __package__ in (None, ""):
    HERE = Path(__file__).resolve().parent
    sys.path.insert(0, str(HERE.parent))
    from meta_ads.api_client import MetaAdsClient  # type: ignore
    from meta_ads.config import CAMPAIGNS  # type: ignore
else:
    from .api_client import MetaAdsClient
    from .config import CAMPAIGNS


# Existing live campaigns (from run_20260421_210047.json + run_20260421_210215.json + run_20260421_210254.json)
EXISTING = {
    "IT": {
        "adset_id": "120246279628280750",
        "form_id": "4452068251717447",
        "old_image_ad_id": "120246279630760750",
    },
    "GR": {
        "adset_id": "120246279641150750",
        "form_id": "1018545937165393",
        "old_image_ad_id": "120246279644520750",
    },
    "ES": {
        "adset_id": "120246279650990750",
        "form_id": "2064397954432624",
        "old_image_ad_id": "120246279654150750",
    },
    "FR": {
        "adset_id": "120246279666450750",
        "form_id": "4367091826904885",
        "old_image_ad_id": "120246279669240750",
    },
}

# Map country -> list of (variant_number, filename in ad-visuals-final/)
NEW_IMAGES = {
    "IT": [
        ("02", "ad_02_italian_1776780862101.png"),
        ("07", "ad_07_italian_1776780882733.png"),
        ("08", "ad_08_italian_1776780828057.png"),
    ],
    "GR": [
        ("02", "ad_02_greek_1776780931426.png"),
        ("07", "ad_07_greek_1776780778059.png"),
        ("08", "ad_08_greek_1776780803507.png"),
    ],
    "ES": [
        ("02", "ad_02_spanish_1776780742394.png"),
        ("07", "ad_07_spanish_1776780956818.png"),
        ("08", "ad_08_spanish_1776781018235.png"),
    ],
    "FR": [
        ("02", "ad_02_french_1776780705371.png"),
        ("07", "ad_07_french_1776780760783.png"),
        ("08", "ad_08_french_1776780984154.png"),
    ],
}

# Angle per variant index — pairs with copy deck slots (0..4 headlines/primary/descriptions)
# 02 = simplicity (slot 1), 07 = fomo/value (slot 2), 08 = novelty/early (slot 3)
VARIANT_COPY_SLOT = {"02": 1, "07": 2, "08": 3}
VARIANT_ANGLE_NAME = {"02": "Simplicity", "07": "Value", "08": "Novelty"}


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--countries", default="IT,GR,ES,FR")
    p.add_argument("--dry-run", action="store_true")
    p.add_argument("--variants", default="02,07,08", help="Which variants to create (comma-separated)")
    p.add_argument("--skip-delete", action="store_true", help="Don't delete the old image ad (use when retrying)")
    p.add_argument(
        "--visuals-dir",
        default=str(Path(__file__).resolve().parent.parent.parent / "ad-visuals-final"),
        help="Directory containing ad_{02,07,08}_{lang}_*.png files",
    )
    return p.parse_args()


def load_env() -> dict[str, str]:
    script_dir = Path(__file__).resolve().parent
    env_path = script_dir / ".env"
    if env_path.exists():
        load_dotenv(env_path)
    required = ["META_AD_ACCOUNT_ID", "META_USER_ACCESS_TOKEN", "META_PAGE_ID"]
    missing = [k for k in required if not os.getenv(k)]
    if missing:
        raise RuntimeError(f"Missing env vars: {', '.join(missing)}")
    return {
        "ad_account_id": os.environ["META_AD_ACCOUNT_ID"],
        "access_token": os.environ["META_USER_ACCESS_TOKEN"],
        "page_id": os.environ["META_PAGE_ID"],
        "app_id": os.getenv("META_APP_ID"),
        "app_secret": os.getenv("META_APP_SECRET"),
    }


def process_country(
    client: MetaAdsClient,
    cc: str,
    visuals_dir: Path,
    dry_run: bool,
    variants_filter: list[str],
    skip_delete: bool,
) -> dict:
    cfg = CAMPAIGNS[cc]
    ex = EXISTING[cc]
    selected = [(v, fn) for v, fn in NEW_IMAGES[cc] if v in variants_filter]
    print(f"\n━━━ {cc} ({cfg.lang_cap}) — adding {len(selected)} variant(s) [{','.join(v for v, _ in selected)}] to adset {ex['adset_id']} ━━━")

    # 1. Verify selected images exist on disk
    missing = [fn for _, fn in selected if not (visuals_dir / fn).exists()]
    if missing:
        raise FileNotFoundError(f"Missing visuals for {cc}: {missing}")

    results: dict = {"country": cc, "variants": []}

    # 2. Delete old image ad (idempotent — 404/already-deleted is fine)
    if skip_delete:
        print(f"  [1/3] ⏭  skipping delete of {ex['old_image_ad_id']} (--skip-delete)")
    elif not dry_run:
        import requests
        r = requests.delete(
            f"https://graph.facebook.com/v20.0/{ex['old_image_ad_id']}",
            params={"access_token": os.environ["META_USER_ACCESS_TOKEN"]},
            timeout=30,
        )
        if r.ok:
            print(f"  [1/3] ✓ delete old ad {ex['old_image_ad_id']} → 200: {r.text[:80]}")
        else:
            print(f"  [1/3] ⚠ old ad delete returned {r.status_code} (may already be deleted): {r.text[:120]}")
    else:
        print(f"  [1/3] [DRY-RUN] Would DELETE ad {ex['old_image_ad_id']}")
    results["deleted_old_ad"] = ex["old_image_ad_id"]

    # 3. Upload + create creative + create ad, per variant
    for variant_num, filename in selected:
        angle = VARIANT_ANGLE_NAME[variant_num]
        slot = VARIANT_COPY_SLOT[variant_num]
        print(f"  [2/3] Variant {variant_num} ({angle})")

        # Override assets_dir for this upload
        original_dir = client.assets_dir
        client.assets_dir = visuals_dir
        try:
            img_hash = client.upload_image(filename)
        finally:
            client.assets_dir = original_dir

        creative_id = client.create_image_creative(
            cfg=cfg,
            image_hash=img_hash,
            form_id=ex["form_id"],
            headline=cfg.headlines[slot],
            primary_text=cfg.primary_texts[slot],
            description=cfg.descriptions[slot],
        )

        ad_name = f"{cc}-Image-{angle}-{variant_num}"
        ad_id = client.create_ad(ex["adset_id"], creative_id, ad_name)

        results["variants"].append({
            "variant": variant_num,
            "angle": angle,
            "filename": filename,
            "image_hash": img_hash,
            "creative_id": creative_id,
            "ad_id": ad_id,
            "ad_name": ad_name,
        })

    return results


def main() -> int:
    args = parse_args()
    countries = [c.strip().upper() for c in args.countries.split(",") if c.strip()]
    unknown = [c for c in countries if c not in EXISTING]
    if unknown:
        print(f"✖ Unknown: {unknown}. Valid: {list(EXISTING.keys())}")
        return 2

    env = load_env()
    visuals_dir = Path(args.visuals_dir)
    if not visuals_dir.is_dir():
        print(f"✖ Visuals dir does not exist: {visuals_dir}")
        return 2

    mode = "DRY-RUN" if args.dry_run else "LIVE"
    print(f"\n{'═' * 60}")
    print(f"  ADD 3 IMAGE VARIANTS PER COUNTRY  [{mode}]")
    print(f"{'═' * 60}")
    print(f"  Visuals: {visuals_dir}")
    print(f"  Countries: {', '.join(countries)}")

    client = MetaAdsClient(
        access_token=env["access_token"],
        ad_account_id=env["ad_account_id"],
        page_id=env["page_id"],
        assets_dir=visuals_dir,
        app_id=env["app_id"],
        app_secret=env["app_secret"],
        dry_run=args.dry_run,
    )
    if not args.dry_run:
        client.validate_access()

    variants_filter = [v.strip() for v in args.variants.split(",") if v.strip()]
    all_results = []
    errors = []
    for cc in countries:
        try:
            all_results.append(process_country(client, cc, visuals_dir, args.dry_run, variants_filter, args.skip_delete))
        except Exception as e:
            print(f"  ✖ {cc} failed: {e}")
            errors.append({"country": cc, "error": str(e)})

    output_dir = Path(__file__).resolve().parent / "output"
    output_dir.mkdir(exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    out_path = output_dir / f"variants_{ts}{'_dry' if args.dry_run else ''}.json"
    out_path.write_text(
        json.dumps({"mode": mode, "timestamp": ts, "results": all_results, "errors": errors}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )

    print(f"\n{'═' * 60}")
    print(f"  SUMMARY — {len(all_results)}/{len(countries)} processed")
    print(f"{'═' * 60}")
    for r in all_results:
        print(f"  ✓ {r['country']}: 3 variants added")
        for v in r["variants"]:
            print(f"      {v['ad_name']} → ad={v['ad_id']}")
    for e in errors:
        print(f"  ✖ {e['country']}: {e['error']}")
    print(f"\n  Summary: {out_path}")

    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
