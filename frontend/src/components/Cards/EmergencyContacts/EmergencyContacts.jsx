import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { HiOutlineUserPlus, HiOutlineTrash, HiOutlinePhone, HiOutlineEnvelope } from 'react-icons/hi2';
import api from '../../../services/api';
import toast from 'react-hot-toast';
import LoadingSkeleton from '../../common/LoadingSkeleton/LoadingSkeleton';

const EmergencyContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState({ contact_name: '', relationship: '', phone: '', email: '' });
  const [addingLoading, setAddingLoading] = useState(false);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/sos/contacts');
      setContacts(res.data.contacts);
    } catch (err) {
      toast.error('Failed to load emergency contacts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!formData.contact_name || !formData.phone) {
      toast.error('Name and Phone are required');
      return;
    }
    setAddingLoading(true);
    try {
      const res = await api.post('/sos/contacts', formData);
      setContacts([...contacts, res.data.contact]);
      setIsAdding(false);
      setFormData({ contact_name: '', relationship: '', phone: '', email: '' });
      toast.success('Emergency contact added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add contact');
    } finally {
      setAddingLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/sos/contacts/${id}`);
      setContacts(contacts.filter(c => c.contact_id !== id));
      toast.success('Contact removed');
    } catch (err) {
      toast.error('Failed to remove contact');
    }
  };

  return (
    <div className="glass-card p-6 sm:p-8 mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
            🚨 Emergency Contacts
          </h2>
          <p className="text-sm text-text-secondary mt-1">Trusted people to notify during an SOS.</p>
        </div>
        {!isAdding && (
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-danger/10 text-danger hover:bg-danger/20 rounded-xl font-semibold transition-colors text-sm"
          >
            <HiOutlineUserPlus className="w-4 h-4" /> Add
          </button>
        )}
      </div>

      {isAdding && (
        <motion.form 
          initial={{ opacity: 0, height: 0 }} 
          animate={{ opacity: 1, height: 'auto' }} 
          className="mb-6 bg-surface p-4 rounded-xl border border-gray-100"
          onSubmit={handleAdd}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Name *</label>
              <input type="text" className="input-field w-full text-sm" value={formData.contact_name} onChange={e => setFormData({...formData, contact_name: e.target.value})} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Relationship</label>
              <input type="text" className="input-field w-full text-sm" value={formData.relationship} onChange={e => setFormData({...formData, relationship: e.target.value})} placeholder="e.g. Brother" />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Phone *</label>
              <input type="text" className="input-field w-full text-sm" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} required />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">Email</label>
              <input type="email" className="input-field w-full text-sm" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary">Cancel</button>
            <button type="submit" disabled={addingLoading} className="px-4 py-2 text-sm font-medium bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50">
              {addingLoading ? 'Adding...' : 'Save Contact'}
            </button>
          </div>
        </motion.form>
      )}

      {loading ? (
        <LoadingSkeleton height="60px" count={2} />
      ) : contacts.length === 0 ? (
        <div className="text-center py-8 bg-surface rounded-xl border border-dashed border-gray-200">
          <p className="text-text-secondary text-sm">No emergency contacts added yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {contacts.map(contact => (
            <div key={contact.contact_id} className="flex items-center justify-between p-4 rounded-xl bg-surface border border-transparent hover:border-gray-200 transition-colors">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-text-primary">{contact.contact_name}</h4>
                  {contact.relationship && <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">{contact.relationship}</span>}
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-text-secondary">
                  <span className="flex items-center gap-1"><HiOutlinePhone className="w-3.5 h-3.5" /> {contact.phone}</span>
                  {contact.email && <span className="flex items-center gap-1"><HiOutlineEnvelope className="w-3.5 h-3.5" /> {contact.email}</span>}
                </div>
              </div>
              <button 
                onClick={() => handleDelete(contact.contact_id)}
                className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 rounded-lg transition-colors"
              >
                <HiOutlineTrash className="w-5 h-5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmergencyContacts;
