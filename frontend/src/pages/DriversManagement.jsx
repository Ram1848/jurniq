import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { HiOutlineMagnifyingGlass, HiOutlineShieldCheck, HiOutlineLockClosed, HiOutlineTrash, HiOutlineStar } from 'react-icons/hi2';
import * as adminService from '../services/adminService';
import LoadingSkeleton from '../components/common/LoadingSkeleton/LoadingSkeleton';
import toast from 'react-hot-toast';

const statusBadge = { active: 'bg-success/15 text-success', blocked: 'bg-danger/15 text-danger' };
const ITEMS_PER_PAGE = 10;

const DriversManagement = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchDrivers = async () => {
    setLoading(true);
    try {
      const res = await adminService.getAllDrivers(page, ITEMS_PER_PAGE, search);
      setDrivers(res.drivers.data || res.drivers);
      if (res.drivers.totalPages) setTotalPages(res.drivers.totalPages);
    } catch { /* silent */ }
    setLoading(false);
  };

  useEffect(() => { 
    const delayDebounceFn = setTimeout(() => {
      fetchDrivers(); 
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [page, search]);

  const handleBlock = async (id) => {
    setActionLoading(id);
    try { await adminService.blockUser(id); toast.success('Driver suspended'); fetchDrivers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setActionLoading(null);
  };

  const handleActivate = async (id) => {
    setActionLoading(id);
    try { await adminService.activateUser(id); toast.success('Driver activated'); fetchDrivers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setActionLoading(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this driver permanently?')) return;
    setActionLoading(id);
    try { await adminService.deleteUser(id); toast.success('Driver deleted'); fetchDrivers(); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    setActionLoading(null);
  };

  const filtered = drivers
    .filter((d) => statusFilter === 'all' || d.status === statusFilter);

  return (
    <div>
      <h1 className="text-2xl font-bold text-text-primary mb-2">Drivers Management</h1>
      <p className="text-text-secondary text-sm mb-6">Manage all platform drivers</p>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <HiOutlineMagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search drivers..." className="input-field !pl-10 !py-2.5" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <span className="text-sm text-text-secondary self-center">{drivers.length} drivers</span>
      </div>

      {loading ? (
        <LoadingSkeleton height="60px" count={5} />
      ) : drivers.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <p className="text-5xl mb-4">🚗</p>
          <p className="text-lg font-semibold text-text-primary">No drivers found</p>
        </div>
      ) : (
        <>
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 text-text-secondary">
                    {['ID', 'Name', 'Email', 'Vehicle', 'V. Number', 'Rides', 'Rating', 'Status', 'Actions'].map((h) => (
                      <th key={h} className="text-left px-5 py-3 font-medium whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((d) => (
                    <motion.tr key={d.user_id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="border-t border-gray-50 hover:bg-gray-50/50">
                      <td className="px-5 py-3.5 font-medium text-text-primary">{d.user_id}</td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-primary flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">{d.full_name?.[0]?.toUpperCase()}</span>
                          </div>
                          <span className="text-text-primary font-medium">{d.full_name}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-text-secondary">{d.email}</td>
                      <td className="px-5 py-3.5 capitalize text-text-secondary">{d.vehicle_type}</td>
                      <td className="px-5 py-3.5 text-text-secondary">{d.vehicle_number}</td>
                      <td className="px-5 py-3.5 text-text-primary font-medium">{d.total_rides}</td>
                      <td className="px-5 py-3.5">
                        <span className="flex items-center gap-1 text-text-primary">
                          <HiOutlineStar className="w-4 h-4 text-warning" />
                          {parseFloat(d.avg_rating).toFixed(1) > 0 ? parseFloat(d.avg_rating).toFixed(1) : 'N/A'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${statusBadge[d.status] || statusBadge.active}`}>
                          {d.status || 'active'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1">
                          {d.status === 'blocked' ? (
                            <button onClick={() => handleActivate(d.user_id)} disabled={actionLoading === d.user_id}
                              className="p-1.5 text-success hover:bg-success/10 rounded-lg transition-colors" title="Activate">
                              <HiOutlineShieldCheck className="w-4 h-4" />
                            </button>
                          ) : (
                            <button onClick={() => handleBlock(d.user_id)} disabled={actionLoading === d.user_id}
                              className="p-1.5 text-warning hover:bg-warning/10 rounded-lg transition-colors" title="Suspend">
                              <HiOutlineLockClosed className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => handleDelete(d.user_id)} disabled={actionLoading === d.user_id}
                            className="p-1.5 text-danger hover:bg-danger/10 rounded-lg transition-colors" title="Delete">
                            <HiOutlineTrash className="w-4 h-4" />
                          </button>
                        </div>
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

export default DriversManagement;
