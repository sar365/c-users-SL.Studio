import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { IndexOverviewTab } from "./IndexOverviewTab";
import { IndexInstructionsTab } from "./IndexInstructionsTab";
import { IndexVerificationTab } from "./IndexVerificationTab";
import { IndexHistoryTab } from "./IndexHistoryTab";
import { IndexTroubleshootingTab } from "./IndexTroubleshootingTab";
import { Info, Terminal, CheckCircle2, History, Wrench } from "lucide-react";

export function IndexTabNavigator() {
  return (
    <div data-testid="tab-navigator-container" className="relative w-full max-w-4xl rounded-3xl p-2 sm:p-5">
      <Tabs defaultValue="overview" className="relative z-10 w-full">
        {/* Tab Navigation Container */}
        <TabsList data-testid="tab-navigator-list" className="grid w-full grid-cols-2 sm:grid-cols-5 h-auto p-1.5 rounded-2xl bg-card/80 border border-border shadow-lg shadow-primary/10 backdrop-blur-md gap-1">
          <TabsTrigger
            value="overview"
            className="flex items-center gap-1.5 py-2.5 rounded-xl font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-bold data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-muted-foreground hover:text-foreground"
          >
            <Info className="w-4 h-4" />
            <span>Overview</span>
          </TabsTrigger>

          <TabsTrigger
            value="instructions"
            className="flex items-center gap-1.5 py-2.5 rounded-xl font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-bold data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-muted-foreground hover:text-foreground"
          >
            <Terminal className="w-4 h-4" />
            <span>Instructions</span>
          </TabsTrigger>

          <TabsTrigger
            value="verification"
            className="flex items-center gap-1.5 py-2.5 rounded-xl font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-bold data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-muted-foreground hover:text-foreground"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Verification</span>
          </TabsTrigger>

          <TabsTrigger
            value="history"
            className="flex items-center gap-1.5 py-2.5 rounded-xl font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-bold data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 text-muted-foreground hover:text-foreground"
          >
            <History className="w-4 h-4" />
            <span>History</span>
          </TabsTrigger>

          <TabsTrigger
            value="troubleshooting"
            className="flex items-center gap-1.5 py-2.5 rounded-xl font-medium transition-all data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:font-bold data-[state=active]:shadow-lg data-[state=active]:shadow-primary/20 col-span-2 sm:col-span-1 text-muted-foreground hover:text-foreground"
          >
            <Wrench className="w-4 h-4" />
            <span>Troubleshoot</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-5">
          <TabsContent value="overview">
            <IndexOverviewTab />
          </TabsContent>
          <TabsContent value="instructions">
            <IndexInstructionsTab />
          </TabsContent>
          <TabsContent value="verification">
            <IndexVerificationTab />
          </TabsContent>
          <TabsContent value="history">
            <IndexHistoryTab />
          </TabsContent>
          <TabsContent value="troubleshooting">
            <IndexTroubleshootingTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
