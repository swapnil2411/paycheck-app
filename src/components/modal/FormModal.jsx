import React from 'react';

const FormModal = ({
  isOpen,
  onClose,
  title,
  children,
  width = '600px'
}) => {
  if (!isOpen) return null;

  return (
    <div className="modal_overlay" onClick={onClose}>
      <div
        className="modal_container"
        style={{ width }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal_header">
          <h3 className='p-0 section_title'>{title}</h3>
          <button className="close_btn" onClick={onClose}>×</button>
        </div>

        <div className="modal_body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default FormModal;
