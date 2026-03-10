export interface ContactInquiry {
  fullName: string; // obligatorio, min 3
  email: string; // obligatorio, formato email
  message: string; // obligatorio, min 10
  creationDate: string; // ISO-8601
  origin: 'nomacoda_portfolio';
}
