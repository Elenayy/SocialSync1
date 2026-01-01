
import React, { useState } from 'react';
import { 
  Check, 
  X, 
  Clock, 
  MessageCircle, 
  ChevronRight,
  User as UserIcon,
  LayoutDashboard,
  Inbox,
  CalendarCheck,
  Star,
  UserPlus
} from 'lucide-react';
import { Activity, Registration, RegistrationStatus, Notification, User } from '../types';
import { MOCK_USERS } from '../constants';

interface DashboardProps {
  activities: Activity[];
  registrations: Registration[];
  notifications: Notification[];
  currentUser: User;
  onUpdateStatus: (regId: string, status: RegistrationStatus) => void;
  onSelectActivity: (id: string) => void;
  onOpenChat: (id: string) => void;
  getRating: (userId: string) => string | null;
  onReviewRequest: (user: User, activity: Activity) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  activities, 
  registrations, 
  notifications, 
  currentUser,
  onUpdateStatus,
  onSelectActivity,
  onOpenChat,
  getRating,
  onReviewRequest
}) => {
  const [tab, setTab] = useState<'approvals' | 'my-events' | 'my-apps'>('approvals');

  const myActivities = activities.filter(a => a.organizerId === currentUser.id);
  const myApplications = registrations.filter(r => r.userId === currentUser.id);
  const pendingApprovals = registrations.filter(r => {
    const act = activities.find(a => a.id === r.activityId);
    return act?.organizerId === currentUser.id && r.status === RegistrationStatus.PENDING;
  });

  const getStatusBadge = (status: RegistrationStatus) => {
    const colors = {
      [RegistrationStatus.PENDING]: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      [RegistrationStatus.APPROVED]: 'bg-green-100 text-green-700 border-green-200',
      [RegistrationStatus.REJECTED]: 'bg-red-100 text-red-700 border-red-200'
    };
    return <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${colors[status]}`}>{status}</span>;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-600 p-2 rounded-xl">
          <LayoutDashboard className="text-white w-6 h-6" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Personal Dashboard</h1>
      </div>

      <div className="flex border-b border-gray-200 space-x-8 overflow-x-auto scrollbar-hide">
        {[
          { id: 'approvals', label: 'Pending Approvals', icon: Inbox, count: pendingApprovals.length },
          { id: 'my-events', label: 'Hosting', icon: CalendarCheck, count: myActivities.length },
          { id: 'my-apps', label: 'Applied', icon: UserIcon, count: myApplications.length },
        ].map(t => (
          <button 
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center py-4 px-1 border-b-2 font-semibold text-sm transition-all relative whitespace-nowrap ${
              tab === t.id ? 'border-indigo-600 text-indigo-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <t.icon className="w-4 h-4 mr-2" />
            {t.label}
            {t.count > 0 && (
              <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {tab === 'approvals' && (
          <div className="space-y-4">
            {pendingApprovals.length > 0 ? pendingApprovals.map(reg => {
              const user = MOCK_USERS.find(u => u.id === reg.userId);
              const activity = activities.find(a => a.id === reg.activityId);
              const userRating = user ? getRating(user.id) : null;
              
              return (
                <div key={reg.id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <img src={user?.avatar} className="w-14 h-14 rounded-2xl border border-gray-100 object-cover" />
                      {userRating && (
                        <div className="absolute -bottom-2 -right-2 bg-white border border-yellow-100 rounded-lg px-1.5 py-0.5 shadow-sm flex items-center text-[10px] font-bold text-yellow-600">
                          <Star className="w-2.5 h-2.5 fill-current mr-0.5" />
                          {userRating}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{user?.name} <span className="text-gray-400 font-normal">to join</span> {activity?.title}</h4>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user?.interests.slice(0, 3).map(interest => (
                          <span key={interest} className="text-[9px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full font-bold uppercase">
                            {interest}
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-gray-600 mt-2 italic border-l-2 border-indigo-100 pl-3">"{reg.message}"</p>
                    </div>
                  </div>
                  <div className="flex space-x-2 w-full md:w-auto">
                    <button 
                      onClick={() => onUpdateStatus(reg.id, RegistrationStatus.REJECTED)}
                      className="flex-1 md:flex-none p-3 rounded-xl border border-red-100 text-red-500 hover:bg-red-50 transition-all"
                    >
                      <X className="w-5 h-5 mx-auto" />
                    </button>
                    <button 
                      onClick={() => onUpdateStatus(reg.id, RegistrationStatus.APPROVED)}
                      className="flex-1 md:flex-none p-3 bg-green-600 text-white rounded-xl shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
                    >
                      <Check className="w-5 h-5 mx-auto" />
                    </button>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-20 bg-gray-50 rounded-2xl text-gray-500">
                All clear! No pending applications.
              </div>
            )}
          </div>
        )}

        {tab === 'my-events' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {myActivities.length > 0 ? myActivities.map(act => {
              const isPast = new Date(act.dateTime) < new Date();
              const participants = registrations.filter(r => r.activityId === act.id && r.status === RegistrationStatus.APPROVED);
              
              return (
                <div key={act.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-lg text-gray-900">{act.title}</h4>
                    <button 
                      onClick={() => onSelectActivity(act.id)}
                      className="p-1 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mb-6">
                    <Clock className="w-4 h-4 mr-2" /> {new Date(act.dateTime).toLocaleString()}
                  </div>
                  
                  {isPast ? (
                    <div className="space-y-3">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Event Completed</p>
                      <div className="flex flex-wrap gap-2">
                        {participants.map(p => {
                          const u = MOCK_USERS.find(user => user.id === p.userId);
                          if (!u) return null;
                          return (
                            <button
                              key={p.id}
                              onClick={() => onReviewRequest(u, act)}
                              className="flex items-center space-x-2 bg-yellow-50 text-yellow-700 px-3 py-2 rounded-xl text-xs font-bold hover:bg-yellow-100 transition-all"
                            >
                              <Star className="w-3 h-3 fill-current" />
                              <span>Rate {u.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <button 
                      onClick={() => onOpenChat(act.id)}
                      className="w-full flex items-center justify-center space-x-2 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold hover:bg-indigo-100 transition-all"
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Open Chat</span>
                    </button>
                  )}
                </div>
              );
            }) : (
              <div className="col-span-full text-center py-20 bg-gray-50 rounded-2xl text-gray-500">
                You haven't hosted any events yet.
              </div>
            )}
          </div>
        )}

        {tab === 'my-apps' && (
          <div className="space-y-4">
            {myApplications.length > 0 ? myApplications.map(reg => {
              const activity = activities.find(a => a.id === reg.activityId);
              const isPast = activity ? new Date(activity.dateTime) < new Date() : false;
              
              return (
                <div key={reg.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h4 className="font-bold text-gray-900">{activity?.title}</h4>
                    <p className="text-sm text-gray-500">{activity?.location}</p>
                    <div className="mt-3 flex items-center space-x-3">
                      {getStatusBadge(reg.status)}
                      {reg.status === RegistrationStatus.APPROVED && !isPast && (
                        <button 
                          onClick={() => onOpenChat(activity!.id)}
                          className="flex items-center text-indigo-600 font-bold text-xs hover:underline"
                        >
                          <MessageCircle className="w-3 h-3 mr-1" /> Open Chat
                        </button>
                      )}
                      {reg.status === RegistrationStatus.APPROVED && isPast && (
                        <button 
                          onClick={() => {
                            const org = MOCK_USERS.find(u => u.id === activity?.organizerId);
                            if (org && activity) onReviewRequest(org, activity);
                          }}
                          className="flex items-center text-yellow-600 font-bold text-xs hover:underline"
                        >
                          <Star className="w-3 h-3 mr-1 fill-current" /> Rate Organizer
                        </button>
                      )}
                    </div>
                  </div>
                  <button 
                    onClick={() => onSelectActivity(activity!.id)}
                    className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              );
            }) : (
              <div className="text-center py-20 bg-gray-50 rounded-2xl text-gray-500">
                You haven't applied for any activities yet.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
