export interface SeniorActivity {
  id: string;
  name: string;
  icon: string;
  description: string;
  duration: number;
  difficulty: 'easy' | 'medium';
  category: string;
  instructions?: string[];
}

export const SENIOR_ACTIVITIES: Record<string, SeniorActivity[]> = {
  physical: [
    { id: 'walk', name: 'Tehalna / Walk', icon: '🚶', description: 'Ghar ke andar ya bahar 10 minute tehalna', duration: 10, difficulty: 'easy', category: 'physical', instructions: ['Aaram se chalna shuru karein', 'Seedhe khade rahein', '10 minute tak chalein'] },
    { id: 'stretch', name: 'Kasrat / Stretching', icon: '🧘', description: 'Kursi par baith kar simple stretching', duration: 5, difficulty: 'easy', category: 'physical', instructions: ['Kursi par baith jaayein', 'Haath upar uthayein', 'Dheere se stretch karein'] },
    { id: 'watering', name: 'Paudhon ko Paani', icon: '🪴', description: 'Apne paudhon ko paani dein', duration: 10, difficulty: 'easy', category: 'physical' },
    { id: 'balcony_walk', name: 'Balcony Sair', icon: '🌤️', description: 'Balcony mein 5 minute dhoop lein', duration: 5, difficulty: 'easy', category: 'physical', instructions: ['Balcony mein jaayein', 'Dhoop mein khade rahein', 'Gehri saans lein'] },
    { id: 'hand_exercise', name: 'Haath ki Kasrat', icon: '✋', description: 'Ungliyon ko kholen aur band karein', duration: 5, difficulty: 'easy', category: 'physical', instructions: ['Haath kholen', 'Mutthi band karein', '20 baar repeat karein'] },
    { id: 'neck_roll', name: 'Gardan Ghumaana', icon: '🔄', description: 'Dheere se gardan ghumaayein', duration: 3, difficulty: 'easy', category: 'physical' },
    { id: 'toe_touch', name: 'Pair ki Ungli Chhoona', icon: '🦶', description: 'Baith kar pair ki ungliyan chhooen', duration: 5, difficulty: 'easy', category: 'physical' },
  ],
  creative: [
    { id: 'drawing', name: 'Drawing / Rangoli', icon: '🎨', description: 'Kuch simple drawing banayein', duration: 15, difficulty: 'easy', category: 'creative' },
    { id: 'origami', name: 'Kagaz Modna', icon: '📄', description: 'Kagaz se simple shapes banayein', duration: 10, difficulty: 'medium', category: 'creative' },
    { id: 'recipe_recall', name: 'Purani Recipe Yaad Karein', icon: '🍳', description: 'Apni favourite recipe likhein ya bolein', duration: 10, difficulty: 'easy', category: 'creative' },
    { id: 'letter_writing', name: 'Khat Likhein', icon: '✉️', description: 'Kisi ko ek chhoti si chitthi likhein', duration: 15, difficulty: 'easy', category: 'creative' },
    { id: 'story_telling', name: 'Kahani Sunaayein', icon: '📖', description: 'Bachpan ki koi kahani yaad karein', duration: 10, difficulty: 'easy', category: 'creative' },
    { id: 'photo_sort', name: 'Photos Sajaayen', icon: '📷', description: 'Purani photos dekhen aur sajaayen', duration: 15, difficulty: 'easy', category: 'creative' },
  ],
  mindful: [
    { id: 'breathing', name: 'Gehri Saans', icon: '🌬️', description: 'Gehri saans lein aur chhodein', duration: 5, difficulty: 'easy', category: 'mindful', instructions: ['5 second mein saans lein', '5 second hold karein', '5 second mein saans chhodein', '10 baar repeat karein'] },
    { id: 'gratitude', name: 'Shukrana', icon: '🙏', description: '3 cheezein sochein jinke liye aap shukrguzaar hain', duration: 5, difficulty: 'easy', category: 'mindful' },
    { id: 'music', name: 'Gaana Sunein', icon: '🎵', description: 'Apna pasandeeda gaana sunein', duration: 10, difficulty: 'easy', category: 'mindful' },
    { id: 'meditation', name: 'Dhyaan', icon: '🧘‍♂️', description: 'Aankhen band karein, 5 minute shaant rahein', duration: 5, difficulty: 'easy', category: 'mindful', instructions: ['Aaram se baith jaayein', 'Aankhen band karein', 'Saans par dhyaan dein', '5 minute tak'] },
    { id: 'bird_feed', name: 'Chiriya ko Dana', icon: '🐦', description: 'Chiriya ko daana daalein balcony mein', duration: 5, difficulty: 'easy', category: 'mindful' },
    { id: 'sun_gaze', name: 'Subah ki Dhoop', icon: '☀️', description: 'Subah ki halki dhoop mein 5 min baithein', duration: 5, difficulty: 'easy', category: 'mindful' },
    { id: 'mantra', name: 'Mantra Jaap', icon: '📿', description: 'Apna mantra 108 baar bolein', duration: 10, difficulty: 'easy', category: 'mindful' },
  ],
  social: [
    { id: 'family_call', name: 'Parivaar ko Call', icon: '📞', description: 'Kisi family member ko phone karein', duration: 10, difficulty: 'easy', category: 'social' },
    { id: 'neighbor_chat', name: 'Padosi se Baat', icon: '🏘️', description: 'Padosi se 5 minute baat karein', duration: 5, difficulty: 'easy', category: 'social' },
    { id: 'teach_something', name: 'Kuch Sikhaayein', icon: '👨‍🏫', description: 'Bachche ko kuch naya sikhaayein', duration: 15, difficulty: 'easy', category: 'social' },
    { id: 'old_friend', name: 'Purane Dost ko Yaad', icon: '👥', description: 'Purane dost ko phone ya message karein', duration: 10, difficulty: 'easy', category: 'social' },
  ],
  brain: [
    { id: 'word_game', name: 'Shabd Ka Khel', icon: '🔤', description: 'Ek akshar se 10 shabd sochein', duration: 10, difficulty: 'easy', category: 'brain' },
    { id: 'counting', name: 'Ulti Ginti', icon: '🔢', description: '100 se 1 tak ulti ginti karein', duration: 5, difficulty: 'easy', category: 'brain' },
    { id: 'memory_game', name: 'Yaaddaasht Khel', icon: '🧠', description: 'Kamre mein 10 cheezein dekhen, fir yaad karein', duration: 10, difficulty: 'medium', category: 'brain' },
    { id: 'puzzle', name: 'Paheli', icon: '🧩', description: 'Ek chhoti si paheli suljhaayein', duration: 10, difficulty: 'medium', category: 'brain' },
    { id: 'tongue_twister', name: 'Jibh Todna', icon: '👅', description: 'Hindi tongue twisters bolein', duration: 5, difficulty: 'easy', category: 'brain' },
  ],
};

const ALL_ACTIVITIES = Object.values(SENIOR_ACTIVITIES).flat();

export function getRandomActivity(): SeniorActivity {
  return ALL_ACTIVITIES[Math.floor(Math.random() * ALL_ACTIVITIES.length)];
}

export function getTimeBasedActivities(): SeniorActivity[] {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 9) return shuffle([...SENIOR_ACTIVITIES.physical, ...SENIOR_ACTIVITIES.mindful]);
  if (hour >= 9 && hour < 12) return shuffle([...SENIOR_ACTIVITIES.creative, ...SENIOR_ACTIVITIES.brain]);
  if (hour >= 12 && hour < 15) return shuffle([...SENIOR_ACTIVITIES.mindful, ...SENIOR_ACTIVITIES.social]);
  if (hour >= 15 && hour < 18) return shuffle([...SENIOR_ACTIVITIES.creative, ...SENIOR_ACTIVITIES.physical]);
  if (hour >= 18 && hour < 21) return shuffle([...SENIOR_ACTIVITIES.social, ...SENIOR_ACTIVITIES.mindful]);
  return shuffle([...SENIOR_ACTIVITIES.mindful]);
}

export function getShuffledActivities(excludeIds: string[] = []): SeniorActivity[] {
  const pool = ALL_ACTIVITIES.filter(a => !excludeIds.includes(a.id));
  return shuffle(pool).slice(0, 4);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
