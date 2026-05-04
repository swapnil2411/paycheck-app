import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import SelectDropdown from "../../components/select";
import Plus from "../../icons/Plus";
import Edit from "../../icons/Edit";
import Close from "../../icons/Close";
import Back from "../../icons/Back";
import { useNavigate } from "react-router-dom";

const InvoiceForm = ({
  clients,
  client,
  setClient,
  subject,
  setSubject,
  invoiceDate,
  setInvoiceDate,
  dueDate,
  setDueDate,
  currency,
  setCurrency,
  items,
  setItems,
  isEdit,
  onCancel,
  onSubmit,
  taxType,
  setTaxType,
  taxOption,
  setTaxOption,
  status,
  setStatus,
}) => {
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
 

  // ===============================
  // Auto set status on create
  // ===============================
  useEffect(() => {
    if (!isEdit) {
      setStatus({ label: "Created", value: "Created" });
    }
  }, [isEdit]);

  

  // ===============================
  // Client Options
  // ===============================
  const clientOptions =
    clients?.map((c) => ({
      value: c.id,
      label: c.company_name,
      email: c.email,
    })) || [];

  // ===============================
  // Status Options
  // ===============================
  const statusOptions = [
  { label: "Created", value: "Created" },
  { label: "Sent", value: "Sent" },
  { label: "Pending", value: "Pending" },
  { label: "Paid", value: "Paid" },
  { label: "Overdue", value: "Overdue" },
];

  // ===============================
  // Validation
  // ===============================
  const validateForm = () => {
    const newErrors = {};

    if (!client) newErrors.client = "Client is required";
    if (!subject.trim()) newErrors.subject = "Subject is required";
    if (!invoiceDate) newErrors.invoiceDate = "Invoice date required";
    if (!dueDate) newErrors.dueDate = "Due date required";
    if (!status) newErrors.status = "Status required";

    if (!items.length) {
      newErrors.items = "At least one item required";
    } else {
      items.forEach((item, index) => {
        if (!item.description?.trim()) {
          newErrors[`desc_${index}`] = "Description required";
        }
        if (!item.quantity || item.quantity <= 0) {
          newErrors[`qty_${index}`] = "Qty must be > 0";
        }
        if (!item.price || item.price <= 0) {
          newErrors[`price_${index}`] = "Price must be > 0";
        }
      });
    }

    if (taxType !== "NONE" && !taxOption) {
      newErrors.taxOption = "Select tax type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitClick = () => {
    if (!validateForm()) return;
    onSubmit();
  };

  // ===============================
  // Item Handling
  // ===============================
  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index][field] =
      field === "description" ? value : value === "" ? "" : Number(value);
    setItems(updated);

     // ✅ REMOVE ERROR FOR THIS FIELD
  setErrors((prev) => {
    const newErrors = { ...prev };

    if (field === "description") delete newErrors[`desc_${index}`];
    if (field === "quantity") delete newErrors[`qty_${index}`];
    if (field === "price") delete newErrors[`price_${index}`];

    return newErrors;
  });
  };

  const addRow = () => {
    setItems([...items, { description: "", quantity: 1, price: 0 }]);
  };

  const removeRow = (index) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleBack = () => {
    navigate(-1)
  }

 useEffect(() => {
   console.log("Check invoice is in Edit mode: ", isEdit)
 }, [isEdit])
 
  

  return (
    <>
      <div className="form_wrapper invoice_form_wrapper">
      {/* ================= Basic Details ================= */}
      <div className="invoice_basic_details">
        <div className="form_element">
          <label>Client *</label>
          <SelectDropdown
            options={clientOptions}
            value={client}
            onChange={(value) => {
    setClient(value);

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.client;
      return newErrors;
    });
  }}
          />
          {errors.client && <p className="error_message">{errors.client}</p>}
        </div>

        <div className="form_element">
          <label>Subject *</label>
          <input value={subject} onChange={(e) => {
    setSubject(e.target.value);

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.subject;
      return newErrors;
    });
  }} />
          {errors.subject && <p className="error_message">{errors.subject}</p>}
        </div>

        <div className="form_date_container">
          <div className="form_element form_date_element">
            <label>
              Invoice Date <span className="asterick">*</span>
            </label>{" "}
            <DatePicker
              selected={invoiceDate}
              onChange={(date) => {
    setInvoiceDate(date);

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.invoiceDate;
      return newErrors;
    });
  }}
              showIcon
            />
            {errors.invoiceDate && (
              <p className="error_message">{errors.invoiceDate}</p>
            )}
          </div>
          <div className="form_element form_date_element">
            <label>
              Due Date <span className="asterick">*</span>
            </label>
            <DatePicker selected={dueDate} onChange={(date) => {
    setDueDate(date);

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors.dueDate;
      return newErrors;
    });
  }} showIcon />
            {errors.dueDate && (
              <p className="error_message">{errors.dueDate}</p>
            )}
          </div>
        </div>

        {/* ✅ NEW STATUS DROPDOWN */}
        <div className="form_element">
          <label>Status *</label>
          <SelectDropdown
            options={statusOptions}
            value={status}
            onChange={setStatus}
            isDisabled={!isEdit} // Only editable in edit mode
          />
          {errors.status && <p className="error_message">{errors.status}</p>}
        </div>
      </div>

      {/* ================= Items ================= */}
      <div className="items_list">
        <h3 className="products_heading">Products</h3>

        {items.map((item, index) => (
          <div key={index} className={`item-row ${items.length > 1 ? 'with_remove_btn' : ''}`}>
           <div className="form_element">
  <input
    placeholder="Description"
    value={item.description}
    onChange={(e) =>
      handleItemChange(index, "description", e.target.value)
    }
  />
  {errors[`desc_${index}`] && (
    <p className="error_message">
      {errors[`desc_${index}`]}
    </p>
  )}
</div>

<div className="form_element">
  <input
    type="number"
    min="1"
    placeholder="Qty"
    value={item.quantity}
    onChange={(e) =>
      handleItemChange(index, "quantity", e.target.value)
    }
  />
  {errors[`qty_${index}`] && (
    <p className="error_message">
      {errors[`qty_${index}`]}
    </p>
  )}
</div>

<div className="form_element">
  <input
    type="number"
    min="0"
    placeholder="Unit Price"
    value={item.price}
    onChange={(e) =>
      handleItemChange(index, "price", e.target.value)
    }
  />
  {errors[`price_${index}`] && (
    <p className="error_message">
      {errors[`price_${index}`]}
    </p>
  )}
</div>

<div className="form_element">
  <input
    type="number"
    value={
      Number(item.quantity || 0) *
      Number(item.price || 0)
    }
    disabled
  />
</div>


            {items.length > 1 && ( <button type="button" className="remove-btn" onClick={() => removeRow(index)} > ✕ </button> )}
          </div>
        ))}

        <button onClick={addRow} className="btn filled_btn">
          <Plus /> Add New Line
        </button>
      </div>

      <div className="tax_deduction_wrapper">
  <h3 className="heading">Tax Deduction / Collection</h3>

  <div className="radio-group">
    <label>
      <input
        type="radio"
        checked={taxType === "NONE"}
        onChange={() => {
          setTaxType("NONE");
          setTaxOption(null);
        }}
      />
      <span>None</span>
    </label>

    <label>
      <input
        type="radio"
        checked={taxType === "TDS"}
        onChange={() => {
          setTaxType("TDS");
          setTaxOption(null);
        }}
      />
      <span>TDS</span>
    </label>

    <label>
      <input
        type="radio"
        checked={taxType === "TCS"}
        onChange={() => {
          setTaxType("TCS");
          setTaxOption(null);
        }}
      />
      <span>TCS</span>
    </label>
  </div>
</div>

{/* ================= TDS Dropdown ================= */}
{taxType === "TDS" && (
  <div className="form_element tax_dropdown">
    <label>Select TDS Type <span className="asterick">*</span></label>
    <SelectDropdown
      value={taxOption}
      onChange={setTaxOption}
      options={[
        { label: "194C - 1% Individual/HUF", value: 1 },
        { label: "194C - 2% Company/Firm", value: 2 },
        { label: "194J - 10% Professional", value: 10 },
        { label: "194J - 2% Technical", value: 2 },
        { label: "194I - 10% Rent (Building)", value: 10 },
        { label: "194Q - 0.1% Purchase", value: 0.1 }
      ]}
    />
    {errors.taxOption && (
      <p className="error_message">{errors.taxOption}</p>
    )}
  </div>
)}

{/* ================= TCS Dropdown ================= */}
{taxType === "TCS" && (
  <div className="form_element tax_dropdown">
    <label>Select TCS Type <span className="asterick">*</span></label>
    <SelectDropdown
      value={taxOption}
      onChange={setTaxOption}
      options={[
        { label: "206C(1H) - 0.1% Sale of Goods", value: 0.1 },
        { label: "206C(1F) - 1% Motor Vehicle", value: 1 },
        { label: "206C(1) - 1% Scrap", value: 1 },
        { label: "206C(1G) - 5% Foreign Remittance", value: 5 }
      ]}
    />
    {errors.taxOption && (
      <p className="error_message">{errors.taxOption}</p>
    )}
  </div>
)}



      {/* ================= ACTION BUTTONS ================= */}
      <div className="invoice-form-actions">
        <button onClick={onCancel} className="btn outline_btn">
          <Close /> Cancel
        </button>

        <button onClick={handleSubmitClick} className="btn filled_btn">
          <Edit />
          {isEdit ? "Update Invoice" : "Create Invoice"}
        </button>

        <button className="btn outline_btn" onClick={handleBack}>
          <Back />
          Back
        </button>
      </div>
    </div>
    </>
    
  );
};

export default InvoiceForm;
