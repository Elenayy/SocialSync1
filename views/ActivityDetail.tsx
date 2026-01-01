
import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  CreditCard, 
  ExternalLink, 
  MessageCircle,
  Clock,
  Send,
  Sparkles,
  ShieldCheck,
  Check,
  X,
  Star
} from 'lucide-react';
import { Activity, User, Registration, RegistrationStatus } from '../types';
import { suggestRegistrationMessage } from '../services/gemini';

interface ActivityDetailProps {
  activity: Activity;
  currentUser: User;
  registrations: Registration[];
  onRegister: (activityId: string, message: string) => void;
  onBack: () => void;
  onOpenChat: () => void;
  getRating: (userId: string) => string | null;
  allUsers: User[];
}

const ActivityDetail: React.FC<ActivityDetailProps> = ({ 
  activity, 
  currentUser, 
  registrations, 
  onRegister, 
  onBack,
  onOpenChat,
  getRating,
  allUsers
}) => {
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAiDrafting, setIsAiDrafting] = useState(false);

  const myRegistration = registrations.find(r => r.userId === currentUser.id);
  const approvedCount = registrations.filter(r => r.status === RegistrationStatus.APPROVED).length + 1; // +1 for organizer
  const organizer = allUsers.find(u => u.id === activity.organizerId);
  const organizerRating = organizer ? getRating(organizer.id) : null;

  const handleAiDraft = async () => {
    setIsAiDrafting(true);
    const draft = await suggestRegistrationMessage(activity.title, currentUser.bio);
    setMessage(draft);
    setIsAiDrafting(false);
  };

  const submitRegistration = () => {
    if (!message.trim()) return;
    setIsSubmitting(true);
    setTimeout(() => {
      onRegister(activity.id, message);
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20 animate-in slide-in-from-bottom-4 duration-500">
      <button 
        onClick={onBack}
        className="flex items-center text-gray-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Discover
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="relative rounded-3xl overflow-hidden shadow-lg aspect-video">
            <img 
              src={activity.imageUrl} 
              alt={activity.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 left-4">
              <span className="bg-indigo-600 text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest">
                {activity.category}
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">{activity.title}</h1>
            <p className="text-xl text-gray-600 leading-relaxed mb-6">
              {activity.description}
            </p>
            
            <div className="flex flex-wrap gap-4 text-gray-600 mb-8">
              <div className="flex items-center px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                <Calendar className="w-5 h-5 mr-3 text-indigo-500" />
                <div className="text-sm">
                  <div className="font-semibold">{new Date(activity.dateTime).toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}</div>
                  <div className="text-xs text-gray-400">Date</div>
                </div>
              </div>
              <div className="flex items-center px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                <Clock className="w-5 h-5 mr-3 text-indigo-500" />
                <div className="text-sm">
                  <div className="font-semibold">{new Date(activity.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  <div className="text-xs text-gray-400">Starts</div>
                </div>
              </div>
              <div className="flex items-center px-4 py-2 bg-gray-50 rounded-xl border border-gray-100">
                <MapPin className="w-5 h-5 mr-3 text-indigo-500" />
                <div className="text-sm">
                  <div className="font-semibold">{activity.location}</div>
                  <div className="text-xs text-gray-400">Location</div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center">
                <ShieldCheck className="w-5 h-5 mr-2 text-green-500" /> Activity Details
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Fee Reference</label>
                  <p className="text-lg font-bold text-gray-900">£{activity.pricePerPerson} <span className="text-xs font-normal text-gray-500 ml-1">per person</span></p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Official Link</label>
                  <a 
                    href={activity.officialLink} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-indigo-600 font-medium hover:underline flex items-center text-sm"
                  >
                    View Official Site <ExternalLink className="w-3 h-3 ml-1" />
                  </a>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Participants</label>
                  <p className="text-lg font-bold text-gray-900">{approvedCount} / {activity.expectedHeadcount}</p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Status</label>
                  <p className="text-sm font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full inline-block">Recruiting</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Interaction Side */}
        <div className="space-y-6">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-lg sticky top-24">
            <div className="flex items-center space-x-4 mb-6">
              <img src={organizer?.avatar} className="w-12 h-12 rounded-full border-2 border-indigo-100 object-cover" />
              <div>
                <h4 className="font-bold text-gray-900">{organizer?.name}</h4>
                <div className="flex items-center text-xs text-indigo-500 font-bold">
                  <Star className="w-3 h-3 fill-current mr-1" />
                  {organizerRating || 'New Member'}
                </div>
              </div>
            </div>

            {myRegistration ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-2xl border ${
                  myRegistration.status === RegistrationStatus.APPROVED ? 'bg-green-50 border-green-200' :
                  myRegistration.status === RegistrationStatus.REJECTED ? 'bg-red-50 border-red-200' :
                  'bg-yellow-50 border-yellow-200'
                }`}>
                  <p className="text-sm font-bold flex items-center">
                    {myRegistration.status === RegistrationStatus.APPROVED && <Check className="w-4 h-4 mr-2 text-green-600" />}
                    {myRegistration.status === RegistrationStatus.REJECTED && <X className="w-4 h-4 mr-2 text-red-600" />}
                    {myRegistration.status === RegistrationStatus.PENDING && <Clock className="w-4 h-4 mr-2 text-yellow-600" />}
                    Status: {myRegistration.status}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">
                    {myRegistration.status === RegistrationStatus.PENDING && "Wait for the organizer's approval."}
                    {myRegistration.status === RegistrationStatus.APPROVED && "You're in! Join the group chat to coordinate."}
                  </p>
                </div>
                
                {myRegistration.status === RegistrationStatus.APPROVED && (
                  <button 
                    onClick={onOpenChat}
                    className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                  >
                    <MessageCircle className="w-5 h-5 mr-2" /> Enter Group Chat
                  </button>
                )}
              </div>
            ) : activity.organizerId === currentUser.id ? (
              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 text-center">
                <p className="text-sm font-bold text-indigo-900 mb-2">You are the organizer</p>
                <button 
                  onClick={onOpenChat}
                  className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700"
                >
                  Manage Group Chat
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-gray-700">Introduce Yourself</label>
                    <button 
                      onClick={handleAiDraft}
                      disabled={isAiDrafting}
                      className="text-xs font-bold text-indigo-600 flex items-center hover:underline disabled:opacity-50"
                    >
                      <Sparkles className="w-3 h-3 mr-1" /> {isAiDrafting ? 'Drafting...' : 'Magic Draft'}
                    </button>
                  </div>
                  <textarea 
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell the organizer why you'd like to join..."
                    className="w-full h-32 p-4 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  />
                </div>
                <button 
                  onClick={submitRegistration}
                  disabled={isSubmitting || !message.trim()}
                  className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg disabled:bg-gray-300 flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white" />
                  ) : (
                    <>Apply to Join <Send className="w-4 h-4 ml-2" /></>
                  )}
                </button>
                <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-bold">
                  Payment handled offline with companions
                </p>
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center">
              <Users className="w-4 h-4 mr-2 text-indigo-400" /> Who's Going ({approvedCount})
            </h4>
            <div className="flex -space-x-3 overflow-hidden">
              <img src={organizer?.avatar} className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover" title={organizer?.name} />
              {registrations
                .filter(r => r.status === RegistrationStatus.APPROVED)
                .map(r => {
                  const user = allUsers.find(u => u.id === r.userId);
                  return <img key={r.id} src={user?.avatar} className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover" title={user?.name} />;
                })
              }
              {Array.from({ length: Math.max(0, activity.expectedHeadcount - approvedCount) }).map((_, i) => (
                <div key={i} className="h-10 w-10 rounded-full bg-gray-100 ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-gray-400">?</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityDetail;
