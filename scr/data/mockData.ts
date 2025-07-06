import { Transaction, FinancialProject, MonthlyData, YearlyData } from '../types';

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    title: 'Miete Januar',
    amount: -850,
    category: 'Wohnen',
    date: '2025-01-05',
    type: 'expense',
    currency: 'EUR',
    status: 'overdue',
    description: 'Monatliche Miete für Wohnung',
    tags: ['fixkosten', 'wohnen']
  },
  {
    id: '2',
    title: 'Gehalt',
    amount: 3200,
    category: 'Einkommen',
    date: '2025-01-01',
    type: 'income',
    currency: 'EUR',
    status: 'completed',
    description: 'Monatliches Gehalt',
    tags: ['einkommen', 'arbeit']
  },
  {
    id: '3',
    title: 'Strom & Gas',
    amount: -120,
    category: 'Nebenkosten',
    date: '2025-01-10',
    type: 'expense',
    currency: 'EUR',
    status: 'pending',
    description: 'Monatliche Energiekosten',
    tags: ['nebenkosten', 'energie']
  },
  {
    id: '4',
    title: 'Freelance Projekt',
    amount: 800,
    category: 'Nebeneinkommen',
    date: '2025-01-15',
    type: 'income',
    currency: 'EUR',
    status: 'pending',
    description: 'Webdesign Projekt',
    tags: ['freelance', 'nebeneinkommen']
  },
  {
    id: '5',
    title: 'Neue Küche',
    amount: -5000,
    category: 'Wohnen',
    date: '2025-06-01',
    type: 'expense',
    currency: 'EUR',
    status: 'someday',
    description: 'Küchenrenovierung - noch nicht sicher wann',
    tags: ['renovation', 'wohnen', 'großausgabe']
  },
  {
    id: '6',
    title: 'Urlaubsgeld',
    amount: 1500,
    category: 'Bonus',
    date: '2025-07-01',
    type: 'income',
    currency: 'EUR',
    status: 'pending',
    description: 'Jährliches Urlaubsgeld',
    tags: ['bonus', 'urlaub']
  },
  {
    id: '7',
    title: 'Auto Reparatur',
    amount: -800,
    category: 'Transport',
    date: '',
    type: 'expense',
    currency: 'EUR',
    status: 'someday',
    description: 'Eventuell nötige Reparatur - noch unklar',
    tags: ['auto', 'reparatur']
  },
  {
    id: '8',
    title: 'Versicherung Q1',
    amount: -450,
    category: 'Versicherung',
    date: '2025-03-31',
    type: 'expense',
    currency: 'EUR',
    status: 'pending',
    description: 'Quartalsweise Versicherungszahlung',
    tags: ['versicherung', 'quartal']
  },
  {
    id: '9',
    title: 'Steuerrückerstattung',
    amount: 1200,
    category: 'Steuern',
    date: '2025-05-15',
    type: 'income',
    currency: 'EUR',
    status: 'pending',
    description: 'Erwartete Steuerrückerstattung',
    tags: ['steuern', 'rückerstattung']
  },
  {
    id: '10',
    title: 'Weihnachtsgeschenke',
    amount: -600,
    category: 'Entertainment',
    date: '2025-12-20',
    type: 'expense',
    currency: 'EUR',
    status: 'pending',
    description: 'Budget für Weihnachtsgeschenke',
    tags: ['geschenke', 'weihnachten']
  }
];

export const mockProjects: FinancialProject[] = [
  {
    id: '1',
    title: 'Urlaub nach Italien',
    description: 'Gemeinsamer Sommerurlaub mit Freunden',
    targetAmount: 2500,
    currentAmount: 1200,
    dueDate: '2025-07-01',
    participants: [
      { id: '1', name: 'Anna M.', avatar: 'AM', contribution: 600 },
      { id: '2', name: 'Thomas K.', avatar: 'TK', contribution: 400 },
      { id: '3', name: 'Lisa W.', avatar: 'LW', contribution: 200 }
    ],
    status: 'active',
    category: 'Reisen',
    currency: 'EUR'
  },
  {
    id: '2',
    title: 'Neue Küche',
    description: 'Küchenrenovierung für die Wohnung',
    targetAmount: 5000,
    currentAmount: 3200,
    dueDate: '2025-05-01',
    participants: [
      { id: '1', name: 'Max S.', avatar: 'MS', contribution: 1600 },
      { id: '2', name: 'Sarah L.', avatar: 'SL', contribution: 1600 }
    ],
    status: 'active',
    category: 'Wohnen',
    currency: 'EUR'
  }
];

export const monthlyData: MonthlyData[] = [
  { month: 'Jan', income: 4000, expenses: 2800, balance: 1200 },
  { month: 'Feb', income: 3800, expenses: 2900, balance: 900 },
  { month: 'Mar', income: 4200, expenses: 3100, balance: 1100 },
  { month: 'Apr', income: 3900, expenses: 2700, balance: 1200 },
  { month: 'Mai', income: 4100, expenses: 2800, balance: 1300 },
  { month: 'Jun', income: 4300, expenses: 3200, balance: 1100 }
];

export const yearlyData: YearlyData = {
  year: 2025,
  quarters: {
    q1: 12000,
    q2: 12500,
    q3: 13000,
    q4: 12800
  },
  total: 50300
};