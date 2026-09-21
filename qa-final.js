(()=>{
  // Robust fallback for first-party HQ images: if the website asset ever fails,
  // restore the repo's bundled image instead of leaving an empty frame.
  document.querySelectorAll('img[data-hq-source="pixel8labs.com"][data-img]').forEach(img=>{
    img.setAttribute('loading','eager');
    img.setAttribute('decoding','async');
    const restoreBundled=async()=>{
      try{
        const r=await fetch(`imgdata/${img.dataset.img}.txt`,{cache:'force-cache'});
        if(!r.ok) return;
        const b64=await r.text();
        img.removeAttribute('data-hq-source');
        img.src=`data:image/jpeg;base64,${b64}`;
      }catch(e){console.error('Image fallback failed',e)}
    };
    img.addEventListener('error',restoreBundled,{once:true});
  });

  // Ensure the cover content does not inherit the original desktop auto-margin behaviour.
  const coverCopy=document.querySelector('#s1>div[style*="margin-top:auto"]');
  if(coverCopy){
    coverCopy.style.marginTop='0';
    coverCopy.style.marginBottom='0';
  }
})();
