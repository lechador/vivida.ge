export type DreamVariantEn = { when: string; meaning: string };

export type DreamSymbolEn = {
  slug: string;
  title: string;
  summary: string;
  meaning: string;
  variants: DreamVariantEn[];
  positive: string;
  caution: string;
};

const dream = (
  slug: string,
  title: string,
  summary: string,
  meaning: string,
  variants: DreamVariantEn[],
  positive: string,
  caution: string,
): DreamSymbolEn => ({ slug, title, summary, meaning, variants, positive, caution });

export const DREAM_SYMBOLS_EN: DreamSymbolEn[] = [
  dream("gveli", "Snake", "A snake in a dream can represent hidden tension, instinct, healing, or a powerful personal transformation.", "Snakes carry two opposite associations: danger and renewal. A threatening snake may mirror distrust, a boundary problem, or an emotion you have avoided. A calm snake can point to intuition, recovery, and the end of an old phase because snakes shed their skin.", [
    { when: "a snake bites or attacks you", meaning: "A conflict or uncomfortable truth may now demand attention. The feeling and location of the bite can show which part of life feels vulnerable." },
    { when: "you see a black snake", meaning: "This often reflects an unnamed fear, uncertainty, or a subject you would rather not examine directly." },
    { when: "you kill or drive away a snake", meaning: "You may be ready to confront a difficult issue and reclaim a stronger sense of control." },
  ], "A peaceful snake can symbolize healing, sharper intuition, and readiness to grow beyond an outdated identity.", "If fear remained after waking, notice where you feel guarded or unable to speak freely in daily life."),
  dream("wyali", "Water", "Water reflects emotional life; its color, depth, and movement reveal whether feelings seem clear, blocked, or overwhelming.", "Clear water commonly suggests emotional clarity, while muddy water can mirror confusion or unresolved hurt. Still water may point to a pause or stagnation, and moving water to change. Your position matters too: watching water is different from being pulled beneath it.", [
    { when: "the water is clear", meaning: "You may be processing feelings honestly and moving toward calm or recovery." },
    { when: "the water is muddy or dark", meaning: "A situation may feel emotionally confusing, making time and direct conversation especially valuable." },
    { when: "you swim easily", meaning: "You appear able to move through strong feelings without losing your sense of direction." },
  ], "Clean, flowing water is a strong image of renewal, emotional movement, and relief after strain.", "Floods or drowning often accompany overload; consider what currently leaves too little room to breathe."),
  dream("kbili", "Teeth", "Dreams about teeth often connect with confidence, appearance, communication, aging, or fear of losing control.", "Teeth help us speak, eat, and present ourselves, so losing them can mirror vulnerability or concern about how others see us. This widespread dream frequently appears during stress, transition, public evaluation, or worry about health and change.", [
    { when: "a tooth falls out without pain", meaning: "A role or stage may be ending naturally, even if the change still feels unfamiliar." },
    { when: "teeth fall out with blood", meaning: "The worry may feel personal or closely tied to family, identity, or emotional security." },
    { when: "a tooth breaks", meaning: "You may regret something said, fear embarrassment, or feel less prepared than you want others to know." },
  ], "New or healthy teeth can represent returning confidence and the ability to express yourself more clearly.", "Repeated teeth dreams usually reflect stress rather than prediction. Notice where you currently feel judged or powerless."),
  dream("micvalebuli", "Deceased Person", "Seeing someone who has died often reflects grief, memory, love, or an unfinished inner conversation rather than a bad omen.", "Dreams of the deceased are a common part of grieving and remembering. The mind may recreate a familiar presence to process longing, guilt, comfort, or words left unsaid. A peaceful meeting can feel restorative, while distress may reveal grief that still needs care.", [
    { when: "the person speaks to you", meaning: "The conversation may express advice, comfort, or words that remain active in your own memory." },
    { when: "the person looks peaceful", meaning: "This can reflect growing acceptance and a shift from acute grief toward warm remembrance." },
    { when: "the person asks for something", meaning: "Consider what responsibility, promise, ritual, or memory the request brings to mind for you." },
  ], "A comforting encounter can mark healthy integration of memory and a renewed feeling of connection.", "If the dreams are frequent and distressing, grief support or a trusted conversation may offer more help than symbolic interpretation alone."),
  dream("orsuloba", "Pregnancy", "Pregnancy in a dream often symbolizes an idea, relationship, identity, or project that is developing before it becomes visible.", "This image is not necessarily about a literal pregnancy. It can represent potential that needs time, protection, and patience. Joy suggests trust in the new beginning, while anxiety may reflect uncertainty about responsibility or readiness.", [
    { when: "you are pregnant", meaning: "Something new may be growing in your life and asking for steady attention rather than haste." },
    { when: "someone else is pregnant", meaning: "You may sense change around that person or recognize a quality in them that you want to develop." },
    { when: "you give birth", meaning: "A long process may be reaching the point where an idea, decision, or effort can finally take form." },
  ], "Pregnancy is often an encouraging symbol of creativity, growth, and a meaningful new phase.", "Fear in the dream may identify a new commitment that feels larger than your present confidence."),
  dream("bavshvi", "Baby", "A baby can symbolize vulnerability, innocence, a new responsibility, or a part of life that needs patient care.", "Babies in dreams often represent something new and emotionally important. The baby's condition and your response reveal whether you feel protective, overwhelmed, hopeful, or disconnected from a developing need or project.", [
    { when: "you hold a calm baby", meaning: "You may be accepting a tender new role, idea, or part of yourself with confidence." },
    { when: "the baby is crying", meaning: "An emotional need, neglected project, or vulnerable part of you may be asking for attention." },
    { when: "you lose a baby", meaning: "This can reflect fear of failing a responsibility or losing contact with something you deeply value." },
  ], "A healthy, smiling baby often reflects hope, emotional openness, and potential that can grow with care.", "Ask what currently depends on you and whether you have enough support to care for it well."),
  dream("qorwili", "Wedding", "A wedding may represent commitment, integration, transition, or anxiety about a major promise and its consequences.", "Wedding dreams often appear when two areas of life are being joined: independence and partnership, desire and duty, or an old identity and a new role. The atmosphere matters more than whether a real wedding is planned.", [
    { when: "it is your wedding", meaning: "You may be considering a serious commitment or integrating a new responsibility into your identity." },
    { when: "the ceremony is joyful", meaning: "A decision or partnership may feel aligned and supported by your deeper values." },
    { when: "the wedding goes wrong", meaning: "You may fear losing control, disappointing others, or agreeing before you feel ready." },
  ], "A harmonious wedding can symbolize inner cooperation and confidence in a meaningful commitment.", "Separate your own wishes from social expectations when the dream feels pressured or chaotic."),
  dream("sisxli", "Blood", "Blood in dreams represents vitality, family bonds, sacrifice, emotional intensity, or a sense that energy is being lost.", "Because blood sustains life, it can point to passion and strength as well as injury and depletion. Context is essential: a small wound may show emotional sensitivity, while uncontrolled bleeding can mirror exhaustion or fear that a situation costs too much.", [
    { when: "you are bleeding", meaning: "You may feel drained, exposed, or emotionally hurt by a demanding situation." },
    { when: "you see someone else's blood", meaning: "Concern, guilt, or a strong bond with that person may be active in your mind." },
    { when: "blood is on your hands", meaning: "You may be reviewing responsibility for a difficult choice or conflict." },
  ], "Blood can also symbolize courage, vitality, and renewed contact with what matters most.", "Persistent frightening dreams deserve practical attention to stress and wellbeing, not a literal or medical interpretation."),
  dream("tevzi", "Fish", "Fish often symbolize intuition, emotional depth, opportunity, abundance, or an insight rising from below conscious awareness.", "Fish live beneath the visible surface, so they often represent thoughts and feelings that are becoming easier to notice. Healthy fish in clear water suggest possibility; dead or trapped fish can reflect neglected potential or emotional stagnation.", [
    { when: "you catch a fish", meaning: "An opportunity, answer, or useful insight may be coming within reach." },
    { when: "many fish swim in clear water", meaning: "This can reflect abundance, creativity, and several promising directions." },
    { when: "you see a dead fish", meaning: "A hope or emotional need may have been ignored long enough to require a new approach." },
  ], "Living fish in clean water are traditionally associated with abundance, fertility, and intuitive guidance.", "Consider where a promising possibility needs action instead of remaining only an idea."),
  dream("fuli", "Money", "Money in a dream often reflects value, power, confidence, opportunity, security, or anxiety about personal resources.", "Dream money is not always about finances. It can symbolize time, attention, self-worth, and the exchange of effort for recognition. Finding money may mirror emerging confidence, while losing it can expose fear about stability or value.", [
    { when: "you find money", meaning: "You may be recognizing an overlooked resource, talent, or opportunity." },
    { when: "you lose money", meaning: "This can reflect insecurity, regret, or concern that your effort is not being valued." },
    { when: "you give money away", meaning: "You may be investing energy generously or questioning whether an exchange is balanced." },
  ], "Receiving or finding money can represent growing confidence and awareness of what you already possess.", "Review where fear of scarcity influences choices that should be based on values and evidence."),
  dream("oqro", "Gold", "Gold symbolizes enduring value, achievement, wisdom, recognition, and the discovery of something precious within yourself.", "Gold can represent both genuine worth and the temptation to measure everything by status. Finding it may show a talent or truth becoming visible. Guarding it anxiously may reveal fear of loss or excessive attachment to approval.", [
    { when: "you find gold", meaning: "An important ability, opportunity, or source of self-respect may be emerging." },
    { when: "you wear gold jewelry", meaning: "You may want recognition or feel ready to show a valued part of your identity." },
    { when: "the gold is fake", meaning: "A promise, status symbol, or first impression may not match its real substance." },
  ], "Gold is an encouraging image of wisdom, earned confidence, and value that survives changing circumstances.", "Make sure the goal you pursue has real meaning beyond appearance, prestige, or outside praise."),
  dream("cecxli", "Fire", "Fire can mean passion, cleansing, anger, danger, inspiration, or rapid change depending on whether it warms or destroys.", "A controlled flame may symbolize creative energy, desire, and renewal. A spreading fire often mirrors emotions or events that feel difficult to contain. Your reaction—calm, fascination, or panic—helps distinguish transformation from overwhelm.", [
    { when: "a house is on fire", meaning: "A major change may be affecting security, family life, or your sense of identity." },
    { when: "you light a fire", meaning: "You may be activating motivation, courage, attraction, or a new creative direction." },
    { when: "you extinguish a fire", meaning: "You may be calming conflict or regaining control of an intense situation." },
  ], "A warm, contained flame can symbolize vitality, purification, and renewed purpose.", "An uncontrollable blaze asks where anger, urgency, or pressure needs a safer outlet."),
  dream("saxli", "House", "A house commonly represents the self, with each room reflecting a different memory, role, feeling, or area of life.", "Dream houses often map your inner world. Familiar rooms connect with known parts of yourself, while unknown rooms can represent unused abilities or memories. The condition of the house may mirror how secure, organized, or emotionally supported you feel.", [
    { when: "you discover a hidden room", meaning: "A forgotten interest, memory, or personal capacity may be ready to enter conscious life." },
    { when: "the house is damaged", meaning: "Security, health, family, or identity may feel neglected or under strain." },
    { when: "you move into a new house", meaning: "You may be entering a new identity, relationship pattern, or stage of life." },
  ], "A bright, spacious house can reflect growing self-knowledge, safety, and room for development.", "Notice which area is locked, damaged, or avoided; it may resemble a part of life needing care."),
  dream("kari", "Door", "A door symbolizes access, choice, boundaries, beginnings, endings, and the threshold between one state and another.", "Open doors suggest possibility and permission; closed doors can represent a limit, delay, or need for another route. Standing at a doorway often appears when a decision is close but not yet made.", [
    { when: "a door opens", meaning: "A new option, relationship, or understanding may be becoming available." },
    { when: "a door is locked", meaning: "You may feel excluded or unready, or a boundary may be protecting you from moving too soon." },
    { when: "you cannot choose a door", meaning: "Several possibilities may be competing while your priorities remain unclear." },
  ], "An open, inviting door is a classic image of opportunity and readiness for change.", "A locked door may ask for patience, preparation, or respect for a boundary rather than force."),
  dream("gza", "Road", "A road reflects direction, progress, uncertainty, and the way you experience your current life journey.", "The road's condition often mirrors your sense of momentum. A clear road suggests direction, while fog, obstacles, or repeated turns can reflect uncertainty. Traveling alone or with others also reveals how supported or independent the journey feels.", [
    { when: "the road is straight and clear", meaning: "Your goal and next steps may feel coherent, even if the destination remains distant." },
    { when: "you are lost", meaning: "You may need better information or a pause before committing to a direction." },
    { when: "the road is blocked", meaning: "An obstacle may require a changed plan rather than greater force." },
  ], "A road opening into light or a wide landscape can symbolize confidence and expanding possibility.", "Do not treat delay as failure; it may reveal that the route or goal needs revision."),
  dream("manqana", "Car", "A car represents control, personal drive, pace, independence, and how you are navigating daily life.", "Who drives the car is often the central clue. Driving steadily suggests agency, while being a passenger can show reliance on someone else's decisions. Mechanical trouble or lost brakes may mirror concern about pace, preparation, or control.", [
    { when: "you drive confidently", meaning: "You may feel responsible for your direction and capable of handling current demands." },
    { when: "the brakes do not work", meaning: "A commitment, habit, or emotional reaction may feel too fast to stop easily." },
    { when: "someone else drives", meaning: "Another person's priorities may be shaping your path more than you want." },
  ], "A smooth journey in a reliable car reflects agency, momentum, and trust in your current choices.", "If control is lost, identify where slowing down or setting a boundary would restore direction."),
  dream("frena", "Flying", "Flying often expresses freedom, perspective, confidence, imagination, and release from ordinary limits.", "Easy flight can mirror optimism and a wider view of a problem. Difficulty staying airborne may reflect unstable confidence or fear that success cannot last. Height and control distinguish liberation from anxiety.", [
    { when: "you fly freely", meaning: "You may feel ready to rise above an old limitation or see a problem from a broader perspective." },
    { when: "you struggle to stay in the air", meaning: "Confidence may be growing but still vulnerable to doubt or practical pressure." },
    { when: "you fly very high", meaning: "Ambition and possibility are strong, though staying connected to practical reality remains important." },
  ], "Joyful flight is a powerful symbol of autonomy, creative possibility, and renewed confidence.", "If flying becomes frightening, balance a bold vision with concrete support and realistic steps."),
  dream("dacema", "Falling", "Falling commonly reflects insecurity, loss of control, failure anxiety, or the sensation that support has disappeared.", "This frequent dream can occur when life feels unstable or expectations are high. The endless drop often mirrors anticipatory anxiety more than an actual event. Landing safely changes the message toward resilience and adaptation.", [
    { when: "you fall from a great height", meaning: "A goal, reputation, or responsibility may feel exposed to sudden failure." },
    { when: "you wake before landing", meaning: "Your nervous system may be releasing tension around an unresolved uncertainty." },
    { when: "you land safely", meaning: "You may trust your ability to survive change even when control is incomplete." },
  ], "A safe landing can symbolize resilience, humility, and discovering that change is manageable.", "Repeated falling dreams can be a useful prompt to reduce overload and create more practical stability."),
  dream("devna", "Being Chased", "Being chased points to avoidance, pressure, unresolved conflict, or a part of yourself you are not ready to face.", "The pursuer often matters less than the feeling of having no safe pause. This dream may appear when a decision, conversation, deadline, or emotion has been postponed. Turning to face the pursuer can symbolize readiness to engage.", [
    { when: "a stranger chases you", meaning: "An unnamed pressure or disowned quality may feel threatening because it remains unclear." },
    { when: "an animal chases you", meaning: "A strong instinct—anger, desire, fear, or self-protection—may be seeking recognition." },
    { when: "you escape", meaning: "You may be finding distance from pressure, though the underlying issue may still need a direct response." },
  ], "Facing or understanding the pursuer can show growing courage and willingness to address the real issue.", "Ask what you keep postponing; a small direct action often reduces the sense of being hunted."),
  dream("sikvdili", "Death", "Death in dreams usually symbolizes endings, transition, identity change, and release rather than a literal prediction.", "Dream death often appears when a role, relationship pattern, belief, or life stage is ending. The image is dramatic because deep change can feel like losing a familiar self. Grief and relief may coexist.", [
    { when: "you die in the dream", meaning: "An old identity or way of living may be giving way to a new phase." },
    { when: "someone you know dies", meaning: "Your relationship with that person or what they represent may be changing." },
    { when: "you attend a funeral", meaning: "You may be consciously acknowledging an ending and preparing to let go." },
  ], "Death followed by calm or renewal can symbolize transformation and freedom from an exhausted pattern.", "Treat the dream symbolically, but seek support if it intensifies grief, fear, or thoughts of self-harm."),
  dream("zgva", "Sea", "The sea represents the vast emotional unconscious, changing moods, intuition, freedom, and forces larger than conscious control.", "A calm sea can show emotional depth without overwhelm, while storms and huge waves may mirror uncertainty or powerful feelings. Standing on shore suggests observation; entering the water suggests direct engagement with emotion.", [
    { when: "the sea is calm", meaning: "You may feel connected to emotion and intuition without being controlled by them." },
    { when: "large waves approach", meaning: "A powerful change or feeling may seem difficult to contain or predict." },
    { when: "you swim in the sea", meaning: "You may be exploring a deeper emotional situation and learning how to move within it." },
  ], "A bright, calm sea can symbolize emotional spaciousness, intuition, and trust in life's movement.", "Stormy water asks for grounding and support before you make decisions from an intense emotional state."),
  dream("wvima", "Rain", "Rain can symbolize emotional release, sadness, cleansing, fertility, relief, and the end of a dry period.", "Gentle rain often feels restorative, while a cold downpour can mirror loneliness or grief. Because rain nourishes growth, even a sad rain dream may describe feelings moving instead of remaining blocked.", [
    { when: "gentle rain falls", meaning: "A quiet emotional release may be helping you recover or soften after strain." },
    { when: "you are soaked", meaning: "Feelings or circumstances may be reaching you despite attempts to stay detached." },
    { when: "a storm ends", meaning: "A difficult emotional period may be approaching resolution or greater clarity." },
  ], "Warm or refreshing rain is an image of cleansing, renewal, and conditions becoming fertile again.", "Cold relentless rain may signal isolation; consider where comfort and human contact are missing."),
  dream("tovli", "Snow", "Snow symbolizes stillness, purity, emotional distance, a fresh beginning, or feelings temporarily frozen beneath the surface.", "Fresh snow can transform a familiar landscape and suggest a clean page. Deep cold or being trapped may reflect isolation and emotions that have become difficult to access. Melting snow points to gradual return and release.", [
    { when: "fresh snow falls", meaning: "You may be entering a quiet reset with space to see old surroundings differently." },
    { when: "you are lost in snow", meaning: "Emotional distance or uncertainty may make direction and connection harder to find." },
    { when: "snow melts", meaning: "A frozen feeling, delay, or period of withdrawal may be beginning to soften." },
  ], "Bright untouched snow can represent clarity, rest, and the possibility of beginning without old marks.", "If the cold feels dangerous, notice where self-protection has turned into disconnection."),
  dream("tma", "Hair", "Hair in dreams often represents identity, vitality, attractiveness, personal power, and concern about how you are perceived.", "Hair is closely tied to self-image and expression. Cutting it can mean chosen change or lost control depending on who holds the scissors. Hair loss commonly appears with stress, aging concerns, or reduced confidence.", [
    { when: "your hair falls out", meaning: "You may fear losing energy, attractiveness, status, or control during a stressful transition." },
    { when: "you cut your hair", meaning: "You may be ready to redefine yourself or remove a part of the past." },
    { when: "your hair is long and healthy", meaning: "This can reflect vitality, confidence, sensuality, and freedom of expression." },
  ], "Strong, healthy hair can symbolize returning energy and comfort with your identity.", "Hair loss dreams are common under stress; focus on wellbeing rather than reading them as physical prediction."),
  dream("sarke", "Mirror", "A mirror represents self-image, honesty, identity, projection, and the difference between appearance and inner experience.", "The reflection may show how you evaluate yourself or how you imagine others see you. A clear reflection suggests recognition; distortion or absence can point to identity uncertainty, self-criticism, or rapid personal change.", [
    { when: "you see yourself clearly", meaning: "You may be ready for an honest assessment of your feelings, choices, and current identity." },
    { when: "the mirror is broken", meaning: "A familiar self-image may be fractured or no longer fit who you are becoming." },
    { when: "the reflection looks different", meaning: "You may be discovering a hidden quality or worrying that others misunderstand you." },
  ], "A calm, clear reflection can symbolize self-acceptance and stronger alignment between inner and outer life.", "Notice whether the dream invites honest growth or merely repeats harsh self-judgment."),
  dream("kibe", "Stairs", "Stairs represent progress, effort, status, development, and movement between different levels of awareness or responsibility.", "Going up often reflects aspiration and growth, while going down can mean exploring memories, emotion, or foundations. Broken or endless stairs may mirror frustration about progress and uncertainty about the next step.", [
    { when: "you climb stairs", meaning: "You may be working steadily toward greater skill, responsibility, or recognition." },
    { when: "you walk downstairs", meaning: "Attention may be turning inward toward emotion, history, or the root of a problem." },
    { when: "the stairs collapse", meaning: "A plan or support structure may feel unreliable and need reinforcement." },
  ], "Reaching the top can symbolize earned progress, perspective, and readiness for a new level of responsibility.", "Endless stairs may reflect perfectionism; define a realistic milestone so progress becomes visible."),
  dream("dzagli", "Dog", "A dog can symbolize loyalty, protection, friendship, instinct, trust, or conflict when those qualities feel threatened.", "A friendly dog often mirrors dependable connection and healthy instinct. An aggressive dog may represent mistrust, a violated boundary, or anger that has not found a direct voice. Familiarity and behavior shape the meaning.", [
    { when: "a friendly dog approaches", meaning: "Support, loyalty, or your own protective instincts may be available when needed." },
    { when: "a dog bites you", meaning: "Trust may feel damaged, or an ignored warning may now require attention." },
    { when: "a lost dog appears", meaning: "You may miss companionship or feel disconnected from a once-reliable part of yourself." },
  ], "A playful or protective dog can represent friendship, courage, and trust in your natural judgment.", "Aggression asks where loyalty, safety, or boundaries have recently become uncertain."),
  dream("kata", "Cat", "A cat symbolizes independence, intuition, sensuality, mystery, flexibility, and sometimes uncertainty about trust.", "Cats move between closeness and autonomy, making them strong symbols of boundaries and instinct. A calm cat may reflect self-possession, while scratching or hiding can reveal mistrust, suppressed irritation, or a need for space.", [
    { when: "a cat is affectionate", meaning: "You may be comfortable receiving care without surrendering independence." },
    { when: "a cat scratches you", meaning: "A subtle conflict or boundary issue may be sharper than it first appeared." },
    { when: "you see a black cat", meaning: "The image may reflect uncertainty, intuition, or cultural beliefs rather than literal bad luck." },
  ], "A healthy cat can symbolize intuitive confidence, adaptability, and respect for personal boundaries.", "Do not let superstition replace context; your feelings toward the cat are the more useful clue."),
  dream("cxeni", "Horse", "A horse represents vitality, freedom, drive, sexuality, dignity, and the power needed to move forward.", "A strong horse can symbolize confidence and momentum. A wild horse points to independence and untamed energy, while an injured horse may mirror fatigue or a loss of direction. Riding shows how well you guide your own force.", [
    { when: "you ride a horse", meaning: "You may be directing strong ambition or emotion toward a meaningful goal." },
    { when: "a horse runs freely", meaning: "A need for freedom, movement, and authentic expression may be growing." },
    { when: "the horse is injured", meaning: "Energy, confidence, or motivation may need rest and practical care." },
  ], "A powerful calm horse is an encouraging sign of stamina, courage, and aligned forward movement.", "Uncontrolled speed may show ambition outrunning judgment, recovery, or emotional regulation."),
  dream("tagvi", "Mouse", "A mouse can represent small worries, overlooked details, timidity, resourcefulness, or a problem quietly growing in the background.", "Mice draw attention to what seems minor but persistent. The dream may reflect embarrassment, scarcity anxiety, or details that need tidying. A clever mouse can also symbolize adaptability and survival through observation.", [
    { when: "many mice appear", meaning: "Several small demands may be accumulating into a larger sense of disorder or irritation." },
    { when: "a mouse hides", meaning: "A concern may remain easy to dismiss because it has not yet become visible to others." },
    { when: "you catch a mouse", meaning: "You may be ready to solve a nagging problem through precise, practical action." },
  ], "A calm mouse can symbolize intelligence, economy, and the ability to notice opportunities others overlook.", "Address small recurring problems before their cumulative cost becomes larger than the original issue."),
  dream("oboba", "Spider", "A spider symbolizes patience, creativity, intricate planning, entanglement, control, or anxiety about hidden influence.", "Spiders build webs through careful repetition, linking them with craft and long-term strategy. Feeling trapped in a web can instead reflect manipulation, obligations, or a situation whose connections have become difficult to escape.", [
    { when: "a spider builds a web", meaning: "A patient creative or strategic process may be taking shape through many small actions." },
    { when: "a spider bites you", meaning: "A subtle conflict, fear, or controlling dynamic may have become impossible to ignore." },
    { when: "you are caught in a web", meaning: "Commitments or relationships may feel interconnected in a way that limits movement." },
  ], "A nonthreatening spider can symbolize creativity, timing, and confidence in gradual construction.", "If the web feels oppressive, identify which obligation or influence has too much control over your choices."),
  dream("futkari", "Bee", "A bee represents productive effort, cooperation, community, sweetness, duty, and the consequences of overwork.", "Bees combine individual purpose with collective structure. They can symbolize rewarding teamwork and focused activity, but a swarm or sting may show pressure from group expectations or a schedule with no recovery time.", [
    { when: "bees make honey", meaning: "Consistent work and cooperation may be producing a valuable result." },
    { when: "a bee stings you", meaning: "A sharp comment, duty, or small conflict may demand an immediate response." },
    { when: "a swarm surrounds you", meaning: "Group demands or many simultaneous tasks may feel overstimulating." },
  ], "Honey and calm bees traditionally symbolize abundance, useful work, and the rewards of cooperation.", "Productivity loses value when it leaves no room for rest, individuality, or honest boundaries."),
  dream("yvavilebi", "Flowers", "Flowers symbolize beauty, affection, growth, recognition, tenderness, and the temporary nature of a meaningful moment.", "Fresh flowers often appear with emotional opening, creativity, romance, or appreciation. Their color and condition matter: blooming flowers suggest development, while wilted flowers may reflect disappointment, neglect, or an ending.", [
    { when: "someone gives you flowers", meaning: "You may want or recognize affection, gratitude, apology, or emotional acknowledgment." },
    { when: "flowers bloom", meaning: "A relationship, talent, or personal effort may be entering a more visible phase." },
    { when: "flowers are wilted", meaning: "Something once meaningful may need renewed care or graceful release." },
  ], "Blooming flowers are a hopeful image of affection, creativity, recovery, and being ready to receive beauty.", "Enjoy recognition without assuming it will sustain itself; living things still need regular care."),
  dream("puri", "Bread", "Bread represents sustenance, home, security, shared resources, simple abundance, and the value of everyday care.", "Bread is a basic food and a strong cultural image of life supported through work and community. Fresh bread may show stability and gratitude, while stale or missing bread can reflect scarcity, unmet needs, or concern about practical security.", [
    { when: "you bake bread", meaning: "Patient effort may be turning basic ingredients into security, comfort, or a shared result." },
    { when: "you share bread", meaning: "Generosity, belonging, and reciprocal care may be central to the current situation." },
    { when: "the bread is stale", meaning: "A routine or resource may still exist but no longer nourish you in the same way." },
  ], "Fresh shared bread is a traditional symbol of hospitality, stability, and enough to support one another.", "Scarcity imagery can reveal practical anxiety; distinguish a real financial need from a fear shaped by past insecurity."),
  dream("eklesia", "Church", "A church can symbolize conscience, faith, refuge, tradition, community, forgiveness, or conflict with inherited values.", "Religious spaces often appear when a person seeks meaning, peace, guidance, or moral clarity. Comfort in the church may reflect belonging; fear or emptiness can point to guilt, doubt, or distance from a once-important framework.", [
    { when: "you pray in a church", meaning: "You may be seeking reassurance, forgiveness, direction, or a quiet place to gather your thoughts." },
    { when: "the church is empty", meaning: "A source of meaning or community may feel distant, inviting a more personal search for connection." },
    { when: "you light a candle", meaning: "You may be honoring memory, expressing hope, or focusing a sincere intention." },
  ], "A bright peaceful church can symbolize inner refuge, reconciliation, and renewed connection with your values.", "Separate constructive conscience from excessive guilt or fear inherited from other people's expectations."),
  dream("tirili", "Crying", "Crying in a dream often represents emotional release, grief, relief, unmet needs, or feelings held back during waking life.", "Dream tears can let the nervous system process emotion that has been postponed. The crying may belong to sadness, joy, anger, or exhaustion. How you feel afterward—lighter or more distressed—clarifies whether release is occurring.", [
    { when: "you cry intensely", meaning: "Accumulated emotion may need recognition, rest, and a safe form of expression." },
    { when: "someone else cries", meaning: "You may sense their pain or project an unspoken vulnerable part of yourself onto them." },
    { when: "you cry with relief", meaning: "A difficult period or internal struggle may be moving toward acceptance." },
  ], "Tears followed by calm can symbolize healthy release, emotional honesty, and room for recovery.", "If distress remains strong or persistent, seek real support instead of relying only on symbolic meaning."),
  dream("bechedi", "Ring", "A ring symbolizes commitment, continuity, promises, belonging, value, and cycles that return to their beginning.", "Because a ring has no visible end, it often represents enduring bonds or repeating patterns. Receiving one can signal readiness for commitment; losing one may reflect doubt, fear of separation, or concern about a promise.", [
    { when: "you receive a ring", meaning: "A relationship, role, or promise may be becoming more serious and personally meaningful." },
    { when: "you lose a ring", meaning: "You may fear weakening trust, identity, or a commitment that once felt secure." },
    { when: "the ring is broken", meaning: "An agreement or recurring pattern may need repair, renegotiation, or closure." },
  ], "A well-fitting ring can symbolize mutual commitment, coherence, and confidence in a valued bond.", "A promise should fit the person you are now; examine commitments maintained only from fear or habit."),
  dream("dzroxa", "Cow", "A cow symbolizes nourishment, patience, maternal care, steady resources, fertility, and the quiet productivity of daily life.", "Cows are traditionally linked with sustenance and dependable abundance. A healthy calm cow may reflect stability and care, while a thin or aggressive cow can point to depleted resources, resentment, or a caregiving role under strain.", [
    { when: "a calm cow grazes", meaning: "Your needs may be supported through simple routines, patience, and reliable resources." },
    { when: "you milk a cow", meaning: "Consistent care or work may be producing something useful and sustaining." },
    { when: "a cow chases you", meaning: "A duty, family expectation, or neglected practical need may feel increasingly demanding." },
  ], "A healthy cow is a traditional image of nourishment, fertility, patience, and dependable prosperity.", "Care for others should not continually consume the resources needed for your own wellbeing."),
];

export const DREAM_EN_BY_SLUG: Record<string, DreamSymbolEn> =
  Object.fromEntries(DREAM_SYMBOLS_EN.map((symbol) => [symbol.slug, symbol]));
