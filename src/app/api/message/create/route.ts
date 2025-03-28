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
import { Embed, embedSystemMessageBuilder, multiImageEmbedBuilder } from "@/lib/embeds";

const { DISCORD_TOKEN, DISCORD_CLIENT_ID } = process.env;

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

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const body: {
      op: number;
      d: any;
      t: string;
      s: number;
    } = await request.json();

    console.log('MESSAGE_CREATE event:', body);

    // Check if self is the author
    if (body.d.author.id === DISCORD_CLIENT_ID) {
      return Response.json({
        success: true,
      }, {
        status: 200,
      });
    }

    // Check if mention is present and if self is mentioned
    const mention = body.d.mentions.find((m: any) => m.id === DISCORD_CLIENT_ID);
    if (mention && body.d.author.id !== DISCORD_CLIENT_ID) {
      // Check if message contains a command

      // generate image command example: <@${DISCORD_CLIENT_ID}> generate image <number of images to generate> <prompt>
      if (body.d.content.startsWith(`<@${DISCORD_CLIENT_ID}> generate image`) || body.d.content.startsWith(`generate image`)) {
        const regex = /^<@(\d+)> generate image (\d+)\s+(.+)$/;
        const match = body.d.content.match(regex);

        if (match) {
          const numberOfImages: number = parseInt(match[2], 10);
          const prompt: string = match[3];

          console.log('Number of images:', numberOfImages);
          console.log('Prompt:', prompt);

          const images = await generateImage({
            prompt: prompt,
            numberOfImagesToGenerate: numberOfImages,
          });

          const imageEmbeds = await multiImageEmbedBuilder({
            title: 'Generated Images',
            desc: 'Images generated using AI',
            images: images as string[],
          });

          await sendMessageToGuild(body.d.channel_id, imageEmbeds);
        } else {
          console.log('Invalid format');

          const responseEmbed = await embedSystemMessageBuilder({
            content: `Invalid format. Please use the following format: \`<@${DISCORD_CLIENT_ID}> generate image <number of images to generate> <prompt>\``,
            status: 'error',
          });

          await sendMessageToGuild(body.d.channel_id, responseEmbed);
        }
      }

      return Response.json({
        success: true,
      }, {
        status: 200,
      });
    }

    // Pass to generative model
    const response = await generateResponse(body.d.content);
    const responseEmbed = await embedSystemMessageBuilder({
      content: response as string,
      status: 'info',
    });

    await sendMessageToGuild(body.d.channel_id, responseEmbed);

    // Send Translated Message
    const translations = await translateText(body.d.content);
    const translatedText = await embedSystemMessageBuilder({
      content: translations.flatMap((entry: any, entryIndex: number) =>
        entry.translations.map((t: any, langIndex: number) =>
          `${t.to}:\n\n> ${t.text}\n`
        )
      ).join('\n'),
      status: 'info',
    });

    await sendMessageToGuild(body.d.channel_id, translatedText);

    return Response.json({
      success: true,
    }, {
      status: 200,
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