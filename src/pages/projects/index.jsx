import React, { useState, useEffect } from 'react'
import ProjectForm from './ProjectForm'
import ProjectList from './ProjectList'
import { supabaseClient } from '../../services/supabaseClient'
import FormModal from '../../components/modal/FormModal'
import { useLoader } from '../../context/loaderContext/LoaderContext'

const Project = () => {
    const [projects, setProjects] = useState([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10); // rows per page
    const [totalCount, setTotalCount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const { startLoader, stopLoader, loading } = useLoader();
    const fetchProjects = async (currentPage = 1) => {
        const from = (currentPage - 1) * limit;
  const to = from + limit - 1;
        startLoader();
        try {
            const { data, error, count } = await supabaseClient
    .from('projects')
    .select(`
      *,
      clients (
        id,
        company_name,
        first_name,
        last_name
      )
    `, { count: 'exact' })
    .range(from, to);
            setProjects(data);
            setTotalCount(count);
            stopLoader();
            if (error) {
                throw error;
            }
        } catch (error) {
            console.error("Error fetching projects:", error);
            stopLoader();

        }

    }

    useEffect(() => {
        fetchProjects(page);
        console.log(projects);
    }, [page]);

    const handleAddProject = () => {
        setSelectedProject(null);
        setIsModalOpen(true);
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProject(null);
    }

    return (
        <>
            <div className="page_header">
                <h2 className='section_title'>Projects List</h2>
                <button onClick={handleAddProject} className='btn filled_btn'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="" d="M12.75 7a.75.75 0 0 0-1.5 0v4.25H7a.75.75 0 0 0 0 1.5h4.25V17a.75.75 0 0 0 1.5 0v-4.25H17a.75.75 0 0 0 0-1.5h-4.25z" /></svg>
                    <span>Add Project</span>
                </button>
            </div>
            <ProjectList projects={projects} onEdit={setSelectedProject} setIsModalOpen={setIsModalOpen} totalCount={totalCount} limit={limit} page={page} setPage={setPage} loading={loading} />
            <FormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title="Add Project"
                width="80%"
            >
                <ProjectForm
                    onSuccess={() => {
                        setIsModalOpen(false);
                    }}
                    fetchProjects={fetchProjects}
                    selectedProject={selectedProject}
                />
            </FormModal>


        </>
    )
}

export default Project