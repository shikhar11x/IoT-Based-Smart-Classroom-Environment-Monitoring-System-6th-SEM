// ============================================================
//   SMART CLASSROOM — ESP32 FINAL CODE
//   Data → Vercel Backend → Supabase
//   Dashboard: Vercel pe deployed
// ============================================================

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <WiFiClientSecure.h>
#include <base64.h>
#include <time.h>

// ─── WiFi ────────────────────────────────────────────────────
const char* ssid     = "S23";
const char* password = "shikhar11";

// ─── Vercel Backend URL ──────────────────────────────────────
const char* VERCEL_URL  = "https://smartclassroomk.vercel.app"; // <-- apna URL daalo
const char* ESP_API_KEY = "esp32-secret-key-123";

// ─── Gmail SMTP ──────────────────────────────────────────────
const char* emailFrom  = "smartclassroomkrmu39@gmail.com";
const char* emailPass  = "tjzbalyversimypv";
const char* emailTo    = "priyanshutomar255@gmail.com";
const char* smtpServer = "smtp.gmail.com";
const int   smtpPort   = 465;

// ─── Pins ────────────────────────────────────────────────────
#define DHTPIN     4
#define DHTTYPE    DHT22
#define MQ135_PIN  34
#define BUZZER_PIN 25
#define BUZZER_RES 8

// ─── Thresholds ──────────────────────────────────────────────
float TEMP_LIMIT = 30.0;
float HUM_LIMIT  = 75.0;
int   AIR_LIMIT  = 500;

// ─── Current Values ──────────────────────────────────────────
float currentTemp = 0;
float currentHum  = 0;
int   currentAir  = 0;

// ─── Alert Cooldown ──────────────────────────────────────────
unsigned long lastTempAlert = 0;
unsigned long lastHumAlert  = 0;
unsigned long lastAirAlert  = 0;
const unsigned long ALERT_COOLDOWN = 10000;

DHT dht(DHTPIN, DHTTYPE);

const char* ntpServer = "pool.ntp.org";
const long  gmtOffset = 19800;
const int   dstOffset = 0;

// =============================================================
//  BUZZER
// =============================================================
void buzzerTone(int freq, int dur) {
  ledcAttach(BUZZER_PIN, freq, BUZZER_RES);
  ledcWrite(BUZZER_PIN, 128);
  delay(dur);
  ledcWrite(BUZZER_PIN, 0);
  ledcDetach(BUZZER_PIN);
}
void tempBuzz() { buzzerTone(2000, 600); }
void humBuzz()  { buzzerTone(1500,200); delay(100); buzzerTone(1500,200); }
void airBuzz()  { for(int i=0;i<3;i++){ buzzerTone(3000,150); delay(80); } }

// =============================================================
//  GMAIL SMTP
// =============================================================
void sendEmail(String subject, String body) {
  WiFiClientSecure client;
  client.setInsecure();
  if (!client.connect(smtpServer, smtpPort)) {
    Serial.println("SMTP failed!"); return;
  }
  auto s = [&](String cmd){ client.println(cmd); delay(400);
    while(client.available()) Serial.write(client.read()); };
  delay(1000);
  while(client.available()) Serial.write(client.read());
  s("EHLO esp32"); s("AUTH LOGIN");
  s(base64::encode(emailFrom)); s(base64::encode(emailPass));
  s("MAIL FROM:<"+String(emailFrom)+">");
  s("RCPT TO:<"+String(emailTo)+">");
  s("DATA");
  client.println("From: Smart Classroom <"+String(emailFrom)+">");
  client.println("To: "+String(emailTo));
  client.println("Subject: "+subject);
  client.println("Content-Type: text/plain; charset=UTF-8\n");
  client.println(body);
  client.println(".");
  s("QUIT");
  client.stop();
  Serial.println("Email sent!");
}

// =============================================================
//  HTTPS POST helper — 308 fix
// =============================================================
int httpsPost(String endpoint, String jsonBody) {
  WiFiClientSecure *client = new WiFiClientSecure;
  client->setInsecure();
  HTTPClient http;
  http.begin(*client, String(VERCEL_URL) + endpoint);
  http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", ESP_API_KEY);
  int code = http.POST(jsonBody);
  Serial.printf("POST %s → %d\n", endpoint.c_str(), code);
  http.end();
  delete client;
  return code;
}

// =============================================================
//  VERCEL — Sensor data POST
// =============================================================
void postToVercel(float t, float h, int a) {
  if(WiFi.status() != WL_CONNECTED) return;
  StaticJsonDocument<128> doc;
  doc["temp"] = t; doc["hum"] = h; doc["air"] = a;
  String body; serializeJson(doc, body);
  httpsPost("/api/data", body);
}

// =============================================================
//  VERCEL — Alert POST
// =============================================================
void postAlert(String type, float value, float lim) {
  if(WiFi.status() != WL_CONNECTED) return;
  StaticJsonDocument<128> doc;
  doc["type"] = type; doc["value"] = value; doc["alert_limit"] = lim;
  String body; serializeJson(doc, body);
  httpsPost("/api/alerts", body);
}

// =============================================================
//  VERCEL — Thresholds fetch
// =============================================================
void fetchThresholds() {
  if(WiFi.status() != WL_CONNECTED) return;
  WiFiClientSecure *client = new WiFiClientSecure;
  client->setInsecure();
  HTTPClient http;
  http.begin(*client, String(VERCEL_URL) + "/api/thresholds");
  http.setFollowRedirects(HTTPC_STRICT_FOLLOW_REDIRECTS);
  int code = http.GET();
  Serial.printf("Thresholds fetch → %d\n", code);
  if(code == 200) {
    StaticJsonDocument<128> doc;
    deserializeJson(doc, http.getString());
    TEMP_LIMIT = doc["temp_limit"] | TEMP_LIMIT;
    HUM_LIMIT  = doc["hum_limit"]  | HUM_LIMIT;
    AIR_LIMIT  = doc["air_limit"]  | AIR_LIMIT;
    Serial.printf("Limits: T>%.0f H>%.0f A>%d\n", TEMP_LIMIT, HUM_LIMIT, AIR_LIMIT);
  }
  http.end();
  delete client;
}

// =============================================================
//  SETUP
// =============================================================
void setup() {
  Serial.begin(115200);
  dht.begin();
  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);
  analogSetAttenuation(ADC_11db);

  Serial.print("WiFi connecting");
  WiFi.begin(ssid, password);
  while(WiFi.status() != WL_CONNECTED) {
    delay(500); Serial.print(".");
  }
  Serial.println("\nConnected! IP: " + WiFi.localIP().toString());

  configTime(gmtOffset, dstOffset, ntpServer);
  Serial.println("NTP synced (IST)");

  buzzerTone(1000, 200); delay(100); buzzerTone(1000, 200);
  Serial.println("Buzzer OK");

  delay(1000);
  fetchThresholds();
  Serial.println("System ready!");
}

// =============================================================
//  LOOP
// =============================================================
unsigned long lastRead      = 0;
unsigned long lastPost      = 0;
unsigned long lastThreshold = 0;

const unsigned long READ_INTERVAL      = 2000;
const unsigned long POST_INTERVAL      = 2000;
const unsigned long THRESHOLD_INTERVAL = 300000;

void loop() {
  unsigned long ms = millis();

  if(ms - lastRead >= READ_INTERVAL) {
    lastRead = ms;
    float t = dht.readTemperature();
    float h = dht.readHumidity();
    int   a = analogRead(MQ135_PIN);

    if(!isnan(t) && !isnan(h)) {
      currentTemp = t; currentHum = h; currentAir = a;
      Serial.printf("T:%.1f C | H:%.1f %% | Air:%d\n", t, h, a);

      if(t > TEMP_LIMIT && (ms - lastTempAlert > ALERT_COOLDOWN)) {
        lastTempAlert = ms;
        Serial.println(">>> TEMP ALERT!");
        tempBuzz();
        sendEmail("Smart Class: High Temp!", "Temp: "+String(t)+"C Limit: "+String(TEMP_LIMIT)+"C");
        postAlert("temp", t, TEMP_LIMIT);
      }
      if(h > HUM_LIMIT && (ms - lastHumAlert > ALERT_COOLDOWN)) {
        lastHumAlert = ms;
        Serial.println(">>> HUMIDITY ALERT!");
        humBuzz();
        sendEmail("Smart Class: High Humidity!", "Hum: "+String(h)+"% Limit: "+String(HUM_LIMIT)+"%");
        postAlert("hum", h, HUM_LIMIT);
      }
      if(a > AIR_LIMIT && (ms - lastAirAlert > ALERT_COOLDOWN)) {
        lastAirAlert = ms;
        Serial.println(">>> AIR ALERT!");
        airBuzz();
        sendEmail("Smart Class: Poor Air!", "Air: "+String(a)+" Limit: "+String(AIR_LIMIT));
        postAlert("air", a, AIR_LIMIT);
      }
    }
  }

  if(ms - lastPost >= POST_INTERVAL) {
    lastPost = ms;
    postToVercel(currentTemp, currentHum, currentAir);
  }

  if(ms - lastThreshold >= THRESHOLD_INTERVAL) {
    lastThreshold = ms;
    fetchThresholds();
  }
}
