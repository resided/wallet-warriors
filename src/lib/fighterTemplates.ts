// Legendary MMA Fighter Templates
// Based on real fighters with authentic stats and specialties

export interface FighterTemplate {
  id: string;
  name: string;
  nickname: string;
  style: string;
  stance: 'Southpaw' | 'Orthodox' | 'Switch';
  reach: number; // inches
  weightClass: string;
  image?: string;
  stats: {
    striking: number;
    grappling: number;
    stamina: number;
    power: number;
    chin: number;
    speed: number;
  };
  specialties: string[];
  description: string;
  tier: 'Legend' | 'Elite' | 'Champion';
}

export const FIGHTER_TEMPLATES: FighterTemplate[] = [
  {
    id: 'mcgregor',
    name: 'Conor McGregor',
    nickname: 'The Notorious',
    style: 'Precision Striker',
    stance: 'Southpaw',
    reach: 74,
    weightClass: 'Lightweight',
    stats: {
      striking: 95,
      grappling: 45,
      stamina: 70,
      power: 92,
      chin: 65,
      speed: 88,
    },
    specialties: ['Left Hand Precision', 'Counter Striking', 'Fight IQ'],
    description: 'The biggest star in MMA history. Devastating left hand and unmatched confidence.',
    tier: 'Legend',
  },
  {
    id: 'khabib',
    name: 'Khabib Nurmagomedov',
    nickname: 'The Eagle',
    style: 'Sambo Wrestler',
    stance: 'Orthodox',
    reach: 70,
    weightClass: 'Lightweight',
    stats: {
      striking: 60,
      grappling: 98,
      stamina: 95,
      power: 75,
      chin: 90,
      speed: 72,
    },
    specialties: ['Chain Wrestling', 'Sambo', 'Top Control'],
    description: 'Undefeated legend with suffocating ground game and relentless pressure.',
    tier: 'Legend',
  },
  {
    id: 'jones',
    name: 'Jon Jones',
    nickname: 'Bones',
    style: 'Complete Mixed Martial Artist',
    stance: 'Orthodox',
    reach: 84.5,
    weightClass: 'Heavyweight',
    stats: {
      striking: 88,
      grappling: 92,
      stamina: 90,
      power: 85,
      chin: 88,
      speed: 82,
    },
    specialties: ['Elbow Strikes', 'Wrestling', 'Fight IQ'],
    description: 'Considered by many the GOAT. Unmatched versatility and fight IQ.',
    tier: 'Legend',
  },
  {
    id: 'gsp',
    name: 'Georges St-Pierre',
    nickname: 'Rush',
    style: 'Technical Wrestler',
    stance: 'Orthodox',
    reach: 76,
    weightClass: 'Welterweight',
    stats: {
      striking: 85,
      grappling: 94,
      stamina: 96,
      power: 72,
      chin: 82,
      speed: 80,
    },
    specialties: ['Double Leg', 'Ground & Pound', 'Game Planning'],
    description: 'The ultimate professional. Perfected the blend of striking and wrestling.',
    tier: 'Legend',
  },
  {
    id: 'adesanya',
    name: 'Israel Adesanya',
    nickname: 'The Last Stylebender',
    style: 'Technical Striker',
    stance: 'Switch',
    reach: 80,
    weightClass: 'Middleweight',
    stats: {
      striking: 96,
      grappling: 50,
      stamina: 88,
      power: 78,
      chin: 75,
      speed: 94,
    },
    specialties: ['Kickboxing', 'Distance Control', 'Counter Striking'],
    description: 'Kickboxing specialist with fluid movement and elite timing.',
    tier: 'Champion',
  },
  {
    id: 'aldo',
    name: 'Jose Aldo',
    nickname: 'Scarface',
    style: 'Muay Thai Specialist',
    stance: 'Orthodox',
    reach: 70,
    weightClass: 'Bantamweight',
    stats: {
      striking: 92,
      grappling: 78,
      stamina: 85,
      power: 88,
      chin: 72,
      speed: 90,
    },
    specialties: ['Leg Kicks', 'Takedown Defense', 'Muay Thai'],
    description: 'Legendary striker with devastating leg kicks and takedown defense.',
    tier: 'Legend',
  },
  {
    id: 'pereira',
    name: 'Alex Pereira',
    nickname: 'Poatan',
    style: 'Power Striker',
    stance: 'Southpaw',
    reach: 79,
    weightClass: 'Light Heavyweight',
    stats: {
      striking: 94,
      grappling: 40,
      stamina: 75,
      power: 98,
      chin: 78,
      speed: 76,
    },
    specialties: ['Left Hook', 'Kickboxing Power', 'Flying Knees'],
    description: 'Two-division champ with nuclear left hook and elite kickboxing.',
    tier: 'Champion',
  },
  {
    id: 'usman',
    name: 'Kamaru Usman',
    nickname: 'The Nigerian Nightmare',
    style: 'Wrestler-Boxer',
    stance: 'Orthodox',
    reach: 76,
    weightClass: 'Welterweight',
    stats: {
      striking: 78,
      grappling: 92,
      stamina: 92,
      power: 82,
      chin: 88,
      speed: 78,
    },
    specialties: ['Pressure Wrestling', 'Foot Stomps', 'Cardio'],
    description: 'Dominant wrestler with suffocating pressure and endless cardio.',
    tier: 'Champion',
  },
  {
    id: 'volk',
    name: 'Alexander Volkanovski',
    nickname: 'The Great',
    style: 'Complete Fighter',
    stance: 'Orthodox',
    reach: 71,
    weightClass: 'Featherweight',
    stats: {
      striking: 90,
      grappling: 85,
      stamina: 96,
      power: 76,
      chin: 88,
      speed: 92,
    },
    specialties: ['Fight IQ', 'Cardio', 'Adaptability'],
    description: 'Pound-for-pound great with no weaknesses and elite fight IQ.',
    tier: 'Champion',
  },
  {
    id: 'silva',
    name: 'Anderson Silva',
    nickname: 'The Spider',
    style: 'Muay Thai Counter-Striker',
    stance: 'Southpaw',
    reach: 77.6,
    weightClass: 'Middleweight',
    stats: {
      striking: 98,
      grappling: 70,
      stamina: 85,
      power: 88,
      chin: 75,
      speed: 95,
    },
    specialties: ['Precision Counter', 'Muay Thai Clinch', 'Matrix Movement'],
    description: 'The GOAT of striking. Matrix-like movement with devastating accuracy.',
    tier: 'Legend',
  },
  {
    id: 'cejudo',
    name: 'Henry Cejudo',
    nickname: 'Triple C',
    style: 'Olympic Wrestler',
    stance: 'Orthodox',
    reach: 64,
    weightClass: 'Flyweight',
    stats: {
      striking: 75,
      grappling: 96,
      stamina: 90,
      power: 72,
      chin: 80,
      speed: 88,
    },
    specialties: ['Olympic Wrestling', 'Cringe Factor', 'Fight IQ'],
    description: 'Olympic gold medalist with elite wrestling and cringe promos.',
    tier: 'Champion',
  },
  {
    id: 'oliveira',
    name: 'Charles Oliveira',
    nickname: 'Do Bronx',
    style: 'BJJ Specialist',
    stance: 'Orthodox',
    reach: 74,
    weightClass: 'Lightweight',
    stats: {
      striking: 78,
      grappling: 96,
      stamina: 85,
      power: 82,
      chin: 70,
      speed: 84,
    },
    specialties: ['Brazilian Jiu-Jitsu', 'Submission Offense', 'Comeback Spirit'],
    description: 'Most submissions in UFC history. Dangerous anywhere but especially on ground.',
    tier: 'Champion',
  },
];

export function calculateOverallRating(stats: FighterTemplate['stats']): number {
  const total = stats.striking + stats.grappling + stats.stamina + stats.power + stats.chin + stats.speed;
  return Math.round(total / 6);
}

export function getStatColor(stat: number): string {
  if (stat >= 90) return 'text-red-500';
  if (stat >= 80) return 'text-orange-500';
  if (stat >= 70) return 'text-yellow-500';
  if (stat >= 60) return 'text-blue-400';
  return 'text-gray-400';
}

export function getStatBg(stat: number): string {
  if (stat >= 90) return 'bg-red-500';
  if (stat >= 80) return 'bg-orange-500';
  if (stat >= 70) return 'bg-yellow-500';
  if (stat >= 60) return 'bg-blue-500';
  return 'bg-gray-500';
}

export function getTierColor(tier: string): string {
  switch (tier) {
    case 'Legend': return 'text-yellow-400 border-yellow-400/50 bg-yellow-400/10';
    case 'Champion': return 'text-red-400 border-red-400/50 bg-red-400/10';
    case 'Elite': return 'text-blue-400 border-blue-400/50 bg-blue-400/10';
    default: return 'text-gray-400 border-gray-400/50 bg-gray-400/10';
  }
}
