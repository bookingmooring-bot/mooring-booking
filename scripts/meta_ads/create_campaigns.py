"""
Orchestrator — creates Meta Ads campaigns (paused) for Mooring Booking provider acquisition.

Usage:
    python create_campaigns.py --dry-run --countries IT
    python create_campaigns.py --countries IT
    python create_campaigns.py --countries GR,ES,FR

Required env vars (read from scripts/meta_ads/.env):
    META_AD_ACCOUNT_ID     — e.g. act_1234567890
    META_USER_ACCESS_TOKEN — user token with ads_management + pages_manage_ads + leads_retrieval
    META_PAGE_ID           — numeric Page ID (MooringAps)
    META_APP_ID            — optional but recommended (app_id = 1571638673893958 for MooringAps app)
    META_APP_SECRET        — optional, for app-secret-proof signing
    ASSETS_DIR             — path to folder containing ProviderAd_*.mp4 and ad_*.png
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import time
from datetime import datetime, timezone
from pathlib import Path

# Force UTF-8 stdout so unicode box-drawing and CJK/Greek chars print on Windows
try:
    sys.stdout.reconfigure(encoding="utf-8")
    sys.stderr.reconfigure(encoding="utf-8")
except Exception:
    pass

from dotenv import load_dotenv

# Allow running as script or module
if __package__ in (None, ""):
    HERE = Path(__file__).resolve().parent
    sys.path.insert(0, str(HERE.parent))
    from meta_ads.api_client import MetaAdsClient  # type: ignore
    from meta_ads.config import CAMPAIGNS, CountryCampaign  # type: ignore
else:
    from .api_client import MetaAdsClient
    from .config import CAMPAIGNS, CountryCampaign


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Create Meta Ads campaigns for Mooring Booking")
    p.add_argument(
        "--countries",
        default="IT,GR,ES,FR",
        help="Comma-separated country codes (IT, GR, ES, FR). Default: all 4.",
    )
    p.add_argument("--dry-run", action="store_true", help="Print API payloads without making calls")
    p.add_argument(
        "--output-dir",
        default=str(Path(__file__).resolve().parent / "output"),
        help="Where to write run JSON summary",
    )
    return p.parse_args()


def load_env() -> dict[str, str]:
    script_dir = Path(__file__).resolve().parent
    env_path = script_dir / ".env"
    if env_path.exists():
        load_dotenv(env_path)
    else:
        print(f"⚠ No .env file at {env_path} — relying on process env")

    required = ["META_AD_ACCOUNT_ID", "META_USER_ACCESS_TOKEN", "META_PAGE_ID", "ASSETS_DIR"]
    missing = [k for k in required if not os.getenv(k)]
    if missing:
        raise RuntimeError(f"Missing required env vars: {', '.join(missing)}")

    return {
        "ad_account_id": os.environ["META_AD_ACCOUNT_ID"],
        "access_token": os.environ["META_USER_ACCESS_TOKEN"],
        "page_id": os.environ["META_PAGE_ID"],
        "app_id": os.getenv("META_APP_ID"),
        "app_secret": os.getenv("META_APP_SECRET"),
        "assets_dir": os.environ["ASSETS_DIR"],
    }


def verify_assets(cfg: CountryCampaign, assets_dir: Path) -> None:
    missing: list[str] = []
    for fn in [cfg.video_filename, *cfg.image_filenames]:
        if not (assets_dir / fn).exists():
            missing.append(fn)
    if missing:
        raise FileNotFoundError(
            f"Missing assets for {cfg.country_code} in {assets_dir}: {', '.join(missing)}"
        )


def create_for_country(client: MetaAdsClient, cfg: CountryCampaign) -> dict[str, str]:
    print(f"\n━━━ {cfg.country_code} ({cfg.lang_cap}) — {cfg.campaign_name} ━━━")
    print(f"  Budget: {cfg.daily_budget_cents}¢/day → €{cfg.daily_budget_cents / 100:.2f}/day")

    # 1. Upload assets
    print("  [1/6] Uploading assets...")
    video_id = client.upload_video(cfg.video_filename)
    img1_hash = client.upload_image(cfg.image_filenames[0])
    img2_hash = client.upload_image(cfg.image_filenames[1])

    # 2. Lead Form (Page-scoped)
    print("  [2/6] Creating lead form...")
    form_id = client.create_lead_form(cfg.lead_form, cfg.country_code, cfg.campaign_name)

    # 3. Campaign (paused)
    print("  [3/6] Creating campaign...")
    campaign_id = client.create_campaign(cfg)

    # 4. Ad Set (paused, linked to page for lead forms)
    print("  [4/6] Creating ad set...")
    adset_id = client.create_adset(campaign_id, form_id, cfg)

    # 5. Creatives — A/B: video (angle: financial-hook) + image (angle: simplicity)
    print("  [5/6] Creating creatives...")
    video_cr_id = client.create_video_creative(
        cfg=cfg,
        video_id=video_id,
        thumbnail_image_hash=img2_hash,
        form_id=form_id,
        headline=cfg.headlines[0],
        primary_text=cfg.primary_texts[0],
        description=cfg.descriptions[0],
    )
    image_cr_id = client.create_image_creative(
        cfg=cfg,
        image_hash=img1_hash,
        form_id=form_id,
        headline=cfg.headlines[1],
        primary_text=cfg.primary_texts[1],
        description=cfg.descriptions[1],
    )

    # 6. Ads (paused)
    print("  [6/6] Creating ads...")
    ad_video_id = client.create_ad(adset_id, video_cr_id, f"{cfg.country_code}-Video-Financial")
    ad_image_id = client.create_ad(adset_id, image_cr_id, f"{cfg.country_code}-Image-Simplicity")

    return {
        "country": cfg.country_code,
        "campaign_name": cfg.campaign_name,
        "campaign_id": campaign_id,
        "adset_id": adset_id,
        "lead_form_id": form_id,
        "video_id": video_id,
        "image_hashes": {cfg.image_filenames[0]: img1_hash, cfg.image_filenames[1]: img2_hash},
        "creative_video_id": video_cr_id,
        "creative_image_id": image_cr_id,
        "ad_video_id": ad_video_id,
        "ad_image_id": ad_image_id,
    }


def main() -> int:
    args = parse_args()
    countries = [c.strip().upper() for c in args.countries.split(",") if c.strip()]

    unknown = [c for c in countries if c not in CAMPAIGNS]
    if unknown:
        print(f"✖ Unknown country codes: {', '.join(unknown)}. Valid: {', '.join(CAMPAIGNS.keys())}")
        return 2

    try:
        env = load_env()
    except RuntimeError as e:
        print(f"✖ {e}")
        return 2

    assets_dir = Path(env["assets_dir"])
    if not assets_dir.is_dir():
        print(f"✖ ASSETS_DIR does not exist: {assets_dir}")
        return 2

    mode = "DRY-RUN" if args.dry_run else "LIVE"
    print(f"\n{'═' * 60}")
    print(f"  MOORING BOOKING — Meta Ads Automation  [{mode}]")
    print(f"{'═' * 60}")
    print(f"  Account:   {env['ad_account_id']}")
    print(f"  Page:      {env['page_id']}")
    print(f"  Assets:    {assets_dir}")
    print(f"  Countries: {', '.join(countries)}")

    for cc in countries:
        verify_assets(CAMPAIGNS[cc], assets_dir)
    print("  ✓ All asset files verified on disk")

    client = MetaAdsClient(
        access_token=env["access_token"],
        ad_account_id=env["ad_account_id"],
        page_id=env["page_id"],
        assets_dir=assets_dir,
        app_id=env["app_id"],
        app_secret=env["app_secret"],
        dry_run=args.dry_run,
    )
    client.validate_access()

    results: list[dict[str, str]] = []
    errors: list[dict[str, str]] = []
    for cc in countries:
        try:
            res = create_for_country(client, CAMPAIGNS[cc])
            results.append(res)
        except Exception as e:
            print(f"  ✖ {cc} failed: {e}")
            errors.append({"country": cc, "error": str(e)})

    # Write run summary
    output_dir = Path(args.output_dir)
    output_dir.mkdir(parents=True, exist_ok=True)
    ts = datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")
    out_path = output_dir / f"run_{ts}{'_dry' if args.dry_run else ''}.json"
    summary = {
        "mode": mode,
        "timestamp": ts,
        "ad_account_id": env["ad_account_id"],
        "page_id": env["page_id"],
        "countries_attempted": countries,
        "results": results,
        "errors": errors,
    }
    out_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2), encoding="utf-8")

    print(f"\n{'═' * 60}")
    print(f"  SUMMARY — {len(results)}/{len(countries)} succeeded")
    print(f"{'═' * 60}")
    for r in results:
        print(f"  ✓ {r['country']}: campaign={r['campaign_id']} adset={r['adset_id']} form={r['lead_form_id']}")
    for e in errors:
        print(f"  ✖ {e['country']}: {e['error']}")
    print(f"\n  Full summary: {out_path}")

    if not args.dry_run and results:
        print("\n  🚦 Next step: open Ads Manager, review each campaign preview,")
        print("     then flip status PAUSED → ACTIVE when ready.")

    return 0 if not errors else 1


if __name__ == "__main__":
    sys.exit(main())
