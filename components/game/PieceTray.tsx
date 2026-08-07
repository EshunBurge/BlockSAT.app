"use client";

import { PieceInstance } from "@/types";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

function MiniShape({ shape, color, cellSize = 16 }: { shape: boolean[][]; color: string; cellSize?: number }) {
  return (
    <div className="flex flex-col gap-0.5">
      {shape.map((row, r) => (
        <div key={r} className="flex gap-0.5">
          {row.map((filled, c) => (
            <div
              key={c}
              style={{
                width: cellSize,
                height: cellSize,
                backgroundColor: filled ? color : "transparent",
              }}
              className={filled ? "rounded-[3px]" : ""}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

interface PieceTrayProps {
  pieces: PieceInstance[];
  draggingPieceId: string | null;
  onDragStart: (pieceId: string, e: React.PointerEvent) => void;
}

export function PieceTray({ pieces, draggingPieceId, onDragStart }: PieceTrayProps) {
  const slots = Array.from({ length: 3 }, (_, i) => pieces[i] ?? null);

  return (
    <div className="grid grid-cols-3 gap-3">
      {slots.map((piece, i) => (
        <div
          key={piece?.id ?? `empty-${i}`}
          onPointerDown={(e) => piece && onDragStart(piece.id, e)}
          className={cn(
            "flex aspect-square touch-none items-center justify-center rounded-xl border transition select-none",
            piece
              ? "cursor-grab border-white/20 bg-white/10 hover:bg-white/15 active:cursor-grabbing"
              : "border-dashed border-white/10 bg-white/[0.02]",
            piece && draggingPieceId === piece.id && "opacity-20"
          )}
        >
          {piece ? (
            <MiniShape shape={piece.shape} color={piece.color} />
          ) : (
            <div className="flex flex-col items-center gap-1 text-white/25">
              <HelpCircle className="h-5 w-5" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
