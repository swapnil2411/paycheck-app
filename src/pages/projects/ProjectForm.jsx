import React, { useEffect, useState } from 'react';
import SelectDropdown from '../../components/select';
import { supabaseClient } from '../../services/supabaseClient';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Close from '../../icons/Close';
import Save from '../../icons/Save';
import { useToast } from '../../context/toastContext/ToastContext';
import { useAuth } from '../../context/authContext/AuthContext';

const ProjectForm = ({ fetchProjects, selectedProject, onSuccess, isReadOnly }) => {

  const isEdit = Boolean(selectedProject);
  const { showToast } = useToast();
  const { user } = useAuth();

  const [clients, setClients] = useState([]);
  const [errors, setErrors] = useState({});

  const projectTypeOptions = [
    { value: "Website Development", label: "Website Development" },
    { value: "Software Development", label: "Software Development" },
    { value: "UI/UX Design", label: "UI/UX Design" },
    { value: "Mobile App Development", label: "Mobile App Development" },
    { value: "E-Commerce Development", label: "E-Commerce Development" },
    { value: "SaaS Development", label: "SaaS Development" },
    { value: "API Development", label: "API Development" },
    { value: "Maintenance & Support", label: "Maintenance & Support" },
    { value: "Digital Marketing", label: "Digital Marketing" },
    { value: "Other", label: "Other" }
  ];

  const [projectData, setProjectData] = useState({
    project_name: '',
    client_id: null,
    description: '',
    project_type: null,
    start_date: null,
    end_date: null
  });

  // ✅ Fetch Clients
  useEffect(() => {
    const fetchClients = async () => {
      const { data, error } = await supabaseClient
        .from('clients')
        .select('id, company_name, first_name, last_name');

      if (!error && data) {
        const formatted = data.map(client => ({
          value: client.id,
          label: client.company_name || `${client.first_name} ${client.last_name}`
        }));
        setClients(formatted);
      }
    };

    fetchClients();
  }, []);

  // ✅ Prefill in Edit/View Mode
useEffect(() => {
    if (!selectedProject) return;  // 👈 remove the clients.length === 0 check

    const selectedClient = clients.find(c => c.value === selectedProject.client_id)
        || (selectedProject.client_name
            ? { value: selectedProject.client_id, label: selectedProject.client_name }
            : null);

    const selectedType = projectTypeOptions.find(t => t.value === selectedProject.project_type);

    setProjectData({
        project_name: selectedProject.project_name || '',
        client_id: selectedClient || null,
        description: selectedProject.description || '',
        project_type: selectedType || null,
        start_date: selectedProject.start_date ? new Date(selectedProject.start_date) : null,
        end_date: selectedProject.end_date ? new Date(selectedProject.end_date) : null
    });

}, [selectedProject, clients]);

  // ✅ Validation
  const validate = () => {
    const newErrors = {};
    if (!projectData.project_name.trim()) newErrors.project_name = 'Project name is required';
    if (!projectData.client_id) newErrors.client_id = 'Client is required';
    if (!projectData.project_type) newErrors.project_type = 'Project type is required';
    if (!projectData.start_date) newErrors.start_date = 'Start date is required';
    if (projectData.end_date && projectData.start_date && projectData.end_date < projectData.start_date) {
      newErrors.end_date = 'End date cannot be before start date';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length > 0;
  };

  // ✅ Submit
  const handleSubmit = async () => {
    if (validate()) return;

    const payload = {
      project_name: projectData.project_name,
      client_id: projectData.client_id.value,
      client_name: projectData.client_id.label,
      description: projectData.description,
      project_type: projectData.project_type.value,
      start_date: projectData.start_date ? projectData.start_date.toISOString().split('T')[0] : null,
      end_date: projectData.end_date ? projectData.end_date.toISOString().split('T')[0] : null,
      user_id: user?.id
    };

    try {
      if (isEdit) {
        const { error } = await supabaseClient.from('projects').update(payload).eq('id', selectedProject.id);
        if (error) throw error;
        showToast('Project updated successfully ✅');
      } else {
        const { error } = await supabaseClient.from('projects').insert([payload]).select();
        if (error) throw error;
        showToast('Project added successfully ✅');
      }
      handleCancel();
      fetchProjects();
      onSuccess();
    } catch (err) {
      console.error(err);
      showToast(isEdit ? 'Error updating project' : 'Error adding project', 'error');
    }
  };

  const handleCancel = () => {
    setProjectData({
      project_name: '',
      client_id: null,
      description: '',
      project_type: null,
      start_date: null,
      end_date: null
    });
    setErrors({});
  };

  return (
    <div className="form_wrapper">
      <div className='form_element_container'>

        <div className="form_element">
          <label>Project Name *</label>
          <input
            type="text"
            value={projectData.project_name}
            onChange={(e) => setProjectData(prev => ({ ...prev, project_name: e.target.value }))}
            disabled={isReadOnly}
          />
          {errors.project_name && <span className="error_message">{errors.project_name}</span>}
        </div>

        <div className="form_element">
          <label>Client *</label>
          <SelectDropdown
            options={clients}
            value={projectData.client_id}
            onChange={(selected) => setProjectData(prev => ({ ...prev, client_id: selected }))}
            isDisabled={isReadOnly}
          />
          {errors.client_id && <span className="error_message">{errors.client_id}</span>}
        </div>

        <div className="form_element">
          <label>Project Type *</label>
          <SelectDropdown
            options={projectTypeOptions}
            value={projectData.project_type}
            onChange={(selected) => setProjectData(prev => ({ ...prev, project_type: selected }))}
            isDisabled={isReadOnly}
          />
          {errors.project_type && <span className="error_message">{errors.project_type}</span>}
        </div>

        <div className="form_element">
          <label>Description</label>
          <textarea
            value={projectData.description}
            onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
            disabled={isReadOnly}
          />
        </div>

        <div className="form_element">
          <label>Start Date *</label>
          <DatePicker
            selected={projectData.start_date}
            onChange={(date) => setProjectData(prev => ({ ...prev, start_date: date }))}
            dateFormat="yyyy-MM-dd"
            className="date_input"
            disabled={isReadOnly}
          />
          {errors.start_date && <span className="error_message">{errors.start_date}</span>}
        </div>

        <div className="form_element">
          <label>End Date</label>
          <DatePicker
            selected={projectData.end_date}
            onChange={(date) => setProjectData(prev => ({ ...prev, end_date: date }))}
            dateFormat="yyyy-MM-dd"
            className="date_input"
            disabled={isReadOnly}
          />
          {errors.end_date && <span className="error_message">{errors.end_date}</span>}
        </div>

      </div>

      <div className='form_btn_grp'>
        <button className='btn outline_btn' onClick={onSuccess}>
          <Close />
          <span>Close</span>
        </button>
        {!isReadOnly && (
          <button className='btn filled_btn' onClick={handleSubmit}>
            <Save />
            <span>Save</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectForm;