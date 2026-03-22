export type DebateDifficulty = 'intermediate' | 'advanced';

export interface DebateTopic {
  readonly topic: string;
  readonly description: string;
  readonly expressions_for: readonly string[];
  readonly expressions_against: readonly string[];
  readonly useful_connectors: readonly string[];
  readonly difficulty_level: DebateDifficulty;
}

const TOPICS: readonly DebateTopic[] = [
  // --- Intermediate topics ---
  {
    topic: 'Remote work vs. office work',
    description: 'Is working from home better than going to the office every day?',
    expressions_for: [
      'I firmly believe that...',
      'One clear advantage is...',
      'It allows people to...',
      'From a practical standpoint...',
    ],
    expressions_against: [
      'On the other hand...',
      'The downside of this is...',
      'It can lead to...',
      'Many people argue that...',
    ],
    useful_connectors: [
      'however', 'moreover', 'in addition', 'nevertheless',
      'for instance', 'as a result', 'on the contrary',
    ],
    difficulty_level: 'intermediate',
  },
  {
    topic: 'Learning a language with apps vs. with a teacher',
    description: 'Are language learning apps more effective than traditional classes with a teacher?',
    expressions_for: [
      'In my opinion...',
      'The main benefit is...',
      'It gives learners the freedom to...',
      'Studies have shown that...',
    ],
    expressions_against: [
      'I disagree because...',
      'The problem with this approach is...',
      'Nothing can replace...',
      'While that may be true...',
    ],
    useful_connectors: [
      'although', 'whereas', 'furthermore', 'consequently',
      'for example', 'in contrast', 'similarly',
    ],
    difficulty_level: 'intermediate',
  },
  {
    topic: 'Physical books vs. e-books',
    description: 'Are physical books better than digital books for reading enjoyment and learning?',
    expressions_for: [
      'I strongly feel that...',
      'There is something special about...',
      'Research suggests that...',
      'One important point is...',
    ],
    expressions_against: [
      'That may be so, but...',
      'We should consider that...',
      'The reality is that...',
      'It is worth noting that...',
    ],
    useful_connectors: [
      'besides', 'therefore', 'in fact', 'on the whole',
      'specifically', 'despite this', 'equally important',
    ],
    difficulty_level: 'intermediate',
  },
  {
    topic: 'Living in the city vs. living in the countryside',
    description: 'Is city life better than countryside life for overall quality of living?',
    expressions_for: [
      'From my perspective...',
      'The biggest advantage is...',
      'It provides access to...',
      'People tend to prefer...',
    ],
    expressions_against: [
      'I see your point, however...',
      'The trade-off is that...',
      'One cannot ignore the fact that...',
      'Experience shows that...',
    ],
    useful_connectors: [
      'while', 'additionally', 'as a matter of fact', 'by contrast',
      'to illustrate', 'hence', 'above all',
    ],
    difficulty_level: 'intermediate',
  },
  {
    topic: 'Children and smartphones',
    description: 'Should children under 12 have their own smartphones?',
    expressions_for: [
      'I think it is reasonable because...',
      'In today\'s world...',
      'It helps children to...',
      'We cannot deny that...',
    ],
    expressions_against: [
      'I would argue that...',
      'There are serious concerns about...',
      'It is too early for children to...',
      'The evidence suggests otherwise...',
    ],
    useful_connectors: [
      'nonetheless', 'in particular', 'that said', 'as a consequence',
      'to begin with', 'on balance', 'ultimately',
    ],
    difficulty_level: 'intermediate',
  },
  {
    topic: 'Cooking at home vs. eating out',
    description: 'Is cooking at home always better than eating at restaurants?',
    expressions_for: [
      'I am convinced that...',
      'The key benefit is...',
      'Not only is it... but also...',
      'It encourages...',
    ],
    expressions_against: [
      'That is a fair point, but...',
      'We should also take into account...',
      'It overlooks the fact that...',
      'In many situations...',
    ],
    useful_connectors: [
      'granted', 'likewise', 'in the same way', 'conversely',
      'to sum up', 'at the same time', 'even so',
    ],
    difficulty_level: 'intermediate',
  },
  {
    topic: 'Public transport vs. personal cars',
    description: 'Should people use public transport instead of personal cars?',
    expressions_for: [
      'It is widely accepted that...',
      'The most compelling reason is...',
      'This would lead to...',
      'From an environmental point of view...',
    ],
    expressions_against: [
      'While I understand the argument...',
      'This does not account for...',
      'In practice...',
      'It is unrealistic to expect...',
    ],
    useful_connectors: [
      'due to', 'in other words', 'accordingly', 'by the same token',
      'to put it simply', 'even though', 'all things considered',
    ],
    difficulty_level: 'intermediate',
  },
  {
    topic: 'Homework for students',
    description: 'Should schools assign homework or let students learn only during school hours?',
    expressions_for: [
      'I believe that...',
      'It reinforces what...',
      'One advantage of this is...',
      'Without a doubt...',
    ],
    expressions_against: [
      'I respectfully disagree...',
      'The main issue is...',
      'Students already spend...',
      'There is growing evidence that...',
    ],
    useful_connectors: [
      'in the first place', 'what is more', 'having said that',
      'as a result of', 'to be specific', 'by and large', 'on the other hand',
    ],
    difficulty_level: 'intermediate',
  },
  // --- Advanced topics ---
  {
    topic: 'Artificial intelligence in education',
    description: 'Will AI tools improve education or make students overly dependent on technology?',
    expressions_for: [
      'It is my contention that...',
      'The transformative potential of...',
      'Evidence increasingly points to...',
      'One cannot underestimate the impact of...',
    ],
    expressions_against: [
      'I take issue with this view because...',
      'The fundamental flaw in this argument is...',
      'We risk creating a generation that...',
      'It would be naive to assume...',
    ],
    useful_connectors: [
      'notwithstanding', 'insofar as', 'be that as it may', 'by virtue of',
      'to elaborate', 'in light of this', 'irrespective of',
    ],
    difficulty_level: 'advanced',
  },
  {
    topic: 'Universal basic income',
    description: 'Should governments provide a basic income to all citizens regardless of employment?',
    expressions_for: [
      'From a socioeconomic perspective...',
      'The underlying principle is...',
      'This would fundamentally reshape...',
      'Proponents rightly point out that...',
    ],
    expressions_against: [
      'The counterargument rests on...',
      'This overlooks the inherent risk of...',
      'Economically speaking, this is unsustainable because...',
      'History has demonstrated that...',
    ],
    useful_connectors: [
      'to that end', 'in the long run', 'admittedly',
      'with this in mind', 'in retrospect', 'for all intents and purposes',
      'on closer examination',
    ],
    difficulty_level: 'advanced',
  },
  {
    topic: 'Space exploration funding',
    description: 'Should governments invest heavily in space exploration or redirect funds to social programs?',
    expressions_for: [
      'I maintain that...',
      'The long-term benefits far outweigh...',
      'It serves as a catalyst for...',
      'Scientific progress demands that...',
    ],
    expressions_against: [
      'While the ambition is admirable...',
      'The opportunity cost is simply too high...',
      'It is morally questionable to...',
      'Pragmatically speaking...',
    ],
    useful_connectors: [
      'in essence', 'to a large extent', 'not to mention',
      'in the absence of', 'taking everything into consideration',
      'as opposed to', 'to put it another way',
    ],
    difficulty_level: 'advanced',
  },
  {
    topic: 'The four-day work week',
    description: 'Should companies adopt a four-day work week as the standard?',
    expressions_for: [
      'There is a compelling case for...',
      'Pilot programs have conclusively shown...',
      'It is a matter of adapting to...',
      'The productivity paradox suggests...',
    ],
    expressions_against: [
      'This fails to consider...',
      'The assumption that productivity remains constant is...',
      'Not all industries can afford to...',
      'One must weigh the trade-offs of...',
    ],
    useful_connectors: [
      'by the same token', 'it follows that', 'in conjunction with',
      'needless to say', 'on the grounds that', 'bearing in mind',
      'to a certain degree',
    ],
    difficulty_level: 'advanced',
  },
  {
    topic: 'Social media influence on public opinion',
    description: 'Does social media do more to inform or to mislead the public?',
    expressions_for: [
      'It has democratized access to...',
      'The key argument in favor is...',
      'It empowers individuals to...',
      'We should acknowledge that...',
    ],
    expressions_against: [
      'The proliferation of misinformation...',
      'This argument does not hold up when...',
      'We are witnessing a troubling trend of...',
      'The echo chamber effect demonstrates that...',
    ],
    useful_connectors: [
      'undeniably', 'to this end', 'as a case in point',
      'in stark contrast', 'it stands to reason that',
      'upon reflection', 'taking this a step further',
    ],
    difficulty_level: 'advanced',
  },
  {
    topic: 'Tourism: economic benefit or cultural harm?',
    description: 'Does mass tourism bring more economic benefit or more cultural and environmental harm?',
    expressions_for: [
      'The economic rationale is clear...',
      'It provides livelihoods for...',
      'One must recognize the role of...',
      'The multiplier effect means...',
    ],
    expressions_against: [
      'The hidden costs include...',
      'This paints an incomplete picture because...',
      'Local communities often bear the brunt of...',
      'Sustainability concerns cannot be brushed aside...',
    ],
    useful_connectors: [
      'in the grand scheme of things', 'to draw a parallel',
      'notwithstanding the above', 'it is incumbent upon us to',
      'by extension', 'paradoxically', 'from this vantage point',
    ],
    difficulty_level: 'advanced',
  },
  {
    topic: 'Gap year before university',
    description: 'Should students take a gap year before starting university?',
    expressions_for: [
      'I am of the opinion that...',
      'It broadens one\'s horizons by...',
      'The personal growth that comes from...',
      'A well-planned gap year can...',
    ],
    expressions_against: [
      'The risk, however, is that...',
      'Not everyone has the privilege of...',
      'It can disrupt academic momentum...',
      'One should not romanticize...',
    ],
    useful_connectors: [
      'to begin with', 'that being said', 'in this regard',
      'leaving aside the question of', 'on the flip side',
      'when all is said and done', 'in the final analysis',
    ],
    difficulty_level: 'advanced',
  },
] as const;

export function getDebateTopics(difficulty?: DebateDifficulty): readonly DebateTopic[] {
  if (!difficulty) return TOPICS;
  return TOPICS.filter(t => t.difficulty_level === difficulty);
}

export function findDebateTopic(query: string): DebateTopic | undefined {
  const lower = query.toLowerCase();
  return TOPICS.find(t =>
    t.topic.toLowerCase().includes(lower) ||
    t.description.toLowerCase().includes(lower)
  );
}

export function getRandomDebateTopic(difficulty?: DebateDifficulty): DebateTopic {
  const pool = difficulty ? TOPICS.filter(t => t.difficulty_level === difficulty) : TOPICS;
  // Pool is guaranteed non-empty since TOPICS has 16 entries and filter always matches
  return pool[Math.floor(Math.random() * pool.length)] as DebateTopic;
}
