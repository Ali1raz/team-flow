import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
export function UserImage({
  image,
  name,
  className,
}: {
  image?: string | null;
  name?: string | null;
  className?: string;
}) {
  const imageUrl = image ?? `https://avatar.vercel.sh/${name ?? "U"}`;

  return (
    <Avatar className={className}>
      <AvatarImage src={imageUrl} alt="Profile image" />
      <AvatarFallback>{name && name.length > 0 ? name[0] : "U"}</AvatarFallback>
    </Avatar>
  );
}
