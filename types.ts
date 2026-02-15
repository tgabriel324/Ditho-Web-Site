
export interface Client {
    id: string;
    name: string;
    slug?: string;
    industry: string;
    scope: string;
    status: 'draft' | 'generating' | 'generated' | 'approved';
    paymentStatus: 'pending' | 'paid';
    siteContent?: string;
    subdomain?: string;
    createdAt: number;
    trialHours?: number;
    paymentLink?: string;
    leadData?: LeadJSON;
    themeConfig?: ThemeConfig;
    email?: string;
    password?: string;
    // Vinculação com template (opcional)
    templateId?: string;
}

export interface Skeleton {
    id: string;
    name: string;
    html: string; // O wireframe básico "nu"
    approved: boolean;
    createdAt: number;
}

export interface Template {
    id: string;
    skeletonId: string;
    niche: string;
    archetype: string; // Ex: Premium, Tecnológico, Minimalista
    styleConfig: ThemeConfig;
    previewHtml: string;
    approved: boolean;
    createdAt: number;
}

export interface BrandArchetype {
    name: string;
    description: string;
    styleSuggestion: ThemeConfig;
}

export interface ThemeConfig {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    surfaceColor?: string;
    textColor?: string;
    fontFamily?: string;
    imageOverrides?: Record<string, string>;
}

export interface GlobalSettings {
    defaultTrialValue: number;
    defaultTrialUnit: 'hours' | 'days';
}

export interface BlueprintSection {
    title: string;
    description: string;
    uxStrategy: string;
    visualSuggestion: string;
}

export interface LeadJSON {
    name: string;
    address: string;
    phoneNumber: string;
    placeUri: string;
    website: string | null;
    openingHours: string | string[];
    businessStatus: string;
    priceLevel: string;
    amenities: string[];
    rating: number | null;
    reviewCount: number;
    topReviews: string[];
    categories: string[];
    summary: string;
    photoAnalysis: string;
    seoKeywords: string[];
    blueprint?: BlueprintSection[];
    serviceTags?: string[];
    id?: string;
    campaignId?: string;
    createdAt?: string;
}

export type QueueItem = {
    id: string;
    leadData: LeadJSON;
    status: 'waiting' | 'processing' | 'done' | 'error';
    resultClient?: Client;
};
