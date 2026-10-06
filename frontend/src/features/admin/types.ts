export interface AdminSession {
  isAdmin: boolean;
}

export interface DestinationCount {
  destination: string;
  count: number;
}

export interface AnalyticsSummary {
  totalUsers: number;
  totalTrips: number;
  topDestinations: DestinationCount[];
}

export interface LocalGuide {
  id: string;
  name: string;
  destination: string;
  languages: string[];
  specialty: string;
  bio: string | null;
  photoUrl: string | null;
  profileUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalGuideInput {
  name: string;
  destination: string;
  languages: string[];
  specialty: string;
  bio?: string;
  photoUrl?: string;
  profileUrl: string;
}
