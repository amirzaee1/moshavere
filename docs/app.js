const CONSULTATION_API='https://before-you-buy.amirzaee123.chatgpt.site/api/consultations';
const choices={2:[['result','نتیجهٔ موردنظر'],['quality','کیفیت محصول'],['price','قیمت مناسب']],3:[['try','اول امتحانش کنم'],['experience','تجربهٔ دیگران رو ببینم'],['difference','تفاوت‌ها رو بررسی کنم']]};
const transcript=['تا حالا چیزی خریدی که همه می‌گفتن عالیه… ولی برای تو هیچ فرقی نکرد؟','چیزی که برای یکی فوق‌العاده‌ست، ممکنه چیزی نباشه که تو لازم داری.','وقتی می‌خوای یه محصول جدید بخری، کدوم برات مهم‌تره؟','برای این‌که بفهمی یه محصول به دردت می‌خوره، ترجیح می‌دی چطور بررسی کنی؟','اول نیازت، بعد بررسی محصول، آخرش هم تصمیم با خودت.','اگه هنوز مطمئن نیستی، روی «نیاز به مشاوره دارم» بزن.'];
const $=id=>document.getElementById(id),film=$('film');
let step=-1,ready=false,priority='',approach='',frame=0;
let formOpen=false,saving=false,saved=false,requestId='';
const speeds=[1.05,1.35,1.5,1],speedLabels=['۱٫۰۵×','۱٫۳۵×','۱٫۵×','۱×'];let speedIndex=0;
film.playbackRate=speeds[speedIndex];
if('preservesPitch' in film)film.preservesPitch=true;
function show(id,on=true){$(id).classList.toggle('hidden',!on)}
function setStep(n){step=n;ready=false;$('caption').textContent=transcript[n];$('pause').disabled=false}
function monitor(){if(frame||film.paused)return;frame=requestAnimationFrame(function loop(){frame=0;tick();if(!film.paused&&!ready&&step>=0)frame=requestAnimationFrame(loop)})}
function tick(){
 if(step<0||ready||formOpen)return;
 const t=film.currentTime;
 if(step===0&&t>=9.7)setStep(1);
 if(step===1&&t>=17.86)setStep(2);
 if(step===2&&t>=26.02)return holdQuestion('q1-hold.jpg');
 if(step===3&&t>=37.62)return holdQuestion('q2-hold.jpg');
 if(step===4&&t>=51.02)setStep(5);
 if(step===5&&t>=60.7&&$('ending').classList.contains('hidden')){$('hold').src='assets/cta-hold.jpg';show('hold');show('ending');}
 // The final spoken sentence runs from 60.75s to about 65.57s.
 if(step===5&&t>=65.62)return holdEnding();
}
function holdQuestion(image){
 if(ready)return;ready=true;film.pause();$('pause').disabled=true;
 $('hold').src='assets/'+image;show('hold');renderQuestion();
}
function holdEnding(){
 if(ready)return;ready=true;film.pause();$('pause').disabled=true;
 $('hold').src='assets/cta-hold.jpg';show('hold');show('ending');
}
function renderQuestion(){
 const box=$('choices');box.replaceChildren();$('question').classList.toggle('second',step===3);
 for(const [value,label] of choices[step]){
  const button=document.createElement('button');button.type='button';button.textContent=label;
  button.setAttribute('aria-label',label);button.setAttribute('aria-pressed','false');
  button.addEventListener('click',()=>{
   for(const item of box.children){item.classList.remove('selected');item.setAttribute('aria-pressed','false')}
   button.classList.add('selected');button.setAttribute('aria-pressed','true');
   if(step===2)priority=value;else approach=value;
   $('continue').disabled=false;
  });box.append(button);
 }
 $('continue').disabled=true;show('question');
}
$('start').addEventListener('click',async()=>{
 $('start').disabled=true;$('start').textContent='در حال پخش…';
 setStep(0);film.currentTime=0;
 try{await film.play();show('intro',false);show('controls');monitor()}
 catch{step=-1;ready=false;$('start').disabled=false;$('start').textContent='برای شروع کلیک کن';film.controls=true}
});
$('continue').addEventListener('click',async()=>{
 if(!ready||!(step===2?priority:approach))return;
 const previous=step;
 $('continue').disabled=true;$('continue').textContent='در حال ادامه…';
 setStep(previous+1);
 // Resume the same decoded stream. Seeking here caused lag and dropped speech.
 try{await film.play();show('question',false);show('hold',false);monitor()}
 catch{step=previous;ready=true;$('continue').disabled=false}
 finally{$('continue').textContent='برای ادامه کلیک کن'}
});
$('mute').addEventListener('click',()=>{film.muted=!film.muted;$('mute').textContent=film.muted?'×':'♫';$('mute').setAttribute('aria-label',film.muted?'روشن کردن صدا':'بی‌صدا کردن')});
$('pause').addEventListener('click',async()=>{
 if(ready)return;
 if(film.paused){try{await film.play();monitor()}catch{return}}
 else film.pause();
 $('pause').textContent=film.paused?'▶':'Ⅱ';
 $('pause').setAttribute('aria-label',film.paused?'ادامهٔ پخش':'توقف پخش');
});
$('speed').addEventListener('click',()=>{speedIndex=(speedIndex+1)%speeds.length;film.playbackRate=speeds[speedIndex];$('speed').textContent=speedLabels[speedIndex]});
$('caption-toggle').addEventListener('click',()=>{const active=$('caption').classList.contains('hidden');show('caption',active);$('caption-toggle').setAttribute('aria-pressed',String(active))});
$('consult').addEventListener('click',()=>{
 film.pause();ready=true;formOpen=true;$('pause').disabled=true;requestId ||= crypto.randomUUID();
 show('form-panel');show('controls',false);show('caption',false);show('ending',false);
 $('name').focus();
});
$('close-form').addEventListener('click',()=>{if(saving)return;formOpen=false;show('form-panel',false);show('controls');show('ending');$('consult').focus()});
$('lead-form').addEventListener('submit',async event=>{
 event.preventDefault();if(saving||saved)return;
 show('error',false);saving=true;$('submit').disabled=true;$('close-form').disabled=true;$('submit').textContent='در حال ثبت…';
 const abort=new AbortController(),timeout=setTimeout(()=>abort.abort(),15000);
 try{
  const response=await fetch(CONSULTATION_API,{method:'POST',credentials:'omit',headers:{'Content-Type':'application/json'},signal:abort.signal,body:JSON.stringify({name:$('name').value,phone:$('phone').value,priority,approach,consent:$('consent').checked,requestId,website:$('website').value})});
  const data=await response.json();if(!response.ok||!data.ok)throw new Error(data.error||'ثبت انجام نشد؛ دوباره تلاش کن.');
  saved=true;show('form-body',false);show('success');show('close-form',false);$('done').focus();
 }catch(error){$('error').textContent=error instanceof TypeError||error.name==='AbortError'?'ارتباط برقرار نشد. اطلاعاتت در فرم مانده؛ دوباره تلاش کن.':error.message;show('error');}
 finally{clearTimeout(timeout);saving=false;$('submit').disabled=false;$('close-form').disabled=false;$('submit').textContent='ثبت درخواست مشاوره';}
});
function restart(){film.pause();film.currentTime=0;step=-1;ready=false;priority='';approach='';show('intro');show('controls',false);show('caption',false);show('ending',false);show('question',false);show('hold',false);$('start').disabled=false;$('start').textContent='برای شروع کلیک کن'}
$('restart').addEventListener('click',restart);
$('done').addEventListener('click',()=>{formOpen=false;saved=false;requestId='';$('lead-form').reset();show('form-panel',false);show('form-body');show('success',false);show('close-form');restart()});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&!film.paused){film.pause();$('pause').textContent='▶';$('pause').setAttribute('aria-label','ادامهٔ پخش')}});
film.addEventListener('playing',monitor);
film.addEventListener('timeupdate',tick);
film.addEventListener('ended',()=>{if(step===5)holdEnding()});
