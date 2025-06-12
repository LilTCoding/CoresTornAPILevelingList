import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid, GridItem } from "@/components/ui/grid";
import { Button } from "@/components/ui/button";
import { ArrowRight, Code, Settings, Wrench, Hammer } from "lucide-react";

interface ToolCard {
  title: string;
  description: string;
  path: string;
  icon: React.ReactNode;
  category: string;
}

const tools: ToolCard[] = [
  {
    title: "Clean Travel",
    description: "Enhance your travel screen by removing unnecessary UI elements for a cleaner interface.",
    path: "/clean-travel",
    icon: <Hammer className="h-6 w-6" />,
    category: "UI Enhancement"
  },
  {
    title: "AI Monitor",
    description: "Monitor AI players' status and receive notifications about their activities.",
    path: "/ai-monitor",
    icon: <Settings className="h-6 w-6" />,
    category: "Monitoring"
  },
  {
    title: "Hospital Monitor",
    description: "Track players in the hospital and get real-time notifications about their status.",
    path: "/hospital-monitor",
    icon: <Wrench className="h-6 w-6" />,
    category: "Monitoring"
  }
];

function Torntoolsbycore() {
  const categories = Array.from(new Set(tools.map(tool => tool.category)));

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="mb-4 text-4xl font-bold text-cyan-400">Torn Tools by Core</h1>
        <p className="text-lg text-gray-300">
          A collection of powerful tools to enhance your Torn City experience
        </p>
      </div>

      {categories.map(category => (
        <div key={category} className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold text-white">{category}</h2>
          <Grid className="gap-6">
            {tools
              .filter(tool => tool.category === category)
              .map(tool => (
                <GridItem key={tool.path} className="col-span-1">
                  <Card className="h-full bg-gray-800 text-white transition-all hover:bg-gray-700">
                    <CardHeader>
                      <div className="mb-2 flex items-center gap-2">
                        {tool.icon}
                        <CardTitle className="text-xl">{tool.title}</CardTitle>
                      </div>
                      <CardDescription className="text-gray-300">
                        {tool.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Link to={tool.path}>
                        <Button className="w-full bg-cyan-500 hover:bg-cyan-600">
                          Open Tool <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                </GridItem>
              ))}
          </Grid>
        </div>
      ))}

      <div className="mt-8 rounded-lg bg-gray-800 p-6 text-center">
        <h2 className="mb-4 text-2xl font-semibold text-white">Want to Contribute?</h2>
        <p className="mb-4 text-gray-300">
          Have an idea for a new tool? Want to improve existing ones?
        </p>
        <Button className="bg-purple-500 hover:bg-purple-600">
          <Code className="mr-2 h-4 w-4" /> View Source Code
        </Button>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/torntoolsbycore')({
  component: Torntoolsbycore,
}); 