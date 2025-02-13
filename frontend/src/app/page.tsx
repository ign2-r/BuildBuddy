import { redirect } from "next/navigation";

export default function Home() {
  redirect("/login"); // Automatically redirects to the login page
  return null; // Prevents unnecessary rendering
}
