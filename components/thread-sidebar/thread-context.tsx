"use client";

// Provides a shared threadId state across the workspace layout tree,
// allowing MessageItem to set the active thread and RightSidebar to read it
// without prop-drilling through the layout.
import { createContext, useContext, useState } from "react";

type ThreadContextValue = {
  threadId: string | null;
  setThreadId: (id: string | null) => void;
};

const ThreadContext = createContext<ThreadContextValue | null>(null);

export function ThreadProvider({ children }: { children: React.ReactNode }) {
  const [threadId, setThreadId] = useState<string | null>(null);

  return (
    <ThreadContext.Provider value={{ threadId, setThreadId }}>
      {children}
    </ThreadContext.Provider>
  );
}

// Throws early if consumed outside the provider so misuse is caught at runtime.
export function useThread(): ThreadContextValue {
  const context = useContext(ThreadContext);
  if (!context) {
    throw new Error("useThread must be used within a ThreadProvider.");
  }
  return context;
}
