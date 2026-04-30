import React, { useEffect, useState } from "react";
import { supabaseClient } from "../../services/supabaseClient";
import { useAuth } from "../../context/authContext/AuthContext";
import { useNavigate } from "react-router-dom";
import { useLoader } from "../../context/loaderContext/LoaderContext";
import Edit from "../../icons/Edit";
import Delete from "../../icons/Delete";
import Pdf from "../../icons/Pdf";
import Download from "../../icons/Download";
import Email from "../../icons/Email";
import ConfirmationModal from "../../components/modal/ConfirmationModal";
import { useToast } from "../../context/toastContext/ToastContext";

const InvoiceList = () => {
  const { user } = useAuth();
  const { startLoader, stopLoader, loading } = useLoader();
  const navigate = useNavigate();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [actionType, setActionType] = useState(null);
  const [modalOpen, setIsModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [invoices, setInvoices] = useState([]);
  const {showToast} = useToast();

  const fetchInvoices = async () => {
  startLoader();

  try {
    // 1️⃣ Auto mark overdue
    await supabaseClient
      .from("invoices")
      .update({ status: "Overdue" })
      .lt("due_date", new Date().toISOString())
      .neq("status", "Paid")
      .neq("status", "Overdue")
      .eq("user_id", user.id);

    // 2️⃣ Fetch invoices
    const { data, error } = await supabaseClient
      .from("invoices")
      .select(`
        id,
        invoice_number,
        invoice_date,
        due_date,
        total_amount,
        status,
        pdf_url,
        clients ( company_name, email )
      `)
      .eq("user_id", user.id)
      .eq("is_deleted", false)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setInvoices(data);
    }
  } catch (error) {
    console.log("Error fetching invoices:", error);
  }

  stopLoader();
};

  useEffect(() => {
    if (user) fetchInvoices();
  }, [user]);

  // 🔥 DELETE FUNCTION
  const handleDelete = (id) => {
    setSelectedInvoiceId(id);
    setIsModalOpen(true);
    setModalMessage("Do you want to delete invoice?");
    setActionType("Delete");
  };

  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const handleDownload = async (url, invoiceNumber) => {
    const response = await fetch(url);
    const blob = await response.blob();
    const downloadUrl = window.URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${invoiceNumber}.pdf`;
    document.body.appendChild(link);
    link.click();

    link.remove();
    window.URL.revokeObjectURL(downloadUrl);
  };

  const handleSendEmail = async (invoice) => {
    if (!invoice.pdf_url) {
      alert("Generate PDF first");
      return;
    }

    setSelectedInvoice(invoice);
    setIsModalOpen(true);
    setModalMessage("Do you want to send invoice?");
    setActionType("Email");
  };

  const handleConfirm = async () => {
  try {
    startLoader(); // ✅

    if (actionType === "Delete") {
      if (!selectedInvoiceId) return;

      const { error } = await supabaseClient
        .from("invoices")
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
        })
        .eq("id", selectedInvoiceId);

      if (error) {
        showToast("Error deleting invoice", "error"); // ✅
        return;
      }

      setInvoices((prev) => prev.filter((inv) => inv.id !== selectedInvoiceId));
      setSelectedInvoiceId(null);
      showToast("Invoice deleted successfully ✅"); // ✅
    }

    if (actionType === "Email") {
      if (!selectedInvoice) return;

      const { error } = await supabaseClient.functions.invoke(
        "send-invoice-email",
        {
          body: {
            email: selectedInvoice.clients?.email,
            invoiceNumber: selectedInvoice.invoice_number,
            pdfUrl: selectedInvoice.pdf_url,
            totalAmount: selectedInvoice.total_amount,
            status: selectedInvoice.status,
          },
        }
      );

      if (error) {
        showToast("Error sending email", "error"); // ✅
        return;
      }

      if (selectedInvoice.status === "Created") {
        await supabaseClient
          .from("invoices")
          .update({
            status: "Sent",
            sent_at: new Date().toISOString(),
          })
          .eq("id", selectedInvoice.id);
      }

      setSelectedInvoice(null);
      fetchInvoices();
      showToast("Email sent successfully ✅"); // ✅
    }

    setIsModalOpen(false);

  } catch (err) {
    console.error("Confirm action failed:", err);
    showToast("Something went wrong", "error"); // ✅
  } finally {
    stopLoader(); // ✅ always runs
  }
};

  const getStatusColor = (status) => {
    switch (status) {
      case "Created":
        return "#4449F2";
      case "Sent":
        return "#2563eb";
      case "Pending":
        return "#f59e0b";
      case "Paid":
        return "green";
      case "Overdue":
        return "red";
      default:
        return "#4449F2";
    }
  };

  return (
    <>
      <div className="invoice-list-page">
        <div className="page_header">
          <h2 className="section_title">Invoices</h2>
          <button
            onClick={() => navigate("/invoices/create")}
            className="btn filled_btn"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill=""
                d="M12.75 7a.75.75 0 0 0-1.5 0v4.25H7a.75.75 0 0 0 0 1.5h4.25V17a.75.75 0 0 0 1.5 0v-4.25H17a.75.75 0 0 0 0-1.5h-4.25z"
              />
            </svg>
            <span>Create Invoice</span>
          </button>
        </div>

        <div className="invoice-table-wrapper">
          <table className="invoice-table">
            <thead>
              <tr>
                <th>Invoice #</th>
                <th>Client</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                {/* <th className="table_header_action">PDF</th> */}
                <th className="table_header_action">Actions</th>
              </tr>
            </thead>

            <tbody>
              {invoices.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no_record_found">
                    No invoices found
                  </td>
                </tr>
              ) : (
                invoices.map((inv) => (
                  <tr key={inv.id}>
                    <td>{inv.invoice_number}</td>
                    <td>{inv.clients?.company_name}</td>
                    <td>{new Date(inv.invoice_date).toLocaleDateString()}</td>
                    <td>INR {Number(inv.total_amount).toFixed(2)}</td>
                    <td
                      style={{
                        color: getStatusColor(inv.status),
                        fontWeight: "500",
                      }}
                    >
                      {inv.status}
                    </td>

                    {/* 🔥 ACTION BUTTONS */}
                    <td>
                      <div className="action_table_cell">
                        {inv.pdf_url ? (
                          <div className="action_table_cell">
                            <button
                              className="action_btn edit_btn"
                              onClick={() =>
                                handleDownload(inv.pdf_url, inv.invoice_number)
                              }
                              title="Download Invoice"
                            >
                              <Download />
                            </button>
                            <button
                              className="action_btn edit_btn"
                              onClick={() => handleSendEmail(inv)}
                              title="Send Invoice"
                            >
                              <Email />
                            </button>
                          </div>
                        ) : (
                          "-"
                        )}
                        <button
                          className="action_btn edit_btn"
                          onClick={() => navigate(`/invoices/${inv.id}`)}
                          title="Edit Invoice"
                        >
                          <Edit />
                        </button>
                        <button
                          className="action_btn delete_btn"
                          onClick={() => handleDelete(inv.id)}
                          title="Delete Invoice"
                        >
                          <Delete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ConfirmationModal
        isOpen={modalOpen}
        message={modalMessage}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        confirmTxt="Confirm"
        cancelTxt="Cancel"
      />
    </>
  );
};

export default InvoiceList;
