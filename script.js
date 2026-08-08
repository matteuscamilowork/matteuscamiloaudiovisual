// I18N HELPER (loaded before this file via i18n.js)
const T=(k,v)=>window.t?window.t(k,v):'';

// LOADER
const loaderStart=Date.now();
const loaderEl=document.getElementById('loader');
const loaderBarFill=document.getElementById('loaderBarFill');
const loaderPct=document.getElementById('loaderPct');
let loaderProgress=0;
let loaderInterval=null;

if(loaderBarFill&&loaderPct&&loaderEl){
function updateLoader(){
    if(loaderProgress>=100){
        loaderBarFill.style.width='100%';
        loaderPct.textContent='100%';
        clearInterval(loaderInterval);
        setTimeout(()=>{loaderEl.classList.add('hidden')},400);
        return;
    }
    loaderProgress+=Math.random()*3+1;
    if(loaderProgress>100)loaderProgress=100;
    loaderBarFill.style.width=loaderProgress+'%';
    loaderPct.textContent=Math.floor(loaderProgress)+'%';
}
loaderInterval=setInterval(updateLoader,60);

window.addEventListener('load',()=>{
    if(loaderProgress<100){
        clearInterval(loaderInterval);
        const boost=setInterval(()=>{
            if(loaderProgress>=100){clearInterval(boost);return}
            loaderProgress+=Math.random()*15+10;
            if(loaderProgress>100)loaderProgress=100;
            loaderBarFill.style.width=loaderProgress+'%';
            loaderPct.textContent=Math.floor(loaderProgress)+'%';
            if(loaderProgress>=100){
                clearInterval(boost);
                setTimeout(()=>{loaderEl.classList.add('hidden')},400);
            }
        },100);
    }
});
}

// Loader drip animation via JS (works with reduced-motion)
(function(){
    if(!loaderEl)return;
    const drips=document.querySelectorAll('.loader-drip');
    if(!drips.length)return;
    const container=document.querySelector('.loader-drip-container');
    if(!container)return;

    function spawnDrip(){
        const pool=[...drips];
        const idle=pool.find(d=>!d.classList.contains('active'));
        if(!idle)return;
        idle.classList.add('active');
        const startX=Math.random()*20+10;
        idle.style.left=startX+'px';
        idle.style.bottom='0px';
        idle.style.opacity='.9';
        idle.style.width='5px';
        idle.style.height='5px';
        let y=0;
        let size=5;
        let opacity=.9;
        const speed=.8+Math.random()*.4;
        function fall(){
            y+=speed;
            size=Math.max(2,5-y*.08);
            opacity=Math.max(0,.9-y*.012);
            idle.style.bottom=y+'px';
            idle.style.width=size+'px';
            idle.style.height=size+'px';
            idle.style.opacity=opacity;
            if(opacity>0){requestAnimationFrame(fall)}
            else{idle.classList.remove('active');idle.style.opacity='0'}
        }
        requestAnimationFrame(fall);
    }

    setInterval(()=>{
        if(loaderEl.classList.contains('hidden'))return;
        spawnDrip();
    },700);
})();

// WORD-BY-WORD TYPEWRITER
(function(){
    const desc=document.getElementById('heroDesc');
    if(!desc)return;
    const html=desc.innerHTML;
    const tmp=document.createElement('div');
    tmp.innerHTML=html;
    const nodes=Array.from(tmp.childNodes);
    let wrapped='';
    nodes.forEach(n=>{
        if(n.nodeType===3){
            const words=n.textContent.split(/(\s+)/);
            words.forEach(w=>{
                if(w.trim())wrapped+='<span class="word">'+w+'</span>';
                else wrapped+=w;
            });
        }else if(n.nodeType===1){
            wrapped+='<'+n.tagName.toLowerCase()+' class="'+n.className+'">'+n.innerHTML+'</'+n.tagName.toLowerCase()+'>';
        }
    });
    desc.innerHTML=wrapped;
    desc.style.opacity='1';
    function revealWords(){
        const words=desc.querySelectorAll('.word');
        words.forEach((w,i)=>{
            setTimeout(()=>{w.classList.add('visible')},150+i*45);
        });
    }
    window.addEventListener('load',()=>{setTimeout(revealWords,900)});
})();

// UNIFIED SCROLL HANDLER (rAF throttled)
const navbar=document.getElementById('navbar');
const heroBgImg=document.querySelector('.hero-bg-img');
let scrollTicking=false;
window.addEventListener('scroll',()=>{
    if(!scrollTicking){
        requestAnimationFrame(()=>{
            const s=window.scrollY;
            navbar.classList.toggle('scrolled',s>60);
            if(heroBgImg&&s<window.innerHeight){heroBgImg.style.transform=`translateY(${s*0.35}px) scale(1.1)`}
            scrollTicking=false;
        });
        scrollTicking=true;
    }
},{passive:true});

// PAUSE SPARKLES OFF-SCREEN
(function(){
    const scene=document.querySelector('.scene-3d');
    if(!scene)return;
    const obs=new IntersectionObserver(entries=>{
        entries.forEach(e=>{
            scene.classList.toggle('paused',!e.isIntersecting);
        });
    },{threshold:0});
    obs.observe(document.querySelector('.hero')||scene);
})();

// THUMBNAILS + PLAY OVERLAY (no iframes in cards)
(function(){
    document.querySelectorAll('.yt-embed').forEach(embed=>{
        const iframe=embed.querySelector('iframe[data-src]');
        if(!iframe)return;
        const match=iframe.dataset.src.match(/embed\/([^?&]+)/);
        if(!match)return;
        const vid=match[1];
        embed.setAttribute('data-video-id',vid);
        iframe.remove();
        const thumb=document.createElement('img');
        thumb.src='https://img.youtube.com/vi/'+vid+'/maxresdefault.jpg';
        thumb.onerror=function(){this.src='https://img.youtube.com/vi/'+vid+'/hqdefault.jpg'};
        thumb.alt='';
        thumb.loading='lazy';
        thumb.className='yt-thumb';
        const cardEl=embed.closest('.yt-card');
        const cName=cardEl?cardEl.querySelector('.yt-client')?.textContent:'';
        const pType=cardEl?cardEl.querySelector('h4')?.textContent:'';
        thumb.alt=cName&&pType?T('a11y.thumbAlt',{type:pType,client:cName}):T('a11y.thumbAltDefault');
        embed.insertBefore(thumb,embed.firstChild);
        const skel=document.createElement('div');
        skel.className='yt-skeleton';
        embed.appendChild(skel);
        thumb.onload=function(){skel.style.opacity='0';setTimeout(()=>skel.remove(),500)};
        const overlay=document.createElement('div');
        overlay.className='yt-play-overlay';
        overlay.innerHTML='<div class="yt-play-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="white"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg></div>';
        embed.appendChild(overlay);
    });

    // Depoimento video: load YouTube on click
    const depoVideo=document.querySelector('.depo-video-side .depo-box');
    if(depoVideo){
        depoVideo.setAttribute('tabindex','0');
        depoVideo.setAttribute('role','button');
        function loadDepo(){
            const iframe=document.createElement('iframe');
            iframe.src='https://www.youtube.com/embed/D6wCma7aAn0?autoplay=1&mute=1&loop=1&playlist=D6wCma7aAn0&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&fs=0&cc_load_policy=0&playsinline=1&color=white';
            iframe.title='Video';
            iframe.allow='autoplay; encrypted-media';
            iframe.allowFullscreen=true;
            iframe.classList.add('loaded');
            const poster=this.querySelector('.depo-poster');
            const btn=this.querySelector('.depo-play-btn');
            if(poster)poster.remove();
            if(btn)btn.remove();
            this.appendChild(iframe);
            this.style.cursor='default';
        }
        depoVideo.addEventListener('click',loadDepo,{once:true});
        depoVideo.addEventListener('keydown',function(e){
            if(e.key==='Enter'||e.key===' '){e.preventDefault();loadDepo.call(this)}
        },{once:true});
    }
})();

// VIDEO MODAL
(function(){
    const modal=document.getElementById('videoModal');
    const overlay=document.getElementById('videoModalOverlay');
    const closeBtn=document.getElementById('videoModalClose');
    const embedContainer=document.getElementById('videoModalEmbed');
    const infoContainer=document.getElementById('videoModalInfo');
    if(!modal||!embedContainer)return;
    let lastFocused=null;

    document.querySelectorAll('.yt-card').forEach(card=>{
        card.setAttribute('tabindex','0');
        card.setAttribute('role','button');
        function openCard(){
            const embed=card.querySelector('.yt-embed');
            const info=card.querySelector('.yt-card-info');
            const vid=embed?embed.getAttribute('data-video-id'):null;
            if(!vid)return;
            lastFocused=document.activeElement;
            let vTitle='Video';
            if(info){
                const client=info.querySelector('.yt-client');
                const title=info.querySelector('h4');
                vTitle=title?title.textContent:client?client.textContent:'Video';
                infoContainer.innerHTML='<span class="yt-client">'+(client?client.textContent:'')+'</span>'+(title?'<h4>'+title.textContent+'</h4>':'');
            }
            embedContainer.innerHTML='<iframe src="https://www.youtube.com/embed/'+vid+'?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&controls=1" title="'+vTitle.replace(/"/g,'&quot;')+'" style="border:none" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>';
            modal.classList.add('active');
            modal.setAttribute('role','dialog');
            modal.setAttribute('aria-modal','true');
            document.body.style.overflow='hidden';
            closeBtn.focus();
        }
        card.addEventListener('click',openCard);
        card.addEventListener('keydown',e=>{
            if(e.key==='Enter'||e.key===' '){e.preventDefault();openCard()}
        });
    });

    function closeModal(){
        modal.classList.remove('active');
        modal.removeAttribute('role');
        modal.removeAttribute('aria-modal');
        document.body.style.overflow='';
        embedContainer.innerHTML='';
        infoContainer.innerHTML='';
        if(lastFocused)lastFocused.focus();
    }
    closeBtn.addEventListener('click',closeModal);
    overlay.addEventListener('click',closeModal);
    modal.addEventListener('keydown',e=>{
        if(e.key==='Escape'){closeModal();return}
        if(e.key==='Tab'){
            const focusable=modal.querySelectorAll('button,[tabindex]');
            const first=focusable[0];const last=focusable[focusable.length-1];
            if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
            else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
        }
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('active'))closeModal()});
})();

// YT CAROUSELS (Transform-Based + Dots + Counter + Keyboard + Touch + Auto-scroll + Ver Todos)
document.querySelectorAll('.yt-carousel').forEach(carousel=>{
    const track=carousel.querySelector('.yt-track');
    const prevBtn=carousel.querySelector('.yt-prev');
    const nextBtn=carousel.querySelector('.yt-next');
    const wrap=carousel.querySelector('.yt-track-wrap');
    if(!track||!prevBtn||!nextBtn||!wrap)return;
    const cards=Array.from(track.children);
    if(!cards.length)return;
    let idx=0;
    const totalCards=cards.length;

    // Create dots container
    const dotsWrap=document.createElement('div');
    dotsWrap.className='yt-dots';
    carousel.appendChild(dotsWrap);

    function getVisible(){
        const w=track.parentElement.offsetWidth;
        const c=cards[0];
        if(!c)return 1;
        const gap=track.classList.contains('yt-track-reels')?12:16;
        return Math.max(1,Math.floor((w+gap)/(c.offsetWidth+gap)));
    }

    function getMaxIdx(){return Math.max(0,cards.length-getVisible())}

    function updateDots(){
        const maxIdx=getMaxIdx();
        const dotCount=Math.min(maxIdx+1,15);
        // Remove old dots, keep counter
        dotsWrap.querySelectorAll('.yt-dot').forEach(d=>d.remove());
        for(let i=0;i<dotCount;i++){
            const dot=document.createElement('button');
            dot.className='yt-dot'+(i===idx?' active':'');
            dot.setAttribute('aria-label',T('a11y.goTo',{n:i+1,total:dotCount}));
            dot.addEventListener('click',()=>{idx=Math.min(i,getMaxIdx());update()});
            dotsWrap.appendChild(dot);
        }
    }

    function update(){
        const gap=track.classList.contains('yt-track-reels')?12:16;
        const cardW=cards[0].offsetWidth+gap;
        const maxIdx=getMaxIdx();
        idx=Math.min(idx,maxIdx);
        track.style.transform=`translateX(-${idx*cardW}px)`;
        prevBtn.classList.toggle('hidden',idx===0);
        nextBtn.classList.toggle('hidden',idx>=maxIdx);
        updateDots();
    }

    prevBtn.addEventListener('click',()=>{if(idx>0){idx--;update()}});
    nextBtn.addEventListener('click',()=>{if(idx<getMaxIdx()){idx++;update()}});

    // Keyboard navigation
    wrap.setAttribute('tabindex','0');
    wrap.setAttribute('role','region');
    wrap.setAttribute('aria-label',T('a11y.carousel',{total:totalCards}));
    wrap.addEventListener('keydown',e=>{
        if(e.key==='ArrowRight'){e.preventDefault();if(idx<getMaxIdx()){idx++;update()}}
        if(e.key==='ArrowLeft'){e.preventDefault();if(idx>0){idx--;update()}}
        if(e.key==='Home'){e.preventDefault();idx=0;update()}
        if(e.key==='End'){e.preventDefault();idx=getMaxIdx();update()}
    });

    // Touch/swipe
    let startX=0,swiping=false;
    wrap.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;swiping=true},{passive:true});
    wrap.addEventListener('touchmove',e=>{
        if(!swiping)return;
        const diff=startX-e.touches[0].clientX;
        if(Math.abs(diff)>50){
            if(diff>0&&idx<getMaxIdx()){idx++;update()}
            else if(diff<0&&idx>0){idx--;update()}
            swiping=false;
        }
    },{passive:true});
    wrap.addEventListener('touchend',()=>{swiping=false});

    // Mouse drag
    let mouseStart=0,mouseDown=false;
    wrap.addEventListener('mousedown',e=>{mouseStart=e.clientX;mouseDown=true;wrap.style.cursor='grabbing'});
    document.addEventListener('mouseup',e=>{
        if(!mouseDown)return;
        mouseDown=false;wrap.style.cursor='';
        const diff=mouseStart-e.clientX;
        if(Math.abs(diff)>50){
            if(diff>0&&idx<getMaxIdx()){idx++;update()}
            else if(diff<0&&idx>0){idx--;update()}
        }
    });

    update();
    let rt;window.addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(update,150)});

    // Auto-scroll when in viewport
    let autoTimer=null;
    function startAutoScroll(){
        if(autoTimer)clearInterval(autoTimer);
        autoTimer=setInterval(()=>{
            if(idx<getMaxIdx()){idx++;update()}
            else{idx=0;update()}
        },5000);
    }
    function stopAutoScroll(){if(autoTimer){clearInterval(autoTimer);autoTimer=null}}
    const autoObs=new IntersectionObserver(entries=>{
        entries.forEach(e=>{
            if(e.isIntersecting){startAutoScroll()}
            else{stopAutoScroll()}
        });
    },{threshold:0.3});
    autoObs.observe(carousel);
    carousel.addEventListener('mouseenter',stopAutoScroll);
    carousel.addEventListener('mouseleave',startAutoScroll);
    wrap.addEventListener('touchstart',stopAutoScroll,{passive:true});
});

// DEPOIMENTOS CAROUSEL
(function(){
    const slides=document.querySelectorAll('.depo-slide');
    const dotsContainer=document.getElementById('depoDots');
    const counterEl=document.getElementById('depoCurrent');
    const totalEl=document.getElementById('depoTotal');
    if(!slides.length||!dotsContainer)return;
    let current=0;
    const total=slides.length;
    if(totalEl)totalEl.textContent=total;

    slides.forEach((_,i)=>{
        const dot=document.createElement('button');
        dot.className='depo-dot'+(i===0?' active':'');
        dot.setAttribute('aria-label',T('a11y.depo',{n:i+1}));
        dot.addEventListener('click',()=>{current=i;goTo(current);resetTimer()});
        dotsContainer.appendChild(dot);
    });

    function goTo(idx){
        slides.forEach((s,i)=>s.classList.toggle('active',i===idx));
        document.querySelectorAll('.depo-dot').forEach((d,i)=>d.classList.toggle('active',i===idx));
        if(counterEl){counterEl.style.opacity='0';setTimeout(()=>{counterEl.textContent=idx+1;counterEl.style.opacity='1'},200)}
    }

    goTo(0);

    let timer=setInterval(()=>{current=(current+1)%total;goTo(current)},4500);
    function resetTimer(){clearInterval(timer);timer=setInterval(()=>{current=(current+1)%total;goTo(current)},4500)}
    const carouselEl=document.querySelector('.depo-box');
    if(carouselEl){carouselEl.addEventListener('mouseenter',()=>clearInterval(timer));carouselEl.addEventListener('mouseleave',()=>{timer=setInterval(()=>{current=(current+1)%total;goTo(current)},4500)})}

    let sx=0,dr=false;
    carouselEl.addEventListener('touchstart',e=>{sx=e.touches[0].clientX;dr=true},{passive:true});
    carouselEl.addEventListener('touchmove',e=>{if(!dr)return;const d=sx-e.touches[0].clientX;if(Math.abs(d)>40){if(d>0)current=(current+1)%total;else current=(current-1+total)%total;goTo(current);dr=false;resetTimer()}},{passive:true});
    carouselEl.addEventListener('touchend',()=>{dr=false});
    let mx=0,md=false;
    carouselEl.addEventListener('mousedown',e=>{mx=e.clientX;md=true;carouselEl.style.cursor='grabbing'});
    document.addEventListener('mouseup',e=>{if(!md)return;md=false;carouselEl.style.cursor='';const d=mx-e.clientX;if(Math.abs(d)>50){if(d>0)current=(current+1)%total;else current=(current-1+total)%total;goTo(current);resetTimer()}});
})();

// SLOT MACHINE COUNTERS
function animateCounters(){
    document.querySelectorAll('[data-count]').forEach(el=>{
        const target=parseInt(el.dataset.count);
        const numEl=el.closest('.stat-num');
        if(!numEl)return;
        numEl.innerHTML='<span class="stat-num-inner"><span class="stat-num-roll" style="display:inline-block">0</span></span><span class="stat-suffix">'+el.nextElementSibling.textContent+'</span>';
        const roll=numEl.querySelector('.stat-num-roll');
        let current=0;
        const duration=2000;
        const startTime=performance.now();
        function tick(now){
            const elapsed=now-startTime;
            const progress=Math.min(elapsed/duration,1);
            const eased=1-Math.pow(1-progress,3);
            current=Math.floor(eased*target);
            roll.textContent=current;
            if(progress<1)requestAnimationFrame(tick);
            else roll.textContent=target;
        }
        requestAnimationFrame(tick);
    });
}

// SCROLL REVEAL
function setupReveal(){
    const revealObserver=new IntersectionObserver(entries=>{
        entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('revealed');revealObserver.unobserve(e.target)}})
    },{threshold:.06,rootMargin:'0px 0px -30px 0px'});
    document.querySelectorAll('.section-head,.cta-footer-inner,.depo-layout').forEach(el=>{el.classList.add('reveal');revealObserver.observe(el)});
    document.querySelectorAll('.depo-video-side').forEach(el=>{el.classList.add('reveal-left');revealObserver.observe(el)});
    document.querySelectorAll('.depo-carousel-side').forEach(el=>{el.classList.add('reveal-right');revealObserver.observe(el)});
    document.querySelectorAll('.service-card').forEach((el,i)=>{
        el.classList.add('reveal-scale');
        el.style.transitionDelay=`${i*0.08}s`;
        revealObserver.observe(el);
    });
    document.querySelectorAll('.yt-carousel').forEach((el,i)=>{
        el.classList.add('reveal-scale');
        el.style.transitionDelay=`${i*0.08}s`;
        revealObserver.observe(el);
    });
    document.querySelectorAll('.yt-carousel-head').forEach((el,i)=>{
        el.classList.add('reveal');
        el.style.transitionDelay=`${i*0.1}s`;
        revealObserver.observe(el);
    });
}

// DEPOIMENTO MODAL
(function(){
    const modal=document.getElementById('depoModal');
    const modalImg=document.getElementById('depoModalImg');
    const modalClose=document.getElementById('depoModalClose');
    const modalOverlay=document.getElementById('depoModalOverlay');
    if(!modal||!modalImg)return;
    let lastFocused=null;
    document.querySelectorAll('.depo-slide').forEach(slide=>{
        slide.setAttribute('tabindex','0');
        slide.setAttribute('role','button');
        const open=()=>{
            const src=slide.src;
            if(src){lastFocused=document.activeElement;modalImg.src=src;modal.classList.add('active');modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');document.body.style.overflow='hidden';modalClose.focus()}
        };
        slide.addEventListener('click',open);
        slide.addEventListener('keydown',e=>{
            if(e.key==='Enter'||e.key===' '){e.preventDefault();open()}
        });
    });
    function closeModal(){modal.classList.remove('active');modal.removeAttribute('role');modal.removeAttribute('aria-modal');document.body.style.overflow='';modalImg.src='';if(lastFocused)lastFocused.focus()}
    modalClose.addEventListener('click',closeModal);
    modalOverlay.addEventListener('click',closeModal);
    modal.addEventListener('keydown',e=>{
        if(e.key==='Escape'){closeModal();return}
        if(e.key==='Tab'){
            const focusable=modal.querySelectorAll('button,img,[tabindex]');
            const first=focusable[0];const last=focusable[focusable.length-1];
            if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
            else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
        }
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal.classList.contains('active'))closeModal()});
})();

// DARK/LIGHT MODE
(function(){
    const toggle=document.getElementById('themeToggle');
    if(!toggle)return;
    const saved=localStorage.getItem('mc-theme');
    if(saved==='light'){document.body.classList.add('light');toggle.setAttribute('aria-pressed','true')}
    toggle.addEventListener('click',()=>{
        document.body.classList.toggle('light');
        const isLight=document.body.classList.contains('light');
        localStorage.setItem('mc-theme',isLight?'light':'dark');
        toggle.setAttribute('aria-pressed',String(isLight));
    });
})();

// SMOOTH SCROLL
document.querySelectorAll('a[href^="#"]').forEach(a=>{a.addEventListener('click',e=>{const href=a.getAttribute('href');if(!href||href==='#')return;e.preventDefault();const t=document.querySelector(href);if(t)t.scrollIntoView({behavior:a.id==='skipLink'?'instant':'smooth',block:'start'})})});

// 3D TILT EFFECT
(function(){
    if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    document.querySelectorAll('.service-card,.yt-card').forEach(card=>{
        let ticking=false;
        card.addEventListener('mousemove',e=>{
            if(!ticking){
                requestAnimationFrame(()=>{
                    const r=card.getBoundingClientRect();
                    const x=e.clientX-r.left;
                    const y=e.clientY-r.top;
                    const cx=r.width/2;
                    const cy=r.height/2;
                    const rx=(y-cy)/cy*-6;
                    const ry=(x-cx)/cx*6;
                    card.style.transform=`perspective(600px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
                    ticking=false;
                });
                ticking=true;
    }
});
        card.addEventListener('mouseleave',()=>{
            card.style.transform='perspective(600px) rotateX(0) rotateY(0) scale(1)';
            card.style.transition='transform .5s cubic-bezier(.4,0,.2,1)';
        });
        card.addEventListener('mouseenter',()=>{card.style.transition='none'});
    });

    /* Mockup image parallax mouse tracking */
    const mockupImg=document.querySelector('.mockup-img');
    if(mockupImg){
        const laptopWrapper=mockupImg.closest('.laptop-wrapper');
        document.addEventListener('mousemove',e=>{
            const x=(e.clientX/window.innerWidth-.5)*6;
            const y=(e.clientY/window.innerHeight-.5)*4;
            mockupImg.style.transform=`translateY(${-4+Math.abs(y)}px) rotateY(${x*0.5}deg) rotateX(${-y*0.3}deg)`;
        });
    }

    /* Card mouse-follow gradient */
    document.querySelectorAll('.deliver-card').forEach(card=>{
        card.addEventListener('mousemove',e=>{
            const r=card.getBoundingClientRect();
            card.style.setProperty('--mx',((e.clientX-r.left)/r.width*100)+'%');
            card.style.setProperty('--my',((e.clientY-r.top)/r.height*100)+'%');
        });
    });

    /* 3D Tilt on cards */
    document.querySelectorAll('.tilt-card').forEach(card=>{
        card.addEventListener('mousemove',e=>{
            const r=card.getBoundingClientRect();
            const x=(e.clientX-r.left)/r.width-.5;
            const y=(e.clientY-r.top)/r.height-.5;
            card.style.transform=`perspective(600px) rotateY(${x*8}deg) rotateX(${-y*8}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave',()=>{
            card.style.transform='perspective(600px) rotateY(0) rotateX(0) translateY(0)';
        });
    });

    /* Magnetic button effect */
    document.querySelectorAll('.btn-wa, .btn-outline').forEach(btn=>{
        btn.addEventListener('mousemove',e=>{
            const r=btn.getBoundingClientRect();
            const x=e.clientX-r.left-r.width/2;
            const y=e.clientY-r.top-r.height/2;
            btn.style.transform=`translate(${x*.15}px,${y*.15}px)`;
        });
        btn.addEventListener('mouseleave',()=>{
            btn.style.transform='translate(0,0)';
        });
    });

    /* Cursor glow */
    const cursorGlow=document.getElementById('cursorGlow');
    if(cursorGlow){
        let mx=0,my=0,cx=0,cy=0;
        document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cursorGlow.classList.add('active')});
        document.addEventListener('mouseleave',()=>cursorGlow.classList.remove('active'));
        function animCursor(){
            cx+=(mx-cx)*.08;cy+=(my-cy)*.08;
            cursorGlow.style.left=cx+'px';cursorGlow.style.top=cy+'px';
            requestAnimationFrame(animCursor);
        }
        animCursor();
    }

    /* Staggered scroll reveal */
    const revealEls=document.querySelectorAll('.reveal');
    if(revealEls.length){
        const revealObs=new IntersectionObserver((entries)=>{
            entries.forEach(entry=>{
                if(entry.isIntersecting){entry.target.classList.add('visible');revealObs.unobserve(entry.target)}
            });
        },{threshold:0.1,rootMargin:'0px 0px -40px 0px'});
        revealEls.forEach(el=>revealObs.observe(el));
    }

    /* Parallax mockup on scroll */
    const sitesLaptop=document.querySelector('.sites-laptop');
    if(sitesLaptop){
        window.addEventListener('scroll',()=>{
            const scrollY=window.scrollY;
            const rate=scrollY*0.06;
            sitesLaptop.style.transform=`translateY(${rate}px)`;
        },{passive:true});
    }

    /* Slot machine counters */
    const statsSection=document.getElementById('stats');
    if(statsSection){
        let statsAnimated=false;
        function runStatsCounters(){
            if(statsAnimated)return;statsAnimated=true;
            statsSection.querySelectorAll('[data-slot-target]').forEach((el,i)=>{
                const target=parseFloat(el.dataset.slotTarget);
                const suffix=el.dataset.slotSuffix||'';
                const decimals=parseInt(el.dataset.slotDecimals)||0;
                const delay=i*200;
                setTimeout(()=>{
                    const duration=1800;
                    const start=performance.now();
                    function tick(now){
                        const elapsed=now-start;
                        const progress=Math.min(elapsed/duration,1);
                        const eased=1-Math.pow(1-progress,3);
                        const val=(target*eased).toFixed(decimals);
                        el.textContent=val+suffix;
                        if(progress<1)requestAnimationFrame(tick);
                        else el.textContent=target+suffix;
                    }
                    requestAnimationFrame(tick);
                },delay);
            });
        }
        const rect=statsSection.getBoundingClientRect();
        if(rect.top<window.innerHeight&&rect.bottom>0){
            setTimeout(runStatsCounters,500);
        }else{
            const statsObs=new IntersectionObserver(entries=>{
                entries.forEach(entry=>{if(entry.isIntersecting){setTimeout(runStatsCounters,300);statsObs.disconnect()}});
            },{threshold:0,rootMargin:'200px'});
            statsObs.observe(statsSection);
        }
        setTimeout(runStatsCounters,3000);
    }

    /* Price count-up R$0 → R$597,00 */
    const priceEl=document.querySelector('.sites-price-now[data-price-target]');
    if(priceEl){
        const target=parseInt(priceEl.dataset.priceTarget);
        let counted=false;
        function animatePrice(){
            if(counted)return;counted=true;
            const start=performance.now();
            const dur=1800;
            function tick(now){
                const p=Math.min((now-start)/dur,1);
                const eased=1-Math.pow(1-p,3);
                const val=Math.floor(target*eased);
                priceEl.textContent='R$'+val+',00';
                if(p<1)requestAnimationFrame(tick);
                else priceEl.textContent='R$'+target+',00';
            }
            requestAnimationFrame(tick);
        }
        const rect=priceEl.getBoundingClientRect();
        if(rect.top<window.innerHeight&&rect.bottom>0){
            priceEl.textContent='R$0,00';
            animatePrice();
        }else{
            priceEl.textContent='R$0,00';
            const priceObs=new IntersectionObserver(entries=>{
                entries.forEach(e=>{if(e.isIntersecting){animatePrice();priceObs.disconnect()}});
            },{threshold:0.1});
            priceObs.observe(priceEl);
        }
    }

    /* Hero particles / bokeh */
    const pCanvas=document.getElementById('heroParticles');
    if(pCanvas){
        const ctx=pCanvas.getContext('2d');
        let w,h,particles=[];
        function resize(){w=pCanvas.width=pCanvas.offsetWidth;h=pCanvas.height=pCanvas.offsetHeight}
        resize();
        window.addEventListener('resize',resize);
        class Dot{
            constructor(){this.reset()}
            reset(){
                this.x=Math.random()*w;
                this.y=Math.random()*h;
                this.r=Math.random()*3+1;
                this.vx=(Math.random()-.5)*.3;
                this.vy=(Math.random()-.5)*.3;
                this.alpha=Math.random()*.4+.1;
                this.hue=Math.random()>.5?340:10;
            }
            update(){
                this.x+=this.vx;this.y+=this.vy;
                if(this.x<0||this.x>w||this.y<0||this.y>h)this.reset();
            }
            draw(){
                ctx.beginPath();
                ctx.arc(this.x,this.y,this.r,0,Math.PI*2);
                ctx.fillStyle=`hsla(${this.hue},80%,60%,${this.alpha})`;
                ctx.fill();
            }
        }
        for(let i=0;i<35;i++)particles.push(new Dot());
        function loop(){
            ctx.clearRect(0,0,w,h);
            particles.forEach(p=>{p.update();p.draw()});
            requestAnimationFrame(loop);
        }
        loop();
    }
})();

// INIT
document.addEventListener('DOMContentLoaded',()=>{
    setupReveal();
    const loader=document.getElementById('loader');
    if(loader&&loader.classList.contains('hidden')){animateCounters()}
    else if(loader){
        const obs=new MutationObserver(()=>{if(loader.classList.contains('hidden')){obs.disconnect();animateCounters()}});
        obs.observe(loader,{attributes:true,attributeFilter:['class']});
    }

    /* Hero video fade-in */
    const heroVideo=document.querySelector('.sites-hero-video');
    if(heroVideo){
        function showVideo(){if(!heroVideo.classList.contains('loaded'))heroVideo.classList.add('loaded')}
        heroVideo.addEventListener('loadeddata',showVideo,{once:true});
        heroVideo.addEventListener('canplay',showVideo,{once:true});
        heroVideo.addEventListener('canplaythrough',showVideo,{once:true});
        heroVideo.play().catch(()=>{});
        setTimeout(showVideo,2000);
    }

    /* Back to top */
    const backToTop=document.getElementById('backToTop');
    if(backToTop){
        window.addEventListener('scroll',()=>{backToTop.classList.toggle('visible',window.scrollY>600)},{passive:true});
        backToTop.addEventListener('click',()=>{window.scrollTo({top:0,behavior:'smooth'})});
    }

    /* WhatsApp float - show after scroll */
    const waFloat=document.querySelector('.wa-float');
    if(waFloat){
        waFloat.style.opacity='0';
        waFloat.style.pointerEvents='none';
        window.addEventListener('scroll',()=>{
            if(window.scrollY>300){waFloat.style.opacity='';waFloat.style.pointerEvents='';waFloat.style.transition='opacity .4s'}
            else{waFloat.style.opacity='0';waFloat.style.pointerEvents='none'}
        },{passive:true});
    }

    /* Cookie banner */
    const cookieBanner=document.getElementById('cookieBanner');
    const cookieAccept=document.getElementById('cookieAccept');
    const cookieDecline=document.getElementById('cookieDecline');
    if(cookieBanner&&!localStorage.getItem('mc-cookies')){
        setTimeout(()=>{cookieBanner.classList.add('show')},2000);
    }
    if(cookieAccept)cookieAccept.addEventListener('click',()=>{localStorage.setItem('mc-cookies','accepted');cookieBanner.classList.remove('show')});
    if(cookieDecline)cookieDecline.addEventListener('click',()=>{localStorage.setItem('mc-cookies','declined');cookieBanner.classList.remove('show')});

    /* Navbar scroll effect */
    const navbar=document.getElementById('navbar');
    if(navbar){
        window.addEventListener('scroll',()=>{navbar.classList.toggle('scrolled',window.scrollY>50)},{passive:true});
    }

    /* FAQ Accordion */
    document.querySelectorAll('.faq-question').forEach(btn=>{
        btn.addEventListener('click',()=>{
            const item=btn.closest('.faq-item');
            const isOpen=item.classList.contains('open');
            document.querySelectorAll('.faq-item.open').forEach(i=>{i.classList.remove('open');i.querySelector('.faq-question').setAttribute('aria-expanded','false')});
            if(!isOpen){item.classList.add('open');btn.setAttribute('aria-expanded','true')}
        });
    });

    /* Hamburger mobile menu */
    const hamburger=document.getElementById('hamburger');
    const mobileOverlay=document.getElementById('mobileOverlay');
    if(hamburger&&mobileOverlay){
        function setMenu(open){
            mobileOverlay.classList.toggle('active',open);
            hamburger.classList.toggle('active',open);
            hamburger.setAttribute('aria-expanded',String(open));
            document.body.style.overflow=open?'hidden':'';
        }
        hamburger.addEventListener('click',()=>{
            setMenu(!mobileOverlay.classList.contains('active'));
        });
        mobileOverlay.querySelectorAll('a').forEach(link=>{
            link.addEventListener('click',()=>{setMenu(false)});
        });
        document.addEventListener('keydown',e=>{
            if(e.key==='Escape'&&mobileOverlay.classList.contains('active'))setMenu(false);
        });
    }
});
