
import React, { useState, useCallback } from 'react';
import Header from './components/Header';
import ImageCard from './components/ImageCard';
import { generateRenovationImage } from './services/gemini';
import { AppState, WorkflowStage, RenovationImage } from './types';
import { Wand2, Eraser, AlertCircle } from 'lucide-react';

const INITIAL_STATE: AppState = {
  currentStage: WorkflowStage.INITIAL,
  prompt: '',
  images: {
    1: null,
    2: null,
    3: null,
  },
  isGenerating: false,
  error: null,
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(INITIAL_STATE);

  const handleClearSession = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  const getActiveStage = () => {
    if (!state.images[1]) return WorkflowStage.INITIAL;
    if (!state.images[2]) return WorkflowStage.IN_PROGRESS;
    if (!state.images[3]) return WorkflowStage.FINAL;
    return WorkflowStage.COMPLETED;
  };

  const handleGenerate = async (targetStage?: WorkflowStage) => {
    const activeStage = targetStage || getActiveStage();
    
    if (activeStage === WorkflowStage.COMPLETED && !targetStage) return;
    if (!state.prompt.trim()) {
      setState(prev => ({ ...prev, error: "Please enter a room description first." }));
      return;
    }

    setState(prev => ({ 
      ...prev, 
      isGenerating: true, 
      error: null,
      // If retrying, clear only that specific image
      images: targetStage ? { ...prev.images, [targetStage]: null } : prev.images
    }));

    try {
      let referenceBase64: string | undefined;
      
      // Stage 2 uses Stage 1 as reference. Stage 3 uses Stage 2 as reference.
      if (activeStage === WorkflowStage.IN_PROGRESS) {
        referenceBase64 = state.images[1]?.base64;
      } else if (activeStage === WorkflowStage.FINAL) {
        referenceBase64 = state.images[2]?.base64;
      }

      const result = await generateRenovationImage(state.prompt, activeStage, referenceBase64);
      
      const newImage: RenovationImage = {
        stage: activeStage,
        url: result.url,
        base64: result.base64,
        promptUsed: state.prompt
      };

      setState(prev => {
        const nextImages = { ...prev.images, [activeStage]: newImage };
        // Determine what the next stage should be based on images filled
        let nextStage = prev.currentStage;
        if (!targetStage) {
            if (activeStage === WorkflowStage.INITIAL) nextStage = WorkflowStage.IN_PROGRESS;
            else if (activeStage === WorkflowStage.IN_PROGRESS) nextStage = WorkflowStage.FINAL;
            else if (activeStage === WorkflowStage.FINAL) nextStage = WorkflowStage.COMPLETED;
        }
          
        return {
          ...prev,
          images: nextImages,
          currentStage: nextStage,
          isGenerating: false
        };
      });
    } catch (err: any) {
      setState(prev => ({ 
        ...prev, 
        isGenerating: false, 
        error: err.message || "An unexpected error occurred during image generation." 
      }));
    }
  };

  const handleRetry = (stage: number) => {
    handleGenerate(stage as WorkflowStage);
  };

  const currentDisplayStage = getActiveStage();
  const isGenerateDisabled = state.isGenerating || currentDisplayStage === WorkflowStage.COMPLETED;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-8">
        {/* Input Controls */}
        <section className="bg-zinc-900/40 p-6 rounded-xl luxury-border backdrop-blur-sm shadow-2xl">
          <div className="flex flex-col gap-6">
            <div className="space-y-2">
              <label className="text-[10px] uppercase tracking-[0.4em] text-[#c5a059] font-bold">
                Design Vision
              </label>
              <div className="relative group">
                <input 
                  type="text"
                  value={state.prompt}
                  onChange={(e) => setState(prev => ({ ...prev, prompt: e.target.value, error: null }))}
                  placeholder="e.g. Victorian master bedroom with high ceilings"
                  className="w-full bg-black/60 border border-white/5 rounded-lg py-4 px-5 text-white/90 placeholder:text-white/20 focus:outline-none focus:ring-1 focus:ring-[#c5a059]/50 transition-all text-sm"
                  disabled={state.isGenerating}
                />
                {currentDisplayStage !== WorkflowStage.INITIAL && currentDisplayStage !== WorkflowStage.COMPLETED && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] uppercase tracking-widest text-[#c5a059] bg-[#c5a059]/10 px-2 py-1 rounded">
                    Camera Locked
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4">
                <button 
                  onClick={() => handleGenerate()}
                  disabled={isGenerateDisabled}
                  className={`flex items-center gap-3 px-8 py-3.5 rounded-full text-xs uppercase tracking-[0.2em] font-bold transition-all ${
                    isGenerateDisabled 
                    ? 'bg-zinc-800 text-white/20 cursor-not-allowed' 
                    : 'luxury-gradient text-black hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(197,160,89,0.3)]'
                  }`}
                >
                  <Wand2 size={16} className={state.isGenerating ? 'animate-pulse' : ''} />
                  {state.isGenerating ? 'Rendering...' : currentDisplayStage === WorkflowStage.COMPLETED ? 'Vision Complete' : `Generate Stage ${currentDisplayStage}`}
                </button>

                <button 
                  onClick={handleClearSession}
                  className="flex items-center gap-3 px-6 py-3.5 rounded-full text-xs uppercase tracking-[0.2em] font-bold border border-white/10 text-white/60 hover:bg-white/5 hover:text-white transition-all"
                >
                  <Eraser size={16} />
                  Clear Session
                </button>
              </div>

              {state.error && (
                <div className="flex items-center gap-2 text-red-400 text-[10px] uppercase tracking-widest bg-red-400/5 px-4 py-2 rounded-full border border-red-400/20">
                  <AlertCircle size={14} />
                  {state.error}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Workflow Display */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <ImageCard 
            stageNumber={1}
            title="Stage I: The Raw"
            subtitle="Initial Room Condition"
            image={state.images[1]}
            isLoading={state.isGenerating && !state.images[1] && getActiveStage() === WorkflowStage.INITIAL}
            onRetry={() => handleRetry(1)}
          />
          <ImageCard 
            stageNumber={2}
            title="Stage II: The Craft"
            subtitle="Renovation In Progress"
            image={state.images[2]}
            isLoading={state.isGenerating && !state.images[2] && getActiveStage() === WorkflowStage.IN_PROGRESS}
            onRetry={() => handleRetry(2)}
          />
          <ImageCard 
            stageNumber={3}
            title="Stage III: The Luxe"
            subtitle="Final Luxury Masterpiece"
            image={state.images[3]}
            isLoading={state.isGenerating && !state.images[3] && getActiveStage() === WorkflowStage.FINAL}
            onRetry={() => handleRetry(3)}
          />
        </section>

        {/* Informational Footer */}
        <footer className="pt-12 pb-8 text-center">
          <p className="text-[9px] uppercase tracking-[0.5em] text-white/20">
            Professional AI Generation Engine • Cinematic Realism • Ultra-High Fidelity
          </p>
        </footer>
      </main>
    </div>
  );
};

export default App;
