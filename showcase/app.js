'use strict';
(()=>{
const entries=window.EMOJI_CATALOG??[];
const $=s=>document.querySelector(s),grid=$('#grid'),search=$('#search'),more=$('#load-more'),motion=$('#hover-motion'),format=$('#format'),dialog=$('#detail');
const normalize=s=>s.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
const indexed=entries.map(e=>({...e,haystack:normalize(`${e.id} ${e.name} ${e.vi} ${e.search}`)}));
const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const byId=new Map(indexed.map(e=>[e.id,e])),active=new Map(),visible=new WeakSet();
const reduced=matchMedia('(prefers-reduced-motion: reduce)'),connection=navigator.connection;
const categoryNames=window.EMOJI_CATEGORIES??{};
const categoryCounts=new Map();for(const e of entries)categoryCounts.set(e.category,(categoryCounts.get(e.category)??0)+1);
$('.filters').innerHTML=`<button data-category="all" aria-pressed="true">All emoji <span>${entries.length}</span></button>`+Object.keys(categoryNames).filter(key=>categoryCounts.has(key)).map(key=>`<button data-category="${escape(key)}" aria-pressed="false">${escape(categoryNames[key])} <span>${categoryCounts.get(key)}</span></button>`).join('');
let category='all',shown=24,selected=null,detailPlaying=false;
const store={get(k){try{return localStorage.getItem(k)}catch{return null}},set(k,v){try{localStorage.setItem(k,v)}catch{}}};
const paths=(id,ext)=>'assets/'+encodeURIComponent(id)+'/'+(ext==='avif'?'animated.avif':'still.'+ext)+(byId.get(id)?.revision?'?v='+byId.get(id).revision:'');
function setTheme(dark){document.body.classList.toggle('dark',dark);$('#theme').setAttribute('aria-label',`Switch to ${dark?'light':'dark'} theme`)}
setTheme(store.get('fluent-open-theme')?store.get('fluent-open-theme')==='dark':matchMedia('(prefers-color-scheme: dark)').matches);
$('#theme').addEventListener('click',()=>{const dark=!document.body.classList.contains('dark');setTheme(dark);store.set('fluent-open-theme',dark?'dark':'light')});
function stop(card){if(!card)return;const img=card.querySelector('img');if(active.has(card)){img.src=img.dataset.still;active.delete(card)}const pin=card.querySelector('.pin');pin.setAttribute('aria-pressed','false');pin.textContent='▶';pin.setAttribute('aria-label',`Keep ${card.dataset.id.replaceAll('-',' ')} playing`)}
function stopDetail(){if(selected)$('#detail-image').src=paths(selected.id,'webp');detailPlaying=false;$('#detail-play').setAttribute('aria-pressed','false');$('#detail-play').textContent='Play animation'}
function stopAll(){for(const card of [...active.keys()])stop(card);stopDetail()}
function start(card,pinned=false){
  if(document.hidden||!visible.has(card)||card.dataset.motionFailed)return;
  if(active.has(card)){if(pinned){active.get(card).pinned=true;card.querySelector('.pin').setAttribute('aria-pressed','true');card.querySelector('.pin').textContent='Ⅱ'}return}
  while(active.size>=3)stop(active.keys().next().value);
  const img=card.querySelector('img');img.src=paths(card.dataset.id,'avif');active.set(card,{pinned});
  if(pinned){const pin=card.querySelector('.pin');pin.setAttribute('aria-pressed','true');pin.textContent='Ⅱ';pin.setAttribute('aria-label',`Stop ${card.dataset.id.replaceAll('-',' ')}`)}
}
const observer='IntersectionObserver'in window?new IntersectionObserver(rows=>{for(const row of rows){if(row.isIntersecting)visible.add(row.target);else{visible.delete(row.target);stop(row.target)}}},{threshold:.08}):null;
function autoAllowed(){return motion.checked&&!reduced.matches&&!connection?.saveData&&!dialog.open}
function motionPreference(){if(reduced.matches||connection?.saveData){motion.checked=false;motion.disabled=true;motion.closest('label').title='Automatic motion respects your device preference. You can still press Play.'}else{motion.disabled=false;motion.checked=store.get('fluent-open-hover')!=='0'}stopAll()}
motionPreference();reduced.addEventListener('change',motionPreference);connection?.addEventListener?.('change',motionPreference);
motion.addEventListener('change',()=>{store.set('fluent-open-hover',motion.checked?'1':'0');stopAll()});
function filtered(){const q=normalize(search.value.trim());return indexed.filter(e=>(category==='all'||e.category===category)&&(!q||e.haystack.includes(q)))}
function render(){
  stopAll();observer?.disconnect();const all=filtered(),items=all.slice(0,shown);const unit=format.value.toUpperCase();
  grid.innerHTML=items.map(e=>`<article class="card" data-id="${e.id}"><div class="art"><button class="preview" aria-label="Preview ${escape(e.name)}"><img src="${paths(e.id,'webp')}" data-still="${paths(e.id,'webp')}" alt="${escape(e.name)}" width="256" height="256" loading="lazy" decoding="async"></button><button class="pin" aria-pressed="false" aria-label="Keep ${escape(e.name)} playing">▶</button></div><div class="card-meta"><span class="card-name" title="${escape(e.name)}">${escape(e.name)}</span><div class="card-bottom"><span>${(e.bytes/1024).toFixed(1)} KiB</span><a class="download" href="${paths(e.id,format.value)}" download="${e.id}.${format.value}" aria-label="Download ${escape(e.name)} as ${unit}">${unit} ↓</a></div></div></article>`).join('');
  for(const card of grid.children){if(observer)observer.observe(card);else visible.add(card)}
  $('#results').textContent=`${all.length} ${all.length===1?'emoji':'emoji'}${search.value||category!=='all'?' found':' to explore'}`;
  $('#loaded-count').textContent=all.length?`${items.length} of ${all.length} shown`:'';more.hidden=items.length>=all.length;$('#empty').hidden=all.length>0;
}
let timer;search.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>{shown=24;render()},100)});
$('.filters').addEventListener('click',event=>{const button=event.target.closest('[data-category]');if(!button)return;category=button.dataset.category;shown=24;for(const b of $('.filters').children)b.setAttribute('aria-pressed',String(b===button));render()});
more.addEventListener('click',()=>{shown+=24;render()});
format.addEventListener('change',()=>{for(const card of grid.children){const link=card.querySelector('.download'),e=byId.get(card.dataset.id);link.href=paths(e.id,format.value);link.download=`${e.id}.${format.value}`;link.textContent=`${format.value.toUpperCase()} ↓`;link.setAttribute('aria-label',`Download ${e.name} as ${format.value.toUpperCase()}`)}});
$('#reset').addEventListener('click',()=>{search.value='';$('.filters [data-category=all]').click();search.focus()});
grid.addEventListener('error',event=>{const img=event.target;if(img.tagName!=='IMG')return;const card=img.closest('.card');if(img.src.endsWith('.avif')){card.dataset.motionFailed='true';stop(card);card.querySelector('.pin').disabled=true}else if(img.src.endsWith('.webp')){img.dataset.still=paths(card.dataset.id,'png');img.src=img.dataset.still}},true);
$('#detail-image').addEventListener('error',event=>{if(!selected)return;const img=event.target;if(img.src.endsWith('.avif')){stopDetail();$('#detail-play').disabled=true;$('#detail-play').textContent='Still preview'}else if(img.src.endsWith('.webp'))img.src=paths(selected.id,'png')});
grid.addEventListener('pointerover',event=>{const card=event.target.closest('.card');if(card&&!card.contains(event.relatedTarget)&&autoAllowed())start(card)});
grid.addEventListener('pointerout',event=>{const card=event.target.closest('.card');if(card&&!card.contains(event.relatedTarget)&&!active.get(card)?.pinned)stop(card)});
grid.addEventListener('focusin',event=>{const card=event.target.closest('.card');if(card&&autoAllowed())start(card)});
grid.addEventListener('focusout',event=>{const card=event.target.closest('.card');if(card&&!card.contains(event.relatedTarget)&&!active.get(card)?.pinned)stop(card)});
grid.addEventListener('click',event=>{const card=event.target.closest('.card');if(!card)return;if(event.target.closest('.pin')){if(active.get(card)?.pinned)stop(card);else start(card,true)}else if(event.target.closest('.preview'))openDetail(byId.get(card.dataset.id))});
function openDetail(e){stopAll();selected=e;$('#detail-play').disabled=false;$('#detail-name').textContent=e.name;$('#detail-vi').textContent=e.vi;$('#detail-category').textContent=categoryNames[e.category]??e.category;$('#detail-meta').textContent=`256 ×256 · ${e.fps} fps · 3 seconds · ${(e.bytes/1024).toFixed(1)} KiB · MIT`;$('#detail-image').alt=e.name;$('#detail-image').src=paths(e.id,'webp');$('#detail-image').closest('div').classList.remove('dark');$('#detail-background').setAttribute('aria-pressed','false');$('#detail-background').textContent='Dark backdrop';$('#detail-downloads').innerHTML=['avif','png','webp'].map(ext=>`<a href="${paths(e.id,ext)}" download="${e.id}.${ext}">${ext.toUpperCase()} ↓</a>`).join('')+`<a href="assets/${e.id}/motion.json" download="${e.id}.motion.json">Recipe ↓</a><a href="assets/${e.id}/source.png" download="${e.id}.source.png">Master ↓</a>`;dialog.showModal()}
$('#close-detail').addEventListener('click',()=>dialog.close());dialog.addEventListener('close',()=>{stopDetail();selected=null});dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close()}});
$('#detail-play').addEventListener('click',()=>{if(!selected)return;detailPlaying=!detailPlaying;$('#detail-image').src=paths(selected.id,detailPlaying?'avif':'webp');$('#detail-play').setAttribute('aria-pressed',String(detailPlaying));$('#detail-play').textContent=detailPlaying?'Pause animation':'Play animation'});
$('#detail-background').addEventListener('click',()=>{const dark=$('.detail-stage').classList.toggle('dark');$('#detail-background').setAttribute('aria-pressed',String(dark));$('#detail-background').textContent=dark?'Light backdrop':'Dark backdrop'});
$('#copy-path').addEventListener('click',async()=>{if(!selected)return;const value=paths(selected.id,'avif');let copied=false;try{await navigator.clipboard.writeText(value);copied=true}catch{const input=document.createElement('textarea');input.value=value;dialog.append(input);input.select();copied=document.execCommand('copy');input.remove()}$('#copy-status').textContent=copied?'Animation path copied':'Copy unavailable';$('#copy-path').textContent=copied?'Copied!':'Copy unavailable';setTimeout(()=>$('#copy-path').textContent='Copy animation path',1800)});
document.addEventListener('visibilitychange',()=>{if(document.hidden)stopAll()});window.addEventListener('pagehide',stopAll);
document.addEventListener('keydown',event=>{if(event.key==='/'&&!dialog.open&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)){event.preventDefault();search.focus()}});
$('#count-stat').textContent=entries.length;$('.filters [data-category=all] span').textContent=entries.length;
const sizes=entries.map(e=>e.bytes).sort((a,b)=>a-b);$('#size-stat').textContent=`${(sizes[Math.floor(sizes.length/2)]/1024).toFixed(0)} KiB`;$('#size-stat').nextElementSibling.textContent='median animation';
search.value=new URLSearchParams(location.search).get('q')??'';render();
})();
