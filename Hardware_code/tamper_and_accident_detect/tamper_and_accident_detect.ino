#include <Wire.h>
#include <Adafruit_Sensor.h>
#include <Adafruit_ADXL345_U.h>

Adafruit_ADXL345_Unified accel = Adafruit_ADXL345_Unified(12345);

// Accident detection thresholds
const float DECELERATION_THRESHOLD = 6.0; // Sudden drop in acceleration (m/s²)
const int CHECK_INTERVAL = 100;           // Time interval in ms
float previous_accel = 0; // Store previous acceleration value

// Tampering detection thresholds
#define SHOCK_THRESHOLD 7.0   // Adjust for real-world testing
#define FREE_FALL_THRESHOLD 1.0 // Below this value, assume free fall
#define ORIENTATION_CHANGE_THRESHOLD 12.0 // Orientation change detection
#define SAMPLE_SIZE 10  // Number of samples for filtering

float xSamples[SAMPLE_SIZE] = {0}, ySamples[SAMPLE_SIZE] = {0}, zSamples[SAMPLE_SIZE] = {0};
int sampleIndex = 0;
float baselineX, baselineY, baselineZ;
bool baselineSet = false;

void setup() {
    Serial.begin(115200);
    Serial.println("Initializing ADXL345...");

    if (!accel.begin()) {
        Serial.println("No ADXL345 detected. Check wiring!");
        while (1);
    }

    accel.setRange(ADXL345_RANGE_16_G);

    // **Calibrate Baseline Over Multiple Readings**
    Serial.println("Calibrating baseline...");
    float sumX = 0, sumY = 0, sumZ = 0;
    for (int i = 0; i < SAMPLE_SIZE; i++) {
        sensors_event_t event;
        accel.getEvent(&event);
        sumX += event.acceleration.x;
        sumY += event.acceleration.y;
        sumZ += event.acceleration.z;
        delay(100);
    }
    baselineX = sumX / SAMPLE_SIZE;
    baselineY = sumY / SAMPLE_SIZE;
    baselineZ = sumZ / SAMPLE_SIZE;
    baselineSet = true;
    Serial.println("Baseline Set!");
}

void loop() {
    sensors_event_t event;
    accel.getEvent(&event);

    float x = event.acceleration.x;
    float y = event.acceleration.y;
    float z = event.acceleration.z;

    // **Accident Detection**
    float current_accel = sqrt(x * x + y * y + z * z);
    float deceleration = previous_accel - current_accel;

    Serial.print("Current Accel: "); Serial.print(current_accel);
    Serial.print(" m/s² | Deceleration: "); Serial.println(deceleration);

    if (deceleration > DECELERATION_THRESHOLD) {
        Serial.println("🚨 ACCIDENT DETECTED! 🚨");
    }
    previous_accel = current_accel;

    // **Tampering Detection**
    xSamples[sampleIndex] = x;
    ySamples[sampleIndex] = y;
    zSamples[sampleIndex] = z;
    sampleIndex = (sampleIndex + 1) % SAMPLE_SIZE;

    float avgX = 0, avgY = 0, avgZ = 0;
    for (int i = 0; i < SAMPLE_SIZE; i++) {
        avgX += xSamples[i];
        avgY += ySamples[i];
        avgZ += zSamples[i];
    }
    avgX /= SAMPLE_SIZE;
    avgY /= SAMPLE_SIZE;
    avgZ /= SAMPLE_SIZE;

    float totalAcceleration = sqrt(avgX * avgX + avgY * avgY + avgZ * avgZ);
    if (totalAcceleration < FREE_FALL_THRESHOLD) {
        Serial.println("🚨 Free Fall Detected! Possible Removal! 🚨");
    }

    if (baselineSet) {
        float deltaX = abs(avgX - baselineX);
        float deltaY = abs(avgY - baselineY);
        float deltaZ = abs(avgZ - baselineZ);

        float accelerationChange = sqrt(deltaX * deltaX + deltaY * deltaY + deltaZ * deltaZ);

        if (accelerationChange > SHOCK_THRESHOLD) {
            Serial.println("🚨 Shock Detected! Possible Forced Removal! 🚨");
        }
    }

    float orientationChange = sqrt(pow(avgX - baselineX, 2) + pow(avgY - baselineY, 2) + pow(avgZ - baselineZ, 2));
    if (orientationChange > ORIENTATION_CHANGE_THRESHOLD) {
        Serial.println("🚨 Orientation Change Detected! Possible Tampering! 🚨");
    }

    delay(CHECK_INTERVAL);
}
