import type { ComponentType } from "react";
import type { DepartmentValue } from "@lance-live/gallery-ui";
import { ActivityWidget } from "./activity-widget";
import { AwaitingReplyWidget } from "./awaiting-reply-widget";
import { CompletedWidget } from "./completed-widget";
import { ComplaintsWidget } from "./complaints-widget";
import { DeparturesWidget } from "./departures-widget";
import { DndWidget } from "./dnd-widget";
import { EventsWidget } from "./events-widget";
import { GuestroomPmWidget } from "./guestroom-pm-widget";
import { HousekeepingLeaderboardWidget } from "./housekeeping-leaderboard-widget";
import { HousekeepingWidget } from "./housekeeping-widget";
import { InspectionsWidget } from "./inspections-widget";
import { KnowledgeWidget } from "./knowledge-widget";
import { LanceWeekWidget } from "./lance-week-widget";
import { LeadTrendWidget } from "./lead-trend-widget";
import { LeadsWidget } from "./leads-widget";
import { MaintenanceLeaderboardWidget } from "./maintenance-leaderboard-widget";
import { MaintenanceTodosWidget } from "./maintenance-todos-widget";
import { MaintenanceWidget } from "./maintenance-widget";
import { MeetingsWidget } from "./meetings-widget";
import { MinibarWidget } from "./minibar-widget";
import { NotesWidget } from "./notes-widget";
import { OutOfRangeWidget } from "./out-of-range-widget";
import { PipelineFunnelWidget } from "./pipeline-funnel-widget";
import { PipelineStagesWidget } from "./pipeline-stages-widget";
import { PipelineValueWidget } from "./pipeline-value-widget";
import { PmComplianceWidget } from "./pm-compliance-widget";
import { PmWidget } from "./pm-widget";
import { ProblemRoomsWidget } from "./problem-rooms-widget";
import { QuestionsWidget } from "./questions-widget";
import { ReadingsOnTimeWidget } from "./readings-on-time-widget";
import { ReadingsWidget } from "./readings-widget";
import { ReplyTimeWidget } from "./reply-time-widget";
import { ResponseTimeWidget } from "./response-time-widget";
import { RoomMapWidget } from "./room-map-widget";
import { SalesOverviewWidget } from "./sales-overview-widget";
import { SalesTodayWidget } from "./sales-today-widget";
import { TicketsWidget } from "./tickets-widget";
import { TimeSavedWidget } from "./time-saved-widget";
import { TodosWidget } from "./todos-widget";
import { TriageBacklogWidget } from "./triage-backlog-widget";
import { UpsellWidget } from "./upsell-widget";
import { VoiceWidget } from "./voice-widget";

export type WidgetCategory = { id: string; department: DepartmentValue };

export const WIDGET_CATEGORIES: WidgetCategory[] = [
  { id: "front-desk", department: "Front desk" },
  { id: "housekeeping", department: "Housekeeping" },
  { id: "maintenance", department: "Maintenance" },
  { id: "sales", department: "Sales" },
];

/** `title` matches the widget's own head, for the gallery's label and search. `wide` takes the whole row. */
export type HomeWidget = { id: string; title: string; category: string; wide?: boolean; Component: ComponentType };

/** Every widget Home can show, in the order Home shows them. */
export const HOME_WIDGETS: HomeWidget[] = [
  { id: "room-map", title: "Room map", category: "front-desk", wide: true, Component: RoomMapWidget },
  { id: "todos", title: "To-dos", category: "front-desk", Component: TodosWidget },
  { id: "events", title: "Today's events", category: "front-desk", Component: EventsWidget },
  { id: "minibar", title: "Minibar", category: "front-desk", Component: MinibarWidget },
  { id: "complaints", title: "Complaints", category: "front-desk", Component: ComplaintsWidget },
  { id: "upsell", title: "Upsell requests", category: "front-desk", Component: UpsellWidget },
  { id: "tickets", title: "Tickets by channel", category: "front-desk", Component: TicketsWidget },
  { id: "dnd", title: "Front desk tools", category: "front-desk", Component: DndWidget },
  { id: "notes", title: "Internal notes", category: "front-desk", Component: NotesWidget },
  { id: "questions", title: "Unanswered questions", category: "front-desk", Component: QuestionsWidget },
  { id: "voice", title: "Voice overview", category: "front-desk", Component: VoiceWidget },
  { id: "departures", title: "Departures", category: "front-desk", Component: DeparturesWidget },
  { id: "knowledge", title: "Knowledge health", category: "front-desk", Component: KnowledgeWidget },
  { id: "housekeeping", title: "Housekeeping", category: "housekeeping", Component: HousekeepingWidget },
  { id: "inspections", title: "Inspections", category: "housekeeping", Component: InspectionsWidget },
  { id: "housekeeping-leaderboard", title: "Housekeeper leaderboard", category: "housekeeping", Component: HousekeepingLeaderboardWidget },
  { id: "pms", title: "PMs", category: "maintenance", Component: PmWidget },
  { id: "maintenance-todos", title: "Maintenance", category: "maintenance", Component: MaintenanceTodosWidget },
  { id: "readings", title: "Readings", category: "maintenance", Component: ReadingsWidget },
  { id: "maintenance-leaderboard", title: "Engineer leaderboard", category: "maintenance", Component: MaintenanceLeaderboardWidget },
  { id: "response-time", title: "Response time", category: "maintenance", Component: ResponseTimeWidget },
  { id: "guestroom-pms", title: "Guestroom PMs", category: "maintenance", Component: GuestroomPmWidget },
  { id: "readings-on-time", title: "Readings on time", category: "maintenance", Component: ReadingsOnTimeWidget },
  { id: "completed", title: "Completed today", category: "maintenance", Component: CompletedWidget },
  { id: "problem-rooms", title: "Problem rooms", category: "maintenance", Component: ProblemRoomsWidget },
  { id: "out-of-range", title: "Out of range", category: "maintenance", Component: OutOfRangeWidget },
  { id: "pm-compliance", title: "PM compliance", category: "maintenance", Component: PmComplianceWidget },
  { id: "maintenance-overview", title: "Maintenance overview", category: "maintenance", Component: MaintenanceWidget },
  { id: "reply-time", title: "Average time to respond", category: "sales", Component: ReplyTimeWidget },
  { id: "leads", title: "Active leads", category: "sales", Component: LeadsWidget },
  { id: "activity", title: "Activity", category: "sales", Component: ActivityWidget },
  { id: "pipeline-value", title: "Pipeline", category: "sales", Component: PipelineValueWidget },
  { id: "pipeline-stages", title: "Pipeline stages", category: "sales", Component: PipelineStagesWidget },
  { id: "awaiting-reply", title: "Awaiting reply", category: "sales", Component: AwaitingReplyWidget },
  { id: "time-saved", title: "Time saved", category: "sales", Component: TimeSavedWidget },
  { id: "sales-overview", title: "Sales overview", category: "sales", Component: SalesOverviewWidget },
  { id: "pipeline-funnel", title: "Pipeline funnel", category: "sales", Component: PipelineFunnelWidget },
  { id: "lead-trend", title: "Lead trend", category: "sales", Component: LeadTrendWidget },
  { id: "triage-backlog", title: "Triage backlog", category: "sales", Component: TriageBacklogWidget },
  { id: "sales-today", title: "What to do today", category: "sales", Component: SalesTodayWidget },
  { id: "lance-week", title: "Lance this week", category: "sales", Component: LanceWeekWidget },
  { id: "meetings", title: "Meetings", category: "sales", Component: MeetingsWidget },
];
