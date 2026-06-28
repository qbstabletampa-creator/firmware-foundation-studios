import { GameConfig } from '../config';

export const arkHopperConfig: GameConfig = {
  id: 'ark-hopper',
  name: 'Ark Hopper',
  studioName: 'Firmware Foundation Studios',
  version: '1.0.0',
  bundleId: 'com.firmwarefoundation.arkhopper',
  description:
    "Guide animals across rivers, roads, and fields to reach Noah's Ark. Dodge sheep, ride logs, and collect stars before the flood rises.",
  tagline: "Hop your way to Noah's Ark before the flood!",
  price: '$2.99',
  profiles: ['Kid', 'Teen', 'Parent', 'Family'],
  splash: {
    primaryColor: '#1E7A82',
    rayCount: 14,
    backgroundColor: '#040A1C',
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
