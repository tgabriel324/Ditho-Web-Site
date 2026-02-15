
import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Sparkles, Loader2, Wand2, Undo2, Redo2, Monitor, Smartphone, Code, Palette, MessageSquare, Send, X, CheckCircle, Info } from 'lucide-react';
import { Skeleton, Template, ThemeConfig } from '../types';
import { editSiteContent } from '../lib/gemini';

interface StudioModeProps {
    assetType: 'skeleton' | 'template';
    assetData: any;
    onBack: () => void;
    onSave: (updated: any) => void;
}

export const StudioMode: React.FC<StudioModeProps> = ({ assetType, assetData, onBack, onSave }) => {
    const [localHtml, setLocalHtml] = useState(assetType === 'skeleton' ? assetData.html : assetData.previewHtml);
    const [theme, setTheme] = useState<ThemeConfig>(assetType === 'template' ? assetData.styleConfig : {});
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    
    // IA Chat State
    const [chatInput, setChatInput] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [history, setHistory] = useState<string[]>([localHtml]);
    const [future, setFuture] = useState<string[]>([]);
    
    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Injeção de visual no Iframe
    useEffect(() => {
        if (iframeRef.current && localHtml) {
            const doc = iframeRef.current.contentDocument;
            if (!doc) return;

            let htmlToInject = localHtml;
            
            // Injeção de Tailwind e Reset Industrial
            const injections = `
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    body { 
                        background-color: ${theme.backgroundColor || '#f4f4f5'}; 
                        color: ${theme.textColor || '#0f172a'};
                        font-family: '${theme.fontFamily || 'Inter'}', sans-serif;
                    }
                    :root {
                        --primary: ${theme.primaryColor || '#ea580c'};
                    }
                    .bg-primary { background-color: var(--primary) !important; }
                    .text-primary { color: var(--primary) !important; }
                    ${assetType === 'skeleton' ? 'body { filter: grayscale(1); opacity: 0.7; }' : ''}
                </style>
            `;

            if (htmlToInject.includes('<head>')) {
                htmlToInject = htmlToInject.replace('<head>', `<head>${injections}`);
            } else {
                htmlToInject = injections + htmlToInject;
            }

            doc.open();
            doc.write(htmlToInject);
            doc.close();
        }
    }, [localHtml, theme]);

    const handleUndo = () => {
        if (history.length <= 1) return;
        const current = history[history.length - 1];
        const prev = history[history.length - 2];
        setFuture([current, ...future]);
        setLocalHtml(prev);
        setHistory(history.slice(0, -1));
    };

    const handleRedo = () => {
        if (future.length === 0) return;
        const next = future[0];
        setHistory([...history, next]);
        setLocalHtml(next);
        setFuture(future.slice(1));
    };

    const handleAIRefinement = async () => {
        if (!chatInput.trim() || isProcessing) return;
        setIsProcessing(true);
        try {
            const prompt = assetType === 'skeleton' 
                ? `Ajuste a ESTRUTURA/SKELETON conforme: ${chatInput}. Mantenha em escala de cinza.`
                : `Ajuste o ESTILO/VISUAL deste template conforme: ${chatInput}. Mantenha a estrutura, mude cores/fontes/espaçamento via Tailwind.`;
            
            const newHtml = await editSiteContent(localHtml, prompt, process.env.API_KEY || '');
            setHistory([...history, newHtml]);
            setLocalHtml(newHtml);
            setFuture([]);
            setChatInput('');
        } catch (e) {
            alert("Erro no refinamento via IA.");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleFinalSave = () => {
        const updated = { ...assetData };
        if (assetType === 'skeleton') {
            updated.html = localHtml;
        } else {
            updated.previewHtml = localHtml;
            updated.styleConfig = theme;
        }
        onSave(updated);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-zinc-100 flex flex-col font-sans animate-fade-in">
            {/* Top Navigation */}
            <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-6 shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2 hover:bg-zinc-50 rounded-sm text-slate-400 hover:text-slate-900 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="text-slate-900 font-bold text-sm tracking-tight">Studio: Refinando {assetType === 'skeleton' ? 'Esqueleto' : 'Template'}</h2>
                        <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold font-mono">ID: {assetData.id}</p>
                    </div>
                </div>

                <div className="flex bg-zinc-100 p-1 rounded-sm border border-zinc-200">
                    <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-sm transition-all ${previewMode === 'desktop' ? 'bg-white shadow-sm' : 'text-slate-400'}`}><Monitor size={18} /></button>
                    <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-sm transition-all ${previewMode === 'mobile' ? 'bg-white shadow-sm' : 'text-slate-400'}`}><Smartphone size={18} /></button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex gap-1 border-r border-zinc-200 pr-3 mr-1">
                         <button onClick={handleUndo} disabled={history.length <= 1} className="p-2 text-slate-400 hover:text-slate-900 disabled:opacity-20 transition-all"><Undo2 size={18}/></button>
                         <button onClick={handleRedo} disabled={future.length === 0} className="p-2 text-slate-400 hover:text-slate-900 disabled:opacity-20 transition-all"><Redo2 size={18}/></button>
                    </div>
                    <button onClick={handleFinalSave} className="px-6 py-2.5 bg-slate-900 text-white rounded-sm text-sm font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-md">
                        <Save size={16} /> Salvar Versão Final
                    </button>
                </div>
            </header>

            {/* Main Studio Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Left: Refinement Panel */}
                <div className="w-96 bg-white border-r border-zinc-200 flex flex-col shrink-0">
                    <div className="flex-1 overflow-y-auto p-6 space-y-8">
                        {/* Info Section */}
                        <section className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Info size={14} className="text-orange-700" /> Detalhes do Ativo
                            </h3>
                            <div className="bg-zinc-50 border border-zinc-200 rounded-sm p-4 space-y-3">
                                <div>
                                    <label className="text-[10px] font-bold text-slate-400 uppercase">Nome/Nicho</label>
                                    <p className="text-sm font-bold text-slate-900">{assetData.name || assetData.niche}</p>
                                </div>
                                {assetType === 'template' && (
                                    <div>
                                        <label className="text-[10px] font-bold text-slate-400 uppercase">Arquétipo</label>
                                        <p className="text-sm font-bold text-orange-700 uppercase tracking-widest">{assetData.archetype}</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Visual Config (Só para templates) */}
                        {assetType === 'template' && (
                            <section className="space-y-4">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <Palette size={14} className="text-orange-700" /> Estilo de Design
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-sm">
                                        <span className="text-xs font-bold text-slate-700">Cor Primária</span>
                                        <input type="color" value={theme.primaryColor} onChange={(e) => setTheme({...theme, primaryColor: e.target.value})} className="w-8 h-8 rounded-sm cursor-pointer" />
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-zinc-50 border border-zinc-200 rounded-sm">
                                        <span className="text-xs font-bold text-slate-700">Cor de Fundo</span>
                                        <input type="color" value={theme.backgroundColor} onChange={(e) => setTheme({...theme, backgroundColor: e.target.value})} className="w-8 h-8 rounded-sm cursor-pointer" />
                                    </div>
                                </div>
                            </section>
                        )}

                        {/* AI Assistance */}
                        <section className="space-y-4">
                            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Sparkles size={14} className="text-orange-700" /> Refinamento Assistido
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                                Peça para a IA mudar o layout, adicionar seções ou ajustar o "feeling" do ativo.
                            </p>
                        </section>
                    </div>

                    {/* Chat Input */}
                    <div className="p-6 border-t border-zinc-200 bg-white">
                        <div className="relative">
                            <textarea 
                                value={chatInput}
                                onChange={(e) => setChatInput(e.target.value)}
                                placeholder="Ex: Deixe o cabeçalho menor e adicione um FAQ..."
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-sm p-4 pr-12 text-sm focus:outline-none focus:border-orange-700 resize-none h-32"
                            />
                            <button 
                                onClick={handleAIRefinement}
                                disabled={isProcessing || !chatInput.trim()}
                                className="absolute right-3 bottom-3 p-2 bg-orange-700 text-white rounded-sm hover:bg-orange-600 disabled:opacity-50 transition-all shadow-md"
                            >
                                {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Center: Live Preview */}
                <div className="flex-1 bg-zinc-200/30 flex items-center justify-center p-8 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-50"></div>
                    
                    {isProcessing && (
                        <div className="absolute inset-0 z-50 bg-white/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                            <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-700 rounded-full animate-spin"></div>
                            <span className="text-xs font-bold text-slate-900 uppercase tracking-widest animate-pulse">Refinando Ativo...</span>
                        </div>
                    )}

                    <div className={`transition-all duration-500 ease-in-out bg-white shadow-2xl overflow-hidden ${
                        previewMode === 'mobile' 
                        ? 'w-[375px] h-[667px] rounded-[3rem] border-[8px] border-slate-900' 
                        : 'w-full h-full rounded-sm border border-zinc-300'
                    }`}>
                        <iframe 
                            ref={iframeRef}
                            className="w-full h-full border-none"
                            title="Studio Preview"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
