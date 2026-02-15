
import React, { useState } from 'react';
// Added CheckCircle to imports
import { Palette, Sparkles, Loader2, LayoutGrid, Check, MessageSquare, Monitor, X, CheckCircle } from 'lucide-react';
import { Skeleton, Template, BrandArchetype } from '../types';
import { suggestArchetypes } from '../lib/gemini';

interface StyleLabViewProps {
    skeletons: Skeleton[];
    templates: Template[];
    onUpdateTemplates: (t: Template[]) => void;
}

export const StyleLabView: React.FC<StyleLabViewProps> = ({ skeletons, templates, onUpdateTemplates }) => {
    const [selectedSkeletonId, setSelectedSkeletonId] = useState('');
    const [niche, setNiche] = useState('');
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [archetypes, setArchetypes] = useState<BrandArchetype[]>([]);
    
    const [generatingTemplates, setGeneratingTemplates] = useState(false);
    const [tempTemplates, setTempTemplates] = useState<Template[]>([]);

    const handleSuggest = async () => {
        if (!niche || !process.env.API_KEY) return;
        setIsSuggesting(true);
        const results = await suggestArchetypes(niche, process.env.API_KEY);
        setArchetypes(results);
        setIsSuggesting(false);
    };

    const handleGenerateTemplates = async () => {
        if (!selectedSkeletonId || archetypes.length === 0) return;
        setGeneratingTemplates(true);
        const skel = skeletons.find(s => s.id === selectedSkeletonId);
        if (!skel) return;

        // Simula a geração das 5 variações aplicando os arquétipos ao HTML do skeleton
        const newTemps: Template[] = archetypes.map(arc => ({
            id: Math.random().toString(36).substring(7),
            skeletonId: selectedSkeletonId,
            niche: niche,
            archetype: arc.name,
            styleConfig: arc.styleSuggestion,
            previewHtml: skel.html, // Em uma app real, aqui chamaríamos applyStyleToSkeleton
            approved: false,
            createdAt: Date.now()
        }));

        setTempTemplates(newTemps);
        setGeneratingTemplates(false);
    };

    const approveTemplate = (t: Template) => {
        onUpdateTemplates([...templates, { ...t, approved: true }]);
        setTempTemplates(prev => prev.filter(item => item.id !== t.id));
    };

    return (
        <div className="p-8 h-full overflow-y-auto space-y-12">
            <div className="max-w-4xl bg-white border border-zinc-200 p-8 rounded-sm shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <Palette className="text-orange-700" size={24} />
                    <h2 className="text-xl font-bold">Laboratório de Estilos</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">1. Escolha o Esqueleto</label>
                        <select 
                            value={selectedSkeletonId}
                            onChange={(e) => setSelectedSkeletonId(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-sm text-sm focus:border-orange-700 outline-none"
                        >
                            <option value="">Selecione um esqueleto aprovado</option>
                            {skeletons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase">2. Defina o Nicho</label>
                        <div className="flex gap-2">
                            <input 
                                value={niche}
                                onChange={(e) => setNiche(e.target.value)}
                                placeholder="Ex: Dentista, Advogado, Sushi..."
                                className="flex-1 bg-zinc-50 border border-zinc-200 p-3 rounded-sm text-sm focus:border-orange-700 outline-none"
                            />
                            <button onClick={handleSuggest} disabled={isSuggesting || !niche} className="bg-slate-900 text-white px-4 rounded-sm flex items-center justify-center">
                                {isSuggesting ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                {archetypes.length > 0 && (
                    <div className="animate-fade-in space-y-6">
                        <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-b border-zinc-100 pb-2">Arquétipos Sugeridos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                            {archetypes.map((arc, i) => (
                                <div key={i} className="bg-zinc-50 border border-zinc-200 p-3 rounded-sm">
                                    <div className="text-[10px] font-bold text-orange-700 mb-1">{arc.name}</div>
                                    <div className="text-[9px] text-slate-500 leading-tight">{arc.description}</div>
                                </div>
                            ))}
                        </div>
                        <button 
                            onClick={handleGenerateTemplates}
                            disabled={generatingTemplates || !selectedSkeletonId}
                            className="w-full py-4 bg-orange-700 text-white font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all shadow-md"
                        >
                            {generatingTemplates ? <Loader2 className="animate-spin" size={20} /> : <LayoutGrid size={20} />}
                            Gerar as 5 Variações de Template
                        </button>
                    </div>
                )}
            </div>

            {/* Galeria de Variações Geradas (Temporárias) */}
            {tempTemplates.length > 0 && (
                <div className="space-y-6 animate-fade-in">
                    <h2 className="text-2xl font-bold">Variações Geradas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
                        {tempTemplates.map(t => (
                            <div key={t.id} className="bg-white border border-zinc-200 rounded-sm overflow-hidden flex flex-col shadow-sm group">
                                <div className="h-48 bg-zinc-100 relative overflow-hidden flex items-center justify-center">
                                     <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors z-10 pointer-events-none"></div>
                                     <div className="text-[10px] font-mono p-4 opacity-30 select-none">PREVIEW HTML</div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col gap-3">
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{t.archetype}</div>
                                        <div className="text-sm font-bold text-slate-900">{t.niche}</div>
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="w-4 h-4 rounded-full border border-zinc-200" style={{ backgroundColor: t.styleConfig.primaryColor }}></div>
                                        <div className="w-4 h-4 rounded-full border border-zinc-200" style={{ backgroundColor: t.styleConfig.backgroundColor }}></div>
                                    </div>
                                    <div className="mt-auto pt-4 flex gap-2">
                                        <button onClick={() => approveTemplate(t)} className="flex-1 py-2 bg-green-600 text-white rounded-sm text-xs font-bold flex items-center justify-center gap-1 hover:bg-green-500">
                                            <Check size={14} /> Aprovar
                                        </button>
                                        <button className="p-2 border border-zinc-200 text-slate-400 hover:text-slate-900 rounded-sm">
                                            <MessageSquare size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Biblioteca de Templates Aprovados */}
            <div className="space-y-6 border-t border-zinc-200 pt-12">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                    <CheckCircle className="text-green-600" /> Templates Aprovados
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                    {templates.map(t => (
                        <div key={t.id} className="bg-white border border-zinc-200 p-4 rounded-sm shadow-sm relative group">
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-slate-300 hover:text-red-500"><X size={14}/></button>
                            </div>
                            <div className="text-[10px] font-bold text-orange-700 uppercase mb-1">{t.archetype}</div>
                            <div className="font-bold text-sm mb-2">{t.niche}</div>
                            <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                <Monitor size={10} /> {t.skeletonId.substring(0,6)}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
