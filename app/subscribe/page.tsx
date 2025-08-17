"use client"
import { useAuthStore } from "@/store/authStore"
import { useEffect, useState, useMemo } from "react"
import api from "@/lib/axios"
import { Check, Briefcase, Rocket, Flame, Crown, LockKeyhole, Loader2, ShieldCheck, Zap, BarChart3, Users2, Headset, Infinity, Building2 } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"

// Utility for class merging
const cn = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(" ")

type Plan = {
  price: number
  currency: string
  yearly_post_limit: number | null
  monthly_post_limit: number | null
  access_limit: number | null
  name: string
}

const ORDERED = ["free", "basic", "pro", "premium", "enterprise"] as const

// Additional marketing feature definitions per plan (beyond raw limits returned by API)
const MARKETING_FEATURES: Record<string, string[]> = {
  free: [
    "5 job posts total",
    "Basic listing visibility",
    "Single employer seat"
  ],
  basic: [
    "36 posts / year (3 / month)",
    "Standard visibility boost",
    "Single employer seat",
    "Email support"
  ],
  pro: [
    "96 posts / year (8 / month)",
    "Priority listing placement",
    "Single employer seat",
    "Priority email support",
    "Basic analytics"
  ],
  premium: [
    "Unlimited posts (this employer)",
    "High exposure & smart rotation",
    "Advanced analytics dashboard",
    "Interview scheduling assist",
    "Dedicated success tips"
  ],
  enterprise: [
    "Company-wide unlimited posts",
    "All employer accounts included",
    "Custom integrations & SSO",
    "Dedicated account manager",
    "Custom reporting & SLA"
  ]
}

const ICON_MAP: Record<string, any> = {
  free: Briefcase,
  basic: Briefcase,
  pro: Rocket,
  premium: Flame,
  enterprise: Crown
}

const gradientFor = (pid: string) => {
  switch(pid){
    case 'free': return 'from-purple-50 to-purple-100'
    case 'basic': return 'from-purple-100 to-purple-50'
    case 'pro': return 'from-purple-500 to-purple-400 text-white'
    case 'premium': return 'from-purple-600 to-purple-500 text-white'
    case 'enterprise': return 'from-purple-800 to-purple-700 text-white'
    default: return 'from-purple-100 to-purple-50'
  }
}

const badgeColor = (pid: string) => pid === 'pro' ? 'bg-purple-600' : 'bg-purple-500'

export default function SubscriptionPage() {
  const { user } = useAuthStore()
  const router = useRouter()
  const [plans, setPlans] = useState<Record<string, Plan>>({})
  const [loading, setLoading] = useState(false)
  const [activePlan, setActivePlan] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [initializing, setInitializing] = useState(true)
  const [statusModal, setStatusModal] = useState<{type:'success'|'pending'|'error'|null; plan?:string; txn?:string}>({type:null})

  //   // In your subscription page component
  // useEffect(() => {
  //   const urlParams = new URLSearchParams(window.location.search);
    
  //   if (urlParams.get('success') === '1') {
  //     toast.success('Payment successful! Your subscription is now active.');
  //   } else if (urlParams.get('pending') === '1') {
  //     toast.info('Payment is being processed. Your subscription will be activated shortly.');
  //   } else if (urlParams.get('error') === '1') {
  //     toast.error('Payment failed. Please try again.');
  //   }
  // }, []);


  useEffect(() => {
    if (!user?.role) return
    if (user.role !== "employer") {
      setError("Only employers can view subscription plans.")
      return
    }
    api.get("/subscription/plans").then(r => setPlans(r.data.plans || {})).catch(()=> toast.error('Failed to load plans'))
    if (user.token) {
      api.get("/subscription/me", { headers: { Authorization: `Bearer ${user.token}` } })
        .then(r => {
          const pid = r.data.subscription?.plan_id || 'free'
          setActivePlan(pid)
          setInitializing(false)
          if(pid === 'free') {
            toast.info('Free plan active')
          } else {
            toast.success(`${pid.charAt(0).toUpperCase()+pid.slice(1)} plan active`)
          }
        })
        .catch(() => { setActivePlan('free'); setInitializing(false); toast.info('Defaulted to Free plan') })
    }
  }, [user?.role, user?.token])

  // Detect payment redirect query params and open modal
  useEffect(()=> {
    if (typeof window === 'undefined') return
    const params = new URLSearchParams(window.location.search)
    const plan = params.get('plan') || undefined
    const txn = params.get('txn') || undefined
    if (params.get('success') === '1') {
      setStatusModal({type:'success', plan, txn})
    } else if (params.get('pending') === '1') {
      setStatusModal({type:'pending', plan, txn})
    } else if (params.get('error') === '1') {
      setStatusModal({type:'error', plan, txn})
    }
  }, [])

  const initiate = async (planId: string) => {
    if (!user?.token) { router.push("/auth/login"); return }
    setLoading(true); setError(null)
    try {
      const res = await api.post(`/subscription/initiate/${planId}`, {}, { headers: { Authorization: `Bearer ${user.token}` } })
      console.log(res.data)
      const data = res.data
      if (data?.message === 'Free plan activated') {
        setActivePlan('free');
        toast.success('Free plan activated')
        return
      }
      if (data?.redirectUrl) {
        toast.info('Redirecting to secure payment...')
        window.location.href = data.redirectUrl
        return
      }
      // Fallback legacy shapes
      const legacyRedirect = data?.data?.instrumentResponse?.redirectInfo?.url || data?.instrumentResponse?.redirectInfo?.url
      if (legacyRedirect) {
        toast.info('Redirecting to secure payment...')
        window.location.href = legacyRedirect
        return
      }
      setError(data?.error || 'Unable to get payment redirect URL. Please try again.')
      toast.error(data?.error || 'Payment redirect unavailable')
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to initiate payment')
      toast.error(e?.response?.data?.detail || 'Failed to initiate payment')
    } finally { setLoading(false) }
  }

  const planCards = useMemo(() => ORDERED.filter(p => plans[p]).map(pid => {
    const p = plans[pid]
    const isActive = activePlan === pid
    const popular = pid === 'pro'
    const Icon = ICON_MAP[pid]
    const marketing = MARKETING_FEATURES[pid] || []
    // Determine if this plan is a downgrade relative to activePlan
    const orderIndex = (id: string | null) => id ? ORDERED.indexOf(id as any) : 0
    const isDowngrade = activePlan ? orderIndex(pid) < orderIndex(activePlan) : false
    return { pid, p, isActive, popular, Icon, marketing, isDowngrade }
  }), [plans, activePlan])

  const comparisonFeatures = [
    { key: 'posts', label: 'Job Posting', render: (pid: string) => pid==='free'? '5 total' : pid==='basic'? '36 / yr' : pid==='pro'? '96 / yr' : pid==='premium'? 'Unlimited (single acct)' : 'Unlimited (company)' },
    { key: 'analytics', label: 'Analytics', render: (pid: string) => pid==='premium' || pid==='enterprise'? 'Advanced' : pid==='pro'? 'Basic' : '—' },
    { key: 'support', label: 'Priority Support', render: (pid: string) => pid==='pro' || pid==='premium' || pid==='enterprise'? 'Yes' : '—' },
    { key: 'manager', label: 'Account Manager', render: (pid: string) => pid==='enterprise'? 'Dedicated' : '—' },
    { key: 'seats', label: 'Multiple Employer Seats', render: (pid: string) => pid==='enterprise'? 'Unlimited' : pid==='premium'? 'Single' : 'Single' },
  ]

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h1 className="text-3xl font-bold">Subscription Plans</h1>
        <p className="text-gray-600">Please login as an employer to view and purchase plans.</p>
        <button onClick={() => router.push('/auth/login')} className="px-6 py-3 rounded-lg bg-purple-600 text-white font-medium shadow hover:bg-purple-700">Login</button>
      </div>
    )
  }

  if (user.role !== 'employer') {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-4">
        <LockKeyhole className="w-14 h-14 text-purple-500 mx-auto" />
        <h1 className="text-3xl font-bold">Employers Only</h1>
        <p className="text-gray-600">Subscription management is restricted to employer accounts.</p>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {statusModal.type && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={()=> setStatusModal({type:null})} />
          <div className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
            <div className={cn('p-6 md:p-8 space-y-5',
              statusModal.type==='success' && 'bg-gradient-to-br from-green-600 via-emerald-500 to-teal-500 text-white',
              statusModal.type==='pending' && 'bg-gradient-to-br from-amber-500 via-yellow-500 to-orange-500 text-white',
              statusModal.type==='error' && 'bg-gradient-to-br from-rose-600 via-red-600 to-red-500 text-white'
            )}>
              <div className="flex items-start gap-4">
                {statusModal.type==='success' && <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center ring-1 ring-white/30"><Check className="h-7 w-7"/></div>}
                {statusModal.type==='pending' && <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center ring-1 ring-white/30"><Loader2 className="h-7 w-7 animate-spin"/></div>}
                {statusModal.type==='error' && <div className="h-12 w-12 rounded-xl bg-white/15 flex items-center justify-center ring-1 ring-white/30"><Flame className="h-7 w-7"/></div>}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold tracking-tight">
                    {statusModal.type==='success' && 'Payment Successful'}
                    {statusModal.type==='pending' && 'Payment Processing'}
                    {statusModal.type==='error' && 'Payment Failed'}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed opacity-90">
                    {statusModal.type==='success' && `Your ${statusModal.plan || ''} plan is now active. You can start enjoying the benefits immediately.`}
                    {statusModal.type==='pending' && 'We are waiting for confirmation from the payment gateway. Your subscription will activate once confirmed.'}
                    {statusModal.type==='error' && 'We could not process your payment. No charges were made. You can retry or choose a different method.'}
                  </p>
                  {statusModal.txn && (
                    <div className="mt-3 text-xs font-mono bg-white/10 rounded-md px-3 py-2 inline-block tracking-wide">
                      TXN: {statusModal.txn}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex flex-wrap gap-3 pt-4">
                <button onClick={()=> { setStatusModal({type:null}); router.replace('/subscribe') }} className="px-4 py-2 rounded-lg text-sm font-medium bg-white/20 hover:bg-white/30 backdrop-blur border border-white/30">Close</button>
                {statusModal.type==='error' && <button onClick={()=> { setStatusModal({type:null}); }} className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-rose-600 hover:bg-gray-100">Try Again</button>}
                {statusModal.type==='success' && <button onClick={()=> { router.push('/employer/dashboard') }} className="px-4 py-2 rounded-lg text-sm font-semibold bg-white text-green-600 hover:bg-gray-100">Go to Dashboard</button>}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white via-purple-50 to-white"/>
      <div className="absolute -top-40 -left-32 w-[32rem] h-[32rem] rounded-full bg-purple-200/40 blur-3xl"/>
      <div className="absolute -bottom-40 -right-32 w-[30rem] h-[30rem] rounded-full bg-purple-300/30 blur-3xl"/>

      <div className="relative z-10">
        {/* Hero */}
        <section className="pt-20 pb-12 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-purple-100 text-purple-700 px-4 py-1 text-xs font-semibold tracking-wide mb-6 shadow-sm">
              <ShieldCheck className="h-4 w-4" /> Transparent pricing — scale as you grow
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-purple-700 via-purple-500 to-purple-400 bg-clip-text text-transparent leading-tight">
              Power Up Your Hiring Pipeline
            </h1>
            <p className="mt-6 text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Start free with 5 job posts. Upgrade for more capacity, insights, and efficiency — all within the same familiar workflow.
            </p>
            {/* Inline status removed; toast handles feedback */}
            <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-gray-500">
              <div className="flex items-center gap-1"><Zap className="h-4 w-4 text-purple-500"/> Quick setup</div>
              <div className="flex items-center gap-1"><Headset className="h-4 w-4 text-purple-500"/> Human support</div>
              <div className="flex items-center gap-1"><BarChart3 className="h-4 w-4 text-purple-500"/> Actionable insights</div>
              <div className="flex items-center gap-1"><Infinity className="h-4 w-4 text-purple-500"/> Scale-ready</div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="px-4 pb-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {planCards.map(({pid,p,popular,isActive,Icon,marketing,isDowngrade}) => (
                <div key={pid} className={cn(
                  'relative flex flex-col overflow-hidden rounded-3xl border bg-white backdrop-blur-sm transition-all duration-300',
                  'hover:-translate-y-1 hover:shadow-xl',
                  popular ? 'border-purple-300 shadow-md ring-1 ring-purple-300/60' : 'border-purple-100 shadow-sm',
                  isActive && 'ring-2 ring-purple-500 shadow-lg'
                )}>
                  {popular && (
                    <div className="absolute top-0 right-0 px-3 py-1 text-[10px] font-bold text-white rounded-bl-lg bg-gradient-to-r from-purple-600 to-purple-500 tracking-wide shadow">
                      POPULAR
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute top-0 left-0 px-3 py-1 text-[10px] font-bold text-white rounded-br-lg bg-green-500/90 tracking-wide shadow">
                      ACTIVE
                    </div>
                  )}
                  <div className={cn('px-6 pt-8 pb-6 bg-gradient-to-br', gradientFor(pid))}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={cn('text-xl font-bold', pid==='free' && 'text-gray-900')}>{p.name}</h3>
                        <p className={cn('mt-1 text-xs font-medium tracking-wide uppercase', pid==='pro'||pid==='premium'||pid==='enterprise' ? 'text-purple-100' : 'text-purple-500')}>
                          {pid==='free'? 'Launch': pid==='basic'? 'Essential': pid==='pro'? 'Growth' : pid==='premium'? 'Performance' : 'Scale'}
                        </p>
                      </div>
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-inner ring-1 ring-purple-200">
                        <Icon className={cn('h-6 w-6', pid==='pro'||pid==='premium'||pid==='enterprise' ? 'text-purple-600' : 'text-purple-500')} />
                      </div>
                    </div>
                    <div className="mt-6 flex items-end gap-2">
                      <p className={cn('text-3xl font-extrabold', pid==='pro'||pid==='premium'||pid==='enterprise' ? 'text-white' : 'text-gray-900')}>₹{p.price.toLocaleString()}</p>
                      <span className={cn('text-xs font-medium mb-1', pid==='pro'||pid==='premium'||pid==='enterprise' ? 'text-purple-100' : 'text-gray-500')}>{p.price === 0 ? 'Forever' : 'per year'}</span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col px-6 py-6">
                    <ul className="space-y-3 text-sm flex-1">
                      {marketing.map(m => (
                        <li key={m} className="flex gap-2 items-start">
                          <Check className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
                          <span className="text-gray-700">{m}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      disabled={loading || isActive || initializing || isDowngrade}
                      onClick={() => !isDowngrade && initiate(pid)}
                      className={cn(
                        'mt-6 rounded-xl px-4 py-3 text-sm font-semibold transition-colors shadow-sm border',
                        isActive ? 'bg-green-100 text-green-700 border-green-200 cursor-default' : '',
                        !isActive && !isDowngrade && pid !== 'free' && 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700',
                        !isActive && !isDowngrade && pid === 'free' && 'bg-white text-purple-600 border-purple-300 hover:bg-purple-50',
                        isDowngrade && 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed',
                        (loading || initializing) && 'opacity-60 cursor-not-allowed'
                      )}
                      title={isDowngrade ? 'Downgrade not allowed' : ''}
                    >
                      {isActive ? 'Current Plan' : isDowngrade ? 'Not Available' : pid==='free'? 'Get Started' : 'Upgrade'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-3xl border border-purple-100 bg-white/70 backdrop-blur-md shadow-sm overflow-hidden">
              <div className="px-6 pt-8 pb-4 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><BarChart3 className="h-5 w-5 text-purple-500"/> Feature Comparison</h2>
                  <p className="text-sm text-gray-500 mt-1">Understand how each plan supports your hiring goals.</p>
                </div>
                <Link href="#pricing" className="text-xs font-medium text-purple-600 hover:text-purple-700">Jump to pricing ↑</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-purple-50/60 text-left">
                      <th className="py-3 pl-6 pr-4 font-semibold text-gray-700">Capability</th>
                      {planCards.map(c => (
                        <th key={c.pid} className="py-3 px-4 font-semibold text-gray-700 text-center">{c.p.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map(row => (
                      <tr key={row.key} className="border-t border-purple-100/70">
                        <td className="py-3 pl-6 pr-4 font-medium text-gray-600">{row.label}</td>
                        {planCards.map(c => (
                          <td key={c.pid+row.key} className="py-3 px-4 text-center text-gray-700">{row.render(c.pid)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ / CTA */}
        <section className="px-4 pt-4 pb-24">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Users2 className="h-6 w-6 text-purple-500"/> Frequently Asked</h2>
              <ul className="space-y-5 text-sm text-gray-700">
                <li>
                  <p className="font-semibold text-gray-900">Can I upgrade at any time?</p>
                  <p className="mt-1">Yes. Upgrading activates immediately—remaining value of your previous period can be prorated in future billing iterations.</p>
                </li>
                <li>
                  <p className="font-semibold text-gray-900">What happens when I hit my post limit?</p>
                  <p className="mt-1">You'll be prompted to upgrade; existing posts stay live until expiry.</p>
                </li>
                <li>
                  <p className="font-semibold text-gray-900">Enterprise vs Premium?</p>
                  <p className="mt-1"><span className="font-medium">Premium</span> gives unlimited posts for a single employer account. <span className="font-medium">Enterprise</span> gives unlimited posts across all employer accounts under the same company.</p>
                </li>
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-purple-200 bg-gradient-to-br from-purple-600 via-purple-500 to-purple-400 p-8 text-white shadow-lg">
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)]"/>
              <div className="relative">
                <h3 className="text-2xl font-extrabold mb-3 tracking-tight">Need a tailored solution?</h3>
                <p className="text-purple-100 mb-6 text-sm leading-relaxed">We partner with high-growth teams to deliver custom workflows, integrations and SLAs that reduce time-to-hire.</p>
                <a href="mailto:sales@example.com" className="inline-flex items-center gap-2 rounded-xl bg-white/10 hover:bg-white/20 text-white px-5 py-3 text-sm font-semibold backdrop-blur border border-white/30 transition">
                  <Building2 className="h-4 w-4"/> Contact Sales
                </a>
                <p className="mt-4 text-[11px] text-purple-200">Response within 1 business day.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
