import matrix from 'matrix-js-sdk';
import 'dotenv/config';

const bot_user = '@surfbobot:matrix.org';
const homeserver = 'https://matrix.org';

const client = matrix.createClient({
  baseUrl: homeserver,
  accessToken: process.env.MATRIX_ACCESS_TOKEN,
  userId: bot_user,
});

const bret = '!OxZqETKZbkIBKswQPP:matrix.org';
await client.sendMessage(bret, {
  //@ts-ignore
  msgtype: 'm.notice',
  body: "c'estmoi lebobot2",
});
// assumes bot_user has this format `@my-bot:matrix.org`
const bot_name = bot_user.slice(1).split(':')[0];
// @ts-ignore NOTE: why does this not type check
client.on('event', async (event: matrix.MatrixEvent) => {
  const roomId = event.getRoomId();

  if (event.getType() === 'm.room.message') {
    const message: string | undefined = event.event.content?.body;
    if (message?.startsWith(bot_name)) {
      const input = message
        .replace(bot_name, '')
        // optional `:`
        .replace(/^ *:/, '')
        .trim();
      console.log('input:', input);
      if (roomId) {
        await client.sendMessage(roomId, {
          //@ts-ignore
          msgtype: 'm.notice',
          body: evaljs(input),
        });
      }
    }
  }
});

await client.startClient();
console.log('Client Started');

// deno-lint-ignore no-explicit-any
function evaljs(param: any) {
  try {
    return String(eval(param));
  } catch (e) {
    return String(e);
  }
}
