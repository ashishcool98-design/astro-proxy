import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

const ASTRO_API = "https://json.freeastrologyapi.com";

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Astrology proxy running" });
});

// 🔮 Planet + Lagna (Main endpoint)
app.post("/astro/planets", async (req, res) => {
  try {
    const response = await fetch(`${ASTRO_API}/planets/extended`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ASTRO_API_KEY
      },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch planetary data",
      details: error.message
    });
  }
});

// 🔁 Mahadasha + Antardasha
app.post("/astro/dasha", async (req, res) => {
  try {
    const response = await fetch(
      `${ASTRO_API}/vimsottari/maha-dasas-and-antar-dasas`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ASTRO_API_KEY
        },
        body: JSON.stringify(req.body)
      }
    );

    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({
      error: "Failed to fetch dasha data",
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Astrology proxy running on port ${PORT}`);
});
