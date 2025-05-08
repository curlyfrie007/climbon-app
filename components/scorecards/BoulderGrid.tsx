// components/scorecards/BoulderGrid.tsx
"use client"
import * as React from 'react'; // Import React
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Toggle } from '@/components/ui/toggle';
import { Badge } from '@/components/ui/badge';

interface BoulderGridProps {
  title?: string;
  boulderStates: boolean[]; // Array of completion states from parent
  onBoulderToggle: (index: number, newState: boolean) => void; // Callback to parent
  disabled?: boolean; // To disable toggles during updates
}

// Find optimal grid layout (adjust maxCols as needed)
function findOptimalGrid(totalItems: number, maxCols: number = 7): [number, number] {
    if (totalItems <= 0) return [0, 0];
    const cols = Math.min(maxCols, Math.ceil(Math.sqrt(totalItems * (maxCols / 5)))); // Try to keep aspect ratio reasonable
    const rows = Math.ceil(totalItems / cols);
    return [rows, cols];
}

export const BoulderGrid: React.FC<BoulderGridProps> = ({
  title = "Boulders",
  boulderStates, // Receive states from parent
  onBoulderToggle, // Receive handler from parent
  disabled = false, // Receive disabled state
}) => {
  const totalToggles = boulderStates.length; // Get total from the received array

  // Calculate grid dimensions
  const [rows, cols] = findOptimalGrid(totalToggles);

  // Calculate active count based on received states
  const activeCount = boulderStates.filter(Boolean).length;

  // Handle toggle click - call the parent's handler
  const handleToggle = (index: number, newState: boolean) => {
    onBoulderToggle(index, newState); // Pass index and the *new* state
  };

  return (
    <Card className="w-full shadow-none border-0"> {/* Make it full width by default */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-semibold">{title}</CardTitle> {/* Adjusted title size */}
        <Badge variant="secondary" className="px-3">
          {/* Display raw count */}
          {activeCount} / {totalToggles}
        </Badge>
      </CardHeader>
      <CardContent className="flex justify-center"> {/* Center the grid */}
        {totalToggles > 0 ? (
             <div
                className="grid gap-2"
                style={{
                    // Explicitly set width based on columns to prevent stretching
                    width: `calc(${cols} * (2.5rem + 0.5rem))`, // Adjust size (2.5rem) + gap (0.5rem) as needed
                    maxWidth: '100%', // Ensure it doesn't overflow container
                    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, // Use minmax for flexibility
                    // gridTemplateRows: `repeat(${rows}, auto)`, // Let rows size automatically
                    aspectRatio: `${cols}/${rows}` // Maintain aspect ratio if desired
                }}
            >
                {boulderStates.map((isActive, index) => (
                    <Toggle
                    key={index}
                    pressed={isActive}
                    // Pass the *new* state directly from the component's callback
                    onPressedChange={(newState) => handleToggle(index, newState)}
                    variant="outline"
                    size="sm" // Consistent size
                    disabled={disabled} // Use disabled prop
                    className="aspect-square data-[state=on]:bg-green-500 data-[state=on]:text-white data-[state=on]:border-green-600 data-[state=on]:shadow-inner font-semibold" // Added font-semibold
                    >
                    {/* Display Bolder Number */}
                    {index + 1}
                    </Toggle>
                ))}
            </div>
        ) : (
            <p className="text-muted-foreground">No boulders to display.</p>
        )}

      </CardContent>
      {/* Footer might be redundant if instructions are elsewhere */}
      {/* <CardFooter className="text-xs text-muted-foreground">
        Click on items to toggle them on/off
      </CardFooter> */}
    </Card>
  );
};
