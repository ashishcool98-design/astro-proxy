const express = require("express");
const fetch = require("node-fetch");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

const ASTRO_API = "https://json.freeastrologyapi.com";

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Astrology proxy running" });
});

// ==============================
// 🔮 LAGNA / PLANETS ENDPOINT
// ==============================
app.post("/astro/planets", async (req, res) => {
  try {
    const payload = {
      year: req.body.year,
      month: req.body.month,
      date: req.body.date,
      hours: req.body.hours,
      minutes: req.body.minutes,
      seconds: req.body.seconds,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      timezone: req.body.timezone,
      config: {
        observation_point: "topocentric",
        ayanamsha: "lahiri"
      }
    };

    const response = await fetch(
      `${ASTRO_API}/planets/extended`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ASTRO_API_KEY
        },
        body: JSON.stringify(payload)
      }
    );

    const text = await response.text();

    if (!response.ok) {
      return res.status(500).json({
        error: "FreeAstrologyAPI error (planets)",
        status: response.status,
        response: text
      });
    }

    res.json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({
      error: "Planet API proxy error",
      message: err.message
    });
  }
});

// ==============================
// 🔁 DASHA ENDPOINT (FIXED)
// ==============================
app.post("/astro/dasha", async (req, res) => {
  try {
    const payload = {
      year: req.body.year,
      month: req.body.month,
      date: req.body.date,
      hours: req.body.hours,
      minutes: req.body.minutes,
      seconds: req.body.seconds,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      timezone: req.body.timezone,
      config: {
        observation_point: "topocentric",
        ayanamsha: "lahiri"
      }
    };

    const response = await fetch(
      `${ASTRO_API}/vimsottari/maha-dasas-and-antar-dasas`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ASTRO_API_KEY
        },
        body: JSON.stringify(payload)
      }
    );

    const text = await response.text();

    if (!response.ok) {
      return res.status(500).json({
        error: "FreeAstrologyAPI error (dasha)",
        status: response.status,
        response: text
      });
    }

    res.json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({
      error: "Dasha API proxy error",
      message: err.message
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Astrology proxy running on port ${PORT}`);
});
