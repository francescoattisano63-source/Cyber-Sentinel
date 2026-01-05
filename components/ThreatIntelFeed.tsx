
import React from 'react';

interface ThreatIntel {
  content: string;
  sources: { title: string; uri: string }[];
}

interface ThreatIntelFeedProps {
  intel: ThreatIntel | null;
  language: 'IT' | 'EN';
}

export const ThreatIntelFeed: React.FC<ThreatIntelFeedProps> = ({ intel, language }) => {
  if (!intel) return (
    <div className="py-10 text-center">
      <div className="animate-spin h-6 w-6 border-2 border-emerald border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-[10px] font-black uppercase tracking-widest text-white/30">Synchronizing Intel...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="prose prose-invert prose-emerald max-w-none">
        <div className="text-xs leading-relaxed text-white/80 font-medium">
          {intel.content.split('\n').map((line, i) => (
            <p key={i} className="mb-3 border-l-2 border-emerald/20 pl-4 py-1 hover:border-emerald transition-all">
              {line}
            </p>
          ))}
        </div>
      </div>
      <div className="pt-4 border-t border-white/10">
        <p className="text-[9px] font-black uppercase tracking-widest text-emerald mb-3">Verified Sources</p>
        <div className="flex flex-wrap gap-2">
          {intel.sources.map((source, i) => (
            <a 
              key={i} 
              href={source.uri} 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[9px] bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-white/60 hover:text-emerald hover:border-emerald/40 transition-all uppercase font-bold"
            >
              <i className="fas fa-external-link-alt mr-2"></i>
              {source.title.length > 20 ? source.title.substring(0, 20) + '...' : source.title}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
