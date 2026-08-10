import { useDraggable } from "@dnd-kit/core";
import { Mic2 } from "lucide-react";

interface StageElementProps {
  id: string;
  x: number;
  y: number;
  isLayoutMode: boolean;
}

export function StageElement({ id, x, y, isLayoutMode }: StageElementProps) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    data: {
      type: "Stage",
    },
    disabled: !isLayoutMode,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        position: "absolute",
        left: x,
        top: y,
        zIndex: transform ? 50 : 10,
      }}
      className={`flex h-24 w-64 items-center justify-center rounded-lg border-2 border-dashed border-primary bg-primary/5 shadow-sm transition-shadow ${
        isLayoutMode ? "cursor-grab hover:border-solid hover:bg-primary/10 active:cursor-grabbing" : "cursor-default"
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex flex-col items-center gap-2 text-primary/70">
        <Mic2 className="h-6 w-6" />
        <span className="font-display font-medium tracking-widest text-sm">SAHNE & PİST</span>
      </div>
    </div>
  );
}
