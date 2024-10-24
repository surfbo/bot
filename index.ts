import { parser } from './parser';
import { fetcher } from './fetcher';
import { send } from './sender';

const playas = await fetcher();

playas.forEach(async ({ html, playa, url }) => {
  const events = parser(html);
  const daysWithSurf = Object.keys(events);

  if (daysWithSurf.length > 0) {
    const body = `
  🚨 swell alert - ${playa}
  ${daysWithSurf
    .map(
      (day) =>
        `${day} | ${events[day].map((e) => `${e.interval}: ${e.rating}⭐️`)}`
    )
    .join('\r\n')}
  
  👉 ${url}
      `;

    await send(body);
  }
});
