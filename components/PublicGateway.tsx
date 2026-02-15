
import React, { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { Client } from '../types';
import { BlockScreen } from './BlockScreen';

interface PublicGatewayProps {
    client: Client;
}

export const PublicGateway: React.FC<PublicGatewayProps> = ({ client }) => {
    // Blob URL State para compatibilidade iOS
    const [blobUrl, setBlobUrl] = useState<string | null>(null);

    // Calculate Trial Logic
    const now = Date.now();
    const createdAt = client.createdAt || now;
    const trialHours = client.trialHours !== undefined ? client.trialHours : 168;
    const trialDurationMs = trialHours * 60 * 60 * 1000;
    
    const elapsedMs = now - createdAt;
    const remainingMs = Math.max(0, trialDurationMs - elapsedMs);
    
    const isExpired = elapsedMs >= trialDurationMs;
    const daysRemaining = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
    
    const daysOverdue = Math.floor((elapsedMs - trialDurationMs) / (1000 * 60 * 60 * 24));
    const isBlocked = client.paymentStatus === 'pending' && isExpired;

    // --- ENGENHARIA DE RENDERIZAÇÃO VIA BLOB (FIX IOS) ---
    useEffect(() => {
        if (!client.siteContent) return;

        let content = client.siteContent;

        // 0. Garante DOCTYPE (Essencial para iOS não entrar em Quirks Mode)
        if (!content.trim().toLowerCase().startsWith('<!doctype html>')) {
            content = '<!DOCTYPE html>\n' + content;
        }

        // 1. Injeção Robusta de Viewport (Fundamental para Mobile)
        // E Injeção do Tailwind CSS via CDN (Fundamental para o Responsivo IA)
        const headInjections = `
            <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
            <script src="https://cdn.tailwindcss.com"></script>
            <script>
                tailwind.config = {
                    theme: {
                        extend: {
                            colors: {
                                primary: 'var(--primary)',
                                secondary: 'var(--secondary)',
                                surface: 'var(--surface)',
                            }
                        }
                    }
                }
            </script>
        `;

        if (content.includes('<head>')) {
            content = content.replace('<head>', `<head>${headInjections}`);
        } else {
            // Se não achar head, tenta injetar logo após html ou no início
            content = content.replace('<html>', `<html><head>${headInjections}</head>`);
        }

        // 2. Script de Comportamento Passivo (CORRIGIDO)
        // CRÍTICO: Usa addEventListener para NÃO MATAR os scripts originais do menu mobile.
        const cleanPhone = client.leadData?.phoneNumber?.replace(/\D/g, '') || '';
        const safeScript = `
            <script>
                window.addEventListener('load', function() {
                    // 1. Garante Links Externos em Nova Aba
                    var links = document.getElementsByTagName('a');
                    for (var i = 0; i < links.length; i++) {
                        var href = links[i].getAttribute('href');
                        if (href && (href.startsWith('http') || href.startsWith('https') || href.startsWith('wa.me'))) {
                            links[i].setAttribute('target', '_blank');
                        }
                    }

                    // 2. Correção de Forms (Previne reload)
                    var forms = document.getElementsByTagName('form');
                    for (var i = 0; i < forms.length; i++) {
                        forms[i].onsubmit = function(e) {
                            e.preventDefault();
                            var phone = '${cleanPhone}';
                            if(phone) window.open('https://wa.me/55' + phone, '_blank');
                        }
                    }
                });
            </script>
        `;
        // Injeta antes do fechamento do body
        if (content.includes('</body>')) {
            content = content.replace('</body>', `${safeScript}</body>`);
        } else {
            content += safeScript;
        }

        // 3. Injeção de CSS do Tema (Se houver)
        if (client.themeConfig) {
            const { primaryColor, secondaryColor, backgroundColor, surfaceColor, textColor, fontFamily, imageOverrides } = client.themeConfig;
            
            // Fonte Google
            if (fontFamily) {
                const fontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(' ', '+')}:wght@300;400;600;700&display=swap`;
                if (content.includes('<head>')) {
                    content = content.replace('<head>', `<head><link rel="stylesheet" href="${fontUrl}">`);
                }
            }

            // Variáveis CSS e RESET MOBILE
            const themeCss = `
                <style>
                    :root {
                        ${primaryColor ? `--primary: ${primaryColor} !important;` : ''}
                        ${secondaryColor ? `--secondary: ${secondaryColor} !important;` : ''}
                        ${backgroundColor ? `--bg: ${backgroundColor} !important;` : ''}
                        ${surfaceColor ? `--surface: ${surfaceColor} !important;` : ''}
                        ${textColor ? `--text: ${textColor} !important;` : ''}
                        ${fontFamily ? `--font-main: '${fontFamily}', sans-serif !important;` : ''}
                    }
                    html, body {
                        overflow-x: hidden; 
                        -webkit-overflow-scrolling: touch;
                        min-height: 100%;
                        margin: 0;
                        padding: 0;
                    }
                    /* Força cores do Tailwind a usarem as variáveis se mapeadas */
                    .bg-primary { background-color: var(--primary) !important; }
                    .text-primary { color: var(--primary) !important; }
                    .bg-surface { background-color: var(--surface) !important; }
                    body { background-color: var(--bg) !important; color: var(--text) !important; font-family: var(--font-main) !important; }
                </style>
            `;
            if (content.includes('</head>')) {
                content = content.replace('</head>', `${themeCss}</head>`);
            } else {
                content += themeCss;
            }

            // Substituição de Imagens (GARANTIDO NO SITE PÚBLICO)
            if (imageOverrides) {
                Object.entries(imageOverrides).forEach(([originalSrc, newSrc]) => {
                    if (newSrc && (newSrc as string).trim() !== '') {
                        content = content.split(originalSrc).join(newSrc);
                    }
                });
            }
        }

        // 4. CRIAÇÃO DO BLOB
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);

        return () => {
            URL.revokeObjectURL(url);
        };
    }, [client.siteContent, client.themeConfig]);


    if (isBlocked) {
        return <BlockScreen client={client} daysOverdue={daysOverdue} />;
    }

    return (
        <div className="flex flex-col w-full h-[100dvh] bg-black">
            {/* Banner Trial */}
            {client.paymentStatus === 'pending' && !isExpired && (
                <div className="shrink-0 h-10 bg-[#0a0a0a] border-b border-[#222] z-50 flex items-center justify-center text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                        <Clock size={12} className="text-yellow-500" />
                        <span>
                            Modo Degustação: 
                            {daysRemaining > 1 ? ` ${daysRemaining} dias restantes` : ` ${Math.ceil(remainingMs / (1000 * 60))} minutos restantes`}
                        </span>
                    </div>
                </div>
            )}

            <div className="flex-1 w-full relative overflow-hidden bg-white">
                {blobUrl ? (
                    <iframe 
                        src={blobUrl}
                        className="w-full h-full border-none"
                        style={{ width: '100%', height: '100%' }}
                        title={client.name}
                        // REMOVIDO SANDBOX: IOS Safari buga scripts e touch events dentro de sandbox estrito.
                        // Como o conteúdo é gerado por IA confiável, removemos para garantir funcionalidade total mobile.
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-black">
                        <h1 className="text-2xl font-light animate-pulse">Carregando interface...</h1>
                    </div>
                )}
            </div>
        </div>
    );
};
