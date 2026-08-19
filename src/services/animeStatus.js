const STATUS_KEY = "animeStatus";

export function getAnimeStatus() {
  return JSON.parse(
    localStorage.getItem(STATUS_KEY)
  ) || {};
}

export function setAnimeStatus(anime, status) {
  const statuses = getAnimeStatus();

  statuses[anime.mal_id] = {
    anime,
    status,
  };

  localStorage.setItem(
    STATUS_KEY,
    JSON.stringify(statuses)
  );
}

export function getStatus(animeId) {
  const statuses = getAnimeStatus();

  return statuses[animeId]?.status || null;
}