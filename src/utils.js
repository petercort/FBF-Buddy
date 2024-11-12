import 'dotenv/config';

export async function DiscordRequest(endpoint, options) {
  const discordToken = fs.readFileSync("/mnt/secrets-store/discordToken", 'utf8');
  // append endpoint to root API URL
  const url = 'https://discord.com/api/v10/' + endpoint;
  // Stringify payloads
  if (options.body) options.body = JSON.stringify(options.body);

  // Use fetch to make requests
  const res = await fetch(url, {
    headers: {
      Authorization: `Bot ${discordToken}`,
      'Content-Type': 'application/json; charset=UTF-8',
      'User-Agent': 'DiscordBot (https://github.com/petercort/fbf-event-buddy, 1.0.0)',
    },
    ...options
  });
  // throw API errors
  if (!res.ok) {
    const data = await res.json();
    console.log(res.status);
    throw new Error(JSON.stringify(data));
  }
  // return original response
  return res;
}

export async function InstallGlobalCommands(appId, commands) {
  // API endpoint to overwrite global commands
  const endpoint = `applications/${appId}/commands`;

  try {
    // This is calling the bulk overwrite endpoint: https://discord.com/developers/docs/interactions/application-commands#bulk-overwrite-global-application-commands
    await DiscordRequest(endpoint, { method: 'PUT', body: commands });
  } catch (err) {
    console.error(err);
  }
}

// Simple method that returns a random emoji from list
export function getRandomEmoji() {
  const emojiList = ['😭','😄','😌','🤓','😎','😤','🤖','😶‍🌫️','🌏','📸','💿','👋','🌊','✨'];
  return emojiList[Math.floor(Math.random() * emojiList.length)];
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function getEvents() {
    const eventList = [{name: "crank the kanc", value: "crank-the-kanc"}]
    return eventList;
}

export function getDisciplines() {
    const disciplineList = [{name: "gravel", value: "gravel"}];
    return disciplineList;
}
// {name: "hillclimb", name: "fondo", name: "road", name: "mtb", name: "cx", name: "other"}