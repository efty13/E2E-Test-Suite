export interface TalentProfile {
  id: number;
  firstName: string;
  lastName: string;
  height: string;      // cm
  weight: string;      // kg
  eyeColor: string;
  hairColor: string;
  photoDataUrl: string; // base64 — FileReader.readAsDataURL çıktısı
}
