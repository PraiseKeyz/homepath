import { Bell } from "lucide-react";

export default function NotificationsPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-text-primary-900">
        Notifications
      </h1>
      <p className="mt-1 text-sm text-text-tertiary-600">
        Match responses, ratings, and community reports on your properties, in
        one place.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong py-24 text-center">
        <Bell className="mb-3 h-10 w-10 text-text-quaternary-500" />
        <p className="text-sm font-medium text-text-tertiary-600">
          Coming soon
        </p>
        <p className="mt-1 max-w-xs text-xs text-text-quaternary-500">
          Real-time notifications are being wired up to real events — no
          placeholder counts here until they are.
        </p>
      </div>
    </div>
  );
}
