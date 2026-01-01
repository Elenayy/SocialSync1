
import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Link as LinkIcon, 
  Users, 
  CreditCard, 
  Image as ImageIcon,
  Sparkles
} from 'lucide-react';
import { Activity, User } from '../types';
import { CATEGORIES } from '../constants';
import { generateEventDescription } from '../services/gemini';

interface CreateActivityProps {
  currentUser: User;
  onSubmit: (activity: Activity) => void;
  onCancel: () => void;
}

const CreateActivity: React.FC<CreateActivityProps> = ({ currentUser, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: CATEGORIES[0],
    description: '',
    dateTime: '',
    location: '',
    officialLink: '',
    expectedHeadcount: 4,
    pricePerPerson: 0
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleMagicFill = async () => {
    if (!formData.title) return alert("Please enter an event name first!");
    setIsGenerating(true);
    const desc = await generateEventDescription(formData.title, formData.category);
    setFormData(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newActivity: Activity = {
      ...formData,
      id: Math.random().toString(36).substr(2, 9),
      organizerId: currentUser.id,
      imageUrl: `https://picsum.photos/seed/${formData.title}/800/400`
    };
    onSubmit(newActivity);
  };

  return (
    <div className="max-w-3xl mx-auto pb-20 animate-in fade-in zoom-in-95 duration-300">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900">Host New Event</h1>
        <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
          <X className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">What's the Event?</label>
              <input 
                required
                type="text"
                placeholder="e.g. Winter Wonderland"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Category</label>
              <select 
                value={formData.category}
                onChange={e => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between">
              <label className="text-sm font-bold text-gray-700">Description</label>
              <button 
                type="button"
                onClick={handleMagicFill}
                className="text-xs font-bold text-indigo-600 flex items-center hover:underline disabled:opacity-50"
                disabled={isGenerating}
              >
                <Sparkles className="w-3 h-3 mr-1" /> {isGenerating ? 'AI Thinking...' : 'AI Help'}
              </button>
            </div>
            <textarea 
              required
              rows={3}
              placeholder="Tell people what makes this event special..."
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Date & Time</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  required
                  type="datetime-local"
                  value={formData.dateTime}
                  onChange={e => setFormData({ ...formData, dateTime: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  required
                  type="text"
                  placeholder="Street name or venue"
                  value={formData.location}
                  onChange={e => setFormData({ ...formData, location: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-bold text-gray-700">Official Website Link</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                required
                type="url"
                placeholder="https://..."
                value={formData.officialLink}
                onChange={e => setFormData({ ...formData, officialLink: e.target.value })}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Helps others verify prices and details</p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 flex items-center">
                <Users className="w-4 h-4 mr-2 text-indigo-500" /> Target Group Size
              </label>
              <input 
                type="number"
                min={2}
                max={50}
                value={formData.expectedHeadcount}
                onChange={e => setFormData({ ...formData, expectedHeadcount: parseInt(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700 flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-indigo-500" /> Est. Price (£)
              </label>
              <input 
                type="number"
                min={0}
                value={formData.pricePerPerson}
                onChange={e => setFormData({ ...formData, pricePerPerson: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 py-4 border border-gray-200 rounded-2xl font-bold text-gray-600 hover:bg-gray-50 transition-all"
          >
            Cancel
          </button>
          <button 
            type="submit"
            className="flex-[2] py-4 bg-indigo-600 text-white rounded-2xl font-extrabold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
          >
            Create Event
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateActivity;
