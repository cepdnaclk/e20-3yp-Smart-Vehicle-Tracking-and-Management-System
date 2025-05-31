import React, { createContext, useContext, useEffect, useState } from "react";
import socketService from "../services/SocketService";
import { DRIVER_ID } from "../config/constants";

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState(null);

  useEffect(() => {
    // Set up socket connection status tracking
    socketService.setHandlers({
      onConnect: () => {
        console.log("[SocketContext] Socket connected");
        setIsConnected(true);
      },
      onDisconnect: () => {
        console.log("[SocketContext] Socket disconnected");
        setIsConnected(false);
      },
    });

    // Connect to socket server
    socketService.connect();

    // General event logging
    const socket = socketService.socket;
    if (socket) {
      socket.onAny((event, data) => {
        if (event.startsWith("task:")) {
          setLastEvent({
            type: event,
            time: new Date(),
            data,
          });
        }
      });
    }

    // Test connection
    setTimeout(() => {
      socketService.emitTest();
    }, 1500);

    return () => {
      // Don't disconnect - app context handles that
      // Just clear our specific handlers
      socketService.setHandlers({
        onConnect: null,
        onDisconnect: null,
      });
    };
  }, []);

  const reconnect = () => {
    console.log("[SocketContext] Manually reconnecting socket...");
    socketService.disconnect();
    setTimeout(() => socketService.connect(), 500);
  };

  const test = () => {
    return socketService.emitTest();
  };

  return (
    <SocketContext.Provider
      value={{
        isConnected,
        lastEvent,
        reconnect,
        test,
        driverId: DRIVER_ID,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);

export default SocketContext;
