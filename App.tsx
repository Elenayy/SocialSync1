
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  User as UserIcon, 
  Bell, 
  Compass, 
  Calendar, 
  Users, 
  Star,
  ChevronDown
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

// --- Views ---
import Discovery from './views/Discovery';
import ActivityDetail from './views/ActivityDetail';
import CreateActivity from './views/CreateActivity';
import Dashboard from './views/Dashboard';
import ChatView from './views/ChatView';
import Profile from './views/Profile';
import ReviewModal from './views/ReviewModal';

const App: React.FC = () => {
  // State
  const [allUsers, setAllUsers] = useState<User[]>(MOCK_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(MOCK_USERS[0]);
  const [activities, setActivities] = useState<Activity[]>(INITIAL_ACTIVITIES);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [reviews, setReviews] = useState<Review[]>(MOCK_REVIEWS);
  
  // Navigation State
  const [currentView, setCurrentView] = useState<'discovery' | 'detail' | 'create' | 'dashboard' | 'chat' | 'profile'>('discovery');
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);

  // Review System State
  const [reviewTarget, setReviewTarget] = useState<{ user: User, activity: Activity } | null>(null);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Load from local storage
  useEffect(() => {
    const savedUsers = localStorage.getItem('ss_all_users');
    const savedActivities = localStorage.getItem('ss_activities');
    const savedRegs = localStorage.getItem('ss_registrations');
    const savedNotifs = localStorage.getItem('ss_notifications');
    const savedMsgs = localStorage.getItem('ss_messages');
    const savedReviews = localStorage.getItem('ss_reviews');
    const savedUserId = localStorage.getItem('ss_current_user_id');

    if (savedUsers) {
      const parsedUsers = JSON.parse(savedUsers);
      setAllUsers(parsedUsers);
      if (savedUserId) {
        const found = parsedUsers.find((u: User) => u.id === savedUserId);
        if (found) setCurrentUser(found);
      }
    }
    if (savedActivities) setActivities(JSON.parse(savedActivities));
    if (savedRegs) setRegistrations(JSON.parse(savedRegs));
    if (savedNotifs) setNotifications(JSON.parse(savedNotifs));
    if (savedMsgs) setMessages(JSON.parse(savedMsgs));
    if (savedReviews) setReviews(JSON.parse(savedReviews));
  }, []);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem('ss_all_users', JSON.stringify(allUsers));
    localStorage.setItem('ss_activities', JSON.stringify(activities));
    localStorage.setItem('ss_registrations', JSON.stringify(registrations));
    localStorage.setItem('ss_notifications', JSON.stringify(notifications));
    localStorage.setItem('ss_messages', JSON.stringify(messages));
    localStorage.setItem('ss_reviews', JSON.stringify(reviews));
    if (currentUser) localStorage.setItem('ss_current_user_id', currentUser.id);
  }, [allUsers, activities, registrations, notifications, messages, reviews, currentUser]);

  // Utility to get user rating
  const getUserRating = (userId: string) => {
    const userReviews = reviews.filter(r => r.toUserId === userId);
    if (userReviews.length === 0) return null;
    return (userReviews.reduce((acc, r) => acc + r.rating, 0) / userReviews.length).toFixed(1);
  };

  // Derived State
  const filteredActivities = useMemo(() => {
    return activities.filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           a.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [activities, searchQuery, selectedCategory]);

  const unreadNotifCount = notifications.filter(n => !n.read && n.userId === currentUser?.id).length;

  // Handlers
  const handleAddActivity = (newActivity: Activity) => {
    setActivities(prev => [newActivity, ...prev]);
    setCurrentView('discovery');
  };

  const handleUpdateUser = (updatedUser: User) => {
    setAllUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
    setCurrentUser(updatedUser);
  };

  const switchUser = (user: User) => {
    setCurrentUser(user);
    setShowUserSwitcher(false);
    setCurrentView('discovery');
  };

  const handleRegister = (activityId: string, message: string) => {
    if (!currentUser) return;
    const newReg: Registration = {
      id: Math.random().toString(36).substr(2, 9),
      activityId,
      userId: currentUser.id,
      message,
      status: RegistrationStatus.PENDING,
      timestamp: Date.now()
    };
    setRegistrations(prev => [...prev, newReg]);

    // Notify organizer
    const activity = activities.find(a => a.id === activityId);
    if (activity) {
      const newNotif: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        userId: activity.organizerId,
        title: 'New Registration',
        message: `${currentUser.name} wants to join "${activity.title}".`,
        read: false,
        activityId,
        timestamp: Date.now()
      };
      setNotifications(prev => [newNotif, ...prev]);
    }
  };

  const handleUpdateStatus = (regId: string, status: RegistrationStatus) => {
    setRegistrations(prev => prev.map(r => r.id === regId ? { ...r, status } : r));
    
    const reg = registrations.find(r => r.id === regId);
    const activity = activities.find(a => a.id === reg?.activityId);
    if (reg && activity) {
      const newNotif: Notification = {
        id: Math.random().toString(36).substr(2, 9),
        userId: reg.userId,
        title: status === RegistrationStatus.APPROVED ? 'Approved!' : 'Application Update',
        message: `Your application to "${activity.title}" was ${status.toLowerCase()}.`,
        read: false,
        activityId: activity.id,
        timestamp: Date.now()
      };
      setNotifications(prev => [newNotif, ...prev]);

      if (status === RegistrationStatus.APPROVED) {
        const joiner = allUsers.find(u => u.id === reg.userId);
        const sysMsg: ChatMessage = {
          id: Math.random().toString(36).substr(2, 9),
          activityId: activity.id,
          senderId: 'system',
          text: `${joiner?.name || 'A new person'} has joined the group!`,
          timestamp: Date.now()
        };
        setMessages(prev => [...prev, sysMsg]);
      }
    }
  };

  const submitReview = (rating: number, comment: string) => {
    if (!currentUser || !reviewTarget) return;
    const newReview: Review = {
      id: Math.random().toString(36).substr(2, 9),
      fromUserId: currentUser.id,
      toUserId: reviewTarget.user.id,
      activityId: reviewTarget.activity.id,
      rating,
      comment,
      timestamp: Date.now()
    };
    setReviews(prev => [...prev, newReview]);
    setReviewTarget(null);

    const newNotif: Notification = {
      id: Math.random().toString(36).substr(2, 9),
      userId: reviewTarget.user.id,
      title: 'New Review!',
      message: `Someone reviewed your participation in "${reviewTarget.activity.title}".`,
      read: false,
      timestamp: Date.now()
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const sendMessage = (activityId: string, text: string) => {
    if (!currentUser) return;
    const newMsg: ChatMessage = {
      id: Math.random().toString(36).substr(2, 9),
      activityId,
      senderId: currentUser.id,
      text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newMsg]);
  };

  const markNotifsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navigation */}
      <nav className="glass-effect sticky top-0 z-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div 
              className="flex items-center cursor-pointer" 
              onClick={() => setCurrentView('discovery')}
            >
              <div className="bg-indigo-600 p-1.5 rounded-lg mr-2">
                <Users className="text-white w-5 h-5" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                SocialSync
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <button 
                onClick={() => setCurrentView('discovery')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'discovery' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600'}`}
              >
                <Compass className="w-4 h-4 mr-2" /> Explore
              </button>
              <button 
                onClick={() => setCurrentView('dashboard')}
                className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${currentView === 'dashboard' ? 'text-indigo-600 bg-indigo-50' : 'text-gray-600 hover:text-indigo-600'}`}
              >
                <Calendar className="w-4 h-4 mr-2" /> My Activities
              </button>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-4">
              <button 
                onClick={() => {
                  setCurrentView('dashboard');
                  markNotifsRead();
                }}
                className="relative p-2 text-gray-500 hover:text-indigo-600 transition-colors"
              >
                <Bell className="w-5 h-5" />
                {unreadNotifCount > 0 && (
                  <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {unreadNotifCount}
                  </span>
                )}
              </button>
              
              <div className="relative">
                <div 
                  className={`flex items-center space-x-2 border-l pl-2 sm:pl-4 border-gray-200 cursor-pointer hover:opacity-80 transition-opacity ${currentView === 'profile' ? 'text-indigo-600' : ''}`}
                  onClick={() => setShowUserSwitcher(!showUserSwitcher)}
                >
                  <img src={currentUser?.avatar} className="w-8 h-8 rounded-full border border-indigo-100" />
                  <div className="hidden sm:flex flex-col items-start leading-none">
                    <div className="flex items-center">
                      <span className="text-sm font-bold text-gray-700 mr-1">{currentUser?.name}</span>
                      <ChevronDown className="w-3 h-3 text-gray-400" />
                    </div>
                    <div className="flex items-center text-[10px] font-bold text-indigo-500">
                      <Star className="w-2.5 h-2.5 fill-current mr-0.5" />
                      {getUserRating(currentUser?.id || '') || 'New'}
                    </div>
                  </div>
                </div>

                {showUserSwitcher && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-[60] animate-in slide-in-from-top-2 duration-200">
                    <p className="px-4 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Switch User (Demo)</p>
                    {allUsers.map(user => (
                      <button
                        key={user.id}
                        onClick={() => switchUser(user)}
                        className={`w-full flex items-center px-4 py-2 text-sm hover:bg-indigo-50 transition-colors ${currentUser?.id === user.id ? 'bg-indigo-50 text-indigo-600 font-bold' : 'text-gray-700'}`}
                      >
                        <img src={user.avatar} className="w-6 h-6 rounded-full mr-2" />
                        {user.name}
                      </button>
                    ))}
                    <div className="border-t border-gray-50 mt-2 pt-2">
                      <button
                        onClick={() => { setCurrentView('profile'); setShowUserSwitcher(false); }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-indigo-600 flex items-center"
                      >
                        <UserIcon className="w-4 h-4 mr-2" /> View Profile
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
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
            messages={messages.filter(m => m.activityId === selectedActivityId)}
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
            onUpdateUser={handleUpdateUser}
          />
        )}
      </main>

      {/* Modals */}
      {reviewTarget && (
        <ReviewModal 
          targetUser={reviewTarget.user}
          activity={reviewTarget.activity}
          onClose={() => setReviewTarget(null)}
          onSubmit={submitReview}
        />
      )}

      {/* Persistent CTA - Mobile */}
      {currentView === 'discovery' && (
        <div className="fixed bottom-6 right-6 sm:hidden">
          <button 
            onClick={() => setCurrentView('create')}
            className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 active:scale-95 transition-all"
          >
            <Plus className="w-6 h-6" />
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
