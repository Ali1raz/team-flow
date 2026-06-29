import type { Metadata } from "next";
import ProfileTabs from "./_components/profile-tabs";
import { UserDetailsSection } from "./_components/user-details-section";
import { requireSession } from "./data/require-session";

export const metadata: Metadata = {
  title: "Profile",
};

export default async function ProfilePage() {
  const { user } = await requireSession();

  return (
    <main className="mt-16 w-full">
      <div className="@container/main flex flex-1 flex-col gap-4 p-4 md:gap-6 md:py-6">
        <UserDetailsSection user={user} />

        <ProfileTabs />
      </div>
    </main>
  );
}
