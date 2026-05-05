import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { ArrowLeft, Trash2 } from 'lucide-react';

const PermissionChange = () => {
    const navigate = useNavigate();

    const goBack = () => navigate('/dashboard');
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        const { data } = await API.get('/admin/users');
        setUsers(data);
    };

    useEffect(() => {
        const loadUsers = async () => {
            const { data } = await API.get('/admin/users');
            setUsers(data);
        };

        loadUsers();
    }, []);

    const handleRoleChange = async (userId, newRole) => {
        await API.put(`/admin/user/${userId}`, { role: newRole });
        fetchUsers();
    };

    const handleDelete = async (userId) => {
        if (window.confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            try {
                await API.delete(`/admin/user/${userId}`); // We will add this backend route next!
                fetchUsers();
            } catch { alert("Error deleting user"); }
        }
    };

    return (
        <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', fontFamily: "'Inter', sans-serif", padding: '30px 24px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
                <button
                    onClick={goBack}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: 'none',
                        background: 'none',
                        color: '#1a4331',
                        cursor: 'pointer',
                        fontWeight: 700,
                        marginBottom: '20px'
                    }}
                >
                    <ArrowLeft size={18} /> Back to dashboard
                </button>

                <div style={{ backgroundColor: '#fff', borderRadius: '24px', padding: '32px', boxShadow: '0 16px 40px rgba(15, 23, 42, 0.08)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                        <h2 style={{ margin: 0, fontSize: '24px', fontWeight: 900, color: '#172131' }}>Permission Change</h2>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 12px' }}>
                            <thead>
                                <tr style={{ textAlign: 'left', color: '#475569', fontSize: '14px' }}>
                                    <th style={{ padding: '14px 16px' }}>Name</th>
                                    <th style={{ padding: '14px 16px' }}>Email</th>
                                    <th style={{ padding: '14px 16px' }}>Role</th>
                                    <th style={{ padding: '14px 16px' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user._id} style={{ backgroundColor: '#f8fafc', borderRadius: '16px', display: 'table-row' }}>
                                        <td style={{ padding: '15px 16px', verticalAlign: 'middle', color: '#0f172a', fontWeight: 600 }}>{user.firstName}</td>
                                        <td style={{ padding: '15px 16px', verticalAlign: 'middle', color: '#475569' }}>{user.email}</td>
                                        <td style={{ padding: '15px 16px', verticalAlign: 'middle' }}>
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user._id, e.target.value)}
                                                style={{ padding: '10px 12px', borderRadius: '10px', border: '1px solid #e2e8f0', minWidth: '160px', backgroundColor: '#fff' }}
                                            >
                                                <option value="customer">Customer</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td style={{ padding: '15px 16px', verticalAlign: 'middle' }}>
                                            <button onClick={() => handleDelete(user._id)} style={{ color: '#dc2626', border: 'none', background: 'none', cursor: 'pointer', display: 'inline-flex', alignItems: 'center' }}>
                                                <Trash2 size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PermissionChange;
