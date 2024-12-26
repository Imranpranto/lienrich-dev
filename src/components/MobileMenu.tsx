import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useServices } from '../contexts/ServicesContext';
import Logo from './Logo';

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { services } = useServices();
  const location = useLocation();

  const mainMenuItems = [
    { label: 'Dashboard', to: '/' },
    { label: 'Operations', to: '/services' },
    { label: 'Integrations', to: '/integrations' },
    { label: 'Analytics', to: '/analytics' },
    { label: 'Settings', to: '/settings' },
  ];

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 text-gray-600 hover:text-gray-900 focus:outline-none"
        aria-label="Open menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-sm">
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-100">
              <Logo variant="small" />
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-gray-500 hover:text-gray-700 focus:outline-none"
                aria-label="Close menu"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="px-4 py-6">
              <ul className="space-y-4">
                {mainMenuItems.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className={`block px-4 py-2 text-base font-medium rounded-lg ${
                        location.pathname === item.to
                          ? 'bg-indigo-50 text-indigo-600'
                          : 'text-gray-900 hover:bg-gray-50'
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <h3 className="px-4 text-sm font-medium text-gray-500 uppercase">Available Operations</h3>
                <ul className="mt-4 space-y-4">
                  {services.map((service) => (
                    <li key={service.id}>
                      <Link
                        to={service.path || `/service/${service.id}`}
                        className={`block px-4 py-2 text-base font-medium rounded-lg ${
                          location.pathname === (service.path || `/service/${service.id}`)
                            ? 'bg-indigo-50 text-indigo-600'
                            : 'text-gray-900 hover:bg-gray-50'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {service.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}