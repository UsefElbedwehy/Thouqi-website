import { NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { getAdminUser } from "@/core/admin/guard";
import { createSupabaseAdminClient } from "@/data/supabase/server";

const BUCKET = "product-media";
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/svg+xml": "svg",
};

/**
 * Admin image upload → Supabase Storage. Admin-gated; uploads with the service
 * role to the public `product-media` bucket and returns the public URL to store
 * on the product. Route handler (not a server action) so it isn't bound by the
 * 1 MB server-action body limit.
 */
export async function POST(request: Request) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "no_file" }, { status: 400 });
  }
  const ext = ALLOWED[file.type];
  if (!ext) return NextResponse.json({ error: "bad_type" }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: "too_large" }, { status: 413 });

  const path = `products/${randomUUID()}.${ext}`;
  const db = createSupabaseAdminClient();
  const { error } = await db.storage
    .from(BUCKET)
    .upload(path, await file.arrayBuffer(), { contentType: file.type, upsert: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = db.storage.from(BUCKET).getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl });
}
