/* BASWORLDY first-page static DOM UI recovery. No remote services/API calls.
   Preserve original source HTML; only adapt SSR Slick to safe local visual controls. */
(() => {
  'use strict';
  function initSlider(slider, number) {
    const track=slider.querySelector('.slick-track');
    if(!track) return;
    const list=slider.querySelector('.slick-list');
    const slides=Array.from(track.children).filter(e=>e.classList.contains('slick-slide'));
    if(!slides.length) return;
    // The source SSR marks Slick initialized but sets width:0, which otherwise
    // vertically stacks hundreds of cards and makes the document 100,000px tall.
    track.style.removeProperty('width');
    track.style.removeProperty('left');
    track.style.removeProperty('transform');
    slider.classList.add('bwy-static-slider');
    if(list) list.style.removeProperty('height');
    let idx=0;
    let columns=3;
    function ncols(){
      const w=window.innerWidth;
      return w<600?1:w<920?2:3;
    }
    function paint(){
      columns=ncols();
      slider.style.setProperty('--bwy-visible',String(columns));
      const max=Math.max(0,slides.length-columns);
      idx=Math.min(Math.max(0,idx),max);
      for(let i=0;i<slides.length;i++){
        const visible=(i>=idx && i<idx+columns);
        slides[i].classList.toggle('bwy-visible',visible);
        slides[i].setAttribute('aria-hidden',visible?'false':'true');
        slides[i].classList.toggle('slick-active',visible);
        slides[i].classList.toggle('slick-current',i===idx);
        slides[i].style.removeProperty('width');
        slides[i].style.removeProperty('float');
        slides[i].style.removeProperty('display');
      }
      const prev=slider.querySelector('.slick-prev'),next=slider.querySelector('.slick-next');
      if(prev) {prev.classList.toggle('slick-disabled',idx===0);prev.setAttribute('aria-disabled',idx===0?'true':'false');}
      if(next) {next.classList.toggle('slick-disabled',idx>=max);next.setAttribute('aria-disabled',idx>=max?'true':'false');}
    }
    const prev=slider.querySelector('.slick-prev'),next=slider.querySelector('.slick-next');
    function bind(btn,delta){
      if(!btn)return;
      btn.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();idx+=delta*ncols();paint();},{capture:true});
      btn.tabIndex=0;
      btn.setAttribute('role','button');
      btn.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();idx+=delta*ncols();paint();}});
    }
    bind(prev,-1);bind(next,1);
    window.addEventListener('resize',paint,{passive:true});
    paint();
    slider.dataset.bwyLocalReady='true';
    slider.dataset.bwySlides=String(slides.length);
    slider.dataset.bwySliderNumber=String(number);
  }
  function setup(){
    document.querySelectorAll('.slick-slider').forEach(initSlider);
    document.documentElement.dataset.bwyLocalUiReady='true';
    window.__bwyLocalVisualState=()=>{
      const sliders=[...document.querySelectorAll('.slick-slider')];
      return {sliders:sliders.map(s=>({ready:s.dataset.bwyLocalReady==='true',slides:Number(s.dataset.bwySlides),height:Math.round(s.getBoundingClientRect().height),visible:s.querySelectorAll('.slick-slide.bwy-visible').length})),scrollHeight:document.documentElement.scrollHeight};
    };
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',setup,{once:true});
  else setup();
})();