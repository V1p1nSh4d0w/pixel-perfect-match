import { createFileRoute } from "@tanstack/react-router";
import { LegalPage } from "@/components/LegalPage";
import { SUPPORT_EMAIL } from "@/lib/config";

const T = "Privacy Policy — SecureCheck";
const D = "What SecureCheck collects, what it doesn't, and how your data is used — in plain English.";

export const Route = createFileRoute("/privacy")({
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
        title="Privacy Policy"
        updated="October 1, 2026"
        sections={[
          { heading: "What we collect", items: ["Your email address (when you sign up)", "Your business name (when you sign up)", "Your assessment answers (the questions you answer)", "Basic usage data (pages visited, timestamps)"] },
          { heading: "What we don't collect", items: ["We do not ask for or store passwords, API keys, or credentials of any kind.", "We do not sell your data to third parties.", "We do not run third-party advertising trackers on this site."] },
          { heading: "How we use it", items: ["To generate your security score and findings", "To make your assessment report available in your account", "To send you account-related emails (password reset, payment confirmation)"] },
          { heading: "Who we share it with", items: ["Lovable Cloud (database and authentication)", "Razorpay (payment processing)", "Resend (transactional email)", "No one else."] },
          { heading: "Your rights", items: ["You can delete your account at any time from Settings. This permanently removes all your data.", <>You can email {mail} to request a copy of your data or ask questions.</>] },
          { heading: "Contact", items: [mail] },
        ]}
      />
    );
  },
});

