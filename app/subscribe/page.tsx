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
    "Single employer seat"
  ],
  pro: [
    "96 posts / year (8 / month)",
    "Standard visibility boost",
    "Single employer seat"
  ],
  premium: [
    "Access to 5 employer mail IDs",
    "Standard visibility boost",
    "Same company access",
  ],
  enterprise: [
    "Access to job fair",
    "Unlimited access to employer of same company",
    "Direct access to colleges and institutions",
    "Dedicated account manager"
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
    case 'free': return 'from-light-cream via-white to-light-cream/80'
    case 'basic': return 'from-primary/10 via-primary/5 to-accent/10'
    case 'pro': return 'from-primary via-accent to-primary'
    case 'premium': return 'from-accent via-primary to-accent'
    case 'enterprise': return 'from-dark-gray via-foreground to-dark-gray'
    default: return 'from-light-cream via-white to-light-cream/80'
  }
}

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
    { key: 'posts', label: 'Job Posting', render: (pid: string) => pid==='free'? '5 total' : pid==='basic'? '36 / yr' : pid==='pro'? '96 / yr' : pid==='premium'? 'Access to 5 employer IDs' : 'Unlimited (company)' },
    { key: 'analytics', label: 'Analytics', render: (pid: string) => pid==='premium' || pid==='enterprise'? 'Advanced' : pid==='pro'? 'Basic' : '—' },
    { key: 'support', label: 'Priority Support', render: (pid: string) => pid==='pro' || pid==='premium' || pid==='enterprise'? 'Yes' : '—' },
    { key: 'manager', label: 'Account Manager', render: (pid: string) => pid==='enterprise'? 'Dedicated' : '—' },
    { key: 'seats', label: 'Multiple Employer Seats', render: (pid: string) => pid==='enterprise'? 'Unlimited' : pid==='premium'? '5 accounts' : 'Single' },
  ]

  if (!user) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Subscription Plans</h1>
        <p className="text-muted-foreground">Please login as an employer to view and purchase plans.</p>
        <button onClick={() => router.push('/auth/login')} className="px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium shadow hover:bg-accent">Login</button>
      </div>
    )
  }

  if (user.role !== 'employer') {
    return (
      <div className="max-w-lg mx-auto py-20 text-center space-y-4">
        <LockKeyhole className="w-14 h-14 text-primary mx-auto" />
        <h1 className="text-3xl font-bold text-foreground">Employers Only</h1>
        <p className="text-muted-foreground">Subscription management is restricted to employer accounts.</p>
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
  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background via-light-cream to-background"/>
  <div className="absolute -top-40 -left-32 w-[32rem] h-[32rem] rounded-full bg-primary/20 blur-3xl"/>
  <div className="absolute -bottom-40 -right-32 w-[30rem] h-[30rem] rounded-full bg-accent/20 blur-3xl"/>

      <div className="relative z-10">
        {/* Hero */}
        <section className="pt-20 pb-12 px-4">
          <div className="max-w-5xl mx-auto text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-light-cream text-primary px-4 py-1 text-xs font-semibold tracking-wide mb-6 shadow-sm">
              <ShieldCheck className="h-4 w-4 text-primary" /> Transparent pricing — scale as you grow
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary via-accent to-foreground bg-clip-text text-transparent leading-tight">
              Power Up Your Hiring Pipeline
            </h1>
            <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
              Start free with 5 job posts. Upgrade for more capacity, insights, and efficiency — all within the same familiar workflow.
            </p>
            {/* Inline status removed; toast handles feedback */}
            <div className="mt-8 flex flex-wrap justify-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1"><Zap className="h-4 w-4 text-primary"/> Quick setup</div>
              <div className="flex items-center gap-1"><Headset className="h-4 w-4 text-primary"/> Human support</div>
              <div className="flex items-center gap-1"><BarChart3 className="h-4 w-4 text-primary"/> Actionable insights</div>
              <div className="flex items-center gap-1"><Infinity className="h-4 w-4 text-primary"/> Scale-ready</div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="px-4 pb-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {planCards.map(({pid,p,popular,isActive,Icon,marketing,isDowngrade}) => (
                <div key={pid} className={cn(
                  'relative flex flex-col overflow-hidden rounded-3xl border backdrop-blur-sm transition-all duration-300',
                  'hover:-translate-y-2 hover:shadow-2xl',
                  popular ? 'border-primary/30 shadow-lg ring-2 ring-primary/20' : 'border-border/50 shadow-md',
                  isActive && 'ring-2 ring-green-400/50 shadow-xl',
                  'bg-white/80'
                )}>
                  {popular && (
                    <div className="absolute top-0 right-0 px-3 py-1 text-[10px] font-bold text-white rounded-bl-lg bg-gradient-to-r from-primary to-accent tracking-wide shadow-md">
                      POPULAR
                    </div>
                  )}
                  {isActive && (
                    <div className="absolute top-0 left-0 px-3 py-1 text-[10px] font-bold text-white rounded-br-lg bg-gradient-to-r from-green-500 to-emerald-500 tracking-wide shadow-md">
                      ACTIVE
                    </div>
                  )}
                  <div className={cn('px-6 pt-8 pb-6 bg-gradient-to-br', gradientFor(pid))}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className={cn('text-xl font-bold', 
                          pid==='free' && 'text-foreground',
                          pid==='basic' && 'text-foreground',
                          (pid==='pro' || pid==='premium') && 'text-white',
                          pid==='enterprise' && 'text-white'
                        )}>{p.name}</h3>
                        <p className={cn('mt-1 text-xs font-medium tracking-wide uppercase',
                          pid==='free' && 'text-muted-foreground',
                          pid==='basic' && 'text-primary',
                          (pid==='pro' || pid==='premium') && 'text-white/80',
                          pid==='enterprise' && 'text-white/80'
                        )}>
                          {pid==='free'? 'Launch': pid==='basic'? 'Essential': pid==='pro'? 'Growth' : pid==='premium'? 'Performance' : 'Scale'}
                        </p>
                      </div>
                      <div className={cn('flex h-12 w-12 items-center justify-center rounded-2xl shadow-inner ring-1',
                        pid==='free' && 'bg-white ring-border',
                        pid==='basic' && 'bg-white ring-primary/20',
                        (pid==='pro' || pid==='premium') && 'bg-white/10 ring-white/20',
                        pid==='enterprise' && 'bg-white/10 ring-white/20'
                      )}>
                        <Icon className={cn('h-6 w-6',
                          pid==='free' && 'text-muted-foreground',
                          pid==='basic' && 'text-primary',
                          (pid==='pro' || pid==='premium') && 'text-white',
                          pid==='enterprise' && 'text-white'
                        )} />
                      </div>
                    </div>
                    <div className="mt-6 flex items-end gap-2">
                      <p className={cn('text-3xl font-extrabold',
                        pid==='free' && 'text-foreground',
                        pid==='basic' && 'text-foreground',
                        (pid==='pro' || pid==='premium') && 'text-white',
                        pid==='enterprise' && 'text-white'
                      )}>₹{p.price.toLocaleString()}</p>
                      <span className={cn('text-xs font-medium mb-1',
                        pid==='free' && 'text-muted-foreground',
                        pid==='basic' && 'text-muted-foreground',
                        (pid==='pro' || pid==='premium') && 'text-white/70',
                        pid==='enterprise' && 'text-white/70'
                      )}>{p.price === 0 ? 'Forever' : 'per year'}</span>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col px-6 py-6 bg-white/50">
                    <ul className="space-y-3 text-sm flex-1">
                      {marketing.map(m => (
                        <li key={m} className="flex gap-3 items-start">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 mt-0.5 shrink-0">
                            <Check className="h-3 w-3 text-primary" />
                          </div>
                          <span className="text-foreground/90 leading-relaxed">{m}</span>
                        </li>
                      ))}
                    </ul>
                    <button
                      disabled={loading || isActive || initializing || isDowngrade}
                      onClick={() => !isDowngrade && initiate(pid)}
                      className={cn(
                        'mt-6 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 shadow-sm border',
                        'focus:outline-none focus:ring-2 focus:ring-offset-2',
                        isActive && 'bg-green-50 text-green-700 border-green-200 cursor-default focus:ring-green-300',
                        !isActive && !isDowngrade && pid !== 'free' && 'bg-primary text-white border-primary hover:bg-accent hover:border-accent focus:ring-primary/50 shadow-lg hover:shadow-xl',
                        !isActive && !isDowngrade && pid === 'free' && 'bg-white text-primary border-primary/30 hover:bg-primary hover:text-white focus:ring-primary/50',
                        isDowngrade && 'bg-muted text-muted-foreground border-border cursor-not-allowed',
                        (loading || initializing) && 'opacity-60 cursor-not-allowed'
                      )}
                      title={isDowngrade ? 'Downgrade not allowed' : ''}
                    >
                      {isActive ? '✓ Current Plan' : isDowngrade ? 'Not Available' : pid==='free'? 'Get Started' : 'Upgrade Now'}
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
            <div className="rounded-3xl border border-border bg-card/70 backdrop-blur-md shadow-sm overflow-hidden">
              <div className="px-6 pt-8 pb-4 flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2"><BarChart3 className="h-5 w-5 text-primary"/> Feature Comparison</h2>
                  <p className="text-sm text-muted-foreground mt-1">Understand how each plan supports your hiring goals.</p>
                </div>
                <Link href="#pricing" className="text-xs font-medium text-primary hover:text-accent">Jump to pricing ↑</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-light-cream/60 text-left">
                      <th className="py-3 pl-6 pr-4 font-semibold text-muted-foreground">Capability</th>
                      {planCards.map(c => (
                        <th key={c.pid} className="py-3 px-4 font-semibold text-muted-foreground text-center">{c.p.name}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {comparisonFeatures.map(row => (
                      <tr key={row.key} className="border-t border-border/70">
                        <td className="py-3 pl-6 pr-4 font-medium text-muted-foreground">{row.label}</td>
                        {planCards.map(c => (
                          <td key={c.pid+row.key} className="py-3 px-4 text-center text-foreground">{row.render(c.pid)}</td>
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
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><Users2 className="h-6 w-6 text-primary"/> Frequently Asked</h2>
              <ul className="space-y-5 text-sm text-foreground">
                <li>
                  <p className="font-semibold text-foreground">Can I upgrade at any time?</p>
                  <p className="mt-1 text-muted-foreground">Yes. Upgrading activates immediately—remaining value of your previous period can be prorated in future billing iterations.</p>
                </li>
                <li>
                  <p className="font-semibold text-foreground">What happens when I hit my post limit?</p>
                  <p className="mt-1 text-muted-foreground">You'll be prompted to upgrade; existing posts stay live until expiry.</p>
                </li>
                <li>
                  <p className="font-semibold text-foreground">Enterprise vs Premium?</p>
                  <p className="mt-1 text-muted-foreground"><span className="font-medium">Premium</span> gives unlimited posts for a single employer account. <span className="font-medium">Enterprise</span> gives unlimited posts across all employer accounts under the same company.</p>
                </li>
              </ul>
            </div>
            <div className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/90 via-accent to-primary shadow-xl">
              <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,white,transparent_60%)]"/>
              <div className="relative p-8">
                <h3 className="text-2xl font-extrabold mb-3 tracking-tight text-white">Need a tailored solution?</h3>
                <p className="text-white/90 mb-6 text-sm leading-relaxed">We partner with high-growth teams to deliver custom workflows, integrations and SLAs that reduce time-to-hire.</p>
                <a href="mailto:sales@example.com" className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 text-white px-5 py-3 text-sm font-semibold backdrop-blur border border-white/20 transition-all duration-200 shadow-md hover:shadow-lg">
                  <Building2 className="h-4 w-4"/> Contact Sales
                </a>
                <p className="mt-4 text-[11px] text-white/75">Response within 1 business day.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
