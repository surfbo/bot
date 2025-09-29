type SurfEvents = {
  day: string;
  interval: string;
  rating: string;
};

type IPlayaSurfEvents = {
  surf: boolean;
  formattedEvents: string[];
};

export const parser = (html: string): IPlayaSurfEvents => {
  const events = [] as SurfEvents[];
  let current = new Date();

  // Extract data using HTMLRewriter approach
  const extractedData = extractDataFromHTML(html);

  // Process intervals
  extractedData.intervals.forEach((interval) => {
    events.push({
      day: current.toISOString().split('T')[0],
      interval: interval,
      rating: '',
    });

    if (interval === 'soir') {
      current.setDate(current.getDate() + 1);
    }
  });

  // Add ratings
  extractedData.ratings.forEach((rating, index) => {
    if (events[index]) {
      events[index].rating = rating;
    }
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

export function extractDataFromHTML(html: string): { intervals: string[], ratings: string[] } {
  const intervals: string[] = [];
  const ratings: string[] = [];

  // Use regex to extract data since HTMLRewriter is more complex for this simple parsing
  // Extract intervals from span.forecast-table__value
  const intervalMatches = html.matchAll(/<span[^>]*class="[^"]*forecast-table__value[^"]*"[^>]*>([\s\S]*?)<\/span>/gi);
  for (const match of intervalMatches) {
    const text = match[1].trim().replace(/<br\s*\/?>/gi, '').replace(/\s+/g, ' ').replace(/après-\s*midi/gi, 'après-midi').trim();
    if (text) { // Only add non-empty text
      intervals.push(text);
    }
  }

  // Extract ratings from div.star-rating__rating
  const ratingMatches = html.matchAll(/<div[^>]*class="[^"]*star-rating__rating[^"]*"[^>]*>([^<]*)<\/div>/gi);
  for (const match of ratingMatches) {
    const text = match[1].trim();
    ratings.push(text);
  }

  return { intervals, ratings };
}

export const getWeekDay = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', { weekday: 'long' }).format(d);

export const getMonthDay = (d: Date) =>
  new Intl.DateTimeFormat('fr-FR', { day: '2-digit' }).format(d);