import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield,
  Volume2,
  ArrowLeft,
  Music,
  UtensilsCrossed,
  PartyPopper,
  HardHat,
  Car,
  LocateFixed,
  MapPin,
  CheckCircle2,
  Camera,
  Mic,
  Square,
  Play,
  Pause,
  Sparkles,
  ChevronRight,
  UserCheck,
  HelpCircle,
  ExternalLink,
  X,
  FileText,
  VolumeX,
} from 'lucide-react';
import { useAgentPipeline } from '../context/AgentPipelineContext';
import {
  analyzeEvidencePhoto,
  analyzeEvidenceAudio,
  type PhotoAnalysisResult,
  type AudioAnalysisResult,
} from '../services/geminiMultimodal';
import { MADRID_DISTRICTS, type Incident } from '../data/mockData';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom Pin Icon for the interactive Citizen Map
const citizenPinIcon = L.divIcon({
  html: `
    <div class="relative flex items-center justify-center">
      <div class="absolute w-8 h-8 rounded-full bg-blue-500/30 animate-ping"></div>
      <div class="relative w-7 h-7 rounded-full bg-blue-600 border-2 border-white shadow-xl flex items-center justify-center">
        <div class="w-2.5 h-2.5 rounded-full bg-white"></div>
      </div>
    </div>
  `,
  className: 'bg-transparent',
  iconSize: [28, 28],
  iconAnchor: [14, 14],
});

// Map Click Listener component for picking coordinates
const MapLocationPicker: React.FC<{
  position: [number, number];
  onSelect: (coords: [number, number]) => void;
}> = ({ position, onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect([e.latlng.lat, e.latlng.lng]);
    },
  });

  return <Marker position={position} icon={citizenPinIcon} />;
};

// Preset SVG Visuals for instant 1-click photo evidence testing
const SAMPLE_PHOTO_PRESETS = [
  {
    id: 'terrace',
    label: 'Cava Baja Terrace Spillover',
    category: 'Terrace',
    location: 'Calle de la Cava Baja 12, Centro',
    coords: [40.4124, -3.7093] as [number, number],
    district: 'Centro',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%230f172a"/><rect y="260" width="600" height="140" fill="%231e293b"/><circle cx="120" cy="80" r="40" fill="%23f59e0b" opacity="0.15"/><rect x="80" y="240" width="80" height="60" rx="6" fill="%23b45309"/><rect x="220" y="240" width="80" height="60" rx="6" fill="%23b45309"/><rect x="360" y="240" width="80" height="60" rx="6" fill="%23b45309"/><circle cx="110" cy="220" r="16" fill="%23e2e8f0"/><circle cx="150" cy="220" r="16" fill="%23cbd5e1"/><circle cx="250" cy="220" r="16" fill="%23e2e8f0"/><circle cx="290" cy="220" r="16" fill="%23cbd5e1"/><circle cx="390" cy="220" r="16" fill="%23e2e8f0"/><circle cx="430" cy="220" r="16" fill="%23cbd5e1"/><rect x="40" y="140" width="20" height="30" fill="%2338bdf8" rx="3"/><text x="300" y="360" fill="%2394a3b8" font-family="sans-serif" font-size="14" text-anchor="middle">Calle de la Cava Baja — Late Night Terrace Crowding</text></svg>',
  },
  {
    id: 'club',
    label: 'Malasaña Nightclub Entrance',
    category: 'Bar, club or venue',
    location: 'Calle de la Palma 14, Centro',
    coords: [40.427, -3.7045] as [number, number],
    district: 'Centro',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%230b0f19"/><rect x="180" y="100" width="240" height="260" fill="%231e1b4b" stroke="%23818cf8" stroke-width="3"/><rect x="220" y="160" width="160" height="200" fill="%234338ca"/><circle cx="300" cy="80" r="60" fill="%23a855f7" opacity="0.3"/><circle cx="160" cy="280" r="15" fill="%23f43f5e"/><circle cx="130" cy="285" r="15" fill="%23cbd5e1"/><circle cx="100" cy="290" r="15" fill="%2394a3b8"/><circle cx="440" cy="280" r="15" fill="%23e2e8f0"/><circle cx="470" cy="285" r="15" fill="%23cbd5e1"/><text x="300" y="140" fill="%23e0e7ff" font-family="sans-serif" font-size="16" font-weight="bold" text-anchor="middle">BAR CLUB DISCOTECA</text><text x="300" y="385" fill="%2394a3b8" font-family="sans-serif" font-size="14" text-anchor="middle">Calle de la Palma — Club Queue & Bass Leakage</text></svg>',
  },
  {
    id: 'works',
    label: 'Night Roadwork Jackhammer',
    category: 'Construction or works',
    location: 'Calle de Santa Engracia 30, Chamberí',
    coords: [40.432, -3.698] as [number, number],
    district: 'Chamberí',
    dataUrl:
      'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%2318181b"/><rect y="240" width="600" height="160" fill="%2327272a"/><rect x="150" y="220" width="300" height="30" fill="%23eab308"/><rect x="150" y="220" width="30" height="30" fill="%23000"/><rect x="210" y="220" width="30" height="30" fill="%23000"/><rect x="270" y="220" width="30" height="30" fill="%23000"/><rect x="330" y="220" width="30" height="30" fill="%23000"/><rect x="390" y="220" width="30" height="30" fill="%23000"/><circle cx="300" cy="180" r="18" fill="%23eab308"/><rect x="294" y="198" width="12" height="50" fill="%23f97316"/><rect x="290" y="248" width="20" height="40" fill="%2394a3b8"/><text x="300" y="360" fill="%23a1a1aa" font-family="sans-serif" font-size="14" text-anchor="middle">Calle de Santa Engracia — Demolition Machinery at 03:00</text></svg>',
  },
];

const CitizenPortal: React.FC = () => {
  const {
    incidents,
    submitReport,
    setCurrentAppView,
    setActiveIncident,
    intakeMode,
    setIntakeMode,
  } = useAgentPipeline();

  // Navigation state: 0 = Landing ("Is noise keeping you up?"), 1-4 = Wizard Steps, 5 = Submission Success
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [selectedReportDetail, setSelectedReportDetail] = useState<Incident | null>(null);

  // Form inputs
  const [category, setCategory] = useState<string>('Bar, club or venue');
  const [locationText, setLocationText] = useState<string>('Calle de la Cava Baja 12');
  const [district, setDistrict] = useState<string>('Centro');
  const [coordinates, setCoordinates] = useState<[number, number]>([40.4124, -3.7093]);
  const [isCurrent, setIsCurrent] = useState<boolean>(true);
  const [isRecurring, setIsRecurring] = useState<boolean>(true);
  const [additionalNotes, setAdditionalNotes] = useState<string>('');

  // Multimodal Gemini Photo state
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoAnalysis, setPhotoAnalysis] = useState<PhotoAnalysisResult | null>(null);
  const [isAnalyzingPhoto, setIsAnalyzingPhoto] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Multimodal Gemini Audio / Voice state
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioAnalysis, setAudioAnalysis] = useState<AudioAnalysisResult | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [isAnalyzingAudio, setIsAnalyzingAudio] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioElementRef = useRef<HTMLAudioElement | null>(null);

  // Submission tracking
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);

  // Audio timer
  useEffect(() => {
    let interval: any = null;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Reverse match district when coordinates change
  const handleMapLocationSelect = (newCoords: [number, number]) => {
    setCoordinates(newCoords);
    // Find closest Madrid district center
    let bestDist = Infinity;
    let bestDistrict = 'Centro';
    MADRID_DISTRICTS.forEach((d) => {
      const dist =
        Math.pow(d.coords[0] - newCoords[0], 2) + Math.pow(d.coords[1] - newCoords[1], 2);
      if (dist < bestDist) {
        bestDist = dist;
        bestDistrict = d.name;
      }
    });
    setDistrict(bestDistrict);
    if (!locationText.includes(bestDistrict)) {
      setLocationText(`Location near ${bestDistrict}, Madrid`);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
          handleMapLocationSelect(coords);
          setLocationText('Current GPS Location, Madrid');
        },
        () => {
          // Fallback to Puerta del Sol center
          handleMapLocationSelect([40.4168, -3.7038]);
          setLocationText('Puerta del Sol, Centro');
        }
      );
    } else {
      handleMapLocationSelect([40.4168, -3.7038]);
      setLocationText('Puerta del Sol, Centro');
    }
  };

  // Photo handlers
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      setPhotoUrl(dataUrl);
      setIsAnalyzingPhoto(true);

      const analysis = await analyzeEvidencePhoto(
        dataUrl,
        file.type,
        category,
        locationText
      );
      setPhotoAnalysis(analysis);
      setIsAnalyzingPhoto(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPhotoPreset = async (preset: (typeof SAMPLE_PHOTO_PRESETS)[0]) => {
    setPhotoUrl(preset.dataUrl);
    setCategory(preset.category);
    setLocationText(preset.location);
    setDistrict(preset.district);
    setCoordinates(preset.coords);
    setIsAnalyzingPhoto(true);

    const analysis = await analyzeEvidencePhoto(
      preset.dataUrl,
      'image/svg+xml',
      preset.category,
      preset.location
    );
    setPhotoAnalysis(analysis);
    setIsAnalyzingPhoto(false);
  };

  // Voice recording handlers
  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setIsAnalyzingAudio(true);

        const sampleText = additionalNotes
          ? `${additionalNotes}. Excessive noise audible from street.`
          : `Excessive loud noise from ${category.toLowerCase()} audible inside apartment bedrooms on ${locationText}.`;

        const analysis = await analyzeEvidenceAudio(sampleText, category, locationText);
        setAudioAnalysis(analysis);
        setIsAnalyzingAudio(false);

        // stop all microphone tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      // If microphone access is denied or unavailable, use sample audio
      handleUseSampleAudio();
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUseSampleAudio = async () => {
    setIsAnalyzingAudio(true);
    // Create an audio oscillator synthetic tone for playback
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65, audioCtx.currentTime); // 65 Hz bass drone
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
    } catch {
      // AudioContext unavailable
    }

    setAudioUrl('sample_audio_clip');
    const statement = `Loud amplified music with vibrating subwoofers from ${locationText} rattling our windows since 1:00 AM.`;
    const analysis = await analyzeEvidenceAudio(statement, category, locationText);
    setAudioAnalysis(analysis);
    setIsAnalyzingAudio(false);
  };

  const togglePlayAudio = () => {
    if (audioElementRef.current) {
      if (isPlayingAudio) {
        audioElementRef.current.pause();
        setIsPlayingAudio(false);
      } else {
        audioElementRef.current.play();
        setIsPlayingAudio(true);
      }
    } else {
      setIsPlayingAudio(!isPlayingAudio);
      setTimeout(() => setIsPlayingAudio(false), 4000);
    }
  };

  // Submit report to multi-agent pipeline
  const handleSubmitReport = () => {
    setIsSubmitting(true);

    const fullDescription = additionalNotes
      ? `${additionalNotes} [Location: ${locationText}, Category: ${category}]`
      : `Citizen noise report concerning ${category.toLowerCase()} at ${locationText}. Active disturbance: ${
          isCurrent ? 'Yes' : 'No'
        }. Recurrent: ${isRecurring ? 'Yes' : 'No'}.`;

    setTimeout(() => {
      const newId = submitReport(
        fullDescription,
        locationText,
        coordinates,
        district,
        category,
        {
          photoUrl: photoUrl || undefined,
          photoAnalysis: photoAnalysis || undefined,
          audioUrl: audioUrl || undefined,
          audioAnalysis: audioAnalysis || undefined,
          isCurrent,
          isRecurring,
        }
      );

      setSubmittedTicketId(newId);
      setIsSubmitting(false);
      setCurrentStep(5); // Show success & pipeline tracking screen
    }, 1200);
  };

  // User's submitted reports list
  const citizenReports = incidents.filter(
    (i) => i.reporter.includes('(You') || i.reporter.includes('Citizen (You')
  );

  return (
    <div className="min-h-screen bg-[#070b14] text-white flex flex-col items-center justify-start p-4 sm:p-6 font-sans">
      {/* Top Universal App Navigation Bar */}
      <header className="w-full max-w-xl flex items-center justify-between py-3 mb-4 border-b border-white/10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shadow-[0_0_15px_rgba(37,99,235,0.3)]">
            <Shield className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">
              ViaCiudad
            </h1>
            <p className="text-[11px] text-gray-400 font-medium">Madrid noise reports</p>
          </div>
        </div>

        {/* Perspective Switcher Button to Municipal Command Center */}
        <button
          type="button"
          onClick={() => setCurrentAppView('command_center')}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-bold transition-all shadow-sm"
        >
          <span>Command Center</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </header>

      {/* Prototype Version Banner matching user screenshot */}
      <div className="w-full max-w-xl mb-5">
        <div className="bg-[#19150d] border border-[#3e2e12] rounded-xl px-4 py-2.5 flex items-center justify-between text-xs text-amber-200/90 font-medium shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-amber-400">►</span>
            <span>Prototype, version of 15 Nov 2026</span>
          </div>
          <span className="text-[10px] font-mono text-amber-400/80 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
            SIVCA Open Data
          </span>
        </div>
      </div>

      {/* Main Container */}
      <main className="w-full max-w-xl flex-1 flex flex-col">
        <AnimatePresence mode="wait">
          {/* ========================================================================= */}
          {/* VIEW 0: LANDING SCREEN (Matching Screenshot 1: media_1795357620655_21e34c19) */}
          {/* ========================================================================= */}
          {currentStep === 0 && (
            <motion.div
              key="landing"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-6"
            >
              {/* Hero Card */}
              <div className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

                {/* Speaker Icon Pill */}
                <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-600/30">
                  <Volume2 className="w-6 h-6" />
                </div>

                {/* Heading */}
                <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-3">
                  Is noise keeping you up?
                </h2>

                {/* Description */}
                <p className="text-gray-300 text-sm leading-relaxed mb-6 font-normal">
                  Tell us where it's coming from. We add the area's data from the city's noise
                  stations and pass it to the team that can act. An officer reviews every report.
                </p>

                {/* White CTA Button */}
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-gray-100 text-slate-900 font-extrabold text-base transition-all shadow-xl active:scale-[0.99] flex items-center justify-center space-x-2"
                >
                  <span>Report noise</span>
                </button>

                <p className="text-center text-xs text-gray-400 mt-3 font-medium">
                  Takes about a minute. No account needed.
                </p>
              </div>

              {/* Your Reports Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-white tracking-tight">Your reports</h3>
                  <span className="text-xs text-gray-400 font-medium font-mono">
                    {citizenReports.length} recorded
                  </span>
                </div>

                <div className="space-y-2.5">
                  {citizenReports.map((report) => (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReportDetail(report)}
                      className="bg-[#0f172a] hover:bg-[#152037] border border-[#1e293b] hover:border-blue-500/40 rounded-2xl p-4 flex items-center justify-between cursor-pointer transition-all group"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-10 h-10 rounded-xl bg-black/40 border border-white/5 flex items-center justify-center text-blue-400">
                          {report.category.includes('Bar') || report.category.includes('club') ? (
                            <Music className="w-5 h-5 text-blue-400" />
                          ) : report.category.includes('Terrace') ? (
                            <UtensilsCrossed className="w-5 h-5 text-amber-400" />
                          ) : report.category.includes('Neighbor') || report.category.includes('party') ? (
                            <PartyPopper className="w-5 h-5 text-purple-400" />
                          ) : report.category.includes('Construction') ? (
                            <HardHat className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Car className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                            {report.category}
                          </h4>
                          <p className="text-xs text-gray-400">
                            {report.district} · {new Date(report.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
                          {report.status === 'Resolved'
                            ? 'Resolved'
                            : report.officerReview
                            ? 'Officer Reviewed'
                            : 'Waiting for review'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* STEP 1 OF 4: WHAT KIND OF NOISE? (Screenshot 2: media_1795357629721_399733f3) */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Stepper Header */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(0)}
                  className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Step 1 of 4</span>
                </button>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-1/4 rounded-full transition-all duration-300"></div>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight pt-2">
                  What kind of noise?
                </h2>
              </div>

              {/* Category Options */}
              <div className="space-y-3">
                {[
                  {
                    id: 'Bar, club or venue',
                    title: 'Bar, club or venue',
                    desc: 'Loud music, crowds at the door',
                    icon: Music,
                  },
                  {
                    id: 'Terrace',
                    title: 'Terrace',
                    desc: 'Outdoor seating too loud or open late',
                    icon: UtensilsCrossed,
                  },
                  {
                    id: 'Neighbor or party',
                    title: 'Neighbor or party',
                    desc: 'A flat, rooftop or private gathering',
                    icon: PartyPopper,
                  },
                  {
                    id: 'Construction or works',
                    title: 'Construction or works',
                    desc: 'Drilling, machinery, roadworks',
                    icon: HardHat,
                  },
                  {
                    id: 'Traffic',
                    title: 'Traffic',
                    desc: 'Horns, engines, motorbikes',
                    icon: Car,
                  },
                ].map((item) => {
                  const isSelected = category === item.id;
                  const Icon = item.icon;
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        setCategory(item.id);
                        setTimeout(() => setCurrentStep(2), 250);
                      }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center space-x-4 ${
                        isSelected
                          ? 'bg-blue-600/15 border-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]'
                          : 'bg-[#0f172a] border-[#1e293b] hover:border-gray-600 hover:bg-[#131d33]'
                      }`}
                    >
                      <div
                        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-black/40 border border-white/5 text-gray-300'
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white">{item.title}</h4>
                        <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(2)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all"
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2 OF 4: WHERE IS IT COMING FROM? (Screenshot 3: media_1795357639569_ed118b47) */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-5"
            >
              {/* Stepper Header */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Step 2 of 4</span>
                </button>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-2/4 rounded-full transition-all duration-300"></div>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight pt-2">
                  Where is it coming from?
                </h2>
              </div>

              {/* Use My Current Location Button */}
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="w-full py-3 px-4 rounded-xl border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 text-xs font-bold flex items-center justify-center space-x-2 transition-all shadow-sm"
              >
                <LocateFixed className="w-4 h-4" />
                <span>Use my current location</span>
              </button>

              {/* Interactive Madrid Map */}
              <div className="rounded-2xl overflow-hidden border border-white/10 h-64 relative bg-[#0b0f19] shadow-lg">
                <MapContainer
                  center={coordinates}
                  zoom={14}
                  style={{ height: '100%', width: '100%' }}
                  zoomControl={false}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapLocationPicker
                    position={coordinates}
                    onSelect={handleMapLocationSelect}
                  />
                </MapContainer>
                <div className="absolute bottom-2 left-2 right-2 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 text-[11px] text-gray-300 flex items-center justify-between pointer-events-none">
                  <span className="flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 mr-1.5" />
                    District: <strong>{district}</strong>
                  </span>
                  <span className="font-mono text-[10px] text-gray-400">
                    {coordinates[0].toFixed(4)}, {coordinates[1].toFixed(4)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-gray-400">
                Tap the map, drag the pin, or use your location.
              </p>

              {/* Street Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-300 block">
                  Street or landmark (optional)
                </label>
                <input
                  type="text"
                  value={locationText}
                  onChange={(e) => setLocationText(e.target.value)}
                  placeholder="e.g. Calle de la Cava Baja 12"
                  className="w-full bg-[#0f172a] border border-[#1e293b] focus:border-blue-500 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none transition-all"
                />
              </div>

              {/* Quick suggestions */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { name: 'Calle Cava Baja 12', coords: [40.4124, -3.7093] as [number, number], dist: 'Centro' },
                  { name: 'Calle de la Palma 14', coords: [40.427, -3.7045] as [number, number], dist: 'Centro' },
                  { name: 'Plaza Mayor', coords: [40.4154, -3.7074] as [number, number], dist: 'Centro' },
                  { name: 'Calle Serrano 42', coords: [40.4285, -3.6872] as [number, number], dist: 'Salamanca' },
                ].map((s) => (
                  <button
                    key={s.name}
                    type="button"
                    onClick={() => {
                      setLocationText(s.name);
                      setDistrict(s.dist);
                      setCoordinates(s.coords);
                    }}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5 transition-all"
                  >
                    {s.name}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(3)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all"
              >
                Continue
              </button>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3 OF 4: TELL US A BIT MORE (Screenshot 4: media_1795357660753_561d63df) */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Stepper Header */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Step 3 of 4</span>
                </button>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-3/4 rounded-full transition-all duration-300"></div>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight pt-2">
                  Tell us a bit more
                </h2>
              </div>

              {/* Question 1: Is it happening right now? */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-200 block">
                  Is it happening right now?
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCurrent(true)}
                    className={`py-3.5 px-4 rounded-xl text-sm font-bold border transition-all ${
                      isCurrent
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                        : 'bg-[#0f172a] text-gray-400 border-[#1e293b] hover:text-white'
                    }`}
                  >
                    Yes, right now
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCurrent(false)}
                    className={`py-3.5 px-4 rounded-xl text-sm font-bold border transition-all ${
                      !isCurrent
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                        : 'bg-[#0f172a] text-gray-400 border-[#1e293b] hover:text-white'
                    }`}
                  >
                    No, it stopped
                  </button>
                </div>
              </div>

              {/* Question 2: Has this happened before? */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-200 block">
                  Has this happened before? <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setIsRecurring(true)}
                    className={`py-3.5 px-4 rounded-xl text-sm font-bold border transition-all ${
                      isRecurring
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                        : 'bg-[#0f172a] text-gray-400 border-[#1e293b] hover:text-white'
                    }`}
                  >
                    Yes, often
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsRecurring(false)}
                    className={`py-3.5 px-4 rounded-xl text-sm font-bold border transition-all ${
                      !isRecurring
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                        : 'bg-[#0f172a] text-gray-400 border-[#1e293b] hover:text-white'
                    }`}
                  >
                    First time
                  </button>
                </div>
              </div>

              {/* Question 3: Anything else we should know? */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-200 block">
                  Anything else we should know? <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <textarea
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  placeholder="e.g. Music from the 3rd floor terrace since 1 AM, it gets louder every weekend."
                  rows={4}
                  className="w-full bg-[#0f172a] border border-[#1e293b] focus:border-blue-500 rounded-xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none resize-none transition-all"
                />
              </div>

              <button
                type="button"
                onClick={() => setCurrentStep(4)}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all"
              >
                Continue to Evidence & AI
              </button>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4 OF 4: EVIDENCE & GEMINI MULTIMODAL AI (NEW FEATURE REQUESTED!) */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Stepper Header */}
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center space-x-1.5 text-xs text-gray-400 hover:text-white transition-colors font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Step 4 of 4</span>
                </button>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full w-full rounded-full transition-all duration-300"></div>
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    Evidence & Multimodal AI
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    Gemini 1.5
                  </span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Attach an evidence photo and record a voice statement. Gemini multimodal AI
                  analyzes crowd density, outdoor speakers, and acoustic intensity.
                </p>
              </div>

              {/* 1. PHOTO EVIDENCE SECTION */}
              <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center">
                    <Camera className="w-4 h-4 mr-2 text-blue-400" />
                    <span>Photo Evidence</span>
                  </h3>
                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setPhotoUrl(null);
                        setPhotoAnalysis(null);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold"
                    >
                      Remove
                    </button>
                  )}
                </div>

                {photoUrl ? (
                  <div className="space-y-3">
                    <div className="relative rounded-xl overflow-hidden border border-white/10 max-h-48 bg-black flex items-center justify-center">
                      <img
                        src={photoUrl}
                        alt="Evidence"
                        className="w-full h-48 object-cover"
                      />
                      {isAnalyzingPhoto && (
                        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center space-y-2">
                          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                          <span className="text-xs font-mono text-blue-300 animate-pulse">
                            Gemini Vision scanning photo...
                          </span>
                        </div>
                      )}
                    </div>

                    {photoAnalysis && (
                      <div className="p-3 bg-blue-950/30 border border-blue-500/20 rounded-xl space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-300 flex items-center">
                            <Sparkles className="w-3.5 h-3.5 mr-1" />
                            Gemini Vision Findings
                          </span>
                          <span className="font-mono text-[10px] text-emerald-400 font-bold">
                            {photoAnalysis.confidence}% Conf.
                          </span>
                        </div>
                        <p className="text-gray-300 text-[11px] leading-relaxed">
                          {photoAnalysis.summary}
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {photoAnalysis.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-[9px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-bold"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <Camera className="w-4 h-4 text-blue-400" />
                        <span>Take / Upload Photo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSelectPhotoPreset(SAMPLE_PHOTO_PRESETS[0])}
                        className="py-3 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
                      >
                        <Sparkles className="w-4 h-4 text-blue-400" />
                        <span>Use Madrid Scene</span>
                      </button>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-gray-500 uppercase tracking-wider">
                        Presets for testing:
                      </span>
                      <div className="flex space-x-1">
                        {SAMPLE_PHOTO_PRESETS.map((p) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => handleSelectPhotoPreset(p)}
                            className="text-[10px] px-2 py-0.5 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/5"
                          >
                            {p.id}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. VOICE & ACOUSTIC RECORDING SECTION */}
              <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center">
                    <Mic className="w-4 h-4 mr-2 text-purple-400" />
                    <span>Voice Statement & Audio Footprint</span>
                  </h3>
                  {audioUrl && (
                    <button
                      type="button"
                      onClick={() => {
                        setAudioUrl(null);
                        setAudioAnalysis(null);
                      }}
                      className="text-xs text-red-400 hover:text-red-300 font-semibold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {isRecording ? (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-4 h-4 rounded-full bg-red-500 animate-ping"></div>
                      <span className="text-xs font-mono font-bold text-red-300">
                        Recording Noise: 00:{recordingSeconds < 10 ? `0${recordingSeconds}` : recordingSeconds} / 00:30
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={stopVoiceRecording}
                      className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center space-x-1"
                    >
                      <Square className="w-3.5 h-3.5 fill-current" />
                      <span>Stop</span>
                    </button>
                  </div>
                ) : audioUrl ? (
                  <div className="space-y-3">
                    <div className="p-3 bg-black/40 border border-white/10 rounded-xl flex items-center justify-between">
                      <button
                        type="button"
                        onClick={togglePlayAudio}
                        className="w-9 h-9 rounded-full bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center transition-all shadow-md"
                      >
                        {isPlayingAudio ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4 ml-0.5" />
                        )}
                      </button>
                      <div className="flex-1 mx-3 flex items-center space-x-1">
                        {[40, 70, 90, 60, 80, 50, 95, 85, 45, 65, 75, 55, 90, 60].map((h, i) => (
                          <div
                            key={i}
                            className={`flex-1 rounded-full transition-all ${
                              isPlayingAudio ? 'bg-purple-400 animate-pulse' : 'bg-gray-600'
                            }`}
                            style={{ height: `${h / 3}px` }}
                          ></div>
                        ))}
                      </div>
                      <span className="text-[11px] font-mono text-gray-400">Audio Clip</span>
                    </div>

                    {isAnalyzingAudio && (
                      <div className="p-3 bg-purple-950/20 border border-purple-500/20 rounded-xl flex items-center space-x-2 text-xs text-purple-300">
                        <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                        <span>Gemini Acoustic Engine analyzing sound frequency...</span>
                      </div>
                    )}

                    {audioAnalysis && !isAnalyzingAudio && (
                      <div className="p-3 bg-purple-950/30 border border-purple-500/20 rounded-xl space-y-1.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-purple-300 flex items-center">
                            <Sparkles className="w-3.5 h-3.5 mr-1" />
                            Acoustic & Voice Classification
                          </span>
                          <span className="font-mono text-[10px] text-amber-300 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            ~{audioAnalysis.estimatedDb} dBA Perceptual
                          </span>
                        </div>
                        <p className="text-gray-300 text-[11px] italic">
                          "{audioAnalysis.transcript}"
                        </p>
                        <p className="text-[10px] text-gray-400">
                          {audioAnalysis.acousticSummary}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={startVoiceRecording}
                      className="py-3 px-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all text-gray-200"
                    >
                      <Mic className="w-4 h-4 text-purple-400" />
                      <span>Record Audio (Mic)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleUseSampleAudio}
                      className="py-3 px-3 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center justify-center space-x-1.5 transition-all"
                    >
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>Use Sample Audio</span>
                    </button>
                  </div>
                )}
              </div>

              {/* 3. INTAKE IDENTITY MODE */}
              <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-4 space-y-3">
                <span className="text-xs font-bold text-gray-300 block">
                  Reporting Mode & Privacy
                </span>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setIntakeMode('anonymous')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      intakeMode === 'anonymous'
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/40 shadow-sm'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                    <span>Anonymous (Quick)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIntakeMode('formal_denuncia')}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5 transition-all ${
                      intakeMode === 'formal_denuncia'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                        : 'bg-white/5 text-gray-400 hover:text-white'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Cl@ve e-ID (Formal)</span>
                  </button>
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmitReport}
                className="w-full py-4 bg-white hover:bg-gray-100 text-slate-900 rounded-2xl font-black text-base transition-all shadow-xl disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    <span>Correlating with Madrid SIVCA Network...</span>
                  </>
                ) : (
                  <span>Submit Noise Report</span>
                )}
              </button>
            </motion.div>
          )}

          {/* ========================================================================= */}
          {/* VIEW 5: SUBMISSION CONFIRMATION & REAL-TIME MULTI-AGENT TRACKING */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-6"
            >
              {/* Success Badge */}
              <div className="bg-[#0f172a] border border-[#1e293b] rounded-3xl p-6 text-center space-y-3 relative overflow-hidden shadow-2xl">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight">
                  Report Submitted
                </h2>
                <p className="text-xs text-gray-400 max-w-sm mx-auto">
                  Your report has entered Madrid's municipal acoustic triage system.
                </p>
                <div className="inline-block px-3 py-1 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-300 font-mono text-xs font-bold">
                  Ref: {submittedTicketId || 'REQ-2026-LIVE'}
                </div>
              </div>

              {/* Multi-Agent Pipeline Stepper */}
              <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center">
                  <Sparkles className="w-4 h-4 mr-1.5 text-blue-400" />
                  <span>Multi-Agent Triage Progression</span>
                </h3>

                <div className="space-y-3">
                  {/* Step 1: Chulapo */}
                  <div className="flex items-start space-x-3 text-xs">
                    <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      ✓
                    </div>
                    <div>
                      <strong className="text-white">Chulapo Intake & Multimodal AI</strong>
                      <p className="text-gray-400 text-[11px]">
                        Structured entity extracted for {locationText} ({district}).
                        {photoAnalysis && ' Gemini Vision corroborated visual evidence.'}
                        {audioAnalysis && ' Gemini Audio estimated perceptual footprint.'}
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Sentinel */}
                  <div className="flex items-start space-x-3 text-xs">
                    <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      2
                    </div>
                    <div>
                      <strong className="text-white">Sentinel Verification</strong>
                      <p className="text-gray-400 text-[11px]">
                        Querying nearest SIVCA fixed stations (precision Haversine distance in meters)
                        and 20-min rolling duplicate clustering.
                      </p>
                    </div>
                  </div>

                  {/* Step 3: Decider */}
                  <div className="flex items-start space-x-3 text-xs">
                    <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      3
                    </div>
                    <div>
                      <strong className="text-white">Decider Asymmetric Scoring</strong>
                      <p className="text-gray-400 text-[11px]">
                        Evaluates context under Spain's Law 37/2003 & OPCAT. Sensor context raises priority, never lowers it.
                      </p>
                    </div>
                  </div>

                  {/* Step 4: Human Officer Sign-Off */}
                  <div className="flex items-start space-x-3 text-xs">
                    <div className="w-5 h-5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                      4
                    </div>
                    <div>
                      <strong className="text-white">Human Officer Review (EU AI Act Art. 14)</strong>
                      <p className="text-gray-400 text-[11px]">
                        A municipal officer reviews the evidence before dispatching units or issuing sanctions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => {
                    const ticket = incidents.find((i) => i.id === submittedTicketId);
                    if (ticket) {
                      setActiveIncident(ticket);
                    }
                    setCurrentAppView('command_center');
                  }}
                  className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-sm transition-all shadow-xl flex items-center justify-center space-x-2"
                >
                  <span>Open in Municipal Command Center (Watch Live Triage)</span>
                  <ExternalLink className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(0);
                    setPhotoUrl(null);
                    setPhotoAnalysis(null);
                    setAudioUrl(null);
                    setAudioAnalysis(null);
                    setAdditionalNotes('');
                  }}
                  className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl font-semibold text-xs transition-all"
                >
                  Back to My Reports
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Report Detail Modal when clicking on a card in "Your reports" */}
        {selectedReportDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#0f172a] border border-[#1e293b] rounded-3xl p-6 space-y-4 shadow-2xl text-white relative"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      {selectedReportDetail.category}
                    </h3>
                    <p className="text-xs text-gray-400">Ref: {selectedReportDetail.id}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedReportDetail(null)}
                  className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-500 block mb-1">Location</span>
                  <p className="text-white font-medium flex items-center">
                    <MapPin className="w-3.5 h-3.5 text-blue-400 mr-1" />
                    {selectedReportDetail.location} ({selectedReportDetail.district})
                  </p>
                </div>

                <div>
                  <span className="text-gray-500 block mb-1">Citizen Statement</span>
                  <p className="text-gray-300 italic bg-black/40 p-3 rounded-xl border border-white/5">
                    "{selectedReportDetail.description}"
                  </p>
                </div>

                {selectedReportDetail.sensorVerification && (
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-1">
                    <span className="text-blue-400 font-bold block flex items-center">
                      <VolumeX className="w-3.5 h-3.5 mr-1" />
                      SIVCA Telemetry Verification
                    </span>
                    <p className="text-gray-300">
                      Station: {selectedReportDetail.sensorVerification.stationName} (
                      {selectedReportDetail.sensorVerification.distanceMeters}m away)
                    </p>
                    <p className="text-gray-400 text-[11px]">
                      Historical Ln: {selectedReportDetail.sensorVerification.historicalNightAvgDb} dBA • Clusters:{' '}
                      {selectedReportDetail.sensorVerification.neighbourClusterCount}x
                    </p>
                  </div>
                )}

                <div>
                  <span className="text-gray-500 block mb-1">Current Status</span>
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {selectedReportDetail.status}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveIncident(selectedReportDetail);
                    setSelectedReportDetail(null);
                    setCurrentAppView('command_center');
                  }}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-1.5"
                >
                  <span>Inspect in Municipal Command Center</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CitizenPortal;
