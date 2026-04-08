// ESP32 yahan POST karta hai sensor data
// Dashboard  GET karta hai history

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');

  if (req.method === 'OPTIONS') return res.status(200).end();

  // ── POST — SAVE DATA FROM ESP32
  if (req.method === 'POST') {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.ESP32_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { temp, hum, air } = req.body;
    if (temp == null || hum == null || air == null) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    
    const { error } = await supabase
      .from('sensor_readings')
      .insert([{ temp, hum, air }]);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ status: 'ok' });
  }

  // ── GET — FETCH HISTORY FOR DASHBOARD
  if (req.method === 'GET') {
    const range = req.query.range || 'day';
    const now = new Date();
    let since = new Date();

    if      (range === 'hour')   since.setHours(now.getHours() - 1);
    else if (range === 'day')    since.setDate(now.getDate() - 1);
    else if (range === 'week')   since.setDate(now.getDate() - 7);
    else if (range === 'month')  since.setMonth(now.getMonth() - 1);
    else if (range === 'month2') since.setMonth(now.getMonth() - 2);
    else                         since.setDate(now.getDate() - 1);

    const { data, error } = await supabase
      .from('sensor_readings')
      .select('temp, hum, air, created_at')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: true })
      .limit(2000);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
