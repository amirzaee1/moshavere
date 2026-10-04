"""Reproducible voice-first mix from licensed/generated stems; no speech synthesis."""
from pathlib import Path
import subprocess, json, numpy as np

P=Path(__file__).resolve().parent
SR=48000
N=round(67.2*SR)
def load(path):
    b=subprocess.check_output(['ffmpeg','-v','error','-i',str(path),'-f','f32le','-ac','2','-ar',str(SR),'-'])
    return np.frombuffer(b,np.float32).reshape(-1,2).copy()
def fit(a):return np.pad(a,((0,max(0,N-len(a))),(0,0)))[:N]
def save(path,a):
    subprocess.run(['ffmpeg','-nostdin','-v','error','-f','f32le','-ar',str(SR),'-ac','2','-i','-','-c:a','pcm_s24le','-y',str(path)],input=a.astype('float32').tobytes(),check=True)
(P/'audio').mkdir(exist_ok=True)
if not (P/'audio/voice-master.wav').exists():
    subprocess.run(['ffmpeg','-nostdin','-v','error','-i',str(P/'assets/narration-vibi-sarah-v01.mp3'),'-af','highpass=f=65,loudnorm=I=-17:TP=-2:LRA=7','-ar','48000','-ac','2','-c:a','pcm_s24le','-y',str(P/'audio/voice-master.wav')],check=True)
if not (P/'audio/music-baseline.wav').exists():
    subprocess.run(['ffmpeg','-nostdin','-v','error','-i',str(P/'assets/music-original-lyria.mp3'),'-t','67.2','-af','highpass=f=45,equalizer=f=1500:width_type=o:width=2.2:g=-3,loudnorm=I=-24:TP=-4:LRA=7,afade=t=in:d=0.7,afade=t=out:st=65.2:d=2','-ar','48000','-ac','2','-c:a','pcm_s24le','-y',str(P/'audio/music-baseline.wav')],check=True)
v=fit(load(P/'audio/voice-master.wav'))
m=fit(load(P/'audio/music-baseline.wav'))
block=2400
rms=np.sqrt(np.mean(v[:len(v)//block*block].reshape(-1,block,2)**2,axis=(1,2))+1e-12)
activity=np.clip((20*np.log10(rms)+45)/15,0,1)
target=1-activity*.63
smooth=[];last=.37
for value in target:
    last+=(value-last)*(.5 if value<last else .12)
    smooth.append(last)
env=np.interp(np.arange(N),np.arange(len(smooth))*block,smooth)
bed=m*env[:,None]
save(P/'audio/music-ducked.wav',bed)
events=[('whoosh-short',0),('click-soft',3.16),('whoosh-short',5.85),('pop',9.7),('whoosh-short',14.98),('click-soft',16.35),('whoosh-short',17.86),('click-soft',21.8),('click-soft',23.05),('click-soft',24.7),('whoosh-short',26.1),('pop',27.75),('click-soft',31.9),('click-soft',33.95),('click-soft',36.15),('whoosh-short',37.94),('pop',40.4),('whoosh-short',43.22),('chime',45.8),('pop',47.1),('click-soft',48.95),('whoosh-short',51.02),('sparkle',57.78),('whoosh-short',60.75),('key-press',61.45),('key-press',62.85),('pop',64.5),('chime',65.7)]
event_paths=[[str(P/'assets/sfx'/f'{name}.wav'),t] for name,t in events]
json.dump(event_paths,open(P/'audio/events.json','w'))
solver=str(P/'scripts/solve-sfx-gains.py')
raw=subprocess.check_output(['python',solver,str(P/'audio/music-ducked.wav'),str(P/'audio/events.json'),'3.5','4'],text=True)
(P/'audio/sfx-gains.jsonl').write_text(raw)
gains=[json.loads(row) for row in raw.splitlines()]
# Keep repeated effects consistent using the quieter median of the solved gains.
by_name={}
for path,t,g in gains:by_name.setdefault(Path(path).name,[]).append(g)
fixed={key:min(float(np.percentile(vals,40)),.22) for key,vals in by_name.items()}
sfx=np.zeros_like(bed)
cue_sheet=[]
for path,t,g in gains:
    a=load(path);i=round(t*SR);n=min(len(a),N-i)
    gain=fixed[Path(path).name]
    if t>=65:gain*=.6
    sfx[i:i+n]+=a[:n]*gain
    cue_sheet.append({'asset':Path(path).name,'time':t,'gain':gain})
sfx[-round(.6*SR):]*=np.linspace(1,0,round(.6*SR))[:,None]
save(P/'audio/sfx-mix.wav',sfx)
save(P/'audio/mix-reference.wav',v+bed+sfx)
json.dump({'duration':67.2,'sample_rate':SR,'music_carve':'1500 Hz, 2.2 octaves, -3 dB','ducking':'50 ms RMS, 80 ms attack / approximately 0.4s recovery, up to -8.6 dB','events':cue_sheet},open(P/'audio/mix-settings.json','w'),ensure_ascii=False,indent=2)
print('Mixed',len(events),'sound cues. Sample peak:',round(20*np.log10(np.max(abs(v+bed+sfx))),2),'dBFS')
