import { SupportedLanguage } from "../i18n/languages";

export interface PlantProfile {
  id: string;
  commonName: Record<SupportedLanguage, string>;
  scientificName: string;
  imageUri: string;
  healthNutrition: Record<SupportedLanguage, string>;
  edibility: Record<SupportedLanguage, string>;
  toxicitySafety: Record<SupportedLanguage, string>;
  origin: Record<SupportedLanguage, string>;
  growingCare: Record<SupportedLanguage, string>;
}

export const NIGERIAN_PLANTS: PlantProfile[] = [
  {
    id: "moringa",
    commonName: {
      en: "Moringa",
      ha: "Zogale",
      yo: "Ewe Igbale",
      ig: "Okwe Oyibo",
      pcm: "Moringa",
    },
    scientificName: "Moringa oleifera",
    imageUri: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=800&auto=format&fit=crop&q=80",
    healthNutrition: {
      en: "Leaves provide nutrients such as vitamin A, vitamin C, calcium, and iron. They are nutritious food, not a cure for illness.",
      ha: "Ganyen zogale yana cike da sinadaran bitamin A da ƙarfe (iron). Abinci ne mai gina jiki sosai.",
      yo: "Awọn ewe naa n pese awọn ounjẹ to dara bii vitamin A ati iron. Wọn jẹ ounjẹ to dara fun ara.",
      ig: "Akwụkwọ ya nwere vitamin A na iron bara ụba nke ukwuu maka ahụike.",
      pcm: "The leaves get vitamin A, C and iron well well. Na very healthy food to make body strong.",
    },
    edibility: {
      en: "Leaves, young tender pods, and flowers are used as food in soups, salads, and tea.",
      ha: "Ana amfani da ganye da ƴaƴan zogale a miya ko a ci da kuli-kuli.",
      yo: "A n lo awọn ewe ati eso kekere ninu ọbẹ ati ounjẹ.",
      ig: "A na-eji akwụkwọ na mkpụrụ ya eme ofe na nri dị iche iche.",
      pcm: "You fit cook the leaves put for soup, or drink am like tea.",
    },
    toxicitySafety: {
      en: "Avoid roots and high doses of bark; they contain alkaloid compounds that may be harmful.",
      ha: "A guji cin saiwa da ɓawon bishiyar da yawa domin yana iya cutarwa.",
      yo: "Yago fun awọn gbongbo ati epo igi pupọ nitori o le lewu fun ara.",
      ig: "Zere mgbọrọgwụ na azụ osisi ahụ nke ukwuu n'ihi na o nwere ike imerụ ahụ.",
      pcm: "Make you no chop the root or tree skin plenty, e fit cause problem.",
    },
    origin: {
      en: "Native to South Asia; widely cultivated across Northern and Western Nigeria.",
      ha: "Asalinsa daga Kudancin Asiya; yanzu ana nomawa sosai a Arewacin Najeriya.",
      yo: "O wa lati Guusu Asia; a si n gbin pupọ ni gbogbo ilẹ Naijiria.",
      ig: "O sitere na South Asia; a na-akụkwa ya nke ọma n'akụkụ niile nke Nigeria.",
      pcm: "Origin na South Asia, but e dey grow everywhere for Nigeria now.",
    },
    growingCare: {
      en: "Requires abundant sunlight and well-drained soil. Extremely drought-resistant.",
      ha: "Yana son hasken rana da ƙasa mai kyau wadda ba ta riƙe ruwa sosai. Yana jure fari.",
      yo: "O nilo orun to pọ ati ilẹ ti ko mu omi duro. O n farada ogbele.",
      ig: "Ọ chọrọ anwụ zuru oke na ala mmiri na-adịghị akwụsi. Ọ na-edi ụkọ mmiri.",
      pcm: "E need plenty sun and ground wey no dey hold water. E dey survive dry season well.",
    },
  },
  {
    id: "cassava",
    commonName: {
      en: "Cassava",
      ha: "Rogo",
      yo: "Ege / Gbaguda",
      ig: "Akpụ / Ji Akpụ",
      pcm: "Cassava",
    },
    scientificName: "Manihot esculenta",
    imageUri: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=800&auto=format&fit=crop&q=80",
    healthNutrition: {
      en: "Rich in carbohydrates and calories. Must be properly peeled and processed to remove cyanide compounds.",
      ha: "Yana ba da kuzari mai yawa da sinadarin sitaci.",
      yo: "O ni sitaasi ati agbara pupọ fun ara.",
      ig: "Ọ na-enye nnukwu ume na nri sitaachi.",
      pcm: "E dey give heavy energy and carbohydrate to body.",
    },
    edibility: {
      en: "Processed into Garri, Fufu, Lafun, and cassava flour. Never consume raw bitter cassava.",
      ha: "Ana yin gari, fufu, da alabo da shi. Kada a ci danye.",
      yo: "A n fi ṣe gari, fufu ati lafun. Maṣe jẹ ẹ ni aise.",
      ig: "A na-eji ya eme garri na fufu. Erila ya na-esighị ya esi.",
      pcm: "Na wetin we dey use make Garri, Fufu, and starch. No chop am raw.",
    },
    toxicitySafety: {
      en: "Raw cassava roots contain cyanogenic glycosides. Always ferment, soak, or thoroughly cook before eating.",
      ha: "Danyen rogo yana ɗauke da guba idan ba a dafa ko a jiƙa shi da kyau ba.",
      yo: "Rogo aise ni majele ti a ba jẹ ẹ laisi sise tabi ririn ninu omi.",
      ig: "Akpụ a na-edoziroghị nwere ike imerụ ahụ. Kwesịrị ịgbaze ya ma sie ya nke ọma.",
      pcm: "Raw cassava get poison. You must soak, ferment, or cook am well before you chop.",
    },
    origin: {
      en: "Originated in South America; Nigeria is the world's largest producer of cassava.",
      ha: "Asalinsa daga Kudancin Amurka; Najeriya ce ta farko a duniya wajen noman rogo.",
      yo: "O wa lati South America; Naijiria si ni orilẹ-ede to n gbin julọ ni agbaye.",
      ig: "Nigeria bụ mba kacha akụ akpụ n'ụwa niile taa.",
      pcm: "Nigeria na number 1 producer of cassava for the whole world.",
    },
    growingCare: {
      en: "Grows well in sandy loam soil with good drainage. Ready for harvest between 9 to 18 months.",
      ha: "Yana son ƙasa mai yashi da sauƙin ruwa. Yana girma cikin wata 9 zuwa 12.",
      yo: "O nilo ilẹ to dara ati orun. O n pọn laarin oṣu mẹsan si mejila.",
      ig: "A na-akụ ya n'ala mara mma ma na-aghọta ya n'ọnwa itoolu ruo iri na abụọ.",
      pcm: "Plant am for good ground, e go ready between 9 to 12 months.",
    },
  },
  {
    id: "bitter-leaf",
    commonName: {
      en: "Bitter Leaf",
      ha: "Shuwaka",
      yo: "Ewuro",
      ig: "Onugbu",
      pcm: "Bitter Leaf",
    },
    scientificName: "Vernonia amygdalina",
    imageUri: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=800&auto=format&fit=crop&q=80",
    healthNutrition: {
      en: "Rich in antioxidants, peptides, and flavonoids that support liver function and digestive wellness.",
      ha: "Yana taimakawa wajen wanke ciki da kuma lafiyar hanta.",
      yo: "O dara pupọ fun itọju ẹdọ ati mimọ inu ara.",
      ig: "Ọ na-enyere umeju na afọ aka nke ukwuu maka ịdị ọcha ahụ.",
      pcm: "E good for liver, and e dey help wash stomach well.",
    },
    edibility: {
      en: "Washed and squeezed to reduce bitterness, then cooked in traditional Nigerian soups like Ofe Onugbu.",
      ha: "Ana wanke shi don rage dacinsa a saka a miya.",
      yo: "A n fọ ọ daadaa lati dinku kikoro rẹ ṣaaju ki a to fi se ọbẹ.",
      ig: "A na-asachapụ ilu ya wee jiri ya sie Ofe Onugbu.",
      pcm: "Wash am well make the bitter reduce, then cook sweet soup like Ofe Onugbu.",
    },
    toxicitySafety: {
      en: "Safe for consumption. Extremely bitter juice can cause temporary stomach sensitivity if consumed in excessive amounts.",
      ha: "Ba shi da matsala amma ruwansa mai daci kada a sha shi da yawa a lokaci guda.",
      yo: "Ko ni ewu kankan ṣugbọn mimu omi kikoro rẹ lọpọlọpọ le fa iṣoro inu kekere.",
      ig: "Enweghị nsogbu dị na ya, mana anụbigala mmiri ya ilu ókè n'otu oge.",
      pcm: "Safe to chop, just make you no drink too much raw bitter water at once.",
    },
    origin: {
      en: "Indigenous to tropical Africa; found across gardens and farmlands throughout Nigeria.",
      ha: "Tsirrai ne na asalin Afirka; ana samunsa a kowace gona a Najeriya.",
      yo: "Ohun ọgbin ti o jẹ ti ilẹ Afirka ni pato; o wọpọ ni gbogbo ilẹ Naijiria.",
      ig: "Ọ bụ osisi sitere na Africa nke na-eto n'akụkụ niile nke Nigeria.",
      pcm: "Pure African plant wey dey grow for every compound and farm for Nigeria.",
    },
    growingCare: {
      en: "Grows easily from stem cuttings in moist, fertile soils. Requires regular watering.",
      ha: "Ana shuka shi ta hanyar sare icensa. Yana son ruwa a kai a kai.",
      yo: "A n gbin in lati ara igi rẹ sinu ilẹ tutu ti o lẹtọ.",
      ig: "A na-akụ ya site n'ite osisi ya n'ala na-adị mmiri mmiri.",
      pcm: "Just cut the stem stick am for ground, give am water, e go grow quick.",
    },
  },
];
