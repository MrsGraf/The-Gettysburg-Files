let screens=[];
const CASE_OFFSETS={A:0,B:25,C:50,D:75};
const CASE_IDS=['A','B','C','D'];
const FILES=['prologue','archive-overview','case-a','case-b','case-c','case-d','final-key','epilogue'];
// Temporary v42 review mode: A-C are restored; D is the only remaining file and must be completed
// through D05 so the final Master Recovery sequence can be tested from its real trigger.
const REVIEW_UNLOCK_ALL=false;

async function loadCases(){
  const app=document.getElementById('app');
  const html=await Promise.all(FILES.map(async file=>{
    const response=await fetch(`cases/${file}.html`);
    if(!response.ok) throw new Error(`Could not load ${file}.html`);
    return response.text();
  }));
  app.innerHTML=html.join('\n');
  restoreCaseSnapshots();
  screens=[...document.querySelectorAll('.screen')];
  initNavigation();
  window.initCaseA?.();
  window.initCaseB?.();
  window.initCaseC?.();
  window.initCaseD?.();
  initFinalKey();
  initFinalArchiveOverlay();
  initVocabularyTooltips();
  initVerifyButtons();
  renderArchiveOverview();
  await ensurePrologueBackgroundReady();
  document.body.classList.remove('booting-prologue');
  await nextAnimationFrame();
  go('prologue');
}

function nextAnimationFrame(){
  return new Promise(resolve=>requestAnimationFrame(()=>resolve()));
}

async function ensurePrologueBackgroundReady(){
  const url='assets/images/gettysburg-prologue-bg.webp';
  const image=new Image();
  image.src=url;
  try{
    if(image.decode) await image.decode();
    else if(!image.complete) await new Promise((resolve,reject)=>{image.onload=resolve;image.onerror=reject});
  }catch(e){
    // Keep the archive usable even if an image decode fails; the CSS fallback remains dark.
  }
  await nextAnimationFrame();
}

function initNavigation(){
  document.addEventListener('click',event=>{
    const next=event.target.closest('[data-next]');
    if(next&&!next.disabled) go(next.dataset.next);
  });
  document.addEventListener('click',event=>{
    const card=event.target.closest('.archive-file-card');
    if(!card||event.target.closest('button,a,input,textarea,select'))return;
    const button=card.querySelector('.archive-file-open');
    if(button&&!button.disabled)button.click();
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


function initVerifyButtons(){
  document.querySelectorAll('button').forEach(button=>{
    const label=(button.textContent||'').trim().toUpperCase();
    if(label.startsWith('VERIFY')||label==='VERIFIED'){
      button.classList.add('verify-action');
      if(label==='VERIFIED')button.classList.add('verified-action');
    }
  });
}

function markVerifyButton(button){
  if(!button)return;
  button.classList.add('verify-action','verified-action');
  button.classList.remove('primary');
  button.textContent='VERIFIED';
}
window.markVerifyButton=markVerifyButton;

function startPrologue(){
  const prologue=document.querySelector('[data-id="prologue"]');
  if(!prologue)return;
  prologue.classList.remove('run-intro');
  void prologue.offsetWidth;
  prologue.classList.add('run-intro');
}

function isCaseAccessible(caseId){
  const index=CASE_IDS.indexOf(caseId);
  if(index<0)return false;
  if(REVIEW_UNLOCK_ALL)return true;
  const fragments=GettysburgState.getFragments();
  if(fragments[index])return true;
  return fragments.slice(0,index).every(Boolean);
}

function go(id){
  let screen=document.querySelector(`[data-id="${CSS.escape(id)}"]`);
  if(!screen)return;

  if(screen.dataset.case&&!isCaseAccessible(screen.dataset.case)){
    toast('This archive file is still locked.');
    id='O0';
    screen=document.querySelector('[data-id="O0"]');
  }
  if(id==='K0'&&!GettysburgState.getFragments().every(Boolean)){
    toast('Recover all four case files before opening the Master Recovery Key.');
    id='O0';
    screen=document.querySelector('[data-id="O0"]');
  }

  if(id==='O0')renderArchiveOverview();
  screens.forEach(item=>item.classList.toggle('active',item.dataset.id===id));
  const cinematic=id==='prologue'||id==='E0';
  document.body.classList.toggle('cinematic-mode',cinematic);
  document.body.classList.toggle('archive-overview-mode',id==='O0');
  window.scrollTo({top:0,behavior:cinematic?'auto':'smooth'});
  updateProgress(screen);
  if(id==='prologue')startPrologue();

  const archiveHomeButton=document.getElementById('archiveHomeButton');
  if(archiveHomeButton)archiveHomeButton.hidden=!(screen.dataset.case||id==='K0');
}

function updateProgress(screen){
  const caseId=screen.dataset.case;
  const local=Math.max(0,Math.min(100,Number(screen.dataset.progress)||0));
  let overall=0;
  if(caseId&&CASE_OFFSETS[caseId]!==undefined) overall=CASE_OFFSETS[caseId]+local*.25;
  else if(screen.dataset.id==='O0') overall=GettysburgState.getRecoveredCount()*25;
  else if(screen.dataset.id==='K0'||screen.dataset.id==='E0') overall=100;
  const bar=document.getElementById('globalProgress');
  if(bar)bar.style.width=`${overall}%`;
  const label=document.getElementById('progressLabel');
  if(label)label.textContent=`${Math.round(overall)}%`;
  const section=document.getElementById('sectionLabel');
  if(section)section.textContent=screen.dataset.label||'Archive entry';
  const keyMini=document.getElementById('keyMini');
  const finalKeyComplete=GettysburgState.getFragments().every(Boolean);
  if(keyMini)keyMini.hidden=['prologue','K0','E0'].includes(screen.dataset.id)||(screen.dataset.id==='O0'&&finalKeyComplete);
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

function setArchiveFileStatus(statusEl,text,state){
  if(!statusEl)return;
  let icon=statusEl.querySelector('.archive-lock-icon');
  let label=statusEl.querySelector('.archive-file-state-text');
  if(!icon||!label){
    statusEl.innerHTML='<span class="archive-file-state-text"></span><span class="archive-lock-icon" aria-hidden="true"></span>';
    icon=statusEl.querySelector('.archive-lock-icon');
    label=statusEl.querySelector('.archive-file-state-text');
  }
  // Keep the status wording first and the lock symbol after it for clearer spacing.
  if(label.nextElementSibling!==icon) statusEl.appendChild(icon);
  icon.className=`archive-lock-icon ${state==='locked'?'locked':'unlocked'}`;
  label.textContent=text;
}

function renderArchiveOverview(){
  const overview=document.querySelector('[data-id="O0"]');
  if(!overview)return;
  const fragments=GettysburgState.getFragments();
  CASE_IDS.forEach((caseId,index)=>{
    const card=overview.querySelector(`[data-overview-case="${caseId}"]`);
    const status=document.getElementById(`overviewStatus${caseId}`);
    const button=document.getElementById(`overviewOpen${caseId}`);
    if(!card||!status||!button)return;
    const restored=Boolean(fragments[index]);
    const available=REVIEW_UNLOCK_ALL||(!restored&&fragments.slice(0,index).every(Boolean));
    card.classList.toggle('restored',restored);
    card.classList.toggle('available',available);
    card.classList.toggle('locked',!restored&&!available);
    if(restored){
      setArchiveFileStatus(status,'RESTORED','restored');
      button.textContent='OPEN RESTORED FILE';
      button.disabled=false;
      button.classList.remove('ghost');
      button.classList.add('primary');
    }else if(available){
      setArchiveFileStatus(status,'DAMAGED · AVAILABLE FOR RECOVERY','available');
      button.textContent=`OPEN FILE ${caseId}`;
      button.disabled=false;
      button.classList.remove('ghost');
      button.classList.add('primary');
    }else{
      setArchiveFileStatus(status,'LOCKED','locked');
      button.textContent='LOCKED';
      button.disabled=true;
    }
  });

  const count=fragments.filter(Boolean).length;
  const overviewStatus=document.getElementById('archiveOverviewStatus');
  if(overviewStatus)overviewStatus.innerHTML=`ARCHIVE RECOVERY<br>${count*25}%`;

  const masterCard=document.getElementById('masterKeyDirectoryCard');
  const masterButton=document.getElementById('overviewOpenMasterKey');
  const masterText=document.getElementById('masterKeyDirectoryText');
  const complete=count===4;
  masterCard?.classList.toggle('locked',!complete);
  masterCard?.classList.toggle('available',complete);
  const masterLockIcon=document.getElementById('masterKeyLockIcon');
  const masterLockText=document.getElementById('masterKeyLockText');
  if(masterLockIcon)masterLockIcon.className=`archive-lock-icon ${complete?'unlocked':'locked'}`;
  if(masterLockText)masterLockText.textContent=complete?'FINAL ARCHIVE ACCESS · UNLOCKED':'FINAL ARCHIVE ACCESS · LOCKED';
  if(masterButton){
    masterButton.disabled=!complete;
    masterButton.textContent=complete?'OPEN MASTER RECOVERY KEY':'LOCKED';
  }
  if(masterText)masterText.textContent=count===4
    ? 'All four case files have been restored. The recovered fragments can now unlock the final archive record.'
    : 'Recover all four case files to unlock the Master Recovery Key.';
}

function syncFormState(source,clone){
  const sourceControls=[...source.querySelectorAll('input,textarea,select')];
  const cloneControls=[...clone.querySelectorAll('input,textarea,select')];
  sourceControls.forEach((control,index)=>{
    const copy=cloneControls[index];
    if(!copy)return;
    if(control.matches('input')){
      if(control.type==='checkbox'||control.type==='radio'){
        if(control.checked)copy.setAttribute('checked','');else copy.removeAttribute('checked');
      }else copy.setAttribute('value',control.value);
      if(control.disabled)copy.setAttribute('disabled','');else copy.removeAttribute('disabled');
    }else if(control.matches('textarea')){
      copy.textContent=control.value;
      if(control.disabled)copy.setAttribute('disabled','');else copy.removeAttribute('disabled');
    }else if(control.matches('select')){
      [...copy.options].forEach((option,optionIndex)=>{
        if(control.options[optionIndex]?.selected)option.setAttribute('selected','');else option.removeAttribute('selected');
      });
      if(control.disabled)copy.setAttribute('disabled','');else copy.removeAttribute('disabled');
    }
  });
}

function persistCaseSnapshot(caseId){
  const caseScreens=[...document.querySelectorAll(`.screen[data-case="${caseId}"]`)];
  if(!caseScreens.length)return;
  const snapshot={screens:{}};
  caseScreens.forEach(screen=>{
    const clone=screen.cloneNode(true);
    syncFormState(screen,clone);
    snapshot.screens[screen.dataset.id]=clone.innerHTML;
  });
  GettysburgState.saveCaseSnapshot(caseId,snapshot);
}

function restoreCaseSnapshots(){
  CASE_IDS.forEach((caseId,index)=>{
    if(!GettysburgState.isRecovered(index))return;
    const snapshot=GettysburgState.getCaseSnapshot(caseId);
    if(!snapshot?.screens)return;
    Object.entries(snapshot.screens).forEach(([id,html])=>{
      const screen=document.querySelector(`.screen[data-id="${CSS.escape(id)}"]`);
      if(screen)screen.innerHTML=html;
    });
  });
}

function unlockFragment(index,value,silent=false){
  GettysburgState.unlock(index,value);
  renderKey();
  renderArchiveOverview();
  if(!silent)toast(`Recovery fragment ${value} stored.`);
}

let recoveryOverlayAnimation=null;
function showRecoveryOverlay({caseId,fragment,nextId='O0',nextLabel='RETURN TO ARCHIVE'}){
  const caseIndex=CASE_IDS.indexOf(caseId);
  if(caseIndex>=0&&GettysburgState.isRecovered(caseIndex)){
    renderArchiveOverview();
    go('O0');
    return;
  }

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

  const duration=5200;
  const start=performance.now();
  const animate=now=>{
    const t=Math.min(1,(now-start)/duration);
    // Cinematic recovery curve: steady enough to read, then subtly slower as recovery approaches 100%.
    const eased=1-Math.pow(1-t,2.15);
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
      persistCaseSnapshot(caseId);
      unlockFragment(caseIndex,fragment,true);
      continueButton.disabled=false;
    },850);
  };
  recoveryOverlayAnimation=requestAnimationFrame(animate);

  continueButton.onclick=()=>{
    overlay.classList.remove('show','recovered');
    overlay.setAttribute('aria-hidden','true');
    document.body.classList.remove('recovery-overlay-open');
    go(nextId);
    if(caseId==='D'&&nextId==='O0'){
      // D supplies the final fragment. Let the restored overview register first, then launch
      // the one-time final Master Recovery protocol over the archive directory.
      setTimeout(()=>showFinalArchiveKeyOverlay(),700);
    }
  };
}

function initVocabularyTooltips(){
  let floating=document.getElementById('vocabTooltipFloating');
  if(!floating){
    floating=document.createElement('div');
    floating.id='vocabTooltipFloating';
    floating.className='vocab-tooltip-floating';
    floating.setAttribute('role','tooltip');
    floating.hidden=true;
    document.body.appendChild(floating);
  }

  let activeTrigger=null;

  const positionFloating=()=>{
    if(!activeTrigger||floating.hidden)return;
    const triggerRect=activeTrigger.getBoundingClientRect();
    const pad=12;
    const gap=8;

    floating.style.left='0px';
    floating.style.top='0px';
    const tipRect=floating.getBoundingClientRect();

    let left=triggerRect.left+(triggerRect.width-tipRect.width)/2;
    left=Math.max(pad,Math.min(left,window.innerWidth-tipRect.width-pad));

    let top=triggerRect.top-tipRect.height-gap;
    if(top<pad) top=triggerRect.bottom+gap;
    top=Math.max(pad,Math.min(top,window.innerHeight-tipRect.height-pad));

    floating.style.left=`${Math.round(left)}px`;
    floating.style.top=`${Math.round(top)}px`;
  };

  const showTooltip=trigger=>{
    const text=(trigger?.dataset.tip||'').trim();
    if(!text)return;
    activeTrigger=trigger;
    floating.textContent=text;
    floating.hidden=false;
    trigger.setAttribute('aria-describedby',floating.id);
    requestAnimationFrame(positionFloating);
  };

  const hideTooltip=trigger=>{
    if(trigger&&activeTrigger!==trigger)return;
    activeTrigger?.removeAttribute('aria-describedby');
    activeTrigger=null;
    floating.hidden=true;
  };

  document.addEventListener('pointerover',event=>{
    const trigger=event.target.closest?.('.tooltip[data-tip]');
    if(trigger)showTooltip(trigger);
  });
  document.addEventListener('pointerout',event=>{
    const trigger=event.target.closest?.('.tooltip[data-tip]');
    if(trigger&&!trigger.contains(event.relatedTarget))hideTooltip(trigger);
  });
  document.addEventListener('focusin',event=>{
    const trigger=event.target.closest?.('.tooltip[data-tip]');
    if(trigger)showTooltip(trigger);
  });
  document.addEventListener('focusout',event=>{
    const trigger=event.target.closest?.('.tooltip[data-tip]');
    if(trigger)hideTooltip(trigger);
  });

  window.addEventListener('resize',positionFloating,{passive:true});
  window.addEventListener('scroll',positionFloating,{passive:true,capture:true});
}

function initFinalKey(){
  // Legacy K0 screen remains as a fallback, but the normal final flow now happens as an overlay
  // on the restored Archive Overview.
  const button=document.getElementById('enterMasterKey');
  button?.addEventListener('click',()=>{
    const input=document.getElementById('masterKeyInput');
    const value=(input?.value||'').replace(/[^0-9]/g,'');
    const ok=value==='1863272';
    document.getElementById('masterKeyDenied')?.classList.toggle('show',!ok);
    document.getElementById('masterKeyAccepted')?.classList.toggle('show',ok);
    if(ok){input.disabled=true;button.disabled=true;}
  });
}

let finalArchiveRecoveryAnimation=null;
let finalArchiveOverlayCompleted=false;

function initFinalArchiveOverlay(){
  const openButton=document.getElementById('overviewOpenMasterKey');
  if(openButton){
    openButton.removeAttribute('data-next');
    openButton.addEventListener('click',()=>{
      if(GettysburgState.getFragments().every(Boolean))showFinalArchiveKeyOverlay();
      else toast('Recover all four case files before opening the Master Recovery Key.');
    });
  }

  const enter=document.getElementById('finalArchiveEnterKey');
  const input=document.getElementById('finalArchiveKeyInput');
  enter?.addEventListener('click',verifyFinalArchiveKey);
  input?.addEventListener('keydown',event=>{if(event.key==='Enter')verifyFinalArchiveKey();});

  document.getElementById('openEpilogueFromRecovery')?.addEventListener('click',()=>{
    const overlay=document.getElementById('finalArchiveOverlay');
    overlay?.classList.remove('show');
    overlay?.setAttribute('aria-hidden','true');
    document.body.classList.remove('final-archive-overlay-open');
    go('E0');
  });
}

function showFinalArchiveKeyOverlay(){
  if(!GettysburgState.getFragments().every(Boolean))return;
  const overlay=document.getElementById('finalArchiveOverlay');
  if(!overlay)return;
  if(finalArchiveRecoveryAnimation)cancelAnimationFrame(finalArchiveRecoveryAnimation);
  finalArchiveRecoveryAnimation=null;
  finalArchiveOverlayCompleted=false;

  const entry=document.getElementById('finalArchiveKeyPhase');
  const recovery=document.getElementById('finalArchiveRecoveryPhase');
  const complete=document.getElementById('finalArchiveCompletePhase');
  if(entry)entry.hidden=false;
  if(recovery)recovery.hidden=true;
  if(complete)complete.hidden=true;
  const input=document.getElementById('finalArchiveKeyInput');
  const enter=document.getElementById('finalArchiveEnterKey');
  const denied=document.getElementById('finalArchiveKeyDenied');
  if(input){input.value='';input.disabled=false;}
  if(enter)enter.disabled=false;
  denied?.classList.remove('show');

  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden','false');
  document.body.classList.add('final-archive-overlay-open');
  setTimeout(()=>input?.focus(),220);
}

function verifyFinalArchiveKey(){
  const input=document.getElementById('finalArchiveKeyInput');
  const enter=document.getElementById('finalArchiveEnterKey');
  const value=(input?.value||'').replace(/[^0-9]/g,'');
  const ok=value==='1863272';
  const denied=document.getElementById('finalArchiveKeyDenied');
  denied?.classList.toggle('show',!ok);
  if(!ok)return;
  if(input)input.disabled=true;
  if(enter)enter.disabled=true;
  setTimeout(runFullArchiveRecovery,450);
}

function runFullArchiveRecovery(){
  const entry=document.getElementById('finalArchiveKeyPhase');
  const recovery=document.getElementById('finalArchiveRecoveryPhase');
  const complete=document.getElementById('finalArchiveCompletePhase');
  const percent=document.getElementById('finalArchiveRecoveryPercent');
  const bar=document.getElementById('finalArchiveRecoveryBar');
  const status=document.getElementById('finalArchiveRecoveryStatus');
  if(!recovery||!percent||!bar)return;
  if(entry)entry.hidden=true;
  recovery.hidden=false;
  if(complete)complete.hidden=true;
  percent.textContent='0%';
  bar.style.width='0%';
  if(status)status.textContent='RECONSTRUCTING COMPLETE ARCHIVE…';

  const duration=6200;
  const start=performance.now();
  const animate=now=>{
    const t=Math.min(1,(now-start)/duration);
    const eased=1-Math.pow(1-t,1.82);
    const current=t<1?Math.min(99,Math.round(eased*100)):100;
    percent.textContent=`${current}%`;
    bar.style.width=`${current}%`;
    if(t<1){finalArchiveRecoveryAnimation=requestAnimationFrame(animate);return;}
    percent.textContent='100%';
    bar.style.width='100%';
    if(status)status.textContent='ARCHIVE INTEGRITY RESTORED';
    finalArchiveOverlayCompleted=true;
    setTimeout(()=>{
      recovery.hidden=true;
      if(complete){complete.hidden=false;complete.classList.add('phase-visible');}
    },900);
  };
  finalArchiveRecoveryAnimation=requestAnimationFrame(animate);
}

let toastTimer=null;
function toast(text,duration=2200){
  const el=document.getElementById('toast');
  if(!el)return;
  if(toastTimer)clearTimeout(toastTimer);
  el.textContent=text;
  el.classList.add('show');
  toastTimer=setTimeout(()=>el.classList.remove('show'),duration);
}
function spellingAccepted(correctSpelling){
  toast(`ANSWER ACCEPTED\nCheck the spelling: ${correctSpelling}`,2800);
}
function openModal(id){document.getElementById(id)?.classList.add('show')}
function closeModal(id){document.getElementById(id)?.classList.remove('show')}

function initImageSliders(){
  document.querySelectorAll('[data-slider]').forEach(slider=>{
    const slides=[...slider.querySelectorAll('.slider-slide')];
    const count=slider.querySelector('[data-slider-count]');
    let index=0;
    const update=()=>{
      slides.forEach((slide,i)=>slide.classList.toggle('active',i===index));
      if(count)count.textContent=`${index+1} / ${slides.length}`;
    };
    slider.querySelector('[data-slider-prev]')?.addEventListener('click',()=>{
      index=(index-1+slides.length)%slides.length;update();
    });
    slider.querySelector('[data-slider-next]')?.addEventListener('click',()=>{
      index=(index+1)%slides.length;update();
    });
    update();
  });
}

initImageSliders();

loadCases().catch(error=>{
  document.getElementById('app').innerHTML=`<div class="card"><b>Archive loading failed.</b><p>${error.message}</p></div>`;
});
