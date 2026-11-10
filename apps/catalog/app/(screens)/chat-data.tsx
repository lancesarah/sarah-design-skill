"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

export type ChatLine = {
  id: string;
  name: string;
  initials: string;
  time: string;
  body: string;
  photo?: string;
  day?: string;
};

const SARAH = { name: "Sarah Mou", initials: "SM", photo: "/avatar-sarah.png" };

const CHATS: Record<string, ChatLine[]> = {
  gavin: [
    { id: "1", ...SARAH, time: "9:02 AM", body: "Anything waiting on me?" },
    { id: "2", name: "Gavin from Lance", initials: "GV", photo: "/avatar-gavin.png", time: "9:02 AM", body: "0 open tickets" },
  ],
  "todays-team": [
    { id: "1", ...SARAH, time: "8:14 AM", body: "How is 1013 looking?" },
    { id: "2", name: "Esmeralda", initials: "ES", time: "8:21 AM", body: "Leaving 1014 now." },
    { id: "3", name: "Fred Senecal", initials: "FS", time: "8:40 AM", body: "I will be done in room 1013 in 10 more minutes" },
  ],
  food: [
    { id: "1", name: "Bernadette", initials: "BE", time: "4:12 PM", body: "Breakfast is short two servers." },
    { id: "2", name: "Othman Belkadi", initials: "OB", time: "4:40 PM", body: "As of now no communication has been restored with the kitchen." },
  ],
  "front-desk": [
    {
      id: "1",
      name: "Bobby",
      initials: "BO",
      day: "Tuesday, October 27",
      time: "10:27 PM",
      body: "The guests were eating outside and in Devin's defense he did not see them and it was already 9:30pm. They came to the front desk complaining about not seeing their server, but she was great and having to try to eat in the dark, and they had not been given their check yet. I apologized, and they felt that they should not have to pay. I told the restaurant to comp the check for the guests' inconvenience. Thanks, Bobby",
    },
    {
      id: "2",
      name: "BT",
      initials: "BT",
      day: "Tuesday, October 27",
      time: "10:31 PM",
      body: "Rm 718, Sandra Roth. Guest came back to the desk complaining of black mold in the shower and asked to be moved to another room. I immediately let them go look at 620. It also had black mold. They kept the room but after about 2 hours her back was tightening up. She has severe allergies and they had to check out, and we refunded this reservation and cancelled the second reservation they had for the 30th. Please have housekeeping check for black mold in the showers of both rooms on Tues. Thanks, BT",
    },
    { id: "3", name: "Bernadette", initials: "BE", day: "Wednesday, November 4", time: "8:47 AM", body: "Bobby please put these in the pass along." },
    { id: "4", name: "Bernadette", initials: "BE", day: "Wednesday, November 4", time: "11:24 AM", body: "Can I get some help with Booking messages please" },
  ],
  housekeeping: [
    { id: "1", name: "Robin", initials: "RB", time: "1:10 PM", body: "908 is ready for inspection." },
    { id: "2", name: "Esmeralda", initials: "ES", time: "1:14 PM", body: "1120 done" },
  ],
  maintenance: [
    { id: "1", name: "Fred Senecal", initials: "FS", time: "11:02 AM", body: "The vanity leak in 1013 is stopped." },
    { id: "2", name: "Robin", initials: "RB", time: "11:20 AM", body: "Done" },
  ],
  management: [
    { id: "1", name: "Bobby", initials: "BO", time: "Oct 30", body: "Rm 917, Yogesh Delal, upset with the smoking going on next door." },
  ],
  repairs: [
    { id: "1", name: "Lupe Valdez", initials: "LV", time: "2:15 PM", body: "1013 still has the vanity leak." },
    { id: "2", name: "Chris Law", initials: "CL", time: "2:22 PM", body: "Repairs" },
  ],
  "no-shows": [
    { id: "1", name: "Diana", initials: "DI", time: "5:04 PM", body: "Please if we have any group no-shows or group late arrivals, flag them before 6." },
  ],
  fred: [
    { id: "1", name: "Fred Senecal", initials: "FS", time: "Oct 30", body: "Photo of the stain on 908." },
  ],
};

type ChatBag = {
  lines: (id: string) => ChatLine[];
  draft: (id: string) => string;
  setDraft: (id: string, value: string) => void;
  send: (id: string) => void;
};

const ChatContext = createContext<ChatBag | null>(null);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [sent, setSent] = useState<Record<string, ChatLine[]>>({});
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const value = useMemo<ChatBag>(() => ({
    lines: (id) => [...(CHATS[id] ?? []), ...(sent[id] ?? [])],
    draft: (id) => drafts[id] ?? "",
    setDraft: (id, value) => setDrafts((current) => ({ ...current, [id]: value })),
    send: (id) => {
      const body = (drafts[id] ?? "").trim();
      if (!body) return;
      setSent((current) => ({
        ...current,
        [id]: [...(current[id] ?? []), { id: `sent-${(current[id] ?? []).length}`, ...SARAH, time: "now", body }],
      }));
      setDrafts((current) => ({ ...current, [id]: "" }));
    },
  }), [drafts, sent]);
  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(id: string) {
  const chat = useContext(ChatContext);
  if (!chat) throw new Error("useChat needs ChatProvider");
  return {
    lines: chat.lines(id),
    draft: chat.draft(id),
    setDraft: (value: string) => chat.setDraft(id, value),
    send: () => chat.send(id),
  };
}
