"use client";

import { Avatar, Icon, Widget, WidgetList, WidgetRow } from "@lance-live/sds";
import Link from "next/link";

type HomeNote = { id: string; initials: string; name: string; time: string; title: string; preview: string };

const NOTES: HomeNote[] = [
  { id: "n1", initials: "CS", name: "Cy Smith", time: "9h", title: "11/10 NA shift", preview: "Guest Khari Emberly checked out two days early. I did not check them out in the system." },
  { id: "n2", initials: "AC", name: "Ana Cruz", time: "17h", title: "11/10 PM shift", preview: "Room moves completed: 428 to 423. Rooms out of order: 618, 722, 924." },
  { id: "n3", initials: "JR", name: "Jo Reyes", time: "1d", title: "AM shift", preview: "Smooth shift. Delta all assigned and checked in." },
];

export function NotesWidget() {
  return (
    <Widget
      icon="doc"
      title="Internal notes"
      count={NOTES.length}
      action={
        <Link className="sds text-icon sm" href="/notes?new" aria-label="New note">
          <Icon name="plus" size={14} />
        </Link>
      }
    >
      <WidgetList>
        {NOTES.map((note) => (
          <WidgetRow key={note.id} as={Link} href="/notes" lead={<Avatar initials={note.initials} name={note.name} />} title={note.title} subtitle={note.preview} subtitleTone="muted" meta={note.time} />
        ))}
      </WidgetList>
    </Widget>
  );
}
