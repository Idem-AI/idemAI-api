import { LogoModel } from "./logo.model";

export interface BrandIdentityModel {
  logo: LogoModel;
  generatedLogos: LogoModel[];
  colors: ColorModel;
  generatedColors: ColorModel[];
  typography: TypographyModel;
  generatedTypography: TypographyModel[];
  brandIdentity: {
    id: string;
    name: string;
    data: any;
    summary: string;
  }[];
}

export interface TypographyModel {
  id: string;
  name: string;
  url: string;
  primaryFont: string;
  secondaryFont: string;
}

export interface ColorModel {
  id: string;
  name: string;
  url: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
}
