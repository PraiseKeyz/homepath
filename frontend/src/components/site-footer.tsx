export function SiteFooter() {
  return (
    <footer className="border-t border-border-secondary bg-background-bg-primary">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-10 text-sm text-text-quaternary-500 sm:flex-row">
        <span className="font-semibold text-text-secondary-700">HomePath</span>
        <p>
          Hackathon build — not a licensed real estate, mortgage, or legal
          service.
        </p>
      </div>
    </footer>
  );
}
