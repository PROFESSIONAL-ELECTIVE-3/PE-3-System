import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Legal.css';

const LAST_UPDATED = 'August 20, 2026';

const TermsOfService = () => {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <Link to="/" className="legal-logo">
          <span className="logo-highlight">Edu</span>Forecaster
        </Link>
        <Link to="/" className="legal-back-link">
          ← Back to home
        </Link>
      </header>

      <div className="legal-content">
        <aside className="legal-toc">
          <p className="legal-toc-title">On this page</p>
          <a href="#acceptance">1. Acceptance of Terms</a>
          <a href="#eligibility">2. Eligibility &amp; Accounts</a>
          <a href="#service">3. Description of Service</a>
          <a href="#acceptable-use">4. Acceptable Use</a>
          <a href="#data-forecasts">5. Nature of Forecasts &amp; Risk Scores</a>
          <a href="#ip">6. Intellectual Property</a>
          <a href="#data-privacy">7. Data Privacy</a>
          <a href="#termination">8. Suspension &amp; Termination</a>
          <a href="#disclaimers">9. Disclaimers</a>
          <a href="#liability">10. Limitation of Liability</a>
          <a href="#indemnification">11. Indemnification</a>
          <a href="#governing-law">12. Governing Law &amp; Dispute Resolution</a>
          <a href="#changes">13. Changes to These Terms</a>
          <a href="#contact">14. Contact Us</a>
        </aside>

        <main className="legal-main">
          <h1>Terms of Service</h1>
          <p className="legal-updated">Last updated: {LAST_UPDATED}</p>

          <p className="legal-intro">
            These Terms of Service (&quot;Terms&quot;) govern access to and use of the Student
            Academic Attrition Risk Classification &amp; Performance Forecasting System
            (&quot;EduForecaster,&quot; &quot;the System,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) by students,
            professors, administrators, and any other authorized user (&quot;you&quot; or &quot;User&quot;).
            By creating an account or otherwise using the System, you agree to be bound by
            these Terms. If you do not agree, do not use the System.
          </p>

          <section id="acceptance">
            <h2>1. Acceptance of Terms</h2>
            <p>
              Access to EduForecaster is typically provided through your educational
              institution. By registering for an account, you confirm that you have the
              authority to accept these Terms — either on your own behalf, or, where your
              institution has entered into a separate agreement with us, on behalf of
              that institution to the extent it governs your use of the System.
            </p>
          </section>

          <section id="eligibility">
            <h2>2. Eligibility &amp; Accounts</h2>
            <p>
              EduForecaster is intended for use by <strong>students</strong>,{' '}
              <strong>professors</strong>, and <strong>administrators</strong> affiliated
              with a participating academic institution. When you register, you agree to:
            </p>
            <ul>
              <li>Provide accurate, current, and complete information;</li>
              <li>Select the role (Student, Professor, or Administrator) that correctly reflects your relationship to your institution;</li>
              <li>Keep your login credentials confidential and notify us promptly of any unauthorized use of your account;</li>
              <li>Be responsible for all activity that occurs under your account.</li>
            </ul>
            <p>
              We reserve the right to verify your institutional affiliation and to
              suspend accounts that cannot be verified or that misrepresent a role.
            </p>
          </section>

          <section id="service">
            <h2>3. Description of Service</h2>
            <p>
              EduForecaster provides predictive analytics tools, including attrition
              risk classification, academic performance forecasting, and data
              visualization dashboards, intended to support educators and administrators
              in identifying at-risk students and planning interventions. Features
              available to you depend on your assigned role and your institution&apos;s
              configuration.
            </p>
          </section>

          <section id="acceptable-use">
            <h2>4. Acceptable Use</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Access or attempt to access data, dashboards, or student records you are not authorized to view;</li>
              <li>Use the System to harass, discriminate against, or retaliate against any student or staff member;</li>
              <li>Reverse-engineer, scrape, or attempt to extract the underlying models or datasets;</li>
              <li>Upload data you do not have the right or authorization to share;</li>
              <li>Interfere with or disrupt the integrity or performance of the System;</li>
              <li>Use the System in violation of any applicable law, including the Data Privacy Act of 2012 (Republic Act No. 10173).</li>
            </ul>
          </section>

          <section id="data-forecasts">
            <h2>5. Nature of Forecasts &amp; Risk Scores</h2>
            <p>
              Attrition risk classifications, GPA forecasts, and related outputs are{' '}
              <strong>statistical estimates</strong> generated from historical and current
              data. They are decision-support tools, not determinations of a student&apos;s
              worth, ability, or future outcomes, and they should not be the sole basis for
              any academic, disciplinary, financial, or enrollment decision affecting a
              student. Institutions and staff remain responsible for exercising independent
              professional judgment when acting on any output from the System.
            </p>
          </section>

          <section id="ip">
            <h2>6. Intellectual Property</h2>
            <p>
              The System, including its software, models, design, and underlying
              technology, is owned by us or our licensors and is protected by applicable
              intellectual property laws. Except for the limited right to use the System
              as permitted under these Terms, no other rights are granted to you.
            </p>
          </section>

          <section id="data-privacy">
            <h2>7. Data Privacy</h2>
            <p>
              Our collection, use, storage, and disclosure of personal data is governed by
              our <Link to="/privacy">Privacy Policy</Link>, which is incorporated into
              these Terms by reference. Our data handling practices are designed to comply
              with the Data Privacy Act of 2012 (Republic Act No. 10173), its Implementing
              Rules and Regulations, and applicable issuances of the National Privacy
              Commission (NPC) of the Philippines.
            </p>
          </section>

          <section id="termination">
            <h2>8. Suspension &amp; Termination</h2>
            <p>
              We may suspend or terminate your access to the System if you violate these
              Terms, if your institutional affiliation ends, or if required by your
              institution. You may stop using the System, or request account deletion, at
              any time by contacting us as described below or in your institution&apos;s
              account settings.
            </p>
          </section>

          <section id="disclaimers">
            <h2>9. Disclaimers</h2>
            <p>
              The System is provided on an &quot;as is&quot; and &quot;as available&quot; basis. To the
              fullest extent permitted by law, we disclaim all warranties, express or
              implied, including warranties of merchantability, fitness for a particular
              purpose, and non-infringement. We do not warrant that forecasts or risk
              classifications will be accurate, complete, or error-free.
            </p>
          </section>

          <section id="liability">
            <h2>10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted under Philippine law, we shall not be liable
              for any indirect, incidental, special, consequential, or exemplary damages
              arising out of or related to your use of the System, including academic,
              administrative, or disciplinary decisions made in reliance on System
              outputs. Nothing in these Terms limits liability that cannot be excluded or
              limited under applicable law.
            </p>
          </section>

          <section id="indemnification">
            <h2>11. Indemnification</h2>
            <p>
              You agree to indemnify and hold us harmless from any claims, damages, or
              expenses arising from your misuse of the System, violation of these Terms,
              or violation of any law or third-party right, including unauthorized
              disclosure of personal or sensitive personal information belonging to
              others.
            </p>
          </section>

          <section id="governing-law">
            <h2>12. Governing Law &amp; Dispute Resolution</h2>
            <p>
              These Terms are governed by the laws of the Republic of the Philippines,
              without regard to conflict-of-law principles. Any dispute arising from these
              Terms or your use of the System shall be subject to the exclusive
              jurisdiction of the proper courts of the Philippines, without prejudice to
              any complaint you may separately file with the National Privacy Commission
              regarding data privacy matters.
            </p>
          </section>

          <section id="changes">
            <h2>13. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. Material changes will be
              communicated through the System or by email, and will take effect on the
              date stated in the notice. Continued use of the System after changes take
              effect constitutes acceptance of the revised Terms.
            </p>
          </section>

          <section id="contact">
            <h2>14. Contact Us</h2>
            <p>
              Questions about these Terms can be directed to your institution&apos;s
              EduForecaster administrator, or to our support team through the Help &amp;
              Support link in the footer.
            </p>
          </section>

          <p className="legal-disclaimer">
            This page is a general template and does not constitute legal advice. Before
            publishing, have it reviewed by counsel familiar with Philippine law and your
            institution&apos;s specific data-sharing arrangements.
          </p>
        </main>
      </div>
    </div>
  );
};

export default TermsOfService;