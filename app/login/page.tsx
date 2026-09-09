import { login } from './actions'

export default async function LoginPage({ searchParams }: PageProps<'/login'>) {
  const { error } = await searchParams
  return (
    <main className="mx-auto mt-24 max-w-sm rounded bg-white p-6 shadow">
      <h1 className="mb-4 text-xl font-semibold">KlevenBook</h1>
      <form action={login} className="space-y-3">
        <input name="email" type="email" required placeholder="Email" className="w-full rounded border p-2" />
        <input name="password" type="password" required placeholder="Password" className="w-full rounded border p-2" />
        {error && <p className="text-sm text-red-600">Wrong email or password.</p>}
        <button className="w-full rounded bg-slate-900 p-2 text-white">Sign in</button>
      </form>
    </main>
  )
}
