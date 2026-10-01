import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SecureCheck — Know your security. Fix what matters." },
      {
        name: "description",
        content: "SecureCheck helps small businesses understand their security posture and fix what matters.",
      },
      { property: "og:title", content: "SecureCheck — Know your security. Fix what matters." },
      {
        property: "og:description",
        content: "SecureCheck helps small businesses understand their security posture and fix what matters.",
      },
    ],
  }),
  beforeLoad: () => {
    throw redirect({ to: "/login" });
  },
  component: () => null,
});
