import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Heart, Volume2, VolumeX, RotateCcw, Share2, Sparkles, X } from 'lucide-react'
import type { Experience, SceneId } from '../types'
import { sceneLabels, bouquetStyles } from '../data'
import Particles from './Particles'
import BouquetArtwork from './BouquetArtwork'

type Props = { experience: Experience; onClose: () => void; preview?: boolean }
const order: SceneId[] = ['heart','intro','cake','balloons','letter','cat-video','memories','finale']
export default function ScenePlayer({ experience, onClose, preview = false }: Props) {
  const scenes: SceneId[] = experience.scenes.filter(s => order.includes(s))
  if (experience.birthdayVideoUrl && !scenes.includes('cat-video')) { const letterAt = scenes.indexOf('letter'); scenes.splice(letterAt >= 0 ? letterAt + 1 : scenes.length, 0, 'cat-video') }
  const [index, setIndex] = useState(0)
  const [popped, setPopped] = useState<number[]>([])
  const [wish, setWish] = useState(false)
  const [heartOpen, setHeartOpen] = useState(false)
  const [arrowProgress, setArrowProgress] = useState(48)
  const [arrowLoaded, setArrowLoaded] = useState(true)
  const [stringPull, setStringPull] = useState(0)
  const [arrowFired, setArrowFired] = useState(false)
  const [arrowFlight, setArrowFlight] = useState<{x:number;y:number;rotation:number}|null>(null)
  const [celebrationBursts, setCelebrationBursts] = useState<Array<{id:number;x:number;y:number;kind:number}>>([])
  const burstIdRef = useRef(0)
  const flightFrameRef = useRef<number | undefined>(undefined)
  const targetRef = useRef<HTMLDivElement>(null)
  const dragZoneRef = useRef<HTMLDivElement>(null)
  const dragStartXRef = useRef(0)
  const pullRef = useRef(0)
  const revealTimerRef = useRef<number | undefined>(undefined)
  const [envelopeOpened, setEnvelopeOpened] = useState(false)
  const [letterPulled, setLetterPulled] = useState(false)
  const [letterRevealReady, setLetterRevealReady] = useState(false)
  const letterRevealTimerRef = useRef<number | undefined>(undefined)
  const flapStartYRef = useRef(0)
  const letterStartYRef = useRef(0)
  const [sound, setSound] = useState(false)
  const [hapticsOn, setHapticsOn] = useState(()=>{try{return localStorage.getItem('lovora-haptics')!=='off'}catch{return true}})
  const [memoryIndex, setMemoryIndex] = useState(0)
  const [typedLength, setTypedLength] = useState(0)
  const [bouquetOpen, setBouquetOpen] = useState(false)
  const [now, setNow] = useState(Date.now())
  const [videoDoorOpen, setVideoDoorOpen] = useState(false)
  const audioRef = useMemo(() => ({ current: null as HTMLAudioElement | null }), [])
  const popAudioRef = useRef<HTMLAudioElement | null>(null)
  const popStopRef = useRef<number | undefined>(undefined)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const musicTimeRef = useRef(0)
  const musicWasPlayingRef = useRef(false)
  const [videoReady, setVideoReady] = useState(false)
  const scene = scenes[index] || 'heart'
  const unlockAt = experience.targetDate ? new Date(`${experience.targetDate}T00:00:00`).getTime() : 0
  const locked = Boolean(!preview && experience.published && unlockAt && now < unlockAt)
  const countdown = Math.max(0, unlockAt - now)
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer) }, [])
  const letterText = experience.message || 'Some people make the world feel a little softer just by being in it. You are one of those people. I hope this little surprise reminds you how loved and appreciated you are.'
  useEffect(() => {
    if (scene !== 'letter' || !letterPulled) { setTypedLength(0); return }
    setTypedLength(0)
    let cursor = 0
    const timer = window.setInterval(() => {
      if (cursor >= letterText.length) { window.clearInterval(timer); return }
      const nextSpace = letterText.indexOf(' ', cursor)
      const nextEnd = nextSpace < 0 ? letterText.length : nextSpace + 1
      cursor = Math.max(cursor + 1, nextEnd)
      setTypedLength(cursor)
      try { if (navigator.vibrate && localStorage.getItem('lovora-haptics') !== 'off') navigator.vibrate(9) } catch {}
      if (cursor >= letterText.length) window.clearInterval(timer)
    }, 175)
    return () => window.clearInterval(timer)
  }, [scene, letterText, letterPulled])
  useEffect(() => { if (!audioRef.current || !experience.musicUrl) return; if (audioRef.current.src !== new URL(experience.musicUrl, window.location.href).href) audioRef.current.src = experience.musicUrl; if (sound && scene !== 'cat-video') void audioRef.current.play().catch(() => setSound(false)); else if (scene !== 'cat-video') audioRef.current.pause() }, [sound, experience.musicUrl, scene])
  useEffect(() => { if(scene==='cat-video' && videoReady && videoRef.current){if(audioRef.current){musicTimeRef.current=audioRef.current.currentTime;musicWasPlayingRef.current=!audioRef.current.paused;audioRef.current.pause()}void videoRef.current.play().catch(()=>{})} }, [scene,videoReady])
  useEffect(() => { if (scene !== 'balloons' && popAudioRef.current) { popAudioRef.current.pause(); popAudioRef.current.currentTime = 0; if (popStopRef.current) window.clearTimeout(popStopRef.current) } }, [scene])
  useEffect(() => () => { if (popStopRef.current) window.clearTimeout(popStopRef.current); if (revealTimerRef.current) window.clearTimeout(revealTimerRef.current); if (letterRevealTimerRef.current) window.clearTimeout(letterRevealTimerRef.current); if (flightFrameRef.current) cancelAnimationFrame(flightFrameRef.current); popAudioRef.current?.pause(); }, [])
  const themeClass = `theme-${experience.theme.toLowerCase().replaceAll(' ', '-')}`
  const next = () => setIndex(i => Math.min(i + 1, scenes.length - 1))
  const launchArrow = (startRect: DOMRect, pull: number) => {
    const target = targetRef.current?.getBoundingClientRect()
    if (!target) return
    if (flightFrameRef.current) cancelAnimationFrame(flightFrameRef.current)
    const start = { x: startRect.left + startRect.width / 2, y: startRect.top + startRect.height / 2 }
    const end = { x: target.left + target.width * .52, y: target.top + target.height * .54 }
    const dx = end.x - start.x, dy = end.y - start.y
    const duration = 680 + Math.min(620, pull * 5.5)
    const lift = Math.max(45, Math.min(150, Math.abs(dx) * .22 + pull * .65))
    const began = performance.now()
    setArrowFlight({ x: start.x, y: start.y, rotation: 0 })
    const tick = (now: number) => {
      const raw = Math.min(1, (now - began) / duration)
      const t = 1 - Math.pow(1 - raw, 2)
      const x = start.x + dx * t
      const y = start.y + dy * t - Math.sin(Math.PI * t) * lift
      const tangentY = dy - Math.PI * lift * Math.cos(Math.PI * t)
      setArrowFlight({ x, y, rotation: Math.atan2(tangentY, dx) * 180 / Math.PI })
      if (raw < 1) flightFrameRef.current = requestAnimationFrame(tick)
      else {
        setArrowFlight(null)
        setHeartOpen(true)
        buzz([35, 45, 80])
        if (audioRef.current) void audioRef.current.play().then(() => setSound(true)).catch(() => setSound(false))
        revealTimerRef.current = window.setTimeout(() => next(), 3000)
      }
    }
    flightFrameRef.current = requestAnimationFrame(tick)
  }
  const pullLetter = () => { if (letterPulled) return; setLetterPulled(true); buzz(18); letterRevealTimerRef.current = window.setTimeout(() => setLetterRevealReady(true), 850) }
  const triggerCelebration = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const x = Math.max(0, Math.min(100, ((event.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((event.clientY - rect.top) / rect.height) * 100))
    const id = ++burstIdRef.current
    setCelebrationBursts(old => [...old.slice(-7), { id, x, y, kind: id % 4 }])
    buzz([12, 18, 12])
    window.setTimeout(() => setCelebrationBursts(old => old.filter(b => b.id !== id)), 1700)
  }
  const previous = () => setIndex(i => Math.max(i - 1, 0))
  const buzz = (pattern: number | number[]) => { try { if (navigator.vibrate && localStorage.getItem('lovora-haptics') !== 'off') navigator.vibrate(pattern) } catch {} }
  const confetti = useMemo(() => Array.from({ length: 42 }, (_, i) => i), [])
  useEffect(() => { return () => { try { navigator.vibrate?.(0) } catch {} } }, [])
  const share = async () => {
    const url = window.location.href
    try { if (navigator.share) await navigator.share({ title: experience.title, text: `A little surprise for ${experience.recipient}`, url }); else await navigator.clipboard.writeText(url) } catch {}
  }
  if (locked) return <div className={`player ${themeClass} countdown-lock`} role="dialog" aria-modal="true" aria-label="Surprise countdown"><div className="countdown-lock-card"><span className="scene-emoji">♡</span><p className="eyebrow">A LITTLE WORLD IS WAITING</p><h1>Something lovely is<br/><em>almost here.</em></h1><p>{experience.openingInstruction || 'Your surprise is waiting for the right moment.'}</p><div className="countdown-clock">{[{label:'DAYS',value:Math.floor(countdown/86400000)},{label:'HOURS',value:Math.floor(countdown/3600000)%24},{label:'MINUTES',value:Math.floor(countdown/60000)%60},{label:'SECONDS',value:Math.floor(countdown/1000)%60}].map(part=><div key={part.label}><strong>{String(part.value).padStart(2,'0')}</strong><small>{part.label}</small></div>)}</div><small className="countdown-note">Unlocks at midnight on {experience.targetDate} · local device time</small><button className="secondary-btn" onClick={onClose}>Back</button></div></div>
  return <div className={`player ${themeClass}`} role="dialog" aria-modal="true" aria-label="Interactive surprise">
    <div className="player-top"><button className="icon-btn" onClick={onClose} aria-label="Close experience"><X/></button><div className="player-progress">{scenes.map((s,i)=><button key={s} onClick={()=>setIndex(i)} className={i===index?'active':''} aria-label={`Go to ${sceneLabels[s]}`} />)}</div><button className="icon-btn" onClick={()=>setSound(v=>!v)} aria-label={sound?'Mute sound':'Enable sound'}>{sound?<Volume2/>:<VolumeX/>}</button></div>{experience.musicUrl&&<audio ref={el=>{audioRef.current=el}} loop preload="none" /> }
    {arrowFlight && <div className="arrow-flight-physics" aria-hidden="true" style={{left:arrowFlight.x,top:arrowFlight.y,transform:`translate(-50%,-50%) rotate(${arrowFlight.rotation}deg)`}}><span/><i/></div>}
    <Particles count={8}/>
    <AnimatePresence mode="wait">
      <motion.section key={scene} className={`scene scene-${scene}`} initial={{opacity:0,y:18,scale:.985}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-12,scale:.99}} transition={{duration:.28, ease:'easeOut'}} aria-live="polite">
        {scene === 'heart' && <div className="scene-content cupid-scene">
          <p className="eyebrow">A LITTLE SOMETHING FOR YOU</p><h1>Draw back. <em>Let love fly.</em></h1>
          <div ref={targetRef} className={`cupid-target ${heartOpen?'heart-open':''}`}><span className="target-orbit orbit-one"/><span className="target-orbit orbit-two"/><Heart className="target-heart" fill="currentColor" size={88}/><span className="heart-burst" aria-hidden="true">✦　♡　✦</span></div>
          <div className={`arrow-drag-zone ${arrowLoaded?'arrow-loaded':''} ${arrowFired?'arrow-has-fired':''}`} ref={dragZoneRef}>
            <div className="bow-illustration" aria-hidden="true"><svg viewBox="0 0 80 110"><path d={`M51 7 Q${8-stringPull*.12} 55 51 103`} fill="none" stroke="#e7b5d0" strokeWidth="5" strokeLinecap="round"/><path d={`M51 7 Q${51-stringPull*.55} 55 51 103`} fill="none" stroke="#f8d9e9" strokeWidth="1.5"/><path d={`M51 7 Q${51-stringPull*.55} 55 51 103`} fill="none" stroke="#fff0f8" strokeWidth="1.5"/></svg></div>
            <div className="bow-track"><span className="track-glow"/><span className="bow-arrow-line"/></div>
            {!arrowFired && <button type="button" className="bow-drag-handle arrow-nocked" style={{left:`${Math.max(18,48-stringPull*.28)}%`,transform:'translateX(-50%)'}} onPointerDown={e=>{if(heartOpen)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);dragStartXRef.current=e.clientX;pullRef.current=stringPull;buzz(8)}} onPointerMove={e=>{if(!e.currentTarget.hasPointerCapture(e.pointerId)||heartOpen)return;const zone=dragZoneRef.current?.getBoundingClientRect();if(!zone)return;const maxPull=Math.min(130,zone.width*.34);const pull=Math.max(0,Math.min(100,((dragStartXRef.current-e.clientX)/maxPull)*100));pullRef.current=pull;setStringPull(pull)}} onPointerUp={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);const pull=pullRef.current;const rect=e.currentTarget.getBoundingClientRect();if(pull<18){pullRef.current=0;setStringPull(0);return}setArrowFired(true);buzz([18,24,35]);setStringPull(0);launchArrow(rect,pull)}} aria-label="Drag the arrow backward, then release to shoot"><svg viewBox="0 0 100 42" aria-hidden="true"><path d="M8 21 L84 21" stroke="#f7d9ec" strokeWidth="2.6" strokeLinecap="round"/><path d="M76 12 L91 21 L76 30" fill="none" stroke="#ffe5f1" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 12 L5 21 L14 30" fill="none" stroke="#e7b5d0" strokeWidth="2"/><path d="M28 14 L38 21 L28 28" fill="none" stroke="#c6a4d9" strokeWidth="1.5"/></svg></button>}
            <div className="draw-strength" aria-label={`Bow draw strength ${Math.round(stringPull)} percent`}><span style={{width:`${stringPull}%`}}/></div>
            <div className="drag-hints"><span>{arrowFired?'ARROW RELEASED':'ARROW LOADED · PULL BACK'}</span><span>{arrowFired?'WAIT FOR HEART IMPACT':'RELEASE TOWARD THE HEART'}</span></div>
          </div><p className="muted">Pull the arrow backward to bend the bow and stretch the string. Release to shoot at the heart.</p>
          {heartOpen&&<div className="birthday-split-reveal" aria-live="polite"><span className="split-panel split-left"/><span className="split-panel split-right"/><div className="split-title"><small>MADE JUST FOR YOU</small><strong>HAPPY BIRTHDAY</strong><em>{experience.recipient || "Beautiful human"}</em></div></div>}
        </div>}
        {scene === 'intro' && <div className="scene-content"><span className="scene-emoji">✦</span><p className="eyebrow">A MOMENT MADE WITH LOVE</p><h1>{experience.greeting || (experience.occasion === 'Birthday' ? `Happy Birthday, ${experience.recipient || 'you'}!` : `A little surprise for ${experience.recipient || 'you'}`)}</h1><p className="scene-copy">{experience.title}</p><button className="primary-btn" onClick={next}>Open your surprise <ArrowRight size={17}/></button></div>}
        {scene === 'cake' && <div className="scene-content"><p className="eyebrow">MAKE A WISH</p><button className={`cake-art cake-${experience.cakeStyle||'strawberry'} ${wish?'wished':''} assembling`} onClick={()=>{setWish(true);buzz([20,35,20])}} aria-label="Tap the candle to make a wish"><span className="flame">✦</span><span className="candle"></span><span className="cake-top"></span><span className="cake-layer cake-layer-one"></span><span className="cake-layer cake-layer-two"></span><span className="cake-plate"></span><span className="cake-sprinkles">✦ · ✧ · ✦</span><span className="cake-machine-label">A little cake, made just for you</span></button><h1>{wish ? 'Wish sent into the universe ✨' : 'A wish, just for you'}</h1><p className="muted">{wish ? 'May the sweetest things find you.' : 'Tap the candle and make a wish.'}</p>{wish && <button className="primary-btn" onClick={next}>Keep going <ArrowRight size={17}/></button>}</div>}
        {scene === 'balloons' && <div className="scene-content wide balloon-scene"><p className="eyebrow">LITTLE WISHES, JUST FOR YOU</p><h1>A little <em>wish tree.</em></h1><p className="muted">Pop each balloon to release a wish made just for you · {popped.length}/{experience.balloonCount||5}</p><div className="balloon-tree" aria-label={`A heart-balloon tree with ${experience.balloonCount||5} personal wish balloons`}><svg className="tree-branches" viewBox="0 0 600 340" aria-hidden="true"><path d="M300 320 C292 250 300 190 300 145 M300 230 C240 210 210 164 174 112 M300 218 C365 195 390 151 431 105 M300 180 C260 146 256 112 242 78 M304 172 C348 140 353 105 369 72 M300 264 C246 255 218 226 192 197 M300 255 C355 251 395 223 422 188" fill="none" stroke="var(--branch-color,#b88d9f)" strokeWidth="7" strokeLinecap="round"/><path d="M300 320 C292 250 300 190 300 145 M300 230 C240 210 210 164 174 112 M300 218 C365 195 390 151 431 105 M300 180 C260 146 256 112 242 78 M304 172 C348 140 353 105 369 72" fill="none" stroke="#f5d5e4" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round"/></svg><div className="tree-canopy-balloons" aria-hidden="true">{Array.from({length:24},(_,i)=><i key={i} className={`canopy-balloon canopy-balloon-${i%6}`} style={{left:`${9+(i*37)%82}%`,top:`${3+(i*23)%58}%`,animationDelay:`-${(i%8)*.45}s`}}/>)}</div><div className="tree-heart-canopy">♡</div><div className="tree-trunk"/><div className="tree-roots"/><div className="tree-balloon-field">{Array.from({length:Math.max(3,Math.min(10,experience.balloonCount||5))},(_,i)=><button key={i} style={{left:`${8+(i*19)%84}%`,top:`${58+(i%3)*28}px`,animationDelay:`-${(i%6)*.3}s`}} className={`wish-balloon wish-balloon-${(i%5)+1} ${popped.includes(i)?'burst':''}`} onClick={()=>{if(!popped.includes(i)){setPopped(p=>[...p,i]);buzz([24,30,12]);if(popStopRef.current)window.clearTimeout(popStopRef.current);if(popAudioRef.current){popAudioRef.current.pause();popAudioRef.current.currentTime=0}else{popAudioRef.current=new Audio('/media/effects/balloon-pop.mp3')}const pop=popAudioRef.current;pop.volume=.72;void pop.play().catch(()=>{try{const Ctx=window.AudioContext||(window as typeof window & {webkitAudioContext?:typeof AudioContext}).webkitAudioContext;if(!Ctx)return;const ctx=new Ctx();void ctx.resume();const duration=.16;const buffer=ctx.createBuffer(1,Math.floor(ctx.sampleRate*duration),ctx.sampleRate);const data=buffer.getChannelData(0);for(let n=0;n<data.length;n++)data[n]=(Math.random()*2-1)*Math.pow(1-n/data.length,2);const noise=ctx.createBufferSource();noise.buffer=buffer;const filter=ctx.createBiquadFilter();filter.type='lowpass';filter.frequency.value=950;const gain=ctx.createGain();gain.gain.setValueAtTime(.5,ctx.currentTime);gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);noise.connect(filter);filter.connect(gain);gain.connect(ctx.destination);noise.start();noise.stop(ctx.currentTime+duration);window.setTimeout(()=>void ctx.close(),250)}catch{}});popStopRef.current=window.setTimeout(()=>{pop.pause();pop.currentTime=0},2000)}}} aria-label={`Pop wish balloon ${i+1}`} disabled={popped.includes(i)}><span className="balloon-knot"/><span className="balloon-glint"/><b>{['♡','✦','01','♡','✧'][i]}</b></button>)}</div>{popped.map(i=><motion.div key={`wish-${i}`} className={`wish-reveal-card wish-reveal-card-${(i%5)+1}`} initial={{opacity:0,scale:.65,y:12}} animate={{opacity:1,scale:1,y:0}} transition={{type:'spring',stiffness:230,damping:17}}><span>WISH {String(i+1).padStart(2,'0')}</span><p>{(experience.balloonWishes?.[i]||['You make ordinary days brighter.','You are loved more than you know.','Keep being wonderfully you.','Beautiful things are coming your way.','More memories, more laughter, always.'][i])}</p></motion.div>)}<div className="tree-base-heart">♥</div></div>{popped.length>=(experience.balloonCount||5)&&<motion.div initial={{opacity:0,y:18}} animate={{opacity:1,y:0}} className="all-wishes-note"><span>♡</span><strong>Every wish, just for you.</strong><p>Keep these little reminders close, today and always.</p><button className="primary-btn" onClick={next}>Open your letter <ArrowRight size={17}/></button></motion.div>}</div>}
        {scene === 'letter' && <div className={`scene-content letter-interaction ${envelopeOpened?'envelope-is-open':''} ${letterPulled?'letter-is-pulled':''}`}>
          {!letterRevealReady && <div className="envelope-stage"><p className="eyebrow">A LITTLE LETTER, SEALED WITH LOVE</p><div className="envelope-wrap" aria-label="Interactive envelope">
            <div className="envelope"><motion.div className="envelope-letter" initial={false} animate={letterPulled?{y:-150,scale:1.04,rotateZ:-1.5}:{y:0,scale:1}} transition={{type:"spring",stiffness:90,damping:17}}><span>♡</span><small>JUST FOR YOU</small></motion.div><div className="envelope-pocket"/><button className="envelope-flap" type="button" aria-label={envelopeOpened?'Envelope flap opened':'Drag the envelope flap upward to open'} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);flapStartYRef.current=e.clientY}} onPointerUp={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);if(flapStartYRef.current-e.clientY>14){setEnvelopeOpened(true);buzz(16)}}} onClick={()=>setEnvelopeOpened(true)}>{!envelopeOpened&&<span>DRAG UP TO OPEN</span>}</button></div>
          </div>{envelopeOpened&&<button className="primary-btn pull-letter-btn" onPointerDown={e=>{letterStartYRef.current=e.clientY}} onPointerUp={e=>{if(letterStartYRef.current-e.clientY>10)pullLetter()}} onClick={pullLetter}>Pull out your letter <ArrowRight size={17}/></button>}</div>}
          {letterRevealReady && <><motion.div className="letter-card" initial={{opacity:0,y:55,rotateX:-8}} animate={{opacity:1,y:0,rotateX:0}} transition={{duration:.85,ease:[.2,.8,.2,1]}}><span className="letter-flower">✿</span><p className="eyebrow">A LETTER FOR {experience.recipient || 'YOU'}</p><h2>{experience.greeting || `Dear ${experience.recipient || 'you'},`}</h2><p className="letter-message">{letterText.slice(0, typedLength)}{typedLength < letterText.length && <span className="type-caret">▍</span>}</p><p className="letter-closing">{experience.closing || 'With love,'}<br/><strong>{experience.sender || 'Someone who cares'}</strong></p></motion.div><button className="secondary-btn" onClick={next}>Continue <ArrowRight size={17}/></button></>}
        </div>}
        {scene === 'cat-video' && <div className="scene-content wide cat-video-scene"><p className="eyebrow">A LITTLE MEOW FOR YOU</p><h1>One tiny <em>birthday surprise.</em></h1><motion.div className={`cat-video-card ${videoDoorOpen?'video-card-lifting':''}`} initial={{opacity:0,y:70,scale:.86,rotateX:12}} animate={videoDoorOpen?{opacity:0,y:-180,scale:.72,rotateZ:-4}:{opacity:1,y:0,scale:1,rotateX:0}} transition={{duration:videoDoorOpen ? .9 : .8,ease:[.2,.8,.2,1]}} onAnimationComplete={()=>{if(!videoDoorOpen)setVideoReady(true)}}><div className="video-balloon balloon-a">♡</div><div className="video-balloon balloon-b">✦</div><div className="video-hanging-tag"><span>FOR YOU</span><strong>♡</strong></div><video ref={videoRef} className="letter-birthday-video" src={experience.birthdayVideoUrl || '/media/birthday-videos/birthday-cat.mp4'} playsInline preload="metadata" controls={false} onEnded={()=>{if(audioRef.current){musicTimeRef.current=audioRef.current.currentTime;audioRef.current.pause()}setVideoReady(false);setVideoDoorOpen(true);window.setTimeout(()=>{if(audioRef.current&&musicWasPlayingRef.current){audioRef.current.currentTime=musicTimeRef.current;void audioRef.current.play().catch(()=>setSound(false))}next()},1100)}} />{!videoReady&&<div className="video-loading">Preparing your little surprise…</div>}</motion.div><p className="muted">A tiny guest came to wish you the happiest birthday.</p><button className="secondary-btn" onClick={()=>{if(videoRef.current)videoRef.current.pause();if(audioRef.current){musicTimeRef.current=audioRef.current.currentTime;audioRef.current.pause();if(sound){audioRef.current.currentTime=musicTimeRef.current;void audioRef.current.play().catch(()=>{})}}next()}}>Skip video <ArrowRight size={17}/></button></div>}
        {scene === 'memories' && <div className="scene-content wide"><p className="eyebrow">OUR LITTLE TIME CAPSULE</p><h1>Little moments, <em>big feelings.</em></h1>{experience.memories.length ? <div className="memory-stage"><button className="memory-nav" onClick={()=>setMemoryIndex(i=>(i-1+experience.memories.length)%experience.memories.length)} aria-label="Previous memory"><ArrowLeft/></button><div className="memory-frame">{experience.memories[memoryIndex].kind==='video'?<video src={experience.memories[memoryIndex].src} controls playsInline preload="metadata"/>:<img src={experience.memories[memoryIndex].src} alt={experience.memories[memoryIndex].caption || 'Shared memory'}/>}<div className="memory-caption"><strong>{experience.memories[memoryIndex].caption || 'A moment to keep'}</strong>{experience.memories[memoryIndex].date && <small>{experience.memories[memoryIndex].date}</small>}</div></div><button className="memory-nav" onClick={()=>setMemoryIndex(i=>(i+1)%experience.memories.length)} aria-label="Next memory"><ArrowRight/></button></div>:<div className="empty-memory"><span>♡</span><p>Some memories are kept in the heart.</p><small>Add photos or videos in the creator to make this part yours.</small></div>}<button className="primary-btn" onClick={next}>One last thing <ArrowRight size={17}/></button></div>}
        {scene === 'finale' && <div className="scene-content finale-content" onPointerDown={triggerCelebration} role="application" aria-label="Touch anywhere to launch a celebration"><div className="touch-celebration-hint">TAP ANYWHERE FOR FIREWORKS ✦</div>{celebrationBursts.map(b=><div key={b.id} className={`touch-burst touch-burst-${b.kind}`} style={{left:`${b.x}%`,top:`${b.y}%`}} aria-hidden="true"><i/><i/><i/><i/><i/><i/><i/><i/><b>{b.kind===0?"✦":b.kind===1?"✿":b.kind===2?"✧":"❀"}</b></div>)}<div className="confetti" aria-hidden="true">{confetti.map(i=><i key={i} style={{left:`${(i*29)%100}%`,animationDelay:`${(i%9)*.14}s`,transform:`rotate(${i*17}deg)`}}/>)}</div><div className="final-fireworks" aria-hidden="true"><i/><i/><i/></div><Sparkles className="final-spark" size={38}/><p className="eyebrow">A LIFETIME OF LITTLE MOMENTS</p><div className="final-scrapbook-strip">{experience.memories.slice(0,4).map((m,i)=>m.kind==='image'?<img key={m.id} src={m.src} alt={m.caption||'A cherished memory'} style={{transform:`rotate(${[-7,5,-3,8][i]}deg)`}}/>:<span key={m.id}>♡</span>)}</div><h1>{experience.occasion === 'Birthday' ? 'HAPPY BIRTHDAY' : experience.title.toUpperCase()}</h1><h2>{experience.recipient || 'Beautiful human'} <span>♡</span></h2><p className="scene-copy">{experience.message || 'May life keep surprising you with beautiful reasons to smile.'}</p><div className={`bouquet-reveal ${bouquetOpen?'opened':''}`}><button className={`bouquet-button bouquet-button-${experience.bouquetStyle||'roses'}`} onClick={()=>{setBouquetOpen(true);buzz([15,25,15])}} aria-label="Reveal your flower bouquet"><BouquetArtwork style={experience.bouquetStyle||'roses'} opened={bouquetOpen} label={`${bouquetStyles.find(b=>b.id===experience.bouquetStyle)?.title || 'Flower'} bouquet`} /><small>{bouquetOpen?`${bouquetStyles.find(b=>b.id===experience.bouquetStyle)?.title || 'A little bouquet'} — picked just for you ♡`:'Tap to unwrap your flowers'}</small></button></div><div className="final-actions"><button className="primary-btn" onClick={()=>{setIndex(0);setPopped([]);setWish(false);setHeartOpen(false);setArrowFired(false);setArrowLoaded(true);setStringPull(0);pullRef.current=0;setEnvelopeOpened(false);setLetterPulled(false);setLetterRevealReady(false);setTypedLength(0);setBouquetOpen(false);setCelebrationBursts([]);setArrowFlight(null)}}><RotateCcw size={16}/> Replay</button><button className="secondary-btn" onClick={share}><Share2 size={16}/> Share</button></div></div>}
      </motion.section>
    </AnimatePresence>
    <div className="player-bottom"><button className="text-btn" onClick={previous} disabled={index===0}><ArrowLeft size={16}/> Back</button><span>{index+1} / {scenes.length} · {sceneLabels[scene]}</span>{index < scenes.length-1 ? <button className="text-btn" onClick={next}>Next <ArrowRight size={16}/></button> : <button className="text-btn" onClick={onClose}>Finish <Heart size={16}/></button>}</div>
    <button className="haptics-toggle" onClick={()=>{const next=!hapticsOn;setHapticsOn(next);try{localStorage.setItem('lovora-haptics',next?'on':'off')}catch{}}} title="Toggle optional vibration">Haptics: {hapticsOn?'on':'off'}</button>
  </div>
}
