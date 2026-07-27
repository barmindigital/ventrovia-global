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
];

const brandLogoMap = new Map(
  brandLogoRegistry.map((logo) => [logo.slug, logo]),
);

export const brandLogoBySlug = (slug: string) => brandLogoMap.get(slug);
