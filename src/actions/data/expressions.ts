export type ExpressionLevel = 'beginner' | 'intermediate' | 'advanced';

export interface Expression {
  expression: string;
  meaning: string;
  examples: [string, string, string];
  level: ExpressionLevel;
}

export const EXPRESSIONS: readonly Expression[] = [
  // ── Beginner (10) ──────────────────────────────────────────────
  {
    expression: 'break the ice',
    meaning: 'To do or say something to relieve tension or start a conversation in a social situation.',
    examples: [
      'He told a joke to break the ice at the meeting.',
      'A simple compliment can break the ice with strangers.',
      'The host played a game to break the ice at the party.',
    ],
    level: 'beginner',
  },
  {
    expression: 'piece of cake',
    meaning: 'Something that is very easy to do.',
    examples: [
      'The test was a piece of cake — I finished in ten minutes.',
      'For an experienced chef, making pasta is a piece of cake.',
      'Don\'t worry, fixing this is a piece of cake.',
    ],
    level: 'beginner',
  },
  {
    expression: 'hit the nail on the head',
    meaning: 'To describe exactly what is causing a situation or problem.',
    examples: [
      'You hit the nail on the head — that\'s exactly the issue.',
      'She hit the nail on the head with her analysis of the problem.',
      'I think you\'ve hit the nail on the head about why sales dropped.',
    ],
    level: 'beginner',
  },
  {
    expression: 'under the weather',
    meaning: 'Feeling slightly ill or not well.',
    examples: [
      'I\'m feeling a bit under the weather today, so I\'ll stay home.',
      'She looked under the weather at work yesterday.',
      'He\'s been under the weather since the weekend.',
    ],
    level: 'beginner',
  },
  {
    expression: 'let the cat out of the bag',
    meaning: 'To reveal a secret accidentally.',
    examples: [
      'He let the cat out of the bag about the surprise party.',
      'Don\'t let the cat out of the bag — it\'s supposed to be a surprise!',
      'She accidentally let the cat out of the bag during dinner.',
    ],
    level: 'beginner',
  },
  {
    expression: 'cost an arm and a leg',
    meaning: 'To be very expensive.',
    examples: [
      'That new phone costs an arm and a leg.',
      'Eating out every night costs an arm and a leg.',
      'The repairs on the car cost an arm and a leg.',
    ],
    level: 'beginner',
  },
  {
    expression: 'bite the bullet',
    meaning: 'To endure a painful or difficult situation bravely.',
    examples: [
      'I hate going to the dentist, but I just have to bite the bullet.',
      'She bit the bullet and told her boss the truth.',
      'Sometimes you just have to bite the bullet and get it done.',
    ],
    level: 'beginner',
  },
  {
    expression: 'a blessing in disguise',
    meaning: 'Something that seems bad at first but turns out to be good.',
    examples: [
      'Losing that job was a blessing in disguise — I found a much better one.',
      'The rain was a blessing in disguise; it cooled everything down.',
      'Getting lost turned out to be a blessing in disguise — we found a great restaurant.',
    ],
    level: 'beginner',
  },
  {
    expression: 'call it a day',
    meaning: 'To stop working on something; to end an activity.',
    examples: [
      'We\'ve been working for hours — let\'s call it a day.',
      'After three rounds of edits, the team called it a day.',
      'I\'m exhausted. I think I\'ll call it a day.',
    ],
    level: 'beginner',
  },
  {
    expression: 'get out of hand',
    meaning: 'To become difficult to control.',
    examples: [
      'The party got out of hand when too many people showed up.',
      'If we don\'t address this now, it could get out of hand.',
      'The argument got out of hand very quickly.',
    ],
    level: 'beginner',
  },

  // ── Intermediate (10) ─────────────────────────────────────────
  {
    expression: 'burn the midnight oil',
    meaning: 'To work or study late into the night.',
    examples: [
      'She burned the midnight oil to finish the report before the deadline.',
      'Students often burn the midnight oil during exam week.',
      'I\'ve been burning the midnight oil on this project all week.',
    ],
    level: 'intermediate',
  },
  {
    expression: 'the ball is in your court',
    meaning: 'It is your turn to take action or make a decision.',
    examples: [
      'I\'ve made my offer — the ball is in your court now.',
      'We\'ve done our part. The ball is in their court.',
      'She presented the proposal; the ball is in the client\'s court.',
    ],
    level: 'intermediate',
  },
  {
    expression: 'sit on the fence',
    meaning: 'To remain neutral or undecided about an issue.',
    examples: [
      'You can\'t sit on the fence forever — you need to choose a side.',
      'Politicians sometimes sit on the fence on controversial issues.',
      'I\'m still sitting on the fence about whether to accept the job.',
    ],
    level: 'intermediate',
  },
  {
    expression: 'go the extra mile',
    meaning: 'To make more effort than is expected.',
    examples: [
      'She always goes the extra mile for her clients.',
      'If you go the extra mile, people will notice your dedication.',
      'The hotel staff went the extra mile to make our stay perfect.',
    ],
    level: 'intermediate',
  },
  {
    expression: 'cut corners',
    meaning: 'To do something in the cheapest or easiest way, often sacrificing quality.',
    examples: [
      'The contractor cut corners on the construction, and now there are problems.',
      'You can\'t cut corners when it comes to safety.',
      'They cut corners to save money, but it backfired.',
    ],
    level: 'intermediate',
  },
  {
    expression: 'miss the boat',
    meaning: 'To miss an opportunity by being too slow to act.',
    examples: [
      'If you don\'t apply soon, you\'ll miss the boat on that scholarship.',
      'We missed the boat on buying that stock before prices soared.',
      'Don\'t miss the boat — the sale ends tomorrow.',
    ],
    level: 'intermediate',
  },
  {
    expression: 'pull someone\'s leg',
    meaning: 'To joke with someone; to tease them playfully.',
    examples: [
      'Are you serious or are you pulling my leg?',
      'He was just pulling your leg — he didn\'t really quit.',
      'Stop pulling my leg and tell me the truth!',
    ],
    level: 'intermediate',
  },
  {
    expression: 'once in a blue moon',
    meaning: 'Very rarely; almost never.',
    examples: [
      'He only visits his hometown once in a blue moon.',
      'Once in a blue moon, I treat myself to an expensive dinner.',
      'She exercises once in a blue moon — she really should do it more often.',
    ],
    level: 'intermediate',
  },
  {
    expression: 'speak volumes',
    meaning: 'To convey a great deal of meaning without words, or to be very revealing.',
    examples: [
      'Her silence spoke volumes about her disappointment.',
      'The quality of his work speaks volumes about his dedication.',
      'The empty seats at the meeting spoke volumes.',
    ],
    level: 'intermediate',
  },
  {
    expression: 'throw in the towel',
    meaning: 'To give up; to admit defeat.',
    examples: [
      'After months of trying, she finally threw in the towel.',
      'Don\'t throw in the towel — you\'re so close to finishing!',
      'The company threw in the towel and closed down.',
    ],
    level: 'intermediate',
  },

  // ── Advanced (12) ─────────────────────────────────────────────
  {
    expression: 'the elephant in the room',
    meaning: 'An obvious problem or issue that everyone is aware of but nobody wants to discuss.',
    examples: [
      'The budget deficit was the elephant in the room at the board meeting.',
      'We need to address the elephant in the room before we can move forward.',
      'Nobody mentioned the elephant in the room — the CEO\'s poor performance.',
    ],
    level: 'advanced',
  },
  {
    expression: 'a double-edged sword',
    meaning: 'Something that has both positive and negative consequences.',
    examples: [
      'Social media is a double-edged sword — it connects people but also spreads misinformation.',
      'Fame can be a double-edged sword for many celebrities.',
      'Technology in the classroom is a double-edged sword.',
    ],
    level: 'advanced',
  },
  {
    expression: 'turn a blind eye',
    meaning: 'To deliberately ignore something that you know is wrong or happening.',
    examples: [
      'The manager turned a blind eye to the employees arriving late.',
      'You can\'t turn a blind eye to corruption.',
      'She turned a blind eye to his messy room — it wasn\'t worth the argument.',
    ],
    level: 'advanced',
  },
  {
    expression: 'the writing is on the wall',
    meaning: 'There are clear signs that something bad or important is going to happen.',
    examples: [
      'The writing was on the wall for the company months before it went bankrupt.',
      'When they started laying people off, the writing was on the wall.',
      'The writing is on the wall — we need to change our strategy.',
    ],
    level: 'advanced',
  },
  {
    expression: 'barking up the wrong tree',
    meaning: 'To pursue a mistaken or misguided course of action.',
    examples: [
      'If you think I took your keys, you\'re barking up the wrong tree.',
      'The police were barking up the wrong tree with that suspect.',
      'You\'re barking up the wrong tree if you think more ads will fix the product issue.',
    ],
    level: 'advanced',
  },
  {
    expression: 'play devil\'s advocate',
    meaning: 'To argue against something for the sake of debate, even if you agree with it.',
    examples: [
      'Let me play devil\'s advocate here — what if the plan fails?',
      'She likes to play devil\'s advocate in meetings to test ideas.',
      'I\'m not disagreeing, just playing devil\'s advocate.',
    ],
    level: 'advanced',
  },
  {
    expression: 'read between the lines',
    meaning: 'To understand the hidden or implied meaning, not just what is explicitly stated.',
    examples: [
      'If you read between the lines of his email, he\'s clearly unhappy.',
      'You have to read between the lines to understand what she really means.',
      'Reading between the lines, the report suggests the project is at risk.',
    ],
    level: 'advanced',
  },
  {
    expression: 'a watershed moment',
    meaning: 'A turning point; an event that marks a significant change.',
    examples: [
      'The invention of the internet was a watershed moment in human history.',
      'That meeting was a watershed moment for our company\'s direction.',
      'The election proved to be a watershed moment for the country.',
    ],
    level: 'advanced',
  },
  {
    expression: 'play it by ear',
    meaning: 'To decide how to deal with a situation as it develops, without a fixed plan.',
    examples: [
      'I don\'t have a plan for the weekend yet — I\'ll just play it by ear.',
      'We don\'t know what to expect, so let\'s play it by ear.',
      'She prefers to play it by ear rather than follow a strict schedule.',
    ],
    level: 'advanced',
  },
  {
    expression: 'tip of the iceberg',
    meaning: 'A small, evident part of a much larger problem or situation.',
    examples: [
      'The complaints we\'ve received are just the tip of the iceberg.',
      'What you see in the news is only the tip of the iceberg.',
      'The financial losses reported are just the tip of the iceberg.',
    ],
    level: 'advanced',
  },
  {
    expression: 'have a lot on one\'s plate',
    meaning: 'To have a lot of work or responsibilities to deal with.',
    examples: [
      'I can\'t take on another project — I already have a lot on my plate.',
      'She has a lot on her plate with work and the kids.',
      'He turned down the invitation because he had too much on his plate.',
    ],
    level: 'advanced',
  },
  {
    expression: 'weather the storm',
    meaning: 'To survive a difficult period or situation successfully.',
    examples: [
      'The company managed to weather the storm of the economic crisis.',
      'If we stick together, we can weather the storm.',
      'She weathered the storm of public criticism with grace.',
    ],
    level: 'advanced',
  },
] as const;
