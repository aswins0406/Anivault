import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import AnimeCard from "../components/AnimeCard";

import {
  getTopAnime,
  getTrendingAnime,
  searchAnime,
} from "../services/animeApi";

import { getWatchlist } from "../services/watchlist";
import { getCompletedAnime } from "../services/completed";

function Home() {
  // =========================
  // STATES
  // =========================

  const [animeList, setAnimeList] = useState([]);
  const [trendingAnime, setTrendingAnime] = useState([]);

  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  const [selectedGenre, setSelectedGenre] = useState("All");
  const [sortBy, setSortBy] = useState("default");

  const [watchlistCount, setWatchlistCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);

  const observer = useRef(null);

  // =========================
  // LOAD TOP ANIME
  // =========================

  async function loadAnime(pageNumber) {
    try {
      const response = await getTopAnime(pageNumber);

      if (pageNumber === 1) {
        setAnimeList(response.data || []);
      } else {
        setAnimeList((prev) => [
          ...prev,
          ...(response.data || []),
        ]);
      }

      setHasMore(
        response.pagination?.has_next_page ?? false
      );
    } catch (error) {
      console.error("Top Anime Error:", error);
    } finally {
      setLoading(false);
    }
  }

  // =========================
  // LOAD TRENDING
  // =========================

  async function loadTrendingAnime() {
    try {
      const response = await getTrendingAnime();

      setTrendingAnime(
        response.data?.slice(0, 6) || []
      );
    } catch (error) {
      console.error("Trending Error:", error);
      setTrendingAnime([]);
    }
  }

  // =========================
  // LOAD INITIAL DATA
  // =========================

  useEffect(() => {
    async function loadData() {
      await loadAnime(page);

      if (page === 1) {
        await loadTrendingAnime();

        setCompletedCount(
          getCompletedAnime().length
        );

        setWatchlistCount(
          getWatchlist().length
        );
      }
    }

    loadData();
  }, [page]);

  // =========================
  // BACKEND SEARCH
  // =========================

  useEffect(() => {
    const timer = setTimeout(async () => {
      // Empty search
      if (!search.trim()) {
        setSearchResults([]);
        setSearchLoading(false);
        return;
      }

      try {
        setSearchLoading(true);

        console.log(
          "Searching backend:",
          search.trim()
        );

        const response = await searchAnime(
          search.trim(),
          1
        );

        console.log(
          "Search response:",
          response
        );

        setSearchResults(
          Array.isArray(response?.data) ? response.data : []
        );
      } catch (error) {
        console.error(
          "Search Error:",
          error
        );

        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // =========================
  // RESTORE HOME SCROLL
  // =========================

  useEffect(() => {
    if (!loading) {
      const savedPosition =
        sessionStorage.getItem(
          "homeScrollPosition"
        );

      if (savedPosition !== null) {
        setTimeout(() => {
          window.scrollTo({
            top: Number(savedPosition),
            behavior: "auto",
          });

          sessionStorage.removeItem(
            "homeScrollPosition"
          );
        }, 100);
      }
    }
  }, [loading]);

  // =========================
  // FILTER
  // =========================

  const filteredAnime = search.trim()
    ? searchResults.filter((anime) => {
        const matchesGenre =
          selectedGenre === "All" ||
          anime.genres?.some((genre) => genre.name === selectedGenre);
        return matchesGenre;
      })
    : animeList.filter((anime) => {
        const matchesGenre =
          selectedGenre === "All" ||
          anime.genres?.some(
            (genre) =>
              genre.name === selectedGenre
          );

        return matchesGenre;
      });

  // =========================
  // SORT
  // =========================

  const sortedAnime = [...filteredAnime];

  switch (sortBy) {
    case "rating":
      sortedAnime.sort(
        (a, b) =>
          (b.score || 0) -
          (a.score || 0)
      );
      break;

    case "rating-low":
      sortedAnime.sort(
        (a, b) =>
          (a.score || 0) -
          (b.score || 0)
      );
      break;

    case "az":
      sortedAnime.sort((a, b) =>
        (a.title || "").localeCompare(
          b.title || ""
        )
      );
      break;

    case "za":
      sortedAnime.sort((a, b) =>
        (b.title || "").localeCompare(
          a.title || ""
        )
      );
      break;

    default:
      break;
  }

  // =========================
  // TOP RATED
  // =========================

  const topRatedAnime = [...animeList]
    .filter((anime) => anime.score)
    .sort(
      (a, b) =>
        (b.score || 0) -
        (a.score || 0)
    )
    .slice(0, 6);

  // =========================
  // INFINITE SCROLL
  // =========================

  const lastAnimeRef = (node) => {
    // Don't infinite-scroll while searching
    if (loading || search.trim()) {
      return;
    }

    if (observer.current) {
      observer.current.disconnect();
    }

    observer.current =
      new IntersectionObserver(
        (entries) => {
          if (
            entries[0].isIntersecting &&
            hasMore &&
            !search.trim()
          ) {
            setPage((prev) => prev + 1);
          }
        }
      );

    if (node) {
      observer.current.observe(node);
    }
  };

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white text-2xl">
        Loading...
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="min-h-screen bg-black text-white">

      {/* =========================
          HERO SECTION
      ========================= */}

      <section className="bg-gradient-to-b from-gray-900 via-black to-black py-24 px-6">

        <div className="max-w-6xl mx-auto text-center">

          <p className="text-blue-500 font-semibold text-lg tracking-widest">
            TRACK • DISCOVER • WATCH
          </p>

          <h1 className="text-5xl md:text-7xl font-extrabold mt-6">

            Welcome to

            <span className="text-blue-500">
              {" "}AniVault
            </span>

          </h1>

          <p className="text-gray-400 text-lg mt-8 max-w-3xl mx-auto">

            Discover thousands of anime,
            build your personal watchlist,
            track your journey, and explore
            the anime world like never before.

          </p>

          <div className="flex justify-center gap-5 mt-10 flex-wrap">

            <a
              href="#anime-list"
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-bold transition"
            >
              🔥 Explore Anime
            </a>

            <Link
              to="/watchlist"
              className="border border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-xl font-bold transition"
            >
              ❤️ My Watchlist
            </Link>

          </div>

        </div>

      </section>

      {/* =========================
          DASHBOARD
      ========================= */}

      <section className="max-w-6xl mx-auto px-6 mt-12">

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div className="bg-gray-900 rounded-2xl p-6 text-center border border-pink-500">

            <h2 className="text-4xl">
              ❤️
            </h2>

            <h3 className="text-3xl font-bold mt-3">
              {watchlistCount}
            </h3>

            <p className="text-gray-400 mt-2">
              Watchlist
            </p>

          </div>

          <div className="bg-gray-900 rounded-2xl p-6 text-center border border-green-500">

            <h2 className="text-4xl">
              ✅
            </h2>

            <h3 className="text-3xl font-bold mt-3">
              {completedCount}
            </h3>

            <p className="text-gray-400 mt-2">
              Completed
            </p>

          </div>

        </div>

      </section>

      {/* =========================
          TRENDING
      ========================= */}

      <section
        id="trending"
        className="max-w-7xl mx-auto px-6 mt-16"
      >

        <h2 className="text-4xl font-bold mb-8">
          🔥 Trending Anime
        </h2>

        <div className="flex flex-wrap justify-center gap-8">

          {trendingAnime.map((anime) => (

            <AnimeCard
              key={anime.mal_id}
              id={anime.mal_id}
              title={anime.title}
              rating={anime.score}
              genre={
                anime.genres?.[0]?.name ||
                "Unknown"
              }
              image={
                anime.images?.jpg?.image_url
              }
            />

          ))}

        </div>

      </section>

      {/* =========================
          TOP RATED
      ========================= */}

      <section
        id="top-rated"
        className="max-w-7xl mx-auto px-6 mt-20"
      >

        <h2 className="text-4xl font-bold mb-8">
          ⭐ Top Rated Anime
        </h2>

        <div className="flex flex-wrap justify-center gap-8">

          {topRatedAnime.map((anime) => (

            <AnimeCard
              key={anime.mal_id}
              id={anime.mal_id}
              title={anime.title}
              rating={anime.score}
              genre={
                anime.genres?.[0]?.name ||
                "Unknown"
              }
              image={
                anime.images?.jpg?.image_url
              }
            />

          ))}

        </div>

      </section>

      {/* =========================
          SEARCH
      ========================= */}

      <div className="flex justify-center px-6 mt-16">

        <input
          type="text"
          placeholder="🔍 Search Anime..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          className="w-full max-w-xl px-5 py-4 rounded-xl bg-gray-900 border border-gray-700 outline-none focus:border-blue-500"
        />

      </div>

      {/* =========================
          SEARCH STATUS
      ========================= */}

      {search.trim() && (
        <div className="text-center mt-6">

          {searchLoading ? (

            <p className="text-gray-400">
              🔍 Searching for "{search}"...
            </p>

          ) : (

            <p className="text-gray-400">
              Search results for "{search}"
            </p>

          )}

        </div>
      )}

      {/* =========================
          GENRES
      ========================= */}

      <div
        id="genres"
        className="flex flex-wrap justify-center gap-4 mt-8 px-6"
      >

        {[
          "All",
          "Action",
          "Adventure",
          "Comedy",
          "Fantasy",
        ].map((genre) => (

          <button
            key={genre}
            onClick={() =>
              setSelectedGenre(genre)
            }
            className={`px-5 py-2 rounded-xl transition ${
              selectedGenre === genre
                ? "bg-blue-600"
                : "bg-gray-800 hover:bg-gray-700"
            }`}
          >
            {genre}
          </button>

        ))}

      </div>

      {/* =========================
          ANIME LIST
      ========================= */}

      <section
        id="anime-list"
        className="max-w-7xl mx-auto px-6 py-16"
      >

        {/* SEARCH LOADING */}

        {searchLoading ? (

          <div className="text-center py-10">

            <h2 className="text-3xl font-bold">
              🔍 Searching...
            </h2>

            <p className="text-gray-400 mt-4">
              Finding anime for you...
            </p>

          </div>

        ) : sortedAnime.length === 0 ? (

          /* NO RESULTS */

          <div className="text-center">

            <h2 className="text-4xl font-bold">
              😔 No Anime Found
            </h2>

            <p className="text-gray-400 mt-4">
              Try another search or genre.
            </p>

          </div>

        ) : (

          /* ANIME CARDS */

          <div className="flex flex-wrap justify-center gap-8">

            {sortedAnime.map(
              (anime, index) => {

                const isLast =
                  sortedAnime.length ===
                  index + 1;

                const card = (
                  <AnimeCard
                    id={anime.mal_id}
                    title={anime.title}
                    rating={anime.score}
                    genre={
                      anime.genres?.[0]?.name ||
                      "Unknown"
                    }
                    image={
                      anime.images?.jpg
                        ?.image_url
                    }
                  />
                );

                if (isLast && !search.trim()) {

                  return (
                    <div
                      key={anime.mal_id}
                      ref={lastAnimeRef}
                    >
                      {card}
                    </div>
                  );

                }

                return (
                  <div
                    key={anime.mal_id}
                  >
                    {card}
                  </div>
                );
              }
            )}

          </div>

        )}

      </section>

    </div>
  );
}

export default Home;