import { fetcher } from './fetcher';
import { parser } from './parser';
import { send } from './sender';
import { formatSurfAlert, formatSurfPage } from './formatter';

export interface Env {
  MATRIX_ACCESS_TOKEN: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const playas = await fetcher();

      const surfData = playas.map(({ html, playa, url }) => {
        const { surf, formattedEvents } = parser(html);
        return { playa, url, surf, formattedEvents };
      });

      const html = formatSurfPage(surfData);

      return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
        status: 200
      });
    } catch (error) {
      return new Response(`Error: ${error}`, { status: 500 });
    }
  },

  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('Surf monitoring cron job started');

    try {
      const playas = await fetcher();

      for (const { html, playa, url } of playas) {
        const { surf, formattedEvents } = parser(html);

        if (!surf) {
          continue;
        }

        const body = formatSurfAlert(playa, formattedEvents, url);

        await send(body, env.MATRIX_ACCESS_TOKEN);
      }
    } catch (error) {
      console.error('Error in surf monitoring:', error);
    }
  },
};