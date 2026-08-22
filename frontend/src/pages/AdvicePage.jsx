import React from "react";
import { Link } from "react-router-dom";
import "../styles/Legal.css";
import BrandLogo from "../components/BrandLogo";

const AdvisePage = () => {
  return (
    <div className="legal-page">
      <header className="legal-header">
        <BrandLogo className="legal-logo" />
        <Link to="/dashboard" className="legal-back-link">
          ← Back to dashboard
        </Link>
      </header>

      <div className="legal-content">
        <aside className="legal-toc">
          <p className="legal-toc-title">On this page</p>
          <a href="#overview">1. What This Page Covers</a>
          <a href="#risk-bands">2. Understanding Risk Bands</a>
          <a href="#forecasts">3. Reading GPA &amp; Performance Forecasts</a>
          <a href="#using-responsibly">4. Using Forecasts Responsibly</a>
          <a href="#conversations">5. Having the Conversation</a>
          <a href="#for-students">6. If You're a Student</a>
          <a href="#getting-support">7. Getting Support</a>
        </aside>

        <main className="legal-main">
          <h1>Advising Guidance</h1>
          <p className="legal-updated">
            How to read and act on EduForecaster&apos;s outputs
          </p>

          <p className="legal-intro">
            This page explains how to interpret risk classifications and
            performance forecasts, and how to use them as one input among
            many when supporting a student — not as a decision made on your
            behalf.
          </p>

          <section id="overview">
            <h2>1. What This Page Covers</h2>
            <p>
              EduForecaster produces two kinds of outputs: an{" "}
              <strong>attrition risk classification</strong> and a{" "}
              <strong>performance forecast</strong>. Both are generated from
              historical and current academic data. This page is meant to
              help you read those outputs with the right amount of
              confidence — enough to act on, not so much that you stop
              looking at the student behind the number.
            </p>
          </section>

          <section id="risk-bands">
            <h2>2. Understanding Risk Bands</h2>
            <p>
              Risk is typically shown as a band rather than a precise
              probability, since that better reflects the uncertainty in any
              forecast:
            </p>
            <ul>
              <li>
                <strong>Low</strong> — no current signal of elevated
                attrition risk. This does not guarantee a student won&apos;t
                run into difficulty later.
              </li>
              <li>
                <strong>Medium</strong> — some signals worth a closer look,
                such as a dip in attendance or grades. Often a good time for
                a low-stakes check-in.
              </li>
              <li>
                <strong>High</strong> — multiple or strong signals present.
                Worth prioritizing outreach, but still requires context
                before deciding what that outreach should look like.
              </li>
            </ul>
            <p>
              A band is a starting point for attention, not a label for the
              student.
            </p>
          </section>

          <section id="forecasts">
            <h2>3. Reading GPA &amp; Performance Forecasts</h2>
            <p>
              Performance forecasts estimate a likely range, not a single
              guaranteed outcome. Small changes in a student&apos;s
              circumstances — a new job, a health issue, a schedule change —
              can move a student outside the forecasted range in either
              direction. Treat the forecast as a trend line to watch rather
              than a prediction to hold someone to.
            </p>
          </section>

          <section id="using-responsibly">
            <h2>4. Using Forecasts Responsibly</h2>
            <p>Some guardrails worth keeping in mind:</p>
            <ul>
              <li>
                Never use a risk score or forecast as the sole basis for a
                grading, disciplinary, financial, or enrollment decision.
              </li>
              <li>
                Pair the number with what you actually know about the
                student — attendance patterns, past conversations, personal
                circumstances they&apos;ve shared with you.
              </li>
              <li>
                Revisit forecasts periodically rather than treating an early
                read as fixed for the term.
              </li>
              <li>
                If a score seems inconsistent with what you&apos;re seeing in
                class, trust your judgment and flag it — models can be wrong.
              </li>
            </ul>
          </section>

          <section id="conversations">
            <h2>5. Having the Conversation</h2>
            <p>
              If you&apos;re reaching out to a student flagged as medium or
              high risk, it usually helps to:
            </p>
            <ul>
              <li>
                Lead with curiosity, not the score — ask how things are
                going before referencing any classification.
              </li>
              <li>
                Keep the framing supportive: you&apos;re checking in, not
                delivering a verdict.
              </li>
              <li>
                Point toward concrete next steps — office hours, tutoring,
                advising, financial aid, counseling — rather than leaving the
                conversation open-ended.
              </li>
              <li>
                Document the conversation and any agreed next steps through
                your institution&apos;s normal advising process.
              </li>
            </ul>
          </section>

          <section id="for-students">
            <h2>6. If You&apos;re a Student</h2>
            <p>
              If you can see your own risk band or forecast, remember it
              reflects patterns in the data, not a judgment of your ability
              or effort. It exists so that a professor or advisor can reach
              out sooner rather than later. You&apos;re welcome to ask your
              advisor or professor what&apos;s behind a score, or to flag if
              something about it doesn&apos;t match your situation.
            </p>
          </section>

          <section id="getting-support">
            <h2>7. Getting Support</h2>
            <p>
              For questions about a specific score or forecast, start with
              your professor or academic advisor — they have the context
              EduForecaster doesn&apos;t. For questions about how the System
              works more generally, use the Help &amp; Support link in the
              footer.
            </p>
          </section>

          <p className="legal-disclaimer">
            This guidance is general in nature. Always follow your
            institution&apos;s specific advising policies and escalation
            procedures where they differ from anything described here.
          </p>
        </main>
      </div>
    </div>
  );
};

export default AdvisePage;
