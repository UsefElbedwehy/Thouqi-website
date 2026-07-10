import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost" | "dark";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 font-medium uppercase tracking-[0.12em] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none rounded-[--radius]";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-primary-foreground hover:bg-foreground",
  outline: "border border-current text-foreground hover:bg-foreground hover:text-background",
  ghost: "text-foreground hover:text-primary",
  dark: "bg-foreground text-background hover:bg-primary hover:text-primary-foreground",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-[11px]",
  md: "px-6 py-3 text-xs",
  lg: "px-8 py-4 text-sm",
};

export function buttonClass(opts?: { variant?: Variant; size?: Size; className?: string }) {
  return cn(base, variants[opts?.variant ?? "primary"], sizes[opts?.size ?? "md"], opts?.className);
}

/** Premium button primitive. For links, use `buttonClass()` on a <Link>. */
export function Button({
  children,
  variant = "primary",
  size = "md",
  className,
  ...props
}: {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={buttonClass({ variant, size, className })} {...props}>
      {children}
    </button>
  );
}
