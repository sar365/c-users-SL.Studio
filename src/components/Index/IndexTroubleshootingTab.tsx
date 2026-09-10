import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AlertTriangle, VolumeX, Bug, HelpCircle } from "lucide-react";

export function IndexTroubleshootingTab() {
  return (
    <Card className="bg-card/90 border-border shadow-lg shadow-primary/10 backdrop-blur-md overflow-hidden">
      {/* Ombre accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-primary via-accent to-primary" />

      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2 text-white">
          <HelpCircle className="h-6 w-6 text-primary" />
          <span>Troubleshooting & Diagnostic Guide</span>
        </CardTitle>
        <CardDescription className="text-neutral-300">
          Quick resolutions for audio routing, device access, and buffer issues.
        </CardDescription>
      </CardHeader>
      <CardContent data-testid="troubleshoot-card-content" className="space-y-4">
        {/* Issue 1 */}
        <div className="flex items-start space-x-4 rounded-xl border border-border bg-background/60 backdrop-blur-sm p-4 transition-all hover:border-destructive/60 hover:bg-card hover:shadow-lg hover:shadow-destructive/10">
          <div className="p-2 rounded-lg bg-red-950/60 border border-red-500/40 text-red-400 shrink-0 mt-0.5">
            <VolumeX data-testid="troubleshoot-audio-captured-icon" className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-white">No Audio Captured / Silent File</p>
            <p data-testid="troubleshoot-audio-captured-description" className="text-sm text-neutral-300 leading-relaxed">
              Verify in the Windows Audio settings that your default playback device matches the one selected in the SL.STUDIO dropdown menu. WASAPI loopback captures only the exact active endpoint.
            </p>
          </div>
        </div>

        {/* Issue 2 */}
        <div className="flex items-start space-x-4 rounded-xl border border-border bg-background/60 backdrop-blur-sm p-4 transition-all hover:border-primary/60 hover:bg-card hover:shadow-lg hover:shadow-primary/10">
          <div className="p-2 rounded-lg bg-orange-950/60 border border-orange-500/40 text-orange-400 shrink-0 mt-0.5">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-white">Buffer Overruns or Stuttering</p>
            <p className="text-sm text-neutral-300 leading-relaxed">
              Ensure you are recording to an internal NVMe/SSD rather than a slow USB 2.0 thumb drive. High samplerate (96kHz/24-bit) PCM requires continuous sustained disk write throughput.
            </p>
          </div>
        </div>

        {/* Issue 3 */}
        <div className="flex items-start space-x-4 rounded-xl border border-border bg-background/60 backdrop-blur-sm p-4 transition-all hover:border-accent/60 hover:bg-card hover:shadow-lg hover:shadow-accent/10">
          <div className="p-2 rounded-lg bg-accent/15 border border-accent/40 text-accent-foreground shrink-0 mt-0.5">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-white">Digital Distortion or Clipping</p>
            <p className="text-sm text-neutral-300 leading-relaxed">
              SL.STUDIO records direct bit-perfect PCM without applying artificial compression. If the recording sounds clipped, lower the Master Out volume in your DJ software by 2–3 dB to prevent digital overs at 0 dBFS.
            </p>
          </div>
        </div>

        {/* Issue 4 */}
        <div className="flex items-start space-x-4 rounded-xl border border-border bg-background/60 backdrop-blur-sm p-4 transition-all hover:border-accent/60 hover:bg-card hover:shadow-lg hover:shadow-accent/10">
          <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-500/40 text-amber-400 shrink-0 mt-0.5">
            <Bug className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-white">Exclusive Mode Conflict</p>
            <p className="text-sm text-neutral-300 leading-relaxed">
              If your DJ software (e.g., ASIO exclusive mode) locks the sound card completely, switch your DJ software to direct sound or shared WASAPI mode to allow loopback capture.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}