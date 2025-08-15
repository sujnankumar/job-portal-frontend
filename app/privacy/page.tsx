import Link from "next/link";

export const metadata = {
  title: "Privacy Policy | JobHunt",
  description: "Privacy practices for JobHunt platform (Job Seekers & Employers)."
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8 md:p-12 space-y-10">
        <header className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-dark-gray">Privacy Policy</h1>
          <p className="text-gray-500 text-sm">Last updated: {new Date().getFullYear()}</p>
          <p className="text-gray-600">This Privacy Policy explains how we collect, use, disclose, and safeguard personal information when you use the JobHunt platform (the "Platform").</p>
        </header>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">1. Summary & Core Principle</h2>
          <p className="text-gray-700 text-sm leading-relaxed">Job seekers use the Platform completely free. We only collect the minimum data required to match talent with opportunities. Employer billing information is collected solely to enable paid plan upgrades beyond the free 5-post quota.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">2. Information We Collect</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm leading-relaxed">
            <li><strong>Account Data</strong>: Name, email, role (job seeker or employer), hashed password.</li>
            <li><strong>Profile Data (Seekers)</strong>: Resume details, skills, experience, education, links, uploaded resume (stored securely), optional preferences.</li>
            <li><strong>Job Post Data (Employers)</strong>: Role descriptions, location (or remote), compensation ranges, internal tags.</li>
            <li><strong>Application Data</strong>: Status changes, messages, interview scheduling metadata, recruiter comments (internal).</li>
            <li><strong>Billing Data (Employers Only)</strong>: Transaction IDs, plan snapshot, masked payment references via our payment processor (we do not store full card or sensitive instrument details).</li>
            <li><strong>Technical Data</strong>: IP (truncated where possible), device/browser info, timestamps, basic usage logs for fraud prevention and performance.</li>
            <li><strong>Communications</strong>: Support tickets, notification preferences, email interaction signals (open / bounce where supported).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">3. How We Use Information</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm leading-relaxed">
            <li>Provide core platform features (job discovery, application tracking, messaging).</li>
            <li>Facilitate interview scheduling and status updates.</li>
            <li>Enforce job posting limits and manage employer subscriptions.</li>
            <li>Send security, transactional, and optional product emails.</li>
            <li>Prevent abuse, spam, fraud, and security incidents.</li>
            <li>Improve relevance (recommendations, ranking) using aggregated signals.</li>
            <li>Comply with legal obligations and enforce Terms.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">4. Legal Bases (Where Applicable)</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm leading-relaxed">
            <li>Contract performance (account, applications, interviews).</li>
            <li>Legitimate interest (platform security, service improvement, limited analytics).</li>
            <li>Consent (optional marketing, certain cookies if implemented).</li>
            <li>Legal obligation (tax, fraud response, compliance).</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">5. Data Sharing</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm leading-relaxed">
            <li>Employers see only applicant information submitted to their postings.</li>
            <li>Job seekers never see private employer billing or internal hiring notes (unless intentionally shared).</li>
            <li>Third-party providers (infrastructure, email delivery, payment processor) receive only the minimum required data.</li>
            <li>We do not sell personal data.</li>
            <li>Disclosures may occur if required by law or to prevent harm/security threats.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">6. Security</h2>
          <p className="text-gray-700 text-sm leading-relaxed">We use industry-aligned practices: hashed passwords, role-based data access, encrypted transport, environment-isolated infrastructure, audit-oriented logging (minimized PII). No system is perfectly secure; promptly notify us of suspected exposure.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">7. Data Retention</h2>
          <p className="text-gray-700 text-sm leading-relaxed">Core account and application data is retained while your account is active. Inactive accounts may be archived or anonymized after a reasonable period. Password reset tokens and pending payment intents use short-lived TTL logic. Logs rotate and age out per operational needs.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">8. Your Choices & Rights</h2>
          <ul className="list-disc pl-6 space-y-2 text-gray-700 text-sm leading-relaxed">
            <li>Access / update profile data in-app.</li>
            <li>Request deletion of your account (irreversible for applications and messaging context).</li>
            <li>Opt-out of non-essential emails.</li>
            <li>Disable or clear cookies (if/when implemented) via browser settings.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">9. International Transfers</h2>
          <p className="text-gray-700 text-sm leading-relaxed">Data may be processed in jurisdictions where our infrastructure or providers operate. We take steps to ensure adequate protection consistent with this Policy.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">10. Updates</h2>
          <p className="text-gray-700 text-sm leading-relaxed">We may update this Policy for product, legal, or transparency reasons. Material changes will be surfaced in-app or by email. Continued use indicates acceptance.</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-purple-700">11. Contact</h2>
          <p className="text-gray-700 text-sm leading-relaxed">Questions or requests? Reach out to our support channel. We aim to respond promptly to privacy-related inquiries.</p>
        </section>

        <footer className="pt-4 border-t border-purple-100 text-xs text-gray-500 flex flex-col gap-1">
          <p>Also read our <Link href="/terms" className="text-accent hover:underline">Terms of Service</Link>.</p>
          <p>&copy; {new Date().getFullYear()} JobHunt. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}
