import { GameConfig } from '../config';

export const noahConfig: GameConfig = {
  id: 'noah-animal-match',
  name: 'Noah Animal Match',
  studioName: 'Firmware Foundation Studios',
  version: '1.0.0',
  bundleId: 'com.firmwarefoundation.noahanimalmatch',
  description: 'Match the animal pairs and lead them onto the Ark.',
  tagline: 'Match the pairs. Fill the Ark.',
  price: '$2.99',
  profiles: ['Kid', 'Teen', 'Parent', 'Family'],
  splash: {
    primaryColor: '#39C5FF',
    rayCount: 14,
    backgroundColor: '#06122B',
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
