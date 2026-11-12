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
  /** When the line was sent, so a fresh reply can be grouped with the one before it. */
  at?: number;
};

const SARAH = { name: "Sarah Mou", initials: "SM", photo: "/avatar-sarah.png" };
const GAVIN = { name: "Gavin from Lance", initials: "GV", photo: "/avatar-gavin.png" };

const CHATS: Record<string, ChatLine[]> = {
  gavin: [
    { id: "1", ...SARAH, time: "9:02 AM", body: "Anything waiting on me?" },
    { id: "2", ...GAVIN, time: "9:02 AM", body: "0 open tickets" },
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
    { id: "4", name: "Bernadette", initials: "BE", day: "Wednesday, November 4", time: "8:48 AM", body: "Can I get some help with Booking messages please" },
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
  "deleted-note": [
    { id: "1", name: "Bernadette", initials: "BE", day: "Wednesday, November 4", time: "8:46 AM", body: "Ignore the last note. I sent it to the wrong channel." },
  ],
  /* A support ticket is its own conversation, keyed by the ticket number. */
  "ticket-2709": [
    { id: "1", name: "Stephanie Samuels", initials: "SS", time: "5:41 AM", body: "The mobile app will not take or show pictures on an inspection. It started this morning." },
    { id: "2", ...GAVIN, time: "5:44 AM", body: "Thanks for flagging this. Is it every inspection, or one room?" },
    { id: "3", name: "Stephanie Samuels", initials: "SS", time: "5:47 AM", body: "Every inspection, on two phones." },
    { id: "4", ...GAVIN, time: "5:49 AM", body: "Hi! Thank you for submitting a ticket. We'll take a look into this and follow up!" },
    { id: "5", ...GAVIN, time: "6:02 AM", body: "Hi! I'm working on it" },
  ],
  "ticket-2589": [
    { id: "1", name: "Bernadette Kelley", initials: "BK", day: "Monday, November 2", time: "2:12 PM", body: "Can we set up a checklist that repeats, or a to-do that comes back every week?" },
    { id: "2", ...GAVIN, day: "Monday, November 2", time: "2:15 PM", body: "Hi! Thank you for submitting a ticket. We'll take a look into this and follow up!" },
  ],
  "ticket-2500": [
    { id: "1", name: "Stephanie Samuels", initials: "SS", day: "Thursday, October 29", time: "10:20 AM", body: "Maintenance tasks stay in Spanish on mobile, even with the app set to English." },
    { id: "2", ...GAVIN, day: "Thursday, October 29", time: "10:24 AM", body: "Hi! Thank you for submitting a ticket. We'll take a look into this and follow up!" },
    { id: "3", ...GAVIN, day: "Saturday, October 31", time: "3:40 PM", body: "This is fixed in the latest update. Tasks now follow the language the app is set to." },
  ],
  "ticket-1085": [
    { id: "1", name: "Isaac", initials: "IS", day: "Monday, October 19", time: "11:05 AM", body: "It would help to see the last completed date on each PM." },
    { id: "2", ...GAVIN, day: "Monday, October 19", time: "11:09 AM", body: "Hi! Thank you for submitting a ticket. We'll take a look into this and follow up!" },
    { id: "3", ...GAVIN, day: "Thursday, October 22", time: "9:30 AM", body: "The last completed date now shows on every PM." },
  ],
};

const TWO_MINUTES = 2 * 60 * 1000;

export function clockTime(date = new Date()) {
  const hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const hour = hours % 12 || 12;
  const suffix = hours < 12 ? "AM" : "PM";
  return `${hour}:${minutes} ${suffix}`;
}

function clockMinutes(time: string) {
  const match = /^(\d{1,2}):(\d{2})\s*(AM|PM)$/i.exec(time.trim());
  if (!match) return null;
  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const suffix = match[3].toUpperCase();
  if (suffix === "AM" && hours === 12) hours = 0;
  if (suffix === "PM" && hours !== 12) hours += 12;
  return hours * 60 + minutes;
}

/** Same person, same day, and no more than two minutes after the line before. */
export function continuesRun(prev: ChatLine, next: ChatLine) {
  if (prev.name !== next.name) return false;
  if ((prev.day ?? "") !== (next.day ?? "")) return false;
  if (prev.at != null && next.at != null) return next.at >= prev.at && next.at - prev.at <= TWO_MINUTES;
  const earlier = clockMinutes(prev.time);
  const later = clockMinutes(next.time);
  if (earlier == null || later == null) return false;
  const delta = later - earlier;
  return delta >= 0 && delta <= 2;
}

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
      const sentAt = new Date();
      setSent((current) => ({
        ...current,
        [id]: [...(current[id] ?? []), { id: `sent-${(current[id] ?? []).length}`, ...SARAH, time: clockTime(sentAt), at: sentAt.getTime(), body }],
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
