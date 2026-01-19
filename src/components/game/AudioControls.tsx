import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { audioManager, AudioSettings } from '@/game/audioManager';
import { Volume2, VolumeX, Music, Music2 } from 'lucide-react';

export const AudioControls: React.FC = () => {
  const [settings, setSettings] = useState<AudioSettings>(audioManager.getSettings());
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setSettings(audioManager.getSettings());
  }, []);

  const updateSetting = <K extends keyof AudioSettings>(key: K, value: AudioSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    audioManager.updateSettings({ [key]: value });
  };

  return (
    <div className="bg-card p-3 rounded-lg border border-border">
      <div 
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="text-sm font-medium text-foreground flex items-center gap-2">
          {settings.sfxEnabled || settings.musicEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
          Звук
        </span>
        <span className="text-xs text-muted-foreground">
          {isExpanded ? '▲' : '▼'}
        </span>
      </div>

      {isExpanded && (
        <div className="mt-3 space-y-4">
          {/* Master Volume */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Общая громкость</span>
              <span className="text-xs font-mono text-foreground">
                {Math.round(settings.masterVolume * 100)}%
              </span>
            </div>
            <Slider
              value={[settings.masterVolume * 100]}
              onValueChange={([v]) => updateSetting('masterVolume', v / 100)}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          {/* SFX */}
          <div className="flex items-center justify-between p-2 bg-muted rounded">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Звуки</span>
            </div>
            <Switch
              checked={settings.sfxEnabled}
              onCheckedChange={(checked) => updateSetting('sfxEnabled', checked)}
            />
          </div>
          
          {settings.sfxEnabled && (
            <div className="space-y-2 pl-2">
              <Slider
                value={[settings.sfxVolume * 100]}
                onValueChange={([v]) => updateSetting('sfxVolume', v / 100)}
                max={100}
                step={5}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">
                {Math.round(settings.sfxVolume * 100)}%
              </span>
            </div>
          )}

          {/* Music */}
          <div className="flex items-center justify-between p-2 bg-muted rounded">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Музыка</span>
            </div>
            <Switch
              checked={settings.musicEnabled}
              onCheckedChange={(checked) => {
                updateSetting('musicEnabled', checked);
                if (checked) {
                  audioManager.startMusic();
                } else {
                  audioManager.stopMusic();
                }
              }}
            />
          </div>
          
          {settings.musicEnabled && (
            <div className="space-y-2 pl-2">
              <Slider
                value={[settings.musicVolume * 100]}
                onValueChange={([v]) => updateSetting('musicVolume', v / 100)}
                max={100}
                step={5}
                className="w-full"
              />
              <span className="text-xs text-muted-foreground">
                {Math.round(settings.musicVolume * 100)}%
              </span>
            </div>
          )}

          {/* Quick Toggle Buttons */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => {
                updateSetting('sfxEnabled', !settings.sfxEnabled);
              }}
            >
              {settings.sfxEnabled ? '🔊' : '🔇'} SFX
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 text-xs"
              onClick={() => {
                const newEnabled = !settings.musicEnabled;
                updateSetting('musicEnabled', newEnabled);
                if (newEnabled) {
                  audioManager.startMusic();
                } else {
                  audioManager.stopMusic();
                }
              }}
            >
              {settings.musicEnabled ? '🎵' : '🔇'} Музыка
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
