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
* @date   Created on 03/30/2025 04:15:13 UTC-07:00
*/

import generateResponse from '@/lib/azureAI';
import { sendMessageToGuild } from '@/lib/discord';
import { embedSystemMessageBuilder } from '@/lib/embeds';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { headers } from 'next/headers';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    // Get all servers
    const servers = await prisma.guild.findMany({
      where: {
        NOT: {
          initialized: null,
        },
      },
    });

    // For all servers, generate a hourly question
    const content = await generateResponse(`Current time is ${new Date().toLocaleString('en-US', {
      timeZone: 'America/Los_Angeles',
    })}. Generate a question for the following servers: ${JSON.stringify(servers)}`);

    // Build the response
    const embed = await embedSystemMessageBuilder({
      content: content,
    });

    for (const server of servers) {
      // Send the message to the server
      await sendMessageToGuild(server.auraChannelId as string, embed);
    }

    // Return the response
    return Response.json({
      success: true,
      message: 'Message sent to all servers',
    });
  }
  catch (e) {
    console.error(e);
    return Response.json({
      success: false,
      error: e,
    });
  }
}