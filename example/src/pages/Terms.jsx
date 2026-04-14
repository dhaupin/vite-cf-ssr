/**
 * Terms of Service page for Prestruct
 * A build-time prerender layer for Vite + React + Cloudflare Pages apps
 */

import usePageMeta from '../hooks/usePageMeta.js'

export default function Terms() {
  usePageMeta({
    path:        '/terms',
    title:       'Terms of Service | Prestruct',
    description: "Terms of Service for Prestruct - a lightweight build-time prerender layer for Vite + React on Cloudflare Pages.",
  })

  return (
    <div className="page-hero">
      <div className="container">
        <div className="page-kicker">legal</div>
        <h1 className="page-heading">Terms of Service</h1>
        <p className="page-sub">
          Last updated: 2026
        </p>
      </div>

      <div className="container">
        <div className="u-mt-2" style={{ maxWidth: '680px' }}>
          <section className="u-mb-2">
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
              1. Acceptance of Terms
            </h2>
            <p style={{ color: 'var(--text-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
              By accessing and using Prestruct, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
          </section>

          <section className="u-mb-2">
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
              2. Use License
            </h2>
            <p style={{ color: 'var(--text-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
              Permission is granted to temporarily use Prestruct for personal or commercial projects. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul style={{ color: 'var(--text-2)', lineHeight: '1.9', paddingLeft: '1.25rem', marginBottom: '1rem' }}>
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or public display</li>
              <li>Attempt to reverse engineer any software contained in Prestruct</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section className="u-mb-2">
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
              3. No Warranty
            </h2>
            <p style={{ color: 'var(--text-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
              Prestruct is provided "as is" without warranty of any kind, express or implied. We do not warrant that Prestruct will meet your requirements or that its operation will be uninterrupted or error-free.
            </p>
            <p style={{ color: 'var(--text-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
              We specifically disclaim any implied warranties of merchantability, fitness for a particular purpose, and non-infringement. Your use of Prestruct is at your own risk.
            </p>
          </section>

          <section className="u-mb-2">
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
              4. Limitation of Liability
            </h2>
            <p style={{ color: 'var(--text-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
              In no event shall Prestruct or its authors be liable for any damages arising out of the use or inability to use the materials on Prestruct, even if we have been notified of the possibility of such damages.
            </p>
            <p style={{ color: 'var(--text-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
              This includes but is not limited to direct, indirect, incidental, punitive, and consequential damages.
            </p>
          </section>

          <section className="u-mb-2">
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
              5. We Do Not Review Your Site or Code
            </h2>
            <p style={{ color: 'var(--text-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
              Prestruct processes your site during the build process, but we do not review, analyze, or have any visibility into the content of your website, application code, or any data you process through our tools.
            </p>
            <p style={{ color: 'var(--text-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
              You are solely responsible for ensuring that your website and its content comply with all applicable laws and regulations.
            </p>
          </section>

          <section className="u-mb-2">
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
              6. We Do Not Modify or Interfere With Your Site
            </h2>
            <p style={{ color: 'var(--text-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
              Prestruct generates static HTML from your build-time code. We do not modify your source code, inject any tracking or analytics, or interfere with the operation of your website in any way.
            </p>
            <p style={{ color: 'var(--text-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
              The prerendering process is a one-way transformation that produces static output. We have no ongoing access or control over your deployed site.
            </p>
          </section>

          <section className="u-mb-2">
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
              7. User Responsibilities
            </h2>
            <p style={{ color: 'var(--text-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
              You are responsible for:
            </p>
            <ul style={{ color: 'var(--text-2)', lineHeight: '1.9', paddingLeft: '1.25rem', marginBottom: '1rem' }}>
              <li>Ensuring your use of Prestruct complies with all applicable laws</li>
              <li>Maintaining backups of your code and content</li>
              <li>Testing the prerendered output before deployment</li>
              <li>Ensuring your website is accessible and functions correctly after prerendering</li>
            </ul>
          </section>

          <section className="u-mb-2">
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
              8. Privacy
            </h2>
            <p style={{ color: 'var(--text-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
              Prestruct does not collect, store, or process any personal information from users of your website. For more information, please refer to our <a href="/privacy" style={{ color: 'var(--accent)' }}>Privacy Policy</a>.
            </p>
          </section>

          <section className="u-mb-2">
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
              9. Governing Law
            </h2>
            <p style={{ color: 'var(--text-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
              These terms and conditions are governed by and construed in accordance with the laws of the United States, and you irrevocably submit to the exclusive jurisdiction of the courts in that State or location.
            </p>
          </section>

          <section className="u-mb-2">
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
              10. Termination
            </h2>
            <p style={{ color: 'var(--text-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
              We may terminate or suspend your access to Prestruct at any time, without prior notice or liability, for any reason, including breach of these Terms.
            </p>
          </section>

          <section className="u-mb-2">
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
              11. Trademarks
            </h2>
            <p style={{ color: 'var(--text-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
              "Prestruct" and the Prestruct logo are trademarks owned by the authors. You may not use these trademarks without prior written permission.
            </p>
          </section>

          <section className="u-mb-2">
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
              12. Indemnification
            </h2>
            <p style={{ color: 'var(--text-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
              You agree to indemnify and hold harmless Prestruct and its authors from any claims, damages, liabilities, costs, or expenses arising from your use of Prestruct or breach of these Terms.
            </p>
          </section>

          <section className="u-mb-2">
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
              13. Entire Agreement
            </h2>
            <p style={{ color: 'var(--text-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
              These Terms constitute the entire agreement between you and us regarding your use of Prestruct and supersede any prior agreements.
            </p>
          </section>

          <section className="u-mb-2">
            <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem', color: 'var(--text)' }}>
              14. Contact
            </h2>
            <p style={{ color: 'var(--text-2)', lineHeight: '1.7', marginBottom: '1rem' }}>
              If you have any questions about these Terms of Service, please contact us at <a href="https://github.com/dhaupin/prestruct" style={{ color: 'var(--accent)' }}>GitHub</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}