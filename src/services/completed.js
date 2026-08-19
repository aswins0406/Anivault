const COMPLETED_KEY = "anivault_completed";

export function getCompletedAnime() {
  const completed = localStorage.getItem(COMPLETED_KEY);

  return completed ? JSON.parse(completed) : [];
}

export function saveCompletedAnime(completed) {
  localStorage.setItem(
    COMPLETED_KEY,
    JSON.stringify(completed)
  );
}

export function addCompletedAnime(anime) {
  const completed = getCompletedAnime();

  const exists = completed.find(
    (item) => item.mal_id === anime.mal_id
  );

  if (!exists) {
    completed.push(anime);
    saveCompletedAnime(completed);
  }
}

export function removeCompletedAnime(id) {
  const completed = getCompletedAnime();

  const updated = completed.filter(
    (anime) => anime.mal_id !== id
  );

  saveCompletedAnime(updated);
}

export function isCompleted(id) {
  const completed = getCompletedAnime();

  return completed.some(
    (anime) => anime.mal_id === id
  );
}