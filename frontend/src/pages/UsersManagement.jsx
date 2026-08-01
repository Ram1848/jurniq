import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { HiOutlineMagnifyingGlass, HiOutlineShieldCheck, HiOutlineLockClosed, HiOutlineTrash } from 'react-icons/hi2';
import * as adminService from '../services/adminService';
import LoadingSkeleton from '../components/common/LoadingSkeleton/LoadingSkeleton';
import toast from 'react-hot-toast';

const roleBadge = { rider: 'bg-primary/15 text-primary', driver: 'bg-accent/15 text-accent', admin: 'bg-danger/15 text-danger' };
const statusBadge = { active: 'bg-success/15 text-success', blocked: 'bg-danger/15 text-danger' };
const ITEMS_PER_PAGE = 10;

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllUsers(page, ITEMS_PER_PAGE, search);
      setUsers(res.users.data || res.users);
      if (res.users.totalPages) setTotalPages(res.users.totalPages);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { 
    // Debounce search
    const delayDebounceFn = setTimeout(() => {
      fetchUsers(); 
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [page, search]);

  const handleBlock = async (id) => {
    setActionLoading(id);
    try { await adminService.blockUser(id); toast.success('User blocked'); fetchUsers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setActionLoading(null);
  };

  const handleActivate = async (id) => {
    setActionLoading(id);
    try { await adminService.activateUser(id); toast.success('User activated'); fetchUsers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setActionLoading(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    setActionLoading(id);
    try { await adminService.deleteUser(id); toast.success('User deleted'); fetchUsers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setActionLoading(null);
  };

  const filtered = users
    .filter((u) => roleFilter === 'all' || u.role === roleFilter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Users Management</h1>
      <p className="text-text-secondary text-sm mb-6">Manage all platform users</p>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex gap-2 flex-wrap">
          {['all', 'rider', 'driver', 'admin'].map((r) => (
            <button
              key={r}
              onClick={() => { setRoleFilter(r); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
                roleFilter === r ? 'bg-primary text-white' : 'bg-white border border-gray-200 text-text-secondary hover:bg-gray-100'
              }`}
            >{r}</button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by name or email..." className="input-field !pl-10 !py-2.5" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton height="60px" count={6} />
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-5xl mb-4">👥</p>
          <p className="text-lg font-semibold text-text-primary">No users found</p>
        </div>
      ) : (
        <>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-text-secondary">
                    {['ID', 'Name', 'Email', 'Phone', 'Role', 'Status', 'Joined', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u) => (
                    <motion.tr key={u.user_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-5 py-3.5 font-medium text-text-primary">{u.user_id}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
                            <span className="text-white text-xs font-semibold">{u.full_name?.[0]?.toUpperCase()}</span>
                          </div>
                          <span className="text-text-primary font-medium">{u.full_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary">{u.email}</td>
                      <td className="px-5 py-3.5 text-text-secondary">{u.phone}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${roleBadge[u.role] || ''}`}>{u.role}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusBadge[u.status] || statusBadge.active}`}>{u.status || 'active'}</span>
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary whitespace-nowrap">{new Date(u.created_at).toLocaleDateString()}</td>
                      <td className="px-5 py-3.5">
                        {u.role !== 'admin' && (
                          <div className="flex items-center gap-1">
                            {u.status === 'blocked' ? (
                              <button onClick={() => handleActivate(u.user_id)} disabled={actionLoading === u.user_id}
                                className="p-1.5 text-success hover:bg-success/10 rounded-lg transition-colors" title="Activate">
                                <HiOutlineShieldCheck className="w-4 h-4" />
                              </button>
                            ) : (
                              <button onClick={() => handleBlock(u.user_id)} disabled={actionLoading === u.user_id}
                                className="p-1.5 text-warning hover:bg-warning/10 rounded-lg transition-colors" title="Block">
                                <HiOutlineLockClosed className="w-4 h-4" />
                              </button>
                            )}
                            <button onClick={() => handleDelete(u.user_id)} disabled={actionLoading === u.user_id}
                              className="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors" title="Delete">
                              <HiOutlineTrash className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-6">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 disabled:opacity-40">Previous</button>
              <span className="text-sm text-text-secondary">Page {page} of {totalPages}</span>
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-white border border-gray-200 disabled:opacity-40">Next</button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UsersManagement;
