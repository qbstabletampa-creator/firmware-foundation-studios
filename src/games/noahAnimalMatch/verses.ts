// ---------------------------------------------------------------------------
// Noah's Animal Match -- Bible verses (World English Bible, public domain)
//
// Themes: animals, creation, Noah, God caring for creatures, faithfulness,
// pairs/togetherness, the flood, the Ark, trust, and stewardship.
// ---------------------------------------------------------------------------

export interface NoahVerse {
  id: number;
  reference: string;
  verse: string;
  kidPrompt: string;
}

export const noahVerses: NoahVerse[] = [
  {
    id: 1,
    reference: 'Genesis 6:19 (WEB)',
    verse: 'Of every living thing of all flesh, you shall bring two of every sort into the ship, to keep them alive with you. They shall be male and female.',
    kidPrompt: 'Why do you think God wanted Noah to save two of every animal?',
  },
  {
    id: 2,
    reference: 'Genesis 7:15 (WEB)',
    verse: 'Pairs of all flesh with the breath of life in them went into the ship to Noah.',
    kidPrompt: 'Imagine all those animals walking onto the Ark. Which ones would you want to see?',
  },
  {
    id: 3,
    reference: 'Genesis 8:11 (WEB)',
    verse: 'The dove came back to him at evening and, behold, in her mouth was a freshly plucked olive leaf. So Noah knew that the waters had receded from the earth.',
    kidPrompt: 'How do you think Noah felt when the dove brought back that leaf?',
  },
  {
    id: 4,
    reference: 'Genesis 9:13 (WEB)',
    verse: 'I set my rainbow in the cloud, and it will be a sign of a covenant between me and the earth.',
    kidPrompt: 'What do you think about when you see a rainbow?',
  },
  {
    id: 5,
    reference: 'Genesis 1:21 (WEB)',
    verse: 'God created the large sea creatures and every living creature that moves, with which the waters swarmed, after their kind, and every winged bird after its kind. God saw that it was good.',
    kidPrompt: 'What is your favorite sea creature that God made?',
  },
  {
    id: 6,
    reference: 'Genesis 1:25 (WEB)',
    verse: 'God made the animals of the earth after their kind, and the livestock after their kind, and everything that creeps on the ground after its kind. God saw that it was good.',
    kidPrompt: 'God called the animals good. What animal do you think is really cool?',
  },
  {
    id: 7,
    reference: 'Genesis 2:19 (WEB)',
    verse: 'Out of the ground Yahweh God formed every animal of the field, and every bird of the sky, and brought them to the man to see what he would call them.',
    kidPrompt: 'If you could name a new animal, what would you call it?',
  },
  {
    id: 8,
    reference: 'Genesis 6:22 (WEB)',
    verse: 'Thus Noah did. He did all that God commanded him.',
    kidPrompt: 'Noah obeyed even when it was hard. When is it hard for you to obey?',
  },
  {
    id: 9,
    reference: 'Genesis 7:9 (WEB)',
    verse: 'There went in two and two to Noah into the ship, male and female, as God commanded Noah.',
    kidPrompt: 'The animals came in pairs. Can you think of things that come in twos?',
  },
  {
    id: 10,
    reference: 'Genesis 8:1 (WEB)',
    verse: 'God remembered Noah, all the animals, and all the livestock that were with him in the ship; and God made a wind to pass over the earth. The waters subsided.',
    kidPrompt: 'God remembered Noah. How does it feel to know God never forgets about you?',
  },
  {
    id: 11,
    reference: 'Psalm 104:24 (WEB)',
    verse: 'Yahweh, how many are your works! In wisdom, you have made them all. The earth is full of your riches.',
    kidPrompt: 'Look around you. What is something God made that amazes you?',
  },
  {
    id: 12,
    reference: 'Psalm 147:9 (WEB)',
    verse: 'He provides food for the livestock, and for the young ravens when they call.',
    kidPrompt: 'If God feeds baby birds, do you think he cares about what you need too?',
  },
  {
    id: 13,
    reference: 'Psalm 36:6 (WEB)',
    verse: 'Your righteousness is like the mountains of God. Your judgments are like a great deep. Yahweh, you preserve man and animal.',
    kidPrompt: 'God takes care of both people and animals. How does that make you feel?',
  },
  {
    id: 14,
    reference: 'Psalm 50:10 (WEB)',
    verse: 'For every animal of the forest is mine, and the livestock on a thousand hills.',
    kidPrompt: 'Every animal belongs to God. Why do you think he trusts us to take care of them?',
  },
  {
    id: 15,
    reference: 'Psalm 145:9 (WEB)',
    verse: 'Yahweh is good to all. His tender mercies are over all his works.',
    kidPrompt: 'God is good to everyone and everything he made. How can you be kind to animals?',
  },
  {
    id: 16,
    reference: 'Psalm 148:10 (WEB)',
    verse: 'Wild animals and all livestock, small creatures and flying birds.',
    kidPrompt: 'This verse says even the smallest creatures praise God. How might they do that?',
  },
  {
    id: 17,
    reference: 'Proverbs 12:10 (WEB)',
    verse: 'A righteous man respects the life of his animal, but the tender mercies of the wicked are cruel.',
    kidPrompt: 'How can you show kindness to animals in your life?',
  },
  {
    id: 18,
    reference: 'Isaiah 11:6 (WEB)',
    verse: 'The wolf will live with the lamb, and the leopard will lie down with the young goat, and the calf, the young lion, and the fattened calf together; and a little child will lead them.',
    kidPrompt: 'Imagine a world where all animals live in peace. What would that be like?',
  },
  {
    id: 19,
    reference: 'Job 12:7 (WEB)',
    verse: 'But ask the animals now, and they will teach you; the birds of the sky, and they will tell you.',
    kidPrompt: 'What can we learn from watching animals?',
  },
  {
    id: 20,
    reference: 'Matthew 6:26 (WEB)',
    verse: 'See the birds of the sky, that they do not sow, neither do they reap, nor gather into barns. Your heavenly Father feeds them. Are you not of much more value than they?',
    kidPrompt: 'If God takes care of birds, how much more does he care about you?',
  },
  {
    id: 21,
    reference: 'Matthew 10:29 (WEB)',
    verse: 'Are not two sparrows sold for an assarion coin? Not one of them falls on the ground apart from your Father\'s will.',
    kidPrompt: 'God knows about every single sparrow. What does that tell you about how well he knows you?',
  },
  {
    id: 22,
    reference: 'Genesis 9:9-10 (WEB)',
    verse: 'I, behold, I establish my covenant with you, and with your offspring after you, and with every living creature that is with you.',
    kidPrompt: 'God made his promise to the animals too. Why do you think they matter to God?',
  },
  {
    id: 23,
    reference: 'Psalm 8:6-8 (WEB)',
    verse: 'You make him ruler over the works of your hands. You have put all things under his feet: all sheep and cattle, yes, and the animals of the field, the birds of the sky, the fish of the sea.',
    kidPrompt: 'God gave us the job of caring for animals. How can you help?',
  },
  {
    id: 24,
    reference: 'Genesis 7:16 (WEB)',
    verse: 'Those who went in, went in male and female of all flesh, as God commanded him; then Yahweh shut him in.',
    kidPrompt: 'God shut the door of the Ark himself. What does that tell you about how God protects us?',
  },
  {
    id: 25,
    reference: 'Psalm 91:4 (WEB)',
    verse: 'He will cover you with his feathers. Under his wings you will take refuge.',
    kidPrompt: 'God protects us like a mother bird protects her babies. When have you felt safe with God?',
  },
  {
    id: 26,
    reference: 'Isaiah 40:31 (WEB)',
    verse: 'But those who wait for Yahweh will renew their strength. They will mount up with wings like eagles.',
    kidPrompt: 'Eagles are strong and fly high. How does God help you be strong?',
  },
  {
    id: 27,
    reference: 'Psalm 104:25-26 (WEB)',
    verse: 'There is the sea, great and wide, in which are innumerable living things, both small and large animals.',
    kidPrompt: 'The ocean is full of amazing creatures. What sea animal do you think is the coolest?',
  },
  {
    id: 28,
    reference: 'Proverbs 30:25 (WEB)',
    verse: 'The ants are not a strong people, yet they provide their food in the summer.',
    kidPrompt: 'Even tiny ants plan ahead. What is something you can prepare for today?',
  },
  {
    id: 29,
    reference: 'Psalm 19:1 (WEB)',
    verse: 'The heavens declare the glory of God. The expanse shows his handiwork.',
    kidPrompt: 'When you look at the sky, what do you see that reminds you of God?',
  },
  {
    id: 30,
    reference: 'Genesis 8:17 (WEB)',
    verse: 'Bring out with you every living thing that is with you of all flesh, including birds, livestock, and every creeping thing that creeps on the earth, that they may breed abundantly.',
    kidPrompt: 'After the flood, God wanted the animals to fill the earth again. Why is new life important?',
  },
  {
    id: 31,
    reference: 'Psalm 139:14 (WEB)',
    verse: 'I will give thanks to you, for I am fearfully and wonderfully made. Your works are wonderful. My soul knows that very well.',
    kidPrompt: 'You are wonderfully made. What is something special about how God made you?',
  },
  {
    id: 32,
    reference: 'Ecclesiastes 3:11 (WEB)',
    verse: 'He has made everything beautiful in its time.',
    kidPrompt: 'Every animal is beautiful in its own way. Which animal do you think is the most beautiful?',
  },
  {
    id: 33,
    reference: 'Psalm 100:3 (WEB)',
    verse: 'Know that Yahweh, he is God. It is he who has made us, and we are his. We are his people, and the sheep of his pasture.',
    kidPrompt: 'We are like sheep in God\'s pasture. What does a good shepherd do for his sheep?',
  },
  {
    id: 34,
    reference: 'Hebrews 11:7 (WEB)',
    verse: 'By faith Noah, being warned about things not yet seen, moved with godly fear, prepared a ship for the saving of his house.',
    kidPrompt: 'Noah built the Ark before the rain came. How can faith help you get ready for the future?',
  },
  {
    id: 35,
    reference: 'Jonah 4:11 (WEB)',
    verse: 'Should I not be concerned about Nineveh, that great city, in which are more than one hundred twenty thousand persons who cannot discern between their right hand and their left hand, and also much livestock?',
    kidPrompt: 'God cares about cities full of people and their animals. Who does God care about around you?',
  },
  {
    id: 36,
    reference: 'Psalm 23:1-2 (WEB)',
    verse: 'Yahweh is my shepherd; I shall lack nothing. He makes me lie down in green pastures. He leads me beside still waters.',
    kidPrompt: 'God leads us like a shepherd leads sheep. Where has God led you lately?',
  },
  {
    id: 37,
    reference: 'Luke 12:6 (WEB)',
    verse: 'Are not five sparrows sold for two assaria coins? Not one of them is forgotten by God.',
    kidPrompt: 'Not one sparrow is forgotten. How does it feel to know God remembers you?',
  },
  {
    id: 38,
    reference: 'Genesis 1:31 (WEB)',
    verse: 'God saw everything that he had made, and, behold, it was very good.',
    kidPrompt: 'God looked at all creation and said "very good." What part of creation do you love most?',
  },
  {
    id: 39,
    reference: 'Psalm 136:25 (WEB)',
    verse: 'He gives food to every living thing, for his loving kindness endures forever.',
    kidPrompt: 'God feeds every living thing. Who do you think feeds the fish deep in the ocean?',
  },
  {
    id: 40,
    reference: 'Isaiah 43:20 (WEB)',
    verse: 'The animals of the field shall honor me, the jackals and the ostriches, because I give waters in the wilderness and rivers in the desert.',
    kidPrompt: 'God gives water even in the desert. When has God helped you in a tough time?',
  },
  {
    id: 41,
    reference: 'Psalm 150:6 (WEB)',
    verse: 'Let everything that has breath praise Yahweh! Praise Yah!',
    kidPrompt: 'Every creature that breathes can praise God. How do you praise God?',
  },
  {
    id: 42,
    reference: 'Genesis 9:16 (WEB)',
    verse: 'The rainbow will be in the cloud. I will look at it, that I may remember the everlasting covenant between God and every living creature of all flesh that is on the earth.',
    kidPrompt: 'The rainbow is God\'s promise. What is a promise you have made and kept?',
  },
  {
    id: 43,
    reference: 'Psalm 104:14 (WEB)',
    verse: 'He causes the grass to grow for the livestock, and plants for man to cultivate, that he may produce food out of the earth.',
    kidPrompt: 'God makes grass grow for animals and food for us. What is your favorite food God provides?',
  },
  {
    id: 44,
    reference: 'Proverbs 27:23 (WEB)',
    verse: 'Know well the state of your flocks, and pay attention to your herds.',
    kidPrompt: 'This verse says to take care of what God gives you. What has God given you to take care of?',
  },
  {
    id: 45,
    reference: 'Psalm 37:5 (WEB)',
    verse: 'Commit your way to Yahweh. Trust also in him, and he will do this.',
    kidPrompt: 'What is something you can trust God with today?',
  },
  {
    id: 46,
    reference: 'Psalm 46:1 (WEB)',
    verse: 'God is our refuge and strength, a very present help in trouble.',
    kidPrompt: 'God was Noah\'s help in the flood. When has God been your help?',
  },
  {
    id: 47,
    reference: 'Psalm 121:1-2 (WEB)',
    verse: 'I will lift up my eyes to the hills. Where does my help come from? My help comes from Yahweh, who made heaven and earth.',
    kidPrompt: 'The God who made every animal also helps you. What do you need help with today?',
  },
  {
    id: 48,
    reference: 'Proverbs 3:5 (WEB)',
    verse: 'Trust in Yahweh with all your heart, and do not lean on your own understanding.',
    kidPrompt: 'Noah trusted God even when building the Ark seemed strange. How can you trust God more?',
  },
  {
    id: 49,
    reference: 'Isaiah 65:25 (WEB)',
    verse: 'The wolf and the lamb will feed together. The lion will eat straw like the ox. They will not hurt nor destroy in all my holy mountain.',
    kidPrompt: 'One day the wolf and lamb will be friends. What does peace between enemies look like?',
  },
  {
    id: 50,
    reference: 'Psalm 33:5 (WEB)',
    verse: 'He loves righteousness and justice. The earth is full of the loving kindness of Yahweh.',
    kidPrompt: 'The earth is full of God\'s love. Where do you see God\'s love in nature?',
  },
];
