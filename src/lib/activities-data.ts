import { Activity } from '@/types';

export const ACTIVITIES: Activity[] = [
  {
    id: 'quiz_railways_gk',
    title: 'Indian Railways & Heritage Trivia',
    description: 'Test your knowledge on India’s historic rail network, iconic routes, world heritage mountain railways, and modern engineering marvels.',
    category: 'quiz',
    estimatedMinutes: 5,
    pointsReward: 50,
    questions: [
      {
        id: 'q1',
        question: 'When did the first passenger train run in India between Bori Bunder (Mumbai) and Thane?',
        options: [
          '16 April 1853',
          '15 August 1857',
          '26 January 1860',
          '1 May 1848'
        ],
        correctIndex: 0,
        explanation: 'The first passenger train in India ran on 16 April 1853 covering a distance of 34 kilometers with 400 passengers in 14 carriages hauled by three steam locomotives: Sahib, Sindh, and Sultan.'
      },
      {
        id: 'q2',
        question: 'Which of the following is recognized as a UNESCO World Heritage Mountain Railway of India?',
        options: [
          'Konkan Railway',
          'Darjeeling Himalayan Railway',
          'Western Dedicated Freight Corridor',
          'Delhi Ring Railway'
        ],
        correctIndex: 1,
        explanation: 'The Darjeeling Himalayan Railway (inscribed 1999), Nilgiri Mountain Railway (2005), and Kalka-Shimla Railway (2008) are collectively inscribed as Mountain Railways of India under UNESCO World Heritage.'
      },
      {
        id: 'q3',
        question: 'What is the world’s highest railway arch bridge, spanning the Chenab River in Jammu & Kashmir?',
        options: [
          'Pamban Bridge',
          'Bogibeel Bridge',
          'Chenab Rail Bridge',
          'Vidyasagar Setu'
        ],
        correctIndex: 2,
        explanation: 'The Chenab Rail Bridge stands at an astonishing height of 359 meters (1,178 ft) above the river bed, making it 35 meters taller than the Eiffel Tower in Paris.'
      },
      {
        id: 'q4',
        question: 'What is the official unified helpline number for all passenger grievances and assistance on Indian Railways (RailMadad)?',
        options: [
          '100',
          '139',
          '1800-111-139',
          '1909'
        ],
        correctIndex: 1,
        explanation: 'Indian Railways consolidated all previous helplines (like 182, 138, etc.) into a single, unified 24x7 integrated helpline number: 139 (RailMadad).'
      },
      {
        id: 'q5',
        question: 'What is India’s longest train route by distance and time, running from Dibrugarh in Assam to Kanyakumari in Tamil Nadu?',
        options: [
          'Himsagar Express',
          'Vivek Express',
          'Grand Trunk Express',
          'Kerala Express'
        ],
        correctIndex: 1,
        explanation: 'The Vivek Express (Train 22503/22504) covers approximately 4,189 kilometers across 8 Indian states in around 75 hours, making it the longest route on the Indian Railways network.'
      }
    ]
  },
  {
    id: 'lang_hindi_english',
    title: 'Hindi - English Travel Language Exchange',
    description: 'Learn and test essential polite phrases, transit vocabulary, and cultural conversation starters for train journeys across India.',
    category: 'language',
    estimatedMinutes: 6,
    pointsReward: 40,
    flashcards: [
      {
        prompt: 'How do you say "Please" politely in Hindi?',
        answer: 'कृपया (Kripya)',
        hint: 'Used before making a request, e.g. "कृपया बैठिए" (Please sit).'
      },
      {
        prompt: 'How do you say "Thank you very much" in Hindi?',
        answer: 'बहुत-बहुत धन्यवाद / शुक्रिया (Bahut-bahut Dhanyavaad / Shukriya)',
        hint: 'Common courteous expression used across all regions.'
      },
      {
        prompt: 'What does "अगला स्टेशन कौन सा है?" (Agla station kaun sa hai?) mean in English?',
        answer: 'Which is the next station?',
        hint: 'Very handy question to ask fellow passengers on long routes.'
      },
      {
        prompt: 'How do you politely ask "May I charge my phone here?" in Hindi?',
        answer: 'क्या मैं यहाँ अपना फोन चार्ज कर सकता/सकती हूँ? (Kya main yahan apna phone charge kar sakta/sakti hoon?)',
        hint: 'A friendly icebreaker near coach charging sockets.'
      },
      {
        prompt: 'What does "शुभ यात्रा!" (Shubh Yatra!) mean?',
        answer: 'Have a pleasant / auspicious journey! (Bon Voyage)',
        hint: 'Traditional Indian Railways greeting displayed at stations.'
      }
    ],
    questions: [
      {
        id: 'l1',
        question: 'What does "कृपया" (Kripya) translate to in English?',
        options: ['Thank you', 'Please', 'Excuse me', 'Welcome'],
        correctIndex: 1,
        explanation: '"कृपया" (Kripya) means "Please" in formal and polite Hindi.'
      },
      {
        id: 'l2',
        question: 'Which phrase is used to wish someone a safe and pleasant journey?',
        options: ['शुभ प्रभात (Shubh Prabhat)', 'शुभ यात्रा (Shubh Yatra)', 'शुभ रात्रि (Shubh Ratri)', 'अलविदा (Alvida)'],
        correctIndex: 1,
        explanation: '"शुभ यात्रा" (Shubh Yatra) is the Hindi equivalent of "Bon Voyage" or "Have a safe journey".'
      },
      {
        id: 'l3',
        question: 'If you want to politely say "Excuse me / Pardon me", which phrase is commonly used?',
        options: ['माफ़ कीजिए (Maaf Kijiye)', 'नमस्ते (Namaste)', 'धन्यवाद (Dhanyavaad)', 'फिर मिलेंगे (Phir Milenge)'],
        correctIndex: 0,
        explanation: '"माफ़ कीजिए" (Maaf Kijiye) means "Excuse me" or "Forgive me".'
      }
    ]
  },
  {
    id: 'icebreaker_travel_prompts',
    title: 'Small Talk & Journey Stories Icebreakers',
    description: 'Thoughtful prompts inspired by the "Small Talk Saves Lives" ethos to break the ice respectfully with fellow passengers.',
    category: 'icebreaker',
    estimatedMinutes: 4,
    pointsReward: 30,
    icebreakerPrompts: [
      '“What is the most scenic or memorable train journey you have ever taken in India or abroad?”',
      '“If you could spend the next 4 hours learning one new skill from someone in this coach, what would you pick?”',
      '“What book, podcast, or topic has recently captured your imagination that you love talking about?”',
      '“Which station along this route serves your absolute favorite chai or regional snack?”',
      '“What is a hobby or project you are hoping to dedicate more time to this year?”'
    ]
  }
];
