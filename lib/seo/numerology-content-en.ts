import type { LifePathNumber } from "@/lib/numerology";

export type LifePathContentEn = {
  number: LifePathNumber;
  title: string;
  archetype: string;
  essence: string;
  traits: string[];
  strengths: string;
  challenges: string;
  love: string;
  career: string;
  advice: string;
};

export const LIFE_PATH_CONTENT_EN: Record<LifePathNumber, LifePathContentEn> = {
  "1": {
    number: "1",
    title: "Life Path Number 1, The Leader",
    archetype: "The Leader",
    essence:
      "Independence, initiative, and a natural instinct to lead, 1 starts where others are still hesitating.",
    traits: ["Independent", "Initiative-driven", "Determined", "Self-confident", "Pioneer"],
    strengths:
      "You naturally take responsibility and never need another person's permission to begin. Creating something new, blazing a fresh trail, and leading a team forward is your natural element.",
    challenges:
      "Be mindful of ego and impatience, when you try to do everything alone, you lose the collective strength of a team. Learn the art of delegation and respect the natural pace of others.",
    love:
      "In a relationship, 1 needs a partner who respects their independence and maintains their own rich inner world. Competition inside a couple drains you; genuine partnership and mutual backing empower you. Best compatibility: 3, 5, and 9.",
    career:
      "You thrive best where the decisions are in your hands: entrepreneurship, executive management, product creation, sports, or politics. A purely subordinate role cannot hold you for long.",
    advice:
      "Your greatest power lies in starting, but truly great achievements demand finishing. Choose one defining direction and see it through to the end; the result will make your name memorable.",
  },
  "2": {
    number: "2",
    title: "Life Path Number 2, The Diplomat",
    archetype: "The Diplomat",
    essence:
      "Harmony, empathy, and the delicate art of connection, 2 senses what others only notice after a conflict has erupted.",
    traits: ["Empathetic", "Diplomatic", "Patient", "Perceptive", "Collaborative"],
    strengths:
      "You understand people beyond their spoken words. Mediation, partnership, and thoughtful attention to nuance are your natural gifts; people feel an immediate calming reassurance in your presence.",
    challenges:
      "Holding personal boundaries can be challenging, you often say 'yes' when you truly mean 'no'. Excessive sensitivity turns into accumulated resentment; practice open and direct communication.",
    love:
      "Love for you is safe emotional closeness, thoughtful rituals, attentive listening, and remembering the small things that matter. You need a partner who never invalidates your emotions. Best compatibility: 4, 6, and 8.",
    career:
      "Human resources, psychology, design, healthcare, advisory roles, and co-founded ventures, anywhere relationship dynamics determine the outcome. A skilled second-in-command often shapes more than the figurehead.",
    advice:
      "Your softness is a profound strength, not a weakness, provided it is paired with firm boundaries. Speak your mind aloud: the world cannot value what it cannot hear.",
  },
  "3": {
    number: "3",
    title: "Life Path Number 3, The Creator",
    archetype: "The Creator",
    essence:
      "Self-expression, joy, and the magnetic gift of communication, when 3 enters the room, the entire atmosphere shifts.",
    traits: ["Communicative", "Creative", "Optimistic", "Artistic", "Playful"],
    strengths:
      "Generating original ideas, storytelling, and inspiring people, your enthusiasm is delightfully contagious. You shine brilliantly wherever creative expression and originality are valued.",
    challenges:
      "Your energy easily scatters across too many different directions, starting many things, finishing few. Counter the temptation of superficiality with depth: take one core talent to genuine mastery.",
    love:
      "Being in a relationship with you is an adventure, full of laughter, spontaneity, and vibrant colors. You need a partner who joins in the fun while gently keeping you grounded. Best compatibility: 1, 5, and 7.",
    career:
      "Media, marketing, performing arts, writing, education, and creative sales, any stage, large or small. Monotonous, isolated desk work extinguishes your inner light.",
    advice:
      "Discipline is the best friend of your natural talent. Choose one core project and bring it to completion, one finished creation speaks ten times louder than ten brilliant ideas.",
  },
  "4": {
    number: "4",
    title: "Life Path Number 4, The Builder",
    archetype: "The Builder",
    essence:
      "Order, diligence, and the power of a solid foundation, 4 builds what will still be standing decades from now.",
    traits: ["Reliable", "Practical", "Disciplined", "Methodical", "Patient"],
    strengths:
      "You can be completely relied upon, an exceptionally rare and valuable quality. Building systems, executing plans step by step, and bringing structure to chaos is your natural realm.",
    challenges:
      "Rigidity and fear of unexpected change, do not make the plan an idol. Sometimes the best move is mindful improvisation; flexibility does not weaken your foundation, it reinforces it.",
    love:
      "You prove your love through tangible actions, stability, attentive care, and unshakable loyalty. You need a partner who understands this language and occasionally invites you out of your comfort zone. Best compatibility: 2, 6, and 8.",
    career:
      "Engineering, finance, architecture, logistics, project governance, and law, domains where precision and systematic execution are decisive. Long-term, complex projects are your element.",
    advice:
      "You already know how to work hard, learn how to rest just as intentionally. Life is a living process, not merely an end result; make time for what cannot be scheduled on a spreadsheet.",
  },
  "5": {
    number: "5",
    title: "Life Path Number 5, The Freedom Seeker",
    archetype: "The Freedom Seeker",
    essence:
      "Change, lived experience, and an unquenchable thirst for movement, for 5, standing still feels like moving backward.",
    traits: ["Curious", "Adaptable", "Energetic", "Free-spirited", "Versatile"],
    strengths:
      "You find your footing faster than anyone in a new environment, new language, new city, new career. The unpredictable shifts that terrify others make you feel truly alive.",
    challenges:
      "Fear of boredom can make you abandon truly valuable things prematurely, relationships, meaningful projects, or places. Freedom is not the opposite of commitment; deep roots do not prevent flight.",
    love:
      "A relationship with you is a voyage, often unplanned, but richly rewarding. You need a companion who neither clips your wings nor loses their own identity in the process. Best compatibility: 1, 3, and 7.",
    career:
      "Journalism, dynamic sales, travel, technology, consulting, and fast-paced entrepreneurship, rigid routine is your greatest adversary. Project-based and flexible work suits you perfectly.",
    advice:
      "If you leave every single door open, you never truly step inside any room. Choose a few non-negotiable commitments to stay loyal to, true freedom is the power of deliberate choice.",
  },
  "6": {
    number: "6",
    title: "Life Path Number 6, The Nurturer",
    archetype: "The Nurturer",
    essence:
      "Love, responsibility, and an innate sense of harmony and beauty, people naturally gather and settle around 6.",
    traits: ["Loving", "Responsible", "Harmonious", "Aesthetic", "Protective"],
    strengths:
      "Family, team, community, you unite, heal, and bring peace. An eye for beauty combined with a genuine gift for nurturing is rare: people simply want to be in your presence and your space.",
    challenges:
      "Placing everyone else's needs above your own leads straight to emotional exhaustion. Do not let perfectionism toward loved ones turn into subtle control; perfection is never a prerequisite for love.",
    love:
      "Relationships are the beating heart of your life, faithful, deeply warm, and home-building. Beware of only one trap: falling into martyrdom. Best compatibility: 2, 4, and 9.",
    career:
      "Medicine, counseling, teaching, interior design, hospitality, wellness, and culinary arts, where care and aesthetic sensibility combine. You make an exceptional leader whose team feels like family.",
    advice:
      "Care for yourself with the same devotion you shower upon others. Giving from an overflowing cup sustains far more life than straining from an empty one.",
  },
  "7": {
    number: "7",
    title: "Life Path Number 7, The Seeker",
    archetype: "The Seeker",
    essence:
      "Depth, analytical brilliance, and a rich inner world, 7 reads what lies beneath the visible surface.",
    traits: ["Analytical", "Intuitive", "Independent", "Reflective", "Spiritual"],
    strengths:
      "You perceive hidden patterns and laws that others completely overlook. Research, scholarship, and the pursuit of fundamental truth, your mind is a finely tuned instrument.",
    challenges:
      "Solitude is necessary, but isolation is a trap. Analyzing everything can turn even emotions into spreadsheets; remember that sometimes the answer lives in the heart rather than the data.",
    love:
      "Your trust is earned slowly and holds immense value. You need a partner who does not fear silence and genuinely appreciates intellectual and emotional depth. Best compatibility: 3, 5, and 7.",
    career:
      "Scientific research, data analytics, software architecture, philosophy, and specialized investigation, fields where depth triumphs over speed. Noisy, political workplaces quickly drain your energy.",
    advice:
      "Knowledge multiplies only when shared. Step out of your mental library and into the world, your discoveries need an audience to create real impact.",
  },
  "8": {
    number: "8",
    title: "Life Path Number 8, The Strategist",
    archetype: "The Strategist",
    essence:
      "Power, scale, and fluency in the language of the material world, 8 thinks big and calculates with precision.",
    traits: ["Ambitious", "Organized", "Authoritative", "Pragmatic", "Resilient"],
    strengths:
      "Resource management, structural foresight, and relentless focus on results, you operate at a scale that makes others dizzy. Rising stronger after a fall is your personal signature.",
    challenges:
      "Never use material metrics as the sole yardstick for human relationships. An obsession with control and a cult of work can alienate those closest to you; the highest form of power is inspiring influence, not commanding authority.",
    love:
      "You look for an equal in a partner, strong-willed, capable, with distinct goals of their own. Remember that love requires dedicated time and presence, not merely material provision. Best compatibility: 2, 4, and 6.",
    career:
      "Business leadership, finance, corporate law, real estate development, and executive management, capital and scale are your natural playing field. Building your own enterprise is almost inevitable.",
    advice:
      "Think about lasting legacy rather than short-term gain alone. What you construct will outlive you, make sure it is something you can look upon with profound pride.",
  },
  "9": {
    number: "9",
    title: "Life Path Number 9, The Humanitarian",
    archetype: "The Humanitarian",
    essence:
      "Compassion, wisdom, and a panoramic view of humanity, 9 lives for a purpose far larger than personal comfort.",
    traits: ["Generous", "Idealistic", "Wise", "Empathetic", "Inspirational"],
    strengths:
      "You intuitively understand people across differences in culture, age, and background. Giving, teaching, and elevating others is the natural direction of your energy.",
    challenges:
      "Do not let high ideals turn into chronic disillusionment, the world transforms slowly, and that too is part of life. Master the art of closing chapters: 9 is the final number of the cycle, and letting go is your core lesson.",
    love:
      "You love deeply and unstintingly, sometimes at the expense of your own needs. You need a partner who shares your ideals while keeping you tethered to practical reality. Best compatibility: 1, 6, and 9.",
    career:
      "Higher education, healthcare, the arts, non-profit initiatives, international advocacy, and psychology, when your work carries moral meaning, your output doubles.",
    advice:
      "Healing the world begins with honoring yourself. Give your compassion clear boundaries and focused direction, only then does it become a mighty force rather than an exhausting burden.",
  },
  "11": {
    number: "11",
    title: "Life Path Number 11, The Master Intuitive",
    archetype: "The Master Intuitive",
    essence:
      "Heightened perception and a direct channel for inspiration, 11 feels what has not yet been spoken aloud.",
    traits: ["Intuitive", "Sensitive", "Inspiring", "Visionary", "Charismatic"],
    strengths:
      "Master Number 11 is an amplified 2: the quiet diplomacy of two elevated by near-prophetic perception. People recognize themselves in your words, a rare and subtle form of leadership.",
    challenges:
      "High emotional sensitivity can easily accumulate into nervous tension, grounding routines, quality sleep, and quiet time are non-negotiable necessities. Do not doubt your inner vision: it is real.",
    love:
      "You crave genuine depth in intimacy, superficial connections drain you rapidly. You need a calm, steady partner who can hold space for your emotional intensity. Best compatibility: 2, 4, and 6.",
    career:
      "Psychology, creative writing, artistic direction, spiritual exploration, counseling, and visionary leadership, anywhere intuition functions as a professional instrument.",
    advice:
      "Your antenna is always receiving, you must consciously decide what you channel. Inspiration demands physical form: write it, teach it, build it, otherwise ungrounded energy turns into anxiety.",
  },
  "22": {
    number: "22",
    title: "Life Path Number 22, The Master Builder",
    archetype: "The Master Builder",
    essence:
      "Vision coupled with monumental execution, 22 has the capacity to turn lofty dreams into concrete structures and lasting systems.",
    traits: ["Visionary", "Practical", "Resilient", "Strategic", "Disciplined"],
    strengths:
      "Master Number 22 is an amplified 4: the unshakable bedrock of four elevated by global vision. You are equipped to construct what will endure for generations, institutions, platforms, and transformative organizations.",
    challenges:
      "The sheer weight of your potential can sometimes feel paralyzing, showing up as procrastination or getting buried in trivial details. Every colossal vision starts with one small, concrete step; take it.",
    love:
      "You are a loyal and rock-solid partner, though work frequently demands first priority. Remind yourself: a relationship is also a grand construction that requires laying emotional bricks every day. Best compatibility: 4, 6, and 8.",
    career:
      "Building in the broadest sense, large-scale enterprises, digital platforms, infrastructure, social architecture, and international institutions. Your natural horizon is global.",
    advice:
      "Never settle for mere 'good' when you are capable of 'extraordinary', but do not wait for ideal conditions either. Build phase by phase: foundation, walls, roof.",
  },
  "33": {
    number: "33",
    title: "Life Path Number 33, The Master Teacher",
    archetype: "The Master Teacher",
    essence:
      "Selfless love and the gift of deep healing, 33 lives to nurture, elevate, and guide others toward higher consciousness.",
    traits: ["Compassionate", "Devoted", "Wise", "Healer", "Uplifting"],
    strengths:
      "Master Number 33 is an amplified 6: the nurturing heart of six fused with the calling of a profound teacher. Your mere presence brings comfort, people leave conversations with you feeling renewed and elevated.",
    challenges:
      "You cannot rescue everyone, nor is that your duty. The temptation of self-sacrifice is the central test of 33; master the ability to say 'no' and allow yourself to receive as graciously as you give.",
    love:
      "You give everything in love, which can sometimes be overwhelming. You need a reciprocal bond where you are also held, listened to, and cared for; one-sided devotion slowly burns you out. Best compatibility: 6, 9, and 2.",
    career:
      "Transformative teaching, medicine, trauma therapy, social reform, spiritual leadership, and creative advocacy, fields where human growth is the core outcome, not an afterthought.",
    advice:
      "Your mission is a marathon, not a sprint. Guard your own emotional reserves as conscientiously as you tend to the wounds of others, a master teacher must maintain a healthy, thriving heart.",
  },
};

export const NUMEROLOGY_FAQ_EN = [
  {
    q: "What is a Life Path Number?",
    a: "The Life Path Number is the core indicator in numerology, calculated from your full date of birth, it describes your fundamental archetype, innate talents, life challenges, and primary growth lessons.",
  },
  {
    q: "How do I calculate my Life Path Number?",
    a: "Every digit of your birth date is summed and reduced down to a single digit, with the exception of Master Numbers 11, 22, and 33 which are preserved. For instance: November 24, 1995 → Day: 2+4=6; Month: 1+1=2; Year: 1+9+9+5=24→2+4=6; Total: 6+2+6=14→1+4=5. Use our free calculator on this page for an exact calculation.",
  },
  {
    q: "What do Master Numbers 11, 22, and 33 mean?",
    a: "Master Numbers represent amplified vibrations: 11 is the Master Intuitive and visionary; 22 is the Master Builder of enduring systems; 33 is the Master Teacher of selfless compassion. They bring heightened creative potential alongside deeper personal responsibility.",
  },
  {
    q: "How do numerology and astrology connect?",
    a: "Both systems interpret human character and timing from birth data, numerology through the vibrational geometry of numbers in your date, astrology through planetary positions across the sky. Together they provide a rich, multi-dimensional view: explore both on Vivida.",
  },
];
