"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NetResultChart } from "./net-result-chart";

type Point = { label: string; result: number };

export function NetResultPeriodChart({
  daily,
  weekly,
  monthly,
}: {
  daily: Point[];
  weekly: Point[];
  monthly: Point[];
}) {
  return (
    <Tabs defaultValue="daily">
      <TabsList>
        <TabsTrigger value="daily">Día</TabsTrigger>
        <TabsTrigger value="weekly">Semana</TabsTrigger>
        <TabsTrigger value="monthly">Mes</TabsTrigger>
      </TabsList>
      <TabsContent value="daily">
        <NetResultChart data={daily} />
      </TabsContent>
      <TabsContent value="weekly">
        <NetResultChart data={weekly} />
      </TabsContent>
      <TabsContent value="monthly">
        <NetResultChart data={monthly} />
      </TabsContent>
    </Tabs>
  );
}
