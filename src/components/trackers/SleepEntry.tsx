
import React from "react";
import { EntryCard } from "@/components/ui/card/EntryCard";
import { SleepIcon } from "@/components/BabyIcons";
import { Sleep, SleepType, MoodType } from "@/types/models";
import { formatDuration } from "@/lib/date-utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface SleepEntryProps {
  sleep: Sleep;
  onClick?: () => void;
}

export const SleepEntry: React.FC<SleepEntryProps> = ({ sleep, onClick }) => {
  const { t } = useLanguage();

  const getTitle = (type: SleepType) => {
    const types = {
      "nap": t("sleep.nap"),
      "night": t("sleep.night"),
    };
    return types[type];
  };

  const getMoodText = (mood?: MoodType) => {
    if (!mood) return "";
    
    const moods = {
      "happy": t("sleep.moods.happy"),
      "fussy": t("sleep.moods.fussy"),
      "calm": t("sleep.moods.calm"),
      "crying": t("sleep.moods.crying"),
    };
    return moods[mood];
  };

  const details = [
    sleep.duration ? formatDuration(sleep.duration) : "",
    sleep.location,
    sleep.mood ? getMoodText(sleep.mood) : "",
  ].filter(Boolean).join(" • ");

  return (
    <EntryCard
      icon={<SleepIcon className="w-5 h-5 text-baby-lavender" />}
      title={getTitle(sleep.type)}
      time={sleep.startTime}
      onClick={onClick}
      className="border-l-baby-lavender"
    >
      <div>{details}</div>
      {sleep.note && <div className="mt-1 italic">{sleep.note}</div>}
    </EntryCard>
  );
};
