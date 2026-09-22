(()=>{
  const byId=id=>document.getElementById(id);
  const progressAnchor=document.querySelector('.deckProgress');

  // Keep the deck usable during asset refreshes and in local/offline previews.
  document.querySelectorAll('img[data-img]').forEach(img=>{
    const restoreBundled=async()=>{
      if(img.dataset.fallbackLoading==='true') return;
      img.dataset.fallbackLoading='true';
      try{
        const response=await fetch(`imgdata/${img.dataset.img}.txt`,{cache:'force-cache'});
        if(!response.ok) return;
        const base64=(await response.text()).trim();
        img.src=`data:image/jpeg;base64,${base64}`;
      }catch(error){
        console.error('Image fallback failed',img.dataset.img,error);
      }
    };
    img.addEventListener('error',restoreBundled,{once:true});
    if(img.complete&&!img.naturalWidth) restoreBundled();
  });
  const coreIds=['s1','s2','s12','s15','s3','s4','s13','s14','s5','s17','s18','s19','s20'];
  const appendixIds=['s6','s7','s8','s9','s10','s11','s16'];
  const allIds=[...coreIds,...appendixIds];
  const insertBefore=progressAnchor||null;

  allIds.forEach(id=>{
    const slide=byId(id);
    if(slide) document.body.insertBefore(slide,insertBefore);
  });
  appendixIds.forEach(id=>byId(id)?.classList.add('appendixSlide'));

  if(!document.querySelector('.siteHeader')){
    const header=document.createElement('header');
    header.className='siteHeader';
    header.innerHTML=`
      <a class="siteHeader__brand" href="#s1" aria-label="Pixel8Labs home"><span aria-hidden="true">8</span>Pixel8Labs</a>
      <nav class="siteHeader__nav" aria-label="Primary navigation">
        <a href="#s12">Outcomes</a><a href="#s4">Capabilities</a><a href="#s13">Work</a><a href="#s19">Team</a>
      </nav>
      <a class="siteHeader__cta" href="https://chat.pixel8labs.com" target="_blank" rel="noopener noreferrer">Book a conversation</a>`;
    document.body.prepend(header);
  }

  const capabilityTop=byId('s4')?.querySelector('.top');
  if(capabilityTop && !capabilityTop.querySelector('.appendixToggle')){
    const button=document.createElement('button');
    button.className='appendixToggle';
    button.type='button';
    button.innerHTML='<span>Explore detailed capabilities</span><span aria-hidden="true">→</span>';
    capabilityTop.appendChild(button);
    button.addEventListener('click',()=>{
      document.body.classList.add('appendixOpen');
      refreshSlides();
      byId('s6')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    });
  }
  if(!document.querySelector('.appendixClose')){
    const close=document.createElement('button');
    close.className='appendixClose';
    close.type='button';
    close.textContent='Back to main deck';
    close.addEventListener('click',()=>{
      document.body.classList.remove('appendixOpen');
      refreshSlides();
      byId('s4')?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    });
    document.body.appendChild(close);
  }

  const communityMetric=byId('s12')?.querySelector('.grid5 .card:first-child .metric');
  if(communityMetric){
    communityMetric.innerHTML='<span class="metricValue">3</span><span class="metricUnit">communities</span>';
  }

  const securityVisual=byId('s11')?.querySelector('.visual');
  if(securityVisual){
    securityVisual.className='securityProof';
    securityVisual.innerHTML=`
      <div class="securityProof__header"><span>Selected security work</span><strong>Production systems reviewed across DeFi and digital assets.</strong></div>
      <div class="securityProof__item"><span class="securityProof__index">01</span><div><strong>Pendle</strong><small>Core v2</small></div></div>
      <div class="securityProof__item"><span class="securityProof__index">02</span><div><strong>PancakeSwap</strong><small>v3 &amp; Infinity</small></div></div>
      <div class="securityProof__item"><span class="securityProof__index">03</span><div><strong>Mocaverse</strong><small>Staking &amp; NFTs</small></div></div>`;
  }

  byId('s15')?.querySelectorAll('.logo').forEach((logo,i)=>{
    const name=logo.textContent.trim();
    const initials=name.split(/\s+/).map(word=>word[0]).join('').slice(0,2);
    logo.innerHTML=`<span class="clientMark" aria-hidden="true">${initials}</span><span>${name}</span>`;
    logo.style.setProperty('--client-delay',`${i*24}ms`);
  });

  ['s13','s14'].forEach(id=>{
    byId(id)?.querySelectorAll('.grid3>div').forEach(card=>{
      card.classList.add('caseCard');
      const outcome=[...card.querySelectorAll('p')].find(p=>/^Outcome:/i.test(p.textContent.trim()));
      const visual=card.querySelector('.visual');
      if(outcome&&visual&&!visual.querySelector('.caseOutcome')){
        const badge=document.createElement('div');
        badge.className='caseOutcome';
        badge.textContent=outcome.textContent.replace(/^Outcome:\s*/i,'');
        visual.appendChild(badge);
      }
    });
  });

  document.querySelectorAll('.pixelmark').forEach(mark=>{
    mark.setAttribute('aria-label','Pixel8Labs');
    mark.setAttribute('title','Pixel8Labs');
  });

  document.querySelector('.deckProgress')?.remove();
  const progress=document.createElement('div');
  progress.className='deckProgress';
  progress.setAttribute('role','navigation');
  progress.setAttribute('aria-label','Deck navigation');
  progress.innerHTML='<button class="deckProgress__prev" type="button" aria-label="Previous section">←</button><div class="deckProgress__track" aria-hidden="true"><div class="deckProgress__fill"></div></div><div class="deckProgress__label" aria-live="polite"></div><button class="deckProgress__next" type="button" aria-label="Next section">→</button>';
  document.body.appendChild(progress);

  let slides=[];
  let current=0;
  const fill=progress.querySelector('.deckProgress__fill');
  const label=progress.querySelector('.deckProgress__label');
  const prev=progress.querySelector('.deckProgress__prev');
  const next=progress.querySelector('.deckProgress__next');

  function refreshSlides(){
    slides=coreIds.map(byId).filter(Boolean);
    if(document.body.classList.contains('appendixOpen')) slides.push(...appendixIds.map(byId).filter(Boolean));
    updateActive();
  }
  function render(){
    current=Math.max(0,Math.min(slides.length-1,current));
    const n=current+1;
    fill.style.width=`${(n/slides.length)*100}%`;
    label.textContent=`${String(n).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
    prev.disabled=current===0;
    next.disabled=current===slides.length-1;
  }
  function updateActive(){
    if(!slides.length) return;
    const readingLine=Math.min(128,innerHeight*.18);
    let best=0;
    let bestDistance=Infinity;
    slides.forEach((slide,i)=>{
      const rect=slide.getBoundingClientRect();
      if(rect.bottom<=0||rect.top>=innerHeight) return;
      const distance=Math.abs(rect.top-readingLine);
      if(distance<bestDistance){bestDistance=distance;best=i;}
    });
    current=best;
    render();
  }
  function go(index){
    const target=slides[Math.max(0,Math.min(slides.length-1,index))];
    if(!target) return;
    history.replaceState(null,'',`#${target.id}`);
    target.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
  }
  prev.addEventListener('click',()=>go(current-1));
  next.addEventListener('click',()=>go(current+1));
  let ticking=false;
  addEventListener('scroll',()=>{
    if(ticking) return;
    ticking=true;
    requestAnimationFrame(()=>{updateActive();ticking=false;});
  },{passive:true});
  addEventListener('resize',updateActive,{passive:true});
  refreshSlides();
})();
