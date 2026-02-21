import { useState } from 'react';
import { FighterTemplate, FIGHTER_TEMPLATES, calculateOverallRating, getStatColor, getStatBg, getTierColor } from '@/lib/fighterTemplates';
import { Swords, Zap, Shield, Heart, Wind, Dumbbell, ChevronRight, ChevronLeft, Trophy, Target, User } from 'lucide-react';

interface FighterCreatorProps {
  onComplete: (fighter: {
    name: string;
    nickname: string;
    templateId: string;
    stats: FighterTemplate['stats'];
  }) => void;
  onCancel: () => void;
}

type Step = 1 | 2 | 3;

export function FighterCreator({ onComplete, onCancel }: FighterCreatorProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedTemplate, setSelectedTemplate] = useState<FighterTemplate | null>(null);
  const [customStats, setCustomStats] = useState<FighterTemplate['stats'] | null>(null);
  const [fighterName, setFighterName] = useState('');
  const [fighterNickname, setFighterNickname] = useState('');

  const handleTemplateSelect = (template: FighterTemplate) => {
    setSelectedTemplate(template);
    setCustomStats({ ...template.stats });
  };

  const handleStatChange = (stat: keyof FighterTemplate['stats'], value: number) => {
    if (!customStats) return;
    setCustomStats({ ...customStats, [stat]: value });
  };

  const handleComplete = () => {
    if (!selectedTemplate || !customStats || !fighterName) return;
    onComplete({
      name: fighterName,
      nickname: fighterNickname || selectedTemplate.nickname,
      templateId: selectedTemplate.id,
      stats: customStats,
    });
  };

  const canProceed = () => {
    switch (step) {
      case 1: return selectedTemplate !== null;
      case 2: return customStats !== null;
      case 3: return fighterName.length >= 2;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Swords className="w-6 h-6 text-red-500" />
              <h1 className="text-xl font-bold tracking-wider">CREATE FIGHTER</h1>
            </div>
            <button onClick={onCancel} className="text-zinc-500 hover:text-white text-sm">
              CANCEL
            </button>
          </div>
          
          {/* Progress */}
          <div className="flex items-center gap-2 mt-4">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  step >= s ? 'bg-red-500 text-white' : 'bg-zinc-800 text-zinc-500'
                }`}>
                  {s}
                </div>
                <div className={`h-0.5 w-12 ${step > s ? 'bg-red-500' : 'bg-zinc-800'}`} />
              </div>
            ))}
            <span className="text-sm text-zinc-500 ml-2">STEP {step} OF 3</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        {step === 1 && (
          <StepOneSelectTemplate
            selected={selectedTemplate}
            onSelect={handleTemplateSelect}
          />
        )}
        {step === 2 && selectedTemplate && customStats && (
          <StepTwoCustomize
            template={selectedTemplate}
            stats={customStats}
            onChange={handleStatChange}
          />
        )}
        {step === 3 && selectedTemplate && customStats && (
          <StepThreeFinalize
            template={selectedTemplate}
            stats={customStats}
            name={fighterName}
            nickname={fighterNickname}
            onNameChange={setFighterName}
            onNicknameChange={setFighterNickname}
          />
        )}
      </div>

      {/* Footer Navigation */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => setStep(Math.max(1, step - 1) as Step)}
            disabled={step === 1}
            className={`flex items-center gap-2 px-6 py-3 font-medium ${
              step === 1 ? 'text-zinc-600 cursor-not-allowed' : 'text-white hover:text-red-400'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
            BACK
          </button>
          
          <button
            onClick={() => {
              if (step === 3) {
                handleComplete();
              } else {
                setStep(Math.min(3, step + 1) as Step);
              }
            }}
            disabled={!canProceed()}
            className={`flex items-center gap-2 px-8 py-3 font-bold rounded ${
              canProceed()
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
            }`}
          >
            {step === 3 ? 'CREATE FIGHTER' : 'NEXT'}
            {step !== 3 && <ChevronRight className="w-5 h-5" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// Step 1: Template Selection
function StepOneSelectTemplate({
  selected,
  onSelect,
}: {
  selected: FighterTemplate | null;
  onSelect: (t: FighterTemplate) => void;
}) {
  const tiers = ['Legend', 'Champion', 'Elite'] as const;
  
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">CHOOSE YOUR BASE TEMPLATE</h2>
        <p className="text-zinc-400">Select a legendary fighter as your starting point. You can customize everything in the next step.</p>
      </div>

      {tiers.map((tier) => {
        const tierFighters = FIGHTER_TEMPLATES.filter((f) => f.tier === tier);
        if (tierFighters.length === 0) return null;
        
        return (
          <div key={tier} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Trophy className={`w-5 h-5 ${
                tier === 'Legend' ? 'text-yellow-400' : tier === 'Champion' ? 'text-red-400' : 'text-blue-400'
              }`} />
              <h3 className="text-lg font-bold tracking-wider">{tier.toUpperCase()} TIER</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tierFighters.map((fighter) => (
                <button
                  key={fighter.id}
                  onClick={() => onSelect(fighter)}
                  className={`relative p-5 text-left border-2 rounded-lg transition-all ${
                    selected?.id === fighter.id
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-600'
                  }`}
                >
                  {/* Tier Badge */}
                  <div className={`absolute top-3 right-3 px-2 py-1 text-xs font-bold border rounded ${getTierColor(fighter.tier)}`}>
                    {fighter.tier.toUpperCase()}
                  </div>
                  
                  {/* Name */}
                  <div className="mb-1">
                    <h4 className="text-lg font-bold text-white">{fighter.name}</h4>
                    <p className="text-sm text-red-400">"{fighter.nickname}"</p>
                  </div>
                  
                  {/* Info */}
                  <div className="flex items-center gap-4 text-xs text-zinc-500 mb-3">
                    <span>{fighter.weightClass}</span>
                    <span>{fighter.stance}</span>
                    <span>{fighter.reach}" reach</span>
                  </div>
                  
                  {/* Style */}
                  <p className="text-sm text-zinc-400 mb-3">{fighter.style}</p>
                  
                  {/* Mini Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <MiniStat label="STR" value={fighter.stats.striking} />
                    <MiniStat label="GRP" value={fighter.stats.grappling} />
                    <MiniStat label="PWR" value={fighter.stats.power} />
                  </div>
                  
                  {/* Overall */}
                  <div className="mt-3 pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">OVERALL</span>
                    <span className={`text-xl font-bold ${getStatColor(calculateOverallRating(fighter.stats))}`}>
                      {calculateOverallRating(fighter.stats)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className={`text-lg font-bold ${getStatColor(value)}`}>{value}</div>
      <div className="text-xs text-zinc-600">{label}</div>
    </div>
  );
}

// Step 2: Customize Stats
function StepTwoCustomize({
  template,
  stats,
  onChange,
}: {
  template: FighterTemplate;
  stats: FighterTemplate['stats'];
  onChange: (stat: keyof FighterTemplate['stats'], value: number) => void;
}) {
  const statConfig = [
    { key: 'striking' as const, label: 'STRIKING', icon: Target, desc: 'Punching technique, combos, accuracy' },
    { key: 'grappling' as const, label: 'GRAPPLING', icon: Swords, desc: 'Wrestling, takedowns, ground control' },
    { key: 'stamina' as const, label: 'STAMINA', icon: Wind, desc: 'Cardio, endurance, late-round performance' },
    { key: 'power' as const, label: 'POWER', icon: Zap, desc: 'Knockout power, damage output' },
    { key: 'chin' as const, label: 'CHIN', icon: Shield, desc: 'Ability to take punishment, recovery' },
    { key: 'speed' as const, label: 'SPEED', icon: Wind, desc: 'Hand speed, footwork, reaction time' },
  ];

  const overall = calculateOverallRating(stats);
  const originalOverall = calculateOverallRating(template.stats);
  const statChange = overall - originalOverall;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left: Stat Sliders */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">CUSTOMIZE STATS</h2>
          <p className="text-zinc-400">Adjust your fighter's attributes. Stay within the 1200 point budget.</p>
        </div>

        <div className="space-y-6">
          {statConfig.map(({ key, label, icon: Icon, desc }) => (
            <div key={key} className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-zinc-500" />
                  <div>
                    <label className="font-bold text-sm">{label}</label>
                    <p className="text-xs text-zinc-600">{desc}</p>
                  </div>
                </div>
                <span className={`text-2xl font-bold ${getStatColor(stats[key])}`}>
                  {stats[key]}
                </span>
              </div>
              
              <input
                type="range"
                min="40"
                max="99"
                value={stats[key]}
                onChange={(e) => onChange(key, parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, ${getStatBg(stats[key])} 0%, ${getStatBg(stats[key])} ${stats[key]}%, #27272a ${stats[key]}%, #27272a 100%)`,
                }}
              />
              
              <div className="flex justify-between text-xs text-zinc-600 mt-1">
                <span>40</span>
                <span className={stats[key] > template.stats[key] ? 'text-green-400' : stats[key] < template.stats[key] ? 'text-red-400' : ''}>
                  Original: {template.stats[key]}
                </span>
                <span>99</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: Preview */}
      <div>
        <div className="sticky top-8">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-red-500" />
              FIGHTER PREVIEW
            </h3>
            
            {/* Name & Info */}
            <div className="mb-6">
              <h4 className="text-2xl font-bold text-white">{template.name}</h4>
              <p className="text-red-400">"{template.nickname}"</p>
              <div className="flex items-center gap-4 text-sm text-zinc-500 mt-2">
                <span>{template.weightClass}</span>
                <span>{template.stance}</span>
                <span>{template.reach}" reach</span>
              </div>
            </div>
            
            {/* Overall Rating */}
            <div className="flex items-center justify-between py-4 border-y border-zinc-800 mb-6">
              <span className="text-zinc-400">OVERALL RATING</span>
              <div className="flex items-center gap-3">
                <span className="text-sm text-zinc-500">{originalOverall}</span>
                <span className="text-zinc-600">→</span>
                <span className={`text-4xl font-bold ${getStatColor(overall)}`}>
                  {overall}
                </span>
                {statChange !== 0 && (
                  <span className={`text-sm ${statChange > 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {statChange > 0 ? '+' : ''}{statChange}
                  </span>
                )}
              </div>
            </div>
            
            {/* Stats Radar */}
            <div className="grid grid-cols-2 gap-4">
              {statConfig.map(({ key, label }) => (
                <div key={key} className="flex items-center justify-between py-2 border-b border-zinc-800">
                  <span className="text-sm text-zinc-400">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-600">{template.stats[key]}</span>
                    <span className={`font-bold ${getStatColor(stats[key])}`}>
                      {stats[key]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Specialties */}
            <div className="mt-6">
              <h5 className="text-sm font-bold text-zinc-400 mb-2">SPECIALTIES</h5>
              <div className="flex flex-wrap gap-2">
                {template.specialties.map((spec) => (
                  <span key={spec} className="px-3 py-1 text-xs bg-red-500/20 text-red-400 border border-red-500/30 rounded">
                    {spec.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 3: Finalize
function StepThreeFinalize({
  template,
  stats,
  name,
  nickname,
  onNameChange,
  onNicknameChange,
}: {
  template: FighterTemplate;
  stats: FighterTemplate['stats'];
  name: string;
  nickname: string;
  onNameChange: (s: string) => void;
  onNicknameChange: (s: string) => void;
}) {
  const overall = calculateOverallRating(stats);

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold mb-2">FINALIZE YOUR FIGHTER</h2>
        <p className="text-zinc-400">Give your fighter a name and review before creation.</p>
      </div>

      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-8">
        {/* Name Inputs */}
        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">FIGHTER NAME *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Enter name..."
              className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:border-red-500 focus:outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-bold text-zinc-400 mb-2">NICKNAME</label>
            <input
              type="text"
              value={nickname}
              onChange={(e) => onNicknameChange(e.target.value)}
              placeholder={template.nickname}
              className="w-full px-4 py-3 bg-black border border-zinc-700 rounded-lg text-white placeholder-zinc-600 focus:border-red-500 focus:outline-none"
            />
            <p className="text-xs text-zinc-600 mt-1">Leave empty to use template nickname: "{template.nickname}"</p>
          </div>
        </div>

        {/* Preview Card */}
        <div className="border border-zinc-800 rounded-lg p-6 bg-black/50">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">{name || '[NAME]'}</h3>
              <p className="text-red-400">"{nickname || template.nickname}"</p>
            </div>
            <div className={`px-3 py-1 text-xs font-bold border rounded ${getTierColor(template.tier)}`}>
              {template.tier.toUpperCase()}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-sm text-zinc-500 mb-4">
            <span>{template.weightClass}</span>
            <span>{template.stance}</span>
            <span>{template.reach}" reach</span>
          </div>
          
          <div className="flex items-center justify-between py-3 border-t border-zinc-800">
            <span className="text-zinc-400">OVERALL</span>
            <span className={`text-3xl font-bold ${getStatColor(overall)}`}>{overall}</span>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-zinc-800">
            <StatPreview label="STR" value={stats.striking} />
            <StatPreview label="GRP" value={stats.grappling} />
            <StatPreview label="PWR" value={stats.power} />
            <StatPreview label="SPD" value={stats.speed} />
            <StatPreview label="STM" value={stats.stamina} />
            <StatPreview label="CHN" value={stats.chin} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatPreview({ label, value }: { label: string; value: number }) {
  return (
    <div className="text-center">
      <div className={`text-xl font-bold ${getStatColor(value)}`}>{value}</div>
      <div className="text-xs text-zinc-600">{label}</div>
    </div>
  );
}
