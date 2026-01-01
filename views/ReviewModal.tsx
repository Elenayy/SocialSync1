
import React, { useState } from 'react';
import { X, Star, Send } from 'lucide-react';
import { User, Activity } from '../types';

interface ReviewModalProps {
  targetUser: User;
  activity: Activity;
  onSubmit: (rating: number, comment: string) => void;
  onClose: () => void;
}

const ReviewModal: React.FC<ReviewModalProps> = ({ targetUser, activity, onSubmit, onClose }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredRating, setHoveredRating] = useState(0);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
          <h3 className="font-bold text-gray-900">Review Companion</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-8 space-y-6 text-center">
          <div className="flex flex-col items-center">
            <img src={targetUser.avatar} className="w-20 h-20 rounded-full border-4 border-indigo-50 shadow-md mb-4" />
            <h4 className="text-xl font-bold text-gray-900">{targetUser.name}</h4>
            <p className="text-sm text-gray-500">at {activity.title}</p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Rate your experience</p>
            <div className="flex justify-center space-x-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="p-1 transition-transform hover:scale-110"
                >
                  <Star 
                    className={`w-10 h-10 ${
                      star <= (hoveredRating || rating) 
                        ? 'fill-yellow-400 text-yellow-400' 
                        : 'text-gray-200'
                    } transition-colors`} 
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 text-left">
            <label className="text-xs font-bold text-gray-400 uppercase ml-1">Optional Comment</label>
            <textarea
              placeholder="How was it meeting them?"
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full p-4 rounded-2xl border border-gray-100 focus:ring-2 focus:ring-indigo-500 text-sm h-24"
            />
          </div>

          <button 
            onClick={() => onSubmit(rating, comment)}
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-2"
          >
            <span>Submit Review</span>
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;
