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
  body: 'Time to go full gihtub action',
});
