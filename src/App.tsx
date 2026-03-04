import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  IndianRupee, 
  Calendar, 
  Percent, 
  ChevronDown, 
  ChevronUp,
  Info,
  History,
  TrendingUp,
  CreditCard
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface AmortizationItem {
  month: number;
  emi: number;
  principal: number;
  interest: number;
  balance: number;
}

export default function App() {
  const [loanAmount, setLoanAmount] = useState<string>("1000000");
  const [interestRate, setInterestRate] = useState<string>("8.5");
  const [tenure, setTenure] = useState<string>("20");
  const [tenureType, setTenureType] = useState<'years' | 'months'>('years');
  const [showSchedule, setShowSchedule] = useState(false);

  const calculation = useMemo(() => {
    const p = parseFloat(loanAmount) || 0;
    const r = (parseFloat(interestRate) || 0) / 12 / 100;
    const t = parseFloat(tenure) || 0;
    const n = tenureType === 'years' ? t * 12 : t;

    if (n <= 0 || p <= 0) return { emi: 0, totalAmount: 0, totalInterest: 0, amortization: [] };

    if (r === 0) {
      const emi = p / n;
      return {
        emi,
        totalAmount: p,
        totalInterest: 0,
        amortization: Array.from({ length: n }, (_, i) => ({
          month: i + 1,
          emi,
          principal: emi,
          interest: 0,
          balance: p - (i + 1) * emi
        }))
      };
    }

    const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    const totalAmount = emi * n;
    const totalInterest = totalAmount - p;

    const amortization: AmortizationItem[] = [];
    let balance = p;
    for (let i = 1; i <= n; i++) {
      const interest = balance * r;
      const principal = emi - interest;
      balance -= principal;
      amortization.push({
        month: i,
        emi,
        principal,
        interest,
        balance: Math.max(0, balance)
      });
    }

    return { emi, totalAmount, totalInterest, amortization };
  }, [loanAmount, interestRate, tenure, tenureType]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Header */}
      <header className="bg-white border-b border-slate-100 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-xl">
              <Calculator className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-800">Calculate Karlo</h1>
          </div>
          <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 pt-6 space-y-6">
        {/* Result Summary */}
        <section>
          <div className="bg-indigo-600 p-6 rounded-3xl text-white shadow-xl shadow-indigo-200 relative overflow-hidden text-center">
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl"></div>
            
            <p className="text-indigo-100 text-xs font-medium mb-1">Monthly EMI Amount</p>
            <h2 className="text-3xl font-bold">{formatCurrency(calculation.emi)}</h2>
          </div>
        </section>

        {/* Input Card */}
        <section className="card space-y-5">
          <div className="input-group">
            <label className="label flex items-center gap-2">
              <IndianRupee className="w-4 h-4" />
              Loan Amount
            </label>
            <div className="relative">
              <input 
                type="number" 
                value={loanAmount}
                onChange={(e) => setLoanAmount(e.target.value)}
                className="input-field pr-12"
                placeholder="e.g. 10,00,000"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">₹</span>
            </div>
          </div>

          <div className="input-group">
            <label className="label flex items-center gap-2">
              <Percent className="w-4 h-4" />
              Interest Rate (p.a)
            </label>
            <div className="relative">
              <input 
                type="number" 
                step="0.1"
                value={interestRate}
                onChange={(e) => setInterestRate(e.target.value)}
                className="input-field pr-12"
                placeholder="e.g. 8.5"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">%</span>
            </div>
          </div>

          <div className="input-group">
            <div className="flex items-center justify-between mb-1">
              <label className="label flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tenure
              </label>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setTenureType('years')}
                  className={cn(
                    "px-3 py-1 text-xs font-bold rounded-md transition-all",
                    tenureType === 'years' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
                  )}
                >
                  Years
                </button>
                <button 
                  onClick={() => setTenureType('months')}
                  className={cn(
                    "px-3 py-1 text-xs font-bold rounded-md transition-all",
                    tenureType === 'months' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500"
                  )}
                >
                  Months
                </button>
              </div>
            </div>
            <div className="relative">
              <input 
                type="number" 
                value={tenure}
                onChange={(e) => setTenure(e.target.value)}
                className="input-field pr-16"
                placeholder={tenureType === 'years' ? "e.g. 20" : "e.g. 240"}
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                {tenureType === 'years' ? 'Yrs' : 'Mos'}
              </span>
            </div>
          </div>
        </section>

        {/* Repayment Schedule Dropdown */}
        <section className="card overflow-hidden">
          <button 
            onClick={() => setShowSchedule(!showSchedule)}
            className="w-full flex items-center justify-between py-2"
          >
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-800">Repayment Schedule</h3>
            </div>
            {showSchedule ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
          </button>
          
          {showSchedule && (
            <div className="mt-6 overflow-x-auto -mx-6 px-6 border-t border-slate-100 pt-4">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-100">
                    <th className="pb-3 font-semibold">Month</th>
                    <th className="pb-3 font-semibold text-right">Principal</th>
                    <th className="pb-3 font-semibold text-right">Interest</th>
                    <th className="pb-3 font-semibold text-right">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {calculation.amortization.map((item) => (
                    <tr key={item.month}>
                      <td className="py-3 text-slate-600 font-medium">{item.month}</td>
                      <td className="py-3 text-right text-slate-800">{formatCurrency(item.principal)}</td>
                      <td className="py-3 text-right text-rose-500">{formatCurrency(item.interest)}</td>
                      <td className="py-3 text-right text-slate-800 font-medium">{formatCurrency(item.balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>

      {/* Footer Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-6 py-3 z-20">
        <div className="max-w-md mx-auto flex items-center justify-around">
          <button className="flex flex-col items-center gap-1 text-indigo-600">
            <Calculator className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Calculator</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <CreditCard className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">Loans</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-slate-400">
            <History className="w-6 h-6" />
            <span className="text-[10px] font-bold uppercase tracking-wider">History</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
