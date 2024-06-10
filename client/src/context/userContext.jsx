import { createContext, useState } from "react";

export const UserContext = createContext(null);

export const UserProvider = ({ props }) => {
  const [currentUser, setCurrentUser] = useState({});

  return (
    <UserContext.Provider value={{ currentUser, setCurrentUser }}>
      {props}
    </UserContext.Provider>
  );
};
