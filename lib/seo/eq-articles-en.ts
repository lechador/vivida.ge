import type { EqDomainKey } from "@/lib/eq/questions";

export type EqArticleEn = {
  slug: string;
  title: string;
  description: string;
  category: string;
  readingMinutes: number;
  domains: EqDomainKey[];
  intro: string;
  sections: { heading: string; paragraphs: string[] }[];
  steps: string[];
  faq: { q: string; a: string }[];
};

const article = (data: Omit<EqArticleEn, "readingMinutes"> & { readingMinutes?: number }): EqArticleEn => ({ readingMinutes: 7, ...data });
const educational = "This material is educational. An EQ self-assessment is not a diagnosis, and emotional skills should be evaluated through behavior and context rather than one score.";

export const EQ_ARTICLES_EN: EqArticleEn[] = [
  article({
    slug: "ra-aris-emociuri-inteleqti", title: "What Is Emotional Intelligence (EQ)? A Practical Guide", description: "Understand the core emotional-intelligence skills, what an EQ self-assessment can and cannot show, and how emotional habits can improve with practice.", category: "EQ foundations", domains: ["self-awareness", "self-regulation", "motivation", "empathy", "social-skills"],
    intro: "Emotional intelligence is a group of skills used to notice, understand, express, and regulate emotion in ourselves and in relationships. It affects decisions, communication, motivation, and responses to stress.",
    sections: [
      { heading: "EQ is a set of skills, not one fixed trait", paragraphs: ["EQ is often reduced to empathy, but a broader model includes self-awareness, impulse regulation, sustained motivation, perspective-taking, and social skills. A person can be strong in one domain and still need practice in another.", "A self-report test describes how you currently see your habits. It does not measure every emotional ability objectively and should not become a permanent label."] },
      { heading: "Can emotional intelligence improve?", paragraphs: ["Reviews of emotional-competency training suggest that targeted practice can help, although results depend on program quality, repetition, feedback, and the skill being trained. The most useful plan selects one observable behavior and reviews progress after several weeks.", educational] },
    ],
    steps: ["Name at least one emotion each day", "Pause briefly before a difficult reply", "Check whether you understood the other person", "Review one successful and one difficult episode each week", "Choose one behavior to practice for fourteen days"],
    faq: [{ q: "Is EQ the same as IQ?", a: "No. They describe different constructs and neither replaces the other." }, { q: "Does a low score mean I lack emotional ability?", a: "No. A self-assessment reflects current perceptions and habits and is best used to choose a growth area." }],
  }),
  article({
    slug: "rogor-avimaghlo-empathia", title: "How to Build Empathy: 9 Practical Exercises", description: "Practice empathy through active listening, perspective-taking, careful questions, nonverbal context, feedback, and healthy boundaries.", category: "Empathy", domains: ["empathy", "social-skills"],
    intro: "Empathy is the effort to understand another person's experience accurately without losing your own perspective. It begins with curiosity and improves through listening, observation, correction, and boundaries.",
    sections: [
      { heading: "Listen before preparing your answer", paragraphs: ["During conversation, attention often shifts toward what to say next. Try listening for one uninterrupted minute, then summarize: ‘If I understood you correctly…’ This gives the speaker a chance to correct your interpretation.", "Understanding does not require agreement. You can validate that an emotion makes sense in context while still holding a different conclusion or boundary."] },
      { heading: "Treat impressions as hypotheses", paragraphs: ["Tone, pace, pauses, and a change in behavior can provide context, but none proves what another person feels. Replace certainty with a check: ‘You seem more tense than usual—am I reading that correctly?’", "Empathy becomes more accurate when the other person remains the authority on their own experience."] },
    ],
    steps: ["Summarize one conversation each day", "Ask one open question before giving advice", "Read a story from an unfamiliar perspective", "Notice changes in tone and pace", "Ask someone when they feel most understood by you"],
    faq: [{ q: "Is empathy the same as compassion?", a: "They overlap, but empathy focuses on understanding experience, while compassion often includes concern and a wish to help." }, { q: "Can empathy become exhausting?", a: "Yes. Boundaries, recovery time, and distinguishing understanding from responsibility make empathy more sustainable." }],
  }),
  article({
    slug: "aqtiuri-mosmena", title: "Active Listening: A Simple Technique That Changes Conversations", description: "Learn an active-listening formula and avoid common habits that weaken communication with partners, friends, and colleagues.", category: "Communication", domains: ["empathy", "social-skills"],
    intro: "Active listening means showing attention, clarifying meaning, and checking what you heard. Its first goal is accurate understanding, not immediate advice or a perfect response.",
    sections: [
      { heading: "Use a three-part response", paragraphs: ["First summarize the observable situation. Second name a possible feeling tentatively. Third ask an open question. For example: ‘Your idea was skipped in the meeting and you seem disappointed. What part was hardest?’", "Use natural language and welcome correction. A formula supports attention but should never sound like a scripted diagnosis."] },
      { heading: "Notice what blocks listening", paragraphs: ["Premature advice, redirecting the conversation to your own story, interrupting, and saying ‘there is nothing to worry about’ can weaken connection. A useful question is: ‘Would you like listening, comfort, or ideas right now?’", "When you disagree, show that you understand the position before explaining your own. Understanding and agreement are different acts."] },
    ],
    steps: ["Put the phone away", "Do not interrupt the first minute", "Summarize in one sentence", "Clarify instead of assuming", "Offer advice only after checking what is wanted"],
    faq: [{ q: "Does active listening mean staying silent?", a: "No. It includes concise summaries, clarifying questions, and visible attention." }, { q: "What if I disagree?", a: "Demonstrate accurate understanding first, then state your different view respectfully." }],
  }),
  article({
    slug: "tvitshgmecnebis-ganvitareba", title: "Developing Self-Awareness: How to Recognize Emotions", description: "Learn to identify emotion, physical signals, triggers, automatic thoughts, and the difference between facts and interpretations.", category: "Self-awareness", domains: ["self-awareness"],
    intro: "Emotional self-awareness is the ability to notice what you feel, the thoughts and body signals around it, and how that state influences your choices before reaction becomes automatic.",
    sections: [
      { heading: "The body often signals emotion first", paragraphs: ["A tight jaw, shallow breathing, warmth, or heaviness can appear before you have words for an emotion. Noticing these signals creates a small interval in which a response can be chosen.", "Specific labels provide more information than ‘I feel bad.’ Disappointed, ashamed, worried, irritated, and lonely may need very different forms of care or action."] },
      { heading: "Separate fact, thought, and feeling", paragraphs: ["‘I have not received a reply’ is an observable fact. ‘They do not care about me’ is an interpretation. ‘I feel anxious’ is an emotional state. Separating them reduces the power of an automatic story without dismissing the feeling.", "The goal is not to eliminate emotion; it is to understand its information and select behavior consciously."] },
    ],
    steps: ["Pause three times a day", "Name the emotion precisely", "Rate intensity from 0 to 10", "Locate the body signal", "Record the trigger, interpretation, and chosen response"],
    faq: [{ q: "Why does naming emotion help?", a: "It makes the experience more specific and helps distinguish what kind of response may be useful." }, { q: "How often should I check in?", a: "One brief daily note is enough to begin; consistency matters more than length." }],
  }),
  article({
    slug: "emociuri-dghiuri", title: "Emotional Journal: A Template and 7-Day Practice", description: "Use a five-minute emotional-journal template to identify recurring triggers, needs, automatic thoughts, and effective responses.", category: "Self-awareness", domains: ["self-awareness", "self-regulation"],
    intro: "An emotional journal does not require pages of narrative. A five-minute structured entry can reveal repeating triggers and show which responses reduce or intensify distress.",
    sections: [
      { heading: "Five fields for one episode", paragraphs: ["Record the situation, emotion, intensity, automatic thought, and action. Finish with: ‘What would I like to try next time?’ This shifts the entry from description toward learning.", "At the end of a week, look for patterns across time, people, unmet needs, sleep, hunger, workload, and the type of interpretation that appeared."] },
      { heading: "Keep observation separate from self-attack", paragraphs: ["‘I raised my voice’ is precise and actionable. ‘I am terrible’ is global criticism that hides the specific behavior. Neutral language supports responsibility because it leaves room for correction.", educational] },
    ],
    steps: ["Choose one emotional episode", "Complete the five fields", "Name the unmet need", "Write one alternative response", "Review all entries after seven days"],
    faq: [{ q: "Should I write only difficult emotions?", a: "No. Positive episodes reveal what supports safety, motivation, and connection." }, { q: "What if journaling increases distress?", a: "Shorten or stop the exercise and seek appropriate support, especially when trauma memories or severe symptoms intensify." }],
  }),
  article({
    slug: "emociis-martva", title: "How to Regulate Emotions Without Suppressing Them", description: "Use pause, labeling, reappraisal, recovery, and planned action to respond to strong emotions without denial or impulsive behavior.", category: "Self-regulation", domains: ["self-regulation", "self-awareness"],
    intro: "Emotion regulation does not mean forcing yourself to feel calm. It means making enough room between emotion and action to choose a response that fits your values and the actual situation.",
    sections: [
      { heading: "Regulation begins before the peak", paragraphs: ["Early signs such as muscle tension, faster speech, and narrowed attention are easier to influence than a reaction at maximum intensity. A brief pause, slower exhale, movement, or change of setting can reduce immediate escalation.", "Naming an emotion and its likely trigger helps distinguish a signal that requires action from a temporary state that needs recovery first."] },
      { heading: "Reappraise without invalidating yourself", paragraphs: ["Ask what else could explain the facts and what evidence is missing. Reappraisal does not mean insisting everything is fine; it means replacing the first interpretation with a more complete one.", "If safety is at risk or symptoms are severe, regulation skills are not a substitute for professional or emergency support."] },
    ],
    steps: ["Notice the first body signal", "Name the emotion and intensity", "Lengthen the exhale", "Delay irreversible action", "Choose a response aligned with the real goal"],
    faq: [{ q: "Is distraction always avoidance?", a: "No. Short intentional distraction can lower intensity; it becomes avoidance when the issue is never revisited." }, { q: "Should I calm down before every conversation?", a: "Aim for enough regulation to stay safe and coherent, not emotional numbness." }],
  }),
  article({
    slug: "suntqva-da-grounding", title: "Breathing and Grounding for Stress: Practical Techniques", description: "Try gentle breathing, sensory grounding, and orientation exercises for acute stress while understanding their limits.", category: "Self-regulation", domains: ["self-regulation"],
    intro: "Breathing and grounding practices can help shift attention from a spiraling threat response toward the present environment. They are coping tools, not cures or substitutes for clinical care.",
    sections: [
      { heading: "Keep breathing gentle", paragraphs: ["A comfortable slower exhale is often easier than forcing a very deep breath, which can make some people light-headed. Try inhaling naturally and allowing the exhale to become slightly longer for several cycles.", "Stop if the practice increases panic or dizziness. Walking, looking around the room, or using touch may be a better anchor for some people."] },
      { heading: "Orient through the senses", paragraphs: ["Name five things you see, four you feel, three you hear, two you smell, and one you taste. The purpose is not to erase emotion but to reconnect attention with the current place and time.", "WHO stress-management materials include grounding among practical skills, while persistent or severe distress still deserves qualified support."] },
    ],
    steps: ["Place both feet on a stable surface", "Look around and name the location", "Use a comfortable longer exhale", "Identify sensory details", "Choose the next small safe action"],
    faq: [{ q: "Will grounding stop every panic response?", a: "No. It may reduce intensity for some people, but results vary and repeated panic deserves professional assessment." }, { q: "Can I practice when calm?", a: "Yes. Familiarity can make a technique easier to access under stress." }],
  }),
  article({
    slug: "sibradzis-martva", title: "Anger Management: From Trigger to Constructive Action", description: "Understand anger signals, de-escalate safely, identify the underlying need, and communicate without threat or harm.", category: "Self-regulation", domains: ["self-regulation", "self-awareness", "social-skills"],
    intro: "Anger can signal injustice, threat, frustration, or a violated boundary. The emotion itself is not misconduct; responsibility begins with how it is expressed and what happens next.",
    sections: [
      { heading: "Interrupt escalation early", paragraphs: ["Notice heat, clenched muscles, louder speech, and all-or-nothing thoughts. If safety allows, state that you need a timed pause and specify when the conversation will resume.", "A pause is useful only when it prevents harm and leads back to the issue. Leaving as punishment or refusing to return can deepen conflict."] },
      { heading: "Translate anger into a clear boundary", paragraphs: ["After intensity drops, identify the observable behavior, its impact, and the request. ‘When plans change without telling me, I feel disregarded. Please message me as soon as you know’ is more actionable than an insult.", "Threats, violence, or fear require safety planning and outside support, not only communication techniques."] },
    ],
    steps: ["Name the trigger", "Rate intensity", "Take a time-limited pause", "Identify the underlying need", "Return with one specific request"],
    faq: [{ q: "Is anger unhealthy?", a: "No. Anger is a normal emotion; harmful behavior and chronic uncontrolled intensity are the concerns." }, { q: "When should I seek help?", a: "Seek qualified support when anger leads to fear, threats, violence, damaged relationships, or loss of control." }],
  }),
  article({
    slug: "shinagani-motivacia", title: "Intrinsic Motivation: How to Build Sustainable Drive", description: "Strengthen motivation through autonomy, competence, meaning, realistic challenge, and feedback instead of waiting to feel inspired.", category: "Motivation", domains: ["motivation", "self-awareness"],
    intro: "Intrinsic motivation grows when an activity feels chosen, meaningful, and connected with developing competence. It does not require constant enthusiasm; structure can carry action when mood is low.",
    sections: [
      { heading: "Connect the task with a chosen value", paragraphs: ["‘I should’ often hides someone else's standard. Ask what the task protects, enables, or teaches and whether that reason matters to you. A personal reason does not make every task enjoyable, but it gives effort a direction.", "Autonomy can be small: choosing the order, method, partner, location, or standard of completion."] },
      { heading: "Make progress visible", paragraphs: ["Tasks feel more motivating when challenge is neither trivial nor overwhelming. Reduce scope, define a clear finish line, and use feedback to see competence growing.", "Motivation often follows action. Waiting for perfect readiness can make the first step increasingly expensive."] },
    ],
    steps: ["Name the value behind the goal", "Choose one part you can control", "Set a twenty-minute work block", "Define what done means today", "Record progress rather than mood"],
    faq: [{ q: "Do rewards destroy motivation?", a: "Not automatically. Effects depend on context, control, and whether the reward replaces or supports meaningful engagement." }, { q: "What if the goal is not mine?", a: "Clarify the real obligation, negotiate where possible, and decide consciously what standard is sufficient." }],
  }),
  article({
    slug: "prokrastinaciis-dadzleva", title: "Overcoming Procrastination: Reduce the Emotional Barrier", description: "Understand avoidance, make a task concrete, use a five-minute start, reduce friction, and build a reliable next-action habit.", category: "Motivation", domains: ["motivation", "self-regulation"],
    intro: "Procrastination is often an attempt to avoid an emotion—uncertainty, boredom, fear of failure, or resentment—rather than a simple failure of time management.",
    sections: [
      { heading: "Name what starting would make you feel", paragraphs: ["A vague task such as ‘work on the report’ can carry uncertainty and self-evaluation. Define a visible first action: open the document and write three headings. Smaller does not mean unimportant; it makes the entry point real.", "Self-criticism can increase avoidance by making the task emotionally more threatening. Use precise language about behavior and begin again without a character judgment."] },
      { heading: "Use a five-minute start", paragraphs: ["Set a timer for five minutes, remove one distraction, and stop or continue when time ends. The purpose is to lower the cost of beginning, not trick yourself into an endless session.", "If even five minutes feels impossible, the task may be unclear, oversized, unsupported, or competing with a genuine health need."] },
    ],
    steps: ["Name the avoided emotion", "Reduce the task to a five-minute start", "Set a timer", "Close one distraction", "Write the next action before stopping"],
    faq: [{ q: "Are five minutes enough?", a: "They are enough to practice starting; completion can be planned separately." }, { q: "What if I still cannot begin?", a: "Shrink the action again and check whether the task needs clarification, support, rest, or professional help." }],
  }),
  article({
    slug: "konfliqtis-martva", title: "Conflict Management: From Disagreement to a Workable Agreement", description: "De-escalate conflict, identify interests beneath positions, communicate boundaries, and create specific agreements.", category: "Social skills", domains: ["social-skills", "empathy", "self-regulation"],
    intro: "Healthy conflict is not about defeating the other person. Its goal is to understand the problem accurately, protect safety and dignity, and find a workable next step.",
    sections: [
      { heading: "Look for the interest behind the position", paragraphs: ["‘Stay home on Saturday’ is a position; rest, connection, or financial concern may be the interest beneath it. Interests create more possible solutions than competing demands.", "Ask each person to describe one specific issue without insults, mind-reading, or words such as always and never."] },
      { heading: "Make agreements observable", paragraphs: ["‘We will be more attentive’ is vague. ‘We will put phones away for twenty minutes at dinner’ can be reviewed. If escalation rises, take a timed break and honor the promise to return.", "End the conversation when there are threats, abuse, or safety risks and seek appropriate support."] },
    ],
    steps: ["Name one issue", "Listen without interruption", "Summarize the other view", "Identify both underlying needs", "Agree on one small measurable action"],
    faq: [{ q: "Is conflict a sign of a bad relationship?", a: "No. The form, safety, frequency, and repair process matter more than the mere existence of disagreement." }, { q: "When should I stop the conversation?", a: "Stop when there are threats, abuse, coercion, or safety concerns and prioritize support and protection." }],
  }),
  article({
    slug: "asertiuli-komunikacia", title: "Assertive Communication and Personal Boundaries", description: "Say no, express a need, and protect a boundary directly without aggression, disappearance, or excessive justification.", category: "Social skills", domains: ["social-skills", "self-awareness"],
    intro: "Assertiveness means expressing needs, rights, and limits clearly and respectfully while recognizing that the other person also has dignity and a right to respond.",
    sections: [
      { heading: "A short no can be complete", paragraphs: ["A boundary may sound like: ‘I cannot take on extra work this week.’ A long defense can create unwanted space for debate. You can acknowledge the request and still decline: ‘I understand the deadline is tight, but I am not available today.’", "Discomfort after setting a new boundary does not automatically mean the boundary was wrong."] },
      { heading: "Use calm repetition", paragraphs: ["When pressure continues, repeat the same concise limit without producing new arguments. This ‘broken record’ technique keeps the message stable and reduces the temptation to negotiate against yourself.", "A boundary also needs a response plan. Decide what you will do if the behavior continues; do not frame consequences as threats you cannot safely or realistically carry out."] },
    ],
    steps: ["Name the specific behavior", "State its impact", "Make a concise request or refusal", "Do not apologize for having a need", "Repeat the boundary calmly"],
    faq: [{ q: "Is assertiveness selfish?", a: "No. Assertiveness considers the rights and dignity of both people." }, { q: "Why do I feel guilty after saying no?", a: "A new behavior can feel unfamiliar; discomfort alone does not prove you acted wrongly." }],
  }),
  article({
    slug: "emociuri-inteleqti-urtiertobebshi", title: "Emotional Intelligence in Relationships", description: "Use emotional check-ins, needs-based language, listening, repair attempts, and boundaries in close relationships.", category: "Relationships", domains: ["empathy", "social-skills", "self-regulation"],
    intro: "Emotional intelligence in relationships is not the absence of disagreement. It appears in how people notice their state, listen, communicate needs, regulate escalation, and restore connection after difficulty.",
    sections: [
      { heading: "Separate feeling from accusation", paragraphs: ["‘I feel lonely’ shares an experience. ‘You never pay attention to me’ assigns a global judgment. The first form makes it easier to discuss the underlying need and a specific request.", "Before solving, ask whether the person wants understanding, comfort, practical ideas, or a decision."] },
      { heading: "Repair after conflict", paragraphs: ["A responsible apology names the behavior, its impact, and what will change. Adding ‘but’ often shifts attention back toward defense. Small repair attempts—softening tone, asking to restart, or using mutually welcome humor—can interrupt escalation.", "Repair does not require accepting abuse or abandoning a necessary boundary."] },
    ],
    steps: ["Schedule a weekly fifteen-minute check-in", "Each name one feeling and need", "Summarize what you heard", "Choose one supportive action", "Review the result the following week"],
    faq: [{ q: "Does high EQ eliminate conflict?", a: "No. It can make conflict safer, clearer, and more productive." }, { q: "Do both partners need to practice?", a: "Mutual participation is best, but one person's clearer communication can still change part of the dynamic." }],
  }),
  article({
    slug: "emociuri-inteleqti-samsaxurshi", title: "Emotional Intelligence at Work and in Leadership", description: "Apply EQ to feedback, pressure, difficult conversations, team climate, psychological safety, and leadership behavior.", category: "Work", domains: ["social-skills", "empathy", "self-regulation", "motivation"],
    intro: "At work, emotional intelligence appears in how people receive feedback, manage pressure, read context, communicate risk, and discuss difficult performance or relationship issues.",
    sections: [
      { heading: "Give feedback about behavior", paragraphs: ["Describe the situation, observable behavior, and impact. ‘You are irresponsible’ is a label; ‘The report arrived two days late, so the team deadline moved’ is information that can be discussed.", "Ask for the other person's context, then define a concrete next action, owner, and date."] },
      { heading: "A leader's response shapes the room", paragraphs: ["Tone and reactions to mistakes affect whether people ask questions and disclose problems early. Self-regulation does not mean hiding concern; it combines clarity, proportion, accountability, and respect.", "Research reviews suggest emotional-competency training can have positive effects, but EQ never replaces technical skill, fair systems, workload design, or psychological safety."] },
    ],
    steps: ["Define the desired outcome before the meeting", "Identify one emotional trigger", "Use situation–behavior–impact feedback", "Hear the other context", "End with a specific agreement"],
    faq: [{ q: "Does EQ replace technical skill?", a: "No. It helps people apply and communicate expertise effectively." }, { q: "Can workplace EQ be learned?", a: "Targeted practice and feedback can improve specific emotional competencies, though quality and context matter." }],
  }),
  article({
    slug: "eq-da-iq-gansxvaveba", title: "EQ vs. IQ: What Is the Difference?", description: "Compare what EQ and IQ assessments attempt to measure, where each can be useful, and why treating them as competitors oversimplifies real performance.", category: "EQ foundations", domains: ["self-awareness", "self-regulation", "motivation", "empathy", "social-skills"],
    intro: "IQ and EQ answer different questions. IQ measures usually focus on selected cognitive abilities; emotional-intelligence frameworks focus on recognizing and using emotional information. Real tasks often require both.",
    sections: [
      { heading: "What a score can and cannot tell you", paragraphs: ["Neither score captures an entire personality, moral character, creativity, context, opportunity, or future success. Results depend on the instrument and testing conditions.", "Self-report EQ tools primarily reflect how people perceive their habits, which differs from a maximum-performance cognitive test."] },
      { heading: "Ask which skill this situation requires", paragraphs: ["A complex technical problem may depend heavily on analytical reasoning; explaining the solution to a team may require perspective-taking and communication. Choosing one as universally more important simplifies the real interaction between skills.", educational] },
    ],
    steps: ["Interpret each result separately", "Do not use a score as an identity label", "Choose one relevant skill", "Create a behavioral practice", "Measure progress through behavior, not only retesting"],
    faq: [{ q: "Does high IQ mean high EQ?", a: "Not necessarily; the constructs and measurement methods differ." }, { q: "Which matters more?", a: "It depends on the task and context, and many situations require both cognitive and emotional skills." }],
  }),
];

export const EQ_EN_BY_SLUG: Record<string, EqArticleEn> = Object.fromEntries(
  EQ_ARTICLES_EN.map((item) => [item.slug, item]),
);

export function eqArticleEnBySlug(slug: string): EqArticleEn | undefined {
  return EQ_EN_BY_SLUG[slug];
}
