import socket, { connectSocket } from '../services/socket';
import React, { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import DataTable from '../components/DataTable';
import ProductCard from '../components/ProductCard';
import './AdminDashboard.css';

// Constants for initial form states
const EMPTY_PRODUCT = { name: '', category: '', price: '', imageUrl: '', description: '' };
const EMPTY_USER = { firstName: '', lastName: '', email: '', userRole: 'user', password: '' };

/**
 * AdminDashboard component for managing site inventory and user accounts.
 * Provides CRUD operations for products and user management functionalities.
 */
const AdminDashboard = () => {
    // Helper function to show elegant banners matching the client-side style exactly
    const showSuccessBanner = (message) => {
      if (typeof window !== 'undefined') {
        const banner = document.createElement('div');
        banner.textContent = `${message.toUpperCase()} ✓`;
        Object.assign(banner.style, {
          position: 'fixed',
          bottom: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#1c1c1c', // Deep charcoal black from customer layout
          color: '#ffffff',
          padding: '16px 32px',
          borderRadius: '0px', // Square clean edges
          zIndex: 9999,
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          fontFamily: "'Montserrat', 'Helvetica Neue', sans-serif",
          letterSpacing: '2px', // Tracking spacing matching the client catalog
          fontSize: '13px',
          fontWeight: '500',
          textAlign: 'center',
          minWidth: '320px'
        });
        document.body.appendChild(banner);
        setTimeout(() => {
          banner.style.opacity = '0';
          banner.style.transition = 'opacity 0.4s ease';
          setTimeout(() => banner.remove(), 400);
        }, 3500);
      }
    };

    useEffect(() => {
      connectSocket();
      const onNewOrder = (order) => {
        console.log('🆕 order:new', order);
        if (typeof window !== 'undefined') {
          const banner = document.createElement('div');
          banner.textContent = `NEW ORDER #${order.id} – ${order.total}₪ ✓`;
          Object.assign(banner.style, {
            position: 'fixed',
            bottom: '90px',
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#1c1c1c',
            color: '#fff',
            padding: '16px 32px',
            borderRadius: '0px',
            zIndex: 9999,
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
            fontFamily: "'Montserrat', sans-serif",
            letterSpacing: '2px',
            fontSize: '13px',
            minWidth: '320px',
            textAlign: 'center'
          });
          document.body.appendChild(banner);
          setTimeout(() => banner.remove(), 4500);
        }
      };
      socket.on('order:new', onNewOrder);
      return () => socket.off('order:new', onNewOrder);
    }, []);


  const [activeTab, setActiveTab] = useState('inventory');
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  // Modal and form state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState(null); // 'product' | 'user'
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({});

  const user = JSON.parse(localStorage.getItem('user'));

  // Fetch product list
  const fetchProducts = useCallback(async () => {
    try {
      const res = await api.get('/products');
      setProducts(res.data.data || res.data);
    } catch (err) { console.error('Error fetching products:', err); }
  }, []);

  // Fetch user list
  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get('/users');
      setUsers(res.data.data || res.data);
    } catch (err) { console.error('Error fetching users:', err); }
  }, []);

  useEffect(() => {
    if (!user || user.userRole !== 'admin') return;
    if (activeTab === 'inventory') fetchProducts();
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, fetchProducts, fetchUsers, user]);

  // Guard: Restrict access to admin only
  if (!user || user.userRole !== 'admin') {
    return <h1 style={{ padding: '20px' }}>You do not have access to this page.</h1>;
  }

  // --- Modal Handlers ---

  const openAdd = (type) => {
    setModalType(type);
    setEditingId(null);
    setFormData(type === 'product' ? { ...EMPTY_PRODUCT } : { ...EMPTY_USER });
    setModalOpen(true);
  };

  const openEdit = (type, row) => {
    setModalType(type);
    setEditingId(type === 'user' ? (row.id || row.userId) : (row._id || row.id));

    if (type === 'product') {
      setFormData({
        name: row.name || '',
        category: row.category || '',
        price: row.price ?? '',
        imageUrl: row.imageUrl || '',
        description: row.description || '',
      });
    } else {
      const fullName = (row.name || '').trim().split(' ');
      setFormData({
        firstName: row.firstName || fullName[0] || '',
        lastName: row.lastName || fullName.slice(1).join(' ') || '',
        email: row.email || '',
        userRole: row.role || row.userRole || 'customer',
        password: '',
      });
    }

    setModalOpen(true);
  };


  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormData({});
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- API Handlers ---

  const buildPayload = () => {
    if (modalType === 'product') {
      return {
        name: (formData.name || '').trim(),
        category: (formData.category || '').trim(),
        price: Number(formData.price),
        imageUrl: (formData.imageUrl || '').trim(),
        description: (formData.description || '').trim(),
      };
    }
    const payload = {
      name: `${(formData.firstName || '').trim()} ${(formData.lastName || '').trim()}`.trim(),
      email: (formData.email || '').trim(),
      role: formData.userRole === 'logistics' ? 'logistics' : 'customer',
    };
    if (formData.password?.length > 0) payload.password = formData.password;
    return payload;
    };


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = modalType === 'product' ? '/products' : '/users';
      const payload = buildPayload();

      if (editingId) {
        await api.put(`${endpoint}/${editingId}`, payload);
        showSuccessBanner(modalType === 'product' ? 'product updated successfully' : 'user updated successfully');
      } else {
        await api.post(endpoint, payload);
        showSuccessBanner(modalType === 'product' ? 'new product added to collection' : 'new user created successfully');
      }
      closeModal();
      modalType === 'product' ? fetchProducts() : fetchUsers();
    } catch (err) {
      const errorMsg = err.response?.data?.error?.message || 'Action failed.';
      alert(errorMsg);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      const endpoint = type === 'product' ? '/products' : '/users';
      await api.delete(`${endpoint}/${id}`);
      showSuccessBanner(type === 'product' ? 'product removed from database' : 'user deleted from database');
      type === 'product' ? fetchProducts() : fetchUsers();
    } catch (err) {
      alert('Delete operation failed.');
    }
  };
const userColumns = [
    { header: 'Name', field: 'name' },
    { header: 'Email', field: 'email' },
    { header: 'Role', field: 'role' },
];

  return (
    <div className="admin-container">
      <h1 className="admin-title">Admin Dashboard</h1>

      {/* Tab Navigation */}
      <div className="admin-tabs">
        <button className={`admin-tab ${activeTab === 'inventory' ? 'is-active' : ''}`} onClick={() => setActiveTab('inventory')}>Products</button>
        <button className={`admin-tab ${activeTab === 'users' ? 'is-active' : ''}`} onClick={() => setActiveTab('users')}>Users</button>
      </div>

      <div className="tab-content">
        {/* Inventory View */}
        {activeTab === 'inventory' && (
          <>
            <div className="section-header">
              <h2>Inventory</h2>
              <button className="admin-btn admin-btn--primary" onClick={() => openAdd('product')}>+ Add Product</button>
            </div>
            <div className="admin-products-grid">
              {products.map((p) => (
                <div key={p._id || p.id} className="admin-product-wrap">
                  <ProductCard product={p} variant="full" flippable={false} />
                  <div className="admin-product-actions">
                    <button className="admin-btn admin-btn--ghost" onClick={() => openEdit('product', p)}>Edit</button>
                    <button className="admin-btn admin-btn--danger" onClick={() => handleDelete('product', p._id || p.id)}>Delete</button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* User Management View */}
        {activeTab === 'users' && (
          <>
            <div className="section-header">
              <h2>User Management</h2>
              <button className="admin-btn admin-btn--primary" onClick={() => openAdd('user')}>+ Add User</button>
            </div>
            <div className="admin-users-table-wrap">
              <DataTable
                data={users}
                columns={userColumns}
                onDelete={(id, row) => (row?.userRole === 'admin') ? null : handleDelete('user', id)}
                onEdit={(row) => openEdit('user', row)}
                canDelete={(row) => row?.userRole !== 'admin'}
              />
            </div>
          </>
        )}
      </div>

      {/* Modal Overlay */}
      {modalOpen && (
        <div className="admin-modal-overlay" onClick={closeModal}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="admin-modal-title">{editingId ? 'Edit ' : 'Add '}{modalType === 'product' ? 'Product' : 'User'}</h3>
            <form className="admin-form" onSubmit={handleSubmit} autoComplete="off">
              {/* Security: Prevent autofill */}
              <input type="text" name="prevent_autofill" style={{ display: 'none' }} autoComplete="username" />
              <input type="password" name="prevent_password" style={{ display: 'none' }} autoComplete="new-password" />

              {modalType === 'product' ? (
                <>
                  <label>Name<input name="name" value={formData.name || ''} onChange={handleChange} required /></label>
                  <label>Category<input name="category" value={formData.category || ''} onChange={handleChange} required /></label>
                  <label>Price<input name="price" type="number" step="0.01" value={formData.price ?? ''} onChange={handleChange} required /></label>
                  <label>Image URL<input name="imageUrl" value={formData.imageUrl || ''} onChange={handleChange} /></label>
                  <label>Description<textarea name="description" value={formData.description || ''} onChange={handleChange} /></label>
                </>
              ) : (
                <>
                  <label>First Name<input name="firstName" value={formData.firstName || ''} onChange={handleChange} required /></label>
                  <label>Last Name<input name="lastName" value={formData.lastName || ''} onChange={handleChange} required /></label>
                  <label>Email<input name="email" type="email" value={formData.email || ''} onChange={handleChange} required readOnly onFocus={(e) => e.target.removeAttribute('readonly')} /></label>
                  <label>Role
                    <select name="userRole" value={formData.userRole || 'user'} onChange={handleChange} disabled={formData.userRole === 'admin'}>
                      <option value="customer">customer</option>
                      <option value="logistics">logistics</option>
                    </select>
                  </label>
                  {!editingId && (
                    <label>Password<input name="password" type="password" value={formData.password || ''} onChange={handleChange} required autoComplete="new-password" /></label>
                  )}
                </>
              )}
              <div className="admin-modal-actions">
                <button type="button" className="admin-btn admin-btn--ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="admin-btn admin-btn--primary">{editingId ? 'Save Changes' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;