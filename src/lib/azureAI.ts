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

import { AzureOpenAI } from "openai";
import type {
  ChatCompletion,
  ChatCompletionCreateParamsNonStreaming,
} from "openai/resources/index";

// You will need to set these environment variables or edit the following values
const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "Your endpoint";
const apiKey = process.env.AZURE_OPENAI_API_KEY || "Your API key";

// Required Azure OpenAI deployment name and API version
const apiVersion = "2024-07-18";
const deploymentName = "gpt-4o-mini";

function getClient(): AzureOpenAI {

  console.log("== Azure OpenAI Configuration ==");
  console.log(`Endpoint: ${endpoint}`);
  console.log(`API Key: ${apiKey}`);
  console.log(`API Version: ${apiVersion}`);
  console.log(`Deployment Name: ${deploymentName}`);

  return new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion,
    deployment: deploymentName,
  });
}

const systemInstruction = Buffer.from(process.env.AURA_SYSTEM_INSTRUCTION as string, 'base64').toString('utf-8').trim();

function createMessages({
  text,
}: {
  text: string
}): ChatCompletionCreateParamsNonStreaming {
  return {
    messages: [
      { role: "system", content: systemInstruction },
      {
        role: "user",
        content: text,
      },
    ],
    model: "",
  };
}

const client = getClient();

export default async function generateResponse(text: string) {
  const messages = createMessages({ text });
  const chatCompletion = await client.chat.completions.create(messages);

  // Get the content of the completion
  const content = chatCompletion.choices[0].message.content;

  return content;
}