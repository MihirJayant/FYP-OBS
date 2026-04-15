import { Card, CardContent } from "@/components/ui/card";

export function StatCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <p className="text-sm text-muted-foreground">{title}</p>
        <h2 className="text-2xl font-bold mt-1">{value}</h2>
      </CardContent>
    </Card>
  );
}
