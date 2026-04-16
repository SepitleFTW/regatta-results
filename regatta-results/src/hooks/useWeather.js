import { useState, useEffect } from 'react';

const VENUE_COORDS = {
  'Roodeplaat Dam':  { lat: -25.617, lon: 28.367 },
  'Germiston Lake':  { lat: -26.233, lon: 28.167 },
  'Misverstand Dam': { lat: -33.483, lon: 19.000 },
  'East London':     { lat: -33.015, lon: 27.912 },
  'Buffalo City':    { lat: -33.015, lon: 27.912 },
  'Western Cape':    { lat: -33.925, lon: 18.424 },
  'Shongweni':       { lat: -29.833, lon: 30.733 },
};

function coordsForLocation(location) {
  if (!location) return null;
  for (const [key, coords] of Object.entries(VENUE_COORDS)) {
    if (location.includes(key)) return coords;
  }
  return null;
}

function degreesToCardinal(deg) {
  const dirs = ['N','NE','E','SE','S','SW','W','NW'];
  return dirs[Math.round(deg / 45) % 8];
}

function weatherLabel(code) {
  if (code === 0) return 'Clear';
  if (code <= 3) return 'Partly cloudy';
  if (code <= 48) return 'Foggy';
  if (code <= 67) return 'Rain';
  if (code <= 77) return 'Snow';
  if (code <= 82) return 'Showers';
  return 'Thunderstorm';
}

function weatherIcon(code) {
  if (code === 0) return '☀️';
  if (code <= 3) return '⛅';
  if (code <= 48) return '🌫️';
  if (code <= 67) return '🌧️';
  if (code <= 82) return '🌦️';
  return '⛈️';
}

const cache = {};

export function useWeather(location) {
  const [weather, setWeather] = useState(null);
  const coords = coordsForLocation(location);

  useEffect(() => {
    if (!coords) return;
    const key = `${coords.lat},${coords.lon}`;
    if (cache[key]) { setWeather(cache[key]); return; }
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,wind_speed_10m,wind_direction_10m,weather_code&wind_speed_unit=ms&timezone=Africa/Johannesburg`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        const c = data.current;
        const w = {
          temp: Math.round(c.temperature_2m),
          windKph: Math.round(c.wind_speed_10m * 3.6),
          windDir: degreesToCardinal(c.wind_direction_10m),
          label: weatherLabel(c.weather_code),
          icon: weatherIcon(c.weather_code),
        };
        cache[key] = w;
        setWeather(w);
      })
      .catch(() => {});
  }, [location]);

  return weather;
}
