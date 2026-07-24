window.initCaseC=function(){
  const correctBoundaries=new Set(['1','2','5','8']);
  const boundaries=[...document.querySelectorAll('#c1text .boundary')];

  function toggleBoundary(boundary){
    if(boundary.classList.contains('on')){
      boundary.classList.remove('on');
      boundary.setAttribute('aria-pressed','false');
      return;
    }
    const selected=boundaries.filter(x=>x.classList.contains('on'));
    if(selected.length>=4)return toast('Select exactly four section boundaries.');
    boundary.classList.add('on');
    boundary.setAttribute('aria-pressed','true');
  }

  boundaries.forEach(boundary=>{
    boundary.setAttribute('aria-pressed','false');
    boundary.addEventListener('click',()=>toggleBoundary(boundary));
    boundary.addEventListener('keydown',event=>{
      if(event.key==='Enter'||event.key===' '){event.preventDefault();toggleBoundary(boundary);}
    });
  });

  document.getElementById('confirmBoundaries')?.addEventListener('click',()=>{
    const selected=boundaries.filter(x=>x.classList.contains('on')).map(x=>x.dataset.b);
    if(selected.length!==4)return toast('Select exactly four section boundaries.');
    const ok=selected.length===correctBoundaries.size&&selected.every(x=>correctBoundaries.has(x));
    document.getElementById('c1structureRetry')?.classList.toggle('show',!ok);
    const summaries=document.getElementById('sectionSummaries');
    if(summaries)summaries.hidden=!ok;
    if(ok){
      markVerifyButton(document.getElementById('confirmBoundaries'));
      document.getElementById('c1StructureTask')?.classList.add('recovered');
      boundaries.forEach(b=>{b.style.pointerEvents='none';b.setAttribute('tabindex','-1');});
    }
  });

  document.getElementById('showStructureHint')?.addEventListener('click',event=>{
    const hint=document.getElementById('c1hint');
    if(hint){
      hint.classList.add('show');
      hint.innerHTML='<b>HINT</b><br>Look for larger changes in what Lincoln is talking about: a new situation, a new focus or a new stage in the speech. More than one division can be argued for, but the archive needs one shared reference structure for the next steps.';
    }
    event.currentTarget.disabled=true;
  });

  function normalizeText(value){
    return String(value||'')
      .toLowerCase()
      .replace(/[’‘`]/g,"'")
      .replace(/[^a-z0-9'\s-]/g,' ')
      .replace(/\s+/g,' ')
      .trim();
  }

  let summaryMatrix=null;
  let summaryMatrixLoadError=false;
  const summaryAttempts=[0,0,0,0,0];
  const summaryVerified=[false,false,false,false,false];
  let summaryIndex=0;
  let summaryComplete=false;

  const summaryMatrixPromise=fetch('data/c01-answer-matrix.json',{cache:'no-store'})
    .then(response=>{
      if(!response.ok)throw new Error(`HTTP ${response.status}`);
      return response.json();
    })
    .then(data=>{summaryMatrix=data;return data;})
    .catch(error=>{
      console.error('Could not load C01 answer matrix:',error);
      summaryMatrixLoadError=true;
      return null;
    });

  function normalizeSummaryText(value){
    let text=normalizeText(value);
    if(!summaryMatrix)return text;

    const fillers=summaryMatrix.normalization?.fillers||[];
    let changed=true;
    while(changed){
      changed=false;
      for(const filler of fillers){
        const f=normalizeText(filler);
        if(text===f){text='';changed=true;break;}
        if(text.startsWith(`${f} `)){
          text=text.slice(f.length).trim();
          changed=true;
          break;
        }
      }
    }

    const contractions=summaryMatrix.normalization?.contractions||{};
    text=text.split(' ').map(token=>contractions[token]||token).join(' ');

    const wordForms=summaryMatrix.normalization?.wordForms||{};
    text=text.split(' ').map(token=>wordForms[token]||token).join(' ');
    return text.replace(/\s+/g,' ').trim();
  }

  function containsPhrase(text,phrase){
    const target=normalizeSummaryText(phrase);
    if(!target)return false;
    return (` ${text} `).includes(` ${target} `)||text.includes(target);
  }

  function matchesAny(text,phrases=[]){
    return phrases.some(phrase=>containsPhrase(text,phrase));
  }

  function matchesCombination(text,combination){
    return (combination.groups||[]).every(group=>group.some(term=>containsPhrase(text,term)));
  }

  function evaluateSummary(value,index){
    const section=summaryMatrix?.sections?.[index];
    if(!section)return {status:'unavailable'};
    const text=normalizeSummaryText(value);
    if(!text)return {status:'empty'};

    if(matchesAny(text,section.acceptPhrases)||
       (section.acceptCombinations||[]).some(rule=>matchesCombination(text,rule))){
      return {status:'accepted'};
    }

    const specific=(section.specificRefine||[]).find(rule=>matchesAny(text,rule.phrases));
    if(specific)return {status:'refine',specificHint:specific.hint};

    const rethink=(section.rethink||[]).find(rule=>matchesAny(text,rule.phrases));
    if(rethink)return {status:'rethink',specificHint:rethink.hint};

    if(matchesAny(text,section.refinePhrases))return {status:'refine'};
    return {status:'unknown'};
  }

  function renderSummarySlide(index){
    summaryIndex=index;
    document.querySelectorAll('.section-summary-slide').forEach((slide,slideIndex)=>{
      const active=slideIndex===index;
      slide.hidden=!active;
      slide.classList.toggle('active',active);
    });
    const counter=document.getElementById('summaryCounter');
    if(counter)counter.textContent=`${String(index+1).padStart(2,'0')} / 05`;
    const status=document.getElementById('summarySlideStatus');
    if(status){
      status.textContent=summaryComplete?'RECOVERED':(summaryVerified[index]?'VERIFIED':'IN PROGRESS');
      status.classList.toggle('verified',summaryComplete||summaryVerified[index]);
    }
    const nav=document.querySelector('.summary-slider-nav');
    nav?.classList.toggle('completed',summaryComplete && index===4);
    const prev=document.getElementById('previousSummarySection');
    if(prev)prev.disabled=index===0;
    const next=document.getElementById('nextSummarySection');
    if(next){
      next.hidden=!summaryVerified[index];
      next.textContent=index===4?'COMPLETE CONTENT REVIEW':'NEXT SECTION';
    }
  }

  function showSummaryFeedback(index,message,kind='refine'){
    const feedback=document.getElementById(`summaryFeedback${index+1}`);
    if(!feedback)return;
    feedback.classList.add('show');
    feedback.classList.toggle('summary-rethink',kind==='rethink');
    const heading=kind==='rethink'?'LOOK AGAIN':'REFINE YOUR SUMMARY';
    feedback.innerHTML=`<b>${heading}</b><br>${message}`;
  }

  function clearSummaryFeedback(index){
    const feedback=document.getElementById(`summaryFeedback${index+1}`);
    feedback?.classList.remove('show','summary-rethink');
  }

  function verifySummary(index){
    if(summaryMatrixLoadError){
      toast('The C01 answer matrix could not be loaded. Reload the page and try again.');
      return;
    }
    if(!summaryMatrix){
      toast('Loading the C01 answer matrix …');
      summaryMatrixPromise.then(()=>{if(summaryMatrix)verifySummary(index);});
      return;
    }

    const input=document.getElementById(`summarySection${index+1}`);
    const result=evaluateSummary(input?.value,index);
    const section=summaryMatrix.sections[index];

    if(result.status==='accepted'){
      summaryVerified[index]=true;
      clearSummaryFeedback(index);
      document.getElementById(`summaryAccepted${index+1}`)?.classList.add('show');
      if(input)input.disabled=true;
      markVerifyButton(document.getElementById(`verifySummary${index+1}`));
      const next=document.getElementById('nextSummarySection');
      if(next)next.hidden=false;
      const status=document.getElementById('summarySlideStatus');
      if(status){status.textContent='VERIFIED';status.classList.add('verified');}
      return;
    }

    summaryAttempts[index]++;
    if(result.status==='empty'){
      showSummaryFeedback(index,summaryAttempts[index]>1?section.hint2:section.hint1);
      return;
    }
    if(result.specificHint){
      showSummaryFeedback(index,result.specificHint,result.status);
      return;
    }
    const hint=summaryAttempts[index]>1?section.hint2:section.hint1;
    showSummaryFeedback(index,hint,result.status);
  }

  [1,2,3,4,5].forEach(number=>{
    document.getElementById(`verifySummary${number}`)?.addEventListener('click',()=>verifySummary(number-1));
  });

  document.getElementById('previousSummarySection')?.addEventListener('click',()=>{
    if(summaryIndex>0)renderSummarySlide(summaryIndex-1);
  });

  document.getElementById('nextSummarySection')?.addEventListener('click',()=>{
    if(!summaryVerified[summaryIndex])return;
    if(summaryIndex<4){
      renderSummarySlide(summaryIndex+1);
      document.getElementById('sectionSummarySlider')?.scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }
    summaryComplete=true;
    document.getElementById('sectionSummarySlider')?.classList.add('recovered');
    renderSummarySlide(summaryIndex);
    document.getElementById('sectionSummariesRecovered')?.classList.add('show');
    document.getElementById('sectionSummariesRecovered')?.scrollIntoView({behavior:'smooth',block:'start'});
  });

  summaryMatrixPromise.then(()=>renderSummarySlide(0));

    function normalizeTimeWord(value){return String(value||'').trim().toLowerCase().replace(/[^a-z]/g,'');}
  function closeEnough(actual,target){
    if(actual===target)return true;
    if(Math.abs(actual.length-target.length)>1)return false;
    let i=0,j=0,diffs=0;
    while(i<actual.length&&j<target.length){
      if(actual[i]===target[j]){i++;j++;continue;}
      diffs++;if(diffs>1)return false;
      if(actual.length>target.length)i++;
      else if(actual.length<target.length)j++;
      else{i++;j++;}
    }
    if(i<actual.length||j<target.length)diffs++;
    return diffs<=1;
  }

  document.getElementById('showTimeHint')?.addEventListener('click',event=>{
    const hint=document.getElementById('timeHint');
    if(hint){
      hint.classList.add('show');
      hint.innerHTML='<b>HINT</b><br>Think about when Lincoln\'s ideas are located. Does he look back, describe the situation of his own time, or look ahead?';
    }
    event.currentTarget.disabled=true;
  });

  document.getElementById('verifyTimeStructure')?.addEventListener('click',()=>{
    const values=['timePast','timePresent','timeFuture'].map(id=>normalizeTimeWord(document.getElementById(id)?.value));
    const targets=['past','present','future'];
    const ok=values.every((value,index)=>closeEnough(value,targets[index]));
    document.getElementById('timeStructureRetry')?.classList.toggle('show',!ok);
    const restored=document.getElementById('macroStructureRecovered');
    if(restored)restored.hidden=!ok;
    const assignment=document.getElementById('macroSectionAssignment');
    if(assignment)assignment.hidden=!ok;
    if(ok){
      markVerifyButton(document.getElementById('verifyTimeStructure'));
      ['timePast','timePresent','timeFuture'].forEach(id=>{const el=document.getElementById(id);if(el)el.disabled=true;});
      const hintButton=document.getElementById('showTimeHint');
      if(hintButton)hintButton.hidden=true;
    }
  });

  const sectionMapping={};
  let selectedMapSection=null;
  let selectedMapPhase=null;

  function renderSectionMapping(){
    document.querySelectorAll('[data-map-section]').forEach(el=>{
      const n=Number(el.dataset.mapSection), phase=sectionMapping[n];
      el.classList.toggle('map-selected',selectedMapSection===n);
      el.querySelector('.c02-section-phase-badge')?.remove();
      if(phase){
        const badge=document.createElement('span');
        badge.className='c02-section-phase-badge'; badge.textContent=phase.toUpperCase();
        el.querySelector('.smallcaps')?.appendChild(badge);
      }
    });
    document.querySelectorAll('.macro-phase').forEach(el=>el.classList.toggle('selected',selectedMapPhase===el.dataset.phase));
    ['past','present','future'].forEach(phase=>{
      const slot=document.querySelector(`[data-phase-slots="${phase}"]`); if(!slot)return;
      slot.innerHTML=Object.entries(sectionMapping).filter(([,p])=>p===phase).map(([n])=>`<span class="phase-section-chip">SECTION ${n}</span>`).join('');
    });
  }
  function connectMappingIfReady(){
    if(selectedMapSection && selectedMapPhase){sectionMapping[selectedMapSection]=selectedMapPhase;selectedMapSection=null;selectedMapPhase=null;renderSectionMapping();}
  }
  document.querySelectorAll('[data-map-section]').forEach(el=>{
    const choose=()=>{selectedMapSection=Number(el.dataset.mapSection);renderSectionMapping();connectMappingIfReady();};
    el.addEventListener('click',choose); el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();choose();}});
  });
  document.querySelectorAll('.macro-phase').forEach(el=>el.addEventListener('click',()=>{selectedMapPhase=el.dataset.phase;renderSectionMapping();connectMappingIfReady();}));
  document.getElementById('verifySectionMapping')?.addEventListener('click',()=>{
    const expected={1:'past',2:'present',3:'present',4:'present',5:'future'};
    const ok=Object.entries(expected).every(([n,p])=>sectionMapping[n]===p);
    document.getElementById('sectionMappingRetry')?.classList.toggle('show',!ok);
    const connected=document.getElementById('sectionMappingRecovered');
    if(connected)connected.hidden=!ok;
    if(ok){
      markVerifyButton(document.getElementById('verifySectionMapping'));
      document.querySelectorAll('[data-map-section],.macro-phase').forEach(el=>{el.style.pointerEvents='none';el.setAttribute('aria-disabled','true');});
      // Keep the external C03 work panel hidden until the archive transmission
      // has actually been opened and then closed/downloaded.
      if(workflow)workflow.hidden=true;
      if(analystAlertTimer)clearTimeout(analystAlertTimer);
      analystAlertTimer=setTimeout(showAnalystTransmission,420);
    }
  });


  // C03 external Analyst Record workflow.
  // v42 review state: File C is preset restored so it can be opened for review without replaying C02/C03.
  const REVIEW_MODE_C03_PRECONFIRMED=GettysburgState.isRecovered(2);
  let analystAlertTimer=null;
  let analystRecoveryAnimation=null;
  let analystRecoveryTransitionTimer=null;
  let c03Confirmed=false;

  const analystAlert=document.getElementById('analystArchiveAlert');
  const confirmOverlay=document.getElementById('c03RecoveryConfirmOverlay');
  const workflow=document.getElementById('analystRecordWorkflow');
  const activeBlock=document.getElementById('analystRecordActive');
  const recoveredBlock=document.getElementById('c03RecoveredCliffhanger');
  const recoveryPhase=document.getElementById('analystRecoveryPhase');
  const transmissionPhase=document.getElementById('analystTransmissionPhase');
  const recoveryPercent=document.getElementById('analystRecoveryPercent');
  const recoveryBar=document.getElementById('analystRecoveryBar');
  const signalStatus=document.getElementById('analystSignalStatus');

  function setArchiveModalOpen(overlay,open){
    if(!overlay)return;
    overlay.classList.toggle('show',open);
    overlay.setAttribute('aria-hidden',open?'false':'true');
    document.body.classList.toggle('archive-alert-open',open);
  }

  function clearAnalystRecoveryTimers(){
    if(analystRecoveryAnimation)cancelAnimationFrame(analystRecoveryAnimation);
    analystRecoveryAnimation=null;
    if(analystRecoveryTransitionTimer)clearTimeout(analystRecoveryTransitionTimer);
    analystRecoveryTransitionTimer=null;
  }

  function showTransmissionPhase(){
    if(!recoveryPhase||!transmissionPhase)return;
    recoveryPhase.classList.add('phase-leaving');
    signalStatus?.classList.add('signal-restored');
    if(signalStatus)signalStatus.textContent='TRANSMISSION RESTORED';
    analystRecoveryTransitionTimer=setTimeout(()=>{
      recoveryPhase.hidden=true;
      recoveryPhase.classList.remove('phase-leaving','phase-visible');
      transmissionPhase.hidden=false;
      transmissionPhase.classList.add('phase-entering');
      requestAnimationFrame(()=>{
        transmissionPhase.classList.remove('phase-entering');
        transmissionPhase.classList.add('phase-visible');
      });
    },430);
  }

  function runAnalystRecoverySequence(){
    clearAnalystRecoveryTimers();
    if(!recoveryPhase||!transmissionPhase)return;
    transmissionPhase.hidden=true;
    transmissionPhase.classList.remove('phase-visible','phase-entering','phase-leaving');
    recoveryPhase.hidden=false;
    recoveryPhase.classList.remove('phase-leaving','phase-entering');
    recoveryPhase.classList.add('phase-visible');
    if(signalStatus){signalStatus.textContent='FRAGMENT SIGNAL DETECTED';signalStatus.classList.remove('signal-restored');}
    if(recoveryPercent)recoveryPercent.textContent='0%';
    if(recoveryBar)recoveryBar.style.width='0%';

    const duration=4800;
    const start=performance.now();
    const animate=now=>{
      const t=Math.min(1,(now-start)/duration);
      // Slightly irregular cinematic recovery curve: clearly visible, but not sluggish.
      const eased=1-Math.pow(1-t,1.62);
      const staged=Math.min(1,eased*(.985+.015*Math.sin(t*9.5)));
      const current=t<1?Math.min(99,Math.max(0,Math.round(staged*100))):100;
      if(recoveryPercent)recoveryPercent.textContent=`${current}%`;
      if(recoveryBar)recoveryBar.style.width=`${current}%`;
      if(t<1){analystRecoveryAnimation=requestAnimationFrame(animate);return;}
      if(recoveryPercent)recoveryPercent.textContent='100%';
      if(recoveryBar)recoveryBar.style.width='100%';
      analystRecoveryTransitionTimer=setTimeout(showTransmissionPhase,650);
    };
    analystRecoveryAnimation=requestAnimationFrame(animate);
  }

  function showAnalystTransmission(replayRecovery=true){
    setArchiveModalOpen(analystAlert,true);
    if(replayRecovery){
      runAnalystRecoverySequence();
    }else{
      clearAnalystRecoveryTimers();
      if(recoveryPhase)recoveryPhase.hidden=true;
      if(transmissionPhase){
        transmissionPhase.hidden=false;
        transmissionPhase.classList.remove('phase-entering','phase-leaving');
        transmissionPhase.classList.add('phase-visible');
      }
      if(signalStatus){signalStatus.textContent='TRANSMISSION RESTORED';signalStatus.classList.add('signal-restored');}
    }
  }

  function activateAnalystRecordWorkflow(){
    if(workflow)workflow.hidden=false;
    renderC03State();
  }

  function renderC03State(){
    if(workflow)workflow.hidden=false;
    if(activeBlock)activeBlock.hidden=c03Confirmed;
    recoveredBlock?.classList.toggle('show',c03Confirmed);
  }

  function confirmC03(){
    c03Confirmed=true;
    setArchiveModalOpen(confirmOverlay,false);
    renderC03State();
    recoveredBlock?.scrollIntoView({behavior:'smooth',block:'center'});
  }

  function handleAnalystRecordDownload(){
    // The actual Analyst Record PDF will be supplied separately and linked here.
    clearAnalystRecoveryTimers();
    setArchiveModalOpen(analystAlert,false);
    activateAnalystRecordWorkflow();
    toast('The Analyst Record PDF has not been added to this baseline yet.');
  }

  document.getElementById('downloadAnalystRecord')?.addEventListener('click',handleAnalystRecordDownload);
  document.getElementById('downloadAnalystRecordAgain')?.addEventListener('click',handleAnalystRecordDownload);
  document.getElementById('reopenAnalystTransmission')?.addEventListener('click',()=>showAnalystTransmission(false));

  function closeAnalystTransmission(){
    clearAnalystRecoveryTimers();
    setArchiveModalOpen(analystAlert,false);
    activateAnalystRecordWorkflow();
    if(REVIEW_MODE_C03_PRECONFIRMED&&!c03Confirmed){
      c03Confirmed=true;
      renderC03State();
    }
  }

  // Deliberately one clear exit path: the transmission can only be closed by the lower button in phase 2.
  document.getElementById('closeAnalystTransmission')?.addEventListener('click',closeAnalystTransmission);

  document.getElementById('confirmC03Recovery')?.addEventListener('click',()=>setArchiveModalOpen(confirmOverlay,true));
  document.getElementById('cancelC03Recovery')?.addEventListener('click',()=>setArchiveModalOpen(confirmOverlay,false));
  document.getElementById('approveC03Recovery')?.addEventListener('click',confirmC03);
  confirmOverlay?.addEventListener('click',event=>{if(event.target===confirmOverlay)setArchiveModalOpen(confirmOverlay,false);});

  // v39 temporary File-C test state: only C01 is pre-recovered so C02 can be checked normally.
  function applyC01ReviewRecoveredState(){
    const task=document.getElementById('c1StructureTask');
    if(task)task.classList.add('recovered');
    const summaries=document.getElementById('sectionSummaries');
    if(summaries)summaries.hidden=false;
    boundaries.forEach(boundary=>{
      if(correctBoundaries.has(boundary.dataset.b))boundary.classList.add('on');
      boundary.style.pointerEvents='none';
      boundary.setAttribute('tabindex','-1');
      boundary.setAttribute('aria-pressed',correctBoundaries.has(boundary.dataset.b)?'true':'false');
    });
    markVerifyButton(document.getElementById('confirmBoundaries'));
    const sectionSummarySlider=document.getElementById('sectionSummarySlider');
    sectionSummarySlider?.classList.add('recovered');
    summaryVerified.fill(true);
    summaryComplete=true;
    document.querySelectorAll('.section-summary-slide').forEach((slide,index)=>{slide.hidden=index!==4;});
    const reviewSummaries=[
      'Lincoln recalls the founding of the nation on the ideals of liberty and equality.',
      'The Civil War tests whether such a nation can survive.',
      'The audience has gathered to dedicate a cemetery for the soldiers who died at Gettysburg.',
      'The soldiers’ sacrifice has already consecrated the ground, making ceremonial words secondary.',
      'The living must continue the unfinished work and preserve freedom and democratic government.'
    ];
    for(let i=1;i<=5;i++){
      const input=document.getElementById(`summarySection${i}`);
      if(input){input.value=reviewSummaries[i-1];input.disabled=true;}
      markVerifyButton(document.getElementById(`verifySummary${i}`));
      document.getElementById(`summaryAccepted${i}`)?.classList.add('show');
    }
    const nav=document.querySelector('.summary-slider-nav');
    if(nav)nav.hidden=false;
    document.getElementById('sectionSummariesRecovered')?.classList.add('show');
  }

  if(GettysburgState.isTestMode())applyC01ReviewRecoveredState();

  function applyC02ReviewRecoveredState(){
    const timeValues={timePast:'PAST',timePresent:'PRESENT',timeFuture:'FUTURE'};
    Object.entries(timeValues).forEach(([id,value])=>{const el=document.getElementById(id);if(el){el.value=value;el.disabled=true;}});
    markVerifyButton(document.getElementById('verifyTimeStructure'));
    const macroRecovered=document.getElementById('macroStructureRecovered');if(macroRecovered)macroRecovered.hidden=false;
    const hintButton=document.getElementById('showTimeHint');if(hintButton)hintButton.hidden=true;
    const assignment=document.getElementById('macroSectionAssignment');if(assignment)assignment.hidden=false;

    Object.assign(sectionMapping,{1:'past',2:'present',3:'present',4:'present',5:'future'});
    renderSectionMapping();
    markVerifyButton(document.getElementById('verifySectionMapping'));
    const connected=document.getElementById('sectionMappingRecovered');if(connected)connected.hidden=false;
    document.querySelectorAll('[data-map-section],.macro-phase').forEach(el=>{el.style.pointerEvents='none';el.setAttribute('aria-disabled','true');});

    activateAnalystRecordWorkflow();
  }

  if(GettysburgState.isTestMode())applyC02ReviewRecoveredState();

  function applyCCompletedReviewState(){
    if(!GettysburgState.isRecovered(2))return;
    const timeValues={timePast:'PAST',timePresent:'PRESENT',timeFuture:'FUTURE'};
    Object.entries(timeValues).forEach(([id,value])=>{const el=document.getElementById(id);if(el){el.value=value;el.disabled=true;}});
    markVerifyButton(document.getElementById('verifyTimeStructure'));
    const macroRecovered=document.getElementById('macroStructureRecovered');if(macroRecovered)macroRecovered.hidden=false;
    const hintButton=document.getElementById('showTimeHint');if(hintButton)hintButton.hidden=true;
    const assignment=document.getElementById('macroSectionAssignment');if(assignment)assignment.hidden=false;

    Object.assign(sectionMapping,{1:'past',2:'present',3:'present',4:'present',5:'future'});
    renderSectionMapping();
    markVerifyButton(document.getElementById('verifySectionMapping'));
    const connected=document.getElementById('sectionMappingRecovered');if(connected)connected.hidden=false;
    document.querySelectorAll('[data-map-section],.macro-phase').forEach(el=>{el.style.pointerEvents='none';el.setAttribute('aria-disabled','true');});

    c03Confirmed=true;
    if(workflow)workflow.hidden=false;
    renderC03State();
  }

  applyCCompletedReviewState();

  document.getElementById('unlockFileD')?.addEventListener('click',()=>{
    showRecoveryOverlay({caseId:'C',fragment:'27',nextId:'O0',nextLabel:'RETURN TO ARCHIVE'});
  });

};
