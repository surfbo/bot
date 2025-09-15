const bot_user = '@surfbobot:matrix.org';
const homeserver = 'https://matrix.org';
const bret = '!cNnlHVMpiveQFVMhkp:matrix.org';

export const send = async (body: string, accessToken: string): Promise<void> => {
  const url = `${homeserver}/_matrix/client/r0/rooms/${encodeURIComponent(bret)}/send/m.room.message`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      msgtype: 'm.text',
      format: 'org.matrix.custom.html',
      formatted_body: body,
      body: body,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to send message to Matrix: ${response.status} ${errorText}`);
  }

  console.log('Message sent successfully to Matrix');
};