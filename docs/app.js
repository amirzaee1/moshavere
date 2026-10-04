const CONSULTATION_PAGE='https://before-you-buy.amirzaee123.chatgpt.site/';
const segments=[[0,9.7],[9.7,17.86],[17.86,26.1],[26.1,37.94],[37.94,51.02],[51.02,60.75]];
const choices={2:[['result','نتیجهٔ موردنظر'],['quality','کیفیت محصول'],['price','قیمت مناسب']],3:[['try','اول امتحانش کنم'],['experience','تجربهٔ دیگران رو ببینم'],['difference','تفاوت‌ها رو بررسی کنم']]};
const transcript=['تا حالا چیزی خریدی که همه می‌گفتن عالیه… ولی برای تو هیچ فرقی نکرد؟','چیزی که برای یکی فوق‌العاده‌ست، ممکنه چیزی نباشه که تو لازم داری.','وقتی می‌خوای یه محصول جدید بخری، کدوم برات مهم‌تره؟','برای این‌که بفهمی یه محصول به دردت می‌خوره، ترجیح می‌دی چطور بررسی کنی؟','اول نیازت، بعد بررسی محصول، آخرش هم تصمیم با خودت.','اگه هنوز مطمئن نیستی، روی «نیاز به مشاوره دارم» بزن.'];
const $=id=>document.getElementById(id),film=$('film');let step=-1,priority='',approach='',ready=false,requestId='',saving=false;
function uuid(){return crypto.randomUUID();}
function show(id,on=true){$(id).classList.toggle('hidden',!on)}
function playStep(n){step=n;ready=false;show('question',false);show('ending',false);show('hold',false);$('caption').textContent=transcript[n];film.currentTime=segments[n][0];const p=film.play();if(p)p.catch(()=>{film.controls=true;});}
function finish(){if(ready)return;ready=true;film.pause();if(step===2||step===3){$('hold').src='assets/'+(step===2?'q1-hold.jpg':'q2-hold.jpg');show('hold');renderQuestion();}else if(step===5){$('hold').src='assets/cta-hold.jpg';show('hold');show('ending');}else playStep(step+1);}
film.addEventListener('timeupdate',()=>{if(step>=0&&film.currentTime>=segments[step][1]-.07)finish();});film.addEventListener('ended',finish);
function renderQuestion(){const box=$('choices');box.replaceChildren();$('question').classList.toggle('second',step===3);for(const [value,label] of choices[step]){const b=document.createElement('button');b.type='button';b.textContent=label;b.setAttribute('aria-label',label);b.setAttribute('aria-pressed','false');b.addEventListener('click',()=>{for(const x of box.children){x.classList.remove('selected');x.setAttribute('aria-pressed','false')}b.classList.add('selected');b.setAttribute('aria-pressed','true');if(step===2)priority=value;else approach=value;$('continue').disabled=false;});box.append(b)}$('continue').disabled=true;show('question');}
$('start').addEventListener('click',()=>{requestId=uuid();show('intro',false);show('controls');film.preload='auto';playStep(0)});
$('continue').addEventListener('click',()=>{if((step===2&&priority)||(step===3&&approach))playStep(step+1)});
$('mute').addEventListener('click',()=>{film.muted=!film.muted;$('mute').textContent=film.muted?'×':'♫';$('mute').setAttribute('aria-label',film.muted?'روشن کردن صدا':'بی‌صدا کردن')});
$('pause').addEventListener('click',()=>{if(film.paused&&!ready){film.play().catch(()=>{});$('pause').textContent='Ⅱ'}else{film.pause();$('pause').textContent='▶'}});
$('caption-toggle').addEventListener('click',()=>{const active=$('caption').classList.contains('hidden');show('caption',active);$('caption-toggle').setAttribute('aria-pressed',String(active))});
$('consult').addEventListener('click',()=>{window.location.assign(CONSULTATION_PAGE)});
function restart(){film.pause();film.currentTime=0;step=-1;priority='';approach='';show('form-panel',false);show('success',false);show('form-body');show('intro');show('controls',false);show('caption',false);show('ending',false);show('hold',false);$('lead-form').reset()}
$('restart').addEventListener('click',restart);$('done').addEventListener('click',restart);
