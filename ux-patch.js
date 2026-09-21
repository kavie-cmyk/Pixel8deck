(()=>{
  const slides=[...document.querySelectorAll('.slide')];
  if(!slides.length) return;

  // Visual fidelity: use real case-study imagery. Do not replace image panels with
  // text-only metric cards because the copy already carries those outcomes.
  const visualStyle=document.createElement('style');
  visualStyle.textContent=`
    .visual{background:linear-gradient(145deg,#09050f,#14091e)!important}
    .visual img{object-fit:contain!important;object-position:center!important;image-rendering:auto!important;filter:none!important}
    .avatar img{object-fit:cover!important}
    .visual img[data-hq-source="pixel8labs.com"]{width:100%;height:100%;transform:translateZ(0)}
    .visual:has(img[data-hq-source="pixel8labs.com"]):after{display:none!important}
    #s10 .visual img{object-fit:contain!important}
    #s15 .visual img{object-fit:contain!important}
    @media(max-width:900px){.visual img{min-height:220px;object-fit:contain!important}}
  `;
  document.head.appendChild(visualStyle);

  // Higher-resolution first-party assets verified from pixel8labs.com.
  const hqImages={
    '02':'https://pixel8labs.com/_next/static/media/gallery-1.3b0bbe59.png',
    '03':'https://pixel8labs.com/_next/static/media/gallery-1.60f5e0ff.png',
    '04':'https://pixel8labs.com/_next/static/media/gallery-1.da532135.png',
    '05':'https://pixel8labs.com/_next/static/media/gallery-1.afef0f6f.png',
    '07':'https://pixel8labs.com/_next/static/media/gallery-1.65259aae.png',
    '10':'https://pixel8labs.com/_next/static/media/stanley.4212d507.jpeg',
    '11':'https://pixel8labs.com/_next/static/media/owen.e58fd656.jpeg',
    '12':'https://pixel8labs.com/_next/static/media/chris.9d76997b.jpeg'
  };

  const restoreBundled=async(img,key)=>{
    try{
      const r=await fetch(`imgdata/${key}.txt`,{cache:'force-cache'});
      if(!r.ok) return;
      const b64=await r.text();
      img.removeAttribute('data-hq-source');
      img.src=`data:image/jpeg;base64,${b64}`;
    }catch(e){console.error('Image fallback failed',e)}
  };

  Object.entries(hqImages).forEach(([key,url])=>{
    const img=document.querySelector(`img[data-img="${key}"]`);
    if(!img) return;
    let stopped=false;
    const setHQ=()=>{
      if(stopped) return;
      if(img.getAttribute('src')!==url){
        img.setAttribute('src',url);
        img.setAttribute('data-hq-source','pixel8labs.com');
        img.setAttribute('decoding','async');
      }
    };
    const mo=new MutationObserver(()=>{
      if(!stopped && img.getAttribute('src')!==url) setHQ();
    });
    mo.observe(img,{attributes:true,attributeFilter:['src']});
    img.addEventListener('error',async()=>{
      stopped=true;
      mo.disconnect();
      await restoreBundled(img,key);
    },{once:true});
    setHQ();
    setTimeout(()=>{ if(!stopped){setHQ();mo.disconnect();} },2200);
  });

  // Keep slide 10 as a genuine visual case study rather than repeating its metrics
  // inside the image panel. Link the visual to the first-party case page.
  const s10Visual=document.querySelector('#s10 .visual');
  if(s10Visual && !s10Visual.parentElement?.classList.contains('caseVisualLink')){
    const link=document.createElement('a');
    link.className='caseVisualLink';
    link.href='https://pixel8labs.com/works/madmeerkat-nft';
    link.target='_blank';
    link.rel='noopener noreferrer';
    link.setAttribute('aria-label','View the case study on Pixel8Labs.com');
    s10Visual.parentNode.insertBefore(link,s10Visual);
    link.appendChild(s10Visual);
  }

  // Turn the empty half of slide 02 into a fast visual explanation of the delivery model.
  const s2=document.querySelector('#s2');
  if(s2){
    const row=s2.querySelector('.row.wide');
    const left=row?.firstElementChild;
    if(left && !left.querySelector('.jumpnav')){
      const jump=document.createElement('nav');
      jump.className='jumpnav';
      jump.setAttribute('aria-label','Jump to capability');
      jump.innerHTML='<a href="#s6">Product</a><a href="#s7">Engineering</a><a href="#s8">AI & Automation</a><a href="#s9">Growth</a><a href="#s11">Security</a><a href="#s13">Case studies</a>';
      left.appendChild(jump);
    }
    if(row && row.children.length===1){
      const flow=document.createElement('div');
      flow.className='deliveryFlow';
      flow.setAttribute('aria-label','Pixel8Labs delivery path');
      flow.innerHTML=`
        <div class="deliveryFlow__step"><div class="deliveryFlow__n">01</div><div><h3>Decide</h3><p>Scope the right product and sequence the work.</p></div></div>
        <div class="deliveryFlow__step"><div class="deliveryFlow__n">02</div><div><h3>Build</h3><p>Ship production-grade product and infrastructure.</p></div></div>
        <div class="deliveryFlow__step"><div class="deliveryFlow__n">03</div><div><h3>Automate</h3><p>Remove manual work and embed AI where it creates leverage.</p></div></div>
        <div class="deliveryFlow__step"><div class="deliveryFlow__n">04</div><div><h3>Grow</h3><p>Plan launch, acquisition and community around the product.</p></div></div>
        <div class="deliveryFlow__step"><div class="deliveryFlow__n">05</div><div><h3>Secure</h3><p>Review architecture, code and launch readiness.</p></div></div>`;
      row.appendChild(flow);
    }
  }

  // Make the final contact choices real conversion actions instead of decorative pills.
  const contactRow=document.querySelector('#s20 .pillrow');
  if(contactRow){
    contactRow.innerHTML=`
      <a class="pill" href="https://pixel8labs.com" target="_blank" rel="noopener noreferrer">pixel8labs.com ↗</a>
      <a class="pill" href="mailto:hi@pixel8labs.com">hi@pixel8labs.com</a>
      <a class="pill" href="https://chat.pixel8labs.com" target="_blank" rel="noopener noreferrer">Book a conversation ↗</a>`;
  }

  document.querySelectorAll('.toc a').forEach((a,i)=>a.setAttribute('aria-label',`Go to slide ${i+1}`));

  // Compact progress/navigation control.
  if(!document.querySelector('.deckProgress')){
    const progress=document.createElement('div');
    progress.className='deckProgress';
    progress.setAttribute('role','navigation');
    progress.setAttribute('aria-label','Deck navigation');
    progress.innerHTML='<button class="deckProgress__prev" type="button" aria-label="Previous slide">←</button><div class="deckProgress__track" aria-hidden="true"><div class="deckProgress__fill"></div></div><div class="deckProgress__label" aria-live="polite">01 / 20</div><button class="deckProgress__next" type="button" aria-label="Next slide">→</button>';
    document.body.appendChild(progress);

    const fill=progress.querySelector('.deckProgress__fill');
    const label=progress.querySelector('.deckProgress__label');
    let current=0;
    const render=(i)=>{
      current=Math.max(0,Math.min(slides.length-1,i));
      fill.style.width=`${((current+1)/slides.length)*100}%`;
      label.textContent=`${String(current+1).padStart(2,'0')} / ${String(slides.length).padStart(2,'0')}`;
    };
    const go=(i)=>slides[Math.max(0,Math.min(slides.length-1,i))].scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'});
    progress.querySelector('.deckProgress__prev').addEventListener('click',()=>go(current-1));
    progress.querySelector('.deckProgress__next').addEventListener('click',()=>go(current+1));

    const observer=new IntersectionObserver(entries=>{
      const visible=entries.filter(e=>e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if(visible) render(slides.indexOf(visible.target));
    },{threshold:[.25,.45,.65]});
    slides.forEach(s=>observer.observe(s));
    render(0);
  }
})();
