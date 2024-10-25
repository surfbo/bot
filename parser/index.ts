import { JSDOM } from 'jsdom';

type SurfEvents = {
  day: string;
  interval: string; // 'matin' | 'après-midi' | 'soir';
  rating: string;
};

type IPlayaSurfEvents = {
  surf: boolean;
  formattedEvents: string[];
};

/**
 * compute a ratings per day
 * @param html
 */
export const parser = (html: string): IPlayaSurfEvents => {
  const events = [] as SurfEvents[];
  let current = new Date();

  const root = new JSDOM(html);

  extract(root, 'span.forecast-table__value', (text: string) => {
    events.push({
      day: current.toISOString().split('T')[0],
      interval: text.replace('<br>', ''),
      rating: '',
    });

    if (text === 'soir') {
      current.setDate(current.getDate() + 1);
    }
  });

  let i = 0;
  extract(root, 'div.star-rating__rating', (text: string) => {
    events[i].rating = text;
    i++;
  });

  return {
    surf: !!events.find((e) => e.rating !== '0'),
    formattedEvents: Object.entries(
      events.reduce((eventsPerDate, event) => {
        //@ts-ignore
        eventsPerDate[event.day] = {
          //@ts-ignore
          ...(eventsPerDate[event.day] || {}),
          [event.interval]: event,
        };

        return eventsPerDate;
      }, {})
    ).map(([day, events]) => {
      const weekday = `${getWeekDay(new Date(day)).slice(0, 2)} ${getMonthDay(
        new Date(day)
      )}`;

      const f = [
        //@ts-ignore
        events['matin']?.rating ?? '0',
        //@ts-ignore
        events['après-midi']?.rating ?? '0',
        //@ts-ignore
        events['soir']?.rating ?? '0',
      ].join('・');

      if (f !== '0・0・0') {
        return `${weekday} : ${f}`;
      }
      return '(...)';
    }),
  };
};

const extract = (
  root: any,
  selector: string,
  handler: (text: string) => void
) => {
  const elements = root.window.document.querySelectorAll(selector);
  if (elements && elements?.length > 0) {
    for (let i = 0; i < elements.length; i++) {
      if (elements[i]) {
        handler(elements[i].textContent);
      }
    }
  }
};

const getWeekDay = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(d);

const getMonthDay = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', { day: '2-digit' }).format(d);
