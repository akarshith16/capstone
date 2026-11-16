import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, LocateFixed, CheckCircle, X, Sparkles, UserCheck, ShieldCheck, HelpCircle } from 'lucide-react';
import { useAgentPipeline } from '../context/AgentPipelineContext';
import { MADRID_DISTRICTS } from '../data/mockData';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY || '');

const MADRID_LANDMARK_COORDS: Record<string, [number, number]> = {
  'plaza mayor': [40.4154, -3.7074],
  'puerta del sol': [40.4168, -3.7038],
  'gran via': [40.4203, -3.7058],
  'malasaña': [40.4262, -3.7042],
  'calle de la palma': [40.4270, -3.7045],
  'calle del pez': [40.4235, -3.7061],
  'chueca': [40.4223, -3.6990],
  'plaza del carmen': [40.4190, -3.7031],
  'plaza de españa': [40.4233, -3.7122],
  'bernabeu': [40.4530, -3.6883],
  'santiago bernabeu': [40.4530, -3.6883],
  'retiro': [40.4152, -3.6845],
  'calle serrano': [40.4285, -3.6872],
  'calle velazquez': [40.4290, -3.6840],
  'moncloa': [40.4354, -3.7196],
  'argüelles': [40.4300, -3.7153],
  'cuatro caminos': [40.4504, -3.7039],
  'la latina': [40.4112, -3.7095],
  'valdebebas': [40.4900, -3.6100],
  'casa de campo': [40.4196, -3.7431],
};

const ChulapoChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { submitReport, citizenFeedback, setCitizenFeedback, intakeMode, setIntakeMode } = useAgentPipeline();

  React.useEffect(() => {
    if (citizenFeedback) {
      setIsOpen(true);
    }
  }, [citizenFeedback]);

  const resolveCoordinates = (text: string, districtName: string): [number, number] => {
    const lower = text.toLowerCase();
    for (const [landmark, coords] of Object.entries(MADRID_LANDMARK_COORDS)) {
      if (lower.includes(landmark)) {
        return coords;
      }
    }
    const matchedDistrict = MADRID_DISTRICTS.find(
      (d) => d.name.toLowerCase() === districtName.toLowerCase()
    );
    return matchedDistrict ? matchedDistrict.coords : [40.418, -3.704];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportText.trim()) return;

    setIsSubmitting(true);

    let parsed = {
      location: 'Centro, Madrid',
      district: 'Centro',
      coordinates: [40.418, -3.7045] as [number, number],
      category: 'Nightlife Disturbance',
    };

    try {
      if (import.meta.env.VITE_GEMINI_API_KEY) {
        const model = genAI.getGenerativeModel({
          model: 'gemini-1.5-flash',
          generationConfig: { responseMimeType: 'application/json' },
        });

        const prompt = `You are the Madrid municipal noise assistant 'Chulapo Calma'.
Extract structured operational entities from this citizen noise report.
Text: "${reportText}"

Schema:
{
  "district": "string (One of: Centro, Salamanca, Chamberí, Retiro, Chamartín, Tetuán, Arganzuela, Fuencarral-El Pardo, Moncloa-Aravaca, Latina, Carabanchel, Usera, Puente de Vallecas, Moratalaz, Ciudad Lineal, Hortaleza, Villaverde, Villa de Vallecas, Vicálvaro, San Blas-Canillejas, Barajas)",
  "location": "string (Street name, landmark, or square mentioned)",
  "category": "string (One of: Terrace Ordinance, Nightlife Disturbance, Construction Noise, Traffic/Vehicles, Private Party)"
}
Return ONLY valid JSON. Adhere strictly to Madrid municipal zoning nomenclature.`;

        const result = await model.generateContent(prompt);
        let jsonText = result.response.text();
        jsonText = jsonText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const data = JSON.parse(jsonText);

        parsed.district = data.district || 'Centro';
        parsed.location = data.location || `${parsed.district}, Madrid`;
        parsed.category = data.category || 'Nightlife Disturbance';
        parsed.coordinates = resolveCoordinates(reportText + ' ' + parsed.location, parsed.district);
      } else {
        parsed.coordinates = resolveCoordinates(reportText, 'Centro');
      }
    } catch (error) {
      console.error('Gemini NLP structured extraction fallback:', error);
      parsed.coordinates = resolveCoordinates(reportText, 'Centro');
    }

    setTimeout(() => {
      submitReport(
        reportText,
        parsed.location,
        parsed.coordinates,
        parsed.district,
        parsed.category
      );
      setReportText('');
      setIsSubmitting(false);
    }, 1500);
  };

  return (
    <div className="flex flex-col items-end">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="mb-4 w-[460px] bg-surface/90 backdrop-blur-2xl rounded-3xl border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.6)] overflow-hidden"
          >
            {/* Chat Header */}
            <div className="flex justify-between items-center p-5 bg-gradient-to-r from-primary/15 via-surfaceHighlight to-transparent border-b border-white/10">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
                    <Bot className="text-white w-5 h-5" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-secondary border border-surfaceHighlight"></span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-white font-bold text-sm tracking-wide">Chulapo Calma</h3>
                    <span className="px-1.5 py-0.5 text-[9px] font-mono font-bold uppercase rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      [REAL NLP]
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 font-medium tracking-wide flex items-center mt-0.5">
                    <Sparkles className="w-3 h-3 mr-1 text-primary" /> Gemini 1.5 Flash Structured Intake
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (!isSubmitting) setIsOpen(false);
                  setCitizenFeedback(null);
                }}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-5 space-y-4">
              {/* Intake Mode Selector (Anonymous vs. Cl@ve) */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setIntakeMode('anonymous')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                    intakeMode === 'anonymous'
                      ? 'bg-primary/20 text-primary border border-primary/30 shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Anonymous (Fast Triage)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIntakeMode('formal_denuncia')}
                  className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                    intakeMode === 'formal_denuncia'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shadow-sm'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Formal Report (Cl@ve ID)</span>
                </button>
              </div>

              {/* Mode Explanatory Pill */}
              <div className="text-[10px] text-gray-400 bg-white/5 rounded-xl px-3 py-2 border border-white/5 flex items-start space-x-2">
                <UserCheck className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <p>
                  {intakeMode === 'anonymous'
                    ? 'Anonymous Mode: Protects citizen privacy for operational triage and SIVCA sensor heatmaps.'
                    : 'Formal Mode: Enables Cl@ve authentication (Law 39/2015) for official municipal sanction proceedings under OPCAT.'}
                </p>
              </div>

              {/* Welcome Prompt */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/5 inline-block rounded-tl-sm w-full">
                <p className="text-xs text-gray-200 leading-relaxed">
                  Hello. Describe the noise disturbance (street, venue, or terrace). The system will cross-reference
                  Madrid's SIVCA sensor network to evaluate zonal acoustic context.
                </p>
              </div>

              {/* Feedback Loop Alert */}
              {citizenFeedback && (
                <div className="bg-primary/20 rounded-2xl p-4 border border-primary/30 inline-block rounded-tl-sm shadow-[0_0_15px_rgba(59,130,246,0.2)] w-full">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-gray-200 leading-relaxed font-medium">{citizenFeedback}</p>
                  </div>
                </div>
              )}

              {/* Form Input */}
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <textarea
                    value={reportText}
                    onChange={(e) => setReportText(e.target.value)}
                    placeholder="E.g., 'Bar with loud music and terrace on Calle de la Palma 14 exceeding closing hours...'"
                    className="w-full bg-black/50 border border-white/10 rounded-2xl p-3.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 min-h-[110px] resize-none custom-scrollbar transition-all"
                    disabled={isSubmitting}
                  />
                  <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
                    <button
                      type="button"
                      title="Use current location"
                      onClick={() => setReportText((prev) => (prev ? prev + ' (Plaza del Dos de Mayo, Centro)' : 'Plaza del Dos de Mayo, Centro'))}
                      className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-full transition-colors"
                    >
                      <LocateFixed className="w-4 h-4" />
                    </button>
                    {!isSubmitting && (
                      <button
                        type="submit"
                        disabled={!reportText.trim()}
                        className="flex items-center space-x-1.5 bg-white text-black hover:bg-gray-200 disabled:opacity-40 disabled:hover:bg-white px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-lg"
                      >
                        <span>Send</span>
                        <Send className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Submitting Spinner */}
                {isSubmitting && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2 border-t border-white/5 flex items-center justify-center py-2"
                  >
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-primary border-r-2 border-r-transparent mr-2"></div>
                    <p className="text-[11px] text-gray-400 font-medium tracking-wide">
                      Extracting entities with Gemini NLP and querying SIVCA network...
                    </p>
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-blue-700 shadow-[0_10px_30px_rgba(59,130,246,0.4)] border border-white/20 text-white"
        >
          <Bot className="w-7 h-7" />
        </motion.button>
      )}
    </div>
  );
};

export default ChulapoChat;
