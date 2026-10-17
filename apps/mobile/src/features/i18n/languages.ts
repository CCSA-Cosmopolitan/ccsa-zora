export type SupportedLanguage = "en" | "ha" | "yo" | "ig" | "pcm";

export interface LanguageMeta {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  speechSample: string;
}

export const LANGUAGES: LanguageMeta[] = [
  {
    code: "ha",
    name: "Hausa",
    nativeName: "Hausa",
    speechSample: "Barka da zuwa Zora. Zan taimake ka da gonarka da tsirranka a kowane lokaci.",
  },
  {
    code: "yo",
    name: "Yorùbá",
    nativeName: "Yorùbá",
    speechSample: "Kaabo si Zora. Emi yoo ran ọ lọwọ pẹlu oko rẹ ati awọn ohun ọgbin rẹ.",
  },
  {
    code: "ig",
    name: "Igbo",
    nativeName: "Igbo",
    speechSample: "Nnọọ na Zora. M ga-enyere gị aka n'ọrụ ugbo gị na nchekwa ihe ọkụkụ gị.",
  },
  {
    code: "pcm",
    name: "Nigerian Pidgin",
    nativeName: "Pidgin",
    speechSample: "Welcome to Zora. I go help you check your farm and know your plants well well.",
  },
  {
    code: "en",
    name: "English",
    nativeName: "English",
    speechSample: "Welcome to Zora, your farming companion. Tap the microphone and tell me what is happening on your farm.",
  },
];

export interface TranslationStrings {
  back: string;
  yourFarmingCompanion: string;
  homeTitle: string;
  homeSubtitle: string;
  hearHowToUse: string;
  orTypeHere: string;
  tapToSpeak: string;
  askInOwnWords: string;
  stopRecording: string;
  listeningSpeakNow: string;
  identifyPlant: string;
  identifyPlantSub: string;
  checkFarmProblem: string;
  checkFarmProblemSub: string;
  zoraLive: string;
  zoraLiveSub: string;
  tabs: {
    askZora: string;
    plants: string;
    farm: string;
    language: string;
  };
  languagePage: {
    title: string;
    subtitle: string;
    hear: string;
    selected: string;
    disclaimer: string;
  };
  plantsPage: {
    title: string;
    cameraInstruction: string;
    takePhoto: string;
    choosePhoto: string;
    hearCameraGuidance: string;
    possibleMatch: string;
    listenInfo: string;
    safetyWarning: string;
    healthNutrition: string;
    edibility: string;
    toxicitySafety: string;
    origin: string;
    growingCare: string;
  };
  farmPage: {
    title: string;
    subtitle: string;
    cropDisease: string;
    cropDiseaseSub: string;
    farmArea: string;
    farmAreaSub: string;
    soil: string;
    soilSub: string;
    hearChoices: string;
    soilTitle: string;
    listen: string;
    yourSoilPhoto: string;
    takeAnother: string;
    soilObservation: string;
    zoraAsks: string;
    soilQuestion: string;
  };
  chat: {
    you: string;
    zora: string;
    listenResponse: string;
    takePhoto: string;
  };
}

export const TRANSLATIONS: Record<SupportedLanguage, TranslationStrings> = {
  en: {
    back: "Back",
    yourFarmingCompanion: "Your farming companion",
    homeTitle: "What can I help you with today?",
    homeSubtitle: "Tap the microphone below. Tell Zora what is happening on your farm.",
    hearHowToUse: "Hear how to use Zora",
    orTypeHere: "Or type here",
    tapToSpeak: "Tap to speak",
    askInOwnWords: "Ask in your own words",
    stopRecording: "Stop recording",
    listeningSpeakNow: "Listening... Speak now",
    identifyPlant: "Identify a plant",
    identifyPlantSub: "Take a photo of a plant",
    checkFarmProblem: "Check a farm problem",
    checkFarmProblemSub: "Crops, farm area or soil",
    zoraLive: "Zora Live",
    zoraLiveSub: "Talk back and forth with Zora",
    tabs: {
      askZora: "Ask Zora",
      plants: "Plants",
      farm: "Farm",
      language: "Language",
    },
    languagePage: {
      title: "Choose your language",
      subtitle: "Use the language you know best. Tap Hear to listen to a sample.",
      hear: "Hear",
      selected: "Selected",
      disclaimer: "Your choice applies to app guidance, spoken questions and answers, and all plant and farm information.",
    },
    plantsPage: {
      title: "Identify a plant",
      cameraInstruction: "Hold still. Keep the leaves inside the frame.",
      takePhoto: "Take photo",
      choosePhoto: "Choose existing photo",
      hearCameraGuidance: "Hear camera guidance",
      possibleMatch: "Possible match · not confirmed",
      listenInfo: "Listen to plant information",
      safetyWarning: "Do not eat a plant based only on a photo. Ask a local plant expert to confirm it first.",
      healthNutrition: "Health & nutrition",
      edibility: "Edibility",
      toxicitySafety: "Toxicity & safety",
      origin: "Origin",
      growingCare: "Growing & care",
    },
    farmPage: {
      title: "What needs checking?",
      subtitle: "Choose one. Zora will guide you through the next step.",
      cropDisease: "Crop disease or pests",
      cropDiseaseSub: "Show a damaged leaf or insect.",
      farmArea: "Farm area",
      farmAreaSub: "Show the part of your farm that worries you.",
      soil: "Soil",
      soilSub: "Show the soil where your crop grows.",
      hearChoices: "Hear these choices",
      soilTitle: "Soil check",
      listen: "Listen",
      yourSoilPhoto: "Your soil photo",
      takeAnother: "Take another",
      soilObservation: "The surface looks dry. A photo cannot measure soil nutrients or pH. A soil test may be needed.",
      zoraAsks: "Zora asks",
      soilQuestion: "When did it last rain here?",
    },
    chat: {
      you: "You",
      zora: "Zora",
      listenResponse: "Listen to response",
      takePhoto: "Take photo",
    },
  },
  ha: {
    back: "Baya",
    yourFarmingCompanion: "Mataimakin gonarka",
    homeTitle: "Me zan taimaka maka da shi yau?",
    homeSubtitle: "Danna abin magana da ke ƙasa. Gaya wa Zora abin da ke faruwa a gonarka.",
    hearHowToUse: "Saurari yadda ake amfani da Zora",
    orTypeHere: "Ko rubuta a nan",
    tapToSpeak: "Danna ka yi magana",
    askInOwnWords: "Yi magana da Hausa",
    stopRecording: "Dakata da magana",
    listeningSpeakNow: "Ina saurare... Yi magana yanzu",
    identifyPlant: "Gano sunan tsirrai",
    identifyPlantSub: "Dauki hoton tsirrai",
    checkFarmProblem: "Bincika matsalar gona",
    checkFarmProblemSub: "Amfanin gona, fili ko ƙasa",
    zoraLive: "Zora Kai Tsaye",
    zoraLiveSub: "Yi magana kai tsaye da Zora",
    tabs: {
      askZora: "Tambayi Zora",
      plants: "Tsirrai",
      farm: "Gona",
      language: "Harshe",
    },
    languagePage: {
      title: "Zaɓi harshenka",
      subtitle: "Yi amfani da harshen da ka fi sani. Danna Saurara don jin misali.",
      hear: "Saurara",
      selected: "An zaɓa",
      disclaimer: "Zaɓin ku zai shafi duk jagora, amsoshin magana, da bayanan amfanin gona.",
    },
    plantsPage: {
      title: "Gano sunan tsirrai",
      cameraInstruction: "Tsayar da kyau. Tabbatar ganyen yana cikin tsakiya.",
      takePhoto: "Dauki hoto",
      choosePhoto: "Zaɓi hoto daga waya",
      hearCameraGuidance: "Saurari jagorar kamara",
      possibleMatch: "Wataƙila wannan ne · ba a tabbatar ba",
      listenInfo: "Saurari bayanin tsirrai",
      safetyWarning: "Kada ka ci wani tsirrai kawai don ganin hotonsa. Tambayi masanin yankinku da farko.",
      healthNutrition: "Lafiya da abinci mai gina jiki",
      edibility: "Cin abinci",
      toxicitySafety: "Hatsari da guba",
      origin: "Asali da guri",
      growingCare: "Nomawa da kula",
    },
    farmPage: {
      title: "Me kake son a duba?",
      subtitle: "Zaɓi ɗaya. Zora zai jagorance ka mataki-mataki.",
      cropDisease: "Cutar amfanin gona ko kwari",
      cropDiseaseSub: "Nuna ganye da ya lalace ko kwaro.",
      farmArea: "Fannin gona",
      farmAreaSub: "Nuna ɓangaren gonarka da ke damunka.",
      soil: "Ƙasar gona",
      soilSub: "Nuna ƙasar da amfanin gonarka ke girma.",
      hearChoices: "Saurari waɗannan zaɓuɓɓuka",
      soilTitle: "Duba ƙasar gona",
      listen: "Saurara",
      yourSoilPhoto: "Hoton ƙasarka",
      takeAnother: "Dauki wani hoton",
      soilObservation: "Ƙasar tana da bushewa sosai. Hoto ba zai iya auna sinadarin ƙasa ba. Yana iya bukatar gwajin dakin gwaje-gwaje.",
      zoraAsks: "Zora yana tambaya",
      soilQuestion: "Yaushe aka yi ruwan sama na karshe a nan?",
    },
    chat: {
      you: "Kai",
      zora: "Zora",
      listenResponse: "Saurari amsar",
      takePhoto: "Dauki hoto",
    },
  },
  yo: {
    back: "Pada",
    yourFarmingCompanion: "Oluranlọwọ oko rẹ",
    homeTitle: "Kini mo le ran ọ lọwọ pẹlu loni?",
    homeSubtitle: "Tẹ maiki ti o wa ni isalẹ. Sọ fun Zora ohun ti n ṣẹlẹ lori oko rẹ.",
    hearHowToUse: "Gbọ bi a ṣe n lo Zora",
    orTypeHere: "Tabi tẹ ọrọ si ibi",
    tapToSpeak: "Tẹ lati sọrọ",
    askInOwnWords: "Sọrọ ni ede Yorùbá",
    stopRecording: "Duro gbigbasilẹ",
    listeningSpeakNow: "Mo n gbọ... Sọrọ ni bayi",
    identifyPlant: "Ṣe idanimọ ọgbin",
    identifyPlantSub: "Ya fọto ọgbin kan",
    checkFarmProblem: "Ṣayẹwo iṣoro oko",
    checkFarmProblemSub: "Irugbin, agbegbe oko tabi erupẹ",
    zoraLive: "Zora Ni Gbọngàn",
    zoraLiveSub: "Bọrọ sọrọ taara pẹlu Zora",
    tabs: {
      askZora: "Beere lọwọ Zora",
      plants: "Awọn ohun ọgbin",
      farm: "Oko",
      language: "Ede",
    },
    languagePage: {
      title: "Yan ede rẹ",
      subtitle: "Lo ede ti o mọ julọ. Tẹ Gbọ lati gbọ apẹẹrẹ ohun.",
      hear: "Gbọ",
      selected: "Ti yan",
      disclaimer: "Yiyan rẹ yoo kan gbogbo itọsọna ohun, ibeere ati idahun, ati alaye oko.",
    },
    plantsPage: {
      title: "Ṣe idanimọ ọgbin",
      cameraInstruction: "Duro jẹẹ. Jẹ ki awọn ewe wa ninu fireemu.",
      takePhoto: "Ya fọto",
      choosePhoto: "Yan fọto to wa tẹlẹ",
      hearCameraGuidance: "Gbọ itọsọna kamẹra",
      possibleMatch: "O ṣee ṣe ki o jẹ eyi · ko tii daju",
      listenInfo: "Gbọ alaye ọgbin",
      safetyWarning: "Maṣe jẹ ọgbin nitori fọto nikan. Beere lọwọ alamọja oko agbegbe rẹ lakọkọ.",
      healthNutrition: "Ilera & Ounjẹ ti o dara",
      edibility: "Jijẹ",
      toxicitySafety: "Majele & Aabo",
      origin: "Orisun & Agbegbe",
      growingCare: "Gbingbin & Itọju",
    },
    farmPage: {
      title: "Kini o nilo ayẹwo?",
      subtitle: "Yan ọkan. Zora yoo dari rẹ nipasẹ igbesẹ ti o tẹle.",
      cropDisease: "Arun irugbin tabi kokoro",
      cropDiseaseSub: "Fi ewe ti o bajẹ tabi kokoro han.",
      farmArea: "Agbegbe oko",
      farmAreaSub: "Fi apakan oko rẹ ti o n da ọ loju han.",
      soil: "Erupẹ / Ilẹ",
      soilSub: "Fi ilẹ ti irugbin rẹ n dagba si han.",
      hearChoices: "Gbọ awọn aṣayan wọnyi",
      soilTitle: "Ayẹwo ilẹ",
      listen: "Gbọ",
      yourSoilPhoto: "Fọto ilẹ rẹ",
      takeAnother: "Ya omiran",
      soilObservation: "Ilẹ naa dabi ẹnipe o gbẹ. Fọto ko le wọn ounjẹ tabi pH inu ilẹ. O le nilo ayẹwo idanwo.",
      zoraAsks: "Zora beere",
      soilQuestion: "Nigba wo ni ojo rọ kẹhin nibi?",
    },
    chat: {
      you: "Iwọ",
      zora: "Zora",
      listenResponse: "Gbọ idahun",
      takePhoto: "Ya fọto",
    },
  },
  ig: {
    back: "Azụ",
    yourFarmingCompanion: "Enyi ọrụ ugbo gị",
    homeTitle: "Kedu ihe m nwere ike inyere gị taa?",
    homeSubtitle: "Pịa maikrofon dị n'ala. Gwa Zora ihe na-eme n'ugbo gị.",
    hearHowToUse: "Nụrụ ka esi eji Zora",
    orTypeHere: "Ma ọ bụ pịnye ebe a",
    tapToSpeak: "Pịa ikwu okwu",
    askInOwnWords: "Kwuokwa n'Igbo",
    stopRecording: "Kwụsị ndekọ",
    listeningSpeakNow: "Ana m ege ntị... Kwuo ugbua",
    identifyPlant: "Chọpụta osisi",
    identifyPlantSub: "Seta foto nke osisi",
    checkFarmProblem: "Nyochaa nsogbu ugbo",
    checkFarmProblemSub: "Ihe ọkụkụ, ala ugbo ma ọ bụ aja",
    zoraLive: "Zora Ndụ",
    zoraLiveSub: "Kparịta ụka kpọmkwem na Zora",
    tabs: {
      askZora: "Jụọ Zora",
      plants: "Osisi",
      farm: "Ugbo",
      language: "Asụsụ",
    },
    languagePage: {
      title: "Họrọ asụsụ gị",
      subtitle: "Jiri asụsụ ị ma nke ọma. Pịa Nụrụ ka ị nụrụ ihe atụ.",
      hear: "Nụrụ",
      selected: "Họrọla",
      disclaimer: "Nhọrọ gị ga-emetụta ntụzịaka niile, ajụjụ na azịza ọnụ, na ozi ihe ọkụkụ niile.",
    },
    plantsPage: {
      title: "Chọpụta osisi",
      cameraInstruction: "Guzo chịm. Debe akwụkwọ osisi ahụ n'etiti.",
      takePhoto: "Seta foto",
      choosePhoto: "Họrọ foto dịbu",
      hearCameraGuidance: "Nụrụ ntụziaka igwefoto",
      possibleMatch: "O nwere ike ịbụ nke a · aka akwadoghị",
      listenInfo: "Nụrụ nkọwa osisi",
      safetyWarning: "Erila osisi dabere naanị na foto. Jụọ ọkachamara ugbo dị gị nso na mbụ.",
      healthNutrition: "Ahụike & Nri bara uru",
      edibility: "Iri nri",
      toxicitySafety: "Nsị & Nchedo",
      origin: "Mmalite & Ebe o si",
      growingCare: "Ịkụ & Nlekọta",
    },
    farmPage: {
      title: "Kedu ihe kwesịrị nlele?",
      subtitle: "Họrọ otu. Zora ga-eduzi gị na nzọụkwụ ọzọ.",
      cropDisease: "Ọrịa ihe ọkụkụ ma ọ bụ ahụhụ",
      cropDiseaseSub: "Gosi akwụkwọ mebiri emebi ma ọ bụ ahụhụ.",
      farmArea: "Mpaghara ugbo",
      farmAreaSub: "Gosi akụkụ ugbo gị na-echegbu gị.",
      soil: "Ala / Aja ugbo",
      soilSub: "Gosi ala ebe ihe ọkụkụ gị na-eto.",
      hearChoices: "Nụrụ nhọrọ ndị a",
      soilTitle: "Nlele ala",
      listen: "Nụrụ",
      yourSoilPhoto: "Foto ala gị",
      takeAnother: "Seta ọzọ",
      soilObservation: "Ala ahụ dị ka ọ kọrọ nkụ. Foto enweghị ike ịlele nri ma ọ bụ pH dị n'ala. Enwere ike ịdị mkpa ule laabu.",
      zoraAsks: "Zora na-ajụ",
      soilQuestion: "Kedu mgbe mmiri zoro ikpeazụ ebe a?",
    },
    chat: {
      you: "Gị",
      zora: "Zora",
      listenResponse: "Nụrụ azịza",
      takePhoto: "Seta foto",
    },
  },
  pcm: {
    back: "Back",
    yourFarmingCompanion: "Your farm padi",
    homeTitle: "Wetin I fit help you do today?",
    homeSubtitle: "Tap the mic for down. Tell Zora wetin dey happen for your farm.",
    hearHowToUse: "Hear how to use Zora",
    orTypeHere: "Or type here",
    tapToSpeak: "Tap make you talk",
    askInOwnWords: "Talk for Pidgin",
    stopRecording: "Stop recording",
    listeningSpeakNow: "I dey hear you... Talk now",
    identifyPlant: "Know which plant be this",
    identifyPlantSub: "Snap photo of the plant",
    checkFarmProblem: "Check farm wahala",
    checkFarmProblemSub: "Crops, farm land or sand/soil",
    zoraLive: "Zora Live Talk",
    zoraLiveSub: "Talk direct face-to-face with Zora",
    tabs: {
      askZora: "Ask Zora",
      plants: "Plants",
      farm: "Farm",
      language: "Language",
    },
    languagePage: {
      title: "Choose your language",
      subtitle: "Pick the language wey you sabi pass. Tap Hear make you hear sample.",
      hear: "Hear",
      selected: "You don choose am",
      disclaimer: "Your choice go work for all voice talk, questions and answers, and all farm advice.",
    },
    plantsPage: {
      title: "Know which plant be this",
      cameraInstruction: "Hold body still. Put the leaf well inside the box.",
      takePhoto: "Snap photo",
      choosePhoto: "Pick photo from phone",
      hearCameraGuidance: "Hear how to snap",
      possibleMatch: "E be like say na this one · we never 100% sure",
      listenInfo: "Hear wetin the plant be",
      safetyWarning: "No chop any plant just because of photo. Ask farm expert for your side first.",
      healthNutrition: "Health & Body benefit",
      edibility: "If you fit chop am",
      toxicitySafety: "Poison & Danger alert",
      origin: "Where e come from for Nigeria",
      growingCare: "How to plant and look after am",
    },
    farmPage: {
      title: "Wetin you want make we check?",
      subtitle: "Choose one. Zora go guide you one by one.",
      cropDisease: "Crop sickness or insects",
      cropDiseaseSub: "Show damaged leaf or insect wey dey chop am.",
      farmArea: "Farm area",
      farmAreaSub: "Show the part of your farm wey dey give you headache.",
      soil: "Sand / Ground",
      soilSub: "Show the ground where your plant dey grow.",
      hearChoices: "Hear these choices",
      soilTitle: "Check ground",
      listen: "Hear",
      yourSoilPhoto: "Your soil photo",
      takeAnother: "Snap another one",
      soilObservation: "The ground dry well well. Photo no fit tell us all the nutrient inside ground. E fit need lab test.",
      zoraAsks: "Zora dey ask",
      soilQuestion: "When rain fall last for here?",
    },
    chat: {
      you: "You",
      zora: "Zora",
      listenResponse: "Hear the answer",
      takePhoto: "Snap photo",
    },
  },
};
