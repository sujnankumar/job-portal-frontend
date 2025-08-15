import Link from "next/link";

export const metadata = {
  title: "Terms of Service | JobHunt",
  description: "Terms of Service for JobHunt platform (Job Seekers & Employers)."
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8 md:p-12 space-y-10">
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-dark-gray">Terms of Service</h1>
          <p className="text-gray-500 text-sm">Last updated: {new Date().getFullYear()}</p>
          <p className="text-gray-600">These Terms govern your access to and use of the JobHunt platform (the "Platform"). By creating an account or using the Platform you agree to these Terms.</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">1. Key Definitions</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm leading-relaxed">
            <li><strong>Job Seeker</strong>: An individual using the Platform to discover, apply for, or manage job opportunities. 100% free.</li>
            <li><strong>Employer</strong>: A company representative or recruiter posting jobs or managing applicants.</li>
            <li><strong>Subscription / Plan</strong>: An employer access level defining job posting limits and feature scope.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">2. Accounts & Eligibility</h2>
          <p className="text-gray-700 text-sm leading-relaxed">You must provide accurate information during registration. You are responsible for safeguarding your credentials. We may suspend or terminate accounts that provide misleading, fraudulent, or abusive content.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">3. Free Access for Job Seekers</h2>
          <p className="text-gray-700 text-sm leading-relaxed">Job seekers can browse jobs, apply, track applications, use resume tools, and receive notifications without any fees. We will not charge job seekers for core functionality. Premium employer plans do not impact seeker access.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">4. Employer Plans & Posting Limits</h2>
          <p className="text-gray-700 text-sm leading-relaxed">Employers receive an initial <strong>Free Plan</strong> that allows up to <strong>5 total job postings per year (hard cap)</strong>. To exceed this limit or unlock enhanced features (higher posting volume, analytics, enterprise scope), an upgrade to a paid plan is required.</p>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm leading-relaxed">
            <li>Free Plan: Up to 5 total postings / year.</li>
            <li>Basic / Pro / Premium Plans: Higher monthly & yearly limits as displayed during checkout.</li>
            <li>Enterprise: Unlimited postings (company-wide) subject to fair-use and anti-spam policies.</li>
            <li>Posting counters reset monthly and yearly as defined per plan; enterprise plans may still track usage internally.</li>
          </ul>
          <p className="text-gray-700 text-sm leading-relaxed">Attempting to bypass limits (duplicate roles, spam postings, artificial rotation) may result in suspension.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">5. Payments & Renewals (Employers)</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm leading-relaxed">
            <li>Paid plans activate upon successful payment confirmation via our payment provider.</li>
            <li>Plan snapshots are stored at purchase time; feature or price changes do not retroactively alter existing active periods.</li>
            <li>No refunds for periods already consumed unless required by applicable law.</li>
            <li>Failure or reversal of payment may downgrade or deactivate the associated subscription.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">6. Acceptable Use</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm leading-relaxed">
            <li>No posting misleading, discriminatory, or illegal job ads.</li>
            <li>No scraping, automated harvesting, or bulk unsolicited messaging.</li>
            <li>No sharing of access tokens or selling accounts.</li>
            <li>No uploading malware or abusing infrastructure.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">7. Content & Licensing</h2>
            <p className="text-gray-700 text-sm leading-relaxed">You retain ownership of the content you submit (profiles, postings, messages). You grant us a worldwide, non-exclusive, royalty-free license to host, index, and display that content solely to operate and promote the Platform.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">8. Suspension & Termination</h2>
          <p className="text-gray-700 text-sm leading-relaxed">We may suspend or terminate access for policy violations, legal risk, fraud, or security concerns. Employers with active subscriptions may lose remaining time if termination stems from a breach.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">9. Disclaimers</h2>
          <p className="text-gray-700 text-sm leading-relaxed">We do not guarantee hiring outcomes, candidate quality, or uninterrupted availability. To the fullest extent permitted by law, the Platform is provided "as is".</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">10. Limitation of Liability</h2>
          <p className="text-gray-700 text-sm leading-relaxed">Our aggregate liability for any claim arising out of these Terms or your use of the Platform will not exceed the greater of (a) fees paid by the employer in the past 12 months, or (b) USD $50 for job seekers (who pay no platform fees).</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">11. Changes to These Terms</h2>
          <p className="text-gray-700 text-sm leading-relaxed">We may update Terms to reflect product, legal, or security changes. Material changes will be announced in-app or via email. Continued use constitutes acceptance.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">12. Contact</h2>
          <p className="text-gray-700 text-sm leading-relaxed">Questions? Contact our support team. By using the Platform you acknowledge you have read and agree to these Terms.</p>
        </section>

        <footer className="pt-4 border-t border-purple-100 text-xs text-gray-500 flex flex-col gap-1">
          <p>Also see our <Link href="/privacy" className="text-accent hover:underline">Privacy Policy</Link>.</p>
          <p>&copy; {new Date().getFullYear()} JobHunt. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
