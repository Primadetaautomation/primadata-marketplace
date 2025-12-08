import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ArrowLeft,
  ExternalLink,
  Mail,
  Phone,
  MapPin,
  Building,
  Calendar,
  Star,
  RefreshCw,
  Send,
  Clock,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Linkedin
} from 'lucide-react';
import api from '@/lib/api';
import { cn, formatDate, formatDateTime, getStatusColor, getScoreColor } from '@/lib/utils';

interface CandidateDetail {
  id: string;
  linkedinUrl: string;
  fullName: string;
  headline: string;
  location: string;
  company: string;
  email: string | null;
  phone: string | null;
  status: string;
  matchScore: number;
  enrichmentStatus: string;
  profileData: any;
  enrichmentData: any;
  lastContactedAt: string | null;
  repliedAt: string | null;
  createdAt: string;
  updatedAt: string;
  campaign: any;
  outreachMessages: any[];
}

export default function CandidateDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [messageContent, setMessageContent] = useState('');
  const [isEnriching, setIsEnriching] = useState(false);

  // Fetch candidate details
  const { data: candidate, isLoading, refetch } = useQuery<CandidateDetail>({
    queryKey: ['candidate', id],
    queryFn: async () => {
      if (!id) throw new Error('No candidate ID');
      return await api.candidates.get(id);
    }
  });

  // Enrich candidate mutation
  const enrichMutation = useMutation({
    mutationFn: async () => {
      if (!id) throw new Error('No candidate ID');
      return await api.candidates.enrich(id);
    },
    onSuccess: () => {
      refetch();
      setIsEnriching(false);
    },
    onError: () => {
      setIsEnriching(false);
    }
  });

  // Send outreach mutation
  const sendOutreachMutation = useMutation({
    mutationFn: async (data: { subject: string; content: string }) => {
      if (!id) throw new Error('No candidate ID');
      return await api.candidates.sendOutreach(id, data);
    },
    onSuccess: () => {
      refetch();
      setMessageContent('');
    }
  });

  const handleEnrich = () => {
    setIsEnriching(true);
    enrichMutation.mutate();
  };

  const handleSendMessage = () => {
    if (!messageContent.trim()) return;

    sendOutreachMutation.mutate({
      subject: `Interessante opportunity bij ${candidate?.campaign?.companyName || 'ons bedrijf'}`,
      content: messageContent
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Candidate not found</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/candidates')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Candidates
        </button>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              {/* Avatar */}
              <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-xl font-medium text-purple-600">
                  {candidate.fullName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </span>
              </div>

              {/* Basic Info */}
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{candidate.fullName}</h1>
                <p className="text-gray-600 mt-1">{candidate.headline}</p>

                <div className="flex items-center gap-4 mt-3">
                  {candidate.company && (
                    <div className="flex items-center gap-1">
                      <Building className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{candidate.company}</span>
                    </div>
                  )}
                  {candidate.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{candidate.location}</span>
                    </div>
                  )}
                  <a
                    href={candidate.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-800"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Match Score */}
              {candidate.matchScore && (
                <div className="text-center">
                  <div className="flex items-center gap-1">
                    <Star className={cn('h-5 w-5', getScoreColor(candidate.matchScore))} />
                    <span className={cn('text-2xl font-bold', getScoreColor(candidate.matchScore))}>
                      {candidate.matchScore}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Match Score</p>
                </div>
              )}

              {/* Status */}
              <div className="text-center">
                <span className={cn(
                  'inline-flex items-center px-3 py-1 rounded-full text-sm font-medium',
                  getStatusColor(candidate.status)
                )}>
                  {candidate.status.replace(/_/g, ' ')}
                </span>
                <p className="text-xs text-gray-500 mt-2">Status</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Contact Information</h2>
              {candidate.enrichmentStatus !== 'completed' && (
                <button
                  onClick={handleEnrich}
                  disabled={isEnriching || enrichMutation.isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  {isEnriching || enrichMutation.isPending ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  Enrich Data
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                {candidate.email ? (
                  <a href={`mailto:${candidate.email}`} className="text-sm text-purple-600 hover:text-purple-800">
                    {candidate.email}
                  </a>
                ) : (
                  <span className="text-sm text-gray-500">No email found</span>
                )}
                {candidate.enrichmentStatus === 'completed' && candidate.email && (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                )}
              </div>

              {candidate.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900">{candidate.phone}</span>
                </div>
              )}

              <div className="pt-3 border-t">
                <p className="text-xs text-gray-500">
                  Enrichment Status: {candidate.enrichmentStatus}
                </p>
                {candidate.enrichmentData?.sources && (
                  <p className="text-xs text-gray-500 mt-1">
                    Sources: {candidate.enrichmentData.sources.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Communication History */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Communication History</h2>

            {candidate.outreachMessages && candidate.outreachMessages.length > 0 ? (
              <div className="space-y-4">
                {candidate.outreachMessages.map((message: any) => (
                  <div key={message.id} className="border-l-4 border-purple-500 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">{message.subject}</span>
                      </div>
                      <span className="text-xs text-gray-500">{formatDateTime(message.sentAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap">{message.content}</p>
                    {message.status && (
                      <div className="flex items-center gap-2 mt-2">
                        {message.status === 'sent' && <Send className="h-3 w-3 text-green-500" />}
                        {message.status === 'opened' && <Mail className="h-3 w-3 text-blue-500" />}
                        {message.status === 'replied' && <CheckCircle className="h-3 w-3 text-purple-500" />}
                        <span className="text-xs text-gray-500">{message.status}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No communication history yet</p>
            )}

            {/* Send Message */}
            {candidate.email && (
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Send Outreach</h3>
                <textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message here..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={4}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!messageContent.trim() || sendOutreachMutation.isPending}
                  className="mt-3 flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  Send Message
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Campaign Info */}
          {candidate.campaign && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Campaign</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{candidate.campaign.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{candidate.campaign.companyName}</p>
                </div>
                <div className="pt-3 border-t">
                  <p className="text-xs text-gray-500">Added to campaign</p>
                  <p className="text-sm text-gray-900">{formatDate(candidate.createdAt)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Profile Summary */}
          {candidate.profileData && (
            <div className="bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Profile Summary</h2>
              <div className="space-y-3">
                {candidate.profileData.experience && (
                  <div>
                    <p className="text-xs text-gray-500">Experience</p>
                    <p className="text-sm text-gray-900">{candidate.profileData.experience.length} positions</p>
                  </div>
                )}
                {candidate.profileData.education && (
                  <div>
                    <p className="text-xs text-gray-500">Education</p>
                    <p className="text-sm text-gray-900">{candidate.profileData.education.length} degrees</p>
                  </div>
                )}
                {candidate.profileData.skills && (
                  <div>
                    <p className="text-xs text-gray-500 mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {candidate.profileData.skills.slice(0, 5).map((skill: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Activity Timeline */}
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Activity</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">Added</p>
                  <p className="text-sm text-gray-900">{formatDateTime(candidate.createdAt)}</p>
                </div>
              </div>
              {candidate.lastContactedAt && (
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Last Contacted</p>
                    <p className="text-sm text-gray-900">{formatDateTime(candidate.lastContactedAt)}</p>
                  </div>
                </div>
              )}
              {candidate.repliedAt && (
                <div className="flex items-center gap-3">
                  <MessageSquare className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Replied</p>
                    <p className="text-sm text-gray-900">{formatDateTime(candidate.repliedAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}