
import React, { useState } from 'react';
import { User, Review } from '../types';
import { INTEREST_OPTIONS } from '../constants';
import { generateBioFromInterests } from '../services/gemini';
import { Edit2, Save, X, Star, Sparkles, User as UserIcon, Tag } from 'lucide-react';

interface ProfileProps {
  user: User;
  reviews: Review[];
  onUpdateUser: (updatedUser: User) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, reviews, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User>(user);
  const [isGenerating, setIsGenerating] = useState(false);

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 'New';

  const toggleInterest = (interest: string) => {
    const interests = editedUser.interests.includes(interest)
      ? editedUser.interests.filter(i => i !== interest)
      : [...editedUser.interests, interest];
    setEditedUser({ ...editedUser, interests });
  };

  const handleMagicBio = async () => {
    if (editedUser.interests.length === 0) return alert("Select some interests first!");
    setIsGenerating(true);
    const bio = await generateBioFromInterests(editedUser.interests);
    setEditedUser({ ...editedUser, bio });
    setIsGenerating(false);
  };

  const handleSave = () => {
    onUpdateUser(editedUser);
    setIsEditing(false);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="relative group">
            <img src={isEditing ? editedUser.avatar : user.avatar} className="w-32 h-32 rounded-3xl object-cover border-4 border-indigo-50" />
            {isEditing && (
              <div className="mt-2 text-center">
                <input 
                  type="text" 
                  value={editedUser.avatar} 
                  onChange={e => setEditedUser({...editedUser, avatar: e.target.value})}
                  className="text-[10px] w-full p-1 border rounded text-gray-500"
                  placeholder="Avatar URL"
                />
              </div>
            )}
          </div>

          <div className="flex-1 space-y-4 text-center md:text-left">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{user.name}</h1>
                <div className="flex items-center justify-center md:justify-start mt-1 text-indigo-600 font-bold">
                  <Star className="w-4 h-4 fill-current mr-1" />
                  <span>{averageRating} Rating</span>
                  <span className="text-gray-400 font-normal ml-2">({reviews.length} reviews)</span>
                </div>
              </div>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className={`flex items-center justify-center px-6 py-2 rounded-xl font-bold transition-all ${
                  isEditing ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
              >
                {isEditing ? <><Save className="w-4 h-4 mr-2" /> Save Profile</> : <><Edit2 className="w-4 h-4 mr-2" /> Edit Profile</>}
              </button>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-gray-400 uppercase">Short Bio</label>
                    <button 
                      onClick={handleMagicBio}
                      disabled={isGenerating}
                      className="text-xs font-bold text-indigo-600 flex items-center hover:underline"
                    >
                      <Sparkles className="w-3 h-3 mr-1" /> {isGenerating ? 'Drafting...' : 'Generate with AI'}
                    </button>
                  </div>
                  <textarea 
                    value={editedUser.bio}
                    onChange={e => setEditedUser({...editedUser, bio: e.target.value})}
                    className="w-full p-4 rounded-2xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 text-sm"
                    rows={2}
                  />
                </div>
              </div>
            ) : (
              <p className="text-gray-600 leading-relaxed max-w-xl">{user.bio}</p>
            )}

            <div className="space-y-3">
              <label className="text-xs font-bold text-gray-400 uppercase flex items-center">
                <Tag className="w-3 h-3 mr-1" /> My Interests
              </label>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                {(isEditing ? INTEREST_OPTIONS : user.interests).map(interest => (
                  <button
                    key={interest}
                    disabled={!isEditing}
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      (isEditing ? editedUser.interests : user.interests).includes(interest)
                        ? 'bg-indigo-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <UserIcon className="w-5 h-5 mr-2 text-indigo-500" /> Community Reviews
          </h2>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-1 text-yellow-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : 'text-gray-200'}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">
                      {new Date(review.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-gray-700 italic text-sm">"{review.comment}"</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-3xl py-12 text-center text-gray-400 border-2 border-dashed">
              No reviews yet. Attend events to build your reputation!
            </div>
          )}
        </div>
        
        <div className="space-y-6">
           <div className="bg-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-100">
             <h3 className="font-bold text-lg mb-2">Build Trust</h3>
             <p className="text-sm text-indigo-100 leading-relaxed">
               Organizers often select participants based on their community rating and interests. Keep your profile updated to increase your chances!
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
