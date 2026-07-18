const screens=[...document.querySelectorAll('.screen')];
let fragments=["","","",""];
try{fragments=JSON.parse(localStorage.getItem('gettysburgFragments')||'["","","",""]');}catch(e){fragments=["","","",""];}
let selected=null, hintCount=0;
function startPrologue(){
  document.body.classList.add('prologue-mode');
  const prologue=document.querySelector('[data-id="prologue"]');
  if(!prologue)return;
  prologue.classList.remove('run-intro');
  void prologue.offsetWidth;
  prologue.classList.add('run-intro');
}
function go(id){
  screens.forEach(s=>s.classList.toggle('active',s.dataset.id===id));
  const s=document.querySelector(`[data-id="${id}"]`);if(!s)return;
  document.body.classList.toggle('prologue-mode',id==='prologue');
  window.scrollTo({top:0,behavior:id==='prologue'?'auto':'smooth'});
  updateProgress(s);
  if(id==='prologue')startPrologue();
  if(id==='B4'){
    const everett=document.getElementById('everettSide');
    const searching=document.getElementById('searching');
    const remembered=document.getElementById('remembered');
    if(everett)everett.classList.remove('fade-side');
    if(searching)searching.style.display='block';
    if(remembered)remembered.style.display='none';
    setTimeout(()=>{everett?.classList.add('fade-side');if(searching)searching.style.display='none';if(remembered)remembered.style.display='block';},1500);
  }
}
function updateProgress(s){const p=+s.dataset.progress||0;document.getElementById('globalProgress').style.width=p+'%';document.getElementById('progressLabel').textContent=p+'%';const caseId=s.dataset.case;document.getElementById('sectionLabel').textContent=caseId?'Case File '+caseId:(s.dataset.label||'Archive entry');renderKey();}
function renderKey(){document.getElementById('keyMini').textContent=fragments.map((x,i)=>x||['██','██','██','█'][i]).join(' · ')}
function unlockFragment(i,v){
  fragments[i]=v;
  try{localStorage.setItem('gettysburgFragments',JSON.stringify(fragments));}catch(e){}
  renderKey();
  toast('Recovery fragment '+v+' stored.');
  document.querySelectorAll('.feedback.show .card').forEach(card=>{card.classList.remove('recovery-pulse');void card.offsetWidth;card.classList.add('recovery-pulse');});
}
function toast(t){const e=document.getElementById('toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1800)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-next]');if(b)go(b.dataset.next)});
document.querySelectorAll('.options').forEach(box=>box.addEventListener('click',e=>{const o=e.target.closest('.option');if(!o)return;if(box.id==='a1opts')return;box.querySelectorAll('.option').forEach(x=>x.classList.remove('selected'));o.classList.add('selected');if(box.id==='b6mc')return;let fb=null;if(box.id==='a1mc')fb=document.getElementById('a1mcfb');else if(box.id==='a4mc')fb=document.getElementById('a4mcfb');else fb=document.getElementById(box.id.replace('mc','fb'))||document.getElementById(box.id+'fb');if(o.dataset.correct&&fb)fb.classList.add('show');else if(!o.dataset.correct)toast('Recheck the evidence.')}));
function checkMulti(id,n,fbid){const sel=[...document.querySelectorAll('#'+id+' .selected')];const ok=sel.length===n&&sel.every(x=>x.dataset.correct);if(ok)document.getElementById(fbid).classList.add('show');else toast('Select only statements that the image itself can support.');}
let timeline=[];



// A01 research timeline and historical bridge
const researchAnswers={
  doi:{event:['declaration of independence','declaration'],year:['1776']},
  civilwar:{event:['american civil war','civil war','beginning of the american civil war','start of the civil war'],year:['1861']},
  emancipation:{event:['emancipation proclamation','emancipation proclamation takes effect'],year:['1863','january 1863','jan 1863','january 1 1863']},
  gettysburg:{event:['battle of gettysburg','gettysburg'],year:['1863','july 1863','jul 1863','july 1 1863','july 1-3 1863']}
};
function norm(v){return (v||'').toLowerCase().trim().replace(/[.,]/g,'').replace(/\s+/g,' ');}
let verifiedSources=new Set();
document.querySelectorAll('.verify-source').forEach(btn=>btn.addEventListener('click',()=>{
  const card=btn.closest('.research-card'); const id=card.dataset.id; const a=researchAnswers[id];
  const ev=norm(card.querySelector('.research-event').value); const yr=norm(card.querySelector('.research-year').value);
  const eventOk=a.event.some(x=>ev.includes(x)); const yearOk=a.year.some(x=>yr===x||yr.includes(x));
  if(eventOk&&yearOk){
    card.classList.add('verified'); btn.textContent='VERIFIED'; verifiedSources.add(id);
    if(verifiedSources.size===4){
      document.getElementById('timelineFb')?.classList.add('show');
      const bridge=document.getElementById('civilWarContext'); if(bridge) bridge.hidden=false;
      toast('All four sources identified. The recovered timeline is now visible.');
    }
  } else toast('Not yet. Use the source and research link to check the event and date.');
}));

// A02 geographic locator: users may retry until the target area is found
const mapLayer=document.getElementById('mapClickLayer');
mapLayer?.addEventListener('click',(event)=>{
  const rect=mapLayer.getBoundingClientRect();
  const x=(event.clientX-rect.left)/rect.width;
  const y=(event.clientY-rect.top)/rect.height;
  const marker=document.getElementById('mapMarker');
  if(marker){marker.hidden=false;marker.style.left=(x*100)+'%';marker.style.top=(y*100)+'%';}
  // Approximate Gettysburg target on this locator map: south-central Pennsylvania.
  const targetX=.405, targetY=.39; const hit=Math.hypot(x-targetX,y-targetY)<.085;
  document.getElementById('mapRetry')?.classList.toggle('show',!hit);
  document.getElementById('mapfb')?.classList.toggle('show',hit);
});

// A03 invitation reconstruction with reversible assignments
const openOccasion=document.getElementById('openOccasion');
openOccasion?.addEventListener('click',()=>{const box=document.getElementById('a3recon');if(box)box.hidden=false;});
let occasionSelected=null;
document.querySelectorAll('#occasionPool .note').forEach(n=>n.addEventListener('click',()=>{
  if(n.classList.contains('assigned')) return;
  document.querySelectorAll('#occasionPool .note').forEach(x=>x.classList.remove('active')); n.classList.add('active'); occasionSelected=n;
}));
function occasionComplete(){return [...document.querySelectorAll('.assign')].every(x=>x.classList.contains('filled'));}
document.querySelectorAll('.assign').forEach(z=>z.addEventListener('click',()=>{
  if(z.classList.contains('filled')&&!occasionSelected){
    const value=z.dataset.assignedValue; const source=[...document.querySelectorAll('#occasionPool .note')].find(n=>n.dataset.value===value);
    source?.classList.remove('assigned'); z.classList.remove('filled'); z.textContent=z.dataset.label; delete z.dataset.assignedValue; return;
  }
  if(!occasionSelected) return toast('Select a recovered data card first.');
  if(z.dataset.answer===occasionSelected.dataset.value){
    if(z.classList.contains('filled')){const old=z.dataset.assignedValue;document.querySelector(`#occasionPool .note[data-value="${CSS.escape(old)}"]`)?.classList.remove('assigned');}
    z.textContent=z.dataset.label+' · '+occasionSelected.dataset.value; z.classList.add('filled'); z.dataset.assignedValue=occasionSelected.dataset.value;
    occasionSelected.classList.remove('active'); occasionSelected.classList.add('assigned'); occasionSelected=null;
    if(occasionComplete()) document.getElementById('a3reconfb')?.classList.add('show');
  } else toast('That fragment belongs in another field. You can try another field.');
}));

// A04 case reconstruction with reversible assignments
let caseSel=null; const caseDone=new Set();
document.querySelectorAll('#casePool .note').forEach(n=>n.addEventListener('click',()=>{
  if(n.classList.contains('assigned')) return;
  caseSel=n; document.querySelectorAll('#casePool .note').forEach(x=>x.classList.remove('active')); n.classList.add('active');
}));
document.querySelectorAll('.cat').forEach(c=>c.addEventListener('click',()=>{
  if(c.classList.contains('filled')&&!caseSel){
    const cat=c.dataset.cat; const source=document.querySelector(`#casePool .note[data-cat="${cat}"]`); source?.classList.remove('assigned'); c.classList.remove('filled'); c.textContent=c.dataset.label; caseDone.delete(cat); return;
  }
  if(!caseSel) return toast('Select an evidence statement first.');
  if(c.dataset.cat===caseSel.dataset.cat){
    c.textContent=c.dataset.label+' · '+caseSel.textContent; c.classList.add('filled'); caseDone.add(c.dataset.cat); caseSel.classList.remove('active'); caseSel.classList.add('assigned'); caseSel=null;
    if(caseDone.size===5) document.getElementById('a4fb')?.classList.add('show');
  } else toast('This evidence belongs in another category.');
}));
function openModal(id){document.getElementById(id).classList.add('show')} function closeModal(id){document.getElementById(id).classList.remove('show')}
let speechSel=null;
document.querySelectorAll('.speechfrag').forEach(n=>n.addEventListener('click',()=>{if(n.classList.contains('assigned'))return;speechSel=n;document.querySelectorAll('.speechfrag').forEach(x=>x.classList.remove('active'));n.classList.add('active');}));
document.querySelectorAll('.speechslot').forEach(z=>z.addEventListener('click',()=>{
  if(z.classList.contains('filled')&&!speechSel){const val=z.dataset.assignedValue;document.querySelector(`.speechfrag[data-value="${CSS.escape(val)}"]`)?.classList.remove('assigned');z.classList.remove('filled');z.textContent=z.dataset.label||('['+z.dataset.answer+']');delete z.dataset.assignedValue;return;}
  if(!speechSel)return toast('Select a recovered data fragment.');
  if(z.dataset.answer===speechSel.dataset.value){z.dataset.label=z.dataset.label||z.textContent;z.textContent=z.dataset.answer;z.classList.add('filled');z.dataset.assignedValue=speechSel.dataset.value;speechSel.classList.remove('active');speechSel.classList.add('assigned');speechSel=null;if([...document.querySelectorAll('.speechslot')].every(x=>x.classList.contains('filled')))document.getElementById('b3fb')?.classList.add('show');}else toast('This fragment does not fit that record.');
}));
let reactionPassage='',reactionCat='';
document.querySelectorAll('#speechB5 .markable').forEach(m=>m.onclick=()=>{document.querySelectorAll('#speechB5 .markable').forEach(x=>x.classList.remove('marked'));m.classList.add('marked');reactionPassage=m.textContent});
document.querySelectorAll('#reactionCats .chip').forEach(c=>c.onclick=()=>{document.querySelectorAll('#reactionCats .chip').forEach(x=>x.classList.remove('active'));c.classList.add('active');reactionCat=c.textContent});
function saveFirstReaction(){const txt=document.getElementById('reactionText').value.trim();if(!reactionPassage||!txt||!reactionCat)return toast('Mark a passage, write a short explanation and choose a category.');localStorage.setItem('gettysburgFirstReaction',JSON.stringify({passage:reactionPassage,text:txt,category:reactionCat}));document.getElementById('b5fb').classList.add('show')}
function submitB6(){const choice=document.querySelector('#b6mc .selected');const just=document.getElementById('b6just').value.trim();if(!choice||just.length<20)return toast('Choose one statement and add a brief justification.');localStorage.setItem('gettysburgComprehension',JSON.stringify({choice:choice.textContent,justification:just}));document.getElementById('b6fb').classList.add('show')}
document.querySelectorAll('.boundary').forEach(b=>b.onclick=()=>b.classList.toggle('on'));
function checkBoundaries(){const ons=[...document.querySelectorAll('.boundary.on')].map(x=>x.dataset.b);if(ons.join(',')==='1,2,3,4')document.getElementById('c1fb').classList.add('show');else{hintCount++;toast('The structure is not complete yet. Look for shifts in time, focus or purpose.')}}
function showHint(){const f=document.getElementById('c1hint');f.classList.add('show');f.innerHTML=hintCount<2?'<b>HINT 1</b><br>A new section begins when Lincoln changes his time frame, his focus, or what he is trying to achieve.':'<b>HINT 2</b><br>Look for moves from the nation\'s beginnings → Civil War → Gettysburg itself → words to sacrifice → dead to living.'}
let funcSel=null,funcDone=0;
document.querySelectorAll('#funcPool .note').forEach(n=>n.addEventListener('click',()=>{if(n.classList.contains('assigned'))return;funcSel=n;document.querySelectorAll('#funcPool .note').forEach(x=>x.classList.remove('active'));n.classList.add('active');}));
document.querySelectorAll('.secslot').forEach(z=>z.addEventListener('click',()=>{
  if(z.classList.contains('filled')&&!funcSel){const sec=z.dataset.sec;document.querySelector(`#funcPool .note[data-sec="${sec}"]`)?.classList.remove('assigned');z.classList.remove('filled');z.textContent='SECTION '+sec;funcDone=Math.max(0,funcDone-1);return;}
  if(!funcSel)return toast('Select a function card.');
  if(z.dataset.sec===funcSel.dataset.sec){z.textContent='SECTION '+z.dataset.sec+' · '+funcSel.textContent;z.classList.add('filled');funcSel.classList.remove('active');funcSel.classList.add('assigned');funcSel=null;funcDone++;if(funcDone===5)document.getElementById('c2fb')?.classList.add('show');}else toast('That function does not match this section.');
}));
let c2EvidenceStep=1;
document.querySelectorAll('.c2ev').forEach(span=>span.addEventListener('click',()=>{
  const step=Number(span.dataset.step);
  if(step!==c2EvidenceStep){
    toast('Work through the evidence prompts in order.');
    return;
  }
  span.classList.add('marked');
  c2EvidenceStep++;
  const prompt=document.getElementById('c2Prompt');
  if(c2EvidenceStep===2){
    prompt.innerHTML="<b>2.</b> Mark the passage where the focus shifts from the ceremony itself to the soldiers' sacrifice.";
  }else if(c2EvidenceStep===3){
    prompt.innerHTML='<b>3.</b> Mark the phrase where responsibility explicitly shifts to the living.';
  }else{
    prompt.innerHTML='<b>EVIDENCE CONFIRMED.</b> Each structural claim is grounded in the speech itself.';
    document.getElementById('c2evfb').classList.add('show');
  }
}));
const notes=[
['Lincoln begins by referring to the founding of the United States and recalls that the nation was created on the principles of liberty and equality.','content'],
['Lincoln begins with the nation\'s founding ideals, using them as a point of reference for the crisis he addresses next.','analysis'],
['Lincoln presents the Civil War as a test of whether a nation based on the principles established at its founding can continue to exist.','content'],
['By moving from the nation\'s founding to the Civil War, Lincoln connects the present crisis directly to the ideals introduced at the beginning.','analysis'],
['Lincoln then turns to the gathering at Gettysburg, explaining that those present have come to dedicate part of the battlefield as a cemetery for the dead.','content'],
['Lincoln narrows his focus from the fate of the entire nation to the immediate situation at Gettysburg, making the larger conflict concrete.','analysis'],
['Lincoln states that the people gathered at Gettysburg cannot truly dedicate the ground because the soldiers who fought and died there have already done so.','content'],
['The argument now shifts from the speakers\' symbolic act of dedication to the soldiers\' sacrifice, which Lincoln presents as more significant than words.','analysis'],
['Towards the end, Lincoln says that the living must complete the unfinished work of those who died and ensure that their sacrifice was not in vain.','content'],
['Lincoln shifts responsibility from the dead to the living.','analysis'],
['Lincoln ends by expressing the hope that the nation will experience a new birth of freedom and that democratic government will continue to exist.','content'],
['By ending with the nation\'s future, Lincoln develops his argument from remembrance towards renewal and continued responsibility.','analysis']
];
const np=document.getElementById('notePool');notes.forEach(([t,k])=>{const b=document.createElement('button');b.className='note';b.textContent=t;b.dataset.kind=k;np.appendChild(b)});
let noteSel=null,noteDone=0;
np?.addEventListener('click',e=>{const n=e.target.closest('.note');if(!n)return;if(n.classList.contains('assigned')){n.classList.remove('assigned');delete n.dataset.assignedKind;noteDone=Math.max(0,noteDone-1);return;}noteSel=n;[...np.children].forEach(x=>x.classList.remove('active'));n.classList.add('active');});
document.querySelectorAll('.sorttarget').forEach(z=>z.addEventListener('click',()=>{if(!noteSel)return toast('Select a note first.');if(z.dataset.kind===noteSel.dataset.kind){noteSel.classList.remove('active');noteSel.classList.add('assigned');noteSel.dataset.assignedKind=z.dataset.kind;noteDone++;noteSel=null;if(noteDone===notes.length)document.getElementById('c3fb')?.classList.add('show');}else toast('Read for function: does the note state content, or explain development?');}));
let tempSel=null,tempPlaced=0;
document.querySelectorAll('#temporalPool .note').forEach(n=>n.addEventListener('click',()=>{if(n.classList.contains('assigned')){n.classList.remove('assigned');tempPlaced=Math.max(0,tempPlaced-1);return;}tempSel=n;document.querySelectorAll('#temporalPool .note').forEach(x=>x.classList.remove('active'));n.classList.add('active');}));
document.querySelectorAll('.timetarget').forEach(z=>z.addEventListener('click',()=>{if(!tempSel)return toast('Select a recovered section.');if(z.dataset.time===tempSel.dataset.time){tempSel.classList.remove('active');tempSel.classList.add('assigned');tempSel=null;tempPlaced++;if(tempPlaced===5)document.getElementById('c4fb')?.classList.add('show');}else toast('Check the temporal movement again.');}));
document.querySelectorAll('#cfinalmc .option').forEach(o=>o.onclick=()=>{document.querySelectorAll('#cfinalmc .option').forEach(x=>x.classList.remove('selected'));o.classList.add('selected');if(o.dataset.correct)document.getElementById('cfinalfb').classList.add('show');else toast('Look at the complete movement from founding ideals to future responsibility.')})
document.querySelectorAll('.d1mark').forEach(m=>m.onclick=()=>{if(m.dataset.correct){m.classList.add('marked');document.getElementById('d1markfb').classList.add('show')}else toast('Look for the repeated grammatical opening.')});
function completeD1(){if(document.getElementById('d1why').value.trim().length<20)return toast('Add a brief explanation first.');document.getElementById('d1fb').classList.add('show')}
function speakAntithesis(){if('speechSynthesis'in window){const u=new SpeechSynthesisUtterance('antithesis');u.lang='en-GB';speechSynthesis.speak(u)}}
let mainContrast=0;
document.querySelectorAll('.d3contrast').forEach(m=>m.onclick=()=>{m.classList.toggle('marked');mainContrast=[...document.querySelectorAll('.d3contrast.marked[data-main="1"]')].length;if(mainContrast===2)document.getElementById('d3fb').classList.add('show')});
function completeD4(){if(document.getElementById('d4a').value.trim().length<10||document.getElementById('d4b').value.trim().length<10)return toast('Add a brief response to both questions.');document.getElementById('d4fb').classList.add('show')}
function checkFinalKey(){if(document.getElementById('keyYear').value==='1863'&&document.getElementById('keyWords').value==='272')document.getElementById('keyfb').classList.add('show');else toast('The key combines the year of the speech and its word count.');}
go('prologue'); renderKey();
