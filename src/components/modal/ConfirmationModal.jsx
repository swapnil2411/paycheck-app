import React from 'react'

const ConfirmationModal = ({isOpen, message, onConfirm, onCancel, confirmTxt, cancelTxt}) => {
    if (!isOpen) return null;
  return (
    <div className='confimation_wrapper'>
        <div className='overlay'></div>
        <div className='confirmation_modal'>
            <h3 className='confirmation_title'>
                {message}
            </h3>
            <div className='confirmation_btn_grp'>
                <button className="btn filled_btn" onClick={onConfirm}>
                    {confirmTxt}
                </button>
                <button className="btn outline_btn" onClick={onCancel}>
                    {cancelTxt}
                </button>
            </div>
        </div>
    </div>
  )
}

export default ConfirmationModal