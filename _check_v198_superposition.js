(() => {
const $ = id => document.getElementById(id);
const state = {running:true,time:0,last:performance.now(),raf:0,logs:[]};
function fmt(v,n=2){return Number(v).toFixed(n);}
function params(){
  const A1=Number($('vizAmp1')?.value||0.8),A2=Number($('vizAmp2')?.value||0.8),f=Number($('vizFreq')?.value||440),phaseDeg=Number($('vizPhaseDiff')?.value||0),timeSpeed=Number($('vizTimeSpeed')?.value||0.05);
  const v=343,lambda=v/f,phase=phaseDeg*Math.PI/180;
  const Ares=Math.sqrt(A1*A1 + A2*A2 + 2*A1*A2*Math.cos(phase));
  let stateText='ซ้อนทับบางส่วน';
  if(Math.abs(phaseDeg) < 10) stateText='เสริมกันมาก';
  else if(Math.abs(phaseDeg-180) < 10 && Math.abs(A1-A2) < 0.08) stateText='หักล้างเกือบหมด';
  else if(Math.cos(phase) < -0.35) stateText='หักล้างบางส่วน';
  else if(Math.cos(phase) > 0.35) stateText='เสริมกันบางส่วน';
  return {A1,A2,f,phaseDeg,timeSpeed,v,lambda,phase,Ares,stateText};
}
function updateLabels(){
  const p=params();
  $('vizAmp1Label').textContent=fmt(p.A1,2);
  $('vizAmp2Label').textContent=fmt(p.A2,2);
  $('vizFreqLabel').textContent=`${Math.round(p.f)} Hz`;
  $('vizPhaseDiffLabel').textContent=`${Math.round(p.phaseDeg)}°`;
  $('vizTimeLabel').textContent=`${fmt(p.timeSpeed,1)}×`;
  $('supSpeedLabel').textContent=`${fmt(p.v,1)} m/s`;
  $('supLambdaLabel').textContent=`${fmt(p.lambda,2)} m`;
  $('supPhaseLabel').textContent=`${Math.round(p.phaseDeg)}°`;
  $('supResultAmpLabel').textContent=fmt(p.Ares,2);
  $('supStateLabel').textContent=p.stateText;
}
function draw(){
  updateLabels();
  const c=$('visualizerCanvas'); if(!c) return; const ctx=c.getContext('2d'); const w=c.width,h=c.height; const p=params();
  ctx.clearRect(0,0,w,h);
  background(ctx,w,h);
  const left=96,right=w-56,plotW=right-left,viewLen=3.0,ampPx=34;
  const lanes=[96,230,364];
  const labels=[['คลื่นที่ 1','#38bdf8'],['คลื่นที่ 2','#ec4899'],['คลื่นรวม','#22c55e']];
  ctx.save();
  labels.forEach((arr,i)=>{
    const y0=lanes[i];
    ctx.strokeStyle='rgba(226,232,240,.18)'; ctx.setLineDash([6,6]); ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(left,y0); ctx.lineTo(right,y0); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle='rgba(226,232,240,.92)'; ctx.font='700 13px system-ui,sans-serif'; ctx.fillText(arr[0],18,y0+4);
    ctx.fillStyle=arr[1]; ctx.fillRect(18,y0-16,18,4);
    ctx.strokeStyle='rgba(226,232,240,.55)'; ctx.fillStyle='rgba(226,232,240,.55)'; arrow(ctx,left, y0-46, left+64, y0-46);
  });
  ctx.fillStyle='rgba(2,6,23,.52)'; ctx.strokeStyle='rgba(148,163,184,.20)'; rr(ctx,left+12,14,230,30,12,true,true);
  ctx.fillStyle='#dbeafe'; ctx.font='700 12px system-ui,sans-serif'; ctx.fillText(`Aรวม,max = ${fmt(p.Ares,2)}   λ = ${fmt(p.lambda,2)} m`,left+26,34);
  const probeX = right-92; const probeXM=(probeX-left)/plotW*viewLen;
  const phaseTime=2*Math.PI*p.f*state.time;
  const drawWave=(fn,y0,color,width=2.6,alpha=0.95)=>{
    ctx.strokeStyle=color; ctx.lineWidth=width; ctx.globalAlpha=alpha; ctx.beginPath();
    for(let x=left;x<=right;x++){
      const xm=(x-left)/plotW*viewLen;
      const y=fn(xm);
      const yp=y0 - y*ampPx;
      if(x===left) ctx.moveTo(x,yp); else ctx.lineTo(x,yp);
    }
    ctx.stroke(); ctx.globalAlpha=1;
  };
  const y1f=xm=>p.A1*Math.sin(2*Math.PI*(xm/p.lambda) - phaseTime);
  const y2f=xm=>p.A2*Math.sin(2*Math.PI*(xm/p.lambda) - phaseTime + p.phase);
  const ysf=xm=>y1f(xm)+y2f(xm);
  drawWave(y1f,lanes[0],'#38bdf8',2.8,0.95);
  drawWave(y2f,lanes[1],'#ec4899',2.8,0.95);
  drawWave(ysf,lanes[2],'#22c55e',3.0,1.0);
  ctx.strokeStyle='rgba(248,250,252,.32)'; ctx.setLineDash([7,7]); ctx.lineWidth=1.4; ctx.beginPath(); ctx.moveTo(probeX,28); ctx.lineTo(probeX,h-38); ctx.stroke(); ctx.setLineDash([]);
  const v1=y1f(probeXM), v2=y2f(probeXM), vs=ysf(probeXM);
  [[lanes[0],v1,'#38bdf8','y₁'],[lanes[1],v2,'#ec4899','y₂'],[lanes[2],vs,'#22c55e','y']].forEach(([y0,val,col,lab])=>{
    const py=y0 - val*34;
    ctx.fillStyle=col; ctx.beginPath(); ctx.arc(probeX,py,5,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(248,250,252,.9)'; ctx.font='700 11px system-ui,sans-serif'; ctx.fillText(`${lab}=${fmt(val,2)}`,probeX+10,py+4);
  });
  ctx.fillStyle='rgba(2,6,23,.40)'; ctx.strokeStyle='rgba(148,163,184,.15)'; rr(ctx,left+8,h-32,268,18,10,true,true);
  ctx.fillStyle='#dbeafe'; ctx.font='700 10px system-ui,sans-serif'; ctx.fillText(`ที่จุดสังเกต:  y = y₁ + y₂ = ${fmt(v1,2)} + ${fmt(v2,2)} = ${fmt(vs,2)}`,left+16,h-19);
  ctx.restore();
}
function background(ctx,w,h){
  const g=ctx.createLinearGradient(0,0,w,h); g.addColorStop(0,'#061422'); g.addColorStop(.55,'#07111f'); g.addColorStop(1,'#050a14'); ctx.fillStyle=g; ctx.fillRect(0,0,w,h);
  ctx.strokeStyle='rgba(148,163,184,.08)'; ctx.lineWidth=1;
  for(let x=0;x<w;x+=42){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
  for(let y=0;y<h;y+=42){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
}
function arrow(ctx,x1,y1,x2,y2){ctx.beginPath();ctx.moveTo(x1,y1);ctx.lineTo(x2,y2);ctx.stroke();const a=Math.atan2(y2-y1,x2-x1),hh=8;ctx.beginPath();ctx.moveTo(x2,y2);ctx.lineTo(x2-hh*Math.cos(a-Math.PI/6),y2-hh*Math.sin(a-Math.PI/6));ctx.lineTo(x2-hh*Math.cos(a+Math.PI/6),y2-hh*Math.sin(a+Math.PI/6));ctx.closePath();ctx.fill();}
function rr(ctx,x,y,w,h,r,fill=true,stroke=false){const q=Math.min(r,Math.abs(w)/2,Math.abs(h)/2);ctx.beginPath();ctx.moveTo(x+q,y);ctx.arcTo(x+w,y,x+w,y+h,q);ctx.arcTo(x+w,y+h,x,y+h,q);ctx.arcTo(x,y+h,x,y,q);ctx.arcTo(x,y,x+w,y,q);ctx.closePath();if(fill)ctx.fill();if(stroke)ctx.stroke();}
function tick(now){const dt=Math.min(.05,(now-state.last)/1000); state.last=now; if(state.running) state.time+=dt*params().timeSpeed*0.12; draw(); state.raf=requestAnimationFrame(tick);} 
function play(){state.running=true;} function pause(){state.running=false;} function reset(){state.time=0; state.last=performance.now(); draw();}
function row(){const p=params();return {timestamp:new Date().toISOString(),topic:'Wave Superposition',amplitude_1:Number(fmt(p.A1,2)),amplitude_2:Number(fmt(p.A2,2)),frequency_Hz:Math.round(p.f),wave_speed_m_s:Number(fmt(p.v,1)),wavelength_m:Number(fmt(p.lambda,4)),phase_difference_deg:Math.round(p.phaseDeg),resultant_amplitude_max:Number(fmt(p.Ares,3)),state:p.stateText};}
function renderLog(){const head=document.querySelector('.localHead'),body=document.querySelector('.localBody'); if(!head||!body) return; const sample=state.logs[0]||row(), keys=Object.keys(sample); head.innerHTML=keys.map(k=>`<th>${esc(k)}</th>`).join(''); body.innerHTML=state.logs.map(r=>`<tr>${keys.map(k=>`<td>${esc(r[k]??'')}</td>`).join('')}</tr>`).join('');}
function csv(v){const s=String(v??''); return /[",\n]/.test(s)?`"${s.replace(/"/g,'""')}"`:s;}
function esc(v){return String(v??'').replace(/[&<>\"]/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[ch]));}
function downloadCsv(){if(!state.logs.length) state.logs.push(row()); const keys=Object.keys(state.logs[0]); const rows=[keys.join(',')].concat(state.logs.map(r=>keys.map(k=>csv(r[k])).join(','))); const blob=new Blob(['\ufeff'+rows.join('\n')],{type:'text/csv;charset=utf-8;'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download=`waveSuperposition_${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href); a.remove();},500);}
function savePng(){const c=$('visualizerCanvas'); if(!c) return; draw(); c.toBlob(blob=>{if(!blob) return; const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='waveSuperposition.png'; document.body.appendChild(a); a.click(); setTimeout(()=>{URL.revokeObjectURL(a.href); a.remove();},500);},'image/png');}
document.addEventListener('DOMContentLoaded',()=>{
  ['vizAmp1','vizAmp2','vizFreq','vizPhaseDiff','vizTimeSpeed'].forEach(id=>{$(id)?.addEventListener('input',draw); $(id)?.addEventListener('change',draw);});
  $('vizPlayBtn')?.addEventListener('click',play); $('vizPauseBtn')?.addEventListener('click',pause); $('vizResetBtn')?.addEventListener('click',reset); $('vizExportBtn')?.addEventListener('click',savePng);
  document.querySelector('.localCaptureBtn')?.addEventListener('click',()=>{state.logs.push(row()); renderLog();});
  document.querySelector('.localDownloadBtn')?.addEventListener('click',downloadCsv);
  document.querySelector('.localClearBtn')?.addEventListener('click',()=>{state.logs=[]; renderLog();});
  draw(); renderLog(); state.raf=requestAnimationFrame(tick);
});
})();