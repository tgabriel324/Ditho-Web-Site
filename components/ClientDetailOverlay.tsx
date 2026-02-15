import React, { useState, useEffect, useRef } from 'react';
import { Lock, CheckCircle, Loader2, Sparkles, Database, ExternalLink, Clock, Monitor, Palette, FileText, Star, MapPin, Phone, Info, Target, Image as ImageIcon, MessageSquare, Globe, ShieldCheck, Tag, DollarSign, Link as LinkIcon, Smartphone, Wand2, Undo2, Save, X, User, Key } from 'lucide-react';
import { Client, GlobalSettings } from '../types';
import { fixSiteResponsiveness } from '../lib/gemini';

interface ClientDetailOverlayProps {
    client: Client;
    onClose: () => void;
    onUpdate: (id: string, data: Partial<Client>) => void;
    onGenerate: () => void;
    onApprove: () => void;
    onOpenEditor: () => void;
    isGenerating: boolean;
    globalSettings: GlobalSettings;
}

export const ClientDetailOverlay: React.FC<ClientDetailOverlayProps> = ({ 
    client, onClose, onUpdate, onGenerate, onApprove, onOpenEditor, isGenerating, globalSettings 
}) => {
    // Se for um cliente temporário (draft) vindo da fábrica, abre direto no dossiê
    const [activeTab, setActiveTab] = useState<'edit' | 'preview' | 'dossier'>(
        client.status === 'draft' && client.leadData ? 'dossier' : 'edit'
    );
    const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
    
    // Estado para alternar visualização no Preview
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

    // Estado visual do botão salvar
    const [isSaving, setIsSaving] = useState(false);

    // --- ESTADOS DA "REFORMA MÁGICA" ---
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [optimizedContent, setOptimizedContent] = useState<string | null>(null);

    useEffect(() => {
        if (client.siteContent && client.status !== 'draft') {
            setActiveTab('preview');
        }
    }, [client.status]);

    // Lógica para Otimizar Mobile
    const handleFixResponsiveness = async () => {
        if (!client.siteContent || !process.env.API_KEY) return;
        
        setIsOptimizing(true);
        // Muda para visão mobile automaticamente para ver o resultado
        setPreviewMode('mobile'); 
        
        try {
            const fixedHtml = await fixSiteResponsiveness(client.siteContent, process.env.API_KEY);
            setOptimizedContent(fixedHtml);
        } catch (error) {
            console.error("Erro ao otimizar:", error);
            alert("Erro ao tentar otimizar o site. Tente novamente.");
        } finally {
            setIsOptimizing(false);
        }
    };

    const handleSaveOptimization = () => {
        if (optimizedContent) {
            onUpdate(client.id, { siteContent: optimizedContent });
            setOptimizedContent(null); // Limpa o temporário, pois agora é o oficial
            alert("Otimização aplicada com sucesso!");
        }
    };

    const handleDiscardOptimization = () => {
        setOptimizedContent(null);
        setPreviewMode('desktop'); // Volta ao normal
    };

    // Função manual de salvar (apenas feedback visual, pois o onUpdate já persiste)
    const handleManualSave = () => {
        setIsSaving(true);
        // Simula um delay de salvamento para feedback
        setTimeout(() => {
            setIsSaving(false);
        }, 800);
    };

    // EFEITO: Gerar Blob URL para o Preview (Mesma tecnologia do PublicGateway)
    useEffect(() => {
        // Decide qual conteúdo mostrar: O Otimizado (Temporário) ou o Oficial
        const contentToShow = optimizedContent || client.siteContent;

        if (activeTab === 'preview' && contentToShow) {
            let content = contentToShow;

            // 0. Garante DOCTYPE
            if (!content.trim().toLowerCase().startsWith('<!doctype html>')) {
                content = '<!DOCTYPE html>\n' + content;
            }
            
            // 1. INJEÇÃO DE TAILWIND (Mesma do PublicGateway para garantir consistência)
            const headInjections = `
                <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
                <script src="https://cdn.tailwindcss.com"></script>
                <script>
                    tailwind.config = {
                        theme: {
                            extend: {
                                colors: {
                                    primary: 'var(--primary)',
                                    secondary: 'var(--secondary)',
                                    surface: 'var(--surface)',
                                }
                            }
                        }
                    }
                </script>
            `;
            if (content.includes('<head>')) {
                content = content.replace('<head>', `<head>${headInjections}`);
            } else {
                content = content.replace('<html>', `<html><head>${headInjections}</head>`);
            }

            // Injeção de segurança básica para o preview (CORRIGIDO: addEventListener)
            const cleanPhone = client.leadData?.phoneNumber?.replace(/\D/g, '') || '';
            const safeScript = `
                <script>
                    window.addEventListener('load', function() {
                        var links = document.getElementsByTagName('a');
                        for (var i = 0; i < links.length; i++) {
                            var href = links[i].getAttribute('href');
                            if (href && (href.startsWith('http') || href.startsWith('https'))) {
                                links[i].setAttribute('target', '_blank');
                            }
                        }
                    });
                </script>
                <style>
                    html { -webkit-overflow-scrolling: touch; }
                    /* Garante que variáveis funcionem com Tailwind */
                    .bg-primary { background-color: var(--primary) !important; }
                    .text-primary { color: var(--primary) !important; }
                    body { background-color: var(--bg) !important; color: var(--text) !important; font-family: var(--font-main) !important; }
                </style>
            `;
            if (content.includes('</body>')) {
                content = content.replace('</body>', `${safeScript}</body>`);
            } else {
                content += safeScript;
            }
            
            // Injeção de CSS do Tema (Obrigatório para o Preview ficar colorido)
            if (client.themeConfig) {
                 const { primaryColor, secondaryColor, backgroundColor, surfaceColor, textColor, fontFamily, imageOverrides } = client.themeConfig;
                 const themeCss = `
                    <style>
                        :root {
                            ${primaryColor ? `--primary: ${primaryColor} !important;` : ''}
                            ${secondaryColor ? `--secondary: ${secondaryColor} !important;` : ''}
                            ${backgroundColor ? `--bg: ${backgroundColor} !important;` : ''}
                            ${surfaceColor ? `--surface: ${surfaceColor} !important;` : ''}
                            ${textColor ? `--text: ${textColor} !important;` : ''}
                            ${fontFamily ? `--font-main: '${fontFamily}', sans-serif !important;` : ''}
                        }
                    </style>
                `;
                content = content.replace('</head>', `${themeCss}</head>`);

                // CRITICAL FIX: Aplicar a substituição de imagens no HTML do PREVIEW
                // Isso garante que o que você vê no editor seja o que aparece aqui e no público.
                if (imageOverrides) {
                    Object.entries(imageOverrides).forEach(([originalSrc, newSrc]) => {
                        if (newSrc && (newSrc as string).trim() !== '') {
                            content = content.split(originalSrc).join(newSrc);
                        }
                    });
                }
            }

             // Cria o Blob
             const blob = new Blob([content], { type: 'text/html' });
             const url = URL.createObjectURL(blob);
             setPreviewBlobUrl(url);
     
             // Cleanup
             return () => {
                 URL.revokeObjectURL(url);
             };
        }
    }, [activeTab, client.siteContent, client.themeConfig, optimizedContent]); // Dependência adicionada: optimizedContent


    // Renderizar o Dossiê Rico (Igual ao VisionaryWeb)
    const renderDossier = () => {
        const data = client.leadData;
        if (!data) return (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 p-10 text-center">
                <Target size={48} className="mb-4 opacity-20" />
                <h3 className="text-slate-900 text-lg font-medium mb-2">Sem Dossiê de Inteligência</h3>
                <p>Este projeto foi criado manualmente, portanto não possui dados de inteligência de lead importados.</p>
            </div>
        );

        const hasWebsite = data.website && data.website.length > 5;
        const openingHoursList = Array.isArray(data.openingHours) ? data.openingHours : [data.openingHours];

        return (
            <div className="w-full max-w-6xl mx-auto p-8 overflow-y-auto h-full space-y-8">
                {/* Header Card */}
                <div className="bg-white border border-zinc-200 rounded-sm p-8 flex flex-col md:flex-row justify-between gap-6 relative overflow-hidden shadow-sm">
                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-900 via-orange-700 to-slate-900"></div>
                    <div>
                        <div className="flex items-center gap-2 text-xs font-bold text-orange-700 uppercase tracking-widest mb-2">
                            <Sparkles size={12} /> Raio-X Visionário
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">{data.name}</h2>
                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                            {data.rating && (
                                <span className="flex items-center gap-1 text-orange-700 bg-orange-50 px-2 py-1 rounded-sm border border-orange-200 font-bold">
                                    <Star size={14} fill="currentColor" /> {data.rating} • {data.reviewCount} reviews
                                </span>
                            )}
                            <span className="flex items-center gap-1 bg-zinc-50 px-2 py-1 rounded-sm border border-zinc-200 text-slate-600">
                                <MapPin size={14} /> {data.address}
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 items-end justify-center">
                         <div className={`px-4 py-1.5 rounded-sm text-xs font-bold border flex items-center gap-2 ${
                            data.businessStatus?.includes('Aberto') || data.businessStatus === 'OPERATIONAL'
                            ? 'bg-green-50 text-green-700 border-green-200' 
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                            <div className={`w-2 h-2 rounded-full ${data.businessStatus?.includes('Aberto') || data.businessStatus === 'OPERATIONAL' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            {data.businessStatus || 'Status N/A'}
                        </div>
                    </div>
                </div>

                {/* 3-Column Grid: Operational | Audit | Attributes */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: Operacional */}
                    <div className="bg-white border border-zinc-200 rounded-sm p-6 space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-100 pb-3">
                            <Clock size={16} className="text-slate-900" /> Operacional
                        </h3>
                        <div className="space-y-3 text-sm">
                             <div className="flex justify-between border-b border-zinc-100 pb-2">
                                <span className="text-slate-500">Status</span>
                                <span className={data.businessStatus?.includes('Aberto') ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                                    {data.businessStatus}
                                </span>
                            </div>
                            <div className="flex justify-between items-start pb-2">
                                <span className="text-slate-500 shrink-0">Horários</span>
                                <div className="text-right text-slate-800 space-y-1 text-xs">
                                    {openingHoursList.map((h, i) => (
                                        <div key={i}>{h}</div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-zinc-100">
                                <span className="text-slate-500">Telefone</span>
                                <span className="text-slate-900 font-mono font-bold">{data.phoneNumber}</span>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Auditoria Digital */}
                    <div className="bg-white border border-zinc-200 rounded-sm p-6 space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-100 pb-3">
                            <Globe size={16} className="text-orange-700" /> Auditoria Digital
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs text-slate-500 block mb-1">Site Atual</span>
                                {hasWebsite ? (
                                    <a href={data.website || '#'} target="_blank" className="text-sm text-blue-600 hover:underline flex items-center gap-1 truncate font-medium">
                                        {data.website} <ExternalLink size={10} />
                                    </a>
                                ) : (
                                    <span className="text-sm text-red-600 bg-red-50 px-2 py-1 rounded-sm border border-red-200 inline-block font-bold">
                                        Inexistente (Oportunidade Crítica)
                                    </span>
                                )}
                            </div>

                            <div>
                                <span className="text-xs text-slate-500 block mb-2 flex items-center gap-1"><ImageIcon size={10} /> Análise de Fotos</span>
                                <p className="text-xs text-slate-600 italic leading-relaxed bg-zinc-50 p-3 rounded-sm border border-zinc-200">
                                    "{data.photoAnalysis}"
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Atributos & SEO */}
                    <div className="bg-white border border-zinc-200 rounded-sm p-6 space-y-4">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 border-b border-zinc-100 pb-3">
                            <ShieldCheck size={16} className="text-green-600" /> Atributos & SEO
                        </h3>
                        
                        <div className="space-y-4">
                            <div>
                                <span className="text-xs text-slate-500 block mb-2">Comodidades</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {data.amenities?.map((am, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 text-[10px] rounded-sm font-medium">
                                            {am}
                                        </span>
                                    ))}
                                    {(!data.amenities || data.amenities.length === 0) && <span className="text-slate-400 text-xs">-</span>}
                                </div>
                            </div>

                             <div>
                                <span className="text-xs text-slate-500 block mb-2 flex items-center gap-1"><Tag size={10} /> Palavras-chave Sugeridas</span>
                                <div className="flex flex-wrap gap-1.5">
                                    {data.seoKeywords?.slice(0, 5).map((kw, i) => (
                                        <span key={i} className="px-2 py-0.5 bg-blue-50 border border-blue-200 text-blue-700 text-[10px] rounded-sm font-medium">
                                            {kw}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Diagnóstico Estratégico (Full Width) */}
                <div className="bg-white border border-zinc-200 rounded-sm p-8 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Target size={20} className="text-orange-600" /> Diagnóstico Estratégico
                    </h3>
                    <p className="text-slate-700 leading-relaxed text-base font-medium">
                        {data.summary}
                    </p>
                </div>

                {/* Blueprint Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-slate-900">
                        <Monitor size={20} className="text-slate-400" />
                        <h3 className="text-lg font-bold">Blueprint do Site Ideal</h3>
                        <span className="text-xs bg-zinc-100 px-2 py-1 rounded-sm text-slate-500 border border-zinc-200 font-mono">{data.blueprint?.length || 8} Seções Planejadas</span>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4">
                        {data.blueprint?.map((section, idx) => (
                            <div key={idx} className="bg-white border border-zinc-200 rounded-sm p-5 flex gap-5 hover:border-orange-700 transition-colors group shadow-sm">
                                <div className="w-12 h-12 bg-zinc-50 rounded-sm border border-zinc-200 flex items-center justify-center text-lg font-bold text-slate-400 shrink-0 group-hover:text-orange-700 group-hover:border-orange-700 transition-colors">
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-slate-900 font-bold text-base mb-1">{section.title}</h4>
                                    <p className="text-slate-500 text-sm mb-3">{section.description}</p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                                        <div className="bg-zinc-50 p-3 rounded-sm border border-zinc-200">
                                            <strong className="text-slate-400 uppercase block text-[10px] mb-1 font-bold">Estratégia UX</strong>
                                            <span className="text-slate-700 font-medium">{section.uxStrategy}</span>
                                        </div>
                                        <div className="bg-zinc-50 p-3 rounded-sm border border-zinc-200">
                                            <strong className="text-slate-400 uppercase block text-[10px] mb-1 font-bold">Direção Visual</strong>
                                            <span className="text-slate-700 font-medium">{section.visualSuggestion}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:p-8">
            <div className="bg-zinc-50 w-full h-full max-w-[1600px] rounded-sm border border-zinc-300 shadow-2xl flex flex-col overflow-hidden animate-fade-in">
                
                {/* Toolbar */}
                <div className="h-18 border-b border-zinc-200 flex items-center justify-between px-6 py-4 bg-white">
                    <div className="flex items-center gap-4">
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-900 hover:bg-zinc-100 p-2 rounded-sm transition-all">
                            <X size={20} />
                        </button>
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3">
                                <h2 className="text-slate-900 font-bold text-lg leading-tight">{client.name || 'Novo Projeto'}</h2>
                                {client.status === 'draft' && (
                                    <span className="text-[10px] bg-zinc-100 text-slate-500 px-2 py-0.5 rounded-sm border border-zinc-200 font-bold uppercase">
                                        Rascunho
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex bg-zinc-100 rounded-sm p-1 border border-zinc-200">
                        <button 
                            onClick={() => setActiveTab('edit')}
                            className={`px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'edit' ? 'bg-white text-slate-900 shadow-sm border border-zinc-200' : 'text-slate-500 hover:text-slate-700'}`}
                            disabled={isOptimizing}
                        >
                            Dados Básicos
                        </button>
                        <button 
                            onClick={() => setActiveTab('dossier')}
                            className={`px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'dossier' ? 'bg-white text-slate-900 shadow-sm border border-zinc-200' : 'text-slate-500 hover:text-slate-700'}`}
                            disabled={isOptimizing}
                        >
                            Dossiê Inteligência
                        </button>
                        <button 
                            onClick={() => setActiveTab('preview')}
                            className={`px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all ${activeTab === 'preview' ? 'bg-white text-slate-900 shadow-sm border border-zinc-200' : 'text-slate-500 hover:text-slate-700'}`}
                            disabled={(!client.siteContent && !isGenerating) || isOptimizing}
                        >
                            Preview Site
                        </button>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Se estiver Otimizando ou Mostrando Versão Otimizada */}
                        {optimizedContent ? (
                             <div className="flex items-center gap-2 animate-fade-in">
                                <span className="text-xs text-orange-700 font-bold uppercase mr-2 flex items-center gap-1">
                                    <Wand2 size={12} /> Versão Melhorada
                                </span>
                                <button 
                                    onClick={handleDiscardOptimization}
                                    className="px-4 py-2 bg-white hover:bg-red-50 hover:text-red-600 text-slate-600 border border-zinc-200 rounded-sm text-sm font-bold flex items-center gap-2 transition-colors"
                                >
                                    <Undo2 size={16} /> Descartar
                                </button>
                                <button 
                                    onClick={handleSaveOptimization}
                                    className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-sm text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                                >
                                    <Save size={16} /> Salvar & Aplicar
                                </button>
                             </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => onUpdate(client.id, { paymentStatus: client.paymentStatus === 'paid' ? 'pending' : 'paid' })}
                                    className={`px-4 py-2.5 rounded-sm text-sm font-bold flex items-center gap-2 transition-colors border shadow-sm ${
                                        client.paymentStatus === 'paid'
                                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                        : 'bg-orange-50 text-orange-700 border-orange-200 hover:bg-orange-100'
                                    }`}
                                    disabled={isOptimizing}
                                    title="Alternar status de pagamento (Manual)"
                                >
                                    {client.paymentStatus === 'paid' ? <CheckCircle size={16} /> : <Lock size={16} />}
                                    {client.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                                </button>

                                <div className="h-6 w-[1px] bg-zinc-200 mx-1"></div>

                                {/* BOTÃO DE OTIMIZAR MOBILE */}
                                {activeTab === 'preview' && client.siteContent && !isGenerating && (
                                    <button 
                                        onClick={handleFixResponsiveness}
                                        disabled={isOptimizing}
                                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white border border-slate-900 rounded-sm text-sm font-bold flex items-center gap-2 transition-all shadow-sm mr-2"
                                        title="Reescreve o CSS para garantir responsividade perfeita"
                                    >
                                        {isOptimizing ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                                        {isOptimizing ? 'Otimizando...' : 'Arrumar Mobile'}
                                    </button>
                                )}

                                {client.status === 'approved' ? (
                                    <div className="flex gap-2">
                                        <a 
                                            href={`?site=${client.slug || client.id}`} 
                                            target="_blank"
                                            className="px-4 py-2.5 bg-white hover:bg-zinc-50 text-slate-900 border border-zinc-200 rounded-sm text-sm font-bold flex items-center gap-2 transition-colors"
                                        >
                                            <ExternalLink size={16} />
                                            Link Público
                                        </a>
                                        <button 
                                            onClick={onOpenEditor}
                                            className="px-4 py-2.5 bg-orange-700 hover:bg-orange-600 text-white rounded-sm text-sm font-bold flex items-center gap-2 transition-colors shadow-sm"
                                        >
                                            <Palette size={16} />
                                            Editor
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button 
                                            onClick={onGenerate}
                                            disabled={isGenerating || isOptimizing || (!client.scope && (!client.leadData || !client.leadData.blueprint))}
                                            className={`px-6 py-2.5 rounded-sm text-sm font-bold flex items-center gap-2 transition-all shadow-sm ${
                                                isGenerating 
                                                ? 'bg-zinc-100 text-slate-400 cursor-not-allowed border border-zinc-200' 
                                                : 'bg-white text-slate-900 hover:bg-zinc-50 border border-zinc-200'
                                            }`}
                                        >
                                            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                                            {client.siteContent ? 'Regerar do Zero' : 'Gerar Site c/ IA'}
                                        </button>
                                        
                                        {client.siteContent && (
                                            <button 
                                                onClick={onApprove}
                                                disabled={isOptimizing}
                                                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-sm text-sm font-bold transition-colors shadow-md flex items-center gap-2"
                                            >
                                                <Database size={16} />
                                                Aprovar
                                            </button>
                                        )}
                                    </>
                                )}
                            </>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 flex overflow-hidden bg-zinc-50">
                    {activeTab === 'edit' ? (
                        <div className="w-full max-w-4xl mx-auto p-10 overflow-y-auto">
                             <div className="space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nome do Cliente</label>
                                        <input 
                                            value={client.name}
                                            onChange={(e) => onUpdate(client.id, { name: e.target.value })}
                                            className="w-full bg-white border border-zinc-300 rounded-sm px-5 py-4 text-slate-900 focus:outline-none focus:border-orange-700 transition-colors placeholder-slate-400 text-lg font-medium shadow-sm"
                                            placeholder="Ex: Padaria do Zé"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Indústria</label>
                                        <input 
                                            value={client.industry}
                                            onChange={(e) => onUpdate(client.id, { industry: e.target.value })}
                                            className="w-full bg-white border border-zinc-300 rounded-sm px-5 py-4 text-slate-900 focus:outline-none focus:border-orange-700 transition-colors placeholder-slate-400 text-lg font-medium shadow-sm"
                                            placeholder="Ex: Gastronomia, Tech..."
                                        />
                                    </div>
                                </div>

                                {/* CAMPO DE SLUG / LINK PERSONALIZADO (NOVO) */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-baseline">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <LinkIcon size={14} /> Link Personalizado (Slug)
                                        </label>
                                        <span className="text-xs text-orange-700 font-bold">Este será o endereço do site</span>
                                    </div>
                                    <div className="relative">
                                        <div className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-400 text-sm font-mono">
                                            ?site=
                                        </div>
                                        <input 
                                            value={client.slug || ''}
                                            onChange={(e) => {
                                                const newSlug = e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^\w\-]+/g, '');
                                                
                                                // --- AUTOMATIC SUBDOMAIN SYNC ---
                                                let host = window.location.hostname;
                                                if (host.startsWith('www.')) host = host.substring(4);
                                                const newSubdomain = `${newSlug}.${host}`;

                                                // Atualiza ambos ao mesmo tempo
                                                onUpdate(client.id, { 
                                                    slug: newSlug,
                                                    subdomain: newSubdomain 
                                                });
                                            }}
                                            className="w-full bg-white border border-zinc-300 rounded-sm pl-16 pr-5 py-4 text-slate-900 focus:outline-none focus:border-orange-700 transition-colors placeholder-slate-400 text-base font-mono shadow-sm"
                                            placeholder="nome-do-cliente"
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500">
                                        Alterar isso atualiza automaticamente o subdomínio para exportação.
                                    </p>
                                </div>

                                {/* Link de Pagamento */}
                                <div className="space-y-3">
                                    <div className="flex justify-between items-baseline">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Link de Checkout (Pagamento)</label>
                                        <span className="text-xs text-green-600 font-bold">Mercado Pago ou Stripe</span>
                                    </div>
                                    <input 
                                        value={client.paymentLink || ''}
                                        onChange={(e) => onUpdate(client.id, { paymentLink: e.target.value })}
                                        className="w-full bg-white border border-zinc-300 rounded-sm px-5 py-4 text-slate-900 focus:outline-none focus:border-green-500 transition-colors placeholder-slate-400 text-base font-mono shadow-sm"
                                        placeholder="https://mpago.la/..."
                                    />
                                    <p className="text-[10px] text-slate-500">Se preenchido, o botão da tela de bloqueio levará para este link.</p>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-baseline">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <Clock size={14} /> Tempo de Degustação (Deste Cliente)
                                        </label>
                                        <span className="text-xs text-slate-400">Total em horas. Definido inicialmente pela configuração global.</span>
                                    </div>
                                    <input 
                                        type="number"
                                        value={client.trialHours || 168}
                                        onChange={(e) => onUpdate(client.id, { trialHours: parseInt(e.target.value) || 0 })}
                                        className="w-full bg-white border border-zinc-300 rounded-sm px-5 py-4 text-slate-900 focus:outline-none focus:border-orange-700 transition-colors placeholder-slate-400 text-lg font-mono shadow-sm"
                                    />
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between items-baseline">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Briefing / Escopo</label>
                                        <span className="text-xs text-orange-700 font-bold">Quanto mais detalhes, melhor o resultado.</span>
                                    </div>
                                    <textarea 
                                        value={client.scope}
                                        onChange={(e) => onUpdate(client.id, { scope: e.target.value })}
                                        className="w-full h-96 bg-white border border-zinc-300 rounded-sm px-6 py-6 text-slate-900 focus:outline-none focus:border-orange-700 transition-colors placeholder-slate-400 resize-none leading-relaxed text-base font-mono shadow-sm"
                                        placeholder="Descreva o estilo visual, as cores desejadas, o conteúdo das seções, o tom de voz..."
                                    />
                                </div>

                                {/* CREDENCIAIS DE ACESSO DO CLIENTE (NOVO BLOCO) */}
                                <div className="bg-zinc-50 p-6 rounded-sm border border-zinc-200 space-y-4">
                                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                        <User size={16} className="text-orange-700" /> Credenciais de Acesso (Portal do Cliente)
                                    </h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Use estes dados para o cliente acessar o painel administrativo. Você pode alterar a senha se necessário.
                                    </p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                             <label className="text-xs font-bold text-slate-500 uppercase">E-mail de Login</label>
                                             <input 
                                                value={client.email || ''} 
                                                onChange={(e) => onUpdate(client.id, { email: e.target.value })}
                                                className="w-full bg-white border border-zinc-300 rounded-sm px-4 py-3 text-slate-900 focus:border-orange-700 focus:outline-none text-sm font-mono shadow-sm"
                                                placeholder="email@cliente.com"
                                             />
                                        </div>
                                        <div className="space-y-2">
                                             <label className="text-xs font-bold text-slate-500 uppercase">Senha</label>
                                             <div className="relative">
                                                 <input 
                                                    value={client.password || ''} 
                                                    onChange={(e) => onUpdate(client.id, { password: e.target.value })}
                                                    className="w-full bg-white border border-zinc-300 rounded-sm px-4 py-3 text-slate-900 focus:border-orange-700 focus:outline-none text-sm font-mono shadow-sm"
                                                    placeholder="senha123"
                                                 />
                                                 <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                                                    <Key size={14} />
                                                 </div>
                                             </div>
                                        </div>
                                    </div>
                                </div>

                                {/* BOTÃO DE SALVAR MANUAL (NOVO) */}
                                <div className="pt-4 pb-8">
                                    <button 
                                        onClick={handleManualSave}
                                        className={`w-full py-4 rounded-sm font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md ${
                                            isSaving 
                                            ? 'bg-green-600 text-white' 
                                            : 'bg-white hover:bg-zinc-100 text-slate-900 border border-zinc-300'
                                        }`}
                                    >
                                        {isSaving ? <CheckCircle size={18} /> : <Save size={18} />}
                                        {isSaving ? 'Alterações Salvas!' : 'Salvar Alterações'}
                                    </button>
                                </div>
                             </div>
                        </div>
                    ) : activeTab === 'dossier' ? (
                        renderDossier()
                    ) : (
                        <div className="w-full h-full bg-zinc-100 relative flex flex-col items-center">
                             
                             {/* TOOLBAR DE PREVIEW (NOVO) */}
                             {previewBlobUrl && !isGenerating && !isOptimizing && (
                                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-20 flex bg-white border border-zinc-300 rounded-sm p-1 shadow-lg">
                                    <button 
                                        onClick={() => setPreviewMode('desktop')}
                                        className={`p-2 rounded-sm transition-colors ${previewMode === 'desktop' ? 'bg-zinc-100 text-slate-900 border border-zinc-200' : 'text-slate-400 hover:text-slate-900'}`}
                                        title="Visualização Desktop"
                                    >
                                        <Monitor size={18} />
                                    </button>
                                    <button 
                                        onClick={() => setPreviewMode('mobile')}
                                        className={`p-2 rounded-sm transition-colors ${previewMode === 'mobile' ? 'bg-zinc-100 text-slate-900 border border-zinc-200' : 'text-slate-400 hover:text-slate-900'}`}
                                        title="Visualização Mobile"
                                    >
                                        <Smartphone size={18} />
                                    </button>
                                </div>
                             )}

                             {isGenerating || isOptimizing ? (
                                 <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-900 z-10 bg-white/90 backdrop-blur-sm">
                                     <div className="relative">
                                         <div className="w-16 h-16 border-4 border-orange-200 border-t-orange-700 rounded-full animate-spin mb-6"></div>
                                         <div className="absolute inset-0 flex items-center justify-center">
                                             {isOptimizing ? <Wand2 size={20} className="text-orange-700 animate-pulse" /> : <Sparkles size={20} className="text-orange-700 animate-pulse" />}
                                         </div>
                                     </div>
                                     <p className="text-xl font-bold tracking-tight">{isOptimizing ? 'Reconstruindo layout...' : 'Construindo interface...'}</p>
                                     <p className="text-sm text-slate-500 mt-3 font-mono">{isOptimizing ? 'Aplicando Mobile-First • Ajustando CSS • Mantendo conteúdo' : 'Escrevendo HTML • Compilando CSS • Otimizando'}</p>
                                 </div>
                             ) : null}
                             
                             {previewBlobUrl ? (
                                <div className={`transition-all duration-500 ease-in-out mt-8 border border-zinc-300 bg-white shadow-2xl overflow-hidden ${
                                    previewMode === 'mobile' 
                                    ? 'w-[375px] h-[667px] rounded-[40px] border-[8px] border-slate-900' 
                                    : 'w-full h-full rounded-none border-none'
                                }`}>
                                     <iframe 
                                        src={previewBlobUrl}
                                        className="w-full h-full border-none"
                                        title="Site Preview"
                                     />
                                </div>
                             ) : (
                                 <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4">
                                     <Monitor size={48} className="opacity-20 text-slate-900" />
                                     <p>{isGenerating ? 'Aguardando geração...' : 'O design aparecerá aqui após a geração.'}</p>
                                 </div>
                             )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};