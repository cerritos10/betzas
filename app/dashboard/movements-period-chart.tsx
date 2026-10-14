"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MovementsBarChart, type Point } from "./movements-bar-chart";

export function MovementsPeriodChart({
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
        <MovementsBarChart data={daily} />
      </TabsContent>
      <TabsContent value="weekly">
        <MovementsBarChart data={weekly} />
      </TabsContent>
      <TabsContent value="monthly">
        <MovementsBarChart data={monthly} />
      </TabsContent>
    </Tabs>
  );
}
