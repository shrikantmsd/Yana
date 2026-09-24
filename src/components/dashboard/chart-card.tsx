import { Card, CardHeader } from '../ui/card';

export function ChartCard({ title, subtitle, action, children, className }: { title: string; subtitle?: string; action?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <Card className={className}>
      <CardHeader title={title} subtitle={subtitle} action={action} />
      <div className="p-4">{children}</div>
    </Card>
  );
}
