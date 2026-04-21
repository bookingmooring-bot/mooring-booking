"""
Thin wrappers around facebook_business SDK for Mooring Booking ad creation.
Each function maps to one Marketing API entity and returns the created ID.
"""

from __future__ import annotations

import json
import os
import time
from pathlib import Path
from typing import Any

from facebook_business.adobjects.ad import Ad
from facebook_business.adobjects.adaccount import AdAccount
from facebook_business.adobjects.adcreative import AdCreative
from facebook_business.adobjects.adimage import AdImage
from facebook_business.adobjects.adset import AdSet
from facebook_business.adobjects.advideo import AdVideo
from facebook_business.adobjects.campaign import Campaign
from facebook_business.adobjects.page import Page
from facebook_business.api import FacebookAdsApi
from facebook_business.exceptions import FacebookRequestError

from .config import PRIVACY_URL, SITE_URL, CountryCampaign, LeadFormSpec


def _slugify(text: str) -> str:
    out = []
    for ch in text.lower():
        if ch.isalnum():
            out.append(ch)
        elif ch in (" ", "-", "_"):
            out.append("_")
    return "".join(out).strip("_") or "opt"


def _normalize_questions(questions: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """Meta requires each option under a CUSTOM question to have both `value` and `key`."""
    normalized: list[dict[str, Any]] = []
    for q in questions:
        q = dict(q)
        if "options" in q and isinstance(q["options"], list):
            new_opts = []
            seen: set[str] = set()
            for i, opt in enumerate(q["options"]):
                opt = dict(opt)
                if "key" not in opt:
                    base = _slugify(str(opt.get("value", f"opt_{i}")))
                    key = base
                    n = 2
                    while key in seen:
                        key = f"{base}_{n}"
                        n += 1
                    opt["key"] = key
                seen.add(opt["key"])
                new_opts.append(opt)
            q["options"] = new_opts
        normalized.append(q)
    return normalized


class MetaAdsClient:
    def __init__(
        self,
        access_token: str,
        ad_account_id: str,
        page_id: str,
        assets_dir: Path,
        app_id: str | None = None,
        app_secret: str | None = None,
        dry_run: bool = False,
    ):
        self.ad_account_id = ad_account_id if ad_account_id.startswith("act_") else f"act_{ad_account_id}"
        self.page_id = page_id
        self.assets_dir = assets_dir
        self.dry_run = dry_run

        if not dry_run:
            FacebookAdsApi.init(
                app_id=app_id,
                app_secret=app_secret,
                access_token=access_token,
                api_version="v20.0",
            )
            self.account = AdAccount(self.ad_account_id)
            self.page = Page(self.page_id)
        else:
            self.account = None
            self.page = None

    def _dry(self, label: str, payload: dict[str, Any]) -> str:
        print(f"\n[DRY-RUN] {label}")
        print(json.dumps(payload, ensure_ascii=False, indent=2, default=str))
        return f"dry_{label.lower().replace(' ', '_')}_{int(time.time() * 1000)}"

    def validate_access(self) -> None:
        if self.dry_run:
            print("[DRY-RUN] Skipping access validation")
            return
        try:
            acct = self.account.api_get(fields=["name", "currency", "account_status"])
            print(f"  ✓ Ad Account: {acct['name']} ({acct['currency']}, status={acct['account_status']})")
            pg = self.page.api_get(fields=["name", "id"])
            print(f"  ✓ Page: {pg['name']} (id={pg['id']})")
        except FacebookRequestError as e:
            raise RuntimeError(f"Access validation failed: {e.api_error_message()}") from e

    def upload_image(self, filename: str) -> str:
        path = self.assets_dir / filename
        if not path.exists():
            raise FileNotFoundError(f"Image asset not found: {path}")

        if self.dry_run:
            return self._dry(f"upload_image {filename}", {"filename": str(path), "size_bytes": path.stat().st_size})

        img = self.account.create_ad_image(params={AdImage.Field.filename: str(path)})
        image_hash = img[AdImage.Field.hash]
        print(f"    ↑ image {filename} → hash={image_hash}")
        return image_hash

    def upload_video(self, filename: str) -> str:
        path = self.assets_dir / filename
        if not path.exists():
            raise FileNotFoundError(f"Video asset not found: {path}")

        if self.dry_run:
            return self._dry(f"upload_video {filename}", {"source": str(path), "size_bytes": path.stat().st_size})

        video = self.account.create_ad_video(params={"source": str(path), "name": filename})
        video_id = video["id"]
        print(f"    ↑ video {filename} → id={video_id}")
        return video_id

    def create_lead_form(self, spec: LeadFormSpec, country_code: str, campaign_name: str) -> str:
        suffix = time.strftime("%Y%m%d-%H%M%S")
        payload = {
            "name": f"{spec.name} - {suffix}",
            "locale": spec.locale,
            "follow_up_action_url": spec.follow_up_url,
            "privacy_policy": {
                "url": PRIVACY_URL,
                "link_text": "Privacy Policy",
            },
            "context_card": {
                "title": spec.context_title,
                "content": [spec.context_body],
                "style": "PARAGRAPH_STYLE",
                "button_text": "Start",
            },
            "questions": _normalize_questions(spec.questions),
            "thank_you_page": {
                "title": spec.thank_you_title,
                "body": spec.thank_you_body,
                "button_type": "VIEW_WEBSITE",
                "website_url": SITE_URL,
                "button_text": spec.thank_you_cta_text,
            },
            "tracking_parameters": {
                "source": f"meta_{country_code}",
                "campaign": campaign_name,
            },
        }

        if self.dry_run:
            return self._dry(f"create_lead_form {country_code}", payload)

        form = self.page.create_lead_gen_form(params=payload)
        form_id = form["id"]
        print(f"    ✎ lead form {country_code} → id={form_id}")
        return form_id

    def create_campaign(self, cfg: CountryCampaign) -> str:
        payload = {
            Campaign.Field.name: cfg.campaign_name,
            Campaign.Field.objective: "OUTCOME_LEADS",
            Campaign.Field.status: Campaign.Status.paused,
            Campaign.Field.special_ad_categories: [],
            Campaign.Field.buying_type: "AUCTION",
            "is_adset_budget_sharing_enabled": False,
        }

        if self.dry_run:
            return self._dry(f"create_campaign {cfg.country_code}", payload)

        camp = self.account.create_campaign(params=payload)
        campaign_id = camp["id"]
        print(f"    📢 campaign {cfg.country_code} → id={campaign_id}")
        return campaign_id

    def create_adset(self, campaign_id: str, form_id: str, cfg: CountryCampaign) -> str:
        targeting: dict[str, Any] = {
            "geo_locations": {"countries": cfg.geo_countries},
            "age_min": cfg.age_min,
            "age_max": cfg.age_max,
            "publisher_platforms": ["facebook", "instagram"],
            "facebook_positions": ["feed", "story", "marketplace"],
            "instagram_positions": ["stream", "story", "reels", "explore"],
            "device_platforms": ["mobile", "desktop"],
            "targeting_automation": {"advantage_audience": 0},
        }

        payload: dict[str, Any] = {
            AdSet.Field.name: f"{cfg.campaign_name} - AdSet",
            AdSet.Field.campaign_id: campaign_id,
            AdSet.Field.daily_budget: cfg.daily_budget_cents,
            AdSet.Field.billing_event: AdSet.BillingEvent.impressions,
            AdSet.Field.optimization_goal: AdSet.OptimizationGoal.lead_generation,
            AdSet.Field.bid_strategy: AdSet.BidStrategy.lowest_cost_without_cap,
            AdSet.Field.destination_type: "ON_AD",
            AdSet.Field.promoted_object: {"page_id": self.page_id},
            AdSet.Field.targeting: targeting,
            AdSet.Field.status: AdSet.Status.paused,
            AdSet.Field.start_time: int(time.time()) + 300,
        }

        if self.dry_run:
            return self._dry(f"create_adset {cfg.country_code}", payload)

        adset = self.account.create_ad_set(params=payload)
        adset_id = adset["id"]
        print(f"    🎯 adset {cfg.country_code} → id={adset_id}, budget={cfg.daily_budget_cents}¢/day")
        return adset_id

    def create_image_creative(
        self,
        cfg: CountryCampaign,
        image_hash: str,
        form_id: str,
        headline: str,
        primary_text: str,
        description: str,
    ) -> str:
        object_story_spec = {
            "page_id": self.page_id,
            "link_data": {
                "name": headline,
                "message": primary_text,
                "description": description,
                "image_hash": image_hash,
                "link": SITE_URL,
                "call_to_action": {
                    "type": cfg.cta_text,
                    "value": {
                        "lead_gen_form_id": form_id,
                    },
                },
            },
        }

        payload = {
            AdCreative.Field.name: f"{cfg.campaign_name} - Image Creative",
            AdCreative.Field.object_story_spec: object_story_spec,
        }

        if self.dry_run:
            return self._dry(f"create_image_creative {cfg.country_code}", payload)

        cr = self.account.create_ad_creative(params=payload)
        cr_id = cr["id"]
        print(f"    🖼  image creative {cfg.country_code} → id={cr_id}")
        return cr_id

    def create_video_creative(
        self,
        cfg: CountryCampaign,
        video_id: str,
        thumbnail_image_hash: str,
        form_id: str,
        headline: str,
        primary_text: str,
        description: str,
    ) -> str:
        object_story_spec = {
            "page_id": self.page_id,
            "video_data": {
                "video_id": video_id,
                "image_hash": thumbnail_image_hash,
                "title": headline,
                "message": primary_text,
                "link_description": description,
                "call_to_action": {
                    "type": cfg.cta_text,
                    "value": {
                        "link": SITE_URL,
                        "lead_gen_form_id": form_id,
                    },
                },
            },
        }

        payload = {
            AdCreative.Field.name: f"{cfg.campaign_name} - Video Creative",
            AdCreative.Field.object_story_spec: object_story_spec,
        }

        if self.dry_run:
            return self._dry(f"create_video_creative {cfg.country_code}", payload)

        cr = self.account.create_ad_creative(params=payload)
        cr_id = cr["id"]
        print(f"    🎥 video creative {cfg.country_code} → id={cr_id}")
        return cr_id

    def create_ad(self, adset_id: str, creative_id: str, ad_name: str) -> str:
        payload = {
            Ad.Field.name: ad_name,
            Ad.Field.adset_id: adset_id,
            Ad.Field.creative: {"creative_id": creative_id},
            Ad.Field.status: Ad.Status.paused,
        }

        if self.dry_run:
            return self._dry(f"create_ad {ad_name}", payload)

        ad = self.account.create_ad(params=payload)
        ad_id = ad["id"]
        print(f"    📝 ad '{ad_name}' → id={ad_id}")
        return ad_id
