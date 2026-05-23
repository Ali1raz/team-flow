import { formatLocalDateTime } from "@/lib/utils";
import Image from "next/image";

interface iAppProps {
  message: {
    id: number;
    message: string;
    date: Date;
    user: {
      name: string;
      image: string;
    };
  };
}

export function MessageItem({ message }: iAppProps) {
  return (
    <div className="flex gap-3 items-center rounded-md hover:bg-muted p-3">
      <Image
        src={message.user.image}
        alt={message.user.name}
        width={40}
        height={40}
        className="size-8 rounded-full"
      />
      <div className="flex flex-col gap-2 *:leading-none">
        <div className="flex gap-2 items-center justify-center">
          <p className="font-medium">{message.user.name}</p>
          <p className="text-sm text-muted-foreground">
            {formatLocalDateTime(message.date)}
          </p>
        </div>
        <p className="text-sm wrap-break-word max-w-none">{message.message}</p>
      </div>
    </div>
  );
}
