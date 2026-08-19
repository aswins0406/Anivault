import {
  useState,
  useEffect,
  useRef,
} from "react";

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

  // =========================
  // NORMAL HOME PAGINATION
  // =========================

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  // =========================
  // SEARCH
  // =========================

  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const [searchLoading, setSearchLoading] =
    useState(false);

  const [searchPage, setSearchPage] =
    useState(1);

  const [searchHasNext, setSearchHasNext] =
    useState(false);

  // =========================
  // FILTER / SORT
  // =========================

  const [selectedGenre, setSelectedGenre] =
    useState("All");

  const [sortBy, setSortBy] =
    useState("default");

  // =========================
  // DASHBOARD
  // =========================

  const [watchlistCount, setWatchlistCount] =
    useState(0);

  const [completedCount, setCompletedCount] =
    useState(0);

  // =========================
  // REFS
  // =========================

  const observer = useRef(null);
  const searchTimer = useRef(null);


  // =========================
  // LOAD TOP ANIME
  // =========================

  async function loadAnime(pageNumber) {
    try {
      const response =
        await getTopAnime(pageNumber);

      const newAnime =
        response?.data || [];

      if (pageNumber === 1) {
        setAnimeList(newAnime);
      } else {
        setAnimeList((prev) => {
          const existingIds =
            new Set(
              prev.map(
                (anime) =>
                  anime.mal_id
              )
            );

          const uniqueAnime =
            newAnime.filter(
              (anime) =>
                !existingIds.has(
                  anime.mal_id
                )
            );

          return [
            ...prev,
            ...uniqueAnime,
          ];
        });
      }

      setHasMore(
        response?.pagination
          ?.has_next_page ?? false
      );

    } catch (error) {
      console.error(
        "Top Anime Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }


  // =========================
  // LOAD TRENDING
  // =========================

  async function loadTrendingAnime() {
    try {
      const response =
        await getTrendingAnime();

      setTrendingAnime(
        response?.data?.slice(0, 6) ||
          []
      );

    } catch (error) {
      console.error(
        "Trending Error:",
        error
      );

      setTrendingAnime([]);
    }
  }


  // =========================
  // LOAD HOME DATA
  // =========================

  useEffect(() => {
    async function loadData() {

      await loadAnime(page);

      // Load trending only once
      if (page === 1) {
        await loadTrendingAnime();
      }

      setWatchlistCount(
        getWatchlist().length
      );

      setCompletedCount(
        getCompletedAnime().length
      );
    }

    loadData();

  }, [page]);


  // =========================
  // SEARCH API
  // =========================

  useEffect(() => {

    const query =
      search.trim();


    // =========================
    // EMPTY SEARCH
    // =========================

    if (!query) {

      setSearchResults([]);

      setSearchPage(1);

      setSearchHasNext(false);

      setSearchLoading(false);

      if (searchTimer.current) {
        clearTimeout(
          searchTimer.current
        );
      }

      return;
    }


    // =========================
    // RESET SEARCH PAGE
    // =========================

    setSearchPage(1);


    // =========================
    // CLEAR OLD TIMER
    // =========================

    if (searchTimer.current) {
      clearTimeout(
        searchTimer.current
      );
    }


    // =========================
    // SEARCH AFTER DELAY
    // =========================

    searchTimer.current =
      setTimeout(async () => {

        try {

          setSearchLoading(true);


          const response =
            await searchAnime(
              query,
              1
            );


          const results = response?.data || [];
          setSearchResults(
            results
          );


          setSearchHasNext(
            response?.pagination?.has_next_page ?? false
          );


        } catch (error) {

          console.error(
            "Search Error:",
            error
          );

          setSearchResults([]);

          setSearchHasNext(false);

        } finally {

          setSearchLoading(false);

        }

      }, 700);


    // =========================
    // CLEANUP
    // =========================

    return () => {

      if (searchTimer.current) {
        clearTimeout(
          searchTimer.current
        );
      }

    };

  }, [search]);


  // =========================
  // SEARCH PAGE CHANGE
  // =========================

  useEffect(() => {

    const query =
      search.trim();

    if (!query) {
      return;
    }

    // Don't search page 1 again
    if (searchPage === 1) {
      return;
    }


    async function loadSearchPage() {

      try {

        setSearchLoading(true);


        const response =
          await searchAnime(
            query,
            searchPage
          );


        const results = response?.data || [];

setSearchResults(results);

setSearchHasNext(
          response?.pagination?.has_next_page ?? false
        );


        // Scroll to results
        setTimeout(() => {
          document
            .getElementById(
              "anime-list"
            )
            ?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
        }, 100);


      } catch (error) {

        console.error(
          "Search Page Error:",
          error
        );

        setSearchResults([]);

      } finally {

        setSearchLoading(false);

      }

    }

    loadSearchPage();

  }, [searchPage]);


  // =========================
  // GENRE FILTER
  // =========================

  const filteredAnime =
    animeList.filter((anime) => {

      const matchesGenre =
        selectedGenre === "All" ||
        anime.genres?.some(
          (genre) =>
            genre.name ===
            selectedGenre
        );

      return matchesGenre;

    });


  // =========================
  // WHICH ANIME TO DISPLAY
  // =========================

  const isSearching =
    search.trim().length > 0;


  let displayAnime =
    isSearching
      ? searchResults
      : filteredAnime;


  // =========================
  // SORT
  // =========================

  displayAnime = [
    ...displayAnime,
  ];


  switch (sortBy) {

    case "rating":

      displayAnime.sort(
        (a, b) =>
          (b.score || 0) -
          (a.score || 0)
      );

      break;


    case "rating-low":

      displayAnime.sort(
        (a, b) =>
          (a.score || 0) -
          (b.score || 0)
      );

      break;


    case "az":

      displayAnime.sort(
        (a, b) =>
          (a.title || "")
            .localeCompare(
              b.title || ""
            )
      );

      break;


    case "za":

      displayAnime.sort(
        (a, b) =>
          (b.title || "")
            .localeCompare(
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

  const topRatedAnime =
    [...animeList]
      .filter(
        (anime) =>
          anime.score
      )
      .sort(
        (a, b) =>
          (b.score || 0) -
          (a.score || 0)
      )
      .slice(0, 6);


  // =========================
  // INFINITE SCROLL
  // =========================

  const lastAnimeRef =
    (node) => {

      if (
        loading ||
        isSearching
      ) {
        return;
      }


      if (observer.current) {
        observer.current.disconnect();
      }


      observer.current =
        new IntersectionObserver(
          (entries) => {

            if (
              entries[0]
                .isIntersecting &&
              hasMore
            ) {

              setPage(
                (prev) =>
                  prev + 1
              );

            }

          }
        );


      if (node) {

        observer.current.observe(
          node
        );

      }

    };


  // =========================
  // SEARCH PREVIOUS
  // =========================

  function handlePreviousSearchPage() {

    if (
      searchPage <= 1 ||
      searchLoading
    ) {
      return;
    }

    setSearchPage(
      (prev) =>
        prev - 1
    );

  }


  // =========================
  // SEARCH NEXT
  // =========================

  function handleNextSearchPage() {

    if (
      !searchHasNext ||
      searchLoading
    ) {
      return;
    }

    setSearchPage(
      (prev) =>
        prev + 1
    );

  }

// =========================
// EXPLORE BUTTON
// =========================

function handleExplore() {
  const searchInput =
    document.getElementById("anime-search");

  if (!searchInput) {
    return;
  }

  searchInput.scrollIntoView({
    behavior: "smooth",
    block: "center",
  });

  setTimeout(() => {
    searchInput.focus();
  }, 500);
}
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

      {!isSearching && (

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

              <button
  onClick={handleExplore}
  className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-xl font-bold transition"
>
  🔥 Explore Anime
</button>


              <Link
                to="/watchlist"
                className="border border-blue-500 text-blue-400 hover:bg-blue-600 hover:text-white px-8 py-4 rounded-xl font-bold transition"
              >

                ❤️ My Watchlist

              </Link>

            </div>

          </div>

        </section>

      )}


      {/* =========================
          DASHBOARD
      ========================= */}

      {!isSearching && (

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

      )}


      {/* =========================
          TRENDING
      ========================= */}

      {!isSearching && (

        <section
          id="trending"
          className="max-w-7xl mx-auto px-6 mt-16"
        >

          <h2 className="text-4xl font-bold mb-8">

            🔥 Trending Anime

          </h2>


          <div className="flex flex-wrap justify-center gap-8">

            {trendingAnime.map(
              (anime) => (

                <AnimeCard
                  key={anime.mal_id}
                  id={anime.mal_id}
                  title={anime.title}
                  rating={anime.score}
                  genre={
                    anime.genres?.[0]
                      ?.name ||
                    "Unknown"
                  }
                  image={
                    anime.images?.jpg
                      ?.image_url
                  }
                />

              )
            )}

          </div>

        </section>

      )}


      {/* =========================
          TOP RATED
      ========================= */}

      {!isSearching && (

        <section
          id="top-rated"
          className="max-w-7xl mx-auto px-6 mt-20"
        >

          <h2 className="text-4xl font-bold mb-8">

            ⭐ Top Rated Anime

          </h2>


          <div className="flex flex-wrap justify-center gap-8">

            {topRatedAnime.map(
              (anime) => (

                <AnimeCard
                  key={anime.mal_id}
                  id={anime.mal_id}
                  title={anime.title}
                  rating={anime.score}
                  genre={
                    anime.genres?.[0]
                      ?.name ||
                    "Unknown"
                  }
                  image={
                    anime.images?.jpg
                      ?.image_url
                  }
                />

              )
            )}

          </div>

        </section>

      )}


      {/* =========================
          SEARCH
      ========================= */}

      <div
        className={`flex justify-center px-6 ${
          isSearching
            ? "pt-16"
            : "mt-16"
        }`}
      >

        <input
          id="anime-search"
          type="text"
          placeholder="🔍 Search Anime..."
          value={search}
          onChange={(e) =>
            setSearch(
              e.target.value
            )
          }
          className="w-full max-w-xl px-5 py-4 rounded-xl bg-gray-900 border border-gray-700 outline-none focus:border-blue-500"
        />

      </div>


      {/* =========================
          GENRES
      ========================= */}

      {!isSearching && (

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
          ].map(
            (genre) => (

              <button
                key={genre}
                onClick={() =>
                  setSelectedGenre(
                    genre
                  )
                }
                className={`px-5 py-2 rounded-xl transition ${
                  selectedGenre ===
                  genre
                    ? "bg-blue-600"
                    : "bg-gray-800 hover:bg-gray-700"
                }`}
              >

                {genre}

              </button>

            )
          )}

        </div>

      )}


      {/* =========================
          SEARCH LOADING
      ========================= */}

      {isSearching &&
        searchLoading && (

          <div className="text-center py-16">

            <p className="text-gray-400 text-lg">

              Searching for "{search}"...

            </p>

          </div>

        )}


      {/* =========================
          SEARCH RESULT TITLE
      ========================= */}

      {isSearching &&
        !searchLoading &&
        searchResults.length > 0 && (

          <h2 className="text-3xl font-bold text-center mt-12">

            🔎 Results for "{search}"

          </h2>

        )}


      {/* =========================
          ANIME LIST
      ========================= */}

      <section
        id="anime-list"
        className="max-w-7xl mx-auto px-6 py-16"
      >

        {/* =========================
            NO RESULTS
        ========================= */}

        {!searchLoading &&
          displayAnime.length ===
            0 && (

            <div className="text-center">

              <h2 className="text-4xl font-bold">

                😔 No Anime Found

              </h2>

              <p className="text-gray-400 mt-4">

                {isSearching
                  ? `No results found for "${search}".`
                  : "Try another genre."}

              </p>

            </div>

          )}


        {/* =========================
            CARDS
        ========================= */}

        {!searchLoading &&
          displayAnime.length >
            0 && (

            <div className="flex flex-wrap justify-center gap-8">

              {displayAnime.map(
                (anime, index) => {

                  const isLast =
                    !isSearching &&
                    index ===
                      displayAnime.length -
                        1;


                  if (isLast) {

                    return (

                      <div
                        key={
                          anime.mal_id
                        }
                        ref={
                          lastAnimeRef
                        }
                      >

                        <AnimeCard
                          id={
                            anime.mal_id
                          }
                          title={
                            anime.title
                          }
                          rating={
                            anime.score
                          }
                          genre={
                            anime.genres?.[0]
                              ?.name ||
                            "Unknown"
                          }
                          image={
                            anime.images?.jpg
                              ?.image_url
                          }
                        />

                      </div>

                    );

                  }


                  return (

                    <AnimeCard
                      key={
                        anime.mal_id
                      }
                      id={
                        anime.mal_id
                      }
                      title={
                        anime.title
                      }
                      rating={
                        anime.score
                      }
                      genre={
                        anime.genres?.[0]
                          ?.name ||
                        "Unknown"
                      }
                      image={
                        anime.images?.jpg
                          ?.image_url
                      }
                    />

                  );

                }
              )}

            </div>

          )}


        {/* =========================
            SEARCH PAGINATION
        ========================= */}

        {isSearching &&
          !searchLoading &&
          searchResults.length >
            0 && (

            <div className="flex justify-center items-center gap-6 mt-12">

              <button
                onClick={
                  handlePreviousSearchPage
                }
                disabled={
                  searchPage === 1 ||
                  searchLoading
                }
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  searchPage === 1 ||
                  searchLoading
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >

                ⬅️ Previous

              </button>


              <div className="bg-gray-900 px-6 py-3 rounded-xl font-bold">

                Page {searchPage}

              </div>


              <button
                onClick={
                  handleNextSearchPage
                }
                disabled={
                  !searchHasNext ||
                  searchLoading
                }
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  !searchHasNext ||
                  searchLoading
                    ? "bg-gray-800 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >

                Next ➡️

              </button>

            </div>

          )}

      </section>

    </div>

  );
}

export default Home;