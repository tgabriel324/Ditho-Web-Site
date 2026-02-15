
import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Layout, Plus, Loader2, Database, Settings, Factory, CheckCircle, Square, Hammer, Palette, Archive, Box } from 'lucide-react';

// Importing Types
import { Client, GlobalSettings, ThemeConfig, QueueItem, Skeleton, Template } from './types';

// Importing Services
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { generateSiteContent } from './lib/gemini';

// Importing Components
import { DashboardView } from './components/DashboardView';
import { RegistryView } from './components/RegistryView';
import { SettingsView } from './components/SettingsView';
import { ClientDetailOverlay } from './components/ClientDetailOverlay';
import { PublicGateway } from './components/PublicGateway';
import { MassGeneratorView } from './components/MassGeneratorView';
import { VisualEditor } from './components/VisualEditor';
import { LoginScreen } from './components/LoginScreen';
import { ClientPortalView } from './components/ClientPortalView';
import { SkeletonForgeView } from './components/SkeletonForgeView';
import { StyleLabView } from './components/StyleLabView';
import { VaultView } from './components/VaultView';
import { StudioMode } from './components/StudioMode';

const generateSlug = (text: string) => {
    const safeText = text || 'projeto-novo';
    const s = safeText
        .toString()
        .toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-]+/g, '')
        .replace(/\-\-+/g, '-');
    return s.length > 0 ? s : 'novo-projeto';
};

const DEFAULT_SETTINGS: GlobalSettings = {
    defaultTrialValue: 7,
    defaultTrialUnit: 'days'
};

interface SidebarItemProps {
    icon: React.ReactNode;
    label: string;
    active: boolean;
    onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, active, onClick }) => (
    <button 
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-sm transition-all duration-200 group border-l-2 ${
            active 
            ? 'bg-slate-100 text-slate-900 border-orange-700' 
            : 'text-slate-500 hover:bg-zinc-50 hover:text-slate-700 border-transparent'
        }`}
    >
        <div className={`transition-colors ${active ? 'text-orange-700' : 'text-slate-400 group-hover:text-slate-600'}`}>
            {icon}
        </div>
        <span className="font-semibold text-sm tracking-tight">{label}</span>
    </button>
);

const App = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [skeletons, setSkeletons] = useState<Skeleton[]>([]);
    const [templates, setTemplates] = useState<Template[]>([]);
    
    const [view, setView] = useState<'dashboard' | 'registry' | 'settings' | 'factory' | 'forge' | 'lab' | 'vault'>('dashboard');
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [clientInEditor, setClientInEditor] = useState<Client | null>(null); 
    const [loadingData, setLoadingData] = useState(true);
    
    // Studio Mode State
    const [studioAsset, setStudioAsset] = useState<{ type: 'skeleton' | 'template', data: any } | null>(null);

    const [factoryQueue, setFactoryQueue] = useState<QueueItem[]>([]);
    const [factorySelectedIds, setFactorySelectedIds] = useState<Set<string>>(new Set());
    
    const [authRole, setAuthRole] = useState<'admin' | 'client' | null>(null);
    const [loggedInClient, setLoggedInClient] = useState<Client | null>(null);
    
    const [globalSettings, setGlobalSettings] = useState<GlobalSettings>(() => {
        try {
            const saved = localStorage.getItem('genwebos_settings');
            return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
        } catch (e) { return DEFAULT_SETTINGS; }
    });
    
    const [publicModeClient, setPublicModeClient] = useState<Client | null>(null);

    useEffect(() => {
        const init = async () => {
            setLoadingData(true);
            await fetchClients();
            await fetchSkeletons();
            await fetchTemplates();
            setLoadingData(false);
        };
        init();
        
        try {
            const auth = localStorage.getItem('ditho_admin_auth');
            if (auth === 'true') setAuthRole('admin');
        } catch (e) {}
    }, []);

    const fetchClients = async () => {
        if (isSupabaseConfigured && supabase) {
            const { data } = await supabase.from('clients').select('*').order('created_at', { ascending: false });
            if (data) setClients(data.map((row: any) => ({
                ...row,
                paymentStatus: row.payment_status,
                siteContent: row.site_content,
                createdAt: row.created_at,
                trialHours: row.trial_hours,
                themeConfig: row.theme_config,
                leadData: row.lead_data
            })));
        }
    };

    const fetchSkeletons = async () => {
        if (isSupabaseConfigured && supabase) {
            const { data } = await supabase.from('skeletons').select('*').order('created_at', { ascending: false });
            if (data) setSkeletons(data);
        }
    };

    const fetchTemplates = async () => {
        if (isSupabaseConfigured && supabase) {
            const { data } = await supabase.from('templates').select('*').order('created_at', { ascending: false });
            if (data) setTemplates(data);
        }
    };

    const persistClient = async (client: Client) => {
        if (!isSupabaseConfigured || !supabase) return;
        const dbPayload = {
            id: client.id,
            name: client.name,
            slug: client.slug || generateSlug(client.name),
            industry: client.industry,
            scope: client.scope,
            status: client.status,
            payment_status: client.paymentStatus,
            site_content: client.siteContent,
            subdomain: client.subdomain,
            created_at: client.createdAt,
            trial_hours: client.trialHours,
            payment_link: client.paymentLink,
            theme_config: client.themeConfig,
            lead_data: client.leadData,
            email: client.email,
            password: client.password,
            template_id: client.templateId
        };
        await supabase.from('clients').upsert(dbPayload);
    };

    const persistSkeleton = async (skeleton: Skeleton) => {
        if (!isSupabaseConfigured || !supabase) return;
        await supabase.from('skeletons').upsert(skeleton);
    };

    const persistTemplate = async (template: Template) => {
        if (!isSupabaseConfigured || !supabase) return;
        await supabase.from('templates').upsert(template);
    };

    const handleLogin = (role: 'admin' | 'client', email?: string, password?: string) => {
        if (role === 'admin') {
            localStorage.setItem('ditho_admin_auth', 'true');
            setAuthRole('admin');
        } else if (role === 'client' && email && password) {
            const foundClient = clients.find(c => c.email === email && c.password === password);
            if (foundClient) { setLoggedInClient(foundClient); setAuthRole('client'); }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('ditho_admin_auth');
        setAuthRole(null);
        setLoggedInClient(null);
    };

    if (loadingData) return <div className="h-screen flex items-center justify-center bg-zinc-50"><Loader2 className="animate-spin text-orange-700" size={48} /></div>;
    if (publicModeClient) return <PublicGateway client={publicModeClient} />;
    
    // Editor visual do cliente
    if (clientInEditor) return <VisualEditor client={clientInEditor} onSave={(id, theme, html) => {
        const updated = clients.find(c => c.id === id);
        if (updated) {
            const final = { ...updated, themeConfig: theme, siteContent: html };
            setClients(prev => prev.map(c => c.id === id ? final : c));
            persistClient(final as Client);
        }
    }} onBack={() => setClientInEditor(null)} />;
    
    // Modo Studio para Skeletons e Templates
    if (studioAsset) return <StudioMode 
        assetType={studioAsset.type} 
        assetData={studioAsset.data} 
        onBack={() => setStudioAsset(null)} 
        onSave={(updatedData) => {
            if (studioAsset.type === 'skeleton') {
                setSkeletons(prev => prev.map(s => s.id === updatedData.id ? updatedData : s));
                persistSkeleton(updatedData);
            } else {
                setTemplates(prev => prev.map(t => t.id === updatedData.id ? updatedData : t));
                persistTemplate(updatedData);
            }
            setStudioAsset(null);
        }}
    />;

    if (authRole === 'client' && loggedInClient) return <ClientPortalView client={loggedInClient} onLogout={handleLogout} onOpenEditor={setClientInEditor} onUpdateClient={(id, data) => {
        const updated = clients.find(c => c.id === id);
        if (updated) {
            const final = { ...updated, ...data };
            setClients(prev => prev.map(c => c.id === id ? final : c));
            persistClient(final as Client);
        }
    }} />;
    
    if (!authRole) return <LoginScreen onLogin={handleLogin} />;

    return (
        <div className="flex h-screen overflow-hidden font-sans text-slate-900 bg-zinc-50">
            <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col z-20 shadow-sm">
                <div className="p-6 border-b border-zinc-100">
                    <div className="flex items-center gap-2 text-slate-900 font-bold text-xl tracking-tight">
                        <div className="w-5 h-5 bg-slate-900 rounded-sm"></div>
                        Ditho OS
                    </div>
                </div>
                <nav className="flex-1 p-3 space-y-1">
                    <SidebarItem icon={<Layout size={18} />} label="Gestão de Projetos" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
                    <SidebarItem icon={<Archive size={18} />} label="A Biblioteca (Vault)" active={view === 'vault'} onClick={() => setView('vault')} />
                    <SidebarItem icon={<Hammer size={18} />} label="Oficina (Skeletons)" active={view === 'forge'} onClick={() => setView('forge')} />
                    <SidebarItem icon={<Palette size={18} />} label="Lab de Estilos" active={view === 'lab'} onClick={() => setView('lab')} />
                    <SidebarItem icon={<Factory size={18} />} label="Fábrica de Sites" active={view === 'factory'} onClick={() => setView('factory')} />
                    <SidebarItem icon={<Database size={18} />} label="Banco de Registros" active={view === 'registry'} onClick={() => setView('registry')} />
                    <SidebarItem icon={<Settings size={18} />} label="Configurações" active={view === 'settings'} onClick={() => setView('settings')} />
                </nav>
                <div className="p-4 border-t border-zinc-100 flex flex-col gap-2 text-xs text-slate-400 text-center font-mono">
                    <button onClick={handleLogout} className="text-red-500 hover:text-red-700 hover:underline">Sair do Admin</button>
                </div>
            </aside>

            <main className="flex-1 flex flex-col relative bg-zinc-50 overflow-hidden">
                <header className="h-16 border-b border-zinc-200 flex items-center justify-between px-8 bg-white/80 backdrop-blur-md z-10">
                    <h1 className="text-lg font-bold text-slate-800 tracking-tight capitalize">
                        {view === 'vault' ? 'A Biblioteca Central' : view === 'forge' ? 'Oficina de Esqueletos' : view === 'lab' ? 'Laboratório de Estilos' : view === 'dashboard' ? 'Gestão de Projetos' : view === 'factory' ? 'Fábrica de Produção' : view === 'registry' ? 'Registros Aprovados' : 'Configurações'}
                    </h1>
                </header>

                <div className="flex-1 overflow-y-auto relative z-0">
                    {view === 'dashboard' ? (
                        <DashboardView clients={clients} onSelect={setSelectedClient} onDelete={() => {}} onTogglePayment={() => {}} />
                    ) : view === 'vault' ? (
                        <VaultView skeletons={skeletons} templates={templates} onEditAsset={(type, data) => setStudioAsset({ type, data })} />
                    ) : view === 'forge' ? (
                        <SkeletonForgeView skeletons={skeletons} onUpdateSkeletons={setSkeletons} />
                    ) : view === 'lab' ? (
                        <StyleLabView skeletons={skeletons} templates={templates} onUpdateTemplates={setTemplates} />
                    ) : view === 'factory' ? (
                        <MassGeneratorView onAddClients={(newClients) => {
                            setClients(prev => [...newClients, ...prev]);
                            newClients.forEach(persistClient);
                        }} globalSettings={globalSettings} onViewDetails={setSelectedClient} existingClients={clients} queue={factoryQueue} selectedIds={factorySelectedIds} onUpdateQueue={setFactoryQueue} onUpdateSelection={setFactorySelectedIds} skeletons={skeletons} templates={templates} />
                    ) : view === 'registry' ? (
                        <RegistryView clients={clients.filter(c => c.status === 'approved')} onDeleteMany={() => {}} />
                    ) : (
                        <SettingsView settings={globalSettings} onSave={setGlobalSettings} />
                    )}
                </div>

                {selectedClient && (
                    <ClientDetailOverlay 
                        client={selectedClient} onClose={() => setSelectedClient(null)} 
                        onUpdate={(id, data) => {
                            const updated = clients.find(c => c.id === id);
                            if (updated) {
                                const final = { ...updated, ...data };
                                setClients(prev => prev.map(c => c.id === id ? final : c));
                                persistClient(final as Client);
                            }
                        }} onGenerate={() => {}} onApprove={() => {}}
                        isGenerating={false} globalSettings={globalSettings} onOpenEditor={() => { setClientInEditor(selectedClient); setSelectedClient(null); }}
                    />
                )}
            </main>
        </div>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
