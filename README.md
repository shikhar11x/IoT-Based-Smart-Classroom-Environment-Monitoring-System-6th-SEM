<p align="center">
  <img src="https://img.shields.io/badge/K.R.%20Mangalam-UNIVERSITY-blue?style=for-the-badge&logo=google-scholar&logoColor=white&labelColor=0A3D91&color=E53935">
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=0:0A3D91,100:E53935&height=200&section=header&text=IoT-Based%20Smart%20Classroom%20Environment%20Monitoring%20System&fontSize=28&fontColor=ffffff&animation=fadeIn"/>
</p>


<div align="center">

![Platform](https://img.shields.io/badge/Platform-ESP32-blue?style=for-the-badge&logo=espressif)
![Backend](https://img.shields.io/badge/Backend-Vercel-black?style=for-the-badge&logo=vercel)
![Database](https://img.shields.io/badge/Database-Supabase-3ECF8E?style=for-the-badge&logo=supabase)
![Language](https://img.shields.io/badge/Language-C++%20%7C%20JavaScript-orange?style=for-the-badge)
![ML](https://img.shields.io/badge/ML-Linear%20Regression-purple?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

<h1 align="center">🏫 Smart Classroom Environment Monitoring System</h1>

<p align="center">
  <b>Real-Time IoT-Based Smart Classroom Monitoring Dashboard</b><br>
  <i>Track temperature, humidity, and air quality with predictive insights using ESP32, Supabase, Vercel, and Linear Regression.</i>
</p>


<p align="center">
  <a href="https://smartclassroomk.vercel.app">
    <img src="https://img.shields.io/badge/🚀%20Live%20Dashboard-Open%20Now-0A66C2?style=for-the-badge&logo=vercel&logoColor=white" alt="Live Dashboard"/>
  </a>
</p>

</div>

---

## 📌 About The Project

Classrooms are occupied for 6–8 hours daily, yet environmental conditions such as **temperature**, **humidity**, and **air quality** are rarely monitored in real time. Poor air quality, excessive heat, and high humidity directly impact student concentration, health, and academic performance.

This project solves that problem by deploying a fully automated IoT system that:
- 📡 **Monitors** classroom environment 24/7 using hardware sensors
- 🔔 **Alerts** instantly via buzzer and Gmail email when thresholds are breached
- ❄️ **Controls** AC and Exhaust Fan automatically for energy saving
- 📊 **Visualizes** live and historical data on a cloud-deployed web dashboard
- 🤖 **Predicts** future conditions 7 days ahead using Machine Learning

---

##  Features

| Feature | Description |
|---------|-------------|
| 🌡️ Live Gauges | Animated arc gauges for Temp, Humidity, Air Quality — 2s update |
| 📊 Historical Charts | 1H / 1D / 1W / 1M / 2M / All time data from cloud database |
| 🤖 ML Forecast | 7-day prediction using Linear Regression with risk day detection |
| 🔔 Smart Alerts | Buzzer beep + Gmail email on threshold breach |
| ❄️ Energy Control | Auto AC and Exhaust Fan ON/OFF indicators |
| ⚙️ Remote Thresholds | Update limits from dashboard — ESP32 syncs in 5 minutes |
| 📋 Alert Log | Persistent alert history — survives ESP32 restarts |
| 🌐 Cloud Deployed | Dashboard accessible from anywhere via Vercel URL |
| 💾 Permanent Storage | All data saved in Supabase — never lost on restart |

---

## 🛠️ Tech Stack

```
┌─────────────────────────────────────────────────────────────┐
│  HARDWARE          │  BACKEND           │  DATABASE          │
│  ESP32 DevKit      │  Vercel Serverless │  Supabase          │
│  DHT22 Sensor      │  REST API          │  PostgreSQL        │
│  MQ135 Sensor      │  4 API Endpoints   │  3 Tables          │
│  Passive Buzzer    │                    │  Permanent Storage │
├─────────────────────────────────────────────────────────────┤
│  FRONTEND          │  ML/AI             │                    │
│  HTML + CSS + JS   │  Linear Regression │  GitHub            │
│  Chart.js          │  Trend Detection   │  Vercel            │
│  Fetch API         │  Risk Detection    │  Auto Deploy       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗️ System Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    HARDWARE LAYER                         │
│   DHT22 ──┐                                              │
│   MQ135 ──┼──► ESP32 ◄──── WiFi      Buzzer ◄───────   │
└───────────┼──────────────────────────────────────────────┘
            │ HTTPS POST (every 1 min)
            ▼
┌──────────────────────────────────────────────────────────┐
│                  VERCEL REST API                          │
│  /api/data.js   /api/latest.js   /api/thresholds.js      │
│  /api/alerts.js                                          │
└───────────────────────┬──────────────────────────────────┘
                        │ SQL INSERT / SELECT
                        ▼
┌──────────────────────────────────────────────────────────┐
│               SUPABASE PostgreSQL                         │
│   sensor_readings │ thresholds │ alerts                  │
└───────────────────────┬──────────────────────────────────┘
                        │ REST API (every 2 sec)
                        ▼
┌──────────────────────────────────────────────────────────┐
│            BROWSER DASHBOARD (Vercel Hosted)              │
│  Live Gauges │ Charts │ ML Forecast │ Thresholds │ Alerts│
└──────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
smart-classroom/
│
├── api/                          ← Vercel Serverless Functions
│   ├── data.js                   ← POST sensor data / GET history
│   ├── latest.js                 ← GET latest reading for dashboard
│   ├── thresholds.js             ← GET/POST alert threshold limits
│   └── alerts.js                 ← POST/GET persistent alert log
│
├── public/
│   └── index.html                ← Full dashboard (HTML + CSS + JS)
│
├── esp32_final.ino               ← Arduino firmware for ESP32
├── supabase_setup.sql            ← Database schema (run once)
├── package.json                  ← Node.js dependencies
├── vercel.json                   ← Vercel routing configuration
└── README.md                     ← Project documentation
```

---

## ⚙️ Key Functions Explained

### ESP32 Firmware (`esp32_final.ino`)

#### `buzzerTone(int freq, int dur)`
```cpp
void buzzerTone(int freq, int dur) {
  ledcAttach(BUZZER_PIN, freq, BUZZER_RES);
  ledcWrite(BUZZER_PIN, 128);  // 50% PWM duty cycle
  delay(dur);
  ledcWrite(BUZZER_PIN, 0);
  ledcDetach(BUZZER_PIN);
}
```

---

#### `httpsPost(String endpoint, String jsonBody)`
```cpp
int httpsPost(String endpoint, String jsonBody) {
  WiFiClientSecure *client = new WiFiClientSecure;
  client->setInsecure();
  HTTPClient http;
  http.begin(*client, String(VERCEL_URL) + endpoint);
  http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", ESP_API_KEY);
  int code = http.POST(jsonBody);
  http.end();
  delete client;
  return code;
}
```
> Sends HTTPS POST request to Vercel. Uses `WiFiClientSecure` for SSL. `setFollowRedirects` handles Vercel's 308 HTTP→HTTPS redirect. API key header provides security authentication.

---

#### `fetchThresholds()`
```cpp
void fetchThresholds() {
  WiFiClientSecure *client = new WiFiClientSecure;
  client->setInsecure();
  HTTPClient http;
  http.begin(*client, String(VERCEL_URL) + "/api/thresholds");
  http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
  int code = http.GET();
  if(code == 200) {
    deserializeJson(doc, http.getString());
    TEMP_LIMIT = doc["temp_limit"];
    HUM_LIMIT  = doc["hum_limit"];
    AIR_LIMIT  = doc["air_limit"];
  }
  delete client;
}
```
> Fetches latest threshold limits from Supabase via Vercel every 5 minutes. Allows dashboard to remotely update limits without re-flashing ESP32 firmware.

---

#### Loop Timing Logic
```cpp
// Every 2 seconds — sensor read + alert check
if(ms - lastRead >= 2000) { ... }

// Every 1 minute — send to Vercel + Supabase
if(ms - lastPost >= 60000) { ... }

// Every 5 minutes — sync thresholds
if(ms - lastThreshold >= 300000) { ... }
```
> Three independent timers using `millis()` — non-blocking, no `delay()` in main loop. Ensures responsive sensor reading while handling cloud communication efficiently.

---

### Vercel API (`api/data.js`)

#### POST — Save Sensor Data
```javascript
if (req.method === 'POST') {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.ESP32_API_KEY)
    return res.status(401).json({ error: 'Unauthorized' });

  const { temp, hum, air } = req.body;
  await supabase.from('sensor_readings').insert([{ temp, hum, air }]);
  return res.status(200).json({ status: 'ok' });
}
```
> Receives sensor data from ESP32, verifies API key for security, inserts into Supabase `sensor_readings` table with auto-timestamp.

---

#### GET — Historical Data with Range
```javascript
if (req.method === 'GET') {
  const range = req.query.range || 'day';
  let since = new Date();
  if      (range === 'hour')   since.setHours(now.getHours() - 1);
  else if (range === 'day')    since.setDate(now.getDate() - 1);
  else if (range === 'week')   since.setDate(now.getDate() - 7);
  else if (range === 'month')  since.setMonth(now.getMonth() - 1);
  else if (range === 'month2') since.setMonth(now.getMonth() - 2);
  else if (range === 'all')    since = new Date('2000-01-01');

  const { data } = await supabase
    .from('sensor_readings')
    .select('temp, hum, air, created_at')
    .gte('created_at', since.toISOString())
    .order('created_at', { ascending: true })
    .limit(10000);
  return res.status(200).json(data);
}
```
> Dynamically filters historical data based on time range query parameter. Returns up to 10,000 records for full history view.

---

### Dashboard JavaScript (`public/index.html`)

#### `setGauge(id, val, lim, min, max, unit)`
```javascript
function setGauge(id, val, lim, min, max, unit) {
  var pct = Math.min(Math.max((val-min)/(max-min), 0), 1);
  document.getElementById('arc-'+id).style.strokeDashoffset = 172-(pct*172);
  // OK / WARN / ALERT status
  var ratio = val/lim;
  if(ratio >= 1)    { st.textContent='ALERT'; st.className='g-status s-err'; }
  else if(ratio >= 0.85) { st.textContent='WARN'; st.className='g-status s-warn'; }
  else              { st.textContent='OK'; st.className='g-status s-ok'; }
}
```
> Updates SVG arc gauge using `strokeDashoffset` technique. Value normalized to 0–1 range then mapped to 172px arc length. Status changes at 85% (WARN) and 100% (ALERT) of limit.

---

#### `linReg(data, key)` — Linear Regression
```javascript
function linReg(data, key) {
  var n=data.length, sx=0, sy=0, sxy=0, sx2=0;
  data.forEach(function(d,i) {
    sx+=i; sy+=d[key]; sxy+=i*d[key]; sx2+=i*i;
  });
  var m = (n*sxy - sx*sy) / (n*sx2 - sx*sx || 1);  // slope
  var b = (sy - m*sx) / n;                           // intercept
  return { m, b };
}
```
> Implements Ordinary Least Squares (OLS) Linear Regression from scratch. Calculates slope `m` and intercept `b` for `Y = mX + b`. Uses all selected historical data points for training. More data = more accurate trend detection.

---

#### `updateACExhaust(temp, hum, air)`
```javascript
function updateACExhaust(temp, hum, air) {
  var newAc = temp > limits.temp || air > limits.air;
  var newEx = hum  > limits.hum;
  // AC LED ON/OFF
  if(newAc && !acOn) pushAlert('❄️', 'AC ON — High Temp/Air detected', ts);
  if(!newAc && acOn) pushAlert('❄️', 'AC OFF — Conditions normalized', ts);
  // Exhaust LED ON/OFF
  if(newEx && !exOn) pushAlert('💨', 'Exhaust Fan ON — High Humidity', ts);
  acOn = newAc; exOn = newEx;
}
```
> Simulates energy-saving auto control. AC activates on temperature OR air quality breach. Exhaust Fan activates on humidity breach. State change detection prevents duplicate alerts.

---

## 🗄️ Database Schema

```sql
-- Permanent sensor readings
CREATE TABLE sensor_readings (
  id         BIGSERIAL PRIMARY KEY,
  temp       FLOAT,
  hum        FLOAT,
  air        INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Alert thresholds (updatable from dashboard)
CREATE TABLE thresholds (
  id         INTEGER PRIMARY KEY DEFAULT 1,
  temp_limit FLOAT   DEFAULT 30.0,
  hum_limit  FLOAT   DEFAULT 75.0,
  air_limit  INTEGER DEFAULT 500
);

-- Persistent alert history
CREATE TABLE alerts (
  id          BIGSERIAL PRIMARY KEY,
  type        TEXT,
  value       FLOAT,
  alert_limit FLOAT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🤖 Machine Learning — Linear Regression

The system uses **Linear Regression (Supervised ML)** to forecast 7 days ahead.

```
Formula:  Y = mX + b

Y = Predicted value (future temp/hum/air)
X = Time index (future point)
m = Slope (rate of change — rising/falling/stable)
b = Intercept (baseline value)
```

**How it works:**
1. All historical sensor data from selected range is used as training data
2. OLS algorithm computes best-fit slope `m` and intercept `b`
3. Future X values (7 days × 12 points) are plugged into `Y = mX + b`
4. If predicted Y > threshold → marked as **Risk Day** (red highlight)
5. Trend analysis: `m > 0.01` = Rising, `m < -0.01` = Falling, else = Stable

---

## 🔌 Hardware Wiring

```
Component    Pin          ESP32 Pin    Notes
──────────────────────────────────────────────────
DHT22        VCC      -   3.3V
             GND      -   GND
             DATA     -   GPIO 4       Digital

MQ135        VCC      -   5V (VIN)     Needs 5V!
             GND      -   GND
             AO       -   GPIO 34      Analog only pin

Buzzer       VCC      - 5V      Passive buzzer
             GND      - GND
             I/O      - GPIO 25
```

---

## ⚙️ Setup & Deployment

### Step 1 — Supabase
```
1. supabase.com - New Project
2. SQL Editor - Run supabase_setup.sql
3. Settings - API - Copy:
   - Project URL    - SUPABASE_URL
   - service_role   - SUPABASE_SERVICE_KEY
```

### Step 2 — Vercel
```
1. Push repo to GitHub
2. vercel.com - Import repo
3. Add Environment Variables:
   SUPABASE_URL         = https://xxxx.supabase.co
   SUPABASE_SERVICE_KEY = eyJhbG...
   ESP32_API_KEY        = esp32-secret-key-123
4. Deploy - Get your URL
```

### Step 3 — ESP32
```cpp
// Update in esp32_final.ino:
const char* ssid        = "Your_WiFi";
const char* password    = "Your_Password";
const char* VERCEL_URL  = "https://your-project.vercel.app";
const char* ESP_API_KEY = "esp32-secret-key-123";
const char* emailFrom   = "your@gmail.com";
const char* emailPass   = "app_password_16chars";
const char* emailTo     = "alert@email.com";
```

### Step 4 — Arduino Libraries
```
Install via Arduino Library Manager:
- ArduinoJson        (Benoit Blanchon)
- DHT sensor library (Adafruit)
- Adafruit Unified Sensor
Board: ESP32 Dev Module
```

---

## 🔔 Alert Behavior

| Sensor | Condition | Buzzer Pattern | Email |
|--------|-----------|---------------|-------|
| Temperature | > Limit | 1 long beep (600ms, 2000Hz) |  Sent |
| Humidity | > Limit | 2 short beeps (200ms, 1500Hz) |  Sent |
| Air Quality | > Limit | 3 quick beeps (150ms, 3000Hz) |  Sent |

- Cooldown: **5 minutes** between same alerts (prevents spam)
- Email: Gmail SMTP over **SSL port 465**
- All alerts logged to Supabase permanently

---

## 📊 Data Flow Summary

```
1. ESP32 reads sensors         - every 2 seconds
2. Threshold breach?           - Buzzer + Email + Alert log
3. POST to Vercel              - every 1 minute
4. Vercel saves to Supabase    - SQL INSERT
5. Dashboard fetches live data - every 2 seconds (ESP32 direct)
6. History charts              - Supabase via Vercel API
7. ML Forecast                 - Linear Regression on history
8. Threshold update            - Dashboard → Supabase → ESP32 (5 min)
```

---

## 🚀 Future Scope

- [ ] Relay-based actual AC and Exhaust Fan hardware control
- [ ] Mobile push notifications (Firebase FCM)
- [ ] Multi-classroom monitoring support
- [ ] Polynomial Regression for non-linear forecasting
- [ ] LSTM Neural Network for advanced predictions
- [ ] Mobile app (React Native)

---

## 👨‍💻 Team BLAZESTACK
SHIKHAR BAJPAI (2301010188),
PRIYANSHU TOMAR(2301010162),
KUMUD RATHI(2301010161),
SHRIYA JAYASWAL(2301010163)

**Project:** Smart Classroom Environment Monitoring System
**Institution:** KR Mangalam University (KRMU)
**Department:** Computer Science
**Technology:** IoT + Cloud + REST API + ML

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

<div align="center">
Built with ❤️ at KR Mangalam University
</div>
