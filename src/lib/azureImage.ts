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
// @file   azureImage.ts
// @author Anthony Kung <hi@anth.dev> (anth.dev)
// @date   Created on March 28 2025, 06:02 -07:00
*/

import { AzureOpenAI } from "openai";

// You will need to set these environment variables or edit the following values
const endpoint = process.env.AZURE_OPENAI_ENDPOINT || "Your endpoint";
const apiKey = process.env.AZURE_OPENAI_API_KEY || "Your API key";

// Required Azure OpenAI deployment name and API version
const apiVersion = process.env.OPENAI_API_VERSION || "2024-07-01";
const deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "dall-e-3";

function getClient(): AzureOpenAI {
  return new AzureOpenAI({
    endpoint,
    apiKey,
    apiVersion,
    deployment: deploymentName,
  });
}

const client = getClient();

export default async function generateImage({
  prompt,
  numberOfImagesToGenerate = 1,
}: {
  prompt: string;
  numberOfImagesToGenerate: number;
}) {
  console.log("== Image Generation ==");

  const results = await client.images.generate({
    prompt,
    size: "1024x1024",
    n: numberOfImagesToGenerate,
    model: "",
    style: "vivid", // or "natural"
  });

  return results.data.map((image) => image.url);
}