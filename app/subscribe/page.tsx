import type { Metadata } from "next"
import Link from "next/link"
import { Check, Unlock, Briefcase, Rocket, Flame, Crown } from "lucide-react"

export const metadata: Metadata = {
  title: "Subscription Plans | Job Portal",
  description: "Choose the right subscription plan for your hiring needs",
}

export default function SubscriptionPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <div className="container px-4 py-16 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">Choose Your Plan</h1>
          <p className="mt-6 text-xl text-gray-600">Select the perfect subscription plan to meet your hiring needs</p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {/* Free Plan */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-purple-100 shadow-sm transition-all hover:shadow-md">
            <div className="bg-gradient-to-r from-purple-100 to-purple-50 px-6 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Free</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started with basic features</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                  <Unlock className="h-6 w-6 text-purple-400" />
                </div>
              </div>
              <div className="mt-6">
                <p className="text-3xl font-bold text-gray-900">₹0</p>
                <p className="text-sm text-gray-500">Forever free</p>
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-between bg-white px-6 py-8">
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="mr-3 h-5 w-5 shrink-0 text-purple-500" />
                  <p className="text-sm text-gray-600">5 job posts allowed</p>
                </div>
                <div className="flex items-start">
                  <Check className="mr-3 h-5 w-5 shrink-0 text-purple-500" />
                  <p className="text-sm text-gray-600">Basic job listing features</p>
                </div>
                <div className="flex items-start">
                  <Check className="mr-3 h-5 w-5 shrink-0 text-purple-500" />
                  <p className="text-sm text-gray-600">1 user access</p>
                </div>
              </div>
              <Link
                href="/checkout/free"
                className="mt-8 block rounded-lg bg-white px-4 py-3 text-center text-sm font-medium text-purple-600 shadow-sm ring-1 ring-inset ring-purple-200 hover:bg-purple-50 transition-colors"
              >
                Select Plan
              </Link>
            </div>
          </div>

          {/* Basic Plan */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-purple-100 shadow-sm transition-all hover:shadow-md">
            <div className="bg-gradient-to-r from-purple-200 to-purple-100 px-6 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Basic</h3>
                  <p className="mt-1 text-sm text-gray-500">For small businesses</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                  <Briefcase className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <div className="mt-6">
                <p className="text-3xl font-bold text-gray-900">₹2,999</p>
                <p className="text-sm text-gray-500">per year</p>
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-between bg-white px-6 py-8">
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="mr-3 h-5 w-5 shrink-0 text-purple-500" />
                  <p className="text-sm text-gray-600">36 posts per year</p>
                </div>
                <div className="flex items-start">
                  <Check className="mr-3 h-5 w-5 shrink-0 text-purple-500" />
                  <p className="text-sm text-gray-600">3 posts per month</p>
                </div>
                <div className="flex items-start">
                  <Check className="mr-3 h-5 w-5 shrink-0 text-purple-500" />
                  <p className="text-sm text-gray-600">1 user access</p>
                </div>
              </div>
              <Link
                href="/checkout/basic"
                className="mt-8 block rounded-lg bg-white px-4 py-3 text-center text-sm font-medium text-purple-600 shadow-sm ring-1 ring-inset ring-purple-200 hover:bg-purple-50 transition-colors"
              >
                Select Plan
              </Link>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-purple-200 shadow-lg transition-all hover:shadow-xl relative">
            <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
              POPULAR
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-400 px-6 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">Pro</h3>
                  <p className="mt-1 text-sm text-purple-100">For growing teams</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                  <Rocket className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <div className="mt-6">
                <p className="text-3xl font-bold text-white">₹4,999</p>
                <p className="text-sm text-purple-100">per year</p>
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-between bg-white px-6 py-8">
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="mr-3 h-5 w-5 shrink-0 text-purple-500" />
                  <p className="text-sm text-gray-600">96 posts per year</p>
                </div>
                <div className="flex items-start">
                  <Check className="mr-3 h-5 w-5 shrink-0 text-purple-500" />
                  <p className="text-sm text-gray-600">8 posts per month</p>
                </div>
                <div className="flex items-start">
                  <Check className="mr-3 h-5 w-5 shrink-0 text-purple-500" />
                  <p className="text-sm text-gray-600">1 user access</p>
                </div>
                <div className="flex items-start">
                  <Check className="mr-3 h-5 w-5 shrink-0 text-purple-500" />
                  <p className="text-sm text-gray-600">Priority support</p>
                </div>
              </div>
              <Link
                href="/checkout/pro"
                className="mt-8 block rounded-lg bg-purple-600 px-4 py-3 text-center text-sm font-medium text-white shadow-sm hover:bg-purple-700 transition-colors"
              >
                Select Plan
              </Link>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-purple-100 shadow-sm transition-all hover:shadow-md">
            <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-6 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">Premium</h3>
                  <p className="mt-1 text-sm text-purple-100">For power users</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                  <Flame className="h-6 w-6 text-purple-500" />
                </div>
              </div>
              <div className="mt-6">
                <p className="text-3xl font-bold text-white">₹9,999</p>
                <p className="text-sm text-purple-100">per year</p>
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-between bg-white px-6 py-8">
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="mr-3 h-5 w-5 shrink-0 text-purple-500" />
                  <p className="text-sm text-gray-600">Unlimited posts per year</p>
                </div>
                <div className="flex items-start">
                  <Check className="mr-3 h-5 w-5 shrink-0 text-purple-500" />
                  <p className="text-sm text-gray-600">1 user access</p>
                </div>
                <div className="flex items-start">
                  <Check className="mr-3 h-5 w-5 shrink-0 text-purple-500" />
                  <p className="text-sm text-gray-600">Priority support</p>
                </div>
                <div className="flex items-start">
                  <Check className="mr-3 h-5 w-5 shrink-0 text-purple-500" />
                  <p className="text-sm text-gray-600">Advanced analytics</p>
                </div>
              </div>
              <Link
                href="/checkout/premium"
                className="mt-8 block rounded-lg bg-white px-4 py-3 text-center text-sm font-medium text-purple-600 shadow-sm ring-1 ring-inset ring-purple-200 hover:bg-purple-50 transition-colors"
              >
                Select Plan
              </Link>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="flex flex-col overflow-hidden rounded-2xl border border-purple-100 shadow-sm transition-all hover:shadow-md">
            <div className="bg-gradient-to-r from-purple-800 to-purple-700 px-6 py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-white">Enterprise</h3>
                  <p className="mt-1 text-sm text-purple-100">For large organizations</p>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm">
                  <Crown className="h-6 w-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-6">
                <p className="text-3xl font-bold text-white">₹19,999</p>
                <p className="text-sm text-purple-100">per year</p>
              </div>
            </div>
            <div className="flex flex-1 flex-col justify-between bg-white px-6 py-8">
              <div className="space-y-4">
                <div className="flex items-start">
                  <Check className="mr-3 h-5 w-5 shrink-0 text-purple-500" />
                  <p className="text-sm text-gray-600">Unlimited posts per year</p>
                </div>
                <div className="flex items-start">
                  <Check className="mr-3 h-5 w-5 shrink-0 text-purple-500" />
                  <p className="text-sm text-gray-600">Unlimited user access</p>
                </div>
                <div className="flex items-start">
                  <Check className="mr-3 h-5 w-5 shrink-0 text-purple-500" />
                  <p className="text-sm text-gray-600">Same company email/login</p>
                </div>
                <div className="flex items-start">
                  <Check className="mr-3 h-5 w-5 shrink-0 text-purple-500" />
                  <p className="text-sm text-gray-600">Dedicated account manager</p>
                </div>
                <div className="flex items-start">
                  <Check className="mr-3 h-5 w-5 shrink-0 text-purple-500" />
                  <p className="text-sm text-gray-600">Custom integrations</p>
                </div>
              </div>
              <Link
                href="/checkout/enterprise"
                className="mt-8 block rounded-lg bg-white px-4 py-3 text-center text-sm font-medium text-purple-600 shadow-sm ring-1 ring-inset ring-purple-200 hover:bg-purple-50 transition-colors"
              >
                Select Plan
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <h2 className="text-2xl font-semibold text-gray-900">Need a custom plan?</h2>
          <p className="mt-2 text-gray-600">Contact our sales team for a tailored solution</p>
          <Link
            href="#"
            className="mt-4 inline-block rounded-lg bg-purple-600 px-6 py-3 text-center text-sm font-medium text-white shadow-sm hover:bg-purple-700 transition-colors"
          >
            Contact Sales
          </Link>
        </div>
      </div>
    </div>
  )
}
