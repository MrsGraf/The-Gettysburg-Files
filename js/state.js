window.GettysburgState=(()=>{
  // Temporary review state for this baseline: Files A–C are recovered; File D remains fully testable.
  const TEST_MODE=true;
  const KEY='gettysburgFragmentsV69UnifiedArchiveReview';
  const SNAPSHOT_KEY='gettysburgCaseSnapshotsV69UnifiedArchiveReview';
  let fragments=['','','',''];
  let snapshots={};
  try{fragments=JSON.parse(localStorage.getItem(KEY)||'["","","",""]')}catch(e){}
  try{snapshots=JSON.parse(localStorage.getItem(SNAPSHOT_KEY)||'{}')}catch(e){}
  if(!Array.isArray(fragments)||fragments.length!==4)fragments=['','','',''];
  if(!snapshots||typeof snapshots!=='object'||Array.isArray(snapshots))snapshots={};
  if(fragments[3]==='272')fragments[3]='2';

  if(TEST_MODE){
    fragments=['18','63','27',''];
    snapshots={};
  }

  function saveFragments(){try{localStorage.setItem(KEY,JSON.stringify(fragments))}catch(e){}}
  function saveSnapshots(){try{localStorage.setItem(SNAPSHOT_KEY,JSON.stringify(snapshots))}catch(e){}}
  saveFragments();
  saveSnapshots();

  return{
    isTestMode:()=>TEST_MODE,
    getFragments:()=>[...fragments],
    unlock:(index,value)=>{fragments[index]=String(value);saveFragments();},
    isRecovered:index=>Boolean(fragments[index]),
    getRecoveredCount:()=>fragments.filter(Boolean).length,
    saveCaseSnapshot:(caseId,snapshot)=>{if(caseId&&snapshot){snapshots[caseId]=snapshot;saveSnapshots();}},
    getCaseSnapshot:caseId=>snapshots[caseId]||null,
    clearCaseSnapshots:()=>{snapshots={};saveSnapshots();},
    reset:()=>{fragments=['','','',''];snapshots={};saveFragments();saveSnapshots();}
  };
})();
