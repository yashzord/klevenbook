// Vercel cron hits this daily. Vercel checks the CRON_SECRET bearer itself before invoking, and we re-check here.
// https://vercel.com/docs/cron-jobs/manage-cron-jobs#securing-cron-jobs
export async function GET(request: Request) {
  if (request.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }
  // Any REST request counts as activity. RLS returns an empty list to the anon key, which is fine.
  const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/settings?select=id`, {
    headers: { apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! },
  })
  return Response.json({ ok: res.ok, status: res.status })
}
