
import React, { useState, useEffect } from 'react';
import { Hammer, Sparkles, Eye, CheckCircle, Loader2, Code, Trash2, Database, Monitor, Smartphone, Layout, Archive, ChevronRight, Wand2 } from 'lucide-react';
import { Skeleton } from '../types';
import { generateSkeletonHtml } from '../lib/gemini';

interface SkeletonForgeViewProps {
    skeletons: Skeleton[];
    onUpdateSkeletons: (s: Skeleton[]) => void;
}

export const SkeletonForgeView: React.FC<SkeletonForgeViewProps> = ({ skeletons, onUpdateSkeletons }) => {
    const [activeTab, setActiveTab] = useState<'forge' | 'library'>('forge');
    const [blueprint, setBlueprint] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [previewHtml, setPreviewHtml] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

    const handleCreateSkeleton = async () => {
        if (!blueprint.trim() || !process.env.API_KEY) return;
        setIsGenerating(true);
        try {
            const html = await generateSkeletonHtml(blueprint, process.env.API_KEY);
            setPreviewHtml(html);
        } catch (e) {
            alert("Erro ao criar esqueleto.");
        } finally {
            setIsGenerating(false);
        }
    };

    const approveSkeleton = () => {
        if (!previewHtml) return;
        const newSkel: Skeleton = {
            id: Math.random().toString(36).substring(7),
            name: `Skeleton ${skeletons.length + 1}`,
            html: previewHtml,
            approved: true,
            createdAt: Date.now()
        };
        onUpdateSkeletons([...skeletons, newSkel]);
        setPreviewHtml(null);
        setBlueprint('');
        setActiveTab('library');
    };

    const deleteSkeleton = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Deseja excluir este esqueleto permanentemente?")) {
            onUpdateSkeletons(skeletons.filter(s => s.id !== id));
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-50 overflow-hidden">
            {/* Horizontal Sub-menu */}
            <div className="h-14 border-b border-zinc-200 bg-white px-8 flex items-center justify-between shrink-0 z-10 shadow-sm">
                <div className="flex gap-8 h-full">
                    <button 
                        onClick={() => setActiveTab('forge')}
                        className={`flex items-center gap-2 h-full border-b-2 text-sm font-bold transition-all ${
                            activeTab === 'forge' 
                            ? 'border-orange-700 text-slate-900' 
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <Hammer size={16} />
                        Forjar DNA
                    </button>
                    <button 
                        onClick={() => setActiveTab('library')}
                        className={`flex items-center gap-2 h-full border-b-2 text-sm font-bold transition-all ${
                            activeTab === 'library' 
                            ? 'border-orange-700 text-slate-900' 
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <Archive size={16} />
                        Biblioteca ({skeletons.length})
                    </button>
                </div>
                
                {activeTab === 'forge' && previewHtml && (
                    <button 
                        onClick={approveSkeleton}
                        className="bg-orange-700 text-white px-4 py-1.5 rounded-sm text-xs font-bold flex items-center gap-2 hover:bg-orange-600 transition-all shadow-md animate-fade-in"
                    >
                        <CheckCircle size={14} />
                        Aprovar para Produção
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative">
                {activeTab === 'forge' ? (
                    <div className="flex h-full">
                        {/* Sidebar: Controls */}
                        <div className="w-96 bg-white border-r border-zinc-200 flex flex-col shrink-0 z-10 shadow-sm overflow-y-auto">
                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 text-xs font-bold text-orange-700 uppercase tracking-widest">
                                        <Wand2 size={12} />
                                        Blueprint da Engenharia
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900">Defina a Estrutura</h3>
                                    <p className="text-xs text-slate-500 leading-relaxed">
                                        Descreva as seções, colunas e fluxos. A IA criará o código HTML cru (wireframe) que servirá de base para todos os sites deste nicho.
                                    </p>
                                </div>

                                <textarea 
                                    value={blueprint}
                                    onChange={(e) => setBlueprint(e.target.value)}
                                    placeholder="Ex: Landing page para Eletricista com Header Direct-Call, Hero de urgência, Grid de 6 serviços, Seção de Provas em Fotos e Rodapé..."
                                    className="w-full h-72 bg-zinc-50 border border-zinc-200 p-4 text-sm font-mono focus:border-orange-700 outline-none resize-none rounded-sm transition-all focus:bg-white shadow-inner"
                                />

                                <button 
                                    onClick={handleCreateSkeleton}
                                    disabled={isGenerating || !blueprint.trim()}
                                    className="w-full py-4 bg-slate-900 text-white font-bold flex items-center justify-center gap-3 hover:bg-slate-800 transition-all disabled:opacity-50 shadow-lg"
                                >
                                    {isGenerating ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} className="text-orange-500" />}
                                    Gerar Esqueleto DNA
                                </button>

                                <div className="pt-6 border-t border-zinc-100">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Dicas de Produção</div>
                                    <ul className="space-y-3 text-[11px] text-slate-500">
                                        <li className="flex gap-2">
                                            <div className="w-1.5 h-1.5 bg-orange-700 rounded-full mt-1 shrink-0"></div>
                                            Use tags como {'{{NOME}}'}, {'{{TELEFONE}}'} e {'{{SERVICOS}}'} para placeholders dinâmicos.
                                        </li>
                                        <li className="flex gap-2">
                                            <div className="w-1.5 h-1.5 bg-orange-700 rounded-full mt-1 shrink-0"></div>
                                            Foque em nomes de seções funcionais (Hero, TrustBar, GridProvas).
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Right: Immersive Canvas */}
                        <div className="flex-1 bg-zinc-100/50 flex flex-col relative overflow-hidden">
                            {/* Canvas Toolbar */}
                            <div className="h-12 border-b border-zinc-200 bg-white items-center justify-center gap-4 shrink-0 px-6 z-10 shadow-sm">
                                <div className="flex bg-zinc-100 p-1 rounded-sm border border-zinc-200 shadow-sm">
                                    <button 
                                        onClick={() => setPreviewMode('desktop')}
                                        className={`p-1.5 rounded-sm transition-all ${previewMode === 'desktop' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <Monitor size={16} />
                                    </button>
                                    <button 
                                        onClick={() => setPreviewMode('mobile')}
                                        className={`p-1.5 rounded-sm transition-all ${previewMode === 'mobile' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                    >
                                        <Smartphone size={16} />
                                    </button>
                                </div>
                                <div className="h-4 w-[1px] bg-zinc-200"></div>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ambiente de Teste Industrial</span>
                            </div>

                            {/* The Canvas */}
                            <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative">
                                <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-[0.4] pointer-events-none"></div>
                                
                                {isGenerating ? (
                                    <div className="flex flex-col items-center gap-4 animate-pulse">
                                        <div className="w-12 h-12 border-4 border-orange-200 border-t-orange-700 rounded-full animate-spin"></div>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Interpretando Blueprint...</p>
                                    </div>
                                ) : previewHtml ? (
                                    <div className={`transition-all duration-500 ease-in-out bg-white shadow-2xl border border-zinc-300 relative overflow-hidden flex flex-col ${
                                        previewMode === 'mobile' 
                                        ? 'w-[375px] h-full max-h-[667px] rounded-[2.5rem] border-[10px] border-slate-900' 
                                        : 'w-full h-full rounded-sm'
                                    }`}>
                                        <iframe 
                                            srcDoc={previewHtml} 
                                            className="w-full h-full border-none grayscale-[0.2]" 
                                            title="Skeleton Preview"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-4 text-slate-300">
                                        <Layout size={64} className="opacity-10" />
                                        <p className="text-sm font-medium">Aguardando comando de forja...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Tab: Library */
                    <div className="h-full overflow-y-auto p-8 bg-zinc-50 custom-scrollbar">
                        <div className="max-w-7xl mx-auto space-y-8 pb-20">
                            <div className="flex items-center justify-between mb-8">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center border border-zinc-200 shadow-sm">
                                        <Database size={20} className="text-orange-700" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-900">Patrimônio Técnico</h2>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Base Estrutural para Lab de Estilos</p>
                                    </div>
                                </div>
                            </div>

                            {skeletons.length === 0 ? (
                                <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-zinc-200 rounded-sm bg-white/50 text-slate-400 gap-4">
                                    <Archive size={48} className="opacity-10" />
                                    <p className="text-sm font-medium">Nenhum esqueleto aprovado ainda.</p>
                                    <button onClick={() => setActiveTab('forge')} className="text-orange-700 text-xs font-bold uppercase tracking-widest hover:underline">Ir para Oficina</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                    {skeletons.map(skel => (
                                        <div key={skel.id} className="bg-white border border-zinc-200 rounded-sm overflow-hidden flex flex-col group hover:border-orange-700 transition-all shadow-sm hover:shadow-xl">
                                            <div className="h-48 bg-zinc-100 relative overflow-hidden flex items-center justify-center grayscale group-hover:grayscale-0 transition-all border-b border-zinc-100">
                                                <iframe srcDoc={skel.html} className="w-full h-full scale-[0.4] origin-top-left pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity" />
                                                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors z-10"></div>
                                            </div>
                                            <div className="p-5 flex flex-col gap-4">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="font-bold text-slate-900 text-sm mb-1">{skel.name}</h3>
                                                        <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1 uppercase tracking-widest">
                                                            <Code size={10} /> {new Date(skel.createdAt).toLocaleDateString()}
                                                        </div>
                                                    </div>
                                                    <button 
                                                        onClick={(e) => deleteSkeleton(skel.id, e)}
                                                        className="p-1.5 text-slate-300 hover:text-red-600 transition-colors rounded-sm hover:bg-red-50"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <button className="w-full py-2 bg-zinc-50 border border-zinc-200 text-slate-600 rounded-sm text-[10px] font-bold uppercase tracking-widest hover:bg-zinc-100 transition-all flex items-center justify-center gap-2">
                                                    Visualizar Base <ChevronRight size={10} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
