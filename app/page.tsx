import { ThemeToggle } from "@/components/general/theme-toggle";
import Link from "next/link";

export default function Home() {
  return (
    <div>
      ali
      <ThemeToggle />
      <Link href="/login">Login</Link>
    </div>
  );
}
