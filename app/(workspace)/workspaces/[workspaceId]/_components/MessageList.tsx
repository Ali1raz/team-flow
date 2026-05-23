import { MessageItem } from "./message-item";

const messages = [
  {
    id: 1,
    message: "ver long message",
    date: new Date(),
    user: {
      name: "Raza",
      image: "https://avatars.githubusercontent.com/u/246221?v=4",
    },
  },
  {
    id: 2,
    message: "ver short message",
    date: new Date(),
    user: {
      name: "Raza",
      image: "https://avatars.githubusercontent.com/u/246221?v=4",
    },
  },
  {
    id: 3,
    message: "ver long message",
    date: new Date(),
    user: {
      name: "Raza",
      image: "https://avatars.githubusercontent.com/u/246221?v=4",
    },
  },
];

export function MessageList() {
  return (
    <main className="h-full relative">
      <div className="h-full overflow-y-auto">
        {messages.map((msg) => (
          <MessageItem key={msg.id} message={msg} />
        ))}
      </div>
    </main>
  );
}
