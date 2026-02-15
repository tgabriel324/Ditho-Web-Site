
import React, { useState, useRef, useEffect } from 'react';
import { Upload, Play, Pause, CheckCircle, Loader2, FileJson, AlertTriangle, MapPin, Phone, Star, Clock, Globe, X, ChevronRight, ExternalLink, Filter, Trash2, PlusCircle, Check, Layers } from 'lucide-react';
import { Client, LeadJSON, QueueItem, Skeleton, Template } from '../types';
import { generateSiteContent, pickBestTemplate, assembleSiteFromTemplate } from '../lib/gemini';

interface MassGeneratorViewProps {
    onAddClients: (clients: Client[]) => void;
    globalSettings: any;
    onViewDetails: (client: Client) => void;
    existingClients: Client[];
    skeletons: Skeleton[];
    templates: Template[];
    
    // Persistence Props
    queue: QueueItem[];
    selectedIds: Set<string>;
    onUpdateQueue: (queue: QueueItem[]) => void;
    onUpdateSelection: (ids: Set<string>) => void;
}

const generateId = () => {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
    }
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const generateSlugLocal = (text: string) => {
    const slug = text
        .toString()
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
    return slug.length > 0 ? slug : 'projeto';
};

const getFingerprint = (data: LeadJSON): string => {
    if (data.phoneNumber) return data.phoneNumber.replace(/\D/g, '');
    return `${data.name.toLowerCase().trim()}`;
};

interface LeadCardProps {
    item: QueueItem;
    isSelected: boolean;
    onToggle?: () => void;
    processing: boolean;
    onViewDetails: (client: Client) => void;
    onDelete?: () => void;
    hasTemplateMatch: boolean;
}

const LeadCard: React.FC<LeadCardProps> = ({ item, isSelected, onToggle, processing, onViewDetails, onDelete, hasTemplateMatch }) => {
    const data = item.leadData;
    const isOpen = data.businessStatus?.includes('Aberto') || data.businessStatus === 'OPERATIONAL';
    const hasWebsite = data.website && data.website.length > 5;
    
    const handleViewDossier = (e: React.MouseEvent) => {
        e.stopPropagation();
        const tempClient: Client = {
            id: item.id,
            name: data.name,
            industry: data.categories?.[0] || 'Geral',
            scope: '',
            status: 'draft',
            paymentStatus: 'pending',
            createdAt: Date.now(),
            leadData: data
        };
        onViewDetails(tempClient);
    };

    return (
        <div 
            onClick={onToggle}
            className={`relative group bg-white border rounded-sm p-5 transition-all duration-200 flex flex-col h-full ${
                isSelected ? 'border-orange-700 ring-1 ring-orange-700 bg-orange-50/10' : 'border-zinc-200 hover:border-slate-400'
            }`}
        >
            {processing && item.status !== 'waiting' && (
                <div className={`absolute inset-0 z-10 rounded-sm flex items-center justify-center backdrop-blur-[2px] bg-white/50 border-2 ${
                    item.status === 'processing' ? 'border-orange-700' : 
                    item.status === 'done' ? 'border-green-600' : 'border-red-600'
                }`}>
                    <div className="flex flex-col items-center gap-2 bg-white p-4 rounded-sm border border-zinc-200 shadow-xl">
                        {item.status === 'processing' && <Loader2 className="animate-spin text-orange-700" size={24} />}
                        {item.status === 'done' && <CheckCircle className="text-green-600" size={24} />}
                        <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">{item.status === 'processing' ? 'Montando Site...' : 'Finalizado'}</span>
                    </div>
                </div>
            )}

            {!processing && onDelete && (
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="absolute top-4 right-10 p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm z-20"><Trash2 size={16} /></button>
            )}

            {onToggle && (
                <div className={`absolute top-4 right-4 w-5 h-5 rounded-sm border flex items-center justify-center ${isSelected ? 'bg-orange-700 border-orange-700' : 'border-zinc-300 bg-white'}`}>
                    {isSelected && <CheckCircle size={14} className="text-white" />}
                </div>
            )}

            <div className="flex justify-between items-start mb-3 pr-16">
                <h3 className="font-bold text-slate-900 text-lg leading-tight line-clamp-2">{data.name}</h3>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                {hasTemplateMatch && (
                    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-orange-700 text-white text-[10px] font-bold uppercase tracking-widest shadow-sm">
                        <Layers size={10} /> Template Match
                    </span>
                )}
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-sm text-xs font-medium border ${isOpen ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                    {data.businessStatus || 'Status N/A'}
                </span>
            </div>

            <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 mb-4 flex-1">{data.summary || 'Sem descrição.'}</p>

            <div className="mt-auto pt-4 border-t border-zinc-100 space-y-3">
                <button onClick={handleViewDossier} className="w-full mt-2 py-2 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-sm text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors flex items-center justify-center gap-1">Ver Dossiê <ChevronRight size={12} /></button>
            </div>
        </div>
    );
};

export const MassGeneratorView: React.FC<MassGeneratorViewProps> = ({ 
    onAddClients, globalSettings, onViewDetails, existingClients, skeletons, templates, queue, selectedIds, onUpdateQueue, onUpdateSelection
}) => {
    const [isPaused, setIsPaused] = useState(true);
    const [processingActive, setProcessingActive] = useState(false);
    const isPausedRef = useRef(true);
    const queueRef = useRef<QueueItem[]>(queue);

    useEffect(() => { queueRef.current = queue; }, [queue]);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const module = await import('jszip');
        const JSZip = module.default || module;
        const zip = new (JSZip as any)();
        const loadedZip = await zip.loadAsync(file);
        const newLeads: QueueItem[] = [];
        
        for (const filename of Object.keys(loadedZip.files)) {
            if (filename.endsWith('.json') && !filename.startsWith('__MACOSX')) {
                const content = await loadedZip.files[filename].async('text');
                try {
                    const rawJson = JSON.parse(content);
                    if (rawJson.name) {
                        const newId = generateId();
                        newLeads.push({ id: newId, leadData: rawJson, status: 'waiting' });
                    }
                } catch (err) {}
            }
        }
        onUpdateQueue([...queueRef.current, ...newLeads]);
    };

    const processQueue = async () => {
        if (isPausedRef.current) return;
        const nextIdx = queueRef.current.findIndex(item => item.status === 'waiting' && selectedIds.has(item.id));
        if (nextIdx === -1) { setIsPaused(true); isPausedRef.current = true; setProcessingActive(false); return; }

        updateQueueItemStatus(nextIdx, 'processing');
        const item = queueRef.current[nextIdx];
        
        try {
            const niche = (item.leadData.categories?.[0] || item.leadData.industry || "Geral").toLowerCase();
            const matchedTemplates = templates.filter(t => t.niche.toLowerCase() === niche && t.approved);
            
            let html = "";
            if (matchedTemplates.length > 0) {
                // Inteligência: Escolhe o melhor dos 5 arquétipos para este lead
                const bestTpl = await pickBestTemplate(item.leadData, matchedTemplates, process.env.API_KEY || '');
                const skel = skeletons.find(s => s.id === bestTpl.skeletonId);
                if (skel) {
                    html = await assembleSiteFromTemplate(bestTpl, skel, item.leadData, process.env.API_KEY || '');
                } else {
                    html = await generateSiteContent({ ...item.leadData, industry: niche } as any, process.env.API_KEY || '');
                }
            } else {
                html = await generateSiteContent({ ...item.leadData, industry: niche } as any, process.env.API_KEY || '');
            }

            const finalClient: Client = {
                id: item.id,
                name: item.leadData.name,
                industry: niche,
                scope: item.leadData.summary,
                status: 'approved',
                paymentStatus: 'pending',
                createdAt: Date.now(),
                leadData: item.leadData,
                siteContent: html,
                slug: `${generateSlugLocal(item.leadData.name)}-${generateId().substring(0,4)}`
            };

            updateQueueItemStatus(nextIdx, 'done', finalClient);
            onAddClients([finalClient]);
        } catch (error) {
            updateQueueItemStatus(nextIdx, 'error');
        }

        if (!isPausedRef.current) setTimeout(() => processQueue(), 1000);
    };

    const updateQueueItemStatus = (index: number, status: QueueItem['status'], resultClient?: Client) => {
        const newQueue = [...queueRef.current];
        newQueue[index] = { ...newQueue[index], status, resultClient };
        onUpdateQueue(newQueue);
    };

    const startFactory = () => { setIsPaused(false); isPausedRef.current = false; setProcessingActive(true); processQueue(); };

    return (
        <div className="flex flex-col h-full p-8 animate-fade-in bg-zinc-50">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-200 sticky top-0 bg-zinc-50/95 z-10">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">Linha de Produção Inteligente</h2>
                    <p className="text-slate-500 text-sm">Sites gerados via Esqueletos & Arquétipos para economia de tokens.</p>
                </div>
                <div className="flex gap-4">
                    <label className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-sm cursor-pointer hover:bg-zinc-50 shadow-sm transition-all">
                        <PlusCircle size={16} className="text-orange-700" />
                        <span className="text-xs font-bold">Importar Leads</span>
                        <input type="file" accept=".zip" className="hidden" onChange={handleFileUpload} />
                    </label>
                    <button onClick={startFactory} disabled={processingActive || selectedIds.size === 0} className="bg-slate-900 text-white px-6 py-2 rounded-sm font-bold text-sm flex items-center gap-2 disabled:opacity-50">
                        <Play size={16} fill="currentColor" /> Iniciar Fábrica
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20 overflow-y-auto">
                {queue.map(item => (
                    <LeadCard 
                        key={item.id} item={item} isSelected={selectedIds.has(item.id)} onToggle={() => {
                            const newSet = new Set(selectedIds);
                            if (newSet.has(item.id)) newSet.delete(item.id); else newSet.add(item.id);
                            onUpdateSelection(newSet);
                        }}
                        processing={processingActive}
                        onViewDetails={onViewDetails}
                        onDelete={() => onUpdateQueue(queue.filter(q => q.id !== item.id))}
                        hasTemplateMatch={templates.some(t => t.niche.toLowerCase() === (item.leadData.categories?.[0] || item.leadData.industry || "").toLowerCase() && t.approved)}
                    />
                ))}
            </div>
        </div>
    );
};
