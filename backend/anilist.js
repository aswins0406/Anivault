const ANILIST_URL = "https://graphql.anilist.co";

const cache = new Map();
const CACHE_TIME = 5 * 60 * 1000;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchAniList(query, variables = {}, retries = 4) {
  const cacheKey = JSON.stringify({ query, variables });
  const cached = cache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < CACHE_TIME) {
    console.log("AniList cache hit");
    return cached.data;
  }

  if (cached) cache.delete(cacheKey);

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      console.log(`AniList request attempt ${attempt + 1}`);

      const response = await fetch(ANILIST_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ query, variables }),
      });

      if (response.status === 429 || response.status >= 500) {
        if (attempt === retries - 1) {
          throw new Error(`AniList API Error: ${response.status}`);
        }

        await delay(2000 * (attempt + 1));
        continue;
      }

      if (!response.ok) {
        throw new Error(`AniList API Error: ${response.status}`);
      }

      const result = await response.json();

      if (result.errors?.length) {
        throw new Error(result.errors[0]?.message || "AniList GraphQL Error");
      }

      cache.set(cacheKey, {
        data: result.data,
        timestamp: Date.now(),
      });

      return result.data;
    } catch (error) {
      console.error(`AniList attempt ${attempt + 1} failed:`, error.message);

      if (attempt === retries - 1) throw error;
      await delay(1500 * (attempt + 1));
    }
  }

  throw new Error("AniList request failed");
}

function stripHtml(text = "") {
  return text
    .replace(/<br\s*\/?>(\n)?/gi, " ")
    .replace(/<[^>]*>/g, "")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

function normalizeAnime(media) {
  if (!media) return null;

  const id = media.idMal || media.id;
  const score =
    typeof media.averageScore === "number"
      ? Number((media.averageScore / 10).toFixed(1))
      : null;

  const title =
    media.title?.english ||
    media.title?.romaji ||
    media.title?.native ||
    "Unknown Anime";

  return {
    mal_id: id,
    anilist_id: media.id,
    title,
    title_japanese: media.title?.native || null,
    title_english: media.title?.english || null,
    images: {
      jpg: {
        image_url: media.coverImage?.large || media.coverImage?.medium || "",
        large_image_url: media.coverImage?.large || media.coverImage?.medium || "",
      },
    },
    score,
    averageScore: media.averageScore ?? null,
    episodes: media.episodes ?? null,
    status: media.status || "Unknown",
    synopsis: stripHtml(media.description || ""),
    description: stripHtml(media.description || ""),
    genres: (media.genres || []).map((name, index) => ({
      mal_id: index + 1,
      name,
    })),
    season: media.season || null,
    year: media.seasonYear || null,
    seasonYear: media.seasonYear || null,
    duration: media.duration ? `${media.duration} min per episode` : null,
    type: media.type || null,
    source: media.source || null,
    trailer: {
      url: media.trailer?.site === "youtube" && media.trailer?.id
        ? `https://www.youtube.com/watch?v=${media.trailer.id}`
        : null,
      youtube_id: media.trailer?.id || null,
    },
    url: media.siteUrl || null,
    aired: {
      from: media.startDate || null,
      to: media.endDate || null,
    },
    nextAiringEpisode: media.nextAiringEpisode || null,
  };
}

const MEDIA_FIELDS = `
  id
  idMal
  type
  title { romaji english native }
  coverImage { large medium }
  averageScore
  episodes
  status
  description
  genres
  season
  seasonYear
  duration
  source
  siteUrl
  startDate { year month day }
  endDate { year month day }
  trailer { id site }
  nextAiringEpisode { airingAt timeUntilAiring episode }
`;

const SEARCH_QUERY = `
  query ($search: String!, $page: Int!, $perPage: Int!) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { currentPage lastPage hasNextPage total }
      media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

const TOP_QUERY = `
  query ($page: Int!, $perPage: Int!) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { currentPage lastPage hasNextPage total }
      media(type: ANIME, sort: SCORE_DESC) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

const TRENDING_QUERY = `
  query ($page: Int!, $perPage: Int!) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { currentPage lastPage hasNextPage total }
      media(type: ANIME, sort: POPULARITY_DESC) {
        ${MEDIA_FIELDS}
      }
    }
  }
`;

const DETAIL_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      ${MEDIA_FIELDS}
    }
  }
`;

const DETAIL_MAL_QUERY = `
  query ($idMal: Int) {
    Media(idMal: $idMal, type: ANIME) {
      ${MEDIA_FIELDS}
    }
  }
`;

function toJikanPagination(pageInfo) {
  return {
    last_visible_page: pageInfo?.lastPage || 1,
    has_next_page: Boolean(pageInfo?.hasNextPage),
    current_page: pageInfo?.currentPage || 1,
    items: {
      count: 0,
      total: pageInfo?.total || 0,
      per_page: 24,
    },
  };
}

async function searchAniList(query, page = 1) {
  const cleanQuery = String(query || "").trim();

  if (!cleanQuery) {
    return {
      data: [],
      pagination: toJikanPagination({ currentPage: 1, lastPage: 1, hasNextPage: false, total: 0 }),
    };
  }

  const result = await fetchAniList(SEARCH_QUERY, {
    search: cleanQuery,
    page: Math.max(1, Number(page) || 1),
    perPage: 24,
  });

  const media = result?.Page?.media || [];
  const pageInfo = result?.Page?.pageInfo;

  return {
    data: media.map(normalizeAnime).filter(Boolean),
    pagination: toJikanPagination(pageInfo),
  };
}

async function getTopAnime(page = 1) {
  const result = await fetchAniList(TOP_QUERY, {
    page: Math.max(1, Number(page) || 1),
    perPage: 24,
  });

  return {
    data: (result?.Page?.media || []).map(normalizeAnime).filter(Boolean),
    pagination: toJikanPagination(result?.Page?.pageInfo),
  };
}

async function getTrendingAnime(page = 1) {
  const result = await fetchAniList(TRENDING_QUERY, {
    page: Math.max(1, Number(page) || 1),
    perPage: 24,
  });

  return {
    data: (result?.Page?.media || []).map(normalizeAnime).filter(Boolean),
    pagination: toJikanPagination(result?.Page?.pageInfo),
  };
}

async function getAnimeDetails(id) {
  const numericId = Number(id);

  if (!Number.isFinite(numericId)) {
    throw new Error("Invalid anime id");
  }

  let result = await fetchAniList(DETAIL_MAL_QUERY, { idMal: numericId });
  let media = result?.Media;

  if (!media) {
    result = await fetchAniList(DETAIL_QUERY, { id: numericId });
    media = result?.Media;
  }

  if (!media) {
    throw new Error("Anime not found");
  }

  return normalizeAnime(media);
}

module.exports = {
  fetchAniList,
  searchAniList,
  getTopAnime,
  getTrendingAnime,
  getAnimeDetails,
};
