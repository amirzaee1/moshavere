const MEDIA='https://sahm-hamdeli.amirzaee123.chatgpt.site/media/';
const API='https://sahm-hamdeli.amirzaee123.chatgpt.site/api/requests';
const rate=1.05;
const durations=[14.680813,13.479125,10.448938,13.479125,11.728938,15.30775];
const questionStops=new Set([1,3]);
const total=durations.reduce((a,b)=>a+b,0);
const posters=['night-phone.webp','home.webp','cafe-woman.webp','shop.webp','bathroom-woman.webp','window-woman.webp'];
const titles=['یک پیام، یک اعتماد','واقعیتِ همین روزها','یک تکه از قصه کم است','اسمش اقتصاد مشارکتی است','محصول، فقط یک سرنخ است','قرار نیست زندگی‌ات را عوض کنی'];
const eyebrows=['۰۱ / پیام ۱۱:۴۷','۰۲ / یک راه دوم','۰۳ / سهم گمشده','۰۴ / کشف ماجرا','۰۵ / سرنخ روزمره','۰۶ / انتخاب با توست'];
const prompts=['این اتفاق چند بار برای تو افتاده؟','این دغدغه برای تو هم آشناست؟','صبر کن… سهم من؟','این دقیقاً دربارهٔ چیه؟','این کار رو همین الان هم انجام می‌دی؟'];
const answers=['آره، بارها','آره… این دغدغهٔ منه','ادامه بده؛ سهم من کجاست؟','می‌خوام دقیق‌تر بفهمم','آره؛ دقیقاً همین کار رو می‌کنم'];
const descriptions=['گاهی یک پیام ساده، بیشتر از چیزی که فکر می‌کنی معنا دارد.','نه تغییر ناگهانی؛ فقط امکان یک انتخاب بیشتر.','اعتماد تو، بخشی از ارزش واقعی این زنجیره است.','', 'راز اصلی، محصول نیست؛ اعتماد قبل از انتخاب است.','مسیر باید با زندگی فعلی تو هماهنگ شود، نه برعکس.'];
const cues=[
 [['یک پیام','یک اعتماد','چند بار؟'],['اعتماد','تبدیل به انتخاب','بی‌آنکه ببینی'],['حالا سؤال اینه','اثرِ حرف تو','کجا می‌ره؟']],
 [['زندگی ادامه دارد','یک راه دوم','نه تغییر ناگهانی'],['برای همین روزها','انتخاب بیشتر','کنار زندگی فعلی'],['آرام و واقعی','امکان تازه','بدون وعده']],
 [['تو فروشنده نبودی','اما اثر گذاشتی','روی یک انتخاب'],['تجربه منتقل شد','اعتماد شکل گرفت','انتخاب انجام شد'],['همه‌چیز بود','جز یک چیز','سهم تو؟']],
 [['ارزش از کجا می‌آید؟','از اعتماد','بین آدم‌ها'],['تجربه · اعتماد','انتخاب','مشارکت'],['اگر فروش واجد شرایط شد','سهم طبق توافق','نه درآمد تضمینی']],
 [['سرنخ جلوی چشمته','محصول','اما راز این نیست'],['سؤال واقعی','تو چی استفاده می‌کنی؟','قبل از انتخاب'],['پشت هر پیشنهاد','یک اعتماد','بین دو آدم']],
 [['همان شغل','همان زندگی','بدون تصمیم عجولانه'],['فقط یک بررسی','این مسیر','به تو می‌خورد؟'],['وقتی حرفت اثر می‌گذارد','بدان','سهم تو کجاست']]
];
const $=s=>document.querySelector(s),stage=$('#stage'),voice=$('#voice'),music=$('#music'),film=$('#film'),motion=$('#motion-type');
let phase='intro',chapter=0,token=0,consent=false,busy=false,requestId='',requestPayload='',reference='';
const warmed=new Map();
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function show(el,on){el.classList.toggle('hidden',!on)}
function setError(text=''){const box=$('#error');box.textContent=text;show(box,!!text)}
function setMedia(loadSource=false){
 const src=MEDIA+`chapter-${chapter+1}-cinematic-final.mp4`;film.poster=MEDIA+posters[chapter];
 if(loadSource&&film.getAttribute('src')!==src){film.preload='auto';film.src=src;film.load()}
}
function warmNextChapter(){
 const next=chapter+1;if(next>=durations.length||warmed.has(next))return;
 const video=document.createElement('video'),audio=new Audio(),poster=new Image();
 video.preload='auto';video.muted=true;video.playsInline=true;video.src=MEDIA+`chapter-${next+1}-cinematic-final.mp4`;
 audio.preload='auto';audio.src=MEDIA+`voice-v4c-${next+1}.mp3`;poster.src=MEDIA+posters[next];video.load();audio.load();
 warmed.set(next,{video,audio,poster});
 if(warmed.size>2){const first=warmed.keys().next().value,old=warmed.get(first);old.video.removeAttribute('src');old.audio.removeAttribute('src');warmed.delete(first)}
}
function chapterOffset(){return durations.slice(0,chapter).reduce((a,b)=>a+b,0)}
function seek(media,time,mine=token){
 const apply=()=>{if(mine!==token)return;try{media.currentTime=Math.max(0,time)}catch{}}
 if(media.readyState>=1)apply();else media.addEventListener('loadedmetadata',apply,{once:true});
}
function progress(time=0){const before=durations.slice(0,chapter).reduce((a,b)=>a+b,0);$('#progress').style.width=Math.min(100,(before+Math.min(time,durations[chapter]||0))/total*100)+'%'}
function panelStory(paused=false){return `<div class="story panel"><span class="eyebrow">${eyebrows[chapter]}</span><h1>${titles[chapter]}</h1>${chapter===3?'<p class="offer-line">همکاری در معرفی و فروش محصولات زیبایی و مراقبتی</p><p class="flow-sentence">تجربه <i>به</i> اعتماد <i>به</i> انتخاب <i>به</i> مشارکت می‌رسد.</p><small class="terms-note">دریافت سهم فقط در چارچوب توافق همکاری و پس از فروش واجد شرایط است؛ درآمدی تضمین نمی‌شود.</small>':`<p>${descriptions[chapter]}</p>`}${paused?'<button class="primary" id="resume">ادامهٔ پخش <span>▶</span></button><small>پخش از همان لحظه ادامه پیدا می‌کند.</small>':''}</div>`}
function render(){
 setMedia();document.querySelector('.visual').className=`visual chapter-visual-${chapter+1}`;
 if(phase==='intro')stage.innerHTML='<div class="intro panel"><span class="eyebrow">پیام ساعت ۱۱:۴۷</span><h1>یک پیام.<br>یک سؤال.<br><em>یک مسیر تازه.</em></h1><p>این یک تبلیغ معمولی نیست؛ یک گفت‌وگوی کوتاه دربارهٔ اثری است که شاید همین حالا روی انتخاب آدم‌ها داری.</p><button class="primary" id="start">برای شروع کلیک کن <span>▶</span></button><small>هیچ صدایی پیش از کلیک تو پخش نمی‌شود.</small></div>';
 else if(phase==='playing')stage.innerHTML=panelStory();
 else if(phase==='paused')stage.innerHTML=panelStory(true);
 else if(phase==='question')stage.innerHTML=`<div class="panel decision"><span class="eyebrow">حالا نوبت توست</span><h1>${prompts[chapter]}</h1><div class="choices"><button class="primary answer">${answers[chapter]}</button>${chapter===0?'<button class="secondary answer">تا حالا حساب نکردم</button>':''}</div><small>ادامه فقط بعد از انتخاب تو شروع می‌شود.</small></div>`;
 else if(phase==='cta')stage.innerHTML='<div class="panel decision"><span class="eyebrow">تصمیم با توست</span><h1>می‌خواهی ببینی<br><em>سهم تو کجاست؟</em></h1><p>موضوع دقیق، شرایط همکاری و نحوهٔ محاسبهٔ سهم را بشنو؛ بعد خودت تصمیم بگیر.</p><button class="primary pulse" id="consult">آره؛ نیاز به مشاوره دارم</button><small>راهنمای نام و شماره فقط بعد از همین کلیک پخش می‌شود.</small></div>';
 else if(phase==='form')stage.innerHTML=`<form class="panel form" id="lead-form"><button type="button" class="back" id="back">بازگشت</button><span class="eyebrow">یک قدم تا گفت‌وگو</span><h1>اسمت و شمارهٔ موبایلت را بنویس.</h1><button type="button" class="back guide" id="guide">پخش / ادامهٔ راهنمای فرم</button><p>برای توضیح موضوع، شرایط همکاری و نحوهٔ محاسبهٔ سهم با تو تماس گرفته می‌شود.</p><label for="name">نام و نام خانوادگی</label><input id="name" name="name" required minlength="2" maxlength="80" autocomplete="name" placeholder="نام تو"><label for="mobile">شماره موبایل</label><input id="mobile" name="mobile" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" maxlength="18" required placeholder="0912 345 6789"><div class="trap"><input id="website" tabindex="-1" autocomplete="off"></div><label class="consent"><input id="consent" type="checkbox" ${consent?'checked':''}><span>موافقم از نام و شماره‌ام فقط برای تماس دربارهٔ این درخواست استفاده شود.</span></label><button class="primary" id="submit" ${consent?'':'disabled'}>ثبت درخواست مشاوره</button><small>ثبت درخواست، تعهد به خرید یا همکاری نیست.</small></form>`;
 else stage.innerHTML=`<div class="panel decision"><div class="success-mark">✓</div><h1>درخواستت ثبت شد.</h1><p>شماره‌ات فقط برای پیگیری همین گفت‌وگو ذخیره شد.</p><span class="reference">کد پیگیری: <b dir="ltr">${esc(reference||requestId.slice(0,8))}</b></span></div>`;
 bind();
}
function bind(){
 $('#start')?.addEventListener('click',()=>{phase='playing';render();playChapter()});
 $('#resume')?.addEventListener('click',resumeChapter);
 document.querySelectorAll('.answer').forEach(b=>b.addEventListener('click',()=>{chapter++;phase='playing';render();playChapter()}));
 $('#consult')?.addEventListener('click',()=>{phase='form';render();playGuide(true)});
 $('#guide')?.addEventListener('click',toggleGuide);
 $('#back')?.addEventListener('click',()=>{if(busy)return;stop();phase='cta';render()});
 $('#consent')?.addEventListener('change',e=>{consent=e.target.checked;$('#submit').disabled=!consent});
 $('#lead-form')?.addEventListener('submit',submitForm);
}
function stop(){token++;voice.pause();music.pause();film.pause();show(motion,false);show($('#clock'),false);show($('#message'),false)}
async function playChapter(){
 const mine=++token;setError();setMedia(true);voice.preload='auto';voice.src=MEDIA+`voice-v4c-${chapter+1}.mp3`;voice.load();if(!music.getAttribute('src')){music.src=MEDIA+'hamdeli-score-v10.mp3';music.load()}
 film.currentTime=0;voice.currentTime=0;film.playbackRate=voice.playbackRate=music.playbackRate=rate;music.volume=.105;seek(music,chapterOffset(),mine);
 voice.addEventListener('playing',()=>{if(mine!==token||phase!=='playing')return;seek(film,voice.currentTime,mine);seek(music,chapterOffset()+voice.currentTime,mine)},{once:true});
 try{await Promise.all([voice.play(),film.play(),music.play()]);if(mine!==token){voice.pause();film.pause();music.pause()}else warmNextChapter()}catch{if(mine===token){stop();phase='paused';render();setError('پخش شروع نشد؛ برای تلاش دوباره روی «ادامهٔ پخش» بزن.')}}
}
async function resumeChapter(){
 const mine=++token;setError();phase='playing';render();film.playbackRate=voice.playbackRate=music.playbackRate=rate;seek(film,voice.currentTime,mine);seek(music,chapterOffset()+voice.currentTime,mine);
 try{await Promise.all([voice.play(),film.play(),music.play()]);if(mine!==token){voice.pause();film.pause();music.pause()}}catch{if(mine===token){stop();phase='paused';render();setError('پخش شروع نشد؛ دوباره روی «ادامهٔ پخش» بزن.')}}
}
async function playGuide(restart){
 const mine=++token;setError();if(restart||!voice.currentSrc.includes('voice-v4c-7.mp3')){voice.src=MEDIA+'voice-v4c-7.mp3';voice.load();voice.currentTime=0}if(!music.getAttribute('src')){music.src=MEDIA+'hamdeli-score-v10.mp3';music.load()}voice.playbackRate=music.playbackRate=rate;music.volume=.105;seek(music,62+voice.currentTime,mine);
 voice.addEventListener('playing',()=>{if(mine===token&&phase==='form')seek(music,62+voice.currentTime,mine)},{once:true});
 const button=$('#guide');if(button)button.textContent='توقف راهنمای فرم';
 try{await Promise.all([voice.play(),music.play()]);if(mine!==token){voice.pause();music.pause()}}catch{if(mine===token){voice.pause();music.pause();if(button)button.textContent='ادامهٔ راهنمای فرم';setError('راهنمای فرم پخش نشد؛ دوباره روی دکمهٔ راهنما بزن.')}}
}
function toggleGuide(){
 if(!voice.paused&&!voice.ended){token++;voice.pause();music.pause();const button=$('#guide');if(button)button.textContent='ادامهٔ راهنمای فرم';return}
 playGuide(voice.ended||!voice.currentSrc.includes('voice-v4c-7.mp3'));
}
voice.addEventListener('timeupdate',()=>{
 const t=voice.currentTime;if(phase==='form'){const target=62+t;if(!music.paused&&Math.abs(music.currentTime-target)>.55)seek(music,target);return}if(phase!=='playing')return;
 const expected=Number.isFinite(voice.duration)?voice.duration:durations[chapter];if(t>=Math.max(0,expected-.14)){finishVoice();return}
 progress(t);if(!film.paused&&Math.abs(film.currentTime-t)>.4)seek(film,t);const target=chapterOffset()+t;if(!music.paused&&Math.abs(music.currentTime-target)>.55)seek(music,target);
 show($('#clock'),chapter===0&&t<1.65);show($('#message'),chapter===0&&t>=1.15&&t<7.1);
 if(chapter===0&&t<7){show(motion,false);return}const beat=Math.min(2,Math.floor(Math.min(t,durations[chapter])/durations[chapter]*3)),c=cues[chapter][beat];motion.className=`type-direction type-${chapter+1} beat-${beat}`;motion.querySelector('span').textContent=c[0];motion.querySelector('b').textContent=c[1];motion.querySelector('em').textContent=c[2];show(motion,true);
});
function finishVoice(){
 film.pause();show(motion,false);show($('#clock'),false);show($('#message'),false);
 if(phase==='playing'){
  progress(durations[chapter]);
  if(chapter===5){music.pause();phase='cta';render();return}
  if(questionStops.has(chapter)){music.pause();phase='question';render();return}
  chapter++;phase='playing';render();playChapter();return
 }
 if(phase==='form'){music.pause();const button=$('#guide');if(button)button.textContent='پخش دوبارهٔ راهنمای فرم'}
}
voice.addEventListener('ended',finishVoice);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)return;if(phase==='playing'){stop();phase='paused';render()}else if(phase==='form'&&!voice.paused){token++;voice.pause();music.pause();const button=$('#guide');if(button)button.textContent='ادامهٔ راهنمای فرم'}});
function normalize(s){return s.replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)).replace(/[٠-٩]/g,d=>'٠١٢٣٤٥٦٧٨٩'.indexOf(d)).replace(/\D/g,'').replace(/^0098/,'0').replace(/^98/,'0')}
async function submitForm(e){e.preventDefault();if(busy||!consent)return;const name=$('#name').value.trim(),mobile=normalize($('#mobile').value);if(name.length<2||!/^09\d{9}$/.test(mobile)){setError('نام و شماره موبایل را بررسی کن.');return}busy=true;setError();const submit=$('#submit'),back=$('#back'),guide=$('#guide');submit.disabled=true;submit.textContent='در حال ثبت…';back.disabled=guide.disabled=true;stop();const payload=JSON.stringify({name,mobile,consent:true});if(payload!==requestPayload){requestId=crypto.randomUUID();requestPayload=payload}const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),15000);
 try{const res=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:requestId,name,mobile,consent:true,website:$('#website').value}),signal:controller.signal});const data=await res.json();if(!res.ok||!data.ok)throw new Error(data.error||'ثبت انجام نشد.');reference=String(data.reference||requestId.slice(0,8));phase='success';render()}catch(err){setError(err.name==='AbortError'?'ارتباط طول کشید؛ دوباره تلاش کن.':err.message||'ارتباط برقرار نشد؛ دوباره تلاش کن.');submit.disabled=!consent;submit.textContent='ثبت درخواست مشاوره';back.disabled=guide.disabled=false}finally{clearTimeout(timeout);busy=false}}
setMedia();progress(0);render();
