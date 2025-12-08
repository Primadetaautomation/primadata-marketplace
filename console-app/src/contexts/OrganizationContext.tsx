import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  website: string | null;
  plan: 'free' | 'starter' | 'professional' | 'enterprise';
  isActive: boolean;
  apiKey: string;
}

interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: 'owner' | 'admin' | 'recruiter' | 'viewer';
  organization: Organization;
}

interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: OrganizationMember[];
  userRole: 'owner' | 'admin' | 'recruiter' | 'viewer' | null;
  loading: boolean;
  switchOrganization: (orgId: string) => void;
  refreshOrganizations: () => Promise<void>;
  canPerform: (action: string) => boolean;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<OrganizationMember[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [userRole, setUserRole] = useState<'owner' | 'admin' | 'recruiter' | 'viewer' | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserOrganizations();
    } else {
      setOrganizations([]);
      setCurrentOrganization(null);
      setUserRole(null);
      setLoading(false);
    }
  }, [user]);

  const fetchUserOrganizations = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Fetch all organizations the user is a member of
      const { data: memberships, error } = await supabase
        .from('organization_members')
        .select(`
          id,
          organizationId:organization_id,
          userId:user_id,
          role,
          organization:organizations (
            id,
            name,
            slug,
            logoUrl:logo_url,
            website,
            plan,
            isActive:is_active,
            apiKey:api_key
          )
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (error) throw error;

      const orgs = (memberships || []) as any as OrganizationMember[];
      setOrganizations(orgs);

      // Get saved organization preference from localStorage
      const savedOrgId = localStorage.getItem('currentOrganizationId');
      let selectedOrg: OrganizationMember | undefined;

      if (savedOrgId) {
        selectedOrg = orgs.find((m) => m.organization.id === savedOrgId);
      }

      // If no saved preference or not found, use first organization
      if (!selectedOrg && orgs.length > 0) {
        selectedOrg = orgs[0];
      }

      if (selectedOrg) {
        setCurrentOrganization(selectedOrg.organization);
        setUserRole(selectedOrg.role);
        localStorage.setItem('currentOrganizationId', selectedOrg.organization.id);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const switchOrganization = (orgId: string) => {
    const membership = organizations.find((m) => m.organization.id === orgId);
    if (membership) {
      setCurrentOrganization(membership.organization);
      setUserRole(membership.role);
      localStorage.setItem('currentOrganizationId', orgId);
    }
  };

  const refreshOrganizations = async () => {
    await fetchUserOrganizations();
  };

  // Permission checker
  const canPerform = (action: string): boolean => {
    if (!userRole) return false;

    const permissions = {
      owner: ['*'], // Can do everything
      admin: [
        'manage_team',
        'manage_settings',
        'create_campaign',
        'delete_campaign',
        'manage_candidates',
        'send_outreach',
        'view_analytics',
      ],
      recruiter: [
        'create_campaign',
        'manage_candidates',
        'send_outreach',
        'view_analytics',
      ],
      viewer: ['view_analytics'],
    };

    const rolePermissions = permissions[userRole];

    // Owner can do everything
    if (rolePermissions.includes('*')) return true;

    // Check specific permission
    return rolePermissions.includes(action);
  };

  const value = {
    currentOrganization,
    organizations,
    userRole,
    loading,
    switchOrganization,
    refreshOrganizations,
    canPerform,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}