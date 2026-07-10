import type { SiteConfig } from "@/config/types";

/**
 * Injects the active SiteConfig's colors/radius as CSS variables at request
 * time. This is what makes remote rebranding work with zero code changes:
 * change the colors in the backend → they flow into these variables → the whole
 * UI (which only references tokens) re-themes. Server component, no JS shipped.
 */
export function ThemeStyle({ config }: { config: SiteConfig }) {
  const { colors, radius } = config.theme;
  const css = `:root{
    --color-primary:${colors.primary};
    --color-primary-foreground:${colors.primaryForeground};
    --color-accent:${colors.accent};
    --color-background:${colors.background};
    --color-foreground:${colors.foreground};
    --color-muted:${colors.muted};
    --color-muted-foreground:${colors.mutedForeground};
    --color-border:${colors.border};
    --color-success:${colors.success};
    --color-success-foreground:${colors.successForeground};
    --radius:${radius};
  }`.replace(/\s+/g, " ");

  return <style dangerouslySetInnerHTML={{ __html: css }} />;
}
