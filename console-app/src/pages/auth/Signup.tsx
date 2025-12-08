import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, User, Building, AlertCircle, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const STEPS = ['Account', 'Organization', 'Complete'];

export default function Signup() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Step 1: Account details
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  // Step 2: Organization details
  const [orgName, setOrgName] = useState('');
  const [orgWebsite, setOrgWebsite] = useState('');
  const [orgIndustry, setOrgIndustry] = useState('');
  const [orgSize, setOrgSize] = useState('');

  const handleAccountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate password strength
      if (password.length < 8) {
        throw new Error('Password must be at least 8 characters');
      }

      // Create auth account
      const { error: signUpError } = await signUp(email, password, fullName);

      if (signUpError) {
        throw signUpError;
      }

      // Move to organization setup
      setCurrentStep(1);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('User not found. Please try logging in again.');
      }

      // Generate slug from organization name
      const slug = orgName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      // Check if slug is available
      const { data: existingOrg } = await supabase
        .from('organizations')
        .select('id')
        .eq('slug', slug)
        .single();

      if (existingOrg) {
        throw new Error('Organization name already taken. Please choose a different name.');
      }

      // Generate API key for the organization
      const apiKey = `re_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

      // Create organization
      const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: orgName,
          slug,
          website: orgWebsite || null,
          industry: orgIndustry || null,
          companySize: orgSize || null,
          apiKey,
          plan: 'free',
          isActive: true,
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Add user as owner of the organization
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organizationId: newOrg.id,
          userId: user.id,
          role: 'owner',
          joinedAt: new Date().toISOString(),
          isActive: true,
        });

      if (memberError) throw memberError;

      // Log organization creation event
      await supabase.from('events').insert({
        organizationId: newOrg.id,
        type: 'ORGANIZATION_CREATED',
        entityType: 'organization',
        entityId: newOrg.id,
        userId: user.id,
        data: {
          organizationName: orgName,
          plan: 'free',
        },
      });

      // Move to completion step
      setCurrentStep(2);

      // Redirect to dashboard after a moment
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to create organization');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {STEPS.map((step, index) => (
              <div key={step} className="flex items-center">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      index < currentStep
                        ? 'bg-green-500 text-white'
                        : index === currentStep
                        ? 'bg-white text-purple-600'
                        : 'bg-purple-300 text-purple-600'
                    } font-semibold transition-all`}
                  >
                    {index < currentStep ? (
                      <CheckCircle className="h-6 w-6" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span
                    className={`mt-2 text-sm ${
                      index <= currentStep ? 'text-white' : 'text-purple-300'
                    }`}
                  >
                    {step}
                  </span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-20 h-1 mx-4 ${
                      index < currentStep ? 'bg-green-500' : 'bg-purple-300'
                    } transition-all`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <Mail className="h-8 w-8 text-purple-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {currentStep === 0 && 'Create Your Account'}
            {currentStep === 1 && 'Set Up Your Organization'}
            {currentStep === 2 && 'All Set!'}
          </h1>
          <p className="text-purple-200">
            {currentStep === 0 && 'Start recruiting smarter with AI-powered outreach'}
            {currentStep === 1 && 'Tell us about your company'}
            {currentStep === 2 && 'Your recruitment engine is ready'}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Account Creation */}
          {currentStep === 0 && (
            <form onSubmit={handleAccountSubmit} className="space-y-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Work Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="you@company.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">Minimum 8 characters</p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Continue'
                )}
              </button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/auth/login" className="font-medium text-purple-600 hover:text-purple-500">
                  Sign in
                </Link>
              </p>
            </form>
          )}

          {/* Step 2: Organization Setup */}
          {currentStep === 1 && (
            <form onSubmit={handleOrganizationSubmit} className="space-y-6">
              <div>
                <label htmlFor="orgName" className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="orgName"
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    required
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Acme Corp"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="orgWebsite" className="block text-sm font-medium text-gray-700 mb-2">
                  Website (optional)
                </label>
                <input
                  id="orgWebsite"
                  type="url"
                  value={orgWebsite}
                  onChange={(e) => setOrgWebsite(e.target.value)}
                  className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="https://acme.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="orgIndustry" className="block text-sm font-medium text-gray-700 mb-2">
                    Industry
                  </label>
                  <select
                    id="orgIndustry"
                    value={orgIndustry}
                    onChange={(e) => setOrgIndustry(e.target.value)}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="technology">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="retail">Retail</option>
                    <option value="manufacturing">Manufacturing</option>
                    <option value="consulting">Consulting</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="orgSize" className="block text-sm font-medium text-gray-700 mb-2">
                    Company Size
                  </label>
                  <select
                    id="orgSize"
                    value={orgSize}
                    onChange={(e) => setOrgSize(e.target.value)}
                    className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="">Select...</option>
                    <option value="1-10">1-10 employees</option>
                    <option value="11-50">11-50 employees</option>
                    <option value="51-200">51-200 employees</option>
                    <option value="201-500">201-500 employees</option>
                    <option value="500+">500+ employees</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(0)}
                  className="flex-1 py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Organization'
                  )}
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Complete */}
          {currentStep === 2 && (
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                You're all set!
              </h2>

              <p className="text-gray-600 mb-8">
                Your organization has been created successfully.<br />
                Redirecting to your dashboard...
              </p>

              <div className="flex items-center justify-center">
                <Loader2 className="h-6 w-6 text-purple-600 animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {currentStep < 2 && (
          <p className="mt-8 text-center text-sm text-purple-200">
            Free forever • No credit card required • Unlimited team members
          </p>
        )}
      </div>
    </div>
  );
}