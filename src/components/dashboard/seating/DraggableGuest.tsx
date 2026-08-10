import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { User, Users } from "lucide-react";
import type { RsvpRow } from "@/lib/invitations.api";

interface DraggableGuestProps {
  guest: RsvpRow;
  isOverlay?: boolean;
}

export function DraggableGuest({ guest, isOverlay }: DraggableGuestProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: guest.id,
    data: {
      type: "Guest",
      guest,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging && !isOverlay) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="h-14 w-full rounded-xl border border-border/50 bg-accent/5 opacity-30"
      />
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`group flex items-center justify-between rounded-xl border bg-background p-3 shadow-sm transition-all hover:border-gold/30 hover:shadow-md cursor-grab active:cursor-grabbing ${
        isOverlay ? "border-gold shadow-lg rotate-2 scale-105" : "border-border"
      }`}
    >
      <div className="flex flex-col overflow-hidden">
        <span className="truncate text-sm font-medium text-foreground">
          {guest.guest_name}
        </span>
        {guest.party_size > 1 && (
          <span className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5">
            <Users className="w-3 h-3" /> {guest.party_size} Kişi
            {(guest.child_count ?? 0) > 0 && ` (${guest.child_count} Çocuk)`}
          </span>
        )}
      </div>
      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-foreground">
        {guest.party_size}
      </div>
    </div>
  );
}
