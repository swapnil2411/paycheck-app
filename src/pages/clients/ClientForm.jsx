import React, { useEffect, useMemo, useState } from 'react'
import SelectDropdown from '../../components/select'
import countryList from 'react-select-country-list'
import { supabaseClient } from '../../services/supabaseClient'
import Close from '../../icons/Close'
import Save from '../../icons/Save'
import { fetchPincodeDetails } from '../../services/useService'
import { useLoader } from '../../context/loaderContext/LoaderContext'
import { ValidateEmail, ValidatePan, ValidateMobileNumber, ValidateName, ValidateCompanyName  } from '../../validations/Validations'

const ClientForm = ({ fetchClients, onSuccess, selectedClient }) => {

    const isEdit = Boolean(selectedClient);

    const { startLoader, stopLoader } = useLoader();

    const [clientData, setClientData] = useState({
        first_name: '',
        last_name: '',
        company_name: '',
        email: '',
        phone: '',
        customer_type: null,
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        pincode: '',
        country: null,
        // gst_treatment: '',
        // gstin: '',
        pan: ''
    })

    const [clientError, setClientError] = useState({
        first_name: '',
        last_name: '',
        company_name: '',
        email: '',
        phone: '',
        customer_type: '',
        address_line_1: '',
        city: '',
        state: '',
        pincode: '',
        country: '',
        // gst_treatment: '',
        // gstin: '',
        pan: ''
    });

    const [pincodeTimer, setPincodeTimer] = useState(null);


    const customerType = [
        { value: 'Business', label: 'Business' },
        { value: 'Individual', label: 'Individual' }
    ]

    const countries = useMemo(() => countryList().getData(), [])
    const isUserChangingCountry = React.useRef(false);

    const lookupPincode = async (pincode, country) => {
        if (!pincode || !country || pincode.length < 3) return;
        if (isUserChangingCountry.current) return;
        startLoader();


        try {
            const data = await fetchPincodeDetails(pincode, country);
            const locations = data?.results?.[pincode] || [];



            const matched = locations.find(
                loc => loc.country_code === country
            );

            const location = matched || locations[0];
            stopLoader();
            if (location === undefined) {
                console.warn('No location found for this pincode and country:', country);
                return;
            }
            if (!location) return;



            setClientData(prev => ({
                ...prev,
                city: location.province || '',
                state: location.state || ''
            }));

            setClientError(prev => ({
                ...prev,
                city: '',
                state: ''
            }));
        } catch (err) {
            console.error(err);
            stopLoader();
        }
    };

    const validateClientData = () => {
        const errors = {};
        if (!clientData.first_name.trim()) {
            errors.first_name = 'First name is required';
        } else if (!ValidateName(clientData.first_name)) {
            errors.first_name = 'Invalid First Name';
        }
        if (!clientData.last_name.trim()) {
            errors.last_name = 'Last name is required';
        } else if (!ValidateName(clientData.last_name)) {
            errors.last_name = 'Invalid Last Name';
        }
        if (!clientData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(clientData.email)) {
            errors.email = 'Email is invalid';
        }
        if (!clientData.company_name.trim()) {
            errors.company_name = 'Company name is required';
        } else if (!ValidateCompanyName(clientData.company_name)) {
            errors.company_name = 'Invalid Company Name';
        }
       if (!String(clientData.phone || '').trim()) {
  errors.phone = 'Phone is required';
} else if (!ValidateMobileNumber(String(clientData.phone))) {
  errors.phone = 'Invalid Mobile Number';
}
        if (!clientData.customer_type) {
            errors.customer_type = 'Customer type is required';
        }
        if (!clientData.address_line_1.trim()) {
            errors.address_line_1 = 'Address line 1 is required';
        }
        if (!clientData.city.trim()) {
            errors.city = 'City is required';
        }
        if (!clientData.state.trim()) {
            errors.state = 'State is required';
        }
        if (!clientData.pincode.trim()) {
            errors.pincode = 'Pincode is required';
        }
        if (!clientData.country) {
            errors.country = 'Country is required';
        }
        // if (!clientData.gst_treatment.trim()) {
        //     errors.gst_treatment = 'GST Treatment is required';
        // } if (!clientData.gstin.trim()) {
        //     errors.gstin = 'GSTIN is required';
        //} 
        if (!clientData.pan.trim()) {
            errors.pan = 'PAN is required';
        }else if (!ValidatePan(clientData.pan)) {
            errors.pan = 'Invalid PAN';
        }
        setClientError(errors);

        // 🔥 RETURN TRUE IF THERE ARE ERRORS
    return Object.keys(errors).length > 0;
    }

    const handleClientInputChange = (e) => {
        const { name, value } = e.target
        setClientData(prev => ({
    ...prev,
    [name]: name === 'phone' ? String(value) : value
  }));

        setClientError(prevError => ({
            ...prevError,
            [name]: '' // Clear error on input change
        }))

        if (name === 'pincode') {
            if (pincodeTimer) clearTimeout(pincodeTimer);

            const timer = setTimeout(() => {
                lookupPincode(value, clientData.country);
            }, 700);

            setPincodeTimer(timer);
        }
    }

    const handleClientSelectChange = (field) => (selectedOption) => {
        setClientData(prev => ({
            ...prev,
            [field]: selectedOption // ✅ store full object
        }));

        setClientError(prev => ({
            ...prev,
            [field]: ''
        }));
        // Allow lookup AFTER state settles
        setTimeout(() => {
            isUserChangingCountry.current = false;

            if (field === 'country' && clientData.pincode) {
                lookupPincode(clientData.pincode, selectedOption?.value);
            }
        }, 0);
    }


    const handleSubmit = async () => {
    if (validateClientData()) return;
    startLoader();
    try {
        const storeClientData = {
            ...clientData,
            customer_type: clientData.customer_type?.value || null,
            country: clientData.country?.label || null
        };

        if (isEdit) {
            const { error } = await supabaseClient
                .from('clients')
                .update(storeClientData)
                .eq('id', selectedClient.id);

            if (error) throw error;
        } else {
            const { error } = await supabaseClient
                .from('clients')
                .insert([storeClientData]);

            if (error) throw error;
        }

        // resetForm();
        fetchClients();
        onSuccess();
        stopLoader();

    } catch (error) {
        console.error("Error submitting client data:", error);
        stopLoader();
    }
};


    const handleCancel = () => {
        // Reset form or navigate back
        setClientData({
            first_name: '',
            last_name: '',
            company_name: '',
            email: '',
            phone: '',
            customer_type: null,
            address_line_1: '',
            address_line_2: '',
            city: '',
            state: '',
            pincode: '',
            country: null,
            // gst_treatment: '',
            // gstin: '',
            pan: ''
        })
    }

    useEffect(() => {
  if (!selectedClient) return;

  setClientData({
    first_name: selectedClient.first_name || '',
    last_name: selectedClient.last_name || '',
    company_name: selectedClient.company_name || '',
    email: selectedClient.email || '',
    phone: selectedClient.phone || '',
    customer_type: customerType.find(
      t => t.value === selectedClient.customer_type
    ) || null,
    address_line_1: selectedClient.address_line_1 || '',
    address_line_2: selectedClient.address_line_2 || '',
    city: selectedClient.city || '',
    state: selectedClient.state || '',
    pincode: selectedClient.pincode || '',
    country: countries.find(
      c => c.label === selectedClient.country
    ) || null,
    pan: selectedClient.pan || ''
  });

  setClientError({});
}, [selectedClient, countries]);


useEffect(() => {
      console.log("### Selected Client in parent", selectedClient);
    }, [selectedClient])

    // useEffect(() => {
    //     console.log("### Countries", countries)
    // }, [countries])


    return (
        <>
            {/* <h2 className='section_title'>Add Client</h2> */}
            <div className='form_wrapper'>
                <h4 className='form_chips'>Basic Details</h4>
                <div className='form_element_container mb-20'>
                    <div className="form_element">
                        <label htmlFor="">
                            First Name <span className='asterick'>*</span>
                        </label>
                        <input type="text" placeholder='First Name' name="first_name" onChange={handleClientInputChange} value={clientData.first_name} />
                        {clientError.first_name && <span className='error_message'>{clientError.first_name}</span>}
                    </div>
                    <div className="form_element">
                        <label htmlFor="">
                            Last Name <span className='asterick'>*</span>
                        </label>
                        <input type="text" placeholder='Last Name' name="last_name" onChange={handleClientInputChange} value={clientData.last_name} />
                        {clientError.last_name && <span className='error_message'>{clientError.last_name}</span>}
                    </div>
                    <div className="form_element">
                        <label htmlFor="">
                            Company Name <span className='asterick'>*</span>
                        </label>
                        <input type="text" placeholder='Company Name' name="company_name" onChange={handleClientInputChange} value={clientData.company_name} />
                        {clientError.company_name && <span className='error_message'>{clientError.company_name}</span>}
                    </div>
                    <div className="form_element">
                        <label htmlFor="">
                            Email <span className='asterick'>*</span>
                        </label>
                        <input type="email" placeholder='Email' name="email" onChange={handleClientInputChange} value={clientData.email} />
                        {clientError.email && <span className='error_message'>{clientError.email}</span>}
                    </div>
                    <div className="form_element">
                        <label htmlFor="">
                            Phone <span className='asterick'>*</span>
                        </label>
                        <input type="text" placeholder='Phone' name="phone" onChange={handleClientInputChange} value={clientData.phone} />
                        {clientError.phone && <span className='error_message'>{clientError.phone}</span>}
                    </div>
                    <div className="form_element">
                        <label htmlFor="">
                            Cutsomer Type <span className='asterick'>*</span>
                        </label>
                        <SelectDropdown
                            options={customerType}
                            onChange={handleClientSelectChange('customer_type')}
                            value={clientData.customer_type}

                        // menuIsOpen={true}
                        />
                        {clientError.customer_type && <span className='error_message'>{clientError.customer_type}</span>}
                    </div>
                </div>

                <h4 className='form_chips'>Address Details</h4>
                <div className='form_element_container mb-20'>
                    <div className="form_element">
                        <label htmlFor="">
                            Address <span className='asterick'>*</span>
                        </label>
                        <input type="text" placeholder='Address 1' name="address_line_1" onChange={handleClientInputChange} value={clientData.address_line_1} />
                        {clientError.address_line_1 && <span className='error_message'>{clientError.address_line_1}</span>}
                    </div>
                    <div className="form_element">
                        <label htmlFor="">
                            Address
                        </label>
                        <input type="text" placeholder='Address 2' name="address_line_2" onChange={handleClientInputChange} value={clientData.address_line_2} />
                    </div>
                    <div className="form_element">
                        <label htmlFor="">
                            City <span className='asterick'>*</span>
                        </label>
                        <input type="text" placeholder='City' name="city" onChange={handleClientInputChange} value={clientData.city} disabled />
                        {clientError.city && <span className='error_message'>{clientError.city}</span>}
                    </div>
                    <div className="form_element">
                        <label htmlFor="">
                            State <span className='asterick'>*</span>
                        </label>
                        <input type="text" placeholder='State' name="state" onChange={handleClientInputChange} value={clientData.state} disabled />
                        {clientError.state && <span className='error_message'>{clientError.state}</span>}
                    </div>

                    <div className="form_element">
                        <label htmlFor="">
                            Pincode <span className='asterick'>*</span>
                        </label>
                        <input type="text" placeholder='Pincode' name="pincode" onChange={handleClientInputChange} value={clientData.pincode} />
                        {clientError.pincode && <span className='error_message'>{clientError.pincode}</span>}
                    </div>
                    <div className="form_element">
                        <label htmlFor="">
                            Country <span className='asterick'>*</span>
                        </label>
                        <SelectDropdown
                            options={countries}
                            onChange={handleClientSelectChange('country')}
                            value={clientData.country}
                        // menuIsOpen={true}
                        />
                        {clientError.country && <span className='error_message'>{clientError.country}</span>}
                    </div>

                </div>

                <h4 className='form_chips'>Other Details</h4>
                <div className='form_element_container mb-20'>
                    {/* <div className="form_element">
                        <label htmlFor="">
                            GST Treatment <span className='asterick'>*</span>
                        </label>
                        <input type="text" placeholder='GST Treatment' name="gst_treatment" onChange={handleClientInputChange} value={clientData.gst_treatment} />
                        {clientError.gst_treatment && <span className='error_message'>{clientError.gst_treatment}</span>}
                    </div>
                    {
                        clientData.gst_treatment && (
                        <>
                            <div className="form_element">
                        <label htmlFor="">
                            GSTN/UID <span className='asterick'>*</span>
                        </label>
                        <input type="text" placeholder='GSTIN' name="gstin" onChange={handleClientInputChange} value={clientData.gstin} />
                        {clientError.gstin && <span className='error_message'>{clientError.gstin}</span>}
                    </div>
                    
                        </>
                        )
                    } */}
                    <div className="form_element">
                        <label htmlFor="">
                            PAN <span className='asterick'>*</span>
                        </label>
                        <input type="text" placeholder='PAN' name="pan" onChange={handleClientInputChange} value={clientData.pan} />
                        {clientError.pan && <span className='error_message'>{clientError.pan}</span>}
                    </div>
                </div>

                <div className='form_btn_grp'>
                    <button className='btn outline_btn' onClick={handleCancel}>
                        <Close />
                        <span>Cancel</span>
                    </button>
                    <button className='btn filled_btn' onClick={handleSubmit}>
                        <Save />
                        <span>Save</span>
                    </button>
                </div>
            </div>
        </>
    )
}

export default ClientForm