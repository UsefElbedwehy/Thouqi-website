import type { ReactNode } from "react";
import { Plus, Minus } from "lucide-react";

/**
 * Native <details> accordion — accessible and JS-free. `open` controls the
 * default-expanded state.
 */
export function Accordion({
  title,
  children,
  open = false,
}: {
  title: string;
  children: ReactNode;
  open?: boolean;
}) {
  return (
    <details open={open} className="group border-b border-border py-4">
      <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold">
        {title}
        <Plus className="size-4 group-open:hidden" />
        <Minus className="hidden size-4 group-open:block" />
      </summary>
      <div className="pt-3 text-sm text-muted-foreground">{children}</div>
    </details>
  );
}
