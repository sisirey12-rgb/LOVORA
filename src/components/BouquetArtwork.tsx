import React, { useId } from 'react'

type BouquetArtworkProps = { style?: string; compact?: boolean; opened?: boolean; label?: string }
const palettes: Record<string, { petals: string[]; center: string; paper: string; ribbon: string; leaf: string }> = {
  roses: { petals: ['#f6a0b8','#d83d68','#a91f50'], center: '#f8d5a0', paper: '#f3d9c9', ribbon: '#9b315e', leaf: '#47785b' },
  tulips: { petals: ['#ffb4d0','#ed6c9e','#c94579'], center: '#f7d9a4', paper: '#f5e5b8', ribbon: '#c65b86', leaf: '#4e805d' },
  sunflowers: { petals: ['#ffe18a','#f4b62e','#d78a20'], center: '#59382d', paper: '#e4d4b4', ribbon: '#936a43', leaf: '#4f7950' },
  orchids: { petals: ['#e7c9ff','#b68be8','#8860bd'], center: '#f3c65d', paper: '#eadcf4', ribbon: '#8061a9', leaf: '#39796e' },
  peonies: { petals: ['#ffc2d5','#ed83ad','#d95788'], center: '#f5c56e', paper: '#f7e2e9', ribbon: '#c65b86', leaf: '#4b805b' },
  wildflowers: { petals: ['#f8d6e7','#f2a4c6','#d8a7ef'], center: '#f6cb67', paper: '#d8e8cf', ribbon: '#6d8c67', leaf: '#477d5a' },
  mixed: { petals: ['#ffb6c8','#f6ce73','#c9a6f7'], center: '#f5d49a', paper: '#e8d8c8', ribbon: '#a85c7c', leaf: '#47785b' },
  heart: { petals: ['#ffabc9','#ec669d','#bf3877'], center: '#ffe2ee', paper: '#f8d8e6', ribbon: '#9c3e70', leaf: '#47785b' },
}

function Flower({ x, y, type, color, center, scale = 1, rotate = 0, filterId }:  { x:number;y:number;type:string;color:string;center:string;scale?:number;rotate?:number;filterId:string }) {
  const petals = type === 'sunflower' ? 14 : type === 'tulip' ? 6 : type === 'orchid' ? 5 : type === 'wild' ? 8 : type === 'heart' ? 6 : 10
  return <g transform={`translate(${x} ${y}) rotate(${rotate}) scale(${scale})`} filter={`url(#${filterId})`}>
    {type === 'tulip' ? <><path d="M-19 5 C-27 -17 -17 -31 -5 -20 C-2 -35 12 -32 13 -17 C27 -28 31 -5 17 8 Q0 17 -19 5Z" fill={color} stroke="#ffffff55" strokeWidth="1.5"/><path d="M0 -24 Q2 -5 0 7" stroke="#fff7f8aa" strokeWidth="2" fill="none"/></> : type === 'heart' ? <><path d="M0 15 C-5 9 -21 -1 -17 -13 C-14 -22 -3 -20 0 -11 C4 -21 16 -22 19 -12 C22 -2 7 10 0 15Z" fill={color} stroke="#fff8f4" strokeOpacity=".6" strokeWidth="1.3"/><path d="M-7 -11 Q-2 -16 2 -12" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="2" strokeLinecap="round"/><circle cx="1" cy="1" r="3.5" fill={center}/></> : type === 'orchid' ? <><ellipse cx="0" cy="-10" rx="9" ry="17" fill={color}/><ellipse cx="-12" cy="-1" rx="10" ry="15" transform="rotate(-45 -12 -1)" fill={color}/><ellipse cx="12" cy="-1" rx="10" ry="15" transform="rotate(45 12 -1)" fill={color}/><ellipse cx="-8" cy="11" rx="9" ry="13" transform="rotate(28 -8 11)" fill={color}/><ellipse cx="8" cy="11" rx="9" ry="13" transform="rotate(-28 8 11)" fill={color}/><path d="M-5 5 Q0 -1 5 5 L3 13 Q0 17 -3 13Z" fill={center}/><circle cy="5" r="3" fill="#fff0bd"/></> : <>{Array.from({length:petals},(_,i)=><ellipse key={i} cx="0" cy={type==='sunflower'?-17:-13} rx={type==='sunflower'?5.2:7.5} ry={type==='sunflower'?13:15} transform={`rotate(${i*360/petals})`} fill={i%3===0&&type==='rose'?'#f9b3c3':color} stroke="#fff8f4" strokeOpacity=".36" strokeWidth=".8"/>)}{type==='rose'&&<><circle r="12" fill="#bd315a"/><path d="M-8 -2 C-5 -12 9 -10 9 -2 C9 5 0 9 -4 4 C-8 0 -2 -5 3 -3 C7 0 2 4 0 1" fill="none" stroke="#f7a4ba" strokeWidth="3" strokeLinecap="round"/></>}{type==='peony'&&Array.from({length:8},(_,i)=><ellipse key={`inner${i}`} cx="0" cy="-7" rx="5.5" ry="9" transform={`rotate(${i*45+22})`} fill={i%2?'#ffd8e4':'#f59ab8'}/>)}<circle r={type==='sunflower'?12:7.5} fill={center}/>{type==='sunflower'&&<g fill="#30201e">{Array.from({length:13},(_,i)=><circle key={i} cx={Math.cos(i*2.4)*7} cy={Math.sin(i*2.4)*7} r="1.2"/>)}</g>}{type==='wild'&&<circle r="3.5" fill="#fff4c9"/>}</>}
    <path d="M-10 -19 Q-2 -25 5 -20" fill="none" stroke="#fff" strokeOpacity=".55" strokeWidth="1.5" strokeLinecap="round"/>
  </g>
}

export default function BouquetArtwork({ style = 'roses', compact = false, opened = false, label = 'A hand-arranged bouquet of flowers' }: BouquetArtworkProps) {
  const p = palettes[style] || palettes.roses
  const uid = useId().replace(/:/g, '')
  const flowers = style === 'tulips'
    ? [{x:38,y:73,t:'tulip',s:.72,r:-22},{x:66,y:48,t:'tulip',s:.86,r:-13},{x:99,y:30,t:'tulip',s:1.04,r:-4},{x:132,y:37,t:'tulip',s:.98,r:7},{x:163,y:57,t:'tulip',s:.88,r:17},{x:183,y:82,t:'tulip',s:.67,r:22},{x:92,y:69,t:'tulip',s:.75,r:-1}]
    : style === 'sunflowers'
      ? [{x:39,y:71,t:'sunflower',s:.7,r:-14},{x:72,y:43,t:'sunflower',s:.9,r:-7},{x:111,y:29,t:'sunflower',s:1.08,r:2},{x:151,y:43,t:'sunflower',s:.91,r:9},{x:180,y:72,t:'sunflower',s:.69,r:16}]
      : style === 'orchids'
        ? [{x:38,y:68,t:'orchid',s:.77,r:-17},{x:70,y:38,t:'orchid',s:.88,r:-9},{x:106,y:28,t:'orchid',s:1.03,r:0},{x:144,y:36,t:'orchid',s:.94,r:8},{x:178,y:62,t:'orchid',s:.79,r:17},{x:91,y:63,t:'orchid',s:.72,r:-3},{x:130,y:69,t:'orchid',s:.7,r:7}]
        : style === 'wildflowers'
          ? [{x:33,y:75,t:'wild',s:.62,r:-18},{x:61,y:49,t:'wild',s:.72,r:-10},{x:92,y:30,t:'wild',s:.8,r:3},{x:126,y:37,t:'wild',s:.73,r:9},{x:157,y:51,t:'wild',s:.7,r:16},{x:185,y:77,t:'wild',s:.58,r:20},{x:89,y:69,t:'wild',s:.63,r:-2},{x:132,y:74,t:'wild',s:.58,r:7}]
          : style === 'mixed'
            ? [{x:42,y:64,t:'rose',s:.72,r:-12},{x:75,y:42,t:'wild',s:.82,r:-6},{x:111,y:32,t:'peony',s:.9,r:1},{x:147,y:45,t:'orchid',s:.84,r:8},{x:178,y:67,t:'tulip',s:.76,r:15},{x:93,y:70,t:'rose',s:.7,r:-3},{x:129,y:72,t:'wild',s:.66,r:6}]
            : style === 'heart'
              ? [{x:42,y:64,t:'heart',s:.78,r:-12},{x:75,y:42,t:'heart',s:.9,r:-6},{x:111,y:32,t:'heart',s:1,r:1},{x:147,y:45,t:'heart',s:.9,r:8},{x:178,y:67,t:'heart',s:.76,r:15},{x:93,y:70,t:'heart',s:.76,r:-3}]
              : [{x:42,y:64,t:style==='peonies'?'peony':'rose',s:.78,r:-12},{x:75,y:42,t:style==='peonies'?'peony':'rose',s:.9,r:-6},{x:111,y:32,t:style==='peonies'?'peony':'rose',s:1,r:1},{x:147,y:45,t:style==='peonies'?'peony':'rose',s:.9,r:8},{x:178,y:67,t:style==='peonies'?'peony':'rose',s:.76,r:15},{x:93,y:70,t:style==='peonies'?'peony':'rose',s:.76,r:-3},{x:129,y:72,t:style==='peonies'?'peony':'rose',s:.7,r:6}]
  const mixedColors = style === 'mixed' ? [p.petals[0],p.petals[1],p.petals[2],p.petals[0],p.petals[1],p.petals[2],p.petals[0]] : flowers.map(()=>p.petals[style==='sunflowers'?1:0])
  return <svg className={`bouquet-artwork ${compact?'compact':''} ${opened?'is-opened':''}`} viewBox="0 0 220 220" role="img" aria-label={label} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id={`paper-${uid}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={p.paper}/><stop offset=".5" stopColor="#fff6ed"/><stop offset="1" stopColor={p.paper}/></linearGradient>
      <linearGradient id={`paperBack-${uid}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={p.paper} stopOpacity=".7"/><stop offset="1" stopColor="#8c5b6b" stopOpacity=".65"/></linearGradient>
      <linearGradient id={`ribbon-${uid}`} x1="0" y1="0" x2="1" y2="1"><stop stopColor={p.ribbon}/><stop offset=".55" stopColor="#f5b3cf"/><stop offset="1" stopColor={p.ribbon}/></linearGradient>
      <filter id={`flowerShadow-${uid}`} x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="2" stdDeviation="1.7" floodColor="#3a1c31" floodOpacity=".24"/></filter>
    </defs>
    <ellipse cx="110" cy="199" rx="66" ry="8" fill="#120a19" opacity=".2"/>
    <g className="bouquet-stems" stroke={p.leaf} strokeLinecap="round" fill="none"><path d="M110 78 Q103 126 99 174" strokeWidth="3"/><path d="M77 80 Q93 125 106 174" strokeWidth="2.7"/><path d="M145 82 Q124 127 113 174" strokeWidth="3"/><path d="M44 99 Q81 130 109 177" strokeWidth="2.2"/><path d="M174 101 Q142 135 115 177" strokeWidth="2.4"/><path d="M93 100 Q99 137 109 176" strokeWidth="2.3"/></g>
    <g fill={p.leaf} stroke="#d6ebc9" strokeOpacity=".28" strokeWidth=".8"><path d="M77 119 Q44 93 49 77 Q78 83 83 113 Q68 101 57 91Z"/><path d="M139 122 Q172 91 182 99 Q178 126 145 132 Q162 115 171 108Z"/><path d="M92 145 Q59 130 62 115 Q88 118 98 142 Q81 132 71 128Z"/><path d="M124 146 Q148 116 164 121 Q157 145 128 153 Q143 135 151 129Z"/><path d="M107 130 Q86 101 97 90 Q116 107 111 129Z"/></g>
    <g className="bouquet-paper-back"><path d="M34 95 L111 128 L186 94 L151 183 L77 183Z" fill={`url(#paperBack-${uid})`} stroke="#ffffff70" strokeWidth="1.1"/><path d="M36 95 L82 113 L77 183Z" fill={p.paper} opacity=".72"/><path d="M186 94 L141 116 L151 183Z" fill="#fffaf4" opacity=".65"/></g>
    {flowers.map((f,i)=><Flower key={i} x={f.x} y={f.y} type={f.t} color={mixedColors[i]||p.petals[0]} center={p.center} scale={f.s} rotate={f.r} filterId={`flowerShadow-${uid}`}/>)}
    <g className={`bouquet-paper-front wrap-${style}`}><path d={style==='tulips'?"M42 108 Q110 139 178 107 L148 190 Q110 207 72 190Z":style==='sunflowers'?"M43 112 L177 112 L143 192 Q110 204 77 192Z":style==='orchids'?"M53 111 Q110 128 167 111 L151 187 Q110 202 69 187Z":"M50 112 Q110 134 170 111 L145 190 Q110 204 75 190Z"}  fill={`url(#paper-${uid})`} stroke="#fff8f1" strokeWidth="1.3"/><path d="M50 112 Q78 137 110 137 L75 190Z" fill="#ffffff50"/><path d="M170 111 Q143 136 110 137 L145 190Z" fill="#a66b8050"/><path d="M57 119 Q109 144 163 119" fill="none" stroke="#ffffff9c" strokeWidth="1.3"/><path d="M79 188 Q110 196 141 188" fill="none" stroke="#ffffff80" strokeWidth="1.2"/></g>
    <g className="bouquet-ribbon"><path d="M103 157 C80 139 74 157 95 166 L108 162Z" fill={`url(#ribbon-${uid})`} stroke="#ffffff70"/><path d="M116 158 C139 137 147 154 125 167 L112 163Z" fill={`url(#ribbon-${uid})`} stroke="#ffffff70"/><path d="M104 163 L91 185 L108 178 L113 166Z" fill={p.ribbon}/><path d="M115 163 L132 185 L114 178 L110 166Z" fill={p.ribbon}/><ellipse cx="110" cy="161" rx="7" ry="6" fill={p.ribbon} stroke="#ffffff8a" strokeWidth="1"/></g>
    {opened&&<g className="bouquet-sparkles" fill="#ffe5a5"><path d="M28 60 l3 8 8 3 -8 3 -3 8 -3 -8 -8 -3 8 -3Z"/><path d="M190 43 l2 6 6 2 -6 2 -2 6 -2 -6 -6 -2 6 -2Z"/><circle cx="183" cy="81" r="2.5"/><circle cx="37" cy="125" r="2"/></g>}
  </svg>
}
