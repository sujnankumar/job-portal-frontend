import Link from "next/link"
import Image from "next/image"
import { Facebook, Twitter, Instagram, Linkedin, Mail } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Logo and Description */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center mb-4">
              <Image src="/abstract-geometric-logo.png" alt="JobPortal Logo" width={40} height={40} className="mr-2" />
              <span className="text-xl font-bold text-dark-gray">JobPortal</span>
            </Link>
            <p className="text-gray-600 mb-6">
              Connecting talented professionals with great companies. Find your dream job or the perfect candidate with
              JobPortal.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-accent" aria-label="Facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent" aria-label="Instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-accent" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* For Job Seekers */}
          <div>
            <h3 className="text-dark-gray font-semibold mb-4">For Job Seekers</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/jobs" className="text-gray-600 hover:text-accent">
                  Browse Jobs
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-600 hover:text-accent">
                  My Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* For Employers */}
          <div>
            <h3 className="text-dark-gray font-semibold mb-4">For Employers</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/employer/dashboard/post-job" className="text-gray-600 hover:text-accent">
                  Post a Job
                </Link>
              </li>
              <li>
                <Link href="/employer/dashboard" className="text-gray-600 hover:text-accent">
                  Employer Dashboard
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-gray-600 hover:text-accent">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/testimonials" className="text-gray-600 hover:text-accent">
                  Testimonials
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Support */}
          <div>
            <h3 className="text-dark-gray font-semibold mb-4">Contact & Support</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-600 hover:text-accent">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-accent">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 hover:text-accent">
                  Privacy Policy
                </Link>
              </li>
                <li>
                  <Link href="/terms" className="text-gray-600 hover:text-accent">
                    Terms of Service
                  </Link>
                </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} JobPortal. All rights reserved.
          </p>
          </div>
      </div>
    </footer>
  )
}
