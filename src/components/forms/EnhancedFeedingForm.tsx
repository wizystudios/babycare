import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BottleIcon, BreastIcon } from '@/components/BabyIcons';
import { Feeding, FeedingType } from '@/types/models';
import { Loader } from '@/components/ui/loader';
import { useToast } from '@/components/ui/use-toast';
import { Switch } from '@/components/ui/switch';

interface EnhancedFeedingFormProps {
  onSave: (feedingData: Omit<Feeding, 'id'>) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
  initialValues?: Partial<Feeding>;
}

export function EnhancedFeedingForm({ 
  onSave, 
  isLoading = false, 
  onCancel, 
  initialValues 
}: EnhancedFeedingFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // Basic feeding info
  const [type, setType] = useState<FeedingType>(initialValues?.type || 'bottle');
  const [startTime, setStartTime] = useState<string>(
    initialValues?.startTime 
      ? new Date(initialValues.startTime).toISOString().substring(0, 16) 
      : new Date().toISOString().substring(0, 16)
  );
  const [endTime, setEndTime] = useState<string>(
    initialValues?.endTime 
      ? new Date(initialValues.endTime).toISOString().substring(0, 16) 
      : ''
  );
  const [amount, setAmount] = useState<string>(
    initialValues?.amount ? initialValues.amount.toString() : ''
  );
  
  // Enhanced tracking
  const [formulaType, setFormulaType] = useState<string>('');
  const [bottleType, setBottleType] = useState<string>('');
  const [pausedForBurping, setPausedForBurping] = useState<boolean>(false);
  const [foodType, setFoodType] = useState<string>('');
  const [noReactions, setNoReactions] = useState<boolean>(true);
  const [reactionType, setReactionType] = useState<string>('');
  
  // Timer functionality
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [timerPauses, setTimerPauses] = useState<number>(0);
  
  // General notes
  const [note, setNote] = useState<string>(initialValues?.note || '');

  // Formula types
  const formulaTypes = [
    { label: 'Standard Cow Milk', value: 'standard-cow' },
    { label: 'Hypoallergenic', value: 'hypoallergenic' },
    { label: 'Soy-Based', value: 'soy' },
    { label: 'Specialized', value: 'specialized' },
    { label: 'Goat Milk', value: 'goat' },
    { label: 'Organic', value: 'organic' },
  ];
  
  // Food types for solids
  const foodTypes = [
    { label: t('feeding.foodType.cereal'), value: 'cereal' },
    { label: t('feeding.foodType.vegetables'), value: 'vegetables' },
    { label: t('feeding.foodType.fruit'), value: 'fruit' },
    { label: t('feeding.foodType.meat'), value: 'meat' },
    { label: t('feeding.foodType.yogurt'), value: 'yogurt' },
    { label: t('feeding.foodType.babyFood'), value: 'baby-food' },
    { label: t('feeding.foodType.fingerFood'), value: 'finger-food' },
  ];
  
  // Reaction types
  const reactionTypes = [
    { label: t('feeding.reaction.rash'), value: 'rash' },
    { label: t('feeding.reaction.vomiting'), value: 'vomiting' },
    { label: t('feeding.reaction.diarrhea'), value: 'diarrhea' },
    { label: t('feeding.reaction.fussiness'), value: 'fussiness' },
    { label: t('feeding.reaction.gasiness'), value: 'gasiness' },
  ];

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRunning]);

  const startTimer = () => {
    if (!startedAt) {
      setStartedAt(new Date());
    }
    setIsRunning(true);
  };

  const pauseTimer = () => {
    setIsRunning(false);
    setTimerPauses(prev => prev + 1);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setElapsedTime(0);
    setStartedAt(null);
    setTimerPauses(0);
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSave = () => {
    if (!startTime) {
      toast({
        title: t('feeding.timeRequired'),
        description: t('feeding.pleaseSelectStartTime'),
        variant: 'destructive',
      });
      return;
    }

    const startDateTime = new Date(startTime);
    
    let endDateTime: Date | undefined;
    let duration: number | undefined;
    
    if (endTime) {
      endDateTime = new Date(endTime);
      // Calculate duration in minutes
      duration = Math.round((endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60));
    } else if (elapsedTime > 0) {
      // Use elapsed time from timer if end time is not specified
      duration = Math.round(elapsedTime / 60);
      endDateTime = new Date(startDateTime.getTime() + elapsedTime * 1000);
    }
    
    // Build enhanced note
    let enhancedNote = note || '';
    
    if (type === 'formula' && formulaType) {
      enhancedNote = `${enhancedNote ? enhancedNote + '\n' : ''}Formula: ${formulaType}`;
    }
    
    if ((type === 'bottle' || type === 'formula') && bottleType) {
      enhancedNote = `${enhancedNote ? enhancedNote + '\n' : ''}Bottle type: ${bottleType}`;
    }
    
    if (type === 'solid' && foodType) {
      enhancedNote = `${enhancedNote ? enhancedNote + '\n' : ''}Food: ${foodType}`;
      
      if (!noReactions && reactionType) {
        enhancedNote = `${enhancedNote ? enhancedNote + '\n' : ''}Reaction: ${reactionType}`;
      }
    }
    
    if (timerPauses > 0) {
      enhancedNote = `${enhancedNote ? enhancedNote + '\n' : ''}${t('feeding.pausedForBurpingNote')}`;
    }

    const feedingData: Omit<Feeding, 'id'> = {
      babyId: initialValues?.babyId || '',
      type,
      startTime: startDateTime,
      endTime: endDateTime,
      duration,
      amount: amount ? Number(amount) : undefined,
      note: enhancedNote || undefined,
    };
    
    onSave(feedingData);
  };

  return (
    <div className="grid gap-4 py-4">
      <Tabs defaultValue="basic">
        <TabsList className="mb-4">
          <TabsTrigger value="basic">{t('feeding.basicInfo')}</TabsTrigger>
          <TabsTrigger value="enhanced">{t('feeding.enhancedTracking')}</TabsTrigger>
          {(type === 'breast-left' || type === 'breast-right') && (
            <TabsTrigger value="timer">{t('feeding.timer')}</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div className="space-y-2">
            <Label>{t('feeding.type')}</Label>
            <RadioGroup 
              value={type} 
              onValueChange={(value) => setType(value as FeedingType)}
              className="flex flex-wrap gap-3"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="breast-left" id="breast-left" />
                <Label htmlFor="breast-left" className="flex items-center">
                  <BreastIcon className="w-4 h-4 mr-1 text-baby-pink" />
                  {t('feeding.breastLeft')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="breast-right" id="breast-right" />
                <Label htmlFor="breast-right" className="flex items-center">
                  <BreastIcon className="w-4 h-4 mr-1 text-baby-pink" />
                  {t('feeding.breastRight')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bottle" id="bottle" />
                <Label htmlFor="bottle" className="flex items-center">
                  <BottleIcon className="w-4 h-4 mr-1 text-baby-blue" />
                  {t('feeding.bottle')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="formula" id="formula" />
                <Label htmlFor="formula" className="flex items-center">
                  <BottleIcon className="w-4 h-4 mr-1 text-baby-blue" />
                  {t('feeding.formula')}
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="solid" id="solid" />
                <Label htmlFor="solid" className="flex items-center">
                  {t('feeding.solid')}
                </Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="start-time">{t('feeding.startTime')}</Label>
            <Input
              id="start-time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="end-time">{t('feeding.endTime')}</Label>
            <Input
              id="end-time"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
          
          {(type === 'bottle' || type === 'formula') && (
            <div className="space-y-2">
              <Label htmlFor="amount">{t('feeding.amount')} (ml)</Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="note">{t('feeding.note')}</Label>
            <Textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder={t('feeding.notePlaceholder')}
              rows={3}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="enhanced" className="space-y-4">
          {type === 'formula' && (
            <div className="space-y-2">
              <Label htmlFor="formula-type">{t('feeding.formulaType')}</Label>
              <Select value={formulaType} onValueChange={setFormulaType}>
                <SelectTrigger id="formula-type">
                  <SelectValue placeholder={t('feeding.selectFormulaType')} />
                </SelectTrigger>
                <SelectContent>
                  {formulaTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <div className="mt-2">
                <Label htmlFor="water-ratio">{t('feeding.waterPowderRatio')}</Label>
                <Input
                  id="water-ratio"
                  placeholder="e.g., 30ml water : 1 scoop"
                  onChange={(e) => {
                    const newNote = `${note ? note + '\n' : ''}Water-powder ratio: ${e.target.value}`;
                    setNote(newNote);
                  }}
                />
              </div>
            </div>
          )}
          
          {(type === 'bottle' || type === 'formula') && (
            <div className="space-y-2">
              <Label htmlFor="bottle-type">{t('feeding.bottleType')}</Label>
              <Input
                id="bottle-type"
                placeholder="e.g., Philips Avent, Tommee Tippee"
                value={bottleType}
                onChange={(e) => setBottleType(e.target.value)}
              />
            </div>
          )}
          
          {(type === 'breast-left' || type === 'breast-right') && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="paused-burping" 
                  checked={pausedForBurping}
                  onChange={(e) => setPausedForBurping(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <Label htmlFor="paused-burping">{t('feeding.pausedForBurping')}</Label>
              </div>
            </div>
          )}
          
          {type === 'solid' && (
            <>
              <div className="space-y-2">
                <Label htmlFor="food-type">{t('feeding.foodType.label')}</Label>
                <Select value={foodType} onValueChange={setFoodType}>
                  <SelectTrigger id="food-type">
                    <SelectValue placeholder={t('feeding.foodType.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {foodTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="no-reactions">{t('feeding.noReactions')}</Label>
                  <Switch
                    id="no-reactions"
                    checked={noReactions}
                    onCheckedChange={setNoReactions}
                  />
                </div>
                
                {!noReactions && (
                  <div className="mt-2">
                    <Label htmlFor="reaction-type">{t('feeding.reaction.label')}</Label>
                    <Select value={reactionType} onValueChange={setReactionType}>
                      <SelectTrigger id="reaction-type">
                        <SelectValue placeholder={t('feeding.reaction.select')} />
                      </SelectTrigger>
                      <SelectContent>
                        {reactionTypes.map((type) => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </>
          )}
        </TabsContent>
        
        {(type === 'breast-left' || type === 'breast-right') && (
          <TabsContent value="timer" className="space-y-4">
            <div className="p-4 text-center">
              <div className="text-4xl font-bold mb-4">
                {formatTime(elapsedTime)}
              </div>
              
              <div className="space-x-2">
                {!isRunning && !startedAt && (
                  <Button 
                    variant="secondary" 
                    onClick={startTimer}
                    className="bg-green-100 text-green-800 hover:bg-green-200"
                  >
                    {t('feeding.startTimer')}
                  </Button>
                )}
                
                {isRunning && (
                  <Button variant="outline" onClick={pauseTimer}>
                    {t('feeding.pauseForBurping')}
                  </Button>
                )}
                
                {!isRunning && startedAt && (
                  <Button variant="secondary" onClick={startTimer}>
                    {t('feeding.resumeTimer')}
                  </Button>
                )}
                
                {startedAt && (
                  <Button variant="outline" onClick={resetTimer}>
                    {t('feeding.resetTimer')}
                  </Button>
                )}
              </div>
              
              {timerPauses > 0 && (
                <div className="mt-4 text-sm">
                  {t('feeding.pausedTimes')}
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </Tabs>
      
      <div className="flex justify-end gap-2 pt-4 border-t">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            {t('feeding.cancel')}
          </Button>
        )}
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader size="small" className="mr-2" /> {t('common.saving')}
            </>
          ) : (
            t('feeding.save')
          )}
        </Button>
      </div>
    </div>
  );
}
