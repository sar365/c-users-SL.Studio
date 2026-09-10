import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle2, FolderOpen, Music, ShieldCheck } from "lucide-react";

export function IndexVerificationTab() {
  return (
    <Card className="bg-card/90 border-border shadow-lg shadow-primary/10 backdrop-blur-md overflow-hidden">
      {/* Ombre accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-primary via-accent to-primary" />

      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center gap-2 text-white">
          <ShieldCheck className="h-6 w-6 text-orange-400" />
          <span>Recording Verification</span>
        </CardTitle>
        <CardDescription className="text-neutral-300">
          Step-by-step checklist to confirm your set was properly recorded with zero loss.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step 1 */}
        <div className="rounded-xl border border-border bg-background/60 backdrop-blur-sm p-4 transition-all hover:border-primary/60 hover:bg-card hover:shadow-lg hover:shadow-primary/10">
          <h3 className="flex items-center font-bold text-white mb-2">
            <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
            1. Stop & Finalize WAV Header
          </h3>
          <p className="text-sm text-neutral-300 pl-7">
            When your performance wraps up, hit <strong>Stop Recording</strong>. The engine will safely flush all buffered PCM chunks and write the standardized RIFF WAV header.
          </p>
        </div>

        {/* Step 2 */}
        <div className="rounded-xl border border-border bg-background/60 backdrop-blur-sm p-4 transition-all hover:border-primary/60 hover:bg-card hover:shadow-lg hover:shadow-primary/10">
          <h3 className="flex items-center font-bold text-white mb-2">
            <FolderOpen className="h-5 w-5 mr-2 text-orange-400" />
            2. Access the Output Folder
          </h3>
          <p className="text-sm text-neutral-300 pl-7">
            Your file will be placed in <code className="font-mono text-xs rounded bg-muted border border-border text-primary px-1.5 py-0.5">C:\Users\[User]\Music\SL.STUDIO Sets</code> named with a timestamped format like <code className="font-mono text-xs rounded bg-muted border border-border text-primary px-1.5 py-0.5">SL.STUDIO_2025-02-14_22-45-00.wav</code>.
          </p>
        </div>

        {/* Step 3 */}
        <div className="rounded-xl border border-border bg-background/60 backdrop-blur-sm p-4 transition-all hover:border-primary/60 hover:bg-card hover:shadow-lg hover:shadow-primary/10">
          <h3 className="flex items-center font-bold text-white mb-2">
            <Music className="h-5 w-5 mr-2 text-red-400" />
            3. Listen & Inspect Peaks
          </h3>
          <p className="text-sm text-neutral-300 pl-7">
            Open the file in Audacity, VLC, or your DAW to check that waveforms are balanced and free from clipping or dropout.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}