
import React from "react";
import { cn } from "@/lib/utils";

interface Block {
  time: string;
  type: "feeding" | "sleep" | "diaper" | "none";
}

interface ActivityBarProps {
  blocks: Block[];
  className?: string;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({
  blocks,
  className,
}) => {
  return (
    <div
      className={cn(
        "w-full h-6 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex",
        className
      )}
    >
      {blocks.map((block, index) => (
        <div
          key={index}
          className={cn(
            "h-full flex-1",
            block.type === "feeding" && "bg-baby-blue",
            block.type === "sleep" && "bg-baby-lavender",
            block.type === "diaper" && "bg-baby-mint",
            block.type === "none" && "bg-transparent"
          )}
          title={`${block.time}: ${block.type}`}
        />
      ))}
    </div>
  );
};
