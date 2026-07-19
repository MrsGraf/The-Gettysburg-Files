window.initCaseB=function(){
  const layer=document.getElementById('invitationClickLayer');
  const status=document.getElementById('invitationLocationStatus');
  const retry=document.getElementById('speakerPassagesRetry');
  const recovered=document.getElementById('speakerPassagesFb');
  const found=new Set();

  // Only the exact text areas marked in the approved reference are clickable.
  // Everett is one logical passage across two adjacent line fragments.
  // Lincoln is one logical passage whose wording is split across the lower-left and upper-right areas.
  const targetGroups={
    everett:{
      rects:[
        {x1:.098,x2:.490,y1:.316,y2:.365},
        {x1:.080,x2:.385,y1:.365,y2:.410}
      ],
      markers:['invitationMarkerEverett1','invitationMarkerEverett2']
    },
    lincoln:{
      rects:[
        {x1:.102,x2:.478,y1:.744,y2:.792},
        {x1:.096,x2:.364,y1:.792,y2:.844},
        {x1:.527,x2:.780,y1:.143,y2:.195},
        {x1:.778,x2:.938,y1:.125,y2:.178}
      ],
      markers:['invitationMarkerLincoln1','invitationMarkerLincoln2','invitationMarkerLincoln3','invitationMarkerLincoln4']
    }
  };

  function revealMarkers(group){
    targetGroups[group].markers.forEach(id=>{const marker=document.getElementById(id);if(marker)marker.hidden=false;});
  }

  function updateStatus(){
    if(status)status.textContent=`${found.size} / 2 PASSAGES RECOVERED`;
    if(found.size===2){
      retry?.classList.remove('show');
      recovered?.classList.add('show');
      layer?.setAttribute('aria-disabled','true');
    }
  }

  layer?.addEventListener('pointerup',event=>{
    if(found.size===2)return;
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
  const everettMinutes=document.getElementById('everettMinutes');
  const lincolnMinutes=document.getElementById('lincolnMinutes');
  const everettOver=document.getElementById('everettOver');
  const contradictionReveal=document.getElementById('contradictionReveal');
  let contradictionTimers=[];
  let contradictionFrame=null;

  function clearContradictionTimers(){
    contradictionTimers.forEach(clearTimeout);contradictionTimers=[];
    if(contradictionFrame)cancelAnimationFrame(contradictionFrame);
  }

  function animateEverettCounter(){
    const start=performance.now(),duration=2400;
    const tick=now=>{
      const t=Math.min(1,(now-start)/duration);
      const value=Math.round(t*120);
      if(everettMinutes)everettMinutes.textContent=String(value);
      if(t<1)contradictionFrame=requestAnimationFrame(tick);
      else{
        if(everettOver)everettOver.classList.add('visible');
        if(lincolnMinutes)lincolnMinutes.textContent='1';
        contradictionTimers.push(setTimeout(()=>{if(lincolnMinutes)lincolnMinutes.textContent='2';},1700));
        contradictionTimers.push(setTimeout(()=>{
          if(contradictionReveal){contradictionReveal.hidden=false;requestAnimationFrame(()=>contradictionReveal.classList.add('visible'));}
        },3100));
      }
    };
    contradictionFrame=requestAnimationFrame(tick);
  }

  function openContradiction(){
    clearContradictionTimers();
    if(!overlay)return;
    overlay.classList.add('show');overlay.setAttribute('aria-hidden','false');
    document.body.classList.add('contradiction-open');
    if(everettMinutes)everettMinutes.textContent='0';
    if(lincolnMinutes)lincolnMinutes.textContent='—';
    everettOver?.classList.remove('visible');
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
};