/**
 * Secciones del one-pager del portfolio, en el orden en que se apilan en
 * pantalla y con la ruta del router que las representa.
 *
 * `id` es el id del envoltorio en el DOM (lo usa el scroll-spy y
 * `scrollIntoView`); `url` es la ruta del router que activa el
 * `routerLinkActive` correspondiente del navbar.
 */
export const SECTIONS = [
  { id: 'home', url: '/' },
  { id: 'about-me', url: '/about-me' },
  { id: 'success-cases', url: '/success-cases' },
  { id: 'reviews', url: '/reviews' },
  { id: 'contact', url: '/contact' }
] as const;

export type SectionId = (typeof SECTIONS)[number]['id'];

export function isSectionId(value: string): value is SectionId {
  return SECTIONS.some((section) => section.id === value);
}
