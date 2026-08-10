import { useDroppable, useDraggable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Trash2, Users, GripHorizontal } from "lucide-react";
import type { RsvpRow } from "@/lib/invitations.api";
import { DraggableGuest } from "./DraggableGuest";
import { useMemo } from "react";

export interface TableData {
  id: string;
  name: string;
  capacity: number;
  x?: number;
  y?: number;
  shape?: "round" | "rectangle";
  rotation?: number;
  scale?: number;
}

interface DroppableTableProps {
  table: TableData;
  guests: RsvpRow[];
  onDelete?: (id: string) => void;
  onUpdateName?: (id: string, name: string) => void;
  onUpdateCapacity?: (id: string, capacity: number) => void;
  onUpdateShape?: (id: string, shape: "round" | "rectangle") => void;
  isLayoutMode?: boolean;
}

export function DroppableTable({
  table,
  guests,
  onDelete,
  onUpdateName,
  onUpdateCapacity,
  onUpdateShape,
  isLayoutMode = false,
}: DroppableTableProps) {
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: table.id,
    data: {
      type: "Table",
      table,
    },
    disabled: isLayoutMode,
  });

  const {
    attributes,
    listeners,
    setNodeRef: setDraggableRef,
    transform,
  } = useDraggable({
    id: `draggable-table-${table.id}`,
    data: {
      type: "TableLayout",
      table,
    },
    disabled: !isLayoutMode,
  });

  const guestIds = useMemo(() => guests.map((g) => g.id), [guests]);
  const currentCapacity = guests.reduce((sum, g) => sum + g.party_size, 0);
  const isOverCapacity = currentCapacity > table.capacity;
  
  const isRound = table.shape === "round";

  const dragStyle = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${table.scale || 1}) rotate(${table.rotation || 0}deg)`,
        zIndex: 50,
      }
    : {
        transform: `scale(${table.scale || 1}) rotate(${table.rotation || 0}deg)`,
      };

  if (isLayoutMode) {
    return (
      <div
        ref={setDraggableRef}
        style={{
          ...dragStyle,
          position: "absolute",
          left: table.x || 0,
          top: table.y || 0,
          transformOrigin: "center center",
        }}
        className={`flex flex-col items-center justify-center border-2 border-primary/20 bg-background shadow-md transition-shadow hover:shadow-lg active:cursor-grabbing cursor-grab ${
          isRound ? "h-40 w-40 rounded-full" : "h-32 w-56 rounded-xl"
        }`}
        {...attributes}
        {...listeners}
      >
        <GripHorizontal className="mb-2 h-5 w-5 text-muted-foreground/50" />
        <span className="font-display font-medium text-foreground text-center px-2">{table.name}</span>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <Users className="h-3 w-3" />
          <span>{table.capacity} Kişilik</span>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setDroppableRef}
      className={`flex h-full flex-col overflow-hidden rounded-2xl border transition-colors ${
        isOver ? "border-gold bg-gold/5" : "border-border bg-card"
      } ${isRound ? "border-t-4 border-t-gold/50" : ""}`}
    >
      <div className="flex items-center justify-between border-b border-border bg-accent/5 px-4 py-3">
        <div className="flex-1 mr-4">
          <input
            type="text"
            value={table.name}
            onChange={(e) => onUpdateName?.(table.id, e.target.value)}
            className="w-full bg-transparent font-display text-lg font-medium outline-none placeholder:text-muted-foreground/50 text-foreground"
            placeholder="Masa Adı..."
          />
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
              isOverCapacity ? "bg-rose/10 text-rose" : "bg-accent/10 text-foreground"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>
              {currentCapacity} /{" "}
              <input
                type="number"
                min="1"
                max="50"
                value={table.capacity}
                onChange={(e) => onUpdateCapacity?.(table.id, parseInt(e.target.value) || 10)}
                className="w-8 bg-transparent text-center outline-none"
              />
            </span>
          </div>
          {onUpdateShape && (
            <button
              onClick={() => onUpdateShape(table.id, isRound ? "rectangle" : "round")}
              className="text-muted-foreground transition-colors hover:text-gold text-xs font-medium bg-accent/10 rounded px-2 py-1"
              title="Şekli Değiştir"
            >
              {isRound ? "Yuvarlak" : "Dikdörtgen"}
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => onDelete(table.id)}
              className="text-muted-foreground transition-colors hover:text-rose"
              title="Masayı Sil"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div
        className="flex-1 overflow-y-auto p-3"
      >
        <SortableContext items={guestIds} strategy={verticalListSortingStrategy}>
          <div className="flex min-h-[150px] flex-col gap-2">
            {guests.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-sm text-muted-foreground/50 p-4">
                Misafirleri buraya sürükleyin
              </div>
            ) : (
              guests.map((guest) => <DraggableGuest key={guest.id} guest={guest} />)
            )}
          </div>
        </SortableContext>
      </div>
    </div>
  );
}
