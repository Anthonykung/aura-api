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
// @file   azureSignalR.ts
// @author Anthony Kung <hi@anth.dev> (anth.dev)
// @date   Created on March 28 2025, 05:42 -07:00
*/

import { HubConnection, HubConnectionBuilder } from '@microsoft/signalr'

let connection: HubConnection | null = null

export async function initializeConnection(): Promise<void> {
  if (!connection) {
    connection = new HubConnectionBuilder()
      .withUrl(`${process.env.NEXT_PUBLIC_SIGNALR_URL}/whiteboardHub`)
      .withAutomaticReconnect()
      .build()
    await connection.start()
  }
}

export function subscribeToDrawEvents(
  room: string,
  callback: (data: { x: number; y: number; type: 'start' | 'draw' }) => void
): void {
  connection?.on(`draw-${room}`, callback)
}

export function sendDrawData(
  room: string,
  data: { x: number; y: number; type: 'start' | 'draw' }
): void {
  connection?.invoke('SendDraw', room, data).catch(console.error)
}

export function cleanupConnection(room: string): void {
  connection?.off(`draw-${room}`)
}
