import { useState } from 'react'
import { Bot, Send } from 'lucide-react'
import AppLayout from '../Components/AppLayout'
import PageHeader from '../Components/PageHeader'

const suggested = [
  'How much did I earn today?',
  'Who owes me the most?',
  'Which payments are overdue?',
  'What were my highest expenses this month?',
  'Which products need restocking?',
]

export default function Assistant() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')

  const ask = (question) => {
    const text = question.trim()
    if (!text) return
    setMessages((current) => [
      ...current,
      { role: 'user', text },
      { role: 'assistant', text: 'The AI provider is not connected. This question will be answered from authorized shop data in a later stage.' },
    ])
    setInput('')
  }

  return (
    <AppLayout title="AI Assistant" subtitle="Ask questions about your business data">
      <div className="space-y-6">
        <PageHeader eyebrow="Business intelligence" title="AI Assistant" description="A secure interface for shop-grounded business insights." />
        <section className="grid min-h-[520px] overflow-hidden rounded-xl border border-slate-200 bg-white lg:grid-cols-[260px_1fr]">
          <aside className="border-b border-slate-200 p-4 lg:border-b-0 lg:border-r">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">Suggested questions</p>
            <div className="mt-3 space-y-2">{suggested.map((question) => <button key={question} type="button" onClick={() => ask(question)} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-left text-sm text-slate-700 hover:border-[#159A8A] hover:bg-[#F3FAF9]">{question}</button>)}</div>
          </aside>
          <div className="flex min-h-[420px] flex-col">
            <div className="flex-1 space-y-3 p-5">{messages.length === 0 ? <div className="flex h-full min-h-[300px] items-center justify-center text-center"><div><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-[#E9F5F3] text-[#159A8A]"><Bot size={21} /></span><p className="mt-3 font-bold text-[#172B4D]">How can I help?</p><p className="mt-1 max-w-sm text-sm text-slate-500">Ask a question or choose a suggested question. No AI response is generated until the provider is configured.</p></div></div> : messages.map((message, index) => <div key={index} className={`max-w-xl rounded-lg px-4 py-3 text-sm ${message.role === 'user' ? 'ml-auto bg-[#172B4D] text-white' : 'border border-slate-200 bg-slate-50 text-slate-700'}`}>{message.text}</div>)}</div>
            <form onSubmit={(event) => { event.preventDefault(); ask(input) }} className="flex gap-2 border-t border-slate-200 p-4"><input value={input} onChange={(event) => setInput(event.target.value)} placeholder="Ask about your business" className="min-w-0 flex-1 rounded-lg border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#159A8A]" /><button type="submit" aria-label="Send question" className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#172B4D] text-white"><Send size={16} /></button></form>
          </div>
        </section>
      </div>
    </AppLayout>
  )
}
