"use client"

import HomePage from "@/components/home-page"

export default function Home() {

  // useEffect(() => {
  //   if (isAuthenticated) {
  //     if (user?.role === "applicant") {
  //       router.push("/dashboard")
  //     } else if (user?.role === "employer") {
  //       router.push("/employer/dashboard")
  //     }
  //   }
  // }, [isAuthenticated, user, router])

  return (
    
      <HomePage />
  )
}
