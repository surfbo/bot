import { parse } from 'node-html-parser';

type SurfEvents = {
  day: string;
  interval: string; // 'matin' | 'après-midi' | 'soir';
  rating: string;
};

/**
 * compute a ratings per day
 * @param html
 */
export const parser = (html: string): SurfEvents[] => {
  const events = [] as SurfEvents[];
  let current = new Date();

  const root = parse(html);

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
  return events;
};

const extract = (
  root: any,
  selector: string,
  handler: (text: string) => void
) => {
  const elements = root.querySelectorAll(selector);
  if (elements && elements?.length > 0) {
    for (let i = 0; i < elements.length; i++) {
      if (elements[i]) {
        handler(elements[i].innerHTML);
      }
    }
  }
};
