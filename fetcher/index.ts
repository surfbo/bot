const playaaaaas = ['Le-Sillon'];

type IPlaya = { playa: string; html: string; url: string };
/**
 * fetch
 */
export const fetcher = async (): Promise<IPlaya[]> => {
  return await Promise.all(
    playaaaaas.map(async (playa) => {
      const url = `https://fr.surf-forecast.com/breaks/${playa}/forecasts/latest/six_day`;

      const res = await fetch(url);
      const html = await res.text();

      return {
        playa,
        html,
        url,
      };
    })
  );
};
