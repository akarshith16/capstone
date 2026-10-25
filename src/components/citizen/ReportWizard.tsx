import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ArrowRight, Send, MapPin, Pencil, Check } from 'lucide-react';
import { useAgentPipeline } from '../../context/AgentPipelineContext';
import { nearestDistrict } from '../../data/mockData';
import { NOISE_CATEGORIES, getNoiseCategory } from './noiseCategories';
import LocationPicker from './LocationPicker';
import { MADRID_CENTER, isInMadrid } from './constants';

const STEP_TITLES = ['What kind of noise?', 'Where is it coming from?', 'Tell us a bit more', 'Check and send'];

const RESIDENT_REPORTER = 'Resident (ViaCiudad app)';

interface ChoiceProps {
  label: string;
  selected: boolean;
  onSelect: () => void;
}

const Choice: React.FC<ChoiceProps> = ({ label, selected, onSelect }) => (
  <button
    type="button"
    role="radio"
    aria-checked={selected}
    onClick={onSelect}
    className={`flex-1 min-h-12 px-4 rounded-2xl border text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
      selected ? 'bg-primary/15 border-primary text-white' : 'bg-surface border-white/10 text-gray-300 hover:border-white/25'
    }`}
  >
    {label}
  </button>
);

interface ReportWizardProps {
  onCancel: () => void;
  onSubmitted: (reportId: string) => void;
}

const ReportWizard: React.FC<ReportWizardProps> = ({ onCancel, onSubmitted }) => {
  const { submitReport } = useAgentPipeline();

  const [step, setStep] = useState(0);
  const [category, setCategory] = useState<string | null>(null);
  const [position, setPosition] = useState<[number, number]>(MADRID_CENTER);
  const [hasPlacedPin, setHasPlacedPin] = useState(false);
  const [street, setStreet] = useState('');
  const [isOngoing, setIsOngoing] = useState<boolean | null>(null);
  const [isRecurring, setIsRecurring] = useState<boolean | null>(null);
  const [details, setDetails] = useState('');

  const district = nearestDistrict(position);
  const pinInMadrid = isInMadrid(position);

  const canContinue = [
    category !== null,
    hasPlacedPin && pinInMadrid,
    isOngoing !== null,
    true,
  ][step];

  const movePin = (pos: [number, number]) => {
    setPosition(pos);
    setHasPlacedPin(true);
  };

  const goBack = () => (step === 0 ? onCancel() : setStep(step - 1));

  const handleSubmit = () => {
    if (!category || isOngoing === null) return;
    const notes = [
      isOngoing ? 'Happening now.' : 'Already stopped.',
      isRecurring ? 'Recurring problem.' : null,
    ].filter(Boolean).join(' ');
    const description = `${details.trim() || getNoiseCategory(category).summary} ${notes}`;
    const reportId = submitReport(description, street.trim() || 'Pinned on map', position, district, category, RESIDENT_REPORTER);
    onSubmitted(reportId);
  };

  const selectedCategory = category ? getNoiseCategory(category) : null;

  return (
    <div className="flex flex-col min-h-[calc(100dvh-4.5rem)]">
      {/* Progress */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={goBack}
          aria-label={step === 0 ? 'Cancel report' : 'Previous step'}
          className="-ml-2 p-2 min-w-11 min-h-11 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-400 mb-1.5">Step {step + 1} of {STEP_TITLES.length}</p>
          <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full bg-primary rounded-full"
              animate={{ width: `${((step + 1) / STEP_TITLES.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.18 }}
          className="flex-1"
        >
          <h2 className="text-2xl font-bold tracking-tight mb-5">{STEP_TITLES[step]}</h2>

          {step === 0 && (
            <div role="radiogroup" aria-label="Type of noise" className="space-y-3">
              {NOISE_CATEGORIES.map(c => {
                const selected = category === c.value;
                return (
                  <button
                    key={c.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => setCategory(c.value)}
                    className={`w-full flex items-center gap-4 p-4 rounded-2xl border text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                      selected ? 'bg-primary/15 border-primary' : 'bg-surface border-white/10 hover:border-white/25'
                    }`}
                  >
                    <span className={`p-2.5 rounded-xl border ${selected ? 'bg-primary text-white border-primary' : 'bg-white/5 text-gray-300 border-white/10'}`}>
                      <c.icon className="w-5 h-5" />
                    </span>
                    <span className="flex-1 min-w-0">
                      <span className="block font-semibold">{c.label}</span>
                      <span className="block text-sm text-gray-400">{c.hint}</span>
                    </span>
                    {selected && <Check className="w-5 h-5 text-primary shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}

          {step === 1 && (
            <div className="space-y-5">
              <LocationPicker position={position} onChange={movePin} />
              <p className="text-sm text-gray-400 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 shrink-0" />
                {!hasPlacedPin
                  ? 'Tap the map, drag the pin, or use your location.'
                  : pinInMadrid
                    ? <>Pin placed in <span className="text-white font-medium">{district}</span></>
                    : <span className="text-accent">That spot is outside Madrid. Move the pin into the city.</span>}
              </p>
              <div>
                <label htmlFor="street" className="block text-sm font-semibold mb-2">
                  Street or landmark <span className="font-normal text-gray-500">(optional)</span>
                </label>
                <input
                  id="street"
                  value={street}
                  onChange={e => setStreet(e.target.value)}
                  placeholder="e.g. Calle de la Cava Baja 12"
                  autoComplete="street-address"
                  className="w-full min-h-12 bg-surface border border-white/10 rounded-2xl px-4 text-base text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <fieldset>
                <legend className="text-sm font-semibold mb-2">Is it happening right now?</legend>
                <div role="radiogroup" className="flex gap-3">
                  <Choice label="Yes, right now" selected={isOngoing === true} onSelect={() => setIsOngoing(true)} />
                  <Choice label="No, it stopped" selected={isOngoing === false} onSelect={() => setIsOngoing(false)} />
                </div>
              </fieldset>
              <fieldset>
                <legend className="text-sm font-semibold mb-2">
                  Has this happened before? <span className="font-normal text-gray-500">(optional)</span>
                </legend>
                <div role="radiogroup" className="flex gap-3">
                  <Choice label="Yes, often" selected={isRecurring === true} onSelect={() => setIsRecurring(true)} />
                  <Choice label="First time" selected={isRecurring === false} onSelect={() => setIsRecurring(false)} />
                </div>
              </fieldset>
              <div>
                <label htmlFor="details" className="block text-sm font-semibold mb-2">
                  Anything else we should know? <span className="font-normal text-gray-500">(optional)</span>
                </label>
                <textarea
                  id="details"
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  rows={4}
                  maxLength={500}
                  placeholder="e.g. Music from the 3rd floor terrace since 1 AM, it gets louder every weekend."
                  className="w-full bg-surface border border-white/10 rounded-2xl p-4 text-base text-white placeholder-gray-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary resize-none"
                />
              </div>
            </div>
          )}

          {step === 3 && selectedCategory && (
            <div className="space-y-3">
              {[
                { label: 'Type', value: selectedCategory.label, step: 0 },
                { label: 'Location', value: `${street.trim() || 'Pinned on map'}, ${district}`, step: 1 },
                {
                  label: 'Details',
                  value: [
                    isOngoing ? 'Happening now' : 'Already stopped',
                    isRecurring === true ? 'happens often' : isRecurring === false ? 'first time' : null,
                  ].filter(Boolean).join(', ') + (details.trim() ? ` · "${details.trim()}"` : ''),
                  step: 2,
                },
              ].map(row => (
                <div key={row.label} className="flex items-start gap-3 p-4 rounded-2xl bg-surface border border-white/10">
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-500 mb-0.5">{row.label}</p>
                    <p className="text-white break-words">{row.value}</p>
                  </div>
                  <button
                    onClick={() => setStep(row.step)}
                    aria-label={`Edit ${row.label.toLowerCase()}`}
                    className="p-2 -m-1 min-w-11 min-h-11 flex items-center justify-center rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <p className="text-sm text-gray-400 leading-relaxed pt-2">
                Your report is anonymous. The pinned location is shared with municipal inspectors so they can find the source.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Sticky action */}
      <div className="sticky bottom-0 -mx-4 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] mt-8 bg-gradient-to-t from-background via-background to-background/0">
        {step < STEP_TITLES.length - 1 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canContinue}
            className="w-full flex items-center justify-center gap-2 min-h-14 rounded-2xl bg-primary text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-blue-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="w-full flex items-center justify-center gap-2 min-h-14 rounded-2xl bg-primary text-white font-bold hover:bg-blue-500 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            Send report <Send className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default ReportWizard;
