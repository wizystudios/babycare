
import React from "react";
import { EntryCard } from "@/components/ui/card/EntryCard";
import { BottleIcon, BreastIcon } from "@/components/BabyIcons";
import { Feeding, FeedingType } from "@/types/models";
import { formatDuration } from "@/lib/date-utils";
import { useLanguage } from "@/contexts/LanguageContext";

interface FeedingEntryProps {
  feeding: Feeding;
  onClick?: () => void;
}

export const FeedingEntry: React.FC<FeedingEntryProps> = ({ feeding, onClick }) => {
  const { t } = useLanguage();

  const getIcon = (type: FeedingType) => {
    if (type === "breast-left" || type === "breast-right") {
      return <BreastIcon className="w-5 h-5 text-baby-pink" />;
    }
    return <BottleIcon className="w-5 h-5 text-baby-blue" />;
  };

  const getTitle = (type: FeedingType) => {
    const types = {
      "breast-left": t("feeding.breastLeft"),
      "breast-right": t("feeding.breastRight"),
      "bottle": t("feeding.bottle"),
      "formula": t("feeding.formula"),
      "solid": t("feeding.solid"),
    };
    return types[type];
  };

  const getDurationText = () => {
    if (feeding.duration) {
      return formatDuration(feeding.duration);
    }
    return "";
  };

  const getAmountText = () => {
    if (feeding.amount) {
      return `${feeding.amount} ${t("feeding.unit")}`;
    }
    return "";
  };

  const details = [getDurationText(), getAmountText()]
    .filter(Boolean)
    .join(" • ");

  return (
    <EntryCard
      icon={getIcon(feeding.type)}
      title={getTitle(feeding.type)}
      time={feeding.startTime}
      onClick={onClick}
      className="border-l-baby-blue"
    >
      {details}
      {feeding.note && (
        <div className="mt-1 italic">{feeding.note}</div>
      )}
    </EntryCard>
  );
};
