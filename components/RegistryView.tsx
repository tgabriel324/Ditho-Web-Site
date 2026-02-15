import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Database, Globe, ExternalLink, Unlock, Lock, Search, Filter, ChevronDown, Check, X, Archive, Loader2, AlertCircle, Calendar, CheckSquare, Trash2, AlertTriangle, Download } from 'lucide-react';
import { Client } from '../types';

interface RegistryViewProps {
    clients: Client[];
    onDeleteMany: (ids: string[]) => void;
}

export const RegistryView: React.FC<RegistryViewProps> = ({ clients, onDeleteMany }) => {
    const [isExporting, setIsExporting] = useState(false);
    const [exportProgress, setExportProgress] = useState<string>('');
    
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
    const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'pending'>('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const filteredClients = useMemo(() => {
        return clients.filter(client => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = client.name.toLowerCase().includes(searchLower) || (client.slug || '').toLowerCase().includes(searchLower);
            const matchesNiche = selectedNiches.length === 0 || selectedNiches.includes(client.industry);
            const matchesPayment = paymentFilter === 'all' ? true : client.paymentStatus === paymentFilter;
            
            let matchesDate = true;
            if (startDate || endDate) {
                const clientDate = new Date(client.createdAt).getTime();
                if (startDate) {
                    const start = new Date(startDate).getTime();
                    if (clientDate < start) matchesDate = false;
                }
                if (endDate) {
                    const end = new Date(endDate).getTime();
                    // Ajuste para o fim do dia selecionado
                    const endOfDay = end + (24 * 60 * 60 * 1000) - 1;
                    if (clientDate > endOfDay) matchesDate = false;
                }
            }
            return matchesSearch && matchesNiche && matchesPayment && matchesDate;
        });
    }, [clients, searchTerm, selectedNiches, paymentFilter, startDate, endDate]);

    const toggleSelection = (id: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) newSet.delete(id);
        else newSet.add(id);
        setSelectedIds(newSet);
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === filteredClients.length && filteredClients.length > 0) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(filteredClients.map(c => c.id)));
        }
    };

    const confirmBulkDelete = () => {
        const idsArray = Array.from(selectedIds);
        if (idsArray.length > 0) {
            onDeleteMany(idsArray);
            setSelectedIds(new Set());
            setShowDeleteConfirm(false);
        }
    };

    const handleExportBackup = async () => {
        if (selectedIds.size === 0) {
            alert("Selecione pelo menos um projeto para exportar.");
            return;
        }

        setIsExporting(true);
        setExportProgress('Iniciando compressão...');

        try {
            // Importação dinâmica do JSZip
            const module = await import('jszip');
            const JSZip = module.default || module;
            const zip = new (JSZip as any)();

            const selectedClients = clients.filter(c => selectedIds.has(c.id));

            for (const client of selectedClients) {
                const folderName = `${client.slug || client.id}`;
                const folder = zip.folder(folderName);
                
                // Salva o HTML
                if (client.siteContent) {
                    folder.file('index.html', client.siteContent);
                }
                
                // Salva o Dossiê/JSON
                if (client.leadData) {
                    folder.file('data.json', JSON.stringify(client.leadData, null, 2));
                }

                // Metadados do Sistema
                const meta = {
                    id: client.id,
                    name: client.name,
                    industry: client.industry,
                    paymentStatus: client.paymentStatus,
                    status: client.status,
                    createdAt: client.createdAt,
                    subdomain: client.subdomain
                };
                folder.file('system_meta.json', JSON.stringify(meta, null, 2));
            }

            setExportProgress('Gerando arquivo final...');
            const content = await zip.generateAsync({ type: 'blob' });
            
            // Trigger Download
            const link = document.createElement('a');
            link.href = URL.createObjectURL(content);
            link.download = `ditho_backup_${new Date().toISOString().split('T')[0]}.zip`;
            link.click();
            
            setExportProgress('Backup concluído!');
            setTimeout(() => {
                setIsExporting(false);
                setExportProgress('');
            }, 2000);

        } catch (error) {
            console.error("Erro na exportação:", error);
            alert("Falha ao exportar backup.");
            setIsExporting(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-zinc-50 animate-fade-in">
             {/* Toolbar Principal */}
             <div className="sticky top-0 z-30 bg-zinc-50/95 backdrop-blur border-b border-zinc-200 p-6 shadow-sm">
                 <div className="max-w-7xl mx-auto flex flex-col gap-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white rounded-sm flex items-center justify-center border border-zinc-200 shadow-sm">
                                <Database size={20} className="text-orange-700" />
                            </div>
                            <div>
                                <h2 className="text-slate-900 font-bold text-lg tracking-tight">Banco de Registros</h2>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Sites Aprovados & Ativos</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            {selectedIds.size > 0 && (
                                <div className="text-xs font-mono text-orange-700 bg-orange-50 px-3 py-1 rounded-sm border border-orange-200 font-bold">
                                    {selectedIds.size} selecionados
                                </div>
                            )}
                            <div className="text-xs font-mono text-slate-500">
                                Total: {filteredClients.length} registros
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col xl:flex-row gap-4 items-center justify-between bg-white p-2 rounded-sm border border-zinc-200">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                            <input 
                                type="text" 
                                placeholder="Filtrar por nome ou slug..." 
                                value={searchTerm} 
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-none rounded-sm pl-12 pr-4 py-3 text-sm text-slate-900 focus:outline-none placeholder-slate-400 font-medium"
                            />
                        </div>

                        {/* Filtros de Data */}
                        <div className="flex items-center gap-2 w-full xl:w-auto px-2">
                            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-sm px-3 py-1.5">
                                <Calendar size={14} className="text-slate-500" />
                                <input 
                                    type="date" 
                                    value={startDate} 
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="bg-transparent text-xs text-slate-700 focus:outline-none"
                                />
                                <span className="text-slate-400 text-xs">até</span>
                                <input 
                                    type="date" 
                                    value={endDate} 
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="bg-transparent text-xs text-slate-700 focus:outline-none"
                                />
                                {(startDate || endDate) && (
                                    <button onClick={() => { setStartDate(''); setEndDate(''); }} className="text-slate-400 hover:text-slate-900">
                                        <X size={14} />
                                    </button>
                                )}
                            </div>

                            <div className="h-8 w-[1px] bg-zinc-200 mx-2"></div>

                            <div className="flex items-center gap-2">
                                {selectedIds.size > 0 && (
                                    <button
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-sm font-bold text-xs bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 transition-all"
                                    >
                                        <Trash2 size={14} /> Excluir
                                    </button>
                                )}
                                <button 
                                    onClick={handleExportBackup}
                                    disabled={isExporting || selectedIds.size === 0}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-sm text-xs font-bold transition-all shadow-sm ${
                                        isExporting 
                                        ? 'bg-orange-50 text-orange-700 border border-orange-200 cursor-wait' 
                                        : 'bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed'
                                    }`}
                                >
                                    {isExporting ? <Loader2 className="animate-spin" size={14} /> : <Archive size={14} />}
                                    {isExporting ? exportProgress : 'Exportar Backup'}
                                </button>
                            </div>
                        </div>
                    </div>
                 </div>
             </div>

             {/* Tabela de Registros */}
             <div className="flex-1 overflow-y-auto p-8">
                <div className="max-w-7xl mx-auto bg-white border border-zinc-200 rounded-sm overflow-hidden shadow-sm relative">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-50 border-b border-zinc-200">
                            <tr className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em]">
                                <th className="p-6 w-16">
                                    <button 
                                        onClick={toggleSelectAll}
                                        className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-all ${
                                            selectedIds.size === filteredClients.length && filteredClients.length > 0
                                            ? 'bg-orange-700 border-orange-700' 
                                            : 'border-zinc-300 hover:border-slate-400 bg-white'
                                        }`}
                                        title="Selecionar Todos Filtrados"
                                    >
                                        {selectedIds.size === filteredClients.length && filteredClients.length > 0 && <Check size={12} className="text-white" strokeWidth={3} />}
                                        {selectedIds.size > 0 && selectedIds.size < filteredClients.length && <div className="w-2 h-0.5 bg-white"></div>}
                                    </button>
                                </th>
                                <th className="p-6">Cliente & Nicho</th>
                                <th className="p-6">Status Digital</th>
                                <th className="p-6">Financeiro</th>
                                <th className="p-6 text-right">Data de Criação</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                            {filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center text-slate-500">
                                        <div className="flex flex-col items-center gap-3">
                                            <Search size={48} className="opacity-10" />
                                            <p className="text-sm">Nenhum registro encontrado para os filtros atuais.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map(client => (
                                    <tr 
                                        key={client.id} 
                                        className={`group transition-all cursor-pointer ${selectedIds.has(client.id) ? 'bg-orange-50' : 'hover:bg-zinc-50'}`} 
                                        onClick={() => toggleSelection(client.id)}
                                    >
                                        <td className="p-6">
                                            <div 
                                                onClick={(e) => toggleSelection(client.id, e)}
                                                className={`w-5 h-5 rounded-sm border flex items-center justify-center transition-all ${
                                                    selectedIds.has(client.id) 
                                                    ? 'bg-orange-700 border-orange-700' 
                                                    : 'border-zinc-300 bg-white group-hover:border-slate-400'
                                                }`}
                                            >
                                                {selectedIds.has(client.id) && <Check size={12} className="text-white" strokeWidth={3} />}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex flex-col">
                                                <span className="text-slate-900 font-bold text-sm group-hover:text-orange-700 transition-colors">{client.name}</span>
                                                <span className="text-[10px] text-slate-500 uppercase tracking-widest mt-1 font-mono">{client.industry}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                                                <span className="text-[10px] text-green-700 font-bold uppercase tracking-wider">Aprovado</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            {client.paymentStatus === 'paid' ? (
                                                <div className="flex items-center gap-1.5 text-green-700 bg-green-50 px-2 py-1 rounded-sm border border-green-200 w-fit">
                                                    <Check size={12} strokeWidth={3} />
                                                    <span className="text-[10px] font-bold uppercase">Pago</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-orange-700 bg-orange-50 px-2 py-1 rounded-sm border border-orange-200 w-fit">
                                                    <Lock size={12} />
                                                    <span className="text-[10px] font-bold uppercase">Pendente</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-6 text-right font-mono text-xs text-slate-500">
                                            {new Date(client.createdAt).toLocaleDateString('pt-BR', {
                                                day: '2-digit',
                                                month: 'short',
                                                year: 'numeric'
                                            })}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
             </div>

            {/* Modal de Confirmação de Exclusão */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
                    <div className="bg-white border border-zinc-200 rounded-sm p-8 max-w-md w-full shadow-2xl animate-fade-in">
                        <div className="flex flex-col items-center text-center gap-6">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border border-red-100">
                                <AlertTriangle size={40} className="text-red-500" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-2xl font-bold text-slate-900">Eliminar {selectedIds.size} Registros?</h3>
                                <p className="text-slate-500 text-sm leading-relaxed">
                                    Esta ação é irreversível. Os sites serão removidos permanentemente do banco de dados e do servidor de hospedagem.
                                </p>
                            </div>
                            <div className="flex gap-3 w-full mt-4">
                                <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 px-4 py-4 bg-zinc-100 hover:bg-zinc-200 text-slate-900 rounded-sm font-bold transition-all">Cancelar</button>
                                <button onClick={confirmBulkDelete} className="flex-1 px-4 py-4 bg-red-600 hover:bg-red-500 text-white rounded-sm font-bold shadow-lg shadow-red-900/20 transition-all">Confirmar Exclusão</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};