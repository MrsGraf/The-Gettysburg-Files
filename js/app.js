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

function unlockFragment(index,value,silent=false){
  GettysburgState.unlock(index,value);
  renderKey();
  if(!silent)toast(`Recovery fragment ${value} stored.`);
}

let recoveryOverlayAnimation=null;
function showRecoveryOverlay({caseId,fragment,nextId,nextLabel='CONTINUE TO NEXT FILE'}){
  const overlay=document.getElementById('recoveryOverlay');
  const percent=document.getElementById('recoveryPercent');
  const bar=document.getElementById('recoveryProgressBar');
  const title=document.getElementById('recoveryOverlayTitle');
  const status=document.getElementById('recoveryFileStatus');
  const caseLabel=document.getElementById('recoveryOverlayCase');
  const reveal=document.getElementById('fragmentReveal');
  const value=document.getElementById('fragmentRevealValue');
  const revealLabel=document.getElementById('fragmentRevealLabel');
  const revealNote=document.getElementById('fragmentRevealNote');
  const continueButton=document.getElementById('recoveryContinueButton');
  if(!overlay||!percent||!bar||!title||!status||!reveal||!value||!revealLabel||!revealNote||!continueButton)return;

  if(recoveryOverlayAnimation)cancelAnimationFrame(recoveryOverlayAnimation);
  overlay.classList.remove('recovered');
  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden','false');
  document.body.classList.add('recovery-overlay-open');
  caseLabel.textContent=`ARCHIVE FILE ${caseId}`;
  title.textContent='FILE RECOVERY IN PROGRESS';
  status.textContent='RESTORING ARCHIVE RECORD…';
  percent.textContent='0%';
  bar.style.width='0%';
  reveal.hidden=true;
  reveal.classList.remove('visible');
  value.textContent='';
  revealLabel.textContent=caseId==='D'?'FINAL KEY FRAGMENT RECOVERED':'MASTER KEY FRAGMENT RECOVERED';
  revealNote.textContent=caseId==='D'?'Master Key complete.':'Master Key updated.';
  continueButton.textContent=nextLabel;
  continueButton.disabled=true;

  const duration=2500;
  const start=performance.now();
  const animate=now=>{
    const t=Math.min(1,(now-start)/duration);
    // Ease-out cubic: brisk at first, subtly slower as recovery approaches 100%.
    const eased=1-Math.pow(1-t,3);
    const current=Math.min(100,Math.round(eased*100));
    percent.textContent=`${current}%`;
    bar.style.width=`${eased*100}%`;
    if(t<1){
      recoveryOverlayAnimation=requestAnimationFrame(animate);
      return;
    }

    percent.textContent='100%';
    bar.style.width='100%';
    overlay.classList.add('recovered');
    title.textContent='FILE RECOVERED';
    status.textContent='ARCHIVE RECORD RESTORED';

    setTimeout(()=>{
      value.textContent=fragment;
      reveal.hidden=false;
      void reveal.offsetWidth;
      reveal.classList.add('visible');
      unlockFragment(['A','B','C','D'].indexOf(caseId),fragment,true);
      continueButton.disabled=false;
    },500);
  };
  recoveryOverlayAnimation=requestAnimationFrame(animate);

  continueButton.onclick=()=>{
    overlay.classList.remove('show','recovered');
    overlay.setAttribute('aria-hidden','true');
    document.body.classList.remove('recovery-overlay-open');
    go(nextId);
  };
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
