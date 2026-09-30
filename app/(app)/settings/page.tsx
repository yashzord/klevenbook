import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import type { Sequence, Settings } from '@/lib/types'
import { PageHeader } from '@/components/page-header'
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
      <PageHeader title="Settings" hint="What prints on your documents and how they are numbered." />
      <SettingsForm settings={settings} sequences={sequences} />
    </>
  )
}
