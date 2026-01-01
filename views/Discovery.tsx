
import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Plus, Sparkles } from 'lucide-react';
import { Activity } from '../types';
import { CATEGORIES, MOCK_USERS } from '../constants';
import { getSmartRecommendations } from '../services/gemini';

interface DiscoveryProps {
  activities: Activity[];
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  onSelectActivity: (id: string) => void;
  onCreateRequest: () => void;
  userBio: string;
}

const Discovery: React.FC<DiscoveryProps> = ({ 
  activities, 
  searchQuery, 
  setSearchQuery, 
  selectedCategory, 
  setSelectedCategory,
  onSelectActivity,
  onCreateRequest,
  userBio
}) => {
  const [recs, setRecs] = useState<string[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(false);

  useEffect(() => {
    const fetchRecs = async () => {
      if (!userBio) return;
      setLoadingRecs(true);
      const activitySummary = activities.map(a => `${a.title}: ${a.description}`).join('; ');
      const response = await getSmartRecommendations(userBio, activitySummary);
      if (response) {
        setRecs(response.split('\n').map(r => r.trim().replace(/^\d+\.\s*/, '')));
      }
      setLoadingRecs(false);
    };
    fetchRecs();
  }, [userBio, activities.length]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Discover Activities</h1>
          <p className="text-gray-500">Find new people for events you're excited about.</p>
        </div>
        <button 
          onClick={onCreateRequest}
          className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md hover:bg-indigo-700 transition-all flex items-center justify-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Post an Event
        </button>
      </div>

      {/* AI Recommendations */}
      {recs.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-start space-x-3">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-indigo-900">AI Suggested for You</h3>
            <p className="text-xs text-indigo-700 mb-2">Based on your interests, we think you'd love these:</p>
            <div className="flex flex-wrap gap-2">
              {recs.map((rec, i) => (
                <span key={i} className="bg-white px-3 py-1 rounded-full text-xs font-medium text-indigo-600 border border-indigo-200">
                  {rec}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text"
            placeholder="Search activities, locations, vibes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all bg-white"
        >
          <option value="All">All Categories</option>
          {CATEGORIES.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {activities.map(activity => (
          <div 
            key={activity.id}
            onClick={() => onSelectActivity(activity.id)}
            className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all cursor-pointer overflow-hidden flex flex-col"
          >
            <div className="relative h-48 overflow-hidden">
              <img 
                src={activity.imageUrl} 
                alt={activity.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  {activity.category}
                </span>
              </div>
            </div>
            <div className="p-5 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-gray-900 mb-2">{activity.title}</h3>
              <p className="text-gray-600 text-sm line-clamp-2 mb-4 flex-1">
                {activity.description}
              </p>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-500 text-sm">
                  <Calendar className="w-4 h-4 mr-2 text-indigo-400" />
                  {new Date(activity.dateTime).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className="flex items-center text-gray-500 text-sm">
                  <MapPin className="w-4 h-4 mr-2 text-indigo-400" />
                  {activity.location}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center">
                  <img 
                    src={MOCK_USERS.find(u => u.id === activity.organizerId)?.avatar} 
                    className="w-6 h-6 rounded-full border border-white"
                  />
                  <span className="text-xs text-gray-500 ml-2">Hosted by {MOCK_USERS.find(u => u.id === activity.organizerId)?.name}</span>
                </div>
                <div className="text-right">
                  <span className="block text-xs text-gray-400">Approx. price</span>
                  <span className="text-indigo-600 font-bold">£{activity.pricePerPerson}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {activities.length === 0 && (
        <div className="text-center py-20 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
          <p className="text-gray-500 mb-4 text-lg">No activities found matching your criteria.</p>
          <button 
            onClick={() => {setSearchQuery(''); setSelectedCategory('All');}}
            className="text-indigo-600 font-semibold hover:underline"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Discovery;
