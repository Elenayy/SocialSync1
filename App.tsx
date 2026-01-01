
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Bell, 
  Compass, 
  LogOut,
  Calendar,
  Users,
  Star,
  Loader2
} from 'lucide-react';
import { 
  User, 
  Activity, 
  Registration, 
  RegistrationStatus, 
  ChatMessage, 
  Notification,
  Review
} from './types';
import { INITIAL_ACTIVITIES, MOCK_USERS, MOCK_REVIEWS } from './constants';
import { db } from './services/db';

// --- Views ---
import Discovery from './views/Discovery';
import ActivityDetail from './views/ActivityDetail';
import CreateActivity from './views/CreateActivity';
import Dashboard from './views/Dashboard';
import ChatView from './views/ChatView';
import Profile from './views/Profile';
import ReviewModal from './views/ReviewModal';
import Auth from './views/Auth';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);
  
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'discovery' | 'detail' | 'create' | 'dashboard' | 'chat' | 'profile'>('discovery');
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ user: User, activity: Activity } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Initial Load from "Database"
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      try {
        const [acts, regs, savedUser] = await Promise.all([
          db.getActivities(),
          db.getRegistrations(),
          localStorage.getItem('ss_currentUser')
        ]);
        
        // Only use mock data if DB returns nothing
        setActivities(acts.length > 0 ? acts : INITIAL_ACTIVITIES);
        setRegistrations(regs);
        if (savedUser) setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Load failed", e);
        setActivities(INITIAL_ACTIVITIES);
      } finally {
        setIsLoading(false);
      }
    };
    init();
  }, []);

  // Sync notifications and messages
  useEffect(() => {
    if (currentUser) {
      db.getNotifications(currentUser.id).then(setNotifications);
    }
  }, [currentUser, currentView]);

  // Specific effect for chat to handle real-time feeling
  useEffect(() => {
    let interval: any;
    if (selectedActivityId && currentView === 'chat') {
      const fetchMsgs = () => db.getMessages(selectedActivityId!).then(setMessages);
      fetchMsgs();
      // Poll every 3 seconds to simulate real-time if not using WebSockets yet
      interval = setInterval(fetchMsgs, 3000);
    }
    return () => clearInterval(interval);
  }, [selectedActivityId, currentView]);

  const getUserRating = (userId: string) => {
    const userReviews = reviews.filter(r => r.toUserId === userId);
    if (userReviews.length === 0) return null;
    return (userReviews.reduce((acc, r) => acc + r.rating, 0) / userReviews.length).toFixed(1);
  };

  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           a.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [activities, searchQuery, selectedCategory]);

  const unreadNotifCount = notifications.filter(n => !n.read && n.userId === currentUser?.id).length;

  const handleAddActivity = async (newActivity: Omit<Activity, 'id'>) => {
    try {
      const savedActivity = await db.saveActivity(newActivity);
      setActivities(prev => [savedActivity, ...prev]);
      setCurrentView('discovery');
    } catch (err: any) {
      console.error("Save failed:", err);
      alert(`Could not save event: ${err.message || 'Unknown error'}. Please check if you created the database tables and disabled RLS.`);
    }
  };

  const handleRegister = async (activityId: string, message: string) => {
    if (!currentUser) return;
    try {
      const newReg: Omit<Registration, 'id'> = {
        activityId,
        userId: currentUser.id,
        message,
        status: RegistrationStatus.PENDING,
        timestamp: Date.now()
      };
      await db.saveRegistration(newReg);
      
      // Re-fetch registrations to get the latest
      const updatedRegs = await db.getRegistrations();
      setRegistrations(updatedRegs);

      const activity = activities.find(a => a.id === activityId);
      if (activity) {
        const newNotif: Omit<Notification, 'id'> = {
          userId: activity.organizerId,
          title: 'New Registration',
          message: `${currentUser.name} wants to join "${activity.title}".`,
          read: false,
          activityId,
          timestamp: Date.now()
        };
        await db.saveNotification(newNotif);
      }
    } catch (err: any) {
      alert("Registration failed: " + err.message);
    }
  };

  const handleUpdateStatus = async (regId: string, status: RegistrationStatus) => {
    try {
      await db.updateRegistrationStatus(regId, status);
      setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status } : r));
      
      const reg = registrations.find(r => r.id === regId);
      const activity = activities.find(a => a.id === reg?.activityId);
      if (reg && activity) {
        const newNotif: Omit<Notification, 'id'> = {
          userId: reg.userId,
          title: status === RegistrationStatus.APPROVED ? 'Approved!' : 'Application Update',
          message: `Your application to "${activity.title}" was ${status.toLowerCase()}.`,
          read: false,
          activityId: activity.id,
          timestamp: Date.now()
        };
        await db.saveNotification(newNotif);

        if (status === RegistrationStatus.APPROVED) {
          const joiner = allUsers.find(u => u.id === reg.userId);
          const sysMsg: Omit<ChatMessage, 'id'> = {
            activityId: activity.id,
            senderId: 'system',
            text: `${joiner?.name || 'A new person'} has joined the group!`,
            timestamp: Date.now()
          };
          await db.saveMessage(sysMsg);
        }
      }
    } catch (err: any) {
      alert("Status update failed: " + err.message);
    }
  };

  const sendMessage = async (activityId: string, text: string) => {
    if (!currentUser) return;
    try {
      const newMsg: Omit<ChatMessage, 'id'> = {
        activityId,
        senderId: currentUser.id,
        text,
        timestamp: Date.now()
      };
      await db.saveMessage(newMsg);
      // We rely on polling to refresh messages for everyone
    } catch (err: any) {
      console.error("Chat failed:", err);
    }
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('ss_currentUser', JSON.stringify(user));
    setCurrentView('discovery');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('ss_currentUser');
    setCurrentView('discovery');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
        <p className="text-gray-500 font-medium">Syncing with community...</p>
      </div>
    );
  }

  if (!currentUser) {
    return <Auth onAuthSuccess={handleAuthSuccess} allUsers={allUsers} />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <nav className="glass-effect sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center cursor-pointer" onClick={() => setCurrentView('discovery')}>
              <div className="bg-indigo-600 p-1.5 rounded-lg mr-2">
                <Users className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                SocialSync
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <button onClick={() => setCurrentView('discovery')} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'discovery' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600'}`}>
                <Compass className="w-4 h-4 mr-2" /> Explore
              </button>
              <button onClick={() => setCurrentView('dashboard')} className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'dashboard' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600'}`}>
                <Calendar className="w-4 h-4 mr-2" /> My Activities
              </button>
            </div>

            <div className="flex items-center space-x-4">
              <button onClick={() => { setCurrentView('dashboard'); }} className="relative p-2 text-gray-500 hover:text-indigo-600 transition-colors">
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadNotifCount}
                  </span>
                )}
              </button>
              <div className={`flex items-center space-x-2 border-l pl-4 border-gray-200 cursor-pointer hover:opacity-80 transition-opacity ${currentView === 'profile' ? 'text-indigo-600' : ''}`} onClick={() => setCurrentView('profile')}>
                <img src={currentUser?.avatar} className="w-8 h-8 rounded-full border border-indigo-100" />
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="text-sm font-bold text-gray-700">{currentUser?.name}</span>
                  <div className="flex items-center text-[10px] font-bold text-indigo-500">
                    <Star className="w-2.5 h-2.5 fill-current mr-0.5" />
                    {getUserRating(currentUser?.id || '') || 'New'}
                  </div>
                </div>
              </div>
              <button onClick={handleLogout} className="p-2 text-gray-400 hover:text-red-600 transition-colors" title="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'discovery' && (
          <Discovery 
            activities={filteredActivities} 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            onSelectActivity={(id) => {
              setSelectedActivityId(id);
              setCurrentView('detail');
            }}
            onCreateRequest={() => setCurrentView('create')}
            userBio={currentUser?.bio || ''}
            allUsers={allUsers}
          />
        )}

        {currentView === 'detail' && selectedActivityId && (
          <ActivityDetail 
            activity={activities.find(a => a.id === selectedActivityId)!}
            currentUser={currentUser!}
            registrations={registrations.filter(r => r.activityId === selectedActivityId)}
            onRegister={handleRegister}
            onBack={() => setCurrentView('discovery')}
            onOpenChat={() => setCurrentView('chat')}
            getRating={getUserRating}
            allUsers={allUsers}
          />
        )}

        {currentView === 'create' && (
          <CreateActivity 
            currentUser={currentUser!}
            onSubmit={handleAddActivity}
            onCancel={() => setCurrentView('discovery')}
          />
        )}

        {currentView === 'dashboard' && (
          <Dashboard 
            activities={activities}
            registrations={registrations}
            notifications={notifications}
            currentUser={currentUser!}
            onUpdateStatus={handleUpdateStatus}
            onSelectActivity={(id) => {
              setSelectedActivityId(id);
              setCurrentView('detail');
            }}
            onOpenChat={(id) => {
              setSelectedActivityId(id);
              setCurrentView('chat');
            }}
            getRating={getUserRating}
            onReviewRequest={(user, activity) => setReviewTarget({ user, activity })}
            allUsers={allUsers}
          />
        )}

        {currentView === 'chat' && selectedActivityId && (
          <ChatView 
            activity={activities.find(a => a.id === selectedActivityId)!}
            messages={messages}
            currentUser={currentUser!}
            onSendMessage={(text) => sendMessage(selectedActivityId, text)}
            onBack={() => setCurrentView('dashboard')}
            allUsers={allUsers}
          />
        )}

        {currentView === 'profile' && currentUser && (
          <Profile 
            user={currentUser}
            reviews={reviews.filter(r => r.toUserId === currentUser.id)}
            onUpdateUser={setCurrentUser}
          />
        )}
      </main>

      {reviewTarget && (
        <ReviewModal 
          targetUser={reviewTarget.user}
          activity={reviewTarget.activity}
          onClose={() => setReviewTarget(null)}
          onSubmit={(rating, comment) => {
             // Review logic
             setReviewTarget(null);
          }}
        />
      )}
    </div>
  );
};

export default App;
