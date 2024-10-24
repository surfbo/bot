import { parser } from './parser';
import { fetcher } from './fetcher';
import { send } from './sender';
import intervalEmoji from './intervalEmoji';

const playas = await fetcher();

const getWeekDay = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(d);

playas.forEach(async ({ html, playa, url }) => {
  const { surf, events } = parser(html);
  const daysWithSurf = Object.keys(events);

  if (surf) {
    const body = `
🚨 swell alert - ${playa}
${daysWithSurf
  .map((day) => {
    const weekday = getWeekDay(new Date(day));
    return `${['vendredi', 'lundi'].includes(weekday) ? '---------------' : ''}
${printEqualLengthDay(weekday)} ${events[day]
      .map(
        (e) =>
          `${intervalEmoji[e.interval] || e.interval} ${
            e.rating == 0
              ? '·'
              : [...new Array(+e.rating)].map(() => '⭐️').join('')
          }`
      )
      .join(' ')}`;
  })
  .join('\n')}

👉${url}`;

    console.log(body);
    await send(body);
  }
});

function printEqualLengthDay(day) {
  const fillNeed = 8 - day.length;
  console.log(day, fillNeed);
  const fill = [...new Array(fillNeed)].map(() => ' ').join('');
  return day + fill;
}
