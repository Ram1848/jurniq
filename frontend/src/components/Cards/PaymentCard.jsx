import { HiOutlineCreditCard, HiOutlineBanknotes, HiOutlineDevicePhoneMobile } from 'react-icons/hi2';

const PaymentCard = ({ method, selected, onClick }) => {
  const config = {
    card: { icon: HiOutlineCreditCard, label: 'Credit/Debit Card', desc: 'Powered by Stripe' },
    upi: { icon: HiOutlineDevicePhoneMobile, label: 'UPI / NetBanking', desc: 'Instant transfer' },
    cash: { icon: HiOutlineBanknotes, label: 'Cash', desc: 'Pay driver directly' },
  };

  const { icon: Icon, label, desc } = config[method];

  return (
    <div
      onClick={onClick}
      className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer overflow-hidden ${
        selected
          ? 'border-primary bg-primary/5 shadow-md shadow-primary/10'
          : 'border-transparent bg-surface hover:bg-gray-50'
      }`}
    >
      <div className="flex items-center gap-4 relative z-10">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
          selected ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-gray-100 text-text-secondary'
        }`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className={`font-bold ${selected ? 'text-text-primary' : 'text-text-secondary'}`}>{label}</h4>
          <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
        </div>
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
          selected ? 'border-primary' : 'border-gray-300'
        }`}>
          {selected && <div className="w-3 h-3 rounded-full bg-primary" />}
        </div>
      </div>
      
      {/* Background decoration for selected state */}
      {selected && (
        <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
      )}
    </div>
  );
};

export default PaymentCard;
