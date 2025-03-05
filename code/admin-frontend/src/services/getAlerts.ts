import { ref, child, get } from "firebase/database";
import { database } from "../lib/firebase";

export const getAlerts = async (): Promise<object | null> => {
    try {
        const alertsRef = ref(database, "alerts");
        const snapshot = await get(alertsRef);

        if (snapshot.exists()) {
            return snapshot.val();
        } else {
            console.warn("No alertsfound");
            return null;
        }
    } catch (error) {
        console.error("Error fetching alaerts data:", error);
        throw error;
    }
};