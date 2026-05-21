import Image from "next/image";
import Logo from "@/public/team-flow.png";
import { ThemeToggle } from "@/components/general/theme-toggle";
import { requireSession } from "@/app/data/session/require-session";
import UserAvatarDropdown from "@/components/general/user-avatar-dropdown";

export async function WorkspaceHeader() {
  const session = await requireSession();

  return (
    <header className="w-full fixed top-0 left-0 px-4 py-4 bg-muted/50 backdrop-blur-sm border-b">
      <div className="flex items-center max-w-6xl mx-auto justify-between">
        <div className="flex items-center gap-2">
          <Image src={Logo} alt="Logo" width={40} height={40} /> TeamFlow
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserAvatarDropdown
            email={session.user.email}
            image={session.user.image}
            name={session.user.name}
          />
        </div>
      </div>
    </header>
  );
}
