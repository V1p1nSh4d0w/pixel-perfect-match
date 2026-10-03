import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/Button";
import { Card, CardBody, CardTitle } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/app/")({
  head: () => ({ meta: [
    { title: "Security Home — SecureCheck" },
    { name: "description", content: "Choose Personal Security or Business Security to review what needs attention." },
    { property: "og:title", content: "Security Home — SecureCheck" },
    { property: "og:description", content: "Choose Personal Security or Business Security to review what needs attention." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: SecurityHome,
});

const PATHS = [
  { icon: "👤", title: "Personal Security", text: "Review your phone, computer, accounts, web activity, scams, and data.", to: "/checkup/personal" },
  { icon: "🏢", title: "Business Security", text: "Review accounts, devices, email, website, data, backups, and business security practices.", to: "/checkup/business" },
  { icon: "📋", title: "Findings", text: "See what needs attention and what to do next.", to: "/app/findings" },
] as const;

function SecurityHome() {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">SecureCheck</p>
      <PageHeader title="Security" description="Choose what you want to review." />
      <div className="grid gap-4 sm:grid-cols-2">
        {PATHS.map((p) => (
          <Card key={p.title} className="flex flex-col">
            <div className="text-3xl" aria-hidden="true">{p.icon}</div>
            <CardTitle className="mt-3">{p.title}</CardTitle>
            <CardBody className="mt-1.5 flex-1">{p.text}</CardBody>
            <Link to={p.to} className="mt-5 block"><Button fullWidth>{p.title}</Button></Link>
          </Card>
        ))}
      </div>
    </div>
  );
}
