import React, { useEffect, useState } from 'react'
import './CSS/todoHome.css'
import 'react-toastify/dist/ReactToastify.css'
import axios from 'axios'
import Swal from 'sweetalert2';
import { toast, ToastContainer } from 'react-toastify'
import {
  CContainer, CRow, CCol, CCard, CCardBody, CFormInput, CButton, CTable,
  CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell,
  CPagination, CPaginationItem, CModal, CModalBody, CModalFooter, CModalHeader,
  CModalTitle, CForm, CFormTextarea, CFormSelect,
} from '@coreui/react'


const todoHome = () => {
  const API_BASE_URL = 'http://localhost:3009/api/v1'
  // const API_BASE_URL = process.env.API_BASE_URL;
  const [visible, setVisible] = useState(false)
  const [editVisible, setEditVisible] = useState(false);
  const [todos, setTodos] = useState([])
  const [formErrors, setFormErrors] = useState({});
  const [editErrors, setEditErrors] = useState({}) // [VALIDATION]
  const [editFormErrors, setEditFormErrors] = useState({});
  const [pagination, setPagination] = useState({
    totalItems: 0,
    currentPage: 1,
    totalPages: 1,
    pageSize: 10,
  })
  const [searchTerm, setSearchTerm] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: '',
    tags: [''],
  })
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    dueDate: '',
    priority: '',
    tags: []
  });

  // Add this function above your return:
  const handleBlur = (e) => {
    const { name, value } = e.target
    let error = ''

    if (name === 'title' && !value.trim()) {
      error = 'Title is required'
    }
    if (name === 'description' && !value.trim()) {
      error = 'Description is required'
    }
    if (name === 'dueDate' && !value) {
      error = 'Due Date is required'
    }
    if (name === 'priority' && !value) {
      error = 'Priority must be selected'
    }

    setFormErrors((prev) => ({
      ...prev,
      [name]: error,
    }))
  }


  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditTagChange = (index, value) => {
    const newTags = [...editForm.tags];
    newTags[index] = value;
    setEditForm((prev) => ({ ...prev, tags: newTags }));
  };

  const handleAddEditTag = () => {
    setEditForm((prev) => ({ ...prev, tags: [...prev.tags, ''] }));
  };

  // call this when Edit button clicked
  const openEditModal = (todo) => {
    setEditForm({
      title: todo.title,
      description: todo.description,
      dueDate: todo.dueDate.split('T')[0],
      priority: todo.priority,
      tags: [...todo.tags],
      _id: todo._id,
    });
    setEditVisible(true);
  };

  const handleEdit = (todo) => {
    setFormData({
      title: todo.title,
      description: todo.description,
      dueDate: todo.dueDate.split('T')[0], // Format for input[type="date"]
      priority: todo.priority,
      tags: [...todo.tags], // clone the array
      _id: todo._id, // if needed for update API
    });
    setVisible(true);
  };



  const handleDelete = async (id) => {
    console.log("Deleting Todo with ID:", id);
    const currentTheme = localStorage.getItem('coreui-free-react-admin-template-theme');
    const isDarkMode = currentTheme === 'dark';

    const confirmation = await Swal.fire({
      title: 'Are you sure?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#e74c3c',
      cancelButtonColor: '#95a5a6',
      background: isDarkMode ? '#1e1e2f' : '#ffffff',
      color: isDarkMode ? '#ffffff' : '#000000'
    });

    if (confirmation.isConfirmed) {
      try {
        const token = localStorage.getItem('Authorization') // Just the raw token
        const bearerToken = `bearer ${token}` // ✅ Add the Bearer prefix

        await axios.post(
          `http://localhost:3009/api/v1/deleteToDo/${id}`,
          {},
          {
            headers: {
              Authorization: bearerToken
            }
          }
        );

        await Swal.fire({
          title: 'Deleted!',
          text: 'Your todo has been deleted.',
          icon: 'success',
          background: isDarkMode ? '#1e1e2f' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#000000',
          confirmButtonColor: isDarkMode ? '#6c757d' : '#3085d6',
        });

        fetchTodos(1);
        // await Swal.fire('Deleted!', 'Your todo has been deleted.', 'success');
        // You can call a function here to refresh the list, like fetchTodos();
      } catch (error) {
        console.error("Delete error:", error);
        await Swal.fire('Error!', 'Something went wrong.', 'error');
      }
    }
  };


  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleTagChange = (index, value) => {
    const updatedTags = [...formData.tags]
    updatedTags[index] = value
    setFormData({ ...formData, tags: updatedTags })
  }

  const handleAddTag = () => {
    setFormData({ ...formData, tags: [...formData.tags, ''] })
  }

  const handleSave = async () => {
    const errors = validateForm(formData)
    setFormErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      const token = localStorage.getItem('Authorization')
      await axios.post(`${API_BASE_URL}/addToDo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })
      toast.success('✅ Todo added successfully!')
      fetchTodos(1)
      setFormData({ title: '', description: '', dueDate: '', priority: '', tags: [''] })
      setVisible(false)
      setFormErrors({})
    } catch (error) {
      console.error('Add Error:', error.response?.data || error.message)
      toast.error(`❌ Failed to add todo`)
    }
  }

  const fetchTodos = async (page = 1) => {
    try {
      const token = localStorage.getItem('Authorization') // Just the raw token
      const bearerToken = `bearer ${token}` // ✅ Add the Bearer prefix

      const res = await axios.get(`${API_BASE_URL}/listToDos?page=${page}&limit=10`, {
        headers: {
          Authorization: bearerToken, // ✅ Correct format: "Bearer <token>"
        },
      })

      console.log('API Response:', res.data)

      const { todos, pagination } = res.data.data
      setTodos(todos)
      setPagination(pagination)
    } catch (err) {
      console.error('API Error:', err)
    }
  }

  useEffect(() => {
    fetchTodos(1)
  }, [])


  const handleSearch = async () => {
    try {
      const token = localStorage.getItem('Authorization');
      const response = await axios.get(`http://localhost:3009/api/v1/searchToDos`, {
        params: {
          title: searchTerm,
          page: 1,
          limit: 10,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log('Search results:', response.data);

      // Assuming response.data.data structure same as fetchTodos
      const { todos, pagination } = response.data.data;

      setTodos(todos);
      setPagination(pagination);
    } catch (error) {
      console.error('Search error:', error.response?.data || error.message);
      toast.error(`❌ Failed to fetch search results`);
    }
  };


  const handlePageChange = (page) => {
    fetchTodos(page)
  }

  const validateForm = (data) => {
    const errors = {}
    if (!data.title.trim()) errors.title = 'Title is required'
    if (!data.description.trim()) errors.description = 'Description is required'
    if (!data.dueDate) errors.dueDate = 'Due Date is required'
    if (!data.priority) errors.priority = 'Priority must be selected'
    return errors
  }

  const submitEditForm = async () => {
    const errors = validateForm(editForm)
    setEditErrors(errors)
    if (Object.keys(errors).length > 0) return

    try {
      const currentTheme = localStorage.getItem('coreui-free-react-admin-template-theme')
      const isDarkMode = currentTheme === 'dark'

      const { _id, ...dataToSend } = editForm
      const token = localStorage.getItem('Authorization')
      await axios.post(`${API_BASE_URL}/editToDo/${_id}`, dataToSend, {
        headers: { Authorization: `Bearer ${token}` },
      })

      Swal.fire({
        title: 'Updated!',
        text: 'Todo has been updated.',
        icon: 'success',
        background: isDarkMode ? '#1e1e2f' : '#ffffff',
        color: isDarkMode ? '#ffffff' : '#000000',
        confirmButtonColor: isDarkMode ? '#6c757d' : '#3085d6',
      })
      setEditVisible(false)
      setEditErrors({})
      fetchTodos(1)
    } catch (err) {
      Swal.fire('Error', 'Update failed', 'error')
    }
  }




  return (
    <CContainer fluid className="mt-4">
      <CRow className="mb-3">
        <CCol>
          <h3>Todo List</h3>
        </CCol>
      </CRow>

      {/* Button to open modal */}
      <CRow className="mb-3">
        <CCol className="d-flex justify-content-end">
          <CButton color="primary" onClick={() => setVisible(true)}>
            Open Modal
          </CButton>
        </CCol>
      </CRow>

      {/* Modal */}
      {/* <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader onClose={() => setVisible(false)}>
          <CModalTitle>Enter Todo</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              className="mb-2"
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleInputChange}
            />
            <CFormTextarea
              className="mb-2"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
            />
            <CFormInput
              className="mb-2"
              type="date"
              name="dueDate"
              placeholder="Due Date"
              value={formData.dueDate}
              onChange={handleInputChange}
            />
            <CFormSelect
              className="mb-2"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
            >
              <option value="">Select Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </CFormSelect>

            <div className="mb-2">
              <strong>Tags:</strong>
              {formData.tags.map((tag, index) => (
                <CFormInput
                  key={index}
                  className="mb-2"
                  type="text"
                  placeholder={`Tag ${index + 1}`}
                  value={tag}
                  onChange={(e) => handleTagChange(index, e.target.value)}
                />
              ))}
              <CButton size="sm" color="info" onClick={handleAddTag}>
                + Add Tag
              </CButton>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={handleSave}>
            Save
          </CButton>
        </CModalFooter>
      </CModal> */}

      <CModal visible={visible} onClose={() => setVisible(false)}>
        <CModalHeader onClose={() => setVisible(false)}>
          <CModalTitle>Enter Todo</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              className="mb-2"
              type="text"
              name="title"
              placeholder="Title"
              value={formData.title}
              onChange={handleInputChange}
              onBlur={handleBlur}
              invalid={!!formErrors.title}
              feedback={formErrors.title}
            />
            <CFormTextarea
              className="mb-2"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleInputChange}
              onBlur={handleBlur}
              invalid={!!formErrors.description}
              feedback={formErrors.description}
            />
            <CFormInput
              className="mb-2"
              type="date"
              name="dueDate"
              placeholder="Due Date"
              value={formData.dueDate}
              onChange={handleInputChange}
              onBlur={handleBlur}
              invalid={!!formErrors.dueDate}
              feedback={formErrors.dueDate}
            />
            <CFormSelect
              className="mb-2"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              onBlur={handleBlur}
              invalid={!!formErrors.priority}
              feedback={formErrors.priority}
            >
              <option value="">Select Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </CFormSelect>

            <div className="mb-2">
              <strong>Tags:</strong>
              {formData.tags.map((tag, index) => (
                <CFormInput
                  key={index}
                  className="mb-2"
                  type="text"
                  placeholder={`Tag ${index + 1}`}
                  value={tag}
                  onChange={(e) => handleTagChange(index, e.target.value)}
                />
              ))}
              <CButton size="sm" color="info" onClick={handleAddTag}>
                + Add Tag
              </CButton>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={handleSave}>Save</CButton>
        </CModalFooter>
      </CModal>


      {/*Edit Modal*/}
      {/* <CModal visible={editVisible} onClose={() => setEditVisible(false)}>
        <CModalHeader onClose={() => setEditVisible(false)}>
          <CModalTitle>Edit Todo</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              className="mb-2"
              type="text"
              name="title"
              placeholder="Title"
              value={editForm.title}
              onChange={handleEditChange}
            />
            <CFormTextarea
              className="mb-2"
              name="description"
              placeholder="Description"
              value={editForm.description}
              onChange={handleEditChange}
            />
            <CFormInput
              className="mb-2"
              type="date"
              name="dueDate"
              value={editForm.dueDate}
              onChange={handleEditChange}
            />
            <CFormSelect
              className="mb-2"
              name="priority"
              value={editForm.priority}
              onChange={handleEditChange}
            >
              <option value="">Select Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </CFormSelect>

            <div className="mb-2">
              <strong>Tags:</strong>
              {editForm.tags.map((tag, index) => (
                <CFormInput
                  key={index}
                  className="mb-2"
                  type="text"
                  placeholder={`Tag ${index + 1}`}
                  value={tag}
                  onChange={(e) => handleEditTagChange(index, e.target.value)}
                />
              ))}
              <CButton size="sm" color="info" onClick={handleAddEditTag}>
                + Add Tag
              </CButton>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditVisible(false)}>
            Close
          </CButton>
          <CButton color="primary" onClick={submitEditForm}>
            Update
          </CButton>
        </CModalFooter>
      </CModal> */}
      <CModal visible={editVisible} onClose={() => setEditVisible(false)}>
        <CModalHeader onClose={() => setEditVisible(false)}>
          <CModalTitle>Edit Todo</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <CForm>
            <CFormInput
              className="mb-2"
              type="text"
              name="title"
              value={editForm.title}
              onChange={handleEditChange}
              invalid={!!editErrors.title}
              feedback={editErrors.title}
            />
            <CFormTextarea
              className="mb-2"
              name="description"
              value={editForm.description}
              onChange={handleEditChange}
              invalid={!!editErrors.description}
              feedback={editErrors.description}
            />
            <CFormInput
              className="mb-2"
              type="date"
              name="dueDate"
              value={editForm.dueDate}
              onChange={handleEditChange}
              invalid={!!editErrors.dueDate}
              feedback={editErrors.dueDate}
            />
            <CFormSelect
              className="mb-2"
              name="priority"
              value={editForm.priority}
              onChange={handleEditChange}
              invalid={!!editErrors.priority}
              feedback={editErrors.priority}
            >
              <option value="">Select Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </CFormSelect>

            <div className="mb-2">
              <strong>Tags:</strong>
              {editForm.tags.map((tag, index) => (
                <CFormInput
                  key={index}
                  className="mb-2"
                  type="text"
                  placeholder={`Tag ${index + 1}`}
                  value={tag}
                  onChange={(e) => handleEditTagChange(index, e.target.value)}
                />
              ))}
              <CButton size="sm" color="info" onClick={handleAddEditTag}>
                + Add Tag
              </CButton>
            </div>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setEditVisible(false)}>Close</CButton>
          <CButton color="primary" onClick={submitEditForm}>Update</CButton>
        </CModalFooter>
      </CModal>



      <CCard className="w-100">
        <CCardBody>
          <CRow className="mb-3 justify-content-end">
            <CCol md="4" className="d-flex gap-2">
              <CFormInput
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <CButton color="primary" onClick={handleSearch}>
                Search
              </CButton>
            </CCol>
          </CRow>

          <CTable striped hover responsive>
            <CTableHead>
              <CTableRow>
                <CTableHeaderCell>Title</CTableHeaderCell>
                <CTableHeaderCell>Description</CTableHeaderCell>
                <CTableHeaderCell>Due Date</CTableHeaderCell>
                <CTableHeaderCell>Priority</CTableHeaderCell>
                <CTableHeaderCell>Tags</CTableHeaderCell>
                <CTableHeaderCell className="text-center">Actions</CTableHeaderCell>
              </CTableRow>
            </CTableHead>
            <CTableBody>
              {todos.map((todo) => (
                <CTableRow key={todo._id}>
                  <CTableDataCell>{todo.title}</CTableDataCell>
                  <CTableDataCell>{todo.description}</CTableDataCell>
                  <CTableDataCell>{new Date(todo.dueDate).toLocaleDateString()}</CTableDataCell>
                  <CTableDataCell>{todo.priority}</CTableDataCell>
                  <CTableDataCell>{todo.tags.join(', ')}</CTableDataCell>
                  <CTableDataCell className="text-center">
                    <CButton color="info" size="sm" onClick={() => openEditModal(todo)}>Edit</CButton>{' '}
                    <CButton color="danger" size="sm" onClick={() => handleDelete(todo._id)}>Delete</CButton>
                  </CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>

          <CRow className="mt-3">
            <CCol className="d-flex justify-content-end">
              <CPagination>
                {/* Previous Button */}
                <CPaginationItem
                  disabled={pagination.currentPage === 1}
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                >
                  &laquo;
                </CPaginationItem>

                {/* Dynamic Page Numbers: max 3 visible */}
                {(() => {
                  const { currentPage, totalPages } = pagination
                  const pages = []

                  let startPage = Math.max(1, currentPage - 1)
                  let endPage = Math.min(totalPages, startPage + 2)

                  // Adjust startPage if near end
                  if (endPage - startPage < 2) {
                    startPage = Math.max(1, endPage - 2)
                  }

                  for (let i = startPage; i <= endPage; i++) {
                    pages.push(
                      <CPaginationItem
                        key={i}
                        active={currentPage === i}
                        onClick={() => handlePageChange(i)}
                      >
                        {i}
                      </CPaginationItem>,
                    )
                  }

                  return pages
                })()}

                {/* Next Button */}
                <CPaginationItem
                  disabled={pagination.currentPage === pagination.totalPages}
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                >
                  &raquo;
                </CPaginationItem>
              </CPagination>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
      <ToastContainer position="top-right" autoClose={3000} />
    </CContainer>
  )
}

export default todoHome
