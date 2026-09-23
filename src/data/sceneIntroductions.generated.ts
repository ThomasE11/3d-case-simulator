/**
 * sceneIntroductions.generated.ts
 *
 * GENERATED — do not hand-edit. Produced by `scripts/generate-scene-intros.mjs`
 * (local Ollama model), normalised by `scripts/normalise-scene-intros.mjs`,
 * then reviewed. Keyed by case id, merged additively at render time.
 * Re-run the script to regenerate; it overwrites this file.
 */

import type { SceneIntroduction } from '@/lib/sceneIntroductions';

export const SCENE_INTRODUCTIONS: Record<string, SceneIntroduction> = {
  "trauma-002": {
    "arrivalNarrative": "I step onto the uneven ground where a young man lies supine, blood staining his face and hair. Dust hangs heavy in the air as the site supervisor shouts to keep machinery at bay while I scan the perimeter for falling steel. The heat radiates off the concrete even through my turnout coat.",
    "sensoryCues": {
      "sounds": [
        "idle diesel engines",
        "clank of loose scaffolding metal",
        "shouting from the site supervisor"
      ],
      "smells": [
        "concrete dust and diesel fuel",
        "hot sweat on skin"
      ],
      "temperature": "scorching afternoon heat radiating off the concrete",
      "light": "harsh overhead sun casting deep shadows under scaffolding",
      "air": "still, dusty, hot exhaust-stained air"
    },
    "accessExtrication": {
      "accessIssues": [
        "uneven ground",
        "active heavy machinery nearby",
        "construction debris blocking immediate approach"
      ],
      "extricationNeeded": true,
      "note": "Primary hazard is unstable scaffolding and passing trucks."
    },
    "bystanderDetail": "Coworkers stand in a loose semi-circle keeping clear of the equipment but whispering to each other about the fall."
  },
  "trauma-001": {
    "arrivalNarrative": "The asphalt burns my boots as I step off the ambulance onto Sheikh Zayed Road, the heat radiating off the sun-baked surface. A motorcycle lies tilted near a damaged car at an intersection, surrounded by several bystanders and approaching police units. Fuel fumes hang heavy in the hot afternoon air while broken glass glints dangerously on the tarmac near the rider’s unconscious form.",
    "sensoryCues": {
      "sounds": [
        "distant traffic rumble from multiple lanes",
        "idling petrol engine coughing and cooling",
        "sirens wailing in the distance from approaching police"
      ],
      "smells": [
        "sharp fuel leak fumes",
        "hot asphalt and burnt rubber"
      ],
      "temperature": "scorching midday heat radiating from the asphalt",
      "light": "harsh afternoon sun casting sharp shadows on the road",
      "air": "stagnant, hot exhaust-laden air"
    },
    "accessExtrication": {
      "accessIssues": [
        "traffic congestion limiting vehicle positioning",
        "risk of fire from fuel leak near the patient",
        "unstable motorcycle frame blocking approach"
      ],
      "extricationNeeded": true,
      "note": "We must secure the scene before approaching."
    },
    "bystanderDetail": "Several locals are standing near the vehicle, having already lifted the victim's helmet and watching him closely while police units arrive."
  },
  "y1-001": {
    "arrivalNarrative": "I step through the doorway into the cool, air-conditioned living room where the morning light is soft and quiet. The daughter stands anxiously near me, her voice trembling as she explains how her mother fell onto the carpet while using the toilet. There is a rug just beside her and clutter scattered across the pathway leading into the hallway. The patient sits quietly on the carpet, alert but unable to rise due to hip pain.",
    "sensoryCues": {
      "sounds": [
        "low hum of the air conditioner",
        "ticking clock from the wall",
        "daughter speaking nervously",
        "distant street traffic through open window"
      ],
      "smells": [
        "faint scent of old carpet and cooling system filters"
      ],
      "temperature": "Cool air circulating despite the warm outside heat",
      "light": "Soft morning light filtering through sheer curtains",
      "air": "Still, recycled AC air, slightly dusty"
    },
    "accessExtrication": {
      "accessIssues": [
        "cluttered pathway",
        "rug beside patient",
        "limited space"
      ],
      "extricationNeeded": false,
      "note": "I will need to clear the rug before we can safely move her."
    },
    "bystanderDetail": "She grips my arm tightly and looks at me for instructions on how to help her mother without hurting her legs. Her breathing is rapid as she waits beside us, refusing to leave the room."
  },
  "trauma-012": {
    "arrivalNarrative": "I step onto the wet concrete deck where a four-year-old girl lies pale and cold on a towel. The afternoon sun is harsh overhead, illuminating the still water and the worried faces of her parents standing nearby. A lifeguard stands ready with rescue equipment while the hum of the pool pump mixes with distant traffic noise.",
    "sensoryCues": {
      "sounds": [
        "water lapping against the pool edge",
        "pool filter pump humming steadily",
        "distant traffic rumble"
      ],
      "smells": [
        "strong chlorine scent from the water"
      ],
      "temperature": "scorching afternoon heat radiating off the pool deck",
      "light": "harsh direct sunlight casting deep shadows near the ladder",
      "air": "still and humid air heavy with chlorine"
    },
    "accessExtrication": {
      "accessIssues": [
        "wet surface slip hazard"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "Parents are huddled over the child weeping quietly while the lifeguard holds a rescue tube at their side."
  },
  "resp-001": {
    "arrivalNarrative": "I step into the villa living room where the evening light filters through the windows, finding the patient seated upright on the sofa in a tripod position. His breathing is harsh and laboured as I approach, surrounded by multiple inhalers and a peak flow meter resting on the nearby table. The parents are present but do not intervene directly while he remains unable to speak in sentences.",
    "sensoryCues": {
      "sounds": [
        "heavy wheezing from the patient",
        "low hum of air conditioning",
        "distant evening traffic"
      ],
      "smells": [
        "faint scent of dust from the cleaning",
        "sharp medicinal spray from the inhalers"
      ],
      "temperature": "warm evening air inside the villa",
      "light": "dimming natural light casting soft shadows across the room",
      "air": "dry, still air with traces of dust"
    },
    "accessExtrication": {
      "accessIssues": [
        "limited working space"
      ],
      "extricationNeeded": false,
      "note": "Patient is seated upright on a sofa; no physical removal required."
    },
    "bystanderDetail": "The parents hover nearby without stepping forward, their bodies tense with concern as they watch his chest rise and fall. They stand close but do not touch the patient or speak to him directly."
  },
  "trauma-003": {
    "arrivalNarrative": "I step onto the pavement and see a young man sitting on the ground holding his chest. Police officers are managing the perimeter while I assess the bleeding wound near the traffic lane. The air is thick with exhaust fumes and the evening hum of Deira traffic passes nearby.",
    "sensoryCues": {
      "sounds": [
        "Traffic rumble from passing cars",
        "Police radios crackling",
        "Shouting voices at a distance"
      ],
      "smells": [
        "Metallic scent of blood",
        "Exhaust fumes from idling vehicles"
      ],
      "temperature": "Warm air radiating off the heated asphalt",
      "light": "Fading daylight with streetlights beginning to cast shadows",
      "air": "Still, hot, exhaust-stained air"
    },
    "accessExtrication": {
      "accessIssues": [
        "Broken glass and debris on pavement near the wound",
        "Passing traffic creating a safety hazard"
      ],
      "extricationNeeded": false,
      "note": "Patient is accessible but requires careful navigation around debris."
    },
    "bystanderDetail": "Police officers stand ready to secure the scene and assist with patient safety without interfering with my primary assessment."
  },
  "trauma-004": {
    "arrivalNarrative": "I step onto the ground and see a young man lying supine under the dim glow of distant street lamps. The air feels heavy, and I notice blood visible on his chest where one bystander is already applying pressure. Multiple people stand nearby, but I can’t confirm their exact positions amidst the poor lighting.",
    "sensoryCues": {
      "sounds": [
        "distant traffic rumble",
        "crowd murmurs",
        "rustling dry leaves"
      ],
      "smells": [
        "metallic tang of blood",
        "humid evening air"
      ],
      "temperature": "warm, humid breeze",
      "light": "dim street lamps casting deep shadows",
      "air": "still, urban night air"
    },
    "accessExtrication": {
      "accessIssues": [
        "broken glass scattered on the ground",
        "crowd density limiting movement"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The person pressing on the wound keeps their hand steady but looks frantic, while others hover nearby without speaking."
  },
  "trauma-005": {
    "arrivalNarrative": "I step onto the roadside asphalt where a vehicle lies with significant front-end damage under harsh afternoon sun. The driver remains pinned by the steering wheel inside the cabin as I note the fuel vapour and exhaust fumes hanging in the heat. Glass and debris litter the area around the unstable wreckage while I assess the immediate dangers of the fuel leak.",
    "sensoryCues": {
      "sounds": [
        "traffic rumble",
        "idling emergency engines"
      ],
      "smells": [
        "fuel vapour",
        "hot asphalt",
        "exhaust fumes"
      ],
      "temperature": "intense heat radiating off the asphalt",
      "light": "harsh afternoon sun, deep shadows",
      "air": "still, hot, exhaust-stained air"
    },
    "accessExtrication": {
      "accessIssues": [
        "unstable vehicle",
        "fuel leak hazard",
        "glass and debris"
      ],
      "extricationNeeded": true,
      "note": "Driver pinned by the steering wheel requires immediate extrication."
    },
    "bystanderDetail": "Police secure the perimeter while fire personnel assess for ignition risks nearby."
  },
  "trauma-006": {
    "arrivalNarrative": "I step into the nightclub where loud music drowns out chatter and flashing lights blind me momentarily. Security staff shout instructions amidst a crowd of casualties and panicked bystanders huddled on the floor. The air feels heavy with tension and the heat from the crowded room. I scan for threats before moving toward the man in distress.",
    "sensoryCues": {
      "sounds": [
        "loud bass thumping",
        "shouting security staff",
        "panicked breathing"
      ],
      "smells": [],
      "temperature": "Warm air radiating off the crowd",
      "light": "Strobe lights casting deep shadows on the floor",
      "air": "Humid, still air inside the enclosure"
    },
    "accessExtrication": {
      "accessIssues": [
        "Active shooter scene unsafe",
        "Panic crowd blocking movement"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "Bystanders stand in small groups looking to security for direction while others tend to fallen friends."
  },
  "trauma-007": {
    "arrivalNarrative": "I step onto the roadside pavement where the afternoon heat radiates off the asphalt. The air carries the sharp scent of fuel and burnt rubber from the front-end damage on Al Khail Road. Police officers are managing traffic around the wreckage while I approach the vehicle where fluid has spilled onto the ground.",
    "sensoryCues": {
      "sounds": [
        "distant highway traffic rumbling",
        "police radio chatter",
        "rustling debris near the fluid spill"
      ],
      "smells": [
        "petrol fumes",
        "burnt rubber from the impact"
      ],
      "temperature": "scorching afternoon heat radiating off the asphalt",
      "light": "bright afternoon sun casting long shadows",
      "air": "still, hot air thick with exhaust fumes"
    },
    "accessExtrication": {
      "accessIssues": [
        "fluid spill on ground",
        "debris around vehicle perimeter",
        "passing traffic hazard"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "Police officers maintain a perimeter around the damaged vehicle, keeping bystanders back from the fluid spill. They communicate calmly over radio channels while monitoring traffic flow."
  },
  "trauma-008": {
    "arrivalNarrative": "I step onto the dry kerbside lane where a woman lies supine within a single overhead lamp’s pool of light. Traffic rumbles from two open lanes while the air feels warm and humid with faint exhaust fumes hanging low. She moans in pain as a small blood pool forms under her left buttock on the asphalt.",
    "sensoryCues": {
      "sounds": [
        "traffic rumble",
        "idling sedan engine",
        "patient moaning"
      ],
      "smells": [
        "faint exhaust fumes",
        "humid night air"
      ],
      "temperature": "warm and humid evening air",
      "light": "dim streetlamp pool on dark asphalt",
      "air": "still, hot, exhaust-stained air"
    },
    "accessExtrication": {
      "accessIssues": [
        "Live traffic in two open lanes",
        "Glass and vehicle debris on road",
        "Poor lighting beyond immediate lamp pool"
      ],
      "extricationNeeded": true,
      "note": "Safety priority is clearing the live traffic lane before stabilization."
    },
    "bystanderDetail": "A security guard directs traffic while six others crowd around the scene perimeter without specific positioning and a shaken driver waits nearby."
  },
  "trauma-009": {
    "arrivalNarrative": "I step onto the uneven ground of the construction site where a young man lies supine near scaffolding. Dust hangs heavy in the morning air as multiple workers and the foreman stand nearby while I scan for debris. The casualty has blood on his face and a large scalp wound over the parietal region while I begin my primary assessment. Loose materials scattered around the area present an immediate hazard to our approach.",
    "sensoryCues": {
      "sounds": [
        "distant traffic rumble",
        "wind moving through scaffolding metal",
        "workers shouting instructions"
      ],
      "smells": [
        "dry concrete dust and diesel fumes"
      ],
      "temperature": "Morning heat beginning to warm the concrete",
      "light": "Bright daylight casting long shadows from the scaffolding",
      "air": "Sticky, dust-laden air"
    },
    "accessExtrication": {
      "accessIssues": [
        "uneven ground around scaffolding base",
        "debris scattered on concrete floor",
        "construction equipment blocking immediate approach"
      ],
      "extricationNeeded": true,
      "note": "Clearing debris allows safe access to the casualty."
    },
    "bystanderDetail": "The foreman directs the workers who stand around the perimeter, none touching the patient yet while they watch the scene unfold."
  },
  "trauma-010": {
    "arrivalNarrative": "I step onto the hot sand of Jumeirah Beach, feeling the afternoon heat radiating through my boots. The patient lies supine in the shallow water where he was rescued by the lifeguards earlier. Crowds press against the perimeter, watching the rescue unfold without interfering with the scene.",
    "sensoryCues": {
      "sounds": [
        "waves lapping gently against the sand",
        "distant traffic rumble from the city roads",
        "lifeguard radio static",
        "crowd murmurs"
      ],
      "smells": [
        "salt spray from the sea",
        "strong scent of sunscreen"
      ],
      "temperature": "scorching afternoon heat radiating off the sand",
      "light": "harsh direct sunlight casting sharp shadows",
      "air": "dry, salty breeze with dust from the sand"
    },
    "accessExtrication": {
      "accessIssues": [
        "crowd pressing against the perimeter",
        "patient submerged in shallow water"
      ],
      "extricationNeeded": false,
      "note": "Crowd control is prioritised to manage access issues."
    },
    "bystanderDetail": "The lifeguards maintain a ready stance while multiple bystanders keep a distance from the water's edge. They are focused on the scene but maintain their perimeter without crowding the patient."
  },
  "resp-006": {
    "arrivalNarrative": "I step onto the dusty ground of the construction site and see a young man lying near scaffolding. Coworkers are gathered nearby, looking anxious as I approach the fallen tools scattered around him. The heat radiates off the metal structures surrounding us.",
    "sensoryCues": {
      "sounds": [
        "distant machinery hum",
        "wind rattling through scaffolding",
        "shuffled footsteps of coworkers"
      ],
      "smells": [
        "dry dust",
        "faint diesel exhaust"
      ],
      "temperature": "hottest part of the afternoon",
      "light": "bright, direct sunlight casting sharp shadows",
      "air": "still, hot air thick with dust"
    },
    "accessExtrication": {
      "accessIssues": [
        "fallen tools nearby",
        "unstable ladder present",
        "construction materials scattered"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The coworkers huddle close, speaking in low tones while watching the patient's breathing."
  },
  "trauma-011": {
    "arrivalNarrative": "I step onto the factory floor and immediately feel the vibration of heavy machinery humming around me. The smell of hot oil and ozone fills my nose while I assess the pale young man seated, holding the bleeding stump of his right forearm. A coworker is applying pressure to the wound as blood pools on the floor near the printing press area.",
    "sensoryCues": {
      "sounds": [
        "machinery humming",
        "metal clanking",
        "printing press rattle"
      ],
      "smells": [
        "hot oil and ozone",
        "sharp metallic blood scent"
      ],
      "temperature": "cool morning air",
      "light": "overhead industrial lighting",
      "air": "industrial ambient air"
    },
    "accessExtrication": {
      "accessIssues": [
        "slippery floor from blood",
        "active machinery hazard nearby"
      ],
      "extricationNeeded": false,
      "note": "Ensure printing press is powered down before approach"
    },
    "bystanderDetail": "A coworker maintains pressure on the stump while a first aider stands nearby observing the machinery. They remain attentive to the active press mechanism surrounding the patient."
  },
  "y1-010": {
    "arrivalNarrative": "I step onto the grass verge where a 14-year-old boy sits alert beside his bicycle, his left wrist visibly deformed as he guards it with both hands. The afternoon air is warm and dry, carrying the faint scent of cut grass from the park path behind him. Two friends stand nearby watching quietly while the adult caller stands just off to the side.",
    "sensoryCues": {
      "sounds": [
        "distant traffic rumble on the adjacent pathway",
        "rustle of dry grass underfoot",
        "occasional chirp of birds in the trees"
      ],
      "smells": [],
      "temperature": "warm afternoon sun radiating off the path",
      "light": "bright, direct sunlight creating sharp shadows on the grass",
      "air": "still, warm, dry air"
    },
    "accessExtrication": {
      "accessIssues": [
        "bicycle positioned on the pathway near patient"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The two friends stand close by, observing the scene with concerned stillness while trying to keep their voice down, and the caller remains just outside the immediate circle watching us."
  },
  "y1-011": {
    "arrivalNarrative": "I step through the doorway and see a 30-year-old male sitting in the driver's seat of his car, holding the back of his neck while alert and talking. The road is dry with good visibility, but broken glass lies on the tarmac from the minor rear-end collision. Another vehicle stands idle nearby as I assess the scene for further traffic hazards.",
    "sensoryCues": {
      "sounds": [
        "low-speed traffic rumble",
        "idling engines from two vehicles",
        "distant siren"
      ],
      "smells": [],
      "temperature": "cool morning air",
      "light": "clear morning daylight",
      "air": "exhaust-stained air"
    },
    "accessExtrication": {
      "accessIssues": [
        "moving traffic nearby",
        "broken glass on the road"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The other driver stands by their vehicle, appearing uninjured and quiet."
  },
  "y1-020": {
    "arrivalNarrative": "I step onto the hard astroturf pitch where warm evening air meets the hum of floodlights. A distressed seventeen-year-old male lies on his back holding a visibly deformed right lower leg, with teammates gathered nearby. The scene is marked by the immediate reality of severe pain and an obvious mid-shaft deformity to the tibia.",
    "sensoryCues": {
      "sounds": [
        "teammates murmuring around the injury",
        "gravel crunching under boot soles on astroturf",
        "distant traffic rumble from the roadside"
      ],
      "smells": [],
      "temperature": "warm evening air",
      "light": "evening floodlights casting sharp shadows across the pitch",
      "air": "still, warm, exhaust-stained"
    },
    "accessExtrication": {
      "accessIssues": [
        "hard astroturf surface poses fall hazard",
        "studs and uneven turf present slip/trip risks"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The PE teacher stands alert while teammates huddle close to the patient, their micro-behaviour focused on comfort but unable to calm his distress."
  },
  "cardiac-014": {
    "arrivalNarrative": "I step through the doorway onto the breezy pool deck to find an eight-year-old boy lying motionless on wet tiles, wrapped in hotel towels that cling to his soaked swim shorts. The air bites at my skin with a chill radiating from his pale, grey body, while the silence is broken only by the distant hum of the hotel and a hysterical mother being comforted nearby. There are no visible injuries, just the stark reality of severe hypothermia as I approach.",
    "sensoryCues": {
      "sounds": [
        "water lapping against the pool edge",
        "distant air conditioning hum from the hotel lobby",
        "hysterical weeping from the mother"
      ],
      "smells": [
        "chlorine and damp concrete",
        "cold wet fabric"
      ],
      "temperature": "chill wind with a biting cold radiating from the child's exposed skin",
      "light": "bright morning sun casting deep shadows across the wet deck",
      "air": "thin, dry, breezy air with a hint of chlorine"
    },
    "accessExtrication": {
      "accessIssues": [
        "wet pool deck presenting a slip risk"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The mother is being held back and comforted by hotel staff while two housekeeping workers stand nearby, still in their uniforms, looking on with concern."
  },
  "env-002": {
    "arrivalNarrative": "I step onto the ground where a construction worker lies unresponsive under a makeshift tarp against the scorching afternoon heat. The air is thick and still, smelling of diesel and dry dust, while his skin feels intensely hot and paradoxically dry to my touch despite the sweating he stopped hours ago. Coworkers stand nearby, their voices raised in panic as they try to calm him before he became too confused to follow commands.",
    "sensoryCues": {
      "sounds": [
        "distant generator hum",
        "metal clanking from heavy machinery",
        "raised voices of coworkers",
        "heavy breathing"
      ],
      "smells": [
        "diesel exhaust",
        "dry dust",
        "overheated metal"
      ],
      "temperature": "radiant heat radiating off the surrounding equipment and ground",
      "light": "harsh midday sun creating deep shadows under the tarp",
      "air": "still, hot, exhaust-stained air"
    },
    "accessExtrication": {
      "accessIssues": [
        "heavy machinery nearby posing immediate hazards"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "Coworkers are clustered near the patient, their micro-behaviour showing frantic attempts to shield him from the sun while one tries to maintain the airway."
  },
  "litfl-010": {
    "arrivalNarrative": "I step onto the ground floor balcony to find an elderly woman slumped over, her skin pale and grey against the cool morning air. The wind bites at my exposed skin as I note the empty glass nearby and the neighbour standing close by in the dim light. She is minimally responsive, offering no shivering despite the biting chill that has settled over the open space.",
    "sensoryCues": {
      "sounds": [
        "faint AC hum from inside the apartment",
        "distant traffic rumble from a nearby street",
        "gentle wind whistling through the balcony railing"
      ],
      "smells": [
        "cold, damp air with a faint hint of stale alcohol"
      ],
      "temperature": "biting 14°C wind cutting through my uniform",
      "light": "dim early-morning grey light filtering through the open balcony",
      "air": "thin, cold, and slightly still despite the breeze"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient found on an open balcony requiring immediate indoor transfer"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The neighbour who discovered the patient stands quietly nearby, looking visibly shaken and unsure how to assist beyond calling emergency services."
  },
  "env-001": {
    "arrivalNarrative": "I step out onto the construction site to meet a team of worried coworkers who are already gathered around the patient. The air is thick and still, radiating intense heat from the sun-baked ground after working long hours since early morning. I approach the young male who is pale, drenched in sweat, and visibly fatigued but remains alert to his surroundings.",
    "sensoryCues": {
      "sounds": [
        "distant hum of heavy construction equipment",
        "shuffling feet of clustered coworkers",
        "patient's shallow breathing"
      ],
      "smells": [
        "sharp metallic scent of concrete dust mixed with industrial exhaust"
      ],
      "temperature": "intense 42°C heat radiating from the sun",
      "light": "direct harsh afternoon sun casting deep shadows",
      "air": "still, hot, humid air"
    },
    "accessExtrication": {
      "accessIssues": [
        "construction equipment scattered nearby posing potential hazards"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The coworkers stand a respectful distance away, watching me approach with expressions of concern and fidgeting nervously as they recount how the patient started feeling unwell after lunch."
  },
  "sepsis-001": {
    "arrivalNarrative": "I step through the doorway onto the ground and see a frail, flushed elderly woman lying in bed, her breathing fast and eyes drowsy. The room feels warm with an unsettling atmosphere as carers stand nearby, visibly concerned about her sudden confusion compared to her usual alert self. A care assistant holds notes close at hand while I note the offensive smell rising from her bedside.",
    "sensoryCues": {
      "sounds": [
        "muffled traffic from a distant street",
        "quiet room with AC hum",
        "fast, shallow breathing"
      ],
      "smells": [
        "offensive catheter odour",
        "warm stale air"
      ],
      "temperature": "warm care home air",
      "light": "afternoon light filtering into the room",
      "air": "still, hot air"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient confused and drowsy"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "Care assistant stands holding notes with a concerned expression while carers remain nearby watching the patient's change in behaviour."
  },
  "general-001": {
    "arrivalNarrative": "I step through the doorway onto the office floor where a young female sits pale and slightly diaphoretic on a chair, recovering from her collapse. The air is cool and still, contrasting with the confusion of several colleagues who have gathered around us. I hear the quiet hum of the building's air conditioning and the low murmur of worried voices as she remains alert but disoriented.",
    "sensoryCues": {
      "sounds": [
        "quiet AC hum",
        "muffled traffic from distant streets",
        "low murmur of colleagues"
      ],
      "smells": [
        "clean office scents"
      ],
      "temperature": "cool, air-conditioned environment",
      "light": "bright overhead fluorescent lights with deep shadows under the chairs",
      "air": "still, recycled air"
    },
    "accessExtrication": {
      "accessIssues": [
        "crowd of bystanders blocking immediate approach"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "Several colleagues stand nearby looking concerned, some leaning against walls while others watch the patient intently."
  },
  "y1-002": {
    "arrivalNarrative": "I step through the doorway of the private office where a young male sits in a chair, clutching his right lower abdomen. The receptionist stands nearby, having called to report pain starting this morning that has now localised. Inside, the air is cool from the conditioning, yet the patient's skin appears pale and he guards his side with evident discomfort.",
    "sensoryCues": {
      "sounds": [
        "soft hum of the air conditioner",
        "muffled traffic noise",
        "patient's shallow breathing"
      ],
      "smells": [],
      "temperature": "cool, conditioned air",
      "light": "even office lighting without harsh shadows",
      "air": "still and filtered"
    },
    "accessExtrication": {
      "accessIssues": [
        "narrow doorway typical of an office"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The receptionist remains nearby but does not move to assist physically, watching me approach the patient with a concerned expression."
  },
  "y1-022": {
    "arrivalNarrative": "I step through the doorway of the air-conditioned flat to find a young woman curled tightly on the bed, clutching her abdomen while her flatmate waits nearby. The room is still and cool, but the patient looks dehydrated with pale, dry lips, reporting that she feels faint upon standing. We have identified no hazards or injuries requiring immediate extrication.",
    "sensoryCues": {
      "sounds": [
        "soft hum of air conditioning",
        "distant muffled traffic from Dubai Marina streets",
        "occasional ticking clock"
      ],
      "smells": [],
      "temperature": "cool ambient temperature from the flat's air conditioning",
      "light": "bright morning light filtering through the apartment windows",
      "air": "still, filtered indoor air"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient feels faint on standing due to dehydration"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The flatmate stands present in the room, looking concerned and attentive to the patient's condition."
  },
  "resp-002": {
    "arrivalNarrative": "Stepping onto the uneven construction ground, I am immediately struck by the heavy heat and dust of the afternoon industrial site. A young male lies supine with visible bruising over his right chest wall, appearing cyanotic and severely distressed after falling from scaffolding. His coworkers stand nearby in a cluster, watching anxiously as he gasps for air against the backdrop of idle machinery.",
    "sensoryCues": {
      "sounds": [
        "idle diesel engines rumbling",
        "distant wind whistling through steel beams",
        "patient's ragged, wet breathing"
      ],
      "smells": [
        "dry dust and hot asphalt",
        "faint diesel exhaust"
      ],
      "temperature": "intense afternoon heat radiating from the ground",
      "light": "harsh direct sunlight casting sharp shadows",
      "air": "still, hot, dusty air"
    },
    "accessExtrication": {
      "accessIssues": [
        "uneven ground surface"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "Coworkers hover at a respectful distance, their eyes fixed on the patient's chest movements while one steps forward hesitantly before stopping."
  },
  "resp-004": {
    "arrivalNarrative": "I step through the doorway onto the ground floor of the Dubai Marina hotel to find a colleague already managing the scene with a distressed 42-year-old female patient on her bed. The room is air-conditioned, yet she sits pale and tachypneic, clutching her chest after a long-haul flight from London two days ago. Her anxiety is palpable as she gasps for breath, describing sudden pleuritic pain that started this morning.",
    "sensoryCues": {
      "sounds": [
        "low AC hum",
        "muffled traffic from distant streets",
        "patient's rapid breathing"
      ],
      "smells": [],
      "temperature": "cool air-conditioned room",
      "light": "bright hotel morning light filtering through sheer curtains",
      "air": "still and filtered"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient on bed"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The colleague stands nearby, looking up with a concerned expression as they describe the patient's sudden onset of shortness of breath and chest pain."
  },
  "resp-010": {
    "arrivalNarrative": "I step through the doorway onto the dusty ground of the active construction site, where a middle-aged male lies drenched in sweat near scaffolding with grossly swollen face and neck. The air feels heavy and hot at 42°C, carrying the scent of dust and the acrid sting of widespread urticaria covering his torso. Multiple co-workers crowd around him, including the panicked site foreman, while I assess a patient who is confused and stridor-ing despite being surrounded by heat and overhead hazards.",
    "sensoryCues": {
      "sounds": [
        "distant construction machinery rumble",
        "panicked shouting of co-workers",
        "stridulous breathing",
        "busy site chatter"
      ],
      "smells": [
        "hot dust",
        "sweat",
        "bee venom sting odor"
      ],
      "temperature": "38°C heat radiating off the asphalt and scaffolding metal",
      "light": "harsh afternoon sun with deep shadows under scaffolding",
      "air": "still, hot, dust-laden air"
    },
    "accessExtrication": {
      "accessIssues": [
        "Overhead hazards from scaffolding",
        "crowd of co-workers surrounding the patient"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The site foreman stands close by looking frantic and demanding answers, while other co-workers cluster tightly around the patient's torso, creating a dense barrier that blocks immediate access."
  },
  "resp-009": {
    "arrivalNarrative": "I step through the doorway onto the restaurant floor to find a middle-aged male standing at a table, clutching his throat with the universal choking sign while patrons and staff crowd nearby. The patient is visibly cyanotic and distressed, unable to speak as he struggles to breathe after starting to choke on a piece of steak. The ambient noise of dining is instantly replaced by the harsh, wet sound of his gagging and the urgent murmur of the gathered crowd.",
    "sensoryCues": {
      "sounds": [
        "wet gurgling from patient's throat",
        "clattering of cutlery in background",
        "restaurant patrons murmuring urgently"
      ],
      "smells": [
        "overcooked steak and garlic sauce"
      ],
      "temperature": "cool, climate-controlled air",
      "light": "warm, artificial dining room lighting",
      "air": "still but carrying faint scent of food"
    },
    "accessExtrication": {
      "accessIssues": [
        "crowded table blocking immediate approach"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "Restaurant staff and patrons are gathered around the patient, their expressions a mix of panic and helplessness as they reach out tentatively without knowing how to assist."
  },
  "resp-012": {
    "arrivalNarrative": "I step through the restaurant doorway into a busy evening service, finding the distressed man lying on the floor amidst the crowd. The manager and a first-aider are nearby, having already administered an auto-injector about eight minutes ago. He is flushed with widespread hives, his lips and tongue swollen, wheezing audibly while becoming exhausted and agitated.",
    "sensoryCues": {
      "sounds": [
        "audible wheeze and stridor from the patient",
        "chatter of a busy restaurant crowd",
        "manager directing bystanders near the food table"
      ],
      "smells": [
        "nutty aroma lingering from the dessert on the nearby table"
      ],
      "temperature": "cool indoor air contrasting with the evening heat outside",
      "light": "warm ambient lighting from overhead fixtures",
      "air": "stale, smoky air mixed with food scents"
    },
    "accessExtrication": {
      "accessIssues": [
        "crowd surrounding the patient limiting immediate access",
        "allergen source still present on the table"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The manager gestures frantically to clear space around the patient while the first-aider holds their arms wide, visibly distressed by the worsening collapse despite the prior injection."
  },
  "y1-015": {
    "arrivalNarrative": "I step through the doorway into a busy, air-conditioned restaurant where a young woman sits at a table surrounded by watching diners. She is visibly distressed with widespread red welts on her face and arms, speaking in short sentences while audible wheezing fills the space. Her partner and restaurant staff are nearby, but the crowded environment limits my ability to move freely around the table.",
    "sensoryCues": {
      "sounds": [
        "audible wheeze",
        "restaurant chatter",
        "hum of air conditioning"
      ],
      "smells": [],
      "temperature": "cool air from the AC units",
      "light": "soft, ambient restaurant lighting",
      "air": "still, filtered air"
    },
    "accessExtrication": {
      "accessIssues": [
        "crowded environment",
        "limited space around table"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The partner and staff stand ready nearby while other diners observe from their seats."
  },
  "litfl-007": {
    "arrivalNarrative": "I step through the doorway into a well-lit arrivals hall, finding the patient lying on the floor near the moving baggage carousel with airport medical staff already at her side. The air is cool and still, scented faintly of sterile antiseptic from the responders' gear. She remains alert but anxious, speaking in broken words while her husband stands nearby catching her as she collapses.",
    "sensoryCues": {
      "sounds": [
        "rolling baggage wheels",
        "air conditioning hum",
        "distant terminal announcements"
      ],
      "smells": [
        "sterile antiseptic"
      ],
      "temperature": "cool indoor air-conditioning",
      "light": "bright overhead fluorescent lighting",
      "air": "still, filtered terminal air"
    },
    "accessExtrication": {
      "accessIssues": [
        "crowded public space",
        "moving baggage carousel nearby"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "Airport medical staff are already stabilising the patient while multiple public bystanders watch from a respectful distance. The husband stands close to his wife's side, holding her as she struggles to speak."
  },
  "asthma-sev-001": {
    "arrivalNarrative": "I step through the doorway into a dimly lit living room where a young woman sits propped up in a tripod position on upholstered seating, visibly struggling to breathe. The air is thick with the heavy scent of burning incense that clearly triggered this acute attack, while her mother and sister stand nearby looking frantic and distressed. Her skin is pale with cyanotic lips and she is drenched in profuse sweat as she manages only single words.",
    "sensoryCues": {
      "sounds": [
        "rattling wheeze from the patient",
        "sharp intake of breath",
        "mother speaking in a panicked whisper"
      ],
      "smells": [
        "strong burning incense smoke"
      ],
      "temperature": "cool evening air inside the home",
      "light": "dim evening light filtering through curtains",
      "air": "still, heavy with smoke"
    },
    "accessExtrication": {
      "accessIssues": [
        "smoke inhalation hazard from incense"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The mother stands close to the patient holding her hand tightly while the sister paces nervously in the corner, both avoiding direct eye contact with me."
  },
  "resp-003": {
    "arrivalNarrative": "I step through the doorway into a small apartment where the air is warm and stuffy. The elderly male sits in his armchair with a barrel chest, using accessory muscles as he breathes heavily. Cyanosis is visible on his lips while an oxygen concentrator hums quietly nearby.",
    "sensoryCues": {
      "sounds": [
        "AC unit humming",
        "patient's laboured breathing",
        "ticking clock"
      ],
      "smells": [
        "mild chlorine from home oxygen",
        "stale indoor air"
      ],
      "temperature": "warm, stuffy air",
      "light": "soft morning light filtering through windows",
      "air": "still and warm"
    },
    "accessExtrication": {
      "accessIssues": [
        "narrow apartment corridor"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The wife stands nearby, her hands wringing together as she watches me approach the armchair."
  },
  "resp-005": {
    "arrivalNarrative": "I step through the doorway into a warm, poorly ventilated bedroom where an elderly man sits upright on the edge of his bed in a tripod position. The air is thick with distress as he struggles to breathe, his lips turning cyanotic against the backdrop of accessory muscles working hard. A low-grade fever seems to have settled over the room, triggering this severe exacerbation while his wife stands nearby, visibly distressed by the scene.",
    "sensoryCues": {
      "sounds": [
        "rhythmic wheezing from the patient",
        "wife's quiet, anxious breathing",
        "hum of the oxygen concentrator"
      ],
      "smells": [
        "mild stale air"
      ],
      "temperature": "warm room temperature",
      "light": "early-morning light filtering through windows",
      "air": "still, poorly ventilated air"
    },
    "accessExtrication": {
      "accessIssues": [
        "crowded bedroom space due to wife present"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The wife remains distressed and close by, her presence adding to the emotional weight of the situation without a specific fixed position."
  },
  "resp-011": {
    "arrivalNarrative": "I step through the apartment doorway into a quiet living room where an elderly male sits on upholstered seating, appearing visibly unwell and struggling to breathe. The afternoon light filters through the windows, highlighting his flushed, diaphoretic skin as he gasps for air. Family members stand nearby, looking distressed but stationary.",
    "sensoryCues": {
      "sounds": [
        "soft hum of air conditioning",
        "muffled traffic from a distant street",
        "rhythmic wheezing from the patient"
      ],
      "smells": [
        "mild scent of stale sweat"
      ],
      "temperature": "warm afternoon air from the open door",
      "light": "bright afternoon sunlight with deep shadows",
      "air": "still and warm"
    },
    "accessExtrication": {
      "accessIssues": [
        "limited working space"
      ],
      "extricationNeeded": false,
      "note": "Family members are stationary and not obstructing movement."
    },
    "bystanderDetail": "Family members cluster near the patient without moving, their hands pressed to their mouths as they watch his breathing."
  },
  "y1-021": {
    "arrivalNarrative": "I step through the doorway into the warm apartment to find a breathless man sitting upright on the edge of his bed, leaning forward in a tripod position. He is alert but distracted by severe shortness of breath, unable to speak full sentences while using accessory muscles and pursing his lips. The air carries the distinct, sickly scent of green sputum from nearby tissues.",
    "sensoryCues": {
      "sounds": [
        "muffled traffic from a distant street",
        "the rhythmic wheeze of an asthmatic chest"
      ],
      "smells": [
        "green sputum on nearby tissues"
      ],
      "temperature": "warm apartment air",
      "light": "indoor evening lighting",
      "air": "stagnant, warm air"
    },
    "accessExtrication": {
      "accessIssues": [
        "limited working space"
      ],
      "extricationNeeded": false,
      "note": "Patient is seated and stable for EMS entry"
    },
    "bystanderDetail": "The son stands nearby, watching his father struggle with an expression of helpless concern."
  },
  "y2-001": {
    "arrivalNarrative": "I step through the doorway into an air-conditioned university common room where a young female sits upright in a chair, leaning forward with visible strain. The atmosphere is thick with the sound of her audible wheeze and the sight of cyanotic lips against the cool indoor backdrop. Three friends stand nearby, one observing closely while others look toward me.",
    "sensoryCues": {
      "sounds": [
        "audible high-pitched wheezing",
        "muffled traffic from outside"
      ],
      "smells": [],
      "temperature": "cool air-conditioned environment",
      "light": "indoor artificial lighting with evening shadows",
      "air": "still, filtered indoor air"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient seated in chair leaning forward"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "One friend stands close by appearing to know the patient well and nodding anxiously, while the other two hover at a slight distance watching the scene unfold."
  },
  "asthma-mod-001": {
    "arrivalNarrative": "I step through the doorway into a quiet, air-conditioned apartment where a young man sits on the bed leaning forward, his chest heaving as he struggles to breathe. The room feels still and cool from the AC, but I smell faint traces of cat litter or fur that act as a potential trigger for his attack. His partner stands nearby looking anxious while the patient speaks in short, laboured phrases.",
    "sensoryCues": {
      "sounds": [
        "soft hum of air-conditioning",
        "ticking clock on the wall",
        "muffled traffic from a distant street"
      ],
      "smells": [
        "faint scent of cat litter or fur"
      ],
      "temperature": "cool air from the apartment unit",
      "light": "evening ambient light filtering through windows",
      "air": "still and conditioned"
    },
    "accessExtrication": {
      "accessIssues": [
        "partner standing nearby requiring communication"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The partner stands nearby looking anxious and attentive to the patient's distress."
  },
  "y1-012": {
    "arrivalNarrative": "I step through the doorway into the quiet medical room, where an anxious eighteen-year-old male sits breathing rapidly with his hands trembling. The school nurse stands nearby having just brought him from the exam hall after he felt unable to breathe during his A-levels. He complains of dizziness and tingling in his hands while admitting he has no history of asthma or chest pain.",
    "sensoryCues": {
      "sounds": [
        "rapid, shallow breathing",
        "patient's anxious voice explaining tingling",
        "muffled ambient noise from the nearby exam hall"
      ],
      "smells": [],
      "temperature": "comfortable room temperature",
      "light": "soft, even indoor lighting",
      "air": "still and quiet air"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient breathing rapidly with hands trembling"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The school nurse remains present in the room, having assisted the patient from the exam hall moments ago."
  },
  "asthma-mild-001": {
    "arrivalNarrative": "I step through the doorway into the campus clinic room, where the young female sits on the examination table looking mildly distressed. The environment is clean and air-conditioned, yet I can hear her mild wheeze as she speaks in full sentences about her difficulty breathing. Dust from exercising outdoors lingers faintly in the cool air, contrasting with the sterile atmosphere of the clinic.",
    "sensoryCues": {
      "sounds": [
        "mild wheeze audible",
        "quiet AC hum",
        "faint distant traffic"
      ],
      "smells": [
        "clean hospital antiseptic",
        "faint dust"
      ],
      "temperature": "cool air-conditioned room",
      "light": "bright afternoon light filtering through windows",
      "air": "still, cool, slightly dusty"
    },
    "bystanderDetail": "The campus nurse stands nearby, observing the patient with a supportive but neutral stance.",
    "accessExtrication": {
      "accessIssues": [
        "dust present"
      ],
      "extricationNeeded": false,
      "note": ""
    }
  },
  "cardiac-001": {
    "arrivalNarrative": "I step onto the well-maintained villa grounds where a private residence stands air-conditioned and comfortable inside, though the morning heat presses against my skin. The living room sofa sits quietly as the patient clutches his chest, appearing pale and sweaty from the crushing pressure he has endured for half an hour. His wife waits nearby, her anxiety palpable in the stillness of the scene.",
    "sensoryCues": {
      "sounds": [
        "distant street traffic muffled by walls",
        "soft hum of air conditioning",
        "quiet ticking clock"
      ],
      "smells": [
        "clean linens and fresh paint"
      ],
      "temperature": "morning heat radiating off the ground",
      "light": "bright morning sun filtering through open windows",
      "air": "still, warm air"
    },
    "accessExtrication": {
      "accessIssues": [
        "none"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The wife stands nearby, her hands clasped tightly as she watches the patient with deep concern."
  },
  "cardiac-002": {
    "arrivalNarrative": "I step through the doorway onto the cluttered floor of a small apartment in Deira, where the air is warm and dimly lit by early-morning light. The scene is chaotic yet quiet, dominated by my husband's unresponsive form supine in the bed with cyanosis around his lips. I hear the wife calling out from the room and smell nothing distinct beyond the faint scent of a lived-in home.",
    "sensoryCues": {
      "sounds": [
        "faint AC hum",
        "muffled distant street traffic",
        "wife's distressed voice"
      ],
      "smells": [],
      "temperature": "warm air inside the apartment",
      "light": "dim lighting with deep shadows",
      "air": "still, warm air"
    },
    "accessExtrication": {
      "accessIssues": [
        "cluttered floor"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The wife is present and visibly distressed while the adult son stands nearby watching."
  },
  "cardiac-004": {
    "arrivalNarrative": "I step through the doorway into a well-lit, comfortable study where a distressed middle-aged male holds his head with a GCS of 14. The air is thick with the scent of stale perfume and clinical sweat as he sits flushed and diaphoretic, recounting how his severe headache developed over two hours after missing his blood pressure medication. A single housekeeper stands nearby, her hands wringing together as she watches me approach.",
    "sensoryCues": {
      "sounds": [
        "muffled traffic from a distant street",
        "soft hum of air conditioning",
        "patient's agitated breathing"
      ],
      "smells": [
        "stale perfume",
        "hospital-grade disinfectant on skin",
        "warm dust"
      ],
      "temperature": "cool evening breeze inside the villa",
      "light": "bright, even illumination from floor lamps",
      "air": "still, warm air"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient holding head limiting mobility"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The housekeeper remains stationary near the study entrance, her gaze fixed on the patient's face while she instinctively steps back to give me room."
  },
  "cardiac-007": {
    "arrivalNarrative": "I step into the air-conditioned hotel room where a middle-aged male lies in bed, visibly distressed and diaphoretic despite the cool environment. The receptionist stands nearby having relayed the guest's call about severe chest pain, vomiting, and sweating that woke him early this morning. He is pale and nauseated, alert but clearly uncomfortable as I approach.",
    "sensoryCues": {
      "sounds": [
        "quiet AC hum",
        "muffled traffic from a distant street",
        "patient's shallow breathing"
      ],
      "smells": [],
      "temperature": "cool air-conditioned air",
      "light": "soft ambient hotel lighting",
      "air": "still, filtered air"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient lying in bed"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The hotel receptionist stands nearby, having initiated the call to the front desk after the guest reported his symptoms."
  },
  "cardiac-008": {
    "arrivalNarrative": "I step through the doorway into a well-maintained apartment where an elderly man sits in an armchair, clutching his chest and struggling to breathe despite supplemental oxygen. The air is thick with the scent of antiseptic from the nearby cylinder, and I see signs of distress including sweating and visible effort as he uses accessory muscles. His wife and daughter are standing nearby, their voices tight with worry as they watch him.",
    "sensoryCues": {
      "sounds": [
        "soft AC hum",
        "ticking clock",
        "muffled traffic from a distant street"
      ],
      "smells": [
        "ozone from oxygen cylinder",
        "sweat and salt"
      ],
      "temperature": "cool indoor climate maintained by air conditioning",
      "light": "evening light filtering through windows casting soft shadows",
      "air": "still, filtered apartment air"
    },
    "accessExtrication": {
      "accessIssues": [
        "oxygen cylinder in immediate vicinity"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The wife and daughter remain close to the patient, their hands moving nervously as they observe his breathing patterns without interfering with the scene."
  },
  "cardiac-013": {
    "arrivalNarrative": "I step onto the rubber-floored weights area of the FitLife gym, the air-conditioning keeping the room cool at 22°C despite the evening hour. The scene is well-lit and chaotic; two gym staff are rotating chest compressions on a muscular male between squat racks while others watch the heavy equipment around him. AED pads are already in place, having delivered two shocks with no return of spontaneous circulation.",
    "sensoryCues": {
      "sounds": [
        "loud bass-heavy music distorting communication",
        "rhythmic thud of chest compressions on rubber flooring",
        "grunts from bystanders performing CPR rotation"
      ],
      "smells": [
        "scent of sweat and metallic iron from nearby barbells"
      ],
      "temperature": "cool 22°C air-conditioned environment",
      "light": "bright overhead artificial gym lighting with deep shadows cast by squat racks",
      "air": "still, recycled air mixed with body odour and supplement scents"
    },
    "accessExtrication": {
      "accessIssues": [
        "heavy weights and barbells surrounding the patient requiring clearance"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "Gym staff are focused intently on the compression rotation while other members stand nearby observing with expressions of shock and confusion."
  },
  "cardiac-016": {
    "arrivalNarrative": "I step through the crowded doorway of the food court, immediately noticing a huddle of people around the elderly female lying on the floor. The air is still and cool from the conditioning, but smells faintly of stale fast food and sweat. A security guard and a first aider are already managing the scene while multiple onlookers gather quietly nearby.",
    "sensoryCues": {
      "sounds": [
        "distant chatter of shoppers",
        "air-conditioning hum",
        "soft shuffling of feet"
      ],
      "smells": [
        "stale fast food",
        "sweat"
      ],
      "temperature": "cool, air-conditioned air",
      "light": "indoor ambient lighting with shadows from overhead fixtures",
      "air": "still, filtered air"
    },
    "accessExtrication": {
      "accessIssues": [
        "crowd management needed"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The security guard stands close to the patient's head while the first aider checks her pulse, both maintaining eye contact with me as the onlookers shift their weight but keep a respectful distance."
  },
  "resp-008": {
    "arrivalNarrative": "I step through the doorway into a quiet bedroom where an elderly woman is propped up on pillows, gasping for air with frothy sputum at her lips. The room feels warm and still as I assess her severe respiratory distress and anxious expression. She is unable to lie flat, clinging to an upright position amidst the early-morning silence.",
    "sensoryCues": {
      "sounds": [
        "AC hum",
        "muffled traffic from a distant street",
        "patient's wet, hacking cough"
      ],
      "smells": [
        "antiseptic soap",
        "faint scent of stale sweat"
      ],
      "temperature": "warm air radiating off the patient's skin",
      "light": "soft early-morning light filtering through curtains",
      "air": "still and heavy with humidity"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient is orthopneic and cannot be moved to a supine position"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The housekeeper stands nearby, looking distressed as they watch the patient struggle for breath."
  },
  "cardiac-018": {
    "arrivalNarrative": "I step onto the cool, hard floor of the mall walkway where a grey, clammy older man lies flat, barely responsive to my voice. The first aider gives a handover on a scene crowded with bystanders but free of immediate structural hazards. AED pads sit nearby while the monitor displays high-grade AV block and signs of shock in this poorly perfused patient.",
    "sensoryCues": {
      "sounds": [
        "muffled mall ambience",
        "distant elevator ding",
        "first aider's calm handover voice"
      ],
      "smells": [
        "indoor air conditioning"
      ],
      "temperature": "cool indoor environment",
      "light": "bright, diffuse artificial lighting",
      "air": "still, filtered circulation"
    },
    "accessExtrication": {
      "accessIssues": [
        "crowd density"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The mall first aider stands nearby providing a concise handover of the collapse event and initial assessment findings."
  },
  "y1-014": {
    "arrivalNarrative": "I step onto the polished floor of the air-conditioned food court, seeing the 55-year-old male supine and cyanotic while a security guard performs chest compressions nearby. The area is well-lit but crowded with onlookers, and I note wet patches near some tables that present a slip hazard in this limited space. An AED has already been retrieved from its wall mount by another staff member who is managing the crowd.",
    "sensoryCues": {
      "sounds": [
        "muffled ambient chatter from distant food kiosks",
        "rhythmic thud of chest compressions",
        "sharp command voice of the security guard"
      ],
      "smells": [],
      "temperature": "cool air conditioning masking body heat",
      "light": "bright overhead artificial lighting with deep shadows under tables",
      "air": "still, recycled mall air"
    },
    "accessExtrication": {
      "accessIssues": [
        "wet floor near food court",
        "limited space between tables"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "Multiple bystanders stand frozen watching the intervention while staff members actively manage the crowd to create a safe working perimeter."
  },
  "y2-009": {
    "arrivalNarrative": "I step through the doorway into the site office where eight co-workers stand clustered around a prone male on the floor. The air is thick with the smell of stale vomit and heavy sweat radiating from his high-vis vest. He lies cyanotic and unresponsive, having collapsed during the morning briefing after hours of outdoor heat exposure.",
    "sensoryCues": {
      "sounds": [
        "muffled construction noise from outside",
        "panicked voices of co-workers",
        "silence from the patient"
      ],
      "smells": [
        "stale vomit",
        "heavy sweat",
        "dust and concrete dust"
      ],
      "temperature": "cool office air contrasting with residual heat on the patient",
      "light": "fluorescent overhead lights casting harsh shadows",
      "air": "still, recycled air"
    },
    "accessExtrication": {
      "accessIssues": [
        "Limited space in office"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "Eight co-workers stand huddled together looking at me with wide eyes, none of them moving to help or knowing what to do."
  },
  "litfl-001": {
    "arrivalNarrative": "I step through the doorway into the air-conditioned portacabin office, finding the 58-year-old male lying supine on the floor with a colleague supporting his head. The ambient air is cool at 22°C, but the patient appears critically unwell, looking ashen and grey while speaking in short sentences. Three colleagues are present nearby, including one trained first-aider who has just administered GTN spray.",
    "sensoryCues": {
      "sounds": [
        "distant construction site machinery",
        "muffled traffic from outside the industrial area",
        "patient's shallow breathing"
      ],
      "smells": [],
      "temperature": "cool indoor air at 22°C",
      "light": "overhead artificial office lighting",
      "air": "still, filtered office air"
    },
    "accessExtrication": {
      "accessIssues": [
        "active construction site hard hat zone hazards"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The three colleagues stand near the patient; one trained first-aider remains close to support the patient's head while the others observe quietly."
  },
  "litfl-019": {
    "arrivalNarrative": "I step through the doorway onto the carpeted floor of the modern office, seeing a grey-faced man clutching his chest while sitting in a desk chair with papers scattered around him. The air-conditioned room is crowded by four anxious colleagues and an office first-aider standing near an AED, all hovering close to the patient. He is diaphoretic and distressed, describing the crushing pain as the worst he has ever felt.",
    "sensoryCues": {
      "sounds": [
        "faint hum of air conditioning",
        "shuffling of papers on the floor",
        "hushed anxious voices of colleagues"
      ],
      "smells": [],
      "temperature": "cool air conditioned room",
      "light": "bright artificial office lighting",
      "air": "stale recycled air with faint scent of paper"
    },
    "accessExtrication": {
      "accessIssues": [
        "scattered papers on the floor creating a trip hazard",
        "four colleagues crowding the patient obscuring view and access"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "Four colleagues are hovering anxiously around the patient, while the office first-aider stands ready with the AED in the immediate vicinity."
  },
  "cardiac-003": {
    "arrivalNarrative": "I step through the office doorway to find a middle-aged female seated at her desk, appearing pale and visibly anxious. The air-conditioned room is filled with several colleagues who are hovering nearby but maintaining a respectful distance from the patient. She reports that she suddenly felt palpitations while working, now presenting with dizziness and discomfort.",
    "sensoryCues": {
      "sounds": [
        "quiet office hum",
        "air-con ventilation",
        "distant street traffic"
      ],
      "smells": [],
      "temperature": "cool air-conditioned environment",
      "light": "overhead fluorescent lighting",
      "air": "stagnant, filtered indoor air"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient seated at desk"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "Several colleagues stand near the doorway and by her workstation, their movements hesitant as they watch her anxious state with concern."
  },
  "cardiac-006": {
    "arrivalNarrative": "I step through the apartment doorway into a modern, air-conditioned living space where a young woman sits calmly on upholstered seating, visibly anxious but alert and oriented. She reports feeling lightheaded after drinking coffee at work, explaining why she called for help while her roommate waits nearby in mild agitation. The environment is quiet and controlled, contrasting with the frantic heart racing she describes.",
    "sensoryCues": {
      "sounds": [
        "soft hum of air-conditioning",
        "ticking clock",
        "muffled traffic from a distant street"
      ],
      "smells": [],
      "temperature": "cool artificial air",
      "light": "evening indoor lighting",
      "air": "still and filtered"
    },
    "accessExtrication": {
      "accessIssues": [
        "narrow interior space"
      ],
      "extricationNeeded": false,
      "note": "no extrication required as the patient is accessible while seated."
    },
    "bystanderDetail": "The roommate stands nearby, shifting their weight and looking toward the entrance with a furrowed brow, clearly anxious to help but unsure of what to do next."
  },
  "cardiac-009": {
    "arrivalNarrative": "I step through the doorway into a quiet nursing home room where an elderly female lies comfortably in bed, slightly anxious but stable. A nurse stands nearby, confirming she is alert and oriented despite feeling weak this morning following a missed dose of diltiazem. The space is well-equipped with medical supplies, yet there are no acute injuries or abnormal findings to note as I enter.",
    "sensoryCues": {
      "sounds": [
        "muffled traffic from a distant street",
        "hum of the air conditioning unit"
      ],
      "smells": [],
      "temperature": "cool indoor climate",
      "light": "soft morning light filtering through blinds",
      "air": "still and clean"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient in bed"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The nurse remains present nearby, observing the patient with a calm but attentive posture as I begin my assessment."
  },
  "cardiac-010": {
    "arrivalNarrative": "I step through the supermarket entrance where cool air conditioning immediately chills the humid afternoon heat. The patient sits alert but pale on a staff-provided chair in a public area, having just recovered from a brief episode on the floor. Store managers and several customers surround us, their voices a low hum of concern as they recount her rapid return to consciousness.",
    "sensoryCues": {
      "sounds": [
        "hum of overhead fluorescent lights",
        "distant chatter of shoppers",
        "refrigeration unit rattle"
      ],
      "smells": [
        "stale coffee and baked goods"
      ],
      "temperature": "cool, conditioned air contrasting with the humid outside heat",
      "light": "bright artificial overhead lighting casting sharp shadows",
      "air": "still, filtered air carrying faint scents of cleaning products"
    },
    "accessExtrication": {
      "accessIssues": [
        "public area requires managing crowd flow"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The store manager stands close to the patient, gesturing calmly while explaining the timeline of her fainting spell, with other customers lingering nearby watching the scene."
  },
  "cardiac-011": {
    "arrivalNarrative": "I step through the doorway into a crowded apartment where an elderly male sits on the edge of a bed, leaning forward with severe respiratory distress. The room is filled with anxious family members as he struggles to breathe, his skin diaphoretic and lips turning cyanotic. I can hear the harsh sound of his wheeze mixing with the muffled traffic from the distant street outside.",
    "sensoryCues": {
      "sounds": [
        "harsh wheeze",
        "patient using accessory muscles",
        "muffled traffic"
      ],
      "smells": [
        "antiseptic wipes from my kit cutting through stale air"
      ],
      "temperature": "cool evening apartment air contrasting with the patient's hot, sweaty skin",
      "light": "dim indoor lighting casting deep shadows across the crowded room",
      "air": "still, warm air heavy with the scent of stale sweat"
    },
    "accessExtrication": {
      "accessIssues": [
        "crowded room limiting immediate approach"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The son and daughter-in-law stand nearby, their voices raised in a low panic as they watch the patient struggle."
  },
  "cardiac-012": {
    "arrivalNarrative": "I step through the doorway into the rehabilitation room where the patient lies in bed, appearing pale but stable with his pacemaker generator visible over his left chest. The nurse stands nearby, having called to report two days of worsening fatigue and a recent fall due to dizziness. Inside this medical facility, the air is still and quiet aside from the hum of equipment.",
    "sensoryCues": {
      "sounds": [
        "soft AC hum",
        "distant hallway footsteps",
        "muffled traffic from outside"
      ],
      "smells": [],
      "temperature": "cool indoor climate",
      "light": "overhead fluorescent lighting",
      "air": "still, filtered air"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient bedded in room"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The nurse watches me approach with a concerned expression while keeping her hands ready to assist."
  },
  "cardiac-015": {
    "arrivalNarrative": "I step onto the ground floor landing of the residential flat, where a concerned neighbour is already present near the living room entrance. The space is cluttered and dimly lit with closed curtains, revealing an elderly male slumped in an armchair looking pale and drowsy. Scattered medication packets sit on a side table nearby as I prepare to approach the confused patient.",
    "sensoryCues": {
      "sounds": [
        "soft ticking of a wall clock",
        "muffled traffic from distant streets",
        "quiet hum of air conditioning"
      ],
      "smells": [
        "stale indoor air"
      ],
      "temperature": "indoor ambient warmth",
      "light": "dim light filtering through closed curtains",
      "air": "still, quiet apartment air"
    },
    "accessExtrication": {
      "accessIssues": [
        "cluttered living space"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The neighbour stands close by the doorway, looking concerned but remaining cooperative as I take control of the scene."
  },
  "y2-002": {
    "arrivalNarrative": "I step through the doorway into a comfortable home environment where a middle-aged male sits on upholstered seating, clutching his chest and holding himself still. He appears unwell but is alert and appropriate, surrounded by his wife and adult daughter who watch with worried expressions. The early-morning light filters in softly as I assess a patient who is pale, diaphoretic, and clearly anxious despite the quiet surroundings.",
    "sensoryCues": {
      "sounds": [
        "faint hum of air conditioning",
        "distant muffled traffic from the Marina streets",
        "silence of the apartment interior"
      ],
      "smells": [],
      "temperature": "cool indoor climate typical of an early morning in Dubai",
      "light": "soft early-morning light filtering through windows",
      "air": "still, filtered air within the enclosed apartment"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient seated on upholstered seating"
      ],
      "extricationNeeded": false,
      "note": "Patient is already seated and stable; no extrication required."
    },
    "bystanderDetail": "The wife stands close to her husband, her voice low and anxious as she recounts the morning's events, while the adult daughter remains nearby, observing the patient with concern but staying out of his immediate space."
  },
  "cardiac-005": {
    "arrivalNarrative": "I step through the glass doors into the air-conditioned food court, where the elderly man sits calmly with his chest pain having improved after resting. The security guard stands nearby, watching the scene without urgency. It is a safe public area with no immediate hazards or distress visible.",
    "sensoryCues": {
      "sounds": [
        "soft hum of air conditioning",
        "distant chatter of shoppers",
        "ice clinking in drink containers"
      ],
      "smells": [],
      "temperature": "cool, conditioned air",
      "light": "bright overhead artificial lighting with deep shadows under tables",
      "air": "still and filtered by the mall's ventilation system"
    },
    "accessExtrication": {
      "accessIssues": [
        "none"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The security guard maintains a steady posture, offering calm assurance while keeping his hands visible and relaxed at his sides."
  },
  "y1-013": {
    "arrivalNarrative": "I step through the doorway into a quiet, air-conditioned private office where a middle-aged man sits alert but anxious at his desk. He places a hand over his chest as I note he is mildly flushed and has been working late on a deadline with several coffees nearby. The security guard stands by to let us in, acknowledging the calm evening atmosphere.",
    "sensoryCues": {
      "sounds": [
        "quiet office air conditioning hum",
        "distant muffled traffic from outside",
        "patient's rapid breathing"
      ],
      "smells": [
        "slight coffee aroma",
        "clean office air"
      ],
      "temperature": "cool, still air",
      "light": "soft artificial desk lighting",
      "air": "still, filtered air"
    },
    "bystanderDetail": "The security guard remains near the entrance, having facilitated our entry without interfering with the patient's space.",
    "accessExtrication": {
      "accessIssues": [
        "security staff controlling entry"
      ],
      "extricationNeeded": false,
      "note": "Security cleared entry; no physical barriers to access."
    }
  },
  "metab-002": {
    "arrivalNarrative": "I step through the doorway into a quiet Dubai apartment where the afternoon heat presses against the windows. The friend stands nearby, looking distressed while I assess the young woman slumped on the upholstered seating in the living room. She is drowsy but rousable, breathing fast with an acetone breath odor wafting toward me from her flushed skin.",
    "sensoryCues": {
      "sounds": [
        "muffled traffic from a distant street",
        "AC hum",
        "ticking clock"
      ],
      "smells": [
        "acetone breath odor",
        "dust and heat"
      ],
      "temperature": "36°C ambient apartment warmth",
      "light": "bright afternoon sun filtering through glass",
      "air": "still, dry, hot air"
    },
    "accessExtrication": {
      "accessIssues": [
        "limited working space"
      ],
      "extricationNeeded": false,
      "note": "Patient is seated on furniture, allowing immediate access without extrication."
    },
    "bystanderDetail": "The friend remains by the patient's side, hands wringing together as they watch me check her responsiveness."
  },
  "metab-003": {
    "arrivalNarrative": "I step through the doorway into the quiet clinic room, where a middle-aged male sits appearing weak and pale with visible anxiety. The clinical setting is sterile, marked by the hum of equipment and the presence of clinic staff observing the scene. He has an AVF on his left arm for dialysis, noting that he missed his session yesterday which likely contributed to his current weakness and palpitations.",
    "sensoryCues": {
      "sounds": [
        "low clinical hum",
        "muffled traffic from outside"
      ],
      "smells": [
        "disinfectant"
      ],
      "temperature": "cool climate-controlled air",
      "light": "bright overhead fluorescent lighting",
      "air": "still, filtered hospital air"
    },
    "accessExtrication": {
      "accessIssues": [
        "limited working space"
      ],
      "extricationNeeded": false,
      "note": "Patient is seated in a clinic room requiring no physical removal."
    },
    "bystanderDetail": "Clinic staff stand nearby observing the situation without intervening directly."
  },
  "litfl-003": {
    "arrivalNarrative": "I step through the doorway into a clean, air-conditioned apartment where the elderly male sits drowsy in an armchair, responding slowly to my voice. The room is quiet save for the hum of the AC, and I note the peritoneal dialysis equipment resting unused nearby while his wife stands speaking quietly in both English and Arabic. His skin appears pale with visible generalized edema around his eyes and ankles, and a functioning AV fistula pulses clearly in his left forearm.",
    "sensoryCues": {
      "sounds": [
        "low hum of air conditioning",
        "ticking wall clock",
        "distant muffled traffic from the street below"
      ],
      "smells": [],
      "temperature": "cool artificial air circulating the room",
      "light": "soft evening illumination filtering through windows",
      "air": "still, filtered apartment air"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient appears drowsy and weak in armchair"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The wife remains close by, speaking softly in English and Arabic while watching the patient with evident concern."
  },
  "metab-001": {
    "arrivalNarrative": "I step through the doorway onto the bedroom floor where a confused, drowsy man lies beside his bed, his skin pale and glistening with profuse sweat. The air is thick with the metallic tang of insulin and the sharp, acrid smell of panic from his son who found him there after hearing noise. A trembling figure on the floor and an insulin pen on the bedside table confirm the severe hypoglycemia event before my eyes.",
    "sensoryCues": {
      "sounds": [
        "muffled traffic from a distant street",
        "ticking clock",
        "husky voice of the son pleading for help"
      ],
      "smells": [
        "metallic tang of blood and sweat",
        "antiseptic hint from the wife's perfume",
        "stale breakfast food"
      ],
      "temperature": "cool villa air contrasting with patient's burning skin",
      "light": "early-morning grey light filtering through sheer curtains",
      "air": "still, heavy atmosphere charged with confusion"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient unresponsive to verbal commands"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The wife stands frozen near the doorway watching her husband, while the son paces by the window, his voice cracking as he explains how he found him on the floor."
  },
  "y1-018": {
    "arrivalNarrative": "I step onto the roadside in Deira, the afternoon heat pressing down as colleagues gather around a taxi where a middle-aged man sits slumped in the seat. The driver is pale and covered in profuse sweat, his tremulous limbs visible even through the shade of the parked vehicle. Other drivers stand nearby, their voices low with concern as they offer to help secure the scene against passing traffic.",
    "sensoryCues": {
      "sounds": [
        "traffic rumble",
        "idling engines",
        "distant siren"
      ],
      "smells": [
        "exhaust-stained air",
        "sweat"
      ],
      "temperature": "hot afternoon sun with deep shadows from the shade",
      "light": "bright daylight filtered through roadside shade",
      "air": "still, hot air smelling of exhaust and sweat"
    },
    "accessExtrication": {
      "accessIssues": [
        "traffic hazard requiring scene security"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "Other drivers stand nearby, their voices low with concern as they offer to help secure the scene against passing traffic."
  },
  "y1-003": {
    "arrivalNarrative": "I step through the doorway into a comfortable home environment where the air feels still and quiet. The patient lies in the bedroom, appearing tired and slightly confused with a pale, diaphoretic face. I hear the soft hum of the AC unit mixing with the muffled traffic from the distant Dubai street.",
    "sensoryCues": {
      "sounds": [
        "soft hum of the AC unit",
        "muffled traffic from a distant street",
        "a ticking clock"
      ],
      "smells": [],
      "temperature": "evening air, slightly warm",
      "light": "dim residential evening light",
      "air": "still, quiet indoor air"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient on floor"
      ],
      "extricationNeeded": true,
      "note": "Patient requires removal from bedroom floor for transport."
    },
    "bystanderDetail": "The wife is present and helpful, standing nearby as I approach the patient."
  },
  "psych-003": {
    "arrivalNarrative": "I step through the apartment doorway into a well-lit living room where a young man paces restlessly, his gaze suspicious and disheveled. The air is still but charged with tension as family members stand nearby without specific positions, watching the situation unfold. I immediately assess hazards from an agitated patient responding to internal stimuli rather than physical threats.",
    "sensoryCues": {
      "sounds": [
        "muffled traffic from a distant street",
        "soft AC hum",
        "patient's pacing footsteps"
      ],
      "smells": [],
      "temperature": "indoor ambient comfort",
      "light": "well-lit room with soft shadows",
      "air": "still, air-conditioned air"
    },
    "accessExtrication": {
      "accessIssues": [
        "agitated patient pacing"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "Family members remain nearby, their micro-behaviour showing concern and hesitation as they observe the bizarre behaviour over the past week."
  },
  "y2-008": {
    "arrivalNarrative": "I step through the doorway onto the ground floor apartment where a young male paces frantically in the living room, surrounded by overturned furniture and drawn curtains blocking the light. The air is thick with the smell of unwashed skin and stale sweat from days without care, while his rapid shouting about unseen entities fills the silent space. He clutches a winter jacket despite the warm Dubai evening and remains barefoot amidst the clutter.",
    "sensoryCues": {
      "sounds": [
        "distant street traffic muffled by apartment walls",
        "loud, intermittent banging and crashing from inside"
      ],
      "smells": [
        "stale sweat",
        "unwashed skin"
      ],
      "temperature": "mildly elevated ambient warmth",
      "light": "dim interior with deep shadows behind drawn curtains",
      "air": "still, hot, exhaust-stained air"
    },
    "accessExtrication": {
      "accessIssues": [
        "door ajar but patient refusing to open and shouting threats"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "A neighbour stands outside the apartment doorway, having knocked repeatedly before calling for help when the shouting persisted for over an hour."
  },
  "psych-002": {
    "arrivalNarrative": "I step through the doorway into a crowded apartment living room where broken furniture lies scattered across the floor. The air is thick with shouting and the chaotic pace of a young male pacing while brandishing potential weapons. Broken glass crunches underfoot, and the smell of stale sweat mixes with the dust from the damaged interior.",
    "sensoryCues": {
      "sounds": [
        "manic shouting and incoherent babbling",
        "crackling of breaking furniture",
        "muffled traffic from distant streets"
      ],
      "smells": [
        "stale sweat",
        "broken glass dust"
      ],
      "temperature": "tropical evening heat radiating off the room",
      "light": "dim, flickering indoor lighting casting deep shadows",
      "air": "still, heavy air charged with tension"
    },
    "accessExtrication": {
      "accessIssues": [
        "broken glass on the floor",
        "crowded apartment filled with bystanders"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The father stands visibly stressed near the entrance while the mother and frightened younger sister huddle together in the background."
  },
  "y1-008": {
    "arrivalNarrative": "I step through the doorway into the quiet area of the university library, where a young woman sits on the floor against a wall, visibly distressed and clutching her chest. The air is still and cool with the hum of the air-conditioning unit filling the silent space. Several students watch from a distance while her friend stands nearby as I approach.",
    "sensoryCues": {
      "sounds": [
        "muffled library traffic from distant streets",
        "soft hum of the air-conditioning unit",
        "rapid, ragged breathing"
      ],
      "smells": [],
      "temperature": "cool, air-conditioned air",
      "light": "diffused afternoon light filtering through windows",
      "air": "still, filtered library air"
    },
    "accessExtrication": {
      "accessIssues": [
        "limited working space"
      ],
      "extricationNeeded": true,
      "note": "Patient is seated on the floor against a wall and requires assistance to stand or be moved."
    }
  },
  "obs-001": {
    "arrivalNarrative": "I step through the doorway onto the cool apartment floor, finding a pregnant woman lying on her left side on a bed in the master bedroom. She is pale and diaphoretic, gripping her soft, non-tender abdomen while active bleeding soaks the bedding beneath her. The air-conditioned room feels still as I assess a 34-week patient who woke to find blood soaking through her pad but remains alert and oriented.",
    "sensoryCues": {
      "sounds": [
        "soft hum of the air conditioner",
        "ticking clock on the wall",
        "muffled traffic from the distant street"
      ],
      "smells": [
        "sterile scent of medical oxygen",
        "sharp metallic tang of blood on bedding"
      ],
      "temperature": "cool radiating air conditioning",
      "light": "soft morning light filtering through curtains",
      "air": "still, cool, air-conditioned air"
    },
    "accessExtrication": {
      "accessIssues": [
        "limited space due to bystanders and furniture"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The husband stands nearby looking concerned, while the mother-in-law remains in another room."
  },
  "obs-002": {
    "arrivalNarrative": "I step through the doorway into the living room where a pregnant woman lies post-ictal on the floor, her husband standing nearby watching anxiously. The air carries the faint scent of antiseptic from the seizure activity mixed with the stale warmth of the indoor environment. Her face and hands appear noticeably swollen as I assess her drowsy condition at 34 weeks gestation.",
    "sensoryCues": {
      "sounds": [
        "muffled traffic from a distant street",
        "quiet hum of air conditioning",
        "husband's low, anxious breathing"
      ],
      "smells": [
        "stale warmth mixed with faint antiseptic residue"
      ],
      "temperature": "warm indoor climate",
      "light": "soft morning light filtering through curtains",
      "air": "still and slightly warm"
    },
    "accessExtrication": {
      "accessIssues": [],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The husband stands close but does not touch the patient, his hands clasped tightly together as he watches me approach with a look of exhausted relief."
  },
  "obs-003": {
    "arrivalNarrative": "I step through the doorway into the quiet bedroom where a pale, anxious woman lies soaked with heavy vaginal bleeding on the bedding. The husband is present nearby, panicking as he speaks about the precipitous birth that occurred forty minutes ago. I immediately assess the soft, boggy uterus and the newborn wrapped safely aside while noting the significant blood loss.",
    "sensoryCues": {
      "sounds": [
        "AC hum",
        "muffled traffic from a distant street"
      ],
      "smells": [
        "stale copper smell of blood",
        "antiseptic from the newborn's wrapping"
      ],
      "temperature": "indoor apartment air, slightly cool from AC",
      "light": "evening apartment lighting with deep shadows",
      "air": "still, confined room air"
    },
    "accessExtrication": {
      "accessIssues": [
        "body fluids requiring BSI precautions"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The husband stands nearby, his voice shaking as he recounts the rapid delivery and expresses panic about the continuous bleeding."
  },
  "y2-005": {
    "arrivalNarrative": "I step into the break room to find a young woman lying on the floor, covered by a blanket placed by concerned colleagues. The air is cool from the office conditioning despite her pale, diaphoretic skin and obvious distress as she answers questions between waves of pain. Three work associates stand nearby, looking worried and eager to assist.",
    "sensoryCues": {
      "sounds": [
        "soft AC hum",
        "muffled office chatter",
        "quiet floor creak"
      ],
      "smells": [
        "stale coffee",
        "clean air conditioner scent"
      ],
      "temperature": "cool indoor environment",
      "light": "bright overhead fluorescent lighting",
      "air": "still, filtered office air"
    },
    "accessExtrication": {
      "accessIssues": [
        "limited working space"
      ],
      "extricationNeeded": true,
      "note": "Patient is on the floor requiring lift"
    },
    "bystanderDetail": "Three colleagues are gathered around the patient, visibly concerned and offering to help with her comfort and safety."
  },
  "y1-006": {
    "arrivalNarrative": "I step into the residential home onto a warm bedroom floor where a pregnant female lies on a bed with towels laid out, visibly bearing down as she contracts every two minutes. Her partner stands nearby, looking anxious and panicking while I assess the crowning visible at her perineum and clear fluid from waters that broke an hour ago. The environment is clean with no hazards present, but the urge to push is strong and immediate.",
    "sensoryCues": {
      "sounds": [
        "rhythmic sobbing of intense contractions",
        "muffled traffic from a distant street",
        "panicked voice of the partner"
      ],
      "smells": [
        "faint smell of sweat and antiseptic on the patient"
      ],
      "temperature": "warm air circulating in the early-morning bedroom",
      "light": "soft morning light filtering through curtains",
      "air": "still, warm domestic air"
    },
    "accessExtrication": {
      "accessIssues": [],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The partner remains present and anxious, their panic evident in their voice as they watch the patient bearing down."
  },
  "cardiac-017": {
    "arrivalNarrative": "I step through the front door onto the warm floor of the first-floor apartment to find a well-equipped nursery. The mother holds the critically unwell infant tightly, while the father stands at the threshold guiding us in. The room is filled with the distress of the parents and the quiet hum of domestic life disrupted by medical emergency.",
    "sensoryCues": {
      "sounds": [
        "muffled traffic from a distant street",
        "soft ticking of a wall clock",
        "mother's sobbing"
      ],
      "smells": [
        "indoor, warm nursery air"
      ],
      "temperature": "warm indoor temperature",
      "light": "evening light filtering through windows",
      "air": "still, quiet apartment air"
    },
    "accessExtrication": {
      "accessIssues": [
        "furniture restricting access",
        "agitated bystander controlling access"
      ],
      "extricationNeeded": false,
      "note": "Parents are guiding entry; infant is held by mother."
    },
    "bystanderDetail": "The mother clutches the baby protectively while her husband remains at the front door to control access. Both parents display extreme anxiety as they watch me approach."
  },
  "ped-001": {
    "arrivalNarrative": "I step through the doorway into a living room where a small three-year-old girl lies post-ictal on the carpet, her skin flushed and hot to the touch. The air is still but warm despite the AC running at 24°C, carrying the scent of dust and faint disinfectant from the grandmother's frantic efforts. Grandmother hovers nearby trying to help while the distressed mother screams in the background and two siblings watch quietly.",
    "sensoryCues": {
      "sounds": [
        "faint hum of air-conditioning",
        "muffled traffic from a distant street",
        "child's laboured breathing"
      ],
      "smells": [
        "warm dust",
        "faint disinfectant",
        "sweat"
      ],
      "temperature": "38°C heat radiating off the child's skin",
      "light": "afternoon sun filtering through windows casting deep shadows",
      "air": "still, warm, and slightly stale"
    },
    "accessExtrication": {
      "accessIssues": [
        "crowded with bystanders"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The grandmother reaches out tentatively to touch the child while the mother paces near the entrance shouting instructions."
  },
  "resp-007": {
    "arrivalNarrative": "I step through the doorway into a calm, air-conditioned living room where a frightened toddler sits clinging to his mother's lap. The child is alert and breathing with mild distress despite the cool environment. He barks with a rough cough as I approach.",
    "sensoryCues": {
      "sounds": [
        "soft hum of air conditioning",
        "ticking clock in the background",
        "muffled traffic from the distant street"
      ],
      "smells": [],
      "temperature": "cool, regulated apartment air",
      "light": "evening indoor lighting",
      "air": "still and filtered"
    },
    "accessExtrication": {
      "accessIssues": [
        "limited working space"
      ],
      "extricationNeeded": false,
      "note": "Patient is seated and accessible; no physical barriers to approach."
    },
    "bystanderDetail": "The parents stand nearby with the mother holding the child tightly on her lap."
  },
  "ped-002": {
    "arrivalNarrative": "I step through the doorway into a quiet living room where a two-year-old boy lies on a rug, his limbs jerking violently as parents stand by holding him down. The air feels thick with the scent of fever and household tension while I assess the unresponsive toddler amidst the sudden chaos of a seizure. It is evening in the villa, but the heat radiating from the child's flushed skin is intense compared to the cool interior.",
    "sensoryCues": {
      "sounds": [
        "soft AC hum",
        "muffled traffic from a distant street",
        "sudden thudding of jerking limbs"
      ],
      "smells": [
        "overheated body odour"
      ],
      "temperature": "cool villa interior contrasting with hot skin",
      "light": "evening twilight filtering through windows",
      "air": "still and warm"
    },
    "accessExtrication": {
      "accessIssues": [
        "limited working space"
      ],
      "extricationNeeded": false,
      "note": "Parents are managing the child on the rug; no physical removal required."
    },
    "bystanderDetail": "Parents are present near the child, their hands gripped tightly around his limbs to manage the tonic-clonic movements while they look up at me with wide eyes."
  },
  "y1-005": {
    "arrivalNarrative": "I step through the doorway into a warm living room where a toddler lies on upholstered seating, wrapped in a blanket with her mother holding her close. The older sibling stands nearby, watching quietly as I approach the drowsy child who is flushed and hot to touch. The family home feels stifling with the heating on high, creating a heavy, still atmosphere after the seizure has finally stopped.",
    "sensoryCues": {
      "sounds": [
        "muffled traffic from a distant street",
        "soft weeping from the mother",
        "ticking clock"
      ],
      "smells": [
        "warm air dust",
        "antiseptic from my kit"
      ],
      "temperature": "39.5°C heat radiating off the child's skin",
      "light": "afternoon sun filtering through windows, deep shadows in corners",
      "air": "still, warm, stagnant"
    },
    "accessExtrication": {
      "accessIssues": [
        "mother holding the child"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The distressed mother keeps her grip tight on the toddler's shoulder while whispering reassurances, and the six-year-old sibling stands with hands clasped behind their back, eyes fixed on the child."
  },
  "y1-007": {
    "arrivalNarrative": "I step through the doorway into a warm, dry bedroom where a toddler sits upright on his father's lap. The air is thick with the sound of intermittent barking coughs and mild noisy breathing that reaches me immediately. A mother stands nearby holding an older sibling while the child clings to his dad, looking intermittently distressed.",
    "sensoryCues": {
      "sounds": [
        "intermittent barking cough",
        "mild inspiratory stridor at rest",
        "child intermittently crying"
      ],
      "smells": [],
      "temperature": "warm house air",
      "light": "indoor evening lighting",
      "air": "dry, centrally heated air"
    },
    "accessExtrication": {
      "accessIssues": [
        "limited working space"
      ],
      "extricationNeeded": false,
      "note": "Patient is seated and accessible on lap; no physical barriers to entry."
    },
    "bystanderDetail": "The father holds the child tightly while the mother stands with their older sibling nearby."
  },
  "tox-001": {
    "arrivalNarrative": "I step onto the farm ground where the air is thick with a sharp chemical odor and hot sun beats down on the scene. Near the pesticide spraying equipment, I see three other workers displaying symptoms while the patient lies diaphoretic and cyanotic nearby. The caller's report of a collapse after exposure matches the sickly atmosphere surrounding the victim.",
    "sensoryCues": {
      "sounds": [
        "labored breathing from the patient",
        "occasional retching sounds",
        "muffled voices of symptomatic workers"
      ],
      "smells": [
        "overpowering chemical smell on clothes and skin"
      ],
      "temperature": "hot sun radiating heat",
      "light": "harsh morning sunlight casting deep shadows",
      "air": "still, hot air tainted by pesticide spray"
    },
    "accessExtrication": {
      "accessIssues": [
        "chemical contamination requiring PPE"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The farm supervisor and three other workers stand nearby exhibiting signs of illness themselves."
  },
  "tox-002": {
    "arrivalNarrative": "I step through the doorway onto the concrete floor of a dimly lit parking garage, the air thick and still around a young male lying supine on the ground with cyanotic lips. A needle rests nearby in the shadows, visible next to track marks on his arms, while a security guard stands close by watching the scene unfold. The confined space feels enclosed as I approach, noting his unresponsive state with small pupils and shallow breathing.",
    "sensoryCues": {
      "sounds": [
        "distant traffic rumble",
        "echoing footsteps",
        "faint mechanical hum of ventilation"
      ],
      "smells": [
        "stale exhaust",
        "metallic tang of blood"
      ],
      "temperature": "cool basement air",
      "light": "dim artificial overhead lighting",
      "air": "still, confined atmosphere"
    },
    "accessExtrication": {
      "accessIssues": [
        "confined space",
        "bystander proximity"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The security guard stands nearby observing me with a concerned expression, hands clasped tightly together as I begin my assessment."
  },
  "y1-023": {
    "arrivalNarrative": "I step onto the dormitory floor to find a cramped, warm shared room where my roommate stands near the bunk, eyes wide with fright. The air is still and heavy with the scent of stale smoke and potential chemicals from the drug paraphernalia scattered nearby. I check for sharps before kneeling beside the cyanosed patient on the bunk, noting his shallow breathing and pinpoint pupils against the empty tablet strips.",
    "sensoryCues": {
      "sounds": [
        "muffled traffic from a distant street",
        "snoring respirations",
        "shallow gasping breaths"
      ],
      "smells": [
        "stale smoke",
        "drug paraphernalia odour"
      ],
      "temperature": "warm dormitory air",
      "light": "evening ambient light",
      "air": "still, warm, exhaust-stained air"
    },
    "accessExtrication": {
      "accessIssues": [
        "cramped space",
        "needles/sharps hazard before kneeling"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The roommate stands nearby, visibly frightened and watching my movements closely as I assess the scene."
  },
  "y1-009": {
    "arrivalNarrative": "I step onto the kitchen floor to find a frantic mother holding her crying three-year-old, with an open bottle of bleach-based cleaner and spilled liquid nearby. The toddler is drooling excessively and rubbing his mouth, while a younger sibling sits quietly in a playpen just out of immediate reach. The air carries the sharp, stinging scent of sodium hypochlorite mixing with the smell of fresh cleaning products.",
    "sensoryCues": {
      "sounds": [
        "child's distressed crying",
        "mother's hurried breathing",
        "muffled traffic from outside"
      ],
      "smells": [
        "sharp bleach fumes",
        "fresh kitchen odours"
      ],
      "temperature": "cool morning air inside the house",
      "light": "diffused morning light filtering through kitchen windows",
      "air": "still, slightly humid domestic air"
    },
    "accessExtrication": {
      "accessIssues": [
        "chemical spill on floor"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The mother holds the child tightly against her chest, her hands shaking slightly as she looks between me and the open bottle. The younger sibling remains seated in the playpen, observing the scene without moving."
  },
  "y2-007": {
    "arrivalNarrative": "I step through the doorway of the small student bedroom where a young woman sits quietly on her bed, appearing calm and alert despite the empty medication packets visible on the bedside table. The flatmate stands nearby, visibly upset but supportive, having found the patient after she became unusually quiet and disclosed the overdose upon direct questioning. No other concerning items or substances are immediately evident in the tidy room.",
    "sensoryCues": {
      "sounds": [
        "soft hum of air conditioning",
        "muffled traffic from a distant street",
        "patient's quiet, cooperative voice"
      ],
      "smells": [],
      "temperature": "evening coolness inside the student accommodation",
      "light": "dim evening light filtering through the window",
      "air": "still, clean air with no exhaust stains"
    },
    "accessExtrication": {
      "accessIssues": [
        "None"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The flatmate remains close by, appearing visibly upset yet actively supportive as I assess the patient."
  },
  "burn-001": {
    "arrivalNarrative": "Stepping through the doorway into the industrial factory, I am immediately met with thick, choking smoke and the deafening roar of active fire spreading through the building. The air is superheated and filled with the acrid scent of burning chemicals and singed hair from the victim near the exit. Chaos reigns as other workers are being evacuated while shouting instructions to put out flames on the patient's clothes.",
    "sensoryCues": {
      "sounds": [
        "crackling fire",
        "shouting evacuation orders",
        "roaring industrial ventilation fans failing amidst smoke"
      ],
      "smells": [
        "acrid chemical smoke",
        "burning synthetic fabric",
        "singed hair and soot"
      ],
      "temperature": "superheated air radiating from the active fire",
      "light": "dim, orange glow filtering through thick smoke",
      "air": "thick, hot, smoke-filled environment"
    },
    "accessExtrication": {
      "accessIssues": [
        "active fire blocking clear paths",
        "structural collapse risk due to explosion damage"
      ],
      "extricationNeeded": true,
      "note": ""
    },
    "bystanderDetail": "Other workers are being evacuated in a panicked rush, shouting over the fire noise while others attempt to direct me toward the patient."
  },
  "burn-002": {
    "arrivalNarrative": "I step through the doorway onto the ground floor of the commercial building site where my colleagues are gathered near a collapsed worker by an exposed electrical panel. The air is thick with the acrid smell of ozone and burning insulation, while fresh scorch marks stain the concrete around his entry burn on the right hand and exit burn on the left foot. A coworker stands frozen nearby, eyes wide, as the young male lies motionless and pale under the harsh fluorescent lights.",
    "sensoryCues": {
      "sounds": [
        "muffled traffic from the distant street",
        "hum of industrial ventilation fans",
        "static crackle of residual electrical arcing"
      ],
      "smells": [
        "ozone",
        "burning plastic",
        "faint copper"
      ],
      "temperature": "cool air circulating from open construction vents",
      "light": "fluorescent overheads casting stark, deep shadows across the floor",
      "air": "heavy, still, and charged with ozone"
    },
    "accessExtrication": {
      "accessIssues": [
        "live electrical hazard in immediate vicinity"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The coworkers remain clustered near the entrance and exit wounds, their movements halted by shock as they wait for instructions."
  },
  "y2-004": {
    "arrivalNarrative": "Stepping through the workshop doorway into the warm, ventilated industrial space, I see the 35-year-old man sitting on a workshop chair, visibly distressed and speaking in short sentences from pain. He is surrounded by four colleagues; one first-aider has wet towels ready for his burns while another monitors the still-powered welding equipment nearby. The air carries the sharp, acrid scent of chemical solvents mixed with the smell of singed hair from the recent flash fire.",
    "sensoryCues": {
      "sounds": [
        "rustling of damp towels nearby",
        "distant ambient workshop machinery hum"
      ],
      "smells": [
        "acrid chemical solvent vapour",
        "burnt organic matter",
        "welding fumes"
      ],
      "temperature": "warm ambient workshop air",
      "light": "industrial overhead lighting casting sharp shadows",
      "air": "still but warm and well ventilated"
    },
    "accessExtrication": {
      "accessIssues": [
        "hot surfaces present as hazard",
        "welding equipment still powered"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The colleagues remain close to the patient, one holding damp towels ready while others maintain a vigilant stance around the active welding zone."
  },
  "y1-004": {
    "arrivalNarrative": "I step through the doorway into a small kitchen where a flatmate is present, standing by the stove which remains switched on. The floor is slick with spilled boiling water and a hot pot sits dangerously nearby. My patient stands anxiously in the centre of the room, clutching her left forearm away from her body while tears stream down her face.",
    "sensoryCues": {
      "sounds": [
        "muffled traffic from a distant street",
        "ticking clock on the wall"
      ],
      "smells": [
        "sharp metallic tang of heated water and cooking oil",
        "overpowering scent of raw pasta and damp steam"
      ],
      "temperature": "warm kitchen air radiating from the active stove",
      "light": "evening domestic light filtering through windows",
      "air": "still, moist air heavy with steam"
    },
    "accessExtrication": {
      "accessIssues": [
        "slippery surface from spilled water",
        "hot pot nearby creating a burn hazard"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The flatmate stands near the stove with hands clasped, eyes fixed intently on the patient while breathing rapidly."
  },
  "neuro-001": {
    "arrivalNarrative": "I step through the doorway into the living room of this quiet, well-lit apartment where a clean floor meets slanted morning light. The patient sits slumped in an armchair, his face clearly drooping and unable to form words despite my approach. My husband's wife stands nearby watching, her hands wringing together as she looks at me with wide eyes.",
    "sensoryCues": {
      "sounds": [
        "soft AC hum",
        "ticking clock",
        "distant street traffic"
      ],
      "smells": [],
      "temperature": "cool indoor air",
      "light": "well-lit room with soft shadows",
      "air": "still and quiet"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient slumped in chair"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The wife stands close to the scene, her gaze fixed on her husband's face as she nods slightly when I speak."
  },
  "neuro-003": {
    "arrivalNarrative": "I step through the doorway into a dimly lit bedroom where a young male lies in bed, visibly uncomfortable and guarding his head against the low light. The air is thick with the heat of fever and distress, while his roommate stands nearby watching with anxiety as the patient complains of severe headache and photophobia. I notice non-blanching petechiae on his legs and hear his irritable voice rejecting further assessment despite a GCS of 15.",
    "sensoryCues": {
      "sounds": [
        "muffled traffic from a distant street",
        "roommate's hushed, worried breathing",
        "patient's sharp intake of breath when light touches his eyes"
      ],
      "smells": [
        "stale heat and sweat"
      ],
      "temperature": "feverish warmth radiating from the patient's skin",
      "light": "dim lighting with deep shadows casting over the bed",
      "air": "still, warm apartment air"
    },
    "accessExtrication": {
      "accessIssues": [
        "limited working space",
        "patient guarding head"
      ],
      "extricationNeeded": false,
      "note": "Patient is in bed; no extrication required."
    },
    "bystanderDetail": "The roommate remains close to the bed, eyes fixed on my movements while fidgeting with their hands and speaking softly to calm the patient."
  },
  "multi-001": {
    "arrivalNarrative": "I step through the chaotic debris field where the bus and car wreckage block Sheikh Zayed Road, immediately overwhelmed by the acrid scent of leaking fuel and shattered glass under the harsh morning sun. The scene is a cacophony of shouting bystanders, idling engine noise from passing traffic on the hard shoulder, and distant sirens converging on the overturned bus. Eight patients are visible amidst the scattered debris, ranging from those walking to help to an unconscious individual lying still.",
    "sensoryCues": {
      "sounds": [
        "idling engines from passing traffic on the hard shoulder",
        "distant sirens converging on the site",
        "shouting of uninjured bus passengers and mall security"
      ],
      "smells": [
        "strong smell of leaking fuel",
        "burnt rubber and hot asphalt"
      ],
      "temperature": "intense heat radiating off the sun-baked highway",
      "light": "harsh morning sun casting sharp shadows across the wreckage",
      "air": "stagnant, hot air thick with exhaust fumes and dust"
    },
    "accessExtrication": {
      "accessIssues": [
        "debris scattered 50m across the highway limiting approach",
        "downed street light with exposed wires near the wreckage"
      ],
      "extricationNeeded": true,
      "note": "One patient remains trapped in the severely damaged car."
    },
    "bystanderDetail": "Approximately 40 people stand nearby; some uninjured bus passengers are gathered close to the vehicle while others have moved back toward the mall perimeter, creating a dense, anxious crowd rather than an open evacuation zone."
  },
  "cardiac-ecg-001": {
    "arrivalNarrative": "I step into the quiet apartment to find the patient sitting on the sofa, leaning forward with his hands clutching his chest and abdomen. He is pale and soaked in a cold sweat, looking miserable despite being alert. The air feels heavy with the smell of stale vomit and the faint scent of antacid tablets he has already taken.",
    "sensoryCues": {
      "sounds": [
        "muffled traffic from a distant street",
        "the low hum of the air conditioner",
        "a soft ticking clock"
      ],
      "smells": [
        "stale vomit",
        "antacid tablets"
      ],
      "temperature": "cool, conditioned apartment air",
      "light": "dim, early-morning light filtering through blinds",
      "air": "still, slightly stale"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient on sofa"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "His wife stands nearby, looking visibly anxious and watching me intently as I approach the patient."
  },
  "neuro-004": {
    "arrivalNarrative": "I step onto the dorm floor into a dimly lit room where a young woman lies in bed, her face flushed and distressed by any light I bring with me. The air is heavy with the scent of stale sweat and antiseptic from the roommate's frantic attempts to care for her. Her roommates stand nearby, their voices hushed as they describe two days of escalating headache and fever before she became confused.",
    "sensoryCues": {
      "sounds": [
        "muffled traffic from a distant street",
        "roommate's soft, urgent whispering",
        "hum of the dorm air conditioning"
      ],
      "smells": [
        "stale sweat",
        "feverish body heat"
      ],
      "temperature": "40°C fever radiating intensely from the patient's skin",
      "light": "dimly lit room with harsh shadows cast by my flashlight",
      "air": "still, hot air thick with distress"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient distressed by light"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The roommate stands near the bed, clutching a pillow as she watches my approach with wide, fearful eyes and speaks only in low tones about the patient's confusion."
  },
  "fall-002": {
    "arrivalNarrative": "I step through the villa doorway into a quiet interior where an elderly man lies drowsy at the base of three marble steps, with his daughter and grandchildren gathered nearby. The air is warm from the evening heat, carrying the faint, metallic scent of old blood mixing with vomit on the floor. I notice the walking frame abandoned near the entrance and observe bruising to the patient's right temple as he responds only to my voice.",
    "sensoryCues": {
      "sounds": [
        "muffled traffic from a distant street",
        "soft hum of the villa's air conditioning",
        "low murmur of concerned family voices"
      ],
      "smells": [
        "stale vomit",
        "faint metallic tang of blood"
      ],
      "temperature": "warm evening air",
      "light": "dim interior lighting with deep shadows near the steps",
      "air": "still and warm"
    },
    "accessExtrication": {
      "accessIssues": [
        "marble steps at the entrance",
        "family gathered around the patient"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The daughter stands close, her voice tight with worry as she recounts how quickly he fell asleep after initially talking to them."
  },
  "y2-003": {
    "arrivalNarrative": "I step through the doorway into a quiet Abu Dhabi home where the air feels still and cool. The elderly man sits sideways on an upholstered seating piece, his clothes slightly dishevelled while he remains alert but visibly struggles to speak clearly. His left side hangs limp with obvious weakness, contrasting sharply with his otherwise calm demeanor as his wife stands nearby, cooperative and watching my every move.",
    "sensoryCues": {
      "sounds": [
        "muffled traffic from a distant street",
        "soft AC hum",
        "patient's slurred attempts to answer questions"
      ],
      "smells": [],
      "temperature": "cooled by air conditioning",
      "light": "indoor ambient light filtering through windows",
      "air": "still, filtered indoor air"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient sitting sideways on upholstered seating"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The wife stands close by, her hands clasped together as she listens intently to my assessment, occasionally nodding at my questions without interrupting the flow."
  },
  "litfl-012": {
    "arrivalNarrative": "I step through the doorway into a small, warm shared staff accommodation bathroom where I find the young male supine on the floor with vomitus around his mouth. My roommate stands nearby looking anxious, having waited two hours since hearing a loud thud when he first discovered the collapse. The room is quiet except for the hum of the air conditioning, offering no signs of external trauma or blood.",
    "sensoryCues": {
      "sounds": [
        "AC hum",
        "roommate's anxious breathing"
      ],
      "smells": [
        "sour vomitus"
      ],
      "temperature": "warm indoor air",
      "light": "indoor artificial lighting",
      "air": "still, confined bathroom air"
    },
    "accessExtrication": {
      "accessIssues": [
        "slippery bathroom floor"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The roommate remains standing near the patient, displaying visible anxiety after waiting two hours since the loud thud was heard."
  },
  "neuro-002": {
    "arrivalNarrative": "I step through the doorway into a quiet bedroom where the mother stands by the bed, her daughter lying post-ictal and confused following a two-minute seizure. I see the young female on the mattress with visible signs of biting, including a tongue laceration, while she breathes rapidly in the dim evening light. The room is otherwise normal, filled only with the residual confusion of the event and the concerned presence of her parents.",
    "sensoryCues": {
      "sounds": [
        "low AC hum",
        "muffled distant traffic from Al Ain streets"
      ],
      "smells": [],
      "temperature": "cool evening air inside the villa",
      "light": "dim ambient evening light filtering through curtains",
      "air": "still, quiet interior air"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient is on a bed"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The parents remain nearby, their micro-behaviour showing quiet concern as they watch the confused patient without moving from the immediate area."
  },
  "fall-001": {
    "arrivalNarrative": "I step through the doorway into a small apartment where the air feels still and cool from the morning AC. The bathroom floor is wet and visible, with a rug bunched up near the entrance. My partner is already assessing the elderly female lying supine on the tiles, her left hip clearly deformed.",
    "sensoryCues": {
      "sounds": [
        "quiet apartment hum",
        "ticking clock",
        "muffled traffic from a distant street"
      ],
      "smells": [
        "clean shower scent mixed with damp tile"
      ],
      "temperature": "cool morning air",
      "light": "soft morning light filtering through the window",
      "air": "still, cool apartment air"
    },
    "accessExtrication": {
      "accessIssues": [
        "wet bathroom floor",
        "narrow space"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The daughter stands nearby, her hands wringing together as she watches our assessment with a look of quiet distress."
  },
  "ruleout-001": {
    "arrivalNarrative": "I step through the doorway into a well-lit, air-conditioned apartment where a young man sits at his desk looking anxious but alert. The space is modern and quiet, with no other people present except for the patient himself. He tells me he felt sharp chest pain after working long hours on the computer, which worsens when he moves.",
    "sensoryCues": {
      "sounds": [
        "soft hum of air conditioning",
        "ticking clock on the wall",
        "distant muffled traffic from a street outside"
      ],
      "smells": [],
      "temperature": "cool air-conditioned environment",
      "light": "bright artificial lighting with no deep shadows",
      "air": "still, filtered apartment air"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient seated at desk"
      ],
      "extricationNeeded": false,
      "note": "Patient is seated and alert; no extrication required."
    },
    "bystanderDetail": "No bystanders are present on the scene."
  },
  "cardiac-ecg-002": {
    "arrivalNarrative": "I step onto the office corridor floor where a colleague stands waiting by an upholstered seating area. The patient sits calmly but looks anxious, appearing comfortable despite his recent chest discomfort that has since resolved. Several colleagues mill about nearby, observing the situation quietly.",
    "sensoryCues": {
      "sounds": [
        "muffled traffic from a distant street",
        "office HVAC hum",
        "soft shuffling of colleagues' footsteps"
      ],
      "smells": [],
      "temperature": "cool, climate-controlled air",
      "light": "bright overhead office lighting with deep shadows under the furniture",
      "air": "still, recycled air"
    },
    "accessExtrication": {
      "accessIssues": [
        "None"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "Several colleagues stand nearby, their postures relaxed but attentive as they wait for my assessment without intruding on the patient's space."
  },
  "fall-003": {
    "arrivalNarrative": "I step through the doorway into a Villa where the air-conditioning has been running since the night before, leaving the atmosphere cold and still. The neighbour stands nearby, looking distressed as I assess the frail elderly woman lying on the cool bathroom tiles. She is pale and shivering under my gaze, with a shortened right leg clearly visible against the wet floor.",
    "sensoryCues": {
      "sounds": [
        "soft hum of air-conditioning",
        "distant traffic from a neighbouring street",
        "patient's distressed breathing"
      ],
      "smells": [
        "cold, stagnant air"
      ],
      "temperature": "chill radiating from the AC-ventilated room",
      "light": "muffled morning light filtering through closed windows",
      "air": "cool, still air with a faint hint of stale urine"
    },
    "accessExtrication": {
      "accessIssues": [
        "wet bathroom floor presents slip hazard",
        "confined space limits movement"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The neighbour remains close by, shifting their weight nervously and staring at the patient's legs as if waiting for an instruction on how to help."
  },
  "y1-016": {
    "arrivalNarrative": "I step through the doorway onto the cool floor of the ground-floor majlis, where an elderly man sits alert but frustrated in his armchair, unable to lift his right arm. The wife and adult son stand nearby, their worry palpable yet managed as they witness the slurred speech and obvious facial droop. I scan the room for hazards before focusing on the patient whose sudden onset occurred while he was reading.",
    "sensoryCues": {
      "sounds": [
        "quiet air-conditioning hum",
        "muffled traffic from a distant street",
        "paper rustling in the patient's lap"
      ],
      "smells": [],
      "temperature": "cool air-conditioned villa interior",
      "light": "soft morning light filtering through windows",
      "air": "still, filtered interior air"
    },
    "accessExtrication": {
      "accessIssues": [
        "family gathered around the patient limiting immediate approach"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The wife remains calm but worried while the adult son stands guard beside her; neither moves to a specific spot but hovers near the armchair watching the events unfold."
  },
  "y1-017": {
    "arrivalNarrative": "I step onto the polished office floor to find the young man lying beside a desk, drowsy and confused after the seizure has subsided. The colleague who witnessed the event is present nearby, explaining that he missed his medication due to work pressure. I note the immediate hazards of sharp desk corners around him while confirming the space has been cleared by others.",
    "sensoryCues": {
      "sounds": [
        "low hum of air conditioning",
        "muffled traffic from distant streets",
        "quiet office chatter fading in background"
      ],
      "smells": [
        "clean, sterile scent of carpet and floor polish"
      ],
      "temperature": "cool, conditioned air circulating through the open-plan space",
      "light": "bright afternoon office lighting casting sharp shadows across the floor",
      "air": "still, filtered air with no exhaust fumes"
    },
    "accessExtrication": {
      "accessIssues": [
        "sharp desk corners nearby requiring careful positioning"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The colleague stands a few paces away, recounting how the patient stiffened and convulsed for about ninety seconds before falling into this confused state."
  },
  "y2-006": {
    "arrivalNarrative": "I step through the doorway into the air-conditioned golf clubhouse lounge, finding the patient seated comfortably beside his golf bag with two of his partners nearby. The episode has resolved as he appears well and alert, yet he insists on continuing to play despite the recent right-sided clumsiness and slurred speech. No hazards are present in this public setting, and there are no signs of trauma from the brief drop of his club.",
    "sensoryCues": {
      "sounds": [
        "soft background chatter from other patrons",
        "hum of the air conditioning system"
      ],
      "smells": [
        "faint scent of cleaning products or polish"
      ],
      "temperature": "cool, conditioned indoor air",
      "light": "bright, diffused ambient light from large windows",
      "air": "still and filtered"
    },
    "accessExtrication": {
      "accessIssues": [
        "open public space"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The two golf partners stand nearby having just witnessed the episode, watching me with a mix of relief that he is speaking clearly now and concern for his safety."
  },
  "psych-001": {
    "arrivalNarrative": "I step through the doorway into a living room where a young woman paces rapidly, her face flushed and tearful. The air is thick with the scent of anxiety as she trembles, unable to settle while arguing with her husband nearby. Two small children are present in the room, their presence adding to the chaotic energy but not yet engaged in the immediate distress.",
    "sensoryCues": {
      "sounds": [
        "rapid, shallow breathing",
        "husband's frustrated voice",
        "children whispering quietly"
      ],
      "smells": [],
      "temperature": "cool indoor air from central conditioning",
      "light": "soft evening light filtering through windows",
      "air": "still, slightly stale apartment air"
    },
    "accessExtrication": {
      "accessIssues": [
        "staff/bystander managing access"
      ],
      "extricationNeeded": false,
      "note": "Coordinate with husband to secure area before approaching patient."
    },
    "bystanderDetail": "The husband stands close to the patient, his posture tense and voice raised in argument, while the two children remain near the periphery of the room, watching the scene unfold with wide eyes."
  },
  "postd-001": {
    "arrivalNarrative": "I step through the doorway into a quiet Ajman home where the patient sits alone on upholstered seating in the living room, visibly uncomfortable and flushed. The air is thick with the scent of stale sweat and the sharp, metallic tang of purulent drainage oozing from his erythematous abdominal wound. His wife stands nearby, her hands wringing together as she watches him feverishly.",
    "sensoryCues": {
      "sounds": [
        "muffled traffic from a distant street",
        "low hum of air conditioning",
        "patient's shallow, laboured breathing"
      ],
      "smells": [
        "urine",
        "stale sweat",
        "pus"
      ],
      "temperature": "still, hot afternoon heat radiating from the patient",
      "light": "bright afternoon sun casting deep shadows across the floor",
      "air": "still, hot, exhaust-stained air"
    },
    "accessExtrication": {
      "accessIssues": [
        "patient seated on upholstered seating"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The wife remains stationary near the patient, her micro-behaviour showing anxiety through constant hand-wringing and fixed gaze on the wound."
  },
  "y1-019": {
    "arrivalNarrative": "I step through the doorway into a cool villa where an older woman sits alert and composed beside a prayer mat, guarding her left hip after tripping over its edge. The polished floor reflects the morning light, showing no signs of dizziness or collapse around her. She is calm but visibly uncomfortable from sitting heavily on her bruised hip.",
    "sensoryCues": {
      "sounds": [
        "soft AC hum",
        "distant street traffic muffled by walls",
        "husband speaking quietly"
      ],
      "smells": [],
      "temperature": "cool interior air",
      "light": "morning light filtering through windows",
      "air": "still, clean villa air"
    },
    "accessExtrication": {
      "accessIssues": [
        "polished floor increasing slip risk",
        "prayer mat tripping hazard"
      ],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The husband stands nearby, calm and attentive to the patient's needs."
  }
};
