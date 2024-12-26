import React from 'react';
import { useNavigate } from 'react-router-dom';
import ServiceCard from './ServiceCard';
import { useServices } from '../contexts/ServicesContext';
import { useOperationAccess } from '../hooks/useOperationAccess';
import type { Service } from '../contexts/ServicesContext';

export default function ServicesGrid() {
  const { services } = useServices();
  const navigate = useNavigate();
  const { checkAccess } = useOperationAccess();

  const handleServiceClick = (service: Service) => {
    const operationId = service.path?.replace('/', '') || service.id;
    if (checkAccess(operationId)) {
      navigate(service.path || `/service/${service.id}`);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[200px]">
      {services.map((service) => (
        <ServiceCard 
          key={service.id} 
          {...service} 
          onClick={() => handleServiceClick(service)}
        />
      ))}
    </div>
  );
}