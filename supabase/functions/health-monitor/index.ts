import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { babyId } = await req.json();

    if (!babyId) {
      return new Response(
        JSON.stringify({ error: 'Baby ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch recent feeding data (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: feedings, error: feedingError } = await supabaseClient
      .from('feedings')
      .select('*')
      .eq('baby_id', babyId)
      .gte('start_time', sevenDaysAgo)
      .order('start_time', { ascending: false });

    const { data: sleeps, error: sleepError } = await supabaseClient
      .from('sleeps')
      .select('*')
      .eq('baby_id', babyId)
      .gte('start_time', sevenDaysAgo)
      .order('start_time', { ascending: false });

    const { data: growthRecords, error: growthError } = await supabaseClient
      .from('growth_records')
      .select('*')
      .eq('baby_id', babyId)
      .order('date', { ascending: false })
      .limit(5);

    if (feedingError || sleepError || growthError) {
      throw new Error('Error fetching health data');
    }

    const alerts = [];

    // Check feeding patterns
    if (feedings && feedings.length > 0) {
      const avgFeedingsPerDay = feedings.length / 7;
      const lastFeeding = new Date(feedings[0].start_time);
      const hoursSinceLastFeeding = (Date.now() - lastFeeding.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastFeeding > 4) {
        alerts.push({
          type: 'feeding',
          severity: 'high',
          title: 'Long Gap Between Feedings',
          message: `It's been ${Math.floor(hoursSinceLastFeeding)} hours since the last feeding. Consider feeding soon.`,
          actionable: 'Log a feeding or consult your pediatrician if baby seems lethargic.',
        });
      }

      if (avgFeedingsPerDay < 6) {
        alerts.push({
          type: 'feeding',
          severity: 'medium',
          title: 'Low Feeding Frequency',
          message: `Average of ${avgFeedingsPerDay.toFixed(1)} feedings per day (recommended: 8-12 for newborns).`,
          actionable: 'Consider more frequent feedings. Consult your pediatrician if baby is not gaining weight.',
        });
      }
    }

    // Check sleep patterns
    if (sleeps && sleeps.length > 0) {
      const totalSleepMinutes = sleeps.reduce((sum, sleep) => sum + (sleep.duration || 0), 0);
      const avgSleepPerDay = totalSleepMinutes / 7 / 60;

      if (avgSleepPerDay < 12) {
        alerts.push({
          type: 'sleep',
          severity: 'medium',
          title: 'Low Sleep Duration',
          message: `Baby is averaging ${avgSleepPerDay.toFixed(1)} hours of sleep per day (recommended: 14-17 hours for infants).`,
          actionable: 'Establish a consistent bedtime routine. Ensure a quiet, dark sleep environment.',
        });
      }

      const lastSleep = new Date(sleeps[0].start_time);
      const hoursSinceLastSleep = (Date.now() - lastSleep.getTime()) / (1000 * 60 * 60);

      if (hoursSinceLastSleep > 3 && sleeps[0].end_time) {
        alerts.push({
          type: 'sleep',
          severity: 'low',
          title: 'Awake for Extended Period',
          message: `Baby has been awake for ${Math.floor(hoursSinceLastSleep)} hours.`,
          actionable: 'Watch for tired cues like yawning or fussiness. Consider putting baby down for a nap.',
        });
      }
    }

    // Check growth trends
    if (growthRecords && growthRecords.length >= 2) {
      const latestGrowth = growthRecords[0];
      const previousGrowth = growthRecords[1];

      if (latestGrowth.weight && previousGrowth.weight) {
        const weightChange = latestGrowth.weight - previousGrowth.weight;
        const daysBetween = Math.abs(
          (new Date(latestGrowth.date).getTime() - new Date(previousGrowth.date).getTime()) / (1000 * 60 * 60 * 24)
        );
        const weightChangePerWeek = (weightChange / daysBetween) * 7;

        if (weightChangePerWeek < 0) {
          alerts.push({
            type: 'growth',
            severity: 'high',
            title: 'Weight Loss Detected',
            message: `Baby has lost ${Math.abs(weightChange).toFixed(2)} kg since last measurement.`,
            actionable: 'Schedule a checkup with your pediatrician immediately to discuss weight loss.',
          });
        } else if (weightChangePerWeek < 0.15) {
          alerts.push({
            type: 'growth',
            severity: 'medium',
            title: 'Slow Weight Gain',
            message: `Weight gain is slower than expected (${(weightChangePerWeek * 1000).toFixed(0)}g per week).`,
            actionable: 'Ensure adequate feeding. Consult your pediatrician if this continues.',
          });
        }
      }
    }

    // Send notifications for high severity alerts
    if (alerts.some(alert => alert.severity === 'high')) {
      const { data: baby } = await supabaseClient
        .from('babies')
        .select('user_id, name')
        .eq('id', babyId)
        .single();

      if (baby) {
        const highAlerts = alerts.filter(a => a.severity === 'high');
        for (const alert of highAlerts) {
          await supabaseClient.from('real_time_notifications').insert({
            user_id: baby.user_id,
            title: `Health Alert: ${alert.title}`,
            message: alert.message,
            type: 'health_alert',
            data: { babyId, alertType: alert.type },
            read: false,
          });
        }
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        alerts,
        summary: {
          totalAlerts: alerts.length,
          highSeverity: alerts.filter(a => a.severity === 'high').length,
          mediumSeverity: alerts.filter(a => a.severity === 'medium').length,
          lowSeverity: alerts.filter(a => a.severity === 'low').length,
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in health-monitor:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
