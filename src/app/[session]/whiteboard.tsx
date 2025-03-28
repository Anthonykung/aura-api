'use client';


/**
* Copyright (c) 2025 Anthony Kung (anth.dev)
*
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
*     https://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
*
* @file   whiteboard.tsx
* @author Anthony Kung <hi@anth.dev> (anth.dev)
* @date   Created on 03/28/2025 04:18:01 UTC-07:00
*/

import { use, useEffect, useRef, useState } from 'react'
import { initializeConnection, subscribeToDrawEvents, sendDrawData, cleanupConnection } from '@/lib/azureSignalR';

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { slug } = use(params)
  const filters = use(searchParams)

  const [authorized, setAuthorized] = useState(false)
  const [inputPassword, setInputPassword] = useState('')
  const [canvasRef, setCanvasRef] = useState<HTMLCanvasElement | null>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [timer, setTimer] = useState(60)
  const [micOn, setMicOn] = useState(false)
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
  const slugRef = useRef<string>(slug)

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (!canvasRef) return

    const ctx = canvasRef.getContext('2d')
    if (!ctx) return

    ctx.lineCap = 'round'
    ctx.lineWidth = 3
    ctx.strokeStyle = '#000000'
    ctxRef.current = ctx

    initializeConnection().then(() => {
      subscribeToDrawEvents(slugRef.current, (data) => {
        if (!ctxRef.current) return
        if (data.type === 'start') {
          ctxRef.current.beginPath()
          ctxRef.current.moveTo(data.x, data.y)
        } else {
          ctxRef.current.lineTo(data.x, data.y)
          ctxRef.current.stroke()
        }
      })
    })

    return () => {
      cleanupConnection(slugRef.current)
    }
  }, [canvasRef])

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true)
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    ctxRef.current?.beginPath()
    ctxRef.current?.moveTo(x, y)
    sendDrawData(slugRef.current, { x, y, type: 'start' })
  }

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    ctxRef.current?.lineTo(x, y)
    ctxRef.current?.stroke()
    sendDrawData(slugRef.current, { x, y, type: 'draw' })
  }

  const handleMouseUp = () => {
    setIsDrawing(false)
  }

  const handlePasswordSubmit = () => {
    // TODO: Replace this logic with real validation
    if (inputPassword === 'secret123') {
      setAuthorized(true)
    }
  }

  const toggleMic = () => {
    setMicOn(!micOn)
    // implement mic start/pause logic here
  }

  if (!authorized) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <h1 className="text-3xl font-bold">Welcome to the Shared Whiteboard!</h1>
        <p className="text-xl">Enter da password to join session:3c</p>
        <input
          type="password"
          className="border rounded px-4 py-2"
          value={inputPassword}
          onChange={(e) => setInputPassword(e.target.value)}
        />
        <button
          onClick={handlePasswordSubmit}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Enter
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <h1 className="text-3xl font-bold">Live Whiteboard Session 🎨</h1>
      <canvas
        ref={(ref) => setCanvasRef(ref)}
        width={800}
        height={500}
        className="border shadow rounded"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <div className="flex items-center gap-4 mt-4">
        <button className="bg-gray-300 px-4 py-2 rounded">Prev</button>
        <button className="bg-gray-300 px-4 py-2 rounded">Next</button>
        <span className="text-lg">⏳ {timer}s</span>
        <button
          className={`px-4 py-2 rounded ${micOn ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}
          onClick={toggleMic}
        >
          {micOn ? 'Pause Mic 🎙️' : 'Start Mic 🎙️'}
        </button>
      </div>
    </div>
  )
}
