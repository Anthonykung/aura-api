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

import { headers } from 'next/headers';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const headersList = await headers();
    const body: {
      op: number;
      d: any;
      t: string;
      s: number;
    } = await request.json();

    console.log('Interaction Request: ', body);

    const data = JSON.parse(body.d);

    console.log(`Interaction received: ${data.type} | ${data.name} | ${data.id}`);

    // If type 2 Application Command
  } catch (error) {
    return Response.json(
      { success: false, error: error },
      { status: 500 }
    );
  }
}