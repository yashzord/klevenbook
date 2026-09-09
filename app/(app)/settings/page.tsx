import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Sequence, Settings } from '@/lib/types'
import { SettingsForm } from './settings-form'

export const metadata: Metadata = { title: 'Settings' }
export default async function SettingsPage() {
  const supabase = await createClient()
  const [{ data: settings }, { data: sequences }] = await Promise.all([
    supabase.from('settings').select('*').single<Settings>(),
    supabase.from('sequences').select('*').order('kind').returns<Sequence[]>(),
  ])
  if (!settings || !sequences) throw new Error('Settings row missing')
  return (
    <>
      <h1 className="mb-1 text-2xl font-semibold">Settings</h1>
      <p className="mb-5 text-sm text-ink-soft">What prints on your documents and how they are numbered.</p>
      <SettingsForm settings={settings} sequences={sequences} />
    </>
  )
}
