let screens=[];
const CASE_OFFSETS={A:0,B:25,C:50,D:75};
const CASE_IDS=['A','B','C','D'];
const FILES=['prologue','archive-overview','case-a','case-b','case-c','case-d','final-key','epilogue'];
// In temporary review mode all four case files remain accessible, but their real
// fragments are only stored after the final task has triggered its recovery sequence.
const REVIEW_UNLOCK_ALL=GettysburgState.isTestMode();

async function loadCases(){
  const app=document.getElementById('app');
  const dynamicFiles=FILES.filter(file=>file!=='prologue');
  const html=await Promise.all(dynamicFiles.map(async file=>{
    const response=await fetch(`cases/${file}.html`);
    if(!response.ok) throw new Error(`Could not load ${file}.html`);
    return response.text();
  }));
  // The prologue is rendered directly in index.html so its background, overlay and
  // animation can start on the first paint. Append the remaining screens without
  // replacing or restarting the already visible prologue.
  app.insertAdjacentHTML('beforeend',html.join('\n'));
  document.body.classList.toggle('test-mode',GettysburgState.isTestMode());
  renderCaseOverviewRegisters();
  restoreCaseSnapshots();
  screens=[...document.querySelectorAll('.screen')];
  initNavigation();
  window.initCaseA?.();
  window.initCaseB?.();
  window.initCaseC?.();
  window.initCaseD?.();
  initFinalKey();
  initFinalArchiveOverlay();
  initDedicatedVocabularyHints();
  initFragmentReviewButtons();
  initVocabularyTooltips();
  initVerifyButtons();
  initInstructionGates();
  initAnalystBriefingIcons();
  initActionSemantics();
  renderArchiveOverview();
  await ensurePrologueBackgroundReady();
  document.body.classList.remove('booting-prologue');
  document.body.classList.add('cinematic-mode');
  document.body.classList.remove('archive-overview-mode');
  const prologue=document.querySelector('[data-id="prologue"]');
  if(prologue)updateProgress(prologue);
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

function initInstructionGates(){
  document.querySelectorAll('.screen[data-case]').forEach(screen=>{
    const id=screen.dataset.id||'';
    if(id.endsWith('0'))return;
    const intro=[...screen.children].find(element=>element.classList?.contains('narrative-setup'));
    if(!intro||intro.classList.contains('instruction-gate-ready'))return;

    intro.classList.add('instruction-gate-ready');
    const transmission=document.createElement('div');
    transmission.className='archive-briefing-label';
    transmission.innerHTML='<span class="archive-briefing-icon" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none"><path d="M20 6.5v16"/><circle cx="20" cy="29.5" r="2.2"/><path d="M11.5 12.5c-3 2.4-4.8 5.2-5.8 8.6M28.5 12.5c3 2.4 4.8 5.2 5.8 8.6M13.8 19c-1.4 1.2-2.5 2.6-3.2 4.2M26.2 19c1.4 1.2 2.5 2.6 3.2 4.2"/></svg></span><span>ARCHIVE BRIEFING</span>';
    intro.prepend(transmission);

    // Keep the original DOM structure intact. Moving a complete file into one
    // animated wrapper caused unstable repainting in iPad Safari and also broke
    // direct-child layout selectors. Hide only the existing sibling blocks.
    const gatedNodes=[];
    let node=intro.nextElementSibling;
    while(node){
      node.classList.add('instruction-gated-node');
      node.hidden=true;
      gatedNodes.push(node);
      node=node.nextElementSibling;
    }

    const gate=document.createElement('div');
    gate.className='instruction-gate-actions';
    const button=document.createElement('button');
    button.className='btn ghost instruction-gate-button';
    button.type='button';
    button.textContent='OPEN RECORD';
    button.setAttribute('aria-expanded','false');
    gate.appendChild(button);
    intro.appendChild(gate);

    button.addEventListener('click',()=>{
      gatedNodes.forEach(element=>{element.hidden=false;});
      button.setAttribute('aria-expanded','true');
      intro.classList.add('transmission-read');
      gate.innerHTML='<span class="instruction-gate-opened"><span aria-hidden="true">✓</span> RECORD OPENED</span>';
    });
  });
}

function initAnalystBriefingIcons(){
  const icon='<span class="analyst-briefing-icon" aria-hidden="true"><svg viewBox="0 0 40 40" fill="none"><path d="M11 7.5h18a2 2 0 0 1 2 2v23H9v-23a2 2 0 0 1 2-2Z"/><path d="M15 7.5V5.8h10v1.7M14 15h9M14 21h7M14 27h8"/><path d="m24.5 20.5 2.4 2.4 5-5"/></svg></span>';
  document.querySelectorAll('.analyst-briefing').forEach(block=>{
    let title=block.querySelector('.analyst-briefing-title');
    const small=block.querySelector(':scope > .smallcaps');
    if(!title&&small){
      title=document.createElement('div');
      title.className='analyst-briefing-title';
      small.replaceWith(title);title.appendChild(small);
    }
    if(title&&!title.querySelector('.analyst-briefing-icon'))title.insertAdjacentHTML('afterbegin',icon);
  });
}


function initActionSemantics(){
  const readyPatterns=[
    /^OPEN RECORD$/,
    /^OPEN NEXT/,
    /^OPEN RESTORED/,
    /^OPEN FILE/,
    /^OPEN MASTER/,
    /^BEGIN FINAL/,
    /^SCAN THE SPEECH/,
    /^EXAMINE THE NEXT/,
    /^CONTINUE TO/
  ];
  document.querySelectorAll('button').forEach(button=>{
    const label=(button.textContent||'').trim().toUpperCase();
    if(button.disabled||button.classList.contains('verify-action')||button.classList.contains('completed-action'))return;
    if(readyPatterns.some(pattern=>pattern.test(label)))button.classList.add('ready-action');
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

function updateFileOverviewPageMode(id){
  const overviewCases={A0:'a',B0:'b',C0:'c',D0:'d'};
  document.body.classList.remove('file-overview-mode','file-overview-a','file-overview-b','file-overview-c','file-overview-d');
  const caseClass=overviewCases[id];
  if(caseClass)document.body.classList.add('file-overview-mode',`file-overview-${caseClass}`);
}

function renderCaseOverviewRegisters(){
  if(!GettysburgState.isTestMode())return;
  const fragments=GettysburgState.getFragments();
  document.querySelectorAll('[data-test-status]').forEach(status=>{
    const row=status.closest('.evidence-row');
    const code=row?.querySelector('.evidence-code')?.textContent?.trim()||'';
    const caseIndex=CASE_IDS.indexOf(code.charAt(0));
    let state=status.dataset.testStatus;
    if(state==='available'&&caseIndex>=0&&fragments[caseIndex])state='restored';
    status.className=`evidence-status ${state}`;
    status.textContent=state.toUpperCase();
  });
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
  renderCaseOverviewRegisters();
  updateFileOverviewPageMode(id);
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
      let statusLabel=status.querySelector('.case-status-label');
      if(!statusLabel){
        statusLabel=document.createElement('div');
        statusLabel.className='case-status-label';
        while(status.firstChild)statusLabel.appendChild(status.firstChild);
        status.appendChild(statusLabel);
      }
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
  const count=GettysburgState.getRecoveredCount();
  keyMini.textContent=`MASTER KEY FRAGMENTS · ${count}/4 RECOVERED`;
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
      button.classList.remove('ghost','ready-action');
      button.classList.add('primary','completed-action');
    }else if(available){
      setArchiveFileStatus(status,'DAMAGED · AVAILABLE','available');
      button.textContent=`OPEN FILE ${caseId}`;
      button.disabled=false;
      button.classList.remove('ghost','completed-action');
      button.classList.add('primary','ready-action');
    }else{
      setArchiveFileStatus(status,'LOCKED','locked');
      button.textContent='LOCKED';
      button.disabled=true;
      button.classList.remove('primary','ready-action','completed-action');
      button.classList.add('ghost');
    }
  });

  const count=fragments.filter(Boolean).length;
  const overviewStatus=document.getElementById('archiveOverviewStatus');
  if(overviewStatus)overviewStatus.textContent=`ARCHIVE RECOVERY · ${count*25}%`;

  const masterCard=document.getElementById('masterKeyDirectoryCard');
  const masterButton=document.getElementById('overviewOpenMasterKey');
  const masterText=document.getElementById('masterKeyDirectoryText');
  const complete=count===4;
  masterCard?.classList.toggle('locked',!complete);
  masterCard?.classList.toggle('available',complete);
  const masterLockIcon=document.getElementById('masterKeyLockIcon');
  const masterLockText=document.getElementById('masterKeyLockText');
  if(masterLockIcon)masterLockIcon.className=`archive-lock-icon ${complete?'unlocked':'locked'}`;
  if(masterLockText)masterLockText.textContent=complete?'FINAL ARCHIVE RESTORATION · READY':'FINAL ARCHIVE RESTORATION · INCOMPLETE';
  if(masterButton){
    masterButton.disabled=!complete;
    masterButton.textContent=complete?'BEGIN FINAL RESTORATION':'LOCKED';
    masterButton.classList.toggle('ready-action',complete);
    masterButton.classList.toggle('primary',complete);
    masterButton.classList.toggle('ghost',!complete);
  }
  if(masterText)masterText.textContent=count===4
    ? 'All four case files have been restored. Their recovered fragments now form the sequence needed to reconstruct the Master Recovery Key. Use the key to reactivate the complete archive and restore full archive access. Tap to begin the final restoration.'
    : 'The complete archive can only be reactivated once the Master Recovery Key has been reconstructed. Each restored case file releases one fragment of the key. Recover all four case files to assemble the complete sequence.';
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
  renderCaseOverviewRegisters();
  initFragmentReviewButtons();
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
  const recordButton=document.getElementById('recordFragmentButton');
  const returnActions=document.getElementById('fragmentReturnActions');
  const continueButton=document.getElementById('recoveryContinueButton');
  if(!overlay||!percent||!bar||!title||!status||!reveal||!value||!revealLabel||!revealNote||!recordButton||!returnActions||!continueButton)return;

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
  revealLabel.textContent='MASTER KEY FRAGMENT RECOVERED';
  revealNote.textContent='Record this code fragment. You will need it later to reconstruct the Master Recovery Key and restore the complete archive.';
  recordButton.hidden=false;
  recordButton.disabled=true;
  recordButton.textContent='I HAVE RECORDED THE FRAGMENT';
  returnActions.hidden=true;
  continueButton.textContent=nextLabel;
  continueButton.disabled=true;
  continueButton.classList.remove('ready-action');

  const duration=5200;
  const start=performance.now();
  const animate=now=>{
    const t=Math.min(1,(now-start)/duration);
    const eased=1-Math.pow(1-t,2.15);
    const current=Math.min(100,Math.round(eased*100));
    percent.textContent=`${current}%`;
    bar.style.width=`${eased*100}%`;
    if(t<1){recoveryOverlayAnimation=requestAnimationFrame(animate);return;}

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
      recordButton.disabled=false;
    },850);
  };
  recoveryOverlayAnimation=requestAnimationFrame(animate);

  recordButton.onclick=()=>{
    recordButton.hidden=true;
    revealNote.textContent='Fragment recorded. It can be reopened from the restored case file if needed.';
    returnActions.hidden=false;
    continueButton.disabled=false;
    continueButton.classList.add('ready-action');
  };

  continueButton.onclick=()=>{
    overlay.classList.remove('show','recovered');
    overlay.setAttribute('aria-hidden','true');
    document.body.classList.remove('recovery-overlay-open');
    go(nextId);
  };
}

function initDedicatedVocabularyHints(){
  const containers=[...document.querySelectorAll('.speech,.section-speech,.c02-speech-sections,.cumulative-device-speech')];
  const seen=new Set();
  containers.forEach(container=>{
    if(seen.has(container))return;
    seen.add(container);
    const walker=document.createTreeWalker(container,NodeFilter.SHOW_TEXT,{acceptNode(node){
      if(!/\bdedicated\b/i.test(node.nodeValue||''))return NodeFilter.FILTER_REJECT;
      if(node.parentElement?.closest('.tooltip,[data-dedicated-hint]'))return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    const node=walker.nextNode();
    if(!node)return;
    const match=(node.nodeValue||'').match(/\bdedicated\b/i);
    if(!match)return;
    const before=node.nodeValue.slice(0,match.index);
    const after=node.nodeValue.slice(match.index+match[0].length);
    const fragment=document.createDocumentFragment();
    fragment.append(document.createTextNode(before));
    const span=document.createElement('span');
    span.className='tooltip';
    span.dataset.tip='officially set apart for a particular purpose';
    span.dataset.dedicatedHint='true';
    span.tabIndex=0;
    span.textContent=match[0];
    fragment.append(span,document.createTextNode(after));
    node.replaceWith(fragment);
  });
}

function initFragmentReviewButtons(){
  const fragmentValues={A:'18',B:'63',C:'27',D:'2'};
  document.querySelectorAll('[data-fragment-slot]').forEach(slot=>{
    const caseId=slot.dataset.fragmentSlot;
    const index=CASE_IDS.indexOf(caseId);
    if(index<0||!GettysburgState.isRecovered(index)){slot.hidden=true;return;}
    slot.hidden=false;
    slot.innerHTML=`<button class="btn ghost view-fragment-button" type="button">VIEW RECOVERED KEY FRAGMENT</button><div class="recovered-fragment-inline" hidden><span class="smallcaps">FILE ${caseId} · RECOVERED FRAGMENT</span><strong>${fragmentValues[caseId]}</strong><p>Record this fragment for the final archive restoration.</p></div>`;
    const button=slot.querySelector('.view-fragment-button');
    const panel=slot.querySelector('.recovered-fragment-inline');
    button?.addEventListener('click',()=>{
      panel.hidden=!panel.hidden;
      button.textContent=panel.hidden?'VIEW RECOVERED KEY FRAGMENT':'HIDE RECOVERED KEY FRAGMENT';
    });
  });
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
  const masterCard=document.getElementById('masterKeyDirectoryCard');
  const openRecovery=()=>{
    if(GettysburgState.getFragments().every(Boolean))showFinalArchiveKeyOverlay();
    else toast('Recover all four case files before opening the Master Recovery Key.');
  };

  if(openButton){
    openButton.removeAttribute('data-next');
    openButton.addEventListener('click',event=>{event.stopPropagation();openRecovery();});
  }
  masterCard?.addEventListener('click',event=>{
    if(event.target.closest('button')&&event.target!==openButton)return;
    openRecovery();
  });
  masterCard?.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();openRecovery();}
  });

  document.getElementById('finalArchiveEnterKey')?.addEventListener('click',verifyFinalArchiveKey);
  document.querySelectorAll('.final-fragment-input').forEach(input=>input.addEventListener('keydown',event=>{if(event.key==='Enter')verifyFinalArchiveKey();}));

  document.getElementById('returnToRestoredFiles')?.addEventListener('click',()=>{
    const overlay=document.getElementById('finalArchiveOverlay');
    overlay?.classList.remove('show');
    overlay?.setAttribute('aria-hidden','true');
    document.body.classList.remove('final-archive-overlay-open');
  });

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
  const enter=document.getElementById('finalArchiveEnterKey');
  const denied=document.getElementById('finalArchiveKeyDenied');
  document.querySelectorAll('.final-fragment-input').forEach(input=>{input.value='';input.disabled=false;});
  if(enter)enter.disabled=false;
  denied?.classList.remove('show');

  overlay.classList.add('show');
  overlay.setAttribute('aria-hidden','false');
  document.body.classList.add('final-archive-overlay-open');
  setTimeout(()=>document.getElementById('finalFragmentA')?.focus(),220);
}

function verifyFinalArchiveKey(){
  const ids=['finalFragmentA','finalFragmentB','finalFragmentC','finalFragmentD'];
  const expected=['18','63','27','2'];
  const values=ids.map(id=>(document.getElementById(id)?.value||'').replace(/[^0-9]/g,''));
  const ok=values.every((value,index)=>value===expected[index]);
  const denied=document.getElementById('finalArchiveKeyDenied');
  denied?.classList.toggle('show',!ok);
  if(!ok)return;
  ids.forEach(id=>{const input=document.getElementById(id);if(input)input.disabled=true;});
  const enter=document.getElementById('finalArchiveEnterKey');if(enter)enter.disabled=true;
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
