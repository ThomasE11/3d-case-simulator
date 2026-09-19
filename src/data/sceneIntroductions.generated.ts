/**
 * sceneIntroductions.generated.ts
 *
 * GENERATED — do not hand-edit. Produced by `scripts/generate-scene-intros.mjs`
 * (local Ollama model), then reviewed. Keyed by case id, merged additively at
 * render time. Re-run the script to regenerate; it overwrites this file.
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
      "accessIssues": [],
      "extricationNeeded": false,
      "note": ""
    },
    "bystanderDetail": "The parents hover nearby without stepping forward, their bodies tense with concern as they watch his chest rise and fall. They stand close but do not touch the patient or speak to him directly."
  }
};

