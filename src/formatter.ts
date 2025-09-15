export function formatSurfAlert(playa: string, formattedEvents: string[], url: string): string {
  return `
<div>
<h2>🚨 swell alert - <a href="${url}">${playa}</a></h2>
<br/>
<div>${formattedEvents
    .filter((a, index) => {
      if (
        a === '(...)' &&
        index > 0 &&
        formattedEvents[index - 1] === '(...)'
      ) {
        return false;
      }
      return true;
    })
    .join('</div><div>')}</div>
<br/>
<a href="https://surf-bobot.xavier-71b.workers.dev">👉 surf monitor</a>
<div>
`;
}

interface SurfData {
  playa: string;
  url: string;
  surf: boolean;
  formattedEvents: string[];
}

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

const PAGE_STYLES = `
  body {
    font-family: monospace;
    background: #070315;
    color: #08ff00;
    text-shadow: 0 0 5px rgb(204, 255, 163);
    padding: 20px;
    margin: 0;
  }
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 20px 0;
  }
  th, td {
    border: 1px solid #0f0;
    padding: 8px;
    text-align: left;
  }
  th {
    background: #003300;
    font-weight: bold;
  }
  .surf-yes {
    color: #0f0;
    font-weight: bold;
  }
  .surf-no {
    color: #666;
  }
  a {
    color: #0f0;
    text-decoration: underline;
  }
  a:hover {
    color: #00ff00;
    background: #003300;
  }
  .events-cell {
    font-size: 12px;
    line-height: 1.2;
  }
  .event-line {
    margin: 2px 0;
    font-family: monospace;
  }
`;

export function formatSurfPage(surfData: SurfData[]): string {
  const rows = surfData.map(({ playa, url, surf, formattedEvents }) => {
    const eventsList = formattedEvents.slice(0, 5).map(event =>
      `<div class="event-line">${escapeHtml(event)}</div>`
    ).join('');

    return `
    <tr>
      <td><a href="${escapeHtml(url)}">${escapeHtml(playa)}</a></td>
      <td class="${surf ? 'surf-yes' : 'surf-no'}">${surf ? 'OUI' : 'NON'}</td>
      <td class="events-cell">${eventsList}</td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Surf Monitor Status</title>
  <style>${PAGE_STYLES}</style>
</head>
<body>
<h1>🤙 SURF MONITOR STATUS</h1>
  <table>
    <tr>
      <th>Playa</th>
      <th>Ça surf ?</th>
      <th>Quand ?</th>
    </tr>${rows}
  </table>
  <p>Dernière maj: ${new Date().toLocaleDateString('fr-FR')}</p>
  <p><a href="https://github.com/surfbo/bot">Code source</a></p>
</body>
</html>`;
}