window.initCaseB=function(){
  const passageChoices=[...document.querySelectorAll('#speakerPassages .passage-choice')];
  const verifyPassages=document.getElementById('verifySpeakerPassages');

  passageChoices.forEach(choice=>choice.addEventListener('click',()=>{
    choice.classList.toggle('selected');
    const selected=passageChoices.filter(x=>x.classList.contains('selected'));
    if(selected.length>2){
      choice.classList.remove('selected');
      return toast('Select two passages.');
    }
    if(verifyPassages) verifyPassages.disabled=selected.length!==2;
    document.getElementById('speakerPassagesRetry')?.classList.remove('show');
    document.getElementById('speakerPassagesFb')?.classList.remove('show');
  }));

  verifyPassages?.addEventListener('click',()=>{
    const selected=passageChoices.filter(x=>x.classList.contains('selected'));
    const correct=selected.length===2 && selected.every(x=>x.dataset.correct==='1');
    document.getElementById('speakerPassagesRetry')?.classList.toggle('show',!correct);
    document.getElementById('speakerPassagesFb')?.classList.toggle('show',correct);
  });

  let speechSel=null;
  document.querySelectorAll('.speechfrag').forEach(n=>n.addEventListener('click',()=>{
    if(n.classList.contains('assigned')) return;
    speechSel=n;
    document.querySelectorAll('.speechfrag').forEach(x=>x.classList.remove('active'));
    n.classList.add('active');
  }));

  document.querySelectorAll('.speechslot').forEach(z=>z.addEventListener('click',()=>{
    if(!speechSel) return toast('Select a recovered data fragment.');
    if(z.dataset.answer===speechSel.dataset.value){
      z.textContent=z.dataset.answer;
      z.classList.add('filled');
      speechSel.classList.remove('active');
      speechSel.classList.add('assigned');
      speechSel=null;
      if([...document.querySelectorAll('.speechslot')].every(x=>x.classList.contains('filled'))){
        document.getElementById('b3fb')?.classList.add('show');
      }
    }else{
      toast('This fragment does not fit that record.');
    }
  }));
};