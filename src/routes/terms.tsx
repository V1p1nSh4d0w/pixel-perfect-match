import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { SUPPORT_EMAIL } from "@/lib/config";

const T = "Terms of Service — SecureCheck";
const D = "The plain-English terms for using SecureCheck, including what it does, what it doesn't, and payments.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => {
    const mail = <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">{SUPPORT_EMAIL}</a>;
    return (
      <LegalPage
        title="Terms of Service"
        updated="October 1, 2026"
        sections={[
          { heading: "What SecureCheck does", items: ["Provides a self-reported security assessment based on your answers.", "Provides a score, findings, and recommendations.", "Is not a security audit, penetration test, or compliance certification."] },
          { heading: "What SecureCheck does not do", items: ["Does not guarantee your business is or will remain secure.", "Does not replace professional security services.", "Does not cover every possible security issue."] },
          { heading: "Your responsibilities", items: ["Provide accurate answers to the assessment questions.", "Take action on findings; the assessment is guidance, not a fix.", "Keep your login credentials secure."] },
          { heading: "Payments (Starter Kit)", items: ["₹499 one-time payment via Razorpay.", "A verified payment unlocks PDF report downloads and extended remediation playbooks for the purchasing account."] },
          { heading: "Data and privacy", items: [<>See the <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link> for details.</>] },
          { heading: "Limitation of liability", items: ["SecureCheck is provided as-is. We are not liable for security incidents that occur after the assessment."] },
          { heading: "Contact", items: [mail] },
        ]}
      />
    );
  },
});
