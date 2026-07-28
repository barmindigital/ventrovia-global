export type BrandLogo = {
  slug: string;
  name: string;
  src: string;
  sourcePage: string;
  originalFile: string;
  license: string;
  licenseUrl?: string;
  attribution: string;
};

export const brandLogoRegistry: BrandLogo[] = [
  {
    slug: "abb",
    name: "ABB",
    src: "/images/brand-logos/abb.svg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:ABB_logo.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/0/00/ABB_logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Original uploader: Vargklo; source artwork: ABB",
  },
  {
    slug: "bosch-rexroth",
    name: "Bosch Rexroth",
    src: "/images/brand-logos/bosch-rexroth.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Bosch_Rexroth.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/b/b4/Bosch_Rexroth.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Bosch Rexroth AG",
  },
  {
    slug: "datalogic",
    name: "Datalogic",
    src: "/images/brand-logos/datalogic.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Datalogic_Logo.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/0/0a/Datalogic_Logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Datalogic S.p.A.",
  },
  {
    slug: "helukabel",
    name: "Helukabel",
    src: "/images/brand-logos/helukabel.svg",
    sourcePage: "https://commons.wikimedia.org/wiki/File:Helukabel.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/8/8b/Helukabel.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Helukabel",
  },
  {
    slug: "ifm-electronic",
    name: "IFM Electronic",
    src: "/images/brand-logos/ifm-electronic.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Ifm_electronic_logo.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/1/18/Ifm_electronic_logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "ifm-Unternehmensgruppe",
  },
  {
    slug: "marelli-motori",
    name: "Marelli Motori",
    src: "/images/brand-logos/marelli-motori.png",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Logo_Marelli_Motori_2018.png",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/4/4b/Logo_Marelli_Motori_2018.png",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    attribution: "Very inspired, Wikimedia Commons",
  },
  {
    slug: "oerlikon-leybold-vacuum",
    name: "Oerlikon Leybold Vacuum",
    src: "/images/brand-logos/oerlikon-leybold-vacuum.png",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Logo_Oerlikon_Leybold_Vakuum.png",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/2/28/Logo_Oerlikon_Leybold_Vakuum.png",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Oerlikon Leybold Vacuum",
  },
  {
    slug: "sick-ag",
    name: "SICK AG",
    src: "/images/brand-logos/sick-ag.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Logo_SICK_AG_2009.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/f/f1/Logo_SICK_AG_2009.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: SICK AG",
  },
  {
    slug: "kuebler",
    name: "Kübler",
    src: "/images/brand-logos/kuebler.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:K%C3%BCbler_logo.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/2/27/K%C3%BCbler_logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Kübler",
  },
  {
    slug: "siemens",
    name: "Siemens",
    src: "/images/brand-logos/siemens.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Siemens-logo.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/5/5f/Siemens-logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Siemens AG",
  },
  {
    slug: "schneider-electric",
    name: "Schneider Electric",
    src: "/images/brand-logos/schneider-electric.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:SchneiderElectric_Logo.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/d/d2/SchneiderElectric_Logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Schneider Electric",
  },
  {
    slug: "rockwell-automation",
    name: "Rockwell Automation",
    src: "/images/brand-logos/rockwell-automation.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Rockwell_Automation_logo_(2019).svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/a/a5/Rockwell_Automation_logo_%282019%29.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Rockwell Automation",
  },
  {
    slug: "parker-hannifin-gmbh",
    name: "Parker Hannifin",
    src: "/images/brand-logos/parker-hannifin-gmbh.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Parker_Hannifin.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/9/9e/Parker_Hannifin.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Parker Hannifin",
  },
  {
    slug: "grundfos",
    name: "Grundfos",
    src: "/images/brand-logos/grundfos.jpg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:%D0%9B%D0%BE%D0%B3%D0%BE%D1%82%D0%B8%D0%BF_Grundfos.jpg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/d/d0/%D0%9B%D0%BE%D0%B3%D0%BE%D1%82%D0%B8%D0%BF_Grundfos.jpg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Grundfos",
  },
  {
    slug: "sew-eurodrive",
    name: "SEW Eurodrive",
    src: "/images/brand-logos/sew-eurodrive.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:SEW_LOGO.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/9/92/SEW_LOGO.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: SEW-Eurodrive",
  },
  {
    slug: "fanuc",
    name: "FANUC",
    src: "/images/brand-logos/fanuc.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Fanuc_logo.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/b/bb/Fanuc_logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: FANUC",
  },
  {
    slug: "yaskawa",
    name: "Yaskawa",
    src: "/images/brand-logos/yaskawa.png",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Yaskawa_Electric_company_new_logo.png",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/6/61/Yaskawa_Electric_company_new_logo.png",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Yaskawa Electric",
  },
  {
    slug: "lenze-gmbh",
    name: "Lenze",
    src: "/images/brand-logos/lenze-gmbh.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Lenze_Gruppe_Logo.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/6/62/Lenze_Gruppe_Logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Lenze Group",
  },
  {
    slug: "atlas-copco",
    name: "Atlas Copco",
    src: "/images/brand-logos/atlas-copco.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Atlas_Copco_Group_logo.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/0/09/Atlas_Copco_Group_logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Atlas Copco Group",
  },
  {
    slug: "alfa-laval",
    name: "Alfa Laval",
    src: "/images/brand-logos/alfa-laval.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:AlfaLaval-Logo.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/f/f4/AlfaLaval-Logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Alfa Laval",
  },
  {
    slug: "gea",
    name: "GEA",
    src: "/images/brand-logos/gea.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:GEA_Logo_2022.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/3/3c/GEA_Logo_2022.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: GEA Group",
  },
  {
    slug: "wika",
    name: "WIKA",
    src: "/images/brand-logos/wika.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:WIKA_Logo.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/e/eb/WIKA_Logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: WIKA",
  },
  {
    slug: "hydac",
    name: "HYDAC",
    src: "/images/brand-logos/hydac.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Hydac_International_Logo.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/1/1b/Hydac_International_Logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: HYDAC International",
  },
  {
    slug: "flowserve",
    name: "Flowserve",
    src: "/images/brand-logos/flowserve.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Flowserve.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/3/32/Flowserve.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Flowserve",
  },
  {
    slug: "heidenhain",
    name: "HEIDENHAIN",
    src: "/images/brand-logos/heidenhain.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Heidenhain_2022_logo.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/5/5d/Heidenhain_2022_logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: HEIDENHAIN",
  },
  {
    slug: "bonfiglioli",
    name: "Bonfiglioli",
    src: "/images/brand-logos/bonfiglioli.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Bonfiglioli.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/4/47/Bonfiglioli.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Bonfiglioli",
  },
  {
    slug: "weg",
    name: "WEG",
    src: "/images/brand-logos/weg.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:WEG_Equipamentos_El%C3%A9tricos.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/d/dd/WEG_Equipamentos_El%C3%A9tricos.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: WEG Equipamentos Elétricos",
  },
  {
    slug: "nidec",
    name: "Nidec",
    src: "/images/brand-logos/nidec.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Nidec_logo.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/1/15/Nidec_logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Nidec",
  },
  {
    slug: "burkert",
    name: "Bürkert",
    src: "/images/brand-logos/burkert.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Burkert_logo.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/1/13/Burkert_logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Bürkert Fluid Control Systems",
  },
  {
    slug: "ebara-pump",
    name: "Ebara",
    src: "/images/brand-logos/ebara-pump.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Ebara.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/f/f6/Ebara.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Ebara Corporation",
  },
  {
    slug: "voith-gmbh",
    name: "Voith",
    src: "/images/brand-logos/voith-gmbh.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Voith-logo.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/0/0c/Voith-logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Voith",
  },
  {
    slug: "ingersoll-rand",
    name: "Ingersoll Rand",
    src: "/images/brand-logos/ingersoll-rand.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Ingersoll_Rand_logo.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/a/a4/Ingersoll_Rand_logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Ingersoll Rand",
  },
  {
    slug: "pfeiffer-vacuum",
    name: "Pfeiffer Vacuum",
    src: "/images/brand-logos/pfeiffer-vacuum.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Pfeiffer_Vacuum_%2B_Fab_Solutions_Logo_2024.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/4/4c/Pfeiffer_Vacuum_%2B_Fab_Solutions_Logo_2024.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Pfeiffer Vacuum + Fab Solutions",
  },
  {
    slug: "spirax-sarco",
    name: "Spirax Sarco",
    src: "/images/brand-logos/spirax-sarco.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Spirax-Sarco_Engineering_logo.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/c/c6/Spirax-Sarco_Engineering_logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Spirax-Sarco Engineering",
  },
  {
    slug: "belimo",
    name: "Belimo",
    src: "/images/brand-logos/belimo.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Belimo-Logo.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/6/6b/Belimo-Logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Belimo",
  },
  {
    slug: "pentair",
    name: "Pentair",
    src: "/images/brand-logos/pentair.jpg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Pentair_Logo.jpg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/0/0e/Pentair_Logo.jpg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Pentair",
  },
  {
    slug: "honeywell",
    name: "Honeywell",
    src: "/images/brand-logos/honeywell.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Honeywell_logo.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/2/2a/Honeywell_logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Honeywell",
  },
  {
    slug: "turck",
    name: "Turck",
    src: "/images/brand-logos/turck.jpeg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Firmenlogo_Turck_2015.jpeg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/1/1a/Firmenlogo_Turck_2015.jpeg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Hans Turck GmbH & Co. KG",
  },
  {
    slug: "leuze-electronic",
    name: "Leuze Electronic",
    src: "/images/brand-logos/leuze-electronic.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Leuze_electronic.svg",
    originalFile:
      "https://upload.wikimedia.org/wikipedia/commons/2/2e/Leuze_electronic.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Leuze Electronic",
  },
  {
    slug: "endress-hauser",
    name: "Endress+Hauser",
    src: "/images/brand-logos/endress-hauser.jpg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Endress%2BHauser_Logo.jpg",
    originalFile:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Endress%2BHauser_Logo.jpg",
    license: "CC BY-SA 3.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
    attribution: "EndressHauserUS, Wikimedia Commons",
  },
  {
    slug: "emerson-industrial",
    name: "Emerson",
    src: "/images/brand-logos/emerson-industrial.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Logo_Emerson.svg",
    originalFile:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Logo_Emerson.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Rosemount Inc. / Emerson",
  },
  {
    slug: "danfoss",
    name: "Danfoss",
    src: "/images/brand-logos/danfoss.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Danfoss-Logo.svg",
    originalFile:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Danfoss-Logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Danfoss",
  },
  {
    slug: "festo",
    name: "Festo",
    src: "/images/brand-logos/festo.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Festo_logo.svg",
    originalFile:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Festo_logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Festo KG",
  },
  {
    slug: "skf",
    name: "SKF",
    src: "/images/brand-logos/skf.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:SKF_logo.svg",
    originalFile:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/SKF_logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: SKF; SVG version: Gr1st",
  },
  {
    slug: "yokogawa",
    name: "Yokogawa",
    src: "/images/brand-logos/yokogawa.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Yokogawa_logo.svg",
    originalFile:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Yokogawa_logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Yokogawa Electric",
  },
  {
    slug: "xylem",
    name: "Xylem",
    src: "/images/brand-logos/xylem.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Xylem_Logo.svg",
    originalFile:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Xylem_Logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Xylem Inc.",
  },
  {
    slug: "moeller-eaton",
    name: "Moeller Electric (Eaton)",
    src: "/images/brand-logos/moeller-eaton.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Eaton_Corporation_Logo.svg",
    originalFile:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Eaton_Corporation_Logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Eaton Corporation",
  },
  {
    slug: "gardner-denver",
    name: "Gardner Denver",
    src: "/images/brand-logos/gardner-denver.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Gardner_Denver_Logo.svg",
    originalFile:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Gardner_Denver_Logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Gardner Denver",
  },
  {
    slug: "ebmpapst",
    name: "ebm-papst",
    src: "/images/brand-logos/ebmpapst.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Ebmpapst.svg",
    originalFile:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Ebmpapst.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: ebm-papst",
  },
  {
    slug: "carrier",
    name: "Carrier",
    src: "/images/brand-logos/carrier.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Logo_of_the_Carrier_Corporation.svg",
    originalFile:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Logo_of_the_Carrier_Corporation.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Carrier Corporation",
  },
  {
    slug: "leroy-somer",
    name: "Leroy-Somer",
    src: "/images/brand-logos/leroy-somer.gif",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Leroy-Somer.gif",
    originalFile:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Leroy-Somer.gif",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Emerson Leroy-Somer",
  },
  {
    slug: "mahle",
    name: "MAHLE",
    src: "/images/brand-logos/mahle.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Mahle.svg",
    originalFile:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Mahle.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: MAHLE GmbH",
  },
  {
    slug: "kaeser",
    name: "KAESER",
    src: "/images/brand-logos/kaeser.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Kaeser_Kompressoren_logo.svg",
    originalFile:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Kaeser_Kompressoren_logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: KAESER Kompressoren",
  },
  {
    slug: "nordson",
    name: "Nordson",
    src: "/images/brand-logos/nordson.svg",
    sourcePage:
      "https://commons.wikimedia.org/wiki/File:Nordson_Corporation_Logo.svg",
    originalFile:
      "https://commons.wikimedia.org/wiki/Special:Redirect/file/Nordson_Corporation_Logo.svg",
    license: "Public domain (PD-textlogo)",
    attribution: "Source artwork: Nordson Corporation",
  },
];

const brandLogoMap = new Map(
  brandLogoRegistry.map((logo) => [logo.slug, logo]),
);

export const brandLogoBySlug = (slug: string) => brandLogoMap.get(slug);
