const HREFS: Record<string, string> = {
  Home: "/",
  "Internal notes": "/notes",
  "To-Dos": "/todos",
  Complaints: "/complaints",
  Calls: "/calls",
  "Knowledge base": "/knowledge",
  "Cash & bank": "/cash",
  PM: "/pm",
};

export function hrefFor(label: string) {
  return HREFS[label];
}

const PAGES: Record<string, string> = {
  "/notes": "Internal notes",
  "/todos": "To-Dos",
  "/complaints": "Complaints",
  "/calls": "Calls",
  "/knowledge": "Knowledge base",
  "/cash": "Cash & bank",
  "/pm": "PM",
};

export function pageLabel(pathname: string) {
  return PAGES[pathname];
}
