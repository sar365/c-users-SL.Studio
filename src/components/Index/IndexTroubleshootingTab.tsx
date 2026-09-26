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
              For WASAPI loopback, set the intended speakers, headphones, or interface as the Windows default playback device; SL.STUDIO captures that default multimedia endpoint. For ASIO, select the correct driver and stereo input pair.
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
              Choose a local drive with adequate free space and sustained write speed, especially for high-sample-rate or high-bit-depth audio. Close other disk-heavy apps; SL.STUDIO warns if its bounded audio queue fills.
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
              The meters show peak level in dBFS. If a peak reaches 0 dBFS or the source already sounds distorted, lower the source or master output before recording. SL.STUDIO writes uncompressed WAV and does not remove clipping already present in the captured signal.
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
              WASAPI loopback captures the shared default Windows playback stream. If a source app takes exclusive control of the device, use its shared-output mode or select an appropriate ASIO input in SL.STUDIO when your setup supports it.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
