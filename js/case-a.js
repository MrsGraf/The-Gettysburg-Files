window.initCaseA=function(){const answers={lincoln:{year:'1860',aliases:['abraham lincoln','lincoln','president lincoln']},secession:{year:'1860',aliases:['south carolina secession','secession of south carolina','ordinance of secession']},fortsumter:{year:'1861',aliases:['fort sumter','battle of fort sumter','attack on fort sumter']}};const norm=s=>(s||'').toLowerCase().replace(/[^a-z0-9 ]/g,' ').replace(/\s+/g,' ').trim();const done=new Set();document.querySelectorAll('.verify-source').forEach(btn=>btn.onclick=()=>{const c=btn.closest('.research-card'),a=answers[c.dataset.id],ev=norm(c.querySelector('.research-event').value),yr=c.querySelector('.research-year').value.trim();if(a.aliases.some(x=>ev.includes(x))&&yr===a.year){done.add(c.dataset.id);btn.textContent='VERIFIED';c.classList.add('verified');if(done.size===3){document.getElementById('timelineFb').classList.add('show');document.getElementById('civilWarContext').hidden=false}}else toast('Recheck the identification and year.')});const layer=document.getElementById('mapClickLayer');layer?.addEventListener('click',e=>{const r=layer.getBoundingClientRect(),x=(e.clientX-r.left)/r.width,y=(e.clientY-r.top)/r.height,m=document.getElementById('mapMarker');m.hidden=false;m.style.left=x*100+'%';m.style.top=y*100+'%';const hit=Math.hypot(x-.79,y-.25)<.08;document.getElementById('mapRetry').classList.toggle('show',!hit);document.getElementById('mapfb').classList.toggle('show',hit)});document.getElementById('openOccasion')?.addEventListener('click',()=>{
  const box=document.getElementById('a3recon');
  if(box) box.hidden=false;
});

let occasionSelected=null;

function updateOccasionVerifyState(){
  const fields=[...document.querySelectorAll('.assign')];
  const verify=document.getElementById('verifyOccasion');
  if(verify) verify.disabled=!fields.every(x=>x.classList.contains('filled'));
}

document.querySelectorAll('#occasionPool .note').forEach(n=>n.addEventListener('click',()=>{
  if(n.classList.contains('assigned')) return;
  document.querySelectorAll('#occasionPool .note').forEach(x=>x.classList.remove('active'));
  n.classList.add('active');
  occasionSelected=n;
}));

document.querySelectorAll('.assign').forEach(z=>z.addEventListener('click',()=>{
  if(z.classList.contains('filled')&&!occasionSelected){
    const old=z.dataset.assignedValue;
    const source=[...document.querySelectorAll('#occasionPool .note')].find(n=>n.dataset.value===old);
    source?.classList.remove('assigned');
    z.classList.remove('filled');
    z.textContent=z.dataset.label;
    delete z.dataset.assignedValue;
    updateOccasionVerifyState();
    return;
  }

  if(!occasionSelected) return toast('Select a recovered data card first.');

  if(z.classList.contains('filled')){
    const old=z.dataset.assignedValue;
    const source=[...document.querySelectorAll('#occasionPool .note')].find(n=>n.dataset.value===old);
    source?.classList.remove('assigned');
  }

  z.textContent=z.dataset.label+' · '+occasionSelected.dataset.value;
  z.classList.add('filled');
  z.dataset.assignedValue=occasionSelected.dataset.value;
  occasionSelected.classList.remove('active');
  occasionSelected.classList.add('assigned');
  occasionSelected=null;

  document.getElementById('a3reconretry')?.classList.remove('show');
  document.getElementById('a3reconfb')?.classList.remove('show');
  updateOccasionVerifyState();
}));

document.getElementById('verifyOccasion')?.addEventListener('click',()=>{
  const fields=[...document.querySelectorAll('.assign')];
  if(!fields.every(x=>x.classList.contains('filled'))) return toast('Complete all five case fields first.');

  const correct=fields.every(x=>x.dataset.assignedValue===x.dataset.answer);
  document.getElementById('a3reconretry')?.classList.toggle('show',!correct);
  document.getElementById('a3reconfb')?.classList.toggle('show',correct);

  if(correct) toast('Document reconstruction verified.');
});

let caseSel=null;
const caseDone=new Set();

document.querySelectorAll('#casePool .note').forEach(n=>n.addEventListener('click',()=>{
  if(n.classList.contains('assigned')) return;
  caseSel=n;
  document.querySelectorAll('#casePool .note').forEach(x=>x.classList.remove('active'));
  n.classList.add('active');
}));

document.querySelectorAll('.cat').forEach(c=>c.addEventListener('click',()=>{
  if(c.classList.contains('filled')&&!caseSel){
    const cat=c.dataset.cat;
    const source=document.querySelector(`#casePool .note[data-cat="${cat}"]`);
    source?.classList.remove('assigned');
    c.classList.remove('filled');
    c.textContent=c.dataset.label;
    caseDone.delete(cat);
    return;
  }

  if(!caseSel) return toast('Select an evidence statement first.');

  if(c.dataset.cat===caseSel.dataset.cat){
    c.textContent=c.dataset.label+' · '+caseSel.textContent;
    c.classList.add('filled');
    caseDone.add(c.dataset.cat);
    caseSel.classList.remove('active');
    caseSel.classList.add('assigned');
    caseSel=null;

    if(caseDone.size===5){
      document.getElementById('a4fb')?.classList.add('show');
    }
  }else{
    toast('This evidence belongs in another category.');
  }
}));
};