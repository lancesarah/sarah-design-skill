"use client";

import { Button, Empty, RoomMark, Widget, WidgetEmpty } from "@lance-live/gallery-ui";
import { useEffect, useRef, useState } from "react";

type Upsell = { id: string; room: string; offer: string; guest: string; price: number };
type Answer = "confirmed" | "denied";

/** How long an answered request holds before it leaves. */
const HOLD = 700;

/** Accepted by the guest, waiting on the desk. Oldest first. */
const REQUESTS: Upsell[] = [
  { id: "u1", room: "714", offer: "Late checkout, 2 PM", guest: "Dana Price", price: 40 },
  { id: "u2", room: "1108", offer: "Upgrade to a suite", guest: "Elena Ruiz", price: 120 },
  { id: "u3", room: "305", offer: "Early check-in, 11 AM", guest: "Marcus Lee", price: 30 },
  { id: "u4", room: "912", offer: "Breakfast for two", guest: "Priya Shah", price: 36 },
];

/** Offers a guest said yes to. Each row is answered in place: Confirm or Deny. An answer holds, then the row leaves. */
export function UpsellWidget() {
  const [requests, setRequests] = useState(REQUESTS);
  const [answers, setAnswers] = useState<Record<string, Answer>>({});
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((timer) => window.clearTimeout(timer)), []);

  function answer(id: string, value: Answer) {
    setAnswers((current) => ({ ...current, [id]: value }));
    timers.current.push(window.setTimeout(() => setRequests((current) => current.filter((request) => request.id !== id)), HOLD));
  }

  return (
    <Widget icon="tag" title="Upsell requests" count={requests.length}>
      {requests.length ? (
        <ul className="widget-list home-upsell-list">
          {requests.map((request) => {
            const answered = answers[request.id];
            return (
              <li key={request.id} className="home-upsell">
                <RoomMark room={request.room} />
                <span className="home-upsell-copy">
                  <span className="home-upsell-offer">{request.offer}</span>
                  <span className="home-upsell-sub">
                    {request.guest} · <span className="home-upsell-price">${request.price}</span>
                  </span>
                </span>
                {answered ? (
                  <span className="home-upsell-answer" role="status">
                    {answered === "confirmed" ? "Confirmed" : "Denied"}
                  </span>
                ) : (
                  <span className="home-upsell-actions">
                    {/* design-check: allow. Deny answers a request. It deletes nothing, so it skips Delete confirmation. */}
                    <Button variant="danger-light" onClick={() => answer(request.id, "denied")}>
                      Deny
                    </Button>
                    <Button variant="secondary" onClick={() => answer(request.id, "confirmed")}>
                      Confirm
                    </Button>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <WidgetEmpty>
          <Empty icon="tag" title="No upsell requests">
            Offers guests accept show here to confirm.
          </Empty>
        </WidgetEmpty>
      )}
    </Widget>
  );
}
