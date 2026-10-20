import type { Occasion, ThemeName, SceneId } from './types'
export const occasions: { name: Occasion; icon: string; desc: string }[] = [
  { name: 'Birthday', icon: '🎂', desc: 'A wish wrapped in magic' },
  { name: 'Anniversary', icon: '💞', desc: 'Celebrate your story' },
  { name: 'Friendship', icon: '🫶', desc: 'For your favourite human' },
  { name: 'Love letter', icon: '💌', desc: 'Say what matters' },
  { name: 'Special surprise', icon: '✨', desc: 'Just because they matter' },
  { name: 'Memory collection', icon: '📸', desc: 'A little world of moments' },
]
export const themes: { name: ThemeName; colors: string; description: string }[] = [
  { name: 'Rose Romance', colors: 'linear-gradient(135deg,#ff9db7,#5e285e)', description: 'Blush, roses & tender glow' },
  { name: 'Midnight Galaxy', colors: 'linear-gradient(135deg,#131b51,#a35cff)', description: 'Cosmic and dreamy' },
  { name: 'Peach Dream', colors: 'linear-gradient(135deg,#ffd0b5,#f37f9c)', description: 'Warm peach softness' },
  { name: 'Golden Celebration', colors: 'linear-gradient(135deg,#482a63,#e6b85e)', description: 'A little golden sparkle' },
  { name: 'Lavender Night', colors: 'linear-gradient(135deg,#bba7ff,#38225f)', description: 'Soft violet evening' },
  { name: 'Sakura Garden', colors: 'linear-gradient(135deg,#ffd0e3,#b54d87)', description: 'Cherry blossom magic' },
  { name: 'Ocean Hearts', colors: 'linear-gradient(135deg,#8fe4e8,#245d91)', description: 'Blue skies and deep feelings' },
  { name: 'Pastel Wonderland', colors: 'linear-gradient(135deg,#ffe2f2,#b8d8ff)', description: 'Candy-coloured daydream' },
  { name: 'Neon Fantasy', colors: 'linear-gradient(135deg,#18122f,#ff4fc8)', description: 'Electric after-dark energy' },
  { name: 'Meow Magic', colors: 'linear-gradient(135deg,#f4a5d7,#a68bff)', description: 'A little cat-inspired charm' },
]
export const defaultScenes: SceneId[] = ['heart','intro','cake','balloons','letter','memories','finale']
export const sceneLabels: Record<SceneId, string> = { heart: 'Floating heart', intro: 'Magical intro', cake: 'Birthday cake', balloons: 'Pop the balloons', letter: 'Personal letter', memories: 'Photo memories', finale: 'Grand finale' }
