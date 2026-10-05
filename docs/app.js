const MEDIA='https://sahm-hamdeli.amirzaee123.chatgpt.site/media/';
const API='https://sahm-hamdeli.amirzaee123.chatgpt.site/api/requests';
const rate=1.05;
const durations=[14.7,13.5,10.466667,13.5,11.733333,15.30775];
const total=durations.reduce((a,b)=>a+b,0);
const posters=['night-phone.webp','home.webp','cafe-woman.webp','shop.webp','bathroom-woman.webp','window-woman.webp'];
const titles=['یک پیام، یک اعتماد','واقعیتِ همین روزها','یک تکه از قصه کم است','اسمش اقتصاد مشارکتی است','محصول، فقط یک سرنخ است','قرار نیست زندگی‌ات را عوض کنی'];
const eyebrows=['۰۱ / پیام ۱۱:۴۷','۰۲ / یک راه دوم','۰۳ / سهم گمشده','۰۴ / کشف ماجرا','۰۵ / سرنخ روزمره','۰۶ / انتخاب با توست'];
const descriptions=['گاهی یک پیام ساده، بیشتر از چیزی که فکر می‌کنی معنا دارد.','نه تغییر ناگهانی؛ فقط امکان یک انتخاب بیشتر.','اعتماد تو، بخشی از ارزش واقعی این زنجیره است.','', 'راز اصلی، محصول نیست؛ اعتماد قبل از انتخاب است.','مسیر باید با زندگی فعلی تو هماهنگ شود، نه برعکس.'];
const cues=[
 [['یک پیام','یک اعتماد','چند بار؟'],['اعتماد','تبدیل به انتخاب','بی‌آنکه ببینی'],['حالا سؤال اینه','اثرِ حرف تو','کجا می‌ره؟']],
 [['زندگی ادامه دارد','یک راه دوم','نه تغییر ناگهانی'],['برای همین روزها','انتخاب بیشتر','کنار زندگی فعلی'],['آرام و واقعی','امکان تازه','بدون وعده']],
 [['تو فروشنده نبودی','اما اثر گذاشتی','روی یک انتخاب'],['تجربه منتقل شد','اعتماد شکل گرفت','انتخاب انجام شد'],['همه‌چیز بود','جز یک چیز','سهم تو؟']],
 [['ارزش از کجا می‌آید؟','از اعتماد','بین آدم‌ها'],['تجربه · اعتماد','انتخاب','مشارکت'],['اگر فروش واجد شرایط شد','سهم طبق توافق','نه درآمد تضمینی']],
 [['سرنخ جلوی چشمته','محصول','اما راز این نیست'],['سؤال واقعی','تو چی استفاده می‌کنی؟','قبل از انتخاب'],['پشت هر پیشنهاد','یک اعتماد','بین دو آدم']],
 [['همان شغل','همان زندگی','بدون تصمیم عجولانه'],['فقط یک بررسی','این مسیر','به تو می‌خورد؟'],['وقتی حرفت اثر می‌گذارد','بدان','سهم تو کجاست']]
];

const $=s=>document.querySelector(s),stage=$('#stage'),voice=$('#voice'),film=$('#film'),motion=$('#motion-type');
const FILM=MEDIA+'hamdeli-continuous-v18.mp4',GUIDE=MEDIA+'hamdeli-guide-v18.m4a';
const offsets=durations.map((_,i)=>durations.slice(0,i).reduce((a,b)=>a+b,0));
let phase='intro',chapter=0,token=0,consent=false,busy=false,requestId='',requestPayload='',reference='';
let lastCue='',stallTimer=0,clickAt=0,resumeAt=0;
let answered=false,questionTimer=0;
function checkQuestion(){
 clearTimeout(questionTimer);questionTimer=0;
 if(phase!=='playing'||answered||film.paused)return false;
 const remaining=offsets[1]-film.currentTime;
 if(remaining<=0){
  resumeAt=film.currentTime;stop();phase='question';render();return true;
 }
 questionTimer=setTimeout(checkQuestion,Math.max(16,remaining/rate*1000));
 return false;
}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function show(el,on){el.classList.toggle('hidden',!on)}
function setError(text=''){const box=$('#error');box.textContent=text;show(box,!!text)}
function status(text=''){const el=$('#play-status');el.textContent=text;show(el,!!text)}
function clearStall(){clearTimeout(stallTimer);stallTimer=0;status()}
function primeFilm(){
 if(film.getAttribute('src')!==FILM){film.preload='auto';film.src=FILM;film.load()}
}
function primeGuide(){
 if(voice.getAttribute('src')!==GUIDE){voice.preload='auto';voice.src=GUIDE;voice.load()}
}
function progress(time=0){$('#progress').style.transform='scaleX('+Math.min(1,time/total)+')'}
function hideType(){show(motion,false);show($('#clock'),false);show($('#message'),false);lastCue=''}
function panelStory(paused=false){return `<div class="story panel"><span class="eyebrow">${eyebrows[chapter]}</span><h1>${titles[chapter]}</h1>${chapter===3?'<p class="offer-line">همکاری در معرفی و فروش محصولات زیبایی و مراقبتی</p><p class="flow-sentence">تجربه <i>به</i> اعتماد <i>به</i> انتخاب <i>به</i> مشارکت می‌رسد.</p><small class="terms-note">دریافت سهم فقط در چارچوب توافق همکاری و پس از فروش واجد شرایط است؛ درآمدی تضمین نمی‌شود.</small>':`<p>${descriptions[chapter]}</p>`}${paused?'<button class="primary" id="resume">ادامهٔ پخش <span>▶</span></button><small>پخش از همان لحظه ادامه پیدا می‌کند.</small>':''}</div>`}
function render(){
 document.querySelector('.experience').dataset.phase=phase;
 document.querySelector('.visual').className=`visual chapter-visual-${chapter+1}`;
 if(phase==='intro')stage.innerHTML='<div class="intro panel"><span class="eyebrow">پیام ساعت ۱۱:۴۷</span><h1>یک پیام.<br>یک سؤال.<br><em>یک مسیر تازه.</em></h1><p>این یک تبلیغ معمولی نیست؛ یک گفت‌وگوی کوتاه دربارهٔ اثری است که شاید همین حالا روی انتخاب آدم‌ها داری.</p><button class="primary" id="start">برای شروع کلیک کن <span>▶</span></button><small>هیچ صدایی پیش از کلیک تو پخش نمی‌شود.</small></div>';
 else if(phase==='playing')stage.innerHTML=panelStory();
 else if(phase==='paused')stage.innerHTML=panelStory(true);
 else if(phase==='question')stage.innerHTML='<div class="panel decision"><span class="eyebrow">یک تجربهٔ آشنا</span><h1>چند بار این اتفاق<br>برات افتاده؟</h1><button class="primary" id="many-times">بارها <span>←</span></button></div>';
 else if(phase==='cta')stage.innerHTML='<div class="panel decision"><span class="eyebrow">تصمیم با توست</span><h1>می‌خواهی ببینی<br><em>سهم تو کجاست؟</em></h1><p>موضوع دقیق، شرایط همکاری و نحوهٔ محاسبهٔ سهم را بشنو؛ بعد خودت تصمیم بگیر.</p><button class="primary pulse" id="consult">آره؛ نیاز به مشاوره دارم</button><small>راهنمای نام و شماره فقط بعد از همین کلیک پخش می‌شود.</small></div>';
 else if(phase==='form')stage.innerHTML=`<form class="panel form" id="lead-form"><button type="button" class="back" id="back">بازگشت</button><span class="eyebrow">یک قدم تا گفت‌وگو</span><h1>اسمت و شمارهٔ موبایلت را بنویس.</h1><button type="button" class="back guide" id="guide">پخش / ادامهٔ راهنمای فرم</button><p>برای توضیح موضوع، شرایط همکاری و نحوهٔ محاسبهٔ سهم با تو تماس گرفته می‌شود.</p><label for="name">نام و نام خانوادگی</label><input id="name" name="name" required minlength="2" maxlength="80" autocomplete="name" placeholder="نام تو"><label for="mobile">شماره موبایل</label><input id="mobile" name="mobile" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" maxlength="18" required placeholder="0912 345 6789"><div class="trap"><input id="website" tabindex="-1" autocomplete="off"></div><label class="consent"><input id="consent" type="checkbox" ${consent?'checked':''}><span>موافقم از نام و شماره‌ام فقط برای تماس دربارهٔ این درخواست استفاده شود.</span></label><button class="primary" id="submit" ${consent?'':'disabled'}>ثبت درخواست مشاوره</button><small>ثبت درخواست، تعهد به خرید یا همکاری نیست.</small></form>`;
 else stage.innerHTML=`<div class="panel decision"><div class="success-mark">✓</div><h1>درخواستت ثبت شد.</h1><p>شماره‌ات فقط برای پیگیری همین گفت‌وگو ذخیره شد.</p><span class="reference">کد پیگیری: <b dir="ltr">${esc(reference||requestId.slice(0,8))}</b></span></div>`;
 bind();
}

function bind(){
 $('#start')?.addEventListener('click',()=>{if(phase!=='intro')return;clickAt=performance.now();playFilm()});
 $('#resume')?.addEventListener('click',()=>playFilm());
 $('#many-times')?.addEventListener('click',()=>{if(phase!=='question')return;answered=true;clickAt=performance.now();playFilm()});
 $('#consult')?.addEventListener('click',()=>{if(phase!=='cta')return;phase='form';render();clickAt=performance.now();playGuide(true)});
 $('#guide')?.addEventListener('click',toggleGuide);
 $('#back')?.addEventListener('click',()=>{if(busy)return;stop();phase='cta';render()});
 $('#consent')?.addEventListener('change',e=>{consent=e.target.checked;$('#submit').disabled=!consent});
 $('#lead-form')?.addEventListener('submit',submitForm);
}
function stop(){token++;clearTimeout(questionTimer);questionTimer=0;film.pause();voice.pause();clearStall();hideType()}
function recoverFilm(text){
 if(phase!=='playing')return;
 resumeAt=film.currentTime;stop();phase='paused';render();setError(text);
}
async function playFilm(){
 const mine=++token;setError();phase='playing';render();primeFilm();
 if(film.error){
  film.load();
  film.addEventListener('loadedmetadata',()=>{if(mine===token)film.currentTime=resumeAt},{once:true});
 }
 film.muted=false;film.volume=1;film.playbackRate=rate;
 try{await film.play();if(mine!==token)return}
 catch{if(mine===token)recoverFilm('پخش متوقف شد؛ برای ادامه از همین لحظه بزن.')}
}
async function playGuide(restart){
 const mine=++token;setError();primeGuide();
 if(voice.error)voice.load();
 if(restart)voice.currentTime=0;
 voice.playbackRate=rate;
 const button=$('#guide');if(button)button.textContent='توقف راهنمای فرم';
 try{await voice.play();if(mine!==token)return}
 catch{if(mine===token){clearStall();if(button)button.textContent='ادامهٔ راهنمای فرم';setError('راهنما پخش نشد؛ دوباره روی راهنما بزن.')}}
}
function toggleGuide(){
 if(!voice.paused&&!voice.ended){token++;voice.pause();clearStall();$('#guide').textContent='ادامهٔ راهنمای فرم';return}
 playGuide(voice.ended);
}
function updateTimeline(){
 if(phase!=='playing')return;
 if(checkQuestion())return;
 const time=film.currentTime;
 let next=0;for(let i=1;i<offsets.length;i++)if(time>=offsets[i])next=i;
 if(next!==chapter){chapter=next;lastCue='';render()}
 progress(time);
 if(time>total-20)primeGuide();
 const t=time-offsets[chapter];
 show($('#clock'),chapter===0&&t<1.65);
 show($('#message'),chapter===0&&t>=1.15&&t<7.1);
 if(chapter===0&&t<7){show(motion,false);return}
 const beat=Math.min(2,Math.floor(t/durations[chapter]*3)),key=chapter+':'+beat;
 if(key!==lastCue){
  const c=cues[chapter][beat];lastCue=key;
  motion.className='type-direction type-'+(chapter+1)+' beat-'+beat;
  motion.querySelector('span').textContent=c[0];motion.querySelector('b').textContent=c[1];motion.querySelector('em').textContent=c[2];
 }
 show(motion,true);
}
function handleWaiting(media,expectedPhase){
 if(phase!==expectedPhase||media.paused||media.readyState>=3||stallTimer)return;
 const position=media.currentTime;
 status('در حال آماده‌شدن پخش…');
 media.dataset.bufferEvents=String(Number(media.dataset.bufferEvents||0)+1);
 stallTimer=setTimeout(()=>{
  stallTimer=0;
  if(phase!==expectedPhase||media.paused||media.readyState>=3||media.currentTime>position+.1){status();return}
  if(expectedPhase==='playing')recoverFilm('اینترنت کند شده؛ برای ادامهٔ پخش دوباره بزن.');
  else{voice.pause();status();$('#guide').textContent='ادامهٔ راهنمای فرم';setError('بارگذاری راهنما طول کشید؛ دوباره روی راهنما بزن.')}
 },20000);
}
film.addEventListener('timeupdate',updateTimeline);
film.addEventListener('timeupdate',()=>{if(film.readyState>=3&&stallTimer)clearStall()});
voice.addEventListener('timeupdate',()=>{if(voice.readyState>=3&&stallTimer)clearStall()});
film.addEventListener('playing',()=>{
 if(phase!=='playing')return;
 clearStall();
 if(clickAt){film.dataset.startLatencyMs=String(Math.round(performance.now()-clickAt));clickAt=0}
 updateTimeline();
});
film.addEventListener('waiting',()=>handleWaiting(film,'playing'));
film.addEventListener('stalled',()=>handleWaiting(film,'playing'));
film.addEventListener('error',()=>recoverFilm('بارگذاری فیلم متوقف شد؛ برای تلاش دوباره بزن.'));
film.addEventListener('ended',()=>{
 if(phase!=='playing')return;
 token++;clearStall();hideType();progress(total);phase='cta';render();primeGuide();
});
voice.addEventListener('playing',()=>{
 if(phase!=='form')return;clearStall();
 if(clickAt){voice.dataset.startLatencyMs=String(Math.round(performance.now()-clickAt));clickAt=0}
});
voice.addEventListener('waiting',()=>handleWaiting(voice,'form'));
voice.addEventListener('stalled',()=>handleWaiting(voice,'form'));
voice.addEventListener('error',()=>{
 if(phase!=='form')return;clearStall();setError('راهنما بارگذاری نشد؛ فرم همچنان قابل استفاده است.');
 $('#guide').textContent='تلاش دوبارهٔ راهنما';
});
voice.addEventListener('ended',()=>{clearStall();if(phase==='form')$('#guide').textContent='پخش دوبارهٔ راهنمای فرم'});
document.addEventListener('visibilitychange',()=>{
 if(!document.hidden)return;
 if(phase==='playing'){resumeAt=film.currentTime;stop();phase='paused';render()}
 else if(phase==='form'&&!voice.paused){token++;voice.pause();clearStall();$('#guide').textContent='ادامهٔ راهنمای فرم'}
});
function makeRequestId(){
 if(typeof crypto.randomUUID==='function')return crypto.randomUUID();
 const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
 const h=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
 return h.slice(0,8)+'-'+h.slice(8,12)+'-'+h.slice(12,16)+'-'+h.slice(16,20)+'-'+h.slice(20);
}
function normalize(s){return s.replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\D/g,'').replace(/^0098/,'0').replace(/^98/,'0')}
async function submitForm(e){e.preventDefault();if(busy||!consent)return;const name=$('#name').value.trim(),mobile=normalize($('#mobile').value);if(name.length<2||!/^09\d{9}$/.test(mobile)){setError('نام و شماره موبایل را بررسی کن.');return}busy=true;setError();const submit=$('#submit'),back=$('#back'),guide=$('#guide');submit.disabled=true;submit.textContent='در حال ثبت…';back.disabled=guide.disabled=true;stop();const payload=JSON.stringify({name,mobile,consent:true});if(payload!==requestPayload){requestId=makeRequestId();requestPayload=payload}const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
 try{const res=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:requestId,name,mobile,consent:true,website:$('#website').value}),signal:controller.signal});const data=await res.json();if(!res.ok||!data.ok)throw new Error(data.error||'ثبت انجام نشد.');reference=String(data.reference||requestId.slice(0,8));phase='success';render()}catch(err){setError(err.name==='AbortError'?'ارتباط طول کشید؛ دوباره تلاش کن.':err.message||'ارتباط برقرار نشد؛ دوباره تلاش کن.');submit.disabled=!consent;submit.textContent='ثبت درخواست مشاوره';back.disabled=guide.disabled=false}finally{clearTimeout(timeout);busy=false}}

film.poster=MEDIA+posters[0];progress();render();
if('requestIdleCallback'in window)requestIdleCallback(primeFilm,{timeout:900});else setTimeout(primeFilm,350);
