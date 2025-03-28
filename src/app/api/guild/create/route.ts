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
* @file   route.ts
* @author Anthony Kung <hi@anth.dev> (anth.dev)
* @date   Created on 03/28/2025 04:47:10 UTC-07:00
*/

import prisma from '@/lib/prisma';
import { Embed } from '@/types/embeds';

async function sendMessageToGuild(channelId: string, embed: Embed[]) {
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

async function updateGuildData(guildId: string, data: any) {
  try {
    return await prisma.guild.update({
      where: { guildId },
      data,
    });
  } catch (error) {
    console.error('Error updating guild data:', error);
    throw error;
  }
}

export async function POST(request: Request) {
  try {
    const res: {
      op: number;
      d: any;
      t: string;
      s: number;
    } = JSON.parse(await request.text());
    const guildData = res.d;

    const guild = await prisma.guild.upsert({
      where: { guildId: guildData.id },
      update: {
        name: guildData.name,
        ownerId: guildData.owner_id,
        systemChannelId: guildData.system_channel_id,
        rulesChannelId: guildData.rules_channel_id,
        description: guildData.description,
        preferredLocale: guildData.preferred_locale,
        publicUpdatesChannelId: guildData.public_updates_channel_id,
        approximateMemberCount: guildData.approximate_member_count,
        approximatePresenceCount: guildData.approximate_presence_count,
        safetyAlertsChannelId: guildData.safety_alerts_channel_id,
        data: guildData,
      },
      create: {
        guildId: guildData.id,
        name: guildData.name,
        ownerId: guildData.owner_id,
        systemChannelId: guildData.system_channel_id,
        rulesChannelId: guildData.rules_channel_id,
        description: guildData.description,
        preferredLocale: guildData.preferred_locale,
        publicUpdatesChannelId: guildData.public_updates_channel_id,
        approximateMemberCount: guildData.approximate_member_count,
        approximatePresenceCount: guildData.approximate_presence_count,
        safetyAlertsChannelId: guildData.safety_alerts_channel_id,
        data: guildData,
        auraVersion: process.env.AURA_VERSION,
      },
    });

    const messageChannelId =
      guildData.public_updates_channel_id ||
      guildData.safety_alerts_channel_id ||
      guildData.system_channel_id;

    if (!guild.initialized || guild.auraVersion !== process.env.AURA_VERSION) {
      const embed: Embed[] = guild.initialized
        ? [
            {
              title: `New Advanced Universal Recreational Activities Version: ${process.env.AURA_VERSION}`,
              description: `AURA has been updated to version ${process.env.AURA_VERSION}! 🎉`,
              color: 0x0000ff,
            },
          ]
        : [
            {
              title: "👋 Welcome to Advanced Universal Recreational Activities (AURA)!",
              description: `Hey there! I’m **AURA**, your friendly AI-powered bot designed to keep your server **active, fun, and full of good vibes**. 💬✨\n\nFrom **daily conversation starters** to **trivia nights**, **event hosting**, and more, I’ve got a whole toolkit of features to bring your community together and keep the energy high. 🧠🎮\n\nWhether you’re here to **gamify your server**, spark new friendships, or just keep the conversation flowing, I’m here to help you build an awesome space.\n\nLet’s make this server the place everyone wants to be! 🚀💖`,
              color: 0x00ff00,
            },
          ];

      console.log(`Sending message to channel: ${messageChannelId}`);
      await sendMessageToGuild(messageChannelId, embed);

      await updateGuildData(guildData.id, {
        initialized: new Date(),
        auraVersion: process.env.AURA_VERSION,
      });
    }

    return Response.json({ success: true, op: null, d: null }, { status: 200 });
  } catch (error) {
    console.error('Error processing request:', error);
    return Response.json({ success: false, error }, { status: 500 });
  }
}