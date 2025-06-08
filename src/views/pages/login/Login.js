import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilUser, cilLockLocked } from '@coreui/icons'
import { Link } from 'react-router-dom'
import Swal from 'sweetalert2';

const Login = () => {

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')

  const validateEmail = (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value)
  }

  const handleEmailBlur = () => {
    if (!email) {
      setEmailError('Email is required')
    } else if (!validateEmail(email)) {
      setEmailError('Invalid email format')
    } else {
      setEmailError('')
    }
  }

  const handlePasswordBlur = () => {
    if (!password) {
      setPasswordError('Password is required')
    } else {
      setPasswordError('')
    }
  }

  const handleLogin = async () => {
    handleEmailBlur()
    handlePasswordBlur()
    const currentTheme = localStorage.getItem('coreui-free-react-admin-template-theme');
    const isDarkMode = currentTheme === 'dark';
    if (emailError || passwordError || !email || !password) {
      return
    }

    try {
      const res = await fetch('http://localhost:3009/api/v1/loginToDoUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!data.err) {
        localStorage.setItem('Authorization', data.data.token)
        window.location.href = 'http://localhost:3000/#/test'
      } else {

        Swal.fire({
          title: 'Error',
          text: data.message,
          icon: 'error',
          background: isDarkMode ? '#1e1e2f' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#000000',
          confirmButtonColor: isDarkMode ? '#6c757d' : '#3085d6',
        });


        // Swal.fire('Error', 'Something went wrong.', 'error');
        // alert(data.message || 'Login failed')
      }
    } catch (err) {
      // console.error('Login Error:', err)
      // alert('Something went wrong. Please try again.')
      Swal.fire('Error', 'Something went wrong.', 'error');
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>

                    <CInputGroup className="mb-1"> {/* reduced margin here */}
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Email"
                        autoComplete="username"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onBlur={handleEmailBlur}
                      />
                    </CInputGroup>
                    {emailError && (
                      <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '2px' }}>
                        {emailError}
                      </div>
                    )}

                    <CInputGroup className="mb-1"> {/* reduced margin here as well */}
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onBlur={handlePasswordBlur}
                      />
                    </CInputGroup>
                    {passwordError && (
                      <div style={{ color: 'red', fontSize: '0.85rem', marginTop: '2px' }}>
                        {passwordError}
                      </div>
                    )}

                    {/* {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>} */}

                    <CRow>
                      <CCol xs={6}>
                        <CButton
                          color="primary"
                          className="px-4"
                          onClick={handleLogin}
                          disabled={!email || !password || emailError || passwordError}
                        >
                          Login
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <CButton color="link" className="px-0">
                          Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>

              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>Create your account quickly and manage tasks efficiently.</p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
