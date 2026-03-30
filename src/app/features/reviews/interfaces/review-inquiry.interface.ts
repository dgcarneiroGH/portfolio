export interface ReviewInquiry {
  fullName?: string;
  email: string;
  message: string;
  rating: number;
  creationDate: string;
  origin: 'nomacoda_portfolio';
}
