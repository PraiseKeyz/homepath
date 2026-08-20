import Link from "next/link";
import { Button } from "@/components/ui/button";

export function DeveloperCta() {
  return (
    <section id="developers" className="bg-background-bg-brand-section">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-6 py-20 text-center">
        <h2 className="text-3xl font-bold text-text-primary-on-brand">
          Building affordable housing? See real demand first.
        </h2>
        <p className="max-w-2xl text-text-secondary-on-brand">
          BuildMatch turns cooperative savings data into a live demand signal —
          &quot;In Mowe-Ofada, 1,240 members are saving ₦18,000/month toward a
          2-bedroom unit.&quot; Pre-sell before you break ground.
        </p>
        <Button
          asChild
          size="lg"
          variant="secondary"
          className="border-0 bg-background-bg-primary text-text-primary-900 hover:bg-background-bg-primary-hover"
        >
          <Link href="/developers">See how BuildMatch works</Link>
        </Button>
      </div>
    </section>
  );
}
