import { MessageCircle } from "lucide-react";

export default function MessagesPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-text-primary-900">Messages</h1>
      <p className="mt-1 text-sm text-text-tertiary-600">
        Message landlords and cooperative members directly, without leaving
        HomePath.
      </p>

      <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-strong py-24 text-center">
        <MessageCircle className="mb-3 h-10 w-10 text-text-quaternary-500" />
        <p className="text-sm font-medium text-text-tertiary-600">
          Coming soon
        </p>
        <p className="mt-1 max-w-xs text-xs text-text-quaternary-500">
          Direct messaging is being built. For now, contact details for a
          listing's landlord are on the property's page.
        </p>
      </div>
    </div>
  );
}
