export type VerseTheme =
  | 'provision' | 'bread' | 'manna' | 'blessing' | 'honey'
  | 'courage' | 'strength' | 'faith' | 'trust'
  | 'creation' | 'nature' | 'animals'
  | 'love' | 'joy' | 'peace' | 'patience' | 'kindness'
  | 'obedience' | 'wisdom' | 'prayer'
  | 'light' | 'truth' | 'grace' | 'hope'
  | 'salvation' | 'forgiveness' | 'worship';

export type Verse = {
  id: string;
  reference: string;
  text: string;
  themes: VerseTheme[];
  kidPrompt: string;
};
