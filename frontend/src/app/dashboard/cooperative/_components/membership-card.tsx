import { PiggyBank } from "lucide-react";
import type { CooperativeMembership } from "@/lib/api";
import { PayContributionDialog } from "./pay-contribution-dialog";

const MONTH_FORMATTER = new Intl.DateTimeFormat("en-GB", {
  month: "short",
  year: "2-digit",
});

export function MembershipCard({
  membership,
}: {
  membership: CooperativeMembership;
}) {
  const monthlyAmount = Number(membership.monthlyContributionAmount);
  const totalSaved = membership.contributions.reduce(
    (sum, c) => sum + Number(c.amount),
    0,
  );
  const maxAmount = Math.max(
    ...membership.contributions.map((c) => Number(c.amount)),
    monthlyAmount,
  );

  return (
    <div className="rounded-2xl border border-border-secondary bg-background-bg-primary p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-text-brand-secondary-700">
            <PiggyBank className="h-4 w-4" />
            <span className="text-xs font-semibold tracking-wide uppercase">
              {membership.cooperative.targetPropertyType} &middot;{" "}
              {membership.cooperative.targetAreaKey.replace("-", " ")}
            </span>
          </div>
          <h3 className="mt-1 text-lg font-semibold text-text-primary-900">
            {membership.cooperative.name}
          </h3>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-text-primary-900">
            ₦{totalSaved.toLocaleString()}
          </p>
          <p className="text-xs text-text-tertiary-600">saved so far</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-6 border-t border-border-secondary pt-4 text-sm text-text-secondary-700">
        <span>₦{monthlyAmount.toLocaleString()}/month</span>
        <span>
          {membership.contributions.length} month
          {membership.contributions.length === 1 ? "" : "s"} active
        </span>
      </div>

      {membership.contributions.length > 0 && (
        <div className="mt-5 space-y-2">
          {membership.contributions.map((contribution) => {
            const amount = Number(contribution.amount);
            const widthPct =
              maxAmount > 0 ? Math.max((amount / maxAmount) * 100, 8) : 0;
            return (
              <div
                key={contribution.id}
                className="flex items-center gap-3 text-xs"
              >
                <span className="w-14 shrink-0 text-text-tertiary-600">
                  {MONTH_FORMATTER.format(new Date(contribution.month))}
                </span>
                <div className="h-2 flex-1 rounded-full bg-background-bg-secondary">
                  <div
                    className="h-2 rounded-full bg-button-primary-default"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
                <span className="w-20 shrink-0 text-right text-text-secondary-700">
                  ₦{amount.toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 flex justify-end border-t border-border-secondary pt-4">
        <PayContributionDialog membership={membership} />
      </div>
    </div>
  );
}
