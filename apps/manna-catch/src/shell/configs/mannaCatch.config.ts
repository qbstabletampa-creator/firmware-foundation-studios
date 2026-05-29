import { GameConfig } from '../config';

export const mannaCatchConfig: GameConfig = {
  id: 'manna-catch',
  name: 'Manna Catch',
  studioName: 'Firmware Foundation Studios',
  version: '1.0.0',
  bundleId: 'com.firmwarefoundation.mannacatch',
  description: 'Catch the blessings, dodge the thorns.',
  tagline: 'Catch the blessings, dodge the thorns.',
  price: '$2.99',
  profiles: ['Kid', 'Teen', 'Parent', 'Family'],
  splash: {
    primaryColor: '#FFD700',
    rayCount: 14,
    backgroundColor: '#10100E',
    duration: 2500,
  },
  giveback: {
    monthA: {
      name: 'Awana',
      description: 'Reaching kids with the Gospel and training them to serve.',
      url: 'https://www.awana.org',
    },
    monthB: {
      name: "Hope Children's Home Tampa",
      description: 'Providing Christ-centered homes for children in need.',
      url: 'https://www.hopechildrenshome.org',
    },
  },
};
