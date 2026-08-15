export type DreamVariantEn = {
  when: string;
  means: string;
};

export type DreamSymbolEn = {
  slug: string;
  title: string;
  glyph: string;
  summary: string;
  meaning: string;
  variants: DreamVariantEn[];
  positive: string;
  caution: string;
  related: string[];
};

export const DREAM_SYMBOLS_EN: DreamSymbolEn[] = [
  {
    slug: "gveli",
    title: "Snake",
    glyph: "🐍",
    summary:
      "The snake is one of the most potent symbols in dreams — representing both hidden danger and profound personal transformation.",
    meaning:
      "Traditionally, dreaming of a snake points to a concealed threat or someone in your orbit who is not completely sincere. Yet the snake regularly sheds its skin — making it a timeless emblem of renewal, revitalization, and shedding exhausted life stages. Which meaning applies depends on how you felt in the dream: terror or quiet calm.",
    variants: [
      {
        when: "A snake attacks or bites you",
        means:
          "Open conflict or resentment you have bottled up for too long. The bite location matters: hands relate to work and action, feet to your life path, and chest to emotional relationships.",
      },
      {
        when: "A black snake",
        means:
          "An unacknowledged fear or a topic you avoid facing. Often it reflects an aspect of yourself rather than an external adversary.",
      },
      {
        when: "A white snake",
        means:
          "A deeply benevolent sign — intuition warning you in advance, or valuable wisdom that will soon come your way.",
      },
      {
        when: "Many snakes clustered together",
        means:
          "An environment where you feel emotionally unguarded — a workplace or social circle where trust is fragile.",
      },
      {
        when: "Killing or fending off a snake",
        means:
          "An excellent omen: you possess the inner readiness to face a daunting problem directly without further postponement.",
      },
    ],
    positive:
      "If you felt no fear in the dream, the snake signifies renewal — an old chapter is concluding to make room for fresh vitality.",
    caution:
      "If anxiety lingers upon waking, reflect on who around you requires you to tread cautiously and measure every word.",
    related: ["sisxli", "tagvi", "wyali"],
  },
  {
    slug: "wyali",
    title: "Water",
    glyph: "💧",
    summary:
      "Water in a dream mirrors your emotional state — and its clarity reveals more than anything else.",
    meaning:
      "In the language of dreams, water is the substance of emotion. Crystal-clear water reflects mental peace, emotional lucidity, and balance; murky or dark water signals turbulent feelings you have not yet unraveled. Whether the water is still or rushing is equally significant: still water points to a plateau, while a flowing river indicates active life transition.",
    variants: [
      {
        when: "Swimming in clean, transparent water",
        means:
          "Inner harmony, emotional recovery, and a clear sense that you are in the right place at the right time.",
      },
      {
        when: "Muddy, dirty, or murky water",
        means:
          "Emotional confusion, unspoken anxieties, or an upcoming situation where motives are obscure and caution is required.",
      },
      {
        when: "Drowning or sinking",
        means:
          "Feeling overwhelmed by circumstances — responsibilities, emotions, or an environment where you struggle to catch your breath.",
      },
      {
        when: "Drinking cold, fresh water",
        means:
          "Renewal of vitality, satisfaction of a deep emotional craving, and good physical and mental health.",
      },
      {
        when: "A flood or sudden high water",
        means:
          "Suppressed emotions breaking through your defenses, or sudden external events demanding all your attention.",
      },
    ],
    positive:
      "Clear, calm water promises emotional revitalization and mental ease across your personal relationships.",
    caution:
      "Turbid water or a sense of drowning asks you to slow down, reduce external pressures, and untangle accumulated stress.",
    related: ["zgva", "wvima", "tevzi"],
  },
  {
    slug: "kbili",
    title: "Teeth Falling Out",
    glyph: "🦷",
    summary:
      "Teeth in dreams symbolize personal vitality, influence, control, and fear of sudden loss.",
    meaning:
      "Losing a tooth is one of the most universal dreams across cultures. Psychologically, teeth represent power, self-assertion, and how securely you feel in your skin. When teeth crumble or fall out, it rarely relates to physical health — it usually mirrors fear of losing control, aging, or a sudden loss of confidence.",
    variants: [
      {
        when: "A tooth falls out painlessly with no blood",
        means:
          "Letting go of an outdated belief or ending a minor commitment that has run its course naturally.",
      },
      {
        when: "A tooth falls out with intense pain and blood",
        means:
          "Painful separation or conflict involving a close family member or someone deeply intertwined with your heart.",
      },
      {
        when: "Teeth crumbling into powder",
        means:
          "Feeling powerlessness or that your words are losing impact; a signal to rebuild self-worth from within.",
      },
      {
        when: "Spitting out broken teeth",
        means:
          "Words spoken in anger that you wish you could take back, or a desperate need to clear the air.",
      },
      {
        when: "Growing new, healthy teeth",
        means:
          "A superb omen: renewed vitality, rising confidence, and stepping into a stronger chapter of life.",
      },
    ],
    positive:
      "Growing or cleaning teeth indicates renewed confidence, clearer communication, and recovering your assertiveness.",
    caution:
      "Recurrent tooth-loss dreams strongly indicate you are feeling powerless or vulnerable in a key waking relationship.",
    related: ["sisxli", "sarke", "sikvdili"],
  },
  {
    slug: "micvalebuli",
    title: "Deceased Loved One",
    glyph: "🕯️",
    summary:
      "Dreaming of the deceased is often a subconscious prompt to heed advice or resolve unfinished emotional ties.",
    meaning:
      "When someone who has passed away visits your dream, it is often an encounter with your own deepest memories and conscience. In folklore, they arrive to give warning or bring peace; in psychological terms, your subconscious uses their familiar presence to deliver wisdom you hesitate to acknowledge while awake.",
    variants: [
      {
        when: "The deceased is smiling and peaceful",
        means:
          "Reassurance that you are on the right track; inner forgiveness and emotional healing from past grief.",
      },
      {
        when: "The deceased is silent, sad, or weeping",
        means:
          "Unresolved guilt, neglected promises, or a life choice you sense goes against your deeper integrity.",
      },
      {
        when: "The deceased speaks or offers explicit advice",
        means:
          "Pay rigorous attention to their exact words — your subconscious is handing you an important realization.",
      },
      {
        when: "The deceased embraces or kisses you",
        means:
          "Deep comfort during a lonely hour, or blessing for a major life decision you are preparing to make.",
      },
      {
        when: "The deceased calls you to follow them",
        means:
          "A classic cautionary motif: a call to guard your health, avoid reckless risks, and ground yourself in the present.",
      },
    ],
    positive:
      "A serene meeting brings closure, blessing, and peaceful integration of memories that once caused sorrow.",
    caution:
      "A distressed visit asks you to make amends with your past, fulfill forgotten obligations, and treat yourself with greater care.",
    related: ["sikvdili", "eklesia", "tirili"],
  },
  {
    slug: "orsuloba",
    title: "Pregnancy",
    glyph: "🤰",
    summary:
      "Pregnancy in dreams heralds the incubation of a new idea, venture, creative project, or inner evolution.",
    meaning:
      "Dreaming of pregnancy rarely predicts literal childbirth; it is almost always an archetype of creative gestation. You are carrying something inside you — a concept, business plan, or emotional transformation — that requires time, protection, and nourishment before it is ready for the world.",
    variants: [
      {
        when: "You are pregnant and feeling joyful",
        means:
          "A cherished creative endeavor or ambition is maturing steadily and will soon yield tangible rewards.",
      },
      {
        when: "You are pregnant and filled with anxiety",
        means:
          "Fear of looming responsibility, feeling unprepared for a promotion, or dreading life changes ahead.",
      },
      {
        when: "Seeing a friend or relative pregnant",
        means:
          "That person is entering a transformative life phase, or your bond with them is about to undergo evolution.",
      },
      {
        when: "Giving birth successfully",
        means:
          "The triumphant realization of a long-term goal; the physical manifestation of months of hard work.",
      },
      {
        when: "A man dreaming of pregnancy",
        means:
          "Fertile ground for bold business plans, original innovations, or taking on substantial leadership.",
      },
    ],
    positive:
      "A harmonious pregnancy dream confirms that your hidden efforts and creative seeds are thriving.",
    caution:
      "Panic over pregnancy reflects hesitation to shoulder the duties that naturally accompany your growth.",
    related: ["bavshvi", "qorwili", "bechedi"],
  },
  {
    slug: "bavshvi",
    title: "Baby or Child",
    glyph: "👶",
    summary:
      "A baby in a dream mirrors innocence, vulnerability, raw potential, and the tender beginnings of your ventures.",
    meaning:
      "Children in dreams represent your inner child, pure creativity, and new initiatives in their most delicate stage. A healthy, smiling infant points to joyful beginnings and authentic self-expression; a crying or sick baby alerts you to neglected needs, vulnerable projects, or unhealed emotional vulnerabilities.",
    variants: [
      {
        when: "Holding a smiling, content baby",
        means:
          "Warmth, reciprocal affection, peaceful family life, and fresh enthusiasm for everyday pursuits.",
      },
      {
        when: "A crying or distressed infant",
        means:
          "A fragile project or relationship is crying out for attention; you may be ignoring your own emotional exhaustion.",
      },
      {
        when: "Finding an abandoned baby",
        means:
          "Rediscovering a neglected personal talent, a forgotten dream, or a dormant passion waiting to be nurtured.",
      },
      {
        when: "Feeding or nursing a child",
        means:
          "Dedicating your time and energy to a meaningful endeavor that will reward you generously in due course.",
      },
      {
        when: "Losing sight of a child in a crowd",
        means:
          "Anxiety over losing touch with your simplicity, spontaneity, or core values in the rush of adult life.",
      },
    ],
    positive:
      "A laughing, thriving child foretells sweet beginnings, creative bursts, and heartfelt joy in your personal world.",
    caution:
      "A sick or distressed child warns that an important commitment is being starved of necessary time and tender care.",
    related: ["orsuloba", "saxli", "tirili"],
  },
  {
    slug: "qorwili",
    title: "Wedding",
    glyph: "👰",
    summary:
      "A wedding represents the sacred union of opposing forces, major agreements, and deep life transitions.",
    meaning:
      "While popularly romanticized, a wedding in traditional dream analysis is fundamentally about commitment, integration, and transition. It signifies bringing together two parts of your personality — logic and intuition, ambition and rest — or entering an agreement whose terms will reshape your daily lifestyle.",
    variants: [
      {
        when: "Attending your own wedding happily",
        means:
          "Achieving inner harmony, making a profound commitment to your goals, and stepping into mature self-trust.",
      },
      {
        when: "A chaotic, gloomy, or unwilling wedding",
        means:
          "Feeling trapped in an agreement, job, or obligation where you surrendered your independence too cheaply.",
      },
      {
        when: "Dancing at someone else's wedding",
        means:
          "Joyful social gatherings, expanding your circle of genuine allies, and sharing in the success of others.",
      },
      {
        when: "Wearing a torn or stained wedding dress",
        means:
          "Doubts regarding an upcoming partnership, contract, or major public choice; fear of judgment.",
      },
      {
        when: "A wedding without a groom or bride",
        means:
          "Feeling that a partnership is one-sided; taking on full responsibility while the other party remains absent.",
      },
    ],
    positive:
      "A luminous wedding celebrates inner alignment, harmonious cooperation, and mutual loyalty.",
    caution:
      "A tense or sorrowful ceremony urges you to double-check commitments before binding yourself legally or emotionally.",
    related: ["bechedi", "orsuloba", "eklesia"],
  },
  {
    slug: "sisxli",
    title: "Blood",
    glyph: "🩸",
    summary:
      "Blood is the raw essence of life force, emotional intensity, family ties, and deep-seated vulnerability.",
    meaning:
      "Dreaming of blood is always intense because blood is the vital fluid that keeps us alive. In dreams, it symbolizes your energy reserves, passion, ancestral lineage, and the psychological cost of ongoing struggles. Flowing blood can mean losing vital strength through stress, or conversely, the fiery awakening of deep passion.",
    variants: [
      {
        when: "Bleeding from a wound",
        means:
          "Energy drainage, emotional hurt from a close relationship, or overextending yourself to the point of exhaustion.",
      },
      {
        when: "Blood on your hands",
        means:
          "Guilt, remorse, or feeling directly accountable for an uncomfortable situation involving people you care for.",
      },
      {
        when: "Drinking or touching blood without fear",
        means:
          "A potent surge of courage, determination to overcome adversity, and tapping into deep instinctual resilience.",
      },
      {
        when: "Bleeding from the nose",
        means:
          "Mental overexertion, intense stress at work, or high cognitive load that requires immediate restful decompression.",
      },
      {
        when: "Seeing blood on someone else",
        means:
          "Empathy for a loved one's hidden pain, or awareness of tension brewing within your close family circle.",
      },
    ],
    positive:
      "Clean, vibrant blood without horror symbolizes strong passions, ancestral vitality, and fierce determination.",
    caution:
      "Uncontrolled bleeding is an urgent reminder that your daily schedule is draining your vital emotional reserves.",
    related: ["kbili", "gveli", "sikvdili"],
  },
  {
    slug: "tevzi",
    title: "Fish",
    glyph: "🐟",
    summary:
      "Fish symbolize deep subconscious intuition, emotional riches, fertility, and unexpected spiritual gifts.",
    meaning:
      "Swimming in the depths of water, fish are natural messengers of the unconscious mind. In many traditions, catching fish signifies material gain, pregnancy, or bringing a hidden idea to the surface of conscious awareness. Live fish represent vitality and flowing opportunities; dead fish warn of missed openings.",
    variants: [
      {
        when: "Catching live fish with your bare hands",
        means:
          "Seizing a golden opportunity through sheer instinct; unexpected financial or personal triumph.",
      },
      {
        when: "Fish swimming in clear, sunlit water",
        means:
          "Emotional fulfillment, smooth development of plans, and abundant blessings in your domestic sphere.",
      },
      {
        when: "Dead or rotting fish",
        means:
          "Disappointment, wasted effort on a dead-end project, or letting a valuable chance slip away through inaction.",
      },
      {
        when: "Eating deliciously prepared fish",
        means:
          "Absorbing wisdom, nourishing your spiritual and intellectual hunger, and enjoying the fruits of labor.",
      },
      {
        when: "An aquarium filled with colorful fish",
        means:
          "A rich inner life, though you may be observing opportunities from behind glass instead of diving in.",
      },
    ],
    positive:
      "Catching or watching vibrant fish foretells emotional abundance, fertility, and financial reward.",
    caution:
      "Dead fish signal that an enterprise has lost its spark and continuing to invest in it will only bring frustration.",
    related: ["wyali", "zgva", "fuli"],
  },
  {
    slug: "fuli",
    title: "Money",
    glyph: "💵",
    summary:
      "Money in dreams reflects your perceived self-worth, energy exchange, influence, and security.",
    meaning:
      "Dreaming of currency is rarely about literal banknotes; it symbolizes how much you value your time, skills, and emotional contributions. Finding money indicates discovering unrecognized worth in yourself; losing money mirrors fear of depleted resources or being undervalued by others.",
    variants: [
      {
        when: "Finding large stacks of cash",
        means:
          "Unlocking dormant potential, rising confidence, and receiving well-earned validation for your talents.",
      },
      {
        when: "Losing your wallet or money",
        means:
          "Feeling drained, taken advantage of, or insecure about your financial independence and stability.",
      },
      {
        when: "Giving money away or helping someone",
        means:
          "Generosity of spirit, open energetic circulation, and confidence that you possess enough to share freely.",
      },
      {
        when: "Counting paper banknotes carefully",
        means:
          "Evaluating your current priorities, budgeting energy, and preparing a solid foundation for future goals.",
      },
      {
        when: "Receiving counterfeit or torn money",
        means:
          "Encountering deceptive promises, flattering words that lack substance, or insincere agreements.",
      },
    ],
    positive:
      "Finding or earning clean currency represents rising confidence, abundant energy, and rightful reward.",
    caution:
      "Losing money or receiving fake notes warns against naive trust in financial deals and flattery.",
    related: ["oqro", "bechedi", "kbili"],
  },
  {
    slug: "oqro",
    title: "Gold",
    glyph: "🪙",
    summary:
      "Gold represents supreme value, enduring integrity, spiritual wisdom, and radiant success.",
    meaning:
      "Gold does not tarnish or rust — hence in the subconscious it stands for unassailable truth, timeless wisdom, and supreme worth. Dreaming of gold signifies connecting with the most refined aspects of your character, gaining mastery in your profession, or recognizing the priceless value of true loyalty.",
    variants: [
      {
        when: "Finding gold jewelry or gold coins",
        means:
          "Gaining profound insights, achieving a prestigious status, and earning honors that will stand the test of time.",
      },
      {
        when: "Receiving gold as a gift",
        means:
          "Receiving unconditional trust, valuable mentorship, or high honor from someone you deeply respect.",
      },
      {
        when: "Losing a prized gold item",
        means:
          "Regret over compromising your highest standards, or neglecting a precious relationship due to carelessness.",
      },
      {
        when: "Holding heavy gold bars",
        means:
          "Great responsibility coupled with tremendous power; you hold the keys to a transformative enterprise.",
      },
      {
        when: "Gold turning into dust or cheap metal",
        means:
          "Disillusionment with superficial glamour; discovering that what you idolized lacked genuine substance.",
      },
    ],
    positive:
      "Discovering or wearing pure gold indicates that your integrity and tireless dedication will win lasting respect.",
    caution:
      "Hoarding gold or seeing it vanish reminds you that true worth lives in character, not ostentation.",
    related: ["fuli", "bechedi", "sarke"],
  },
  {
    slug: "cecxli",
    title: "Fire",
    glyph: "🔥",
    summary:
      "Fire embodies passion, purifying destruction, creative spark, and the intensity of raw emotion.",
    meaning:
      "Fire is a dual archetype: controlled, it warms the hearth, lights the dark, and tempers steel; uncontrolled, it consumes everything in its path. A pleasant hearth fire signals domestic comfort, inspiration, and vitality; a raging wildfire warns of destructive anger, burnout, or emotional explosions.",
    variants: [
      {
        when: "A cozy, warm fireplace or campfire",
        means:
          "Peace of mind, warm family atmosphere, creative inspiration, and loyal companionship.",
      },
      {
        when: "Your house or room is on fire",
        means:
          "Intense emotional crisis, overwhelming stress, or sweeping transformation that razes outdated habits.",
      },
      {
        when: "Extinguishing a dangerous blaze",
        means:
          "Mastering your temper, preventing a disastrous confrontation, and restoring order to a volatile situation.",
      },
      {
        when: "Walking through fire unhurt",
        means:
          "Extraordinary resilience; passing through a severe trial and emerging stronger, wiser, and purified.",
      },
      {
        when: "Being burned by hot embers",
        means:
          "Suffering the consequences of impulsive words, reckless impatience, or playing with dangerous dynamics.",
      },
    ],
    positive:
      "A warm, bright flame brings inspiration, passionate love, and creative breakthroughs to your endeavors.",
    caution:
      "A raging inferno warns that unchecked anger or overwork will scorch your well-being unless extinguished promptly.",
    related: ["saxli", "sisxli", "wyali"],
  },
  {
    slug: "saxli",
    title: "House",
    glyph: "🏠",
    summary:
      "A house represents your entire psyche — each room mirrors a different facet of your personality and memory.",
    meaning:
      "In psychological dream work, the house is the classic portrait of the self: the attic holds intellect and memories, the basement holds instinct and buried fears, the living room is your social persona, and the bedroom is private intimacy. The condition, size, and atmosphere of the house reflect your inner architecture.",
    variants: [
      {
        when: "Discovering secret, spacious new rooms",
        means:
          "Uncovering hidden talents, expanded awareness, and exciting personal capabilities you never knew you had.",
      },
      {
        when: "An old, dilapidated, or crumbling house",
        means:
          "Neglected emotional health, outdated belief systems that need dismantling, or exhaustion from old burdens.",
      },
      {
        when: "Cleaning, renovating, or repairing a home",
        means:
          "Conscious psychological self-care, establishing better habits, and resolving longstanding personal dilemmas.",
      },
      {
        when: "Strangers or intruders in your house",
        means:
          "Feeling your personal boundaries are being violated by intrusive people, opinions, or uninvited demands.",
      },
      {
        when: "Building a new house from the foundation up",
        means:
          "Constructing a fresh life, founding a family, or launching a lasting enterprise based on solid values.",
      },
    ],
    positive:
      "A sunny, sturdy, well-ordered house indicates psychological harmony, stability, and emotional security.",
    caution:
      "Broken walls or collapsing ceilings highlight urgent psychological repair needed in your everyday lifestyle.",
    related: ["kari", "kibe", "bavshvi"],
  },
  {
    slug: "kari",
    title: "Door",
    glyph: "🚪",
    summary:
      "A door marks the threshold between phases — opportunities, secrets, new choices, and boundaries.",
    meaning:
      "Doors are universal symbols of transition. An open door welcomes you into uncharted territory and fresh opportunity; a closed or locked door presents a challenge, a secret kept, or a path that is not yet ready for you to walk. Knocking on a door signifies seeking answers and new horizons.",
    variants: [
      {
        when: "Walking through an open door into bright light",
        means:
          "Stepping boldly into a new life stage, seizing a pivotal opportunity, and leaving old limitations behind.",
      },
      {
        when: "Finding a locked door you cannot open",
        means:
          "Encountering temporary barriers, a lack of necessary information, or trying to force something prematurely.",
      },
      {
        when: "Looking through a keyhole or peephole",
        means:
          "Curiosity regarding others' motives, suspicion, or quietly observing a situation before committing.",
      },
      {
        when: "Locking a door firmly behind you",
        means:
          "Drawing strict personal boundaries, cutting off toxic ties, and protecting your inner peace from intruders.",
      },
      {
        when: "Someone knocking loudly on your door",
        means:
          "Unexpected news, an unforeseen visitor, or a long-ignored duty demanding your immediate attention.",
      },
    ],
    positive:
      "An open doorway invites you toward promising avenues of personal, creative, and career advancement.",
    caution:
      "A locked door advises patience: find the right key through wisdom rather than battering against the obstacle.",
    related: ["saxli", "gza", "kibe"],
  },
  {
    slug: "gza",
    title: "Road or Path",
    glyph: "🛣️",
    summary:
      "The road symbolizes your life journey, career trajectory, direction of growth, and upcoming choices.",
    meaning:
      "Dreaming of a path is a direct commentary on how you are navigating your destiny. A wide, smooth highway suggests straightforward progress and confidence; a winding, rocky trail reflects difficulties that demand agility and patience; a crossroads forces an inevitable decision.",
    variants: [
      {
        when: "Walking a straight, paved, sunlit highway",
        means:
          "Clarity of purpose, confidence in your goals, and smooth advancement without unnecessary detours.",
      },
      {
        when: "Standing at a crossroads unsure which way to turn",
        means:
          "A crucial life decision where postponing choice is no longer viable; a need to define your true priorities.",
      },
      {
        when: "A steep, rocky, uphill mountain path",
        means:
          "Demanding labor that tests your stamina, but leads to significant mastery and elevated perspective.",
      },
      {
        when: "Losing your way in thick fog on the road",
        means:
          "Confusion, lack of clear guidance, or relying on incomplete information; a sign to pause before rushing forward.",
      },
      {
        when: "The road ends abruptly at a cliff or wall",
        means:
          "An old method has reached its natural limit; you must rethink your strategy and pioneer a fresh route.",
      },
    ],
    positive:
      "A clear, open road affirms that your current trajectory is sound and leading toward rewarding horizons.",
    caution:
      "A treacherous or dead-end road warns you to reevaluate plans before investing further time and energy.",
    related: ["manqana", "kari", "frena"],
  },
  {
    slug: "manqana",
    title: "Car",
    glyph: "🚗",
    summary:
      "A car reflects personal autonomy, how you navigate your ambitions, and who holds the steering wheel.",
    meaning:
      "In modern symbolism, vehicles represent how you drive your life. Being behind the wheel shows self-determination and executive control; being a passenger suggests you may have yielded authority to someone else. The speed, braking ability, and condition of the car illustrate your control under stress.",
    variants: [
      {
        when: "Driving smoothly and confidently",
        means:
          "You are fully in charge of your decisions, steering projects purposefully, and pacing yourself well.",
      },
      {
        when: "Brakes fail or steering wheel is unresponsive",
        means:
          "Losing control in a high-pressure situation; a warning that life is moving too fast for your emotional stamina.",
      },
      {
        when: "Being a helpless passenger with a reckless driver",
        means:
          "Surrendering your agency to an overbearing partner, boss, or family member who is making poor choices.",
      },
      {
        when: "A car crash or collision",
        means:
          "Clashing egos, conflicting priorities, or an inevitable collision course that requires immediate defusing.",
      },
      {
        when: "Car runs out of fuel or breaks down",
        means:
          "Severe physical or mental burnout; your internal battery is depleted and demanding restorative rest.",
      },
    ],
    positive:
      "Effortless driving on open roads confirms you are commanding your life with skill and poise.",
    caution:
      "Failed brakes or losing control serves as a stark warning to slow down and reassess hazardous risks.",
    related: ["gza", "dacema", "devna"],
  },
  {
    slug: "frena",
    title: "Flying",
    glyph: "🦅",
    summary:
      "Flying expresses liberation from mundane constraints, elevated perspective, and spiritual transcendence.",
    meaning:
      "Flying dreams are among the most exhilarating human experiences. They signify rising above petty worries, gaining a bird's-eye view on complex dilemmas, and touching true creative freedom. Effortless flight shows high confidence; struggling to maintain altitude hints at nagging self-doubt.",
    variants: [
      {
        when: "Soaring high above landscapes with ease and joy",
        means:
          "Spiritual freedom, broad visionary perspective, and rising above petty drama into creative mastery.",
      },
      {
        when: "Struggling to stay aloft or hitting power lines",
        means:
          "Ambitions hindered by practical friction, minor anxieties, or people trying to drag you back down.",
      },
      {
        when: "Flying to escape an enemy below",
        means:
          "Using intellect, creativity, or detachment to outmaneuver a hostile situation or painful conflict.",
      },
      {
        when: "Hovering just a few feet above the ground",
        means:
          "Testing new capabilities cautiously; quiet progress without drawing unwanted attention.",
      },
      {
        when: "Suddenly falling out of the sky while flying",
        means:
          "A sudden reality check; overconfidence punctured by overlooked practical details.",
      },
    ],
    positive:
      "Smooth, high flight reflects unhindered creativity, emotional liberation, and expanding visionary power.",
    caution:
      "Fear of heights or turbulent flight warns against arrogance and neglecting practical grounded realities.",
    related: ["dacema", "gza", "zgva"],
  },
  {
    slug: "dacema",
    title: "Falling",
    glyph: "🪂",
    summary:
      "Falling reflects loss of footing, anxiety about failure, insecurity, and sudden surrender of control.",
    meaning:
      "Falling is an instinctual dream reaction to instability in waking life. It often occurs when reality shatters an illusion, when support systems feel shaky, or when you are dreading an impending evaluation. Conversely, surrendering into the fall can symbolize learning to let go of impossible control.",
    variants: [
      {
        when: "Falling into an endless dark abyss with terror",
        means:
          "Intense anxiety over the unknown, feeling that your security net has vanished under current pressures.",
      },
      {
        when: "Falling and landing softly on your feet or water",
        means:
          "Resilience; an anticipated crisis will resolve far more smoothly than your worst fears imagined.",
      },
      {
        when: "Tripping and falling in front of an audience",
        means:
          "Fear of public embarrassment, impostor syndrome, or dread of being judged harshly by peers.",
      },
      {
        when: "Falling from a great height (building or mountain)",
        means:
          "A blow to professional pride or high expectations; a sign to adopt a more grounded, realistic stance.",
      },
      {
        when: "Watching someone else tumble and fall",
        means:
          "Concern for a vulnerable friend, or observing someone's flawed choices lead to predictable difficulty.",
      },
    ],
    positive:
      "A soft landing proves that even when you lose control, your innate adaptability will catch you safely.",
    caution:
      "Terrifying falling dreams indicate unmanaged stress and a lack of grounding support in your everyday routine.",
    related: ["frena", "kibe", "devna"],
  },
  {
    slug: "devna",
    title: "Being Chased",
    glyph: "🏃",
    summary:
      "Being pursued points to avoidance — running away from responsibilities, emotions, or necessary confrontations.",
    meaning:
      "When something or someone pursues you in a dream, you are almost always fleeing an aspect of yourself — a difficult conversation, an unacknowledged truth, a deadline, or a guilt you refuse to confront. The pursuer represents the urgency of the matter you are trying to outrun.",
    variants: [
      {
        when: "Being chased by a wild predator (wolf, bear)",
        means:
          "Running from powerful, untamed instinctual urges, explosive anger, or intense primal passions.",
      },
      {
        when: "Being pursued by an unknown shadow or monster",
        means:
          "Vague, unformulated anxieties and existential dread that need to be examined in daylight.",
      },
      {
        when: "Being chased by the police or authorities",
        means:
          "Guilt over a broken rule, fear of exposure, or wrestling with an uneasy moral compromise.",
      },
      {
        when: "Turning around to face and challenge the pursuer",
        means:
          "A huge psychological breakthrough: readiness to confront fears directly and end the exhausting chase.",
      },
      {
        when: "Hiding in a small room while the pursuer searches",
        means:
          "Postponing inevitable reality; buying temporary time while the core dilemma remains unresolved.",
      },
    ],
    positive:
      "Stopping to face your pursuer marks the end of fear and the dawn of courageous, proactive self-leadership.",
    caution:
      "Repeated chase dreams scream that running from your problem is costing far more energy than solving it.",
    related: ["dacema", "gveli", "sikvdili"],
  },
  {
    slug: "sikvdili",
    title: "Death",
    glyph: "⏳",
    summary:
      "Death in dreams is rarely literal — it signifies profound rebirth, transformation, and closing an era.",
    meaning:
      "Death in the symbolic realm is the ultimate marker of transformation. Just as in the tarot, death means an old identity, outdated lifestyle, or worn-out relationship is passing away so that a revitalized version of you can be born. It represents radical shedding of the past.",
    variants: [
      {
        when: "Your own death in a dream",
        means:
          "Undergoing deep personal evolution; letting an old mindset die to step into a renewed stage of life.",
      },
      {
        when: "The death of a living parent or relative",
        means:
          "Changing dynamics in your relationship with them; gaining independence or fearing emotional distance.",
      },
      {
        when: "The death of an enemy or rival",
        means:
          "Inner resolution of conflict; releasing resentment and no longer allowing their presence to disturb you.",
      },
      {
        when: "Attending a somber funeral service",
        means:
          "Formally letting go of a past grievance, saying farewell to an expired project, and seeking closure.",
      },
      {
        when: "A dead person suddenly returning to life",
        means:
          "The unexpected revival of an old idea, rekindling a dormant connection, or a second chance at success.",
      },
    ],
    positive:
      "Dreaming of death heralds liberating transformation, ending toxic cycles, and welcoming a fresh life epoch.",
    caution:
      "Sorrowful death dreams urge you to grieve past losses properly so they no longer haunt your future steps.",
    related: ["micvalebuli", "gveli", "kbili"],
  },
  {
    slug: "zgva",
    title: "Sea or Ocean",
    glyph: "🌊",
    summary:
      "The ocean represents the vast collective unconscious, profound spiritual depths, and infinite possibilities.",
    meaning:
      "The sea is the boundless cradle of life. Standing by or sailing upon the sea connects you with grand life forces, philosophical contemplations, and the vast scale of your ambitions. A serene azure sea promises emotional peace; a storm-tossed ocean warns of raging emotional turbulence.",
    variants: [
      {
        when: "A calm, glittering, sunlit blue sea",
        means:
          "Deep inner peace, broad creative horizons, and feeling at one with the rhythm of the universe.",
      },
      {
        when: "Giant storm waves and tempestuous sea",
        means:
          "Raging emotional storms, unpredictable external challenges, and testing your emotional anchor.",
      },
      {
        when: "Diving deep into the underwater depths",
        means:
          "Exploring your subconscious secrets, discovering profound psychological insights, and spiritual searching.",
      },
      {
        when: "Walking peacefully along the seashore",
        means:
          "Contemplating major life decisions at the boundary between conscious logic (land) and deep feeling (sea).",
      },
      {
        when: "A tsunami approaching the shore",
        means:
          "Sudden overwhelming circumstances or suppressed emotional tidal waves sweeping away old routines.",
      },
    ],
    positive:
      "A peaceful, clear sea brings boundless inspiration, spiritual clarity, and vast creative prosperity.",
    caution:
      "Stormy seas warn against navigating delicate affairs while your emotional weather is volatile and agitated.",
    related: ["wyali", "wvima", "tevzi"],
  },
  {
    slug: "wvima",
    title: "Rain",
    glyph: "🌧️",
    summary:
      "Rain symbolizes emotional cleansing, washing away past sorrow, fertility, and renewal.",
    meaning:
      "Rain falling from the heavens softens hard soil and allows seeds to sprout. In dream symbolism, rain represents the release of accumulated emotional tears, the gentle purification of regrets, and the blessing of fertility on dry endeavors. Warm summer rain brings joy; cold driving sleet reflects melancholy.",
    variants: [
      {
        when: "A warm, gentle, refreshing summer rain",
        means:
          "Emotional relief, washing away old fatigue, and nourishing new creative and romantic shoots.",
      },
      {
        when: "A cold, heavy downpour with wind",
        means:
          "Gloom, feeling emotionally isolated, or weathering a difficult seasonal challenge with patience.",
      },
      {
        when: "Walking in the rain without an umbrella and enjoying it",
        means:
          "Total emotional openness, shedding rigid defenses, and welcoming natural feelings without shame.",
      },
      {
        when: "Hearing the soothing sound of rain against the window",
        means:
          "Domestic comfort, peaceful safety from external storms, and contemplative quiet reflection.",
      },
      {
        when: "A rainbow appearing after heavy rain",
        means:
          "A spectacular omen of hope, reconciliation, and bright blessings following a period of trial.",
      },
    ],
    positive:
      "Gentle rain washes away grief and revives your spirit with fertile energy and fresh hope.",
    caution:
      "Freezing downpours suggest you need warmer emotional shelter and caring companionship during a cold spell.",
    related: ["wyali", "tovli", "zgva"],
  },
  {
    slug: "tovli",
    title: "Snow",
    glyph: "❄️",
    summary:
      "Snow represents emotional stillness, pure beginnings, cooling of passions, and hidden incubation.",
    meaning:
      "Snow blankets the earth in pure white silence. It covers blemishes and quiets noise, symbolizing emotional cooling, solitude, and purity. Snow can mean that hot conflicts are cooling down, or conversely, that emotional coldness and detachment have crept into a relationship.",
    variants: [
      {
        when: "A sparkling, pristine white snow cover",
        means:
          "A pure slate, mental clarity, tranquility, and starting afresh without the baggage of past errors.",
      },
      {
        when: "A howling blizzard or snowstorm",
        means:
          "Emotional disorientation, feeling chilled out of a social circle, or struggling against harsh coldness.",
      },
      {
        when: "Melting snow revealing green grass underneath",
        means:
          "The thawing of frozen relationships, renewal of warmth, and the arrival of an emotional spring.",
      },
      {
        when: "Playing joyfully in the snow or making a snowman",
        means:
          "Playful lightheartedness, reconnecting with innocent childhood joys, and creative leisure.",
      },
      {
        when: "Dirty, slushy, gray snow",
        means:
          "Disillusionment, lingering emotional residue from an old disappointment that has lost its dignity.",
      },
    ],
    positive:
      "Clean, glittering snow brings mental peace, pristine fresh starts, and soothing cooling of tempers.",
    caution:
      "A bitter blizzard warns against emotional coldness and freezing out people who genuinely care for you.",
    related: ["wvima", "wyali", "sarke"],
  },
  {
    slug: "tma",
    title: "Hair",
    glyph: "💇",
    summary:
      "Hair embodies personal vitality, beauty, feminine/masculine power, and thought patterns.",
    meaning:
      "From ancient myths of Samson to folklore, hair is the physical manifestation of thought and life force. Long, lustrous hair signals vibrant health, attractiveness, and magnetic presence; cutting or losing hair represents shedding burdens, or conversely, losing power and confidence.",
    variants: [
      {
        when: "Long, thick, shining, healthy hair",
        means:
          "Peak physical vitality, magnetic charisma, abundant creative energy, and rising personal influence.",
      },
      {
        when: "Cutting your own hair drastically",
        means:
          "Desire for a radical fresh start, casting off old identities, and severing ties with an outdated phase.",
      },
      {
        when: "Hair falling out in clumps or going bald",
        means:
          "Deep fear of losing influence, vitality, or attractiveness; acute stress taking a toll on self-esteem.",
      },
      {
        when: "Combing and braiding tangled hair smoothly",
        means:
          "Untangling complicated thoughts, restoring order to chaotic affairs, and finding elegant solutions.",
      },
      {
        when: "Dyeing hair an unexpected bold color",
        means:
          "A craving for self-expression, rebelling against grey expectations, and stepping into the spotlight.",
      },
    ],
    positive:
      "Lustrous, healthy hair reflects blossoming energy, proud self-expression, and attractive charisma.",
    caution:
      "Losing hair alerts you to severe stress and self-doubt that require immediate grounding and self-compassion.",
    related: ["kbili", "sarke", "sisxli"],
  },
  {
    slug: "sarke",
    title: "Mirror",
    glyph: "🪞",
    summary:
      "A mirror is the instrument of self-reflection, honest self-evaluation, illusion, and truth.",
    meaning:
      "Looking into a mirror in a dream confronts you with how you truly perceive yourself beneath social masks. A clear reflection brings self-acceptance and honest insight; a distorted or cracked mirror warns of self-deception, fragmented identity, or fear of seeing who you have become.",
    variants: [
      {
        when: "Looking into a mirror and seeing yourself clear and radiant",
        means:
          "Deep self-acceptance, harmony between inner truth and outer persona, and unshakeable confidence.",
      },
      {
        when: "A cracked or shattering mirror",
        means:
          "Broken illusions, a painful clash with reality, or shattering a false persona that no longer works.",
      },
      {
        when: "Seeing a stranger or monster in the mirror",
        means:
          "Confronting your shadow self — unacknowledged traits, suppressed impulses, or feeling alienated from yourself.",
      },
      {
        when: "A foggy mirror you try to wipe clean",
        means:
          "Seeking clarity about your identity or intentions; cutting through confusion to find the truth.",
      },
      {
        when: "Looking in a mirror with no reflection at all",
        means:
          "Feeling invisible, unrecognized by your peers, or disconnected from your authentic core desires.",
      },
    ],
    positive:
      "A bright, true reflection signifies profound self-awareness, authentic living, and inner harmony.",
    caution:
      "A broken mirror asks you to abandon harmful illusions and rebuild your self-image on genuine reality.",
    related: ["tma", "kbili", "saxli"],
  },
  {
    slug: "kibe",
    title: "Stairs or Ladder",
    glyph: "🪜",
    summary:
      "Stairs represent social climbing, career advancement, spiritual ascension, or descending into the subconscious.",
    meaning:
      "Staircases and ladders mark vertical movement in life. Climbing upward signifies ambition, spiritual growth, rising status, and conquering obstacles; descending leads downward into private introspection, the subconscious, or a decline in energy. Missing steps test your footing.",
    variants: [
      {
        when: "Climbing stairs easily to the top landing",
        means:
          "Career promotion, achieving a cherished ambition, expanding mastery, and elevated social standing.",
      },
      {
        when: "Descending stairs into a basement or dark level",
        means:
          "Introspective exploration, uncovering buried memories, or stepping back to recharge in quiet privacy.",
      },
      {
        when: "Stairs with broken or missing steps",
        means:
          "Unexpected obstacles in your career progression; a reminder to proceed with caution and steady footing.",
      },
      {
        when: "An endless spiral staircase going nowhere",
        means:
          "Feeling trapped in repetitive loops; expending vast energy without making meaningful forward progress.",
      },
      {
        when: "Falling down the stairs",
        means:
          "A sudden loss of status, reckless haste causing a setback, or overreaching beyond your current foundation.",
      },
    ],
    positive:
      "Steadily climbing upward foretells career achievement, mastery, and reaching higher spheres of influence.",
    caution:
      "Broken steps warn you against taking reckless shortcuts: build each step solidly before advancing.",
    related: ["dacema", "saxli", "kari"],
  },
  {
    slug: "dzagli",
    title: "Dog",
    glyph: "🐕",
    summary:
      "The dog is the archetype of loyalty, friendship, instinctual protection, and unconditional devotion.",
    meaning:
      "Man's best friend in dreams represents your trusted friends, loyal allies, and your own faithful instincts. A friendly, affectionate dog reflects reliable support and devoted relationships; an aggressive or barking dog warns of betrayal, disputes among friends, or your own unmanaged defensive aggression.",
    variants: [
      {
        when: "A friendly dog wagging its tail and playing",
        means:
          "Warm, dependable friendships, sincere loyalty from companions, and feeling emotionally safeguarded.",
      },
      {
        when: "A ferocious dog barking and attacking",
        means:
          "Conflict with an ally, sensing betrayal from an inner circle member, or being attacked by malicious gossip.",
      },
      {
        when: "A white dog approaching peacefully",
        means:
          "A pure, noble friendship entering your life, bringing sincere goodwill and reliable partnership.",
      },
      {
        when: "A wounded, lost, or starving dog",
        means:
          "Neglecting a loyal friend in need, or neglecting your own instinctual need for loyalty and warmth.",
      },
      {
        when: "A dog biting your hand",
        means:
          "Ingratitude from someone you helped; having your generosity repaid with hostility or deceit.",
      },
    ],
    positive:
      "A loving, devoted dog confirms that you are surrounded by faithful allies who stand by you through trials.",
    caution:
      "An aggressive dog warns you to examine your social circle for envy, hostility, or broken trust.",
    related: ["kata", "cxeni", "devna"],
  },
  {
    slug: "kata",
    title: "Cat",
    glyph: "🐈",
    summary:
      "The cat symbolizes sharp intuition, independence, mysterious feminine grace, and subtle boundaries.",
    meaning:
      "Cats walk by themselves. In dreams, they embody autonomous intuition, subtle cunning, sensuality, and fierce boundary-setting. A sleek, affectionate cat represents intuitive grace and comfort; a hissing or scratching cat warns of duplicity, hidden rivalry, or someone encroaching on your space.",
    variants: [
      {
        when: "A purring, gentle cat rubbing against you",
        means:
          "Comfort, intuitive ease, enjoying private pleasures, and harmonious domestic sensuality.",
      },
      {
        when: "A cat hissing, scratching, or attacking",
        means:
          "Encountering deceptive flattery, subtle feminine rivalry, or fierce boundary clashes with independent personalities.",
      },
      {
        when: "A black cat crossing your path gracefully",
        means:
          "A prompt to trust your sharpest mystical intuition rather than conforming to conventional expectations.",
      },
      {
        when: "A white or golden cat",
        means:
          "Subtle spiritual protection, gentle wisdom, and discovering peace through quiet independence.",
      },
      {
        when: "Rescuing a stranded kitten",
        means:
          "Protecting a delicate, emerging intuitive talent, or showing compassionate care to a vulnerable soul.",
      },
    ],
    positive:
      "A serene cat sharpens your sixth sense, independent sovereignty, and refined aesthetic appreciation.",
    caution:
      "A scratching cat warns against superficial flatterers who hide sharp claws beneath smooth words.",
    related: ["dzagli", "tagvi", "gveli"],
  },
  {
    slug: "cxeni",
    title: "Horse",
    glyph: "🐎",
    summary:
      "The horse embodies majestic power, noble freedom, untamed passion, and swift progress.",
    meaning:
      "The horse is an ancient symbol of dynamic strength, noble speed, and the drive to conquer vast distances. Riding a powerful, obedient horse signals full mastery over your passions and rapid career momentum; an unbridled, wild horse warns of untamed impulses running away with reason.",
    variants: [
      {
        when: "Riding a magnificent white horse swiftly",
        means:
          "Glorious success, noble triumph over adversity, spiritual purity, and rapid elevation in status.",
      },
      {
        when: "A wild black horse galloping furiously",
        means:
          "Fierce, untamed passions, rebellious energy, or harnessing powerful primal forces for ambitious goals.",
      },
      {
        when: "Falling off a bucking horse",
        means:
          "A sudden loss of control over a fast-moving enterprise; a warning that pride outran preparation.",
      },
      {
        when: "A winged horse (Pegasus) soaring skyward",
        means:
          "Supreme creative inspiration, poetical genius, and transcending ordinary human limitations.",
      },
      {
        when: "Feeding or grooming a gentle horse",
        means:
          "Tending to your physical strength, building trust with powerful allies, and pacing your energy wisely.",
      },
    ],
    positive:
      "Riding with poise indicates noble leadership, triumphant breakthroughs, and swift mastery over goals.",
    caution:
      "A runaway horse warns that untamed tempers or reckless haste could derail an otherwise brilliant journey.",
    related: ["frena", "gza", "dzagli"],
  },
  {
    slug: "tagvi",
    title: "Mouse or Rat",
    glyph: "🐁",
    summary:
      "Mice represent small nagging anxieties, covert nibbling on resources, petty irritations, and survival instinct.",
    meaning:
      "Mice in dreams point to small, persistent worries that quietly erode your peace of mind. They symbolize petty thefts of time, minor betrayals, or nagging feelings of inadequacy. Catching or banishing them indicates reclaiming authority over your space and eliminating petty distractions.",
    variants: [
      {
        when: "A small gray mouse scurrying across the floor",
        means:
          "Minor domestic irritations, petty anxieties, or feeling that trivial details are chipping away at your focus.",
      },
      {
        when: "Catching or trapping a mouse successfully",
        means:
          "Solving a pesky, nagging problem; catching a minor nuisance before it can grow into a major headache.",
      },
      {
        when: "A large, aggressive rat biting or cornering you",
        means:
          "Encountering covert malice, deceit, or someone acting with unprincipled greed in your professional circle.",
      },
      {
        when: "Mice nibbling through food or clothes",
        means:
          "Gradual, unnoticed leakage of finances or energy due to carelessness or unchecked minor habits.",
      },
      {
        when: "A pet white mouse in a cage",
        means:
          "Taming small fears, developing resourcefulness, and finding ingenious survival tactics in lean times.",
      },
    ],
    positive:
      "Eliminating mice brings immediate mental relief, clean order, and pluging leaks in your energy and finances.",
    caution:
      "Infestations of mice warn that ignoring small grievances will eventually cause structural damage.",
    related: ["kata", "gveli", "oboba"],
  },
  {
    slug: "oboba",
    title: "Spider",
    glyph: "🕷️",
    summary:
      "The spider weaves destiny — symbolizing meticulous patience, intricate webs, entrapment, and creative craft.",
    meaning:
      "Spiders are master weavers. In dream symbolism, they represent weaving your destiny through patience, craft, and strategy. However, spiderwebs also symbolize traps, manipulation, and feeling entangled in toxic webs of intrigue spun by overbearing personalities.",
    variants: [
      {
        when: "A spider patiently spinning a symmetrical web",
        means:
          "Meticulous craftsmanship, building a prosperous enterprise through patience, and strategic planning.",
      },
      {
        when: "Getting tangled in a sticky spiderweb",
        means:
          "Feeling trapped in a complex web of deceit, bureaucratic red tape, or a manipulative relationship.",
      },
      {
        when: "A giant black spider attacking",
        means:
          "Confronting a suffocating, domineering figure (often an overbearing maternal presence) or deep shadow fear.",
      },
      {
        when: "Killing or clearing away a spiderweb",
        means:
          "Breaking free from manipulation, cutting through toxic entanglements, and asserting your freedom.",
      },
      {
        when: "A small golden or white spider climbing up your arm",
        means:
          "An ancient omen of good fortune, financial luck, and sudden lucrative opportunities weaving into your life.",
      },
    ],
    positive:
      "A spider quietly weaving its web affirms that diligent patience and strategic craft will yield rich rewards.",
    caution:
      "Sticky webs warn you to stay alert against manipulative people attempting to entrap you in guilt or obligation.",
    related: ["futkari", "gveli", "tagvi"],
  },
  {
    slug: "futkari",
    title: "Bee",
    glyph: "🐝",
    summary:
      "Bees embody tireless industriousness, sweet prosperity, community harmony, and team success.",
    meaning:
      "Bees are revered across civilizations as emblems of productive work, social cohesion, and the sweet honey of success. Dreaming of humming bees signals fruitful teamwork, flourishing business, and the sweet rewards of disciplined effort. Bee stings bring sudden wake-up calls.",
    variants: [
      {
        when: "A swarm of bees buzzing in an active hive",
        means:
          "Flourishing enterprise, prosperous cooperation, harmonious teamwork, and bountiful financial harvest.",
      },
      {
        when: "Being stung by a bee",
        means:
          "A sharp, stinging criticism or wake-up call that hurts your ego, but carries a valuable grain of truth.",
      },
      {
        when: "Eating sweet, golden honeycomb",
        means:
          "Tasting the rich, sweet rewards of long and honest labor; supreme domestic contentment and health.",
      },
      {
        when: "A bee buzzing peacefully among flowers",
        means:
          "Gathering the finest ideas and inspiration from diverse sources to create something of lasting sweetness.",
      },
      {
        when: "Killing a bee or destroying a hive",
        means:
          "Damaging a fruitful collective partnership through impatience, arrogance, or thoughtless destruction.",
      },
    ],
    positive:
      "Bees bring abundant prosperity, sweet rewards for hard work, and harmonious team accomplishment.",
    caution:
      "Bee stings advise you to listen carefully to constructive criticism rather than reacting with defensive pride.",
    related: ["yvavilebi", "puri", "oboba"],
  },
  {
    slug: "yvavilebi",
    title: "Flowers",
    glyph: "🌸",
    summary:
      "Flowers reflect blossoming feelings, ephemeral beauty, romantic affection, and spiritual blooming.",
    meaning:
      "Flowers are nature's supreme expression of beauty and fragrance. In the language of dreams, fresh blooming flowers represent the blossoming of love, creative inspiration, joy, and the celebration of life. Wilted or dried flowers mourn the passing of an emotion or missed opportunities.",
    variants: [
      {
        when: "Fresh, colorful, fragrant flowers in a garden",
        means:
          "Blossoming romantic joy, creative vitality, happiness in relationships, and inner spiritual refinement.",
      },
      {
        when: "Receiving a gorgeous bouquet from someone",
        means:
          "Sincere admiration, romantic courtship, deep appreciation, and honoring your unique beauty.",
      },
      {
        when: "Wilted, dried, or dying flowers",
        means:
          "Fading affection, sadness over a passing chapter, or neglecting a relationship until its bloom has faded.",
      },
      {
        when: "Picking wildflowers in an open meadow",
        means:
          "Carefree spontaneity, innocent pleasures, and enjoying simple everyday joys without pretension.",
      },
      {
        when: "Pricking your finger on flower thorns (roses)",
        means:
          "The painful price of passionate love; discovering that deep intimacy requires vulnerability and resilience.",
      },
    ],
    positive:
      "Vibrant blooming flowers promise heartfelt love, creative awakening, and radiant domestic joy.",
    caution:
      "Withered petals remind you to water and nourish your personal relationships before they dry up.",
    related: ["futkari", "puri", "qorwili"],
  },
  {
    slug: "puri",
    title: "Bread",
    glyph: "🍞",
    summary:
      "Bread is the foundational staple of life — symbolizing essential nourishment, honest sustenance, and hospitality.",
    meaning:
      "Bread represents life's fundamental sustenance, earned through honest toil and shared with love. Warm, fragrant, freshly baked bread foretells security, hospitable fellowship, and abundant provision. Stale or moldy bread points to neglected needs or taking blessings for granted.",
    variants: [
      {
        when: "Baking or slicing warm, fresh, fragrant bread",
        means:
          "Abundant sustenance, peaceful domestic security, and enjoying the wholesome fruits of honest effort.",
      },
      {
        when: "Sharing bread with loved ones or strangers",
        means:
          "True hospitality, deep fellowship, noble generosity, and forming bonds of enduring loyalty.",
      },
      {
        when: "Eating dry, hard, stale, or moldy bread",
        means:
          "Experiencing emotional or material scarcity, living on memories, or settling for less than you deserve.",
      },
      {
        when: "Kneading rich dough with your hands",
        means:
          "Preparing the foundation for future prosperity; patient labor that is about to yield generous nourishment.",
      },
      {
        when: "Dropping or wasting bread on the floor",
        means:
          "Ingratitude, taking security for granted, or careless wastefulness with your hard-earned resources.",
      },
    ],
    positive:
      "Fresh, warm bread promises dependable security, domestic peace, and honest, fulfilling prosperity.",
    caution:
      "Stale bread warns against settling for meager emotional crumbs when you are capable of baking fresh abundance.",
    related: ["dzroxa", "saxli", "futkari"],
  },
  {
    slug: "eklesia",
    title: "Church",
    glyph: "⛪",
    summary:
      "A church represents sacred refuge, moral conscience, spiritual repentance, and seeking higher meaning.",
    meaning:
      "Entering a church or sanctuary in a dream points to an inner quest for peace, moral orientation, and forgiveness. It reflects a need to step away from mundane chaos to consult your conscience, heal spiritual wounds, and seek blessings for major crossroads in your life.",
    variants: [
      {
        when: "Praying peacefully inside a serene, sunlit church",
        means:
          "Spiritual tranquility, finding relief from heavy burdens, and aligning with your highest moral values.",
      },
      {
        when: "Lighting a candle before an icon",
        means:
          "Sincere hope, sending heartfelt blessings to loved ones, and seeking divine guidance in dark times.",
      },
      {
        when: "A ruined, dark, or abandoned church",
        means:
          "Spiritual crisis, loss of faith in old dogmas, or feeling that your moral compass has been compromised.",
      },
      {
        when: "Hearing solemn, beautiful church bells ringing",
        means:
          "Important spiritual awakenings, joyful tidings, or a solemn call to pay attention to your life direction.",
      },
      {
        when: "Standing outside the church unable to enter",
        means:
          "Inner feelings of unworthiness, guilt, or feeling estranged from your spiritual and cultural roots.",
      },
    ],
    positive:
      "A luminous sanctuary brings forgiveness, deep inner serenity, and moral clarity to troubled thoughts.",
    caution:
      "A dark or ruined shrine urges you to rebuild your personal ethics and find authentic spiritual grounding.",
    related: ["micvalebuli", "tirili", "qorwili"],
  },
  {
    slug: "tirili",
    title: "Crying",
    glyph: "😭",
    summary:
      "Crying in a dream is profound emotional catharsis — releasing suppressed grief and making space for joy.",
    meaning:
      "Weeping in dreams is a classic paradoxical symbol. In folklore and psychology alike, shedding bitter tears while asleep often brings immense relief and joyful laughter upon waking. It is the psyche's natural pressure-release valve, washing away pent-up sorrow and stress.",
    variants: [
      {
        when: "Weeping bitterly and sobbing uncontrollably in a dream",
        means:
          "Powerful emotional catharsis; releasing deep-seated grief and clearing the way for joyful relief in waking life.",
      },
      {
        when: "Tears of pure joy, gratitude, and awe",
        means:
          "Touching supreme fulfillment, deep gratitude for blessings, and heartfelt reconciliation with loved ones.",
      },
      {
        when: "Seeing someone you care for weeping inconsolably",
        means:
          "Sensing their unspoken pain; an invitation to offer gentle comfort and compassionate listening.",
      },
      {
        when: "Wanting to cry but unable to shed a tear",
        means:
          "Dangerous emotional numbness and suppression; a sign to allow yourself to feel and process pain safely.",
      },
      {
        when: "Waking up with real tears on your cheeks",
        means:
          "A profound subconscious breakthrough that has completely cleansed an old emotional wound.",
      },
    ],
    positive:
      "Crying in dreams clears emotional blockages and heralds genuine peace, laughter, and renewed lightness.",
    caution:
      "Emotional numbness or dry sobbing signals that you are holding back feelings that need compassionate release.",
    related: ["wyali", "micvalebuli", "bavshvi"],
  },
  {
    slug: "bechedi",
    title: "Ring",
    glyph: "💍",
    summary:
      "A ring embodies eternity, sacred vows, mutual loyalty, whole completion, and binding commitments.",
    meaning:
      "The unbroken circle of a ring is the supreme symbol of eternal commitment, completeness, and covenant. Receiving or wearing a ring points to marriage, business contracts, unbreakable bonds of trust, and discovering your integrated wholeness. A lost or broken ring warns of severed ties.",
    variants: [
      {
        when: "Receiving a sparkling golden ring as a proposal or gift",
        means:
          "A sacred vow of love, entering a faithful partnership, and taking on a noble, joyful lifelong commitment.",
      },
      {
        when: "A cracked, bent, or broken ring on your finger",
        means:
          "Cracks in a relationship, broken promises, or realizing an agreement has lost its sacred integrity.",
      },
      {
        when: "Losing a precious ring and searching frantically",
        means:
          "Fear of losing a partner's trust, forgetting a solemn pledge, or drifting apart from a key commitment.",
      },
      {
        when: "Putting a ring on someone else's finger",
        means:
          "Offering unconditional loyalty, sealing a covenant, and taking responsibility for mutual happiness.",
      },
      {
        when: "A ring with a brilliant diamond or precious gemstone",
        means:
          "Prestigious status, extraordinary durability of character, and rare, multifaceted brilliance in your work.",
      },
    ],
    positive:
      "Wearing a glowing, intact ring symbolizes sacred loyalty, enduring love, and fulfilled wholeness.",
    caution:
      "A broken or slipping ring warns that an essential relationship requires immediate care and honest dialogue.",
    related: ["qorwili", "oqro", "fuli"],
  },
  {
    slug: "dzroxa",
    title: "Cow",
    glyph: "🐄",
    summary:
      "The cow represents maternal abundance, gentle nourishment, patient fertility, and generous provision.",
    meaning:
      "The cow is the ancient universal mother of sustenance. In dream symbolism, healthy, plump cows grazing in green pastures foretell years of peaceful plenty, fruitful harvest, and warm family security; lean or aggressive cows warn of lean seasons that require prudent budgeting.",
    variants: [
      {
        when: "Plump, healthy, gentle cows grazing on lush green meadows",
        means:
          "Years of rich abundance, fruitful investments, peaceful family contentment, and secure sustenance.",
      },
      {
        when: "Milking a placid cow and getting rich, frothy milk",
        means:
          "Directly harvesting the rewards of long patience; financial prosperity and abundant nourishment.",
      },
      {
        when: "Skinny, starving, or sick cows in a barren field",
        means:
          "An upcoming lean cycle; an urgent reminder to economize, save resources, and prepare for dry spells.",
      },
      {
        when: "An aggressive cow chasing or butting you",
        means:
          "Clashing with maternal authority or dealing with an overbearing figure who controls essential resources.",
      },
      {
        when: "A gentle cow with its playful calf",
        means:
          "Tender motherly love, flourishing generational prosperity, and loving protection over the young.",
      },
    ],
    positive:
      "Placid, well-fed cows promise rich material security, generous nourishment, and tranquil prosperity.",
    caution:
      "Lean cattle serve as an ancient warning to guard your savings and avoid wasteful extravagance in the near term.",
    related: ["puri", "bavshvi", "wyali"],
  },
];

export const DREAM_BY_SLUG_EN: Record<string, DreamSymbolEn> = Object.fromEntries(
  DREAM_SYMBOLS_EN.map((d) => [d.slug, d])
);

export const DREAM_EN_BY_SLUG = DREAM_BY_SLUG_EN;
