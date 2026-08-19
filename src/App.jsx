import { Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Watchlist from "./pages/Watchlist";
import Completed from "./pages/Completed";
import MyAnime from "./pages/MyAnime";
import AnimeDetails from "./pages/AnimeDetails";
if ("scrollRestoration" in window.history) {
  window.history.scrollRestoration = "manual";
}

function App() {
  return (
    <>
      <Navbar />

      <Routes>
        <Route path="/" element={<Home />} />

        <Route
          path="/watchlist"
          element={<Watchlist />}
        />

        <Route
          path="/completed"
          element={<Completed />}
        />
<Route
  path="/my-anime"
  element={<MyAnime />}
/>
        <Route
          path="/anime/:id"
          element={<AnimeDetails />}
        />
      </Routes>
    </>
  );
}

export default App;