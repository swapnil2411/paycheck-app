/// <reference lib="deno.ns" />
import "@supabase/functions-js/edge-runtime.d.ts"
import { Resend } from "https://esm.sh/resend@2.0.0"

const resend = new Resend(Deno.env.get("RESEND_API_KEY")!)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

Deno.serve(async (req) => {

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { email, invoiceNumber, pdfUrl, totalAmount, status } = await req.json()

    if (!email || !pdfUrl) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: corsHeaders }
      )
    }

    // 🔥 Fetch PDF from Supabase storage
    const pdfResponse = await fetch(pdfUrl)
    const pdfArrayBuffer = await pdfResponse.arrayBuffer()

    // Convert to Base64
    const base64Pdf = btoa(
      String.fromCharCode(...new Uint8Array(pdfArrayBuffer))
    )

    // 🔥 Send email with attachment
    const { data, error } = await resend.emails.send({
      from: "PAYCHECK <noreply@swapnildarge.in>",
      to: email,
      subject: `Invoice ${invoiceNumber}`,
      html: `
<div style="background:#f4f6f8;padding:40px 0;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;background:#ffffff;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
    
    <!-- Header -->
    <div style="background:#4449F2;padding:16px 24px;font-size:16px;font-weight:600;color:#fff;">
      Invoice Generated - ${invoiceNumber}
    </div>

    <!-- Logo -->
    <div style="padding:24px 24px 15px;">
      <img src="https://jymyhbaykzvrvekhxbud.supabase.co/storage/v1/object/public/assets/logo-invoice.png" style="max-width: 150px" />
    </div>

    <!-- Body -->
    <div style="padding:0 24px 24px 24px;color:#374151;font-size:14px;">
      
      <p style="font-size:16px;margin-bottom:8px;">
        Dear Customer,
      </p>

      <p style="margin-top:0;">
        Your invoice <strong>${invoiceNumber}</strong> has been generated successfully.
        Please find the invoice attached with this email.
      </p>

      <p>Here’s an overview for your reference:</p>

      <!-- Invoice Summary Card -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-top:16px;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;">
  
  <tr style="background:#f9fafb;">
    <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#374151;">
      Invoice Number
    </td>
    <td align="right" style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">
      <strong>${invoiceNumber}</strong>
    </td>
  </tr>

  <tr>
    <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#374151;">
      Issue Date
    </td>
    <td align="right" style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">
      ${new Date().toLocaleDateString()}
    </td>
  </tr>

  <tr style="background:#f9fafb;">
    <td style="padding:12px 16px;border-bottom:1px solid #e5e7eb;color:#374151;">
      Status
    </td>
    <td align="right" style="padding:12px 16px;border-bottom:1px solid #e5e7eb;">
      <strong style="color:#4449F2;">${status}</strong>
    </td>
  </tr>

  <tr style="background:#f3f4f6;">
    <td style="padding:14px 16px;font-size:16px;">
      <strong>Total Amount</strong>
    </td>
    <td align="right" style="padding:14px 16px;font-size:16px;">
      <strong>₹${Number(totalAmount).toFixed(2)}</strong>
    </td>
  </tr>

</table>

      <!-- CTA Button -->
      <div style="margin-top:24px;text-align:center;">
        <a href="${pdfUrl}" 
           style="display:inline-block;background:#4449F2;color:#ffffff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">
          Download Invoice
        </a>
      </div>

      <!-- Footer -->
      <div style="margin-top:32px;font-size:13px;color:#6b7280;">
        <p style="margin-bottom:6px;">Best Regards,</p>
        <strong>PAYCHECK by Next Layer Systems</strong>
        <p style="margin:0;"><a href="https://nextlayersystems.in/" style="color:#4449F2;text-decoration:none;">
          nextlayersystems.in
        </a></p>
        <p style="margin-top:4px;">
          For any queries, contact us at 
          <a href="mailto:nextlayersystems97@gmail.com" style="color:#4449F2;text-decoration:none;">
            nextlayersystems97@gmail.com
          </a>
        </p>
      </div>

    </div>
  </div>
</div>
`,
      attachments: [
        {
          filename: `${invoiceNumber}.pdf`,
          content: base64Pdf,
        },
      ],
    })

    if (error) {
      return new Response(
        JSON.stringify({ error }),
        { status: 500, headers: corsHeaders }
      )
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )

  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    )
  }
})