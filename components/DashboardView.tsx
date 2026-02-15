import React, { useState, useMemo } from 'react';
import { Search, Grid, List as ListIcon, ChevronDown, DollarSign, Lock, CheckCircle, Monitor, Code, CreditCard, Trash2, Filter } from 'lucide-react';
import { Client } from '../types';

interface DashboardViewProps {
    clients: Client[];
    onSelect: (client: Client) => void;
    onDelete: (id: string) => void;
    onTogglePayment: (client: Client, e: React.MouseEvent) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ clients, onSelect, onDelete, onTogglePayment }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'pending' | 'draft'>('all');
    const [paymentFilter, setPaymentFilter] = useState<'all' | 'paid' | 'pending'>('all');
    const [industryFilter, setIndustryFilter] = useState('all');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const uniqueIndustries = useMemo(() => {
        const industries = clients.map((c: Client) => c.industry).filter(Boolean);
        return Array.from(new Set(industries));
    }, [clients]);

    const filteredClients = clients.filter((client: Client) => {
        const matchesSearch = client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              client.industry.toLowerCase().includes(searchTerm.toLowerCase());
        
        let matchesStatus = true;
        if (statusFilter === 'approved') matchesStatus = client.status === 'approved';
        if (statusFilter === 'pending') matchesStatus = client.status === 'generated' || client.status === 'generating';
        if (statusFilter === 'draft') matchesStatus = client.status === 'draft';

        let matchesPayment = true;
        if (paymentFilter === 'paid') matchesPayment = client.paymentStatus === 'paid';
        if (paymentFilter === 'pending') matchesPayment = client.paymentStatus === 'pending';

        const matchesIndustry = industryFilter === 'all' || client.industry === industryFilter;

        return matchesSearch && matchesStatus && matchesPayment && matchesIndustry;
    });

    return (
        <div className="flex flex-col h-full">
            {/* --- Control Bar --- */}
            <div className="sticky top-0 z-20 px-8 py-6 bg-white/80 backdrop-blur-xl border-b border-zinc-200">
                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
                    
                    <div className="flex items-center gap-3 flex-1 min-w-[300px]">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 group-focus-within:text-orange-700 transition-colors" size={16} />
                            <input 
                                type="text" 
                                placeholder="Buscar cliente ou nicho..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-sm pl-10 pr-4 py-2 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-orange-700 focus:bg-white transition-all shadow-sm"
                            />
                        </div>
                        <div className="h-8 w-[1px] bg-zinc-200 mx-2 hidden md:block"></div>
                        <div className="flex bg-zinc-50 p-1 rounded-sm border border-zinc-200 shrink-0">
                            <button 
                                onClick={() => setViewMode('grid')}
                                className={`p-1.5 rounded-sm transition-all ${viewMode === 'grid' ? 'bg-white text-slate-900 shadow-sm border border-zinc-200' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <Grid size={16} />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`p-1.5 rounded-sm transition-all ${viewMode === 'list' ? 'bg-white text-slate-900 shadow-sm border border-zinc-200' : 'text-slate-400 hover:text-slate-600'}`}
                            >
                                <ListIcon size={16} />
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 overflow-x-auto pb-2 xl:pb-0 scrollbar-hide">
                        <div className="relative shrink-0">
                             <select 
                                value={industryFilter}
                                onChange={(e) => setIndustryFilter(e.target.value)}
                                className="appearance-none bg-zinc-50 border border-zinc-200 text-slate-700 text-xs font-semibold rounded-sm py-2 pl-4 pr-8 focus:outline-none focus:border-orange-700 hover:bg-white transition-colors cursor-pointer"
                             >
                                 <option value="all">Todos Nichos</option>
                                 {uniqueIndustries.map((ind: any) => (
                                     <option key={ind} value={ind}>{ind}</option>
                                 ))}
                             </select>
                             <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 pointer-events-none" size={12} />
                        </div>

                        <div className="h-6 w-[1px] bg-zinc-200 hidden md:block"></div>

                        <div className="flex items-center gap-1 bg-zinc-50 p-1 rounded-sm border border-zinc-200 shrink-0">
                            {[
                                { id: 'all', label: 'Tudo' },
                                { id: 'approved', label: 'Prontos' },
                                { id: 'pending', label: 'Em Prod.' },
                                { id: 'draft', label: 'Rascunhos' }
                            ].map(filter => (
                                <button
                                    key={filter.id}
                                    onClick={() => setStatusFilter(filter.id as any)}
                                    className={`px-3 py-1 rounded-sm text-xs font-semibold transition-all ${
                                        statusFilter === filter.id 
                                        ? 'bg-white text-slate-900 shadow-sm border border-zinc-200' 
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                                >
                                    {filter.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex items-center gap-1 bg-zinc-50 p-1 rounded-sm border border-zinc-200 shrink-0">
                            <button
                                onClick={() => setPaymentFilter(paymentFilter === 'paid' ? 'all' : 'paid')}
                                className={`px-3 py-1 rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                    paymentFilter === 'paid'
                                    ? 'bg-green-100 text-green-700 border border-green-200'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <DollarSign size={12} /> Pagos
                            </button>
                             <button
                                onClick={() => setPaymentFilter(paymentFilter === 'pending' ? 'all' : 'pending')}
                                className={`px-3 py-1 rounded-sm text-xs font-semibold flex items-center gap-1.5 transition-all ${
                                    paymentFilter === 'pending'
                                    ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                    : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Lock size={12} /> Pendentes
                            </button>
                        </div>

                    </div>
                </div>
                
                <div className="mt-4 flex items-center gap-4 text-xs text-slate-500 font-medium">
                    <span>Mostrando <strong className="text-slate-900">{filteredClients.length}</strong> projetos</span>
                    {paymentFilter === 'pending' && (
                        <span className="text-orange-600 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 bg-orange-600 rounded-full animate-pulse"></div>
                            Potencial de Receita (A cobrar)
                        </span>
                    )}
                </div>
            </div>

            {/* --- Content Area --- */}
            <div className="flex-1 p-8 overflow-y-auto">
                {filteredClients.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <div className="w-16 h-16 bg-zinc-100 rounded-sm flex items-center justify-center mb-4 border border-zinc-200">
                            <Filter size={24} className="text-slate-400" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-700 mb-1">Nenhum resultado</h3>
                        <p className="text-sm">Ajuste os filtros de Nicho ou Pagamento.</p>
                    </div>
                ) : viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                        {filteredClients.map((client: Client) => (
                            <div 
                                key={client.id}
                                onClick={() => onSelect(client)}
                                className={`group bg-white rounded-sm p-6 cursor-pointer transition-all duration-200 relative overflow-hidden border ${
                                    client.status === 'approved' && client.paymentStatus === 'paid'
                                    ? 'border-green-200 hover:border-green-400 shadow-sm' 
                                    : client.status === 'approved' && client.paymentStatus === 'pending'
                                    ? 'border-orange-200 hover:border-orange-400 shadow-sm'
                                    : 'border-zinc-200 hover:border-slate-400 hover:shadow-md'
                                }`}
                            >
                                {/* Top Row */}
                                <div className="flex justify-between items-start mb-5">
                                    <div className={`w-12 h-12 rounded-sm flex items-center justify-center border ${
                                        client.status === 'approved' ? (client.paymentStatus === 'paid' ? 'bg-green-50 border-green-100 text-green-600' : 'bg-orange-50 border-orange-100 text-orange-600') :
                                        client.status === 'generated' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                                        'bg-zinc-50 border-zinc-200 text-slate-400'
                                    }`}>
                                        {client.status === 'approved' ? (client.paymentStatus === 'paid' ? <CheckCircle size={24} /> : <Lock size={24} />) : 
                                         client.status === 'generated' ? <Monitor size={24} /> : 
                                         <Code size={24} />}
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={(e) => onTogglePayment(client, e)}
                                            className={`p-2 rounded-sm transition-colors ${
                                                client.paymentStatus === 'paid' 
                                                ? 'text-green-600 hover:bg-green-50' 
                                                : 'text-slate-400 hover:text-orange-600 hover:bg-orange-50'
                                            }`}
                                            title={client.paymentStatus === 'paid' ? "Marcado como Pago" : "Marcar como Pago"}
                                        >
                                            {client.paymentStatus === 'paid' ? <DollarSign size={16} /> : <CreditCard size={16} />}
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); onDelete(client.id); }}
                                            className="text-slate-400 hover:text-red-600 transition-colors p-2 rounded-sm hover:bg-red-50 opacity-0 group-hover:opacity-100"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                                
                                <h3 className="text-slate-900 font-bold mb-1 truncate text-lg tracking-tight">{client.name}</h3>
                                <p className="text-slate-500 text-xs mb-5 uppercase tracking-wider font-bold">
                                    {client.industry || 'Sem indústria'}
                                </p>
                                
                                <div className="text-sm text-slate-600 line-clamp-3 mb-6 leading-relaxed h-16">
                                    {client.scope || 'Aguardando definição de escopo...'}
                                </div>

                                <div className="flex items-center justify-between pt-5 border-t border-zinc-100">
                                    <div className="flex gap-2">
                                        <span className={`text-xs px-2.5 py-1 rounded-sm border font-semibold ${
                                            client.status === 'approved' ? 'border-zinc-200 bg-zinc-50 text-slate-700' :
                                            'border-zinc-100 bg-zinc-50 text-slate-400'
                                        }`}>
                                            {client.status === 'approved' ? 'Pronto' : 'WIP'}
                                        </span>
                                        
                                        {client.paymentStatus === 'paid' ? (
                                            <span className="text-xs px-2.5 py-1 rounded-sm border border-green-200 bg-green-50 text-green-700 font-semibold">
                                                Pago
                                            </span>
                                        ) : (
                                            <span className="text-xs px-2.5 py-1 rounded-sm border border-orange-200 bg-orange-50 text-orange-700 font-semibold flex items-center gap-1">
                                                <Lock size={10} /> Pendente
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="bg-white border border-zinc-200 rounded-sm overflow-hidden shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-zinc-200 bg-zinc-50">
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest w-1/3">Cliente</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status Técnico</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Financeiro</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest text-right">Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClients.map(client => (
                                    <tr key={client.id} onClick={() => onSelect(client)} className="border-b border-zinc-100 hover:bg-zinc-50 cursor-pointer group transition-colors">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-sm flex items-center justify-center border ${
                                                    client.status === 'approved' ? 'bg-slate-100 text-slate-900 border-zinc-200' : 'bg-zinc-50 text-slate-400 border-zinc-200'
                                                }`}>
                                                    {client.status === 'approved' ? <CheckCircle size={14} /> : <Code size={14} />}
                                                </div>
                                                <div>
                                                    <div className="text-slate-900 font-bold text-sm">{client.name}</div>
                                                    <div className="text-xs text-slate-500">{client.industry}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs text-slate-600 capitalize font-medium">{client.status}</span>
                                        </td>
                                        <td className="p-4">
                                            <button 
                                                onClick={(e) => onTogglePayment(client, e)}
                                                className={`text-xs px-2 py-0.5 rounded-sm border inline-flex items-center gap-1.5 transition-all font-semibold hover:shadow-sm ${
                                                client.paymentStatus === 'paid' 
                                                ? 'border-green-200 bg-green-50 text-green-700' 
                                                : 'border-orange-200 bg-orange-50 text-orange-700'
                                            }`}>
                                                {client.paymentStatus === 'paid' ? <DollarSign size={10} /> : <Lock size={10} />}
                                                {client.paymentStatus === 'paid' ? 'Pago' : 'Pendente'}
                                            </button>
                                        </td>
                                        <td className="p-4 text-right">
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); onDelete(client.id); }}
                                                className="text-slate-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-sm transition-colors"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};