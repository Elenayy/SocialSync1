
export enum RegistrationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  interests: string[];
}

export interface Review {
  id: string;
  fromUserId: string;
  toUserId: string;
  activityId: string;
  rating: number; // 1-5
  comment: string;
  timestamp: number;
}

export interface Registration {
  id: string;
  activityId: string;
  userId: string;
  message: string;
  status: RegistrationStatus;
  timestamp: number;
}

export interface Activity {
  id: string;
  title: string;
  description: string;
  organizerId: string;
  dateTime: string;
  location: string;
  officialLink: string;
  expectedHeadcount: number;
  pricePerPerson: number;
  category: string;
  imageUrl: string;
}

export interface ChatMessage {
  id: string;
  activityId: string;
  senderId: string;
  text: string;
  timestamp: number;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  read: boolean;
  activityId?: string;
  timestamp: number;
}
