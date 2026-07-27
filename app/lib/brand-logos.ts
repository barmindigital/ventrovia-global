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
];

const brandLogoMap = new Map(
  brandLogoRegistry.map((logo) => [logo.slug, logo]),
);

export const brandLogoBySlug = (slug: string) => brandLogoMap.get(slug);
