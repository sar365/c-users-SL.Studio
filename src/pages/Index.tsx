import { IndexHeader } from "@/components/Index/IndexHeader";
import { IndexTabNavigator } from "@/components/Index/IndexTabNavigator";
import { IndexFooter } from "@/components/Index/IndexFooter";

export default function Index() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center bg-transparent text-foreground px-4 pb-12 selection:bg-primary selection:text-primary-foreground">
      <IndexHeader />
      <IndexTabNavigator />
      <IndexFooter />
    </main>
  );
}