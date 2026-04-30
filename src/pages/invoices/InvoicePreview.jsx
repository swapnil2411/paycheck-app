// InvoicePreview.jsx
import React, {useEffect} from "react";

const InvoicePreview = ({
  invoiceNumber,
  client,
  subject,
  invoiceDate,
  dueDate,
  currency,
  items,
  subtotal,
  taxAmount,
  total,
  taxType,
setTaxType,
taxOption,
setTaxOption,
}) => {

   

  return (
    <div className="invoice-preview">

      {/* <div className="preview-header">
        <h3>Preview</h3>
        <div className="preview-actions">
          <button>PDF</button>
          <button>Email</button>
          <button>Payment Page</button>
        </div>
      </div> */}

      <div className="preview-card">

        <h2 className="invoice_number">
  {invoiceNumber || "Draft Invoice"}
</h2>

        <div className="preview_meta">
        <div className="meta_info_block">
            <strong>Subject:</strong>
            <p>{subject}</p>
          </div>
          <div className="meta_info_block">
            <strong>Due Date:</strong>
            <p>{dueDate?.toDateString()}</p>
          </div>
          
        </div>

        <div className="preview_client">
          <strong>Billed To:</strong>
          <p>{client?.label} <br />{client?.email && client.email}</p>

        </div>

       <div className="preview_table_container">
         <table className="preview-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td>{item.description}</td>
                <td>{item.quantity}</td>
                <td>{item.price}</td>
                <td>{item.quantity * item.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
       </div>

        <div className="preview-summary">
          <div className="account_info">
            <p><strong>Account Holder Name: </strong><span>Swapnil Darge</span></p>

            <p><strong>Bank Name: </strong><span>HDFC Bank</span></p>

            <p><strong>Account Number: </strong><span>50100805489837</span></p>

            {/* <p><strong>Routing Number: </strong><span>021000021</span></p>

            <p><strong>Account Type: </strong><span>Checking</span></p> */}

            <p><strong>IFSC Code: </strong><span>HDFC0008177</span></p>

            <p><strong>Branch Address: </strong><span>HDFC bank, Unit no. 5, ATL coroprate park <br /> Saki Vihar Road, Powai, Mumbai-400072</span></p>

            <p><strong>UPI ID: </strong><span>swapnildarge65-1@okhdfcbank</span></p>
          </div>
          <div className="amount_preview">
            <p><strong>Subtotal: </strong><span>{Number(subtotal).toFixed(2)} {currency.value}</span></p>
            {taxType === "TDS" && taxOption && (
  <p><strong>TDS ({taxOption.value}%): </strong><span>{(subtotal * taxOption.value / 100).toFixed(2)} {currency.value}</span></p>
)}
{taxType === "TCS" && taxOption && (
  <p><strong>TCS ({taxOption.value}%): </strong><span>{(subtotal * taxOption.value / 100).toFixed(2)} {currency.value}</span></p>
)}
<p><strong>Total: </strong><span>{total} {currency.value}</span></p>
            
          </div>
          {/* <p>Subtotal: {currency.value} {subtotal}</p>
          {taxType === "TDS" && taxOption && (
  <p>TDS ({taxOption.value}%): -{currency.value} {(subtotal * taxOption.value / 100).toFixed(2)}</p>
)}

{taxType === "TCS" && taxOption && (
  <p>TCS ({taxOption.value}%): +{currency.value} {(subtotal * taxOption.value / 100).toFixed(2)}</p>
)}
          <h3>Total: {currency.value} {total}</h3> */}
        </div>

      </div>
    </div>

    
  );
};

export default InvoicePreview;
