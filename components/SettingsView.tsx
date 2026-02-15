import React, { useState } from 'react';
import { Sliders, Clock, AlertTriangle, CheckCircle, Save } from 'lucide-react';
import { GlobalSettings } from '../types';

interface SettingsViewProps {
    settings: GlobalSettings;
    onSave: (s: GlobalSettings) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ settings, onSave }) => {
    const [tempSettings, setTempSettings] = useState(settings);
    const [isSaved, setIsSaved] = useState(false);

    const handleSave = () => {
        onSave(tempSettings);
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="flex items-center gap-3 mb-8 text-slate-500 text-sm font-medium">
                 <Sliders size={16} />
                 <span>Definições globais de comportamento da plataforma</span>
             </div>

            <div className="space-y-8">
                {/* Card: Trial Settings */}
                <div className="bg-white border border-zinc-200 rounded-sm overflow-hidden p-8 shadow-sm relative group">
                    <div className="flex items-start gap-5 mb-8">
                        <div className="w-12 h-12 bg-zinc-50 rounded-sm border border-zinc-200 flex items-center justify-center shrink-0">
                            <Clock className="text-orange-700" size={24} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">Regras de Degustação (Trial)</h3>
                            <p className="text-slate-500 text-sm leading-relaxed max-w-md">
                                Defina o tempo padrão que novos clientes terão acesso aos sites gerados antes do bloqueio por falta de pagamento.
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-zinc-100 pt-8">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tempo de Duração</label>
                            <input 
                                type="number"
                                value={tempSettings.defaultTrialValue}
                                onChange={(e) => setTempSettings({ ...tempSettings, defaultTrialValue: parseInt(e.target.value) || 0 })}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-sm px-5 py-4 text-slate-900 focus:outline-none focus:border-orange-700 transition-colors placeholder-slate-400 text-xl font-mono font-bold"
                            />
                        </div>
                        <div className="space-y-3">
                             <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unidade de Medida</label>
                             <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-1 rounded-sm border border-zinc-200">
                                <button 
                                    onClick={() => setTempSettings({ ...tempSettings, defaultTrialUnit: 'hours' })}
                                    className={`py-3 rounded-sm text-sm font-bold transition-all ${
                                        tempSettings.defaultTrialUnit === 'hours' 
                                        ? 'bg-white text-slate-900 shadow-sm border border-zinc-200' 
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    Horas
                                </button>
                                <button 
                                    onClick={() => setTempSettings({ ...tempSettings, defaultTrialUnit: 'days' })}
                                    className={`py-3 rounded-sm text-sm font-bold transition-all ${
                                        tempSettings.defaultTrialUnit === 'days' 
                                        ? 'bg-white text-slate-900 shadow-sm border border-zinc-200' 
                                        : 'text-slate-400 hover:text-slate-600'
                                    }`}
                                >
                                    Dias
                                </button>
                             </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 bg-orange-50 border border-orange-200 rounded-sm p-4 flex items-center gap-3 text-xs text-orange-800 font-medium">
                        <AlertTriangle size={14} className="text-orange-600" />
                        <span>Esta configuração será aplicada automaticamente a <strong>todos os novos projetos</strong> criados a partir de agora.</span>
                    </div>
                </div>

                {/* Action Bar */}
                <div className="flex justify-end pt-4">
                    <button 
                        onClick={handleSave}
                        className={`px-8 py-3 rounded-sm font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${
                            isSaved 
                            ? 'bg-green-600 text-white hover:bg-green-700' 
                            : 'bg-slate-900 text-white hover:bg-slate-800'
                        }`}
                    >
                        {isSaved ? <CheckCircle size={18} /> : <Save size={18} />}
                        {isSaved ? 'Configuração Salva!' : 'Salvar Alterações'}
                    </button>
                </div>
            </div>
        </div>
    );
};