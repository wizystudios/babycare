
import React from "react";
import { EntryCard } from "@/components/ui/card/EntryCard";
import { DiaperIcon } from "@/components/BabyIcons";
import { Diaper, DiaperType } from "@/types/models";
import { useLanguage } from "@/contexts/LanguageContext";

interface DiaperEntryProps {
  diaper: Diaper;
  onClick?: () => void;
}

export const DiaperEntry: React.FC<DiaperEntryProps> = ({ diaper, onClick }) => {
  const { t } = useLanguage();

  const getTitle = (type: DiaperType) => {
    const types = {
      "wet": t("diaper.wet"),
      "dirty": t("diaper.dirty"),
      "mixed": t("diaper.mixed"),
    };
    return types[type];
  };

  return (
    <EntryCard
      icon={<DiaperIcon className="w-5 h-5 text-baby-mint" />}
      title={getTitle(diaper.type)}
      time={diaper.time}
      onClick={onClick}
      className="border-l-baby-mint"
    >
      {diaper.note && <div className="italic">{diaper.note}</div>}
    </EntryCard>
  );
};
