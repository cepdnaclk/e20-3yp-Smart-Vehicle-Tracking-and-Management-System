import React from "react";

// This function checks for and creates minimal implementations of missing components
export const createMissingComponents = () => {
  // Create minimal implementations for potentially missing components

  // Services
  if (!window.hasOwnProperty("api")) {
    window.api = {
      get: async (url) => {
        console.log(`Mocked GET request to ${url}`);
        // Return mock data based on endpoint
        if (url.includes("/vehicles")) {
          return {
            data: [
              {
                _id: "1",
                vehicleName: "Delivery Truck 1",
                licensePlate: "CAM-8086",
              },
              { _id: "2", vehicleName: "Cargo Van", licensePlate: "CAT-1234" },
            ],
          };
        }
        if (url.includes("/drivers")) {
          return { data: [] }; // Use mock data in components
        }
        return { data: [] };
      },
      post: async (url, data) => {
        console.log(`Mocked POST request to ${url}`, data);
        return { data: { success: true } };
      },
      put: async (url, data) => {
        console.log(`Mocked PUT request to ${url}`, data);
        return { data: { success: true } };
      },
      delete: async (url) => {
        console.log(`Mocked DELETE request to ${url}`);
        return { data: { success: true } };
      },
    };
  }

  // Ensure Firebase service if needed
  if (!window.hasOwnProperty("firebase")) {
    window.firebase = {
      database: () => ({
        ref: () => ({
          on: (_, callback) =>
            callback({
              val: () => ({
                temperature: 25,
                humidity: 60,
                speed: 75,
                location: { lat: 6.9271, lng: 79.8612 },
              }),
            }),
        }),
      }),
    };
  }

  console.log(
    "Created minimal implementations for potentially missing components"
  );
};
