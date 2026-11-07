import React from 'react';
import {
  KineticAudioComposition,
  WordTimestamp,
  KineticScene,
} from './KineticAudioComposition';

export interface VideoProps {
  mode?: 'custom-kinetic';
  audioUrl?: string;
  sfxStemUrl?: string;
  sfxEnabled?: boolean;
  transcript?: string;
  detectedLanguage?: string;
  words?: WordTimestamp[];
  kineticScenes?: KineticScene[];
}

export const Video: React.FC<VideoProps> = ({
  audioUrl,
  sfxStemUrl,
  sfxEnabled = true,
  transcript,
  detectedLanguage,
  words,
  kineticScenes,
}) => {
  return (
    <KineticAudioComposition
      audioUrl={audioUrl}
      sfxStemUrl={sfxStemUrl}
      sfxEnabled={sfxEnabled}
      transcript={transcript}
      detectedLanguage={detectedLanguage}
      words={words}
      kineticScenes={kineticScenes}
    />
  );
};
