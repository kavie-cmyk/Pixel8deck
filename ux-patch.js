(()=>{
  const slides=[...document.querySelectorAll('.slide')];
  if(!slides.length) return;

  // Visual-fidelity layer: keep UI screenshots crisp and replace the remaining
  // low-resolution composites with native HTML visuals rather than stretching them.
  const visualStyle=document.createElement('style');
  visualStyle.textContent=`
    .visual{background:linear-gradient(145deg,#09050f,#14091e)!important}
    .visual img{object-fit:contain!important;object-position:center!important;image-rendering:auto!important;filter:none!important}
    .avatar img{object-fit:cover!important}
    .visual img[data-hq-source="pixel8labs.com"]{width:100%;height:100%;transform:translateZ(0)}
    .visual:has(img[data-hq-source="pixel8labs.com"]):after{opacity:.22}
    .nativeVisual{position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.18);background:radial-gradient(38vw 28vh at 90% 0%,rgba(255,77,155,.2),transparent 58%),linear-gradient(145deg,#0a0611,#1a0a27);box-shadow:0 28px 72px rgba(0,0,0,.4);min-height:33vh;padding:2.2vh 1.5vw;display:flex;flex-direction:column;justify-content:space-between}
    .nativeVisual:before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.055) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px);background-size:42px 42px;mask-image:linear-gradient(to bottom,#000,transparent);pointer-events:none}
    .nativeVisual>*{position:relative;z-index:2}
    .nativeVisual__eyebrow{font:800 11px/1.1 Arial,sans-serif;letter-spacing:.13em;text-transform:uppercase;color:#ffd8eb}
    .nativeVisual__metric{font-family:"Arial Narrow",Impact,Haettenschweiler,sans-serif;font-weight:900;font-size:clamp(44px,5vw,82px);line-height:.88;color:#fff;letter-spacing:-.02em}
    .nativeVisual__metric em{font-style:normal;color:#ff60ad}
    .nativeVisual__copy{max-width:30ch;color:#d9cbe3;font-size:clamp(12px,.9vw,16px);line-height:1.4}
    .nativeVisual__rail{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:2vh}
    .nativeVisual__chip{border:1px solid rgba(255,255,255,.16);background:rgba(255,255,255,.04);padding:12px 10px;color:#f3e9f6;font-size:clamp(10px,.75vw,13px)}
    .nativeVisual__chip b{display:block;color:#ff69b4;font-size:1.35em;margin-bottom:4px}
    #s15 .nativeVisual{min-height:48vh}
    @media(max-width:1279px){.nativeVisual{min-height:30vh}.nativeVisual__rail{grid-template-columns:1fr 1fr}}
    @media(max-width:900px){.nativeVisual{min-height:260px;padding:22px 18px}.nativeVisual__rail{grid-template-columns:1fr}.visual img{min-height:220px;object-fit:contain!important}}
  `;
  document.head.appendChild(visualStyle);

  // Pull higher-resolution first-party assets from pixel8labs.com for the visuals
  // where the public site exposes a full-resolution static image.
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

  Object.entries(hqImages).forEach(([key,url])=>{
    const img=document.querySelector(`img[data-img="${key}"]`);
    if(!img) return;
    const fallback=img.getAttribute('src')||'';
    const setHQ=()=>{
      if(img.getAttribute('src')!==url){
        img.setAttribute('src',url);
        img.setAttribute('data-hq-source','pixel8labs.com');
        img.setAttribute('decoding','async');
      }
    };
    const mo=new MutationObserver(()=>{
      if(img.getAttribute('src')!==url) setHQ();
    });
    mo.observe(img,{attributes:true,attributeFilter:['src']});
    img.addEventListener('error',()=>{
      mo.disconnect();
      if(fallback.startsWith('data:')) img.setAttribute('src',fallback);
    },{once:true});
    setHQ();
    setTimeout(()=>{setHQ();mo.disconnect();},2200);
  });

  // Replace a few legacy low-res composites with resolution-independent visuals.
  const replaceVisual=(selector,html,className='')=>{
    const el=document.querySelector(selector);
    if(!el) return;
    const shell=document.createElement('div');
    shell.className=`nativeVisual ${className}`.trim();
    shell.innerHTML=html;
    el.replaceWith(shell);
  };

  replaceVisual('#s10 .visual',`
    <div class="nativeVisual__eyebrow">Product + growth execution</div>
    <div><div class="nativeVisual__metric">0 → <em>20K+</em></div><div class="nativeVisual__copy">Community growth built alongside the product, launch mechanics and marketplace.</div></div>
    <div class="nativeVisual__rail"><div class="nativeVisual__chip"><b>~$2M</b>primary sales</div><div class="nativeVisual__chip"><b>~$4M</b>secondary activity</div><div class="nativeVisual__chip"><b>$2B+</b>platform TVL at peak</div></div>
  `,'growthNative');

  replaceVisual('#s14 .grid3>div:nth-child(1) .visual',`
    <div class="nativeVisual__eyebrow">Ramen Launchpad</div>
    <div><div class="nativeVisual__metric"><em>$5M+</em></div><div class="nativeVisual__copy">Raised across 9 protocols on Berachain.</div></div>
    <div class="nativeVisual__rail"><div class="nativeVisual__chip"><b>9</b>protocols</div><div class="nativeVisual__chip"><b>Full-stack</b>launchpad</div><div class="nativeVisual__chip"><b>DEX</b>integration</div></div>
  `,'ramenNative');

  replaceVisual('#s14 .grid3>div:nth-child(3) .visual',`
    <div class="nativeVisual__eyebrow">Mandala Club</div>
    <div><div class="nativeVisual__metric"><em>$3.75M</em></div><div class="nativeVisual__copy">Digital membership sales for a premium private club.</div></div>
    <div class="nativeVisual__rail"><div class="nativeVisual__chip"><b>250</b>passes sold</div><div class="nativeVisual__chip"><b>Sold out</b>premium release</div><div class="nativeVisual__chip"><b>IRL</b>gated benefits</div></div>
  `,'mandalaNative');

  replaceVisual('#s15 .visual',`
    <div class="nativeVisual__eyebrow">Delivery track record</div>
    <div><div class="nativeVisual__metric"><em>60+</em> products</div><div class="nativeVisual__copy">Across AI, fintech, payments, digital assets and security-sensitive systems.</div></div>
    <div class="nativeVisual__rail"><div class="nativeVisual__chip"><b>30+</b>clients</div><div class="nativeVisual__chip"><b>95%</b>client satisfaction</div><div class="nativeVisual__chip"><b>3+ yrs</b>median tenure</div></div>
  `,'trustNative');

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

  // Accessible labels for the legacy anchor map (kept for deep-link compatibility).
  document.querySelectorAll('.toc a').forEach((a,i)=>a.setAttribute('aria-label',`Go to slide ${i+1}`));

  // Compact progress/navigation control: more useful than twenty tiny dots.
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
  },{threshold:[.35,.55,.75]});
  slides.forEach(s=>observer.observe(s));
  render(0);
})();
