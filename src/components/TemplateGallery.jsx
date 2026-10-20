import { motion } from 'framer-motion'
import { Cake, Heart, Mail, Images, Gift, Users } from 'lucide-react'
const items = [
 {id:'birthday',icon:Cake,title:'Birthday magic',desc:'Candles, wishes, hidden messages',tag:'MOST LOVED',tone:'pink'},
 {id:'anniversary',icon:Heart,title:'Anniversary',desc:'A timeline made of your moments',tag:'ROMANTIC',tone:'purple'},
 {id:'letter',icon:Mail,title:'Love letter',desc:'A little envelope, a lot of feeling',tag:'PERSONAL',tone:'peach'},
 {id:'memory',icon:Images,title:'Memory book',desc:'Photos, captions and little stories',tag:'MEMORIES',tone:'blue'},
 {id:'friendship',icon:Users,title:'Friendship',desc:'Celebrate your favourite human',tag:'WHOLESOME',tone:'green'},
 {id:'surprise',icon:Gift,title:'Just because',desc:'No occasion needed to make a moment',tag:'UNEXPECTED',tone:'rose'}
]
export default function TemplateGallery({ onChoose }) {
 return <div className="template-grid">{items.map((item,i)=>{const Icon=item.icon;return <motion.button key={item.id} className={`template-card tone-${item.tone}`} onClick={()=>onChoose(item.id)} initial={{opacity:0,y:18}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{delay:i*.06,duration:.4}} whileHover={{y:-5}}><span className="template-tag">{item.tag}</span><span className="template-icon"><Icon size={24}/></span><h3>{item.title}</h3><p>{item.desc}</p><span className="template-arrow">Create yours ↗</span></motion.button>})}</div>
}