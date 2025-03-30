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
* @file   about.ts
* @author Anthony Kung <hi@anth.dev> (anth.dev)
* @date   Created on 03/28/2025 08:31:55 UTC-07:00
*/

import generateResponse from "@/lib/azureAI";
import { interactionResponse } from "@/lib/interaction";

const aboutText = `
🎉 **AURA** stands for **Advanced Universal Recreational Activities**, and I'm here to make your server more social, creative, and downright awesome.

I’m powered by AI and built for:
- 🤝 Sparking conversation
- 🎯 Gamifying engagement
- 🧩 Encouraging creativity
- 🤖 Hosting voice channel games

Developed with love by [**Anthony Kung**](https://anth.dev) 🧑‍💻
Questions, feedback, or bugs? Feel free to reach out!

Want to see what I can do? Type \`/help\`
Let’s make your community unforgettable 💬💖
`.trim();

export default async function About({
  token,
}: {
  token: string;
}) {

  const content = await generateResponse('Tell me about yourself') || aboutText;

  await interactionResponse({ interactionToken: token, content: content, status: 'info' });
}