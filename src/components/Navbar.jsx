import { Link, NavLink } from 'react-router-dom'
import { Heart, Menu, X } from 'lucide-react'
import { useState } from 'react'
export default function Navbar({ user, onSignOut }) {
  const [open,setOpen] = useState(false)
  return <header className="navbar"><Link className="brand" to="/"><span className="brand-mark"><Heart size={19} fill="currentColor"/></span><span>LOVORA<small>BY SISIREY</small></span></Link>
    <button className="mobile-menu" onClick={()=>setOpen(!open)} aria-label="Toggle menu">{open?<X/>:<Menu/>}</button>
    <nav className={open?'nav-links open':'nav-links'}><a href="/#experiences" onClick={()=>setOpen(false)}>Experiences</a><a href="/#how-it-works" onClick={()=>setOpen(false)}>How it works</a><Link to="/audio" onClick={()=>setOpen(false)}>Audio studio</Link>
    {user ? <><Link className="nav-cta" to="/dashboard">Dashboard</Link><button className="nav-text" onClick={onSignOut}>Sign out</button></> : <Link className="nav-cta" to="/auth">Get started <span>↗</span></Link>}</nav>
  </header>
}