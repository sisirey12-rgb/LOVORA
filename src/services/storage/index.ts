import type { Experience } from '../../types'
import { localStorageAdapter } from './local'
import { supabase } from '../supabase/client'

// Drafts stay local in the MVP. Published items are written to Supabase only when configured.
export const storage = {
  list: () => localStorageAdapter.list(),
  getLocal: (id: string) => localStorageAdapter.get(id),
  saveDraft: (item: Experience) => localStorageAdapter.save({ ...item, published: false }),
  removeLocal: (id: string) => localStorageAdapter.remove(id),
  duplicate: (item: Experience) => localStorageAdapter.duplicate(item),
  async publish(item: Experience): Promise<Experience> {
    if (!supabase) throw new Error('Cloud sharing is not configured yet. Add your Supabase URL and anon key, then apply the migration in supabase/migrations.')
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) throw new Error('Sign in is required to publish with cloud sharing. Add Supabase Auth to enable account ownership.')
    const published = { ...item, published: true, updatedAt: new Date().toISOString() }
    const { error } = await supabase.from('experiences').upsert({
      id: published.id, owner_id: authData.user.id, payload: published, is_published: true, updated_at: published.updatedAt
    })
    if (error) throw new Error(error.message)
    return published
  },
  async getPublic(id: string): Promise<Experience | undefined> {
    if (!supabase) return undefined
    const { data, error } = await supabase.from('published_experiences').select('payload').eq('id', id).maybeSingle()
    if (error || !data?.payload) return undefined
    return data.payload as Experience
  },
}
