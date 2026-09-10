type SourceBackedBrand = {
  manufacturerId: string;
  officialName: string;
  displayName: string;
  aliases: string[];
  formerNames: string[];
  officialWebsite: string;
  officialDomains: string[];
  country: string | null;
  headquarters: string | null;
  foundedYear: number | null;
  parentCompany: string | null;
  shortDescription: string;
  fullDescription: string[];
  productCategories: string[];
  productFamilies: string[];
  series: string[];
  industries: string[];
  officialCatalogs: string[];
  documentationSources: string[];
  sources: Array<{
    sourceId: string;
    tier: "A" | "B" | "C" | "D";
    type: string;
    scope: string;
    url: string;
    status: string;
    checkedAt: string;
  }>;
};

const countryNames: Record<string, string> = {
  "Австрия": "Austria",
  "Бразилия": "Brazil",
  "Великобритания": "United Kingdom",
  "Германия": "Germany",
  "Дания": "Denmark",
  "Индия": "India",
  "Италия": "Italy",
  "Израиль": "Israel",
  "Китай": "China",
  "Нидерланды": "Netherlands",
  "Польша": "Poland",
  "Португалия": "Portugal",
  "Испания": "Spain",
  "США": "United States",
  "Турция": "Türkiye",
  "Франция": "France",
  "Финляндия": "Finland",
  "Чехия": "Czech Republic",
  "Швейцария": "Switzerland",
  "Швеция": "Sweden",
  "Япония": "Japan",
};

const headquartersNames: Record<string, string> = {
  "Арциньяно, Италия": "Arzignano, Italy",
  "Аясэ, Канагава, Япония": "Ayase, Kanagawa, Japan",
  "Береа, Огайо, США": "Berea, Ohio, United States",
  "Бионе, Брешиа, Италия": "Bione, Brescia, Italy",
  "Брухзаль, Германия": "Bruchsal, Germany",
  "Будрио, Болонья, Италия": "Budrio, Bologna, Italy",
  "Бухенбах, Германия": "Buchenbach, Germany",
  "Вердоль, Германия": "Werdohl, Germany",
  "Вертхайм, Германия": "Wertheim, Germany",
  "Вупперталь, Германия": "Wuppertal, Germany",
  "Гамбург, Германия": "Hamburg, Germany",
  "Грац, Австрия": "Graz, Austria",
  "Дюссельдорф, Германия": "Düsseldorf, Germany",
  "Жарагуа-ду-Сул, Бразилия": "Jaraguá do Sul, Brazil",
  "Инверуно, Милан, Италия": "Inveruno, Milan, Italy",
  "Ингельфинген, Германия": "Ingelfingen, Germany",
  "Кальдерара-ди-Рено, Италия": "Calderara di Reno, Italy",
  "Киль, Германия": "Kiel, Germany",
  "Конья, Турция": "Konya, Türkiye",
  "Кюнцельзау, Германия": "Künzelsau, Germany",
  "Леверкузен, Германия": "Leverkusen, Germany",
  "Мансфилд, Огайо, США": "Mansfield, Ohio, United States",
  "Маростика, Италия": "Marostica, Italy",
  "Монсвиллер, Франция": "Monswiller, France",
  "Монтеккьо-Маджоре, Виченца, Италия": "Montecchio Maggiore, Vicenza, Italy",
  "Мюнхен, Германия": "Munich, Germany",
  "Падуя, Италия": "Padua, Italy",
  "Парабьяго, Италия": "Parabiago, Italy",
  "Парма, Италия": "Parma, Italy",
  "Пеоста, Айова, США": "Peosta, Iowa, United States",
  "Пессано-кон-Борнаго, Италия": "Pessano con Bornago, Italy",
  "Помье, Франция": "Pommiers, France",
  "Пуна, Индия": "Pune, India",
  "Ратинген, Германия": "Ratingen, Germany",
  "Риверсайд, Нью-Джерси, США": "Riverside, New Jersey, United States",
  "Роли, Северная Каролина, США": "Raleigh, North Carolina, United States",
  "Токио, Япония": "Tokyo, Japan",
  "Требур-Астхайм, Германия": "Trebur-Astheim, Germany",
  "Уоррен, Огайо, США": "Warren, Ohio, United States",
  "Цешин, Польша": "Cieszyn, Poland",
  "Шакопи, Миннесота, США": "Shakopee, Minnesota, United States",
  "Швейцария": "Switzerland",
  "Эльде, Германия": "Oelde, Germany",
  "Эсслинген-ам-Неккар, Германия": "Esslingen am Neckar, Germany",
};

const categoryRules: Array<[RegExp, string]> = [
  [/RFID/iu, "RFID and identification systems"],
  [/CNC|ЧПУ/iu, "CNC systems"],
  [/HVAC/iu, "HVAC controls"],
  [/FRL/iu, "compressed-air preparation"],
  [/3D-датчик/iu, "3D sensors"],
  [/насос/iu, "pumps and pumping systems"],
  // Engine filters, hydraulic/air motors and combustion engines are not electric motors.
  [/фильтр/iu, "filtration and water systems"],
  [/гидравлическ.*двигател|гидромотор/iu, "hydraulic equipment"],
  [/пневматическ.*двигател|пневмомотор/iu, "pneumatic equipment"],
  [/обратн.*связ/iu, "encoders and feedback systems"],
  [/(?:управлен|контроллер|привод).*двигател/iu, "drive and motion-control systems"],
  [/(?:газов|судов|морск|крупн).*(?<!электро)двигател/iu, "industrial engines"],
  [/электродвигател|двигател/iu, "electric motors"],
  [/энкодер|резольвер|тахогенератор/iu, "encoders and feedback systems"],
  [/датчик|измерительн.*щуп|инклинометр|тензодатчик/iu, "industrial sensors"],
  [/гидравл|гидроаккумулятор|гидроцилиндр|гидростанц/iu, "hydraulic equipment"],
  [/пневм/iu, "pneumatic equipment"],
  [/клапан|арматур|задвиж|затвор|позиционер/iu, "industrial valves and flow control"],
  [/компресс/iu, "compressors and compressed-air systems"],
  [/вакуум|течеискател|масс-спектрометр/iu, "vacuum equipment"],
  [/фильтр|фильтрац|водоподготов|водоотвед|дезинфекц/iu, "filtration and water systems"],
  [/подшипник/iu, "bearings"],
  [/редуктор|мотор-редуктор|вариатор/iu, "gear units and geared drives"],
  [/привод|управление движением|контроль движения|motion control|преобразовател.*частот/iu, "drive and motion-control systems"],
  [/автомат|PLC|ПЛК|контроллер|HMI|интерфейсн/iu, "industrial automation and control"],
  [/измерен|измеритель|расходомер|уровнемер|регистратор|счётчик|калибров/iu, "measurement and instrumentation"],
  [/лаборатор|хроматограф|спектрометр/iu, "laboratory and analytical equipment"],
  [/безопасн|блокиров|световые завесы|концевые выключатели|защит.*паден|индивидуальн.*защит|спасатель/iu, "industrial safety equipment"],
  [/стекольн.*оборудован/iu, "glass-production equipment"],
  [/изготовлен.*промышлен|металлообработ|механическ.*обработ|сборк.*оборудован|вальцов|ремонт.*восстанов/iu, "contract manufacturing and fabrication"],
  [/складск.*техник|погрузоч.*техник/iu, "material-handling equipment"],
  [/строительн.*техник|землеройн|горнодобывающ.*оборудован/iu, "construction and heavy machinery"],
  [/фасовоч|упаковоч|дозирующ.*оборудован|укупороч|этикетировоч/iu, "filling and packaging machinery"],
  [/станк|обрабатывающ|пресс|маркиров|машин/iu, "industrial machinery"],
  [/клеенаносящ|горячего расплава/iu, "industrial adhesive-application systems"],
  [/технического зрения|инспекцион/iu, "machine-vision and inspection systems"],
  [/конвейер|сортиров|пневматический транспорт|паллетн/iu, "conveying and material-handling systems"],
  [/внутризаводск|логистик|тележк|спутник.*детал|стеллаж|рабоч.*мест/iu, "conveying and material-handling systems"],
  [/кабел|разъём|токосъём/iu, "industrial connectivity"],
  [/крепеж|креплен|опор.*труб|монтажн.*систем/iu, "industrial fixing and support systems"],
  [/робот|захват|AGV|AMR/iu, "robotics and automation components"],
  [/свароч|резк/iu, "welding and cutting equipment"],
  [/вентилятор|воздуходув/iu, "industrial fans and blowers"],
  [/тепло|нагрев|охлажд|холодиль|чиллер|кондиционир/iu, "thermal-management equipment"],
  [/горел|сжиган|огнепреград|запальн|газов.*рамп/iu, "combustion and burner systems"],
  [/электрификац|электроэнерг|трансформатор|источник(?:и)? питания|силовые преобразователи/iu, "electrical power systems"],
  [/аккумулятор|накопления энергии|зарядн/iu, "industrial battery and energy-storage systems"],
  [/уплотнен|диафрагм|компенсатор/iu, "sealing components"],
  [/смаз|лубрикатор/iu, "lubrication systems"],
  [/муфт|тормоз/iu, "brakes and couplings"],
  [/зажимн.*втул|фиксатор.*вал|механическ.*передач/iu, "shaft-locking and transmission components"],
  [/цилиндр|актуатор|линейн|шарико-винтов|роликовые винты/iu, "linear-motion components"],
  [/окрас|покрыт|распыл|диспергатор/iu, "coating and finishing equipment"],
  [/кран|подъём|тали/iu, "lifting and crane systems"],
  [/сепаратор|центрифуг|переработ/iu, "process equipment"],
  [/турбин/iu, "turbomachinery"],
  [/резервуар|хранения газа/iu, "fluid-storage systems"],
  [/цепи/iu, "industrial chains"],
  [/ремн|шкив|натяжител/iu, "belt-drive components"],
  [/прокладк/iu, "industrial gaskets"],
  [/реле/iu, "industrial relays"],
  [/инструмент/iu, "industrial tools"],
  [/вибратор|вибрацион/iu, "industrial vibration equipment"],
  [/разжимн.*вал|намотк|размотк/iu, "winding and unwinding systems"],
  [/мойк|промыв|очистк/iu, "industrial cleaning systems"],
  [/шпиндел/iu, "machine-tool spindles"],
  [/программное обеспечение|ПО для/iu, "industrial software"],
  [/бумагоделатель/iu, "paper-production equipment"],
  [/инфраструктур/iu, "infrastructure technologies"],
  [/регулятор/iu, "control and regulation equipment"],
  [/уплотнительн|прокладочн/iu, "sealing components"],
  [/гомогенизатор/iu, "industrial mixing and homogenizing equipment"],
  [/электрощитов/iu, "electrical switchgear and panels"],
  [/электротехническ.*компонент/iu, "electrical components"],
  [/электротехническ/iu, "electrical equipment"],
  [/карданн.*вал/iu, "cardan shafts and drivelines"],
  [/штамповая оснастк/iu, "stamping tooling and dies"],
  [/полимерн.*материал/iu, "polymer materials"],
  [/техническ.*ткан/iu, "technical and coated fabrics"],
  [/смотровые стёкла|смотровые стекла|смотровые фонари/iu, "sight glasses and inspection windows"],
  [/взрывозащищённ.*электро|взрывозащищен.*электро/iu, "explosion-protected electrical equipment"],
  [/взрывозащищённ|взрывозащищен/iu, "explosion-protected equipment"],
  [/электрическ.*соединител/iu, "electrical connectors"],
  [/электронные компонент/iu, "electronic components"],
  [/выгрузки сыпучих материалов/iu, "bulk-material discharge equipment"],
  [/мультипликатор/iu, "speed-increasing gearboxes"],
  [/промышленная химия/iu, "industrial chemicals"],
  [/вентиляционн/iu, "ventilation equipment"],
  [/зажимные приспособлен/iu, "clamping fixtures"],
  [/смесительн.*оборудован/iu, "industrial mixing equipment"],
  [/зубчатые колёса|зубчатые колеса/iu, "gears and shafts"],
  [/отопительн/iu, "heating equipment"],
  [/электрогенератор/iu, "electric generators"],
  [/прачечн/iu, "laundry equipment"],
  [/гладильн/iu, "ironing equipment"],
  [/парогенератор/iu, "steam generators"],
  [/крепёжные изделия|крепежные изделия/iu, "fasteners"],
  [/дробильно-размольн/iu, "crushing and grinding equipment"],
  [/светодиодное освещен/iu, "LED lighting"],
  [/управлен.*освещен/iu, "lighting control systems"],
  [/осветительн/iu, "lighting equipment"],
  [/литые изделия/iu, "cast components"],
  [/трубы и фитинги/iu, "pipes and fittings"],
  [/нефтегазовое оборудован/iu, "oil and gas equipment"],
  [/трубопроводные систем/iu, "piping systems"],
  [/пищевое оборудован/iu, "food-processing equipment"],
  [/аналитические приборы/iu, "analytical instruments"],
  [/оповещен|сигнализац/iu, "alarm and signalling systems"],
];

const industryRules: Array<[RegExp, string]> = [
  [/нефт|газ/iu, "oil and gas"],
  [/водоснабж|водоочист|водоотвед|водоподготов|сточн|водоканал|питьев.*вод|очист.*вод/iu, "water and wastewater"],
  [/энерг|электроэнерг|ветро/iu, "energy"],
  [/пищ|фарма/iu, "food and pharmaceutical processing"],
  [/автомоб|транспорт/iu, "transportation"],
  [/морск|судостро/iu, "marine applications"],
  [/горн/iu, "mining"],
  [/хим|нефтехим/iu, "chemical processing"],
  [/металл|станк|машиностро/iu, "industrial manufacturing"],
  [/автомат|робот|интралогист/iu, "factory automation"],
  [/лаборатор|исследован|медицин|здравоохран/iu, "laboratory and life-science applications"],
  [/полупровод|электроник/iu, "electronics and semiconductor manufacturing"],
  [/здан|HVAC|отоплен|охлажден/iu, "building systems"],
  [/упаков/iu, "packaging"],
  [/сельск/iu, "agriculture"],
  [/авиа|аэрокосм/iu, "aerospace"],
  [/железнодорож/iu, "rail"],
  [/дерево|целлюлоз/iu, "wood and paper processing"],
  [/логистик|складск/iu, "logistics and warehousing"],
  [/строительств/iu, "construction"],
  [/телекоммуникац/iu, "telecommunications"],
  [/переработка пластмасс/iu, "plastics processing"],
  [/утилизац.*отход|переработка отход/iu, "waste management"],
  [/розничная торговл/iu, "retail"],
  [/финансовый сектор/iu, "financial services"],
  [/гостиничный бизнес/iu, "hospitality"],
  [/биотехнолог/iu, "biotechnology"],
  [/образован/iu, "education"],
  [/коммунальн/iu, "municipal utilities"],
  [/противопожарн|пожаротушен/iu, "fire protection"],
  [/бассейн|спа-салон|spa[- ]салон/iu, "swimming pool and spa"],
  [/дезинфекц|обеззараживан/iu, "cleaning and disinfection"],
  [/транспортная инфраструктур/iu, "transport infrastructure"],
  [/промышлен|производств|process|технологическ/iu, "industrial processing"],
];

function unique(values: Array<string | null>) {
  return [...new Set(values.filter((value): value is string => Boolean(value)))];
}

function englishIdentityValues(values: string[]) {
  return unique(values.filter((value) => !/[А-Яа-яЁё]/u.test(value)));
}

function englishHeadquarters(value: string | null) {
  if (!value) return null;
  return headquartersNames[value] ?? (!/[А-Яа-яЁё]/u.test(value) ? value : null);
}

function englishCountry(value: string | null) {
  if (!value) return null;
  return countryNames[value] ?? (!/[А-Яа-яЁё]/u.test(value) ? value : null);
}

function normalized(value: string, rules: Array<[RegExp, string]>) {
  return rules.find(([pattern]) => pattern.test(value))?.[1] ?? null;
}

function list(values: string[]) {
  if (values.length < 2) return values[0] ?? "industrial equipment";
  if (values.length === 2) return `${values[0]} and ${values[1]}`;
  return `${values.slice(0, -1).join(", ")}, and ${values.at(-1)}`;
}

function seed(value: string) {
  return [...value].reduce((sum, character) => (sum * 33 + character.codePointAt(0)!) >>> 0, 5381);
}

function possessive(value: string) {
  return /s$/iu.test(value) ? `${value}'` : `${value}'s`;
}

// Company names such as "Donaldson Company, Inc." already end with a full stop.
function beforeFullStop(value: string) {
  return value.replace(/\.+$/u, "");
}

export type EnglishBrandProfile = Omit<
  SourceBackedBrand,
  "shortDescription" | "fullDescription" | "productCategories" | "industries"
> & {
  shortDescription: string;
  fullDescription: string[];
  productCategories: string[];
  industries: string[];
  contentLanguage: "en";
  enContentStatus: "EN_CONTENT_READY";
  enSeoStatus: "EN_SEO_READY";
};

export function toEnglishBrandProfile(profile: SourceBackedBrand): EnglishBrandProfile {
  const country = englishCountry(profile.country);
  const headquarters = englishHeadquarters(profile.headquarters);
  const productCategories = unique(
    profile.productCategories.map((category) => normalized(category, categoryRules)),
  );
  const industries = unique(
    profile.industries.map((industry) => normalized(industry, industryRules)),
  );
  if (!productCategories.length) {
    throw new Error(`No evidence-backed English product area mapping for ${profile.manufacturerId}`);
  }

  const primaryAreas = productCategories.slice(0, 3);
  const variant = seed(profile.manufacturerId) % 6;
  const englishFamilies = englishIdentityValues(profile.productFamilies);
  const englishSeries = englishIdentityValues(profile.series);
  const identityLines = [
    `${profile.displayName} has an official portfolio covering ${list(primaryAreas)}.`,
    `Manufacturer-owned sources place ${profile.displayName} in ${list(primaryAreas)}.`,
    `${possessive(profile.displayName)} documented product scope includes ${list(primaryAreas)}.`,
    `Official material for ${profile.displayName} identifies ${list(primaryAreas)} as its principal product areas.`,
    `${profile.displayName} publishes manufacturer information for ${list(primaryAreas)}.`,
    `The verified ${profile.displayName} product range spans ${list(primaryAreas)}.`,
  ];
  const familyLead = unique([...englishFamilies, ...englishSeries]).slice(0, 3);
  const shortDescriptions = [
    `${identityLines[0]}${familyLead.length ? ` Documented lines include ${list(familyLead)}.` : ""} Aihamyn Hampa Trading reviews enquiries against the relevant manufacturer documentation.`,
    `${identityLines[1]}${country ? ` The verified brand record is associated with ${country}.` : ""} Submit the exact designation for an international sourcing review.`,
    `${identityLines[2]}${familyLead.length ? ` Official documentation names ${list(familyLead)}.` : ""} Commercial review starts with the complete model or specification.`,
    `${identityLines[3]}${profile.parentCompany ? ` The documented corporate group is ${beforeFullStop(profile.parentCompany)}.` : ""} Aihamyn Hampa Trading handles specification-led RFQs without implying an authorised relationship.`,
    `${identityLines[4]}${familyLead.length ? ` The published range includes ${list(familyLead)}.` : ""} Exact configuration and supply status are checked for each request.`,
    `${identityLines[5]}${profile.foundedYear ? ` The official company record dates its foundation to ${profile.foundedYear}.` : ""} Buyers can submit a model, part number or technical file for review.`,
  ];

  const locationFacts = [
    country ? `Brand origin: ${beforeFullStop(country)}.` : "",
    headquarters ? `Headquarters: ${beforeFullStop(headquarters)}.` : "",
    profile.foundedYear ? `The official company record dates its foundation to ${profile.foundedYear}.` : "",
    profile.parentCompany ? `The documented corporate group is ${beforeFullStop(profile.parentCompany)}.` : "",
  ].filter(Boolean);
  const productFamilies = englishFamilies;
  const series = englishSeries;
  const familyNames = unique([...productFamilies, ...series]);
  const sourceTypes = unique(profile.sources.map((source) => source.type.toLocaleLowerCase("en").replaceAll("_", " ")))
    .slice(0, 3)
    .join(", ");

  const identityParagraphs = [
    `${profile.officialName} is represented here through manufacturer-owned evidence for ${list(productCategories.slice(0, 6))}.`,
    `The verified ${profile.displayName} record is based on official company and product material covering ${list(productCategories.slice(0, 6))}.`,
    `Aihamyn Hampa Trading identifies ${profile.displayName} through its own published sources and limits this profile to ${list(productCategories.slice(0, 6))}.`,
    `Official ${profile.displayName} information confirms a product scope centred on ${list(productCategories.slice(0, 6))}.`,
    `${possessive(profile.displayName)} manufacturer documentation establishes the brand identity and its work in ${list(productCategories.slice(0, 6))}.`,
    `This profile uses first-party ${profile.displayName} sources to describe ${list(productCategories.slice(0, 6))}.`,
  ];
  const familyParagraphs = [
    `Named product families and lines include ${list(familyNames.slice(0, 8))}. These names organise the documented range; they do not transfer specifications or compatibility from one model to another.`,
    `The published range names ${list(familyNames.slice(0, 8))}. Selection still requires the technical record for the requested model, because family membership alone is not a compatibility statement.`,
    `Official material lists ${list(familyNames.slice(0, 8))}. Aihamyn Hampa Trading treats these as family-level evidence and checks exact characteristics only at model or document level.`,
    `Documented lines include ${list(familyNames.slice(0, 8))}. Their presence helps route an RFQ but does not prove current production, interchangeability or a particular configuration.`,
    `${profile.displayName} publishes information for ${list(familyNames.slice(0, 8))}. A commercial enquiry is therefore matched to the requested designation rather than inferred from the family name.`,
    `The official product structure includes ${list(familyNames.slice(0, 8))}. Model status, options and operating limits remain subject to the applicable manufacturer document.`,
  ];
  const applicationParagraphs = [
    `Documented application areas include ${list(industries.slice(0, 5))}. Buyers should provide the operating context together with the exact model or part number.`,
    `The source-backed application scope covers ${list(industries.slice(0, 5))}. Aihamyn Hampa Trading uses the submitted specification to review the requested configuration and commercial path.`,
    `Official sources associate the range with ${list(industries.slice(0, 5))}. An RFQ should include duty, media or interface details where they affect selection.`,
    `Published applications span ${list(industries.slice(0, 5))}. Pricing and lead-time review begins only after the requested equipment is identified precisely.`,
    `The documented market context includes ${list(industries.slice(0, 5))}. The complete designation and technical file help avoid assumptions about suitability.`,
    `${profile.displayName} materials reference ${list(industries.slice(0, 5))}. Aihamyn Hampa Trading reviews each enquiry on its own specification and does not infer availability from this profile.`,
  ];

  const fullDescription = [
    `${identityParagraphs[variant]} ${locationFacts.join(" ")}`.trim(),
    familyNames.length
      ? familyParagraphs[(variant + 2) % familyParagraphs.length]
      : `The available manufacturer-owned ${sourceTypes || "company and product"} sources confirm the areas shown here. Exact technical characteristics, production status and compatibility remain subject to the relevant model-level material.`,
    industries.length
      ? applicationParagraphs[(variant + 4) % applicationParagraphs.length]
      : `A commercial review requires the complete model, part number or specification so the requirement can be checked against the appropriate official material.`,
  ];

  return {
    ...profile,
    aliases: englishIdentityValues(profile.aliases),
    formerNames: englishIdentityValues(profile.formerNames),
    country,
    headquarters,
    parentCompany:
      profile.parentCompany && !/[А-Яа-яЁё]/u.test(profile.parentCompany)
        ? profile.parentCompany
        : null,
    shortDescription: shortDescriptions[variant],
    fullDescription,
    productCategories,
    productFamilies,
    series,
    industries,
    contentLanguage: "en",
    enContentStatus: "EN_CONTENT_READY",
    enSeoStatus: "EN_SEO_READY",
  };
}
