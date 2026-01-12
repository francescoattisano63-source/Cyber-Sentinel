
import React, { useState } from 'react';
import { NeuralAtom } from './NeuralAtom';

interface LandingPageProps {
  onEnterPortal: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterPortal }) => {
  const [showComparison, setShowComparison] = useState(false);

  const scrollToPricing = (e: React.MouseEvent) => {
    e.preventDefault();
    const pricingSection = document.getElementById('pricing');
    if (pricingSection) {
      pricingSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-obsidian text-white overflow-x-hidden font-['Space_Grotesk'] selection:bg-emerald selection:text-black">
      {/* Dynamic Background Noise */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-[100]" style={{ backgroundImage: 'url(https://grainy-gradients.vercel.app/noise.svg)' }}></div>

      {/* Hero Section */}
      <header className="relative h-screen flex flex-col items-center justify-center px-6">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.1)_0%,transparent_70%)]"></div>
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#10b981 1px, transparent 1px), linear-gradient(90deg, #10b981 1px, transparent 1px)', backgroundSize: '80px 80px' }}></div>
        
        <div className="z-10 text-center animate-in fade-in zoom-in duration-1000">
          <div className="scale-90 mb-[-3rem]">
             <NeuralAtom active />
          </div>
          <h1 className="text-7xl md:text-[10rem] font-black uppercase tracking-tighter italic text-white mb-6 drop-shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            CYBER <span className="text-emerald">SENTINEL</span>
          </h1>
          <p className="text-xs md:text-xl font-black text-white/30 uppercase tracking-[0.8em] mb-16 max-w-5xl mx-auto leading-relaxed">
            The World's Most Advanced Tactical Security Intelligence Platform
          </p>
          
          <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
            <button 
              onClick={onEnterPortal}
              className="group relative bg-emerald text-black px-20 py-7 rounded-2xl font-black uppercase text-[11px] shadow-[0_0_60px_rgba(16,185,129,0.4)] hover:scale-105 transition-all active:scale-95 tracking-[0.3em] overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/30 -translate-x-full group-hover:translate-x-0 transition-transform duration-500"></div>
              <span className="relative z-10">ACCESS COMMAND PORTAL</span>
            </button>
            <button 
              onClick={scrollToPricing}
              className="px-20 py-7 border-2 border-white/10 rounded-2xl font-black uppercase text-[11px] hover:bg-white/5 hover:border-white/20 transition-all tracking-[0.3em] backdrop-blur-md"
            >
              VIEW PRICING TIERS
            </button>
          </div>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-20 cursor-pointer" onClick={scrollToPricing}>
          <i className="fas fa-chevron-down text-2xl"></i>
        </div>
      </header>

      {/* Trust Badges / Stats */}
      <section className="py-24 border-y border-white/5 bg-white/[0.01]">
         <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
               { val: '24/7', label: 'NEURAL MONITORING' },
               { val: '99.9%', label: 'RISK DETECTION' },
               { val: '<12ms', label: 'THREAT RESPONSE' },
               { val: '100%', label: 'NIST ALIGNMENT' }
            ].map((stat, i) => (
               <div key={i} className="space-y-2">
                  <p className="text-4xl font-black italic text-emerald tracking-tighter">{stat.val}</p>
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-widest">{stat.label}</p>
               </div>
            ))}
         </div>
      </section>

      {/* Value Proposition */}
      <section className="py-48 px-6 max-w-7xl mx-auto">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {[
              { icon: 'fa-brain-circuit', title: 'Kore Neural IA', desc: 'Sfrutta il potere dell\'IA predittiva per anticipare le minacce prima che tocchino i tuoi server.' },
              { icon: 'fa-file-shield', title: 'Policy Engine', desc: 'Genera documenti di compliance GDPR e ISO 27001 in pochi secondi basati sulla tua reale postura.' },
              { icon: 'fa-tower-observation', title: 'Global Intel', desc: 'Collegati a un network globale di sensori che tracciano attacchi zero-day in tempo reale.' }
            ].map((feat, i) => (
              <div key={i} className="glass p-16 rounded-[4rem] border-white/5 hover:border-emerald/20 transition-all group relative overflow-hidden">
                 <div className="absolute -right-4 -top-4 w-32 h-32 bg-emerald/5 rounded-full blur-3xl group-hover:bg-emerald/10 transition-colors"></div>
                 <i className={`fas ${feat.icon} text-5xl text-emerald/40 group-hover:text-emerald mb-10 transition-all duration-500 group-hover:scale-110`}></i>
                 <h3 className="text-3xl font-black uppercase mb-6 tracking-tighter italic">{feat.title}</h3>
                 <p className="text-white/40 text-sm leading-relaxed font-medium">{feat.desc}</p>
              </div>
            ))}
         </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-48 px-6 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-32 space-y-4">
            <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter italic mb-4">TACTICAL PLANS</h2>
            <div className="flex items-center justify-center gap-4">
               <div className="h-[1px] w-12 bg-emerald/30"></div>
               <p className="text-emerald font-black uppercase tracking-[0.5em] text-[11px]">Deploy your defense layer</p>
               <div className="h-[1px] w-12 bg-emerald/30"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-24">
            {[
              { tier: 'Silver', price: '490', features: ['Daily Neural Scan', '10 Kore Inquiries', 'Email OSINT Leak Check', 'NIST Framework v1'], color: 'white', badge: 'BASIC CLEARANCE' },
              { tier: 'Gold', price: '1.250', features: ['Hourly Neural Link', 'Unlimited Kore Chat', 'Full Forensics Suite', 'Executive PDF Reports', 'IA Compliance Engine'], color: 'emerald', popular: true, badge: 'TACTICAL CHOICE' },
              { tier: 'Platinum', price: '4.800', features: ['24/7 Live Monitoring', 'Custom IA Training', 'Global Threat Access', 'Legal Liability Cover', 'Dedicated CISO Agent'], color: 'gold', badge: 'ELITE OPERATIONS' }
            ].map((plan, i) => (
              <div key={i} className={`relative glass p-16 rounded-[5rem] border-2 flex flex-col h-full transition-all duration-1000 hover:scale-[1.02] ${plan.popular ? 'border-emerald/40 bg-emerald/[0.02] shadow-[0_0_100px_rgba(16,185,129,0.1)]' : 'border-white/5 shadow-2xl'}`}>
                {plan.popular && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-emerald text-black px-10 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-[0_0_30px_rgba(16,185,129,0.5)]">RECOMMENDED DEPLOYMENT</div>
                )}
                
                <div className="mb-16">
                  <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.5em] mb-6">{plan.badge}</p>
                  <h4 className={`text-5xl font-black uppercase tracking-tighter mb-8 ${plan.tier === 'Gold' ? 'text-emerald' : ''}`}>{plan.tier}</h4>
                  <div className="flex items-baseline gap-2 group">
                    <span className="text-7xl font-black italic tracking-tighter transition-transform group-hover:scale-110 duration-500">€{plan.price}</span>
                    <span className="text-white/20 uppercase text-[10px] font-black">/ Month</span>
                  </div>
                </div>

                <ul className="flex-1 space-y-8 mb-20">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex items-center gap-5 text-[13px] font-bold text-white/60 group">
                      <div className={`w-2 h-2 rounded-full ${plan.popular ? 'bg-emerald' : 'bg-white/20'} group-hover:scale-150 transition-transform`}></div>
                      {f}
                    </li>
                  ))}
                </ul>

                <button 
                   onClick={onEnterPortal}
                   className={`w-full py-7 rounded-[2.5rem] font-black uppercase text-[11px] tracking-[0.3em] transition-all duration-500 relative overflow-hidden group ${plan.popular ? 'bg-emerald text-black shadow-2xl hover:shadow-emerald/50' : 'bg-white/5 border-2 border-white/10 hover:bg-white/10'}`}
                >
                  <span className="relative z-10">INITIALIZE AGENT</span>
                </button>
              </div>
            ))}
          </div>

          {/* Comparison Toggle */}
          <div className="text-center">
             <button 
               onClick={() => setShowComparison(!showComparison)}
               className="group inline-flex items-center gap-4 text-[11px] font-black uppercase tracking-[0.4em] text-white/40 hover:text-emerald transition-all"
             >
                {showComparison ? 'HIDE COMPARISON MATRIX' : 'VIEW DETAILED COMPARISON MATRIX'}
                <i className={`fas fa-chevron-${showComparison ? 'up' : 'down'} text-[10px] transition-transform duration-500 ${showComparison ? 'rotate-180' : ''}`}></i>
             </button>
             
             {showComparison && (
               <div className="mt-20 animate-in slide-in-from-bottom-10 duration-1000 overflow-x-auto">
                  <table className="w-full text-left border-collapse glass rounded-[3rem] overflow-hidden">
                     <thead>
                        <tr className="bg-white/5 border-b border-white/10 uppercase text-[10px] font-black tracking-widest">
                           <th className="p-10">Neural Capabilities</th>
                           <th className="p-10 text-center">Silver</th>
                           <th className="p-10 text-center text-emerald">Gold</th>
                           <th className="p-10 text-center">Platinum</th>
                        </tr>
                     </thead>
                     <tbody className="text-white/60 text-xs font-bold uppercase">
                        {[
                           { feat: 'Scan Frequency', s: 'Daily', g: 'Hourly', p: 'Real-time' },
                           { feat: 'IA Reasoning Level', s: 'Standard', g: 'Advanced', p: 'Predictive' },
                           { feat: 'Compliance Engine', s: 'Basic', g: 'Full Suite', p: 'Unlimited' },
                           { feat: 'Direct Support', s: 'Email', g: 'Priority', p: '24/7 Dedicated' },
                           { feat: 'Forensics Logs', s: '24 Hours', g: '30 Days', p: 'Unlimited' }
                        ].map((row, i) => (
                           <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                              <td className="p-10">{row.feat}</td>
                              <td className="p-10 text-center text-white/40">{row.s}</td>
                              <td className="p-10 text-center text-emerald font-black">{row.g}</td>
                              <td className="p-10 text-center text-white/40">{row.p}</td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
             )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-32 px-6 border-t border-white/5 relative bg-black">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-12">
           <div className="text-center md:text-left">
              <h4 className="text-3xl font-black uppercase tracking-tighter mb-4 italic">CYBER <span className="text-emerald">SENTINEL</span></h4>
              <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Tactical Intelligence Operations v1.0.4</p>
           </div>
           <div className="flex gap-12">
              {['Twitter', 'Discord', 'Documentation', 'Legal'].map(link => (
                <a key={link} href="#" className="text-[10px] font-black uppercase tracking-widest text-white/30 hover:text-emerald transition-colors">{link}</a>
              ))}
           </div>
        </div>
        <div className="mt-20 text-center">
           <p className="text-[8px] text-white/10 uppercase tracking-[1em]">© 2025 SENTINEL SYSTEMS. ALL DATA ENCRYPTED VIA KORE PROTOCOL.</p>
        </div>
      </footer>
    </div>
  );
};
