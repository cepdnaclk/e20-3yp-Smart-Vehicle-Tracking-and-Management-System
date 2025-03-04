import { ref, child, get } from "firebase/database";
import { database } from "../lib/firebase";

export const getVehicleTrackingData = async (): Promise<object | null> => {
    try {
        const vehiclesRef = ref(database, "gps");
        const snapshot = await get(vehiclesRef);

        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.warn("No tracking data found");
            return null;
        }
    } catch (error) {
        console.error("Error fetching tracking data:", error);
        throw error;
    }
};