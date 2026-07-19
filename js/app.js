let screens=[];
const CASE_OFFSETS={A:0,B:25,C:50,D:75};
const FILES=['prologue','case-a','case-b','case-c','case-d','final-key','epilogue'];

async function loadCases(){
  const app=document.getElementById('app');
  const html=await Promise.all(FILES.map(async file=>{
    const response=await fetch(`cases/${file}.html`);
    if(!response.ok) throw new Error(`Could not load ${file}.html`);
    return response.text();
  }));
  app.innerHTML=html.join('\n');
  screens=[...document.querySelectorAll('.screen')];
  initNavigation();
  window.initCaseA?.();
  window.initCaseB?.();
  window.initCaseC?.();
  window.initCaseD?.();
  initFinalKey();
  go('prologue');
}

function initNavigation(){
  document.addEventListener('click',event=>{
    const next=event.target.closest('[data-next]');
    if(next&&!next.disabled) go(next.dataset.next);
  });
  document.querySelectorAll('.options').forEach(box=>box.addEventListener('click',event=>{
    const option=event.target.closest('.option');
    if(!option)return;
    box.querySelectorAll('.option').forEach(x=>x.classList.remove('selected'));
    option.classList.add('selected');
    if(option.dataset.correct){
      const feedbackId=box.dataset.feedback||box.id.replace(/mc$/,'mcfb').replace(/opts$/,'fb');
      document.getElementById(feedbackId)?.classList.add('show');
    }else toast('Recheck the evidence.');
  }));
}

function startPrologue(){
  const prologue=document.querySelector('[data-id="prologue"]');
  if(!prologue)return;
  prologue.classList.remove('run-intro');
  void prologue.offsetWidth;
  prologue.classList.add('run-intro');
}

function go(id){
  screens.forEach(screen=>screen.classList.toggle('active',screen.dataset.id===id));
  const screen=document.querySelector(`[data-id="${CSS.escape(id)}"]`);
  if(!screen)return;
  const cinematic=id==='prologue'||id==='E0';
  document.body.classList.toggle('cinematic-mode',cinematic);
  window.scrollTo({top:0,behavior:cinematic?'auto':'smooth'});
  updateProgress(screen);
  if(id==='prologue') startPrologue();
}

function updateProgress(screen){
  const caseId=screen.dataset.case;
  const local=Math.max(0,Math.min(100,Number(screen.dataset.progress)||0));
  let overall=0;
  if(caseId&&CASE_OFFSETS[caseId]!==undefined) overall=CASE_OFFSETS[caseId]+local*.25;
  else if(screen.dataset.id==='K0'||screen.dataset.id==='E0') overall=100;
  const bar=document.getElementById('globalProgress');
  if(bar)bar.style.width=`${overall}%`;
  const label=document.getElementById('progressLabel');
  if(label)label.textContent=`${Math.round(overall)}%`;
  const section=document.getElementById('sectionLabel');
  if(section)section.textContent=screen.dataset.label||'Archive entry';
  const keyMini=document.getElementById('keyMini');
  if(keyMini)keyMini.hidden=['prologue','K0','E0'].includes(screen.dataset.id);
  renderKey();

  if(caseId&&CASE_OFFSETS[caseId]!==undefined){
    const status=screen.querySelector('.archivehead .status');
    if(status&&!status.querySelector('.case-progress-mini')){
      const mini=document.createElement('div');
      mini.className='case-progress-mini';
      mini.innerHTML=`<span>CASE FILE ${caseId} RECOVERY</span><div class="progressline"><div class="progressbar" style="width:${local}%"></div></div><strong>${local}%</strong>`;
      status.appendChild(mini);
    }else if(status){
      const mini=status.querySelector('.case-progress-mini');
      mini?.querySelector('.progressbar')?.style.setProperty('width',`${local}%`);
      const strong=mini?.querySelector('strong');if(strong)strong.textContent=`${local}%`;
    }
  }
}

function renderKey(){
  const keyMini=document.getElementById('keyMini');
  if(!keyMini)return;
  keyMini.textContent=GettysburgState.getFragments().map((value,index)=>value||['██','██','██','█'][index]).join(' · ');
}

function unlockFragment(index,value){
  GettysburgState.unlock(index,value);
  renderKey();
  toast(`Recovery fragment ${value} stored.`);
}

function initFinalKey(){
  const button=document.getElementById('enterMasterKey');
  button?.addEventListener('click',()=>{
    const input=document.getElementById('masterKeyInput');
    const value=(input?.value||'').replace(/[^0-9]/g,'');
    const ok=value==='1863272';
    document.getElementById('masterKeyDenied')?.classList.toggle('show',!ok);
    document.getElementById('masterKeyAccepted')?.classList.toggle('show',ok);
    if(ok){
      input.disabled=true;
      button.disabled=true;
    }
  });
}

function toast(text){
  const el=document.getElementById('toast');
  if(!el)return;
  el.textContent=text;el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'),1800);
}
function openModal(id){document.getElementById(id)?.classList.add('show')}
function closeModal(id){document.getElementById(id)?.classList.remove('show')}

loadCases().catch(error=>{
  document.getElementById('app').innerHTML=`<div class="card"><b>Archive loading failed.</b><p>${error.message}</p></div>`;
});
