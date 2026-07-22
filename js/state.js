window.GettysburgState=(()=>{
  const KEY='gettysburgFragmentsV42Test';
  const SNAPSHOT_KEY='gettysburgCaseSnapshotsV42Test';
  let fragments=['18','63','27',''];
  let snapshots={};
  try{fragments=JSON.parse(localStorage.getItem(KEY)||'["18","63","27",""]')}catch(e){}
  try{snapshots=JSON.parse(localStorage.getItem(SNAPSHOT_KEY)||'{}')}catch(e){}
  if(!Array.isArray(fragments)||fragments.length!==4)fragments=['18','63','27',''];
  if(!snapshots||typeof snapshots!=='object'||Array.isArray(snapshots))snapshots={};
  // Migrate the incorrect fourth fragment used in an earlier development build.
  if(fragments[3]==='272')fragments[3]='2';
  // v42 temporary review baseline: Files A-C are preset restored. File D stays unrecovered,
  // while D01-D04 are pre-recovered in case-d.js so the final D05 recovery can be triggered once.
  // Versioned storage prevents older completion data from skipping this intended final-sequence test.
  fragments=['18','63','27',''];
  snapshots={};
  function saveFragments(){try{localStorage.setItem(KEY,JSON.stringify(fragments))}catch(e){}}
  function saveSnapshots(){try{localStorage.setItem(SNAPSHOT_KEY,JSON.stringify(snapshots))}catch(e){}}
  saveFragments();
  return{
    getFragments:()=>[...fragments],
    unlock:(index,value)=>{fragments[index]=String(value);saveFragments()},
    isRecovered:index=>Boolean(fragments[index]),
    getRecoveredCount:()=>fragments.filter(Boolean).length,
    saveCaseSnapshot:(caseId,snapshot)=>{if(caseId&&snapshot){snapshots[caseId]=snapshot;saveSnapshots()}},
    getCaseSnapshot:caseId=>snapshots[caseId]||null,
    clearCaseSnapshots:()=>{snapshots={};saveSnapshots()},
    reset:()=>{fragments=['','','',''];snapshots={};saveFragments();saveSnapshots()}
  };
})();
