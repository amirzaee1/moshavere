const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const appFile=fs.existsSync(__dirname+'/app.js')?__dirname+'/app.js':__dirname+'/../docs/app.js';
const code = fs.readFileSync(appFile, 'utf8');
function setup() {
  const nodes = new Map(), timers = new Map(); let timerId = 0;
  class Element {
    constructor(id) { this.id=id; this.events={}; this.dataset={}; this.attrs={}; this.style={}; this.paused=true; this.readyState=4; this.currentTime=0; this.duration=79.208; this.playCount=0; this.srcCount=0; this.children={}; this.hidden=false; this.classList={toggle:(name,hidden)=>{if(name==='hidden')this.hidden=hidden}}; }
    addEventListener(name,fn){(this.events[name]??=[]).push(fn)}
    emit(name){for(const fn of this.events[name]||[])fn({target:this,preventDefault(){}})}
    querySelector(s){return this.children[s]??=new Element(s)}
    getAttribute(name){return this.attrs[name]||null}
    set src(value){this.attrs.src=value;this.srcCount++}
    get src(){return this.attrs.src||''}
    load(){this.error=null}
    play(){this.playCount++;this.paused=false;if(this.nextPlay){const p=this.nextPlay;this.nextPlay=null;return p}this.emit('playing');return Promise.resolve()}
    pause(){this.paused=true}
    set innerHTML(value){this.html=value;if(this.id==='stage'){for(const id of this.dynamicIds||[])nodes.delete('#'+id);this.dynamicIds=[...value.matchAll(/id="([^"]+)"/g)].map(x=>x[1]);for(const id of this.dynamicIds)nodes.set('#'+id,new Element(id))}}
    get innerHTML(){return this.html}
  }
  for(const name of ['#stage','#voice','#film','#motion-type','#clock','#message','#error','#play-status','#progress','.visual','.experience'])nodes.set(name,new Element(name.slice(1)));
  const document={hidden:false,events:{},querySelector:s=>nodes.get(s)||null,addEventListener(name,fn){this.events[name]=fn}};
  const ctx=vm.createContext({document,window:{},crypto:require('node:crypto').webcrypto,performance:{now:()=>100},setTimeout:(fn,delay)=>{timers.set(++timerId,{fn,delay});return timerId},clearTimeout:id=>timers.delete(id),AbortController,Uint8Array,console});
  vm.runInContext(code,ctx);
  const run=s=>vm.runInContext(s,ctx), film=nodes.get('#film'),voice=nodes.get('#voice');
  return {nodes,timers,document,film,voice,run,async start(){nodes.get('#start').emit('click');await Promise.resolve()},fireTimers(){for(const [id,t]of [...timers]){timers.delete(id);t.fn()}}};
}
(async()=>{
  const a=setup();a.fireTimers();assert(a.film.paused&&a.voice.paused,'No autoplay');await a.start();
  for(const time of [1,14.71,28.21,38.68,52.18,63.91,79.197]){a.film.currentTime=time;a.film.emit('timeupdate');assert.equal(a.run('phase'),'playing');assert.equal(a.nodes.has('#consult'),false)}
  assert.equal(a.film.srcCount,1,'One video source for all chapters');assert.equal(a.voice.playCount,0,'Guide never starts during movie');
  a.film.paused=true;a.film.emit('ended');assert.equal(a.run('phase'),'cta');assert(a.nodes.has('#consult'));
  a.nodes.get('#consult').emit('click');assert.equal(a.run('phase'),'form');assert.equal(a.voice.playCount,1);
  console.log('PASS: two journey clicks, six continuous chapters, full ending, guide gated');
  const b=setup();let oldDone;b.film.nextPlay=new Promise(r=>oldDone=r);await b.start();b.document.hidden=true;b.document.events.visibilitychange();assert.equal(b.run('phase'),'paused');b.document.hidden=false;b.nodes.get('#resume').emit('click');await Promise.resolve();oldDone();await Promise.resolve();assert.equal(b.film.paused,false);
  console.log('PASS: obsolete promise cannot pause resumed playback');
  const c=setup();c.fireTimers();await c.start();c.film.emit('stalled');assert.equal(c.run('stallTimer'),0);c.film.readyState=2;c.film.emit('waiting');c.film.currentTime=1;c.fireTimers();assert.equal(c.run('phase'),'playing');
  c.film.emit('waiting');c.film.readyState=4;c.film.emit('timeupdate');assert.equal(c.run('stallTimer'),0);
  console.log('PASS: buffered or advancing playback does not trigger false recovery');
  c.film.readyState=2;c.film.emit('waiting');c.fireTimers();assert.equal(c.run('phase'),'paused');assert(c.nodes.has('#resume'));
  console.log('PASS: genuinely stalled playback offers resume');
  console.log('All simulated player regression tests passed. These do not emulate Safari or network throughput.');
})().catch(e=>{console.error(e);process.exit(1)});
