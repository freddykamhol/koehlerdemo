import './style.css';

const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.mobile-nav');

toggle?.addEventListener('click',()=>{
  const open=toggle.getAttribute('aria-expanded')==='true';
  toggle.setAttribute('aria-expanded',String(!open));
  toggle.setAttribute('aria-label',open?'Menü öffnen':'Menü schließen');
  nav?.classList.toggle('open',!open);
  document.body.classList.toggle('menu-open',!open);
});

nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{
  toggle?.setAttribute('aria-expanded','false');
  nav.classList.remove('open');
  document.body.classList.remove('menu-open');
}));

document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&nav?.classList.contains('open')){
    toggle?.setAttribute('aria-expanded','false');
    toggle?.setAttribute('aria-label','Menü öffnen');
    nav.classList.remove('open');
    document.body.classList.remove('menu-open');
    toggle?.focus();
  }
});

const year=document.querySelector('#year');
if(year) year.textContent=new Date().getFullYear();

const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>entry.isIntersecting&&entry.target.classList.add('visible'));
},{threshold:.12});

document.querySelectorAll('.service-card,.section-heading,.intro-copy,.promise-copy,.contact-panel').forEach(element=>observer.observe(element));
