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
    document.getElementById('macroStructureRecovered')?.classList.toggle('show',ok);
    const assignment=document.getElementById('macroSectionAssignment');
    if(assignment)assignment.hidden=!ok;
    if(ok){
      markVerifyButton(document.getElementById('verifyTimeStructure'));
      ['timePast','timePresent','timeFuture','verifyTimeStructure','showTimeHint'].forEach(id=>{const el=document.getElementById(id);if(el)el.disabled=true;});
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
    document.getElementById('sectionMappingRecovered')?.classList.toggle('show',ok);
    if(ok){markVerifyButton(document.getElementById('verifySectionMapping'));document.querySelectorAll('[data-map-section],.macro-phase').forEach(el=>{el.style.pointerEvents='none';el.setAttribute('aria-disabled','true');});}
  });


  const analystPairs=[
    {
      section:'SECTION 1 · FOUNDING IDEALS',
      weaker:'Lincoln begins by referring to the founding of the United States and the principles of liberty and equality.',
      analyst:'<mark class="analytical-phrase">By referring to</mark> the nation\'s founding ideals, Lincoln establishes the standard against which the present crisis is later understood.',
      feedback:'The phrase identifies a means or strategy: it shows how Lincoln creates the analytical effect described in the rest of the sentence.',
      keywords:['means','method','strategy','technique','way','how','reference','referring','device','approach']
    },
    {
      section:'SECTION 2 · NATION TESTED',
      weaker:'Lincoln presents the Civil War as a test of whether the nation can survive and continue to exist.',
      analyst:'<mark class="analytical-phrase">Rather than simply</mark> describing the Civil War, Lincoln frames it as a test of whether the nation can live up to its founding ideals.',
      feedback:'The phrase signals that the analysis moves beyond a simple description and explains the deeper analytical significance of Lincoln\'s framing.',
      keywords:['beyond','not just','not simply','more than','deeper','interpret','interpretation','simple description','description','contrast']
    },
    {
      section:'SECTION 3 · GETTYSBURG / OCCASION',
      weaker:'Lincoln turns from the Civil War to the gathering at Gettysburg and the dedication of the cemetery.',
      analyst:'<mark class="analytical-phrase">What begins as ... develops into ...</mark> a focus on the concrete situation at Gettysburg, moving from reflection on the national crisis to the immediate occasion.',
      feedback:'The structure traces the development of an idea: it makes visible how the argument moves from one focus to another.',
      keywords:['develop','development','shift','move','movement','change','progress','progression','from one','turn','evolve']
    },
    {
      section:'SECTION 4 · SACRIFICE',
      weaker:'Lincoln explains that the soldiers have already given the battlefield its significance through their sacrifice.',
      analyst:'<mark class="analytical-phrase">Having established ..., Lincoln then ...</mark> shifts the focus from the act of dedication to the soldiers\' sacrifice, building on the immediate purpose of the ceremony.',
      feedback:'The structure shows how Lincoln builds on a point that has already been established before moving the argument forward.',
      keywords:['build','builds on','previous','earlier','established','sequence','next step','link','connect','foundation']
    },
    {
      section:'SECTION 5 · RESPONSIBILITY & FUTURE',
      weaker:'Lincoln ends by calling on the living to continue the unfinished work and protect the nation\'s future.',
      analyst:'<mark class="analytical-phrase">The progression from ... to ...</mark> remembrance, responsibility and finally renewal transforms the ceremony into a call for future action.',
      feedback:'The phrase describes argumentative development or movement across several stages of the argument.',
      keywords:['progression','development','movement','move','stages','sequence','from','to','argument develops','trajectory']
    }
  ];

  let analystIndex=0;
  const pairBox=document.getElementById('analystNotePair');
  const counter=document.getElementById('analystNoteCounter');
  const sectionTitle=document.getElementById('analystSectionTitle');
  const analystInput=document.getElementById('analystFunctionInput');
  const verifyAnalyst=document.getElementById('verifyAnalystFunction');
  const retry=document.getElementById('analystNoteRetry');
  const success=document.getElementById('analystNoteSuccess');
  const functionFeedback=document.getElementById('analystFunctionFeedback');
  const nextButton=document.getElementById('nextAnalystNote');
  const patternReveal=document.getElementById('analystPatternReveal');
  const skillCheck=document.getElementById('lineArgumentSkillCheck');

  function renderAnalystPair(){
    if(!pairBox)return;
    const pair=analystPairs[analystIndex];
    if(counter)counter.textContent=`${String(analystIndex+1).padStart(2,'0')} / 05`;
    if(sectionTitle)sectionTitle.textContent=pair.section;
    pairBox.innerHTML=`
      <article class="analyst-note-option c03-static-note weaker-note"><span class="smallcaps">WEAKER NOTE</span><p>${pair.weaker}</p></article>
      <article class="analyst-note-option c03-static-note analyst-note"><span class="smallcaps">ANALYST'S NOTE</span><p>${pair.analyst}</p></article>`;
    if(analystInput){analystInput.value='';analystInput.disabled=false;}
    if(verifyAnalyst){verifyAnalyst.disabled=false;verifyAnalyst.textContent='VERIFY ANALYSIS';verifyAnalyst.classList.remove('verified-action');}
    retry?.classList.remove('show');
    success?.classList.remove('show');
    if(nextButton)nextButton.textContent=analystIndex===analystPairs.length-1?'REVEAL PATTERN':'NEXT NOTE';
  }

  function analystAnswerMatches(value,pair){
    const v=normalizeText(value);
    if(v.length<4)return false;
    return pair.keywords.some(keyword=>v.includes(keyword));
  }

  verifyAnalyst?.addEventListener('click',()=>{
    const pair=analystPairs[analystIndex];
    const ok=analystAnswerMatches(analystInput?.value,pair);
    retry?.classList.toggle('show',!ok);
    success?.classList.toggle('show',ok);
    if(ok){
      if(functionFeedback)functionFeedback.textContent=pair.feedback;
      if(analystInput)analystInput.disabled=true;
      markVerifyButton(verifyAnalyst);
    }
  });

  nextButton?.addEventListener('click',()=>{
    if(analystIndex<analystPairs.length-1){
      analystIndex++;
      renderAnalystPair();
      document.querySelector('.c03-slider-card')?.scrollIntoView({behavior:'smooth',block:'start'});
      return;
    }
    document.querySelector('.c03-slider-card')?.setAttribute('hidden','');
    patternReveal?.classList.add('show');
    const meta=document.getElementById('lineArgumentMeta');
    if(meta)meta.hidden=false;
    if(skillCheck)skillCheck.hidden=false;
    patternReveal?.scrollIntoView({behavior:'smooth',block:'start'});
  });


  // v37 temporary test state: C01 and C03 are pre-recovered so C02 can be checked independently.
  // The final RESTORE FILE C action deliberately remains active so the C -> D transition can still be tested.
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
    for(let i=1;i<=5;i++){
      const input=document.getElementById(`summarySection${i}`);
      if(input)input.disabled=true;
      markVerifyButton(document.getElementById(`verifySummary${i}`));
      document.getElementById(`summaryAccepted${i}`)?.classList.add('show');
    }
    const nav=document.querySelector('.summary-slider-nav');
    if(nav)nav.hidden=true;
    document.getElementById('sectionSummariesRecovered')?.classList.add('show');
  }

  function applyC03ReviewRecoveredState(){
    document.querySelector('.c03-slider-card')?.setAttribute('hidden','');
    patternReveal?.classList.add('show');
    const meta=document.getElementById('lineArgumentMeta');
    if(meta)meta.hidden=false;
    if(skillCheck)skillCheck.hidden=false;
    const correct=document.querySelector('#lineArgumentOptions .skill-option[data-correct="1"]');
    document.querySelectorAll('#lineArgumentOptions .skill-option').forEach(option=>{
      option.disabled=true;
      option.classList.toggle('selected',option===correct);
    });
    document.getElementById('lineArgumentVerified')?.classList.add('show');
  }

  renderAnalystPair();

  document.querySelectorAll('#lineArgumentOptions .skill-option').forEach(button=>{
    button.addEventListener('click',()=>{
      const ok=button.dataset.correct==='1';
      document.querySelectorAll('#lineArgumentOptions .skill-option').forEach(option=>option.classList.remove('selected'));
      button.classList.add('selected');
      document.getElementById('lineArgumentRetry')?.classList.toggle('show',!ok);
      document.getElementById('lineArgumentVerified')?.classList.toggle('show',ok);
      if(ok)document.querySelectorAll('#lineArgumentOptions .skill-option').forEach(option=>option.disabled=true);
    });
  });

  applyC01ReviewRecoveredState();
  applyC03ReviewRecoveredState();

  document.getElementById('restoreCaseC')?.addEventListener('click',()=>{
    showRecoveryOverlay({caseId:'C',fragment:'27',nextId:'O0',nextLabel:'RETURN TO ARCHIVE'});
  });
};
