#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_ADXL345_U.h>

Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);

// Thresholds (Tune these values based on real-world testing)
const float DECELERATION_THRESHOLD = 6.0; // Sudden drop in acceleration (m/s²)
const int CHECK_INTERVAL = 100;           // Time interval in ms

float previous_accel = 0; // Store previous acceleration value

void setup() {
    Serial.begin(115200);
    Serial.println("Initializing ADXL345...");

    if (!accel.begin()) {
        Serial.println("No ADXL345 detected. Check wiring!");
        while (1); // Stop execution if the sensor is not detected
    }

    Serial.println("ADXL345 initialized successfully!");
    accel.setRange(ADXL345_RANGE_16_G); // Max sensitivity
}

void loop() {
    sensors_event_t event;
    accel.getEvent(&event);

    // Compute total acceleration (magnitude)
    float current_accel = sqrt(pow(event.acceleration.x, 2) +
                               pow(event.acceleration.y, 2) +
                               pow(event.acceleration.z, 2));

    // Compute deceleration (change in acceleration)
    float deceleration = previous_accel - current_accel;

    Serial.print("Current Accel: "); Serial.print(current_accel);
    Serial.print(" m/s² | Deceleration: "); Serial.println(deceleration);

    // Check if deceleration is sudden
    if (deceleration > DECELERATION_THRESHOLD) {
        Serial.println("🚨 ACCIDENT DETECTED! 🚨");
        // Add GSM/GPS alert function here
    }

    // Update previous acceleration for next loop
    previous_accel = current_accel;

    delay(CHECK_INTERVAL);
}
