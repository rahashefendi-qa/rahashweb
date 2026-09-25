import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type Variant = "solid" | "outline" | "ghost" | "light";
type Size = "md" | "lg" | "sm";

const base =
  "group relative inline-flex items-center justify-center gap-2 overflow-hidden whitespace-nowrap text-[0.72rem] font-medium uppercase tracking-[0.22em] transition-[background,color,border-color,transform] duration-300 ease-[var(--ease-luxe)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40 select-none";

const variants: Record<Variant, string> = {
  solid: "bg-paper text-ink hover:bg-brass-soft",
  light: "bg-ink text-paper hover:bg-graphite",
  outline: "border border-paper/30 text-paper hover:border-paper hover:bg-paper hover:text-ink",
  ghost: "text-paper hover:text-brass-soft",
};

const sizes: Record<Size, string> = {
  sm: "h-10 px-4",
  md: "h-12 px-6",
  lg: "h-14 px-8",
};

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = "solid", size = "md", ...props },
  ref,
) {
  return <button ref={ref} className={cn(base, variants[variant], sizes[size], className)} {...props} />;
});

export function ButtonLink({
  href,
  className,
  variant = "solid",
  size = "md",
  children,
  ...props
}: React.ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return (
    <Link href={href} className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </Link>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn("inline-block h-3.5 w-3.5 animate-spin rounded-full border border-current border-t-transparent", className)}
    />
  );
}
