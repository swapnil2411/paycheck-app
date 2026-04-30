import React, { useState } from 'react'
import { supabaseClient } from '../../services/supabaseClient.jsx'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/authContext/AuthContext.jsx';
import { useLoader } from '../../context/loaderContext/LoaderContext.jsx';
import { ValidateEmail, ValidateName } from '../../validations/Validations';

const SignUp = () => {
    const { signUp, loading } = useAuth();
    const { startLoader, stopLoader } = useLoader();
    const navigate = useNavigate();
    const [validationErrors, setValidationErrors] = useState({
  email: '',
  password: '',
  firstName: '',
  lastName: '',
  global: ''
});
    const [signUpCredentials, setSignUpCredentials] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: ''
    })

    const passwordRules = [
    { label: "At least one uppercase letter", test: (val) => /[A-Z]/.test(val) },
    { label: "At least one lowercase letter", test: (val) => /[a-z]/.test(val) },
    { label: "At least one number", test: (val) => /\d/.test(val) },
    { label: "At least one special character", test: (val) => /[^A-Za-z0-9]/.test(val) },
    { label: "Minimum 8 characters", test: (val) => val.length >= 8 },
  ];

  const isPasswordValid = (password) => {
  return passwordRules.every(rule => rule.test(password));
};

    const validateForm = () => {
        let valid = true
        const newErrors = { email: '', password: '' }
        if (!signUpCredentials.firstName || signUpCredentials.firstName.trim() === ''){
            newErrors.firstName = 'First Name is required'
            valid = false
        } else if (!ValidateName(signUpCredentials.firstName)){
            newErrors.firstName = 'Invalid First Name'
            valid = false
        }
        if (!signUpCredentials.lastName || signUpCredentials.lastName.trim() === ''){
            newErrors.lastName = 'Last Name is required'
            valid = false
        } else if (!ValidateName(signUpCredentials.lastName)){
            newErrors.lastName = 'Invalid Last Name'
            valid = false
        }
        if (!signUpCredentials.email || signUpCredentials.email.trim() === '') {
            newErrors.email = 'Email is required'
            valid = false
        } else if (!ValidateEmail(signUpCredentials.email)) {
            newErrors.email = 'Invalid Email address'
            valid = false
        }
        if (!signUpCredentials.password || signUpCredentials.password.trim() === '') {
            newErrors.password = 'Password is required'
            valid = false
        }
        else if (!isPasswordValid(signUpCredentials.password)) {
            newErrors.password = 'Password does not meet the required criteria'
            valid = false
        }
        setValidationErrors(newErrors)
        return valid
    }

    const handleChange = (e) => {
  const { name, value } = e.target;

  setSignUpCredentials(prev => ({
    ...prev,
    [name]: value
  }));

  setValidationErrors(prev => ({
    ...prev,
    [name]: '',
    global: ''
  }));
};


    const handleSignUp = async () => {

  if (!validateForm()) return;
startLoader();
  const { email, password, firstName, lastName } = signUpCredentials;

  try {
    await signUp(email, password, firstName, lastName);
    navigate('/');
    stopLoader();
  } catch (error) {
    setValidationErrors(prev => ({
      ...prev,
      global: error?.message || 'Unable to create account',
    }));
    stopLoader();
  }
};


    return (
        <div className='authentication_wrapper'>
            <div className='authentication_left_area'>
                <div className='authetication_logo_wrapper'>
                    <img src='/images/logo-invoice-white.png' alt='PAYCHECK' />
                </div>
                <div className='authentication_text'>
                    <h2>Reliable invoicing<br />for modern businesses.</h2>
                    <p>A trusted platform for sending and managing invoices with accuracy and control.</p>
                </div>
            </div>

            <div className='authentication_right_area'>
                <div className='authentication_right_area_inner'>
                    <div className='authentication_form'>
                        <h2>Sign Up</h2>
                        <div className='auth_input'>
                            <input placeholder="Enter your first name" name="firstName" onChange={handleChange} />
                        {validationErrors.firstName && <p className='error_message'>{validationErrors.firstName}</p>}
                        </div>
                        <div className='auth_input'>
                            <input placeholder="Enter your last name" name="lastName" onChange={handleChange} />
                        {validationErrors.lastName && <p className='error_message'>{validationErrors.lastName}</p>}
                        </div>
                        <div className='auth_input'>
                            <input placeholder="Enter your email" name="email" onChange={handleChange} />
                        {validationErrors.email && <p className='error_message'>{validationErrors.email}</p>}
                        </div>
                        <div className='auth_input'>
                            <input type="password" placeholder="Enter your password" name="password" onChange={handleChange} />
                            {validationErrors.password && <p className='error_message'>{validationErrors.password}</p>}
                            {/* Password Rules */}
                  
                        
                        </div>
                        <button onClick={handleSignUp} className='authentication_btn'>Create Account</button>
                        {validationErrors.global && (
  <p className="error_message" style={{textAlign: "center", marginTop: "0.5vw"}}>{validationErrors.global}</p>
)}
{signUpCredentials.password && (
                    <ul className="password-rules">
                      {passwordRules.map((rule, idx) => {
                        const passed = rule.test(signUpCredentials.password);
                        return (
                          <li key={idx} style={{ color: passed ? "green" : "#d32f2f" }}>
                            {passed ? "✔" : "✖"} {rule.label}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                    </div>
                </div>
            </div>
        </div>


    )
}

export default SignUp