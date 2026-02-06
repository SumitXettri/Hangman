"use client";

import React, { useRef, useEffect } from "react";
import type { Socket } from "socket.io-client";

type Props = {
  socket?: Socket;
  roomId?: string;
};

export default function DrawingBoard({ socket, roomId }: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef(false);
  const resizeRef = useRef<() => void>(() => {});

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    function resize() {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const dpr = window.devicePixelRatio || 1;
      const rect = container.getBoundingClientRect();
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        ctx.strokeStyle = "#111827";
        ctx.lineWidth = 3;
      }
    }

    resizeRef.current = resize;
    resize();

    const ro = new ResizeObserver(resize);
    const currentContainer = containerRef.current;
    if (currentContainer) ro.observe(currentContainer);

    // Listen for remote drawing events
    if (socket) {
      socket.on("draw-line", (data: { x0: number; y0: number; x1: number; y1: number }) => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.beginPath();
        ctx.moveTo(data.x0, data.y0);
        ctx.lineTo(data.x1, data.y1);
        ctx.stroke();
      });

      socket.on("clear-canvas", () => {
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        resizeRef.current();
      });
    }

    return () => {
      ro.disconnect();
      if (socket) {
        socket.off("draw-line");
        socket.off("clear-canvas");
      }
    };
  }, [socket]);

  function pointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    (e.target as Element).setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.beginPath();
    ctx.moveTo(x, y);
  }

  function pointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  function pointerUp(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    try {
      (e.target as Element).releasePointerCapture(e.pointerId);
    } catch (err) {
      /* ignore */
    }
    isDrawingRef.current = false;
    ctx.closePath();
  }

  function clear() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    resizeRef.current();
  }

  return (
    <div ref={containerRef} className="h-full w-full flex flex-col">
      <div className="flex justify-end space-x-2 mb-2">
        <button onClick={clear} className="btn btn-sm">
          Clear
        </button>
      </div>
      <div className="flex-1 border border-gray-300 rounded overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none bg-white"
          onPointerDown={pointerDown}
          onPointerMove={pointerMove}
          onPointerUp={pointerUp}
          onPointerCancel={pointerUp}
        />
      </div>
    </div>
  );
}
