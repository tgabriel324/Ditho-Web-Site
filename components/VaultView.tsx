
import React, { useState, useMemo } from 'react';
import { Search, Filter, Layers, Box, Monitor, Edit3, Trash2, ChevronRight, LayoutGrid, CheckCircle, Archive } from 'lucide-react';
import { Skeleton, Template } from '../types';

interface VaultViewProps {
    skeletons: Skeleton[];
    templates: Template[];
    onEditAsset: (type: 'skeleton' | 'template', data: any) => void;
}

export const VaultView: React.FC<VaultViewProps> = ({ skeletons, templates, onEditAsset }) => {
    const [activeTab, setActiveTab] = useState<'skeletons' | 'templates'>('skeletons');
    const [searchTerm, setSearchTerm] = useState('');
    const [nicheFilter, setNicheFilter] = useState('all');

    const niches = useMemo(() => {
        const nSet = new Set(templates.map(t => t.niche).filter(Boolean));
        return Array.from(nSet);
    }, [templates]);

    const filteredSkeletons = skeletons.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredTemplates = templates.filter(t => {
        const matchesSearch = t.niche.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              t.archetype.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesNiche = nicheFilter === 'all' || t.niche === nicheFilter;
        return matchesSearch && matchesNiche;
    });

    return (
        <div className="p-8 h-full flex flex-col gap-8 animate-fade-in">
            {/* Header / Search Area */}
            <div className="bg-white border border-zinc-200 rounded-sm p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex bg-zinc-100 p-1 rounded-sm border border-zinc-200 shrink-0">
                    <button 
                        onClick={() => setActiveTab('skeletons')}
                        className={`px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'skeletons' ? 'bg-white text-slate-900 shadow-sm border border-zinc-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Box size={14} /> Esqueletos ({skeletons.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('templates')}
                        className={`px-6 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'templates' ? 'bg-white text-slate-900 shadow-sm border border-zinc-200' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Layers size={14} /> Templates ({templates.length})
                    </button>
                </div>

                <div className="flex items-center gap-4 flex-1 w-full max-w-2xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                            type="text" 
                            placeholder={`Buscar em ${activeTab === 'skeletons' ? 'esqueletos' : 'templates'}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-sm pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-orange-700 transition-all"
                        />
                    </div>
                    {activeTab === 'templates' && (
                        <select 
                            value={nicheFilter}
                            onChange={(e) => setNicheFilter(e.target.value)}
                            className="bg-zinc-50 border border-zinc-200 rounded-sm px-4 py-2.5 text-xs font-bold uppercase text-slate-600 focus:border-orange-700 outline-none cursor-pointer"
                        >
                            <option value="all">Todos os Nichos</option>
                            {niches.map(n => <option key={n} value={n}>{n}</option>)}
                        </select>
                    )}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto pb-10">
                {activeTab === 'skeletons' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredSkeletons.map(skel => (
                            <div key={skel.id} className="bg-white border border-zinc-200 rounded-sm overflow-hidden flex flex-col group hover:border-orange-700 transition-all shadow-sm">
                                <div className="h-48 bg-zinc-100 relative overflow-hidden flex items-center justify-center grayscale group-hover:grayscale-0 transition-all">
                                    <iframe srcDoc={skel.html} className="w-full h-full scale-50 origin-top-left pointer-events-none opacity-40" />
                                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors z-10"></div>
                                </div>
                                <div className="p-5 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-slate-900 text-base">{skel.name}</h3>
                                        <span className="text-[10px] bg-zinc-100 text-slate-500 px-2 py-0.5 rounded-sm font-mono">#{skel.id.substring(0,6)}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => onEditAsset('skeleton', skel)}
                                            className="flex-1 py-2.5 bg-slate-900 text-white rounded-sm text-xs font-bold flex items-center justify-center gap-2 hover:bg-slate-800 transition-colors"
                                        >
                                            <Edit3 size={14} /> Studio Modo
                                        </button>
                                        <button className="p-2.5 border border-zinc-200 text-slate-400 hover:text-red-600 rounded-sm transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredTemplates.map(tpl => (
                            <div key={tpl.id} className="bg-white border border-zinc-200 rounded-sm overflow-hidden flex flex-col group hover:border-orange-700 transition-all shadow-sm">
                                <div className="h-48 bg-zinc-100 relative overflow-hidden flex items-center justify-center">
                                    <div className="absolute top-4 left-4 z-20">
                                        <span className="text-[10px] font-bold text-orange-700 bg-white/90 backdrop-blur px-2 py-1 rounded-sm border border-orange-200 shadow-sm uppercase tracking-widest">{tpl.archetype}</span>
                                    </div>
                                    {/* Em uma app real, aqui o preview seria injetado no iframe */}
                                    <div className="text-[10px] font-mono text-slate-300 opacity-50 select-none">PREVIEW DO TEMPLATE</div>
                                    <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/10 transition-colors z-10"></div>
                                </div>
                                <div className="p-5 flex flex-col gap-4">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-base">{tpl.niche}</h3>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">
                                                <Box size={10} /> Esqueleto Base: {tpl.skeletonId.substring(0,6)}
                                            </div>
                                        </div>
                                        <div className="flex gap-1 mt-1">
                                            <div className="w-3 h-3 rounded-full border border-zinc-200" style={{ backgroundColor: tpl.styleConfig.primaryColor }}></div>
                                            <div className="w-3 h-3 rounded-full border border-zinc-200" style={{ backgroundColor: tpl.styleConfig.backgroundColor }}></div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => onEditAsset('template', tpl)}
                                            className="flex-1 py-2.5 bg-orange-700 text-white rounded-sm text-xs font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-colors shadow-sm"
                                        >
                                            <Edit3 size={14} /> Refinar no Studio
                                        </button>
                                        <button className="p-2.5 border border-zinc-200 text-slate-400 hover:text-red-600 rounded-sm transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {(activeTab === 'skeletons' ? filteredSkeletons : filteredTemplates).length === 0 && (
                    <div className="h-96 flex flex-col items-center justify-center text-slate-400 gap-4 border-2 border-dashed border-zinc-200 rounded-sm bg-white/50">
                        <Archive size={48} className="opacity-10" />
                        <p className="text-sm font-medium">Nenhum ativo encontrado nesta categoria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};
