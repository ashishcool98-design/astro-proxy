const express = require("express");
const fetch = require("node-fetch");
const dotenv = require("dotenv");

dotenv.config();

const app = express();
app.use(express.json());

const BASE_URL = "https://json.freeastrologyapi.com";

function buildPayload(body) {
  return {
    year: body.year,
    month: body.month,
    date: body.date,
    hours: body.hours,
    minutes: body.minutes,
    seconds: body.seconds,
    latitude: body.latitude,
    longitude: body.longitude,
    timezone: body.timezone,
    config: {
      observation_point: "topocentric",
      ayanamsha: "lahiri"
    }
  };
}

async function callAstroAPI(endpoint, payload, res, label) {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ASTRO_API_KEY
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    if (!response.ok) {
      return res.status(500).json({
        error: `${label} API error`,
        status: response.status,
        response: text
      });
    }

    res.json(JSON.parse(text));
  } catch (err) {
    res.status(500).json({
      error: `${label} proxy error`,
      message: err.message
    });
  }
}

app.get("/", (_, res) => {
  res.json({ status: "Astrology proxy running" });
});

/* ======================
   CORE CHARTS & DASHA
====================== */

app.post("/astro/planets", (req, res) =>
  callAstroAPI("/planets/extended", buildPayload(req.body), res, "Lagna")
);

app.post("/astro/dasha", (req, res) =>
  callAstroAPI(
    "/vimsottari/maha-dasas-and-antar-dasas",
    buildPayload(req.body),
    res,
    "Dasha"
  )
);

/* ======================
   DIVISIONAL CHARTS
====================== */

const divisionalCharts = {
  d2: "/divisional-charts/hora",
  d3: "/divisional-charts/drekkana",
  d4: "/divisional-charts/chaturthamsa",
  d5: "/divisional-charts/panchamasa",
  d7: "/divisional-charts/saptamsa",
  d8: "/divisional-charts/ashtamsa",
  d9: "/divisional-charts/navamsa",
  d10: "/divisional-charts/dashamsa"
};

Object.entries(divisionalCharts).forEach(([key, endpoint]) => {
  app.post(`/astro/${key}`, (req, res) =>
    callAstroAPI(endpoint, buildPayload(req.body), res, key.toUpperCase())
  );
});

/* ======================
   OPTIONAL: PANCHANG
====================== */

app.post("/astro/panchang", (req, res) =>
  callAstroAPI("/complete-panchang", buildPayload(req.body), res, "Panchang")
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`Astrology proxy running on port ${PORT}`)
);
