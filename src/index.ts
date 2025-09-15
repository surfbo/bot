import { fetcher } from './fetcher';
import { parser } from './parser';
import { send } from './sender';

export interface Env {
  MATRIX_ACCESS_TOKEN: string;
}

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('Surf monitoring cron job started');

    try {
      const playas = await fetcher();

      for (const { html, playa, url } of playas) {
        const { surf, formattedEvents } = parser(html);

        if (!surf) {
          continue;
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

        console.log('Sending surf alert:', body);
        await send(body, env.MATRIX_ACCESS_TOKEN);
      }
    } catch (error) {
      console.error('Error in surf monitoring:', error);
    }
  },
};