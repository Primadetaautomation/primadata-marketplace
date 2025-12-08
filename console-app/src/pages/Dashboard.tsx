import { useQuery } from '@tanstack/react-query';
import {
  Users,
  Target,
  Mail,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import api from '@/lib/api';
import { cn } from '@/lib/utils';

interface DashboardStats {
  totalCandidates: number;
  newCandidates: number;
  enrichedCandidates: number;
  contactedCandidates: number;
  repliedCandidates: number;
  activeCampaigns: number;
  totalOutreachSent: number;
  replyRate: number;
  avgResponseTime: string;
}

export default function Dashboard() {
  // Fetch dashboard stats
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Mock data for now - replace with actual API call
      return {
        totalCandidates: 247,
        newCandidates: 12,
        enrichedCandidates: 183,
        contactedCandidates: 142,
        repliedCandidates: 34,
        activeCampaigns: 3,
        totalOutreachSent: 426,
        replyRate: 24,
        avgResponseTime: '2.3 days'
      };
    }
  });

  // Fetch recent activity
  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      // Mock data for now
      return [
        { id: 1, type: 'candidate_added', name: 'Jan de Vries', time: '5 min ago', icon: Users },
        { id: 2, type: 'email_sent', name: 'Pieter Bakker', time: '1 hour ago', icon: Mail },
        { id: 3, type: 'reply_received', name: 'Anna Jansen', time: '2 hours ago', icon: CheckCircle },
        { id: 4, type: 'campaign_started', name: 'Senior Developer Campaign', time: '3 hours ago', icon: Target },
        { id: 5, type: 'enrichment_complete', name: 'Mark Visser', time: '4 hours ago', icon: TrendingUp },
      ];
    }
  });

  const statCards = [
    {
      label: 'Total Candidates',
      value: stats?.totalCandidates || 0,
      change: '+12 today',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      label: 'Active Campaigns',
      value: stats?.activeCampaigns || 0,
      change: '3 running',
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      label: 'Emails Sent',
      value: stats?.totalOutreachSent || 0,
      change: '+42 this week',
      icon: Mail,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      label: 'Reply Rate',
      value: `${stats?.replyRate || 0}%`,
      change: '↑ 3% vs last week',
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ];

  const candidateStages = [
    { stage: 'New', count: stats?.newCandidates || 0, color: 'bg-blue-500' },
    { stage: 'Enriched', count: stats?.enrichedCandidates || 0, color: 'bg-purple-500' },
    { stage: 'Contacted', count: stats?.contactedCandidates || 0, color: 'bg-indigo-500' },
    { stage: 'Replied', count: stats?.repliedCandidates || 0, color: 'bg-green-500' }
  ];

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
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back! Here's your recruitment overview.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className={cn('flex-shrink-0 p-3 rounded-md', stat.bgColor)}>
                    <Icon className={cn('h-6 w-6', stat.color)} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {stat.label}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {stat.value}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">{stat.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Candidate Pipeline */}
        <div className="lg:col-span-2">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Candidate Pipeline</h2>

            {/* Pipeline visualization */}
            <div className="space-y-4">
              {candidateStages.map((stage, index) => (
                <div key={stage.stage}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">{stage.stage}</span>
                    <span className="text-sm text-gray-500">{stage.count} candidates</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={cn('h-2 rounded-full transition-all duration-500', stage.color)}
                      style={{ width: `${(stage.count / (stats?.totalCandidates || 1)) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-4 mt-6 pt-6 border-t">
              <div>
                <p className="text-sm text-gray-500">Avg. Response Time</p>
                <p className="text-lg font-semibold text-gray-900">{stats?.avgResponseTime}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Enrichment Success</p>
                <p className="text-lg font-semibold text-gray-900">74%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
            <div className="flow-root">
              <ul className="-mb-8">
                {recentActivity?.map((activity, activityIdx) => {
                  const Icon = activity.icon;
                  return (
                    <li key={activity.id}>
                      <div className="relative pb-8">
                        {activityIdx !== recentActivity.length - 1 ? (
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          />
                        ) : null}
                        <div className="relative flex space-x-3">
                          <div>
                            <span className={cn(
                              'h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white',
                              activity.type === 'reply_received' ? 'bg-green-500' : 'bg-gray-400'
                            )}>
                              <Icon className="h-4 w-4 text-white" aria-hidden="true" />
                            </span>
                          </div>
                          <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                            <div>
                              <p className="text-sm text-gray-500">
                                <span className="font-medium text-gray-900">{activity.name}</span>
                              </p>
                            </div>
                            <div className="whitespace-nowrap text-right text-sm text-gray-500">
                              {activity.time}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}