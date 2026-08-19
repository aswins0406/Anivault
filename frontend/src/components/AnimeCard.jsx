import { useNavigate } from "react-router-dom";

function AnimeCard(props) {
  const navigate = useNavigate();

  const handleAnimeClick = () => {
    // Save current Home scroll position
    sessionStorage.setItem(
      "homeScrollPosition",
      window.scrollY
    );

    // Go to Anime Details
    navigate(`/anime/${props.id}`);
  };

  return (
    <div
      onClick={handleAnimeClick}
      className="group bg-gray-900 rounded-2xl overflow-hidden w-52 sm:w-56 cursor-pointer transition-all duration-500 ease-in-out hover:-translate-y-3 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/30"
    >

      {/* Image */}
      <img
        src={props.image}
        alt={props.title}
        className="w-full h-64 sm:h-72 object-cover"
      />

      {/* Content */}
      <div className="p-4">

        {/* Title */}
        <h2 className="text-lg font-bold text-white line-clamp-2 min-h-[52px]">
          {props.title}
        </h2>

        {/* Rating + Genre */}
        <div className="flex justify-between mt-3 text-sm text-gray-400 gap-2">

          <span>
            ⭐ {props.rating || "N/A"}
          </span>

          <span className="truncate">
            🎭 {props.genre}
          </span>

        </div>

        {/* View Details */}
        <div className="mt-4 text-blue-400 font-semibold group-hover:text-cyan-300 transition">
          → View Details
        </div>

      </div>

    </div>
  );
}

export default AnimeCard;