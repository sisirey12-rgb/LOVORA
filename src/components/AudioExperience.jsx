import React from 'react'
import { useEffect, useRef, useState } from 'react'
import { Music2, Volume2, VolumeX, Vibrate, Sparkles, Play, Pause } from 'lucide-react'

export default function AudioExperience({ catalogue, compact = false }) {
  const [track, setTrack] = useState(null)
  const [playing, setPlaying] = useState(false)
  const [musicOn, setMusicOn] = useState(catalogue.settings.musicEnabled)
  const [effectsOn, setEffectsOn] = useState(catalogue.settings.effectsEnabled)
  const [vibrationOn, setVibrationOn] = useState(catalogue.settings.vibrationEnabled)
  const [volume, setVolume] = useState(0.45)
  const audioRef = useRef(null)
  const effectRef = useRef(null)
  const musicTracks = catalogue.tracks.filter(t => t.kind === 'music')
  const effects = catalogue.tracks.filter(t => t.kind === 'effect')

  useEffect(() => { if (audioRef.current) audioRef.current.volume = volume }, [volume])
  useEffect(() => {
    if (!audioRef.current) return
    if (!musicOn || !track) { audioRef.current.pause(); setPlaying(false); return }
    if (playing) audioRef.current.play().catch(() => setPlaying(false))
    else audioRef.current.pause()
  }, [musicOn, track, playing])

  function haptic(pattern = 18) {
    if (vibrationOn && 'vibrate' in navigator) navigator.vibrate(pattern)
  }
  function playEffect(effect) {
    if (!effectsOn || !effect?.url) return
    if (effectRef.current) { effectRef.current.pause(); effectRef.current.src = effect.url; effectRef.current.currentTime = 0; effectRef.current.volume = Math.min(volume + 0.2, 1); effectRef.current.play().catch(() => {}) }
    haptic(12)
  }
  function startExperience() {
    haptic([15, 35, 15])
    if (track && musicOn) setPlaying(true)
    else if (musicTracks[0] && musicOn) { setTrack(musicTracks[0]); setPlaying(true) }
  }

  return <section className={`audio-panel ${compact ? 'compact' : ''}`}>
    <div className="panel-heading"><span className="icon-orb"><Music2 size={18}/></span><div><p className="eyebrow">IMMERSIVE CONTROLS</p><h3>Sound & feeling</h3></div></div>
    <label className="field-label" htmlFor="music-track">Background music</label>
    <select id="music-track" value={track?.id || ''} onChange={e => { const next = musicTracks.find(t => t.id === e.target.value); setTrack(next || null); setPlaying(false) }}>
      <option value="">Choose music from library</option>{musicTracks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
    </select>
    <div className="audio-actions">
      <button className="button button-primary small" onClick={() => { if (!track && musicTracks[0]) setTrack(musicTracks[0]); if (!track && musicTracks.length) setPlaying(true); else setPlaying(!playing); haptic(10) }} disabled={!musicTracks.length}>
        {playing ? <Pause size={15}/> : <Play size={15}/>} {playing ? 'Pause' : 'Play preview'}
      </button>
      <button className="icon-button" aria-label={musicOn ? 'Mute music' : 'Enable music'} onClick={() => setMusicOn(!musicOn)}>{musicOn ? <Volume2/> : <VolumeX/>}</button>
    </div>
    <label className="field-label" htmlFor="volume">Volume <span>{Math.round(volume * 100)}%</span></label>
    <input id="volume" type="range" min="0" max="1" step=".05" value={volume} onChange={e => setVolume(Number(e.target.value))}/>
    <label className="field-label" htmlFor="effect-track">Try a sound effect</label>
    <select id="effect-track" defaultValue="" onChange={e => { playEffect(effects.find(t => t.id === e.target.value)); e.target.value = '' }}>
      <option value="">Choose an effect</option>{effects.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
    </select>
    <div className="toggle-row"><span><Sparkles size={17}/> Sound effects</span><button className={`switch ${effectsOn ? 'on' : ''}`} aria-pressed={effectsOn} onClick={() => setEffectsOn(!effectsOn)}><i/></button></div>
    <div className="toggle-row"><span><Vibrate size={17}/> Vibration (supported phones)</span><button className={`switch ${vibrationOn ? 'on' : ''}`} aria-pressed={vibrationOn} onClick={() => setVibrationOn(!vibrationOn)}><i/></button></div>
    <button className="button button-ghost full" onClick={startExperience}>✨ Test immersive interaction</button>
    <audio ref={audioRef} src={track?.url || undefined} loop preload="none" onEnded={() => setPlaying(false)}/>
    <audio ref={effectRef} preload="none"/>
    {!musicTracks.length && <p className="hint">Audio library is empty. Add tracks in the Audio Admin after configuring Supabase.</p>}
  </section>
}
