import { useState, useEffect, useMemo } from "react";
import { Plus, Users, Loader2, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { InvitationRow, RsvpRow } from "@/lib/invitations.api";
import { getRsvpResults } from "@/lib/rsvp.functions";
import { supabase } from "@/integrations/supabase/client";
import { saveSeatingConfig } from "@/lib/seating.functions";

import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { DraggableGuest } from "./seating/DraggableGuest";
import { DroppableTable, type TableData } from "./seating/DroppableTable";
import { StageElement } from "./seating/StageElement";
import { RotateCw, ZoomIn, ZoomOut, X } from "lucide-react";

type StageData = {
  id: string;
  x: number;
  y: number;
  rotation?: number;
  scale?: number;
};

export function DashboardSeating({ invitation }: { invitation: InvitationRow }) {
  const [rsvps, setRsvps] = useState<RsvpRow[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State
  const [tables, setTables] = useState<TableData[]>([]);
  const [assignments, setAssignments] = useState<Record<string, string | null>>({});
  const [stage, setStage] = useState<StageData>({ id: "stage-1", x: 100, y: 100, rotation: 0, scale: 1 });
  const [isLayoutMode, setIsLayoutMode] = useState(false);
  const [selectedElement, setSelectedElement] = useState<{ id: string, type: "table" | "stage" } | null>(null);
  
  // Dnd State
  const [activeGuest, setActiveGuest] = useState<RsvpRow | null>(null);

  useEffect(() => {
    // Load RSVPs
    getRsvpResults({ data: { invitationId: invitation.id } })
      .then((result) => {
        const comingGuests = (result.rsvps as RsvpRow[]).filter((r) => r.status === "yes");
        setRsvps(comingGuests);
        
        // Parse existing seating config from admin_notes
        try {
          if (invitation.admin_notes) {
            const config = JSON.parse(invitation.admin_notes);
            if (config?.seating) {
              setTables(config.seating.tables || []);
              if (config.seating.stage) {
                setStage(config.seating.stage);
              }
              
              // Validate assignments: Ensure all IDs exist in current RSVPs
              const validAssignments: Record<string, string | null> = {};
              const existingAssignments = config.seating.assignments || {};
              comingGuests.forEach(guest => {
                validAssignments[guest.id] = existingAssignments[guest.id] || null;
              });
              setAssignments(validAssignments);
            } else {
              initializeAssignments(comingGuests);
            }
          } else {
            initializeAssignments(comingGuests);
          }
        } catch (e) {
          console.error("Error parsing seating config", e);
          initializeAssignments(comingGuests);
        }
      })
      .catch((e) => {
        console.error(e);
        toast.error("Misafir listesi yüklenemedi.");
      })
      .finally(() => setLoading(false));
  }, [invitation.id, invitation.admin_notes]);

  const initializeAssignments = (guests: RsvpRow[]) => {
    const initial: Record<string, string | null> = {};
    guests.forEach(g => {
      initial[g.id] = null;
    });
    setAssignments(initial);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveSeatingConfig({
        data: {
          invitationId: invitation.id,
          config: {
            tables,
            assignments,
            stage
          }
        }
      });

      toast.success("Oturma planı başarıyla kaydedildi.");
    } catch (e) {
      console.error(e);
      toast.error("Oturma planı kaydedilirken bir hata oluştu.");
    } finally {
      setSaving(false);
    }
  };

  // Drag and Drop Logic
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const id = active.id as string;
    const guest = rsvps?.find(g => g.id === id);
    if (guest) setActiveGuest(guest);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    
    // Find containers
    const activeId = active.id as string;
    const overId = over.id as string;
    
    // If dropping over a table directly or over a guest inside a table
    const overType = over.data.current?.type;
    let targetTableId: string | null = null;
    
    if (overType === "Table") {
      targetTableId = overId;
    } else if (overType === "Guest") {
      targetTableId = assignments[overId] || null;
    } else if (overId === "unassigned-pool") {
      targetTableId = null;
    }

    if (targetTableId !== undefined) {
      setAssignments(prev => {
        if (prev[activeId] === targetTableId) return prev;
        return { ...prev, [activeId]: targetTableId };
      });
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveGuest(null);
    const { active, delta } = event;
    const type = active.data.current?.type;

    if (type === "TableLayout") {
      const tableId = active.data.current?.table?.id;
      if (tableId) {
        setTables((prev) =>
          prev.map((t) => {
            if (t.id === tableId) {
              return {
                ...t,
                x: Math.max(0, (t.x || 0) + delta.x),
                y: Math.max(0, (t.y || 0) + delta.y),
              };
            }
            return t;
          })
        );
      }
    } else if (type === "Stage") {
      setStage((prev) => ({
        ...prev,
        x: Math.max(0, prev.x + delta.x),
        y: Math.max(0, prev.y + delta.y),
      }));
    }
  };

  const handleUpdateElement = (action: "rotate" | "zoomIn" | "zoomOut") => {
    if (!selectedElement) return;

    if (selectedElement.type === "table") {
      setTables(prev => prev.map(t => {
        if (t.id !== selectedElement.id) return t;
        const currentRot = t.rotation || 0;
        const currentScale = t.scale || 1;
        
        if (action === "rotate") return { ...t, rotation: (currentRot + 45) % 360 };
        if (action === "zoomIn") return { ...t, scale: Math.min(3, currentScale + 0.1) };
        if (action === "zoomOut") return { ...t, scale: Math.max(0.5, currentScale - 0.1) };
        return t;
      }));
    } else if (selectedElement.type === "stage") {
      setStage(prev => {
        const currentRot = prev.rotation || 0;
        const currentScale = prev.scale || 1;
        
        if (action === "rotate") return { ...prev, rotation: (currentRot + 45) % 360 };
        if (action === "zoomIn") return { ...prev, scale: Math.min(3, currentScale + 0.1) };
        if (action === "zoomOut") return { ...prev, scale: Math.max(0.5, currentScale - 0.1) };
        return prev;
      });
    }
  };

  // Derived state
  const unassignedGuests = useMemo(() => {
    return rsvps?.filter(g => !assignments[g.id]) || [];
  }, [rsvps, assignments]);

  const getTableGuests = (tableId: string) => {
    return rsvps?.filter(g => assignments[g.id] === tableId) || [];
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-medium text-foreground">Oturma Planı</h2>
          <p className="text-sm text-muted-foreground mt-1">
            "Evet" yanıtı veren misafirlerinizi masalara sürükleyerek yerleştirin.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-xl bg-accent p-1">
            <button
              onClick={() => {
                setIsLayoutMode(false);
                setSelectedElement(null);
              }}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                !isLayoutMode ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Yerleştirme
            </button>
            <button
              onClick={() => setIsLayoutMode(true)}
              className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-colors ${
                isLayoutMode ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Kroki Düzeni
            </button>
          </div>
          
          <button
            onClick={() => {
              const newTable: TableData = {
                id: `table-${Date.now()}`,
                name: `Masa ${tables.length + 1}`,
                capacity: 10,
                x: 100,
                y: 100,
                shape: "round"
              };
              setTables([...tables, newTable]);
              setIsLayoutMode(true); // Switch to layout mode automatically to place it
            }}
            className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent/80"
          >
            <Plus className="h-4 w-4" />
            Masa Ekle
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-gold px-4 py-2.5 text-sm font-medium text-black transition-colors hover:bg-gold/90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Kaydet
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid h-[calc(100vh-220px)] grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Unassigned Pool */}
          <div className="lg:col-span-1 flex flex-col rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="border-b border-border bg-accent/5 px-5 py-4">
              <h3 className="font-medium text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-gold" />
                Bekleyen Misafirler
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Yerleştirilmeyen {unassignedGuests.length} kayıt
              </p>
            </div>
            
            <DroppableTable
              table={{ id: "unassigned-pool", name: "Bekleyenler", capacity: 999 }}
              guests={unassignedGuests}
            />
          </div>

          {/* Tables Grid / Canvas */}
          <div className={`lg:col-span-3 ${isLayoutMode ? "relative bg-accent/5 overflow-hidden rounded-2xl border border-border" : "overflow-y-auto"}`}>
            {tables.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-border p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
                <h3 className="text-lg font-medium text-foreground">Henüz masa oluşturmadınız</h3>
                <p className="text-sm text-muted-foreground mt-2 mb-6 max-w-sm">
                  Misafirlerinizi yerleştirmeye başlamak için yeni bir masa oluşturun.
                </p>
                <button
                  onClick={() => {
                    setTables([{ id: `table-${Date.now()}`, name: "Masa 1", capacity: 10, x: 100, y: 100, shape: "round" }]);
                    setIsLayoutMode(true);
                  }}
                  className="flex items-center gap-2 rounded-xl bg-accent px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent/80"
                >
                  <Plus className="h-4 w-4" /> İlk Masayı Oluştur
                </button>
              </div>
            ) : (
              <div className={isLayoutMode ? "absolute inset-0 min-h-[800px] min-w-[800px]" : "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pb-12"}>
                
                {isLayoutMode && selectedElement && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-background/95 backdrop-blur shadow-lg border border-border rounded-full px-4 py-2">
                    <span className="text-sm font-medium mr-2 text-foreground">
                      {selectedElement.type === "stage" ? "Sahne" : tables.find(t => t.id === selectedElement.id)?.name}
                    </span>
                    <button onClick={() => handleUpdateElement("zoomOut")} className="p-1.5 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground" title="Küçült">
                      <ZoomOut className="h-4 w-4" />
                    </button>
                    <button onClick={() => handleUpdateElement("zoomIn")} className="p-1.5 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground" title="Büyüt">
                      <ZoomIn className="h-4 w-4" />
                    </button>
                    <div className="w-px h-4 bg-border mx-1"></div>
                    <button onClick={() => handleUpdateElement("rotate")} className="p-1.5 hover:bg-accent rounded-full transition-colors text-muted-foreground hover:text-foreground" title="Döndür">
                      <RotateCw className="h-4 w-4" />
                    </button>
                    <div className="w-px h-4 bg-border mx-1"></div>
                    <button onClick={() => setSelectedElement(null)} className="p-1.5 hover:bg-rose/10 rounded-full transition-colors text-muted-foreground hover:text-rose" title="Kapat">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                <div 
                  onClick={() => isLayoutMode && setSelectedElement({ id: stage.id, type: "stage" })}
                  className={isLayoutMode && selectedElement?.id === stage.id ? "ring-2 ring-gold rounded-lg ring-offset-4 ring-offset-background/50 relative z-40 transition-all duration-200" : ""}
                >
                  <StageElement id={stage.id} x={stage.x} y={stage.y} rotation={stage.rotation} scale={stage.scale} isLayoutMode={isLayoutMode} />
                </div>
                
                {tables.map(table => (
                  <div 
                    key={table.id} 
                    className={isLayoutMode ? (selectedElement?.id === table.id ? "ring-2 ring-gold rounded-2xl ring-offset-4 ring-offset-background/50 relative z-40 transition-all duration-200" : "") : "h-[400px]"}
                    onClick={(e) => {
                      if (isLayoutMode) {
                        e.stopPropagation();
                        setSelectedElement({ id: table.id, type: "table" });
                      }
                    }}
                  >
                    <DroppableTable
                      table={table}
                      guests={getTableGuests(table.id)}
                      isLayoutMode={isLayoutMode}
                      onUpdateName={(id, name) => setTables(tables.map(t => t.id === id ? { ...t, name } : t))}
                      onUpdateCapacity={(id, capacity) => setTables(tables.map(t => t.id === id ? { ...t, capacity } : t))}
                      onUpdateShape={(id, shape) => setTables(tables.map(t => t.id === id ? { ...t, shape } : t))}
                      onDelete={(id) => {
                        if (confirm("Bu masayı silmek istediğinize emin misiniz? Masadaki misafirler bekleyenlere dönecektir.")) {
                          setTables(tables.filter(t => t.id !== id));
                          setAssignments(prev => {
                            const next = { ...prev };
                            Object.keys(next).forEach(guestId => {
                              if (next[guestId] === id) next[guestId] = null;
                            });
                            return next;
                          });
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: "0.5" } } }) }}>
          {activeGuest ? <DraggableGuest guest={activeGuest} isOverlay /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
