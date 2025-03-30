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


// You will need to set these environment variables or edit the following values
const endpoint = process.env.AZURE_IMAGE_ENDPOINT as string;
const apiKey = process.env.AZURE_IMAGE_KEY as string;

export default async function generateImage({
  prompt,
  numberOfImagesToGenerate = 1,
  size = "1024x1024",
}: {
  prompt: string;
  numberOfImagesToGenerate: number;
  size?: "1024x1024" | "256x256" | "512x512" | "1792x1024" | "1024x1792" | null | undefined;
}) {
  console.log("== Image Generation ==");

  const url = `${endpoint}`;
  const headers = {
    "Content-Type": "application/json",
    "api-key": apiKey,
  };

  const payload = {
    prompt: prompt,
    size: size,
    n: numberOfImagesToGenerate,
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: headers,
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Image generation failed: ${response.status} ${response.statusText} - ${error}`);
    }
    const responseData = await response.json();
    return responseData.data.map((image: { url: string }) => image.url);
  } catch (error) {
    console.error("Error generating image:", error);
    throw error;
  }
}