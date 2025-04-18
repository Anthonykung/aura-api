/*
// Copyright (c) 2025 Anthony Kung <hi@anth.dev> (anth.dev)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// @file   azureAI.ts
// @author Anthony Kung <hi@anth.dev> (anth.dev)
// @date   Created on March 28 2025, 06:01 -07:00
*/

// You will need to set these environment variables or edit the following values
const endpoint = process.env.AZURE_CHAT_ENDPOINT as string;
const apiKey = process.env.AZURE_CHAT_KEY as string;

const systemInstruction = Buffer.from(process.env.AURA_SYSTEM_INSTRUCTION as string, 'base64').toString('utf-8').trim();

function createMessages({
  text,
}: {
  text: string
}) {
  return {
    messages: [
      { role: "system", content: systemInstruction },
      { role: "assistant", content: "{\"color\":4879359,\"content\":\"Hello! I'm AURA, your friendly AI fun bot. How can I help you today?\"}" },
      { role: "user", content: text, },
    ],
    model: process.env.AZURE_CHAT_MODEL as string,
  };
}

export default async function generateResponse(text: string): Promise<{
  content: string;
  color: number;
}> {
  const messages = createMessages({ text });

  const url = `${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    "api-key": apiKey,
  };

  const payload = {
    messages: messages.messages,
    model: messages.model,
    // temperature: 0.7,
    max_tokens: 512,
    // top_p: 1,
    // frequency_penalty: 0,
    // presence_penalty: 0,
    // stop: ["\n"],
  };

  try {
    let content: {
      content: string;
      color: number | string;
    } = {
      content: "",
      color: "#0000ff",
    };
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      console.error("Chat completion error:", error);
      if (error.error.code === '429') {
        throw new Error(`Chat completion failed: Azure rate limit exceeded. Please try again later.`);
      }
      else if (error.error.code === 'content_filter') {
        content = await generateResponse(`Inappropriate content detected. Please write a warning message to the user.`);
      }
      else {
        throw new Error(`Chat completion failed: ${error.error.message}`);
      }
    }
    else {
      let responseData = await response.json();

      console.log("Chat completion response:", responseData);

      // Check if response starts with ```json and/or end with ```
      if (responseData?.choices[0]?.message?.content.startsWith("```json")) {
        responseData.choices[0].message.content = responseData.choices[0].message.content.replace(/```json/g, "").replace(/```/g, "");
      }

      // Get the content of the completion
      content = JSON.parse(responseData?.choices[0]?.message?.content);
    }

    // check if content.color is number
    if (typeof content.color !== "number") {
      // Convert color to number
      content.color = parseInt(content.color.replace("#", ""), 16);
    }

    return {
      content: content.content,
      color: content.color as number,
    };
  } catch (error) {
    console.error("Error generating response:", error);
    throw error;
  }
}