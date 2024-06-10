import React, { createContext, useMemo } from "react";
import { io, Socket } from "socket.io-client";

const apiUrl =
  import.meta.env.VITE_ENV === "development"
    ? import.meta.env.VITE_API_DEV
    : import.meta.env.VITE_API_PROD;

const SocketContext = createContext(null);

const SocketProvider = (props) => {
  const socket = useMemo(() =>
    io(apiUrl, {
      withCredentials: true,
      auth: {
        name:
          window.sessionStorage.getItem("name") &&
          window.sessionStorage.getItem("name"),
        roomId: window.sessionStorage.getItem(
          window.sessionStorage.getItem("podcastTopic")
        ),
      },
    })
  );

  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
};
export { SocketContext, SocketProvider };
