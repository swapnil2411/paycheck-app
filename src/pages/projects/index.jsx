import React, { useState, useEffect, use } from 'react'
import ProjectForm from './ProjectForm'
import ProjectList from './ProjectList'
import { supabaseClient } from '../../services/supabaseClient'
import FormModal from '../../components/modal/FormModal'
import { useLoader } from '../../context/loaderContext/LoaderContext'
import ConfirmationModal from '../../components/modal/ConfirmationModal'
import { useToast } from '../../context/toastContext/ToastContext'
import { useAuth } from '../../context/authContext/AuthContext'

const Project = () => {
    const [projects, setProjects] = useState([]);
    const [page, setPage] = useState(1);
    const [limit] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);
    const { startLoader, stopLoader, loading } = useLoader();
    const { showToast } = useToast();
    const { user } = useAuth();

    const fetchProjects = async (currentPage = 1) => {
        const from = (currentPage - 1) * limit;
        const to = from + limit - 1;
        startLoader();
        try {
            const { data, error, count } = await supabaseClient
                .from('projects')
                .select('*', { count: 'exact' })
                .range(from, to);
            if (error) throw error;
            setProjects(data);
            setTotalCount(count);
        } catch (error) {
            console.error("Error fetching projects:", error);
            showToast("Error fetching projects", "error");
        } finally {
            stopLoader();
        }
    }

    useEffect(() => {
        fetchProjects(page);
    }, [page]);

    const handleAddProject = () => {
        setSelectedProject(null);
        setIsModalOpen(true);
    }

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProject(null);
    }

    const handleDeleteClick = (project) => {
        setProjectToDelete(project);
        setIsConfirmOpen(true);
    }

    const handleConfirmDelete = async () => {
        if (!projectToDelete) return;
        startLoader();
        try {
            const { error } = await supabaseClient
                .from('projects')
                .delete()
                .eq('id', projectToDelete.id);
            if (error) throw error;
            setIsConfirmOpen(false);
            setProjectToDelete(null);
            showToast("Project deleted successfully ✅");
            fetchProjects(page);
        } catch (error) {
            console.error("Error deleting project:", error);
            showToast("Error deleting project", "error");
        } finally {
            stopLoader();
        }
    }

    

    return (
        <>
            <div className="page_header">
                <h2 className='section_title'>Projects List</h2>
                <button onClick={handleAddProject} className='btn filled_btn'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                        <path fill="" d="M12.75 7a.75.75 0 0 0-1.5 0v4.25H7a.75.75 0 0 0 0 1.5h4.25V17a.75.75 0 0 0 1.5 0v-4.25H17a.75.75 0 0 0 0-1.5h-4.25z" />
                    </svg>
                    <span>Add Project</span>
                </button>
            </div>

            <ProjectList
                projects={projects}
                onEdit={setSelectedProject}
                setIsModalOpen={setIsModalOpen}
                onDelete={handleDeleteClick}
                totalCount={totalCount}
                limit={limit}
                page={page}
                setPage={setPage}
                loading={loading}
                currentUserId={user?.id}
            />

            <FormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={selectedProject 
    ? (selectedProject.user_id !== user?.id ? "View Project" : "Edit Project") 
    : "Add Project"
}
                width="80%"
            >
                <ProjectForm
                    onSuccess={() => setIsModalOpen(false)}
                    fetchProjects={fetchProjects}
                    selectedProject={selectedProject}
                    isReadOnly={selectedProject ? selectedProject.user_id !== user?.id : false}
                />
            </FormModal>

            <ConfirmationModal
                isOpen={isConfirmOpen}
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setIsConfirmOpen(false);
                    setProjectToDelete(null);
                }}
                confirmTxt="Delete"
                cancelTxt="Cancel"
                message={`Are you sure you want to delete "${projectToDelete?.project_name}"?`}
            />
        </>
    )
}

export default Project