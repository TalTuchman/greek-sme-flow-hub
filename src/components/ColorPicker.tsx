
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const defaultColors = [
  "#3B82F6", // blue
  "#EF4444", // red
  "#10B981", // green
  "#F59E0B", // yellow
  "#8B5CF6", // purple
  "#F97316", // orange
  "#06B6D4", // cyan
  "#84CC16", // lime
  "#EC4899", // pink
  "#6B7280", // gray
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export const ColorPicker = ({ value, onChange }: ColorPickerProps) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="w-full justify-start text-left font-normal"
        >
          <div
            className="w-4 h-4 rounded-full mr-2 border"
            style={{ backgroundColor: value }}
          />
          {value}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64">
        <div className="grid grid-cols-5 gap-2">
          {defaultColors.map((color) => (
            <button
              key={color}
              className={`w-8 h-8 rounded-full border-2 hover:scale-110 transition-transform ${
                value === color ? "border-gray-400" : "border-gray-200"
              }`}
              style={{ backgroundColor: color }}
              onClick={() => onChange(color)}
            />
          ))}
        </div>
        <div className="mt-3 pt-3 border-t">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value.toUpperCase())}
            className="w-full h-8 rounded cursor-pointer"
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};
