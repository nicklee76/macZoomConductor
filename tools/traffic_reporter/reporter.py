#!/usr/bin/env python3
"""
browserNexus — Daily GA4 Traffic Reporter for Telegram
Author: Nick Lee <coolnickldd@gmail.com>
"""

import os
import sys
import json
import socket
from datetime import datetime
from pathlib import Path
import requests
from dotenv import load_dotenv
from google.oauth2 import service_account
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    RunReportRequest,
)

# Load environment variables
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

GA4_PROPERTY_ID = os.getenv("GA4_PROPERTY_ID")
TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
CREDENTIALS_FILE = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "service-account.json")

# Ensure absolute path for credentials
if not os.path.isabs(CREDENTIALS_FILE):
    CREDENTIALS_FILE = str(Path(__file__).parent / CREDENTIALS_FILE)


def validate_config():
    """Validate that required environment variables / secrets are present."""
    missing = []
    if not GA4_PROPERTY_ID or not GA4_PROPERTY_ID.strip():
        missing.append("GA4_PROPERTY_ID")
    if not TELEGRAM_BOT_TOKEN or not TELEGRAM_BOT_TOKEN.strip():
        missing.append("TELEGRAM_BOT_TOKEN")
    if not TELEGRAM_CHAT_ID or not TELEGRAM_CHAT_ID.strip():
        missing.append("TELEGRAM_CHAT_ID")
    
    sa_json = os.getenv("GA4_SERVICE_ACCOUNT_JSON")
    has_sa = (sa_json and sa_json.strip()) or os.path.exists(CREDENTIALS_FILE)
    if not has_sa:
        missing.append("GA4_SERVICE_ACCOUNT_JSON (or local service-account.json file)")

    if missing:
        print(f"❌ Configuration Error: Missing required secrets/env variables: {', '.join(missing)}", file=sys.stderr)
        sys.exit(1)


def setup_dns_resolution():
    """Bypass local DNS sinkholes (e.g. Tailscale/NextDNS adblockers) using DNS-over-HTTPS."""
    try:
        # Check standard DNS resolution first
        addrs = socket.getaddrinfo("analyticsdata.googleapis.com", 443)
        valid = any(sockaddr[0] not in ("0.0.0.0", "::", "127.0.0.1", "::1") for _, _, _, _, sockaddr in addrs)
        if valid:
            return  # Normal DNS works (e.g. on GitHub Actions runner)
    except Exception:
        pass

    try:
        r = requests.get("https://dns.google/resolve?name=analyticsdata.googleapis.com", timeout=4)
        if r.status_code == 200:
            answers = r.json().get("Answer", [])
            ips = [a["data"] for a in answers if a.get("type") == 1]
            if ips:
                resolved_ip = ips[0]
                _orig = socket.getaddrinfo

                def patched_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
                    if host == "analyticsdata.googleapis.com":
                        return _orig(resolved_ip, port, family, type, proto, flags)
                    return _orig(host, port, family, type, proto, flags)

                socket.getaddrinfo = patched_getaddrinfo
    except Exception:
        pass


setup_dns_resolution()


def format_duration(seconds_float: float) -> str:
    """Format seconds into readable min/sec string."""
    seconds = int(seconds_float)
    mins = seconds // 60
    secs = seconds % 60
    if mins > 0:
        return f"{mins}m {secs}s"
    return f"{secs}s"


import re
import json
import base64
from google.oauth2 import service_account


def load_sa_dict(raw: str) -> dict:
    """Parse Service Account JSON from raw string, base64 string, or json."""
    raw = raw.strip()
    
    # 1. Base64 decoded check
    if not raw.startswith("{"):
        try:
            clean_b64 = re.sub(r"\s+", "", raw)
            decoded = base64.b64decode(clean_b64).decode("utf-8")
            if decoded.strip().startswith("{"):
                return json.loads(decoded.strip())
        except Exception:
            pass

    # 2. Standard JSON
    try:
        return json.loads(raw)
    except Exception:
        pass

    # 3. Non-strict JSON
    try:
        return json.loads(raw, strict=False)
    except Exception:
        pass

    # 4. Escape-sanitized JSON
    fixed = re.sub(r"\\(?![\"\\/bfnrt]|u[0-9a-fA-F]{4})", r"\\\\", raw)
    return json.loads(fixed, strict=False)


def fetch_report(date_range_str: str = "yesterday") -> str:
    """Fetch analytics report from GA4 API and format as Telegram Markdown."""
    if not GA4_PROPERTY_ID or not TELEGRAM_BOT_TOKEN or not TELEGRAM_CHAT_ID:
        raise ValueError("Missing configuration: GA4_PROPERTY_ID, TELEGRAM_BOT_TOKEN, or TELEGRAM_CHAT_ID")

    sa_json_str = os.getenv("GA4_SERVICE_ACCOUNT_JSON")
    if sa_json_str and sa_json_str.strip():
        try:
            sa_info = load_sa_dict(sa_json_str)
            credentials = service_account.Credentials.from_service_account_info(sa_info)
            client = BetaAnalyticsDataClient(credentials=credentials, transport="rest")
        except Exception as e:
            print(f"Warning: Failed to parse GA4_SERVICE_ACCOUNT_JSON from env: {e}", file=sys.stderr)
            if os.path.exists(CREDENTIALS_FILE):
                credentials = service_account.Credentials.from_service_account_file(CREDENTIALS_FILE)
                client = BetaAnalyticsDataClient(credentials=credentials, transport="rest")
            else:
                raise
    elif os.path.exists(CREDENTIALS_FILE):
        credentials = service_account.Credentials.from_service_account_file(CREDENTIALS_FILE)
        client = BetaAnalyticsDataClient(credentials=credentials, transport="rest")
    else:
        os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = CREDENTIALS_FILE
        client = BetaAnalyticsDataClient(transport="rest")

    # 1. Core Summary Metrics
    core_request = RunReportRequest(
        property=f"properties/{GA4_PROPERTY_ID}",
        date_ranges=[DateRange(start_date=date_range_str, end_date=date_range_str)],
        metrics=[
            Metric(name="activeUsers"),
            Metric(name="newUsers"),
            Metric(name="sessions"),
            Metric(name="screenPageViews"),
            Metric(name="engagementRate"),
            Metric(name="userEngagementDuration"),
        ],
    )
    core_response = client.run_report(core_request)

    users = "0"
    new_users = "0"
    sessions = "0"
    pageviews = "0"
    engagement_rate = "0.0%"
    avg_duration = "0s"

    if core_response.rows:
        vals = core_response.rows[0].metric_values
        users = vals[0].value
        new_users = vals[1].value
        sessions = vals[2].value
        pageviews = vals[3].value
        engagement_rate = f"{float(vals[4].value) * 100:.1f}%"
        total_duration = float(vals[5].value)
        total_users = max(int(users), 1)
        avg_duration = format_duration(total_duration / total_users)

    # 2. Top Traffic Sources
    source_request = RunReportRequest(
        property=f"properties/{GA4_PROPERTY_ID}",
        date_ranges=[DateRange(start_date=date_range_str, end_date=date_range_str)],
        dimensions=[Dimension(name="sessionSource")],
        metrics=[Metric(name="sessions")],
        limit=5,
    )
    source_response = client.run_report(source_request)
    sources = []
    for r in source_response.rows:
        src_name = r.dimension_values[0].value or "(direct)"
        cnt = r.metric_values[0].value
        sources.append(f"  • `{src_name}`: {cnt} sessions")
    source_text = "\n".join(sources) if sources else "  • No traffic recorded"

    # 3. Key Conversion / Custom Events
    event_request = RunReportRequest(
        property=f"properties/{GA4_PROPERTY_ID}",
        date_ranges=[DateRange(start_date=date_range_str, end_date=date_range_str)],
        dimensions=[Dimension(name="eventName")],
        metrics=[Metric(name="eventCount")],
        limit=8,
    )
    event_response = client.run_report(event_request)
    events = []
    for r in event_response.rows:
        name = r.dimension_values[0].value
        cnt = r.metric_values[0].value
        events.append(f"  • `{name}`: {cnt}")
    event_text = "\n".join(events) if events else "  • No events recorded"

    # 4. Top Countries
    geo_request = RunReportRequest(
        property=f"properties/{GA4_PROPERTY_ID}",
        date_ranges=[DateRange(start_date=date_range_str, end_date=date_range_str)],
        dimensions=[Dimension(name="country")],
        metrics=[Metric(name="activeUsers")],
        limit=5,
    )
    geo_response = client.run_report(geo_request)
    geos = []
    for r in geo_response.rows:
        country = r.dimension_values[0].value
        cnt = r.metric_values[0].value
        geos.append(f"  • {country}: {cnt} users")
    geo_text = "\n".join(geos) if geos else "  • No country data"

    date_title = "Yesterday" if date_range_str == "yesterday" else date_range_str.capitalize()
    generated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    msg = (
        f"🚀 *browserNexus Traffic Report* ({date_title})\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"👥 *Active Users:* {users} (🆕 {new_users} new)\n"
        f"🔄 *Sessions:* {sessions}\n"
        f"👀 *Page Views:* {pageviews}\n"
        f"📈 *Engagement Rate:* {engagement_rate}\n"
        f"⏱️ *Avg Duration:* {avg_duration}\n\n"
        f"🌐 *Top Sources:*\n{source_text}\n\n"
        f"🎯 *Key Events:*\n{event_text}\n\n"
        f"📍 *Top Locations:*\n{geo_text}\n"
        f"━━━━━━━━━━━━━━━━━━━━\n"
        f"🕒 _Generated: {generated_at}_"
    )
    return msg


def send_telegram(text: str) -> dict:
    """Send markdown-formatted message to Telegram."""
    url = f"https://api.telegram.org/bot{TELEGRAM_BOT_TOKEN}/sendMessage"
    payload = {
        "chat_id": TELEGRAM_CHAT_ID,
        "text": text,
        "parse_mode": "Markdown",
    }
    resp = requests.post(url, json=payload, timeout=15)
    resp.raise_for_status()
    return resp.json()


def main():
    validate_config()
    date_arg = sys.argv[1] if len(sys.argv) > 1 else "yesterday"
    print(f"Fetching GA4 report for {date_arg} (Property: {GA4_PROPERTY_ID})...")
    report_message = fetch_report(date_arg)
    print("Report generated:")
    print(report_message)
    print("Sending to Telegram...")
    res = send_telegram(report_message)
    print(f"Delivered! Telegram Message ID: {res.get('result', {}).get('message_id')}")


if __name__ == "__main__":
    main()
