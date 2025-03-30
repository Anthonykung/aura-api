'use server';

/**
* Copyright (c) 2025 Anthony Kung (anth.dev)
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     https://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* @file   discord.ts
* @author Anthony Kung <hi@anth.dev> (anth.dev)
* @date   Created on 07/24/2024 01:32:16 UTC-07:00
*/

import nacl from 'tweetnacl';
import { Embed } from './embeds';

// Import credentials
const { DISCORD_CLIENT_ID, DISCORD_CLIENT_SECRET, DISCORD_TOKEN, DISCORD_PUBLIC_KEY } = process.env;

export async function discordValidateSignature(timestamp: string, body: string, signature: string): Promise<boolean> {
  try {
    return nacl.sign.detached.verify(
      Buffer.from(timestamp + body),
      Buffer.from(signature, "hex"),
      Buffer.from(DISCORD_PUBLIC_KEY as string, "hex"),
    );
  }
  catch (err) {
    console.error('Error validating signature: ', err);
    return false;
  }
}

export async function sendMessageToGuild(channelId: string, embed: Embed[]) {
  try {
    const response = await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ embeds: embed }),
    });
    return await response.json();
  } catch (error) {
    console.error('Error sending message to guild:', error);
    throw error;
  }
}

// Function to get discord list of user guilds
export async function getUserGuilds(accessToken: string) {
  const response = await fetch("https://discord.com/api/v10/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  // const response = await fetch("https://discord.com/api/v10/users/@me/guilds", {
  //   headers: {
  //     Authorization: `Bot ${DISCORD_TOKEN}`,
  //   },
  // });

  const data: {
    id: string;
    name: string;
    icon: string;
    owner: boolean;
    permissions: number;
    features: string[];
  }[] = await response.json();

  // For every guild, get the guild ID, name, icon, owner status, permissions, description
  let guilds = [];
  if (Array.isArray(data)) {
    for (const guild of data) {
      const guildData = await getGuildById(guild.id);
      guilds.push({
        id: guild.id,
        name: guild.name,
        icon: guild.icon,
        owner: guild.owner,
        permissions: guild.permissions,
        features: guild.features,
        description: guildData.description,
        preferred_locale: guildData.preferred_locale,
      });
    }
  } else {
    console.error('Invalid data format');
    console.log(data);
  }

  console.log(guilds);

  return guilds;
}

// Get guild
export async function getGuildById(guildId: string) {
  const response = await fetch(`https://discord.com/api/v10/guilds/${guildId}`, {
    headers: {
      Authorization: `Bot ${DISCORD_TOKEN}`,
    },
  });

  const data = await response.json();

  return data;
}

// Create Interaction Response
export async function createInteractionResponse(
  interactionId: string,
  token: string,
  response: any
) {
  await fetch(
    `https://discord.com/api/v10/interactions/${interactionId}/${token}/callback`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response),
    }
  );
}

// Get Original Interaction Response
export async function getOriginalInteractionResponse(
  token: string
) {
  const response = await fetch(
    `https://discord.com/api/v10/webhooks/${DISCORD_CLIENT_ID}/${token}/messages/@original`,
  );

  const data = await response.json();

  return data;
}

// Edit Original Interaction Response
export async function editOriginalInteractionResponse(
  token: string,
  response: any
) {
  await fetch(
    `https://discord.com/api/v10/webhooks/${DISCORD_CLIENT_ID}/${token}/messages/@original`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response),
    }
  );
}

// Delete Original Interaction Response
export async function deleteOriginalInteractionResponse(
  token: string
) {
  await fetch(
    `https://discord.com/api/v10/webhooks/${DISCORD_CLIENT_ID}/${token}/messages/@original`,
    {
      method: "DELETE",
    }
  );
}

// Create Followup Message
export async function createFollowupMessage(
  token: string,
  response: any
) {
  await fetch(
    `https://discord.com/api/v10/webhooks/${DISCORD_CLIENT_ID}/${token}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response),
    }
  );
}

// Get Followup Message
export async function getFollowupMessage(
  token: string,
  messageId: string
) {
  const response = await fetch(
    `https://discord.com/api/v10/webhooks/${DISCORD_CLIENT_ID}/${token}/messages/${messageId}`,
  );

  const data = await response.json();

  return data;
}

// Edit Followup Message
export async function editFollowupMessage(
  token: string,
  messageId: string,
  response: any
) {
  await fetch(
    `https://discord.com/api/v10/webhooks/${DISCORD_CLIENT_ID}/${token}/messages/${messageId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(response),
    }
  );
}

// Delete Followup Message
export async function deleteFollowupMessage(
  token: string,
  messageId: string
) {
  await fetch(
    `https://discord.com/api/v10/webhooks/${DISCORD_CLIENT_ID}/${token}/messages/${messageId}`,
    {
      method: "DELETE",
    }
  );
}