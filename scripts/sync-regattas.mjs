/**
 * Fetches the current year's regatta index page from regattaresults.co.za,
 * finds any new result links not already in our data, and writes them to
 * regatta-results/src/data/auto-discovered.json.
 *
 * Runs as a GitHub Action on a daily schedule.
 */

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT = join(__dirname, 'regatta-results');

// ── Config ───────────────────────────────────────────────────────────────────

const YEAR_SLUGS = { 2025: '2025-results' };
const yearSlug = y => YEAR_SLUGS[y] ?? `${y}-2`;

// Check current year and the one before (catches late uploads from prior season)
const now = new Date();
const YEARS_TO_CHECK = [now.getFullYear(), now.getFullYear() - 1];

// ── Load existing data ────────────────────────────────────────────────────────

const autoPath = join(PROJECT, 'src/data/auto-discovered.json');
const regattasPath = join(PROJECT, 'src/data/regattas.js');

let autoDiscovered = {};
try {
  autoDiscovered = JSON.parse(readFileSync(autoPath, 'utf8'));
} catch {
  console.log('No existing auto-discovered.json, starting fresh.');
}

// Collect every URL already known (hardcoded + previously auto-discovered)
const knownUrls = new Set();

const regattasContent = readFileSync(regattasPath, 'utf8');
for (const [, url] of regattasContent.matchAll(/url:\s*`([^`]+)`/g)) {
  knownUrls.add(normalise(url));
}
for (const races of Object.values(autoDiscovered)) {
  for (const race of races) knownUrls.add(normalise(race.url));
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function normalise(url) {
  return url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '').toLowerCase();
}

function toAbsolute(href) {
  if (/^https?:\/\//i.test(href)) return href;
  if (href.startsWith('/')) return `https://regattaresults.co.za${href}`;
  return `https://regattaresults.co.za/${href}`;
}

function extractLinks(html) {
  const results = [];
  const re = /<a\s[^>]*href="([^"]*results\.htm[^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;
  let m;
  while ((m = re.exec(html)) !== null) {
    const href = toAbsolute(m[1].trim());
    const raw = m[2].replace(/<[^>]+>/g, '').trim();
    results.push({ href, raw });
  }
  return results;
}

function parseName(raw, year) {
  const lastDash = raw.lastIndexOf(' - ');
  const name = lastDash > 0 ? raw.substring(0, lastDash).trim() : raw;
  const dateStr = lastDash > 0 ? raw.substring(lastDash + 3).trim() : '';
  const date = dateStr ? `${dateStr} ${year}` : String(year);
  return { name: name || raw, date };
}

// ── Main ──────────────────────────────────────────────────────────────────────

let totalNew = 0;

for (const year of YEARS_TO_CHECK) {
  const indexUrl = `https://regattaresults.co.za/home/${yearSlug(year)}/`;
  console.log(`\nChecking ${year} → ${indexUrl}`);

  let html;
  try {
    const res = await fetch(indexUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RegattaResultsBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
    });
    if (!res.ok) { console.log(`  HTTP ${res.status} — skipping`); continue; }
    html = await res.text();
  } catch (e) {
    console.log(`  Fetch error: ${e.message} — skipping`);
    continue;
  }

  const links = extractLinks(html);
  console.log(`  Found ${links.length} result links on page`);

  const newRaces = [];
  for (const { href, raw } of links) {
    if (knownUrls.has(normalise(href))) continue;

    const { name, date } = parseName(raw, year);
    const id = href.split('/').filter(Boolean).slice(-2)[0];

    const race = { id, name, date, location: '', province: '', status: 'Official', url: href };
    newRaces.push(race);
    knownUrls.add(normalise(href));
    console.log(`  + NEW: ${name} (${date})`);
  }

  if (newRaces.length > 0) {
    autoDiscovered[year] = [...(autoDiscovered[year] ?? []), ...newRaces];
    totalNew += newRaces.length;
  } else {
    console.log('  No new regattas found.');
  }
}

// ── Write output ──────────────────────────────────────────────────────────────

if (totalNew > 0) {
  writeFileSync(autoPath, JSON.stringify(autoDiscovered, null, 2) + '\n');
  console.log(`\nWrote ${totalNew} new regatta(s) to auto-discovered.json`);
} else {
  console.log('\nNothing new — no file changes.');
}
