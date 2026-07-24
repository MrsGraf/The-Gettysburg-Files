window.initCaseB=function(){
  const layer=document.getElementById('invitationClickLayer');
  const status=document.getElementById('invitationLocationStatus');
  const retry=document.getElementById('speakerPassagesRetry');
  const recovered=document.getElementById('speakerPassagesFb');
  const found=new Set();

  // Only the exact text areas marked in the approved reference are clickable.
  // Three separate locations must be recovered: Everett's oration, the passage addressing Lincoln,
  // and the separate phrase "a few appropriate remarks" on the facing page.
  const targetGroups={
    everett:{
      rects:[
        {x1:.098,x2:.490,y1:.322,y2:.352},
        {x1:.080,x2:.385,y1:.370,y2:.399}
      ],
      markers:['invitationMarkerEverett1','invitationMarkerEverett2']
    },
    lincolnYou:{
      rects:[
        {x1:.102,x2:.478,y1:.748,y2:.778},
        {x1:.096,x2:.364,y1:.796,y2:.827}
      ],
      markers:['invitationMarkerLincoln1','invitationMarkerLincoln2']
    },
    lincolnRemarks:{
      rects:[
        {x1:.527,x2:.780,y1:.148,y2:.178},
        {x1:.778,x2:.938,y1:.130,y2:.161}
      ],
      markers:['invitationMarkerLincoln3','invitationMarkerLincoln4']
    }
  };

  function revealMarkers(group){
    targetGroups[group].markers.forEach(id=>{const marker=document.getElementById(id);if(marker)marker.hidden=false;});
  }

  function updateStatus(){
    if(status)status.textContent=`${found.size} / 3 PASSAGES RECOVERED`;
    if(found.size===3){
      retry?.classList.remove('show');
      recovered?.classList.add('show');
      layer?.setAttribute('aria-disabled','true');
    }
  }

  layer?.addEventListener('pointerup',event=>{
    if(found.size===3)return;
    const rect=layer.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    const x=(event.clientX-rect.left)/rect.width;
    const y=(event.clientY-rect.top)/rect.height;
    let hitGroup=null;
    for(const [group,target] of Object.entries(targetGroups)){
      if(found.has(group))continue;
      if(target.rects.some(r=>x>=r.x1&&x<=r.x2&&y>=r.y1&&y<=r.y2)){hitGroup=group;break;}
    }
    if(hitGroup){
      found.add(hitGroup);
      revealMarkers(hitGroup);
      retry?.classList.remove('show');
      updateStatus();
    }else retry?.classList.add('show');
  });

  const overlay=document.getElementById('contradictionOverlay');
  const timingPhase=document.getElementById('contradictionTimingPhase');
  const everettMinutes=document.getElementById('everettMinutes');
  const lincolnMinutes=document.getElementById('lincolnMinutes');
  const contradictionReveal=document.getElementById('contradictionReveal');
  let contradictionTimers=[];
  let contradictionFrame=null;

  function clearContradictionTimers(){
    contradictionTimers.forEach(clearTimeout);contradictionTimers=[];
    if(contradictionFrame)cancelAnimationFrame(contradictionFrame);
    contradictionFrame=null;
  }

  function showContradictionReveal(){
    timingPhase?.classList.add('fading');
    contradictionTimers.push(setTimeout(()=>{
      if(timingPhase)timingPhase.hidden=true;
      if(contradictionReveal){
        contradictionReveal.hidden=false;
        requestAnimationFrame(()=>contradictionReveal.classList.add('visible'));
      }
    },900));
  }

  function animateEverettCounter(){
    const start=performance.now(),duration=2400;
    const tick=now=>{
      const t=Math.min(1,(now-start)/duration);
      const value=Math.round(t*120);
      if(everettMinutes)everettMinutes.textContent=String(value);
      if(t<1)contradictionFrame=requestAnimationFrame(tick);
      else{
        contradictionFrame=null;
        if(lincolnMinutes)lincolnMinutes.textContent='1';
        contradictionTimers.push(setTimeout(()=>{if(lincolnMinutes)lincolnMinutes.textContent='2';},1700));
        // Hold the completed comparison briefly so both durations can be taken in before the crossfade.
        contradictionTimers.push(setTimeout(showContradictionReveal,3200));
      }
    };
    contradictionFrame=requestAnimationFrame(tick);
  }

  function openContradiction(){
    clearContradictionTimers();
    if(!overlay)return;
    overlay.classList.add('show');overlay.setAttribute('aria-hidden','false');
    document.body.classList.add('contradiction-open');
    if(timingPhase){timingPhase.hidden=false;timingPhase.classList.remove('fading');}
    if(everettMinutes)everettMinutes.textContent='0';
    if(lincolnMinutes)lincolnMinutes.textContent='—';
    contradictionReveal?.classList.remove('visible');
    if(contradictionReveal)contradictionReveal.hidden=true;
    animateEverettCounter();
  }

  function closeContradiction(){
    clearContradictionTimers();
    overlay?.classList.remove('show');overlay?.setAttribute('aria-hidden','true');
    document.body.classList.remove('contradiction-open');
  }

  document.getElementById('openContradictionOverlay')?.addEventListener('click',openContradiction);
  document.getElementById('openLincolnWords')?.addEventListener('click',()=>{closeContradiction();go('B3');});

  document.getElementById('confirmBTextUnderstanding')?.addEventListener('click',()=>{
    showRecoveryOverlay({caseId:'B',fragment:'63',nextId:'O0',nextLabel:'RETURN TO ARCHIVE'});
  });

  function applyBReviewRecoveredState(){
    Object.keys(targetGroups).forEach(group=>{found.add(group);revealMarkers(group);});
    updateStatus();
    if(layer){
      layer.setAttribute('aria-disabled','true');
      layer.style.pointerEvents='none';
    }
  }

  applyBReviewRecoveredState();
};