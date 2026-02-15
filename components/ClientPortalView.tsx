import React, { useState } from 'react';
import { User, LogOut, Edit3, Globe, ExternalLink, Smartphone, Mail, Lock, Save, CheckCircle, ChevronRight, LayoutGrid, Eye } from 'lucide-react';
import { Client } from '../types';

interface ClientPortalViewProps {
    client: Client;
    onLogout: () => void;
    onOpenEditor: (client: Client) => void;
    onUpdateClient: (id: string, data: Partial<Client>) => void;
}

export const ClientPortalView: React.FC<ClientPortalViewProps> = ({ client, onLogout, onOpenEditor, onUpdateClient }) => {
    const [activeTab, setActiveTab] = useState<'products' | 'profile'>('products');
    
    // Profile State
    const [tempName, setTempName] = useState(client.name);
    const [tempEmail, setTempEmail] = useState(client.email || '');
    const [tempPassword, setTempPassword] = useState(client.password || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveProfile = () => {
        setIsSaving(true);
        onUpdateClient(client.id, {
            name: tempName,
            email: tempEmail,
            password: tempPassword
        });
        setTimeout(() => setIsSaving(false), 1000);
    };

    return (
        <div className="min-h-screen bg-zinc-50 font-sans text-slate-900 pb-24">
            {/* Header Mobile Style */}
            <div className="bg-white border-b border-zinc-200 px-6 py-6 sticky top-0 z-30 shadow-sm">
                <div className="flex justify-between items-center max-w-lg mx-auto">
                    <div>
                        <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Bem-vindo,</p>
                        <h1 className="text-xl font-bold text-slate-900 truncate max-w-[200px]">{client.name}</h1>
                    </div>
                    <div className="w-10 h-10 bg-orange-50 rounded-full border border-orange-200 flex items-center justify-center text-orange-700 font-bold">
                        {client.name.substring(0, 1)}
                    </div>
                </div>
            </div>

            <div className="max-w-lg mx-auto p-6 animate-fade-in">
                
                {/* --- TAB: PRODUTOS (HOME) --- */}
                {activeTab === 'products' && (
                    <div className="space-y-6">
                        <div className="bg-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
                             <div className="absolute top-0 right-0 p-4 opacity-10">
                                <LayoutGrid size={120} />
                             </div>
                             <p className="text-slate-400 text-xs uppercase tracking-widest font-bold mb-2">Seus Produtos</p>
                             <h2 className="text-2xl font-bold mb-1">1 Site Ativo</h2>
                             <p className="text-sm text-slate-400">Gerencie sua presença digital.</p>
                        </div>

                        {/* Lista de Produtos (No caso, o site dele) */}
                        <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden shadow-sm">
                            {/* Card do Site */}
                            <div className="p-5 border-b border-zinc-100">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-zinc-100 rounded-lg flex items-center justify-center text-slate-400">
                                            <Globe size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-900 text-lg">{client.name}</h3>
                                            <a href={`?site=${client.slug || client.id}`} target="_blank" className="text-xs text-blue-600 flex items-center gap-1 hover:underline">
                                                {client.subdomain || 'Ver online'} <ExternalLink size={10} />
                                            </a>
                                        </div>
                                    </div>
                                    <span className="bg-green-100 text-green-700 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border border-green-200">
                                        Online
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button 
                                        onClick={() => onOpenEditor(client)}
                                        className="flex flex-col items-center justify-center bg-orange-600 hover:bg-orange-700 active:scale-95 transition-all text-white p-4 rounded-lg shadow-md"
                                    >
                                        <Edit3 size={24} className="mb-2" />
                                        <span className="text-sm font-bold">Editar Site</span>
                                    </button>
                                    
                                    <a 
                                        href={`?site=${client.slug || client.id}`} 
                                        target="_blank"
                                        className="flex flex-col items-center justify-center bg-white border border-zinc-200 hover:bg-zinc-50 active:scale-95 transition-all text-slate-700 p-4 rounded-lg"
                                    >
                                        <Eye size={24} className="mb-2 text-slate-400" />
                                        <span className="text-sm font-bold">Ver Site</span>
                                    </a>
                                </div>
                            </div>
                            
                            {/* Estatísticas (Fake/Placeholder) */}
                            <div className="bg-zinc-50 p-4 flex justify-between text-xs text-slate-500">
                                <div className="text-center flex-1 border-r border-zinc-200">
                                    <strong className="block text-slate-900 text-sm">124</strong>
                                    Visitas este mês
                                </div>
                                <div className="text-center flex-1">
                                    <strong className="block text-slate-900 text-sm">12</strong>
                                    Cliques no Zap
                                </div>
                            </div>
                        </div>

                        {/* Banner de Upsell (Exemplo) */}
                        <div className="border border-dashed border-zinc-300 rounded-xl p-6 text-center">
                            <Smartphone size={32} className="mx-auto text-slate-300 mb-2" />
                            <h3 className="text-slate-900 font-bold mb-1">Quer um App Android?</h3>
                            <p className="text-xs text-slate-500 mb-4">Transforme seu site em um aplicativo instalável.</p>
                            <button className="text-orange-700 text-xs font-bold uppercase tracking-wide border border-orange-200 px-4 py-2 rounded-full hover:bg-orange-50">
                                Falar com Suporte
                            </button>
                        </div>
                    </div>
                )}

                {/* --- TAB: PERFIL --- */}
                {activeTab === 'profile' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-slate-900">Meus Dados</h2>
                        
                        <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4 shadow-sm">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Nome da Empresa</label>
                                <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3">
                                    <Smartphone size={18} className="text-slate-400" />
                                    <input 
                                        type="text" 
                                        value={tempName}
                                        onChange={(e) => setTempName(e.target.value)}
                                        className="bg-transparent w-full text-slate-900 font-medium focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">E-mail de Acesso</label>
                                <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3">
                                    <Mail size={18} className="text-slate-400" />
                                    <input 
                                        type="email" 
                                        value={tempEmail}
                                        onChange={(e) => setTempEmail(e.target.value)}
                                        className="bg-transparent w-full text-slate-900 font-medium focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase">Alterar Senha</label>
                                <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3">
                                    <Lock size={18} className="text-slate-400" />
                                    <input 
                                        type="text" 
                                        value={tempPassword}
                                        onChange={(e) => setTempPassword(e.target.value)}
                                        className="bg-transparent w-full text-slate-900 font-medium focus:outline-none"
                                        placeholder="Nova senha"
                                    />
                                </div>
                            </div>
                            
                            <button 
                                onClick={handleSaveProfile}
                                className={`w-full py-4 rounded-lg font-bold text-sm text-white flex items-center justify-center gap-2 transition-all ${
                                    isSaving ? 'bg-green-600' : 'bg-slate-900 hover:bg-slate-800'
                                }`}
                            >
                                {isSaving ? <CheckCircle size={18} /> : <Save size={18} />}
                                {isSaving ? 'Salvo com sucesso' : 'Salvar Alterações'}
                            </button>
                        </div>

                        <button 
                            onClick={onLogout}
                            className="w-full py-4 border border-red-200 text-red-600 bg-red-50 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-red-100 transition-colors"
                        >
                            <LogOut size={18} /> Sair da Conta
                        </button>
                    </div>
                )}

            </div>

            {/* --- BOTTOM NAVIGATION (MOBILE APP STYLE) --- */}
            <div className="fixed bottom-0 left-0 w-full bg-white border-t border-zinc-200 pb-safe z-40 shadow-[0_-5px_20px_rgba(0,0,0,0.05)]">
                <div className="flex justify-around items-center max-w-lg mx-auto">
                    <button 
                        onClick={() => setActiveTab('products')}
                        className={`flex flex-col items-center gap-1 p-3 flex-1 ${
                            activeTab === 'products' ? 'text-orange-700' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <LayoutGrid size={24} />
                        <span className="text-[10px] font-bold">Início</span>
                    </button>
                    
                    <button 
                        onClick={() => setActiveTab('profile')}
                        className={`flex flex-col items-center gap-1 p-3 flex-1 ${
                            activeTab === 'profile' ? 'text-orange-700' : 'text-slate-400 hover:text-slate-600'
                        }`}
                    >
                        <User size={24} />
                        <span className="text-[10px] font-bold">Perfil</span>
                    </button>
                </div>
            </div>
        </div>
    );
};