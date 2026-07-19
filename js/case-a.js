window.initCaseA=function(){
  const researchAnswers={
    lincoln:{year:'1860',aliases:['abraham lincoln','lincoln','president abraham lincoln','president lincoln']},
    secession:{year:'1860',aliases:['ordinance of secession','south carolina ordinance of secession','secession of south carolina','south carolina secession','south carolina secedes from the union','south carolina leaves the union','ordinance to dissolve the union']},
    fortsumter:{year:'1861',aliases:['battle of fort sumter','battle at fort sumter','attack on fort sumter','bombardment of fort sumter','fort sumter','beginning of the american civil war','start of the american civil war','beginning of the civil war','civil war begins']}
  };
  const normalize=value=>(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[’']/g,'').replace(/[^a-z0-9\s-]/g,' ').replace(/-/g,' ').replace(/\b(the|a|an)\b/g,' ').replace(/\s+/g,' ').trim();
  function editDistance(a,b){const row=Array.from({length:b.length+1},(_,i)=>i);for(let i=1;i<=a.length;i++){let left=i,diag=row[0];row[0]=i;for(let j=1;j<=b.length;j++){const up=row[j],cost=a[i-1]===b[j-1]?0:1;const val=Math.min(up+1,left+1,diag+cost);diag=up;row[j]=val;left=val}}return row[b.length]}
  function closeEnough(input,alias){const a=normalize(input),b=normalize(alias);if(a===b)return true;if((a.includes(b)||b.includes(a))&&Math.min(a.length,b.length)>=7)return true;const max=Math.max(a.length,b.length);return editDistance(a,b)<=Math.max(1,Math.min(4,Math.floor(max*.1)))}
  function sourceMatches(id,input){const s=normalize(input);if(id==='secession'&&(/south carolina/.test(s)&&/(seced|secession|leave|left|withdraw)/.test(s)))return true;if(id==='fortsumter'&&(/fort sumter/.test(s)||(/civil war/.test(s)&&/(begin|start|outbreak)/.test(s))))return true;return researchAnswers[id].aliases.some(alias=>closeEnough(input,alias))}
  const verified=new Set();
  document.querySelectorAll('.verify-source').forEach(button=>button.addEventListener('click',()=>{
    const card=button.closest('.research-card'),id=card.dataset.id;
    const name=card.querySelector('.research-event').value,year=card.querySelector('.research-year').value.trim();
    const nameOk=sourceMatches(id,name),yearOk=year===researchAnswers[id].year;
    if(nameOk&&yearOk){
      card.classList.add('verified');button.textContent='VERIFIED';verified.add(id);
      if(verified.size===3){document.getElementById('timelineFb')?.classList.add('show');const bridge=document.getElementById('civilWarContext');if(bridge)bridge.hidden=false;}
    }else if(nameOk)toast('The identification fits. Check the year once more.');
    else if(yearOk)toast('The year fits, but the person or event is not identified clearly enough yet.');
    else toast('Not yet. Research the source and check both the identification and the year.');
  }));

  const map=document.getElementById('mapClickLayer');
  map?.addEventListener('click',event=>{
    const rect=map.getBoundingClientRect(),x=(event.clientX-rect.left)/rect.width,y=(event.clientY-rect.top)/rect.height;
    const marker=document.getElementById('mapMarker');if(marker){marker.hidden=false;marker.style.left=`${x*100}%`;marker.style.top=`${y*100}%`}
    const hit=Math.hypot(x-.79,y-.315)<.075;
    document.getElementById('mapRetry')?.classList.toggle('show',!hit);
    document.getElementById('mapfb')?.classList.toggle('show',hit);
  });

  document.getElementById('openOccasion')?.addEventListener('click',()=>{const box=document.getElementById('a3recon');if(box)box.hidden=false});
  setupAssignment({pool:'#occasionPool .note',slots:'.occasion-fields .assign',verify:'verifyOccasion',retry:'a3retry',success:'a3reconfb'});
  setupAssignment({pool:'#casePool .note',slots:'.cat',verify:'verifyCaseFacts',retry:'a4retry',success:'a4fb',complete:'a4complete',key:'cat'});

  function setupAssignment({pool,slots,verify,retry,success,complete,key='value'}){
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
      document.getElementById(retry)?.classList.toggle('show',!ok);document.getElementById(success)?.classList.toggle('show',ok);if(complete)document.getElementById(complete)?.classList.toggle('show',ok);
    });
  }
};
