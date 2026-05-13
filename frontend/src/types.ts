export interface TourPackage {
  id: number;
  title: string;
  description: string;
  price: string;
  location: string;
  start_date: string;
  end_date: string;
  image: string;
  slots: number;
}

export interface Booking {
  id: number;
  travel_date: string;
  number_of_people: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  package: {
    id: number;
    title: string;
    price: string;
    location: string;
  };
}

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface ApiError { detail?: string }

export interface UserProfile {
  id: number;
  username: string;
  email: string;
  is_agency: boolean;
  is_email_verified?: boolean;
  gender?: string;
  birth_date?: string;
  phone?: string;
  passport_no?: string;
  nationality?: string;
  address?: string;
  profile_picture?: string;
}