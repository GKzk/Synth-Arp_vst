import { createFileRoute } from "@tanstack/react-router";
import { Studio } from "@/components/tetiva/studio";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <Studio />;
}
