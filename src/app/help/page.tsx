'use client';
import { BookOpen, LifeBuoy, Mail, MessageCircleQuestion, PlayCircle } from 'lucide-react';
import { Card, CardBody, CardHeader } from '@/components/ui/card';

const FAQ = [
  { q: 'Is any of this real customer data?', a: 'No. Everything in YANA MOTORS OS — customers, orders, conversations, calls — is fictional demo data generated for Phase 1. The DEMO badge in the top bar is always visible as a reminder.' },
  { q: 'Why can\'t I connect WhatsApp or Supabase yet?', a: 'Phase 1 is the frontend only, built so later phases can connect a real database, WhatsApp, and AI voice without a redesign. See Settings → Integrations for what\'s planned.' },
  { q: 'Will my changes be saved after I close the tab?', a: 'Not yet. Actions like changing an order status or adding a task update the screen for this session only, since there is no database connected in Phase 1.' },
  { q: 'How do I move a lead or deal to a different stage?', a: 'Drag its card between columns in the Kanban view, or open the record and use the status menu at the top.' },
];

export default function HelpPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-ink-900">Help</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">Quick answers for getting around YANA MOTORS OS.</p>
      </div>

      <Card>
        <CardHeader title="Frequently asked questions" />
        <div className="divide-y divide-line px-5">
          {FAQ.map((f) => (
            <div key={f.q} className="py-3.5">
              <p className="flex items-start gap-2 text-[13.5px] font-medium text-ink-800"><MessageCircleQuestion size={15} className="mt-0.5 shrink-0 text-brand-500" /> {f.q}</p>
              <p className="mt-1 pl-[22px] text-[12.5px] text-ink-500">{f.a}</p>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Card className="flex flex-col items-center gap-2 p-4 text-center"><BookOpen size={20} className="text-brand-600" /><p className="text-[12.5px] font-medium text-ink-700">Read the README</p></Card>
        <Card className="flex flex-col items-center gap-2 p-4 text-center"><PlayCircle size={20} className="text-ai-600" /><p className="text-[12.5px] font-medium text-ink-700">Watch a product walkthrough</p></Card>
        <Card className="flex flex-col items-center gap-2 p-4 text-center"><Mail size={20} className="text-info-600" /><p className="text-[12.5px] font-medium text-ink-700">Contact the CoLAB team</p></Card>
      </div>
    </div>
  );
}
