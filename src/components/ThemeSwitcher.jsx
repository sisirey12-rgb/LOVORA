import React from 'react'
const themes = [
  ['rose','Rose Dream','#ff70b7'], ['violet','Violet Night','#b58aff'],
  ['midnight','Midnight','#76a8ff'], ['vanilla','Vanilla Blush','#ffc49b'],
  ['emerald','Emerald Glow','#59efb2'], ['crimson','Crimson Love','#ff667c'],
  ['ocean','Ocean Dreams','#70e5ff'], ['sunset','Sunset Romance','#ff9e74']
]
export { themes }
export default function ThemeSwitcher({ theme, onChange }) {
  return <div className="theme-grid">{themes.map(([id,label,color]) => <button key={id} className={`theme-chip ${theme===id?'selected':''}`} onClick={() => onChange(id)}><span style={{'--swatch':color}}/>{label}</button>)}</div>
}
