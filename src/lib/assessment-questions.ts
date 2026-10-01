import type { AssessmentStep } from "@/types/assessment";

const YNS = ["Yes", "No", "Not sure"] as const;

export const ASSESSMENT_STEPS: readonly AssessmentStep[] = [
  {
    id: "business",
    name: "Business",
    questions: [
      {
        id: "business_size",
        text: "What best describes your business?",
        options: ["Sole proprietor", "Small team under 10", "Team of 10–50", "Larger", "Not sure"],
      },
      { id: "security_policy", text: "Do you have a written security policy?", options: YNS },
    ],
  },
  {
    id: "accounts",
    name: "Accounts",
    questions: [
      {
        id: "mfa_accounts",
        text: "Does your business use Multi-Factor Authentication (MFA) for important accounts?",
        options: ["Yes, all important accounts", "Yes, some", "No", "Not sure"],
      },
      { id: "password_manager", text: "Do you use a password manager for business passwords?", options: YNS },
      {
        id: "admin_limited",
        text: "Are administrator or owner accounts limited to the people who actually need them?",
        options: YNS,
      },
      {
        id: "offboarding",
        text: "Do former employees and contractors have their access removed promptly?",
        options: YNS,
      },
    ],
  },
  {
    id: "devices",
    name: "Devices",
    questions: [
      {
        id: "device_lock",
        text: "Are business devices (laptops, phones) protected with a PIN, password, or biometric lock?",
        options: ["All devices", "Some", "None", "Not sure"],
      },
      {
        id: "remote_wipe",
        text: "Do you have a way to remotely wipe a lost or stolen business device?",
        options: YNS,
      },
      {
        id: "personal_devices",
        text: "Do you allow personal devices to access business accounts and data?",
        options: YNS,
      },
    ],
  },
  {
    id: "software",
    name: "Software",
    questions: [
      {
        id: "auto_updates",
        text: "Is software on business devices kept up to date automatically?",
        options: ["Yes", "Sometimes", "No", "Not sure"],
      },
      {
        id: "unsupported_software",
        text: "Do you use any software that is no longer supported by its vendor?",
        options: YNS,
      },
    ],
  },
  {
    id: "backups",
    name: "Backups",
    questions: [
      {
        id: "backups_exist",
        text: "Do you have backups of important business data?",
        options: ["Yes, automated", "Yes, manual", "No", "Not sure"],
      },
      {
        id: "backups_separate",
        text: "Are backups stored in a separate location from the original data?",
        options: YNS,
      },
      {
        id: "backups_tested",
        text: "Are backups tested to confirm files can actually be restored?",
        options: YNS,
      },
    ],
  },
  {
    id: "email",
    name: "Email",
    questions: [
      { id: "email_mfa", text: "Is email protected with MFA?", options: YNS },
      {
        id: "phishing_training",
        text: "Do staff receive any training on recognizing phishing emails?",
        options: YNS,
      },
    ],
  },
  {
    id: "cloud",
    name: "Cloud",
    questions: [
      {
        id: "cloud_access_review",
        text: "Do you review which staff have access to cloud tools (Google Workspace, Microsoft 365, etc.)?",
        options: YNS,
      },
      {
        id: "third_party_apps",
        text: "Have you checked which third-party apps have access to your business cloud accounts?",
        options: YNS,
      },
    ],
  },
  {
    id: "website",
    name: "Website",
    questions: [
      {
        id: "https",
        text: "Is your business website served over HTTPS?",
        options: ["Yes", "No", "Not sure", "No website"],
      },
      { id: "registrar_mfa", text: "Is the domain registrar account protected with MFA?", options: YNS },
    ],
  },
];

export const REVIEW_STEP_NAME = "Review";
export const STEP_NAMES = [...ASSESSMENT_STEPS.map((s) => s.name), REVIEW_STEP_NAME];
export const REVIEW_INDEX = ASSESSMENT_STEPS.length;
