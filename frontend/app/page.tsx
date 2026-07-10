import { redirect } from "next/navigation";

// The prototype boots to Projects (the portfolio dashboard).
export default function Home() {
  redirect("/projects");
}
