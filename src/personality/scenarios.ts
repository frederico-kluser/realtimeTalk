export type ScenarioId =
  | 'restaurant'
  | 'airport'
  | 'hotel'
  | 'job_interview'
  | 'doctor_visit'
  | 'shopping'
  | 'phone_call'
  | 'meeting';

export type ScenarioDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface ScenarioVocabulary {
  readonly beginner: readonly string[];
  readonly intermediate: readonly string[];
  readonly advanced: readonly string[];
}

export interface Scenario {
  readonly id: ScenarioId;
  readonly name: string;
  readonly description: string;
  readonly aiRole: string;
  readonly setting: string;
  readonly studentObjective: string;
  readonly vocabulary: ScenarioVocabulary;
  readonly keyPhrases: readonly string[];
}

export const SCENARIOS: readonly Scenario[] = [
  {
    id: 'restaurant',
    name: 'Restaurant',
    description: 'Practice ordering food, asking about the menu, and interacting with a waiter.',
    aiRole: 'Friendly waiter at a casual restaurant',
    setting: 'A cozy neighborhood restaurant during dinner time. The restaurant has a printed menu with appetizers, main courses, desserts, and drinks.',
    studentObjective: 'Successfully order a complete meal (drink, appetizer, main course, dessert), ask about ingredients or recommendations, and handle the bill.',
    vocabulary: {
      beginner: [
        'menu', 'water', 'bill', 'table', 'order', 'food', 'drink',
        'please', 'thank you', 'appetizer', 'dessert', 'salad', 'soup',
        'chicken', 'fish', 'rice', 'check',
      ],
      intermediate: [
        'reservation', 'specials', 'appetizer', 'main course', 'side dish',
        'dressing', 'medium rare', 'well done', 'gluten-free', 'allergies',
        'complimentary', 'gratuity', 'recommendation', 'portion', 'takeout',
        'sparkling water', 'house wine',
      ],
      advanced: [
        'sommelier', 'prix fixe', 'amuse-bouche', 'degustazione',
        'palate cleanser', 'reduction', 'infusion', 'artisanal',
        'farm-to-table', 'seasonal menu', 'wine pairing', 'corkage fee',
        'dietary restrictions', 'sustainably sourced', 'al dente',
      ],
    },
    keyPhrases: [
      'Could I see the menu, please?',
      'What do you recommend?',
      'I would like to order...',
      'Could I have the bill, please?',
      'Is there anything gluten-free?',
      'How long will it take?',
    ],
  },
  {
    id: 'airport',
    name: 'Airport',
    description: 'Practice checking in, going through security, and finding your gate.',
    aiRole: 'Airline check-in agent at the airport counter',
    setting: 'An international airport terminal. The check-in counter has screens showing flight information. The departure board shows gates and times.',
    studentObjective: 'Check in for a flight, ask about baggage, navigate through the airport, and handle common travel situations like delays or gate changes.',
    vocabulary: {
      beginner: [
        'ticket', 'passport', 'gate', 'flight', 'bag', 'seat',
        'boarding pass', 'window', 'aisle', 'delay', 'arrival',
        'departure', 'terminal', 'luggage', 'security', 'check-in',
      ],
      intermediate: [
        'connecting flight', 'layover', 'overhead bin', 'carry-on',
        'checked baggage', 'boarding time', 'turbulence', 'customs',
        'immigration', 'duty-free', 'transit', 'upgrade', 'standby',
        'frequent flyer', 'excess baggage', 'travel insurance',
      ],
      advanced: [
        'itinerary', 'lounge access', 'priority boarding', 'reaccommodation',
        'involuntary bumping', 'codeshare', 'interline agreement',
        'visa on arrival', 'transit visa', 'declaration form',
        'quarantine regulations', 'bilateral agreement', 'embargo',
      ],
    },
    keyPhrases: [
      'I would like to check in for my flight.',
      'How many bags can I check?',
      'Which gate is my flight departing from?',
      'Is the flight on time?',
      'Can I get a window seat?',
      'Where is the boarding area?',
    ],
  },
  {
    id: 'hotel',
    name: 'Hotel',
    description: 'Practice checking in, requesting services, and handling hotel interactions.',
    aiRole: 'Polite hotel receptionist at the front desk',
    setting: 'The lobby of a comfortable hotel. The front desk has a computer for reservations. There are brochures about local attractions on the counter.',
    studentObjective: 'Check in, ask about room amenities, request services (wake-up call, room service, extra towels), and check out smoothly.',
    vocabulary: {
      beginner: [
        'room', 'key', 'bed', 'bathroom', 'towel', 'breakfast',
        'elevator', 'floor', 'reception', 'checkout', 'wifi',
        'single room', 'double room', 'night', 'price',
      ],
      intermediate: [
        'reservation', 'confirmation number', 'amenities', 'room service',
        'wake-up call', 'concierge', 'complimentary', 'minibar',
        'housekeeping', 'late checkout', 'deposit', 'suite',
        'king-size bed', 'non-smoking', 'gym', 'laundry service',
      ],
      advanced: [
        'penthouse', 'turndown service', 'valet parking', 'adjoining rooms',
        'all-inclusive', 'boutique hotel', 'conference facilities',
        'overbooked', 'loyalty program', 'incidentals', 'folio',
        'express checkout', 'porter', 'en suite',
      ],
    },
    keyPhrases: [
      'I have a reservation under the name...',
      'What time is checkout?',
      'Could I get a wake-up call at 7 AM?',
      'Is breakfast included?',
      'Could you recommend a good restaurant nearby?',
      'I would like to extend my stay.',
    ],
  },
  {
    id: 'job_interview',
    name: 'Job Interview',
    description: 'Practice answering common interview questions and presenting yourself professionally.',
    aiRole: 'HR manager conducting a job interview for a mid-level position',
    setting: 'A professional office meeting room. The interviewer has a copy of the candidate resume and a list of prepared questions.',
    studentObjective: 'Answer interview questions confidently, describe experience and skills, ask relevant questions about the role, and make a positive impression.',
    vocabulary: {
      beginner: [
        'job', 'work', 'company', 'team', 'experience', 'skills',
        'salary', 'schedule', 'office', 'manager', 'interview',
        'resume', 'strengths', 'weakness', 'goal',
      ],
      intermediate: [
        'qualifications', 'responsibilities', 'achievements', 'deadline',
        'collaboration', 'leadership', 'problem-solving', 'reference',
        'probation period', 'benefits', 'remote work', 'career growth',
        'performance review', 'work-life balance', 'cross-functional',
      ],
      advanced: [
        'stakeholder management', 'strategic planning', 'KPI',
        'competitive advantage', 'organizational culture', 'retention',
        'succession planning', 'bandwidth', 'scalability',
        'paradigm shift', 'synergy', 'value proposition',
        'thought leadership', 'deliverables',
      ],
    },
    keyPhrases: [
      'Tell me about yourself.',
      'Why are you interested in this position?',
      'What are your greatest strengths?',
      'Where do you see yourself in five years?',
      'Do you have any questions for us?',
      'Could you walk me through your experience?',
    ],
  },
  {
    id: 'doctor_visit',
    name: 'Doctor Visit',
    description: 'Practice describing symptoms, understanding medical advice, and communicating with a doctor.',
    aiRole: 'General practitioner doctor at a medical clinic',
    setting: 'A clean, well-lit doctor office. The doctor has a stethoscope and is seated at a desk with a computer for medical records.',
    studentObjective: 'Describe symptoms clearly, answer medical history questions, understand the diagnosis and treatment plan, and ask follow-up questions.',
    vocabulary: {
      beginner: [
        'pain', 'headache', 'fever', 'cold', 'cough', 'medicine',
        'doctor', 'sick', 'appointment', 'stomach', 'throat',
        'rest', 'water', 'sleep', 'pharmacy',
      ],
      intermediate: [
        'symptoms', 'diagnosis', 'prescription', 'allergies', 'dosage',
        'side effects', 'blood pressure', 'temperature', 'examination',
        'follow-up', 'specialist', 'referral', 'chronic', 'acute',
        'inflammation', 'antibiotic',
      ],
      advanced: [
        'prognosis', 'contraindication', 'comorbidity', 'pathology',
        'benign', 'malignant', 'immunodeficiency', 'biopsy',
        'differential diagnosis', 'remission', 'palliative',
        'prophylactic', 'asymptomatic', 'idiopathic',
      ],
    },
    keyPhrases: [
      'I have been feeling unwell for a few days.',
      'The pain is in my lower back.',
      'How often should I take this medicine?',
      'Are there any side effects I should know about?',
      'Should I come back for a follow-up?',
      'Is it something serious?',
    ],
  },
  {
    id: 'shopping',
    name: 'Shopping',
    description: 'Practice asking about products, prices, sizes, and completing a purchase.',
    aiRole: 'Friendly shop assistant in a clothing store',
    setting: 'A medium-sized clothing store with organized sections for different types of clothing. There are fitting rooms in the back and a cash register near the entrance.',
    studentObjective: 'Find specific items, ask about sizes and colors, try items on, negotiate or ask about discounts, and complete a purchase.',
    vocabulary: {
      beginner: [
        'shirt', 'pants', 'shoes', 'size', 'color', 'price',
        'small', 'medium', 'large', 'cheap', 'expensive', 'buy',
        'cash', 'card', 'receipt', 'fitting room',
      ],
      intermediate: [
        'discount', 'sale', 'exchange', 'refund', 'warranty',
        'fabric', 'cotton', 'leather', 'brand', 'collection',
        'out of stock', 'on sale', 'clearance', 'gift wrap',
        'loyalty card', 'return policy',
      ],
      advanced: [
        'bespoke', 'tailored', 'haute couture', 'sustainable fashion',
        'capsule wardrobe', 'fast fashion', 'artisanal', 'ethically sourced',
        'limited edition', 'price point', 'markup', 'consignment',
        'vintage', 'upcycled',
      ],
    },
    keyPhrases: [
      'Do you have this in a different size?',
      'Can I try this on?',
      'How much does this cost?',
      'Is there a discount on this item?',
      'Do you accept credit cards?',
      'I would like to return this.',
    ],
  },
  {
    id: 'phone_call',
    name: 'Phone Call',
    description: 'Practice making and receiving phone calls in a professional context.',
    aiRole: 'Office receptionist answering the phone at a business',
    setting: 'A phone conversation with a company receptionist. The student is calling to inquire about services, schedule an appointment, or speak with a specific person.',
    studentObjective: 'Introduce yourself on the phone, state the purpose of the call, leave a message if needed, and confirm details before hanging up.',
    vocabulary: {
      beginner: [
        'hello', 'call', 'phone', 'name', 'number', 'message',
        'speak', 'wait', 'hold', 'bye', 'sorry', 'repeat',
        'appointment', 'available', 'busy',
      ],
      intermediate: [
        'extension', 'transfer', 'voicemail', 'callback', 'on hold',
        'regarding', 'inquire', 'schedule', 'reschedule', 'confirm',
        'availability', 'directory', 'switchboard', 'line is busy',
        'put through', 'take a message',
      ],
      advanced: [
        'conference call', 'teleconference', 'minutes of the call',
        'follow-up correspondence', 'escalate', 'stakeholder',
        'due diligence', 'compliance', 'non-disclosure', 'liaison',
        'point of contact', 'action items', 'deliverables',
      ],
    },
    keyPhrases: [
      'Hello, may I speak with...?',
      'I am calling regarding...',
      'Could you put me through to...?',
      'Could I leave a message?',
      'Could you repeat that, please?',
      'Thank you for your time.',
    ],
  },
  {
    id: 'meeting',
    name: 'Business Meeting',
    description: 'Practice participating in a business meeting, presenting ideas, and collaborating.',
    aiRole: 'Team lead running a project status meeting',
    setting: 'A conference room with a whiteboard and a projector. Team members are seated around a table discussing a project update and next steps.',
    studentObjective: 'Present a status update, express opinions, agree or disagree professionally, suggest solutions, and confirm action items.',
    vocabulary: {
      beginner: [
        'meeting', 'project', 'team', 'idea', 'plan', 'question',
        'agree', 'disagree', 'finish', 'start', 'next', 'problem',
        'help', 'goal', 'report',
      ],
      intermediate: [
        'agenda', 'milestone', 'deadline', 'status update', 'feedback',
        'proposal', 'delegate', 'prioritize', 'bottleneck', 'workaround',
        'action item', 'follow up', 'takeaway', 'moving forward',
        'on track', 'behind schedule',
      ],
      advanced: [
        'synergy', 'pivot', 'cross-functional alignment', 'scalability',
        'risk mitigation', 'resource allocation', 'ROI',
        'quarterly review', 'retrospective', 'OKR',
        'stakeholder buy-in', 'change management', 'paradigm',
        'thought leadership',
      ],
    },
    keyPhrases: [
      'Let me give you a quick update on...',
      'I think we should consider...',
      'I agree with that point, and I would add...',
      'What is the timeline for this?',
      'Can we circle back to that later?',
      'Let me summarize the action items.',
    ],
  },
] as const;

export function getScenario(id: ScenarioId): Scenario {
  const scenario = SCENARIOS.find(s => s.id === id);
  if (!scenario) throw new Error(`Unknown scenario: ${id}`);
  return scenario;
}

export function getScenarioVocabulary(
  id: ScenarioId,
  difficulty: ScenarioDifficulty,
): readonly string[] {
  const scenario = getScenario(id);
  return scenario.vocabulary[difficulty];
}

export function buildRoleplayInstructions(
  scenario: Scenario,
  difficulty: ScenarioDifficulty,
): string {
  const vocab = scenario.vocabulary[difficulty];

  return `
# ROLEPLAY MODE — ACTIVE

You are now playing a specific character in an immersive scenario. Stay fully in character throughout this roleplay.

## Your Role
${scenario.aiRole}

## Setting
${scenario.setting}

## Student Objective
The student must: ${scenario.studentObjective}

## Difficulty Level: ${difficulty}
${difficulty === 'beginner'
    ? 'Use simple language, speak slowly, and offer helpful hints if the student struggles. Be patient and repeat if needed.'
    : difficulty === 'intermediate'
      ? 'Use natural language at a moderate pace. Gently correct mistakes and introduce scenario-specific vocabulary.'
      : 'Use natural, fluent language as a native speaker would. Expect the student to use advanced vocabulary and complex sentences.'}

## Target Vocabulary for This Scenario
The student should practice using these words and expressions:
${vocab.map(w => `- ${w}`).join('\n')}

Try to naturally introduce these words during the conversation so the student can learn them in context.

## Key Phrases to Practice
${scenario.keyPhrases.map(p => `- "${p}"`).join('\n')}

## Rules During Roleplay
- Stay in character as "${scenario.aiRole}" at all times
- React naturally to what the student says within the scenario context
- If the student makes a language mistake, gently correct it while staying in character
- Guide the conversation toward practicing the target vocabulary
- If the student goes off-topic, steer back to the scenario naturally
- When the student has completed the main objectives, congratulate them and suggest ending the roleplay
`.trim();
}
