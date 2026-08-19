import { createContext, useState, useEffect } from "react";

import { getWatchlist } from "../services/watchlist";
import { getCompletedAnime } from "../services/completed";

export const AppContext = createContext();

function AppProvider({ children }) {

  const [watchlistCount, setWatchlistCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    setWatchlistCount(getWatchlist().length);
    setCompletedCount(getCompletedAnime().length);
  }, []);

  return (
    <AppContext.Provider
      value={{
        watchlistCount,
        setWatchlistCount,
        completedCount,
        setCompletedCount,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export default AppProvider;