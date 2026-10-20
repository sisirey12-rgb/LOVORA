import { Cat, Sparkles } from 'lucide-react'
export default function Brand({ small = false }: { small?: boolean }) {
  return <a className={`brand ${small ? 'brand-small' : ''}`} href="/" aria-label="Lovora Meow home">
    <span className="brand-mark"><Cat size={small ? 20 : 25} strokeWidth={2.2}/><Sparkles className="brand-spark" size={12}/></span>
    <span><strong>LOVORA <i>MEOW</i></strong>{!small && <small>little worlds, big feelings</small>}</span>
  </a>
}
