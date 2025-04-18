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
// @file   guild_member.d.ts
// @author Anthony Kung <hi@anth.dev> (anth.dev)
// @date   Created on March 28 2025, 06:03 -07:00
*/

export interface User {
  username: string;
  public_flags: number;
  primary_guild: string | null;
  id: string;
  global_name: string | null;
  discriminator: string;
  clan: string | null;
  bot: boolean;
  avatar_decoration_data: string | null;
  avatar: string | null;
}

export interface MemberData {
  user: User;
  unusual_dm_activity_until: string | null;
  roles: string[];
  premium_since: string | null;
  pending: boolean;
  nick: string | null;
  joined_at: string;
  guild_id: string;
  flags: number;
  communication_disabled_until: string | null;
  banner: string | null;
  avatar: string | null;
}
