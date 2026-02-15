import React, { useState, useEffect, useRef } from 'react';
import { Save, ArrowLeft, Palette, Image as ImageIcon, Monitor, Smartphone, Type, Upload, Loader2, Sparkles, Undo2, MousePointer2, Redo2, Check, Wand2, X, ChevronUp } from 'lucide-react';
import { Client, ThemeConfig } from '../types';
import { uploadImage } from '../lib/supabase';
import { editSiteContent } from '../lib/gemini';

interface VisualEditorProps {
    client: Client;
    onSave: (clientId: string, newTheme: ThemeConfig, newHtml?: string) => void;
    onBack: () => void;
}

const GOOGLE_FONTS = [
    'Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 
    'Poppins', 'Playfair Display', 'Merriweather', 'Nunito', 'Raleway', 'Oswald', 'Space Grotesk'
];

interface ChatMessage {
    role: 'user' | 'model';
    content: string;
}

export const VisualEditor: React.FC<VisualEditorProps> = ({ client, onSave, onBack }) => {
    // --- STATE: THEME ---
    const [theme, setTheme] = useState<ThemeConfig>(client.themeConfig || {
        primaryColor: '',
        secondaryColor: '',
        backgroundColor: '',
        surfaceColor: '',
        textColor: '',
        fontFamily: 'Inter',
        imageOverrides: {}
    });

    // --- STATE: CONTENT & HISTORY ---
    const [localHtml, setLocalHtml] = useState<string>(client.siteContent || '');
    const [historyStack, setHistoryStack] = useState<string[]>([]);
    const [futureStack, setFutureStack] = useState<string[]>([]);
    const [isDirty, setIsDirty] = useState(false);

    // --- STATE: UI & SELECTION ---
    const [activeTab, setActiveTab] = useState<'design' | 'media' | 'ai' | null>('design'); // null means closed on mobile
    const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [detectedImages, setDetectedImages] = useState<{id: string, src: string}[]>([]);
    const [uploadingImg, setUploadingImg] = useState<string | null>(null);
    const [editModeEnabled, setEditModeEnabled] = useState(true);
    
    // Selection for "Click to Edit"
    const [selectedImgSrc, setSelectedImgSrc] = useState<string | null>(null);

    // --- STATE: AI CHAT ---
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [chatInput, setChatInput] = useState('');
    const [isProcessingAI, setIsProcessingAI] = useState(false);
    const chatEndRef = useRef<HTMLDivElement>(null);

    const iframeRef = useRef<HTMLIFrameElement>(null);

    // Responsive Check
    const [isMobile, setIsMobile] = useState(false);
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Set mobile preview default on mobile device
    useEffect(() => {
        if (isMobile) setPreviewMode('mobile');
    }, [isMobile]);

    // --- HISTORY MANAGEMENT ---
    const pushToHistory = (newHtml: string) => {
        setHistoryStack(prev => [...prev.slice(-10), localHtml]);
        setFutureStack([]);
        setLocalHtml(newHtml);
        setIsDirty(true);
    };

    const handleUndo = () => {
        if (historyStack.length === 0) return;
        const previous = historyStack[historyStack.length - 1];
        setFutureStack(prev => [localHtml, ...prev]);
        setLocalHtml(previous);
        setHistoryStack(prev => prev.slice(0, -1));
    };

    const handleRedo = () => {
        if (futureStack.length === 0) return;
        const next = futureStack[0];
        setHistoryStack(prev => [...prev, localHtml]);
        setLocalHtml(next);
        setFutureStack(prev => prev.slice(1));
    };

    // --- IFRAME LOGIC ---

    // 1. Detect Images from HTML
    useEffect(() => {
        if (!localHtml) return;
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(localHtml, 'text/html');
            const imgs = Array.from(doc.querySelectorAll('img'));
            const imgList = imgs.map((img, idx) => ({
                id: img.id || `img-${idx}`, 
                src: img.getAttribute('src') || img.src 
            }));
            setDetectedImages(imgList);
        } catch (e) { console.warn("Erro parsing HTML", e); }
    }, [localHtml]);

    // 2. Receive Messages from Iframe (Text Updates & Clicks)
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data.type === 'CONTENT_UPDATE') {
                setLocalHtml(event.data.html);
                setIsDirty(true);
            }
            if (event.data.type === 'IMAGE_CLICK') {
                const { src } = event.data;
                // Auto-select image tab and scroll to/highlight this image
                setSelectedImgSrc(src);
                setActiveTab('media');
                
                // On mobile, open the drawer
                if (window.innerWidth < 768) {
                    // setActiveTab already handled
                }
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // 3. Inject Script & Styles into Iframe
    useEffect(() => {
        if (iframeRef.current && localHtml) {
            const iframe = iframeRef.current;
            const doc = iframe.contentDocument;
            if (!doc) return;

            try {
                // Write HTML
                doc.open();
                doc.write(localHtml);
                doc.close();

                // Ensure HEAD/BODY
                let head = doc.head;
                if (!head) { head = doc.createElement('head'); doc.documentElement.appendChild(head); }
                let body = doc.body;
                if (!body) { body = doc.createElement('body'); doc.documentElement.appendChild(body); }

                // --- STYLES: INVISIBILITY & FOCUS ---
                const styleTag = doc.createElement('style');
                styleTag.textContent = `
                    /* Base State: Invisible */
                    [contenteditable="true"] {
                        outline: none;
                        transition: background-color 0.2s;
                        cursor: text;
                    }
                    /* Focus State: Clear Editing Indicator */
                    [contenteditable="true"]:focus {
                        outline: none;
                        background-color: rgba(234, 88, 12, 0.1); /* Orange tint */
                        border-bottom: 2px solid #ea580c;
                    }
                    /* Image Hover State */
                    img {
                        transition: filter 0.2s, outline 0.2s;
                        cursor: pointer;
                    }
                    img:hover {
                        filter: brightness(0.9);
                        outline: 4px solid #3b82f6; /* Blue highlight */
                        outline-offset: -4px;
                    }
                    body {
                        padding-bottom: 200px; /* Space for scrolling on mobile */
                        -webkit-tap-highlight-color: transparent;
                    }
                    ::-webkit-scrollbar { width: 4px; }
                    ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 2px; }
                `;
                head.appendChild(styleTag);

                // --- THEME CSS VARIABLES ---
                const fontName = theme.fontFamily || 'Inter';
                const fontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(' ', '+')}:wght@300;400;600;700&display=swap`;
                
                let linkTag = doc.getElementById('genwebos-font');
                if (!linkTag) {
                    linkTag = doc.createElement('link');
                    linkTag.id = 'genwebos-font';
                    linkTag.setAttribute('rel', 'stylesheet');
                    head.appendChild(linkTag);
                } else {
                    linkTag.setAttribute('href', fontUrl);
                }

                const cssVariables = `
                    :root {
                        ${theme.primaryColor ? `--primary: ${theme.primaryColor} !important;` : ''}
                        ${theme.secondaryColor ? `--secondary: ${theme.secondaryColor} !important;` : ''}
                        ${theme.backgroundColor ? `--bg: ${theme.backgroundColor} !important;` : ''}
                        ${theme.surfaceColor ? `--surface: ${theme.surfaceColor} !important;` : ''}
                        ${theme.textColor ? `--text: ${theme.textColor} !important;` : ''}
                        --font-main: '${fontName}', sans-serif !important;
                    }
                `;
                let themeStyle = doc.getElementById('genwebos-theme');
                if (!themeStyle) {
                    themeStyle = doc.createElement('style');
                    themeStyle.id = 'genwebos-theme';
                    head.appendChild(themeStyle);
                }
                themeStyle.textContent = cssVariables;

                // --- IMAGE OVERRIDES ---
                if (theme.imageOverrides) {
                    Object.entries(theme.imageOverrides).forEach(([originalSrc, newSrc]) => {
                        if (newSrc && (newSrc as string).trim() !== '') {
                            const imgs = doc.querySelectorAll(`img[src="${originalSrc}"]`);
                            imgs.forEach((img: any) => img.src = newSrc);
                        }
                    });
                }

                // --- SCRIPT: INTERACTIVITY & PASTE SAFETY ---
                const oldScript = doc.getElementById('genwebos-script');
                if (oldScript) oldScript.remove();

                const scriptTag = doc.createElement('script');
                scriptTag.id = 'genwebos-script';
                scriptTag.textContent = `
                    // 1. Prevent Default Links
                    document.querySelectorAll('a').forEach(a => {
                        a.addEventListener('click', (e) => e.preventDefault());
                    });
                    
                    // 2. Make Text Editable (Selective)
                    if (${editModeEnabled}) {
                        const textTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'li', 'a', 'button', 'strong', 'td'];
                        textTags.forEach(tag => {
                            document.querySelectorAll(tag).forEach(el => {
                                if (el.innerText && el.innerText.trim().length > 0 && el.children.length === 0) {
                                     el.setAttribute('contenteditable', 'true');
                                     el.setAttribute('spellcheck', 'false');
                                }
                            });
                        });
                    }

                    // 3. Image Click Interceptor
                    document.querySelectorAll('img').forEach(img => {
                        img.addEventListener('click', (e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            window.parent.postMessage({
                                type: 'IMAGE_CLICK',
                                src: img.getAttribute('src') // Get attribute to match raw HTML src
                            }, '*');
                        });
                    });

                    // 4. Paste Sanitization (CRITICAL for UX)
                    document.addEventListener('paste', (e) => {
                        e.preventDefault();
                        const text = (e.originalEvent || e).clipboardData.getData('text/plain');
                        document.execCommand('insertText', false, text);
                    });

                    // 5. Input Listener
                    let debounceTimer;
                    document.body.addEventListener('input', (e) => {
                        clearTimeout(debounceTimer);
                        debounceTimer = setTimeout(() => {
                            window.parent.postMessage({
                                type: 'CONTENT_UPDATE',
                                html: document.documentElement.outerHTML
                            }, '*');
                        }, 800);
                    });
                `;
                body.appendChild(scriptTag);
            } catch (err) { console.error("Iframe injection error:", err); }
        }
    }, [localHtml, theme, editModeEnabled]);


    // --- HANDLERS ---
    const handleImageChange = (originalSrc: string, newSrc: string) => {
        setTheme(prev => ({
            ...prev,
            imageOverrides: { ...prev.imageOverrides, [originalSrc]: newSrc }
        }));
        setIsDirty(true);
        setSelectedImgSrc(null); // Clear selection after change
    };

    const handleFileUpload = async (originalSrc: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadingImg(originalSrc);
        const publicUrl = await uploadImage(file);
        setUploadingImg(null);
        if (publicUrl) handleImageChange(originalSrc, publicUrl);
    };

    const handleAIChat = async () => {
        if (!chatInput.trim() || isProcessingAI) return;
        const userMsg = chatInput;
        setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setChatInput('');
        setIsProcessingAI(true);
        try {
            pushToHistory(localHtml);
            const newHtml = await editSiteContent(localHtml, userMsg, process.env.API_KEY || '');
            setLocalHtml(newHtml);
            setChatMessages(prev => [...prev, { role: 'model', content: 'Pronto! Alterações aplicadas.' }]);
        } catch (err) {
            setChatMessages(prev => [...prev, { role: 'model', content: 'Erro ao processar. Tente novamente.' }]);
        } finally { setIsProcessingAI(false); }
    };

    const ColorPicker = ({ label, value, onChange }: any) => (
        <div className="flex items-center justify-between p-3 bg-white border border-zinc-200 rounded-sm">
            <span className="text-xs font-bold text-slate-700">{label}</span>
            <div className="flex items-center gap-2">
                <input 
                    type="text" 
                    value={value} 
                    onChange={e => onChange(e.target.value)}
                    className="w-20 bg-zinc-50 border border-zinc-200 rounded-sm px-2 py-1 text-xs font-mono text-slate-600 focus:outline-none"
                    placeholder="#000000"
                />
                <div className="w-8 h-8 rounded-full border-2 border-zinc-100 overflow-hidden relative shadow-sm shrink-0">
                    <input type="color" value={value} onChange={e => onChange(e.target.value)} className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] cursor-pointer" />
                </div>
            </div>
        </div>
    );

    // --- RENDER CONTENT FOR SIDEBAR/DRAWER ---
    const renderControls = () => (
        <div className="flex flex-col h-full">
            {activeTab === 'design' && (
                <div className="space-y-6 animate-fade-in p-1">
                    <div className="space-y-3">
                         <div className="flex items-center gap-2 mb-2">
                            <Type size={16} className="text-orange-700" />
                            <h3 className="font-bold text-sm text-slate-900">Tipografia</h3>
                        </div>
                        <select 
                            value={theme.fontFamily} 
                            onChange={(e) => { setTheme({...theme, fontFamily: e.target.value}); setIsDirty(true); }}
                            className="w-full bg-white border border-zinc-300 rounded-sm px-3 py-3 text-sm text-slate-900 focus:border-orange-700 focus:outline-none shadow-sm"
                        >
                            {GOOGLE_FONTS.map(font => <option key={font} value={font}>{font}</option>)}
                        </select>
                    </div>

                    <div className="space-y-3">
                         <div className="flex items-center gap-2 mb-2">
                            <Palette size={16} className="text-orange-700" />
                            <h3 className="font-bold text-sm text-slate-900">Cores da Marca</h3>
                        </div>
                        <div className="flex flex-col gap-2">
                            <ColorPicker label="Cor Principal" value={theme.primaryColor} onChange={(v:string) => { setTheme({...theme, primaryColor: v}); setIsDirty(true); }} />
                            <ColorPicker label="Fundo" value={theme.backgroundColor} onChange={(v:string) => { setTheme({...theme, backgroundColor: v}); setIsDirty(true); }} />
                            <ColorPicker label="Texto" value={theme.textColor} onChange={(v:string) => { setTheme({...theme, textColor: v}); setIsDirty(true); }} />
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'media' && (
                <div className="space-y-4 animate-fade-in p-1">
                    {selectedImgSrc ? (
                         <div className="bg-orange-50 border border-orange-200 rounded-sm p-4 mb-4">
                             <div className="flex justify-between items-start mb-2">
                                 <h4 className="text-sm font-bold text-orange-800 flex items-center gap-2"><ImageIcon size={14}/> Imagem Selecionada</h4>
                                 <button onClick={() => setSelectedImgSrc(null)} className="text-orange-600 hover:text-orange-900"><X size={14}/></button>
                             </div>
                             <div className="w-full h-32 bg-zinc-200 rounded-sm overflow-hidden mb-3 border border-orange-200/50">
                                 <img src={selectedImgSrc} className="w-full h-full object-cover" alt="Selected" />
                             </div>
                             <label className="w-full bg-orange-700 text-white hover:bg-orange-800 py-3 rounded-sm text-sm font-bold text-center cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-md">
                                {uploadingImg === selectedImgSrc ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
                                Trocar Esta Foto
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(selectedImgSrc, e)} />
                            </label>
                         </div>
                    ) : (
                        <div className="bg-blue-50 border border-blue-200 rounded-sm p-3 text-xs text-blue-800 flex items-start gap-2">
                            <Monitor size={14} className="mt-0.5 shrink-0" />
                            <p>Toque em qualquer imagem no site para editá-la, ou escolha abaixo.</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                        {detectedImages.map((img, idx) => (
                            <div key={idx} onClick={() => setSelectedImgSrc(img.src)} className={`cursor-pointer rounded-sm overflow-hidden border-2 relative h-24 ${selectedImgSrc === img.src ? 'border-orange-600 ring-2 ring-orange-200' : 'border-zinc-200'}`}>
                                <img src={img.src} className="w-full h-full object-cover" alt="" />
                                {selectedImgSrc === img.src && <div className="absolute inset-0 bg-orange-600/20 flex items-center justify-center"><Check className="text-white drop-shadow-md" size={24}/></div>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeTab === 'ai' && (
                <div className="flex flex-col h-full animate-fade-in">
                    <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 min-h-[200px]">
                        {chatMessages.length === 0 && (
                            <div className="text-center text-slate-400 text-xs py-10">
                                <Sparkles size={24} className="mx-auto mb-2 opacity-50" />
                                Peça para a IA criar seções, textos ou mudar o tom.
                            </div>
                        )}
                        {chatMessages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[90%] p-3 rounded-sm text-xs leading-relaxed ${
                                    msg.role === 'user' ? 'bg-slate-900 text-white' : 'bg-zinc-100 text-slate-700 border border-zinc-200'
                                }`}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}
                        <div ref={chatEndRef} />
                    </div>
                    <div className="mt-auto relative">
                        <textarea 
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder="Ex: Mude os preços para..."
                            className="w-full bg-white border border-zinc-300 rounded-sm p-3 pr-10 text-xs focus:border-orange-700 focus:outline-none resize-none h-20 shadow-sm"
                        />
                        <button 
                            onClick={handleAIChat}
                            disabled={isProcessingAI || !chatInput.trim()}
                            className="absolute right-2 bottom-2 p-1.5 bg-orange-700 text-white rounded-sm hover:bg-orange-600 disabled:opacity-50 transition-colors"
                        >
                            {isProcessingAI ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );

    // --- MAIN RENDER ---
    return (
        <div className="flex h-screen bg-zinc-100 overflow-hidden font-sans text-slate-900 flex-col md:flex-row">
            
            {/* --- DESKTOP SIDEBAR (Hidden on Mobile) --- */}
            <div className="hidden md:flex w-80 bg-white border-r border-zinc-200 flex-col z-20 shadow-xl">
                 <div className="h-16 border-b border-zinc-100 flex items-center justify-between px-4 bg-white shrink-0">
                    <button onClick={onBack} className="p-2 hover:bg-zinc-50 rounded-sm text-slate-400 hover:text-slate-900 transition-colors">
                        <ArrowLeft size={18} />
                    </button>
                    <span className="font-bold text-sm tracking-tight">Editor Visual</span>
                    <div className="w-8"></div>
                </div>

                {/* Desktop Tabs */}
                <div className="p-2 bg-zinc-50 border-b border-zinc-200 flex gap-1 shrink-0">
                    {['design', 'media', 'ai'].map((t) => (
                        <button 
                            key={t}
                            onClick={() => setActiveTab(t as any)}
                            className={`flex-1 py-2 rounded-sm text-xs font-bold uppercase tracking-wider transition-all ${
                                activeTab === t ? 'bg-white text-slate-900 shadow-sm border border-zinc-200' : 'text-slate-400 hover:text-slate-600'
                            }`}
                        >
                            {t === 'design' && <Palette size={14} className="inline mr-1"/>}
                            {t === 'media' && <ImageIcon size={14} className="inline mr-1"/>}
                            {t === 'ai' && <Sparkles size={14} className="inline mr-1"/>}
                            {t === 'design' ? 'Cores' : t === 'media' ? 'Mídia' : 'IA'}
                        </button>
                    ))}
                </div>

                <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                    {renderControls()}
                </div>

                <div className="p-4 border-t border-zinc-200 bg-white space-y-3 shrink-0">
                    <div className="flex gap-2">
                        <button onClick={handleUndo} disabled={historyStack.length === 0} className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 text-slate-600 rounded-sm text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-50"><Undo2 size={14} /> Undo</button>
                        <button onClick={handleRedo} disabled={futureStack.length === 0} className="flex-1 py-2 bg-zinc-100 hover:bg-zinc-200 text-slate-600 rounded-sm text-xs font-bold flex items-center justify-center gap-1 disabled:opacity-50"><Redo2 size={14} /> Redo</button>
                    </div>
                    <button onClick={() => onSave(client.id, theme, localHtml)} className={`w-full py-3 rounded-sm text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md ${isDirty ? 'bg-slate-900 text-white' : 'bg-green-600 text-white'}`}>
                        {isDirty ? <Save size={16} /> : <Check size={16} />} {isDirty ? 'Salvar' : 'Salvo'}
                    </button>
                </div>
            </div>

            {/* --- CANVAS AREA --- */}
            <div className="flex-1 flex flex-col relative bg-zinc-100/50 h-full">
                {/* Desktop Toolbar */}
                <div className="hidden md:flex h-14 border-b border-zinc-200 bg-white items-center justify-center gap-4 px-6 shadow-sm z-10 shrink-0">
                    <div className="flex bg-zinc-100 p-1 rounded-sm border border-zinc-200">
                        <button onClick={() => setPreviewMode('desktop')} className={`p-2 rounded-sm transition-all ${previewMode === 'desktop' ? 'bg-white shadow-sm' : 'text-slate-400'}`}><Monitor size={18} /></button>
                        <button onClick={() => setPreviewMode('mobile')} className={`p-2 rounded-sm transition-all ${previewMode === 'mobile' ? 'bg-white shadow-sm' : 'text-slate-400'}`}><Smartphone size={18} /></button>
                    </div>
                    <div className="h-6 w-[1px] bg-zinc-200"></div>
                    <button onClick={() => setEditModeEnabled(!editModeEnabled)} className={`flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-bold transition-all border ${editModeEnabled ? 'bg-orange-50 border-orange-200 text-orange-700' : 'bg-zinc-50 border-zinc-200 text-slate-500'}`}>
                        <MousePointer2 size={14} /> {editModeEnabled ? 'Edição: ON' : 'Edição: OFF'}
                    </button>
                </div>

                {/* Canvas */}
                <div className="flex-1 flex items-center justify-center md:p-8 p-0 overflow-hidden relative w-full h-full">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-50 pointer-events-none"></div>
                    <iframe 
                        ref={iframeRef}
                        title="Live Canvas"
                        className={`bg-white transition-all duration-500 ease-in-out shadow-2xl ${
                            previewMode === 'mobile' 
                            ? 'w-full h-full md:w-[375px] md:h-[667px] md:rounded-[3rem] md:border-[8px] md:border-slate-900 border-none' 
                            : 'w-full h-full rounded-sm border border-zinc-200'
                        }`}
                    />
                </div>
            </div>

            {/* --- MOBILE BOTTOM BAR (Only on Mobile) --- */}
            <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-white border-t border-zinc-200 shadow-[0_-5px_20px_rgba(0,0,0,0.1)] pb-safe">
                {/* Content Drawer (Slides up when tab active) */}
                {activeTab && (
                    <div className="bg-zinc-50 border-t border-zinc-200 max-h-[50vh] overflow-y-auto p-4 animate-fade-in rounded-t-2xl shadow-inner absolute bottom-full w-full left-0 z-10">
                        <div className="flex justify-between items-center mb-4 border-b border-zinc-200 pb-2">
                             <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                                {activeTab === 'design' && <Palette size={20} className="text-orange-700" />}
                                {activeTab === 'media' && <ImageIcon size={20} className="text-orange-700" />}
                                {activeTab === 'ai' && <Sparkles size={20} className="text-orange-700" />}
                                {activeTab === 'design' ? 'Estilo & Cores' : activeTab === 'media' ? 'Gerenciar Mídia' : 'Assistente IA'}
                             </h3>
                             <button onClick={() => setActiveTab(null)} className="p-2 bg-white rounded-full border border-zinc-200 text-slate-500"><ChevronUp className="rotate-180" size={20}/></button>
                        </div>
                        {renderControls()}
                    </div>
                )}

                {/* Bottom Buttons */}
                <div className="flex justify-around items-center p-2 bg-white relative z-20">
                    <button onClick={() => setActiveTab(activeTab === 'design' ? null : 'design')} className={`flex flex-col items-center gap-1 p-2 rounded-sm w-16 ${activeTab === 'design' ? 'text-orange-700' : 'text-slate-400'}`}>
                        <Palette size={24} />
                        <span className="text-[10px] font-bold">Estilo</span>
                    </button>
                    <button onClick={() => setActiveTab(activeTab === 'media' ? null : 'media')} className={`flex flex-col items-center gap-1 p-2 rounded-sm w-16 ${activeTab === 'media' ? 'text-orange-700' : 'text-slate-400'}`}>
                        <ImageIcon size={24} />
                        <span className="text-[10px] font-bold">Fotos</span>
                    </button>
                    
                    {/* Big Save Button */}
                    <button 
                        onClick={() => onSave(client.id, theme, localHtml)}
                        className={`flex flex-col items-center justify-center w-16 h-16 rounded-full -mt-8 border-4 border-zinc-100 shadow-lg transition-all ${isDirty ? 'bg-slate-900 text-white animate-pulse' : 'bg-green-600 text-white'}`}
                    >
                        {isDirty ? <Save size={28} /> : <Check size={28} />}
                    </button>

                    <button onClick={handleUndo} disabled={historyStack.length === 0} className="flex flex-col items-center gap-1 p-2 rounded-sm w-16 text-slate-400 disabled:opacity-30">
                        <Undo2 size={24} />
                        <span className="text-[10px] font-bold">Voltar</span>
                    </button>
                     <button onClick={onBack} className="flex flex-col items-center gap-1 p-2 rounded-sm w-16 text-slate-400">
                        <X size={24} />
                        <span className="text-[10px] font-bold">Sair</span>
                    </button>
                </div>
            </div>
        </div>
    );
};