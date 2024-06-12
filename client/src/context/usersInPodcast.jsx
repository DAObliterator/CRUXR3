import { createContext, useState } from "react";

const UsersInPodcastContext = createContext(null);

const UsersInPodcastProvider = ({ children }) => {
  const [podcastListeners, setPodcastListeners] = useState([]);

  return (
    <UsersInPodcastContext.Provider
      value={{podcastListeners: [], setPodcastListeners}}
    >
      {children}
    </UsersInPodcastContext.Provider>
  );
};

export { UsersInPodcastContext , UsersInPodcastProvider};
