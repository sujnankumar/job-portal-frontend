"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Briefcase, Check, CreditCard, Crown, Flame, Loader2, Rocket, Unlock } from "lucide-react"

// Define plan details with icon components instead of emojis
const planDetails = {
  free: {
    name: "Free Plan",
    price: "₹0",
    period: "Forever free",
    features: ["5 job posts allowed", "Basic job listing features", "1 user access"],
    icon: Unlock,
  },
  basic: {
    name: "Basic Plan",
    price: "₹2,999",
    period: "per year",
    features: ["36 posts per year", "3 posts per month", "1 user access"],
    icon: Briefcase,
  },
  pro: {
    name: "Pro Plan",
    price: "₹4,999",
    period: "per year",
    features: ["96 posts per year", "8 posts per month", "1 user access", "Priority support"],
    icon: Rocket,
  },
  premium: {
    name: "Premium Plan",
    price: "₹9,999",
    period: "per year",
    features: ["Unlimited posts per year", "1 user access", "Priority support", "Advanced analytics"],
    icon: Flame,
  },
  enterprise: {
    name: "Enterprise Plan",
    price: "₹19,999",
    period: "per year",
    features: [
      "Unlimited posts per year",
      "Unlimited user access",
      "Same company email/login",
      "Dedicated account manager",
      "Custom integrations",
    ],
    icon: Crown,
  },
}

export default function CheckoutPage({ params }: { params: { plan: string } }) {
  const router = useRouter()
  const [upiId, setUpiId] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPaymentComplete, setIsPaymentComplete] = useState(false)
  const [error, setError] = useState("")

  const plan = planDetails[params.plan as keyof typeof planDetails]

  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Plan not found</h1>
          <p className="mt-2 text-gray-600">The selected plan does not exist.</p>
          <Link
            href="/subscribe"
            className="mt-4 inline-block rounded-lg bg-purple-600 px-6 py-3 text-center text-sm font-medium text-white shadow-sm hover:bg-purple-700 transition-colors"
          >
            Back to Plans
          </Link>
        </div>
      </div>
    )
  }

  // Get the icon component for the selected plan
  const PlanIcon = plan.icon

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!upiId) {
      setError("Please enter a valid UPI ID")
      return
    }

    if (!upiId.includes("@")) {
      setError("UPI ID must contain @ symbol")
      return
    }

    setError("")
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setIsPaymentComplete(true)
    }, 2000)
  }

  if (isPaymentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-500 to-purple-400 px-6 py-8 text-center">
              <div className="mx-auto w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-md">
                <Check className="h-8 w-8 text-purple-500" />
              </div>
              <h1 className="text-2xl font-bold text-white">Payment Successful!</h1>
              <p className="mt-2 text-purple-100">Your subscription has been activated</p>
            </div>

            <div className="px-6 py-8">
              <div className="mb-6 p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center mr-3">
                    <PlanIcon className="h-6 w-6 text-purple-500" />
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">{plan.name}</h2>
                    <p className="text-sm text-gray-600">
                      {plan.price} {plan.period}
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 mb-6">
                Thank you for your purchase! Your subscription is now active and you can start using all the features
                included in your plan.
              </p>

              <div className="flex flex-col space-y-3">
                <Link
                  href="/employer/dashboard"
                  className="block rounded-lg bg-purple-600 px-4 py-3 text-center text-sm font-medium text-white shadow-sm hover:bg-purple-700 transition-colors"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="/subscribe"
                  className="block rounded-lg bg-white px-4 py-3 text-center text-sm font-medium text-purple-600 shadow-sm ring-1 ring-inset ring-purple-200 hover:bg-purple-50 transition-colors"
                >
                  View All Plans
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/subscribe"
            className="inline-flex items-center text-sm font-medium text-purple-600 hover:text-purple-800 mb-8"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Plans
          </Link>

          <div className="grid gap-8 md:grid-cols-5">
            <div className="md:col-span-2">
              <div className="bg-white rounded-2xl shadow-md overflow-hidden sticky top-8">
                <div className="bg-gradient-to-r from-purple-500 to-purple-400 px-6 py-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                      <p className="mt-1 text-sm text-purple-100">Order Summary</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-md">
                      <PlanIcon className="h-6 w-6 text-purple-500" />
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="text-3xl font-bold text-white">{plan.price}</p>
                    <p className="text-sm text-purple-100">{plan.period}</p>
                  </div>
                </div>

                <div className="px-6 py-8">
                  <h4 className="font-medium text-gray-900 mb-4">Plan includes:</h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="mr-3 h-5 w-5 shrink-0 text-purple-500" />
                        <p className="text-sm text-gray-600">{feature}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            <div className="md:col-span-3">
              <div className="bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="px-6 py-8 border-b border-gray-200">
                  <h2 className="text-2xl font-bold text-gray-900">Payment Details</h2>
                  <p className="mt-2 text-gray-600">Complete your purchase by providing payment information</p>
                </div>

                <form onSubmit={handleSubmit} className="px-6 py-8">
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="upi" className="block text-sm font-medium text-gray-700 mb-2">
                        UPI ID
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="upi"
                          placeholder="yourname@upi"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className={`block w-full rounded-lg border ${error ? "border-red-300" : "border-gray-300"} px-4 py-3 text-gray-900 shadow-sm focus:border-purple-500 focus:ring-purple-500`}
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <CreditCard className="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
                      <p className="mt-2 text-sm text-gray-500">
                        We accept all UPI payment methods including PhonePe, Google Pay, and Paytm
                      </p>
                    </div>

                    <div className="pt-4">
                      <button
                        type="submit"
                        disabled={isProcessing}
                        className="w-full rounded-lg bg-purple-600 px-4 py-3 text-center text-sm font-medium text-white shadow-sm hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-70 transition-colors"
                      >
                        {isProcessing ? (
                          <span className="flex items-center justify-center">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </span>
                        ) : (
                          "Proceed to Pay"
                        )}
                      </button>
                    </div>

                    <div className="text-center">
                      <p className="text-xs text-gray-500">
                        By proceeding, you agree to our Terms of Service and Privacy Policy
                      </p>
                    </div>
                  </div>
                </form>
              </div>

              <div className="mt-8 bg-white rounded-2xl shadow-md overflow-hidden">
                <div className="px-6 py-6">
                  <h3 className="font-medium text-gray-900 mb-4">Secure Payment</h3>
                  <p className="text-sm text-gray-600">
                    All payments are secured with industry-standard encryption. Your payment information is never stored
                    on our servers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
