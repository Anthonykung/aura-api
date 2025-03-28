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
* @file   help.ts
* @author Anthony Kung <hi@anth.dev> (anth.dev)
* @date   Created on 03/28/2025 07:22:13 UTC-07:00
*/

import generateResponse from "@/lib/azureAI";
import { interactionResponseWithId } from "@/lib/interaction";

const helpText = `
👋 Hey there! I’m **AURA** — your AI-powered activity host, conversation starter, and community hype-bot.
My job? To keep your Discord server fun, friendly, and full of life ✨

Here’s what I can do:

🗣 **Conversation Starters**
• \`/ daily\` – Posts today’s question
• \`/ thisorthat\` – Start a quick poll
• \`/ roulette\` – Drop a random chat topic

🧠 **Games & Fun**
• \`/ trivia start\` – Launch a trivia game
• \`/ hangman\` – Play hangman with the server
• \`/ storytime\` – Generate a story using AI

📈 **Engagement & XP**
• \`/ profile\` – View your level, XP, and badges
• \`/ leaderboard\` – Show server rankings

🛠️ **Customization**
• \`/ setchannel\` – Choose where features go
• \`/ settings\` – Configure XP, badges, and more

Need help with a specific command? Try \`/ help[command]\`
Want to learn more about me? Type \`/ about\` 💖
`.trim();

export default async function Help({
  id,
}: {
  id: string;
}) {

  const content = await generateResponse('What are you? How do I use this?') || helpText;

  await interactionResponseWithId({ interactionId: id, content: content, status: 'info' });
}