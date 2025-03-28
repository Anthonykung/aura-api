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
* @file   interaction.ts
* @author Anthony Kung <hi@anth.dev> (anth.dev)
* @date   Created on 07/24/2024 01:32:49 UTC-07:00
*/

import prisma from '@/lib/prisma';
import { Embed, singleStringColorEmbedBuilder, singleStringRichEmbedBuilder } from '@/lib/embeds';
import { getGuildById } from '@/lib/discord';

export interface User {
  id: string;
  username: string;
  avatar: string | null;
  discriminator: string;
  public_flags: number;
  flags: number;
  bot?: boolean;
  banner: string | null;
  accent_color: number | null;
  global_name: string | null;
  avatar_decoration_data: any | null;
  banner_color: string | null;
  clan: string | null;
  primary_guild: string | null;
}

export interface Interaction {
  id: string;
  type: number;
  name: string;
  user: User;
}

export interface InteractionMetadata {
  id: string;
  type: number;
  user: User;
  authorizing_integration_owners: Record<string, string>;
  name: string;
  command_type: number;
}

export interface Message {
  type: number;
  content: string;
  mentions: string[];
  mention_roles: string[];
  attachments: any[];
  embeds: Embed[];
  timestamp: string;
  edited_timestamp: string | null;
  flags: number;
  components: any[];
  id: string;
  channel_id: string;
  author: User;
  pinned: boolean;
  mention_everyone: boolean;
  tts: boolean;
  application_id: string;
  interaction: Interaction;
  webhook_id: string;
  position: number;
  interaction_metadata: InteractionMetadata;
}

export interface PartialEmoji {
  name: string;
  id: string | null;
  animated?: boolean;
}

export interface Button {
  type: 2; // Fixed value for a button
  style: number; // Represents the button style
  label?: string; // Max 80 characters
  emoji?: PartialEmoji;
  custom_id?: string; // Max 100 characters
  sku_id?: string; // Identifier for a purchasable SKU (premium-style buttons only)
  url?: string; // URL for link-style buttons
  disabled?: boolean; // Defaults to false
}

export async function getInteraction(id: string) {
  // Get interaction from database
  const interaction = await prisma.interactions.findUnique({
    where: {
      discordId: id,
    },
  });

  // Check if interaction was found
  if (!interaction) {
    console.error('getInteraction: Interaction not found:', id);
    return null;
  }

  console.log('Interaction found:', interaction);

  return interaction;
}

// Helper function to split content based on markdown headers, newlines, or periods
function splitContent(content: string, maxLength: number = 2000): string[] {
  const result: string[] = [];
  let remainingContent = content;

  const separators = ['\n#', '\n##', '\n###', '\n', '.'];

  while (remainingContent.length > maxLength) {
    let splitIndex = -1;

    for (const separator of separators) {
      splitIndex = remainingContent.lastIndexOf(separator, maxLength);
      if (splitIndex !== -1) {
        splitIndex += separator.length - 1;
        break;
      }
    }

    if (splitIndex === -1 || splitIndex === 0) {
      splitIndex = maxLength;
    }

    result.push(remainingContent.slice(0, splitIndex).trim());
    remainingContent = remainingContent.slice(splitIndex).trim();
  }

  if (remainingContent) {
    result.push(remainingContent);
  }

  return result;
}

// Helper function to send a Discord API request
async function sendDiscordRequest(url: string, method: string, body: any) {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bot ${process.env.DISCORD_TOKEN}`,
  };

  const response = await fetch(url, { method, headers, body: JSON.stringify(body) });
  const data = await response.json();
  console.log('Discord API response:', data);
  return data;
}

// Helper function to build embed or text response
function buildResponse(content: string, type: 'embed' | 'text', status: 'error' | 'success' | 'warning' | 'info') {
  if (type === 'embed') {
    const color = status === 'error' ? 0xff0000 : status === 'success' ? 0x00ff00 : status === 'warning' ? 0xffff00 : 0x0000ff;
    return singleStringColorEmbedBuilder(content, color);
  }
  return splitContent(content);
}

// Simplified interaction response
export async function interactionResponse({
  interactionToken,
  content,
  status = 'info',
  type = 'embed',
}: {
  interactionToken: string;
  content: string;
  status?: 'error' | 'success' | 'warning' | 'info';
  type?: 'text' | 'embed';
}) {
  try {
    if (!content) throw new Error('Content is required');

    const responseContent = await buildResponse(content, type, status);
    const isPaginated = Array.isArray(responseContent) && responseContent.length > 1;

    const body = {
      [type === 'embed' ? 'embeds' : 'content']: type === 'embed' ? [responseContent[0]] : responseContent[0],
      components: isPaginated
        ? [{ type: 1, components: [{ type: 2, style: 1, label: 'Previous', custom_id: 'previous', disabled: true }, { type: 2, style: 1, label: 'Next', custom_id: 'next' }] }]
        : [],
    };

    const data = await sendDiscordRequest(
      `https://discord.com/api/v10/webhooks/${process.env.DISCORD_CLIENT_ID}/${interactionToken}`,
      'POST',
      body
    );

    await prisma.interactionResponse.create({
      data: {
        interaction: { connect: { token: interactionToken } },
        data: JSON.stringify(data),
        totalPages: isPaginated ? responseContent.length : 1,
        [type === 'embed' ? 'embeds' : 'content']: JSON.stringify(responseContent),
      },
    });
  } catch (error) {
    console.error('interactionResponse error:', error);
  }
}

// Simplified server message response
export async function serverMessageResponse({
  serverId,
  content,
  status = 'info',
  type = 'embed',
}: {
  serverId: string;
  content: string;
  status?: 'error' | 'success' | 'warning' | 'info';
  type?: 'text' | 'embed';
}) {
  try {
    if (!content) throw new Error('Content is required');

    const server = await getGuildById(serverId);
    if (!server) throw new Error('Server not found');

    const channelId = server.public_updates_channel_id || server.system_channel_id;
    const responseContent = await buildResponse(content, type, status);

    for (const chunk of Array.isArray(responseContent) ? responseContent : [responseContent]) {
      await sendDiscordRequest(
        `https://discord.com/api/v10/channels/${channelId}/messages`,
        'POST',
        type === 'embed' ? { embeds: [chunk] } : { content: chunk }
      );
    }
  } catch (error) {
    console.error('serverMessageResponse error:', error);
  }
}

// Interaction response with only interaction ID and content
export async function interactionResponseWithId({
  serverId,
  interactionId,
  content,
  status = 'info',
  type = 'embed',
}: {
  serverId?: string;
  interactionId: string;
  content: string;
  status?: 'error' | 'success' | 'warning' | 'info';
  type?: 'text' | 'embed';
}) {
  try {
    const interaction = await getInteraction(interactionId);

    if (!interaction) {
      throw new Error('interactionResponseWithId: Interaction not found');
    }

    await interactionResponse({
      interactionToken: interaction.token,
      content,
      status,
      type,
    });
  }
  catch (error) {
    console.error(error);
  }
}

// Simplified interaction pagination
export async function interactionPagination({
  interactionId,
  interactionToken,
  direction,
}: {
  interactionId?: string;
  interactionToken?: string;
  direction: 'previous' | 'next';
}) {
  try {
    if (!interactionId && !interactionToken) throw new Error('Interaction ID or Token is required');

    const interaction = interactionId ? await getInteraction(interactionId) : null;
    if (!interaction) throw new Error('Interaction not found');

    const response = await prisma.interactionResponse.findFirst({
      where: { interaction: { id: interaction.id } },
      orderBy: { createdAt: 'desc' },
    });
    if (!response) throw new Error('Response not found');

    const data = JSON.parse(response.data);
    const buttons = data.components[0].components as Button[];

    buttons[0].disabled = direction === 'previous';
    buttons[1].disabled = direction === 'next' || response.totalPages === response.currentPage + 1;

    await sendDiscordRequest(
      `https://discord.com/api/v10/webhooks/${process.env.DISCORD_CLIENT_ID}/${interactionToken}`,
      'PATCH',
      { embeds: [data.embeds[data.currentPage]], components: data.components }
    );
  } catch (error) {
    console.error('interactionPagination error:', error);
  }
}