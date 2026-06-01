import { GameConfig } from '../config';

export const gospleConfig: GameConfig = {
  id: 'gosple',
  name: 'Gosple',
  studioName: 'Firmware Foundation Studios',
  version: '1.0.0',
  bundleId: 'com.firmwarefoundation.gosple',
  description: 'A daily Bible word puzzle for the family.',
  tagline: 'A daily Bible word puzzle for the family.',
  price: '$2.99',
  profiles: ['Kid', 'Teen', 'Parent', 'Family'],
  splash: {
    primaryColor: '#D4C36A',
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
