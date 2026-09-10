import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mic, Square, Download, Volume2, Activity, Loader2 } from "lucide-react";
import { toast } from "sonner";

function getPreferredMimeType(): string {
  if (typeof MediaRecorder === "undefined" || !MediaRecorder.isTypeSupported) {
    return "";
  }
  const candidateTypes = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/aac",
    "audio/ogg;codecs=opus",
    "audio/ogg",
  ];
  for (const type of candidateTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }
  return "";
}

function getFileExtensionForMime(mimeType: string): string {
  const container = mimeType.split(";")[0].trim().toLowerCase();
  if (container === "audio/mp4" || container.includes("mp4")) {
    return ".mp4";
  }
  if (container === "audio/aac" || container.includes("aac")) {
    return ".aac";
  }
  if (container === "audio/ogg" || container.includes("ogg")) {
    return ".ogg";
  }
  if (container === "audio/wav" || container.includes("wav")) {
    return ".wav";
  }
  return ".webm";
}

export function StudioAudioMonitor() {
  const [isStarting, setIsStarting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedUrl, setRecordedUrl] = useState<string | null>(null);
  const [recordedMimeType, setRecordedMimeType] = useState<string>("audio/webm");
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioLevel, setAudioLevel] = useState(0);

  const isStartingRef = useRef(false);
  const recordedUrlRef = useRef<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);

  const cleanupActiveAudio = useCallback(() => {
    if (timerRef.current !== null) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== "closed") {
        audioContextRef.current.close().catch(() => {});
      }
      audioContextRef.current = null;
    }
    analyserRef.current = null;
    mediaRecorderRef.current = null;
    setAudioLevel(0);
  }, []);

  const updateRecordedUrl = useCallback((newUrl: string | null) => {
    if (recordedUrlRef.current) {
      URL.revokeObjectURL(recordedUrlRef.current);
    }
    recordedUrlRef.current = newUrl;
    setRecordedUrl(newUrl);
  }, []);

  const drawVisualizer = useCallback(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let sum = 0;
      for (let i = 0; i < bufferLength; i++) {
        sum += dataArray[i];
      }
      const avg = sum / bufferLength;
      setAudioLevel(Math.min(100, Math.round((avg / 128) * 100)));

      const barWidth = (canvas.width / bufferLength) * 2.5;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;

        const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
        gradient.addColorStop(0, "#a855f7"); // Purple
        gradient.addColorStop(0.5, "#ec4899"); // Pink
        gradient.addColorStop(1, "#facc15"); // Yellow

        ctx.fillStyle = gradient;
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 1, barHeight);

        x += barWidth;
      }
    };

    render();
  }, []);

  const startCapturing = async () => {
    if (isStartingRef.current || isRecording) {
      return;
    }
    isStartingRef.current = true;
    setIsStarting(true);

    updateRecordedUrl(null);
    cleanupActiveAudio();

    let stream: MediaStream | null = null;
    let audioCtx: AudioContext | null = null;

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Audio capture is not supported by your browser environment.");
      }

      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 2,
          sampleRate: 48000,
        },
      });
      mediaStreamRef.current = stream;

      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) {
        throw new Error("Web Audio API is not supported in this browser.");
      }

      audioCtx = new AudioContextClass({ sampleRate: 48000 });
      audioContextRef.current = audioCtx;

      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;

      const preferredMime = getPreferredMimeType();
      const recorderOptions: MediaRecorderOptions = {
        ...(preferredMime ? { mimeType: preferredMime } : {}),
        audioBitsPerSecond: 320000,
      };
      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;
      recordedChunksRef.current = [];

      const activeMime = mediaRecorder.mimeType || preferredMime || "audio/webm";
      setRecordedMimeType(activeMime);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          recordedChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const finalMime = mediaRecorder.mimeType || activeMime;
        const blob = new Blob(recordedChunksRef.current, { type: finalMime });
        const url = URL.createObjectURL(blob);
        updateRecordedUrl(url);
        setRecordedMimeType(finalMime);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);

      drawVisualizer();
      toast.success("Recording started — capturing live audio input!");
    } catch (err: unknown) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
      if (audioCtx && audioCtx.state !== "closed") {
        audioCtx.close().catch(() => {});
      }
      cleanupActiveAudio();
      setIsRecording(false);
      const errorMsg = err instanceof Error ? err.message : "Microphone access denied or audio device error.";
      toast.error(errorMsg);
    } finally {
      isStartingRef.current = false;
      setIsStarting(false);
    }
  };

  const stopCapturing = () => {
    if (mediaRecorderRef.current && isRecording && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    cleanupActiveAudio();
    setIsRecording(false);
    toast.info("Audio capture finalized. Ready to preview or download.");
  };

  useEffect(() => {
    return () => {
      cleanupActiveAudio();
      if (recordedUrlRef.current) {
        URL.revokeObjectURL(recordedUrlRef.current);
        recordedUrlRef.current = null;
      }
    };
  }, [cleanupActiveAudio]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const downloadFilename = `sl-studio-live-test${getFileExtensionForMime(recordedMimeType)}`;

  return (
    <div className="rounded-xl border border-border/60 bg-card/90 p-4 space-y-4 shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-pink-400" />
          <h4 className="text-base font-bold text-foreground">Live Companion Audio Monitor</h4>
        </div>
        <div className="flex items-center gap-2">
          {isRecording ? (
            <Badge data-testid="audio-monitor-status-badge" className="bg-destructive/10 border-destructive/50 text-destructive animate-pulse flex items-center gap-1.5 font-mono">
              <span className="h-2 w-2 rounded-full bg-destructive animate-ping" />
              LIVE {formatDuration(recordingDuration)}
            </Badge>
          ) : isStarting ? (
            <Badge data-testid="audio-monitor-status-badge" variant="outline" className="border-accent/50 text-accent text-xs flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              Connecting...
            </Badge>
          ) : (
            <Badge data-testid="audio-monitor-status-badge" variant="outline" className="border-border text-muted-foreground text-xs">
              Standby
            </Badge>
          )}
        </div>
      </div>

      <div className="relative h-20 w-full rounded-lg bg-background/80 border border-border overflow-hidden flex items-center justify-center">
        <canvas ref={canvasRef} className="w-full h-full block" width={400} height={80} />
        {!isRecording && !recordedUrl && !isStarting && (
          <p className="absolute text-xs text-muted-foreground flex items-center gap-1.5">
            <Volume2 className="h-3.5 w-3.5" />
            Click "Start Audio Test" to monitor input frequencies
          </p>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span className="flex items-center gap-1.5">
            Signal Level
            {audioLevel >= 95 ? (
              <span className="text-destructive font-bold animate-pulse">CLIP WARNING (Reduce DJ Master -3dB)</span>
            ) : (
              <span className="text-green-400 text-[10px]">Optimal Headroom</span>
            )}
          </span>
          <span data-testid="audio-level-percentage" className={audioLevel >= 95 ? "text-destructive font-bold" : ""}>
            {audioLevel}%
          </span>
        </div>
        <div className="w-full bg-muted/50 h-2.5 rounded-full overflow-hidden p-[1px]">
          <div
            className="h-full rounded-full transition-all duration-75 bg-gradient-to-r from-green-500 via-yellow-400 to-destructive"
            style={{ width: `${audioLevel}%` }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 pt-1">
        {!isRecording ? (
          <Button
            onClick={startCapturing}
            disabled={isStarting}
            className="bg-yellow-400 hover:bg-yellow-300 text-yellow-950 font-bold text-xs h-9 shadow-md shadow-yellow-400/25 disabled:opacity-50"
          >
            {isStarting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                Connecting Audio...
              </>
            ) : (
              <>
                <Mic className="h-3.5 w-3.5 mr-1.5" />
                Start Audio Test
              </>
            )}
          </Button>
        ) : (
          <Button
            onClick={stopCapturing}
            variant="destructive"
            className="font-bold text-xs h-9 bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            <Square className="h-3.5 w-3.5 mr-1.5 fill-current" />
            Stop & Save Test
          </Button>
        )}

        {recordedUrl && (
          <div className="flex items-center gap-2 ml-auto">
            <audio src={recordedUrl} controls className="h-8 max-w-[180px] sm:max-w-[220px]" />
            <a
              href={recordedUrl}
              download={downloadFilename}
              className="inline-flex items-center justify-center px-3 h-8 rounded-md bg-muted/50 border border-border hover:border-primary/50 text-xs font-medium text-foreground transition-colors"
            >
              <Download className="h-3.5 w-3.5 mr-1 text-pink-400" />
              Save
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
