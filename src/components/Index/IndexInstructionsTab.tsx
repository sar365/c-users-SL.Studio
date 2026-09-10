import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, FileCode, PlayCircle } from "lucide-react";

export function IndexInstructionsTab() {
  return (
    <Card className="bg-card/90 border-border shadow-lg shadow-primary/10 backdrop-blur-md overflow-hidden">
      {/* Gradient accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-primary via-accent to-primary" />

      <CardHeader>
        <CardTitle className="text-2xl font-bold text-foreground">Native Setup Instructions</CardTitle>
        <CardDescription className="text-muted-foreground">
          How to build, configure and launch the SL.STUDIO native audio recorder.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Step 1 */}
        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-sm p-4 transition-all hover:border-primary/60 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground font-extrabold text-sm shadow-md shadow-primary/20">
              1
            </div>
            <h3 className="flex items-center font-bold text-foreground">
              <Download data-testid="instruction-step-1-icon" className="h-4 w-4 mr-1.5 text-primary" />
              Source Repository
            </h3>
          </div>
          <p data-testid="instruction-step-1-description" className="text-sm text-muted-foreground pl-11">
            Clone or download the project files into your desired workspace folder. All native .NET WASAPI capture code lives inside the <code className="font-mono text-xs rounded bg-background border border-border text-pink-400 px-1.5 py-0.5">native/DJSetRecorder</code> directory.
          </p>
        </div>

        {/* Step 2 */}
        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-sm p-4 transition-all hover:border-primary/60 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-primary text-primary-foreground font-extrabold text-sm shadow-md shadow-primary/20">
              2
            </div>
            <h3 className="flex items-center font-bold text-foreground">
              <FileCode data-testid="instruction-step-2-icon" className="h-4 w-4 mr-1.5 text-primary" />
              Compile & Build Solution
            </h3>
          </div>
          <p className="text-sm text-muted-foreground pl-11">
            Open <code className="font-mono text-xs rounded bg-background border border-border text-pink-400 px-1.5 py-0.5">SL.STUDIO.csproj</code> in Visual Studio 2022 (with .NET Desktop Development enabled) or compile with the .NET 8 CLI. Select <strong>Release / x64</strong> and click <strong>Build Solution</strong>.
          </p>
        </div>

        {/* Step 3 */}
        <div className="rounded-xl border border-border/50 bg-card/70 backdrop-blur-sm p-4 transition-all hover:border-primary/60 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/10">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground font-extrabold text-sm shadow-md shadow-primary/20">
              3
            </div>
            <h3 className="flex items-center font-bold text-foreground">
              <PlayCircle className="h-4 w-4 mr-1.5 text-primary" />
              Launch Native Studio Engine
            </h3>
          </div>
          <p className="text-sm text-muted-foreground pl-11">
            Run <code className="font-mono text-xs rounded bg-background border border-border text-pink-400 px-1.5 py-0.5">SLSTUDIO.exe</code>. Choose your primary soundcard or DJ interface from the device list, set your DJ master out between -3 dB and -1 dB to retain anti-clipping headroom, then hit <strong>Start Recording</strong>.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
