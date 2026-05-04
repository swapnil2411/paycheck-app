import React, {useState, useEffect} from 'react'
import Minus from '../../icons/Minus';
import Plus from '../../icons/Plus';
import Edit from '../../icons/Edit';
import Delete from '../../icons/Delete';

const ClientList = ({clients, onEdit, setIsModalOpen, totalCount, onDelete, limit, page, setPage, loading}) => {
   const totalPages = Math.ceil(totalCount / limit); 
    console.log("### ClientList from parent", clients);
    const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (id) => {
    setExpandedRow(prev => (prev === id ? null : id));
  };

  const ExpandedClientDetails = ({ client }) => {
    return (
      <div className="expanded_details">
        <p><span className='expand_title'>Address:</span><span>{client.address_line_1}, {client.address_line_2}, {client.city}, {client.state} - {client.pincode}, {client.country}</span></p>
        {/* <p><span className='expand_title'>City:</span><span>{client.city}</span></p>
        <p><span className='expand_title'>State:</span> <span>{client.state}</span></p>
        <p><span className='expand_title'>Zip Code:</span><span>{client.pincode}</span></p>
        <p><span className='expand_title'>Country:</span><span>{client.country}</span></p> */}
        {/* <p><span className='expand_title'>GST Treatment:</span><span>{client.gst_treatment}</span></p>
        <p><span className='expand_title'>GSTIN:</span><span>{client.gstin}</span></p> */}
        <p><span className='expand_title'>PAN:</span><span>{client.pan}</span></p>
      </div>
    );
  };

  const handleEdit = (client) => {
    onEdit(client);
    setIsModalOpen(true);
  }

  return (
    <>
      <div className='table_data_container'>
        <table className='client_table'>
            <thead>
                <tr>
                    <th>Sr.No</th>
                <th>Name</th>
                <th>Company</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Customer Type</th>
                <th className='table_header_action'>Action</th>
                </tr>
            </thead>
            <tbody>
              {
                loading ? (
                  <tr>
                    <td colSpan="7" className='loading_cell'>Loading...</td>
                  </tr>
                ) : clients.length === 0 ? (
                  <tr>
                    <td colSpan="7" className='no_record_found'>No data found</td>
                  </tr>
                ) :  (clients.map((client, index) => (
                    <>
                        <tr key={index}>
                        <td>
                            <span className='table_row_no'>
                                <button onClick={() => toggleRow(client.id)} className='table_toggle'>{expandedRow === client.id ? <Minus /> : <Plus />}</button>
                                {(page - 1) * limit + index + 1}
                            </span>
                        </td>
                        <td>{client.first_name} {client.last_name}</td>
                        <td>{client.company_name}</td>
                        <td>{client.email}</td>
                        <td>{client.phone}</td>
                        <td>{client.customer_type}</td>
                        <td>
                            <div className='action_table_cell'>
                                <button className='action_btn edit_btn' onClick={() => handleEdit(client)}>
                                <Edit/>
                            </button>
                            <button className='action_btn delete_btn' onClick={() => onDelete(client)}>
                                <Delete />
                            </button>
                            </div>
                        </td>
                    </tr>
{/* Expanded Row */}
            {expandedRow === client.id && (
              <tr className="expanded_row">
                <td colSpan="7">
                  <ExpandedClientDetails client={client} />
                </td>
              </tr>
            )}
                    </>
                    
                )))
              }
               
            </tbody>
        </table>
      </div>
      <div className="pagination">
                <button
                    disabled={page === 1}
                    className='pagination_btn'
                    onClick={() => setPage(prev => prev - 1)}
                >
                    Prev
                </button>

                <span className='pagination_txt'>Page {page} of {totalPages}</span>

                <button
                className='pagination_btn'
                    disabled={page === totalPages}
                    onClick={() => setPage(prev => prev + 1)}
                >
                    Next
                </button>
            </div>
    </>
  )
}

export default ClientList