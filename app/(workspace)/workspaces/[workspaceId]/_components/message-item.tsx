import { formatLocalDateTime } from "@/lib/utils";
import Image from "next/image";
import Logo from "@/public/team-flow.png";
import { RenderJSONtoHTML } from "@/components/editor/render-content";

interface iAppProps {
  message: {
    id: string;
    content: string;
    createdAt: Date;
    imageUrl?: string | null;
    user: {
      id: string;
      name: string;
      image: string | null;
    };
  };
}

export function MessageItem({ message }: iAppProps) {
  return (
    <div className="flex gap-3 items-start rounded-md hover:bg-muted/70 p-3">
      <Image
        src={message.user.image || Logo}
        alt={message.user.name}
        width={40}
        height={40}
        className="size-8 rounded-full"
      />
      <div className="flex flex-col gap-2 *:leading-none">
        <div className="flex gap-2 items-center">
          <p className="font-medium">{message.user.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatLocalDateTime(message.createdAt)}
          </p>
        </div>
        <RenderJSONtoHTML
          content={JSON.parse(message.content)}
          className="text-sm wrap-break-word prose dark:prose-invert max-w-none marker:text-primary"
        />

        {message.imageUrl && (
          <div>
            <Image
              src={message.imageUrl}
              alt="uploaded image"
              width={512}
              height={512}
              className="object-cover rounded max-h-75 w-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
}
