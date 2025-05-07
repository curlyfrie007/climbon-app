"use client"
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Toggle } from '@/components/ui/toggle';
import { Badge } from '@/components/ui/badge';

export const ShadcnScorecard = ({ title = "Scorecard", initialValue = false, totalTogglesO = 30}) => {
  // Calculate total number of toggles
  const totalToggles = totalTogglesO;

  // Get rows and cols from totalToggles
  // Find optimal grid
  function findOptimalGrid(totalItems: number, maxCols: number = 7): [number, number] {
    return [(totalItems/maxCols), maxCols];
  }
  const [rows, cols] = findOptimalGrid(totalToggles, 7);
  
  
  // Create state for toggle values
  const [toggles, setToggles] = useState(Array(totalToggles).fill(initialValue));
  
  // Count active toggles
  const activeCount = toggles.filter(Boolean).length;
  
  // Handle toggle click
  const handleToggle = (index: number) => {
    const newToggles = [...toggles];
    newToggles[index] = !newToggles[index];
    setToggles(newToggles);
  };
  
  return (
    <Card className="w-fit shadow-none">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{title}</CardTitle>
        <Badge variant="secondary" className="px-3">
          {activeCount}/{totalToggles}
        </Badge>
      </CardHeader>
      <CardContent>
        <div 
          className="grid gap-2 w-min"
          style={{
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 1fr)`,
            aspectRatio: `${cols}/${rows}`
          }}
        >
          {toggles.map((isActive, index) => (
            <Toggle
              key={index}
              pressed={isActive}
              onPressedChange={() => handleToggle(index)}
              variant="outline"
              size="sm"
              className="aspect-square data-[state=on]:bg-green-500 data-[state=on]:text-white data-[state=on]:border-green-500 data-[state=on]:border-1"
            >
              {index + 1}
            </Toggle>
          ))}
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Click on items to toggle them on/off
      </CardFooter>
    </Card>
  );
};

