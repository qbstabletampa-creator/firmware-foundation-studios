import { GameConfig } from '../config';

export const lightSnakeConfig: GameConfig = {
  id: 'light-snake',
  name: "Shepherd's Trail",
  studioName: 'Firmware Foundation Studios',
  version: '1.0.0',
  bundleId: 'com.firmwarefoundation.shepherdstrail',
  description: 'Guide the light through the dark. Gather bread, fish, and lamps while you grow.',
  tagline: 'Carry the light. Avoid the thorns.',
  price: '$2.99',
  profiles: ['Kid', 'Teen', 'Parent', 'Family'],
  splash: {
    primaryColor: '#FFD466',
    rayCount: 16,
    backgroundColor: '#0A0A1A',
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
