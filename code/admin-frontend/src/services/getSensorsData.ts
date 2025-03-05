import { ref, child, get } from "firebase/database";
import { database } from "../lib/firebase";

export const getSensorsData = async (): Promise<object | null> => {
    try {
        const sensorRef = ref(database, "sensor");
        const snapshot = await get(sensorRef);

        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.warn("No sensor data found");
            return null;
        }
    } catch (error) {
        console.error("Error fetching sensor data:", error);
        throw error;
    }
};