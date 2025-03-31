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
* @date   Created on 03/28/2025 06:46:35 UTC-07:00
*/

import generateResponse from "@/lib/azureAI";
import generateImage from "@/lib/azureImage";
import { translateText } from "@/lib/azureTranslate";
import { sendMessageToGuild } from "@/lib/discord";
import { Embed, embedSystemMessageBuilder, multiImageEmbedBuilder } from "@/lib/embeds";
import prisma from "@/lib/prisma";
import { Message, MessageEvent } from "@/types/message";
import sharp from 'sharp';

const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env;

export const maxDuration = 60;

async function handleImageGeneration(message: any) {
  const regex = new RegExp(`^<@${DISCORD_CLIENT_ID}> generate image (\\d+)\\s+(.+)$`);
  const match = message.content.match(regex);

  if (match) {
    const numberOfImages: number = parseInt(match[1], 10);
    const prompt: string = match[2];

    console.log('Number of images:', numberOfImages);
    console.log('Prompt:', prompt);

    // Check if the number of images is less than or equal to 10
    if (numberOfImages > 10) {
      const responseEmbed = await embedSystemMessageBuilder({
        content: `The maximum number of images you can generate is 10. Please try again with a smaller number.`,
        status: 'error',
      });
      await sendMessageToGuild(message.channel_id, responseEmbed);
      return;
    }
    // Check if the prompt is empty
    if (prompt.trim() === '') {
      const responseEmbed = await embedSystemMessageBuilder({
        content: `The prompt cannot be empty. Please provide a valid prompt.`,
        status: 'error',
      });
      await sendMessageToGuild(message.channel_id, responseEmbed);
      return;
    }

    const images = await generateImage({
      prompt: prompt,
      numberOfImagesToGenerate: numberOfImages,
    }).catch(async (error) => {
      console.error('Error generating image:', error);

      const errorEmbed = await embedSystemMessageBuilder({
        content: error,
        status: 'error',
      });
      await sendMessageToGuild(message.channel_id, errorEmbed);

      throw error;
    });

    // fetch the first image
    const firstImage = await fetch(images[0]);
    if (!firstImage.ok) throw new Error('Failed to fetch image');
    const imageBuffer = await firstImage.arrayBuffer();
    const buffer = Buffer.from(imageBuffer);
    const { dominant } = await sharp(buffer).stats();
    const { r, g, b } = dominant;
    const hex = (r << 16) + (g << 8) + b;

    const imageEmbeds = await multiImageEmbedBuilder({
      title: 'Generated Images',
      desc: 'Images generated using AI',
      images: images as string[],
      color: hex,
    });

    await sendMessageToGuild(message.channel_id, imageEmbeds);
  } else {
    console.log('Invalid format');

    const responseEmbed = await embedSystemMessageBuilder({
      content: `Invalid format. Please use the following format: \`<@${DISCORD_CLIENT_ID}> generate image <number of images to generate> <prompt>\``,
      status: 'error',
    });

    await sendMessageToGuild(message.channel_id, responseEmbed);
  }
}

async function handleTranslation(message: any) {
  const regexToLanguage = new RegExp(`^<@${DISCORD_CLIENT_ID}> translate(?: to ([a-zA-Z-]{2,}(?:\\s*,\\s*[a-zA-Z-]{2,})*))?\\s+(.+)$`);
  const matchToLanguage = message.content.match(regexToLanguage);

  const supportedLanguages = await fetch('https://api.cognitive.microsofttranslator.com/languages?api-version=3.0&scope=translation');
  const languagesJson = await supportedLanguages.json();

  if (matchToLanguage) {
    const toLanguage: string = matchToLanguage[1] || 'en';
    const text: string = matchToLanguage[2];
    console.log('To language:', toLanguage);
    console.log('Text:', text);

    const languages = toLanguage.split(',');
    console.log('Languages:', languages);

    const translatedText = await translateText({
      text: text,
      to: languages,
    }).catch(async (error) => {
      console.error('Error translating text:', error);
      const errorEmbed = await embedSystemMessageBuilder({
        content: error,
        status: 'error',
      });
      await sendMessageToGuild(message.channel_id, errorEmbed);
      throw error;
    });

    console.log('Translated text:', translatedText[0].translations);

    const translations = await embedSystemMessageBuilder({
      content: translatedText[0].translations.map((entry: any) => {
        // Get the language name from the languagesJson
        const languageDetails = languagesJson.translation[entry.to];
        const languageName = languageDetails ? languageDetails.nativeName : entry.to;
        console.log('Language name:', languageName);
        return `**${languageName}**:\n\n> ${entry.text}\n`;
      }).join('\n'),
      status: 'info',
    });

    await sendMessageToGuild(message.channel_id, translations);
  } else {
    console.log('Invalid format');

    const languagesList = Object.entries(languagesJson.translation).map(([shortName, details]: [string, any]) => {
      return `${details.nativeName}: ${shortName}`;
    });
    const languagesString = languagesList.join('\n');

    const responseEmbed = await embedSystemMessageBuilder({
      content: [
        {
          "name": "Invalid format",
          "value": `Invalid format. Please use the following format:\n\nTo English:\`<@${DISCORD_CLIENT_ID}> translate <text to translate>\`\n\nTranslate to Language:\`<@${DISCORD_CLIENT_ID}> translate to <language> <text to translate>\`\n\nTranslate to Multiple Languages:\`<@${DISCORD_CLIENT_ID}> translate to <language1,language2,...> <text to translate>\``,
        },
        {
          "name": "Available Languages",
          "value": languagesString,
        },
      ],
      status: 'error',
    });

    await sendMessageToGuild(message.channel_id, responseEmbed);
  }
}

async function handleGenerativeResponse(message: any) {
  const response = await generateResponse(message.content).catch(async (error) => {
    console.error('Error generating response:', error);
    const errorEmbed = await embedSystemMessageBuilder({
      content: error.message,
      status: 'error',
    });
    await sendMessageToGuild(message.channel_id, errorEmbed);
    throw error;
  });

  console.log('Response:', response);

  const responseEmbed = await embedSystemMessageBuilder({
    content: response.content as string,
    status: 'info',
    color: response.color,
  });

  await sendMessageToGuild(message.channel_id, responseEmbed);
}

async function handleAuraChannel(message: Message) {
  const channelMentions = message.content.match(/<#(\d+)>/g);
  if (channelMentions && channelMentions.length === 1) {
    const guildMember = await fetch(`https://discord.com/api/v10/guilds/${message.guild_id}/members/${message.author.id}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bot ${DISCORD_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });
    if (!guildMember.ok) {
      console.error('Error fetching guild member:', guildMember.statusText);
      throw new Error('Failed to fetch guild member');
    }
    const guildMemberData = await guildMember.json();
    // If permission is (1 << 3)
    if (guildMemberData && guildMemberData.permissions && (guildMemberData.permissions & (1 << 3)) === (1 << 3)) {
      const channelId = channelMentions[0].match(/\d+/)?.[0];
      await prisma.guild.update({
        where: {
          guildId: message.guild_id,
        },
        data: {
          auraChannelId: channelId,
        },
      });
      const embed = await embedSystemMessageBuilder({
        content: `Aura channel set to <#${channelId}>`,
        status: 'success',
      });
      await sendMessageToGuild(message.channel_id, embed);
    }
    else {
      const embed = await embedSystemMessageBuilder({
        content: `You do not have permission to set the aura channel.`,
        status: 'error',
      });
      await sendMessageToGuild(message.channel_id, embed);
    }
  }
  else {
    const embed = await embedSystemMessageBuilder({
      content: `Invalid format. Please use the following format: \`<@${DISCORD_CLIENT_ID}> set aura channel <#channel_id>\``,
      status: 'error',
    });
    await sendMessageToGuild(message.channel_id, embed);
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const body: {
      attempts: number;
      data: MessageEvent;
    } = await request.json();
    console.log('Message Create Request: ', body);
    const message = body.data.d;
    try {
      if (message.author.id === DISCORD_CLIENT_ID) {
        return Response.json({ success: true }, { status: 200 });
      }
      if (body.attempts === 2) {
        const errorEmbed = await embedSystemMessageBuilder({
          content: [
            {
              "name": "Self-Healing in Progress – Please Stand By for Virtual Hugs",
              "value": "🧠 The system sensed a disturbance in the code force... but don’t worry! Our auto-healing algorithms are currently doing yoga, sipping binary tea 🍵, and gently coaxing things back to life. Hang tight – good vibes and error patching in progress ✨🔄",
            },
          ],
          status: 'warning',
        });
        await sendMessageToGuild(message.channel_id, errorEmbed);
      }
      const mention = message.mentions.find((m: any) => m.id === DISCORD_CLIENT_ID);
      if (mention && message.author.id !== DISCORD_CLIENT_ID) {
        if (message.content.startsWith(`<@${DISCORD_CLIENT_ID}> generate image`) || message.content.startsWith(`generate image`)) {
          await handleImageGeneration(message);
        } else if (message.content.startsWith(`<@${DISCORD_CLIENT_ID}> translate`)) {
          await handleTranslation(message);
        } else if (message.content.startsWith(`<@${DISCORD_CLIENT_ID}> set aura channel`)) {
          await handleAuraChannel(message);
        } else {
          await handleGenerativeResponse(message);
        }
      }
      else {
        await handleGenerativeResponse(message);
      }
      return Response.json({ success: true }, { status: 200 });
    }
    catch (error) {
      console.error('Error handling message:', error);
      if (body.attempts === 1) {
        const errorEmbed = await embedSystemMessageBuilder({
          content: [
            {
              "name": "System Glitch Detected – Activating Emergency Snacc Protocols!",
              "value": "💥 Oopsie-woopsie! Something went bonk in the system 😵‍💫 Don't panic! Our digital hamsters are sprinting in their wheels trying to self-heal the issue... ⚙️💨 We'll be back in a jiffy (hopefully 👀).",
            },
          ],
          status: 'warning',
        });
        await sendMessageToGuild(message.channel_id, errorEmbed);
      }
      else if (body.attempts === 10) {
        const retryEmbed = await embedSystemMessageBuilder({
          content: [
            {
              "name": "Self-Healing Failed – Send Cookies and Moral Support!",
              "value": "🥀 Uhh... welp. We tried duct taping the error back together, but it's still very broken 🧃💔 The self-healing spell fizzled out. Please try again later or poke a human for help 😭🧑‍🔧",
            },
          ],
          status: 'error',
        });
        await sendMessageToGuild(message.channel_id, retryEmbed);
      }
      return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
    }
  } catch (e) {
    console.error('Error in POST handler:', e);
    return Response.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}