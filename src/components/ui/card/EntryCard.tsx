
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
      <div className="flex items-start p-4">
        <div className="flex-shrink-0 mr-3 p-2 bg-primary/10 rounded-full">
          {icon}
        </div>
        <div className="flex-grow">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex flex-col items-end">
              <span>{formatTime(time)}</span>
              <TimeAgo date={time} />
            </div>
          </div>
          <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {children}
          </div>
        </div>
      </div>
    </Card>
  );
};
