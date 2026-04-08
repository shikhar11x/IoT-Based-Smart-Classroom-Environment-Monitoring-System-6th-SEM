var API = window.location.hostname==='localhost' ? 'http://localhost:3000' : '';
var ESP_IP = '';

// STATE
var liveBuffer=[], histData=[], mainChart=null, fcChart=null;
var activeRange='live';
var showM={temp:true,hum:true,air:true};
var limits={temp:30,hum:75,air:500};
var alertLog=[];
var acOn=false, exhaustOn=false;

// CLOCK
setInterval(function(){
  document.getElementById('clock').textContent=new Date().toLocaleTimeString();
},1000);

// TOAST
function toast(msg,type){
  var el=document.getElementById('toast');
  el.textContent=msg; el.className='toast show '+(type||'ok');
  setTimeout(function(){ el.className='toast'; },2800);
}

// GAUGES
function setGauge(id,val,lim,min,max,unit){
  var pct=Math.min(Math.max((val-min)/(max-min),0),1);
  document.getElementById('arc-'+id).style.strokeDashoffset=172-(pct*172);
  var v=document.getElementById('v'+id[0]);
  v.innerHTML=(typeof val==='number'?val.toFixed(1):val)+'<sup>'+unit+'</sup>';
  var st=document.getElementById('st-'+id);
  var ratio=val/lim;
  if(ratio>=1){ st.textContent='ALERT'; st.className='g-status s-err'; }
  else if(ratio>=0.85){ st.textContent='WARN'; st.className='g-status s-warn'; }
  else { st.textContent='OK'; st.className='g-status s-ok'; }
}

// AC TOGGLE
function toggleAC(cb){
  acOn=cb.checked;
  updateACLED(acOn);
  var msg=acOn?'AC turned ON manually':'AC turned OFF manually';
  pushAlert('❄️', msg, new Date().toLocaleTimeString());
  toast(msg, acOn?'ok':'err');
}

// EXHAUST TOGGLE
function toggleExhaust(cb){
  exhaustOn=cb.checked;
  updateExhaustLED(exhaustOn);
  var msg=exhaustOn?'Exhaust Fan turned ON manually':'Exhaust Fan turned OFF manually';
  pushAlert('🌀', msg, new Date().toLocaleTimeString());
  toast(msg, exhaustOn?'ok':'err');
}

// LED UPDATES
function updateACLED(on){
  var led=document.getElementById('led-ac');
  var lbl=document.getElementById('ac-lbl');
  var sub=document.getElementById('ac-status');
  led.className='ctrl-led'+(on?' on-ac':'');
  lbl.textContent=on?'ON':'OFF';
  sub.textContent=on?'Running — Cooling':'Standby';
  document.getElementById('ac-toggle').checked=on;
}

function updateExhaustLED(on){
  var led=document.getElementById('led-ex');
  var lbl=document.getElementById('ex-lbl');
  var sub=document.getElementById('ex-status');
  led.className='ctrl-led'+(on?' on-ex':'');
  lbl.textContent=on?'ON':'OFF';
  sub.textContent=on?'Running — Ventilating':'Standby';
  document.getElementById('ex-toggle').checked=on;
}

// FETCH CURRENT
async function fetchCurrent(){
  try{
    var url=ESP_IP ? ESP_IP+'/api/current' : API+'/api/latest';
    var r=await fetch(url,{cache:'no-store'});
    var d=await r.json();
    
    setGauge('temp',d.temp,limits.temp,0,50,'°C');
    setGauge('hum',d.hum,limits.hum,0,100,'%');
    setGauge('air',d.air,limits.air,0,1000,' idx');
    document.getElementById('last-update').textContent=new Date().toLocaleTimeString();
    
    var now=Math.floor(Date.now()/1000);
    liveBuffer.push({t:now,temp:d.temp,hum:d.hum,air:d.air});
    if(liveBuffer.length>180) liveBuffer.shift();
    if(activeRange==='live') renderChart(liveBuffer);
    
    var ts=new Date().toLocaleTimeString();
    
    // TEMP check → AC auto ON
    if(d.temp>limits.temp){
      if(!acOn){
        acOn=true; updateACLED(true);
        pushAlert('❄️','AC AUTO ON — High Temp: '+d.temp.toFixed(1)+'°C',ts);
      }
      pushAlert('🌡️','High Temp: '+d.temp.toFixed(1)+'°C (Limit: '+limits.temp+'°C)',ts);
    } else if(d.temp<=limits.temp-2 && acOn){
      acOn=false; updateACLED(false);
      pushAlert('❄️','AC AUTO OFF — Temp normal: '+d.temp.toFixed(1)+'°C',ts);
    }

    // HUMIDITY check → Exhaust auto ON
    if(d.hum>limits.hum){
      if(!exhaustOn){
        exhaustOn=true; updateExhaustLED(true);
        pushAlert('🌀','Exhaust AUTO ON — High Humidity: '+d.hum.toFixed(1)+'%',ts);
      }
      pushAlert('💧','High Humidity: '+d.hum.toFixed(1)+'% (Limit: '+limits.hum+'%)',ts);
    } else if(d.hum<=limits.hum-5 && exhaustOn){
      exhaustOn=false; updateExhaustLED(false);
      pushAlert('🌀','Exhaust AUTO OFF — Humidity normal: '+d.hum.toFixed(1)+'%',ts);
    }

    // AIR check
    if(d.air>limits.air){
      pushAlert('🌫️','Poor Air Quality: '+d.air+' (Limit: '+limits.air+')',ts);
    }

  }catch(e){ /* silent */ }
}

// ALERT LOG
function pushAlert(icon,msg,time){
  if(alertLog.length>0 && alertLog[0].msg===msg) return;
  alertLog.unshift({icon:icon,msg:msg,time:time});
  if(alertLog.length>200) alertLog.pop();
  renderAlerts();
}
function renderAlerts(){
  var ul=document.getElementById('alert-list');
  if(!alertLog.length){
    ul.innerHTML='<li><span class="no-alert">No alerts — system nominal</span></li>';
    return;
  }
  ul.innerHTML=alertLog.map(function(a){
    var cls='';
    if(a.icon==='❄️') cls='log-ac';
    else if(a.icon==='🌀') cls='log-ex';
    return '<li><span class="al-icon">'+a.icon+'</span>'+
           '<span class="al-msg '+cls+'">'+a.msg+'</span>'+
           '<span class="al-time">'+a.time+'</span></li>';
  }).join('');
}

// FETCH ALERTS from server
async function fetchAlerts(){
  try{
    var r=await fetch(API+'/api/alerts');
    var data=await r.json();
    if(!data||!data.length) return;
    var serverAlerts=data.map(function(a){
      var icon=a.type==='temp'?'🌡️':a.type==='hum'?'💧':'🌫️';
      return{icon:icon,
        msg:a.type.toUpperCase()+': '+a.value+' (limit: '+a.alert_limit+')',
        time:new Date(a.created_at).toLocaleTimeString()};
    });
    serverAlerts.forEach(function(sa){
      var exists=alertLog.some(function(al){ return al.msg===sa.msg && al.time===sa.time; });
      if(!exists) alertLog.push(sa);
    });
    alertLog.sort(function(a,b){ return b.time>a.time?1:-1; });
    renderAlerts();
  }catch(e){}
}

// HISTORY CHART
async function fetchHistory(range){
  try{
    var r=await fetch(API+'/api/data?range='+range);
    var raw=await r.json();
    if(!raw||!raw.length) throw new Error('no data');
    histData=raw.map(function(d){
      return{t:Math.floor(new Date(d.created_at).getTime()/1000),
        temp:d.temp,hum:d.hum,air:d.air};
    });
  }catch(e){
    histData=demoHistory(range);
  }
  renderChart(histData);
}

function setRange(range,btn){
  activeRange=range;
  document.querySelectorAll('#range-btns .tbtn').forEach(function(b){ b.classList.remove('ar'); });
  btn.classList.add('ar');
  if(range==='live') renderChart(liveBuffer);
  else fetchHistory(range);
}

function toggleM(m){
  showM[m]=!showM[m];
  var ids={temp:'mb-t',hum:'mb-h',air:'mb-a'};
  var cls={temp:'mt',hum:'mh',air:'ma'};
  var btn=document.getElementById(ids[m]);
  if(showM[m]) btn.classList.add(cls[m]);
  else btn.classList.remove(cls[m]);
  var src=(activeRange==='live')?liveBuffer:histData;
  renderChart(src);
}

function renderChart(data){
  var isLive=(activeRange==='live');
  var labels=data.map(function(r){
    var d=new Date(r.t*1000);
    if(isLive||activeRange==='hour')
      return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    if(activeRange==='day')
      return d.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'});
    return d.toLocaleDateString([],{month:'short',day:'numeric'})+
           ' '+d.toLocaleTimeString([],{hour:'2-digit'});
  });
  var ds=[];
  if(showM.temp) ds.push({
    label:'Temp (°C)',data:data.map(function(r){return r.temp;}),
    borderColor:'#ff5722',backgroundColor:'rgba(255,87,34,.07)',
    tension:.35,pointRadius:data.length>200?0:2,fill:true,borderWidth:1.5});
  if(showM.hum) ds.push({
    label:'Humidity (%)',data:data.map(function(r){return r.hum;}),
    borderColor:'#00bcd4',backgroundColor:'rgba(0,188,212,.07)',
    tension:.35,pointRadius:data.length>200?0:2,fill:true,borderWidth:1.5});
  if(showM.air) ds.push({
    label:'Air Quality',data:data.map(function(r){return r.air;}),
    borderColor:'#69f0ae',backgroundColor:'rgba(105,240,174,.05)',
    tension:.35,pointRadius:data.length>200?0:2,fill:true,borderWidth:1.5});
  if(mainChart) mainChart.destroy();
  var ctx=document.getElementById('mainChart').getContext('2d');
  mainChart=new Chart(ctx,{
    type:'line',data:{labels:labels,datasets:ds},
    options:{
      responsive:true,maintainAspectRatio:false,
      animation:{duration:isLive?0:400},
      interaction:{mode:'index',intersect:false},
      plugins:{
        legend:{labels:{color:'#546e7a',font:{family:'JetBrains Mono',size:10}}},
        tooltip:{backgroundColor:'#0d1320',borderColor:'#1a2535',borderWidth:1,
          titleColor:'#eceff1',bodyColor:'#90a4ae'}},
      scales:{
        x:{ticks:{color:'#546e7a',font:{family:'JetBrains Mono',size:9},maxTicksLimit:12},
          grid:{color:'rgba(26,37,53,.8)'}},
        y:{ticks:{color:'#546e7a',font:{family:'JetBrains Mono',size:9}},
          grid:{color:'rgba(26,37,53,.8)'}}}
    }
  });
}

// LINEAR REGRESSION FORECAST..
function linReg(data,key){
  var n=data.length,sx=0,sy=0,sxy=0,sx2=0;
  data.forEach(function(d,i){ sx+=i;sy+=d[key];sxy+=i*d[key];sx2+=i*i; });
  var m=(n*sxy-sx*sy)/(n*sx2-sx*sx||1);
  var b=(sy-m*sx)/n;
  return{m:m,b:b};
}

function runForecast(){
  var btn=document.getElementById('fc-btn');
  btn.disabled=true; btn.textContent='Calculating...';
  var src=histData.length>=5?histData:liveBuffer;
  if(src.length<5){
    document.getElementById('fc-insight').innerHTML=
      '<em>At least 5 readings are required. Please wait for a moment...</em>';
    btn.disabled=false; btn.textContent='⚡ Run Forecast';
    return;
  }
  var rt=linReg(src,'temp'),rh=linReg(src,'hum'),ra=linReg(src,'air');
  var base=src.length,forecast=[],riskDays=[];
  for(var i=1;i<=7;i++){
    var x=base+i*12;
    var t=parseFloat((rt.m*x+rt.b).toFixed(1));
    var h=parseFloat((rh.m*x+rh.b).toFixed(1));
    var a=Math.round(ra.m*x+ra.b);
    t=Math.max(15,Math.min(50,t));
    h=Math.max(10,Math.min(100,h));
    a=Math.max(0,Math.min(1500,a));
    if(t>limits.temp||h>limits.hum||a>limits.air) riskDays.push(i);
    forecast.push({day:'Day '+i,temp:t,hum:h,air:a});
  }
  var bgC=forecast.map(function(_,i){
    return riskDays.indexOf(i+1)!==-1?'rgba(244,67,54,.3)':'rgba(206,147,216,.12)';
  });
  if(fcChart) fcChart.destroy();
  var ctx=document.getElementById('fcChart').getContext('2d');
  fcChart=new Chart(ctx,{
    type:'bar',
    data:{
      labels:forecast.map(function(f){return f.day;}),
      datasets:[
        {type:'line',label:'Temp (°C)',data:forecast.map(function(f){return f.temp;}),
          borderColor:'#ff5722',tension:.3,pointRadius:5,
          pointBackgroundColor:forecast.map(function(_,i){
            return riskDays.indexOf(i+1)!==-1?'#f44336':'#ff5722';}),yAxisID:'yL'},
        {type:'line',label:'Humidity (%)',data:forecast.map(function(f){return f.hum;}),
          borderColor:'#00bcd4',tension:.3,pointRadius:4,yAxisID:'yL'},
        {type:'bar',label:'Air Quality',data:forecast.map(function(f){return f.air;}),
          backgroundColor:bgC,borderColor:'#69f0ae',borderWidth:1,yAxisID:'yR'}
      ]
    },
    options:{
      responsive:true,maintainAspectRatio:false,
      plugins:{
        legend:{labels:{color:'#546e7a',font:{family:'JetBrains Mono',size:10}}},
        tooltip:{backgroundColor:'#0d1320',borderColor:'#1a2535',borderWidth:1,
          titleColor:'#eceff1',bodyColor:'#90a4ae'}},
      scales:{
        yL:{position:'left',ticks:{color:'#546e7a',font:{family:'JetBrains Mono',size:9}},
          grid:{color:'rgba(26,37,53,.8)'}},
        yR:{position:'right',ticks:{color:'#69f0ae',font:{family:'JetBrains Mono',size:9}},
          grid:{drawOnChartArea:false}},
        x:{ticks:{color:'#546e7a',font:{family:'JetBrains Mono',size:9}},
          grid:{color:'rgba(26,37,53,.8)'}}}
    }
  });
  var tT=rt.m>0.01?'Rising':rt.m<-0.01?'Falling':'Stable';
  var hT=rh.m>0.01?'Rising':rh.m<-0.01?'Falling':'Stable';
  var aMsg=riskDays.length?'Risk days: Day '+riskDays.join(', Day ')+'.':'No threshold breaches expected.';
  document.getElementById('fc-insight').textContent=
    'Forecast based on '+src.length+' readings (Linear Regression). '+
    'Temp trend: '+tT+'. Humidity trend: '+hT+'. '+aMsg;
  toast('Forecast ready!','ok');
  btn.disabled=false; btn.textContent='⚡ Run Forecast';
}

// THRESHOLDS..
async function loadThresholds(){
  try{
    var r=await fetch(API+'/api/thresholds');
    var d=await r.json();
    limits={temp:d.temp_limit,hum:d.hum_limit,air:d.air_limit};
    document.getElementById('sl-t').value=limits.temp;
    document.getElementById('sl-h').value=limits.hum;
    document.getElementById('sl-a').value=limits.air;
    document.getElementById('sv-t').textContent=limits.temp+'°C';
    document.getElementById('sv-h').textContent=limits.hum+'%';
    document.getElementById('sv-a').textContent=limits.air;
    document.getElementById('lt').textContent=limits.temp;
    document.getElementById('lh').textContent=limits.hum;
    document.getElementById('la').textContent=limits.air;
  }catch(e){}
}

async function saveThresholds(){
  var tl=parseFloat(document.getElementById('sl-t').value);
  var hl=parseFloat(document.getElementById('sl-h').value);
  var al=parseInt(document.getElementById('sl-a').value);
  try{
    await fetch(API+'/api/thresholds',{method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({temp_limit:tl,hum_limit:hl,air_limit:al})});
    limits={temp:tl,hum:hl,air:al};
    document.getElementById('lt').textContent=tl;
    document.getElementById('lh').textContent=hl;
    document.getElementById('la').textContent=al;
    toast('Thresholds saved!','ok');
  }catch(e){ toast('Save failed!','err'); }
}

// DEMO DATA 
function demoHistory(range){
  var count={hour:60,day:144,week:1008,month:4320,month2:8640}[range]||144;
  var now=Math.floor(Date.now()/1000);
  var interval={hour:60,day:600,week:600,month:600,month2:600}[range]||600;
  return Array.from({length:count},function(_,i){
    return{t:now-(count-i)*interval,
      temp:27+Math.sin(i/20)*4+Math.random()*.5,
      hum:58+Math.sin(i/15)*12+Math.random(),
      air:320+Math.sin(i/10)*180+Math.random()*20};
  });
}

// INIT
loadThresholds();
fetchAlerts();
fetchCurrent();
renderChart(liveBuffer);
setInterval(fetchCurrent,2000);
setInterval(fetchAlerts,30000);
setInterval(loadThresholds,60000);
