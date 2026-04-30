import React, {useState, useEffect, use} from 'react'
import ClientForm from './ClientForm'
import ClientList from './ClientList'
import { supabaseClient } from '../../services/supabaseClient'
import FormModal from '../../components/modal/FormModal'
import { useLoader } from '../../context/loaderContext/LoaderContext'

const Clients = () => {

  const [clients, setClients] = useState([])
  const { startLoader, stopLoader, loading } = useLoader();
  const [page, setPage] = useState(1);
      const [limit] = useState(10); // rows per page
      const [totalCount, setTotalCount] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(null);
    const fetchClients = async (currentPage = 1) => {
      startLoader();
        const from = (currentPage - 1) * limit;
  const to = from + limit - 1;
        try {
            const { data, error, count } = await supabaseClient.from('clients').select('*', { count: 'exact' }).range(from, to);
            if (error) {
                throw error
            }
            setClients(data)
            setTotalCount(count)
            stopLoader();
        } catch (error) {
            console.error("Error fetching clients:", error)
            stopLoader();
        }
    }

    useEffect(() => {
        fetchClients(page);
    }, [page])

    const handleAddClient = () => {
        setSelectedClient(null);
        setIsModalOpen(true);
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedClient(null);
    }
  

    
  return (
    <>
    <div className="page_header">
        <h2 className='section_title'>Client List</h2>
        <button onClick={handleAddClient} className='btn filled_btn'> 
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="" d="M12.75 7a.75.75 0 0 0-1.5 0v4.25H7a.75.75 0 0 0 0 1.5h4.25V17a.75.75 0 0 0 1.5 0v-4.25H17a.75.75 0 0 0 0-1.5h-4.25z"/></svg>
          <span>Add Client</span>
        </button>
      </div>
      
      <ClientList clients={clients} onEdit={setSelectedClient} setIsModalOpen={setIsModalOpen} totalCount={totalCount} limit={limit} page={page} setPage={setPage} loading={loading} />
      <FormModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="Add Client"
        width="80%"
      >
        <ClientForm
          onSuccess={() => {
            setIsModalOpen(false);
          }}
          fetchClients={fetchClients}
          selectedClient={selectedClient}
        />
      </FormModal>
    </>
  )
}

export default Clients