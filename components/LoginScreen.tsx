import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldCheck, Terminal, Globe, Smartphone, Cpu, Zap, X, ChevronRight, Command, LayoutGrid, Box, User, Lock, Code2, Layers, Server, Activity, Database, Workflow, Check, ArrowUpRight } from 'lucide-react';

interface LoginScreenProps {
    onLogin: (role: 'admin' | 'client', email?: string, password?: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin }) => {
    const [showTerminal, setShowTerminal] = useState(false);
    const [showClientLogin, setShowClientLogin] = useState(false);
    
    // Admin State
    const [adminPass, setAdminPass] = useState('');
    const [adminError, setAdminError] = useState(false);

    // Client State
    const [clientEmail, setClientEmail] = useState('');
    const [clientPass, setClientPass] = useState('');
    const [clientError, setClientError] = useState(false);

    // Scroll Effect
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleAdminSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (adminPass === 'ditho') {
            onLogin('admin');
        } else {
            setAdminError(true);
            setTimeout(() => setAdminError(false), 2000);
        }
    };

    const handleClientSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (clientEmail && clientPass) {
            onLogin('client', clientEmail, clientPass);
        } else {
             setClientError(true);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-slate-200 selection:bg-orange-700 selection:text-white font-sans overflow-x-hidden relative">
            
            {/* CSS Global para esta tela */}
            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 30s linear infinite;
                }
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            {/* --- NAVBAR --- */}
            <nav className={`fixed top-0 w-full z-40 px-6 py-4 flex justify-between items-center transition-all duration-300 border-b ${scrolled ? 'bg-[#050505]/90 backdrop-blur-md border-white/10' : 'bg-transparent border-transparent'}`}>
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 bg-white rounded-sm"></div>
                    <div className="text-xl font-bold tracking-tight text-white">DITHO <span className="text-orange-600 font-mono text-xs align-top">CORP</span></div>
                </div>
                
                <div className="flex items-center gap-4">
                    <button onClick={() => setShowClientLogin(true)} className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                        Portal do Cliente
                    </button>
                    <button
                        onClick={() => setShowTerminal(true)}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest bg-white text-black hover:bg-orange-600 hover:text-white px-4 py-2 rounded-sm transition-all"
                    >
                        <Terminal size={12} />
                        <span className="hidden md:inline">Console</span>
                    </button>
                </div>
            </nav>

            {/* --- 1. HERO SECTION CINEMATOGRÁFICA --- */}
            <section className="relative pt-48 pb-32 px-6 border-b border-white/5 overflow-hidden">
                {/* Background Grid & Effects */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff_1px,transparent_1px),linear-gradient(to_bottom,#ffffff_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-[0.03] pointer-events-none"></div>
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-orange-600/20 blur-[120px] rounded-full pointer-events-none opacity-20"></div>

                <div className="max-w-7xl mx-auto relative z-10 text-center md:text-left">
                    <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-400 text-[10px] font-mono tracking-widest uppercase animate-fade-in">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></div>
                        Systems Operational
                    </div>
                    
                    <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tighter leading-[0.9] mb-8 text-white">
                        SOBERANIA <br/>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-800">DIGITAL.</span>
                    </h1>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-12">
                        <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl font-light">
                            Não construímos apenas sites. Arquitetamos <strong className="text-white font-medium">Ecossistemas de Software</strong>, SaaS, Aplicativos e Automações de alta complexidade para quem joga o jogo alto.
                        </p>
                        
                        <div className="flex flex-col md:flex-row gap-4 justify-end items-center md:items-start">
                             <button 
                                onClick={() => window.open('https://wa.me/5531999999999', '_blank')}
                                className="group w-full md:w-auto px-8 py-4 bg-white text-black hover:bg-orange-600 hover:text-white transition-all text-sm font-bold tracking-widest uppercase flex items-center justify-center gap-3"
                             >
                                Iniciar Protocolo
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                             </button>
                             <button 
                                onClick={() => setShowClientLogin(true)}
                                className="w-full md:w-auto px-8 py-4 border border-white/20 text-white hover:bg-white/5 transition-all text-sm font-bold tracking-widest uppercase"
                             >
                                Acesso Restrito
                             </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 2. TECH STACK TICKER --- */}
            <div className="w-full bg-black border-b border-white/10 py-4 overflow-hidden flex items-center relative z-20">
                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-black to-transparent z-10"></div>
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-black to-transparent z-10"></div>
                
                <div className="flex whitespace-nowrap animate-marquee">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex gap-16 mx-8">
                            {['REACT', 'TYPESCRIPT', 'NODE.JS', 'PYTHON', 'AWS', 'DOCKER', 'KUBERNETES', 'NEXT.JS', 'SUPABASE', 'GRAPHQL', 'REDIS', 'TAILWIND', 'FLUTTER', 'SWIFT'].map((tech) => (
                                <span key={tech} className="text-sm font-mono font-bold text-slate-600 flex items-center gap-2">
                                    <span className="w-1 h-1 bg-orange-700 rounded-full"></span> {tech}
                                </span>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {/* --- 3. MANIFESTO --- */}
            <section className="py-32 px-6 bg-[#050505]">
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl md:text-5xl font-bold leading-tight text-white mb-8">
                        "O software comeu o mundo. <br/>
                        <span className="text-slate-500">Nós fornecemos os talheres.</span>"
                    </h2>
                    <p className="text-slate-400 leading-relaxed text-lg">
                        A era do site estático acabou. Se o seu negócio não é um organismo vivo digital, ele está morrendo. 
                        Nós matamos o amadorismo e entregamos engenharia de ponta a ponta. Do código à infraestrutura.
                    </p>
                </div>
            </section>

            {/* --- 4. CORE SERVICES (BENTO GRID) --- */}
            <section className="py-20 px-6 max-w-7xl mx-auto">
                <div className="flex items-end justify-between mb-12">
                    <h2 className="text-sm font-mono text-orange-500 uppercase tracking-widest">Capabilities_v2.0</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
                    {/* Card 1: Web Arch */}
                    <div className="md:col-span-2 group relative bg-[#0a0a0a] border border-white/10 p-8 overflow-hidden hover:border-orange-500/50 transition-colors">
                        <div className="absolute top-0 right-0 p-6 text-white/10 group-hover:text-orange-500/20 transition-colors">
                            <LayoutGrid size={64} />
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center mb-4">
                                <Globe className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Web Architecture & High-Performance</h3>
                                <p className="text-slate-400">Landing pages, Portais Corporativos e E-commerces que carregam em milissegundos. SEO técnico avançado e UX design premiado.</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Mobile Apps */}
                    <div className="md:col-span-1 group relative bg-[#0a0a0a] border border-white/10 p-8 overflow-hidden hover:border-orange-500/50 transition-colors">
                        <div className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-orange-500/10 transition-colors">
                            <Smartphone size={120} />
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center mb-4">
                                <Smartphone className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">Native Apps & PWA</h3>
                                <p className="text-slate-400 text-sm">Aplicativos iOS e Android. Soluções que colocam sua empresa no bolso do cliente.</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: SaaS Engineering */}
                    <div className="md:col-span-1 group relative bg-[#0a0a0a] border border-white/10 p-8 overflow-hidden hover:border-orange-500/50 transition-colors">
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center mb-4">
                                <Database className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white mb-2">SaaS Engineering</h3>
                                <p className="text-slate-400 text-sm">Plataformas complexas sob demanda. Dashboards, CRMs e sistemas de gestão personalizados.</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 4: Automations */}
                    <div className="md:col-span-2 group relative bg-[#0a0a0a] border border-white/10 p-8 overflow-hidden hover:border-orange-500/50 transition-colors">
                         <div className="absolute top-1/2 right-10 -translate-y-1/2 flex gap-4 opacity-20">
                            <div className="w-20 h-20 border border-white rounded-full flex items-center justify-center animate-pulse"><Workflow size={32}/></div>
                            <div className="w-20 h-20 border border-dashed border-white rounded-full"></div>
                        </div>
                        <div className="relative z-10 h-full flex flex-col justify-between">
                            <div className="w-12 h-12 bg-white/5 rounded-sm flex items-center justify-center mb-4">
                                <Zap className="text-white" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white mb-2">Enterprise Automation</h3>
                                <p className="text-slate-400">Integração de APIs, Webhooks e automação de processos de negócio (n8n, Python). Reduza custos operacionais com código inteligente.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 5. UNDER THE HOOD (CODE DEMO) --- */}
            <section className="py-20 px-6 bg-[#080808] border-y border-white/5">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
                    <div className="flex-1 space-y-6">
                        <div className="inline-flex items-center gap-2 text-orange-500 font-mono text-xs uppercase tracking-widest">
                            <Code2 size={14} /> Source Code
                        </div>
                        <h2 className="text-4xl font-bold text-white">Código Limpo. <br/>Performance Bruta.</h2>
                        <p className="text-slate-400">
                            Enquanto agências usam construtores visuais lentos, nós escrevemos software. 
                            Utilizamos as mesmas tecnologias de empresas como Netflix, Uber e Airbnb.
                        </p>
                        <ul className="space-y-3 mt-4">
                            {['Zero Bloatware', 'Segurança Bancária', 'Escalabilidade Infinita'].map(item => (
                                <li key={item} className="flex items-center gap-3 text-white font-medium">
                                    <Check className="text-orange-500" size={16} /> {item}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div className="flex-1 w-full max-w-xl">
                        <div className="bg-[#0f0f0f] border border-white/10 rounded-lg p-4 font-mono text-xs md:text-sm shadow-2xl relative">
                            <div className="flex gap-2 mb-4 border-b border-white/5 pb-2">
                                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <div className="text-blue-400">import</div> <div className="text-white inline">{`{`}</div> <div className="text-yellow-400 inline">DithoEngine</div> <div className="text-white inline">{`}`}</div> <div className="text-blue-400 inline">from</div> <div className="text-green-400 inline">'@ditho/core'</div>;
                            <br/><br/>
                            <div className="text-purple-400">const</div> <div className="text-yellow-400 inline">project</div> = <div className="text-blue-400 inline">await</div> <div className="text-yellow-400 inline">DithoEngine</div>.<div className="text-blue-400 inline">deploy</div>({`{`}
                            <div className="pl-4 text-white">client: <span className="text-green-400">'Enterprise'</span>,</div>
                            <div className="pl-4 text-white">performance: <span className="text-orange-500">100</span>,</div>
                            <div className="pl-4 text-white">security: <span className="text-orange-500">'High-Grade'</span>,</div>
                            <div className="pl-4 text-white">modules: [<span className="text-green-400">'SaaS'</span>, <span className="text-green-400">'Mobile'</span>, <span className="text-green-400">'API'</span>]</div>
                            {`}`});
                            <br/><br/>
                            <div className="text-slate-500">// Deployment successful in 34ms</div>
                            <div className="animate-pulse text-orange-500">_</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 6. PERFORMANCE SHOWDOWN --- */}
            <section className="py-20 px-6 max-w-5xl mx-auto">
                <h2 className="text-center text-3xl font-bold text-white mb-16">Ditho vs. O Resto</h2>
                
                <div className="space-y-8">
                    {/* Ditho Bar */}
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm font-bold text-white">
                            <span>Ditho Architecture</span>
                            <span className="text-green-500">Google Lighthouse Score: 100/100</span>
                        </div>
                        <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 w-[100%] shadow-[0_0_20px_rgba(34,197,94,0.5)]"></div>
                        </div>
                    </div>

                    {/* WordPress Bar */}
                    <div className="space-y-2 opacity-50">
                        <div className="flex justify-between text-sm font-bold text-slate-400">
                            <span>Wordpress / Wix</span>
                            <span className="text-red-500">Score Médio: 45/100</span>
                        </div>
                        <div className="h-4 bg-white/5 rounded-full overflow-hidden">
                            <div className="h-full bg-red-600 w-[45%]"></div>
                        </div>
                    </div>
                </div>
                <p className="text-center text-slate-500 text-sm mt-8">
                    *Dados baseados em testes reais de performance Core Web Vitals.
                </p>
            </section>

            {/* --- 7. THE PROCESS (TIMELINE) --- */}
            <section className="py-24 px-6 bg-[#0a0a0a]">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Metodologia Industrial</h2>
                        <p className="text-slate-400">Processo linear de engenharia de software.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {[
                            { step: '01', title: 'Discovery', desc: 'Mapeamento profundo do modelo de negócios e requisitos técnicos.' },
                            { step: '02', title: 'Architecture', desc: 'Design de sistemas, UX/UI Blueprint e definição de stack.' },
                            { step: '03', title: 'Engineering', desc: 'Desenvolvimento ágil com código limpo e revisões de segurança.' },
                            { step: '04', title: 'Deploy Global', desc: 'Lançamento em infraestrutura Edge (CDN) com escala mundial.' }
                        ].map((item, idx) => (
                            <div key={idx} className="relative p-6 border-l border-white/10 hover:border-orange-500 transition-colors">
                                <span className="text-6xl font-bold text-white/5 absolute -top-4 left-4">{item.step}</span>
                                <h3 className="text-xl font-bold text-white mb-2 relative z-10">{item.title}</h3>
                                <p className="text-sm text-slate-400 relative z-10">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- 8. INFRASTRUCTURE & INTEGRATIONS --- */}
            <section className="py-20 px-6 border-y border-white/5 relative overflow-hidden">
                {/* Map bg placeholder */}
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
                
                <div className="max-w-7xl mx-auto relative z-10 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/10">
                        <Server className="text-orange-500" size={32} />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Global Edge Network</h2>
                    <p className="text-slate-400 max-w-2xl mb-12">
                        Seu projeto hospedado simultaneamente em 35 regiões ao redor do mundo. 
                        Latência zero, esteja seu cliente em São Paulo, Nova York ou Tóquio.
                    </p>

                    <div className="flex flex-wrap justify-center gap-8 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                         {/* Fake Logos for Integrations */}
                         {['Stripe', 'AWS', 'Vercel', 'Google Cloud', 'OpenAI', 'Meta API'].map(logo => (
                             <span key={logo} className="text-xl font-bold text-white border border-white/20 px-4 py-2 rounded-sm">{logo}</span>
                         ))}
                    </div>
                </div>
            </section>

            {/* --- 9. PRICING MODELS --- */}
            <section className="py-24 px-6 bg-[#050505]">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-12 text-center">Modelos de Engajamento</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        
                        {/* Model A */}
                        <div className="border border-white/10 bg-white/5 p-8 rounded-sm hover:border-white/30 transition-colors">
                            <h3 className="text-xl font-bold text-white mb-2">Projeto Spot</h3>
                            <p className="text-slate-400 text-sm mb-6">Para demandas pontuais e lançamentos.</p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex gap-2 text-slate-300 text-sm"><Check size={16} className="text-orange-500"/> Escopo Fechado</li>
                                <li className="flex gap-2 text-slate-300 text-sm"><Check size={16} className="text-orange-500"/> Pagamento Único</li>
                                <li className="flex gap-2 text-slate-300 text-sm"><Check size={16} className="text-orange-500"/> Entrega de Código Fonte</li>
                            </ul>
                            <button onClick={() => window.open('https://wa.me/5531999999999', '_blank')} className="w-full py-3 border border-white text-white hover:bg-white hover:text-black font-bold text-sm uppercase transition-colors">Cotar Projeto</button>
                        </div>

                        {/* Model B */}
                        <div className="border border-orange-600 bg-[#1a0b05] p-8 rounded-sm relative">
                            <div className="absolute top-0 right-0 bg-orange-600 text-white text-[10px] font-bold px-3 py-1 uppercase">Recomendado</div>
                            <h3 className="text-xl font-bold text-white mb-2">Partner Ecosystem</h3>
                            <p className="text-slate-400 text-sm mb-6">Para empresas que precisam de evolução contínua.</p>
                            <ul className="space-y-3 mb-8">
                                <li className="flex gap-2 text-white text-sm"><Check size={16} className="text-orange-500"/> Time de Engenharia Dedicado</li>
                                <li className="flex gap-2 text-white text-sm"><Check size={16} className="text-orange-500"/> Manutenção & Updates Ilimitados</li>
                                <li className="flex gap-2 text-white text-sm"><Check size={16} className="text-orange-500"/> Consultoria de Growth</li>
                            </ul>
                            <button onClick={() => window.open('https://wa.me/5531999999999', '_blank')} className="w-full py-3 bg-orange-600 text-white hover:bg-orange-700 font-bold text-sm uppercase transition-colors">Aplicar para Vaga</button>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- 10. LEAD MAGNET (AUDITORIA) --- */}
            <section className="py-20 px-6 border-t border-white/10 bg-white text-black">
                <div className="max-w-4xl mx-auto text-center">
                    <Activity className="mx-auto mb-6 text-orange-600" size={48} />
                    <h2 className="text-3xl md:text-5xl font-bold mb-6">Sua infraestrutura atual aguenta o futuro?</h2>
                    <p className="text-lg text-slate-600 mb-8">
                        Solicite uma auditoria técnica gratuita. Nossos engenheiros analisarão seu site, app ou processo atual e identificarão gargalos de performance e segurança.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 justify-center max-w-md mx-auto">
                        <input type="text" placeholder="Seu site ou app atual..." className="bg-zinc-100 border border-zinc-300 px-4 py-3 rounded-sm text-black outline-none focus:border-orange-600 w-full" />
                        <button onClick={() => window.open('https://wa.me/5531999999999', '_blank')} className="bg-black text-white px-6 py-3 font-bold uppercase hover:bg-orange-600 transition-colors whitespace-nowrap">
                            Analisar
                        </button>
                    </div>
                </div>
            </section>

            {/* --- 11. FOOTER ARQUITETÔNICO --- */}
            <footer className="bg-[#020202] pt-20 pb-10 px-6 border-t border-white/10">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-2xl font-bold text-white mb-6">DITHO CORP.</h2>
                        <p className="text-slate-500 max-w-sm">
                            Software House especializada em arquitetura digital de alta performance. 
                            Construímos o invisível que torna seu negócio invencível.
                        </p>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Soluções</h4>
                        <ul className="space-y-2 text-slate-500 text-sm">
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Web Architecture</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Mobile Development</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">SaaS Engineering</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Enterprise Automation</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-white font-bold mb-4 uppercase text-xs tracking-widest">Companhia</h4>
                        <ul className="space-y-2 text-slate-500 text-sm">
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Manifesto</a></li>
                            <li><a href="#" className="hover:text-orange-500 transition-colors">Carreiras</a></li>
                            <li><button onClick={() => setShowTerminal(true)} className="hover:text-orange-500 transition-colors text-left">Admin Access</button></li>
                        </ul>
                    </div>
                </div>
                
                <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-slate-600 font-mono">
                    <p>© 2024 Ditho Operating System. All rights reserved.</p>
                    <div className="flex gap-4 mt-4 md:mt-0">
                        <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500"></div> All Systems Operational</span>
                    </div>
                </div>
            </footer>

            {/* --- MODAIS DE LOGIN (ADMIN & CLIENT) --- */}
            {/* Mantidos funcionais para garantir acesso ao sistema */}
            
            {showTerminal && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
                    <div className="w-full max-w-md bg-black border border-white/20 rounded-sm p-8 relative shadow-2xl">
                        <button onClick={() => setShowTerminal(false)} className="absolute top-4 right-4 text-slate-500 hover:text-white"><X size={20} /></button>
                        <div className="flex items-center gap-3 mb-8">
                            <Command size={24} className="text-orange-600" />
                            <div><h3 className="text-white font-bold text-lg">System Root</h3></div>
                        </div>
                        <form onSubmit={handleAdminSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Access Key</label>
                                <input type="password" value={adminPass} onChange={(e) => setAdminPass(e.target.value)} className={`w-full bg-[#111] border ${adminError ? 'border-red-500' : 'border-white/20 focus:border-orange-600'} rounded-sm px-4 py-3 text-white text-lg tracking-widest outline-none font-mono`} placeholder="•••••" autoFocus />
                            </div>
                            <button type="submit" className="w-full bg-white text-black hover:bg-orange-600 hover:text-white font-bold py-3.5 rounded-sm transition-all mt-4">Authenticate</button>
                        </form>
                    </div>
                </div>
            )}

            {showClientLogin && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
                    <div className="w-full max-w-md bg-white rounded-sm p-8 relative shadow-2xl">
                        <button onClick={() => setShowClientLogin(false)} className="absolute top-4 right-4 text-slate-400 hover:text-black"><X size={20} /></button>
                        <div className="text-center mb-8">
                            <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4"><User className="text-orange-600" size={24} /></div>
                            <h3 className="text-black font-bold text-2xl">Portal do Cliente</h3>
                            <p className="text-slate-500 text-sm">Gerencie seu ecossistema digital.</p>
                        </div>
                        <form onSubmit={handleClientSubmit} className="space-y-4">
                            <input type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-black focus:border-orange-600 outline-none" placeholder="E-mail corporativo" required />
                            <input type="password" value={clientPass} onChange={(e) => setClientPass(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-sm px-4 py-3 text-black focus:border-orange-600 outline-none" placeholder="Senha" required />
                            {clientError && <p className="text-red-500 text-xs font-bold text-center">Credenciais inválidas.</p>}
                            <button type="submit" className="w-full bg-black text-white hover:bg-orange-600 font-bold py-4 rounded-sm transition-all mt-2">Acessar Painel</button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};