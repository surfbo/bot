import { parser } from './parser';
import { fetcher } from './fetcher';
import { send } from './sender';

const playas = await fetcher();

playas.forEach(async ({ html, playa, url }) => {
  const { surf, formattedEvents } = parser(html);

  if (!surf) {
    return;
  }

  const body = `
<div>
<h2>🚨 swell alert - ${playa}</h2>
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
<a href="${url}">👉 en savoir plus</a>
<div>
`;

  console.log(body);
  await send(body);
});
