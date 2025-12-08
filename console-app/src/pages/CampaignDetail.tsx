import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  Target,
  Users,
  Mail,
  Calendar,
  TrendingUp,
  Play,
  Pause,
  Edit,
  Trash2,
  CheckCircle,
  AlertCircle,
  Star,
  Building,
  MapPin
} from 'lucide-react';
import api from '@/lib/api';
import { cn, formatDate, formatDateTime, getStatusColor, getScoreColor, getInitials } from '@/lib/utils';

interface CampaignDetail {
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
  avgResponseTime: string;
  createdAt: string;
  updatedAt: string;
  candidates: any[];
  stats: {
    new: number;
    enriched: number;
    contacted: number;
    replied: number;
    notInterested: number;
  };
}

export default function CampaignDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Fetch campaign details
  const { data: campaign, isLoading, refetch } = useQuery<CampaignDetail>({
    queryKey: ['campaign', id],
    queryFn: async () => {
      if (!id) throw new Error('No campaign ID');
      // Mock data for now - would be api.campaigns.get(id)
      return {
        id,
        name: 'Senior Developer Q1 2024',
        companyName: 'TechCorp Nederland',
        jobTitle: 'Senior Full Stack Developer',
        jobDescription: 'We are looking for an experienced Full Stack Developer to join our growing team...',
        targetCriteria: {
          keywords: ['React', 'Node.js', 'TypeScript'],
          skills: ['JavaScript', 'Docker', 'AWS'],
          minExperience: 5,
          locations: ['Amsterdam', 'Utrecht', 'Rotterdam']
        },
        isActive: true,
        candidatesCount: 47,
        emailsSent: 32,
        repliesReceived: 8,
        avgResponseTime: '2.3 days',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stats: {
          new: 15,
          enriched: 12,
          contacted: 32,
          replied: 8,
          notInterested: 3
        },
        candidates: [
          {
            id: '1',
            fullName: 'Jan de Vries',
            headline: 'Senior Full Stack Developer',
            company: 'StartupCo',
            location: 'Amsterdam',
            matchScore: 92,
            status: 'REPLIED',
            lastContactedAt: new Date().toISOString()
          },
          {
            id: '2',
            fullName: 'Anna Jansen',
            headline: 'Lead Developer',
            company: 'TechCorp',
            location: 'Utrecht',
            matchScore: 87,
            status: 'CONTACTED',
            lastContactedAt: new Date().toISOString()
          }
        ]
      };
    }
  });

  // Toggle campaign active status
  const toggleActiveMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('No campaign ID');
      if (campaign?.isActive) {
        return await api.campaigns.update(id, { isActive: false });
      } else {
        return await api.campaigns.activate(id);
      }
    },
    onSuccess: () => {
      refetch();
    }
  });

  // Delete campaign
  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('No campaign ID');
      return await api.campaigns.delete(id);
    },
    onSuccess: () => {
      navigate('/campaigns');
    }
  });

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
      deleteMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Campaign not found</p>
      </div>
    );
  }

  const replyRate = campaign.emailsSent > 0
    ? Math.round((campaign.repliesReceived / campaign.emailsSent) * 100)
    : 0;

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/campaigns')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Campaigns
        </button>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
                {campaign.isActive ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Inactive
                  </span>
                )}
              </div>
              <p className="text-gray-600 mt-1">{campaign.jobTitle} at {campaign.companyName}</p>
              <p className="text-sm text-gray-500 mt-2">Created {formatDate(campaign.createdAt)}</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleActiveMutation.mutate()}
                disabled={toggleActiveMutation.isPending}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
                  campaign.isActive
                    ? 'bg-red-100 text-red-700 hover:bg-red-200'
                    : 'bg-green-100 text-green-700 hover:bg-green-200'
                )}
              >
                {campaign.isActive ? (
                  <>
                    <Pause className="h-4 w-4" />
                    Pause Campaign
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Activate Campaign
                  </>
                )}
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-blue-100">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Candidates</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{campaign.candidatesCount}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-green-100">
                <Mail className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Emails Sent</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{campaign.emailsSent}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-purple-100">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Reply Rate</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{replyRate}%</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0 p-3 rounded-md bg-orange-100">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Avg Response</dt>
                  <dd className="text-2xl font-semibold text-gray-900">{campaign.avgResponseTime}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Job Description</h2>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{campaign.jobDescription}</p>
          </div>

          {/* Target Criteria */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Target Criteria</h2>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Keywords</p>
                <div className="flex flex-wrap gap-2">
                  {campaign.targetCriteria.keywords.map((keyword: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-purple-100 text-purple-800">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-2">
                  {campaign.targetCriteria.skills.map((skill: string, index: number) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-100 text-blue-800">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-700">Min Experience</p>
                  <p className="text-sm text-gray-900 mt-1">{campaign.targetCriteria.minExperience} years</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700">Target Locations</p>
                  <p className="text-sm text-gray-900 mt-1">
                    {campaign.targetCriteria.locations.join(', ')}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Candidates */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Top Candidates</h2>
            {campaign.candidates.length > 0 ? (
              <div className="space-y-4">
                {campaign.candidates.map((candidate) => (
                  <div key={candidate.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                        <span className="text-sm font-medium text-purple-600">
                          {getInitials(candidate.fullName)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{candidate.fullName}</p>
                        <p className="text-xs text-gray-500">{candidate.headline}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {candidate.company && (
                            <div className="flex items-center gap-1">
                              <Building className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{candidate.company}</span>
                            </div>
                          )}
                          {candidate.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3 text-gray-400" />
                              <span className="text-xs text-gray-500">{candidate.location}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Star className={cn('h-4 w-4', getScoreColor(candidate.matchScore))} />
                        <span className={cn('text-sm font-semibold', getScoreColor(candidate.matchScore))}>
                          {candidate.matchScore}%
                        </span>
                      </div>
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        getStatusColor(candidate.status)
                      )}>
                        {candidate.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No candidates yet</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Pipeline Status */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Pipeline Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">New</span>
                <span className="text-sm font-medium text-gray-900">{campaign.stats.new}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Enriched</span>
                <span className="text-sm font-medium text-gray-900">{campaign.stats.enriched}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Contacted</span>
                <span className="text-sm font-medium text-gray-900">{campaign.stats.contacted}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Replied</span>
                <span className="text-sm font-medium text-green-600">{campaign.stats.replied}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Not Interested</span>
                <span className="text-sm font-medium text-red-600">{campaign.stats.notInterested}</span>
              </div>
            </div>
          </div>

          {/* Activity */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-green-500 mt-1.5"></div>
                <div>
                  <p className="text-sm text-gray-900">Candidate replied</p>
                  <p className="text-xs text-gray-500">Jan de Vries - 2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5"></div>
                <div>
                  <p className="text-sm text-gray-900">Email sent</p>
                  <p className="text-xs text-gray-500">Anna Jansen - 5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-purple-500 mt-1.5"></div>
                <div>
                  <p className="text-sm text-gray-900">Candidate enriched</p>
                  <p className="text-xs text-gray-500">Pieter Bakker - 1 day ago</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}