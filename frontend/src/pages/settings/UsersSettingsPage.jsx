import React, { useEffect, useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card } from '../../components/ui/Card';
import { useAuthStore } from '../../store/authStore';
import api from '../../utils/api';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../hooks/useToast';

export const UsersSettingsPage = () => {
  const { user } = useAuthStore();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users');
      setUsers(res.data.data);
    } catch (err) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: newRole });
      toast.success('Success', 'User role updated successfully');
      fetchUsers(); // refresh list
    } catch (err) {
      toast.error('Error', err.response?.data?.message || 'Failed to update role');
    }
  };

  if (user?.role !== 'manager') {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="View and manage user roles and access."
      />

      <Card>
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 rounded-t-xl">
          <h2 className="font-semibold text-slate-800">All Users</h2>
        </div>
        
        {loading ? (
          <div className="p-8 text-center text-slate-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Current Role</th>
                  <th className="px-4 py-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-medium text-slate-800">{u.name}</td>
                    <td className="px-4 py-3 text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        u.role === 'manager' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 w-48">
                      {u._id !== user._id ? (
                        <Select
                          options={[
                            { value: 'manager', label: 'Manager' },
                            { value: 'staff', label: 'Staff' }
                          ]}
                          value={u.role}
                          onChange={(e) => handleRoleChange(u._id, e.target.value)}
                        />
                      ) : (
                        <span className="text-xs text-slate-400 italic">Current User</span>
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
