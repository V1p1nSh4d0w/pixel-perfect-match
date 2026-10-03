import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/checkup/business")({
  component: () => <Outlet />,
});
