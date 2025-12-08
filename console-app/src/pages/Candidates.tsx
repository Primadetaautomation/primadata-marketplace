import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  RefreshCw,
  Mail,
  ChevronRight,
  Building,
  MapPin,
  Calendar,
  Star,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import api from '@/lib/api';
import { cn, formatDate, getStatusColor, getScoreColor, getInitials } from '@/lib/utils';

interface Candidate {
  id: string;
  linkedinUrl: string;
  fullName: string;
  headline: string;
  location: string;
  company: string;
  email: string | null;
  status: string;
  matchScore: number;
  enrichmentStatus: string;
  lastContactedAt: string | null;
  repliedAt: string | null;
  createdAt: string;
}

export default function Candidates() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [enrichmentFilter, setEnrichmentFilter] = useState('all');

  // Fetch candidates
  const { data: candidates, isLoading, refetch } = useQuery<Candidate[]>({
    queryKey: ['candidates', statusFilter, enrichmentFilter, searchTerm],
    queryFn: async () => {
      const params: any = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (enrichmentFilter !== 'all') params.enrichmentStatus = enrichmentFilter;
      if (searchTerm) params.search = searchTerm;

      const response = await api.candidates.list(params);
      return response.candidates || [];
    }
  });

  const handleEnrichCandidate = async (candidateId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await api.candidates.enrich(candidateId);
      refetch();
    } catch (error) {
      console.error('Failed to enrich candidate:', error);
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'NEW', label: 'New' },
    { value: 'ENRICHED', label: 'Enriched' },
    { value: 'READY_FOR_OUTREACH', label: 'Ready for Outreach' },
    { value: 'CONTACTED', label: 'Contacted' },
    { value: 'REPLIED', label: 'Replied' },
    { value: 'NOT_INTERESTED', label: 'Not Interested' }
  ];

  const enrichmentOptions = [
    { value: 'all', label: 'All Enrichment' },
    { value: 'pending', label: 'Pending' },
    { value: 'enriching', label: 'Enriching' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'no_email', label: 'No Email Found' }
  ];

  const filteredCandidates = candidates || [];

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
            <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
            <p className="text-gray-500 mt-1">Manage and track your recruitment pipeline</p>
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>

          {/* Enrichment Filter */}
          <select
            value={enrichmentFilter}
            onChange={(e) => setEnrichmentFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            {enrichmentOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Candidates List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No candidates found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCandidates.map((candidate) => (
              <Link
                key={candidate.id}
                to={`/candidates/${candidate.id}`}
                className="block hover:bg-gray-50 transition-colors"
              >
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Avatar */}
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-purple-600">
                            {getInitials(candidate.fullName)}
                          </span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {candidate.fullName}
                          </p>
                          {candidate.matchScore && (
                            <div className="flex items-center gap-1">
                              <Star className={cn('h-3 w-3', getScoreColor(candidate.matchScore))} />
                              <span className={cn('text-xs font-semibold', getScoreColor(candidate.matchScore))}>
                                {candidate.matchScore}%
                              </span>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 truncate">{candidate.headline}</p>
                        <div className="flex items-center gap-4 mt-1">
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

                    {/* Actions & Status */}
                    <div className="flex items-center gap-4">
                      {/* Status Badge */}
                      <span className={cn(
                        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
                        getStatusColor(candidate.status)
                      )}>
                        {candidate.status.replace(/_/g, ' ')}
                      </span>

                      {/* Enrichment Status */}
                      <div className="flex items-center gap-2">
                        {candidate.enrichmentStatus === 'completed' && candidate.email ? (
                          <div className="flex items-center gap-1">
                            <Mail className="h-4 w-4 text-green-500" />
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </div>
                        ) : candidate.enrichmentStatus === 'enriching' ? (
                          <RefreshCw className="h-4 w-4 text-yellow-500 animate-spin" />
                        ) : candidate.enrichmentStatus === 'failed' || candidate.enrichmentStatus === 'no_email' ? (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <button
                            onClick={(e) => handleEnrichCandidate(candidate.id, e)}
                            className="px-3 py-1 text-xs bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                          >
                            Enrich
                          </button>
                        )}
                      </div>

                      {/* Last Contact */}
                      {candidate.lastContactedAt && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {formatDate(candidate.lastContactedAt)}
                        </div>
                      )}

                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Pagination could go here */}
    </div>
  );
}