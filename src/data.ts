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


export const messageTemplates = [
  { category: 'Birthday', title: 'Warm birthday wish', text: 'Happy birthday, {name}! I hope this new chapter brings you peace, big laughter, little adventures, and all the love you give so freely to everyone around you. You deserve beautiful things, today and always.' },
  { category: 'Funny', title: 'Funny & chaotic', text: 'Happy birthday, {name}! You are officially older, not necessarily wiser, and still my favourite kind of chaos. May your cake be huge, your responsibilities be tiny, and your photos look good from every angle.' },
  { category: 'Emotional', title: 'From the heart', text: 'Dear {name}, some people make life feel softer simply by being in it. You have been that kind of person for me. Thank you for the little things, the honest moments, and the memories I will always carry. I hope you feel as loved as you make others feel.' },
  { category: 'Best friend', title: 'Best-friend energy', text: 'To my favourite human, {name}: thank you for every laugh that turned into tears, every random plan, every late conversation, and every time you just understood. Life is better with you in it. More memories, more madness, always.' },
  { category: 'Romantic', title: 'Soft romantic note', text: 'My {name}, if I could give you one thing, it would be the chance to see yourself through my eyes. You would understand why the smallest moments with you mean so much, and why choosing you feels like the easiest thing in the world.' },
  { category: 'Short caption', title: 'Short & sweet', text: 'You make ordinary days feel a little magical, {name}. This little universe is just a reminder that you matter. Always. ♡' },
] as const

// Add your licensed/owned media to public/media and update these paths.
// One owner-hosted soundtrack and one owner-hosted birthday video.
export const hostedMusic = '/media/music/celebration.mp3'
export const hostedBirthdayVideo = '/media/birthday-videos/birthday-cat.mp4'

export const cakeStyles = [
  { id: 'strawberry', title: 'Strawberry blush', emoji: '🍓' }, { id: 'chocolate', title: 'Chocolate dream', emoji: '🍫' },
  { id: 'vanilla-gold', title: 'Vanilla gold', emoji: '✨' }, { id: 'red-velvet', title: 'Red velvet', emoji: '❤️' },
  { id: 'heart-cake', title: 'Heart-shaped', emoji: '💗' }, { id: 'tiered', title: 'Three-tier magic', emoji: '🎂' },
] as const
export const bouquetStyles = [
  { id: 'roses', title: 'Velvet red roses', emoji: '🌹', flowers: '🌹🌹🌹' },
  { id: 'tulips', title: 'Spring tulip wrap', emoji: '🌷', flowers: '🌷🌷🌷' },
  { id: 'mixed', title: 'Wildflower hand-tie', emoji: '💐', flowers: '🌼🌸🌷' },
  { id: 'sunflowers', title: 'Sunshine bouquet', emoji: '🌻', flowers: '🌻🌻🌼' },
  { id: 'orchids', title: 'Orchid elegance', emoji: '🪻', flowers: '🪻🌸🪻' },
  { id: 'peonies', title: 'Pink peonies', emoji: '🌸', flowers: '🌸🌸🌸' },
  { id: 'wildflowers', title: 'Meadow wildflowers', emoji: '💐', flowers: '🌼🪻🌸' },
  { id: 'heart', title: 'Heart-shaped bouquet', emoji: '💝', flowers: '💗🌹💗' },
] as const
export const birthdayVideos = [
  { id: 'cat-party', title: 'Cat party wishes', mood: 'Playful', url: '/media/birthday-videos/cat-party.mp4' },
  { id: 'sleepy-kitty', title: 'Sleepy kitty surprise', mood: 'Cute', url: '/media/birthday-videos/sleepy-kitty.mp4' },
  { id: 'birthday-meow', title: 'Birthday meow', mood: 'Silly', url: '/media/birthday-videos/birthday-meow.mp4' },
] as const
