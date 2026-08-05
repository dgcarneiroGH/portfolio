export interface Experience {
  company: string;
  designation: string;
  yearRange: string;
  yearStart?: number;
  yearEnd?: number | 'Present' | 'Actualidad';
  role: string;
}
