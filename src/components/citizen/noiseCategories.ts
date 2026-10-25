import { Music, UtensilsCrossed, PartyPopper, HardHat, Car } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NoiseCategory {
  value: string; // must match the category names in the incident data
  label: string;
  hint: string;
  summary: string; // used as the description when the resident leaves details blank
  icon: LucideIcon;
}

export const NOISE_CATEGORIES: NoiseCategory[] = [
  {
    value: 'Nightlife Disturbance',
    label: 'Bar, club or venue',
    hint: 'Loud music, crowds at the door',
    summary: 'Loud music or crowds from a bar, club or venue.',
    icon: Music,
  },
  {
    value: 'Terrace Ordinance',
    label: 'Terrace',
    hint: 'Outdoor seating too loud or open late',
    summary: 'Noise from a terrace or outdoor seating area.',
    icon: UtensilsCrossed,
  },
  {
    value: 'Private Party',
    label: 'Neighbor or party',
    hint: 'A flat, rooftop or private gathering',
    summary: 'Noise from a neighbor or a private party.',
    icon: PartyPopper,
  },
  {
    value: 'Construction',
    label: 'Construction or works',
    hint: 'Drilling, machinery, roadworks',
    summary: 'Noise from construction or works.',
    icon: HardHat,
  },
  {
    value: 'Traffic Noise',
    label: 'Traffic',
    hint: 'Horns, engines, motorbikes',
    summary: 'Traffic noise: horns, engines or motorbikes.',
    icon: Car,
  },
];

export const getNoiseCategory = (value: string) =>
  NOISE_CATEGORIES.find(c => c.value === value) ?? NOISE_CATEGORIES[0];
