const WATCHLIST_KEY = "anivault_watchlist";

export function getWatchlist() {
  const watchlist = localStorage.getItem(WATCHLIST_KEY);
  return watchlist ? JSON.parse(watchlist) : [];
}

export function saveWatchlist(watchlist) {
  localStorage.setItem(
    WATCHLIST_KEY,
    JSON.stringify(watchlist)
  );
}

export function addToWatchlist(anime) {
  const watchlist = getWatchlist();

  const exists = watchlist.find(
    (item) => item.mal_id === anime.mal_id
  );

  if (!exists) {
    watchlist.push(anime);
    saveWatchlist(watchlist);
  }
}

export function removeFromWatchlist(id) {
  const watchlist = getWatchlist();

  const updatedWatchlist = watchlist.filter(
    (anime) => anime.mal_id !== id
  );

  saveWatchlist(updatedWatchlist);
}

export function isInWatchlist(id) {
  const watchlist = getWatchlist();

  return watchlist.some(
    (anime) => anime.mal_id === id
  );
}