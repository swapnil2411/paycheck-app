// /// <reference lib="deno.ns" />
// import "@supabase/functions-js/edge-runtime.d.ts"
// import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
// import { PDFDocument, StandardFonts } from "https://esm.sh/pdf-lib"

// const corsHeaders = {
//   "Access-Control-Allow-Origin": "*",
//   "Access-Control-Allow-Headers":
//     "authorization, x-client-info, apikey, content-type",
// };

// Deno.serve(async (req) => {
//   // ✅ Handle CORS
//   if (req.method === "OPTIONS") {
//     return new Response("ok", { headers: corsHeaders });
//   }

//   try {
//     const { invoiceId } = await req.json();

//     if (!invoiceId) {
//       return new Response(
//         JSON.stringify({ error: "invoiceId is required" }),
//         { status: 400, headers: corsHeaders }
//       );
//     }

//     const supabase = createClient(
//       Deno.env.get("SUPABASE_URL")!,
//       Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
//     );

//     // ✅ Fetch invoice
//     const { data: invoice, error } = await supabase
//       .from("invoices")
//       .select(`*, clients(*), invoice_items(*)`)
//       .eq("id", invoiceId)
//       .single();

//     if (error || !invoice) {
//       return new Response(
//         JSON.stringify({ error: "Invoice not found" }),
//         { status: 404, headers: corsHeaders }
//       );
//     }

//    // ===== PDF SETUP =====
// const pdfDoc = await PDFDocument.create();

// const pageWidth = 600;
// const pageHeight = 800;
// const margin = 30;
// const contentWidth = pageWidth - margin * 2;

// const page = pdfDoc.addPage([pageWidth, pageHeight]);

// const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
// const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

// let y = 760;

// // ===== Invoice Number =====
// page.drawText(invoice.invoice_number || "Invoice", {
//   x: margin,
//   y,
//   size: 22,
//   font: boldFont,
// });

// y -= 40;

// // ===== Subject & Due Date =====
// page.drawText("Subject:", {
//   x: margin,
//   y,
//   size: 12,
//   font: boldFont,
// });

// page.drawText(invoice.subject || "-", {
//   x: margin,
//   y: y - 15,
//   size: 11,
//   font,
// });

// page.drawText("Due Date:", {
//   x: pageWidth - margin - 200,
//   y,
//   size: 12,
//   font: boldFont,
// });

// page.drawText(
//   invoice.due_date ? invoice.due_date : "-",
//   {
//     x: pageWidth - margin - 200,
//     y: y - 15,
//     size: 11,
//     font,
//   }
// );

// y -= 60;

// // ===== Billed To =====
// page.drawText("Billed To:", {
//   x: margin,
//   y,
//   size: 12,
//   font: boldFont,
// });

// page.drawText(invoice.clients?.company_name || "-", {
//   x: margin,
//   y: y - 15,
//   size: 11,
//   font,
// });

// y -= 50;

// // ===== Table Top Line =====
// page.drawLine({
//   start: { x: margin, y },
//   end: { x: pageWidth - margin, y },
//   thickness: 1,
// });

// y -= 20;

// // ===== Column Positions =====
// const colDesc = margin;
// const colQty = margin + contentWidth * 0.55;
// const colUnit = margin + contentWidth * 0.70;
// const colAmount = margin + contentWidth * 0.85;

// // ===== Table Header =====
// page.drawText("Description", { x: colDesc, y, size: 11, font: boldFont });
// page.drawText("Qty", { x: colQty, y, size: 11, font: boldFont });
// page.drawText("Unit", { x: colUnit, y, size: 11, font: boldFont });
// page.drawText("Amount", { x: colAmount, y, size: 11, font: boldFont });

// y -= 15;

// page.drawLine({
//   start: { x: margin, y },
//   end: { x: pageWidth - margin, y },
//   thickness: 0.5,
// });

// y -= 20;

// // ===== Items =====
// invoice.invoice_items.forEach((item: any) => {
//   const amount = Number(item.quantity) * Number(item.price);

//   page.drawText(item.description || "-", {
//     x: colDesc,
//     y,
//     size: 11,
//     font,
//   });

//   page.drawText(String(item.quantity), {
//     x: colQty,
//     y,
//     size: 11,
//     font,
//   });

//   page.drawText(String(item.price), {
//     x: colUnit,
//     y,
//     size: 11,
//     font,
//   });

//   page.drawText(String(amount), {
//     x: colAmount,
//     y,
//     size: 11,
//     font,
//   });

//   y -= 20;
// });

// // ===== Account Details (Left Bottom) =====
// let accountY = 190;

// page.drawText("Account Holder Name:", {
//   x: margin,
//   y: accountY,
//   size: 11,
//   font: boldFont,
// });
// page.drawText("Swapnil Darge", {
//   x: margin + 120,
//   y: accountY,
//   size: 11,
//   font,
// });

// accountY -= 18;

// page.drawText("Bank Name:", {
//   x: margin,
//   y: accountY,
//   size: 11,
//   font: boldFont,
// });
// page.drawText("HDFC Bank", {
//   x: margin + 120,
//   y: accountY,
//   size: 11,
//   font,
// });

// accountY -= 18;

// page.drawText("Account Number:", {
//   x: margin,
//   y: accountY,
//   size: 11,
//   font: boldFont,
// });
// page.drawText("458792136504", {
//   x: margin + 120,
//   y: accountY,
//   size: 11,
//   font,
// });

// accountY -= 18;

// page.drawText("IFSC Code:", {
//   x: margin,
//   y: accountY,
//   size: 11,
//   font: boldFont,
// });
// page.drawText("FNDMUS33", {
//   x: margin + 120,
//   y: accountY,
//   size: 11,
//   font,
// });

// accountY -= 18;

// page.drawText("Branch Address:", {
//   x: margin,
//   y: accountY,
//   size: 11,
//   font: boldFont,
// });
// page.drawText("123 Market Street, New York, NY 10001", {
//   x: margin + 120,
//   y: accountY,
//   size: 11,
//   font,
// });

// accountY -= 18;

// page.drawText("UPI ID:", {
//   x: margin,
//   y: accountY,
//   size: 11,
//   font: boldFont,
// });
// page.drawText("US64FNDM021000021458792136504", {
//   x: margin + 120,
//   y: accountY,
//   size: 11,
//   font,
// });

// // ===== Summary Section =====
// let summaryY = 210;

// // Top summary line
// page.drawLine({
//   start: { x: margin, y: summaryY },
//   end: { x: pageWidth - margin, y: summaryY },
//   thickness: 0.5,
// });

// summaryY -= 20;

// // Subtotal
// page.drawText("Subtotal:", {
//   x: colUnit,
//   y: summaryY,
//   size: 12,
//   font: boldFont,
// });

// page.drawText(`INR ${invoice.subtotal}`, {
//   x: colAmount,
//   y: summaryY,
//   size: 12,
//   font,
// });

// // Tax (only if applicable)
// if (invoice.tax_type !== "NONE" && Number(invoice.tax_percentage) > 0) {
//   summaryY -= 20;

//   page.drawText(
//     `${invoice.tax_type} (${invoice.tax_percentage}%)`,
//     {
//       x: colUnit,
//       y: summaryY,
//       size: 12,
//       font: boldFont,
//     }
//   );

//   page.drawText(`INR ${invoice.tax_amount}`, {
//     x: colAmount,
//     y: summaryY,
//     size: 12,
//     font,
//   });
// }

// summaryY -= 20;

// // Total
// page.drawText("Total:", {
//   x: colUnit,
//   y: summaryY,
//   size: 12,
//   font: boldFont,
// });

// page.drawText(`INR ${invoice.total_amount}`, {
//   x: colAmount,
//   y: summaryY,
//   size: 12,
//   font,
// });

//     // ================= SAVE PDF =================

//     const pdfBytes = await pdfDoc.save();
//     const fileName = `${invoiceId}.pdf`; // safer than invoice_number

//     await supabase.storage
//       .from("invoices")
//       .upload(fileName, pdfBytes, {
//         contentType: "application/pdf",
//         upsert: true,
//       });

//     const { data: publicUrl } = supabase.storage
//       .from("invoices")
//       .getPublicUrl(fileName);

//     await supabase
//       .from("invoices")
//       .update({ pdf_url: publicUrl.publicUrl })
//       .eq("id", invoiceId);

//     return new Response(
//       JSON.stringify({ pdf_url: publicUrl.publicUrl }),
//       {
//         headers: {
//           ...corsHeaders,
//           "Content-Type": "application/json",
//         },
//       }
//     );

//   } catch (err: any) {
//     return new Response(
//       JSON.stringify({ error: err.message }),
//       {
//         status: 500,
//         headers: corsHeaders,
//       }
//     );
//   }
// });



/// <reference lib="deno.ns" />
import "@supabase/functions-js/edge-runtime.d.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { PDFDocument, StandardFonts } from "https://esm.sh/pdf-lib"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ===== WRAP TEXT HELPER =====
// Helvetica at size 11: avg char ~6.2px, descCol ~300px => ~48 chars per line
function wrapText(text: string, maxCharsPerLine: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length > maxCharsPerLine && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

Deno.serve(async (req) => {
  // ✅ Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { invoiceId } = await req.json();

    if (!invoiceId) {
      return new Response(
        JSON.stringify({ error: "invoiceId is required" }),
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // ✅ Fetch invoice
    const { data: invoice, error } = await supabase
      .from("invoices")
      .select(`*, clients(*), invoice_items(*)`)
      .eq("id", invoiceId)
      .single();

    if (error || !invoice) {
      return new Response(
        JSON.stringify({ error: "Invoice not found" }),
        { status: 404, headers: corsHeaders }
      );
    }

   // ===== PDF SETUP =====
const pdfDoc = await PDFDocument.create();

const pageWidth = 600;
const pageHeight = 800;
const margin = 30;
const contentWidth = pageWidth - margin * 2;

const page = pdfDoc.addPage([pageWidth, pageHeight]);

const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

let y = 760;

// ===== Invoice Number =====
page.drawText(invoice.invoice_number || "Invoice", {
  x: margin,
  y,
  size: 22,
  font: boldFont,
});

y -= 40;

// ===== Subject & Due Date =====
page.drawText("Subject:", {
  x: margin,
  y,
  size: 12,
  font: boldFont,
});

page.drawText(invoice.subject || "-", {
  x: margin,
  y: y - 15,
  size: 11,
  font,
});

page.drawText("Due Date:", {
  x: pageWidth - margin - 200,
  y,
  size: 12,
  font: boldFont,
});

page.drawText(
  invoice.due_date ? invoice.due_date : "-",
  {
    x: pageWidth - margin - 200,
    y: y - 15,
    size: 11,
    font,
  }
);

y -= 60;

// ===== Billed To =====
page.drawText("Billed To:", {
  x: margin,
  y,
  size: 12,
  font: boldFont,
});

page.drawText(invoice.clients?.company_name || "-", {
  x: margin,
  y: y - 15,
  size: 11,
  font,
});

page.drawText(invoice.clients?.email || "-", {
  x: margin,
  y: y - 30,
  size: 11,
  font,
});

y -= 50;

// ===== Table Top Line =====
page.drawLine({
  start: { x: margin, y },
  end: { x: pageWidth - margin, y },
  thickness: 1,
});

y -= 20;

// ===== Column Positions =====
const colDesc = margin;
const colQty = margin + contentWidth * 0.55;
const colUnit = margin + contentWidth * 0.70;
const colAmount = margin + contentWidth * 0.85;

// ===== Table Header =====
page.drawText("Description", { x: colDesc, y, size: 11, font: boldFont });
page.drawText("Qty", { x: colQty, y, size: 11, font: boldFont });
page.drawText("Unit", { x: colUnit, y, size: 11, font: boldFont });
page.drawText("Amount", { x: colAmount, y, size: 11, font: boldFont });

y -= 15;

page.drawLine({
  start: { x: margin, y },
  end: { x: pageWidth - margin, y },
  thickness: 0.5,
});

y -= 20;

// ===== Items =====
// Description column width: colQty - colDesc - 10 ≈ 300px
// Helvetica size 11: avg char ~6.2px => 300/6.2 ≈ 48 chars per line
const MAX_CHARS_PER_LINE = 48;
const LINE_HEIGHT = 15;

invoice.invoice_items.forEach((item: any) => {
  const amount = Number(item.quantity) * Number(item.price);

  const descLines = wrapText(item.description || "-", MAX_CHARS_PER_LINE);
  const rowHeight = descLines.length * LINE_HEIGHT + 8;

  // Draw each wrapped description line
  descLines.forEach((line, i) => {
    page.drawText(line, {
      x: colDesc,
      y: y - i * LINE_HEIGHT,
      size: 11,
      font,
    });
  });

  // Qty, Unit, Amount — top-aligned, unchanged
  page.drawText(String(item.quantity), {
    x: colQty,
    y,
    size: 11,
    font,
  });

  page.drawText(String(item.price), {
    x: colUnit,
    y,
    size: 11,
    font,
  });

  page.drawText(String(amount), {
    x: colAmount,
    y,
    size: 11,
    font,
  });

  y -= rowHeight;
});

// ===== Account Details (Left Bottom) =====
let accountY = 190;

page.drawText("Account Holder Name:", {
  x: margin,
  y: accountY,
  size: 11,
  font: boldFont,
});
page.drawText("Swapnil Darge", {
  x: margin + 120,
  y: accountY,
  size: 11,
  font,
});

accountY -= 18;

page.drawText("Bank Name:", {
  x: margin,
  y: accountY,
  size: 11,
  font: boldFont,
});
page.drawText("HDFC Bank", {
  x: margin + 120,
  y: accountY,
  size: 11,
  font,
});

accountY -= 18;

page.drawText("Account Number:", {
  x: margin,
  y: accountY,
  size: 11,
  font: boldFont,
});
page.drawText("50100805489837", {
  x: margin + 120,
  y: accountY,
  size: 11,
  font,
});

accountY -= 18;

page.drawText("IFSC Code:", {
  x: margin,
  y: accountY,
  size: 11,
  font: boldFont,
});
page.drawText("HDFC0008177", {
  x: margin + 120,
  y: accountY,
  size: 11,
  font,
});

accountY -= 18;

page.drawText("Branch Address:", {
  x: margin,
  y: accountY,
  size: 11,
  font: boldFont,
});

// Wrap branch address text
const branchText = `HDFC bank, Unit no. 5, ATL corporate park Saki Vihar Road, Powai, Mumbai-400072`;
const branchLines = wrapText(branchText, MAX_CHARS_PER_LINE);

branchLines.forEach((line, i) => {
  page.drawText(line, {
    x: margin + 120,
    y: accountY - i * LINE_HEIGHT,
    size: 11,
    font,
  });
});

// Move accountY down by however many lines were drawn
accountY -= (branchLines.length - 1) * LINE_HEIGHT;

accountY -= 18;

page.drawText("UPI ID:", {
  x: margin,
  y: accountY,
  size: 11,
  font: boldFont,
});
page.drawText("swapnildarge65-1@okhdfcbank", {
  x: margin + 120,
  y: accountY,
  size: 11,
  font,
});

// ===== Summary Section =====
let summaryY = 210;

// Top summary line
page.drawLine({
  start: { x: margin, y: summaryY },
  end: { x: pageWidth - margin, y: summaryY },
  thickness: 0.5,
});

summaryY -= 20;

// Subtotal
page.drawText("Subtotal:", {
  x: colUnit,
  y: summaryY,
  size: 12,
  font: boldFont,
});

page.drawText(`INR ${invoice.subtotal}`, {
  x: colAmount,
  y: summaryY,
  size: 12,
  font,
});

// Tax (only if applicable)
if (invoice.tax_type !== "NONE" && Number(invoice.tax_percentage) > 0) {
  summaryY -= 20;

  page.drawText(
    `${invoice.tax_type} (${invoice.tax_percentage}%)`,
    {
      x: colUnit,
      y: summaryY,
      size: 12,
      font: boldFont,
    }
  );

  page.drawText(`INR ${invoice.tax_amount}`, {
    x: colAmount,
    y: summaryY,
    size: 12,
    font,
  });
}

summaryY -= 20;

// Total
page.drawText("Total:", {
  x: colUnit,
  y: summaryY,
  size: 12,
  font: boldFont,
});

page.drawText(`INR ${invoice.total_amount}`, {
  x: colAmount,
  y: summaryY,
  size: 12,
  font,
});

    // ================= SAVE PDF =================

    const pdfBytes = await pdfDoc.save();
    const fileName = `${invoiceId}.pdf`;

    await supabase.storage
      .from("invoices")
      .upload(fileName, pdfBytes, {
        contentType: "application/pdf",
        upsert: true,
      });

    const { data: publicUrl } = supabase.storage
      .from("invoices")
      .getPublicUrl(fileName);

    await supabase
      .from("invoices")
      .update({ pdf_url: publicUrl.publicUrl })
      .eq("id", invoiceId);

    return new Response(
      JSON.stringify({ pdf_url: publicUrl.publicUrl }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );

  } catch (err: any) {
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});