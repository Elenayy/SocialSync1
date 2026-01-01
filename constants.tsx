
import React from 'react';

export const CATEGORIES = [
  'Festival',
  'Concert',
  'Workshop',
  'Sports',
  'Dining',
  'Exhibition',
  'Other'
];

export const INTEREST_OPTIONS = [
  'Photography', 'Hiking', 'Live Music', 'Art', 'Coding', 'Cooking', 
  'Board Games', 'Yoga', 'Wine Tasting', 'Travel', 'Cinema', 'Reading'
];

export const MOCK_USERS = [
  {
    id: 'u1',
    name: 'Alex Johnson',
    avatar: 'https://picsum.photos/seed/alex/200',
    bio: 'Avid explorer and music lover.',
    interests: ['Live Music', 'Hiking', 'Travel']
  },
  {
    id: 'u2',
    name: 'Sarah Chen',
    avatar: 'https://picsum.photos/seed/sarah/200',
    bio: 'Photographer and foodie.',
    interests: ['Photography', 'Cooking', 'Art']
  },
  {
    id: 'u3',
    name: 'Marcus Miller',
    avatar: 'https://picsum.photos/seed/marcus/200',
    bio: 'Tech enthusiast and hiker.',
    interests: ['Coding', 'Board Games', 'Hiking']
  }
];

export const MOCK_REVIEWS = [
  {
    id: 'r1',
    fromUserId: 'u2',
    toUserId: 'u1',
    activityId: 'a1',
    rating: 5,
    comment: 'Alex was a great organizer! Very communicative.',
    timestamp: Date.now() - 86400000 * 5
  }
];

export const INITIAL_ACTIVITIES = [
  {
    id: 'a1',
    title: 'Winter Wonderland London',
    description: 'Looking for a group to enjoy the rides and mulled wine at Hyde Park!',
    organizerId: 'u1',
    dateTime: '2024-12-15T18:00',
    location: 'Hyde Park, London',
    officialLink: 'https://hydeparkwinterwonderland.com',
    expectedHeadcount: 6,
    pricePerPerson: 25,
    category: 'Festival',
    imageUrl: 'https://picsum.photos/seed/winter/800/400'
  },
  {
    id: 'a2',
    title: 'Modern Art Workshop',
    description: 'A weekend workshop exploring abstract expressionism. No experience needed.',
    organizerId: 'u2',
    dateTime: '2024-11-20T10:00',
    location: 'Tate Modern, London',
    officialLink: 'https://tate.org.uk',
    expectedHeadcount: 4,
    pricePerPerson: 15,
    category: 'Workshop',
    imageUrl: 'https://picsum.photos/seed/art/800/400'
  }
];
