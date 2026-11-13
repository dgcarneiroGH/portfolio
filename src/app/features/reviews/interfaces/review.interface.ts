export type ReviewVariant = 'teal' | 'amber' | 'sky' | 'emerald' | 'mint';

export interface Review {
  fullName: string;
  role?: string;
  message: string;
  rating: number;
  tag?: string;
  category?: string;
  variant?: ReviewVariant;
}
