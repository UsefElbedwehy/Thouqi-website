"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { createSupabaseAdminClient } from "@/data/supabase/server";
import { assertAdmin } from "./guard";
import { readAdminConfig, writeAdminConfig } from "./config-service";
import type { HomeSection } from "@/config/types";

export interface AdminActionResult {
  ok: boolean;
  error?: string;
}

/* ------------------------------- customers -------------------------------- */

const roleSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(["customer", "admin"]),
});

export async function setCustomerRoleAction(raw: unknown): Promise<AdminActionResult> {
  await assertAdmin();
  const parsed = roleSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const db = createSupabaseAdminClient();
  const { error } = await db.from("customers").update({ role: parsed.data.role }).eq("id", parsed.data.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/customers");
  return { ok: true };
}

/* --------------------------------- CMS ------------------------------------ */

const cmsSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/),
  titleEn: z.string().min(1),
  titleAr: z.string().min(1),
  bodyEn: z.string().optional().default(""),
  bodyAr: z.string().optional().default(""),
  published: z.boolean().default(false),
});

export async function saveCmsPageAction(raw: unknown): Promise<AdminActionResult> {
  await assertAdmin();
  const parsed = cmsSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid" };
  const d = parsed.data;
  const db = createSupabaseAdminClient();
  const row = {
    slug: d.slug,
    title: { en: d.titleEn, ar: d.titleAr },
    body: { en: d.bodyEn, ar: d.bodyAr },
    published: d.published,
  };
  if (d.id) {
    const { error } = await db.from("cms_pages").update(row).eq("id", d.id);
    if (error) return { ok: false, error: error.message };
  } else {
    const { error } = await db.from("cms_pages").insert(row);
    if (error) return { ok: false, error: error.message };
  }
  revalidatePath("/admin/cms");
  revalidatePath(`/pages/${d.slug}`);
  return { ok: true };
}

export async function deleteCmsPageAction(id: string): Promise<AdminActionResult> {
  await assertAdmin();
  const db = createSupabaseAdminClient();
  const { error } = await db.from("cms_pages").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/admin/cms");
  return { ok: true };
}

/* ------------------------------- settings --------------------------------- */

const settingsSchema = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  primary: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  accent: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  background: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  foreground: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  features: z.record(z.string(), z.boolean()),
});

export async function saveSettingsAction(raw: unknown): Promise<AdminActionResult> {
  await assertAdmin();
  const parsed = settingsSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid" };
  const d = parsed.data;

  const config = await readAdminConfig();
  config.name = { ...config.name, en: d.nameEn, ar: d.nameAr };
  config.theme.colors = {
    ...config.theme.colors,
    primary: d.primary,
    accent: d.accent,
    background: d.background,
    foreground: d.foreground,
  };
  config.features = { ...config.features, ...(d.features as unknown as typeof config.features) };

  try {
    await writeAdminConfig(config);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

/* ------------------------------ navigation --------------------------------- */

const navLinkSchema = z.object({
  labelEn: z.string().min(1),
  labelAr: z.string().min(1),
  href: z.string().min(1),
});

const navColumnSchema = z.object({
  headingEn: z.string().optional().default(""),
  headingAr: z.string().optional().default(""),
  links: z.array(navLinkSchema),
});

const navItemSchema = z.object({
  id: z.string().min(1),
  labelEn: z.string().min(1),
  labelAr: z.string().min(1),
  href: z.string().min(1),
  highlight: z.boolean().default(false),
  columns: z.array(navColumnSchema).optional().default([]),
});

const navigationSchema = z.array(navItemSchema);

export async function saveNavigationAction(raw: unknown): Promise<AdminActionResult> {
  await assertAdmin();
  const parsed = navigationSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? "invalid" };

  const config = await readAdminConfig();
  config.navigation = parsed.data.map((item) => ({
    id: item.id,
    label: { en: item.labelEn, ar: item.labelAr },
    href: item.href,
    highlight: item.highlight,
    columns: item.columns.length
      ? item.columns.map((c) => ({
          heading: c.headingEn || c.headingAr ? { en: c.headingEn, ar: c.headingAr } : undefined,
          links: c.links.map((l) => ({ label: { en: l.labelEn, ar: l.labelAr }, href: l.href })),
        }))
      : undefined,
  }));

  try {
    await writeAdminConfig(config);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}

/* ---------------------------- homepage builder ---------------------------- */

const homeSectionsSchema = z.array(
  z.object({
    id: z.string(),
    type: z.enum(["hero", "productRail", "categoryGrid", "promoBanner", "collectionShowcase"]),
    enabled: z.boolean(),
    order: z.number().int(),
    settings: z.record(z.string(), z.unknown()),
  }),
);

export async function saveHomeSectionsAction(raw: unknown): Promise<AdminActionResult> {
  await assertAdmin();
  const parsed = homeSectionsSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };

  const config = await readAdminConfig();
  config.homeSections = parsed.data as HomeSection[];
  try {
    await writeAdminConfig(config);
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
  revalidatePath("/", "layout");
  return { ok: true };
}
