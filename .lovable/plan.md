# Replace Pro and Full Audit with Starter Kit

## Scope
- Remove the Full Audit offer and every customer-facing audit, subscription, monthly billing, founder-call, reminder, score-history, and priority-support reference.
- Replace the paid offer with **Starter Kit — ₹499 one-time**, containing only Free features, PDF report download, and extended remediation playbooks.
- Keep the Free plan unchanged.

## Implementation
1. **Public and signed-in screens**
   - Remove Full Audit cards, links, landing-page section, sidebar entry, Billing entry, legal copy, admin call/audit panels, and retired feature copy.
   - Simplify Pricing to Free vs Starter Kit and update its comparison table and metadata.
   - Rename paid labels, buttons, badges, tooltips, and onboarding copy to Starter Kit.
   - Remove the score-history dashboard section and retired support/call UI.

2. **One-time payment**
   - Replace recurring Razorpay subscription checkout with a ₹499 one-time Razorpay order.
   - Verify the payment signature on the server, confirm the order belongs to the signed-in user, and only then grant Starter Kit access.
   - Keep historical subscription and audit rows unchanged; remove only their new-purchase routes and UI.

3. **Legacy access and enforcement**
   - Store new purchases as a durable Starter Kit entitlement in the existing billing record.
   - Preserve legacy Pro access only through its recorded current end date.
   - Add a database-backed, authenticated paid-access check and use it for paid feature delivery, including full remediation playbooks.

4. **Validation**
   - Search the app again for retired terminology and links.
   - Run focused checks for Free, Starter Kit, and legacy Pro entitlement behavior, then verify affected screens and the latest build status.
