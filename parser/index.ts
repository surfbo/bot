import { JSDOM } from 'jsdom';

type SurfEvents = {
  day: string;
  interval: string; // 'matin' | 'après-midi' | 'soir';
  rating: string;
};

type IPlayaSurfEvents = {
  surf: boolean;
  events: { [d: string]: SurfEvents[] };
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
    events: events.reduce((eventsPerDate, event) => {
      //@ts-ignore
      eventsPerDate[event.day] = [...(eventsPerDate[event.day] || []), event];

      return eventsPerDate;
    }, {}),
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
