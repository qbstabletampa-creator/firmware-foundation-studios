export type ProfileOption = 'Kid' | 'Teen' | 'Parent' | 'Family';

export type SplashConfig = {
  primaryColor: string;
  rayCount: number;
  backgroundColor: string;
  duration: number;
};

export type GameConfig = {
  id: string;
  name: string;
  studioName: string;
  version: string;
  bundleId: string;
  description: string;
  tagline: string;
  price: string;
  profiles: ProfileOption[];
  splash: SplashConfig;
  giveback: {
    monthA: { name: string; description: string; url: string };
    monthB: { name: string; description: string; url: string };
  };
};
