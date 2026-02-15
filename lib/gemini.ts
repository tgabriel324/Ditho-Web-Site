
import { GoogleGenAI, Type } from "@google/genai";
import { Client, Skeleton, Template, ThemeConfig, LeadJSON } from "../types";

const SYSTEM_INSTRUCTION_BASE = `
    ATUE COMO: Designer de Interface Premiado (Awwwards/Dribbble) E Engenheiro Frontend Sênior.
    OBJETIVO: Criar interfaces modernas, limpas, responsivas e focadas em conversão.
    PADRÃO ESTÉTICO: Design Industrial, Minimalista, usando Tailwind CSS.
`;

const cleanAIResponse = (text: string): string => {
    if (!text) return "";
    let cleanText = text;
    const codeBlockMatch = cleanText.match(/```(?:html|json)?([\s\S]*?)```/);
    if (codeBlockMatch && codeBlockMatch[1]) {
        cleanText = codeBlockMatch[1];
    } else {
        cleanText = cleanText.replace(/```(?:html|json)?/g, '').replace(/```/g, '');
    }
    return cleanText.trim();
};

export const generateSkeletonHtml = async (blueprint: string, apiKey: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
        MISSÃO: Criar um SKELETON (Wireframe) HTML industrial.
        REGRAS:
        1. Use Tailwind CSS v3.
        2. Use apenas tons de cinza (bg-zinc-50, text-slate-900, border-zinc-200).
        3. FOCO TOTAL na estrutura de seções baseada nisto: "${blueprint}".
        4. Use placeholders como {{NAME}}, {{PHONE}}, {{ABOUT_TEXT}}, {{SERVICE_LIST}}, {{REVIEWS}}.
        5. Retorne APENAS o HTML completo dentro de tags <html>.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt + "\n\n" + SYSTEM_INSTRUCTION_BASE,
    });
    return cleanAIResponse(response.text);
};

export const suggestArchetypes = async (niche: string, apiKey: string): Promise<any[]> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
        Analise o nicho "${niche}" e sugira 5 arquétipos de marca distintos (ex: Premium, Radical, Minimalista, etc).
        Para cada um, defina cores (hex) e uma fonte do Google Fonts que combine.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: { 
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        name: { type: Type.STRING },
                        description: { type: Type.STRING },
                        styleSuggestion: {
                            type: Type.OBJECT,
                            properties: {
                                primaryColor: { type: Type.STRING },
                                secondaryColor: { type: Type.STRING },
                                backgroundColor: { type: Type.STRING },
                                fontFamily: { type: Type.STRING }
                            },
                            required: ["primaryColor", "fontFamily"]
                        }
                    },
                    required: ["name", "description", "styleSuggestion"]
                }
            }
        }
    });
    try {
        return JSON.parse(cleanAIResponse(response.text));
    } catch (e) {
        return [];
    }
};

export const pickBestTemplate = async (leadData: LeadJSON, templates: Template[], apiKey: string): Promise<Template> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
        Analise os dados deste lead: ${JSON.stringify(leadData)}.
        Qual destes arquétipos de template é o mais adequado para converter este cliente específico?
        TEMPLATES DISPONÍVEIS: ${templates.map(t => `${t.id}: ${t.archetype}`).join(', ')}
        Retorne apenas o ID do template escolhido.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
    });
    const selectedId = cleanAIResponse(response.text);
    return templates.find(t => t.id === selectedId) || templates[0];
};

export const assembleSiteFromTemplate = async (template: Template, skeleton: Skeleton, leadData: LeadJSON, apiKey: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
        SISTEMA DE MONTAGEM DITHO OS.
        
        SKELETON BASE (HTML):
        ${skeleton.html}

        DADOS REAIS DO LEAD:
        ${JSON.stringify(leadData)}

        CONFIGURAÇÃO DE DESIGN (ARQUÉTIPO ${template.archetype}):
        ${JSON.stringify(template.styleConfig)}

        INSTRUÇÕES:
        1. Substitua placeholders {{...}} por textos PERSUASIVOS baseados nos dados do lead.
        2. Aplique as cores do styleConfig nas classes Tailwind.
        3. Mantenha a estrutura do Skeleton idêntica, apenas preencha o conteúdo.
        4. Garanta que o menu e botões de contato (WhatsApp) funcionem.
        5. Retorne o HTML FINAL.
    `;
    const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview', // Pro para melhor copy e precisão na montagem
        contents: prompt + "\n\n" + SYSTEM_INSTRUCTION_BASE,
    });
    return cleanAIResponse(response.text);
};

export const generateSiteContent = async (client: Client, apiKey: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `Gere um site completo para ${client.name} no nicho ${client.industry}. Use Tailwind CSS.`;
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt + "\n\n" + SYSTEM_INSTRUCTION_BASE,
    });
    return cleanAIResponse(response.text);
};

export const fixSiteResponsiveness = async (currentHtml: string, apiKey: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Arrumar responsividade mobile deste HTML: ${currentHtml}`,
    });
    return cleanAIResponse(response.text);
};

export const editSiteContent = async (currentHtml: string, instruction: string, apiKey: string): Promise<string> => {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Edite o HTML conforme instrução: ${instruction}. HTML Atual: ${currentHtml}`,
    });
    return cleanAIResponse(response.text);
};
