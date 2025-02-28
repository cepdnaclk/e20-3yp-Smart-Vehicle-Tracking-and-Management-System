#include <WiFi.h>
#include <Firebase_ESP_Client.h>
#include <DHT.h>

// WiFi Credentials
#define WIFI_SSID "Redmi Note 9S"
#define WIFI_PASSWORD "Lahiru1234"
 
// Firebase Credentials (Use Database Secret instead of API Key)
#define DATABASE_URL "https://yp-group-23-default-rtdb.asia-southeast1.firebasedatabase.app/"
#define DATABASE_SECRET "23otMyYcFN9dGXrDKSRNbkHPsca9Z1s686UhjyBY"  // 🔹 Replace with your actual Database Secret

// DHT Sensor Configuration
#define DHTPIN 4         // DHT sensor pin
#define DHTTYPE DHT11    // DHT Type: DHT11 or DHT22
DHT dht(DHTPIN, DHTTYPE);

// Firebase Instances
FirebaseData fbdo;
FirebaseAuth auth;
FirebaseConfig config;

void setup() {
  Serial.begin(115200);
  dht.begin();

  // Connect to WiFi
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  Serial.print("Connecting to WiFi");
  
  while (WiFi.status() != WL_CONNECTED) {
    Serial.print(".");
    delay(1000);
  }
  Serial.println("\nWiFi Connected!");

  // Set Firebase Config
  config.database_url = DATABASE_URL;
  config.signer.tokens.legacy_token = DATABASE_SECRET;  // 🔹 Use Database Secret for authentication

  Firebase.begin(&config, &auth);
  Firebase.reconnectWiFi(true);
}

void loop() {
  delay(2000);

  float tempC = dht.readTemperature(false);  // Temperature in Celsius
  float tempF = dht.readTemperature(true);   // Temperature in Fahrenheit
  float humidity = dht.readHumidity();       // Humidity

  Serial.print("Temp: ");
  Serial.print(tempC);
  Serial.print(" C, ");
  Serial.print(tempF);
  Serial.print(" F, Hum: ");
  Serial.print(humidity);
  Serial.println("%");


  // Send data to Firebase
  if (Firebase.ready()) {
    if (Firebase.RTDB.setFloat(&fbdo, "/sensor/temperature_C", tempC)) {
      Serial.println("Temperature (C) sent to Firebase");
    } else {
      Serial.println("Failed to send temperature");
      Serial.println(fbdo.errorReason());
    }

    if (Firebase.RTDB.setFloat(&fbdo, "/sensor/temperature_F", tempF)) {
      Serial.println("Temperature (F) sent to Firebase");
    } else {
      Serial.println("Failed to send temperature");
      Serial.println(fbdo.errorReason());
    }

    if (Firebase.RTDB.setFloat(&fbdo, "/sensor/humidity", humidity)) {
      Serial.println("Humidity sent to Firebase");
    } else {
      Serial.println("Failed to send humidity");
      Serial.println(fbdo.errorReason());
    }
  }

  delay(2000); // Send data every 5 seconds
}