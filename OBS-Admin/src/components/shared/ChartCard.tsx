import { Card, CardContent } from "@/components/ui/card";

export function ChartCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <h3 className="font-semibold mb-4">{title}</h3>
        {children}
      </CardContent>
    </Card>
  );
}
