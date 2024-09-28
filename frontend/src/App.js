import React, { useEffect, useState } from 'react';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import { Provider, useDispatch, useSelector } from 'react-redux';
// import thunk from 'redux-thunk';
import { thunk } from 'redux-thunk';
import axios from 'axios';
import { Table, Button, Modal, Form } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

// Action Types
const FETCH_USERS = 'FETCH_USERS';
const ADD_USER = 'ADD_USER';
const EDIT_USER = 'EDIT_USER';
const DELETE_USER = 'DELETE_USER';

// Actions
const fetchUsers = () => async (dispatch) => {
  const response = await axios.get('https://jsonplaceholder.typicode.com/users');
  dispatch({ type: FETCH_USERS, payload: response.data });
};

const addUser = (user) => ({
  type: ADD_USER,
  payload: user,
});

const editUser = (user) => ({
  type: EDIT_USER,
  payload: user,
});

const deleteUser = (id) => ({
  type: DELETE_USER,
  payload: id,
});

// Reducer
const usersReducer = (state = { users: [] }, action) => {
  switch (action.type) {
    case FETCH_USERS:
      return { ...state, users: action.payload };
    case ADD_USER:
      return { ...state, users: [...state.users, action.payload] };
    case EDIT_USER:
      return {
        ...state,
        users: state.users.map(user =>
          user.id === action.payload.id ? action.payload : user
        ),
      };
    case DELETE_USER:
      return {
        ...state,
        users: state.users.filter(user => user.id !== action.payload),
      };
    default:
      return state;
  }
};

// Store setup
const rootReducer = combineReducers({
  usersReducer,
});
const store = createStore(rootReducer, applyMiddleware(thunk));

// UsersTable Component
const UsersTable = () => {
  const dispatch = useDispatch();
  const users = useSelector((state) => state.usersReducer.users);
  const [show, setShow] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [userForm, setUserForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    address: { city: '', zipcode: '' },
  });

  useEffect(() => {
    dispatch(fetchUsers());
  }, [dispatch]);

  const handleDelete = (id) => {
    dispatch(deleteUser(id));
  };

  const handleShowModal = (user = {}) => {
    setEditMode(!!user.id);
    setUserForm(user.id ? user : { id: '', name: '', email: '', phone: '', address: { city: '', zipcode: '' } });
    setShow(true);
  };

  const handleSave = () => {
    if (editMode) {
      dispatch(editUser(userForm));
    } else {
      dispatch(addUser({ ...userForm, id: users.length + 1 }));
    }
    setShow(false);
  };

  return (
    <>
      <Button variant="primary" onClick={() => handleShowModal()}>Add User</Button>
      <Table striped bordered hover className="mt-3">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>City</th>
            <th>Zip Code</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.phone}</td>
              <td>{user.address.city}</td>
              <td>{user.address.zipcode}</td>
              <td>
                <Button variant="warning" onClick={() => handleShowModal(user)}>Edit</Button>{' '}
                <Button variant="danger" onClick={() => handleDelete(user.id)}>Delete</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {/* Modal for Add/Edit User */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editMode ? 'Edit User' : 'Add User'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Name</Form.Label>
              <Form.Control
                type="text"
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="text"
                value={userForm.phone}
                onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>City</Form.Label>
              <Form.Control
                type="text"
                value={userForm.address.city}
                onChange={(e) => setUserForm({ ...userForm, address: { ...userForm.address, city: e.target.value } })}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Zip Code</Form.Label>
              <Form.Control
                type="text"
                value={userForm.address.zipcode}
                onChange={(e) => setUserForm({ ...userForm, address: { ...userForm.address, zipcode: e.target.value } })}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShow(false)}>Close</Button>
          <Button variant="primary" onClick={handleSave}>Save Changes</Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

// App Component
const App = () => (
  <Provider store={store}>
    <div className="container mt-5">
      <h1>User Management</h1>
      <UsersTable />
    </div>
  </Provider>
);

export default App;
