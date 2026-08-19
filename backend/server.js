const express = require("express");
const cors = require("cors");

const {
  searchAniList,
  getTopAnime,
  getTrendingAnime,
  getAnimeDetails,
} = require("./anilist");

require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 10000;

// =========================
// CORS
// =========================
app.use(
  cors({
    origin: "https://anivault-beta.vercel.app",
    methods: ["GET", "POST", "OPTIONS"],
  })
);

app.use(express.json());

// =========================
// Health / Root
// =========================
app.get("/", (req, res) => {
  res.json({
    message: "AniVault Backend is running 🚀",
    api: "AniList",
  });
});

app.get("/health", (req, res) => {
  res.json({
    ok: true,
  });
});

// =========================
// Top Anime
// =========================
app.get("/api/anime/top", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;

    const data = await getTopAnime(page);

    res.json(data);
  } catch (error) {
    console.error("Top Anime Error:", error);

    res.status(502).json({
      message: "Failed to load top anime",
      error: error.message,
    });
  }
});

// =========================
// Trending Anime
// =========================
app.get("/api/anime/trending", async (req, res) => {
  try {
    const page = Number(req.query.page) || 1;

    const data = await getTrendingAnime(page);

    res.json(data);
  } catch (error) {
    console.error("Trending Anime Error:", error);

    res.status(502).json({
      message: "Failed to load trending anime",
      error: error.message,
    });
  }
});

// =========================
// Anime Search
// =========================
app.get("/api/anime/search", async (req, res) => {
  try {
    const q = String(req.query.q || "").trim();
    const page = Number(req.query.page) || 1;

    if (!q) {
      return res.status(400).json({
        message: "Search query is required",
      });
    }

    console.log(`Search request: q="${q}", page=${page}`);

    const data = await searchAniList(q, page);

    console.log(
      `Search results: ${data?.data?.length || 0}`
    );

    res.json(data);
  } catch (error) {
    console.error("Anime Search Error:", error);

    res.status(502).json({
      message: "Failed to search anime",
      error: error.message,
    });
  }
});

// =========================
// Anime Details
// =========================
app.get("/api/anime/:id", async (req, res) => {
  try {
    const anime = await getAnimeDetails(req.params.id);

    res.json({
      data: anime,
    });
  } catch (error) {
    console.error("Anime Details Error:", error);

    res.status(404).json({
      message: "Failed to load anime",
      error: error.message,
    });
  }
});

// =========================
// Start Server
// =========================
app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `AniVault Backend running on 0.0.0.0:${PORT}`
  );
});