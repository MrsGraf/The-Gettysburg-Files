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

  function show(id,visible=true){
    const el=document.getElementById(id);
    if(!el)return;
    if('hidden' in el)el.hidden=!visible;
    el.classList.toggle('show',visible);
  }

  function lockInput(inputId,buttonId){
    const input=document.getElementById(inputId);if(input)input.disabled=true;
    const button=document.getElementById(buttonId);if(button){markVerifyButton(button);button.disabled=true;}
  }

  // D01 · repetition and analytical layers
  document.getElementById('verifyD1Device')?.addEventListener('click',()=>{
    const value=norm(document.getElementById('d1DeviceInput')?.value);
    const exact=value.includes('repetition');
    const fuzzy=!exact&&closeEnough(value,'repetition');
    const ok=exact||fuzzy;
    document.getElementById('d1DeviceRetry')?.classList.toggle('show',!ok);
    document.getElementById('d1DeviceRecovered')?.classList.toggle('show',ok);
    if(!ok)return;
    lockInput('d1DeviceInput','verifyD1Device');
    document.querySelectorAll('.d1-repetition-clue').forEach(el=>el.classList.add('mark-repetition'));
    if(fuzzy&&window.spellingAccepted)spellingAccepted('repetition');
    const block=document.getElementById('d1AnalysisBlock');if(block)block.hidden=false;
  });

  let selectedD1Note=null;
  document.querySelectorAll('.d1-example').forEach(note=>note.addEventListener('click',()=>{
    if(note.classList.contains('assigned'))return;
    document.querySelectorAll('.d1-example').forEach(item=>item.classList.remove('active'));
    note.classList.add('active');
    selectedD1Note=note;
  }));

  function updateD1Verify(){
    const slots=[...document.querySelectorAll('.d1-layer-slot')];
    const button=document.getElementById('verifyD1Layers');
    if(button)button.disabled=!slots.every(slot=>slot.classList.contains('filled'));
  }

  document.querySelectorAll('.d1-layer-slot').forEach(slot=>slot.addEventListener('click',()=>{
    if(slot.classList.contains('filled')&&!selectedD1Note){
      const old=[...document.querySelectorAll('.d1-example')].find(note=>note.dataset.assignmentId===slot.dataset.assignmentId);
      old?.classList.remove('assigned');
      slot.classList.remove('filled');
      slot.textContent=slot.dataset.label;
      delete slot.dataset.assignmentId;
      delete slot.dataset.assignedLayer;
      updateD1Verify();
      return;
    }
    if(!selectedD1Note)return toast('Select an analyst note first.');
    if(slot.classList.contains('filled')){
      const old=[...document.querySelectorAll('.d1-example')].find(note=>note.dataset.assignmentId===slot.dataset.assignmentId);
      old?.classList.remove('assigned');
    }
    if(!selectedD1Note.dataset.assignmentId)selectedD1Note.dataset.assignmentId=`d1-${Math.random().toString(36).slice(2)}`;
    slot.textContent=`${slot.dataset.label} · ${selectedD1Note.textContent}`;
    slot.classList.add('filled');
    slot.dataset.assignmentId=selectedD1Note.dataset.assignmentId;
    slot.dataset.assignedLayer=selectedD1Note.dataset.layer;
    selectedD1Note.classList.remove('active');
    selectedD1Note.classList.add('assigned');
    selectedD1Note=null;
    updateD1Verify();
  }));

  document.getElementById('verifyD1Layers')?.addEventListener('click',()=>{
    const slots=[...document.querySelectorAll('.d1-layer-slot')];
    const ok=slots.every(slot=>slot.dataset.layer===slot.dataset.assignedLayer);
    document.getElementById('d1LayersRetry')?.classList.toggle('show',!ok);
    document.getElementById('d1LayersRecovered')?.classList.toggle('show',ok);
    if(!ok)return;
    const verify=document.getElementById('verifyD1Layers');markVerifyButton(verify);if(verify)verify.disabled=true;
    slots.forEach(slot=>{
      slot.classList.add(`pair-${slot.dataset.layer}`);
      slot.disabled=true;
      const note=[...document.querySelectorAll('.d1-example')].find(item=>item.dataset.assignmentId===slot.dataset.assignmentId);
      note?.classList.add(`pair-${slot.dataset.layer}`);
      if(note)note.disabled=true;
    });
  });

  // D02 · reference first, then a two-page context slider
  document.getElementById('openD2Context')?.addEventListener('click',event=>{
    const workflow=document.getElementById('d2ContextWorkflow');if(workflow)workflow.hidden=false;
    event.currentTarget.disabled=true;
    event.currentTarget.textContent='DEVICE REFERENCE REVIEWED';
    workflow?.scrollIntoView({behavior:'smooth',block:'start'});
  });

  function parallelismAnswerCorrect(value){
    const v=norm(value);
    return (v.includes('what we say here')&&v.includes('what they did here'))||
      (v.includes('say here')&&v.includes('did here'))||
      (v.includes('what subject verb here'))||
      (v.includes('what')&&v.includes('here')&&v.includes('say')&&v.includes('did'));
  }

  document.getElementById('verifyD2Parallelism')?.addEventListener('click',()=>{
    const ok=parallelismAnswerCorrect(document.getElementById('d2ParallelismInput')?.value);
    document.getElementById('d2ParallelismRetry')?.classList.toggle('show',!ok);
    document.getElementById('d2ParallelismRecovered')?.classList.toggle('show',ok);
    if(!ok)return;
    lockInput('d2ParallelismInput','verifyD2Parallelism');
    document.querySelectorAll('.d2-structure-a,.d2-structure-b').forEach(el=>el.classList.add('mark-parallelism'));
    const progression=document.getElementById('d2ParallelismProgression');if(progression)progression.hidden=false;
  });

  document.getElementById('showD2Antithesis')?.addEventListener('click',()=>{
    const first=document.getElementById('d2ParallelismSlide');
    const second=document.getElementById('d2AntithesisSlide');
    if(first)first.hidden=true;
    if(second)second.hidden=false;
    document.getElementById('d2Slider')?.classList.add('show-second-slide');
    const counter=document.getElementById('d2SlideCounter');if(counter)counter.textContent='02 / 02';
    const title=document.getElementById('d2SlideTitle');if(title)title.textContent='ANTITHESIS IN CONTEXT';
    document.getElementById('d2Slider')?.scrollIntoView({behavior:'smooth',block:'start'});
  });

  document.getElementById('verifyD2Antithesis')?.addEventListener('click',()=>{
    const value=norm(document.getElementById('d2AntithesisInput')?.value);
    const livingDead=value.includes('living and dead')||value.includes('living dead')||closeEnough(value,'living and dead');
    const correct=(value.includes('say')&&value.includes('did'))||
      (value.includes('word')&&(value.includes('action')||value.includes('deed')))||
      (value.includes('speaker')&&value.includes('soldier')&&(value.includes('word')||value.includes('action')||value.includes('deed')))||
      (value.includes('ceremony')&&value.includes('soldier'));
    document.getElementById('d2LivingDeadHint')?.classList.toggle('show',livingDead&&!correct);
    document.getElementById('d2AntithesisRetry')?.classList.toggle('show',!correct&&!livingDead);
    document.getElementById('d2AntithesisRecovered')?.classList.toggle('show',correct);
    if(!correct)return;
    lockInput('d2AntithesisInput','verifyD2Antithesis');
    document.querySelectorAll('.d2-structure-a,.d2-structure-b').forEach(el=>el.classList.add('mark-antithesis'));
    const progression=document.getElementById('d2AntithesisProgression');if(progression)progression.hidden=false;
  });

  // D03 · semantic field, extended birth metaphor and independent functional analysis
  function birthImageCorrect(value){
    const v=norm(value);
    return ['birth','a birth','being born','born','the birth of a child','giving birth','birth process','childbirth'].some(answer=>v===norm(answer)||v.includes(norm(answer)));
  }

  document.getElementById('verifyD3Image')?.addEventListener('click',()=>{
    const ok=birthImageCorrect(document.getElementById('d3ImageInput')?.value);
    document.getElementById('d3ImageRetry')?.classList.toggle('show',!ok);
    document.getElementById('d3ImageRecovered')?.classList.toggle('show',ok);
    if(!ok)return;
    lockInput('d3ImageInput','verifyD3Image');
    const returnStage=document.getElementById('d3ReturnStage');if(returnStage)returnStage.hidden=false;
  });

  let returnPhraseRecovered=false;
  document.getElementById('d3ReturnPhrase')?.addEventListener('click',event=>{
    if(document.getElementById('d3ReturnStage')?.hidden)return;
    returnPhraseRecovered=true;
    event.currentTarget.classList.add('mark-metaphor','recovered');
    event.currentTarget.disabled=true;
    document.getElementById('d3ReturnHint')?.classList.remove('show');
    document.getElementById('d3ReturnRecovered')?.classList.add('show');
    const meaningStage=document.getElementById('d3MeaningStage');if(meaningStage)meaningStage.hidden=false;
  });

  document.getElementById('d3ReturnStage')?.addEventListener('click',event=>{
    if(event.target.closest('#d3ReturnPhrase')||returnPhraseRecovered)return;
    document.getElementById('d3ReturnHint')?.classList.add('show');
  });

  function literalCorrect(value){
    const v=norm(value);
    return (v.includes('child')||v.includes('baby')||v.includes('new life'))&&(v.includes('born')||v.includes('birth')||v.includes('conceiv'));
  }
  function contextCorrect(value){
    const v=norm(value);
    const nation=v.includes('nation')||v.includes('united states')||v.includes('america');
    const founding=v.includes('found')||v.includes('created')||v.includes('born')||v.includes('begin');
    const renewal=v.includes('renew')||v.includes('rebirth')||v.includes('new birth')||v.includes('freedom')||v.includes('future');
    return nation&&founding&&renewal;
  }

  document.getElementById('verifyD3Meanings')?.addEventListener('click',()=>{
    const literal=literalCorrect(document.getElementById('d3LiteralInput')?.value);
    const contextual=contextCorrect(document.getElementById('d3ContextInput')?.value);
    const ok=literal&&contextual;
    document.getElementById('d3MeaningsRetry')?.classList.toggle('show',!ok);
    document.getElementById('d3MeaningsRecovered')?.classList.toggle('show',ok);
    if(!ok)return;
    ['d3LiteralInput','d3ContextInput'].forEach(id=>{const el=document.getElementById(id);if(el)el.disabled=true;});
    const button=document.getElementById('verifyD3Meanings');markVerifyButton(button);if(button)button.disabled=true;
    const functionStage=document.getElementById('d3FunctionStage');if(functionStage)functionStage.hidden=false;
  });

  function functionCorrect(value){
    const v=norm(value);
    const frame=v.includes('frame')||v.includes('beginning and end')||v.includes('opening and ending')||v.includes('start and end');
    const past=v.includes('found')||v.includes('original birth')||v.includes('past')||v.includes('beginning');
    const future=v.includes('renew')||v.includes('rebirth')||v.includes('new birth')||v.includes('future');
    const connect=v.includes('connect')||v.includes('link')||v.includes('bridge')||v.includes('frame');
    return connect&&past&&future&&(frame||v.includes('responsibility')||v.includes('living'));
  }

  document.getElementById('verifyD3Function')?.addEventListener('click',()=>{
    const ok=functionCorrect(document.getElementById('d3FunctionInput')?.value);
    document.getElementById('d3FunctionRetry')?.classList.toggle('show',!ok);
    document.getElementById('d3FunctionRecovered')?.classList.toggle('show',ok);
    if(!ok)return;
    lockInput('d3FunctionInput','verifyD3Function');
    const briefing=document.getElementById('d3Briefing');if(briefing)briefing.hidden=false;
    briefing?.scrollIntoView({behavior:'smooth',block:'start'});
  });

  // D04 · final devices. The explanation remains visible until students explicitly confirm the record.
  const selectedDevices=new Set();
  document.querySelectorAll('#d5DeviceOptions .multi-option').forEach(button=>button.addEventListener('click',()=>{
    const device=button.dataset.device;
    if(selectedDevices.has(device)){selectedDevices.delete(device);button.classList.remove('selected');}
    else{selectedDevices.add(device);button.classList.add('selected');}
  }));

  document.getElementById('verifyD5Devices')?.addEventListener('click',()=>{
    const required=['parallelism','rule-of-three','epiphora'];
    const ok=required.every(device=>selectedDevices.has(device))&&[...selectedDevices].every(device=>required.includes(device));
    document.getElementById('d5DevicesRetry')?.classList.toggle('show',!ok);
    ['d5DevicesRecovered','d5AnalysisRecovered','d5FileRestored'].forEach(id=>document.getElementById(id)?.classList.toggle('show',ok));
    if(!ok)return;
    document.querySelectorAll('.final-device-target').forEach(el=>el.classList.add('mark-final-device'));
    const verify=document.getElementById('verifyD5Devices');markVerifyButton(verify);if(verify)verify.disabled=true;
    document.querySelectorAll('#d5DeviceOptions .multi-option').forEach(option=>option.disabled=true);
    document.getElementById('d5FileRestored')?.scrollIntoView({behavior:'smooth',block:'center'});
  });

  document.getElementById('confirmFinalAnalystRecord')?.addEventListener('click',event=>{
    event.currentTarget.disabled=true;
    showRecoveryOverlay({caseId:'D',fragment:'2',nextId:'O0',nextLabel:'RETURN TO ARCHIVE'});
  });
};
