document.addEventListener('DOMContentLoaded', function(){
    function qs(sel){return document.querySelector(sel)}
    const startBtn = qs('#start-presentation');
    const overlay = qs('#presOverlay');
    const presSlide = qs('#presSlide');
    const prevBtn = qs('#prevSlide');
    const nextBtn = qs('#nextSlide');
    const exitBtn = qs('#exitPres');
    const dots = qs('#presDots');
    if(!startBtn || !overlay) return; // only run when present

    const main = document.querySelector('main');
    const rawSlides = main ? Array.from(main.children) : [];
    const slides = rawSlides.filter(s => s.offsetHeight > 50 && !s.classList.contains('no-slide'));
    let idx = 0;

    function buildDots(){
        if(!dots) return;
        dots.innerHTML = '';
        slides.forEach((_, i)=>{
            const d = document.createElement('div'); d.className='pres-dot';
            d.addEventListener('click', ()=> show(i));
            dots.appendChild(d);
        });
    }

    function show(i){
        if(slides.length===0) return;
        if(i<0) i = slides.length-1;
        if(i>=slides.length) i = 0;
        idx = i;
        const clone = slides[idx].cloneNode(true);
        clone.querySelectorAll('button,a').forEach(el=> el.setAttribute('tabindex','-1'));
        if(presSlide){ presSlide.innerHTML = ''; presSlide.appendChild(clone); }
        if(dots){ Array.from(dots.children).forEach((d,di)=> d.classList.toggle('active', di===idx)); }
    }

    function showOverlay(){ overlay.classList.add('active'); overlay.setAttribute('aria-hidden','false'); show(0); document.body.style.overflow='hidden'; }
    function hideOverlay(){ overlay.classList.remove('active'); overlay.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }

    startBtn.addEventListener('click', ()=>{ if(slides.length===0){ alert('Немає вмісту для презентації на цій сторінці.'); return;} buildDots(); showOverlay(); });
    if(prevBtn) prevBtn.addEventListener('click', ()=> show(idx-1));
    if(nextBtn) nextBtn.addEventListener('click', ()=> show(idx+1));
    if(exitBtn) exitBtn.addEventListener('click', hideOverlay);

    document.addEventListener('keydown', (e)=>{
        if(overlay.classList.contains('active')){
            if(e.key==='ArrowRight') show(idx+1);
            if(e.key==='ArrowLeft') show(idx-1);
            if(e.key==='Escape') hideOverlay();
        }
    });
});
