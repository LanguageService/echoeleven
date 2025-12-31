import { useState, useEffect } from 'react';
import { Mic, Square, Loader2, Sparkles, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useRecording } from '@/hooks/use-recording';

interface VoiceCloningProps {
  onVoiceCloned?: (voiceId: string, voiceName: string) => void;
}

export function VoiceCloning({ onVoiceCloned }: VoiceCloningProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isCloning, setIsCloning] = useState(false);
  const [clonedVoice, setClonedVoice] = useState<{ id: string; name: string } | null>(null);
  const { toast } = useToast();
  const { startRecording, stopRecording } = useRecording();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('clonedVoice');
      if (stored) {
        try {
          setClonedVoice(JSON.parse(stored));
        } catch {
          // Ignore parsing errors
        }
      }
    }
  }, []);

  const handleRecordingToggle = async () => {
    if (!isRecording) {
      try {
        await startRecording();
        setIsRecording(true);
      } catch (error: any) {
        console.error("Microphone access error:", error);
        toast({
          title: "Microphone Access Required",
          description: "Please allow microphone access to clone your voice.",
          variant: "destructive",
        });
      }
    } else {
      try {
        setIsRecording(false);
        const audioData = await stopRecording();
        await cloneVoice(audioData);
      } catch (error) {
        console.error("Recording error:", error);
        toast({
          title: "Recording Failed",
          description: "Failed to capture audio. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const cloneVoice = async (audioData: string) => {
    setIsCloning(true);
    try {
      const binaryString = atob(audioData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBlob = new Blob([bytes], { type: 'audio/wav' });

      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice_sample.wav');
      formData.append('voiceName', `My Voice ${new Date().toLocaleDateString()}`);

      const response = await fetch('/api/clone-voice', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to clone voice');
      }
      
      const newClonedVoice = { id: result.voiceId, name: result.voiceName };
      setClonedVoice(newClonedVoice);
      if (typeof window !== 'undefined') {
        localStorage.setItem('clonedVoice', JSON.stringify(newClonedVoice));
      }
      
      if (onVoiceCloned) {
        onVoiceCloned(result.voiceId, result.voiceName);
      }

      toast({
        title: "Voice Cloned Successfully!",
        description: `Your voice "${result.voiceName}" is now available for translations.`,
      });
    } catch (error: any) {
      console.error("Voice cloning error:", error);
      
      if (error.message?.includes('Unauthorized') || error.message?.includes('401')) {
        toast({
          title: "Login Required",
          description: "Please sign in to clone your voice.",
          variant: "destructive",
        });
      } else if (error.message?.includes('Too many')) {
        toast({
          title: "Rate Limit Reached",
          description: "You can only clone 3 voices per hour. Please try again later.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Voice Cloning Failed",
          description: error.message || "Please try again with a clearer recording.",
          variant: "destructive",
        });
      }
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
            Clone Your Voice
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400">
            {clonedVoice 
              ? `Using: ${clonedVoice.name}` 
              : "Record 10-30 seconds for best results"}
          </p>
        </div>
        
        {clonedVoice && (
          <div className="flex items-center text-green-600 dark:text-green-400">
            <Check className="w-4 h-4 mr-1" />
            <span className="text-xs">Cloned</span>
          </div>
        )}
      </div>

      <Button
        onClick={handleRecordingToggle}
        disabled={isCloning}
        variant={isRecording ? "destructive" : "outline"}
        className={`w-full ${
          isRecording 
            ? "bg-red-500 hover:bg-red-600 text-white" 
            : "border-amber-300 text-amber-700 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-300 dark:hover:bg-amber-900/20"
        }`}
      >
        {isCloning ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Cloning Voice...
          </>
        ) : isRecording ? (
          <>
            <Square className="w-4 h-4 mr-2" />
            Stop Recording
          </>
        ) : (
          <>
            {clonedVoice ? (
              <Sparkles className="w-4 h-4 mr-2" />
            ) : (
              <Mic className="w-4 h-4 mr-2" />
            )}
            {clonedVoice ? "Re-clone Voice" : "Record Voice Sample"}
          </>
        )}
      </Button>

      {isRecording && (
        <div className="flex items-center justify-center space-x-1 py-2">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span className="text-xs text-red-500">Recording... Speak clearly for 10-30 seconds</span>
        </div>
      )}
    </div>
  );
}
