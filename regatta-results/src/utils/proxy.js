export function toProxyUrl(url) {
  return url.replace(/^https?:\/\/(www\.)?regattaresults\.co\.za/, '/rr-proxy');
}

export function parseEventList(html, proxyUrl) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const baseDir = proxyUrl.substring(0, proxyUrl.lastIndexOf('/') + 1);
  const rows = [...doc.querySelectorAll('table tr')];
  return rows
    .filter(r => r.querySelectorAll('td').length >= 7)
    .map(row => {
      const cells = [...row.querySelectorAll('td')];
      const link = cells[7]?.querySelector('a');
      const href = link?.getAttribute('href');
      return {
        eventId: cells[0]?.textContent.trim(),
        eventName: cells[1]?.textContent.trim(),
        race: cells[2]?.textContent.trim(),
        time: cells[4]?.textContent.trim(),
        status: cells[5]?.textContent.trim(),
        detailsUrl: href ? baseDir + href : null,
      };
    })
    .filter(r => r.eventName && r.detailsUrl);
}

export function parseEventResults(html) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return [...doc.querySelectorAll('table tr')]
    .filter(r => r.querySelectorAll('td').length >= 5)
    .map(row => {
      const cells = [...row.querySelectorAll('td')];
      return {
        place: cells[0]?.textContent.trim(),
        lane: cells[1]?.textContent.trim(),
        org: cells[3]?.textContent.trim(),
        time: cells[4]?.textContent.trim(),
        delta: cells[6]?.textContent.trim() || '',
        status: cells[7]?.textContent.trim() || 'Finished',
        athlete: cells[8]?.textContent.trim() || '',
      };
    })
    .filter(r => r.place && r.org);
}
