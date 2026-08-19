import { useEffect, useState } from "react";
import AnimeCard from "../components/AnimeCard";
import {
  getCompletedAnime,
  removeCompletedAnime,
} from "../services/completed";

function Completed() {
  const [completedList, setCompletedList] = useState([]);

  useEffect(() => {
    loadCompleted();
  }, []);

  function loadCompleted() {
    setCompletedList(getCompletedAnime());
  }

  function handleRemove(id) {
    removeCompletedAnime(id);
    loadCompleted();
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">

      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-bold">
          ✅ Completed Anime
        </h1>

        <p className="text-lg text-gray-400">
          Total Completed :
          <span className="text-green-500 font-bold">
            {" "}
            {completedList.length}
          </span>
        </p>
      </div>

      {completedList.length === 0 ? (
        <div className="text-center mt-20">
          <h2 className="text-3xl font-bold">
            No Completed Anime Yet 😢
          </h2>

          <p className="text-gray-400 mt-4">
            Complete your first anime to see it here.
          </p>
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-8">
          {completedList.map((anime) => (
            <div key={anime.mal_id}>
              <AnimeCard
                id={anime.mal_id}
                title={anime.title}
                rating={anime.score}
                genre={anime.genres[0]?.name || "Unknown"}
                image={anime.images.jpg.image_url}
              />

              <button
                onClick={() => handleRemove(anime.mal_id)}
                className="w-full mt-3 bg-red-600 hover:bg-red-700 py-3 rounded-xl font-semibold"
              >
                🗑 Remove
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default Completed;