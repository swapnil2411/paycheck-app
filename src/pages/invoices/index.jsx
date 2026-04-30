// index.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import InvoiceForm from "./InvoiceForm";
import InvoicePreview from "./InvoicePreview";
import { supabaseClient } from "../../services/supabaseClient";
import { useAuth } from "../../context/authContext/AuthContext";
import ConfirmationModal from "../../components/modal/ConfirmationModal";
import { useLoader } from "../../context/loaderContext/LoaderContext";
import { useToast } from "../../context/toastContext/ToastContext";


const Invoice = () => {
const { id } = useParams();
const navigate = useNavigate();
const isEdit = !!id;

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [clients, setClients] = useState([]);
  const [client, setClient] = useState(null);
  const [subject, setSubject] = useState("");
  const [invoiceDate, setInvoiceDate] = useState();
  const [dueDate, setDueDate] = useState();
  const [currency, setCurrency] = useState({ label: "INR", value: "INR" });
  const [taxType, setTaxType] = useState("NONE"); // NONE | TDS | TCS
const [taxOption, setTaxOption] = useState(null);

const { loading, startLoader, stopLoader } = useLoader();
const {showToast} = useToast();

  const { user } = useAuth();

  const [items, setItems] = useState([
    { description: "", quantity: 1, price: 0, tax: 0 }
  ]);

  const [subtotal, setSubtotal] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState({ label: "Created", value: "Created" });
   
    const [modalOpen, setIsModalOpen] = useState(false);
    const [modalMessage, setModalMessage] = useState("");
    const [confirmAction, setConfirmAction] = useState(null);

  const handleCancel = () => {
  setClient(null);
  setSubject("");
  setInvoiceDate();
  setDueDate();
  setItems([{ description: "", quantity: 1, price: 0 }]);
  setTaxType("NONE");
  setTaxOption(null);
  setStatus({ label: "Created", value: "Created" });
};

const toLocalDateString = (date) => {
  if (!date) return undefined;
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const handleSaveInvoice = async () => {
  try {

    if (isEdit) {
      setModalMessage("Do you want to update this invoice?");
      setConfirmAction(() => updateInvoice); // store function
      setIsModalOpen(true);
      return;
    }

    startLoader();

    // 1. Create Invoice
const { data: invoice, error } = await supabaseClient
  .from("invoices")
  .insert({
    user_id: user.id,
    client_id: client.value,
    subject,
    invoice_date: toLocalDateString(invoiceDate),
due_date: toLocalDateString(dueDate),
    subtotal,
    tax_type: taxType,
    tax_percentage: taxOption?.value || 0,
    tax_amount: taxAmount,
    total_amount: total,
    currency: currency.value,
    status: status.value
  })
  .select()
  .single();

if (error) {
  console.error("❌ Invoice insert error:", error);
  return;
}

console.log("✅ Invoice created:", invoice);

    // 2. Insert Items
console.log("Items before insert:", items);

const { error: itemsError } = await supabaseClient
  .from("invoice_items")
  .insert(
    items.map(item => ({
      invoice_id: invoice.id,
      description: item.description,
      quantity: item.quantity,
      price: item.price
    }))
  );

if (itemsError) {
  console.error("❌ Items insert error:", itemsError);
  return;
}

console.log("✅ Items inserted successfully");

    // 🔥 Generate PDF
await supabaseClient.functions.invoke("generate-invoice-pdf", {
  body: { invoiceId: invoice.id }
});

    setInvoiceNumber(invoice.invoice_number);

    showToast("Invoice Created Successfully ✅"); // ✅ success

    navigate("/invoices");

  } catch (err) {
    console.error(err);
    showToast("Error saving invoice", "error"); // ✅ error
  }finally {
    stopLoader(); // ✅ always stops
  }
};

const updateInvoice = async () => {
  try {
    startLoader();
    // 🔹 1. Update invoice
    const { error: invoiceError } = await supabaseClient
      .from("invoices")
      .update({
        client_id: client.value,
        subject,
        invoice_date: toLocalDateString(invoiceDate),
        due_date: toLocalDateString(dueDate),
        subtotal,
        tax_type: taxType,
        tax_percentage: taxOption?.value || 0,
        tax_amount: taxAmount,
        total_amount: total,
        currency: currency.value,
        status: status.value,
      })
      .eq("id", id);

    if (invoiceError) throw invoiceError;

    // 🔹 2. Delete old items
    const { error: deleteError } = await supabaseClient
      .from("invoice_items")
      .delete()
      .eq("invoice_id", id);

    if (deleteError) throw deleteError;

    // 🔹 3. Insert new items
    const { error: insertError } = await supabaseClient
      .from("invoice_items")
      .insert(
        items.map((item) => ({
          invoice_id: id,
          description: item.description,
          quantity: item.quantity,
          price: item.price,
        }))
      );

    if (insertError) throw insertError;

    // 🔹 4. Regenerate PDF
    await supabaseClient.functions.invoke("generate-invoice-pdf", {
      body: { invoiceId: id },
    });

    showToast("Invoice Updated Successfully ✅"); // ✅ success
    setIsModalOpen(false);
    navigate("/invoices");
  } catch (err) {
    console.error("Update failed:", err);
    showToast("Failed to update invoice", "error"); // ✅ error
  }finally {
    stopLoader();
  }
};


const handleConfirm = async () => {
  if (!confirmAction) return;

  try {
    await confirmAction(); // 🔥 this runs updateInvoice
  } catch (err) {
    console.error("Confirm action failed:", err);
    alert("Something went wrong");
  }
};

// const handleConfirm = async () => {
//   if (actionType === "Delete") {
//     if (!selectedInvoiceId) return;

//     try {
//       // 🔥 1. DELETE invoice items first
//       const { data: deletedItems, error: itemsError } = await supabaseClient
//         .from("invoice_items")
//         .delete()
//         .eq("invoice_id", selectedInvoiceId)
//         .select(); // 👈 helps debug

//       console.log("Deleted Items:", deletedItems);
//       console.log("Items Delete Error:", itemsError);

//       if (itemsError) {
//         alert("Failed to delete invoice items");
//         return;
//       }

//       // 🔥 2. SOFT DELETE invoice
//       const { error: invoiceError } = await supabaseClient
//         .from("invoices")
//         .update({
//           is_deleted: true,
//           deleted_at: new Date().toISOString(),
//         })
//         .eq("id", selectedInvoiceId)
//   .select(); // 👈 REQUIRED

//   console.log("Delete response:", data);
// console.log("Delete error:", error);

//       if (error || !data || data.length === 0) {
//   alert("Delete failed - not allowed or record not found");
//   return;
// }

//       // ✅ Only now update UI
// setInvoices((prev) =>
//   prev.filter((inv) => inv.id !== selectedInvoiceId)
// );

//       setSelectedInvoiceId(null);
//       setIsModalOpen(false);

//     } catch (err) {
//       console.error("Delete failed:", err);
//       alert("Something went wrong while deleting");
//     }
//   }

//   // ===== EMAIL PART (keep as it is) =====
//   if (actionType === "Email") {
//     if (!selectedInvoice) return;

//     const { data, error } = await supabaseClient.functions.invoke(
//       "send-invoice-email",
//       {
//         body: {
//           email: selectedInvoice.clients?.email,
//           invoiceNumber: selectedInvoice.invoice_number,
//           pdfUrl: selectedInvoice.pdf_url,
//           totalAmount: selectedInvoice.total_amount,
//           status: selectedInvoice.status,
//         },
//       },
//     );

//     if (error) {
//       alert("Error sending email");
//       return;
//     }

//     if (selectedInvoice.status === "Created") {
//       await supabaseClient
//         .from("invoices")
//         .update({
//           status: "Sent",
//           sent_at: new Date().toISOString(),
//         })
//         .eq("id", selectedInvoice.id);
//     }

//     setSelectedInvoice(null);
//     fetchInvoices();
//     setIsModalOpen(false);
//   }
// };

const handleCancelModal = () => {
  setIsModalOpen(false);
};



  // 🔥 Auto Invoice Number
//   useEffect(() => {
//   const year = new Date().getFullYear();
//   const timestamp = Date.now().toString().slice(-6);
//   setInvoiceNumber(`INV-${year}-${timestamp}`);
// }, []);

  // 🔥 Auto Calculations
  useEffect(() => {
  let sub = 0;

  items.forEach(item => {
    const line = Number(item.quantity) * Number(item.price);
    sub += line;
  });

  let finalTotal = sub;
  let adjustment = 0;

  if (taxType !== "NONE" && taxOption) {
    adjustment = (sub * taxOption.value) / 100;

    if (taxType === "TDS") {
      finalTotal = sub - adjustment;
    }

    if (taxType === "TCS") {
      finalTotal = sub + adjustment;
    }
  }

  setSubtotal(sub);
  setTaxAmount(adjustment);
  setTotal(finalTotal);

}, [items, taxType, taxOption]);



  useEffect(() => {
  const fetchClients = async () => {
    const { data, error } = await supabaseClient
      .from("clients")
      .select("*")
      .eq("user_id", user.id);

    if (error) {
      console.error(error);
    } else {
      setClients(data);
    }
  };

  if (user) fetchClients();
}, [user]);

useEffect(() => {
  if (!isEdit || !user) return;

  const fetchInvoice = async () => {
    const { data, error } = await supabaseClient
      .from("invoices")
      .select(`
        *,
        clients(*),
        invoice_items(*)
      `)
      .eq("id", id)
      .single();

    if (error) {
      console.error(error);
      return;
    }

    setInvoiceNumber(data.invoice_number);

    setClient({
      value: data.client_id,
      label: data.clients?.company_name,
      email: data.clients?.email
    });

    setSubject(data.subject);
    setInvoiceDate(new Date(data.invoice_date));
    setDueDate(new Date(data.due_date));

    setTaxType(data.tax_type);
    setTaxOption(
      data.tax_percentage
        ? { label: `${data.tax_percentage}%`, value: data.tax_percentage }
        : null
    );

    setStatus({ label: data.status, value: data.status });

    setItems(
      data.invoice_items.map(item => ({
        description: item.description,
        quantity: item.quantity,
        price: item.price
      }))
    );
  };

  fetchInvoice();
}, [id, isEdit, user]);




  return (
    <>
      <div className="invoice-container">

      <InvoiceForm
  clients={clients}
  client={client}
  setClient={setClient}
  subject={subject}
  setSubject={setSubject}
  invoiceDate={invoiceDate}
  setInvoiceDate={setInvoiceDate}
  dueDate={dueDate}
  setDueDate={setDueDate}
  currency={currency}
  setCurrency={setCurrency}
  items={items}
  setItems={setItems}
  isEdit={isEdit}
  onCancel={handleCancel}
  onSubmit={handleSaveInvoice}
  taxType={taxType}
  setTaxType={setTaxType}
  taxOption={taxOption}
  setTaxOption={setTaxOption}
  status={status}
  setStatus={setStatus}
  modalOpen={modalOpen}
  handleCancelModal={handleCancelModal}
  handleConfirm={handleConfirm}
/>


      <InvoicePreview
        invoiceNumber={invoiceNumber}
        client={client}
        subject={subject}
        invoiceDate={invoiceDate}
        dueDate={dueDate}
        currency={currency}
        items={items}
        subtotal={subtotal}
        taxAmount={taxAmount}
        total={total}
        taxType={taxType}
  setTaxType={setTaxType}
  taxOption={taxOption}
  setTaxOption={setTaxOption}
      />

    </div>
    {/* ✅ Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        message={modalMessage}
        onConfirm={handleConfirm}
        onCancel={handleCancelModal}
        confirmTxt="Confirm"
        cancelTxt="Cancel"
      />
    </>
  );
};

export default Invoice;
