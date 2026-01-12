
import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { NeuralAtom } from './NeuralAtom';
import { useUser } from '../UserContext';

export const AuthPage: React.FC = () => {
  const { loginAsTestUser } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert("Controlla la tua email per confermare l'iscrizione!");
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-obsidian flex items-center justify-center p-6">
      <div className="max-w-md w-full glass rounded-[3rem] p-12 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald to-transparent opacity-50"></div>
        
        <div className="text-center mb-10">
          <div className="scale-50 h-32 -mb-8">
            <NeuralAtom active={loading} />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-tighter italic text-emerald">CYBER SENTINEL</h2>
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mt-2">Tactical Intelligence Portal</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] uppercase font-black text-white/40 ml-4 mb-2 block">Neural Identity (Email)</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-emerald outline-none focus:border-emerald/50 transition-all font-mono text-sm"
              placeholder="agent@sentinel.io"
            />
          </div>

          <div>
            <label className="text-[10px] uppercase font-black text-white/40 ml-4 mb-2 block">Security Token (Password)</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/60 border border-white/10 rounded-2xl p-4 text-emerald outline-none focus:border-emerald/50 transition-all font-mono text-sm"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-red-500 text-[10px] font-black uppercase text-center animate-pulse">{error}</p>}

          <div className="space-y-3">
            <button 
              onClick={handleAuth}
              disabled={loading}
              className="w-full bg-emerald text-black py-5 rounded-2xl font-black uppercase text-xs shadow-[0_0_30px_rgba(16,185,129,0.2)] hover:scale-[1.02] transition-all disabled:opacity-50"
            >
              {loading ? 'Processing...' : isLogin ? 'Access Portal' : 'Register Agent'}
            </button>

            {/* Pulsante di Bypass per l'utente di test */}
            <button 
              onClick={loginAsTestUser}
              className="w-full bg-white/5 border border-white/10 text-white/60 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-emerald hover:text-black transition-all"
            >
              <i className="fas fa-vial mr-2 text-emerald"></i> DEBUG: Access as Test Agent
            </button>
          </div>

          <div className="text-center mt-8">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-[10px] font-black uppercase text-white/20 hover:text-white/60 transition-colors"
            >
              {isLogin ? "Need a new Clearance? Register" : "Already verified? Login"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
