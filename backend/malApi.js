const MAL_BASE_URL = "https://api.myanimelist.net/v2";

// =========================
// MAL SEARCH
// =========================

async function searchMALAnime(query, page = 1) {
  const offset = (page - 1) * 24;

  const url =
    `${MAL_BASE_URL}/anime?q=${encodeURIComponent(
      query
    )}&limit=24&offset=${offset}&fields=id,title,main_picture`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `MAL API Error: ${response.status}`
    );
  }

  return await response.json();
}

module.exports = {
  searchMALAnime,
};