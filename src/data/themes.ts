import { IconName } from '@/types/icons';

export interface Theme {
  id: string;
  title: string;
  description: string;
  iconName: IconName;
  color: string;
  question: string;
}

export const themes: Theme[] = [
  {
    id: 'exposure',
    title: 'Early Exposure',
    description: 'First encounters with computers and programming',
    iconName: 'code', // Use string identifiers instead of components
    color: 'bg-blue-500',
    question: 'How did you first get into computers, technology, or programming?'
  },
  {
    id: 'mission-values',
    title: 'Personal Mission & Values',
    description: 'Motivations and beliefs driving open source involvement',
    iconName: 'heart',
    color: 'bg-red-500',
    question: 'What got you into open source specifically? What personal beliefs, values, or experiences have shaped who you are?'
  },
  {
    id: 'education',
    title: 'Education & Mentorship',
    description: 'Who influenced your journey?',
    iconName: 'graduation-cap',
    color: 'bg-yellow-500',
    question: 'Who were people, areas of study, or ideas that have influenced you?'
  },
  {
    id: 'challenges',
    title: 'Challenges & Growth',
    description: 'Overcoming obstacles in open source',
    iconName: 'mountain',
    color: 'bg-orange-500',
    question: 'What have been challenges you or the open source community have faced?'
  },
  {
    id: 'projects',
    title: 'Open Source Projects',
    description: 'Projects and contributions',
    iconName: 'code-2',
    color: 'bg-indigo-500',
    question: 'What open source projects have you been involved with?'
  },
  {
    id: 'community',
    title: 'Community & Collaboration',
    description: 'Building and nurturing open source communities',
    iconName: 'users',
    color: 'bg-green-500',
    question: 'What can you tell me about how people have come together as a community?'
  },
  {
    id: 'evolution',
    title: 'Evolution of Open Source',
    description: 'How open source has changed over time',
    iconName: 'history',
    color: 'bg-purple-500',
    question: 'How has open source changed over time?'
  }
]; 