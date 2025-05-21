
import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Diaper, DiaperType } from '@/types/models';
import { Slider } from '@/components/ui/slider';
import { Loader } from '@/components/ui/loader';

interface EnhancedDiaperFormProps {
  onSave: (diaperData: Omit<Diaper, 'id'>) => Promise<void>;
  isLoading?: boolean;
  onCancel?: () => void;
  initialValues?: Partial<Diaper>;
}

export function EnhancedDiaperForm({ 
  onSave, 
  isLoading = false, 
  onCancel, 
  initialValues 
}: EnhancedDiaperFormProps) {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  // Basic diaper info
  const [type, setType] = useState<DiaperType>(initialValues?.type || 'wet');
  const [time, setTime] = useState<string>(
    initialValues?.time 
      ? new Date(initialValues.time).toISOString().substring(0, 16) 
      : new Date().toISOString().substring(0, 16)
  );
  
  // Enhanced tracking
  const [hasRash, setHasRash] = useState<boolean>(initialValues?.note?.includes('Rash:') || false);
  const [rashSeverity, setRashSeverity] = useState<number>(1);
  const [stoolColor, setStoolColor] = useState<string>('');
  const [stoolConsistency, setStoolConsistency] = useState<string>('');
  
  // General notes
  const [generalNote, setGeneralNote] = useState<string>(
    initialValues?.note 
      ? initialValues.note.replace(/Rash: .+?(?=\n|$)/, '').trim()
      : ''
  );

  // Extract rash severity from note if it exists
  React.useEffect(() => {
    if (initialValues?.note && initialValues.note.includes('Rash:')) {
      const rashMatch = initialValues.note.match(/Rash: (\d+)\/5/);
      if (rashMatch && rashMatch[1]) {
        setRashSeverity(parseInt(rashMatch[1]));
      }
    }
  }, [initialValues?.note]);

  const handleSave = () => {
    if (!time) {
      toast({
        title: t('diaper.timeRequired'),
        description: t('diaper.pleaseSelectTime'),
        variant: 'destructive',
      });
      return;
    }

    let noteContent = generalNote || '';
    
    // Add enhanced tracking info to note
    if (hasRash) {
      noteContent = `${noteContent ? noteContent + '\n' : ''}Rash: ${rashSeverity}/5`;
    }
    
    if (type === 'dirty' || type === 'mixed') {
      if (stoolColor) {
        noteContent = `${noteContent ? noteContent + '\n' : ''}Color: ${stoolColor}`;
      }
      if (stoolConsistency) {
        noteContent = `${noteContent ? noteContent + '\n' : ''}Consistency: ${stoolConsistency}`;
      }
    }
    
    // Prepare diaper data object
    const diaperData: Omit<Diaper, 'id'> = {
      type,
      time: new Date(time),
      note: noteContent || undefined,
      babyId: initialValues?.babyId || '',
    };
    
    onSave(diaperData);
  };
  
  const stoolColors = [
    { label: t('diaper.stoolColor.black'), value: 'black' },
    { label: t('diaper.stoolColor.darkGreen'), value: 'dark-green' },
    { label: t('diaper.stoolColor.brown'), value: 'brown' },
    { label: t('diaper.stoolColor.lightBrown'), value: 'light-brown' },
    { label: t('diaper.stoolColor.yellow'), value: 'yellow' },
    { label: t('diaper.stoolColor.tan'), value: 'tan' },
    { label: t('diaper.stoolColor.seaweedGreen'), value: 'seaweed-green' },
    { label: t('diaper.stoolColor.red'), value: 'red' },
    { label: t('diaper.stoolColor.white'), value: 'white' },
    { label: t('diaper.stoolColor.gray'), value: 'gray' },
  ];

  const stoolConsistencies = [
    { label: t('diaper.stoolConsistency.watery'), value: 'watery' },
    { label: t('diaper.stoolConsistency.loose'), value: 'loose' },
    { label: t('diaper.stoolConsistency.soft'), value: 'soft' },
    { label: t('diaper.stoolConsistency.formed'), value: 'formed' },
    { label: t('diaper.stoolConsistency.hard'), value: 'hard' },
    { label: t('diaper.stoolConsistency.seedy'), value: 'seedy' },
    { label: t('diaper.stoolConsistency.mucousy'), value: 'mucousy' },
  ];

  return (
    <div className="grid gap-4 py-4">
      <Tabs defaultValue="basic">
        <TabsList className="mb-4">
          <TabsTrigger value="basic">{t('diaper.basicInfo')}</TabsTrigger>
          <TabsTrigger value="enhanced">{t('diaper.enhancedTracking')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="basic" className="space-y-4">
          <div className="space-y-2">
            <Label>{t('diaper.type')}</Label>
            <RadioGroup 
              value={type} 
              onValueChange={(value) => setType(value as DiaperType)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="wet" id="wet" />
                <Label htmlFor="wet">{t('diaper.wet')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dirty" id="dirty" />
                <Label htmlFor="dirty">{t('diaper.dirty')}</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="mixed" id="mixed" />
                <Label htmlFor="mixed">{t('diaper.mixed')}</Label>
              </div>
            </RadioGroup>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="time">{t('diaper.time')}</Label>
            <Input
              id="time"
              type="datetime-local"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="note">{t('diaper.note')}</Label>
            <Textarea
              id="note"
              value={generalNote}
              onChange={(e) => setGeneralNote(e.target.value)}
              placeholder={t('diaper.notePlaceholder')}
              rows={3}
            />
          </div>
        </TabsContent>
        
        <TabsContent value="enhanced" className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <input 
                type="checkbox" 
                id="has-rash" 
                checked={hasRash}
                onChange={(e) => setHasRash(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <Label htmlFor="has-rash">{t('diaper.hasRash')}</Label>
            </div>
            
            {hasRash && (
              <div className="mt-2 pt-2 border-t">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>{t('diaper.rashSeverity')}</Label>
                    <span className="text-sm font-medium">{rashSeverity}/5</span>
                  </div>
                  <Slider
                    value={[rashSeverity]}
                    min={1}
                    max={5}
                    step={1}
                    onValueChange={(value) => setRashSeverity(value[0])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{t('diaper.mild')}</span>
                    <span>{t('diaper.severe')}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {(type === 'dirty' || type === 'mixed') && (
            <>
              <div className="space-y-2 pt-2 border-t">
                <Label htmlFor="stool-color">{t('diaper.stoolColor.label')}</Label>
                <Select value={stoolColor} onValueChange={setStoolColor}>
                  <SelectTrigger id="stool-color">
                    <SelectValue placeholder={t('diaper.stoolColor.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {stoolColors.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="stool-consistency">{t('diaper.stoolConsistency.label')}</Label>
                <Select value={stoolConsistency} onValueChange={setStoolConsistency}>
                  <SelectTrigger id="stool-consistency">
                    <SelectValue placeholder={t('diaper.stoolConsistency.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {stoolConsistencies.map((consistency) => (
                      <SelectItem key={consistency.value} value={consistency.value}>
                        {consistency.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </>
          )}
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2 pt-4 border-t">
        {onCancel && (
          <Button variant="outline" onClick={onCancel}>
            {t('diaper.cancel')}
          </Button>
        )}
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? (
            <>
              <Loader size="small" className="mr-2" /> {t('common.saving')}
            </>
          ) : (
            t('diaper.save')
          )}
        </Button>
      </div>
    </div>
  );
}
