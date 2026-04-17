import { writeFileSync, readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, '..');

// Read auto-discovered.json directly (avoids ESM import-attribute requirement)
const autoDiscovered = JSON.parse(
  readFileSync(resolve(root, 'src/data/auto-discovered.json'), 'utf8')
);

// Hardcoded regatta entries (mirrors src/data/regattas.js — 2025 and 2026 only)
const BASE = 'https://regattaresults.co.za/Results';
const HARDCODED = {
  2026: [
    { id: "kes-jan-2026",        name: "KES U16, U19 & Seniors",             date: "17 Jan 2026",          location: "Roodeplaat Dam",   province: "Gauteng",       status: "Official" },
    { id: "vlc-jan-2026",        name: "VLC Nationals Sprints",               date: "24–25 Jan 2026",       location: "Germiston Lake",   province: "Gauteng",       status: "Official" },
    { id: "nick-jan-2026",       name: "WC Nick Whaits Regatta",              date: "24 Jan 2026",          location: "Western Cape",     province: "Western Cape",  status: "Official" },
    { id: "hrs-jan-2026",        name: "Holy Rosary U14, U15 & Masters",      date: "31 Jan 2026",          location: "Germiston Lake",   province: "Gauteng",       status: "Official" },
    { id: "ec-champs-2026",      name: "EC Champs",                           date: "31 Jan 2026",          location: "East London",      province: "Eastern Cape",  status: "Official" },
    { id: "buffalo-feb-2026",    name: "Buffalo Regatta",                     date: "5 & 7 Feb 2026",       location: "Buffalo City",     province: "Eastern Cape",  status: "Official" },
    { id: "selborne-feb-2026",   name: "Selborne Sprints",                    date: "6 Feb 2026",           location: "East London",      province: "Eastern Cape",  status: "Official" },
    { id: "jeppe-feb-2026",      name: "Jeppe U14, U15 & Masters",            date: "14 Feb 2026",          location: "Germiston Lake",   province: "Gauteng",       status: "Official" },
    { id: "albans-feb-2026",     name: "St Albans U16, U19 & Seniors",        date: "21 Feb 2026",          location: "Roodeplaat Dam",   province: "Gauteng",       status: "Official" },
    { id: "assumption-feb-2026", name: "Assumption U14, U15 & Masters",       date: "28 Feb 2026",          location: "Roodeplaat Dam",   province: "Gauteng",       status: "Official" },
    { id: "sa-schools-2026",     name: "SA Schools Champs",                   date: "6–8 Mar 2026",         location: "Roodeplaat Dam",   province: "Gauteng",       status: "Official" },
    { id: "gp-sr-champs-2026",   name: "Gauteng Senior Champs",               date: "11 Apr 2026",          location: "Roodeplaat Dam",   province: "Gauteng",       status: "Official" },
    { id: "ussa-sprints-2026",   name: "USSA-R National Sprints",             date: "17–18 Apr 2026",       location: "Misverstand Dam",  province: "Western Cape",  status: "Upcoming" },
    { id: "sa-champs-2026",      name: "SA National Rowing Champs",           date: "25–26 Apr 2026",       location: "Roodeplaat Dam",   province: "Gauteng",       status: "Upcoming" },
  ],
  2025: [
    { id: "kes-2025",            name: "KES GSRF U16 & U19 Regatta",          date: "18 Jan 2025",          location: "Roodeplaat Dam",   province: "Gauteng",       status: "Official" },
    { id: "wc-newyear-2025",     name: "WC New Year Regatta",                 date: "18 Jan 2025",          location: "Western Cape",     province: "Western Cape",  status: "Official" },
    { id: "vlc-2025",            name: "ISIS Engineering VLC National Sprints",date: "25–26 Jan 2025",      location: "Germiston Lake",   province: "Gauteng",       status: "Official" },
    { id: "wc-champs-2025",      name: "WC Champs",                           date: "25 Jan 2025",          location: "Western Cape",     province: "Western Cape",  status: "Official" },
    { id: "ecra-2025",           name: "ECRA Champs",                         date: "1 Feb 2025",           location: "East London",      province: "Eastern Cape",  status: "Official" },
    { id: "jeppe-2025",          name: "Jeppe U14 & U15 GSRF Regatta",        date: "1 Feb 2025",           location: "Germiston Lake",   province: "Gauteng",       status: "Official" },
    { id: "buffalo-2025",        name: "Buffalo Regatta",                     date: "6 & 8 Feb 2025",       location: "Buffalo City",     province: "Eastern Cape",  status: "Official" },
    { id: "selborne-2025",       name: "Selborne Sprints",                    date: "7 Feb 2025",           location: "East London",      province: "Eastern Cape",  status: "Official" },
    { id: "saints-2025",         name: "St Stithians GSRF U16 & U19",         date: "15 Feb 2025",          location: "Roodeplaat Dam",   province: "Gauteng",       status: "Official" },
    { id: "albans-2025",         name: "St Albans Regatta",                   date: "22 Feb 2025",          location: "Roodeplaat Dam",   province: "Gauteng",       status: "Official" },
    { id: "sa-schools-2025",     name: "SA Schools Champs",                   date: "28 Feb – 2 Mar 2025",  location: "Roodeplaat Dam",   province: "Gauteng",       status: "Official" },
    { id: "ussar-2025",          name: "USSAR Sprints",                       date: "4–5 Apr 2025",         location: "Roodeplaat Dam",   province: "Gauteng",       status: "Official" },
    { id: "gp-champs-2025",      name: "Gauteng Champs",                      date: "12 Apr 2025",          location: "Roodeplaat Dam",   province: "Gauteng",       status: "Official" },
    { id: "sa-champs-2025",      name: "SA National Rowing Champs",           date: "26–27 Apr 2025",       location: "Roodeplaat Dam",   province: "Gauteng",       status: "Official" },
    { id: "bennies-sept-2025",   name: "St Bennies U14 & U15",                date: "20 Sep 2025",          location: "Roodeplaat Dam",   province: "Gauteng",       status: "Official" },
    { id: "sj-sept-2025",        name: "St John's U16, U19 & Snr",            date: "27 Sep 2025",          location: "Roodeplaat Dam",   province: "Gauteng",       status: "Official" },
    { id: "mary-oct-2025",       name: "St Mary's U14, U15 & Masters",        date: "4 Oct 2025",           location: "Roodeplaat Dam",   province: "Gauteng",       status: "Official" },
    { id: "mile-oct-2025",       name: "The Mile Regatta",                    date: "11–12 Oct 2025",       location: "Roodeplaat Dam",   province: "Gauteng",       status: "Official" },
    { id: "saints-oct-2025",     name: "St Stithian's U16, U19 & Seniors",    date: "18 Oct 2025",          location: "Roodeplaat Dam",   province: "Gauteng",       status: "Official" },
    { id: "cpc-2025",            name: "Cape Peninsula Champs",               date: "18–19 Oct 2025",       location: "Western Cape",     province: "Western Cape",  status: "Official" },
    { id: "dunstans-2025",       name: "St Dunstan's U14, U15 & Masters",     date: "25 Oct 2025",          location: "East London",      province: "Eastern Cape",  status: "Official" },
    { id: "wc-champs-oct-2025",  name: "WC Champs",                           date: "25–26 Oct 2025",       location: "Western Cape",     province: "Western Cape",  status: "Official" },
    { id: "gsrf-2025",           name: "GSRF & Africa Champs",                date: "31 Oct – 2 Nov 2025",  location: "Roodeplaat Dam",   province: "Gauteng",       status: "Official" },
  ],
};

// Merge hardcoded + auto-discovered (deduplicate by id)
const REGATTAS = {};
for (const [yr, list] of Object.entries(HARDCODED)) {
  REGATTAS[yr] = [...list];
}
for (const [yr, list] of Object.entries(autoDiscovered)) {
  if (!REGATTAS[yr]) REGATTAS[yr] = [];
  const existing = new Set(REGATTAS[yr].map(r => r.id));
  for (const r of list) {
    if (!existing.has(r.id)) REGATTAS[yr].push(r);
  }
}

// ── Date parsing ──────────────────────────────────────────────────────────────

const MONTH_SHORT = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
function pad(n) { return String(n).padStart(2, '0'); }
function toIcalDate(d) { return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}`; }
function addDays(d, n) { const r = new Date(d); r.setDate(r.getDate() + n); return r; }

function parseDateRange(str) {
  if (!str) return null;
  const crossMonth = str.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+[–-]\s*(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/);
  if (crossMonth) {
    return { start: new Date(+crossMonth[5], MONTH_SHORT[crossMonth[2]], +crossMonth[1]), end: addDays(new Date(+crossMonth[5], MONTH_SHORT[crossMonth[4]], +crossMonth[3]), 1) };
  }
  const range = str.match(/(\d{1,2})\s*[–&\-]\s*(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/);
  if (range) {
    return { start: new Date(+range[4], MONTH_SHORT[range[3]], +range[1]), end: addDays(new Date(+range[4], MONTH_SHORT[range[3]], +range[2]), 1) };
  }
  const single = str.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})/);
  if (single) {
    const start = new Date(+single[3], MONTH_SHORT[single[2]], +single[1]);
    return { start, end: addDays(start, 1) };
  }
  return null;
}

function escapeIcal(str) {
  return (str || '').replace(/[\\;,]/g, m => '\\' + m).replace(/\n/g, '\\n');
}

// ── Generate .ics ─────────────────────────────────────────────────────────────

const lines = [
  'BEGIN:VCALENDAR',
  'VERSION:2.0',
  'PRODID:-//Regatta Results SA//EN',
  'CALSCALE:GREGORIAN',
  'METHOD:PUBLISH',
  'X-WR-CALNAME:SA Rowing Regattas',
  'X-WR-CALDESC:South African rowing regatta calendar — regattaresults.co.za',
  'X-WR-TIMEZONE:Africa/Johannesburg',
];

let count = 0;
for (const year of [2026, 2025]) {
  for (const r of (REGATTAS[year] || [])) {
    const range = parseDateRange(r.date);
    if (!range) continue;
    lines.push(
      'BEGIN:VEVENT',
      `DTSTART;VALUE=DATE:${toIcalDate(range.start)}`,
      `DTEND;VALUE=DATE:${toIcalDate(range.end)}`,
      `SUMMARY:${escapeIcal(r.name)}`,
      `DESCRIPTION:${escapeIcal([r.location, r.province].filter(Boolean).join(' · '))}`,
      ...(r.location ? [`LOCATION:${escapeIcal(r.location)}`] : []),
      `UID:${r.id}@regattaresults.co.za`,
      `STATUS:${r.status === 'Official' ? 'CONFIRMED' : 'TENTATIVE'}`,
      'END:VEVENT',
    );
    count++;
  }
}

lines.push('END:VCALENDAR');

const out = resolve(root, 'public/calendar.ics');
writeFileSync(out, lines.join('\r\n') + '\r\n', 'utf8');
console.log(`Generated calendar.ics — ${count} events`);
