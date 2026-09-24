'use client';
import { useState } from 'react';
import {
  Building, Users, Shield, Bell, Workflow, Package, LifeBuoy, ShieldAlert, Zap, MessageCircle, PhoneCall, Plug, Route,
} from 'lucide-react';
import { useDemoData } from '@/state/store';
import { useToast } from '@/state/toast';
import { Card, CardBody, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Field, Select, TextArea, TextInput } from '@/components/ui/inputs';
import { StatusBadge, Pill } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/cn';
import { CUSTOMER_TYPES, DEAL_STAGES, TICKET_CATEGORIES, COMPLAINT_CATEGORIES } from '@/types';

const SECTIONS = [
  { value: 'company', label: 'Company', icon: Building },
  { value: 'users', label: 'Users', icon: Users },
  { value: 'roles', label: 'Roles', icon: Shield },
  { value: 'notifications', label: 'Notifications', icon: Bell },
  { value: 'pipeline', label: 'Sales Pipeline', icon: Route },
  { value: 'customer-types', label: 'Customer Types', icon: Users },
  { value: 'products', label: 'Products', icon: Package },
  { value: 'support-categories', label: 'Support Categories', icon: LifeBuoy },
  { value: 'complaint-categories', label: 'Complaint Categories', icon: ShieldAlert },
  { value: 'automation', label: 'Automation Preferences', icon: Zap },
  { value: 'whatsapp', label: 'WhatsApp Settings', icon: MessageCircle },
  { value: 'ai-voice', label: 'AI Voice Settings', icon: PhoneCall },
  { value: 'integrations', label: 'Integrations', icon: Plug },
];

const INTEGRATIONS = [
  { name: 'Supabase', desc: 'Production database for customers, orders and everything else' },
  { name: 'n8n', desc: 'Workflow automation engine behind the Automation Center' },
  { name: 'WhatsApp (Meta Cloud API)', desc: 'Sends and receives real WhatsApp messages' },
  { name: 'Retell AI', desc: 'Powers real AI voice calls' },
  { name: 'Telegram', desc: 'Internal team alerts' },
  { name: 'Email (SMTP)', desc: 'Transactional emails like invoices and receipts' },
];

export default function SettingsPage() {
  const { team } = useDemoData();
  const toast = useToast();
  const [section, setSection] = useState('company');
  const [notif, setNotif] = useState({ newLead: true, complaintHigh: true, reorderDue: true, ticketSla: true, dailyDigest: false });
  const [activeUsers, setActiveUsers] = useState<Record<string, boolean>>(Object.fromEntries(team.map((t) => [t.id, t.active])));
  const [company, setCompany] = useState({ name: 'YANA MOTORS', tagline: 'Automate the Customer Lifecycle', gstin: '27ABCDE1234F1Z5', address: 'Plot 14, MIDC Industrial Area, Pune, Maharashtra' });

  const save = () => toast({ title: 'Saved', description: 'This is a demo — changes are kept for this session only.', tone: 'success' });

  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-[20px] font-bold text-ink-900">Settings</h1>
        <p className="mt-0.5 text-[13px] text-ink-500">Phase 1 settings are for review — nothing here is wired to a live backend yet.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[220px_1fr]">
        <Card className="h-fit p-2">
          {SECTIONS.map((s) => (
            <button key={s.value} onClick={() => setSection(s.value)} className={cn('flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-[12.5px] font-medium', section === s.value ? 'bg-brand-50 text-brand-700' : 'text-ink-600 hover:bg-ink-50')}>
              <s.icon size={15} /> {s.label}
            </button>
          ))}
        </Card>

        <Card>
          {section === 'company' && (
            <>
              <CardHeader title="Company" subtitle="Shown on invoices, quotations and customer-facing messages" />
              <CardBody className="max-w-lg space-y-3.5">
                <Field label="Company name"><TextInput value={company.name} onChange={(e) => setCompany({ ...company, name: e.target.value })} /></Field>
                <Field label="Tagline"><TextInput value={company.tagline} onChange={(e) => setCompany({ ...company, tagline: e.target.value })} /></Field>
                <Field label="GSTIN"><TextInput value={company.gstin} onChange={(e) => setCompany({ ...company, gstin: e.target.value })} /></Field>
                <Field label="Registered address"><TextArea rows={2} value={company.address} onChange={(e) => setCompany({ ...company, address: e.target.value })} /></Field>
                <Button size="sm" onClick={save}>Save changes</Button>
              </CardBody>
            </>
          )}

          {section === 'users' && (
            <>
              <CardHeader title="Users" subtitle={`${team.length} team members`} />
              <div className="divide-y divide-line px-5">
                {team.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3"><Avatar name={t.name} size={32} /><div><p className="text-[13px] font-medium text-ink-800">{t.name}</p><p className="text-[11.5px] text-ink-400">{t.email}</p></div></div>
                    <div className="flex items-center gap-3">
                      <Pill>{t.role}</Pill>
                      <button onClick={() => setActiveUsers((s) => ({ ...s, [t.id]: !s[t.id] }))} className={cn('h-5 w-9 rounded-full p-0.5 transition-colors', activeUsers[t.id] ? 'bg-ok-500' : 'bg-ink-200')}>
                        <span className={cn('block h-4 w-4 rounded-full bg-white transition-transform', activeUsers[t.id] && 'translate-x-4')} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {section === 'roles' && (
            <>
              <CardHeader title="Roles" subtitle="What each role can see and do" />
              <div className="divide-y divide-line px-5">
                {[
                  ['Owner', 'Full access to every module, including settings and integrations.'],
                  ['Sales Head', 'Manages leads, deals, campaigns and the sales team.'],
                  ['Sales Executive', 'Owns leads, deals and orders for their assigned city.'],
                  ['Support Agent', 'Handles support tickets and WhatsApp conversations.'],
                  ['Customer Success Manager', 'Owns the post-delivery journey and reorder outreach.'],
                  ['Quality Manager', 'Owns complaint investigation and resolution.'],
                ].map(([role, desc]) => (
                  <div key={role} className="py-3"><p className="text-[13px] font-medium text-ink-800">{role}</p><p className="mt-0.5 text-[12px] text-ink-500">{desc}</p></div>
                ))}
              </div>
            </>
          )}

          {section === 'notifications' && (
            <>
              <CardHeader title="Notifications" subtitle="What triggers an alert in the notification bell" />
              <div className="divide-y divide-line px-5">
                {[
                  ['newLead', 'New lead captured'], ['complaintHigh', 'High or critical severity complaint'], ['reorderDue', 'Customer is due for reorder'],
                  ['ticketSla', 'Support ticket approaching SLA'], ['dailyDigest', 'Daily summary email'],
                ].map(([key, label]) => (
                  <div key={key} className="flex items-center justify-between py-3">
                    <span className="text-[13px] text-ink-700">{label}</span>
                    <button onClick={() => setNotif((s) => ({ ...s, [key]: !s[key as keyof typeof notif] }))} className={cn('h-5 w-9 rounded-full p-0.5 transition-colors', notif[key as keyof typeof notif] ? 'bg-ok-500' : 'bg-ink-200')}>
                      <span className={cn('block h-4 w-4 rounded-full bg-white transition-transform', notif[key as keyof typeof notif] && 'translate-x-4')} />
                    </button>
                  </div>
                ))}
              </div>
            </>
          )}

          {section === 'pipeline' && (
            <>
              <CardHeader title="Sales Pipeline" subtitle="Stages used on the Sales page" />
              <CardBody><div className="flex flex-wrap gap-2">{DEAL_STAGES.map((s, i) => <Pill key={s}>{i + 1}. {s}</Pill>)}</div></CardBody>
            </>
          )}

          {section === 'customer-types' && (
            <>
              <CardHeader title="Customer Types" subtitle="Used across Customers, Companies, Leads and pricing" />
              <CardBody><div className="flex flex-wrap gap-2">{CUSTOMER_TYPES.map((t) => <Pill key={t}>{t}</Pill>)}</div></CardBody>
            </>
          )}

          {section === 'products' && (
            <>
              <CardHeader title="Product Settings" subtitle="Defaults used across the catalogue and inventory" />
              <CardBody className="max-w-sm space-y-3.5">
                <Field label="Default GST rate"><TextInput defaultValue="18%" /></Field>
                <Field label="Low stock threshold" hint="Percentage of reorder level that triggers a Low Stock badge"><TextInput defaultValue="100%" /></Field>
                <Button size="sm" onClick={save}>Save changes</Button>
              </CardBody>
            </>
          )}

          {section === 'support-categories' && (
            <>
              <CardHeader title="Support Categories" />
              <CardBody><div className="flex flex-wrap gap-2">{TICKET_CATEGORIES.map((c) => <Pill key={c}>{c}</Pill>)}</div></CardBody>
            </>
          )}

          {section === 'complaint-categories' && (
            <>
              <CardHeader title="Complaint Categories" />
              <CardBody><div className="flex flex-wrap gap-2">{COMPLAINT_CATEGORIES.map((c) => <Pill key={c}>{c}</Pill>)}</div></CardBody>
            </>
          )}

          {section === 'automation' && (
            <>
              <CardHeader title="Automation Preferences" subtitle="Global rules. Individual automations are managed in the Automation Center." />
              <CardBody className="max-w-md space-y-3.5">
                <Field label="Calling hours for AI Voice"><div className="flex gap-2"><TextInput defaultValue="10:00" className="w-24" /><span className="self-center text-ink-400">to</span><TextInput defaultValue="18:00" className="w-24" /></div></Field>
                <Field label="Reorder reminder window" hint="Days before the expected reorder date"><TextInput defaultValue="3" className="w-24" /></Field>
                <Button size="sm" onClick={save}>Save changes</Button>
              </CardBody>
            </>
          )}

          {section === 'whatsapp' && (
            <>
              <CardHeader title="WhatsApp Settings" action={<StatusBadge status="Not connected" />} />
              <CardBody className="max-w-md space-y-3.5">
                <Field label="Business number" hint="Connect the Meta Cloud API in a later phase"><TextInput placeholder="+91 XXXXX XXXXX" disabled /></Field>
                <Field label="Default greeting"><TextArea rows={2} defaultValue="Hi, thanks for reaching out to YANA MOTORS! How can we help today?" /></Field>
                <Button size="sm" onClick={save}>Save changes</Button>
              </CardBody>
            </>
          )}

          {section === 'ai-voice' && (
            <>
              <CardHeader title="AI Voice Settings" action={<StatusBadge status="Not connected" />} />
              <CardBody className="max-w-md space-y-3.5">
                <Field label="Voice provider" hint="Connect Retell AI or an equivalent in a later phase"><Select value="" onChange={() => {}} placeholder="Not connected" options={[]} /></Field>
                <Field label="Sales agent name"><TextInput defaultValue="Aria" /></Field>
                <Field label="Support agent name"><TextInput defaultValue="Sahaayak" /></Field>
                <Button size="sm" onClick={save}>Save changes</Button>
              </CardBody>
            </>
          )}

          {section === 'integrations' && (
            <>
              <CardHeader title="Integrations" subtitle="Phase 1 runs on demo data only — these connect in a later phase" />
              <div className="divide-y divide-line px-5">
                {INTEGRATIONS.map((i) => (
                  <div key={i.name} className="flex items-center justify-between py-3">
                    <div><p className="text-[13px] font-medium text-ink-800">{i.name}</p><p className="text-[11.5px] text-ink-500">{i.desc}</p></div>
                    <StatusBadge status="Not connected" />
                  </div>
                ))}
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
