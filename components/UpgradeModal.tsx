
import React, { useState } from 'react';
import { SubscriptionTier } from '../types';
import { TIERS_CONFIG } from '../constants';
import { useUser } from '../UserContext';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetTier?: SubscriptionTier;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, targetTier = SubscriptionTier.GOLD }) => {
  const { updateTier } = useUser();
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState<'selection' | 'payment' | 'success'>('payment');
  
  if (!isOpen) return null;

  const handlePayment = async () => {
    setProcessing(true);
    // Simula latenza Gateway Bancario
    await new Promise(r => setTimeout(r, 2500));
    await updateTier(targetTier);
    setStep('success');
    setProcessing(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-obsidian/80 backdrop-blur-2xl animate-in fade-in duration-300">
      <div className="max-w-xl w-full glass rounded-[4rem] p-12 border border-white/10 relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald via-gold to-emerald opacity-50"></div>
        
        {step === 'payment' && (
          <div className="space-y-10">
            <div className="flex justify-between items-start">
               <div>
                  <h3 className="text-3xl font-black uppercase tracking-tighter italic">CLEARANCE UPGRADE</h3>
                  <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2">SECURE PAYMENT GATEWAY v4.0</p>
               </div>
               <button onClick={onClose} className="w-10 h-10 rounded-full border border-white/5 flex items-center justify-center hover:bg-white/5 transition-colors">
                  <i className="fas fa-times text-xs"></i>
               </button>
            </div>

            <div className="p-8 bg-white/5 rounded-3xl border border-white/10 flex justify-between items-center">
               <div>
                  <p className="text-[10px] font-black text-emerald uppercase tracking-widest mb-1">SELECTED PLAN</p>
                  <p className="text-2xl font-black uppercase italic">{TIERS_CONFIG[targetTier].name} Deployment</p>
               </div>
               <div className="text-right">
                  <p className="text-[10px] text-white/20 font-black uppercase tracking-widest mb-1">TOTAL DUE</p>
                  <p className="text-3xl font-black italic">€{targetTier === 'GOLD' ? '1.250' : '4.800'}<span className="text-xs text-white/20">/mo</span></p>
               </div>
            </div>

            <div className="space-y-6">
               <div className="group">
                  <label className="text-[9px] font-black uppercase text-white/40 ml-4 mb-2 block">Tactical Credit Card</label>
                  <div className="relative">
                     <i className="fas fa-credit-card absolute left-5 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-emerald"></i>
                     <input disabled className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 pl-14 text-sm font-mono tracking-widest text-emerald/60" value="**** **** **** 8842" />
                  </div>
               </div>
               <div className="grid grid-cols-2 gap-6">
                  <div className="group">
                     <label className="text-[9px] font-black uppercase text-white/40 ml-4 mb-2 block">Expiry</label>
                     <input disabled className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm font-mono text-emerald/60 text-center" value="09 / 28" />
                  </div>
                  <div className="group">
                     <label className="text-[9px] font-black uppercase text-white/40 ml-4 mb-2 block">Auth Code</label>
                     <input disabled className="w-full bg-black/40 border border-white/5 rounded-2xl p-5 text-sm font-mono text-emerald/60 text-center" value="***" />
                  </div>
               </div>
            </div>

            <button 
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-emerald text-black py-7 rounded-[2rem] font-black uppercase text-xs tracking-widest shadow-[0_0_50px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-all active:scale-95 disabled:opacity-50"
            >
              {processing ? (
                <div className="flex items-center justify-center gap-4">
                  <i className="fas fa-spinner fa-spin"></i>
                  <span>ENCRYPTING TRANSACTION...</span>
                </div>
              ) : `AUTHORIZE €${targetTier === 'GOLD' ? '1.250' : '4.800'} PAYMENT`}
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="text-center py-10 space-y-8 animate-in zoom-in duration-700">
             <div className="w-24 h-24 rounded-full bg-emerald/10 border border-emerald/20 flex items-center justify-center mx-auto shadow-[0_0_60px_rgba(16,185,129,0.2)]">
                <i className="fas fa-check text-4xl text-emerald"></i>
             </div>
             <div>
                <h3 className="text-4xl font-black uppercase tracking-tighter italic mb-4">DEPLOYMENT ACTIVE</h3>
                <p className="text-white/40 text-sm max-w-xs mx-auto leading-relaxed">
                   Your account has been elevated to <span className="text-white font-bold">{targetTier} CLEARANCE</span>. All restricted modules are now operational.
                </p>
             </div>
             <button 
               onClick={onClose}
               className="bg-white text-black px-16 py-6 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 transition-all shadow-2xl"
             >
               RETURN TO COMMAND CENTER
             </button>
          </div>
        )}
      </div>
    </div>
  );
};
