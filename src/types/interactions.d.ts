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
// @file   interactions.d.ts
// @author Anthony Kung <hi@anth.dev> (anth.dev)
// @date   Created on March 28 2025, 06:03 -07:00
*/


export interface InteractionData {
  version: number;
  type: number;
  token: string;
  member: {
    user?: any; // Replace 'object' with a specific type if you know the structure of the user object.
    unusual_dm_activity_until: string | null;
    roles: string[];
    premium_since: string | null;
    permissions: string;
    pending: boolean;
    nick: string | null;
    mute: boolean;
    joined_at: string;
    flags: number;
    deaf: boolean;
    communication_disabled_until: string | null;
    banner: string | null;
    avatar: string | null;
  };
  locale: string;
  id: string;
  guild_locale: string;
  guild_id: string;
  guild: {
    locale: string;
    id: string;
    features: string[];
  };
  entitlements: unknown[]; // Adjust type if needed based on data structure.
  entitlement_sku_ids: string[];
  data: {
    type: number;
    name: string;
    id: string;
  };
  context: number;
  channel_id: string;
  channel: {
    type: number;
    topic: string | null;
    rate_limit_per_user: number;
    position: number;
    permissions: string;
    parent_id: string | null;
    nsfw: boolean;
    name: string;
    last_message_id: string;
    id: string;
    guild_id: string;
    flags: number;
  };
  authorizing_integration_owners: Record<string, string>;
  application_id: string;
  app_permissions: string;
}

export interface Interaction {
  webhook_id: string;
  type: number;
  tts: boolean;
  timestamp: string;
  position: number;
  pinned: boolean;
  nonce: string;
  mentions: [];
  mention_roles: [];
  mention_everyone: boolean;
  member: {
    roles: [];
    premium_since: null;
    pending: boolean;
    nick: null;
    mute: boolean;
    joined_at: string;
    flags: number;
    deaf: boolean;
    communication_disabled_until: null;
    banner: null;
    avatar: null;
  };
  interaction_metadata: {
    user: {};
    type: InteractionType;
    name: string;
    id: string;
    authorizing_integration_owners: {};
  };
  interaction: {
    user: {};
    type: InteractionType;
    name: string;
    member: {};
    id: string;
  };
  id: string;
  flags: number;
  embeds: [];
  edited_timestamp: null;
  content: string;
  components: [];
  channel_id: string;
  author: {
    username: string;
    public_flags: number;
    id: string;
    global_name: string | null;
    discriminator: string;
    clan: null;
    bot: boolean;
    avatar_decoration_data: {} | null;
    avatar: string;
  };
  attachments: [];
  application_id: string;
  guild_id: string;
}

export enum InteractionType {
  PING = 1,
  APPLICATION_COMMAND = 2,
  MESSAGE_COMPONENT = 3,
  APPLICATION_COMMAND_AUTOCOMPLETE = 4,
  MODAL_SUBMIT = 5,
}

export enum InteractionContextType {
  GUILD = 0,
  BOT_DM = 1,
  PRIVATE_CHANNEL = 2,
}

interface InteractionRequest {
  app_permissions: string;
  application_id: string;
  attachment_size_limit: number;
  authorizing_integration_owners: Record<string, string>;
  channel: {
    flags: number;
    guild_id: string;
    id: string;
    last_message_id: string;
    name: string;
    nsfw: boolean;
    parent_id: string;
    permissions: string;
    position: number;
    rate_limit_per_user: number;
    topic: string | null;
    type: number;
  };
  channel_id: string;
  context: number;
  data: {
    id: string;
    name: string;
    type: number;
  };
  entitlement_sku_ids: string[];
  entitlements: {
    id: string;
    sku_id: string;
    application_id: string;
    user_id: string;
    promotion_id: string | null;
    type: number;
    deleted: boolean;
    gift_code_flags: number;
    consumed: boolean;
    starts_at: string;
    ends_at: string;
    guild_id: string;
    subscription_id: string;
  }[];
  guild: {
    features: (
      | "ANIMATED_BANNER"
      | "ANIMATED_ICON"
      | "APPLICATION_COMMAND_PERMISSIONS_V2"
      | "AUTO_MODERATION"
      | "BANNER"
      | "COMMUNITY"
      | "CREATOR_MONETIZABLE_PROVISIONAL"
      | "CREATOR_STORE_PAGE"
      | "DEVELOPER_SUPPORT_SERVER"
      | "DISCOVERABLE"
      | "FEATURABLE"
      | "INVITES_DISABLED"
      | "INVITE_SPLASH"
      | "MEMBER_VERIFICATION_GATE_ENABLED"
      | "MORE_SOUNDBOARD"
      | "MORE_STICKERS"
      | "NEWS"
      | "PARTNERED"
      | "PREVIEW_ENABLED"
      | "RAID_ALERTS_DISABLED"
      | "ROLE_ICONS"
      | "ROLE_SUBSCRIPTIONS_AVAILABLE_FOR_PURCHASE"
      | "ROLE_SUBSCRIPTIONS_ENABLED"
      | "SOUNDBOARD"
      | "TICKETED_EVENTS_ENABLED"
      | "VANITY_URL"
      | "VERIFIED"
      | "VIP_REGIONS"
      | "WELCOME_SCREEN_ENABLED"
    )[];
    id: string;
    locale: string;
  };
  guild_id: string;
  guild_locale: string;
  id: string;
  locale: string;
  member: {
    avatar: string | null;
    banner: string | null;
    communication_disabled_until: string | null;
    deaf: boolean;
    flags: number;
    joined_at: string;
    mute: boolean;
    nick: string | null;
    pending: boolean;
    permissions: string;
    premium_since: string | null;
    roles: string[];
    unusual_dm_activity_until: string | null;
    user: {
      avatar: string;
      avatar_decoration_data: {
        sku_id: string;
        asset: string;
      } | null;
      clan: string | null;
      collectibles: any | null; // No idea what this is
      discriminator: string;
      global_name: string;
      id: string;
      primary_guild: string | null;
      public_flags: number;
      username: string;
    };
  };
  token: string;
  type: number;
  version: number;
}

export interface SlashCommand {
  type: number;
  token: string;
  member: {
    user: {
      id: string;
      username: string;
      avatar: string;
      discriminator: string;
      public_flags: number;
    };
    roles: string[];
    premium_since: string | null;
    permissions: string;
    pending: boolean;
    nick: string | null;
    mute: boolean;
    joined_at: string;
    is_pending: boolean;
    deaf: boolean;
  };
  id: string;
  guild_id: string;
  app_permissions: string;
  guild_locale: string;
  locale: string;
  data: {
    options: {
      type: number;
      name: string;
      value: string;
    }[];
    type: number;
    name: string;
    id: string;
  };
  channel_id: string;
}
