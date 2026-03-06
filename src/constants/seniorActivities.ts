export interface SeniorActivity {
  id: string;
  name: string;
  icon: string;
  description: string;
  duration: number;
  difficulty: 'easy' | 'medium';
  instructions?: string[];
}

export const SENIOR_ACTIVITIES: Record<string, SeniorActivity[]> = {
  physical: [
    {
      id: 'walk',
      name: 'Tehalna / Walk',
      icon: '🚶',
      description: 'Ghar ke andar ya bahar 10 minute tehalna',
      duration: 10,
      difficulty: 'easy',
      instructions: ['Aaram se chalna shuru karein', 'Seedhe khade rahein', '10 minute tak chalein'],
    },
    {
      id: 'stretch',
      name: 'Kasrat / Stretching',
      icon: '🧘',
      description: 'Kursi par baith kar simple stretching',
      duration: 5,
      difficulty: 'easy',
      instructions: ['Kursi par baith jaayein', 'Haath upar uthayein', 'Dheere se stretch karein'],
    },
    {
      id: 'watering',
      name: 'Paudhon ko Paani',
      icon: '🪴',
      description: 'Apne paudhon ko paani dein',
      duration: 10,
      difficulty: 'easy',
    },
  ],
  creative: [
    {
      id: 'drawing',
      name: 'Drawing / Rangoli',
      icon: '🎨',
      description: 'Kuch simple drawing banayein',
      duration: 15,
      difficulty: 'easy',
    },
    {
      id: 'origami',
      name: 'Kagaz Modna',
      icon: '📄',
      description: 'Kagaz se simple shapes banayein',
      duration: 10,
      difficulty: 'medium',
    },
  ],
  mindful: [
    {
      id: 'breathing',
      name: 'Gehri Saans',
      icon: '🌬️',
      description: 'Gehri saans lein aur chhodein',
      duration: 5,
      difficulty: 'easy',
      instructions: ['5 second mein saans lein', '5 second hold karein', '5 second mein saans chhodein', '10 baar repeat karein'],
    },
    {
      id: 'gratitude',
      name: 'Shukrana',
      icon: '🙏',
      description: '3 cheezein sochein jinke liye aap shukrguzaar hain',
      duration: 5,
      difficulty: 'easy',
    },
    {
      id: 'music',
      name: 'Gaana Sunein',
      icon: '🎵',
      description: 'Apna pasandeeda gaana sunein',
      duration: 10,
      difficulty: 'easy',
    },
  ],
};

export function getRandomActivity(): SeniorActivity {
  const allActivities = Object.values(SENIOR_ACTIVITIES).flat();
  return allActivities[Math.floor(Math.random() * allActivities.length)];
}

export function getTimeBasedActivities(): SeniorActivity[] {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 10) return [...SENIOR_ACTIVITIES.physical, ...SENIOR_ACTIVITIES.mindful];
  if (hour >= 10 && hour < 14) return [...SENIOR_ACTIVITIES.creative, ...SENIOR_ACTIVITIES.physical];
  if (hour >= 14 && hour < 18) return [...SENIOR_ACTIVITIES.mindful, ...SENIOR_ACTIVITIES.creative];
  return SENIOR_ACTIVITIES.mindful;
}
