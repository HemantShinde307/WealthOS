import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AiInsightService } from '../../../core/services/ai-insight.service';
import { PortfolioService } from '../../../core/services/portfolio.service';
import { FixedDepositService } from '../../../core/services/fixed-deposit.service';
import { TransactionService } from '../../../core/services/transaction.service';
import { AuthService } from '../../../core/services/auth.service';

interface ChatMessage {
  from: 'user' | 'ai';
  text: string;
}

@Component({
  selector: 'app-ai-assistant',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ai-assistant.component.html',
})
export class AiAssistantComponent {
  private readonly insight = inject(AiInsightService);
  private readonly portfolio = inject(PortfolioService);
  private readonly fd = inject(FixedDepositService);
  private readonly transactionService = inject(TransactionService);
  private readonly auth = inject(AuthService);

  readonly scrollAnchor = viewChild<ElementRef<HTMLDivElement>>('scrollAnchor');

  readonly suggestedQuestions = [
    'How much have I earned overall?',
    'Which of my investments is performing worst?',
    'When is my next FD maturing?',
    "What's my asset allocation?",
    'Do I have any idle cash?',
    'Are my goals on track?',
  ];

  readonly draft = signal('');
  readonly messages = signal<ChatMessage[]>([
    { from: 'ai', text: "Hi! I'm your WealthOS AI Assistant. Ask me anything about your portfolio — returns, allocation, FD maturities, or goals." },
  ]);

  ask(question: string): void {
    const text = question.trim();
    if (!text) return;
    this.messages.update((m) => [...m, { from: 'user', text }]);
    this.draft.set('');
    const answer = this.computeAnswer(text);
    setTimeout(() => {
      this.messages.update((m) => [...m, { from: 'ai', text: answer }]);
      queueMicrotask(() => this.scrollAnchor()?.nativeElement.scrollIntoView({ behavior: 'smooth' }));
    }, 350);
  }

  private computeAnswer(question: string): string {
    const q = question.toLowerCase();

    if (/(earn|return|profit|gain|perform.*overall|how.*doing)/.test(q)) {
      const pl = this.portfolio.unrealizedPl();
      const pct = this.portfolio.absoluteReturnPct();
      return `Your mutual fund portfolio has ${pl >= 0 ? 'gained' : 'lost'} ₹${Math.abs(pl).toLocaleString('en-IN')} overall, an absolute return of ${pct}% (XIRR ≈ ${this.portfolio.xirr}% annualized). ${
        pct > 0 ? "That's ahead of a typical fixed deposit over the same period." : ''
      }`;
    }

    if (/(worst|underperform|losing|down)/.test(q)) {
      const w = this.insight.worstHolding();
      if (!w) return "You don't have any holdings to compare yet.";
      return `${w.schemeName} is your weakest holding right now, at ${w.unrealizedPlPct >= 0 ? '+' : ''}${w.unrealizedPlPct}% (₹${w.currentValue.toLocaleString('en-IN')} current value vs ₹${w.investedValue.toLocaleString('en-IN')} invested). ${
        w.unrealizedPlPct < 0 ? "It's still a loss on paper — I wouldn't panic-sell based on short-term performance alone, but it's worth reviewing against your goals." : "Even your 'worst' holding is still in profit — your portfolio is in decent shape overall."
      }`;
    }

    if (/(best|top.*perform|winning)/.test(q)) {
      const b = this.insight.bestHolding();
      if (!b) return "You don't have any holdings to compare yet.";
      return `${b.schemeName} is your best performer, up ${b.unrealizedPlPct}% (₹${b.currentValue.toLocaleString('en-IN')} current value vs ₹${b.investedValue.toLocaleString('en-IN')} invested).`;
    }

    if (/(fd|fixed deposit).*(matur|due)|next.*fd/.test(q) || /matur/.test(q)) {
      const deposits = [...this.fd.deposits()].sort((a, b) => new Date(a.maturityDate).getTime() - new Date(b.maturityDate).getTime());
      const next = deposits[0];
      if (!next) return "You don't have any fixed deposits on record.";
      const days = this.fd.daysToMaturity(next);
      return `Your next FD to mature is with ${next.issuer} — ₹${next.principal.toLocaleString('en-IN')} at ${next.interestRate}%, maturing on ${new Date(next.maturityDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} (in ${days} day${days === 1 ? '' : 's'}).`;
    }

    if (/(allocation|asset mix|where.*money|net worth|diversif)/.test(q)) {
      return `${this.insight.summary()} Based on your ${this.insight.riskProfile().toLowerCase()} risk profile, ${
        this.insight.rebalancingNudges().length > 0 ? 'a few areas look worth rebalancing — check the AI Insights page for details.' : 'your mix looks reasonably well balanced.'
      }`;
    }

    if (/(idle|spare|unused).*(cash|money)|cash.*idle/.test(q)) {
      const idle = this.fd.idleCash();
      return idle > 0
        ? `Yes — you have ₹${idle.toLocaleString('en-IN')} sitting idle in your bank account, earning little to no interest. Even a liquid fund or short-term FD would put it to work.`
        : "You don't have significant idle cash right now — nice work keeping your money deployed.";
    }

    if (/(goal|on track|falling behind)/.test(q)) {
      const health = this.insight.goalHealth();
      const behind = health.filter((h) => !h.onTrack);
      if (health.length === 0) return "You haven't set up any goals yet. Create one from the Goals page to start tracking progress.";
      if (behind.length === 0) return `All ${health.length} of your goals look on track. Keep it up!`;
      return `${behind.length} of your ${health.length} goal${health.length === 1 ? '' : 's'} may be falling behind: ${behind.map((h) => h.goal.name).join(', ')}. Consider increasing the monthly contribution or extending the timeline.`;
    }

    if (/(transaction|history|recent)/.test(q)) {
      const customerId = this.auth.currentUser().customerId;
      const recent = this.transactionService
        .transactions()
        .filter((t) => t.clientId === customerId)
        .slice(0, 3);
      if (!recent.length) return "You don't have any transactions yet — make your first investment or import your CAS statement to get started.";
      return `Your most recent transactions: ${recent.map((t) => `${t.type} of ₹${t.amount.toLocaleString('en-IN')} in ${t.schemeName} on ${new Date(t.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}`).join('; ')}.`;
    }

    return "I can help with questions about your returns, best/worst performing funds, FD maturities, asset allocation, idle cash, or goal progress. Try one of the suggestions below, or rephrase your question.";
  }
}
