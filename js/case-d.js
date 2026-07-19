window.initCaseD=function(){
  function norm(v){
    return (v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
  }

  function closeEnough(a,b){
    a=norm(a); b=norm(b);
    if(a===b)return true;
    if(Math.abs(a.length-b.length)>2)return false;
    let i=0,j=0,d=0;
    while(i<a.length&&j<b.length){
      if(a[i]===b[j]){i++;j++;continue;}
      d++; if(d>2)return false;
      if(a.length>b.length)i++;
      else if(a.length<b.length)j++;
      else{i++;j++;}
    }
    return d+(a.length-i)+(b.length-j)<=2;
  }

  document.getElementById('verifyD1Device')?.addEventListener('click',()=>{
    const v=norm(document.getElementById('d1DeviceInput')?.value);
    const exact=v.includes('repetition');
    const fuzzy=!exact&&closeEnough(v,'repetition');
    const ok=exact||fuzzy;
    document.getElementById('d1DeviceRetry')?.classList.toggle('show',!ok);
    document.getElementById('d1DeviceRecovered')?.classList.toggle('show',ok);
    if(ok){
      markVerifyButton(document.getElementById('verifyD1Device'));
      if(fuzzy)spellingAccepted('repetition');
      const b=document.getElementById('d1AnalysisBlock');if(b)b.hidden=false;
    }
  });

  let d1Sel=null;
  document.querySelectorAll('.d1-example').forEach(note=>note.addEventListener('click',()=>{
    if(note.classList.contains('assigned'))return;
    document.querySelectorAll('.d1-example').forEach(x=>x.classList.remove('active'));
    note.classList.add('active'); d1Sel=note;
  }));

  function updateD1Verify(){
    const slots=[...document.querySelectorAll('.d1-layer-slot')];
    const btn=document.getElementById('verifyD1Layers');
    if(btn)btn.disabled=!slots.every(s=>s.classList.contains('filled'));
  }

  document.querySelectorAll('.d1-layer-slot').forEach(slot=>slot.addEventListener('click',()=>{
    if(slot.classList.contains('filled')&&!d1Sel){
      const old=[...document.querySelectorAll('.d1-example')].find(x=>x.textContent===slot.dataset.assignedValue);
      old?.classList.remove('assigned');
      slot.classList.remove('filled');
      slot.textContent=slot.dataset.label;
      delete slot.dataset.assignedValue; delete slot.dataset.assignedLayer;
      updateD1Verify(); return;
    }
    if(!d1Sel)return toast('Select an analyst note first.');
    if(slot.classList.contains('filled')){
      const old=[...document.querySelectorAll('.d1-example')].find(x=>x.textContent===slot.dataset.assignedValue);
      old?.classList.remove('assigned');
    }
    slot.textContent=slot.dataset.label+' · '+d1Sel.textContent;
    slot.classList.add('filled');
    slot.dataset.assignedValue=d1Sel.textContent;
    slot.dataset.assignedLayer=d1Sel.dataset.layer;
    d1Sel.classList.remove('active'); d1Sel.classList.add('assigned'); d1Sel=null;
    updateD1Verify();
  }));

  document.getElementById('verifyD1Layers')?.addEventListener('click',()=>{
    const ok=[...document.querySelectorAll('.d1-layer-slot')].every(s=>s.dataset.layer===s.dataset.assignedLayer);
    document.getElementById('d1LayersRetry')?.classList.toggle('show',!ok);
    document.getElementById('d1LayersRecovered')?.classList.toggle('show',ok);
    if(ok)markVerifyButton(document.getElementById('verifyD1Layers'));
  });

  document.getElementById('verifyD2Antithesis')?.addEventListener('click',()=>{
    const v=norm(document.getElementById('d2AntithesisInput')?.value);
    const livingDead=v.includes('living and dead')||v.includes('living dead')||closeEnough(v,'living and dead');
    const aliases=['what we say here what they did here','words vs actions','words versus actions','speakers words vs soldiers actions','speakers words versus soldiers actions','what is said remembered today vs what the soldiers did'];
    const exactAlias=aliases.find(alias=>norm(alias)===v);
    const fuzzyAlias=!exactAlias?aliases.find(alias=>closeEnough(v,alias)):null;
    const semanticCorrect=(v.includes('say')&&v.includes('did'))||
      (v.includes('word')&&(v.includes('action')||v.includes('deed')))||
      (v.includes('speaker')&&v.includes('soldier')&&(v.includes('word')||v.includes('action')||v.includes('deed')))||
      (v.includes('remember')&&v.includes('forget'));
    const correct=Boolean(exactAlias||fuzzyAlias||semanticCorrect);
    document.getElementById('d2LivingDeadHint')?.classList.toggle('show',livingDead&&!correct);
    document.getElementById('d2AntithesisRetry')?.classList.toggle('show',!correct&&!livingDead);
    document.getElementById('d2AntithesisRecovered')?.classList.toggle('show',correct);
    if(correct){
      markVerifyButton(document.getElementById('verifyD2Antithesis'));
      if(fuzzyAlias)spellingAccepted(fuzzyAlias);
      const b=document.getElementById('d2AnalysisExamples');if(b)b.hidden=false;
    }
  });

  function tokeniseFocusPassages(){
    document.querySelectorAll('#d4Speech .focus-markable').forEach(paragraph=>{
      const walk=node=>{
        [...node.childNodes].forEach(child=>{
          if(child.nodeType===Node.ELEMENT_NODE){
            if(child.matches('.pattern-target,.pattern-optional')){
              const button=document.createElement('button');
              button.type='button';
              button.className='word-token '+(child.matches('.pattern-target')?'required-pattern':'optional-pattern');
              button.dataset.word=child.dataset.word;
              button.textContent=child.textContent;
              child.replaceWith(button);
            }else if(!child.matches('button')) walk(child);
          }else if(child.nodeType===Node.TEXT_NODE&&child.textContent.trim()){
            const fragment=document.createDocumentFragment();
            child.textContent.split(/(\s+)/).forEach(part=>{
              if(!part)return;
              if(/^\s+$/.test(part)){fragment.appendChild(document.createTextNode(part));return;}
              const match=part.match(/^([A-Za-z’']+)([^A-Za-z’']*)$/);
              if(match){
                const button=document.createElement('button');button.type='button';button.className='word-token';button.dataset.word=match[1].toLowerCase();button.textContent=match[1];fragment.appendChild(button);
                if(match[2])fragment.appendChild(document.createTextNode(match[2]));
              }else fragment.appendChild(document.createTextNode(part));
            });
            child.replaceWith(fragment);
          }
        });
      };
      walk(paragraph);
    });
  }
  tokeniseFocusPassages();
  const patternTokens=[...document.querySelectorAll('#d4Speech .word-token')];
  patternTokens.forEach(token=>token.addEventListener('click',()=>token.classList.toggle('selected')));

  document.getElementById('verifyD4Pattern')?.addEventListener('click',()=>{
    const selected=[...document.querySelectorAll('#d4Speech .word-token.selected')].map(x=>x.dataset.word);
    const required=['brought forth','conceived','new birth'];
    const allowed=[...required,'our fathers'];
    const ok=required.every(x=>selected.includes(x))&&selected.every(x=>allowed.includes(x));
    document.getElementById('d4PatternRetry')?.classList.toggle('show',!ok);
    document.getElementById('d4PatternRecovered')?.classList.toggle('show',ok);
    if(ok){markVerifyButton(document.getElementById('verifyD4Pattern'));const b=document.getElementById('d4DeviceBlock');if(b)b.hidden=false;}
  });

  document.getElementById('verifyD4Device')?.addEventListener('click',()=>{
    const v=norm(document.getElementById('d4DeviceInput')?.value);
    const exactPerson=v.includes('personification');
    const fuzzyPerson=!exactPerson&&closeEnough(v,'personification');
    const exactMetaphor=v.includes('metaphor');
    const fuzzyMetaphor=!exactMetaphor&&closeEnough(v,'metaphor');
    const person=exactPerson||fuzzyPerson;
    const ok=exactMetaphor||fuzzyMetaphor||person;
    document.getElementById('d4PersonificationNote')?.classList.toggle('show',person);
    document.getElementById('d4DeviceRetry')?.classList.toggle('show',!ok);
    if(ok){
      markVerifyButton(document.getElementById('verifyD4Device'));
      if(fuzzyMetaphor)spellingAccepted('metaphor');
      else if(fuzzyPerson)spellingAccepted('personification');
      const b=document.getElementById('d4FunctionBlock');if(b)b.hidden=false;
    }
  });

  document.querySelectorAll('#d4FunctionOptions .skill-option').forEach(btn=>btn.addEventListener('click',()=>{
    const ok=btn.dataset.correct==='1';
    document.querySelectorAll('#d4FunctionOptions .skill-option').forEach(x=>x.classList.remove('selected'));
    btn.classList.add('selected');
    document.getElementById('d4FunctionRetry')?.classList.toggle('show',!ok);
    document.getElementById('d4FunctionRecovered')?.classList.toggle('show',ok);
    if(ok){
      const b=document.getElementById('d4Briefing');if(b)b.hidden=false;
      document.querySelectorAll('#d4FunctionOptions .skill-option').forEach(x=>x.disabled=true);
    }
  }));

  // D05 final device file
  const d5Selected=new Set();
  document.querySelectorAll('#d5DeviceOptions .multi-option').forEach(btn=>{
    btn.addEventListener('click',()=>{
      const key=btn.dataset.device;
      if(d5Selected.has(key)){
        d5Selected.delete(key);
        btn.classList.remove('selected');
      }else{
        d5Selected.add(key);
        btn.classList.add('selected');
      }
    });
  });

  document.getElementById('verifyD5Devices')?.addEventListener('click',()=>{
    const required=['parallelism','rule-of-three','epiphora'];
    const ok=required.every(x=>d5Selected.has(x)) && [...d5Selected].every(x=>required.includes(x));
    document.getElementById('d5DevicesRetry')?.classList.toggle('show',!ok);
    document.getElementById('d5DevicesRecovered')?.classList.toggle('show',ok);
    document.getElementById('d5AnalysisRecovered')?.classList.toggle('show',ok);
    document.getElementById('d5FileRestored')?.classList.toggle('show',ok);
    if(ok){
      markVerifyButton(document.getElementById('verifyD5Devices'));
      setTimeout(()=>showRecoveryOverlay({caseId:'D',fragment:'2',nextId:'O0',nextLabel:'RETURN TO ARCHIVE'}),550);
      document.querySelectorAll('#d5DeviceOptions .multi-option').forEach(x=>x.disabled=true);
      const verify=document.getElementById('verifyD5Devices');
      if(verify) verify.disabled=true;
    }
  });
};