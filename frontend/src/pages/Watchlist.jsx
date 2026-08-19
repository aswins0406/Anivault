import { useEffect, useState } from "react";
import AnimeCard from "../components/AnimeCard";
import {
  getWatchlist,
  removeFromWatchlist,
} from "../services/watchlist";

function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);

  useEffect(() => {
    loadWatchlist();
  }, []);

  function loadWatchlist() {
    const savedAnime = getWatchlist();
    setWatchlist(savedAnime);
  }

  function handleRemove(id) {
    removeFromWatchlist(id);
    loadWatchlist();
  }

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">

      {/* Title */}
      <div className="flex justify-between items-center mb-10">

        <h1 className="text-4xl font-bold">
          ❤️ My Watchlist
        </h1>

        <p className="text-lg text-gray-400">
          Total Anime : <span className="text-blue-500 font-bold">
            {watchlist.length}
          </span>
        </p>

      </div>

      {watchlist.length === 0 ? (

        <div className="flex flex-col items-center justify-center mt-28">

          <h2 className="text-5xl">
            😢
          </h2>

          <h2 className="text-3xl font-bold mt-4">
            Your Watchlist is Empty
          </h2>

          <p className="text-gray-400 mt-3">
            Add your favourite anime to see them here.
          </p>

        </div>

      ) : (

        <div className="flex flex-wrap gap-8 justify-center">

          {watchlist.map((anime) => (

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
                className="w-full mt-3 bg-red-600 hover:bg-red-700 transition-all duration-300 hover:scale-105 py-3 rounded-xl font-semibold"
              >
                🗑 Remove from Watchlist
              </button>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}

export default Watchlist;