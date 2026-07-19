window.initCaseC=function(){
  const correctBoundaries=new Set(['1','2','5','8']);
  const boundaries=[...document.querySelectorAll('.boundary')];

  boundaries.forEach(b=>b.addEventListener('click',()=>{
    if(b.classList.contains('on')){
      b.classList.remove('on');
      return;
    }
    const selected=boundaries.filter(x=>x.classList.contains('on'));
    if(selected.length>=4){
      return toast('Select exactly four section boundaries.');
    }
    b.classList.add('on');
  }));

  document.getElementById('confirmBoundaries')?.addEventListener('click',()=>{
    const selected=boundaries.filter(x=>x.classList.contains('on')).map(x=>x.dataset.b);
    if(selected.length!==4){
      return toast('Select exactly four section boundaries.');
    }
    const ok=selected.every(x=>correctBoundaries.has(x)) && correctBoundaries.size===selected.length;
    if(ok){
      document.getElementById('c1fb')?.classList.add('show');
      const sf=document.getElementById('sectionFunctions');
      if(sf) sf.hidden=false;
    }else{
      toast('The structure is not complete yet. Look for shifts in time, focus or purpose.');
    }
  });

  document.getElementById('showStructureHint')?.addEventListener('click',e=>{
    const f=document.getElementById('c1hint');
    f.classList.add('show');
    f.innerHTML='<b>HINT</b><br>A new section begins when Lincoln changes his time frame, his focus, or what he is trying to achieve.';
    e.currentTarget.disabled=true;
  });

  let funcSel=null;

  document.querySelectorAll('#funcPool .note').forEach(n=>n.addEventListener('click',()=>{
    if(n.classList.contains('assigned')) return;
    document.querySelectorAll('#funcPool .note').forEach(x=>x.classList.remove('active'));
    n.classList.add('active');
    funcSel=n;
  }));

  function updateFunctionVerify(){
    const slots=[...document.querySelectorAll('.secslot')];
    const btn=document.getElementById('verifySectionFunctions');
    if(btn) btn.disabled=!slots.every(x=>x.classList.contains('filled'));
  }

  document.querySelectorAll('.secslot').forEach(z=>z.addEventListener('click',()=>{
    if(z.classList.contains('filled')&&!funcSel){
      const value=z.dataset.assignedValue;
      const source=[...document.querySelectorAll('#funcPool .note')].find(n=>n.textContent===value);
      source?.classList.remove('assigned');
      z.classList.remove('filled');
      z.textContent=z.dataset.label;
      delete z.dataset.assignedValue;
      updateFunctionVerify();
      return;
    }

    if(!funcSel) return toast('Select a function card first.');

    if(z.classList.contains('filled')){
      const old=z.dataset.assignedValue;
      const oldSource=[...document.querySelectorAll('#funcPool .note')].find(n=>n.textContent===old);
      oldSource?.classList.remove('assigned');
    }

    z.textContent=z.dataset.label+' · '+funcSel.textContent;
    z.classList.add('filled');
    z.dataset.assignedValue=funcSel.textContent;
    z.dataset.assignedSec=funcSel.dataset.sec;

    funcSel.classList.remove('active');
    funcSel.classList.add('assigned');
    funcSel=null;

    document.getElementById('c2retry')?.classList.remove('show');
    document.getElementById('c2fb')?.classList.remove('show');
    updateFunctionVerify();
  }));

  document.getElementById('verifySectionFunctions')?.addEventListener('click',()=>{
    const slots=[...document.querySelectorAll('.secslot')];
    const correct=slots.every(slot=>slot.dataset.sec===slot.dataset.assignedSec);
    document.getElementById('c2retry')?.classList.toggle('show',!correct);
    document.getElementById('c2fb')?.classList.toggle('show',correct);
  });

  const analystPairs=[
    {
      content:'Lincoln refers to the founding of the United States and the ideals of liberty and equality.',
      analysis:'Lincoln uses the founding ideals as a point of reference for the crisis he addresses next.'
    },
    {
      content:'Lincoln presents the Civil War as a test of whether the nation can survive.',
      analysis:'Lincoln connects the present crisis directly to the principles established at the nation’s founding.'
    },
    {
      content:'Lincoln explains that those present have come to dedicate part of the battlefield as a cemetery.',
      analysis:'Lincoln narrows the focus from the fate of the nation to the immediate situation at Gettysburg, making the larger conflict concrete.'
    },
    {
      content:'Lincoln says that those present cannot truly dedicate the ground because the soldiers have already done so.',
      analysis:'The argument shifts from the speakers’ symbolic act of dedication to the soldiers’ sacrifice, which Lincoln presents as more significant than words.'
    },
    {
      content:'Lincoln says that the living must continue the unfinished work of those who died.',
      analysis:'Lincoln shifts responsibility from the dead to the living, turning remembrance of sacrifice into a demand for continued action.'
    },
    {
      content:'Lincoln ends by expressing the hope that the nation will experience a new birth of freedom and that democratic government will continue.',
      analysis:'Lincoln develops his argument from remembrance towards renewal and continued responsibility.'
    }
  ];

  let analystIndex=0;
  const pairBox=document.getElementById('analystNotePair');
  const counter=document.getElementById('analystNoteCounter');
  const retry=document.getElementById('analystNoteRetry');
  const success=document.getElementById('analystNoteSuccess');
  const restored=document.getElementById('analystRecordRestored');
  const nextBtn=document.getElementById('nextAnalystNote');
  const skillCheck=document.getElementById('lineArgumentSkillCheck');

  function renderAnalystPair(){
    if(!pairBox)return;
    const pair=analystPairs[analystIndex];
    counter.textContent=`RECOVER ANALYST NOTE ${String(analystIndex+1).padStart(2,'0')} / 06`;
    retry?.classList.remove('show');
    success?.classList.remove('show');

    const options=[
      {text:pair.content,kind:'content'},
      {text:pair.analysis,kind:'analysis'}
    ];

    if(analystIndex%2===1) options.reverse();

    pairBox.innerHTML='';
    options.forEach(opt=>{
      const btn=document.createElement('button');
      btn.className='analyst-note-option';
      btn.textContent=opt.text;
      btn.dataset.kind=opt.kind;
      btn.addEventListener('click',()=>{
        pairBox.querySelectorAll('.analyst-note-option').forEach(x=>x.classList.remove('selected'));
        btn.classList.add('selected');

        if(opt.kind==='analysis'){
          retry?.classList.remove('show');
          pairBox.querySelectorAll('.analyst-note-option').forEach(x=>x.disabled=true);

          if(analystIndex===analystPairs.length-1){
            success?.classList.remove('show');
            restored?.classList.add('show');
            if(skillCheck) skillCheck.hidden=false;
          }else{
            success?.classList.add('show');
          }
        }else{
          success?.classList.remove('show');
          retry?.classList.add('show');
        }
      });
      pairBox.appendChild(btn);
    });
  }

  nextBtn?.addEventListener('click',()=>{
    if(analystIndex<analystPairs.length-1){
      analystIndex++;
      renderAnalystPair();
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
      if(ok){
        document.querySelectorAll('#lineArgumentOptions .skill-option').forEach(x=>x.disabled=true);
      }
    });
  });

  let argumentFuncSel=null;

  document.querySelectorAll('#argumentFunctionPool .function-token').forEach(token=>{
    token.addEventListener('click',()=>{
      if(token.classList.contains('assigned')) return;
      document.querySelectorAll('#argumentFunctionPool .function-token').forEach(x=>x.classList.remove('active'));
      token.classList.add('active');
      argumentFuncSel=token;
    });
  });

  function updateArgumentFunctionVerify(){
    const slots=[...document.querySelectorAll('.argument-function-slot')];
    const btn=document.getElementById('verifyArgumentFunctions');
    if(btn) btn.disabled=!slots.every(s=>s.classList.contains('filled'));
  }

  document.querySelectorAll('.argument-function-slot').forEach(slot=>{
    slot.addEventListener('click',()=>{
      if(slot.classList.contains('filled')&&!argumentFuncSel){
        const val=slot.dataset.assignedValue;
        const old=[...document.querySelectorAll('#argumentFunctionPool .function-token')].find(t=>t.textContent===val);
        old?.classList.remove('assigned');
        slot.classList.remove('filled');
        slot.textContent=slot.dataset.label;
        delete slot.dataset.assignedValue;
        delete slot.dataset.assignedSec;
        updateArgumentFunctionVerify();
        return;
      }

      if(!argumentFuncSel) return toast('Select a function first.');

      if(slot.classList.contains('filled')){
        const oldVal=slot.dataset.assignedValue;
        const old=[...document.querySelectorAll('#argumentFunctionPool .function-token')].find(t=>t.textContent===oldVal);
        old?.classList.remove('assigned');
      }

      slot.textContent=argumentFuncSel.textContent;
      slot.classList.add('filled');
      slot.dataset.assignedValue=argumentFuncSel.textContent;
      slot.dataset.assignedSec=argumentFuncSel.dataset.sec;

      argumentFuncSel.classList.remove('active');
      argumentFuncSel.classList.add('assigned');
      argumentFuncSel=null;

      document.getElementById('argumentFunctionsRetry')?.classList.remove('show');
      document.getElementById('argumentFunctionsRestored')?.classList.remove('show');
      updateArgumentFunctionVerify();
    });
  });

  document.getElementById('verifyArgumentFunctions')?.addEventListener('click',()=>{
    const slots=[...document.querySelectorAll('.argument-function-slot')];
    const ok=slots.every(slot=>slot.dataset.sec===slot.dataset.assignedSec);
    document.getElementById('argumentFunctionsRetry')?.classList.toggle('show',!ok);
    document.getElementById('argumentFunctionsRestored')?.classList.toggle('show',ok);
    if(ok){
      const task=document.getElementById('timeStructureTask');
      if(task) task.hidden=false;
    }
  });

  function normalizeTimeWord(value){
    return value.trim().toLowerCase().replace(/[^a-z]/g,'');
  }

  function closeEnough(actual,target){
    if(actual===target) return true;
    if(Math.abs(actual.length-target.length)>1) return false;
    let i=0,j=0,diffs=0;
    while(i<actual.length && j<target.length){
      if(actual[i]===target[j]){
        i++;j++;
      }else{
        diffs++;
        if(diffs>1)return false;
        if(actual.length>target.length)i++;
        else if(actual.length<target.length)j++;
        else {i++;j++;}
      }
    }
    if(i<actual.length || j<target.length)diffs++;
    return diffs<=1;
  }

  document.getElementById('showTimeHint')?.addEventListener('click',e=>{
    const hint=document.getElementById('timeHint');
    hint.classList.add('show');
    hint.innerHTML='<b>HINT</b><br>Think about when Lincoln’s ideas are located. Does he look back, describe the situation of his own time, or look ahead?';
    e.currentTarget.disabled=true;
  });

  document.getElementById('verifyTimeStructure')?.addEventListener('click',()=>{
    const values=[
      normalizeTimeWord(document.getElementById('timePast')?.value||''),
      normalizeTimeWord(document.getElementById('timePresent')?.value||''),
      normalizeTimeWord(document.getElementById('timeFuture')?.value||'')
    ];
    const targets=['past','present','future'];
    const ok=values.every((v,i)=>closeEnough(v,targets[i]));
    document.getElementById('timeStructureRetry')?.classList.toggle('show',!ok);
    document.getElementById('argumentMapRecovered')?.classList.toggle('show',ok);
    if(ok){
      ['timePast','timePresent','timeFuture','verifyTimeStructure','showTimeHint'].forEach(id=>{
        const el=document.getElementById(id);
        if(el) el.disabled=true;
      });
      setTimeout(()=>showRecoveryOverlay({caseId:'C',fragment:'27',nextId:'D0',nextLabel:'CONTINUE TO NEXT FILE'}),450);
    }
  });
};