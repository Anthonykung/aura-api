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
* @date   Created on 03/28/2025 06:06:15 UTC-07:00
*/

import prisma from '@/lib/prisma';
import { interactionPagination } from '@/lib/interaction';
import { Interaction } from '@/types/interactions';
import Help from '@/commands/help';
import About from '@/commands/about';

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
    } = JSON.parse(await request.text());

    console.log('Interaction Request: ', body);

    const data = JSON.parse(body.d);

    console.log(`Interaction received: ${data}`);

    // If type 2 Application Command
    if (data.type === 2) {
      // Call handler depending on command name
      switch (data.data.name) {
        case 'help':
          // Help Command Handler
          Help(data.data.id);
          break;
        case 'about':
          // About Command Handler
          About(data.data.id);
          break;
        default:
          break;
      }
    }

    // If type 3 Message Component
    if (data.type === 3) {
      // If type 3 Message Component is a button
      // if (data.components[0].type === 2) {
      //   // If button is a pagination button
      //   if (data.data.custom_id === 'next' || data.data.custom_id === 'previous') {
      //     // Interaction Pagination
      //     await interactionPagination({
      //       interactionId: data.interaction.id,
      //       interactionToken: data.interaction.token,
      //       direction: data.data.custom_id || 'next',
      //     });
      //   }
      // }
    }
  } catch (error) {
    return Response.json(
      { success: false, error: error },
      { status: 500 }
    );
  }
}