window.initCaseC=function(){
  const correctBoundaries=new Set(['1','2','5','8']);
  const boundaries=[...document.querySelectorAll('.boundary')];

  boundaries.forEach(b=>b.addEventListener('click',()=>{
    if(b.classList.contains('on')){
      b.classList.remove('on');
      return;
    }
    const selected=boundaries.filter(x=>x.classList.contains('on'));
    if(selected.length>=4) return toast('Select exactly four section boundaries.');
    b.classList.add('on');
  }));

  document.getElementById('confirmBoundaries')?.addEventListener('click',()=>{
    const selected=boundaries.filter(x=>x.classList.contains('on')).map(x=>x.dataset.b);
    if(selected.length!==4) return toast('Select exactly four section boundaries.');
    const ok=selected.every(x=>correctBoundaries.has(x))&&selected.length===correctBoundaries.size;
    document.getElementById('c1structureRetry')?.classList.toggle('show',!ok);
    document.getElementById('c1fb')?.classList.toggle('show',ok);
    const summaries=document.getElementById('sectionSummaries');
    if(summaries) summaries.hidden=!ok;
    if(ok) markVerifyButton(document.getElementById('confirmBoundaries'));
  });

  document.getElementById('showStructureHint')?.addEventListener('click',e=>{
    const f=document.getElementById('c1hint');
    f?.classList.add('show');
    if(f)f.innerHTML='<b>HINT</b><br>Look for places where Lincoln moves to a different main subject or situation. The archive will use one shared five-section model for the next analytical steps.';
    e.currentTarget.disabled=true;
  });

  function normalizeText(value){
    return String(value||'').toLowerCase().replace(/[’']/g,"'").replace(/[^a-z0-9\s-]/g,' ').replace(/\s+/g,' ').trim();
  }

  const summaryConcepts=[
    ['found','founding','1776','liberty','equal','equality','nation','created'],
    ['civil war','war','test','tested','survive','survival','endure','nation'],
    ['gettysburg','battlefield','cemetery','dedicat','gather','occasion','meeting'],
    ['soldier','sacrifice','word','ceremony','dedicat','consecrate','hallow','deed','did'],
    ['living','responsibility','unfinished','future','work','freedom','renewal','democracy','government','action']
  ];

  function summaryMatches(value,index){
    const v=normalizeText(value);
    if(v.length<3)return false;
    return summaryConcepts[index].some(term=>v.includes(term));
  }

  document.getElementById('verifySectionSummaries')?.addEventListener('click',()=>{
    const inputs=[1,2,3,4,5].map(i=>document.getElementById(`summarySection${i}`));
    const ok=inputs.every((input,index)=>summaryMatches(input?.value,index));
    document.getElementById('sectionSummariesRetry')?.classList.toggle('show',!ok);
    document.getElementById('sectionSummariesRecovered')?.classList.toggle('show',ok);
    if(ok){
      inputs.forEach(input=>{if(input)input.disabled=true;});
      markVerifyButton(document.getElementById('verifySectionSummaries'));
    }
  });

  let funcSel=null;
  const functionTokens=[...document.querySelectorAll('#funcPool .note')];
  const functionSlots=[...document.querySelectorAll('.secslot')];

  functionTokens.forEach(n=>n.addEventListener('click',()=>{
    if(n.classList.contains('assigned'))return;
    functionTokens.forEach(x=>x.classList.remove('active'));
    n.classList.add('active');
    funcSel=n;
  }));

  function updateFunctionVerify(){
    const btn=document.getElementById('verifySectionFunctions');
    if(btn)btn.disabled=!functionSlots.every(x=>x.classList.contains('filled'));
  }

  function setSlotValue(slot,text){
    const value=slot.querySelector('.section-slot-value');
    if(value)value.textContent=text;
  }

  functionSlots.forEach(slot=>slot.addEventListener('click',event=>{
    if(event.target.closest('.tooltip'))return;
    if(slot.classList.contains('filled')&&!funcSel){
      const value=slot.dataset.assignedValue;
      const source=functionTokens.find(n=>n.textContent===value);
      source?.classList.remove('assigned');
      slot.classList.remove('filled');
      setSlotValue(slot,'ASSIGN FUNCTION');
      delete slot.dataset.assignedValue;
      delete slot.dataset.assignedSec;
      updateFunctionVerify();
      return;
    }
    if(!funcSel)return toast('Select a function card first.');
    if(slot.classList.contains('filled')){
      const old=slot.dataset.assignedValue;
      functionTokens.find(n=>n.textContent===old)?.classList.remove('assigned');
    }
    setSlotValue(slot,funcSel.textContent);
    slot.classList.add('filled');
    slot.dataset.assignedValue=funcSel.textContent;
    slot.dataset.assignedSec=funcSel.dataset.sec;
    funcSel.classList.remove('active');
    funcSel.classList.add('assigned');
    funcSel=null;
    document.getElementById('c2retry')?.classList.remove('show');
    document.getElementById('c2fb')?.classList.remove('show');
    updateFunctionVerify();
  }));

  document.getElementById('verifySectionFunctions')?.addEventListener('click',()=>{
    const correct=functionSlots.every(slot=>slot.dataset.sec===slot.dataset.assignedSec);
    document.getElementById('c2retry')?.classList.toggle('show',!correct);
    document.getElementById('c2fb')?.classList.toggle('show',correct);
    const macro=document.getElementById('timeStructureTask');
    if(macro)macro.hidden=!correct;
    if(correct)markVerifyButton(document.getElementById('verifySectionFunctions'));
  });

  function normalizeTimeWord(value){return String(value||'').trim().toLowerCase().replace(/[^a-z]/g,'');}
  function closeEnough(actual,target){
    if(actual===target)return true;
    if(Math.abs(actual.length-target.length)>1)return false;
    let i=0,j=0,diffs=0;
    while(i<actual.length&&j<target.length){
      if(actual[i]===target[j]){i++;j++;}
      else{
        diffs++;if(diffs>1)return false;
        if(actual.length>target.length)i++;
        else if(actual.length<target.length)j++;
        else{i++;j++;}
      }
    }
    if(i<actual.length||j<target.length)diffs++;
    return diffs<=1;
  }

  document.getElementById('showTimeHint')?.addEventListener('click',e=>{
    const hint=document.getElementById('timeHint');
    hint?.classList.add('show');
    if(hint)hint.innerHTML='<b>HINT</b><br>Think about when Lincoln’s ideas are located. Does he look back, describe the situation of his own time, or look ahead?';
    e.currentTarget.disabled=true;
  });

  document.getElementById('verifyTimeStructure')?.addEventListener('click',()=>{
    const values=['timePast','timePresent','timeFuture'].map(id=>normalizeTimeWord(document.getElementById(id)?.value));
    const targets=['past','present','future'];
    const ok=values.every((v,i)=>closeEnough(v,targets[i]));
    document.getElementById('timeStructureRetry')?.classList.toggle('show',!ok);
    document.getElementById('macroStructureRecovered')?.classList.toggle('show',ok);
    if(ok){
      markVerifyButton(document.getElementById('verifyTimeStructure'));
      ['timePast','timePresent','timeFuture','verifyTimeStructure','showTimeHint'].forEach(id=>{const el=document.getElementById(id);if(el)el.disabled=true;});
    }
  });

  const analystPairs=[
    {
      section:'SECTION 1 · FOUNDING IDEALS',
      weaker:'Lincoln begins by referring to the founding of the United States and the principles of liberty and equality.',
      analyst:'<mark class="analytical-phrase">By referring to</mark> the nation\'s founding ideals, Lincoln establishes the standard against which the present crisis is later understood.',
      feedback:'The phrase identifies the means or strategy through which Lincoln establishes his analytical starting point.',
      keywords:['means','method','strategy','technique','way','how','reference','referring']
    },
    {
      section:'SECTION 2 · NATION TESTED',
      weaker:'Lincoln presents the Civil War as a test of whether the nation can survive and continue to exist.',
      analyst:'<mark class="analytical-phrase">Rather than simply</mark> describing the Civil War, Lincoln frames it as a test of whether the nation can live up to its founding ideals.',
      feedback:'The phrase signals that the analysis is moving beyond a simple description toward an interpretation of what Lincoln achieves.',
      keywords:['beyond','not just','not simply','more than','contrast','interpret','reframe','rather','simple description','description']
    },
    {
      section:'SECTION 3 · GETTYSBURG / OCCASION',
      weaker:'Lincoln turns from the Civil War to the gathering at Gettysburg and the dedication of the cemetery.',
      analyst:'<mark class="analytical-phrase">What begins as</mark> a reflection on the national crisis <mark class="analytical-phrase">develops into</mark> a focus on the concrete situation at Gettysburg.',
      feedback:'The structure traces how an idea develops or shifts from one focus to another.',
      keywords:['develop','development','shift','move','change','progress','progression','from one','turn']
    },
    {
      section:'SECTION 4 · SACRIFICE',
      weaker:'Lincoln explains that the soldiers have already given the battlefield its significance through their sacrifice.',
      analyst:'<mark class="analytical-phrase">Having established</mark> the immediate purpose of the ceremony, <mark class="analytical-phrase">Lincoln then</mark> shifts the focus from the act of dedication to the soldiers\' sacrifice.',
      feedback:'The structure shows how Lincoln builds on a point that has already been established before moving the argument forward.',
      keywords:['build','builds on','previous','earlier','established','sequence','next step','link','connect']
    },
    {
      section:'SECTION 5 · RESPONSIBILITY & FUTURE',
      weaker:'Lincoln ends by calling on the living to continue the unfinished work and protect the nation\'s future.',
      analyst:'<mark class="analytical-phrase">The progression from</mark> remembrance to responsibility and finally to renewal transforms the ceremony into a call for future action.',
      feedback:'The phrase describes the broader movement or progression of the argument across several stages.',
      keywords:['progression','development','movement','move','stages','sequence','from','to','argument develops']
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
  const nextBtn=document.getElementById('nextAnalystNote');
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
    if(verifyAnalyst){verifyAnalyst.disabled=false;verifyAnalyst.textContent='VERIFY ANALYSIS';verifyAnalyst.classList.remove('verified');}
    retry?.classList.remove('show');
    success?.classList.remove('show');
    if(nextBtn)nextBtn.textContent=analystIndex===analystPairs.length-1?'REVEAL PATTERN':'NEXT NOTE';
  }

  function analystAnswerMatches(value,pair){
    const v=normalizeText(value);
    if(v.length<3)return false;
    return pair.keywords.some(k=>v.includes(k));
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

  nextBtn?.addEventListener('click',()=>{
    if(analystIndex<analystPairs.length-1){
      analystIndex++;
      renderAnalystPair();
      document.querySelector('.c03-slider-card')?.scrollIntoView({behavior:'smooth',block:'start'});
    }else{
      document.querySelector('.c03-slider-card')?.setAttribute('hidden','');
      patternReveal?.classList.add('show');
      if(skillCheck)skillCheck.hidden=false;
      patternReveal?.scrollIntoView({behavior:'smooth',block:'start'});
    }
  });

  renderAnalystPair();

  document.querySelectorAll('#lineArgumentOptions .skill-option').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const ok=btn.dataset.correct==='1';
      document.querySelectorAll('#lineArgumentOptions .skill-option').forEach(x=>x.classList.remove('selected'));
      btn.classList.add('selected');
      document.getElementById('lineArgumentRetry')?.classList.toggle('show',!ok);
      document.getElementById('lineArgumentVerified')?.classList.toggle('show',ok);
      if(ok)document.querySelectorAll('#lineArgumentOptions .skill-option').forEach(x=>x.disabled=true);
    });
  });

  document.getElementById('restoreCaseC')?.addEventListener('click',()=>{
    showRecoveryOverlay({caseId:'C',fragment:'27',nextId:'O0',nextLabel:'RETURN TO ARCHIVE'});
  });
};
