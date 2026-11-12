const HREFS: Record<string, string> = {
  Home: "/home",
  "Internal notes": "/notes",
  "To-Dos": "/todos",
  Complaints: "/complaints",
  Calls: "/calls",
  "Knowledge base": "/knowledge",
  "Cash & bank": "/cash",
  "Lost & found": "/lost-found",
  PM: "/pm",
};

export function hrefFor(label: string) {
  return HREFS[label];
}

const PAGES: Record<string, string> = {
  "/home": "Home",
  "/notes": "Internal notes",
  "/todos": "To-Dos",
  "/complaints": "Complaints",
  "/calls": "Calls",
  "/knowledge": "Knowledge base",
  "/cash": "Cash & bank",
  "/lost-found": "Lost & found",
  "/pm": "PM",
};

export function pageLabel(pathname: string) {
  return PAGES[pathname];
}
