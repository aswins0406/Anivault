import { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";

import {
  setAnimeStatus,
  getStatus,
} from "../services/animeStatus";

import {
  getAnimeProgressById,
  incrementEpisode,
  decrementEpisode,
  getCompletionPercentage,
  getWatchTime,
  formatWatchTime,
} from "../services/animeProgress";

import { getAnimeDetails } from "../services/animeApi";

import { AppContext } from "../context/AppContext";

import {
  addToWatchlist,
  isInWatchlist,
} from "../services/watchlist";

import {
  addCompletedAnime,
  isCompleted,
} from "../services/completed";

function AnimeDetails() {
  const { id } = useParams();

  // =========================
  // STATES
  // =========================

  const [anime, setAnime] = useState(null);
  const [loading, setLoading] = useState(true);

  const [watchedEpisodes, setWatchedEpisodes] = useState(0);

  const [added, setAdded] = useState(false);
  const [completed, setCompleted] = useState(false);

  const [status, setStatus] = useState("");

  const {
    watchlistCount,
    setWatchlistCount,
    completedCount,
    setCompletedCount,
  } = useContext(AppContext);

  // =========================
  // EPISODE DURATION
  // =========================

  function getEpisodeDuration(duration) {
    if (!duration) {
      return 0;
    }

    const match = duration.match(/\d+/);

    return match ? Number(match[0]) : 0;
  }

  // =========================
  // LOAD ANIME
  // =========================

  useEffect(() => {
    async function loadAnime() {
      try {
        setLoading(true);

        const data = await getAnimeDetails(id);

        setAnime(data);

        // Saved progress
        const savedProgress =
          getAnimeProgressById(data.mal_id);

        setWatchedEpisodes(
          savedProgress?.watchedEpisodes || 0
        );

        // Watchlist
        setAdded(
          isInWatchlist(data.mal_id)
        );

        // Completed
        setCompleted(
          isCompleted(data.mal_id)
        );

        // User status
        setStatus(
          getStatus(data.mal_id) || ""
        );

        // IMPORTANT:
        // Details page always starts from top
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "instant",
        });

      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadAnime();
  }, [id]);

  // =========================
  // ADD TO WATCHLIST
  // =========================

  function handleAddWatchlist() {
    if (added) {
      return;
    }

    addToWatchlist(anime);

    setAdded(true);

    setWatchlistCount(
      watchlistCount + 1
    );

    alert("Anime added to Watchlist ❤️");
  }

  // =========================
  // NEXT EPISODE
  // =========================

  function handleNextEpisode() {
    const totalEpisodes =
      anime.episodes || 0;

    if (totalEpisodes === 0) {
      alert("Episode count is unavailable.");
      return;
    }

    const episodeDuration =
      getEpisodeDuration(anime.duration);

    const next = incrementEpisode(
      anime.mal_id,
      totalEpisodes,
      episodeDuration
    );

    setWatchedEpisodes(next);
  }

  // =========================
  // PREVIOUS EPISODE
  // =========================

  function handlePreviousEpisode() {
    const totalEpisodes =
      anime.episodes || 0;

    if (totalEpisodes === 0) {
      return;
    }

    const episodeDuration =
      getEpisodeDuration(anime.duration);

    const previous = decrementEpisode(
      anime.mal_id,
      totalEpisodes,
      episodeDuration
    );

    setWatchedEpisodes(previous);
  }

  // =========================
  // MARK COMPLETED
  // =========================

  function handleCompleted() {
    if (completed) {
      return;
    }

    addCompletedAnime(anime);

    setCompleted(true);

    setCompletedCount(
      completedCount + 1
    );

    alert("Anime marked as Completed 🎉");
  }

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-gray-400">
          Loading anime...
        </p>
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (!anime) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-xl text-red-400">
          Failed to load anime.
        </p>
      </div>
    );
  }

  // =========================
  // COMPLETION %
  // =========================

  const completionPercentage =
    getCompletionPercentage(
      watchedEpisodes,
      anime.episodes
    );

  // =========================
  // WATCH TIME
  // =========================

  const progress =
    getAnimeProgressById(
      anime.mal_id
    );

  const watchTime = getWatchTime(
    watchedEpisodes,
    progress.episodeDuration ||
      getEpisodeDuration(anime.duration)
  );

  const formattedWatchTime =
    formatWatchTime(watchTime);

  // =========================
  // STATUS COLORS
  // =========================

  const statusColor =
    status === "Plan to Watch"
      ? "border-blue-500 focus:border-blue-500"
      : status === "Watching"
      ? "border-green-500 focus:border-green-500"
      : status === "On Hold"
      ? "border-yellow-500 focus:border-yellow-500"
      : status === "Dropped"
      ? "border-red-500 focus:border-red-500"
      : "border-gray-700 focus:border-blue-500";

  const statusTextColor =
    status === "Plan to Watch"
      ? "text-blue-400"
      : status === "Watching"
      ? "text-green-400"
      : status === "On Hold"
      ? "text-yellow-400"
      : status === "Dropped"
      ? "text-red-400"
      : "text-white";

  // =========================
  // RETURN
  // =========================

  return (
    <div className="min-h-screen">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* =========================
            TOP DETAILS SECTION
        ========================= */}

        <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-8 lg:gap-10">

          {/* =========================
              POSTER
          ========================= */}

          <div className="flex justify-center lg:justify-start">

            <div
              className="
                rounded-xl
                overflow-hidden
                shadow-2xl
                bg-gray-900
              "
              style={{
                width: "260px",
                height: "380px",
                maxWidth: "100%",
              }}
            >

              <img
                src={
                  anime.images?.jpg
                    ?.large_image_url ||
                  anime.images?.jpg
                    ?.image_url
                }
                alt={anime.title}
                className="w-full h-full object-cover"
              />

            </div>

          </div>

          {/* =========================
              ANIME INFORMATION
          ========================= */}

          <div className="min-w-0">

            {/* NAME */}

            <h1
              className="
                text-3xl
                sm:text-4xl
                lg:text-5xl
                font-bold
                text-white
                break-words
              "
            >
              {anime.title}
            </h1>

            {/* =========================
                RATING / EPISODES / STATUS
            ========================= */}

            <div
              className="
                flex
                flex-wrap
                items-center
                gap-4
                sm:gap-6
                mt-6
                text-base
                sm:text-lg
                text-gray-300
              "
            >

              <p>
                ⭐ {anime.score || "N/A"}
              </p>

              <p>
                📺 {anime.episodes || "?"} Episodes
              </p>

              <p>
                🟢 {anime.status || "Unknown"}
              </p>

            </div>

            {/* =========================
                GENRES
            ========================= */}

            <div className="flex flex-wrap gap-3 mt-6">

              {anime.genres?.map((genre) => (
                <span
                  key={genre.mal_id}
                  className="
                    bg-blue-600
                    hover:bg-blue-700
                    px-4
                    py-2
                    rounded-full
                    text-sm
                    transition
                  "
                >
                  {genre.name}
                </span>
              ))}

            </div>

            {/* =========================
                SYNOPSIS
            ========================= */}

            <p
              className="
                mt-8
                text-gray-300
                leading-7
                text-base
                lg:text-lg
              "
            >
              {anime.synopsis ||
                "No synopsis available."}
            </p>

            {/* =========================
                USER ANIME STATUS
            ========================= */}

            <div className="mt-8">

              <p className="text-gray-400 mb-3">
                Anime Status
              </p>

              <select
                value={status}
                onChange={(e) => {

                  const newStatus =
                    e.target.value;

                  setStatus(newStatus);

                  setAnimeStatus(
                    anime,
                    newStatus
                  );

                }}
                className={`
                  w-full
                  sm:w-auto
                  bg-gray-900
                  px-5
                  py-3
                  rounded-xl
                  outline-none
                  border-2
                  transition
                  ${statusColor}
                  ${statusTextColor}
                `}
              >

                <option
                  value=""
                  className="
                    bg-gray-900
                    text-white
                  "
                >
                  Select Status
                </option>

                <option
                  value="Plan to Watch"
                  className="
                    bg-gray-900
                    text-blue-400
                  "
                >
                  📌 Plan to Watch
                </option>

                <option
                  value="Watching"
                  className="
                    bg-gray-900
                    text-green-400
                  "
                >
                  👀 Watching
                </option>

                <option
                  value="On Hold"
                  className="
                    bg-gray-900
                    text-yellow-400
                  "
                >
                  ⏸️ On Hold
                </option>

                <option
                  value="Dropped"
                  className="
                    bg-gray-900
                    text-red-400
                  "
                >
                  ❌ Dropped
                </option>

              </select>

            </div>

          </div>

        </div>


        {/* =========================
            EPISODE PROGRESS
            BELOW MAIN DETAILS
        ========================= */}

        <section className="mt-16">

          <h2
            className="
              text-2xl
              sm:text-3xl
              font-bold
              text-white
              mb-6
            "
          >
            📺 Episode Progress
          </h2>

          {/* =========================
              EPISODE COUNTER
          ========================= */}

          <div className="flex items-center gap-5">

            {/* PREVIOUS */}

            <button
              onClick={
                handlePreviousEpisode
              }
              disabled={
                watchedEpisodes === 0
              }
              className="
                bg-gray-800
                hover:bg-gray-700
                disabled:opacity-40
                disabled:cursor-not-allowed
                px-5
                py-3
                rounded-xl
                text-xl
                text-white
              "
            >
              −
            </button>

            {/* COUNT */}

            <div className="text-center">

              <p
                className="
                  text-3xl
                  font-bold
                  text-white
                "
              >
                {watchedEpisodes}

                <span className="text-gray-500">
                  {" / "}
                  {anime.episodes || "?"}
                </span>
              </p>

              <p className="text-gray-400 mt-1">
                Episodes Watched
              </p>

            </div>

            {/* NEXT */}

            <button
              onClick={
                handleNextEpisode
              }
              disabled={
                anime.episodes &&
                watchedEpisodes >=
                  anime.episodes
              }
              className="
                bg-blue-600
                hover:bg-blue-700
                disabled:opacity-40
                disabled:cursor-not-allowed
                px-5
                py-3
                rounded-xl
                text-xl
                text-white
              "
            >
              +
            </button>

          </div>


          {/* =========================
              PROGRESS BAR
          ========================= */}

          <div
            className="
              w-full
              max-w-xl
              bg-gray-800
              rounded-full
              h-3
              mt-6
            "
          >

            <div
              className="
                bg-blue-600
                h-3
                rounded-full
                transition-all
                duration-500
              "
              style={{
                width: `${completionPercentage}%`,
              }}
            />

          </div>

          <p
            className="
              text-left
              max-w-xl
              text-gray-400
              mt-3
            "
          >
            {completionPercentage}% Complete
          </p>


          {/* =========================
              WATCH TIME
          ========================= */}

          <div className="mt-6">

            <p className="text-gray-400">
              ⏱️ Watch Time
            </p>

            <p className="text-xl font-semibold text-white mt-1">
              {formattedWatchTime}
            </p>

          </div>

        </section>


        {/* =========================
            ACTION BUTTONS
        ========================= */}

        <div className="flex flex-wrap gap-4 mt-10">

          {/* TRAILER */}

          {anime.trailer?.url && (
            <a
              href={anime.trailer.url}
              target="_blank"
              rel="noopener noreferrer"
              className="
                bg-red-600
                hover:bg-red-700
                px-6
                py-3
                rounded-lg
                font-semibold
                transition
                text-white
              "
            >
              ▶ Watch Trailer
            </a>
          )}


          {/* WATCHLIST */}

          {added ? (

            <button
              disabled
              className="
                bg-green-600
                px-6
                py-3
                rounded-lg
                font-semibold
                cursor-not-allowed
                text-white
              "
            >
              ❤️ Added
            </button>

          ) : (

            <button
              onClick={
                handleAddWatchlist
              }
              className="
                bg-blue-600
                hover:bg-blue-700
                px-6
                py-3
                rounded-lg
                font-semibold
                transition
                text-white
              "
            >
              ❤️ Add to Watchlist
            </button>

          )}


          {/* COMPLETED */}

          {completed ? (

            <button
              disabled
              className="
                bg-emerald-600
                px-6
                py-3
                rounded-lg
                font-semibold
                cursor-not-allowed
                text-white
              "
            >
              ✅ Completed
            </button>

          ) : (

            <button
              onClick={
                handleCompleted
              }
              className="
                bg-yellow-500
                hover:bg-yellow-600
                text-black
                px-6
                py-3
                rounded-lg
                font-semibold
                transition
              "
            >
              🎉 Mark as Completed
            </button>

          )}

        </div>

      </div>

    </div>
  );
}

export default AnimeDetails;