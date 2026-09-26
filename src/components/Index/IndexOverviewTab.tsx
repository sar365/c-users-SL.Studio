import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Mic, Zap, Sliders, Radio, Sparkles } from "lucide-react";
import { StudioAudioMonitor } from "@/components/StudioAudioMonitor";

export function IndexOverviewTab() {
  return (
    <Card className="bg-card/90 border-border shadow-lg shadow-primary/10 backdrop-blur-md overflow-hidden relative">
      {/* Decorative gradient top edge accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-primary via-accent to-primary" />

      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2 text-foreground">
              <Radio className="h-6 w-6 text-primary animate-pulse" />
              <span>Studio Overview</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground mt-1">
              Windows playback or ASIO input capture, saved as uncompressed WAV.
            </CardDescription>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span>Uncompressed WAV</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Feature 1 */}
        <div data-testid="feature-wasapi-loopback-card" className="flex items-start space-x-4 rounded-xl border border-border/50 bg-card/70 backdrop-blur-sm p-4 transition-all hover:border-primary/60 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/10">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md shadow-primary/20 font-bold">
            <Mic className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-2">
              System Audio WASAPI Loopback
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/20 text-primary border border-primary/30">Direct Link</span>
            </p>
            <p data-testid="feature-wasapi-loopback-description" className="text-sm text-muted-foreground leading-relaxed">
              Captures the default Windows playback endpoint without adding a lossy encoding stage. The source app, Windows mixer, drivers, and device processing can still affect the signal.
            </p>
          </div>
        </div>

        {/* Feature 2 */}
        <div data-testid="feature-lossless-pcm-card" className="flex items-start space-x-4 rounded-xl border border-border/50 bg-card/70 backdrop-blur-sm p-4 transition-all hover:border-primary/60 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/10">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-primary text-primary-foreground shadow-md shadow-primary/20 font-bold">
            <Zap className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground flex items-center gap-2">
              Uncompressed PCM WAV
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-accent/20 text-accent-foreground border border-accent/30">Zero Compression</span>
            </p>
            <p data-testid="feature-lossless-pcm-description" className="text-sm text-muted-foreground leading-relaxed">
              Captured samples are written to standard WAV files without a lossy codec. Output quality depends on the selected source and any processing upstream of the recorder.
            </p>
          </div>
        </div>

        {/* Feature 3 */}
        <div data-testid="feature-vu-feedback-card" className="flex items-start space-x-4 rounded-xl border border-border/50 bg-card/70 backdrop-blur-sm p-4 transition-all hover:border-primary/60 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/10">
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md shadow-primary/20 font-bold">
            <Sliders className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-foreground">Real-Time Peak Feedback</p>
            <p data-testid="feature-vu-feedback-description" className="text-sm text-muted-foreground leading-relaxed">
              Stereo peak meters show levels in dBFS while recording and can help reveal clipping. They do not change or repair the captured audio.
            </p>
          </div>
        </div>

        {/* Live Browser Audio Monitor Widget */}
        <div className="pt-2">
          <StudioAudioMonitor />
        </div>
      </CardContent>
    </Card>
  );
}
