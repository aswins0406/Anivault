const PROGRESS_KEY = "animeProgress";

// =========================
// Get all anime progress
// =========================

export function getAnimeProgress() {
  return (
    JSON.parse(
      localStorage.getItem(PROGRESS_KEY)
    ) || {}
  );
}

// =========================
// Get progress for one anime
// =========================

export function getAnimeProgressById(animeId) {
  const progress = getAnimeProgress();

  return (
    progress[animeId] || {
      watchedEpisodes: 0,
      totalEpisodes: 0,
      episodeDuration: 0,
    }
  );
}

// =========================
// Save progress
// =========================

export function setAnimeProgress(
  animeId,
  watchedEpisodes,
  totalEpisodes,
  episodeDuration = 0
) {
  const progress = getAnimeProgress();

  progress[animeId] = {
    watchedEpisodes,
    totalEpisodes,
    episodeDuration,
  };

  localStorage.setItem(
    PROGRESS_KEY,
    JSON.stringify(progress)
  );
}

// =========================
// Increase watched episode by 1
// =========================

export function incrementEpisode(
  animeId,
  totalEpisodes,
  episodeDuration = 0
) {
  const current =
    getAnimeProgressById(animeId);

  const nextEpisode = Math.min(
    current.watchedEpisodes + 1,
    totalEpisodes
  );

  setAnimeProgress(
    animeId,
    nextEpisode,
    totalEpisodes,
    episodeDuration ||
      current.episodeDuration ||
      0
  );

  return nextEpisode;
}

// =========================
// Decrease watched episode by 1
// =========================

export function decrementEpisode(
  animeId,
  totalEpisodes,
  episodeDuration = 0
) {
  const current =
    getAnimeProgressById(animeId);

  const previousEpisode = Math.max(
    current.watchedEpisodes - 1,
    0
  );

  setAnimeProgress(
    animeId,
    previousEpisode,
    totalEpisodes,
    episodeDuration ||
      current.episodeDuration ||
      0
  );

  return previousEpisode;
}

// =========================
// Calculate completion percentage
// =========================

export function getCompletionPercentage(
  watchedEpisodes,
  totalEpisodes
) {
  if (
    !totalEpisodes ||
    totalEpisodes <= 0
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.round(
      (watchedEpisodes /
        totalEpisodes) *
        100
    )
  );
}

// =========================
// Calculate watch time in minutes
// =========================

export function getWatchTime(
  watchedEpisodes,
  episodeDuration
) {
  if (
    !watchedEpisodes ||
    !episodeDuration
  ) {
    return 0;
  }

  return (
    watchedEpisodes *
    episodeDuration
  );
}

// =========================
// Format watch time
// =========================

export function formatWatchTime(
  minutes
) {
  if (!minutes || minutes <= 0) {
    return "0 min";
  }

  const hours = Math.floor(
    minutes / 60
  );

  const remainingMinutes =
    minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min`;
  }

  if (remainingMinutes === 0) {
    return `${hours} hr`;
  }

  return `${hours} hr ${remainingMinutes} min`;
}