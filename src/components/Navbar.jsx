import { useState } from "react";
import { Link } from "react-router-dom";
import { useContext } from "react";
import { AppContext } from "../context/AppContext";

function Navbar() {
  const {
    watchlistCount,
    completedCount,
  } = useContext(AppContext);

  const [menuOpen, setMenuOpen] = useState(false);

  const scrollToSection = (id) => {
  setMenuOpen(false);

  if (window.location.pathname !== "/") {
    window.location.href = `/?scroll=${id}`;
    return;
  }

  setTimeout(() => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, 150);
};

  return (
    <nav className="bg-black text-white px-6 py-5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">

        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold text-blue-500"
        >
          🏴‍☠️ AniVault
        </Link>

        {/* ========================= */}
        {/* DESKTOP MENU */}
        {/* ========================= */}

        <ul className="hidden md:flex items-center gap-8">

          <li>
            <Link
              to="/"
              className="hover:text-blue-500"
            >
              Home
            </Link>
          </li>

          <li>
            <button
              onClick={() => scrollToSection("trending")}
              className="hover:text-blue-500"
            >
              Trending
            </button>
          </li>

          <li>
            <button
              onClick={() => scrollToSection("genres")}
              className="hover:text-blue-500"
            >
              Genres
            </button>
          </li>

          <li>
            <button
              onClick={() => scrollToSection("top-rated")}
              className="hover:text-blue-500"
            >
              Top Rated
            </button>
          </li>

          <li>
            <Link
              to="/watchlist"
              className="hover:text-pink-500"
            >
              ❤️ Watchlist ({watchlistCount})
            </Link>
          </li>

          <li>
            <Link
              to="/completed"
              className="hover:text-green-500"
            >
              ✅ Completed ({completedCount})
            </Link>
          </li>
<li>
  <Link
    to="/my-anime"
    onClick={() => setMenuOpen(false)}
    className="hover:text-purple-500"
  >
    📚 My Anime
  </Link>
</li>
        </ul>

        {/* ========================= */}
        {/* MOBILE MENU BUTTON */}
        {/* ========================= */}

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden text-2xl"
        >
          ☰
        </button>

      </div>

      {/* ========================= */}
      {/* MOBILE MENU */}
      {/* ========================= */}

      {menuOpen && (
        <ul className="md:hidden mt-4 flex flex-col gap-4 border-t border-gray-800 pt-4">

          <li>
            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="block hover:text-blue-500"
            >
              Home
            </Link>
          </li>

          <li>
            <button
              onClick={() => scrollToSection("trending")}
              className="block hover:text-blue-500"
            >
              Trending
            </button>
          </li>

          <li>
            <button
              onClick={() => scrollToSection("genres")}
              className="block hover:text-blue-500"
            >
              Genres
            </button>
          </li>

          <li>
            <button
              onClick={() => scrollToSection("top-rated")}
              className="block hover:text-blue-500"
            >
              Top Rated
            </button>
          </li>

          <li>
            <Link
              to="/watchlist"
              onClick={() => setMenuOpen(false)}
              className="block hover:text-pink-500"
            >
              ❤️ Watchlist ({watchlistCount})
            </Link>
          </li>

          <li>
            <Link
              to="/completed"
              onClick={() => setMenuOpen(false)}
              className="block hover:text-green-500"
            >
              ✅ Completed ({completedCount})
            </Link>
          </li>
<li>
  <Link
    to="/my-anime"
    onClick={() => setMenuOpen(false)}
    className="hover:text-purple-500"
  >
    📚 My Anime
  </Link>
</li>
        </ul>
      )}
    </nav>
  );
}

export default Navbar;