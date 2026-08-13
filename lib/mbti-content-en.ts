export type MbtiEnglishTypeProfile = {
  archetype: string;
  tagline: string;
  summary: string[];
  strengths: string[];
  challenges: string[];
  relationships: string;
  career: string;
  growth: string;
};

export const MBTI_CONTENT_EN: Record<string, MbtiEnglishTypeProfile> = {
  ISTJ: {
    archetype: "Logistician",
    tagline: "Dependable, practical and quietly committed to doing things well.",
    summary: [
      "ISTJs tend to approach life through evidence, responsibility and steady follow-through. They notice concrete details, respect commitments and usually prefer a clear standard over vague improvisation.",
      "Their calm exterior often hides a strong personal code. Once they decide that a person, task or institution matters, they are likely to support it with patience and consistency rather than dramatic promises.",
    ],
    strengths: ["Reliable follow-through", "Careful attention to detail", "Practical judgment", "Respect for responsibility"],
    challenges: ["Can become rigid around proven methods", "May understate emotions", "Can carry too much alone", "May judge last-minute change too quickly"],
    relationships: "In close relationships, ISTJs often express care through dependability, practical help and loyalty. Clear expectations and honest, low-drama communication help them feel secure.",
    career: "They usually thrive where accuracy, ownership and a visible standard of quality matter. Operations, administration, finance, law, engineering and other structured fields can suit their methodical style.",
    growth: "Growth often means allowing experimentation before every risk is resolved, voicing appreciation more openly and remembering that a different process is not necessarily an irresponsible one.",
  },
  ISFJ: {
    archetype: "Defender",
    tagline: "Attentive, loyal and grounded in practical care for others.",
    summary: [
      "ISFJs tend to combine a detailed memory with a strong awareness of what makes people feel supported. They often notice needs before they are spoken and prefer to help in concrete, useful ways.",
      "Although usually modest, they can be remarkably persistent when protecting a person, tradition or responsibility they value. Their stability is less about resisting life and more about creating a safe base within it.",
    ],
    strengths: ["Practical empathy", "Loyalty and patience", "Strong observational memory", "Consistent support"],
    challenges: ["May neglect personal needs", "Can avoid necessary conflict", "May take criticism personally", "Can become attached to familiar routines"],
    relationships: "ISFJs often build intimacy through reliability, warmth and remembered details. They need reciprocal care and benefit from partners who invite direct conversation instead of assuming everything is fine.",
    career: "Service, healthcare, education, administration and community-focused work often fit their blend of precision and human concern. A respectful, cooperative environment matters as much as the role itself.",
    growth: "Their growth path includes setting limits without guilt, asking directly for what they need and treating change as something they can shape rather than merely endure.",
  },
  INFJ: {
    archetype: "Advocate",
    tagline: "Insightful, values-driven and focused on meaningful change.",
    summary: [
      "INFJs tend to search for the pattern beneath events: what people mean, where a situation is heading and how separate experiences connect. Their imagination is usually guided by a strong ethical center.",
      "They can be both private and deeply people-oriented. Rather than seeking constant social contact, they often prefer a few purposeful relationships and work that gives their insight a constructive direction.",
    ],
    strengths: ["Deep pattern recognition", "Empathetic insight", "Long-range vision", "Commitment to values"],
    challenges: ["Can idealize people or outcomes", "May absorb others’ emotions", "Can hide needs until exhausted", "May overthink imperfect decisions"],
    relationships: "INFJs usually seek emotional honesty, shared values and room for depth. They give thoughtful attention, but need boundaries so empathy does not turn into responsibility for another person’s inner life.",
    career: "Counseling, writing, research, strategy, education and mission-led work can appeal to them. They perform best when they understand the purpose behind a task and have enough autonomy to improve the system.",
    growth: "Growth means testing intuition against present evidence, accepting good-enough progress and letting trusted people see uncertainty before it becomes private overwhelm.",
  },
  INTJ: {
    archetype: "Architect",
    tagline: "Independent, strategic and drawn to elegant long-term solutions.",
    summary: [
      "INTJs tend to view problems as systems that can be understood and improved. They naturally connect present choices with long-range consequences and often prefer competence to convention.",
      "Their independence is not necessarily detachment; it reflects a need to think without noise and commit only after the underlying logic makes sense. Once committed, they can pursue a difficult goal with unusual focus.",
    ],
    strengths: ["Strategic foresight", "Independent thinking", "Systems analysis", "High standards for competence"],
    challenges: ["May sound more critical than intended", "Can dismiss emotional data", "May overdesign before acting", "Can struggle to delegate"],
    relationships: "INTJs often value intellectual honesty, loyalty and mutual independence. They may show love through problem-solving and planning, while benefiting from naming emotions instead of expecting them to be inferred.",
    career: "Complex, autonomous work in technology, science, design, analysis, policy or entrepreneurship often suits them. They need room to question inefficient assumptions and build toward a coherent result.",
    growth: "Growth involves treating relationships as living systems rather than solvable projects, sharing unfinished thinking and recognizing when collaboration improves an idea instead of diluting it.",
  },
  ISTP: {
    archetype: "Virtuoso",
    tagline: "Observant, adaptable and skilled at solving what is directly in front of them.",
    summary: [
      "ISTPs tend to understand the world by interacting with it. They notice how tools, systems and situations actually behave, then make efficient adjustments without unnecessary ceremony.",
      "They often remain calm when conditions change because they trust direct observation more than rigid forecasts. Freedom, competence and the ability to respond in real time are central to their motivation.",
    ],
    strengths: ["Practical problem-solving", "Composure under pressure", "Mechanical or technical insight", "Flexible action"],
    challenges: ["May disengage from long discussions", "Can postpone future planning", "May appear emotionally distant", "Can seek stimulation through avoidable risk"],
    relationships: "ISTPs usually appreciate straightforward affection, shared experiences and enough personal space. Their relationships deepen when they explain what they feel instead of relying only on actions to communicate it.",
    career: "Hands-on technical work, engineering, emergency response, crafts, analytics and independent problem-solving can suit them. They prefer real autonomy and visible results over status-heavy environments.",
    growth: "Growth means staying present for emotional conversations, building a few durable routines and considering second-order consequences before acting on an attractive immediate option.",
  },
  ISFP: {
    archetype: "Adventurer",
    tagline: "Sensitive, flexible and guided by an authentic personal aesthetic.",
    summary: [
      "ISFPs tend to meet life through direct experience, personal values and a finely tuned sense of atmosphere. They often notice beauty, discomfort and emotional nuance that others pass over.",
      "Their flexibility can look spontaneous, but it is usually anchored in a private conviction about what feels humane and real. They prefer freedom to express that conviction through action rather than abstract debate.",
    ],
    strengths: ["Aesthetic sensitivity", "Gentle adaptability", "Authentic values", "Awareness of the present moment"],
    challenges: ["May avoid difficult planning", "Can internalize criticism", "May hide disagreement", "Can underestimate long-term needs"],
    relationships: "ISFPs often bring warmth, acceptance and sensory attentiveness to relationships. They need kindness and freedom, while learning that calm disagreement can protect closeness rather than threaten it.",
    career: "Creative practice, design, healthcare, nature, hospitality and hands-on service can fit their humane and practical style. They work best with autonomy, visible impact and minimal bureaucracy.",
    growth: "Growth includes turning values into explicit choices, creating structure that supports creativity and speaking early when something important feels wrong.",
  },
  INFP: {
    archetype: "Mediator",
    tagline: "Imaginative, compassionate and loyal to deeply held values.",
    summary: [
      "INFPs tend to experience life through meaning, possibility and an inner sense of integrity. They are often drawn to stories, people and causes that reveal what could be more truthful or humane.",
      "Their quietness should not be confused with a lack of conviction. When a core value is involved, they can become persistent advocates; at other times, they prefer to leave room for complexity rather than force a simple answer.",
    ],
    strengths: ["Rich imagination", "Compassionate listening", "Moral independence", "Ability to see human potential"],
    challenges: ["Can idealize instead of test", "May delay practical decisions", "Can take conflict deeply to heart", "May struggle with repetitive structure"],
    relationships: "INFPs seek acceptance, emotional sincerity and a sense of shared meaning. They benefit from expressing expectations clearly so that an imagined ideal does not silently compete with the real person beside them.",
    career: "Writing, counseling, art, education, research and purpose-led organizations can give their values a useful form. Autonomy and meaningful contribution often matter more than conventional prestige.",
    growth: "Growth means translating inspiration into small deadlines, tolerating ordinary imperfection and checking interpretations through direct conversation rather than private rumination.",
  },
  INTP: {
    archetype: "Logician",
    tagline: "Curious, analytical and energized by the architecture of ideas.",
    summary: [
      "INTPs tend to investigate assumptions until they understand the principle beneath them. They enjoy models, contradictions and open questions, often moving beyond accepted explanations in search of a cleaner one.",
      "Their independence comes from intellectual honesty: they want room to revise a belief when better evidence appears. Routine can feel heavy unless it protects the freedom to explore something genuinely difficult.",
    ],
    strengths: ["Conceptual analysis", "Intellectual flexibility", "Original problem framing", "Comfort with complexity"],
    challenges: ["May remain in analysis too long", "Can overlook emotional context", "May abandon routine execution", "Can communicate with excessive abstraction"],
    relationships: "INTPs value curiosity, authenticity and low-pressure connection. They often show care by sharing ideas or solving problems, and grow closer when they also acknowledge emotional impact directly.",
    career: "Research, software, science, systems design, data and specialized consulting can suit their need for complexity and autonomy. They need goals that reward insight, not merely visible busyness.",
    growth: "Growth involves choosing a workable answer before every question is closed, building repeatable execution habits and treating feelings as information even when they are not logically tidy.",
  },
  ESTP: {
    archetype: "Entrepreneur",
    tagline: "Energetic, pragmatic and quick to act on real-world opportunity.",
    summary: [
      "ESTPs tend to read the immediate environment quickly: who is engaged, what is changing and where an opening exists. They learn through action and often become resourceful when pressure makes others hesitate.",
      "Their directness is usually aimed at momentum rather than conflict. They prefer a flexible challenge with visible feedback to a distant plan that cannot yet be tested.",
    ],
    strengths: ["Fast situational awareness", "Persuasive energy", "Practical courage", "Resourcefulness under pressure"],
    challenges: ["May discount long-term risk", "Can become impatient with theory", "May speak before considering impact", "Can resist repetitive commitments"],
    relationships: "ESTPs often bring playfulness, honesty and shared adventure to relationships. Stability grows when they remain present for slower emotional conversations and follow through after the exciting moment passes.",
    career: "Sales, entrepreneurship, negotiation, emergency work, performance and operational leadership can fit their action-oriented style. They need challenge, movement and a real connection between choice and outcome.",
    growth: "Growth means pausing long enough to see second-order effects, creating a few non-negotiable commitments and listening for what is not being said in the room.",
  },
  ESFP: {
    archetype: "Entertainer",
    tagline: "Warm, expressive and alive to people and the present moment.",
    summary: [
      "ESFPs tend to create energy through participation. They notice the mood of a room, respond openly and often make shared experience feel more vivid and inclusive.",
      "Behind the spontaneity is usually a practical sensitivity to what people need right now. They prefer sincere contact and tangible enjoyment to distant abstraction or heavily controlled plans.",
    ],
    strengths: ["Social warmth", "Present-moment awareness", "Practical generosity", "Expressive adaptability"],
    challenges: ["May avoid unpleasant future planning", "Can be sensitive to rejection", "May overcommit socially", "Can lose interest in abstract routines"],
    relationships: "ESFPs often show affection through attention, encouragement and shared activity. They need appreciation, but also benefit from relationships where difficult topics can be discussed without withdrawing warmth.",
    career: "Hospitality, education, healthcare, events, performance, sales and people-facing creative work can suit them. Immediate human feedback and variety keep their strengths engaged.",
    growth: "Growth includes protecting future priorities, separating temporary discomfort from true incompatibility and building quiet reflection into an active life.",
  },
  ENFP: {
    archetype: "Campaigner",
    tagline: "Enthusiastic, imaginative and alert to possibility in people and ideas.",
    summary: [
      "ENFPs tend to connect concepts, people and future possibilities with contagious energy. They are often motivated by discovery and by helping something overlooked become visible.",
      "Their enthusiasm is most sustainable when it serves an authentic value. Without that meaning, even an impressive plan can feel empty; with it, they can inspire movement far beyond their formal authority.",
    ],
    strengths: ["Creative connection-making", "Encouraging communication", "Adaptability", "Ability to mobilize enthusiasm"],
    challenges: ["Can scatter energy across too many options", "May resist routine completion", "Can overinterpret social signals", "May idealize a new direction"],
    relationships: "ENFPs seek openness, growth and emotional aliveness. They thrive with partners who welcome exploration while also helping create steadiness after the first wave of excitement.",
    career: "Creative strategy, communication, education, entrepreneurship, counseling and community work can suit them. They need variety, purpose and room to connect people with ideas.",
    growth: "Growth means choosing which possibilities deserve a no, developing a reliable finishing rhythm and letting consistency become a form of freedom rather than confinement.",
  },
  ENTP: {
    archetype: "Debater",
    tagline: "Inventive, questioning and energized by ideas that challenge convention.",
    summary: [
      "ENTPs tend to test the edges of an idea: what has been assumed, what could be reversed and which alternative nobody has tried. Debate is often a tool for discovery rather than a fixed declaration of belief.",
      "They are usually comfortable with ambiguity and rapid change, especially when these create room for invention. Their challenge is less generating options than selecting and developing the best one.",
    ],
    strengths: ["Inventive problem-solving", "Verbal agility", "Strategic reframing", "Comfort with uncertainty"],
    challenges: ["May debate beyond usefulness", "Can neglect execution details", "May underestimate emotional consequences", "Can abandon projects after novelty fades"],
    relationships: "ENTPs value intellectual play, independence and directness. Their relationships deepen when curiosity extends to feelings and when a clever argument does not take priority over repair.",
    career: "Entrepreneurship, product strategy, law, technology, consulting and creative problem-solving can fit them. They need complex questions, autonomy and collaborators who can challenge them back.",
    growth: "Growth includes committing after exploration, respecting maintenance work and noticing when being technically right is less important than understanding the person in front of them.",
  },
  ESTJ: {
    archetype: "Executive",
    tagline: "Direct, organized and focused on turning standards into results.",
    summary: [
      "ESTJs tend to create clarity through decisions, roles and measurable expectations. They trust practical evidence and often step forward when a group needs structure or accountability.",
      "Their firmness usually comes from a belief that shared standards protect collective effort. At their best, they pair that structure with fairness and an honest willingness to revise a process that no longer works.",
    ],
    strengths: ["Decisive organization", "Operational reliability", "Clear communication", "Commitment to standards"],
    challenges: ["May move too quickly past dissent", "Can overvalue established procedure", "May sound controlling under stress", "Can overlook unspoken needs"],
    relationships: "ESTJs often express love through responsibility, protection and practical planning. Warmth grows when they invite feedback before deciding and make room for feelings that cannot be fixed immediately.",
    career: "Management, operations, public service, finance, logistics and institutional leadership can suit their ability to coordinate people and resources around a concrete goal.",
    growth: "Growth means distinguishing authority from certainty, listening before organizing and allowing flexibility where it improves ownership rather than weakening standards.",
  },
  ESFJ: {
    archetype: "Consul",
    tagline: "Sociable, considerate and committed to the wellbeing of a community.",
    summary: [
      "ESFJs tend to build connection through practical care, shared rituals and attention to how people are doing. They often remember the details that make belonging feel real.",
      "They value cooperation and clear social expectations, not merely for appearance but because harmony helps groups function. Their generosity is strongest when it includes their own needs as well as everyone else’s.",
    ],
    strengths: ["Community-building", "Practical attentiveness", "Loyal cooperation", "Clear social communication"],
    challenges: ["May depend too much on approval", "Can avoid disruptive truth", "May overextend through caretaking", "Can judge unfamiliar choices quickly"],
    relationships: "ESFJs bring warmth, reliability and active support to close relationships. They need appreciation and reciprocity, and benefit from saying what they want instead of hoping care will automatically be mirrored.",
    career: "Education, healthcare, hospitality, coordination, customer success and community leadership often fit their people-centered organization and visible sense of responsibility.",
    growth: "Growth includes tolerating respectful disagreement, separating worth from usefulness and making room for unconventional paths that still honor people.",
  },
  ENFJ: {
    archetype: "Protagonist",
    tagline: "Empathetic, persuasive and motivated by collective growth.",
    summary: [
      "ENFJs tend to notice the emotional and motivational currents within a group. They often translate a shared value into language that helps people feel seen and ready to move.",
      "Their confidence with people can conceal how much responsibility they assume for the atmosphere around them. Their leadership is most sustainable when guidance remains an invitation rather than an obligation to rescue.",
    ],
    strengths: ["Empathic leadership", "Persuasive communication", "Ability to develop others", "Strong sense of shared purpose"],
    challenges: ["May overidentify with others’ needs", "Can avoid disappointing people", "May personalize group tension", "Can push growth before someone is ready"],
    relationships: "ENFJs seek commitment, honesty and mutual development. They give generously, while needing relationships where they can be uncertain or tired without becoming the caretaker again.",
    career: "Teaching, coaching, communications, organizational development, advocacy and mission-led leadership can suit their ability to align people around meaning.",
    growth: "Growth means respecting another person’s pace, setting boundaries before resentment appears and allowing self-worth to exist apart from positive impact.",
  },
  ENTJ: {
    archetype: "Commander",
    tagline: "Decisive, ambitious and skilled at organizing toward a long-range goal.",
    summary: [
      "ENTJs tend to see objectives, obstacles and available resources as parts of one strategic field. They naturally organize action, challenge inefficiency and make difficult decisions when momentum is at risk.",
      "Their intensity is often rooted in confidence that improvement is possible. At their best, they combine demanding standards with the humility to recognize expertise and build other capable leaders.",
    ],
    strengths: ["Strategic leadership", "Decisive prioritization", "Confidence under challenge", "Ability to scale systems"],
    challenges: ["May become impatient with slower processing", "Can undervalue emotional context", "May equate control with progress", "Can make rest feel unproductive"],
    relationships: "ENTJs value honesty, competence and shared ambition. Intimacy grows when they make room for vulnerability and listen without immediately turning another person’s experience into an action plan.",
    career: "Executive leadership, entrepreneurship, law, finance, technology and large-scale operations can suit their appetite for complexity, responsibility and measurable progress.",
    growth: "Growth includes building consent rather than simple compliance, recognizing relational maintenance as real work and allowing uncertainty to be shared before a decision is final.",
  },
};

export function mbtiEnglishContent(type: string): MbtiEnglishTypeProfile {
  return MBTI_CONTENT_EN[type.slice(0, 4).toUpperCase()] ?? MBTI_CONTENT_EN.ISTJ;
}
