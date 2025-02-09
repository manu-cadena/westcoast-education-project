export interface Course {
  id: string;
  title: string;
  courseNumber: string;
  duration: string;
  cost: string;
  availability: string;
  image: string;
  dates: string;
  popular: boolean;
  description: string;
}

export interface Booking {
  id: string;
  userId: string;
  courses: { id: string }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
}
