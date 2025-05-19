
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
        "overflow-hidden shadow-sm hover:shadow-md transition-all",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex flex-col items-center justify-center p-4 text-center h-full">
        <div className={cn("p-2 rounded-full mb-2", iconClassName || "bg-primary/10")}>
          {icon}
        </div>
        <h3 className="font-medium text-sm text-gray-500 dark:text-gray-400">
          {title}
        </h3>
        <div className="mt-1 font-semibold text-xl">
          {value}
        </div>
      </div>
    </Card>
  );
};
