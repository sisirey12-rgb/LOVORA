import { supabase } from './supabase.js'

// Audio catalogue lives in Supabase, not in index.html. If Supabase has not
// been configured yet, use an empty catalogue rather than a hardcoded track.
export async function fetchAudioSettings() {
  if (!supabase) return { tracks: [], settings: { musicEnabled: true, effectsEnabled: true, vibrationEnabled: true } }
  const [{ data: tracks, error: tracksError }, { data: settings, error: settingsError }] = await Promise.all([
    supabase.from('audio_tracks').select('id,title,kind,category,storage_path,public_url,enabled,sort_order').eq('enabled', true).order('sort_order'),
    supabase.from('site_settings').select('key,value').in('key', ['music_enabled','effects_enabled','vibration_enabled'])
  ])
  if (tracksError) console.warn('Could not load audio catalogue:', tracksError.message)
  if (settingsError) console.warn('Could not load audio settings:', settingsError.message)
  const settingMap = Object.fromEntries((settings || []).map(x => [x.key, x.value]))
  return {
    tracks: (tracks || []).map(track => ({ ...track, url: track.public_url || '' })).filter(x => x.url),
    settings: {
      musicEnabled: settingMap.music_enabled !== false,
      effectsEnabled: settingMap.effects_enabled !== false,
      vibrationEnabled: settingMap.vibration_enabled !== false
    }
  }
}

export async function uploadAudio(file, { title, kind, category = 'general' }) {
  if (!supabase) throw new Error('Connect Supabase first. See README.md.')
  const safeName = file.name.toLowerCase().replace(/[^a-z0-9._-]+/g, '-')
  const path = `${Date.now()}-${crypto.randomUUID()}-${safeName}`
  const { error: uploadError } = await supabase.storage.from('lovora-audio').upload(path, file, { contentType: file.type, upsert: false })
  if (uploadError) throw uploadError
  const { data } = supabase.storage.from('lovora-audio').getPublicUrl(path)
  const { error: rowError } = await supabase.from('audio_tracks').insert({
    title, kind, category, storage_path: path, public_url: data.publicUrl, enabled: true, sort_order: 100
  })
  if (rowError) throw rowError
}

export async function setTrackEnabled(id, enabled) {
  if (!supabase) throw new Error('Connect Supabase first.')
  const { error } = await supabase.from('audio_tracks').update({ enabled }).eq('id', id)
  if (error) throw error
}

export async function removeTrack(track) {
  if (!supabase) throw new Error('Connect Supabase first.')
  const { error: rowError } = await supabase.from('audio_tracks').delete().eq('id', track.id)
  if (rowError) throw rowError
  if (track.storage_path) {
    const { error: storageError } = await supabase.storage.from('lovora-audio').remove([track.storage_path])
    if (storageError) console.warn('Audio row removed; storage cleanup failed:', storageError.message)
  }
}

export async function updateSiteSetting(key, value) {
  if (!supabase) throw new Error('Connect Supabase first.')
  const { error } = await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' })
  if (error) throw error
}
