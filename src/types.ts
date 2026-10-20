export type Occasion = 'Birthday' | 'Anniversary' | 'Friendship' | 'Love letter' | 'Special surprise' | 'Memory collection'
export type ThemeName = 'Rose Romance' | 'Midnight Galaxy' | 'Peach Dream' | 'Golden Celebration' | 'Lavender Night' | 'Sakura Garden' | 'Ocean Hearts' | 'Pastel Wonderland' | 'Neon Fantasy' | 'Meow Magic'
export type SceneId = 'heart' | 'intro' | 'cake' | 'balloons' | 'letter' | 'cat-video' | 'memories' | 'finale'
export interface MemoryItem { id: string; kind: 'image' | 'video'; src: string; caption: string; date?: string; name: string }
export interface Experience {
  id: string; occasion: Occasion; recipient: string; sender: string; title: string; greeting: string; message: string; closing: string; balloonWishes?: string[]; balloonCount?: number; targetDate?: string; openingInstruction?: string;
  theme: ThemeName; memories: MemoryItem[]; musicData?: string; musicName?: string; musicUrl?: string; cakeStyle?: string; bouquetStyle?: string; birthdayVideoUrl?: string; scenes: SceneId[]; published: boolean; updatedAt: string;
}
