import React, { useState } from 'react';
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilUser, cilLockLocked, cilEnvelopeOpen } from '@coreui/icons';
import Swal from 'sweetalert2';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    repeatPassword: '',
  });
  const strongPasswordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{}|;':",.<>/?]).{8,}$/;


  const [errors, setErrors] = useState({});

  const validateEmail = (email) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    let message = '';

    if (!value.trim()) {
      message = 'This field is required';
    } else if (name === 'email' && !validateEmail(value)) {
      message = 'Invalid email format';
    } else if (name === 'password' && !strongPasswordRegex.test(value)) {
      message = 'Password must be at least 8 characters long and include uppercase, lowercase, number, and special character';
    } else if (name === 'repeatPassword' && value !== formData.password) {
      message = 'Passwords do not match';
    }

    setErrors((prev) => ({ ...prev, [name]: message }));
  };


  const isFormValid = () => {
    const { firstname, lastname, email, password, repeatPassword } = formData;
    return (
      firstname.trim() &&
      lastname.trim() &&
      validateEmail(email) &&
      strongPasswordRegex.test(password) &&
      password === repeatPassword
    );
  };


  const handleRegister = async () => {
    const { firstname, lastname, email, password } = formData;

    try {
      const currentTheme = localStorage.getItem('coreui-free-react-admin-template-theme');
      const isDarkMode = currentTheme === 'dark';

      const response = await axios.post('http://localhost:3009/api/v1/registerToDoUser', {
        firstname,
        lastname,
        email,
        password,
      });

      if (!response.data.err) {
        Swal.fire({
          title: 'Success!',
          text: 'User Created Successfully!',
          icon: 'success',
          background: isDarkMode ? '#1e1e2f' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#000000',
          confirmButtonColor: isDarkMode ? '#6c757d' : '#3085d6',
        });

        window.location.href = 'http://localhost:3000/#/login';
      } else {
        Swal.fire('Error', response.data.message, 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Something went wrong.', 'error');
    }
  };

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm>
                  <h1>Register</h1>
                  <p className="text-body-secondary">Create your account</p>

                  {['firstname', 'lastname', 'email', 'password', 'repeatPassword'].map((field) => (
                    <div key={field} className="mb-3">
                      <CInputGroup>
                        <CInputGroupText>
                          <CIcon
                            icon={
                              field.includes('name')
                                ? cilUser
                                : field === 'email'
                                  ? cilEnvelopeOpen
                                  : cilLockLocked
                            }
                          />
                        </CInputGroupText>
                        <CFormInput
                          type={field.includes('password') ? 'password' : 'text'}
                          name={field}
                          placeholder={
                            field === 'firstname'
                              ? 'First Name'
                              : field === 'lastname'
                                ? 'Last Name'
                                : field === 'email'
                                  ? 'Email'
                                  : field === 'password'
                                    ? 'Password'
                                    : 'Repeat Password'
                          }
                          value={formData[field]}
                          onChange={handleChange}
                          onBlur={handleBlur}
                        />
                      </CInputGroup>
                      {errors[field] && (
                        <p className="text-danger mb-0">{errors[field]}</p>
                      )}
                    </div>
                  ))}

                  <div className="d-grid">
                    <CButton color="success" disabled={!isFormValid()} onClick={handleRegister}>
                      Create Account
                    </CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Register;
