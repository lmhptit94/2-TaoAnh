
import React from 'react';
import { Download, RefreshCw, Loader2 } from 'lucide-react';
import { RenovationImage } from '../types';

interface ImageCardProps {
  title: string;
  subtitle: string;
  image: RenovationImage | null;
  isLoading: boolean;
  onRetry: () => void;
  stageNumber: number;
}

const ImageCard: React.FC<ImageCardProps> = ({ 
  title, 
  subtitle, 
  image, 
  isLoading, 
  onRetry,
  stageNumber 
}) => {
  const handleDownload = () => {
    if (!image) return;
    const link = document.createElement('a');
    link.href = image.url;
    link.download = `luxerenovate-stage-${stageNumber}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`relative group flex flex-col luxury-border rounded-lg overflow-hidden transition-all duration-500 ${!image && !isLoading ? 'opacity-30 grayscale' : 'opacity-100'}`}>
      <div className="p-4 bg-zinc-900/50 border-b border-white/5">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-xs uppercase tracking-[0.2em] text-[#c5a059] font-semibold">{title}</h3>
            <p className="text-[10px] uppercase tracking-wider text-white/40 mt-0.5">{subtitle}</p>
          </div>
          {image && !isLoading && (
            <div className="flex gap-2">
              <button 
                onClick={onRetry}
                className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-colors"
                title="Retry this stage"
              >
                <RefreshCw size={14} />
              </button>
              <button 
                onClick={handleDownload}
                className="p-1.5 rounded-full bg-[#c5a059]/10 hover:bg-[#c5a059]/20 text-[#c5a059] transition-colors"
                title="Download image"
              >
                <Download size={14} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="relative image-container-9-16 bg-zinc-950 flex items-center justify-center overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="animate-spin text-[#c5a059]" size={32} />
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 animate-pulse">Rendering Reality...</p>
          </div>
        ) : image ? (
          <img 
            src={image.url} 
            alt={title} 
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 px-8 text-center">
            <div className="w-12 h-12 rounded-full border border-white/5 flex items-center justify-center mb-2">
               <span className="text-white/10 font-serif text-2xl italic">{stageNumber}</span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-white/20">Awaiting Sequence</p>
          </div>
        )}
        
        {image && (
          <div className="absolute bottom-4 right-4 text-[8px] uppercase tracking-[0.4em] text-white/20 select-none pointer-events-none">
            LUXERENOVATE AI
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageCard;
