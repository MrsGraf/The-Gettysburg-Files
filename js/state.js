window.GettysburgState=(()=>{
  const KEY='gettysburgFragmentsV39CTest';
  const SNAPSHOT_KEY='gettysburgCaseSnapshotsV39CTest';
  let fragments=['18','63','',''];
  let snapshots={};
  try{fragments=JSON.parse(localStorage.getItem(KEY)||'["18","63","",""]')}catch(e){}
  try{snapshots=JSON.parse(localStorage.getItem(SNAPSHOT_KEY)||'{}')}catch(e){}
  if(!Array.isArray(fragments)||fragments.length!==4)fragments=['18','63','',''];
  if(!snapshots||typeof snapshots!=='object'||Array.isArray(snapshots))snapshots={};
  // Migrate the incorrect fourth fragment used in an earlier development build.
  if(fragments[3]==='272')fragments[3]='2';
  // v39 File-C test baseline: A/B stay available, but C and D must not inherit old completion.
  // This prevents stale localStorage/session progress from skipping C02 or external C03.
  fragments[2]='';
  fragments[3]='';
  delete snapshots.C;
  delete snapshots.D;
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
