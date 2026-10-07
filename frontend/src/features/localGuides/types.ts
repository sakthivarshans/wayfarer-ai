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
