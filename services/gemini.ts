
import { GoogleGenAI } from "@google/genai";
import { WorkflowStage } from "../types";

const MODEL_NAME = 'gemini-2.5-flash-image';

export const generateRenovationImage = async (
  prompt: string,
  stage: WorkflowStage,
  referenceImageBase64?: string
): Promise<{ url: string; base64: string }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

  const globalRules = "Ultra-realistic cinematic photography, 8k resolution, architectural magazine quality. ABSOLUTELY NO logos, NO watermarks, NO branding, NO text overlays, NO signatures, NO UI elements. Pure photographic result.";
  
  let stagePrompt = "";
  
  switch (stage) {
    case WorkflowStage.INITIAL:
      stagePrompt = `A professional architectural photo of an empty, raw ${prompt} room in pre-renovation condition. Dull, damaged, and unfinished surfaces. Peeling paint on walls, dusty floors, visible surface cracks and imperfections. Natural cold raw daylight from windows. Static camera angle. Portrait 9:16 aspect ratio. ${globalRules}`;
      break;
    case WorkflowStage.IN_PROGRESS:
      stagePrompt = `A professional architectural photo of the EXACT same room from the reference, 75% renovation completion. Luxury materials for ${prompt} like marble tiles and premium wood are being installed. Workers visible ONLY as extreme motion blur with NO visible faces. Construction tools, ladders, and protective plastic sheets visible. Maintain exact same camera angle and geometry. Portrait 9:16 aspect ratio. ${globalRules}`;
      break;
    case WorkflowStage.FINAL:
      stagePrompt = `A professional architectural photo of the EXACT same room from the reference, fully completed luxury ${prompt}. Fully furnished with high-end premium designer furniture. Curtains closed. Interior ambient architectural lights (warm LEDs, chandeliers) turned on. Polished premium materials. Clean, refined, organized luxury details. Soft cinematic evening lighting. No workers or tools. Maintain exact same camera angle. Portrait 9:16 aspect ratio. ${globalRules}`;
      break;
    default:
      stagePrompt = `${prompt}. Portrait 9:16 aspect ratio. ${globalRules}`;
  }

  const parts: any[] = [{ text: stagePrompt }];

  if (referenceImageBase64) {
    const cleanBase64 = referenceImageBase64.replace(/^data:image\/\w+;base64,/, "");
    parts.unshift({
      inlineData: {
        data: cleanBase64,
        mimeType: 'image/png'
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: { parts },
      config: {
        imageConfig: {
          aspectRatio: "9:16"
        }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        const base64Data = part.inlineData.data;
        return {
          url: `data:image/png;base64,${base64Data}`,
          base64: base64Data
        };
      }
    }

    throw new Error("No image data returned from API");
  } catch (error: any) {
    console.error("Gemini Image Generation Error:", error);
    throw new Error(error.message || "Failed to generate image");
  }
};
