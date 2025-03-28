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