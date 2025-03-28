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
* @date   Created on 03/28/2025 05:32:05 UTC-07:00
*/

import { headers } from 'next/headers';
import { InteractionRequest, SlashCommand } from '@/types/interactions';
import { discordValidateSignature } from '@/lib/discord';
import prisma from '@/lib/prisma';

async function saveInteractionToDatabase(body: InteractionRequest) {
  return prisma.interactions.create({
    data: {
      discordId: body.id,
      token: body.token,
      data: JSON.stringify(body),
    },
  });
}

function createJsonResponse(type: number, status: number = 200) {
  return Response.json({ type }, {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const headersList = await headers();
    const body: InteractionRequest = JSON.parse(await request.text());

    console.log('Interaction Request: ', body);

    // Validate the request signature
    const isValid: boolean = await discordValidateSignature(
      headersList.get('X-Signature-Timestamp') as string,
      JSON.stringify(body),
      headersList.get('X-Signature-Ed25519') as string
    );

    if (!isValid) {
      console.log(headersList.get('X-Signature-Timestamp'));
      console.log(headersList.get('X-Signature-Ed25519'));
      return Response.json(
        { success: false, error: 'Invalid request signature' },
        { status: 401 }
      );
    }

    switch (body.type) {
      case 1: // Discord PING
        return createJsonResponse(1);

      case 2: // Application Command
      case 3: // Message Component
      case 5: // Modal Submit
        console.log('Interaction Type:', body.type, body);
        await saveInteractionToDatabase(body);
        return createJsonResponse(body.type === 3 ? 6 : 5);

      default: // Unknown Interaction
        console.log('Unknown Interaction:', body);
        await saveInteractionToDatabase(body);
        return createJsonResponse(5);
    }
  } catch (error) {
    return Response.json(
      { success: false, error: error },
      { status: 500 }
    );
  }
}