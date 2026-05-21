import { useTranslation } from 'react-i18next';
import './StatusBadge.css';

const StatusBadge = ({ status }) => {
  const { t } = useTranslation();
  const getStatusClass = (status) => {
    switch (status?.toUpperCase()) {
      case 'PENDING': return 'status-pending';
      case 'PROCESSING': return 'status-processing';
      case 'SHIPPED': return 'status-shipped';
      case 'DELIVERED': return 'status-delivered';
      case 'CANCELLED': return 'status-cancelled';
      default: return 'status-default';
    }
  };

  return (
    <span className={`status-badge ${getStatusClass(status)}`}>
      {t(`${status?.toLowerCase()}_status`)}
    </span>
  );
};

export default StatusBadge;
