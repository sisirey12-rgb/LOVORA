import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, ArrowUpRight, Cat, Check, ChevronDown, CirclePlay, Clock3, Copy, Heart, Menu, Moon, Plus, Sparkles, Sun, WandSparkles, X } from 'lucide-react'
import Brand from './components/Brand'
import Particles from './components/Particles'
import Editor from './components/Editor'
import ScenePlayer from './components/ScenePlayer'
import type { Experience } from './types'
import { storage } from './services/storage'
import { supabase } from './services/supabase/client'
import { useAuth } from './services/auth'
import AuthModal from './components/AuthModal'
import { LogOut, UserRound } from 'lucide-react'

type Page = 'home' | 'dashboard' | 'editor'
const cards = [
  {emoji:'🎂',title:'Birthday magic',desc:'A wish that unfolds one little surprise at a time.',tone:'card-pink'},
  {emoji:'💞',title:'Anniversary story',desc:'Celebrate the moments that made you, you.',tone:'card-violet'},
  {emoji:'🫶',title:'Friendship scrapbook',desc:'Inside jokes, favourite memories, forever people.',tone:'card-peach'},
  {emoji:'💌',title:'A love letter',desc:'The words you mean, wrapped in a world of their own.',tone:'card-blue'},
  {emoji:'✨',title:'Just because',desc:'No occasion needed to make someone feel special.',tone:'card-gold'},
  {emoji:'📸',title:'Memory collection',desc:'Turn your favourite moments into a tiny time capsule.',tone:'card-lilac'},
]
declare global { interface Window { __lovoraAfterAuth?: () => void } }
export default function App() {
  const [page,setPage] = useState<Page>('home')
  const [dark,setDark] = useState(()=>localStorage.getItem('lovora-theme')!=='light')
  const [menu,setMenu] = useState(false)
  const [drafts,setDrafts] = useState<Experience[]>([])
  const [editing,setEditing] = useState<Experience|undefined>()
  const [player,setPlayer] = useState<Experience|undefined>()
  const [playerIsPreview,setPlayerIsPreview] = useState(false)
  const { user, signOut, recovering, dismissRecovery, loading: authLoading } = useAuth()
  const [authOpen,setAuthOpen] = useState(false)
  const [pendingCreate,setPendingCreate] = useState(false)
  const [toast,setToast] = useState('')
  const [remoteMessage,setRemoteMessage] = useState('')
  useEffect(()=>{document.documentElement.dataset.theme=dark?'dark':'light';localStorage.setItem('lovora-theme',dark?'dark':'light')},[dark])
  useEffect(()=>{refresh();const path=window.location.pathname;const id=path.match(/^\/s\/([^/]+)/)?.[1];if(id){const local=storage.getLocal(decodeURIComponent(id));if(local?.published){setPlayer(local);return} if(supabase){storage.getPublic(decodeURIComponent(id)).then(x=>x?setPlayer(x):setRemoteMessage('This experience is unavailable or has not been published.'))}else setRemoteMessage('This is not a published public experience. Ask the creator to configure cloud sharing.')}},[])
  const refresh=()=>setDrafts(storage.list())
  // Email sign-in comes first: creating or editing needs an account, so drafts and links follow the person across devices.
  const gate=(go:()=>void)=>{ if(user){go();return} setPendingCreate(true);setAuthOpen(true);window.__lovoraAfterAuth=go }
  const newExperience=()=>gate(()=>{setEditing(undefined);setPage('editor');window.history.pushState({},'', '/create')})
  const editExperience=(x:Experience)=>gate(()=>{setEditing(x);setPage('editor');window.history.pushState({},'', '/create')})
  useEffect(()=>{ if(user&&pendingCreate){ setPendingCreate(false);setAuthOpen(false);const go=window.__lovoraAfterAuth;window.__lovoraAfterAuth=undefined;go?.() } },[user,pendingCreate])
  useEffect(()=>{ if(recovering) setAuthOpen(true) },[recovering])
  const exitEditor=()=>{setPage('home');setEditing(undefined);window.history.pushState({},'','/')}
  const onSaved=()=>{refresh();setToast('Saved on this device');window.setTimeout(()=>setToast(''),2200)}
  const copyLink=async(x:Experience)=>{const url=`${window.location.origin}/s/${x.id}`;try{await navigator.clipboard.writeText(url);setToast('Link copied — local-only drafts will not open on another device.')}catch{setToast(url)}window.setTimeout(()=>setToast(''),3500)}
  const remove=(x:Experience)=>{if(confirm(`Delete “${x.title}” from this device?`)){storage.removeLocal(x.id);refresh()}}
  const duplicate=(x:Experience)=>{storage.duplicate(x);refresh();setToast('Draft duplicated');window.setTimeout(()=>setToast(''),2200)}
  const explore=()=>document.getElementById('experiences')?.scrollIntoView({behavior:'smooth'})
  if(player) return <ScenePlayer experience={player} preview={playerIsPreview} onClose={()=>{setPlayer(undefined);setPlayerIsPreview(false);setRemoteMessage('');window.history.pushState({},'','/')}}/>
  return <div className="app-shell">
    <header className="site-nav"><Brand/><nav className={menu?'nav-open':''}><button onClick={()=>{setPage('home');setMenu(false);window.history.pushState({},'','/')}}>Discover</button><button onClick={()=>{setPage('dashboard');setMenu(false);refresh();window.history.pushState({},'','/dashboard')}}>My creations</button><a href="#how-it-works" onClick={()=>setMenu(false)}>How it works</a></nav><div className="nav-actions"><button className="theme-toggle" onClick={()=>setDark(v=>!v)} aria-label="Toggle theme">{dark?<Sun size={17}/>:<Moon size={17}/>}</button>{user?<button className="ghost-btn nav-user" onClick={()=>signOut().then(()=>setToast('Signed out')).catch(()=>{})} title={`Signed in as ${user.email}. Tap to sign out`}><UserRound size={15}/><span>{user.email?.split('@')[0]}</span><LogOut size={14}/></button>:!authLoading&&<button className="ghost-btn nav-user" onClick={()=>{setPendingCreate(false);setAuthOpen(true)}}><UserRound size={15}/> Sign in</button>}<button className="primary-btn nav-create" onClick={newExperience}><Plus size={16}/> Create yours</button><button className="menu-toggle" onClick={()=>setMenu(v=>!v)} aria-label="Toggle menu">{menu?<X/>:<Menu/>}</button></div></header>
    {remoteMessage && <div className="route-message"><span>{remoteMessage}</span><button onClick={()=>setRemoteMessage('')} aria-label="Dismiss"><X size={15}/></button></div>}
    {page==='editor'?<Editor initial={editing} onExit={exitEditor} onSaved={onSaved} onPreview={x=>{setPlayer({...x,targetDate:undefined});setPlayerIsPreview(true)}}/>:page==='dashboard'?<main className="dashboard-page"><div className="section-kicker"><span/> YOUR LITTLE UNIVERSES</div><div className="dashboard-heading"><div><h1>My creations<span>.</span></h1><p>Every little world you’ve made, all in one place.</p></div><button className="primary-btn" onClick={newExperience}><Plus size={17}/> New surprise</button></div>{drafts.length===0?<div className="empty-dashboard"><div className="empty-icon"><Cat size={38}/></div><h2>Your story starts here.</h2><p>You haven’t made a surprise yet. Let’s change that.</p><button className="primary-btn" onClick={newExperience}>Create your first surprise <ArrowRight size={16}/></button></div>:<div className="draft-grid">{drafts.map(x=><article className="draft-card" key={x.id}><div className="draft-art" style={{background:({ 'Rose Romance':'linear-gradient(135deg,#ff9db7,#5e285e)','Midnight Galaxy':'linear-gradient(135deg,#131b51,#a35cff)','Peach Dream':'linear-gradient(135deg,#ffd0b5,#f37f9c)','Golden Celebration':'linear-gradient(135deg,#482a63,#e6b85e)','Lavender Night':'linear-gradient(135deg,#bba7ff,#38225f)','Sakura Garden':'linear-gradient(135deg,#ffd0e3,#b54d87)','Ocean Hearts':'linear-gradient(135deg,#8fe4e8,#245d91)','Pastel Wonderland':'linear-gradient(135deg,#ffe2f2,#b8d8ff)','Neon Fantasy':'linear-gradient(135deg,#18122f,#ff4fc8)','Meow Magic':'linear-gradient(135deg,#f4a5d7,#a68bff)' } as Record<string,string>)[x.theme]}}><span>✦ {x.occasion}</span><Heart fill="currentColor" size={36}/></div><div className="draft-info"><div className="draft-status"><span className="status-dot"/>{x.published?'Published':'Private draft'}</div><h3>{x.title}</h3><p>For {x.recipient||'someone special'}</p><small><Clock3 size={13}/> Updated {new Date(x.updatedAt).toLocaleDateString()}</small><div className="draft-actions"><button onClick={()=>editExperience(x)}>Edit</button><button onClick={()=>{setPlayer({...x,targetDate:undefined});setPlayerIsPreview(true)}}><CirclePlay size={14}/> Preview</button><button onClick={()=>duplicate(x)} title="Duplicate"><Copy size={14}/></button><button onClick={()=>remove(x)} title="Delete">Delete</button></div></div></article>)}</div>}</main>:<><main>
      <section className="hero">
        <Particles count={25}/>
        <div className="hero-copy"><div className="hero-pill"><Sparkles size={14}/> YOUR FEELINGS, MADE INTERACTIVE <span className="pill-dot"/></div><h1>Make someone feel<br/><span className="gradient-text">unforgettable.</span></h1><p className="hero-lede">Create magical little worlds filled with memories, music, surprises, and feelings that words alone cannot express.</p><div className="hero-buttons"><button className="primary-btn big-btn" onClick={newExperience}>Create your surprise <ArrowRight size={18}/></button><button className="ghost-btn" onClick={explore}><CirclePlay size={18}/> Explore experiences</button></div><div className="hero-proof"><div className="avatar-stack"><span>♡</span><span>✦</span><span>☾</span></div><p><strong>Made for your favourite people</strong><small>Sign in with just your email</small></p></div></div>
        <div className="hero-art" aria-label="Decorative illustration of a magical surprise"><div className="orbit orbit-one"/><div className="orbit orbit-two"/><div className="hero-glow"/><div className="hero-heart"><Heart fill="currentColor" strokeWidth={1}/><span className="heart-sheen"/></div><span className="float-icon float-star">✦</span><span className="float-icon float-cat">ฅ^•ﻌ•^ฅ</span><span className="float-icon float-spark">✧</span><div className="floating-note note-one"><span>♡</span><div><b>a little reminder</b><small>you are so loved</small></div></div><div className="floating-note note-two"><span>✦</span><div><b>made just for you</b><small>with all my heart</small></div></div><div className="hero-caption"><span className="caption-dot"/> A LITTLE WORLD OF YOUR OWN</div></div>
        <div className="hero-bottom"><span>01 — MADE WITH FEELING</span><span>SCROLL TO FIND YOUR MAGIC <ChevronDown size={15}/></span></div>
      </section>
      <div className="scene-marquee" aria-hidden="true"><div>{[0,1].map(k=><span key={k} style={{display:'contents'}}><span>Arrow &amp; heart</span><b>✦</b><span>Birthday cake &amp; wish</span><b>♡</b><span>Balloon wish tree</span><b>✦</b><span>Sealed love letter</span><b>♡</b><span>Photos on a rope of lights</span><b>✦</b><span>Scrapbook of moments</span><b>♡</b><span>Bouquet reveal</span><b>✦</b></span>)}</div></div>
      <section className="intro-strip"><div><span className="strip-icon"><WandSparkles/></span><p><strong>Not just a page. A feeling.</strong><small>Every tap reveals a little more love.</small></p></div><div><span className="strip-icon"><Heart/></span><p><strong>Your words, your world.</strong><small>Made personal from the very first click.</small></p></div><div><span className="strip-icon"><Sparkles/></span><p><strong>Made to be shared.</strong><small>One special link, one unforgettable moment.</small></p></div></section>
      <section id="experiences" className="experiences-section"><div className="section-kicker"><span/> THE REASONS WE CELEBRATE</div><div className="section-heading"><div><h2>Every feeling has<br/><em>its own little universe.</em></h2></div><p>For the big days, the tiny moments, and all the love that deserves a little extra.</p></div><div className="experience-grid">{cards.map((c,i)=><motion.button key={c.title} className={`experience-card ${c.tone}`} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true,amount:.15}} transition={{duration:.45,delay:i*.06}} onClick={newExperience}><div className="experience-card-top"><span className="card-emoji">{c.emoji}</span><span className="card-arrow"><ArrowUpRight size={17}/></span></div><div><h3>{c.title}</h3><p>{c.desc}</p></div><span className="card-bottom-line"/></motion.button>)}</div></section>
      <section id="how-it-works" className="how-section"><div className="how-art"><div className="how-orbit"/><div className="how-card"><span>✦ A NOTE FOR YOU ✦</span><Heart fill="currentColor" size={44}/><strong>you make life<br/>a little brighter.</strong><small>made with love, always</small></div><span className="how-star">✧</span><span className="how-flower">✿</span></div><div className="how-copy"><div className="section-kicker"><span/> EASY AS A LOVE NOTE</div><h2>Three little steps.<br/><em>A feeling that lasts.</em></h2><div className="how-step"><span>01</span><div><strong>Make it yours</strong><p>Choose the occasion, write your message, and find a theme that feels just right.</p></div></div><div className="how-step"><span>02</span><div><strong>Add the little things</strong><p>Bring in memories, pick your scenes, and make every detail feel personal.</p></div></div><div className="how-step"><span>03</span><div><strong>Give them the moment</strong><p>Preview your creation, then publish with cloud sharing when you’re ready.</p></div></div><button className="primary-btn big-btn" onClick={newExperience}>Let's make something <ArrowRight size={17}/></button></div></section>
      <section className="closing-cta"><Particles count={12}/><span className="cta-cat">ฅ^•ﻌ•^ฅ</span><p className="eyebrow">A LITTLE MAGIC GOES A LONG WAY</p><h2>Someone came to mind,<br/><em>didn’t they?</em></h2><p>Make them something they’ll want to keep.</p><button className="primary-btn big-btn" onClick={newExperience}>Create their surprise <Heart size={17}/></button></section>
    </main><footer className="site-footer"><Brand small/><p>Made for the people who make life feel like something.</p><span>© {new Date().getFullYear()} LOVORA <i>·</i> LITTLE WORLDS, BIG FEELINGS</span></footer></>}
    {authOpen&&<AuthModal recovery={recovering} reason={pendingCreate?'Sign in with your email to start creating — your surprises are saved to your account.':undefined} onClose={()=>{setAuthOpen(false);setPendingCreate(false);window.__lovoraAfterAuth=undefined;if(recovering)dismissRecovery()}} onDone={()=>setToast('Signed in ♡')}/>}
    {toast&&<div className="toast" role="status"><Check size={16}/>{toast}</div>}
  </div>
}
