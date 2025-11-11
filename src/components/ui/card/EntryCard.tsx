
import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { formatTime } from "@/lib/date-utils";

interface EntryCardProps {
  icon: React.ReactNode;
  title: string;
  time: Date;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const EntryCard: React.FC<EntryCardProps> = ({
  icon,
  title,
  time,
  children,
  className,
  onClick,
}) => {
  return (
    <Card
      className={cn(
        "overflow-hidden border-l-4 border-l-primary shadow-sm hover:shadow-md transition-all cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start p-2">
        <div className="flex-shrink-0 mr-2 p-1 bg-primary/10 rounded-full">
          {icon}
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-xs text-gray-900 dark:text-gray-100">{title}</h3>
            <div className="text-[10px] text-gray-500 dark:text-gray-400 flex flex-col items-end">
              <span>{formatTime(time)}</span>
              <TimeAgo date={time} />
            </div>
          </div>
          <div className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {children}
          </div>
        </div>
      </div>
    </Card>
  );
};
