import matrix from 'matrix-js-sdk';
import 'dotenv/config';

const bot_user = '@surfbobot:matrix.org';
const homeserver = 'https://matrix.org';
const bret = '!cNnlHVMpiveQFVMhkp:matrix.org';

const client = matrix.createClient({
  baseUrl: homeserver,
  accessToken: process.env.MATRIX_ACCESS_TOKEN,
  userId: bot_user,
});

export const send = async (body: string) => {
  await client.sendMessage(bret, {
    //@ts-ignore
    msgtype: 'm.text',
    format: 'org.matrix.custom.html',
    formatted_body: body,
    body,
  });
};
