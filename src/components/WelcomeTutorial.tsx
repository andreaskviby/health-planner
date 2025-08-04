'use client';

import { useState } from 'react';
import { 
  Heart, 
  Brain, 
  Utensils, 
  Calendar, 
  Smartphone,
  ArrowRight,
  ArrowLeft,
  Star,
  Users
} from 'lucide-react';

interface WelcomeTutorialProps {
  onComplete: () => void;
}

const tutorialSteps = [
  {
    id: 1,
    icon: Heart,
    title: "Välkommen till Health Planner!",
    subtitle: "Din personliga hälsoresa för par",
    description: "En intelligent app som hjälper dig och din partner att förbättra er hälsa tillsammans med AI-coaching och smart synkning.",
    features: [
      "Personlig AI-coach som lär sig dina behov",
      "Synka data med din partner via Bluetooth",
      "Fungerar helt offline när du behöver det"
    ],
    color: "from-pink-500 to-red-500"
  },
  {
    id: 2,
    icon: Brain,
    title: "AI-driven Personlig Coaching",
    subtitle: "Intelligent hälsoplaner just för dig",
    description: "Vår AI skapar personliga hälsoplaner baserat på dina mål, livsstil och dagliga check-ins. Ju mer du använder appen, desto smartare blir den.",
    features: [
      "Skräddarsydda tränings- och kostråd",
      "Dagliga motiverande meddelanden",
      "Anpassar sig efter dina framsteg"
    ],
    color: "from-blue-500 to-purple-500"
  },
  {
    id: 3,
    icon: Users,
    title: "Kramar Mode - Par-synkning",
    subtitle: "Dela er hälsoresa tillsammans",
    description: "Med 'Kramar Mode' kan du och din partner synka data säkert via Bluetooth. Håll bara era enheter nära varandra och data delas lokalt mellan er.",
    features: [
      "Säker lokal synkning (inga servrar)",
      "Dela framsteg och motivation",
      "Stötta varandra på resan"
    ],
    color: "from-pink-500 to-purple-500"
  },
  {
    id: 4,
    icon: Calendar,
    title: "Dagliga Check-ins",
    subtitle: "Följ din utveckling dag för dag",
    description: "Registrera ditt humör, energi och aktiviteter varje dag. AI:n använder denna data för att ge dig bättre råd och anpassa din hälsoplan.",
    features: [
      "Morgon- och kvällscheck-ins",
      "Spåra humör, energi och sömnkvalitet",
      "Visualisera dina framsteg över tid"
    ],
    color: "from-green-500 to-teal-500"
  },
  {
    id: 5,
    icon: Utensils,
    title: "Smart Matplanering",
    subtitle: "AI-genererade recept och måltidsförslag",
    description: "Skapa dina matpreferenser och få personliga receptförslag från AI:n. Säg vad du gillar, ogillar eller äter ibland för bästa resultat.",
    features: [
      "Personliga receptförslag",
      "Näringsberäkningar inkluderade",
      "Anpassat efter dina allergier och preferenser"
    ],
    color: "from-orange-500 to-yellow-500"
  },
  {
    id: 6,
    icon: Smartphone,
    title: "Installera som App",
    subtitle: "Bästa upplevelsen som PWA",
    description: "För optimal prestanda, installera Health Planner som en app på din telefon eller dator. Den fungerar offline och ger dig notifikationer.",
    features: [
      "Fungerar offline när du behöver",
      "Snabbare laddning och bättre prestanda",
      "Notifikationer för dina check-ins"
    ],
    color: "from-indigo-500 to-blue-500"
  }
];

export default function WelcomeTutorial({ onComplete }: WelcomeTutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  
  const currentStepData = tutorialSteps[currentStep];
  const IconComponent = currentStepData.icon;
  
  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };
  
  const previousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const skipTutorial = () => {
    onComplete();
  };

  return (
    <div className="h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r ${currentStepData.color} flex items-center justify-center`}>
            <IconComponent className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">{currentStepData.title}</h1>
          <p className="text-gray-300 text-sm">{currentStepData.subtitle}</p>
        </div>

        {/* Content */}
        <div className="space-y-6 mb-8">
          <p className="text-gray-200 text-center leading-relaxed">
            {currentStepData.description}
          </p>
          
          <div className="space-y-3">
            {currentStepData.features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-pink-400 to-purple-400 mt-2 flex-shrink-0"></div>
                <p className="text-gray-300 text-sm">{feature}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center space-x-2 mb-8">
          {tutorialSteps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentStep
                  ? 'bg-gradient-to-r from-pink-400 to-purple-400 w-8'
                  : index < currentStep
                  ? 'bg-green-400'
                  : 'bg-white/20'
              }`}
            />
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <div>
            {currentStep > 0 ? (
              <button
                onClick={previousStep}
                className="flex items-center px-4 py-2 rounded-lg bg-white/20 text-white hover:bg-white/30 transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tillbaka
              </button>
            ) : (
              <button
                onClick={skipTutorial}
                className="px-4 py-2 text-gray-400 hover:text-white transition-all"
              >
                Hoppa över
              </button>
            )}
          </div>
          
          <button
            onClick={nextStep}
            className="flex items-center px-6 py-3 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold transition-all"
          >
            {currentStep === tutorialSteps.length - 1 ? 'Kom igång!' : 'Nästa'}
            <ArrowRight className="w-4 h-4 ml-2" />
          </button>
        </div>

        {/* Special call-to-action for last step */}
        {currentStep === tutorialSteps.length - 1 && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-500/20 to-teal-500/20 rounded-lg border border-green-400/30">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Star className="w-4 h-4 text-yellow-400" />
              <p className="text-green-300 font-semibold text-sm">Tips för bästa upplevelse</p>
            </div>
            <p className="text-gray-300 text-xs text-center">
              Tryck på &ldquo;Lägg till på startskärm&rdquo; i din webbläsare för att installera appen!
            </p>
          </div>
        )}

        {/* Step counter */}
        <div className="mt-4 text-center">
          <p className="text-gray-400 text-xs">
            Steg {currentStep + 1} av {tutorialSteps.length}
          </p>
        </div>
      </div>
    </div>
  );
}