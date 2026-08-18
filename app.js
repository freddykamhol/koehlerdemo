import './src/style.css';
const ACCESS_HASH='a3461829663df1a0075de59980eb4f87f3c1266758b1a830ec26d4cd2cb54343';
const encoder=new TextEncoder();
const digest=async value=>Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(value)))).map(byte=>byte.toString(16).padStart(2,'0')).join('');

if(sessionStorage.getItem('koehler-demo-access')!=='granted'){
  document.body.classList.add('access-locked');
  const gate=document.createElement('div');
  gate.className='access-gate';
  gate.innerHTML=`<div class="access-card"><span class="access-label">KA Technologies · Kunden-Demo</span><h1>Geschützter<br><em>Projektzugang.</em></h1><p>Bitte geben Sie das Passwort ein, um die Website-Demo anzusehen.</p><form><label for="demo-password">Passwort</label><div class="password-input"><input id="demo-password" type="password" autocomplete="current-password" autofocus placeholder="Passwort eingeben"><button type="button" aria-label="Passwort anzeigen">Anzeigen</button></div><small class="access-error" aria-live="polite"></small><button class="access-submit" type="submit">Demo öffnen <span>→</span></button></form><small class="access-credit">Konzept & Umsetzung · KA Technologies</small></div>`;
  document.body.append(gate);
  const form=gate.querySelector('form'),input=gate.querySelector('input'),show=gate.querySelector('.password-input button'),error=gate.querySelector('.access-error');
  show.addEventListener('click',()=>{const visible=input.type==='text';input.type=visible?'password':'text';show.textContent=visible?'Anzeigen':'Verbergen';show.setAttribute('aria-label',visible?'Passwort anzeigen':'Passwort verbergen')});
  form.addEventListener('submit',async event=>{event.preventDefault();error.textContent='';if(await digest(input.value)===ACCESS_HASH){sessionStorage.setItem('koehler-demo-access','granted');gate.classList.add('access-granted');setTimeout(()=>{gate.remove();document.body.classList.remove('access-locked')},450)}else{error.textContent='Das Passwort ist nicht korrekt.';input.value='';input.focus();gate.querySelector('.access-card').classList.remove('shake');requestAnimationFrame(()=>gate.querySelector('.access-card').classList.add('shake'))}});
}
const toggle=document.querySelector('.menu-toggle'),nav=document.querySelector('.mobile-nav');
toggle?.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')==='true';toggle.setAttribute('aria-expanded',String(!open));toggle.setAttribute('aria-label',open?'Menü öffnen':'Menü schließen');nav.classList.toggle('open',!open);document.body.classList.toggle('menu-open',!open)});
nav?.querySelectorAll('a').forEach(link=>link.addEventListener('click',()=>{toggle.setAttribute('aria-expanded','false');nav.classList.remove('open');document.body.classList.remove('menu-open')}));
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&nav?.classList.contains('open')){toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Menü öffnen');nav.classList.remove('open');document.body.classList.remove('menu-open');toggle.focus()}});
document.querySelector('#year').textContent=new Date().getFullYear();
const observer=new IntersectionObserver(entries=>entries.forEach(entry=>entry.isIntersecting&&entry.target.classList.add('visible')),{threshold:.12});
document.querySelectorAll('.service-card,.section-heading,.intro-copy,.promise-copy,.contact-panel').forEach(el=>observer.observe(el));
