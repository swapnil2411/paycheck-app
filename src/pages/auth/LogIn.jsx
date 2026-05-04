import React, { useState, useEffect, useRef } from 'react'
import { supabaseClient } from '../../services/supabaseClient';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext/AuthContext.jsx';
import { ValidateEmail } from '../../validations/Validations';
import { useLoader } from '../../context/loaderContext/LoaderContext.jsx';

const LogIn = () => {
    const { signIn, loading } = useAuth();
    const navigate = useNavigate();
    const { startLoader, stopLoader } = useLoader();
    
    const [signInCredentials, setSignInCredentials] = useState({
        email: '',
        password: ''
    });
    
    const [validationErrors, setValidationErrors] = useState({
        email: '',
        password: ''
    });
    
    const [globalError, setGlobalError] = useState('');
    
    // Use a ref to track renders
    const renderCount = useRef(0);
    const globalErrorRef = useRef('');

    
   

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSignInCredentials(prev => ({
            ...prev,
            [name]: value
        }));

        setValidationErrors(prev => ({
            ...prev,
            [name]: ''
        }));
        
        if (globalError) {
            console.log('Clearing global error due to user input');
            setGlobalError('');
        }
    }

    const validateForm = () => {
        console.log('📋 validateForm called');
        let valid = true;
        const newErrors = { email: '', password: '' };
        
        if (!signInCredentials.email || signInCredentials.email.trim() === '') {
            newErrors.email = 'Email is required.';
            valid = false;
        } else if (!ValidateEmail(signInCredentials.email)) {
            newErrors.email = 'Please enter a valid email address.';
            valid = false;
        }

        if (!signInCredentials.password || signInCredentials.password.trim() === '') {
            newErrors.password = 'Password is required.';
            valid = false;
        }

        setValidationErrors(newErrors);
        console.log('📋 Validation result:', valid, newErrors);
        return valid;
    }

    const handleSignIn = async (e) => {
        e?.preventDefault();
        startLoader();
        
        setGlobalError('');
        
        if (!validateForm()) {
            console.log('❌ Validation failed, stopping');
            stopLoader();
            return;
        }
        
        const { email, password } = signInCredentials;
        
        
        
        try {
            await signIn(email, password);
            console.log('✅ Sign in successful');
            navigate('/');
            stopLoader();
        } catch (error) {
            
            const errorMsg = error?.message || 'Invalid email or password.';
            
            
            // Try multiple ways to set the error
            setGlobalError(errorMsg);
            globalErrorRef.current = errorMsg;
            stopLoader();
            
        }
        
    }

    const signInWithMicrosoft = async () => {
        startLoader();
        console.log('Microsoft button clicked');
        try{
            
            const { data, error } = await supabaseClient.auth.signInWithOAuth({
            provider: 'azure',
            options: {
                scopes: 'openid email profile',
                redirectTo: import.meta.env.VITE_REDIRECT_URI_PROD
                //redirectTo: import.meta.env.VITE_REDIRECT_URI_LOCAL
            },
        });
       
        }
        catch (error){
             stopLoader();
            console.error('OAuth error:', error);
        }
        
        
        if (error) console.error('OAuth error:', error);
        else console.log('User signed in successfully:', data);
    }

    console.log('🎨 Rendering component, globalError:', globalError);

    return (
        <div className='authentication_wrapper'>
            <div className='authentication_left_area'>
                <div className='authetication_logo_wrapper'>
                    <img src='/images/logo-invoice-white.png' alt='PAYCHECK'/>
                </div>
                <div className='authentication_text'>
                    <h2>Reliable invoicing<br />for modern businesses.</h2>
                    <p>A trusted platform for sending and managing invoices with accuracy and control.</p>
                </div>
            </div>
            <div className='authentication_right_area'>
                <div className='authentication_right_area_inner'>
                    <div className='authentication_form'>
                        <h2>Login</h2>
                        
                        

                        {/* Original conditional display */}
                       

                        
                        
                        <div className='auth_input'>
                            <input 
                                placeholder="Enter your email" 
                                name="email" 
                                onChange={handleChange}
                                value={signInCredentials.email}
                                disabled={loading}
                            />
                            {validationErrors.email && <p className='error_message'>{validationErrors.email}</p>}
                        </div>
                        
                        <div className='auth_input'>
                            <input 
                                type="password" 
                                placeholder="Enter your password" 
                                name="password" 
                                onChange={handleChange}
                                value={signInCredentials.password}
                                disabled={loading}
                            />
                            {validationErrors.password && <p className='error_message'>{validationErrors.password}</p>}
                        </div>
                        
                        <button 
                            className='authentication_btn' 
                            onClick={handleSignIn}
                            disabled={loading}
                        >
                            {loading ? 'Logging in...' : 'Login'}
                        </button>

                         {globalError && <p className='error_message' style={{textAlign: "center", marginTop: "0.5vw"}}>{globalError}</p>}
                    </div>
                    
                    <p className='partition'>
                        <span>OR</span>
                    </p>
                    
                    <button type="button" onClick={signInWithMicrosoft} className='auth_provider_btn'>
                        <img src="/images/microsoft.png" alt="Microsoft" />
                        <span>Sign in with Microsoft</span>
                    </button>
                    
                    <div className='authetication_not_register'>
                        <p>Don't have an account? <Link to='/signup'>Create Account</Link></p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default LogIn