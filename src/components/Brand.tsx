import { Heart, Sparkles } from 'lucide-react'
export default function Brand({ small = false }: { small?: boolean }) {
  return <a className={`brand ${small ? 'brand-small' : ''}`} href="/" aria-label="Lovora home">
    <span className="brand-mark"><Heart size={small ? 18 : 22} strokeWidth={2} fill="currentColor"/><Sparkles className="brand-spark" size={12}/></span>
    <span><strong>LOVORA</strong>{!small && <small>little worlds, big feelings</small>}</span>
  </a>
}
