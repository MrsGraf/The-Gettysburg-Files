window.initCaseD=function(){
  function norm(value){
    return String(value||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[’‘`]/g,"'").replace(/[^a-z0-9'\s]/g,' ').replace(/\s+/g,' ').trim();
  }
  function closeEnough(a,b){
    a=norm(a); b=norm(b);
    if(a===b)return true;
    if(Math.abs(a.length-b.length)>2)return false;
    let i=0,j=0,d=0;
    while(i<a.length&&j<b.length){
      if(a[i]===b[j]){i++;j++;continue;}
      d++;if(d>2)return false;
      if(a.length>b.length)i++;else if(a.length<b.length)j++;else{i++;j++;}
    }
    return d+(a.length-i)+(b.length-j)<=2;
  }
  function lockInput(inputId,buttonId){
    const input=document.getElementById(inputId);if(input)input.disabled=true;
    const button=document.getElementById(buttonId);if(button){markVerifyButton(button);button.disabled=true;}
  }
  function setOnlyFeedback(id){
    ['d3ContextOriginalOnly','d3ContextRenewalOnly','d3ContextLiteralOnly','d3ContextDeviceOnly','d3MeaningsRetry'].forEach(key=>document.getElementById(key)?.classList.toggle('show',key===id));
  }
  function exactSelection(selector,answerAttr){
    const words=[...document.querySelectorAll(selector)];
    const selected=words.filter(word=>word.classList.contains('selected'));
    const correct=words.filter(word=>word.dataset[answerAttr]==='true');
    return selected.length===correct.length&&selected.every(word=>correct.includes(word));
  }
  function holdReadingPosition(callback,y=window.scrollY){
    callback();
    requestAnimationFrame(()=>requestAnimationFrame(()=>window.scrollTo({top:y,left:0,behavior:'auto'})));
  }

  // D01 · locate the repeated wording, identify the device, then restore the analytical labels.
  document.querySelectorAll('.d1-selectable-word').forEach(word=>word.addEventListener('click',()=>word.classList.toggle('selected')));
  document.getElementById('verifyD1Marking')?.addEventListener('click',()=>{
    const readingY=window.scrollY;
    const ok=exactSelection('.d1-selectable-word','repetitionAnswer');
    document.getElementById('d1MarkingRetry')?.classList.toggle('show',!ok);
    document.getElementById('d1MarkingRecovered')?.classList.toggle('show',ok);
    if(!ok)return;
    document.querySelectorAll('.d1-selectable-word').forEach(word=>{
      word.disabled=true;
      word.classList.remove('selected');
      if(word.dataset.repetitionAnswer==='true')word.classList.add('mark-repetition');
    });
    const button=document.getElementById('verifyD1Marking');markVerifyButton(button);if(button)button.disabled=true;
    holdReadingPosition(()=>{const stage=document.getElementById('d1DeviceStage');if(stage)stage.hidden=false;},readingY);
  });

  document.getElementById('verifyD1Device')?.addEventListener('click',()=>{
    const readingY=window.scrollY;
    const value=norm(document.getElementById('d1DeviceInput')?.value);
    const exact=value.includes('repetition');
    const fuzzy=!exact&&closeEnough(value,'repetition');
    const ok=exact||fuzzy;
    document.getElementById('d1DeviceRetry')?.classList.toggle('show',!ok);
    document.getElementById('d1DeviceRecovered')?.classList.toggle('show',ok);
    if(!ok)return;
    lockInput('d1DeviceInput','verifyD1Device');
    if(fuzzy&&window.spellingAccepted)spellingAccepted('repetition');
    holdReadingPosition(()=>{const block=document.getElementById('d1AnalysisBlock');if(block)block.hidden=false;},readingY);
  });

  let selectedD1Label=null;
  const labels=[...document.querySelectorAll('.d1-layer-label')];
  const notes=[...document.querySelectorAll('.d1-example')];
  labels.forEach(label=>label.addEventListener('click',()=>{
    if(label.classList.contains('assigned'))return;
    labels.forEach(item=>item.classList.remove('active'));
    label.classList.add('active');selectedD1Label=label;
  }));
  function updateD1Verify(){
    const button=document.getElementById('verifyD1Layers');
    if(button)button.disabled=!notes.every(note=>note.dataset.assignedLayer);
  }
  notes.forEach(note=>note.addEventListener('click',()=>{
    if(note.dataset.assignedLayer&&!selectedD1Label){
      const old=labels.find(label=>label.dataset.layer===note.dataset.assignedLayer);
      old?.classList.remove('assigned');if(old)old.disabled=false;
      const tag=note.querySelector('.assigned-stage-tag');if(tag){tag.hidden=true;tag.textContent='';}
      delete note.dataset.assignedLayer;note.classList.remove('has-stage');
      updateD1Verify();return;
    }
    if(!selectedD1Label)return toast('Select an analytical label first.');
    if(note.dataset.assignedLayer){
      const old=labels.find(label=>label.dataset.layer===note.dataset.assignedLayer);
      old?.classList.remove('assigned');if(old)old.disabled=false;
    }
    note.dataset.assignedLayer=selectedD1Label.dataset.layer;
    const tag=note.querySelector('.assigned-stage-tag');
    if(tag){tag.textContent=selectedD1Label.textContent;tag.hidden=false;}
    note.classList.add('has-stage');
    selectedD1Label.classList.remove('active');selectedD1Label.classList.add('assigned');selectedD1Label.disabled=true;
    selectedD1Label=null;updateD1Verify();
  }));
  document.getElementById('verifyD1Layers')?.addEventListener('click',()=>{
    const readingY=window.scrollY;
    const ok=notes.every(note=>note.dataset.layer===note.dataset.assignedLayer);
    document.getElementById('d1LayersRetry')?.classList.toggle('show',!ok);
    document.getElementById('d1LayersRecovered')?.classList.toggle('show',ok);
    if(!ok)return;
    const verify=document.getElementById('verifyD1Layers');markVerifyButton(verify);if(verify)verify.disabled=true;
    labels.forEach(label=>label.disabled=true);
    holdReadingPosition(()=>{notes.forEach(note=>{note.disabled=true;note.classList.add('verified',`pair-${note.dataset.layer}`);});},readingY);
  });

  // D02 · reference first, then direct word selection in one continuous workflow.
  document.getElementById('openD2Context')?.addEventListener('click',event=>{
    const workflow=document.getElementById('d2ContextWorkflow');if(workflow)workflow.hidden=false;
    event.currentTarget.disabled=true;event.currentTarget.textContent='DEVICE REFERENCE REVIEWED';
    document.querySelector('#d2ContextWorkflow .subfile-head')?.scrollIntoView({behavior:'smooth',block:'start'});
  });
  let d2Mode='parallelism';
  let contrastSelections={a:null,b:null};
  const d2Words=[...document.querySelectorAll('.d2-selectable-word')];
  d2Words.forEach(word=>word.addEventListener('click',()=>{
    if(d2Mode==='parallelism'){
      word.classList.toggle('selected');return;
    }
    if(d2Mode!=='antithesis')return;
    const group=word.dataset.phraseGroup;
    if(!group)return;
    d2Words.filter(item=>item.dataset.phraseGroup===group).forEach(item=>item.classList.remove('contrast-selected'));
    contrastSelections[group]=word;
    word.classList.add('contrast-selected');
    const field=document.getElementById(group==='a'?'d2ContrastLeft':'d2ContrastRight');if(field)field.textContent=word.textContent.replace(/[,.]/g,'').toUpperCase();
  }));
  document.getElementById('verifyD2Parallelism')?.addEventListener('click',()=>{
    const readingY=window.scrollY;
    const ok=exactSelection('.d2-selectable-word','parallelAnswer');
    document.getElementById('d2ParallelismRetry')?.classList.toggle('show',!ok);
    document.getElementById('d2ParallelismRecovered')?.classList.toggle('show',ok);
    if(!ok)return;
    d2Words.forEach(word=>{
      word.classList.remove('selected');
      if(word.dataset.parallelAnswer==='true')word.classList.add('mark-parallelism');
    });
    const button=document.getElementById('verifyD2Parallelism');markVerifyButton(button);if(button)button.disabled=true;
    d2Mode='antithesis';
    holdReadingPosition(()=>{const stage=document.getElementById('d2AntithesisStage');if(stage)stage.hidden=false;},readingY);
  });
  document.getElementById('verifyD2Antithesis')?.addEventListener('click',()=>{
    const readingY=window.scrollY;
    const left=contrastSelections.a?.dataset.antithesisAnswer;
    const right=contrastSelections.b?.dataset.antithesisAnswer;
    const ok=left==='say'&&right==='did';
    document.getElementById('d2AntithesisRetry')?.classList.toggle('show',!ok);
    document.getElementById('d2AntithesisRecovered')?.classList.toggle('show',ok);
    if(!ok)return;
    d2Mode='done';
    d2Words.forEach(word=>{
      word.disabled=true;word.classList.remove('contrast-selected');
      if(word.dataset.parallelAnswer==='true')word.classList.add('mark-antithesis');
      if(word.dataset.antithesisAnswer)word.classList.add('antithesis-core');
    });
    const button=document.getElementById('verifyD2Antithesis');markVerifyButton(button);if(button)button.disabled=true;
    const screen=document.querySelector('.screen[data-id="D2"]');
    if(screen){screen.dataset.progress='60';if(typeof updateProgress==='function')updateProgress(screen);}
    holdReadingPosition(()=>{const progression=document.getElementById('d2AntithesisProgression');if(progression)progression.hidden=false;},readingY);
  });

  // D03 · semantic field, extended birth metaphor and independent analysis.
  function birthImageCorrect(value){
    const v=norm(value);
    return ['birth','a birth','being born','born','the birth of a child','giving birth','birth process','childbirth'].some(answer=>v===norm(answer)||v.includes(norm(answer)));
  }
  document.getElementById('verifyD3Image')?.addEventListener('click',()=>{
    const readingY=window.scrollY;
    const ok=birthImageCorrect(document.getElementById('d3ImageInput')?.value);
    document.getElementById('d3ImageRetry')?.classList.toggle('show',!ok);
    document.getElementById('d3ImageRecovered')?.classList.toggle('show',ok);
    if(!ok)return;
    lockInput('d3ImageInput','verifyD3Image');
    holdReadingPosition(()=>{},readingY);
  });
  document.getElementById('openD3Scan')?.addEventListener('click',event=>{
    document.getElementById('d3Speech')?.classList.add('scan-mode');
    const returnStage=document.getElementById('d3ReturnStage');if(returnStage)returnStage.hidden=false;
    event.currentTarget.disabled=true;event.currentTarget.textContent='SPEECH SCAN ACTIVE';
    document.getElementById('d3Speech')?.scrollIntoView({behavior:'smooth',block:'start'});
  });
  let returnPhraseRecovered=false;
  document.getElementById('d3ReturnPhrase')?.addEventListener('click',event=>{
    if(document.getElementById('d3ReturnStage')?.hidden)return;
    returnPhraseRecovered=true;event.currentTarget.classList.add('mark-metaphor','recovered');event.currentTarget.disabled=true;
    document.getElementById('d3ReturnHint')?.classList.remove('show');
    document.getElementById('d3ReturnRecovered')?.classList.add('show');
    const meaningStage=document.getElementById('d3MeaningStage');if(meaningStage)meaningStage.hidden=false;
    document.getElementById('d3ReturnStage')?.scrollIntoView({behavior:'smooth',block:'start'});
  });
  document.getElementById('d3ReturnStage')?.addEventListener('click',event=>{
    if(event.target.closest('#d3ReturnPhrase')||returnPhraseRecovered)return;
    document.getElementById('d3ReturnHint')?.classList.add('show');
  });

  const referents=['nation','union','country','america','united states','u s','us'];
  const originalTerms=['born','birth','conceived','created','founded','formed','established','brought into existence','came into being','foundation','founding','originated','began'];
  const renewalTerms=['reborn','rebirth','renewed','renewal','revived','restored','start anew','starts anew','begin again','begins again','new beginning','brought back to life','bring back to life','given new life','created anew','bring to life','brought to life','start over','new life'];
  const personificationTerms=['personified','personification','humanised','humanized','treated like a person','treated as a person','depicted as a person','depicted like a person','presented as a person','presented like a person','portrayed as a person','human being','compared to a child','presented as a child','like a child','living being','living entity','something alive','given human qualities'];
  function hasAny(v,terms){return terms.some(term=>v.includes(norm(term)));}
  function contextStatus(value){
    const v=norm(value);
    const referent=hasAny(v,referents)||(/\bit\b/.test(v)&&v.length>45);
    const original=hasAny(v,originalTerms);
    const renewal=hasAny(v,renewalTerms);
    const personification=hasAny(v,personificationTerms);
    const literal=(v.includes('child')||v.includes('baby'))&&(v.includes('birth')||v.includes('born')||v.includes('conceiv'));
    if(referent&&original&&renewal)return 'correct';
    if(referent&&original&&!renewal)return 'original';
    if(referent&&!original&&renewal)return 'renewal';
    if(personification&&!(original&&renewal))return 'device';
    if(literal&&!referent)return 'literal';
    return 'general';
  }
  document.getElementById('verifyD3Meanings')?.addEventListener('click',()=>{
    const readingY=window.scrollY;
    const status=contextStatus(document.getElementById('d3ContextInput')?.value);
    const ok=status==='correct';
    setOnlyFeedback(ok?null:status==='original'?'d3ContextOriginalOnly':status==='renewal'?'d3ContextRenewalOnly':status==='literal'?'d3ContextLiteralOnly':status==='device'?'d3ContextDeviceOnly':'d3MeaningsRetry');
    document.getElementById('d3MeaningsRecovered')?.classList.toggle('show',ok);
    if(!ok)return;
    const input=document.getElementById('d3ContextInput');if(input)input.disabled=true;
    const button=document.getElementById('verifyD3Meanings');markVerifyButton(button);if(button)button.disabled=true;
    holdReadingPosition(()=>{const functionStage=document.getElementById('d3FunctionStage');if(functionStage)functionStage.hidden=false;},readingY);
  });
  function functionCorrect(value){
    const v=norm(value);
    const frame=v.includes('frame')||v.includes('beginning and end')||v.includes('opening and ending')||v.includes('start and end');
    const past=v.includes('found')||v.includes('original birth')||v.includes('past')||v.includes('beginning')||v.includes('creation');
    const future=v.includes('renew')||v.includes('rebirth')||v.includes('new birth')||v.includes('future')||v.includes('new beginning');
    const connect=v.includes('connect')||v.includes('link')||v.includes('bridge')||v.includes('frame');
    return connect&&past&&future&&(frame||v.includes('responsibility')||v.includes('living'));
  }
  document.getElementById('verifyD3Function')?.addEventListener('click',()=>{
    const readingY=window.scrollY;
    const ok=functionCorrect(document.getElementById('d3FunctionInput')?.value);
    document.getElementById('d3FunctionRetry')?.classList.toggle('show',!ok);
    document.getElementById('d3FunctionRecovered')?.classList.toggle('show',ok);
    if(!ok)return;
    lockInput('d3FunctionInput','verifyD3Function');
    holdReadingPosition(()=>{const briefing=document.getElementById('d3Briefing');if(briefing)briefing.hidden=false;},readingY);
  });

  // D05 · the closing passage is opened deliberately after the narrative introduction.
  document.getElementById('openD5Passage')?.addEventListener('click',event=>{
    const workflow=document.getElementById('d5PassageWorkflow');if(workflow)workflow.hidden=false;
    event.currentTarget.disabled=true;event.currentTarget.textContent='NEXT PASSAGE OPENED';
    workflow?.scrollIntoView({behavior:'smooth',block:'start'});
  });

  // D05 · explanation remains visible until students explicitly confirm the record.
  const selectedDevices=new Set();
  document.querySelectorAll('#d5DeviceOptions .multi-option').forEach(button=>button.addEventListener('click',()=>{
    const device=button.dataset.device;
    if(selectedDevices.has(device)){selectedDevices.delete(device);button.classList.remove('selected');}
    else{selectedDevices.add(device);button.classList.add('selected');}
  }));
  document.getElementById('verifyD5Devices')?.addEventListener('click',()=>{
    const readingY=window.scrollY;
    const required=['parallelism','rule-of-three','epiphora'];
    const ok=required.every(device=>selectedDevices.has(device))&&[...selectedDevices].every(device=>required.includes(device));
    document.getElementById('d5DevicesRetry')?.classList.toggle('show',!ok);
    if(!ok){['d5DevicesRecovered','d5AnalysisRecovered','d5FileRestored'].forEach(id=>document.getElementById(id)?.classList.remove('show'));return;}
    holdReadingPosition(()=>{
      ['d5DevicesRecovered','d5AnalysisRecovered','d5FileRestored'].forEach(id=>document.getElementById(id)?.classList.add('show'));
      document.querySelectorAll('.final-device-target').forEach(el=>el.classList.add('mark-final-device'));
    },readingY);
    const verify=document.getElementById('verifyD5Devices');markVerifyButton(verify);if(verify)verify.disabled=true;
    document.querySelectorAll('#d5DeviceOptions .multi-option').forEach(option=>option.disabled=true);
  });
  document.getElementById('confirmFinalAnalystRecord')?.addEventListener('click',event=>{
    event.currentTarget.disabled=true;
    showRecoveryOverlay({caseId:'D',fragment:'2',nextId:'O0',nextLabel:'RETURN TO ARCHIVE'});
  });
};
