
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface StoolColorInfo {
  color: string;
  name: string;
  description: string;
  isNormal: boolean;
}

export const StoolColorChart: React.FC = () => {
  const { t } = useLanguage();
  
  const stoolColors: StoolColorInfo[] = [
    { 
      color: '#000000', 
      name: t('diaper.stoolColor.black'), 
      description: t('diaper.stoolColor.blackDescription'),
      isNormal: false 
    },
    { 
      color: '#2d4b2d', 
      name: t('diaper.stoolColor.darkGreen'), 
      description: t('diaper.stoolColor.darkGreenDescription'),
      isNormal: true 
    },
    { 
      color: '#704214', 
      name: t('diaper.stoolColor.brown'), 
      description: t('diaper.stoolColor.brownDescription'),
      isNormal: true 
    },
    { 
      color: '#a67c52', 
      name: t('diaper.stoolColor.lightBrown'), 
      description: t('diaper.stoolColor.lightBrownDescription'),
      isNormal: true 
    },
    { 
      color: '#c9b037', 
      name: t('diaper.stoolColor.yellow'), 
      description: t('diaper.stoolColor.yellowDescription'),
      isNormal: true 
    },
    { 
      color: '#dac292', 
      name: t('diaper.stoolColor.tan'), 
      description: t('diaper.stoolColor.tanDescription'),
      isNormal: true 
    },
    { 
      color: '#4c9173', 
      name: t('diaper.stoolColor.seaweedGreen'), 
      description: t('diaper.stoolColor.seaweedGreenDescription'),
      isNormal: true 
    },
    { 
      color: '#c10000', 
      name: t('diaper.stoolColor.red'), 
      description: t('diaper.stoolColor.redDescription'),
      isNormal: false 
    },
    { 
      color: '#f8f8f8', 
      name: t('diaper.stoolColor.white'), 
      description: t('diaper.stoolColor.whiteDescription'),
      isNormal: false 
    },
    { 
      color: '#808080', 
      name: t('diaper.stoolColor.gray'), 
      description: t('diaper.stoolColor.grayDescription'),
      isNormal: false 
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('diaper.stoolColorChartTitle')}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm">{t('diaper.stoolColorDescription')}</p>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          <TooltipProvider>
            {stoolColors.map((stool, index) => (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <div className="cursor-pointer">
                    <div 
                      style={{ backgroundColor: stool.color, border: '1px solid #ccc' }}
                      className="h-16 rounded-md relative"
                    >
                      {!stool.isNormal && (
                        <div className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">!</span>
                        </div>
                      )}
                    </div>
                    <p className="text-sm mt-1 text-center">{stool.name}</p>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-[200px]">
                  <div>
                    <p className="font-semibold">{stool.name}</p>
                    <p className="text-sm">{stool.description}</p>
                    {!stool.isNormal && (
                      <p className="text-sm text-red-500 font-semibold mt-1">
                        {t('diaper.consultDoctor')}
                      </p>
                    )}
                  </div>
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
        
        <div className="mt-4 text-sm bg-yellow-50 p-3 rounded-md border border-yellow-200">
          <p className="font-semibold">{t('diaper.disclaimer')}</p>
          <p className="mt-1">{t('diaper.disclaimerText')}</p>
        </div>
      </CardContent>
    </Card>
  );
};
