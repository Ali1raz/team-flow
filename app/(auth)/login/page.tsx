import { LoginForm } from "../_components/login-form";
import Logo from "@/public/team-flow.png";
import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session) {
    redirect("/");
  }

  const { from } = await searchParams;
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Link
          href="/"
          className="flex items-center gap-2 self-center font-medium"
        >
          <Image
            src={Logo}
            alt="TeamFlow Logo"
            width={40}
            height={40}
            className="object-cover"
          />
          <p className="text-primary">TeamFlow</p>
        </Link>
        <LoginForm callbackUrl={from ?? "/"} />{" "}
      </div>
    </div>
  );
}
