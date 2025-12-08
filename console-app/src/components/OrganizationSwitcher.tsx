import { useState, useRef, useEffect } from 'react';
import { useOrganization } from '@/contexts/OrganizationContext';
import { Building, Check, ChevronDown, Plus } from 'lucide-react';

export default function OrganizationSwitcher() {
  const { currentOrganization, organizations, switchOrganization } = useOrganization();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!currentOrganization) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 rounded-lg transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {currentOrganization.logoUrl ? (
            <img
              src={currentOrganization.logoUrl}
              alt={currentOrganization.name}
              className="h-8 w-8 rounded-lg object-cover flex-shrink-0"
            />
          ) : (
            <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
              <Building className="h-4 w-4 text-purple-600" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {currentOrganization.name}
            </p>
            <p className="text-xs text-gray-500 capitalize">
              {currentOrganization.plan} plan
            </p>
          </div>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 flex-shrink-0 transition-transform ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 max-h-64 overflow-y-auto">
          <div className="px-3 py-2 border-b border-gray-100">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Your Organizations
            </p>
          </div>

          {organizations.map((membership) => (
            <button
              key={membership.organization.id}
              onClick={() => {
                switchOrganization(membership.organization.id);
                setIsOpen(false);
              }}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {membership.organization.logoUrl ? (
                  <img
                    src={membership.organization.logoUrl}
                    alt={membership.organization.name}
                    className="h-8 w-8 rounded-lg object-cover flex-shrink-0"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <Building className="h-4 w-4 text-gray-600" />
                  </div>
                )}
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {membership.organization.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">
                    {membership.role}
                  </p>
                </div>
              </div>
              {currentOrganization.id === membership.organization.id && (
                <Check className="h-4 w-4 text-purple-600 flex-shrink-0" />
              )}
            </button>
          ))}

          <div className="border-t border-gray-100 mt-2 pt-2">
            <button
              onClick={() => {
                // Navigate to create new organization
                window.location.href = '/auth/signup?step=organization';
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2 hover:bg-gray-50 transition-colors text-left"
            >
              <div className="h-8 w-8 rounded-lg bg-purple-50 flex items-center justify-center flex-shrink-0">
                <Plus className="h-4 w-4 text-purple-600" />
              </div>
              <span className="text-sm font-medium text-gray-900">
                Create Organization
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}