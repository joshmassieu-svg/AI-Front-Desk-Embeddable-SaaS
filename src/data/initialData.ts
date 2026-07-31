import { 
  ClientWebsite, 
  LeadItem, 
  AppointmentItem, 
  Conversation, 
  AnalyticsSummary 
} from '../types';

export const INITIAL_CLIENTS: ClientWebsite[] = [
  {
    id: 'cl_apex_dental',
    name: 'Apex Dental Practice',
    industry: 'healthcare_dental',
    websiteUrl: 'https://apexdentalpractice.com',
    logoText: 'Apex Dental',
    primaryColor: '#0d9488', // Teal
    secondaryColor: '#0f766e',
    widgetPosition: 'bottom-right',
    widgetTitle: 'Patient Concierge',
    personaName: 'Claire',
    personaRole: 'Patient Intake & Appointment Specialist',
    welcomeMessage: 'Hello and welcome to Apex Dental Practice! I am Claire, your virtual intake assistant. How can I assist with your dental care or appointment today?',
    quickQuestions: [
      'Book a cleaning appointment',
      'Do you accept Delta Dental insurance?',
      'What are your office hours?',
      'Emergency dental care options'
    ],
    systemPrompt: `You are Claire, the professional, kind, and empathetic AI front desk receptionist for Apex Dental Practice in Austin, TX.
Your goal is to assist patients by answering dental practice FAQs, helping them choose a service, and booking appointments or collecting patient lead details.
Always remain polite, concise, and reassuring. Never give medical advice; recommend a consultation for clinical questions.`,
    knowledgeBase: `# Apex Dental Practice - Patient Reference Guide
- **Location**: 4500 Guadalupe St, Suite 210, Austin, TX 78751
- **Office Hours**: Monday–Friday 8:00 AM – 6:00 PM, Saturday 9:00 AM – 2:00 PM
- **Insurance Accepted**: Delta Dental, Cigna, Aetna, MetLife, Guardian, UnitedHealthcare, and self-pay discount plans.
- **New Patient Offer**: $99 exam, digital X-rays, and standard cleaning for uninsured patients.
- **Emergency Care**: We reserve same-day emergency slots for severe toothache, chipped/broken teeth, or lost crowns. Call immediately or book an emergency slot.
- **Sedation Options**: Nitrous oxide (laughing gas) and oral sedation available upon request.`,
    unstructuredKnowledge: `================================================================================
RAW WEBSITE CRAWL TEXT - APEX DENTAL PRACTICE (apexdentalpractice.com)
================================================================================
Welcome to Apex Dental Practice in Central Austin! Recognized as Austin's top family & cosmetic dental center for over 15 years.
Dr. Elena Rostova, DDS, and Dr. Marcus Vance, DMD, lead a compassionate team utilizing state-of-the-art low-radiation 3D cone beam imaging, laser dentistry, and gentle ultrasonic cleanings.

[PATIENT FINANCING & PAYMENT POLICIES]
We believe quality dental care should be accessible to everyone. In addition to accepting major PPO insurances (Delta Dental, Cigna, Aetna, MetLife, Guardian, UnitedHealthcare), we offer 0% APR financing through CareCredit and our in-house Apex Dental Membership Plan ($350/year includes two routine exams, cleanings, X-rays, and 15% off all restorative procedures).

[POST-OP & SPECIALTY INSTRUCTIONS]
- Crown Prep: Avoid sticky foods for 24 hours while temporary crown sets.
- Teeth Whitening: Avoid coffee, red wine, and berries for 48 hours after Zoom in-office whitening.
- Pediatric Dentistry: We welcome children ages 3 and up with pediatric-specialized hygienists and comfort menu items (ceiling TVs, noise-canceling headphones, warm blankets).`,
    faqItems: [
      {
        id: 'faq_1',
        question: 'Do you accept Delta Dental or Cigna insurance?',
        answer: 'Yes! We are an in-network PPO provider for Delta Dental, Cigna, Aetna, MetLife, and Guardian. We also file claims for most out-of-network PPO plans.',
        category: 'Insurance & Billing'
      },
      {
        id: 'faq_2',
        question: 'What should I do if I have a dental emergency?',
        answer: 'We reserve same-day emergency slots Monday through Saturday. Please let me know your symptoms and I can book you into our next urgent care opening.',
        category: 'Emergency'
      },
      {
        id: 'faq_3',
        question: 'How long does a routine cleaning take?',
        answer: 'A routine dental cleaning and comprehensive dental exam typically takes 45 to 60 minutes.',
        category: 'Services'
      }
    ],
    services: [
      {
        id: 'srv_cleaning',
        name: 'Comprehensive Exam & Cleaning',
        durationMinutes: 60,
        price: '$99 / Insured',
        description: 'Complete oral health check, plaque removal, polishing, and low-radiation digital X-rays.'
      },
      {
        id: 'srv_whitening',
        name: 'Laser Teeth Whitening Session',
        durationMinutes: 45,
        price: '$249',
        description: 'Professional in-office laser whitening treatment up to 6 shades brighter in 45 minutes.'
      },
      {
        id: 'srv_emergency',
        name: 'Same-Day Emergency Consultation',
        durationMinutes: 30,
        price: '$75',
        description: 'Urgent evaluation for toothaches, chipped teeth, or lost restorations.'
      },
      {
        id: 'srv_invisalign',
        name: 'Invisalign Clear Aligners Consult',
        durationMinutes: 45,
        price: 'Free',
        description: '3D digital scan and smile simulation for Invisalign clear orthodontic treatment.'
      }
    ],
    appointmentSettings: {
      enabled: true,
      businessHours: {
        start: '08:00',
        end: '17:30',
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
      },
      slotDurationMinutes: 30,
      requirePhone: true,
      requireReason: true,
      confirmationMessage: 'Your dental visit has been tentatively scheduled! Our scheduling team will confirm your insurance via text message.'
    },
    enableSoundEffects: true,
    enableLeadCapture: true,
    createdAt: '2026-06-12T10:00:00Z'
  },
  {
    id: 'cl_grandeur_hotel',
    name: 'The Grandeur Hotel & Spa',
    industry: 'hospitality_hotel',
    websiteUrl: 'https://grandeurmanhattan.com',
    logoText: 'Grandeur Manhattan',
    primaryColor: '#d97706', // Luxury Amber/Gold
    secondaryColor: '#b45309',
    widgetPosition: 'bottom-right',
    widgetTitle: 'Virtual Concierge',
    personaName: 'Marco',
    personaRole: 'Virtual Guest Concierge & Butler',
    welcomeMessage: 'Good day! Welcome to The Grandeur Hotel Manhattan. I am Marco, your personal concierge. May I assist with room reservations, spa appointments, or local dining?',
    quickQuestions: [
      'What are check-in and check-out times?',
      'Book a massage at the Oasis Spa',
      'Do you offer airport valet transfer?',
      'Request late check-out'
    ],
    systemPrompt: `You are Marco, the sophisticated, courteous, and knowledgeable Virtual Concierge for The Grandeur Hotel Manhattan on 5th Avenue.
Speak with warm luxury hospitality. Assist guests with hotel amenities, dining reservations, spa booking, and check-in/out policies.
When a guest wants to book a spa service or reservation, guide them through date and time selection.`,
    knowledgeBase: `# The Grandeur Hotel & Spa Manhattan
- **Address**: 720 5th Avenue, New York, NY 10019
- **Check-In**: 3:00 PM | **Check-Out**: 11:00 AM
- **Late Check-Out**: Available up to 2:00 PM for complimentary loyalty members or $50 fee for non-members.
- **Oasis Luxury Spa**: Located on Floor 4, open daily 8:00 AM – 9:00 PM. Features Swedish massage, deep tissue, hydrotherapy, and custom facials.
- **Dining - The Sapphire Room**: Rooftop Michelin-starred dining, dress code is smart casual. Dinner served 5:30 PM – 10:30 PM.
- **Valet Parking**: $65/night with unlimited in-and-out privileges.`,
    faqItems: [
      {
        id: 'faq_hotel_1',
        question: 'What time is check-in and check-out?',
        answer: 'Standard check-in is at 3:00 PM and check-out is at 11:00 AM. We offer luggage storage if you arrive early or depart late.',
        category: 'Guest Services'
      },
      {
        id: 'faq_hotel_2',
        question: 'Is valet parking available?',
        answer: 'Yes, 24-hour valet parking is available at the main 5th Avenue entrance for $65 per night with unlimited in/out access.',
        category: 'Amenities'
      }
    ],
    services: [
      {
        id: 'srv_swedish',
        name: 'Oasis Signature Swedish Massage',
        durationMinutes: 60,
        price: '$180',
        description: 'Relaxing full-body oil massage using organic botanical oils.'
      },
      {
        id: 'srv_facial',
        name: '24K Gold Cellular Rejuvenation Facial',
        durationMinutes: 45,
        price: '$210',
        description: 'High-performance collagen boosting facial with lymphatic massage.'
      },
      {
        id: 'srv_dining',
        name: 'The Sapphire Room Dinner Reservation',
        durationMinutes: 90,
        price: 'À la carte',
        description: 'Table reservation at our rooftop restaurant overlooking Central Park.'
      }
    ],
    appointmentSettings: {
      enabled: true,
      businessHours: {
        start: '09:00',
        end: '20:00',
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      slotDurationMinutes: 60,
      requirePhone: true,
      requireReason: false,
      confirmationMessage: 'Your reservation has been confirmed! Our concierge desk has placed the booking under your guest name.'
    },
    enableSoundEffects: true,
    enableLeadCapture: true,
    createdAt: '2026-06-20T14:00:00Z'
  },
  {
    id: 'cl_sterling_law',
    name: 'Sterling & Vance Family Law',
    industry: 'legal_law',
    websiteUrl: 'https://sterlingvancelaw.com',
    logoText: 'Sterling & Vance',
    primaryColor: '#1e40af', // Deep Blue
    secondaryColor: '#1d4ed8',
    widgetPosition: 'bottom-right',
    widgetTitle: 'Legal Intake Desk',
    personaName: 'Elena',
    personaRole: 'Confidential Case Evaluator',
    welcomeMessage: 'Welcome to Sterling & Vance Law. All inquiries are strictly confidential. I am Elena, your intake coordinator. Would you like to schedule a free 15-minute case consultation?',
    quickQuestions: [
      'Schedule free 15-minute consultation',
      'What areas of family law do you handle?',
      'What are your attorney fee structures?',
      'Do you offer virtual video consultations?'
    ],
    systemPrompt: `You are Elena, a confidential, empathetic, and highly professional Legal Intake Coordinator for Sterling & Vance Family Law Firm in Chicago, IL.
You help prospective clients understand the firm's practice areas (Divorce, Child Custody, Estate Planning, Prenuptial Agreements) and schedule initial consultations.
Always clarify that you are an AI intake assistant and cannot give formal legal advice.`,
    knowledgeBase: `# Sterling & Vance Family Law Firm
- **Practice Areas**: Divorce & Dissolution, Child Custody & Visitation, Asset Division, Prenuptial & Postnuptial Agreements, Estate Planning.
- **Initial Consultation**: We offer a complimentary 15-minute phone or Zoom consultation with a senior associate attorney.
- **Fee Structure**: Retainer-based billing with transparent hourly rates. Flat-fee options available for uncontested divorces and prenuptial agreements.
- **Confidentiality**: All communications through this portal are encrypted and protected under intake attorney-client privilege guidelines.`,
    faqItems: [
      {
        id: 'faq_law_1',
        question: 'How much does an initial consultation cost?',
        answer: 'Our initial 15-minute case evaluation by phone or secure video call is 100% free and confidential.',
        category: 'Consultations'
      },
      {
        id: 'faq_law_2',
        question: 'How quickly can I speak with an attorney?',
        answer: 'We typically have consultation slots available within 24 to 48 business hours.',
        category: 'Scheduling'
      }
    ],
    services: [
      {
        id: 'srv_consult',
        name: 'Free 15-Minute Attorney Consultation',
        durationMinutes: 15,
        price: 'Free',
        description: 'Confidential telephone or Zoom review of your legal matter with an associate attorney.'
      },
      {
        id: 'srv_estate',
        name: 'Estate Planning & Will Review Session',
        durationMinutes: 45,
        price: '$250',
        description: 'In-depth consultation for trusts, wills, and asset preservation strategies.'
      }
    ],
    appointmentSettings: {
      enabled: true,
      businessHours: {
        start: '08:30',
        end: '17:00',
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
      },
      slotDurationMinutes: 15,
      requirePhone: true,
      requireReason: true,
      confirmationMessage: 'Your consultation request is received. An intake specialist will email your secure video link shortly.'
    },
    enableSoundEffects: true,
    enableLeadCapture: true,
    createdAt: '2026-07-01T09:00:00Z'
  },
  {
    id: 'cl_lumina_realty',
    name: 'Lumina Real Estate & Homes',
    industry: 'real_estate',
    websiteUrl: 'https://luminaproperties.io',
    logoText: 'Lumina Realty',
    primaryColor: '#7c3aed', // Vibrant Violet
    secondaryColor: '#6d28d9',
    widgetPosition: 'bottom-left',
    widgetTitle: 'Property Assistant',
    personaName: 'Alex',
    personaRole: 'Home Tour & Listing Specialist',
    welcomeMessage: 'Hi there! Looking for your next dream home or wondering what your property is worth? I am Alex from Lumina Realty. How can I help today?',
    quickQuestions: [
      'Schedule a private home tour',
      'Get a free home valuation estimate',
      'What neighborhoods do you cover?',
      'First-time buyer mortgage guide'
    ],
    systemPrompt: `You are Alex, an energetic, knowledgeable Real Estate Assistant for Lumina Real Estate & Homes in Seattle, WA.
Help buyers explore properties, book private house tours, and connect sellers with listing agents for home valuations.`,
    knowledgeBase: `# Lumina Real Estate & Homes - Seattle Area
- **Coverage Areas**: Downtown Seattle, Bellevue, Kirkland, Redmond, Capitol Hill, and Mercer Island.
- **Home Tours**: Private in-person or live video tours available 7 days a week from 9:00 AM – 7:00 PM.
- **Home Valuation**: We provide complimentary comparative market analyses (CMA) within 12 hours.
- **Mortgage Partners**: We work closely with top local lenders for fast pre-approvals.`,
    faqItems: [
      {
        id: 'faq_re_1',
        question: 'Can I schedule a tour on weekends?',
        answer: 'Yes! Our agents conduct private tours Saturday and Sunday from 9:00 AM to 6:00 PM.',
        category: 'Tours'
      }
    ],
    services: [
      {
        id: 'srv_tour',
        name: 'Private Property VIP Tour',
        durationMinutes: 45,
        price: 'Free',
        description: 'Guided walkthrough of any active MLS listing in the Greater Seattle area.'
      },
      {
        id: 'srv_valuation',
        name: 'Home Valuation & Market Strategy Session',
        durationMinutes: 30,
        price: 'Free',
        description: 'Comprehensive analysis of your property value and neighborhood trends.'
      }
    ],
    appointmentSettings: {
      enabled: true,
      businessHours: {
        start: '09:00',
        end: '18:00',
        daysOfWeek: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
      },
      slotDurationMinutes: 45,
      requirePhone: true,
      requireReason: true,
      confirmationMessage: 'Your property tour request is confirmed! Your Lumina agent will meet you at the property address.'
    },
    enableSoundEffects: true,
    enableLeadCapture: true,
    createdAt: '2026-07-10T11:00:00Z'
  }
];

export const INITIAL_LEADS: LeadItem[] = [
  {
    id: 'ld_101',
    clientId: 'cl_apex_dental',
    visitorName: 'Sarah Jenkins',
    email: 'sarah.jenkins@example.com',
    phone: '(512) 555-0184',
    reasonOrInquiry: 'Inquire about Invisalign clear aligners pricing and payment plan options.',
    status: 'new',
    sourcePage: 'https://apexdentalpractice.com/orthodontics',
    createdAt: '2026-07-30T14:22:00Z',
    notes: 'Requested call after 3 PM'
  },
  {
    id: 'ld_102',
    clientId: 'cl_grandeur_hotel',
    visitorName: 'David & Emily Vance',
    email: 'dvance@corporate-partners.com',
    phone: '(212) 555-0149',
    reasonOrInquiry: 'Anniversary package inquiry for Penthouse suite + spa credits.',
    status: 'contacted',
    sourcePage: 'https://grandeurmanhattan.com/suites',
    createdAt: '2026-07-30T11:15:00Z',
    notes: 'Sent VIP brochure PDF'
  },
  {
    id: 'ld_103',
    clientId: 'cl_sterling_law',
    visitorName: 'Michael Chen',
    email: 'm.chen.consulting@example.org',
    phone: '(312) 555-0192',
    reasonOrInquiry: 'Need initial consultation regarding family trust modification and estate tax.',
    status: 'qualified',
    sourcePage: 'https://sterlingvancelaw.com/estate-planning',
    createdAt: '2026-07-29T16:40:00Z'
  },
  {
    id: 'ld_104',
    clientId: 'cl_lumina_realty',
    visitorName: 'Chloe Rodriguez',
    email: 'chloe.rodriguez@example.com',
    phone: '(206) 555-0163',
    reasonOrInquiry: 'Interested in 3-bedroom waterfront listing in Kirkland ($1.4M budget).',
    status: 'new',
    sourcePage: 'https://luminaproperties.io/listings/kirkland-waterfront',
    createdAt: '2026-07-30T17:05:00Z'
  }
];

export const INITIAL_APPOINTMENTS: AppointmentItem[] = [
  {
    id: 'apt_201',
    clientId: 'cl_apex_dental',
    visitorName: 'Marcus Thorne',
    visitorEmail: 'marcus.t@example.com',
    visitorPhone: '(512) 555-0111',
    serviceName: 'Comprehensive Exam & Cleaning',
    date: '2026-08-02',
    time: '10:00',
    durationMinutes: 60,
    status: 'confirmed',
    notes: 'New patient, has Delta Dental PPO insurance.',
    createdAt: '2026-07-30T15:10:00Z'
  },
  {
    id: 'apt_202',
    clientId: 'cl_grandeur_hotel',
    visitorName: 'Lady Eleanor Wright',
    visitorEmail: 'e.wright@wright-holdings.co.uk',
    visitorPhone: '+44 20 7946 0921',
    serviceName: 'Oasis Signature Swedish Massage',
    date: '2026-08-01',
    time: '14:00',
    durationMinutes: 60,
    status: 'confirmed',
    notes: 'Guest in Suite 1402.',
    createdAt: '2026-07-30T12:30:00Z'
  },
  {
    id: 'apt_203',
    clientId: 'cl_sterling_law',
    visitorName: 'Robert K. Sterling',
    visitorEmail: 'r.sterling@example.com',
    visitorPhone: '(312) 555-0188',
    serviceName: 'Free 15-Minute Attorney Consultation',
    date: '2026-08-03',
    time: '11:15',
    durationMinutes: 15,
    status: 'confirmed',
    notes: 'Prenuptial agreement review request.',
    createdAt: '2026-07-29T18:00:00Z'
  },
  {
    id: 'apt_204',
    clientId: 'cl_lumina_realty',
    visitorName: 'Liam & Sophia Patel',
    visitorEmail: 'spatel@designstudio.net',
    visitorPhone: '(425) 555-0176',
    serviceName: 'Private Property VIP Tour',
    date: '2026-08-02',
    time: '13:00',
    durationMinutes: 45,
    status: 'confirmed',
    notes: 'Touring 8402 2nd Ave NE, Seattle.',
    createdAt: '2026-07-30T09:20:00Z'
  }
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv_1',
    clientId: 'cl_apex_dental',
    visitorId: 'vis_881',
    visitorName: 'Marcus Thorne',
    visitorEmail: 'marcus.t@example.com',
    visitorPhone: '(512) 555-0111',
    status: 'appointment_booked',
    summary: 'Inquired about cleaning & Delta Dental insurance; booked appointment for Aug 2 @ 10:00 AM.',
    lastActive: '2026-07-30T15:12:00Z',
    tags: ['New Patient', 'Insured', 'Booked'],
    messages: [
      {
        id: 'm1',
        sender: 'assistant',
        text: 'Hello and welcome to Apex Dental Practice! I am Claire, your virtual intake assistant. How can I assist with your dental care or appointment today?',
        timestamp: '2026-07-30T15:08:00Z'
      },
      {
        id: 'm2',
        sender: 'user',
        text: 'Hi Claire, do you accept Delta Dental? And how much is a cleaning?',
        timestamp: '2026-07-30T15:08:45Z'
      },
      {
        id: 'm3',
        sender: 'assistant',
        text: 'Yes! We are an in-network PPO provider for Delta Dental. For insured patients, routine cleanings and exams are typically 100% covered by preventative benefits ($99 for uninsured). Would you like to check available times for a Comprehensive Exam & Cleaning?',
        timestamp: '2026-07-30T15:09:10Z'
      },
      {
        id: 'm4',
        sender: 'user',
        text: 'That sounds great, lets schedule for this Sunday or Monday.',
        timestamp: '2026-07-30T15:09:40Z'
      },
      {
        id: 'm5',
        sender: 'assistant',
        text: 'I can get you in this coming Monday, August 2nd at 10:00 AM! Here is your reservation summary:',
        timestamp: '2026-07-30T15:10:00Z',
        structuredData: {
          type: 'booking_confirmation',
          payload: {
            serviceName: 'Comprehensive Exam & Cleaning',
            date: '2026-08-02',
            time: '10:00 AM',
            visitorName: 'Marcus Thorne',
            status: 'Confirmed'
          }
        }
      }
    ]
  },
  {
    id: 'conv_2',
    clientId: 'cl_grandeur_hotel',
    visitorId: 'vis_902',
    visitorName: 'Lady Eleanor Wright',
    visitorEmail: 'e.wright@wright-holdings.co.uk',
    status: 'appointment_booked',
    summary: 'Guest in Suite 1402 requested spa Swedish massage booking for Aug 1 at 2:00 PM.',
    lastActive: '2026-07-30T12:35:00Z',
    tags: ['VIP Guest', 'Spa Booking'],
    messages: [
      {
        id: 'm201',
        sender: 'assistant',
        text: 'Good day! Welcome to The Grandeur Hotel Manhattan. I am Marco, your personal concierge. May I assist with room reservations, spa appointments, or local dining?',
        timestamp: '2026-07-30T12:28:00Z'
      },
      {
        id: 'm202',
        sender: 'user',
        text: 'Hello Marco. I am staying in Suite 1402 and would like to book a 60-minute Swedish massage tomorrow afternoon.',
        timestamp: '2026-07-30T12:29:10Z'
      },
      {
        id: 'm203',
        sender: 'assistant',
        text: 'A wonderful choice, Lady Eleanor! The Oasis Signature Swedish Massage is $180 for 60 minutes. I have an opening tomorrow at 2:00 PM on the 4th floor spa. Shall I reserve that for you?',
        timestamp: '2026-07-30T12:29:45Z',
        structuredData: {
          type: 'booking_confirmation',
          payload: {
            serviceName: 'Oasis Signature Swedish Massage',
            date: '2026-08-01',
            time: '2:00 PM',
            visitorName: 'Lady Eleanor Wright',
            status: 'Confirmed'
          }
        }
      }
    ]
  }
];

export const INITIAL_ANALYTICS: AnalyticsSummary = {
  totalEmbedLoads: 14820,
  totalConversations: 842,
  totalLeadsCaptured: 194,
  totalAppointmentsBooked: 118,
  conversionRatePercent: 37.1,
  avgResponseTimeSeconds: 1.4,
  topQuestions: [
    { question: 'Do you accept Delta Dental / PPO insurance?', count: 142, category: 'Billing' },
    { question: 'What are your hours of operation?', count: 115, category: 'General' },
    { question: 'How much does an initial consultation cost?', count: 98, category: 'Pricing' },
    { question: 'Can I reschedule or cancel my appointment online?', count: 74, category: 'Scheduling' },
    { question: 'Is parking / valet available?', count: 61, category: 'Amenities' }
  ],
  clientStats: [
    { clientId: 'cl_apex_dental', clientName: 'Apex Dental Practice', conversations: 310, leads: 76, appointments: 52 },
    { clientId: 'cl_grandeur_hotel', clientName: 'The Grandeur Hotel & Spa', conversations: 240, leads: 54, appointments: 38 },
    { clientId: 'cl_sterling_law', clientName: 'Sterling & Vance Family Law', conversations: 180, leads: 42, appointments: 18 },
    { clientId: 'cl_lumina_realty', clientName: 'Lumina Real Estate & Homes', conversations: 112, leads: 22, appointments: 10 }
  ]
};
