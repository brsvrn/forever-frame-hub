import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Trash2, Users } from "lucide-react";
import type { RsvpRow } from "@/lib/invitations.api";
import { DraggableGuest } from "./DraggableGuest";
import { useMemo } from "react";

export interface TableData {
  id: string;
  name: string;
  capacity: number;
}

interface DroppableTableProps {
  table: TableData;
  guests: RsvpRow[];
  onDelete?: (id: string) => void;
  onUpdateName?: (id: string, name: string) => void;
  onUpdateCapacity?: (id: string, capacity: number) => void;
}

export function DroppableTable({
  table,
  guests,
  onDelete,
  onUpdateName,
  onUpdateCapacity,
}: DroppableTableProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: table.id,
    data: {
      type: "Table",
      table,
    },
  });

  const guestIds = useMemo(() => guests.map((g) => g.id), [guests]);
  const currentCapacity = guests.reduce((sum, g) => sum + g.party_size, 0);
  const isOverCapacity = currentCapacity > table.capacity;

  return (
    <div
      className={`flex h-full flex-col overflow-hidden rounded-2xl border transition-colors ${
        isOver ? "border-gold bg-gold/5" : "border-border bg-card"
      }`}
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
        ref={setNodeRef}
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
