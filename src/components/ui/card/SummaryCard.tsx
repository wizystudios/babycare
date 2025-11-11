
import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface SummaryCardProps {
  icon: React.ReactNode;
  title: string;
  value: string | number | React.ReactNode;
  className?: string;
  iconClassName?: string;
  onClick?: () => void;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({
  icon,
  title,
  value,
  className,
  iconClassName,
  onClick,
}) => {
  return (
    <Card
      className={cn(
        "overflow-hidden shadow-sm transition-all",
        onClick && "cursor-pointer hover:shadow-md",
        className
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center p-2 text-center h-full">
        <div className="mb-0.5">
          {icon}
        </div>
        <h3 className="font-medium text-[10px] text-muted-foreground">
          {title}
        </h3>
        <div className="mt-0.5 font-bold text-xs">
          {value}
        </div>
      </div>
    </Card>
  );
};
