# 🔧 Technical System Documentation

## 1️⃣ Components Used

| Component | Specification | Purpose |
|------------|---------------|----------|
| ESP32 Dev Board | 30-Pin WiFi + Bluetooth | Main Controller |
| DHT22 | Digital Temperature & Humidity Sensor | Environmental Monitoring |
| MQ135 | Analog Gas Sensor | Air Quality Detection |
| Active Buzzer | 3.3V Logic | Alert System |
| Breadboard | Standard | Circuit Assembly |
| Jumper Wires | Male-Male | Electrical Connections |
| Micro USB Cable | 5V Supply | Power & Programming |

---

## 2️⃣ Tools & Technologies Used

- Arduino IDE  
- ESP32 Board Package  
- Embedded C++  
- WiFi Communication  
- Blynk IoT Cloud  
- Serial Monitor (Debugging)

---

## 3️⃣ Libraries Used

| Library Name | Purpose |
|--------------|----------|
| WiFi.h | Connect ESP32 to WiFi |
| BlynkSimpleEsp32.h | Connect ESP32 to Blynk Cloud |
| DHT.h | Interface DHT22 Sensor |
| BlynkTimer.h | Non-blocking timing operations |
| Adafruit_Sensor.h | Base sensor support library |

### Include Statements Used

```cpp
#include <WiFi.h>
#include <BlynkSimpleEsp32.h>
#include <DHT.h>
#include <BlynkTimer.h>
```

---

## 4️⃣ Pin Connections

| Device | ESP32 Pin |
|--------|----------|
| DHT22 DATA | GPIO 4 |
| MQ135 AO | GPIO 34 |
| Buzzer | GPIO 25 |


## 5️⃣ Power Connections

| Device | Voltage |
|--------|---------|
| DHT22 VCC | 3.3V |
| MQ135 VCC | 5V |
| Buzzer VCC | 3.3V |
| All GND | Common Ground |

6️⃣ Circuit Diagram

![Circuit Diagram](circuit(EMS).png)


## 7️⃣ Working Logic

1. Initialize ESP32  
2. Connect to WiFi  
3. Read temperature and humidity from DHT22  
4. Read gas level from MQ135  
5. Compare sensor values with threshold limits  
6. If any value exceeds limit:
   - Activate buzzer  
   - Send alert notification via Blynk  
7. Update real-time data to mobile dashboard  
8. Repeat continuously  



## 8️⃣ Threshold Conditions

| Parameter | Limit | Action |
|-----------|-------|--------|
| Temperature | > 35°C | Buzzer + Alert |
| Humidity | > 80% | Buzzer + Alert |
| Gas Level | Above Safe Limit | Buzzer + Alert |


## 9️⃣ Alert Mechanism

If any parameter exceeds safe limit:

- Buzzer turns ON  
- Blynk event is triggered  
- Mobile notification is sent  

If values return to normal:

- Buzzer turns OFF  
- Monitoring continues  


## 🔟 Electrical Notes

- GPIO34 supports analog input (used for MQ135)  
- MQ135 requires stable 5V supply  
- ESP32 logic level operates at 3.3V  
- Common ground connection is mandatory  

