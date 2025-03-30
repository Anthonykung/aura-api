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
// @file   embeds.d.ts
// @author Anthony Kung <hi@anth.dev> (anth.dev)
// @date   Created on March 28 2025, 06:03 -07:00
*/

export type EmbedType = "rich" | "image" | "video" | "gifv" | "article" | "link";

export interface EmbedThumbnail {
  url: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface EmbedVideo {
  url?: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface EmbedImage {
  url: string;
  proxy_url?: string;
  height?: number;
  width?: number;
}

export interface EmbedProvider {
  name?: string;
  url?: string;
}

export interface EmbedAuthor {
  name: string;
  url?: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface EmbedFooter {
  text: string;
  icon_url?: string;
  proxy_icon_url?: string;
}

export interface EmbedField {
  name: string;
  value: string;
  inline?: boolean;
}

export interface Embed {
  title?: string;
  type?: EmbedType;
  description?: string;
  url?: string;
  timestamp?: string; // ISO8601 timestamp
  color?: number;
  footer?: EmbedFooter;
  image?: EmbedImage;
  thumbnail?: EmbedThumbnail;
  video?: EmbedVideo;
  provider?: EmbedProvider;
  author?: EmbedAuthor;
  fields?: EmbedField[];
}

export interface User {
  id: string;
  username: string;
  avatar: string | null;
  discriminator: string;
  public_flags: number;
  flags: number;
  bot?: boolean;
  banner: string | null;
  accent_color: number | null;
  global_name: string | null;
  avatar_decoration_data: any | null;
  banner_color: string | null;
  clan: string | null;
  primary_guild: string | null;
}

export interface Interaction {
  id: string;
  type: number;
  name: string;
  user: User;
}

export interface InteractionMetadata {
  id: string;
  type: number;
  user: User;
  authorizing_integration_owners: Record<string, string>;
  name: string;
  command_type: number;
}

export interface Message {
  type: number;
  content: string;
  mentions: string[];
  mention_roles: string[];
  attachments: any[];
  embeds: Embed[];
  timestamp: string;
  edited_timestamp: string | null;
  flags: number;
  components: any[];
  id: string;
  channel_id: string;
  author: User;
  pinned: boolean;
  mention_everyone: boolean;
  tts: boolean;
  application_id: string;
  interaction: Interaction;
  webhook_id: string;
  position: number;
  interaction_metadata: InteractionMetadata;
}

export interface PartialEmoji {
  name: string;
  id: string | null;
  animated?: boolean;
}

export interface Button {
  type: 2; // Fixed value for a button
  style: number; // Represents the button style
  label?: string; // Max 80 characters
  emoji?: PartialEmoji;
  custom_id?: string; // Max 100 characters
  sku_id?: string; // Identifier for a purchasable SKU (premium-style buttons only)
  url?: string; // URL for link-style buttons
  disabled?: boolean; // Defaults to false
}

// Helper function to split content into chunks
function splitContent(content: string, maxLength: number = 4096): string[] {
  const separators = ['\n#', '\n##', '\n###', '\n', '.'];
  const result: string[] = [];

  while (content.length > maxLength) {
    let splitIndex = separators
      .map(separator => content.lastIndexOf(separator, maxLength))
      .filter(index => index !== -1)
      .reduce((max, index) => Math.max(max, index), -1);

    if (splitIndex <= 0) splitIndex = maxLength;

    result.push(content.slice(0, splitIndex).trim());
    content = content.slice(splitIndex).trim();
  }

  if (content) result.push(content);
  return result;
}

// Generalized function to build embeds
async function buildEmbeds(content: string | { name: string; value: string }[], color?: number): Promise<Embed[]> {
  const isFieldContent = Array.isArray(content);
  const maxFields = 25;
  const chunks = isFieldContent ? content : splitContent(content as string);

  return Array.from({ length: Math.ceil(chunks.length / (isFieldContent ? maxFields : 1)) }, (_, i) => ({
    type: "rich",
    color,
    fields: isFieldContent
      ? (chunks as { name: string; value: string }[]).slice(i * maxFields, (i + 1) * maxFields)
      : undefined,
    description: !isFieldContent ? (chunks as string[])[i] : undefined,
  }));
}

// Function to build a single rich embed
export async function singleStringRichEmbedBuilder(content: string): Promise<Embed> {
  return { type: "rich", description: content };
}

// Function to build color embeds from a single string
export async function singleStringColorEmbedBuilder(content: string, color: number): Promise<Embed[]> {
  return buildEmbeds(content, color);
}

// Function to build system message embeds with status-based colors
export async function embedSystemMessageBuilder({
  content,
  status = 'info',
  color,
}: {
  content: string | { name: string; value: string }[];
  status?: 'error' | 'success' | 'warning' | 'info';
  color?: number;
}): Promise<Embed[]> {
  const colorMap = { error: 0xff0000, success: 0x00ff00, warning: 0xffff00, info: 0x0000ff };

  const embedColor = color ?? colorMap[status];
  return buildEmbeds(content, embedColor);
}

// Function to build embeds with multiple fields
export async function multiContentEmbedBuilder(content: { name: string; value: string }[], color: number): Promise<Embed[]> {
  return buildEmbeds(content, color);
}

// Function to build embeds with a title, description, and multiple images
export async function multiImageEmbedBuilder({
  title,
  desc,
  images,
  color = 0x3498db, // Nice blue color
}: {
  title: string;
  desc: string;
  images: string[];
  color?: number;
}): Promise<Embed[]> {
  return images.map((url) => ({
    type: "rich",
    title,
    description: desc,
    color,
    image: { url },
  }));
}

// Function to split embeds into chunks of 10
export async function splitEmbeds(embeds: Embed[]): Promise<Embed[][]> {
  const maxEmbeds = 10;
  return Array.from({ length: Math.ceil(embeds.length / maxEmbeds) }, (_, i) =>
    embeds.slice(i * maxEmbeds, (i + 1) * maxEmbeds)
  );
}