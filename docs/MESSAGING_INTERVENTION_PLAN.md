# Messaging Workflow for Student Intervention

## 1. Purpose and success criteria

This plan adds a secure, human-led messaging workflow to Retainify so that a forecast or an educator's observation can lead to a timely, respectful offer of support. It is **not** a disciplinary, admissions, progression, or automated decision system. A risk score must never send a professor-facing alert or a student message by itself.

The workflow should help staff:

1. identify a student who may benefit from an offer of support;
2. review context and decide whether outreach is appropriate;
3. send an approved, actionable message through an in-app conversation;
4. track acknowledgement, follow-up, referral, and resolution; and
5. measure whether the service is timely, equitable, and useful.

Minimum launch outcomes:

| Outcome | Launch target |
| --- | --- |
| Outreach has a named human owner | 100% |
| Student can see, acknowledge, reply to, or decline a support invitation | 100% |
| No message is sent after consent/connection is withdrawn | 100% |
| First outreach for priority cases | within 2 working days |
| Every sent message has an audit record and delivery state | 100% |

## 2. Current-state fit

The repository already provides useful building blocks:

- `backend/src/routes/mlRoutes.js` produces a student-only forecast and sends a verified-email support alert for medium/high risk, with a cooldown.
- `StudentProfessorConnection` requires an accepted student-professor connection before a professor may create a support plan.
- `StudentSupportPlan` holds a professor-only note and a student-visible next step; the existing UI separates the two correctly.
- `StudentActivity` records student-facing forecast and risk-alert history.

The messaging capability should build on those foundations. It should replace neither the support plan nor the existing email alert. Email becomes a notification that an in-app item is available; the complete message, sensitive context, response, and audit trail remain in Retainify.

## 3. Operating policy and roles

| Role | May do | May not do |
| --- | --- | --- |
| Student | choose communication preferences; read, acknowledge, reply to, mute non-essential reminders, withdraw a professor connection | view staff-private notes or other students' messages |
| Professor | review a connected student's context; create/send an approved outreach; update plan and outcome | automatically contact from a score; message after connection withdrawal; promise services outside their remit |
| Student-support adviser (phase 2) | accept a referral, communicate in assigned cases, record disposition | access cases without assignment/consent |
| Institution administrator | manage templates, service directory, retention settings, and aggregate reporting | read message content by default |

Before launch, the institution must approve: the eligible staff roles, service-hours statement, emergency/escalation protocol, retention period, data-protection basis, and an accessible student notice. Provide a clear statement in every workflow that Retainify is not an emergency service and show local emergency/wellbeing contacts.

## 4. End-to-end workflow

```text
Student forecast or educator observation
              |
              v
        Triage queue (draft case)
              |
       Human context review
        /              \
   no outreach        outreach appropriate
        |                    |
  record rationale    choose template + personalise + send
                             |
                    In-app message + optional email/push notice
                             |
              student acknowledges / replies / declines / no reply
                             |
            follow-up, meeting/referral, support-plan outcome, closure
```

### 4.1 Trigger rules

Create a **triage item**, not a message, for the following events:

| Trigger | Default triage priority | Guardrail |
| --- | --- | --- |
| Student runs a medium/high support-risk forecast | watch / priority | only the student sees the immediate forecast; staff item requires an accepted connection and approved policy |
| Professor identifies an academic concern | professor selects routine/watch/priority | reason is structured and free-text context is optional |
| Support-plan due date passes | retains plan priority | create one reminder for the owner, not a student message |
| Student requests help from the dashboard | priority | student chooses the connected recipient or support service |

Use the existing `low`, `medium`, and `high` tiers only to prioritize review. Never display a probability in an outreach message unless the institution has explicitly approved that wording; the preferred language is "an opportunity to check in about your studies."

### 4.2 Triage decision

The assigned professor reviews: forecast freshness, student-provided record, prior plans, prior messages, and known course context. They then select one of: `no_outreach`, `outreach`, `refer`, or `urgent_human_review`. A short structured reason and a timestamp are retained. The UI must require a human confirmation before an outbound message can be queued.

### 4.3 Outreach cadence

1. Send one initial invitation during the institution's approved contact hours.
2. If unread after 3 working days, send at most one neutral reminder.
3. If there is no reply after 7 working days, close as `no_response` or refer according to local policy; do not keep sending messages.
4. Stop all non-essential reminders when the student mutes outreach, declines, resolves the plan, or removes the connection.
5. A new outreach campaign needs a new review; do not reopen from a model score alone.

## 5. Student experience and message standards

Student messages must be plain-language, supportive, specific about the next action, and never blame the student. They should not expose sensitive source fields such as disability status, tuition status, or scholarship status.

Required message elements:

- sender name and role;
- reason framed as an invitation to discuss academic support, not a label;
- one or two practical actions (reply, choose a meeting time, visit a service);
- confidentiality and service-hours expectations where applicable;
- a way to decline, mute reminders, or update communication preferences.

### Approved initial template

> Hi {firstName}, I’d like to check in and see how this term is going. If coursework, attendance, timing, or something else is making study harder, we can look at practical support options together. Would you like to reply here or choose a time to meet by {dueDate}? There is no penalty for declining or telling me you do not need support right now.

### Reminder template

> Hi {firstName}, just a gentle reminder that my support invitation is still open. You can reply here, choose a meeting time, or select “No support needed” in Retainify. No response is also okay; I will close this invitation after {closeDate}.

Prohibited content: risk probabilities, predictions presented as facts, references to protected/sensitive attributes, threats, ultimatums, automated diagnoses, or claims that a response is mandatory unless a separately governed institutional process truly requires it.

## 6. Product scope and phased delivery

### Phase 0 — governance and design (1–2 weeks)

- Confirm policy owners and escalation path with academic support, privacy, accessibility, and student representatives.
- Define the institution service directory, contact hours, templates, priority response expectations, and retention schedule.
- Produce wireframes for student inbox, professor triage queue, case timeline, preference centre, and closure form.
- Run a threat model covering unauthorized access, message content exposure, account takeover, and abusive/misdirected use.

**Exit criteria:** written policy approval; template approval; named pilot team; test scenarios agreed.

### Phase 1 — in-app interventions (2–3 sprints)

Deliver one-to-one in-app messages for accepted student-professor connections, with no SMS and no free-form mass messaging.

- Professor queue with draft triage items, due dates, filters, and workload view.
- Template-backed compose screen; every message is editable and explicitly sent by a professor.
- Student inbox with unread state, reply/acknowledge/decline actions, support-plan link, and notification preference.
- Email only says that a secure Retainify message is available; it contains no risk tier, subject detail, or message body.
- Case timeline, outcome recording, follow-up task, and connection-withdrawal enforcement.

**Exit criteria:** role/consent checks tested; delivery/retry works; audit history visible to authorized participants; accessibility review passes.

### Phase 2 — referrals and controlled notifications (1–2 sprints)

- Add adviser role/assignment only after role-based access controls and case handoff rules are approved.
- Add service-directory referrals with student acknowledgement and referral status.
- Add email/push preferences, quiet hours, bounce handling, and notification delivery webhooks.
- Add templated campaign support only for individually approved, non-sensitive service announcements.

### Phase 3 — pilot evaluation and scale

- Pilot with one institution/programme and a small trained professor group.
- Review weekly for workload, response times, student experience, false-positive burden, and disparate impact.
- Adjust thresholds/cadence/templates from results; expand only after governance sign-off.

## 7. Technical design

### 7.1 Data model

Create these backend models. Use explicit status enums, UTC timestamps, immutable delivery events, and indexes on owner/recipient/status/created time.

| Model | Essential fields |
| --- | --- |
| `InterventionCase` | `student`, `owner`, `connection`, `source` (`forecast`, `educator_observation`, `student_request`, `overdue_followup`), `priority`, `status`, `reviewedAt`, `reviewDecision`, `dueAt`, `closedAt`, `closureReason` |
| `Conversation` | `case`, `student`, `participants`, `state` (`open`, `muted`, `closed`), `lastMessageAt` |
| `Message` | `conversation`, `sender`, `body`, `templateKey`, `direction`, `sentAt`, `readAt`, `acknowledgedAt`, `deliveryState`, `idempotencyKey` |
| `MessageDeliveryEvent` | `message`, `channel`, `event` (`queued`, `sent`, `delivered`, `bounced`, `failed`), `providerEventId`, `occurredAt`, minimal provider metadata |
| `CommunicationPreference` | `student`, `inAppEnabled`, `emailEnabled`, `remindersEnabled`, `quietHours`, `updatedAt` |
| `InterventionAuditEvent` | `actor`, `case`, `action`, `metadata` (redacted), `createdAt` |

Extend `StudentActivity.type` with student-visible events such as `support_invitation_received`, `support_invitation_acknowledged`, and `support_invitation_declined`. Keep `StudentActivity` separate from the staff case audit so a student cannot delete institutional audit events through the current history endpoint.

### 7.2 Authorization and lifecycle rules

- A professor can create/read a case or conversation only if the student-professor connection is `accepted` and they are the current owner/participant.
- On `DELETE /api/connections/:id`, transactionally close open conversations, cancel queued deliveries, remove the professor from participants, and prevent further message retrieval by that professor. Preserve minimal auditable records under the approved policy.
- A student can access only their own cases/messages and can reply only to an open conversation.
- Verify email notification preference before calling Brevo. Do not use the current forecast email sender for arbitrary message bodies.
- Apply per-user and per-recipient rate limits, maximum body size, HTML escaping/sanitisation, anti-automation controls, and idempotency for sends.
- Use an authorization helper shared by routes; do not duplicate connection checks in controllers.

### 7.3 Suggested endpoints

| Endpoint | User | Purpose |
| --- | --- | --- |
| `GET /api/interventions/queue` | professor | assigned triage items and follow-ups |
| `POST /api/interventions` | professor | create a reviewed case from an allowed source |
| `PATCH /api/interventions/:id` | owner | decision, assignment, status, due date, closure |
| `POST /api/interventions/:id/conversation/messages` | participant | send a human-composed message |
| `GET /api/interventions/:id/timeline` | participant | case and conversation timeline with redaction |
| `GET/PATCH /api/communication-preferences/me` | student | view/update notification and reminder choices |
| `POST /api/notification-webhooks/brevo` | provider | authenticated delivery/bounce events |

Use a durable job queue (for example, Redis-backed BullMQ) for external email notification delivery and scheduled follow-ups. The API writes the case/message and outbox job together; workers perform delivery, retries with bounded exponential backoff, and state transitions. This prevents a provider outage from losing an intervention or blocking an API request.

### 7.4 Frontend changes

- Add **Support messages** to the student dashboard navigation, showing unread count and preferences.
- Extend `ProfessorSupportWorkflow` with a triage decision and “Compose outreach” action; do not turn `sharedNextStep` into a message automatically.
- Add a student-first case view with clear states: invitation received, acknowledged, meeting planned, referral offered, completed/closed.
- Add an accessible inbox: keyboard navigation, semantic live updates, focus management, labelled status, timestamps in local time, no colour-only priority indicators, and responsive layout.
- Add confirmation before sending, unsent draft recovery, character counter, and a visible note that messages are monitored only during listed hours.

## 8. Migration, configuration, and observability

1. Add indexes and migration scripts before enabling any new endpoint.
2. Seed templates through versioned configuration, not hard-coded JSX or controller strings.
3. Add environment variables for provider credentials, signed webhook secret, worker/Redis URL, notification sender, public app URL, contact hours, and feature flag.
4. Keep the messaging feature behind `MESSAGING_INTERVENTIONS_ENABLED`; enable it only for pilot institutions/users.
5. Log correlation IDs, case IDs, delivery state, and error class. Never log message bodies, full emails, access tokens, raw model records, or sensitive attributes.
6. Back up and test restoration of the MongoDB collections and job queue; document retention/deletion behaviour.

## 9. Testing and acceptance plan

### Automated tests

- Unit: status transitions, template rendering, sanitisation, contact-hour calculation, preferences, cooldowns, and retention rules.
- API: student/professor ownership, accepted/pending/declined/removed connection cases, IDOR attempts, closed/muted conversation behavior, rate limits, idempotent send, and webhook signature validation.
- Integration: outbox-to-provider success/failure/bounce/retry; cancellation when connection is removed; due-date job processing.
- UI: inbox accessibility, keyboard operation, screen-reader labels, message state transitions, reply/decline paths, notification settings, and no-risk-language templates.
- Security: dependency scan, authorization review, XSS/body sanitisation test, audit-log integrity test, and penetration test before broad rollout.

### Pilot scenarios

1. Medium-risk forecast creates a review item; no staff message occurs until the owner chooses outreach.
2. Professor sends a templated invitation; student sees it in-app and receives a generic email notification.
3. Student replies, meeting is scheduled, plan is updated, and case closes with an outcome.
4. Student declines or removes the connection; reminders stop immediately and private notes remain inaccessible.
5. Provider is unavailable; the message remains queued, retries safely, and the professor sees accurate status.

## 10. Measurement and review

Report aggregate, de-identified metrics only to programme leaders:

- review and first-outreach time by priority;
- invitation read, acknowledgement, reply, meeting/referral, and closure rates;
- reminder volume and opt-out/mute rate;
- delivery failure/bounce rate and queue age;
- professor caseload and overdue follow-ups;
- student satisfaction and perceived usefulness;
- fairness checks across institution-approved demographic groupings, performed under privacy governance;
- model tier calibration and intervention outcomes, without claiming the messages caused an academic result.

Review these in the pilot weekly and monthly after scale-up. Pause the affected trigger or template if complaints, unequal burden, delivery failures, or an unacceptable false-positive workload emerges.

## 11. Delivery backlog and ownership

| Priority | Work item | Owner |
| --- | --- | --- |
| P0 | policy, consent text, escalation and retention decisions | product owner + student support + privacy |
| P0 | case/conversation/audit models and authorization helper | backend |
| P0 | student inbox, professor triage/compose, accessible states | frontend |
| P0 | job queue, generic email notification, webhook verification | backend/platform |
| P0 | automated authorization and lifecycle test suite | engineering/QA |
| P1 | templates, preference centre, reminders, service referral | product + engineering |
| P1 | pilot dashboard and de-identified outcome reporting | data/product |
| P2 | adviser role, supported handoffs, push notifications | engineering + governance |

## 12. Decisions required before implementation

1. Which staff roles may own intervention cases in the pilot?
2. Does an accepted professor connection authorize staff outreach, or does the student need a separate messaging opt-in?
3. What are the official service hours, emergency language, and escalation recipients?
4. How long should message content, audit data, and delivery metadata be retained?
5. Which provider and queue infrastructure are approved for production?
6. Which institutions/programmes and how many users are included in the pilot?

Until these are approved, implement only the feature-flagged technical foundation and avoid automated staff outreach.
