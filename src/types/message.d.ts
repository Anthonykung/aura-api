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
// @file   message.d.ts
// @author Anthony Kung <hi@anth.dev> (anth.dev)
// @date   Created on March 28 2025, 06:03 -07:00
*/

export interface Message {
  type: number;
  tts: boolean;
  timestamp: string;
  pinned: boolean;
  nonce: string;
  mentions: [];
  mention_roles: [];
  mention_channels: any;
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
  id: string;
  flags: number;
  message_reference: any;
  referenced_message: any;
  message_snapshots: any;
  embeds: [];
  edited_timestamp: null;
  content: string;
  components: [];
  channel_id: string;
  author: {
    username: string;
    public_flags: number;
    id: string;
    global_name: string;
    discriminator: string;
    clan: null;
    avatar_decoration_data: {};
    avatar: string;
  };
  attachments: [];
  guild_id: string;
}