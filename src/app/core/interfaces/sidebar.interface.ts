export type DockIcon = 'linkedin' | 'instagram' | 'github' | 'cv' | 'email' | 'whatsapp';

export interface SocialMediaLinks {
  title: string;
  profileUrl: string;
  icon: DockIcon;
}