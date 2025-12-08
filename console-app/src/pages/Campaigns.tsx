import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Plus,
  Target,
  Users,
  Mail,
  Calendar,
  TrendingUp,
  Play,
  Pause,
  Edit,
  Trash2,
  ChevronRight,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import api from '@/lib/api';
import { cn, formatDate } from '@/lib/utils';

interface Campaign {
  id: string;
  name: string;
  companyName: string;
  jobTitle: string;
  jobDescription: string;
  targetCriteria: any;
  isActive: boolean;
  candidatesCount: number;
  emailsSent: number;
  repliesReceived: number;
  createdAt: string;
  updatedAt: string;
}

export default function Campaigns() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    companyName: '',
    jobTitle: '',
    jobDescription: '',
    targetCriteria: {
      keywords: [],
      skills: [],
      minExperience: 0,
      locations: []
    }
  });

  // Fetch campaigns
  const { data: campaigns, isLoading, refetch } = useQuery<Campaign[]>({
    queryKey: ['campaigns'],
    queryFn: async () => {
      const response = await api.campaigns.list();
      return response || [];
    }
  });

  // Create campaign mutation
  const createMutation = useMutation({
    mutationFn: async (data: typeof newCampaign) => {
      return await api.campaigns.create(data);
    },
    onSuccess: () => {
      refetch();
      setShowCreateModal(false);
      resetForm();
    }
  });

  // Activate/deactivate campaign mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      if (isActive) {
        // Deactivate - update with isActive: false
        return await api.campaigns.update(id, { isActive: false });
      } else {
        // Activate
        return await api.campaigns.activate(id);
      }
    },
    onSuccess: () => {
      refetch();
    }
  });

  // Delete campaign mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.campaigns.delete(id);
    },
    onSuccess: () => {
      refetch();
    }
  });

  const resetForm = () => {
    setNewCampaign({
      name: '',
      companyName: '',
      jobTitle: '',
      jobDescription: '',
      targetCriteria: {
        keywords: [],
        skills: [],
        minExperience: 0,
        locations: []
      }
    });
  };

  const handleCreate = () => {
    if (!newCampaign.name || !newCampaign.companyName || !newCampaign.jobTitle) {
      return;
    }
    createMutation.mutate(newCampaign);
  };

  const handleToggleActive = (campaign: Campaign, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleActiveMutation.mutate({ id: campaign.id, isActive: campaign.isActive });
  };

  const handleDelete = (campaignId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this campaign?')) {
      deleteMutation.mutate(campaignId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
            <p className="text-gray-500 mt-1">Manage your recruitment campaigns</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Campaign
          </button>
        </div>
      </div>

      {/* Campaign Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Campaigns</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {campaigns?.filter(c => c.isActive).length || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Emails Sent</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {campaigns?.reduce((sum, c) => sum + c.emailsSent, 0) || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <TrendingUp className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Reply Rate</dt>
                  <dd className="text-2xl font-semibold text-gray-900">
                    {campaigns && campaigns.length > 0
                      ? Math.round(
                          campaigns.reduce((sum, c) => {
                            const rate = c.emailsSent > 0 ? (c.repliesReceived / c.emailsSent) * 100 : 0;
                            return sum + rate;
                          }, 0) / campaigns.length
                        )
                      : 0}%
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {campaigns?.length === 0 ? (
          <div className="text-center py-12">
            <Target className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-4 text-gray-500">No campaigns yet</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 text-purple-600 hover:text-purple-800"
            >
              Create your first campaign
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {campaigns?.map((campaign) => (
              <Link
                key={campaign.id}
                to={`/campaigns/${campaign.id}`}
                className="block hover:bg-gray-50 transition-colors"
              >
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-medium text-gray-900 truncate">
                          {campaign.name}
                        </h3>
                        {campaign.isActive ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Inactive
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {campaign.jobTitle} at {campaign.companyName}
                      </p>

                      <div className="flex items-center gap-6 mt-3">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {campaign.candidatesCount} candidates
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {campaign.emailsSent} sent
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <TrendingUp className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            {campaign.repliesReceived} replies
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">
                            Created {formatDate(campaign.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={(e) => handleToggleActive(campaign, e)}
                        className={cn(
                          'p-2 rounded-lg transition-colors',
                          campaign.isActive
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'bg-green-100 text-green-600 hover:bg-green-200'
                        )}
                      >
                        {campaign.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={(e) => handleDelete(campaign.id, e)}
                        className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Create New Campaign</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Senior Developer Q1 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company Name
                  </label>
                  <input
                    type="text"
                    value={newCampaign.companyName}
                    onChange={(e) => setNewCampaign({ ...newCampaign, companyName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., TechCorp Nederland"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Title
                  </label>
                  <input
                    type="text"
                    value={newCampaign.jobTitle}
                    onChange={(e) => setNewCampaign({ ...newCampaign, jobTitle: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., Senior Full Stack Developer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Description
                  </label>
                  <textarea
                    value={newCampaign.jobDescription}
                    onChange={(e) => setNewCampaign({ ...newCampaign, jobDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    rows={4}
                    placeholder="Describe the role, requirements, and what makes it attractive..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Keywords (comma-separated)
                  </label>
                  <input
                    type="text"
                    onChange={(e) => setNewCampaign({
                      ...newCampaign,
                      targetCriteria: {
                        ...newCampaign.targetCriteria,
                        keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., React, Node.js, TypeScript"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Required Skills (comma-separated)
                  </label>
                  <input
                    type="text"
                    onChange={(e) => setNewCampaign({
                      ...newCampaign,
                      targetCriteria: {
                        ...newCampaign.targetCriteria,
                        skills: e.target.value.split(',').map(s => s.trim()).filter(s => s)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="e.g., JavaScript, Docker, AWS"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Years of Experience
                  </label>
                  <input
                    type="number"
                    value={newCampaign.targetCriteria.minExperience}
                    onChange={(e) => setNewCampaign({
                      ...newCampaign,
                      targetCriteria: {
                        ...newCampaign.targetCriteria,
                        minExperience: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    resetForm();
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  disabled={createMutation.isPending}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create Campaign'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}