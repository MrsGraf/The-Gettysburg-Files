window.GettysburgState=(()=>{
  const KEY='gettysburgFragments';
  let fragments=['','','',''];
  try{fragments=JSON.parse(localStorage.getItem(KEY)||'["","","",""]')}catch(e){}
  if(!Array.isArray(fragments)||fragments.length!==4)fragments=['','','',''];
  // Migrate the incorrect fourth fragment used in an earlier development build.
  if(fragments[3]==='272')fragments[3]='2';
  function save(){try{localStorage.setItem(KEY,JSON.stringify(fragments))}catch(e){}}
  save();
  return{
    getFragments:()=>[...fragments],
    unlock:(index,value)=>{fragments[index]=String(value);save()},
    reset:()=>{fragments=['','','',''];save()}
  };
})();
