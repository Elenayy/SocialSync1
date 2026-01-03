
import React from 'react';
import { MessageSquare, Users, ChevronRight, MessageCircle } from 'lucide-react';
import { Activity, Registration, RegistrationStatus, User } from '../types';

interface InboxProps {
  activities: Activity[];
  registrations: Registration[];
  currentUser: User;
  onOpenChat: (activityId: string) => void;
  allUsers: User[];
}

const Inbox: React.FC<InboxProps> = ({ 
  activities, 
  registrations, 
  currentUser, 
  onOpenChat,
  allUsers
}) => {
  // Find all activities where the user is either the host or an approved participant
  const activeChatActivities = activities.filter(activity => {
    const isHost = activity.organizerId === currentUser.id;
    const isApprovedJoiner = registrations.some(r => 
      r.activityId === activity.id && 
      r.userId === currentUser.id && 
      r.status === RegistrationStatus.APPROVED
    );
    return isHost || isApprovedJoiner;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center space-x-3">
        <div className="bg-indigo-600 p-2 rounded-xl">
          <MessageSquare className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Group Chats</h1>
          <p className="text-gray-500">Coordinate with your companions here.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {activeChatActivities.length > 0 ? activeChatActivities.map(activity => {
          const isHost = activity.organizerId === currentUser.id;
          const participantCount = registrations.filter(r => 
            r.activityId === activity.id && 
            r.status === RegistrationStatus.APPROVED
          ).length + 1; // +1 for host

          return (
            <div 
              key={activity.id}
              onClick={() => onOpenChat(activity.id)}
              className="group bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center space-x-5">
                <div className="relative">
                  <img 
                    src={activity.imageUrl} 
                    className="w-16 h-16 rounded-2xl object-cover border border-gray-100" 
                  />
                  {isHost && (
                    <div className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-tighter shadow-sm">
                      Host
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {activity.title}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center text-xs text-gray-500">
                      <Users className="w-3 h-3 mr-1 text-indigo-400" />
                      {participantCount} participants
                    </div>
                    <div className="flex items-center text-xs text-green-500 font-semibold uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                      Active
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="hidden sm:block">
                   <button className="flex items-center space-x-2 bg-indigo-50 text-indigo-600 px-4 py-2 rounded-xl text-sm font-bold hover:bg-indigo-100 transition-all">
                    <MessageCircle className="w-4 h-4" />
                    <span>Open Chat</span>
                  </button>
                </div>
                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 transition-colors" />
              </div>
            </div>
          );
        }) : (
          <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 mb-2 font-medium">No active group chats found.</p>
            <p className="text-sm text-gray-400">Join an event or host your own to start chatting!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;
