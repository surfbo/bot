import { parser } from './parser';
import { fetcher } from './fetcher';
import { send } from './sender';

const playas = await fetcher();

const getWeekDay = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(d);

playas.forEach(async ({ html, playa, url }) => {
  const { surf, events } = parser(html);
  const daysWithSurf = Object.keys(events);

  if (surf) {
    const body = `
    <div>
<h2>🚨 swell alert - ${playa}</h2>
<table>
<thead>
<tr>
  <th scope="col">jour</th>
  <th scope="col">matin</th>
  <th scope="col">après-midi</th>
  <th scope="col">soir</th>
</tr>
</thead>
<tbody>
${daysWithSurf
  .map(
    (day) =>
      `
      <tr>
        <th scope="row">${getWeekDay(new Date(day))}</th>
        ${events[day].map((e) => `<td>${e.rating}⭐️</td>`)}
      </tr>`
  )
  .join('\r\n')}
    </tbody>
  
  </table>

<a href="${url}">👉 en savoir plus</a></div>`;

    await send(body);
  }
});
