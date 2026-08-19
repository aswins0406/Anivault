// AniVault backend API client
// IMPORTANT: localhost always uses port 10000 so an old .env value cannot redirect
// the frontend to the old port (for example 5000).

const isLocalhost =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1";

let BACKEND_URL;

if (isLocalhost) {
  BACKEND_URL = "http://localhost:10000";
} else {
  BACKEND_URL =
    import.meta.env.VITE_BACKEND_URL ||
    "https://anivault-backend-b6z3.onrender.com";
}

const cache = new Map();
const CACHE_TIME = 5 * 60 * 1000;

async function fetchBackend(path) {
  const url = `${BACKEND_URL}${path}`;
  const cached = cache.get(url);

  if (cached && Date.now() - cached.timestamp < CACHE_TIME) {
    return cached.data;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    console.log("AniVault API request:", url);

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
      signal: controller.signal,
    });

    const text = await response.text();

    let data;

    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      throw new Error(
        `Backend returned invalid JSON (${response.status})`
      );
    }

    if (!response.ok) {
      throw new Error(
        data?.error ||
          data?.message ||
          `Backend Error: ${response.status}`
      );
    }

    cache.set(url, {
      data,
      timestamp: Date.now(),
    });

    return data;
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "Backend request timed out. Is port 10000 running?"
      );
    }

    console.error("AniVault API error:", error);
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

export async function getTopAnime(page = 1) {
  return fetchBackend(
    `/api/anime/top?page=${Number(page) || 1}`
  );
}

export async function getTrendingAnime(page = 1) {
  return fetchBackend(
    `/api/anime/trending?page=${Number(page) || 1}`
  );
}

export async function getAnimeDetails(id) {
  const response = await fetchBackend(
    `/api/anime/${encodeURIComponent(id)}`
  );

  return response.data;
}

export async function searchAnime(query, page = 1) {
  const cleanQuery = String(query || "").trim();

  if (!cleanQuery) {
    return {
      data: [],
      pagination: {
        has_next_page: false,
        current_page: 1,
      },
    };
  }

  return fetchBackend(
    `/api/anime/search?q=${encodeURIComponent(
      cleanQuery
    )}&page=${Number(page) || 1}`
  );
}