import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    NEW: 'bg-blue-100 text-blue-800',
    ENRICHING: 'bg-yellow-100 text-yellow-800',
    ENRICHED: 'bg-green-100 text-green-800',
    READY_FOR_OUTREACH: 'bg-purple-100 text-purple-800',
    CONTACTED: 'bg-indigo-100 text-indigo-800',
    REPLIED: 'bg-green-100 text-green-800',
    NOT_INTERESTED: 'bg-red-100 text-red-800',
    NO_EMAIL: 'bg-gray-100 text-gray-800',
    QUALIFIED: 'bg-green-100 text-green-800',
    DISQUALIFIED: 'bg-red-100 text-red-800',
  };
  return statusColors[status] || 'bg-gray-100 text-gray-800';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-green-600';
  if (score >= 60) return 'text-yellow-600';
  if (score >= 40) return 'text-orange-600';
  return 'text-red-600';
}