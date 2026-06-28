// ---------------------------------------------------------------------------
// Bible verses for Ark Hopper
//
// All verses from the World English Bible (WEB), public domain.
// Themes: journey, trust, courage, perseverance, protection, adventure, faith
// ---------------------------------------------------------------------------

export interface ArkHopperVerse {
  id: number;
  reference: string;
  verse: string;
  kidPrompt: string;
}

export const arkHopperVerses: ArkHopperVerse[] = [
  // -- Journey & Adventure --
  {
    id: 1,
    reference: 'Genesis 6:14 (WEB)',
    verse: 'Make a ship of gopher wood. You shall make rooms in the ship, and shall seal it inside and outside with pitch.',
    kidPrompt: 'If God asked you to build something big, would you trust Him and start building?',
  },
  {
    id: 2,
    reference: 'Genesis 7:1 (WEB)',
    verse: 'Yahweh said to Noah, "Come with all of your household into the ship, for I have seen your righteousness before me in this generation."',
    kidPrompt: 'Noah was chosen because he was faithful. How can you be faithful today?',
  },
  {
    id: 3,
    reference: 'Genesis 8:11 (WEB)',
    verse: 'The dove came back to him at evening and, behold, in her mouth was a freshly plucked olive leaf.',
    kidPrompt: 'The olive leaf was a sign of hope. What gives you hope when things feel hard?',
  },
  {
    id: 4,
    reference: 'Genesis 9:13 (WEB)',
    verse: 'I set my rainbow in the cloud, and it will be a sign of a covenant between me and the earth.',
    kidPrompt: 'Have you ever seen a rainbow? What promise from God does it remind you of?',
  },
  {
    id: 5,
    reference: 'Psalm 37:23 (WEB)',
    verse: 'A man\'s steps are established by Yahweh. He delights in his way.',
    kidPrompt: 'God plans your steps. What is one step you can take today to follow Him?',
  },
  {
    id: 6,
    reference: 'Proverbs 3:5-6 (WEB)',
    verse: 'Trust in Yahweh with all your heart, and don\'t lean on your own understanding. In all your ways acknowledge him, and he will make your paths straight.',
    kidPrompt: 'When is it hardest for you to trust God? Can you give that to Him right now?',
  },
  {
    id: 7,
    reference: 'Isaiah 43:2 (WEB)',
    verse: 'When you pass through the waters, I will be with you; and through the rivers, they will not overflow you.',
    kidPrompt: 'Even through deep water, God is with you. How does that make you feel?',
  },
  {
    id: 8,
    reference: 'Exodus 14:14 (WEB)',
    verse: 'Yahweh will fight for you, and you shall be still.',
    kidPrompt: 'Sometimes the bravest thing is to be still and let God work. Can you try that today?',
  },
  {
    id: 9,
    reference: 'Deuteronomy 31:6 (WEB)',
    verse: 'Be strong and courageous. Don\'t be afraid or scared of them, for Yahweh your God himself is who goes with you.',
    kidPrompt: 'What are you facing that takes courage? Remember, God goes with you!',
  },
  {
    id: 10,
    reference: 'Joshua 1:9 (WEB)',
    verse: 'Haven\'t I commanded you? Be strong and courageous. Don\'t be afraid, neither be dismayed, for Yahweh your God is with you wherever you go.',
    kidPrompt: 'God is with you everywhere you go. Where do you need His courage right now?',
  },

  // -- Trust & Faith --
  {
    id: 11,
    reference: 'Psalm 56:3 (WEB)',
    verse: 'When I am afraid, I will put my trust in you.',
    kidPrompt: 'What scares you? Can you tell God about it and trust Him to help?',
  },
  {
    id: 12,
    reference: 'Psalm 46:1 (WEB)',
    verse: 'God is our refuge and strength, a very present help in trouble.',
    kidPrompt: 'God is like the safest hiding place ever. Where do you go when you need help?',
  },
  {
    id: 13,
    reference: 'Psalm 91:2 (WEB)',
    verse: 'I will say of Yahweh, "He is my refuge and my fortress; my God, in whom I trust."',
    kidPrompt: 'A fortress keeps you safe. How is God like a fortress for you?',
  },
  {
    id: 14,
    reference: 'Psalm 27:1 (WEB)',
    verse: 'Yahweh is my light and my salvation. Whom shall I fear? Yahweh is the strength of my life. Of whom shall I be afraid?',
    kidPrompt: 'If God is your light, you never walk in the dark alone. How does that feel?',
  },
  {
    id: 15,
    reference: 'Psalm 121:1-2 (WEB)',
    verse: 'I will lift up my eyes to the hills. Where does my help come from? My help comes from Yahweh, who made heaven and earth.',
    kidPrompt: 'The One who made the mountains can help you with anything. What do you need help with?',
  },
  {
    id: 16,
    reference: 'Hebrews 11:7 (WEB)',
    verse: 'By faith, Noah, being warned about things not yet seen, moved with godly fear, prepared a ship for the saving of his house.',
    kidPrompt: 'Noah built the ark before the rain started. What does it mean to trust God before you see the answer?',
  },
  {
    id: 17,
    reference: 'Psalm 18:2 (WEB)',
    verse: 'Yahweh is my rock, my fortress, and my deliverer; my God, my rock, in whom I take refuge.',
    kidPrompt: 'God is steady like a rock. When things feel shaky, can you stand on Him?',
  },
  {
    id: 18,
    reference: 'Psalm 62:6 (WEB)',
    verse: 'He alone is my rock and my salvation, my fortress. I shall not be shaken.',
    kidPrompt: 'Have you ever felt shaken? God says you do not have to be. How does that help?',
  },
  {
    id: 19,
    reference: 'Isaiah 41:10 (WEB)',
    verse: 'Don\'t you be afraid, for I am with you. Don\'t be dismayed, for I am your God.',
    kidPrompt: 'God says "don\'t be afraid" over and over. Why do you think He keeps reminding us?',
  },
  {
    id: 20,
    reference: 'Romans 8:28 (WEB)',
    verse: 'We know that all things work together for good for those who love God.',
    kidPrompt: 'Even hard things can become good things. Can you think of a time that happened?',
  },

  // -- Perseverance --
  {
    id: 21,
    reference: 'James 1:12 (WEB)',
    verse: 'Blessed is the man who endures temptation, for when he has been approved, he will receive the crown of life.',
    kidPrompt: 'Enduring means not giving up. What is something you are working hard to finish?',
  },
  {
    id: 22,
    reference: 'Galatians 6:9 (WEB)',
    verse: 'Let\'s not be weary in doing good, for we will reap in due season if we don\'t give up.',
    kidPrompt: 'Keep doing good even when it feels hard. What good thing can you keep doing?',
  },
  {
    id: 23,
    reference: 'Philippians 4:13 (WEB)',
    verse: 'I can do all things through Christ who strengthens me.',
    kidPrompt: 'What feels impossible right now? With God, you can do it!',
  },
  {
    id: 24,
    reference: 'Isaiah 40:31 (WEB)',
    verse: 'But those who wait for Yahweh will renew their strength. They will mount up with wings like eagles.',
    kidPrompt: 'When you feel tired, God gives you new energy. How can you wait on Him today?',
  },
  {
    id: 25,
    reference: 'Psalm 37:5 (WEB)',
    verse: 'Commit your way to Yahweh. Trust also in him, and he will do this.',
    kidPrompt: 'What plan or dream can you hand over to God today?',
  },
  {
    id: 26,
    reference: '2 Timothy 4:7 (WEB)',
    verse: 'I have fought the good fight. I have finished the course. I have kept the faith.',
    kidPrompt: 'Finishing what you start matters. What are you going to finish today?',
  },
  {
    id: 27,
    reference: 'Hebrews 12:1 (WEB)',
    verse: 'Let\'s run with perseverance the race that is set before us.',
    kidPrompt: 'Life is like a race. Who cheers you on when you feel like stopping?',
  },
  {
    id: 28,
    reference: 'Romans 5:3-4 (WEB)',
    verse: 'We also rejoice in our sufferings, knowing that suffering produces perseverance; and perseverance, proven character.',
    kidPrompt: 'Hard times make you stronger. Can you think of a hard time that helped you grow?',
  },
  {
    id: 29,
    reference: 'Psalm 40:1 (WEB)',
    verse: 'I waited patiently for Yahweh. He turned to me, and heard my cry.',
    kidPrompt: 'Waiting is hard, but God always hears you. What are you waiting for?',
  },
  {
    id: 30,
    reference: '1 Corinthians 15:58 (WEB)',
    verse: 'Be steadfast, immovable, always abounding in the Lord\'s work, because you know that your labor is not in vain.',
    kidPrompt: 'Your hard work matters to God. What work are you proud of?',
  },

  // -- Protection & Safety --
  {
    id: 31,
    reference: 'Psalm 91:4 (WEB)',
    verse: 'He will cover you with his feathers. Under his wings you will take refuge.',
    kidPrompt: 'God protects you like a parent bird covers its babies. How does that make you feel safe?',
  },
  {
    id: 32,
    reference: 'Psalm 23:4 (WEB)',
    verse: 'Even though I walk through the valley of the shadow of death, I will fear no evil, for you are with me.',
    kidPrompt: 'Even in the scariest places, God walks with you. Where do you need Him right now?',
  },
  {
    id: 33,
    reference: 'Psalm 34:7 (WEB)',
    verse: 'Yahweh\'s angel encamps around those who fear him, and delivers them.',
    kidPrompt: 'Angels are watching over you! How does knowing that change your day?',
  },
  {
    id: 34,
    reference: 'Psalm 4:8 (WEB)',
    verse: 'In peace I will both lay myself down and sleep, for you alone, Yahweh, make me live in safety.',
    kidPrompt: 'You can sleep peacefully because God keeps you safe. Do you thank Him at bedtime?',
  },
  {
    id: 35,
    reference: 'Nahum 1:7 (WEB)',
    verse: 'Yahweh is good, a stronghold in the day of trouble, and he knows those who take refuge in him.',
    kidPrompt: 'God knows you by name and protects you. What trouble can you give to Him?',
  },
  {
    id: 36,
    reference: 'Psalm 32:7 (WEB)',
    verse: 'You are my hiding place. You will preserve me from trouble. You will surround me with songs of deliverance.',
    kidPrompt: 'God surrounds you with songs. What is your favorite song about God?',
  },
  {
    id: 37,
    reference: 'Psalm 46:10 (WEB)',
    verse: 'Be still, and know that I am God.',
    kidPrompt: 'Can you sit quietly for a minute and just know that God is right there with you?',
  },
  {
    id: 38,
    reference: 'Psalm 121:7-8 (WEB)',
    verse: 'Yahweh will keep you from all evil. He will keep your soul. Yahweh will keep your going out and your coming in, from this time forward, and forever.',
    kidPrompt: 'God watches you leave home and come back, forever. How does that comfort you?',
  },
  {
    id: 39,
    reference: 'Genesis 7:16 (WEB)',
    verse: 'Those who went in, went in male and female of all flesh, as God commanded him; then Yahweh shut him in.',
    kidPrompt: 'God shut the door of the ark to keep Noah safe. How does God keep you safe?',
  },
  {
    id: 40,
    reference: 'Psalm 145:18 (WEB)',
    verse: 'Yahweh is near to all those who call on him, to all who call on him in truth.',
    kidPrompt: 'God is as close as your next prayer. What do you want to tell Him?',
  },

  // -- Courage & Strength --
  {
    id: 41,
    reference: '2 Timothy 1:7 (WEB)',
    verse: 'For God didn\'t give us a spirit of fear, but of power, love, and self-control.',
    kidPrompt: 'God gave you power, love, and self-control. Which one do you need most today?',
  },
  {
    id: 42,
    reference: 'Psalm 28:7 (WEB)',
    verse: 'Yahweh is my strength and my shield. My heart has trusted in him, and I am helped.',
    kidPrompt: 'When did God help you after you trusted Him?',
  },
  {
    id: 43,
    reference: 'Psalm 18:32 (WEB)',
    verse: 'The God who arms me with strength, and makes my way perfect.',
    kidPrompt: 'God gives you the strength you need. What do you need His strength for today?',
  },
  {
    id: 44,
    reference: 'Psalm 73:26 (WEB)',
    verse: 'My flesh and my heart fails, but God is the strength of my heart and my portion forever.',
    kidPrompt: 'Even when you feel weak, God is strong for you. How does that change things?',
  },
  {
    id: 45,
    reference: 'Isaiah 12:2 (WEB)',
    verse: 'Behold, God is my salvation. I will trust, and will not be afraid; for Yah, Yahweh, is my strength and song.',
    kidPrompt: 'God is your strength and your song. What song would you sing to thank Him?',
  },
  {
    id: 46,
    reference: 'Psalm 16:8 (WEB)',
    verse: 'I have set Yahweh always before me. Because he is at my right hand, I shall not be moved.',
    kidPrompt: 'Imagine God standing right next to you. You cannot be knocked down! How does that help?',
  },
  {
    id: 47,
    reference: 'Genesis 6:22 (WEB)',
    verse: 'Thus Noah did. He did all that God commanded him.',
    kidPrompt: 'Noah did everything God asked. What is God asking you to do today?',
  },
  {
    id: 48,
    reference: 'Psalm 55:22 (WEB)',
    verse: 'Cast your burden on Yahweh and he will sustain you. He will never allow the righteous to be moved.',
    kidPrompt: 'What worry can you hand over to God right now?',
  },
  {
    id: 49,
    reference: 'Genesis 8:22 (WEB)',
    verse: 'While the earth remains, seed time and harvest, and cold and heat, and summer and winter, and day and night will not cease.',
    kidPrompt: 'God keeps the seasons going, every single year. What does that tell you about His faithfulness?',
  },
  {
    id: 50,
    reference: 'Psalm 100:5 (WEB)',
    verse: 'For Yahweh is good. His loving kindness endures forever, his faithfulness to all generations.',
    kidPrompt: 'God was faithful to Noah, and He is faithful to you. How will you thank Him today?',
  },
];
