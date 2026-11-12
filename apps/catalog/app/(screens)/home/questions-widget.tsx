"use client";

import { Empty, Widget, WidgetEmpty, WidgetList, WidgetMore, WidgetRow } from "@lance-live/gallery-ui";
import Link from "next/link";

type HomeQuestion = { id: string; question: string; asked: string };

/** A glance, not the list. The rest wait behind "+ N more". */
const LIMIT = 4;

/** Newest first. */
const QUESTIONS: HomeQuestion[] = [
  { id: "q1", question: "What time does the pool close?", asked: "8m" },
  { id: "q2", question: "Can I bring my dog to the rooftop?", asked: "26m" },
  { id: "q3", question: "Is there a shuttle to the airport?", asked: "1h" },
  { id: "q4", question: "Do you have a crib for room 412?", asked: "2h" },
  { id: "q5", question: "Where can I charge an electric car?", asked: "5h" },
  { id: "q6", question: "Is the gym open on holidays?", asked: "1d" },
];

/** Questions guests asked that Lance had no answer for. Every row goes to the knowledge base. */
export function QuestionsWidget() {
  const shown = QUESTIONS.slice(0, LIMIT);
  const more = QUESTIONS.length - shown.length;
  return (
    <Widget icon="bubble" title="Unanswered questions" count={QUESTIONS.length}>
      {shown.length ? (
        <WidgetList>
          {shown.map((item) => (
            <WidgetRow key={item.id} as={Link} href="/knowledge" title={item.question} meta={item.asked} />
          ))}
          {more > 0 ? (
            <WidgetMore as={Link} href="/knowledge">
              + {more} more
            </WidgetMore>
          ) : null}
        </WidgetList>
      ) : (
        <WidgetEmpty>
          <Empty icon="bubble" title="No unanswered questions">
            Lance has answered everything that came in.
          </Empty>
        </WidgetEmpty>
      )}
    </Widget>
  );
}
