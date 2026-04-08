// api/alerts.js -lert log save aur fetch

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

  // **GET - last 50 alerts 
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('alerts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json(data);
  }

  // **POST - save new alerts
  if (req.method === 'POST') {
    const apiKey = req.headers['x-api-key'];
    if (apiKey !== process.env.ESP32_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    const { type, value, limit } = req.body;
    const { error } = await supabase
      .from('alerts')
      .insert([{ type, value, limit }]);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ status: 'ok' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
