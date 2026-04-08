//api thresholds.js_vercel serverless function
// Threshold get/post - Use by dashboard and esp32 

import { createClient} from '@supabase/supabase-js';

const supabase= createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_KEY
);
export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-api-key');

    if (req.method === 'OPTIONS') return res.status(200).end();
// GET - Get the latest thresholds
    if (req.method === 'GET') {
        const { data, error } = await supabase
            .from('thresholds')
            .select('*')
            .eq('id', 1)
            .single(); 
        
        if (error) {
      // If no thresholds found, return default values
      return res.status(200).json({ temp_limit: 30, hum_limit: 75, air_limit: 500 });
    }
    return res.status(200).json(data);
  }

  // POST - Update thresholds
  if (req.method === 'POST') {
    const { temp_limit, hum_limit, air_limit } = req.body;

    const { error } = await supabase
      .from('thresholds')
      .upsert([{ id: 1, temp_limit, hum_limit, air_limit }]);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ status: 'ok' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}