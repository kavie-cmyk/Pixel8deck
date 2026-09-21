(()=>{
  const slides=[...document.querySelectorAll('.slide')];
  if(!slides.length) return;

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
