
import React from 'react';
import { Lock, AlertTriangle } from 'lucide-react';
import { Client } from '../types';

interface BlockScreenProps {
    client: Client;
    daysOverdue: number;
}

export const BlockScreen: React.FC<BlockScreenProps> = ({ client, daysOverdue }) => {
    return (
        <div className="w-full h-screen flex flex-col items-center justify-center bg-black relative overflow-hidden p-6">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,50,50,0.1),transparent_70%)] pointer-events-none"></div>
            
            <div className="z-10 flex flex-col items-center max-w-md text-center animate-fade-in">
                <div className="w-20 h-20 bg-[#1a0505] rounded-2xl border border-red-900/30 flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                    <Lock size={32} className="text-red-500" />
                </div>
                
                <h1 className="text-3xl font-semibold text-white mb-2 tracking-tight">Acesso Temporariamente Suspenso</h1>
                
                <p className="text-gray-400 leading-relaxed mb-8">
                    O período de degustação gratuita para <strong>{client.name}</strong> encerrou. 
                    Para reativar este projeto e mantê-lo online, a confirmação financeira é necessária.
                </p>
                
                <div className="w-full bg-[#0f0f0f] border border-[#222] rounded-lg p-4 mb-8">
                    <div className="flex justify-between items-center text-sm mb-2">
                        <span className="text-gray-500">Status do Projeto</span>
                        <span className="text-yellow-500 flex items-center gap-1"><AlertTriangle size={12} /> Aguardando Pagamento</span>
                    </div>
                    <div className="w-full bg-[#222] h-1 rounded-full overflow-hidden">
                        <div className="w-full h-full bg-gradient-to-r from-red-900 to-red-600"></div>
                    </div>
                </div>

                {client.paymentLink ? (
                    <a 
                        href={client.paymentLink} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-600 hover:bg-green-500 text-white transition-all px-8 py-3 rounded-full font-bold text-sm shadow-[0_0_20px_rgba(34,197,94,0.3)] flex items-center gap-2"
                    >
                        Pagar e Liberar Agora
                    </a>
                ) : (
                    <button className="bg-white text-black hover:bg-gray-200 transition-all px-8 py-3 rounded-full font-medium text-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                        Entrar em Contato com Suporte
                    </button>
                )}
                
                <div className="mt-12 text-[10px] text-gray-600 uppercase tracking-widest">
                    Powered by Ditho System
                </div>
            </div>
        </div>
    );
};