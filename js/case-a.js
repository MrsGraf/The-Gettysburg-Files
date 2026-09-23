window.initCaseA=function(){
  const researchAnswers={
    lincoln:{year:'1860',aliases:['abraham lincoln','lincoln','president abraham lincoln','president lincoln']},
    secession:{year:'1860',aliases:['ordinance of secession','south carolina ordinance of secession','secession of south carolina','south carolina secession','south carolina secedes from the union','south carolina leaves the union','ordinance to dissolve the union']},
    fortsumter:{year:'1861',aliases:['battle of fort sumter','battle at fort sumter','attack on fort sumter','bombardment of fort sumter','fort sumter','beginning of the american civil war','start of the american civil war','beginning of the civil war','civil war begins']}
  };
  const normalize=value=>(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9\s-]/g,' ').replace(/-/g,' ').replace(/\b(the|a|an)\b/g,' ').replace(/\s+/g,' ').trim();
  function editDistance(a,b){const row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let left=i,diag=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const up=row[j],cost=a[i-1]===b[j-1]?0:1;const val=Math.min(up+1,left+1,diag+cost);diag=up;row[j]=val;left=val}}return row[b.length]}
  function closeEnough(input,alias){const a=normalize(input),b=normalize(alias);if(a===b)return true;if((a.includes(b)||b.includes(a))&&Math.min(a.length,b.length)>=7)return true;const max=Math.max(a.length,b.length);return editDistance(a,b)<=Math.max(1,Math.min(4,Math.floor(max*.1)))}
  function displayAlias(alias){
    const preferred={
      'abraham lincoln':'Abraham Lincoln',
      'lincoln':'Lincoln',
      'president abraham lincoln':'President Abraham Lincoln',
      'president lincoln':'President Lincoln',
      'ordinance of secession':'Ordinance of Secession',
      'south carolina ordinance of secession':'South Carolina Ordinance of Secession',
      'secession of south carolina':'Secession of South Carolina',
      'south carolina secession':'South Carolina secession',
      'south carolina secedes from the union':'South Carolina secedes from the Union',
      'south carolina leaves the union':'South Carolina leaves the Union',
      'ordinance to dissolve the union':'Ordinance to dissolve the Union',
      'battle of fort sumter':'Battle of Fort Sumter',
      'battle at fort sumter':'Battle at Fort Sumter',
      'attack on fort sumter':'Attack on Fort Sumter',
      'bombardment of fort sumter':'Bombardment of Fort Sumter',
      'fort sumter':'Fort Sumter',
      'beginning of the american civil war':'Beginning of the American Civil War',
      'start of the american civil war':'Start of the American Civil War',
      'beginning of the civil war':'Beginning of the Civil War',
      'civil war begins':'Civil War begins'
    };
    return preferred[alias]||alias;
  }
  function sourceMatch(id,input){
    const s=normalize(input);
    const aliases=researchAnswers[id].aliases;
    const exact=aliases.find(alias=>normalize(alias)===s);
    if(exact)return {ok:true,typo:false,correction:displayAlias(exact)};
    if(id==='secession'&&(/south carolina/.test(s)&&/(seced|secession|leave|left|withdraw)/.test(s)))return {ok:true,typo:false};
    if(id==='fortsumter'&&(/fort sumter/.test(s)||(/civil war/.test(s)&&/(begin|start|outbreak)/.test(s))))return {ok:true,typo:false};
    const fuzzy=aliases.find(alias=>closeEnough(input,alias));
    return fuzzy?{ok:true,typo:true,correction:displayAlias(fuzzy)}:{ok:false,typo:false};
  }
  const verified=new Set();
  document.querySelectorAll('.verify-source').forEach(button=>button.addEventListener('click',()=>{
    const card=button.closest('.research-card'),id=card.dataset.id;
    const name=card.querySelector('.research-event').value,year=card.querySelector('.research-year').value.trim();
    const match=sourceMatch(id,name),nameOk=match.ok,yearOk=year===researchAnswers[id].year;
    if(nameOk&&yearOk){
      card.classList.add('verified');markVerifyButton(button);verified.add(id);
      if(match.typo&&match.correction)spellingAccepted(match.correction);
      if(verified.size===3){document.getElementById('timelineFb')?.classList.add('show');const bridge=document.getElementById('civilWarContext');if(bridge)bridge.hidden=false;}
    }else if(nameOk)toast('The identification fits. Check the year once more.');
    else if(yearOk)toast('The year fits, but the person or event is not identified clearly enough yet.');
    else toast('Not yet. Research the source and check both the identification and the year.');
  }));

  const map=document.getElementById('mapClickLayer');
  let mapSolved=false;
  map?.addEventListener('pointerup',event=>{
    if(mapSolved)return;
    const rect=map.getBoundingClientRect();
    if(!rect.width||!rect.height)return;
    const x=(event.clientX-rect.left)/rect.width;
    const y=(event.clientY-rect.top)/rect.height;

    // Gettysburg on the supplied July 1863 map: south-central Pennsylvania, just north of Maryland.
    // Target calibrated against the official NPS Gettysburg mapping/location context and expressed
    // as relative image coordinates so it scales reliably on tablets.
    const targetX=.594,targetY=.407;
    const dx=(x-targetX)/.035,dy=(y-targetY)/.035;
    const hit=(dx*dx+dy*dy)<=1;

    document.getElementById('mapRetry')?.classList.toggle('show',!hit);
    document.getElementById('mapfb')?.classList.toggle('show',hit);

    if(hit){
      mapSolved=true;
      const marker=document.getElementById('mapMarker');
      if(marker){
        marker.hidden=false;
        marker.style.left=`${targetX*100}%`;
        marker.style.top=`${targetY*100}%`;
      }
      map.setAttribute('aria-disabled','true');
    }
  });

  document.getElementById('openOccasion')?.addEventListener('click',()=>{const box=document.getElementById('a3recon');if(box)box.hidden=false});
  setupAssignment({pool:'#occasionPool .note',slots:'.occasion-fields .assign',verify:'verifyOccasion',retry:'a3retry',success:'a3reconfb'});
  setupAssignment({pool:'#casePool .note',slots:'.cat',verify:'verifyCaseFacts',retry:'a4retry',success:'a4fb',complete:'a4complete',key:'cat',recovery:{caseId:'A',fragment:'18',nextId:'O0',nextLabel:'RETURN TO ARCHIVE'}});

  function setupAssignment({pool,slots,verify,retry,success,complete,key='value',recovery=null}){
    let selected=null;
    const notes=[...document.querySelectorAll(pool)],zones=[...document.querySelectorAll(slots)],verifyBtn=document.getElementById(verify);
    notes.forEach(note=>note.addEventListener('click',()=>{
      if(note.classList.contains('assigned'))return;
      notes.forEach(x=>x.classList.remove('active'));note.classList.add('active');selected=note;
    }));
    zones.forEach(zone=>zone.addEventListener('click',()=>{
      if(zone.classList.contains('filled')&&!selected){
        const old=notes.find(n=>n.textContent===zone.dataset.assignedText);old?.classList.remove('assigned');
        zone.classList.remove('filled');zone.textContent=zone.dataset.label;delete zone.dataset.assignedText;delete zone.dataset.assignedKey;update();return;
      }
      if(!selected)return toast('Select a recovered statement first.');
      if(zone.classList.contains('filled')){const old=notes.find(n=>n.textContent===zone.dataset.assignedText);old?.classList.remove('assigned')}
      zone.textContent=`${zone.dataset.label} · ${selected.textContent}`;zone.classList.add('filled');zone.dataset.assignedText=selected.textContent;zone.dataset.assignedKey=selected.dataset[key];
      selected.classList.remove('active');selected.classList.add('assigned');selected=null;document.getElementById(retry)?.classList.remove('show');update();
    }));
    function update(){if(verifyBtn)verifyBtn.disabled=!zones.every(z=>z.classList.contains('filled'))}
    verifyBtn?.addEventListener('click',()=>{
      const ok=zones.every(zone=>zone.dataset.assignedKey===zone.dataset.answer||zone.dataset.assignedKey===zone.dataset[key]);
      document.getElementById(retry)?.classList.toggle('show',!ok);document.getElementById(success)?.classList.toggle('show',ok);if(ok)markVerifyButton(verifyBtn);if(complete)document.getElementById(complete)?.classList.toggle('show',ok);if(ok&&recovery)setTimeout(()=>showRecoveryOverlay(recovery),450);
    });
  }

  function applyAReviewRecoveredState(){
    const presetCards={
      lincoln:{name:'Abraham Lincoln',year:'1860'},
      secession:{name:'South Carolina secedes from the Union',year:'1860'},
      fortsumter:{name:'Battle of Fort Sumter',year:'1861'}
    };
    document.querySelectorAll('.research-card').forEach(card=>{
      const preset=presetCards[card.dataset.id];
      if(!preset)return;
      const eventInput=card.querySelector('.research-event');
      const yearInput=card.querySelector('.research-year');
      const button=card.querySelector('.verify-source');
      if(eventInput){eventInput.value=preset.name;eventInput.disabled=true;}
      if(yearInput){yearInput.value=preset.year;yearInput.disabled=true;}
      card.classList.add('verified');
      markVerifyButton(button);
      if(button)button.disabled=true;
    });
    document.getElementById('timelineFb')?.classList.add('show');
    const bridge=document.getElementById('civilWarContext');
    if(bridge)bridge.hidden=false;
    document.querySelectorAll('#a1mc .option').forEach(option=>{
      option.disabled=true;
      option.classList.toggle('selected',option.dataset.correct==='1');
    });
    document.getElementById('a1mcfb')?.classList.add('show');

    const marker=document.getElementById('mapMarker');
    if(marker){
      marker.hidden=false;
      marker.style.left='59.4%';
      marker.style.top='40.7%';
    }
    document.getElementById('mapfb')?.classList.add('show');
    const mapLayer=document.getElementById('mapClickLayer');
    if(mapLayer){
      mapLayer.setAttribute('aria-disabled','true');
      mapLayer.style.pointerEvents='none';
    }

    const recon=document.getElementById('a3recon');
    if(recon)recon.hidden=false;
    const correctOccasionValues=new Set(['Gettysburg, Pennsylvania','November 2, 1863','President Abraham Lincoln','The dedication of a cemetery for soldiers killed at Gettysburg','To honor soldiers who died in the battle']);
    document.querySelectorAll('#occasionPool .note').forEach(note=>{
      note.classList.toggle('assigned',correctOccasionValues.has(note.dataset.value));
      note.disabled=true;
    });
    const occasionAnswers={
      'WHEN?':'November 2, 1863',
      'TO WHOM?':'President Abraham Lincoln',
      'WHAT?':'The dedication of a cemetery for soldiers killed at Gettysburg',
      'WHERE?':'Gettysburg, Pennsylvania',
      'WHY?':'To honor soldiers who died in the battle'
    };
    document.querySelectorAll('.occasion-fields .assign').forEach(zone=>{
      const value=occasionAnswers[zone.dataset.label];
      if(!value)return;
      zone.classList.add('filled');
      zone.textContent=`${zone.dataset.label} · ${value}`;
      zone.dataset.assignedText=value;
      zone.dataset.assignedKey=value;
      zone.disabled=true;
    });
    const verifyOccasion=document.getElementById('verifyOccasion');
    if(verifyOccasion){markVerifyButton(verifyOccasion);verifyOccasion.disabled=true;}
    document.getElementById('a3reconfb')?.classList.add('show');
  }

  if(GettysburgState.isTestMode())applyAReviewRecoveredState();
};