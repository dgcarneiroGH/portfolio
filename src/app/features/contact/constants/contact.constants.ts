import { ContactMethod } from '../interfaces/contact.interface';

export const CONTACT_METHODS: ContactMethod[] = [
  {
    name: 'LinkedIn',
    url: 'https://www.linkedin.com/in/nomacoda/',
    iconSrc: 'assets/images/icons/linkedin.svg',
    info: 'Diego Carneiro Planes'
  },
  {
    name: 'Gmail',
    url: 'mailto:admin@nomacoda.com',
    iconSrc: 'assets/images/icons/gmail.svg',
    info: 'admin@nomacoda.com'
  },
  {
    name: 'Phone',
    url: 'tel:+34661206962',
    iconSrc: 'assets/images/icons/phone.svg',
    info: '+34 661 206 962'
  }
];
