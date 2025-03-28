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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const res: {
      op: number;
      d: any;
      t: string;
      s: number;
    } = await request.json();

    const guildData = res.d;

    // Upsert guild data
    prisma.guild.upsert({
      where: {
        guildId: guildData.id,
      },
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
    })
      .then((response) => {
        // if guild is not initialized or aura version is not set
        if (response && (!response.initialized || !response.auraVersion)) {

          // Find public_updates_channel_id or safety_alerts_channel_id or system_channel_id
          const public_updates_channel_id = guildData.public_updates_channel_id;
          const safety_alerts_channel_id = guildData.safety_alerts_channel_id;
          const system_channel_id = guildData.system_channel_id;

          // Create message send channel id
          const message_send_channel_id = public_updates_channel_id || safety_alerts_channel_id || system_channel_id;

          console.log(`Sending message to channel: ${message_send_channel_id}`);

          // Create embed message
          const embed: Embed[] = [
            {
              "title": "👋 Welcome to Advanced Universal Recreational Activities (AURA)!",
              "description": `Hey there! I’m **AURA**, your friendly AI-powered bot designed to keep your server **active, fun, and full of good vibes**. 💬✨\n\nFrom **daily conversation starters** to **trivia nights**, **event hosting**, and more, I’ve got a whole toolkit of features to bring your community together and keep the energy high. 🧠🎮\n\nWhether you’re here to **gamify your server**, spark new friendships, or just keep the conversation flowing, I’m here to help you build an awesome space.\n\nLet’s make this server the place everyone wants to be! 🚀💖`,
              "color": 0x00ff00
            },
          ];

          // Send message to the guild
          fetch(`https://discord.com/api/v10/channels/${message_send_channel_id}/messages`, {
            method: 'POST',
            headers: {
              Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              embeds: embed as Embed[],
            }),
          })
            // Log response.body
            .then((response) => response.json())
            .then((data) => {
              console.log('Guild Create Message Response:', data);
              // Update guild with message id
              prisma.guild.update({
                where: {
                  guildId: guildData.id,
                },
                data: {
                  initialized: new Date(),
                  auraVersion: process.env.AURA_VERSION,
                },
              })
                .then((response) => {
                  console.log('Guild Initialized:', response);

                  return Response.json({
                    success: true,
                    op: null,
                    d: null,
                  }, {
                    status: 200,
                  });
                })
                .catch((error) => {
                  console.error('Error updating guild:', error);

                  return Response.json({
                    success: false,
                    error: error,
                  }, {
                    status: 500,
                  });
                });
            })
            .catch((error) => {
              console.error('Error updating server message:', error);

              return Response.json({
                success: false,
                error: error,
              }, {
                status: 500,
              });
            });
        }
        else if (response && response.initialized && response.auraVersion !== process.env.AURA_VERSION) {
          // Update guild with new AURA version
          prisma.guild.update({
            where: {
              guildId: guildData.id,
            },
            data: {
              auraVersion: process.env.AURA_VERSION,
            },
          })
            .then((response) => {
              console.log('Guild AURA Version Updated:', response);

              // Find public_updates_channel_id or safety_alerts_channel_id or system_channel_id
              const public_updates_channel_id = guildData.public_updates_channel_id;
              const safety_alerts_channel_id = guildData.safety_alerts_channel_id;
              const system_channel_id = guildData.system_channel_id;

              // Create message send channel id
              const message_send_channel_id = public_updates_channel_id || safety_alerts_channel_id || system_channel_id;

              console.log(`Sending message to channel: ${message_send_channel_id}`);

              // Create embed message
              const embed: Embed[] = [
                {
                  title: `New Advanced Universal Recreational Activities Version: ${process.env.AURA_VERSION}`,
                  description: `AURA has been updated to version ${process.env.AURA_VERSION}! 🎉`,
                  color: 0x0000ff,
                },
              ];

              // Send message to the guild
              fetch(`https://discord.com/api/v10/channels/${message_send_channel_id}/messages`, {
                method: 'POST',
                headers: {
                  Authorization: `Bot ${process.env.DISCORD_TOKEN}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  embeds: embed as Embed[],
                }),
              })
                // Log response.body
                .then((response) => response.json())
                .then((data) => {
                  console.log('Guild Create Message Response:', data);
                  // Update guild with message id
                  prisma.guild.update({
                    where: {
                      guildId: guildData.id,
                    },
                    data: {
                      initialized: new Date(),
                    },
                  })
                    .then((response) => {
                      console.log('Guild Initialized:', response);

                      return Response.json({
                        success: true,
                        op: null,
                        d: null,
                      }, {
                        status: 200,
                      });
                    })
                    .catch((error) => {
                      console.error('Error updating guild:', error);

                      return Response.json({
                        success: false,
                        error: error,
                      }, {
                        status: 500,
                      });
                    });
                });
            })
            .catch((error) => {
              console.error('Error updating guild:', error);

              return Response.json({
                success: false,
                error: error,
              }, {
                status: 500,
              });
            });
        }
      })
      .catch((error) => {
        console.error('Error upserting guild data:', error);

        return Response.json({
          success: false,
          error: error,
        }, {
          status: 500,
        });
      });
  }
  catch (e) {
    return Response.json({
      success: false,
      error: e
    }, {
      status: 500,
    });
  }
}