const screens=[...document.querySelectorAll('.screen')];
let fragments=JSON.parse(localStorage.getItem('gettysburgFragments')||'["","","",""]');
let selected=null, hintCount=0;
function go(id){screens.forEach(s=>s.classList.toggle('active',s.dataset.id===id));const s=document.querySelector(`[data-id="${id}"]`);if(!s)return;window.scrollTo(0,0);updateProgress(s);localStorage.setItem('gettysburgLast',id);if(id==='B4')setTimeout(()=>{document.getElementById('everettSide').classList.add('fade-side');document.getElementById('searching').style.display='none';document.getElementById('remembered').style.display='block'},1600);}
function updateProgress(s){
  const id=s.dataset.id||'';
  const raw=+s.dataset.progress||0;
  let label=s.dataset.label||'';
  let pct=0;
  const bands={A:[0,25],B:[25,50],C:[50,75],D:[75,100]};
  const letter=/^[ABCD]/.test(id)?id[0]:null;
  if(letter){const [start,end]=bands[letter];pct=Math.max(0,Math.min(100,Math.round(((raw-start)/(end-start))*100)));label=`CASE FILE ${letter} PROGRESS`;}
  else if(id==='prologue'){pct=0;label='ARCHIVE ENTRY';}
  else if(id==='EPILOGUE'||id==='FINALKEY'){pct=100;label='ARCHIVE RECOVERY';}
  document.getElementById('globalProgress').style.width=pct+'%';
  document.getElementById('progressLabel').textContent=pct+'%';
  document.getElementById('sectionLabel').textContent=label;
  renderKey();
}
function renderKey(){document.getElementById('keyMini').textContent=fragments.map((x,i)=>x||['██','██','██','█'][i]).join(' · ')}
function unlockFragment(i,v){fragments[i]=v;localStorage.setItem('gettysburgFragments',JSON.stringify(fragments));renderKey();toast('Recovery fragment '+v+' stored.');}
function toast(t){const e=document.getElementById('toast');e.textContent=t;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),1800)}
document.addEventListener('click',e=>{const b=e.target.closest('[data-next]');if(b)go(b.dataset.next)});
document.querySelectorAll('.options').forEach(box=>box.addEventListener('click',e=>{const o=e.target.closest('.option');if(!o)return;if(box.id==='a1opts')return;box.querySelectorAll('.option').forEach(x=>x.classList.remove('selected'));o.classList.add('selected');if(box.id==='b6mc')return;let fb=null;if(box.id==='a6mc')fb=document.getElementById('a6mcfb');else fb=document.getElementById(box.id.replace('mc','fb'))||document.getElementById(box.id+'fb');if(o.dataset.correct&&fb)fb.classList.add('show');else if(!o.dataset.correct)toast('Recheck the evidence.')}));
function checkMulti(id,n,fbid){const sel=[...document.querySelectorAll('#'+id+' .selected')];const ok=sel.length===n&&sel.every(x=>x.dataset.correct);if(ok)document.getElementById(fbid).classList.add('show');else toast('Select only statements that the image itself can support.');}
document.querySelectorAll('#a1opts .option').forEach(o=>o.addEventListener('click',()=>o.classList.toggle('selected')));
let timeline=[];


// A02 research-and-reconstruction timeline
const researchAnswers={
  doi:{event:['declaration of independence','declaration'],year:['1776']},
  civilwar:{event:['american civil war','civil war','beginning of the american civil war','start of the civil war'],year:['1861']},
  emancipation:{event:['emancipation proclamation','emancipation proclamation takes effect'],year:['1863','january 1863','jan 1863']},
  gettysburg:{event:['battle of gettysburg','gettysburg'],year:['1863','july 1863','jul 1863']}
};
function norm(v){return (v||'').toLowerCase().trim().replace(/[.,]/g,'').replace(/\s+/g,' ');}
let verifiedSources=new Set();
document.querySelectorAll('.verify-source').forEach(btn=>btn.addEventListener('click',()=>{
  const card=btn.closest('.research-card'); const id=card.dataset.id; const a=researchAnswers[id];
  const ev=norm(card.querySelector('.research-event').value); const yr=norm(card.querySelector('.research-year').value);
  const eventOk=a.event.some(x=>ev.includes(x)); const yearOk=a.year.some(x=>yr===x||yr.includes(x));
  if(eventOk&&yearOk){card.classList.add('verified');btn.textContent='VERIFIED';verifiedSources.add(id); if(verifiedSources.size===4){buildTimelinePool();document.getElementById('timelineBuild').hidden=false;toast('All four sources identified. Reconstruct the chronology.');}}
  else toast('Not yet. Use the source and research link to check the event and date.');
}));
const timelineOrder=['doi','civilwar','emancipation','gettysburg'];
const timelineLabels={doi:'Declaration of Independence · 1776',civilwar:'Beginning of the American Civil War · 1861',emancipation:'Emancipation Proclamation takes effect · January 1863',gettysburg:'Battle of Gettysburg · July 1863'};
let timelineSelection=[];
function buildTimelinePool(){const pool=document.getElementById('timelinePool');if(!pool||pool.children.length)return;timelineOrder.forEach(id=>{const b=document.createElement('button');b.type='button';b.className='btn ghost timeline-choice';b.dataset.id=id;b.textContent=timelineLabels[id];b.addEventListener('click',()=>toggleTimelineChoice(id,b));pool.appendChild(b);});renderTimelineSequence();}
function toggleTimelineChoice(id,button){const i=timelineSelection.indexOf(id);if(i>=0){timelineSelection.splice(i,1);button.classList.remove('selected');}else{timelineSelection.push(id);button.classList.add('selected');}renderTimelineSequence();}
function renderTimelineSequence(){const out=document.getElementById('timelineOut');if(!out)return;out.textContent=timelineSelection.length?'Recovered sequence: '+timelineSelection.map(id=>timelineLabels[id]).join(' → '):'Recovered sequence: —';}
document.getElementById('timelineUndo')?.addEventListener('click',()=>{const id=timelineSelection.pop();if(id)document.querySelector(`.timeline-choice[data-id="${id}"]`)?.classList.remove('selected');renderTimelineSequence();});
document.getElementById('timelineReset')?.addEventListener('click',()=>{timelineSelection=[];document.querySelectorAll('.timeline-choice').forEach(b=>b.classList.remove('selected'));renderTimelineSequence();});
document.getElementById('timelineConfirm')?.addEventListener('click',()=>{if(timelineSelection.length!==4)return toast('Place all four events before confirming.');if(timelineSelection.join(',')===timelineOrder.join(',')){document.getElementById('timelineFb')?.classList.add('show');}else toast('The chronology is not correct yet. You can undo or reset and try again.');});

function locateGettysburg(){document.getElementById('mapfb').classList.add('show');document.getElementById('battleReveal').style.display='block';}
document.querySelectorAll('#a3rec .option').forEach(o=>o.addEventListener('click',()=>{if(o.dataset.correct)document.getElementById('a3fb').classList.add('show');else toast('Check the recovered battle record.')}));
let occasionSelected=null;
document.querySelectorAll('#occasionPool .note').forEach(n=>n.onclick=()=>{document.querySelectorAll('#occasionPool .note').forEach(x=>x.classList.remove('active'));n.classList.add('active');occasionSelected=n;});
document.querySelectorAll('.assign').forEach(z=>z.onclick=()=>{if(!occasionSelected)return toast('Select a recovered data card first.');if(z.dataset.answer===occasionSelected.dataset.value){z.textContent=z.textContent.split('?')[0]+'? '+occasionSelected.dataset.value;z.classList.add('filled');occasionSelected.style.display='none';occasionSelected=null;if([...document.querySelectorAll('.assign')].every(x=>x.classList.contains('filled')))document.getElementById('a4reconfb').classList.add('show');}else toast('That fragment belongs in another field.')});
let roles={};
document.querySelectorAll('.role').forEach(r=>r.onclick=()=>{roles[r.dataset.person]=r.dataset.role;document.querySelectorAll(`.role[data-person="${r.dataset.person}"]`).forEach(x=>x.classList.remove('selected'));r.classList.add('selected');if(roles.Lincoln&&roles.Everett){if(roles.Lincoln==='remarks'&&roles.Everett==='oration')document.getElementById('a5fb').classList.add('show');else toast('Check the surviving invitation and speaking roles.')}});
let caseSel=null, caseDone=new Set();
document.querySelectorAll('#casePool .note').forEach(n=>n.onclick=()=>{caseSel=n;document.querySelectorAll('#casePool .note').forEach(x=>x.classList.remove('active'));n.classList.add('active')});
document.querySelectorAll('.cat').forEach(c=>c.onclick=()=>{if(!caseSel)return toast('Select an evidence statement first.');if(c.dataset.cat===caseSel.dataset.cat){c.textContent=c.textContent+' · '+caseSel.textContent;caseSel.style.display='none';caseDone.add(c.dataset.cat);caseSel=null;if(caseDone.size===5)document.getElementById('a6fb').classList.add('show')}else toast('This evidence belongs in another category.')});
function openModal(id){document.getElementById(id).classList.add('show')} function closeModal(id){document.getElementById(id).classList.remove('show')}
let speechSel=null;
document.querySelectorAll('.speechfrag').forEach(n=>n.onclick=()=>{speechSel=n;document.querySelectorAll('.speechfrag').forEach(x=>x.classList.remove('active'));n.classList.add('active')});
document.querySelectorAll('.speechslot').forEach(z=>z.onclick=()=>{if(!speechSel)return toast('Select a recovered data fragment.');if(z.dataset.answer===speechSel.dataset.value){z.textContent=z.dataset.answer;z.classList.add('filled');speechSel.style.display='none';speechSel=null;if([...document.querySelectorAll('.speechslot')].every(x=>x.classList.contains('filled')))document.getElementById('b3fb').classList.add('show')}else toast('This fragment does not fit that record.')});
let reactionPassage='',reactionCat='';
document.querySelectorAll('#speechB5 .markable').forEach(m=>m.onclick=()=>{document.querySelectorAll('#speechB5 .markable').forEach(x=>x.classList.remove('marked'));m.classList.add('marked');reactionPassage=m.textContent});
document.querySelectorAll('#reactionCats .chip').forEach(c=>c.onclick=()=>{document.querySelectorAll('#reactionCats .chip').forEach(x=>x.classList.remove('active'));c.classList.add('active');reactionCat=c.textContent});
function saveFirstReaction(){const txt=document.getElementById('reactionText').value.trim();if(!reactionPassage||!txt||!reactionCat)return toast('Mark a passage, write a short explanation and choose a category.');localStorage.setItem('gettysburgFirstReaction',JSON.stringify({passage:reactionPassage,text:txt,category:reactionCat}));document.getElementById('b5fb').classList.add('show')}
function submitB6(){const choice=document.querySelector('#b6mc .selected');const just=document.getElementById('b6just').value.trim();if(!choice||just.length<20)return toast('Choose one statement and add a brief justification.');localStorage.setItem('gettysburgComprehension',JSON.stringify({choice:choice.textContent,justification:just}));document.getElementById('b6fb').classList.add('show')}
document.querySelectorAll('.boundary').forEach(b=>b.onclick=()=>b.classList.toggle('on'));
function checkBoundaries(){const ons=[...document.querySelectorAll('.boundary.on')].map(x=>x.dataset.b);if(ons.join(',')==='1,2,3,4')document.getElementById('c1fb').classList.add('show');else{hintCount++;toast('The structure is not complete yet. Look for shifts in time, focus or purpose.')}}
function showHint(){const f=document.getElementById('c1hint');f.classList.add('show');f.innerHTML=hintCount<2?'<b>HINT 1</b><br>A new section begins when Lincoln changes his time frame, his focus, or what he is trying to achieve.':'<b>HINT 2</b><br>Look for moves from the nation\'s beginnings → Civil War → Gettysburg itself → words to sacrifice → dead to living.'}
let funcSel=null,funcDone=0;
document.querySelectorAll('#funcPool .note').forEach(n=>n.onclick=()=>{funcSel=n;document.querySelectorAll('#funcPool .note').forEach(x=>x.classList.remove('active'));n.classList.add('active')});
document.querySelectorAll('.secslot').forEach(z=>z.onclick=()=>{if(!funcSel)return toast('Select a function card.');if(z.dataset.sec===funcSel.dataset.sec){z.textContent='SECTION '+z.dataset.sec+' · '+funcSel.textContent;z.classList.add('filled');funcSel.style.display='none';funcSel=null;funcDone++;if(funcDone===5)document.getElementById('c2fb').classList.add('show')}else toast('That function does not match this section.')});

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
let noteSel=null,noteDone=0;np.addEventListener('click',e=>{const n=e.target.closest('.note');if(!n)return;noteSel=n;[...np.children].forEach(x=>x.classList.remove('active'));n.classList.add('active')});document.querySelectorAll('.sorttarget').forEach(z=>z.onclick=()=>{if(!noteSel)return toast('Select a note first.');if(z.dataset.kind===noteSel.dataset.kind){noteSel.style.display='none';noteDone++;noteSel=null;if(noteDone===notes.length)document.getElementById('c3fb').classList.add('show')}else toast('Read for function: does the note state content, or explain development?')});
document.querySelectorAll('#cskillmc .option').forEach(o=>o.onclick=()=>{document.querySelectorAll('#cskillmc .option').forEach(x=>x.classList.remove('selected'));o.classList.add('selected');if(o.dataset.correct)document.getElementById('cskillfb').classList.add('show');else toast('This still describes summary rather than analysis.')})
let tempSel=null,tempPlaced=0;
document.querySelectorAll('#temporalPool .note').forEach(n=>n.onclick=()=>{tempSel=n;document.querySelectorAll('#temporalPool .note').forEach(x=>x.classList.remove('active'));n.classList.add('active')});document.querySelectorAll('.timetarget').forEach(z=>z.onclick=()=>{if(!tempSel)return toast('Select a recovered section.');if(z.dataset.time===tempSel.dataset.time){z.textContent+=' · '+tempSel.textContent;tempSel.style.display='none';tempSel=null;tempPlaced++;if(tempPlaced===5)document.getElementById('c4fb').classList.add('show')}else toast('Check the temporal movement again.')});
document.querySelectorAll('#cfinalmc .option').forEach(o=>o.onclick=()=>{document.querySelectorAll('#cfinalmc .option').forEach(x=>x.classList.remove('selected'));o.classList.add('selected');if(o.dataset.correct)document.getElementById('cfinalfb').classList.add('show');else toast('Look at the complete movement from founding ideals to future responsibility.')})
document.querySelectorAll('.d1mark').forEach(m=>m.onclick=()=>{if(m.dataset.correct){m.classList.add('marked');document.getElementById('d1markfb').classList.add('show')}else toast('Look for the repeated grammatical opening.')});
function completeD1(){if(document.getElementById('d1why').value.trim().length<20)return toast('Add a brief explanation first.');document.getElementById('d1fb').classList.add('show')}
function speakAntithesis(){if('speechSynthesis'in window){const u=new SpeechSynthesisUtterance('antithesis');u.lang='en-GB';speechSynthesis.speak(u)}}
let mainContrast=0;
document.querySelectorAll('.d3contrast').forEach(m=>m.onclick=()=>{m.classList.toggle('marked');mainContrast=[...document.querySelectorAll('.d3contrast.marked[data-main="1"]')].length;if(mainContrast===2)document.getElementById('d3fb').classList.add('show')});
function completeD4(){if(document.getElementById('d4a').value.trim().length<10||document.getElementById('d4b').value.trim().length<10)return toast('Add a brief response to both questions.');document.getElementById('d4fb').classList.add('show')}
function checkFinalKey(){if(document.getElementById('keyYear').value==='1863'&&document.getElementById('keyWords').value==='272')document.getElementById('keyfb').classList.add('show');else toast('The key combines the year of the speech and its word count.');}
const last=localStorage.getItem('gettysburgLast');if(last&&document.querySelector(`[data-id="${last}"]`))go(last);else updateProgress(document.querySelector('.screen.active'));renderKey();


// Robust screen navigation
document.addEventListener('click', function (event) {
  const button = event.target.closest('[data-next]');
  if (!button) return;
  const targetId = button.getAttribute('data-next');
  const target = document.querySelector('.screen[data-id="' + targetId + '"]');
  if (!target) return;
  document.querySelectorAll('.screen').forEach(function (screen) {
    screen.classList.remove('active');
  });
  target.classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// Global reversibility support for assignment-style tasks before final confirmation
document.querySelectorAll('.assign.filled,.secslot.filled,.speechslot.filled').forEach(()=>{});
