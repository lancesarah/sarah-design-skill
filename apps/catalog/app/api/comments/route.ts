import { del, get, list, put } from "@vercel/blob";

export const dynamic = "force-dynamic";

const ACCESS = process.env.COMMENTS_BLOB_ACCESS === "public" ? "public" : "private";
const ROOT = "comments";
const NAME_MAX = 60;
const TEXT_MAX = 2000;

type Anchor = { selector: string; rx: number; ry: number; x: number; y: number };
type Message = { id: string; name: string; text: string; at: string };
type Resolution = { name: string; at: string };
export type Thread = { id: string; anchor: Anchor; messages: Message[]; resolved: Resolution | null };

/** Without a Blob token, as in local dev, comments live in memory until the server restarts. */
const memory: Map<string, string> = ((globalThis as { __comments?: Map<string, string> }).__comments ??= new Map());
const hasBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

async function write(pathname: string, value: unknown) {
  const body = JSON.stringify(value);
  if (!hasBlob()) {
    memory.set(pathname, body);
    return;
  }
  await put(pathname, body, { access: ACCESS, contentType: "application/json", addRandomSuffix: false, allowOverwrite: true });
}

async function remove(pathnames: string[]) {
  if (!pathnames.length) return;
  if (!hasBlob()) {
    pathnames.forEach((pathname) => memory.delete(pathname));
    return;
  }
  await del(pathnames);
}

async function listPaths(prefix: string) {
  if (!hasBlob()) return [...memory.keys()].filter((key) => key.startsWith(prefix));
  const paths: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ prefix, cursor, limit: 1000 });
    paths.push(...page.blobs.map((blob) => blob.pathname));
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);
  return paths;
}

async function read<T>(pathname: string): Promise<T | null> {
  if (!hasBlob()) {
    const value = memory.get(pathname);
    return value ? (JSON.parse(value) as T) : null;
  }
  const result = await get(pathname, { access: ACCESS, useCache: false });
  if (!result) return null;
  return (await new Response(result.stream).json()) as T;
}

function pageKey(page: unknown) {
  if (typeof page !== "string" || !page || page.length > 300) return null;
  return Buffer.from(page).toString("base64url");
}

const id = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
const safeId = (value: unknown) => (typeof value === "string" && /^[a-z0-9]{6,32}$/.test(value) ? value : null);

function clean(value: unknown, max: number) {
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text && text.length <= max ? text : null;
}

function cleanAnchor(value: unknown): Anchor | null {
  if (!value || typeof value !== "object") return null;
  const a = value as Record<string, unknown>;
  const num = (n: unknown) => (typeof n === "number" && Number.isFinite(n) ? n : null);
  const selector = typeof a.selector === "string" && a.selector.length <= 1000 ? a.selector : "";
  const [rx, ry, x, y] = [num(a.rx), num(a.ry), num(a.x), num(a.y)];
  if (rx === null || ry === null || x === null || y === null) return null;
  return { selector, rx, ry, x, y };
}

async function threadsFor(key: string): Promise<Thread[]> {
  const paths = await listPaths(`${ROOT}/${key}/`);
  const byThread = new Map<string, string[]>();
  for (const path of paths) {
    const threadId = path.split("/")[2];
    if (!byThread.has(threadId)) byThread.set(threadId, []);
    byThread.get(threadId)!.push(path);
  }
  const threads = await Promise.all(
    [...byThread].map(async ([threadId, files]) => {
      const anchorPath = files.find((file) => file.endsWith("/anchor.json"));
      const resolvedPath = files.find((file) => file.endsWith("/resolved.json"));
      const messagePaths = files.filter((file) => file.includes("/m-")).sort();
      const [anchor, resolved, messages] = await Promise.all([
        anchorPath ? read<Anchor>(anchorPath) : null,
        resolvedPath ? read<Resolution>(resolvedPath) : null,
        Promise.all(messagePaths.map((path) => read<Message>(path))),
      ]);
      if (!anchor) return null;
      return { id: threadId, anchor, resolved, messages: messages.filter((m): m is Message => Boolean(m)) };
    }),
  );
  return threads
    .filter((thread): thread is Thread => Boolean(thread && thread.messages.length))
    .sort((a, b) => a.messages[0].at.localeCompare(b.messages[0].at));
}

const bad = (message: string, status = 400) => Response.json({ error: message }, { status });

export async function GET(request: Request) {
  const key = pageKey(new URL(request.url).searchParams.get("page"));
  if (!key) return bad("Missing page");
  return Response.json({ threads: await threadsFor(key) });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return bad("Invalid body");
  const key = pageKey(body.page);
  if (!key) return bad("Missing page");
  const action = body.action;
  const name = clean(body.name, NAME_MAX);

  if (action === "create" || action === "reply") {
    if (!name) return bad("Add your name to comment");
    const text = clean(body.text, TEXT_MAX);
    if (!text) return bad("Write a comment");
    const threadId = action === "create" ? id() : safeId(body.thread);
    if (!threadId) return bad("Missing thread");
    if (action === "create") {
      const anchor = cleanAnchor(body.anchor);
      if (!anchor) return bad("Missing spot");
      await write(`${ROOT}/${key}/${threadId}/anchor.json`, anchor);
    }
    const at = new Date().toISOString();
    await write(`${ROOT}/${key}/${threadId}/m-${at.replace(/[:.]/g, "")}-${id()}.json`, { id: id(), name, text, at });
  } else if (action === "resolve" || action === "reopen") {
    const threadId = safeId(body.thread);
    if (!threadId) return bad("Missing thread");
    const path = `${ROOT}/${key}/${threadId}/resolved.json`;
    if (action === "resolve") {
      if (!name) return bad("Add your name to resolve");
      await write(path, { name, at: new Date().toISOString() });
    } else {
      await remove([path]);
    }
  } else if (action === "delete") {
    const threadId = safeId(body.thread);
    if (!threadId) return bad("Missing thread");
    await remove(await listPaths(`${ROOT}/${key}/${threadId}/`));
  } else {
    return bad("Unknown action");
  }

  return Response.json({ threads: await threadsFor(key) });
}
