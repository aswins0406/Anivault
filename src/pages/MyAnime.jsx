import { useState } from "react";
import AnimeCard from "../components/AnimeCard";

import {
  getAnimeStatus,
  setAnimeStatus,
} from "../services/animeStatus";

import {
  getAnimeProgress,
  getWatchTime,
  formatWatchTime,
} from "../services/animeProgress";

function MyAnime() {
  const [statuses] = useState(getAnimeStatus());
  const [selectedStatus, setSelectedStatus] =
    useState("All");

  const animeEntries = Object.values(statuses);

  // =========================
  // FILTER ANIME
  // =========================

  const filteredAnime =
    selectedStatus === "All"
      ? animeEntries
      : animeEntries.filter(
          (item) =>
            item.status === selectedStatus
        );

  // =========================
  // STATUS COUNTS
  // =========================

  const watchingCount =
    animeEntries.filter(
      (item) => item.status === "Watching"
    ).length;

  const planToWatchCount =
    animeEntries.filter(
      (item) =>
        item.status === "Plan to Watch"
    ).length;

  const onHoldCount =
    animeEntries.filter(
      (item) => item.status === "On Hold"
    ).length;

  const droppedCount =
    animeEntries.filter(
      (item) => item.status === "Dropped"
    ).length;

  // =========================
  // ANIME PROGRESS STATISTICS
  // =========================

  const progressData = getAnimeProgress();

  const totalEpisodesWatched =
    Object.values(progressData).reduce(
      (total, item) =>
        total +
        (item.watchedEpisodes || 0),
      0
    );

  const totalWatchTime =
    Object.values(progressData).reduce(
      (total, item) =>
        total +
        getWatchTime(
          item.watchedEpisodes || 0,
          item.episodeDuration || 0
        ),
      0
    );

  const formattedTotalWatchTime =
    formatWatchTime(totalWatchTime);

  // =========================
  // STATUS CARD CLICK
  // =========================

  function handleStatusClick(status) {
    setSelectedStatus(status);

    setTimeout(() => {
      document
        .getElementById("anime-list")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }

  return (
    <div className="min-h-screen px-4 sm:px-6 lg:px-8 py-8">

      {/* =========================
          TITLE
      ========================= */}

      <h1 className="text-4xl font-bold text-white">
        📚 My Anime
      </h1>

      <p className="text-gray-400 mt-3">
        Manage your anime statuses
      </p>


      {/* =========================
          STATUS COUNTS
      ========================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10">


        {/* =========================
            PLAN TO WATCH
        ========================= */}

        <div
          onClick={() =>
            handleStatusClick(
              "Plan to Watch"
            )
          }
          className={`cursor-pointer bg-gray-900 border rounded-2xl p-6 text-center transition hover:-translate-y-1 ${
            selectedStatus ===
            "Plan to Watch"
              ? "border-blue-500"
              : "border-blue-500/50 hover:border-blue-500"
          }`}
        >

          <h2 className="text-3xl">
            📌
          </h2>

          <p className="text-3xl font-bold mt-3 text-white">
            {planToWatchCount}
          </p>

          <p className="text-gray-400 mt-2">
            Plan to Watch
          </p>

        </div>


        {/* =========================
            WATCHING
        ========================= */}

        <div
          onClick={() =>
            handleStatusClick("Watching")
          }
          className={`cursor-pointer bg-gray-900 border rounded-2xl p-6 text-center transition hover:-translate-y-1 ${
            selectedStatus === "Watching"
              ? "border-green-500"
              : "border-green-500/50 hover:border-green-500"
          }`}
        >

          <h2 className="text-3xl">
            👀
          </h2>

          <p className="text-3xl font-bold mt-3 text-white">
            {watchingCount}
          </p>

          <p className="text-gray-400 mt-2">
            Watching
          </p>

        </div>


        {/* =========================
            ON HOLD
        ========================= */}

        <div
          onClick={() =>
            handleStatusClick("On Hold")
          }
          className={`cursor-pointer bg-gray-900 border rounded-2xl p-6 text-center transition hover:-translate-y-1 ${
            selectedStatus === "On Hold"
              ? "border-yellow-500"
              : "border-yellow-500/50 hover:border-yellow-500"
          }`}
        >

          <h2 className="text-3xl">
            ⏸️
          </h2>

          <p className="text-3xl font-bold mt-3 text-white">
            {onHoldCount}
          </p>

          <p className="text-gray-400 mt-2">
            On Hold
          </p>

        </div>


        {/* =========================
            DROPPED
        ========================= */}

        <div
          onClick={() =>
            handleStatusClick("Dropped")
          }
          className={`cursor-pointer bg-gray-900 border rounded-2xl p-6 text-center transition hover:-translate-y-1 ${
            selectedStatus === "Dropped"
              ? "border-red-500"
              : "border-red-500/50 hover:border-red-500"
          }`}
        >

          <h2 className="text-3xl">
            ❌
          </h2>

          <p className="text-3xl font-bold mt-3 text-white">
            {droppedCount}
          </p>

          <p className="text-gray-400 mt-2">
            Dropped
          </p>

        </div>

      </div>


      {/* =========================
          ANIME STATISTICS
      ========================= */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-10">

        {/* Episodes Watched */}

        <div className="bg-gray-900 border border-purple-500/50 rounded-2xl p-6 text-center">

          <h2 className="text-3xl">
            📺
          </h2>

          <p className="text-3xl font-bold mt-3 text-white">
            {totalEpisodesWatched}
          </p>

          <p className="text-gray-400 mt-2">
            Episodes Watched
          </p>

        </div>


        {/* Total Watch Time */}

        <div className="bg-gray-900 border border-cyan-500/50 rounded-2xl p-6 text-center">

          <h2 className="text-3xl">
            ⏱️
          </h2>

          <p className="text-3xl font-bold mt-3 text-white">
            {formattedTotalWatchTime}
          </p>

          <p className="text-gray-400 mt-2">
            Total Watch Time
          </p>

        </div>

      </div>


      {/* =========================
          FILTER BUTTONS
      ========================= */}

      <div className="flex flex-wrap gap-3 mt-10">

        {[
          "All",
          "Plan to Watch",
          "Watching",
          "On Hold",
          "Dropped",
        ].map((status) => (

          <button
            key={status}
            onClick={() =>
              handleStatusClick(status)
            }
            className={`px-5 py-3 rounded-xl transition font-semibold ${
              selectedStatus === status
                ? "bg-blue-600 text-white"
                : "bg-gray-800 text-white hover:bg-gray-700"
            }`}
          >
            {status}
          </button>

        ))}

      </div>


      {/* =========================
          ANIME CARDS
      ========================= */}

      <section
        id="anime-list"
        className="mt-10 scroll-mt-6"
      >

        {/* Selected Status Heading */}

        <h2 className="text-2xl font-bold text-white mb-6">
          {selectedStatus === "All"
            ? "📚 All Anime"
            : `📌 ${selectedStatus}`}
        </h2>


        {filteredAnime.length === 0 ? (

          <div className="text-center py-20">

            <h2 className="text-3xl font-bold text-white">
              😔 No Anime Found
            </h2>

            <p className="text-gray-400 mt-3">
              No anime saved under{" "}
              <span className="text-blue-400 font-semibold">
                {selectedStatus}
              </span>
            </p>

          </div>

        ) : (

          <div className="flex flex-wrap justify-center gap-8">

            {filteredAnime.map((item) => {

              const anime = item.anime;

              if (!anime) {
                return null;
              }

              return (

                <div
                  key={anime.mal_id}
                  className="flex flex-col items-center"
                >

                  {/* =========================
                      ANIME CARD
                  ========================= */}

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


                  {/* =========================
                      CHANGE STATUS
                  ========================= */}

                  <select
                    value={item.status}
                    onChange={(e) => {

                      const newStatus =
                        e.target.value;

                      setAnimeStatus(
                        anime,
                        newStatus
                      );

                      window.location.reload();

                    }}
                    className="
                      mt-3
                      bg-gray-900
                      border
                      border-gray-700
                      px-4
                      py-2
                      rounded-lg
                      text-sm
                      text-white
                      font-medium
                      outline-none
                      focus:border-blue-500
                      focus:ring-1
                      focus:ring-blue-500
                      cursor-pointer
                    "
                  >

                    <option
                      value="Plan to Watch"
                      className="bg-gray-900 text-white"
                    >
                      📌 Plan to Watch
                    </option>

                    <option
                      value="Watching"
                      className="bg-gray-900 text-white"
                    >
                      👀 Watching
                    </option>

                    <option
                      value="On Hold"
                      className="bg-gray-900 text-white"
                    >
                      ⏸️ On Hold
                    </option>

                    <option
                      value="Dropped"
                      className="bg-gray-900 text-white"
                    >
                      ❌ Dropped
                    </option>

                  </select>

                </div>

              );

            })}

          </div>

        )}

      </section>

    </div>
  );
}

export default MyAnime;