import { parser } from './parser';
import { fetcher } from './fetcher';
import { send } from './sender';

const playas = await fetcher();

playas.forEach(async ({ html, playa, url }) => {
  const events = parser(html);
  if (events.find((e) => e.rating !== '0')) {
    const body = `
🚨 swell alert - ${playa}
${events
  .filter((e) => e.rating !== '0')
  .map((e) => `${e.day} ${e.interval} : ${e.rating}`)
  .join('\r\n')}

👉 ${url}
    `;

    await send(body);
  }
});
