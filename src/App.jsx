import React from 'react'
import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import Auth from './pages/Auth.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Editor from './pages/Editor.jsx'
import Celebration from './pages/Celebration.jsx'
import AudioAdmin from './pages/AudioAdmin.jsx'
import { supabase } from './lib/supabase.js'
function Footer(){return <footer className="footer"><a className="brand" href="/"><span className="brand-mark">♡</span><span>LOVORA<small>BY SISIREY</small></span></a><p>Every feeling deserves a moment.</p><span>© {new Date().getFullYear()} LOVORA. Made with feeling.</span></footer>}
export default function App(){
 const [theme,setTheme]=useState(localStorage.getItem('lovora-theme')||'rose');const [user,setUser]=useState(null);const [authReady,setAuthReady]=useState(false);const navigate=useNavigate()
 useEffect(()=>{document.documentElement.dataset.theme=theme;localStorage.setItem('lovora-theme',theme)},[theme])
 useEffect(()=>{if(!supabase){setAuthReady(true);return}supabase.auth.getSession().then(({data})=>{setUser(data.session?.user||null);setAuthReady(true)});const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>setUser(session?.user||null));return()=>subscription.unsubscribe()},[])
 async function signOut(){await supabase?.auth.signOut();setUser(null);navigate('/')}
 return <><Navbar user={user} onSignOut={signOut}/>{!authReady&&<div className="boot-line"/>}<Routes><Route path="/" element={<Home theme={theme} setTheme={setTheme}/>}/><Route path="/auth" element={<Auth/>}/><Route path="/dashboard" element={<Dashboard user={user}/>}/><Route path="/create" element={<Editor user={user}/>}/><Route path="/editor/:id" element={<Editor user={user}/>}/><Route path="/audio" element={<AudioAdmin user={user}/>}/><Route path="/b/:slug" element={<Celebration/>}/><Route path="*" element={<main className="not-found"><h1>Lost in the lovely little universe?</h1><a href="/">Back to LOVORA ↗</a></main>}/></Routes><Footer/></>
}
