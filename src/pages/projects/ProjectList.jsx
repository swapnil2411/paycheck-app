import React from 'react';
import Edit from '../../icons/Edit';
import Delete from '../../icons/Delete';

const ProjectList = ({ projects, onEdit, setIsModalOpen, totalCount, limit, page, setPage, loading }) => {
    const totalPages = Math.ceil(totalCount / limit);
    console.log("### totalCount, totalPages", totalCount, totalPages);

    const getClientName = (client) => {
        if (!client) return '';
        return client.company_name ||
            `${client.first_name || ''} ${client.last_name || ''}`;
    };

    const handleEdit = (project) => {
        onEdit(project);
        setIsModalOpen(true);
    }

    return (
        <>
            <div className='table_data_container'>
                <table className="project_table">
                    <thead>
                        <tr>
                            <th>Sr.No</th>
                            <th>Project Name</th>
                            <th>Client</th>
                            <th>Project Type</th>
                            <th>Start Date</th>
                            <th>End Date</th>
                            <th className='table_header_action'>Action</th>
                        </tr>
                    </thead>

                    <tbody>
                        {
                            loading ? (
                                <tr>
                                    <td colSpan="7" className='loading_cell'>Loading...</td>
                                </tr>
                            ) : projects.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className='loading_cell'>No data found</td>
                                </tr>
                            ) : (
                                projects.map((project, index) => (
                            <tr key={project.id}>
                                <td>{(page - 1) * limit + index + 1}</td>
                                <td>{project.project_name}</td>
                                <td>{getClientName(project.clients)}</td>
                                <td>{project.project_type}</td>
                                <td>{project.start_date ? project.start_date.split('T')[0]
                                    : ''}</td>
                                <td>{project.end_date ? project.end_date.split('T')[0]
                                    : ''}</td>
                                <td>
                                    <div className='action_table_cell'>
                                        <button className='action_btn edit_btn' onClick={() => handleEdit(project)}>
                                            <Edit/>
                                        </button>
                                        <button className='action_btn delete_btn'>
                                            <Delete />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                            )
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
    );
};

export default ProjectList;
