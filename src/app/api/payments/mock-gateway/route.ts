import { getSiteConfig } from "@/config";

/**
 * Built-in SANDBOX gateway page (mock provider only). Simulates a hosted
 * payment screen: "Approve" fires the webhook (server-to-server confirmation)
 * then returns the browser to the callback; "Decline" returns without paying.
 * Never used with a real provider.
 */
export async function GET(request: Request) {
  const config = await getSiteConfig();
  if (config.payments.provider !== "mock") {
    return new Response("Sandbox gateway is disabled.", { status: 404 });
  }

  const url = new URL(request.url);
  const ref = url.searchParams.get("ref") ?? "";
  const order = url.searchParams.get("order") ?? "";
  const amount = Number(url.searchParams.get("amount") ?? "0");
  const callback = url.searchParams.get("callback") ?? "/";
  const webhook = url.searchParams.get("webhook") ?? "";
  const secret = url.searchParams.get("secret") ?? "";
  const kd = (amount / 1000).toFixed(3);

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>Sandbox Payment · KNET</title>
<style>
  :root{--red:#7B1E28;--ink:#1A1614;--ivory:#FBFAF8;--border:#E7E1D8}
  *{box-sizing:border-box}
  body{margin:0;font-family:Inter,system-ui,sans-serif;background:var(--ivory);color:var(--ink);display:flex;min-height:100vh;align-items:center;justify-content:center;padding:24px}
  .card{width:100%;max-width:420px;border:1px solid var(--border);background:#fff;border-radius:4px;overflow:hidden}
  .head{background:var(--ink);color:#fff;padding:16px 20px;display:flex;justify-content:space-between;align-items:center}
  .head b{letter-spacing:.14em;text-transform:uppercase;font-size:12px}
  .badge{font-size:11px;opacity:.7}
  .body{padding:24px 20px}
  .row{display:flex;justify-content:space-between;font-size:14px;padding:8px 0;border-bottom:1px solid var(--border)}
  .row:last-child{border:0}
  .total{font-weight:600;font-size:18px}
  .btns{display:flex;flex-direction:column;gap:10px;margin-top:20px}
  button{padding:14px;border:0;border-radius:4px;font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:.14em;cursor:pointer}
  .pay{background:var(--red);color:#fff}
  .cancel{background:#fff;border:1px solid var(--border);color:var(--ink)}
  .note{margin-top:16px;font-size:11px;color:#857B70;text-align:center}
</style></head>
<body>
  <div class="card">
    <div class="head"><b>KNET · Sandbox</b><span class="badge">TEST MODE</span></div>
    <div class="body">
      <div class="row"><span>Merchant</span><span>${config.name.en}</span></div>
      <div class="row"><span>Order</span><span>${ref}</span></div>
      <div class="row total"><span>Amount</span><span>KD${kd}</span></div>
      <div class="btns">
        <button class="pay" id="pay">Approve payment</button>
        <button class="cancel" id="cancel">Decline</button>
      </div>
      <p class="note">Sandbox only — no real card is charged. This screen stands in for the KNET/MyFatoorah hosted page.</p>
    </div>
  </div>
<script>
  const order=${JSON.stringify(order)}, callback=${JSON.stringify(callback)}, webhook=${JSON.stringify(webhook)}, secret=${JSON.stringify(secret)};
  document.getElementById('pay').onclick=async()=>{
    try{ await fetch(webhook,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({orderId:order,secret,status:'paid'})}); }catch(e){}
    window.location.href=callback+'&result=success';
  };
  document.getElementById('cancel').onclick=()=>{ window.location.href=callback+'&result=cancel'; };
</script>
</body></html>`;

  return new Response(html, { headers: { "content-type": "text/html; charset=utf-8" } });
}
