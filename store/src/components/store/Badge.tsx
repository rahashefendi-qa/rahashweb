import { cn } from "@/lib/utils";

export function Badge({ children, tone = "light", className }: { children: React.ReactNode; tone?: "light" | "dark" | "brass"; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em]",
        tone === "light" && "bg-paper text-ink",
        tone === "dark" && "bg-ink/85 text-paper backdrop-blur",
        tone === "brass" && "bg-brass text-ink",
        className,
      )}
    >
      {children}
    </span>
  );
}
