// VIBE Multiplayer & Travel Games Engine

export interface StationWord {
  name: string;
  code: string;
  state: string;
}

export const FAMOUS_STATIONS: StationWord[] = [
  { name: 'DELHI', code: 'NDLS', state: 'Delhi' },
  { name: 'HOWRAH', code: 'HWH', state: 'West Bengal' },
  { name: 'HARIDWAR', code: 'HW', state: 'Uttarakhand' },
  { name: 'RATLAM', code: 'RTM', state: 'Madhya Pradesh' },
  { name: 'MUMBAI', code: 'MMCT', state: 'Maharashtra' },
  { name: 'INDORE', code: 'INDB', state: 'Madhya Pradesh' },
  { name: 'ETAWAH', code: 'ETW', state: 'Uttar Pradesh' },
  { name: 'HUBLI', code: 'UBL', state: 'Karnataka' },
  { name: 'ITSI', code: 'ET', state: 'Madhya Pradesh' },
  { name: 'ILKAL', code: 'ILK', state: 'Karnataka' },
  { name: 'LUCKNOW', code: 'LKO', state: 'Uttar Pradesh' },
  { name: 'WARANGAL', code: 'WL', state: 'Telangana' },
  { name: 'LONAVALA', code: 'LNL', state: 'Maharashtra' },
  { name: 'AGRA', code: 'AGC', state: 'Uttar Pradesh' },
  { name: 'AHMEDABAD', code: 'ADI', state: 'Gujarat' },
  { name: 'DARJEELING', code: 'DJ', state: 'West Bengal' },
  { name: 'GWALIOR', code: 'GWL', state: 'Madhya Pradesh' },
  { name: 'RAJKOT', code: 'RJT', state: 'Gujarat' },
  { name: 'TRIVANDRUM', code: 'TVC', state: 'Kerala' },
  { name: 'MADURAI', code: 'MDU', state: 'Tamil Nadu' },
  { name: 'VARANASI', code: 'BSB', state: 'Uttar Pradesh' },
  { name: 'JAIPUR', code: 'JP', state: 'Rajasthan' },
  { name: 'RANCHI', code: 'RNC', state: 'Jharkhand' },
  { name: 'PATNA', code: 'PNBE', state: 'Bihar' },
  { name: 'AMRITSAR', code: 'ASR', state: 'Punjab' },
  { name: 'ROORKEE', code: 'RK', state: 'Uttarakhand' },
  { name: 'ERNAKULAM', code: 'ERS', state: 'Kerala' },
  { name: 'MYSORE', code: 'MYS', state: 'Karnataka' },
  { name: 'SURAT', code: 'ST', state: 'Gujarat' },
  { name: 'TIRUPATI', code: 'TPTY', state: 'Andhra Pradesh' },
  { name: 'UDAIPUR', code: 'UDZ', state: 'Rajasthan' },
  { name: 'PUNE', code: 'PUNE', state: 'Maharashtra' },
  { name: 'NAGPUR', code: 'NGP', state: 'Maharashtra' },
  { name: 'BHOPAL', code: 'BPL', state: 'Madhya Pradesh' },
  { name: 'KOLKATA', code: 'KOAA', state: 'West Bengal' },
  { name: 'ASANSOL', code: 'ASN', state: 'West Bengal' },
  { name: 'LUDHIANA', code: 'LDH', state: 'Punjab' },
  { name: 'AJMER', code: 'AII', state: 'Rajasthan' },
  { name: 'RAIPUR', code: 'R', state: 'Chhattisgarh' },
  { name: 'ROHTAK', code: 'ROK', state: 'Haryana' },
  { name: 'KOTA', code: 'KOTA', state: 'Rajasthan' },
  { name: 'ALIGARH', code: 'ALJN', state: 'Uttar Pradesh' },
  { name: 'HYDERABAD', code: 'HYB', state: 'Telangana' },
  { name: 'DEHRADUN', code: 'DDN', state: 'Uttarakhand' },
  { name: 'NANDED', code: 'NED', state: 'Maharashtra' },
  { name: 'DHANBAD', code: 'DHN', state: 'Jharkhand' },
  { name: 'DURGAPUR', code: 'DGR', state: 'West Bengal' },
  { name: 'RAILWAY', code: 'RLY', state: 'Network' },
  { name: 'YELAHANKA', code: 'YNK', state: 'Karnataka' },
  { name: 'ALLAHABAD', code: 'PRYJ', state: 'Uttar Pradesh' },
  { name: 'BILASPUR', code: 'BSP', state: 'Chhattisgarh' }
];

export interface TriviaQuestion {
  id: string;
  category: 'Engineering' | 'Heritage' | 'Routes' | 'Culture';
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  funFact?: string;
}

export const MULTIPLAYER_TRIVIA: TriviaQuestion[] = [
  {
    id: 'trv-1',
    category: 'Engineering',
    question: 'At 359 metres above the riverbed, which Indian rail bridge is higher than the Eiffel Tower?',
    options: ['Chenab Arch Bridge', 'Bogibeel Bridge', 'Pamban Sea Bridge', 'Vidyasagar Setu'],
    correctIndex: 0,
    explanation: 'The Chenab Bridge in Reasi district, Jammu & Kashmir, is the world’s highest railway arch bridge.',
    funFact: 'It is engineered to withstand blast loads and earthquake tremors up to Zone V.'
  },
  {
    id: 'trv-2',
    category: 'Heritage',
    question: 'What was the nickname of India’s very first passenger steam locomotive in 1853?',
    options: ['Fairy Queen', 'Sahib, Sindh & Sultan', 'Black Beauty', 'Cheetah'],
    correctIndex: 1,
    explanation: 'Three steam locomotives named Sahib, Sindh, and Sultan pulled the 14-coach train from Bori Bunder to Thane.',
    funFact: '400 invited passengers rode that historic inaugural 34-kilometre journey.'
  },
  {
    id: 'trv-3',
    category: 'Routes',
    question: 'Which train covers India’s longest scheduled route: 4,189 km from Dibrugarh to Kanyakumari?',
    options: ['Himsagar Express', 'Vivek Express', 'Navyug Express', 'Coromandel Express'],
    correctIndex: 1,
    explanation: 'The Vivek Express (Train 22503/22504) spans 8 Indian states over approximately 75 hours.',
    funFact: 'It was flagged off to mark the 150th birth anniversary of Swami Vivekananda.'
  },
  {
    id: 'trv-4',
    category: 'Engineering',
    question: 'What is the indigenously developed anti-collision train safety system adopted by Indian Railways?',
    options: ['KAVACH', 'RAKSHAK', 'GARUDA', 'SURAKSHA'],
    correctIndex: 0,
    explanation: 'KAVACH is an indigenous Automatic Train Protection (ATP) system certified to Safety Integrity Level 4 (SIL-4).',
    funFact: 'It automatically activates train brakes if the loco pilot fails to adhere to signal aspect warnings.'
  },
  {
    id: 'trv-5',
    category: 'Culture',
    question: 'Which Indian Railway station has the longest operational railway platform in the world (1,507 metres)?',
    options: ['Gorakhpur Junction', 'Shree Siddharoodha Swamiji Hubballi', 'Kollam Junction', 'Kharagpur'],
    correctIndex: 1,
    explanation: 'Hubballi Junction (SSS Hubballi) in Karnataka holds the Guinness World Record for the longest railway platform at 1,507 m.',
    funFact: 'It officially surpassed Gorakhpur’s 1,366-metre platform in 2023.'
  },
  {
    id: 'trv-6',
    category: 'Heritage',
    question: 'The UNESCO Mountain Railways of India comprises Darjeeling, Nilgiri, and which northern mountain railway?',
    options: ['Kangra Valley', 'Kalka-Shimla Railway', 'Matheran Light Railway', 'Kashmir Valley'],
    correctIndex: 1,
    explanation: 'The Kalka-Shimla Railway features 103 tunnels and over 800 bridges traversing the scenic Shivalik range.',
    funFact: 'Tunnel No. 33 (Barog Tunnel) is the longest on the route at 1,143 metres.'
  }
];

export interface IcebreakerCard {
  id: string;
  category: 'Travel Tales' | 'Creative Sparks' | 'Tech & Future' | 'Life Perspective';
  prompt: string;
  followUp: string;
}

export const CURIOSITY_CARDS: IcebreakerCard[] = [
  {
    id: 'c1',
    category: 'Travel Tales',
    prompt: 'What was the most unexpected conversation or friendship you ever made during a long transit journey?',
    followUp: 'Did you stay in touch, or was it a memorable fleeting connection?'
  },
  {
    id: 'c2',
    category: 'Creative Sparks',
    prompt: 'If you had unlimited resources and 3 months of uninterrupted time, what software or hardware project would you build?',
    followUp: 'Who would be the first person or community to test it?'
  },
  {
    id: 'c3',
    category: 'Tech & Future',
    prompt: 'What emerging technology or open-source tool are you most excited to learn or master this year?',
    followUp: 'What has been the hardest part about getting started with it?'
  },
  {
    id: 'c4',
    category: 'Life Perspective',
    prompt: 'What is one book, podcast, or essay that genuinely reshaped how you think about people or work?',
    followUp: 'What was the key insight that stuck with you?'
  },
  {
    id: 'c5',
    category: 'Travel Tales',
    prompt: 'Which railway station platform or stop serves your absolute favourite tea, snack, or meal in India?',
    followUp: 'What makes that specific stop so nostalgic?'
  }
];
