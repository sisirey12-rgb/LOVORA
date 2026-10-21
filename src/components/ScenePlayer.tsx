import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Heart, Volume2, VolumeX, RotateCcw, Share2, Sparkles, X } from 'lucide-react'
import type { Experience, SceneId } from '../types'
import { sceneLabels, bouquetStyles, themePalettes, normalizeScenes } from '../data'
import { audio } from '../lib/audioManager'
import Particles from './Particles'
import BouquetArtwork from './BouquetArtwork'
import BowScene from './scenes/BowScene'
import CakeAssembly from './scenes/CakeAssembly'
import BalloonTree from './scenes/BalloonTree'
import EnvelopeLetter from './scenes/EnvelopeLetter'
import CatVideoScene from './scenes/CatVideoScene'

type Props = { experience: Experience; onClose: () => void; preview?: boolean }
const known = Object.keys(sceneLabels) as SceneId[]
const defaultWishes = ['You make ordinary days brighter.', 'You are loved more than you know.', 'Keep being wonderfully you.', 'Beautiful things are coming your way.', 'More memories, more laughter, always.']
const hapticsAllowed = () => { try { return localStorage.getItem('lovora-haptics') !== 'off' } catch { return true } }

export default function ScenePlayer({ experience, onClose, preview = false }: Props) {
  const scenes = useMemo(() => { const s = normalizeScenes(experience.scenes, experience.v).filter(x => known.includes(x)); return s.length ? s : (['heart'] as SceneId[]) }, [experience.scenes, experience.v])
  const [index, setIndex] = useState(0)
  const [popped, setPopped] = useState<number[]>([])
  const [wish, setWish] = useState(false)
  const [heartOpen, setHeartOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [hapticsOn, setHapticsOn] = useState(hapticsAllowed)
  const [memoryIndex, setMemoryIndex] = useState(0)
  const [bouquetOpen, setBouquetOpen] = useState(false)
  const [now, setNow] = useState(() => Date.now())
  const scene = scenes[Math.min(index, scenes.length - 1)]
  const palette = themePalettes[experience.theme] || themePalettes['Rose Romance']
  const unlockAt = experience.targetDate ? new Date(`${experience.targetDate}T00:00:00`).getTime() : 0
  const locked = Boolean(!preview && experience.published && unlockAt && now < unlockAt)
  const countdown = Math.max(0, unlockAt - now)
  const balloonCount = Math.max(3, Math.min(10, experience.balloonCount || 5))
  const letterText = experience.message || 'Some people make the world feel a little softer just by being in it. You are one of those people. I hope this little surprise reminds you how loved and appreciated you are.'
  const lenRef = useRef(scenes.length); lenRef.current = scenes.length
  const hitTimer = useRef(0)

  // Stable helpers: scene components keep long-running timelines, so these must not change between renders.
  const next = useCallback(() => setIndex(i => Math.min(i + 1, lenRef.current - 1)), [])
  const previous = useCallback(() => setIndex(i => Math.max(i - 1, 0)), [])
  const buzz = useCallback((pattern: number | number[]) => { try { if (navigator.vibrate && hapticsAllowed()) navigator.vibrate(pattern) } catch { /* unsupported */ } }, [])
  const unlockAudio = useCallback(() => audio.unlock(), [])

  // countdown ticks only while the lock screen is visible (no per-second re-render of the animated scenes)
  useEffect(() => { if (!locked) return; const t = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(t) }, [locked])
  // audio: unlock on first interaction, tidy up when the player closes
  useEffect(() => { audio.armGestureUnlock(); return () => { window.clearTimeout(hitTimer.current); audio.reset(); try { navigator.vibrate?.(0) } catch { /* ignore */ } } }, [])
  useEffect(() => { audio.setPopBlocked(scene === 'letter'); if (scene !== 'balloons') audio.stopPop() }, [scene])
  useEffect(() => { audio.setMusicEnabled(soundOn) }, [soundOn])
  // the soundtrack starts at the arrow hit; if the heart scene is skipped or absent it starts as soon as the story moves on (never during the cat video)
  useEffect(() => { if (scene !== 'heart' && scene !== 'video') audio.startMusic() }, [scene])

  const onHit = useCallback(() => {
    setHeartOpen(true)
    audio.startMusic()                      // synchronised with the split-screen birthday reveal
    buzz([35, 45, 80])
    window.clearTimeout(hitTimer.current)
    hitTimer.current = window.setTimeout(next, 3200)
  }, [buzz, next])
  const onWish = useCallback(() => { setWish(true); buzz([20, 35, 20]) }, [buzz])
  const onPop = useCallback((i: number) => { setPopped(p => (p.includes(i) ? p : [...p, i])); buzz([24, 30, 12]); audio.playPop() }, [buzz])
  const share = async () => {
    const url = experience.published ? `${window.location.origin}/s/${experience.id}` : window.location.href
    try { if (navigator.share) await navigator.share({ title: experience.title, text: `A little surprise for ${experience.recipient}`, url }); else await navigator.clipboard.writeText(url) } catch { /* user cancelled */ }
  }
  const replay = () => { window.clearTimeout(hitTimer.current); setIndex(0); setPopped([]); setWish(false); setHeartOpen(false); setBouquetOpen(false); setMemoryIndex(0) }
  const themeClass = `theme-${experience.theme.toLowerCase().replaceAll(' ', '-')}`
  const confetti = useMemo(() => Array.from({ length: 36 }, (_, i) => i), [])
  const greeting = experience.greeting || `Dear ${experience.recipient || 'you'},`
  const bouquetTitle = bouquetStyles.find(b => b.id === experience.bouquetStyle)?.title

  if (locked) return <div className={`player ${themeClass} countdown-lock`} role="dialog" aria-modal="true" aria-label="Surprise countdown"><div className="countdown-lock-card"><span className="scene-emoji">♡</span><p className="eyebrow">A LITTLE WORLD IS WAITING</p><h1>Something lovely is<br /><em>almost here.</em></h1><p>{experience.openingInstruction || 'Your surprise is waiting for the right moment.'}</p><div className="countdown-clock">{[{ label: 'DAYS', value: Math.floor(countdown / 86400000) }, { label: 'HOURS', value: Math.floor(countdown / 3600000) % 24 }, { label: 'MINUTES', value: Math.floor(countdown / 60000) % 60 }, { label: 'SECONDS', value: Math.floor(countdown / 1000) % 60 }].map(part => <div key={part.label}><strong>{String(part.value).padStart(2, '0')}</strong><small>{part.label}</small></div>)}</div><small className="countdown-note">Unlocks at midnight on {experience.targetDate} · local device time</small><button className="secondary-btn" onClick={onClose}>Back</button></div></div>

  return <div className={`player ${themeClass}`} role="dialog" aria-modal="true" aria-label="Interactive surprise">
    <div className="player-top">
      <button className="icon-btn" onClick={onClose} aria-label="Close experience"><X /></button>
      <div className="player-progress">{scenes.map((s, i) => <button key={s} onClick={() => setIndex(i)} className={i === index ? 'active' : ''} aria-label={`Go to ${sceneLabels[s]}`} />)}</div>
      <button className="icon-btn" onClick={() => { audio.unlock(); setSoundOn(v => !v) }} aria-label={soundOn ? 'Mute sound' : 'Turn sound on'}>{soundOn ? <Volume2 /> : <VolumeX />}</button>
    </div>
    <Particles count={8} />
    <AnimatePresence mode="wait">
      <motion.section key={scene} className={`scene scene-${scene}`} initial={{ opacity: 0, y: 18, scale: .985 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: .99 }} transition={{ duration: .28, ease: 'easeOut' }} aria-live="polite">
        {scene === 'heart' && <div className="scene-content cupid-scene">
          <p className="eyebrow">A LITTLE SOMETHING FOR YOU</p><h1>Draw back. <em>Let love fly.</em></h1>
          <BowScene onHit={onHit} buzz={buzz} onGesture={unlockAudio} />
          {heartOpen && <div className="birthday-split-reveal" aria-live="polite"><span className="split-panel split-left" /><span className="split-panel split-right" /><div className="split-title"><small>MADE JUST FOR YOU</small><strong>{experience.occasion === 'Birthday' ? 'HAPPY BIRTHDAY' : experience.occasion.toUpperCase()}</strong><em>{experience.recipient || 'Beautiful human'}</em></div></div>}
        </div>}

        {scene === 'intro' && <div className="scene-content"><span className="scene-emoji">✦</span><p className="eyebrow">A MOMENT MADE WITH LOVE</p><h1>{experience.greeting || (experience.occasion === 'Birthday' ? `Happy Birthday, ${experience.recipient || 'you'}!` : `A little surprise for ${experience.recipient || 'you'}`)}</h1><p className="scene-copy">{experience.title}</p><button className="primary-btn" onClick={next}>Open your surprise <ArrowRight size={17} /></button></div>}

        {scene === 'cake' && <div className="scene-content"><p className="eyebrow">MAKE A WISH</p>
          <CakeAssembly style={experience.cakeStyle || 'strawberry'} wished={wish} onWish={onWish} buzz={buzz} />
          <h1>{wish ? 'Wish sent into the universe ✨' : 'A wish, just for you'}</h1><p className="muted">{wish ? 'May the sweetest things find you.' : 'When the candle is lit, tap it and make a wish.'}</p>
          {wish && <button className="primary-btn" onClick={next}>Keep going <ArrowRight size={17} /></button>}</div>}

        {scene === 'balloons' && <div className="scene-content wide balloon-scene"><p className="eyebrow">LITTLE WISHES, JUST FOR YOU</p><h1>A little <em>wish tree.</em></h1>
          <p className="muted">Pop each heart balloon to release a wish · {popped.length}/{balloonCount}</p>
          <BalloonTree palette={palette} count={balloonCount} popped={popped} onPop={onPop} />
          {popped.length > 0 && <div className="wish-stack">{popped.map((i, k) => <motion.div key={i} className={`wish-card ${k === popped.length - 1 ? 'latest' : ''}`} initial={{ opacity: 0, scale: .7, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ type: 'spring', stiffness: 230, damping: 17 }}><span>WISH {String(i + 1).padStart(2, '0')}</span><p>{experience.balloonWishes?.[i] || defaultWishes[i % defaultWishes.length]}</p></motion.div>)}</div>}
          {popped.length >= balloonCount && <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="all-wishes-note"><span>♡</span><strong>Every wish, just for you.</strong><p>Keep these little reminders close, today and always.</p><button className="primary-btn" onClick={next}>Open your letter <ArrowRight size={17} /></button></motion.div>}
        </div>}

        {scene === 'letter' && <div className="scene-content"><EnvelopeLetter recipient={experience.recipient} greeting={greeting} text={letterText} closing={experience.closing} sender={experience.sender} buzz={buzz} onDone={next} /></div>}

        {scene === 'video' && <div className="scene-content wide"><CatVideoScene palette={palette.balloons} onDone={next} buzz={buzz} /></div>}

        {scene === 'memories' && <div className="scene-content wide"><p className="eyebrow">OUR LITTLE TIME CAPSULE</p><h1>Little moments, <em>big feelings.</em></h1>{experience.memories.length ? <div className="memory-stage"><button className="memory-nav" onClick={() => setMemoryIndex(i => (i - 1 + experience.memories.length) % experience.memories.length)} aria-label="Previous memory"><ArrowLeft /></button><div className="memory-frame">{experience.memories[memoryIndex].kind === 'video' ? <video src={experience.memories[memoryIndex].src} controls playsInline preload="metadata" /> : <img src={experience.memories[memoryIndex].src} alt={experience.memories[memoryIndex].caption || 'Shared memory'} />}<div className="memory-caption"><strong>{experience.memories[memoryIndex].caption || 'A moment to keep'}</strong>{experience.memories[memoryIndex].date && <small>{experience.memories[memoryIndex].date}</small>}</div></div><button className="memory-nav" onClick={() => setMemoryIndex(i => (i + 1) % experience.memories.length)} aria-label="Next memory"><ArrowRight /></button></div> : <div className="empty-memory"><span>♡</span><p>Some memories are kept in the heart.</p><small>Add photos or videos in the creator to make this part yours.</small></div>}<button className="primary-btn" onClick={next}>One last thing <ArrowRight size={17} /></button></div>}

        {scene === 'finale' && <div className="scene-content finale-content"><div className="confetti" aria-hidden="true">{confetti.map(i => <i key={i} style={{ left: `${(i * 29) % 100}%`, animationDelay: `${(i % 9) * .14}s`, transform: `rotate(${i * 17}deg)` }} />)}</div><div className="final-fireworks" aria-hidden="true"><i /><i /><i /></div><Sparkles className="final-spark" size={38} /><p className="eyebrow">A LIFETIME OF LITTLE MOMENTS</p><div className="final-scrapbook-strip">{experience.memories.slice(0, 4).map((m, i) => m.kind === 'image' ? <img key={m.id} src={m.src} alt={m.caption || 'A cherished memory'} style={{ transform: `rotate(${[-7, 5, -3, 8][i]}deg)` }} /> : <span key={m.id}>♡</span>)}</div><h1>{experience.occasion === 'Birthday' ? 'HAPPY BIRTHDAY' : experience.title.toUpperCase()}</h1><h2>{experience.recipient || 'Beautiful human'} <span>♡</span></h2><p className="scene-copy">{experience.message || 'May life keep surprising you with beautiful reasons to smile.'}</p>
          <div className={`bouquet-reveal ${bouquetOpen ? 'opened' : ''}`}><button className={`bouquet-button bouquet-button-${experience.bouquetStyle || 'roses'}`} onClick={() => { setBouquetOpen(true); buzz([15, 25, 15]) }} aria-label="Reveal your flower bouquet"><BouquetArtwork style={experience.bouquetStyle || 'roses'} opened={bouquetOpen} label={`${bouquetTitle || 'Flower'} bouquet`} /><small>{bouquetOpen ? `${bouquetTitle || 'A little bouquet'} — picked just for you ♡` : 'Tap to unwrap your flowers'}</small></button></div>
          <div className="final-actions"><button className="primary-btn" onClick={replay}><RotateCcw size={16} /> Replay</button><button className="secondary-btn" onClick={share}><Share2 size={16} /> Share</button></div></div>}
      </motion.section>
    </AnimatePresence>
    <div className="player-bottom"><button className="text-btn" onClick={previous} disabled={index === 0}><ArrowLeft size={16} /> Back</button><span>{index + 1} / {scenes.length} · {sceneLabels[scene]}</span>{index < scenes.length - 1 ? <button className="text-btn" onClick={next}>Next <ArrowRight size={16} /></button> : <button className="text-btn" onClick={onClose}>Finish <Heart size={16} /></button>}</div>
    <button className="haptics-toggle" onClick={() => { const v = !hapticsOn; setHapticsOn(v); try { localStorage.setItem('lovora-haptics', v ? 'on' : 'off') } catch { /* ignore */ } }} title="Toggle optional vibration">Haptics: {hapticsOn ? 'on' : 'off'}</button>
  </div>
}
