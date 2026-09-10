import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Music2, Copy, Check, HardDrive, Clock, Radio, Play, Pause, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface RecordingItem {
  id: string;
  name: string;
  date: string;
  duration: string;
  size: string;
  format: string;
  path: string;
}

const sampleRecordings: RecordingItem[] = [
  {
    id: "rec-1",
    name: "SL.STUDIO_Club_Session_2025-02-14.wav",
    date: "Feb 14, 2025 • 22:45",
    duration: "1h 42m 18s",
    size: "1.12 GB",
    format: "48.0 kHz / 24-bit Stereo",
    path: "C:\\Users\\DJ\\Music\\SL.STUDIO Sets\\SL.STUDIO_Club_Session_2025-02-14.wav",
  },
  {
    id: "rec-2",
    name: "Traktor_Peak_Hour_Mix_2025-02-12.wav",
    date: "Feb 12, 2025 • 20:15",
    duration: "58m 30s",
    size: "645 MB",
    format: "44.1 kHz / 16-bit Stereo",
    path: "C:\\Users\\DJ\\Music\\SL.STUDIO Sets\\Traktor_Peak_Hour_Mix_2025-02-12.wav",
  },
  {
    id: "rec-3",
    name: "Studio_Techno_Master_2025-02-09.wav",
    date: "Feb 9, 2025 • 17:02",
    duration: "34m 12s",
    size: "376 MB",
    format: "48.0 kHz / 24-bit Stereo",
    path: "C:\\Users\\DJ\\Music\\SL.STUDIO Sets\\Studio_Techno_Master_2025-02-09.wav",
  },
];

export function IndexHistoryTab() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [playingId, setPlayingId] = useState<string | null>(null);

  const handleCopyPath = (item: RecordingItem) => {
    navigator.clipboard.writeText(item.path);
    setCopiedId(item.id);
    toast.success("File path copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const togglePlay = (id: string) => {
    if (playingId === id) {
      setPlayingId(null);
    } else {
      setPlayingId(id);
      toast.info("Simulating audio preview playback");
    }
  };

  return (
    <Card className="bg-card/90 border-border shadow-lg shadow-primary/10 backdrop-blur-md overflow-hidden">
      {/* Gradient accent line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-primary via-accent to-primary" />

      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <CardTitle className="text-xl font-bold flex items-center gap-2 text-foreground">
              <Radio className="h-5 w-5 text-pink-500" />
              <span>Recorded Mixes History</span>
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Recordings saved to your native directory (%USERPROFILE%\Music\SL.STUDIO Sets)
            </CardDescription>
          </div>
          <Badge className="w-fit border-primary/40 text-pink-300 bg-primary/10 gap-1 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
            {sampleRecordings.length} Saved Sets
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sampleRecordings.map((rec) => {
          const isPlaying = playingId === rec.id;
          const isCopied = copiedId === rec.id;

          return (
            <div
              key={rec.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-xl border border-border/50 bg-card/70 backdrop-blur-sm p-4 transition-all hover:border-primary/60 hover:bg-card/80 hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => togglePlay(rec.id)}
                  aria-label={isPlaying ? "Pause audio preview" : "Play audio preview"}
                  className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all ${
                    isPlaying
                      ? "bg-gradient-to-r from-primary via-accent to-primary text-primary-foreground shadow-lg shadow-primary/30 scale-105"
                      : "bg-muted/50 border border-border text-muted-foreground hover:border-primary/50 hover:text-primary"
                  }`}
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" />
                  ) : (
                    <Play className="h-4 w-4 ml-0.5" />
                  )}
                </button>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-sm sm:text-base text-foreground flex items-center gap-1.5">
                      <Music2 className="h-4 w-4 text-pink-400 shrink-0" />
                      {rec.name}
                    </p>
                    <Badge variant="outline" className="text-[11px] border-border bg-card text-muted-foreground">
                      {rec.format}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-yellow-400" />
                      {rec.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3.5 w-3.5 text-pink-400" />
                      {rec.size}
                    </span>
                    <span>{rec.date}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopyPath(rec)}
                  className="h-8 gap-1.5 text-xs border-border bg-muted/50 hover:bg-muted hover:border-primary/50 hover:text-primary text-muted-foreground"
                >
                  {isCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-yellow-400" />
                      <span className="text-yellow-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      Copy Path
                    </>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
