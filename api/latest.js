//**api/latest.js - Fetch latest sensor reading for dashboard

import { createClient} from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
  );

export default async function handler(req,res){
  res.setHeader('Access-Control-Allow-Origin','*');
  if (req.method ==='OPTIONS') return res.status(200).end();

  const {data,error} = await supabase
   .from('sensor_readings')
   .select('temp,hum,air,created_at')
   .order('created_at',{ascending: false})
   .limit(1)
   .single();
  if(error) return res.status(500).json({error:error.message});
  return res.status(200).json(data);
}
  
