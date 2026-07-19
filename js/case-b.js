window.initCaseB=function(){
  const layer=document.getElementById('invitationClickLayer');
  const status=document.getElementById('invitationLocationStatus');
  const retry=document.getElementById('speakerPassagesRetry');
  const recovered=document.getElementById('speakerPassagesFb');
  const found=new Set();

  // Relative rectangles on the displayed second page of the invitation.
  // They intentionally cover the full sentence lines so the interaction remains usable on tablets.
  const targets={
    everett:{x1:.08,x2:.93,y1:.16,y2:.34,marker:'invitationMarkerEverett'},
    lincoln:{x1:.07,x2:.94,y1:.39,y2:.68,marker:'invitationMarkerLincoln'}
  };

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
    let hitKey=null;
    for(const [key,t] of Object.entries(targets)){
      if(!found.has(key)&&x>=t.x1&&x<=t.x2&&y>=t.y1&&y<=t.y2){hitKey=key;break;}
    }
    if(hitKey){
      found.add(hitKey);
      const marker=document.getElementById(targets[hitKey].marker);
      if(marker)marker.hidden=false;
      retry?.classList.remove('show');
      updateStatus();
    }else{
      retry?.classList.add('show');
    }
  });

  document.getElementById('completeBRecovery')?.addEventListener('click',()=>{
    showRecoveryOverlay({caseId:'B',fragment:'63',nextId:'O0',nextLabel:'RETURN TO ARCHIVE'});
  });
};