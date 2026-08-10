import type { TableData } from "@/components/dashboard/seating/DroppableTable";

export function generateUShapeLayout(
  tableCount: number,
  capacity: number
): { tables: TableData[]; stage: { id: string; x: number; y: number; rotation: number; scale: number } } {
  // Define canvas bounds roughly
  const canvasWidth = 1400;
  
  // Stage is fixed at top center
  const stage = {
    id: "stage-1",
    x: canvasWidth / 2 - 120, // center (assuming stage is 240px wide)
    y: 50,
    rotation: 0,
    scale: 1,
  };

  // Dance floor bounds (keep empty)
  const danceFloor = {
    minX: canvasWidth / 2 - 250,
    maxX: canvasWidth / 2 + 250,
    minY: 50,
    maxY: 600, // Leaves room in front of stage
  };

  const tables: TableData[] = [];
  
  // Calculate a grid that avoids the dance floor
  let cols = Math.ceil(Math.sqrt(tableCount * 1.5));
  let rows = Math.ceil(tableCount / cols);
  
  // Base table visual size is about 160x160 (for round). Let's use 200px cell size.
  // If we have many tables, we scale them down.
  const idealCellSize = 200;
  let scale = 1;
  
  if (cols * idealCellSize > canvasWidth) {
    scale = canvasWidth / (cols * idealCellSize);
  }
  
  const cellSize = idealCellSize * scale;
  
  // Center the grid horizontally
  const gridStartX = (canvasWidth - cols * cellSize) / 2;
  const gridStartY = 150; // Start below the top edge
  
  let placed = 0;
  let r = 0;
  
  while (placed < tableCount && r < 50) { // arbitrary limit to prevent infinite
    for (let c = 0; c < cols; c++) {
      if (placed >= tableCount) break;
      
      const x = gridStartX + c * cellSize;
      const y = gridStartY + r * cellSize;
      
      // Check if it intersects the dance floor
      const centerX = x + cellSize / 2;
      const centerY = y + cellSize / 2;
      
      if (
        centerX >= danceFloor.minX &&
        centerX <= danceFloor.maxX &&
        centerY >= danceFloor.minY &&
        centerY <= danceFloor.maxY
      ) {
        continue; // Skip this cell (Dance Floor)
      }
      
      tables.push({
        id: `table-${Date.now()}-${placed}`,
        name: `Masa ${placed + 1}`,
        capacity: capacity,
        x: x,
        y: y,
        shape: "round",
        rotation: 0,
        scale: scale,
      });
      
      placed++;
    }
    r++;
  }
  
  return { tables, stage };
}
