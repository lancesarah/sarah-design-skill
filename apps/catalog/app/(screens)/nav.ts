import type { SidebarGroup, SidebarLink } from "@lance-live/sds";
import { MESSAGE_COUNT } from "./messages";
import { NOTICE_COUNT } from "./notifications";

export const NAV_FIXED: SidebarLink[] = [
  { href: "/home", icon: "home", label: "Home" },
  { icon: "bubble", label: "Messages", tip: "Opt M", count: MESSAGE_COUNT },
  { icon: "bell", label: "Notifications", tip: "Opt N", count: NOTICE_COUNT },
  { href: "/notes", icon: "doc", label: "Internal notes" },
];

export const NAV_GROUPS: SidebarGroup[] = [
  {
    title: "Pinned",
    pinned: true,
    open: true,
    links: [
      { icon: "grid", label: "Boards" },
      { href: "/todos", icon: "clipboard", label: "To-Dos" },
      { href: "/complaints", icon: "alert", label: "Complaints" },
      { href: "/cash", icon: "card", label: "Cash & bank" },
      { icon: "calendar", label: "Schedule" },
    ],
  },
  {
    title: "Guest",
    open: true,
    links: [
      { href: "/calls", icon: "phone", label: "Calls" },
      { href: "/guest-messages", icon: "bubble-lines", label: "Guest messages" },
    ],
  },
  {
    title: "Operations",
    open: false,
    links: [
      { icon: "grid", label: "Boards" },
      { href: "/todos", icon: "clipboard", label: "To-Dos" },
      { href: "/complaints", icon: "alert", label: "Complaints" },
      { icon: "calendar", label: "Schedule" },
      { href: "/lost-found", icon: "tag", label: "Lost & found" },
      { href: "/cash", icon: "card", label: "Cash & bank" },
    ],
  },
  {
    title: "Facilities",
    open: false,
    links: [
      { href: "/pm", icon: "wrench", label: "PM" },
      { href: "/readings", icon: "gauge", label: "Readings" },
    ],
  },
  {
    title: "Records",
    open: true,
    links: [
      { href: "/notes", icon: "doc", label: "Internal notes" },
      { href: "/knowledge", icon: "book", label: "Knowledge base" },
    ],
  },
  {
    title: "Sales",
    open: false,
    links: [{ icon: "share", label: "Sales" }],
  },
];
