window.initCaseB=function(){
  const choices=[...document.querySelectorAll('#speakerPassages .passage-choice')];
  const verify=document.getElementById('verifySpeakerPassages');

  choices.forEach(choice=>{
    choice.addEventListener('click',()=>{
      choice.classList.toggle('selected');
      const selected=choices.filter(x=>x.classList.contains('selected'));
      verify.disabled=selected.length!==2;
      document.getElementById('speakerPassagesRetry')?.classList.remove('show');
      document.getElementById('speakerPassagesFb')?.classList.remove('show');
    });
  });

  verify?.addEventListener('click',()=>{
    const selected=choices.filter(x=>x.classList.contains('selected'));
    const ok=selected.length===2&&selected.every(x=>x.dataset.correct==='1');
    document.getElementById('speakerPassagesRetry')?.classList.toggle('show',!ok);
    document.getElementById('speakerPassagesFb')?.classList.toggle('show',ok);
    if(ok){
      choices.forEach(x=>x.disabled=true);
      verify.disabled=true;
    }
  });

  document.getElementById('completeBRecovery')?.addEventListener('click',()=>{
    showRecoveryOverlay({caseId:'B',fragment:'63',nextId:'O0',nextLabel:'RETURN TO ARCHIVE'});
  });
};