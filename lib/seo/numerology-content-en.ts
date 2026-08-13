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
    number: "1", title: "Life Path 1 — The Leader", archetype: "The Leader",
    essence: "Independence, initiative, and the instinct to create a path where none existed before.",
    traits: ["Independent", "Initiating", "Determined", "Confident", "Pioneering"],
    strengths: "Life Path 1 is comfortable starting, deciding, and accepting responsibility. Originality and self-direction make this number effective when a situation needs courage, momentum, or a clear first move.",
    challenges: "Independence can become isolation, impatience, or an assumption that asking for help is weakness. The deeper lesson is to lead without controlling and to recognize other people's pace and contribution.",
    love: "A 1 needs respect, attraction, and enough autonomy to remain fully itself. Relationships become stronger when competition gives way to mutual encouragement and vulnerability is treated as trust rather than dependence.",
    career: "Entrepreneurship, leadership, product creation, management, sport, and other self-directed fields can suit a 1. Ownership of decisions matters, but finishing and collaborating determine whether an idea becomes durable.",
    advice: "Your gift is beginning. Choose a direction worth completing, invite capable people into the process, and let consistency turn bold intention into a real body of work.",
  },
  "2": {
    number: "2", title: "Life Path 2 — The Diplomat", archetype: "The Diplomat",
    essence: "Cooperation, emotional intelligence, and the ability to notice what relationships need before conflict makes it obvious.",
    traits: ["Empathetic", "Diplomatic", "Patient", "Sensitive", "Cooperative"],
    strengths: "Life Path 2 understands nuance, timing, and the unspoken emotional layer of a group. Mediation, listening, partnership, and careful attention help this number create trust where force would fail.",
    challenges: "Sensitivity can lead to people-pleasing, indecision, or resentment when needs remain unspoken. Clear boundaries and direct requests allow kindness to remain a strength instead of becoming self-erasure.",
    love: "A 2 values emotional safety, thoughtful rituals, and a partner who takes feelings seriously. Stable intimacy grows when harmony includes honest disagreement rather than avoiding every difficult conversation.",
    career: "Counseling, human resources, healthcare, design, diplomacy, and partnership-based work can fit a 2. The role may be quiet, but the ability to coordinate people often determines the outcome.",
    advice: "Your gentleness carries influence when it has a clear boundary. Say what you know and need; other people cannot value insight that you continually keep invisible.",
  },
  "3": {
    number: "3", title: "Life Path 3 — The Creator", archetype: "The Creator",
    essence: "Expression, imagination, humor, and a natural ability to change the atmosphere through words or art.",
    traits: ["Expressive", "Creative", "Optimistic", "Social", "Playful"],
    strengths: "Life Path 3 generates ideas, tells memorable stories, and helps people see possibility. Communication and creativity become powerful tools for connection when this number gives them a consistent form.",
    challenges: "Energy may scatter across too many interests, leaving promising work unfinished. Avoiding difficult feelings through humor or distraction can also keep expression lively but emotionally shallow.",
    love: "A 3 brings laughter, spontaneity, and verbal affection to relationships. The best bond makes room for play while providing enough steadiness for honesty, follow-through, and deeper emotional presence.",
    career: "Media, marketing, writing, performance, teaching, sales, and creative work can suit a 3. Talent grows most when deadlines and craft support inspiration rather than waiting for the perfect mood.",
    advice: "Discipline is not the enemy of creativity; it is how creativity becomes visible. Select one meaningful project and carry it beyond excitement into completion.",
  },
  "4": {
    number: "4", title: "Life Path 4 — The Builder", archetype: "The Builder",
    essence: "Structure, reliability, and the patient work required to create something that can endure.",
    traits: ["Reliable", "Practical", "Disciplined", "Methodical", "Patient"],
    strengths: "Life Path 4 turns disorder into systems and plans into dependable results. This number values accuracy, responsibility, and foundations strong enough to support long-term growth.",
    challenges: "Commitment to order can harden into rigidity, overwork, or fear of change. A plan should provide direction without becoming more important than new information, wellbeing, or human needs.",
    love: "A 4 usually expresses love through loyalty, practical help, and consistency. Affection becomes easier to feel when dependable action is paired with spoken appreciation and occasional flexibility.",
    career: "Engineering, finance, operations, architecture, logistics, law, and skilled technical work can fit a 4. Complex long-term projects reward its patience and standards.",
    advice: "You already know how to work. Learn to rest, revise, and improvise without treating flexibility as failure; a resilient structure can move without collapsing.",
  },
  "5": {
    number: "5", title: "Life Path 5 — The Explorer", archetype: "The Explorer",
    essence: "Freedom, experience, change, and the curiosity to learn through direct contact with life.",
    traits: ["Curious", "Adaptable", "Energetic", "Independent", "Versatile"],
    strengths: "Life Path 5 adapts quickly to new people, places, tools, and possibilities. It brings courage to transition and can translate broad experience into persuasive communication and practical improvisation.",
    challenges: "Fear of boredom can produce impulsive choices or abandonment of something valuable just as depth becomes possible. Freedom gains meaning through conscious commitments, not endless escape.",
    love: "A 5 needs movement, honesty, and a partner who does not confuse closeness with control. Trust grows when independence is balanced by consistency and clear agreements.",
    career: "Travel, journalism, sales, technology, events, media, entrepreneurship, and project-based work can suit a 5. Variety is motivating, while a simple structure protects focus.",
    advice: "If every door must remain open, none becomes a real path. Choose a few people and purposes worthy of loyalty, and let freedom include the power to stay.",
  },
  "6": {
    number: "6", title: "Life Path 6 — The Nurturer", archetype: "The Nurturer",
    essence: "Care, responsibility, harmony, and the desire to make people and places feel supported.",
    traits: ["Caring", "Responsible", "Protective", "Harmonizing", "Aesthetic"],
    strengths: "Life Path 6 creates belonging through attention, reliability, and an instinct for what could be made healthier or more beautiful. People often trust this number with both practical and emotional responsibility.",
    challenges: "Care can become control, perfectionism, or self-sacrifice when a 6 assumes responsibility for everyone's choices. Receiving help and allowing imperfection are essential parts of balanced service.",
    love: "A 6 is devoted and home-oriented, often expressing affection through care and shared responsibility. The healthiest bond does not make one partner the permanent rescuer or parent.",
    career: "Education, healthcare, counseling, design, hospitality, community leadership, and people management can suit a 6. Work feels meaningful when quality of life improves for others.",
    advice: "Offer care without making yourself indispensable. Boundaries protect generosity, and your needs deserve the same seriousness you give to everyone else's wellbeing.",
  },
  "7": {
    number: "7", title: "Life Path 7 — The Seeker", archetype: "The Seeker",
    essence: "Analysis, inner depth, and the need to understand what lies beneath appearances.",
    traits: ["Analytical", "Private", "Intuitive", "Reflective", "Independent-minded"],
    strengths: "Life Path 7 combines careful observation with a strong inner compass. Research, contemplation, and pattern recognition help this number develop expertise rather than settling for convenient explanations.",
    challenges: "Privacy can become isolation, skepticism, or endless analysis that postpones participation. Not every truth arrives through thought alone; trust and lived experience also carry information.",
    love: "A 7 needs intellectual depth, emotional honesty, and enough solitude to remain centered. Opening slowly is natural, but a partner cannot respond to needs that stay permanently hidden.",
    career: "Research, science, technology, psychology, writing, strategy, philosophy, and specialist roles can fit a 7. Independence and time for deep work are important.",
    advice: "Your inner world is a laboratory, not a permanent hiding place. Share what you discover and allow real relationships to test, deepen, and humanize your conclusions.",
  },
  "8": {
    number: "8", title: "Life Path 8 — The Strategist", archetype: "The Strategist",
    essence: "Power, scale, resource management, and the ability to translate ambition into material results.",
    traits: ["Ambitious", "Organized", "Influential", "Practical", "Resilient"],
    strengths: "Life Path 8 understands systems, leverage, accountability, and the decisions behind large outcomes. It can manage pressure and recover from setbacks with unusual determination.",
    challenges: "Achievement can become the only measure of worth, encouraging control, work obsession, or emotional distance. Ethical influence is more sustainable than domination and includes responsibility for consequences.",
    love: "An 8 respects strength and often seeks an equal with goals of their own. Providing stability is meaningful, but intimacy also needs time, tenderness, and a willingness to be known beyond performance.",
    career: "Business, finance, law, real estate, executive leadership, investment, and large-scale operations can suit an 8. Stewardship matters as much as winning.",
    advice: "Think about legacy, not only profit. Build power that improves the system around you and relationships that remain valuable when status and achievement are temporarily absent.",
  },
  "9": {
    number: "9", title: "Life Path 9 — The Humanitarian", archetype: "The Humanitarian",
    essence: "Compassion, perspective, completion, and a desire to contribute to something larger than personal comfort.",
    traits: ["Generous", "Idealistic", "Wise", "Empathetic", "Inspiring"],
    strengths: "Life Path 9 sees shared humanity across differences and can turn experience into empathy, art, teaching, or service. Its broad perspective helps others connect individual struggles with a larger meaning.",
    challenges: "Idealism may become disappointment, martyrdom, or difficulty releasing people and projects whose cycle is complete. Compassion works best with limits and realistic expectations.",
    love: "A 9 loves deeply and generously, sometimes beyond its own capacity. A supportive relationship honors its ideals while keeping daily needs, reciprocity, and practical boundaries visible.",
    career: "Education, medicine, psychology, art, nonprofit work, advocacy, and international or community service can fit a 9. Purpose strongly affects motivation.",
    advice: "You do not have to rescue everyone to make a meaningful contribution. Give compassion a boundary, a method, and enough self-care to remain useful over time.",
  },
  "11": {
    number: "11", title: "Life Path 11 — The Inspired Intuitive", archetype: "The Inspired Intuitive",
    essence: "Heightened perception, imagination, and the challenge of giving practical form to inspiration.",
    traits: ["Intuitive", "Sensitive", "Visionary", "Inspiring", "Charismatic"],
    strengths: "Master Number 11 is often described as an intensified 2: relational sensitivity combined with unusual imaginative or symbolic awareness. Its words and creative work can help people recognize something they already feel but cannot yet name.",
    challenges: "High sensitivity can become nervous tension, self-doubt, or overstimulation. Grounding routines, sleep, physical care, and realistic structure are necessities rather than limits on inspiration.",
    love: "An 11 seeks emotional and spiritual depth and may find superficial connection exhausting. A calm, honest partner can support intensity without idealizing or dismissing it.",
    career: "Psychology, art, writing, teaching, design, spiritual care, and visionary leadership can suit an 11. Inspiration becomes valuable when translated into a repeatable practice.",
    advice: "Treat intuition as a signal to explore, not unquestionable proof. Write, test, teach, and build so that insight gains clarity and does not remain undirected anxiety.",
  },
  "22": {
    number: "22", title: "Life Path 22 — The Master Builder", archetype: "The Master Builder",
    essence: "Large-scale vision joined with the discipline to turn an ambitious idea into a durable system.",
    traits: ["Visionary", "Practical", "Disciplined", "Resilient", "System-minded"],
    strengths: "Master Number 22 is often described as an intensified 4: the builder's patience combined with an unusually broad horizon. It can coordinate people, resources, and structure around work designed to last.",
    challenges: "The weight of potential may produce perfectionism, procrastination, or retreat into small safe tasks. Scale still begins with ordinary steps, tested assumptions, and willingness to learn publicly.",
    love: "A 22 is dependable and serious about shared foundations, but major goals can consume the attention a relationship also needs. Partnership deserves daily construction, not only future provision.",
    career: "Infrastructure, organizational leadership, platforms, architecture, social enterprise, policy, and complex long-term projects can fit a 22. Real impact requires both vision and governance.",
    advice: "Do not wait for a flawless blueprint. Build a sound foundation, test one section, and expand responsibly; disciplined iteration is how a large vision becomes trustworthy.",
  },
  "33": {
    number: "33", title: "Life Path 33 — The Master Teacher", archetype: "The Master Teacher",
    essence: "Compassion, teaching, and the responsibility to support growth without losing yourself in service.",
    traits: ["Compassionate", "Devoted", "Wise", "Healing", "Encouraging"],
    strengths: "Master Number 33 is often described as an intensified 6: the nurturer's responsibility combined with a broad teaching or healing impulse. It can make people feel seen and translate hard experience into humane guidance.",
    challenges: "The desire to help can become martyrdom, impossible standards, or responsibility for people who must choose their own path. Sustainable care includes limits, rest, and the ability to receive.",
    love: "A 33 offers profound care and commitment, but one-way nurturing eventually becomes depletion. The right partnership supports the teacher too and makes room for ordinary imperfection.",
    career: "Teaching, healthcare, therapy, social work, community leadership, ministry, and mission-driven creative work can suit a 33. Human development is often the central result.",
    advice: "Your contribution is a marathon. Protect the body, relationships, and resources that make service possible, and remember that saying no can preserve the quality of a deeper yes.",
  },
};

export const NUMEROLOGY_FAQ_EN = [
  { q: "What is a life path number?", a: "A life path number is a numerology value calculated from a birth date. Numerology interprets it as a broad life theme or archetype; it is a reflective tradition, not a scientific personality measurement." },
  { q: "How do I calculate my life path number?", a: "Reduce the day, month, and year of your birth date by adding their digits, then reduce the total to 1–9 unless it is 11, 22, or 33. The calculator on this page handles the steps automatically." },
  { q: "What are Master Numbers 11, 22, and 33?", a: "Numerology keeps 11, 22, and 33 unreduced and treats them as intensified versions of 2, 4, and 6. They are traditionally associated with inspiration, large-scale building, and compassionate teaching." },
  { q: "Is numerology scientifically proven?", a: "No. Numerology is a symbolic and spiritual tradition rather than an evidence-based method for measuring personality or predicting events. Use it as a prompt for reflection, not a diagnosis or certainty." },
];
