import { IconName } from '@/types/icons';

export interface KeywordCategory {
  id: string;
  title: string;
  description: string;
  iconName: IconName;
  color: string;
  keywords: string[];
}

export const keywordCategories: KeywordCategory[] = [
  {
    id: 'personal-background',
    title: 'Personal Background',
    description: 'Early life, education, and personal influences',
    iconName: 'sparkles',
    color: 'bg-blue-500',
    keywords: [
      'family',
      'childhood',
      'education',
      'early computing',
      'college',
      'career aspirations',
      'parental influence',
      'outdoor activities',
      'filmmaking',
      'early education'
    ]
  },
  {
    id: 'technical',
    title: 'Technical',
    description: 'Technical skills, programming, and development',
    iconName: 'code',
    color: 'bg-purple-500',
    keywords: [
      'programming',
      'computer engineering',
      'electrical engineering',
      'software development',
      'technical skills',
      'problem-solving',
      'storage technology',
      'firmware',
      'technical sales'
    ]
  },
  {
    id: 'career',
    title: 'Career & Professional',
    description: 'Professional experiences and career development',
    iconName: 'mountain',
    color: 'bg-green-500',
    keywords: [
      'career transition',
      'Silicon Valley',
      'management',
      'leadership',
      'work-life balance',
      'career satisfaction',
      'career impact',
      'career start',
      'career shift',
      'career changes',
      'major tech companies',
      'remote work',
      'career advice',
      'career challenges',
      'professional growth'
    ]
  },
  {
    id: 'open-source',
    title: 'Open Source',
    description: 'Open source projects, communities, and initiatives',
    iconName: 'code-2',
    color: 'bg-orange-500',
    keywords: [
      'open source',
      'FreeBSD',
      'Debian',
      'GPL',
      'free software',
      'open source community',
      'collaborative development',
      'open source promotion',
      'open source challenges',
      'open source specialization',
      'FreeBSD adoption'
    ]
  },
  {
    id: 'community',
    title: 'Community & Collaboration',
    description: 'Community building, collaboration, and networking',
    iconName: 'users',
    color: 'bg-indigo-500',
    keywords: [
      'community collaboration',
      'volunteer engagement',
      'international community',
      'knowledge sharing',
      'mentorship',
      'diversity',
      'stakeholders',
      'community growth',
      'future generations',
      'collaborative development'
    ]
  },
  {
    id: 'business',
    title: 'Business & Organization',
    description: 'Business aspects, funding, and organizational growth',
    iconName: 'heart',
    color: 'bg-yellow-500',
    keywords: [
      'funding',
      'corporate partnerships',
      'strategic planning',
      'nonprofit management',
      'foundation growth',
      'project proposals',
      'nonprofit expansion',
      'nonprofit funding',
      'business counseling',
      'technology law',
      'legal analysis'
    ]
  },
  {
    id: 'advocacy',
    title: 'Advocacy & Impact',
    description: 'Advocacy, social impact, and industry influence',
    iconName: 'graduation-cap',
    color: 'bg-red-500',
    keywords: [
      'advocacy',
      'STEM advocacy',
      'women in tech',
      'industry impact',
      'global outreach',
      'diversity',
      'perseverance',
      'inspiration',
      'gender challenges',
      'women in computing',
      'developing world'
    ]
  }
]; 