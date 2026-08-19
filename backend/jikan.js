// Backwards-compatible wrapper.
// The project no longer depends on Jikan for search/top/trending because
// Jikan/MAL can return 429/504 errors. AniList is used as the stable source.

const {
  searchAniList,
  getTopAnime,
  getTrendingAnime,
  getAnimeDetails,
} = require("./anilist");

module.exports = {
  searchAnime: searchAniList,
  getTopAnime,
  getTrendingAnime,
  getAnimeDetails,
};
