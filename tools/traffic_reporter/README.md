# browserNexus Daily GA4 Traffic Reporter

Pulls daily traffic statistics (active users, new users, sessions, pageviews, engagement rate, average session duration, top traffic sources, key custom events, and locations) from Google Analytics 4 API and sends a formatted Markdown report directly to Telegram.

---

## 🛠 Prerequisites & Setup

1. **Install Dependencies**:
   ```bash
   poetry install
   ```

2. **Configuration (`.env`)**:
   Ensure `.env` exists in this directory:
   ```env
   GA4_PROPERTY_ID=551060986
   TELEGRAM_BOT_TOKEN=your_bot_token_here
   TELEGRAM_CHAT_ID=your_chat_id_here
   GOOGLE_APPLICATION_CREDENTIALS=service-account.json
   ```

3. **Google Service Account**:
   Ensure `service-account.json` is located in this directory (or specified in `GOOGLE_APPLICATION_CREDENTIALS`).

---

## 🚀 Manual Test Run

You can trigger a report on-demand for any date range:

```bash
# Report for yesterday's full traffic (Default)
poetry run python reporter.py yesterday

# Report for today's real-time traffic so far
poetry run python reporter.py today

# Report for a specific date (YYYY-MM-DD)
poetry run python reporter.py 2026-08-22
```

---

## ⏰ Automated Daily Schedule (9:00 AM)

The reporter runs automatically every morning at **9:00 AM** via macOS `launchd`:

* **Service Plist**: `~/Library/LaunchAgents/com.browsernexus.traffic-reporter.plist`
* **Check Status**:
  ```bash
  launchctl list | grep com.browsernexus.traffic-reporter
  ```
* **Reload Service**:
  ```bash
  launchctl unload ~/Library/LaunchAgents/com.browsernexus.traffic-reporter.plist
  launchctl load ~/Library/LaunchAgents/com.browsernexus.traffic-reporter.plist
  ```
* **Logs**:
  * Output: `tools/traffic_reporter/reporter.log`
  * Errors: `tools/traffic_reporter/reporter.err`
