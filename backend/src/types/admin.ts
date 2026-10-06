export interface LocalGuide {
  id: string;
  name: string;
  /** Free-text destination name, matched the same loose way Trip.destination is used elsewhere. */
  destination: string;
  languages: string[];
  specialty: string;
  bio: string | null;
  /**
   * Admin-supplied only — deliberately never auto-fetched. Reusing the
   * Wikipedia-name-lookup trick Places/Restaurants use for photos would
   * risk showing a real person a photo of an unrelated namesake, which is
   * a much worse failure than just showing no photo.
   */
  photoUrl: string | null;
  /** The redirect target — ToursByLocals/Viator/Airbnb Experiences profile. */
  profileUrl: string;
  createdAt: string;
  updatedAt: string;
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

export interface AdminSession {
  isAdmin: boolean;
}
