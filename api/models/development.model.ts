export interface DevelopmentConfigsModel {
  constraints: string[];
  frontend: {
    framework: string;
    version?: string;
    styling: string;
    stateManagement?: string;
    features: string[];
  };

  backend: {
    framework: string;
    version?: string;
    apiType: string;
    orm?: string;
    ormVersion?: string;
    features: string[];
  };

  database: {
    type: string;
    provider: string;
    features: string[];
  };

  projectConfig: {
    seoEnabled: boolean;
    contactFormEnabled: boolean;
    analyticsEnabled: boolean;
    i18nEnabled: boolean;
    performanceOptimized: boolean;
    authentication: boolean;
    authorization: boolean;
    paymentIntegration?: boolean;
    customOptions?: Record<string, any>;
  };
}
