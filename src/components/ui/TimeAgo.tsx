
import React from "react";
import { formatTimeAgo } from "@/lib/date-utils";

interface TimeAgoProps {
  date: Date;
  className?: string;
}

export const TimeAgo: React.FC<TimeAgoProps> = ({ date, className }) => {
  const [timeAgo, setTimeAgo] = React.useState<string>(formatTimeAgo(date));

  React.useEffect(() => {
    const interval = setInterval(() => {
      setTimeAgo(formatTimeAgo(date));
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [date]);

  return <span className={className}>{timeAgo}</span>;
};
