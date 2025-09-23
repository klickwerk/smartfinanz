import React, { useState } from 'react';
import { BarChart3, Target, Calendar, Users, Repeat, PiggyBank, TrendingUp, TrendingDown, ChevronDown, ChevronUp } from 'lucide-react';
import { GlassCard } from '../common/GlassCard';
import { GroupedTransactionDetailModal } from './GroupedTransactionDetailModal';
import { YearlyData, FinancialProject, GroupedYearlyTransaction } from '../../types';
import { useCurrency } from '../../context/CurrencyContext';
import { formatCurrency } from '../../utils/formatUtils';

interface YearlyProjectionCardProps {
  yearlyData: YearlyData;
  projects: FinancialProject[];
}

export const YearlyProjectionCard: React.FC<YearlyProjectionCardProps> = ({ yearlyData, projects }) => {
  const { displayCurrency } = useCurrency();
  const [showGroupedTransactions, setShowGroupedTransactions] = useState(false);
  const [selectedGroupedTransaction, setSelectedGroupedTransaction] = useState<GroupedYearlyTransaction | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const quarters = [
    { name: 'Q1', income: yearlyData.quarters.q1.income, expenses: yearlyData.quarters.q1.expenses },
    { name: 'Q2', income: yearlyData.quarters.q2.income, expenses: yearlyData.quarters.q2.expenses },
    { name: 'Q3', income: yearlyData.quarters.q3.income, expenses: yearlyData.quarters.q3.expenses },
    { name: 'Q4', income: yearlyData.quarters.q4.income, expenses: yearlyData.quarters.q4.expenses }
  ];

  // Find the maximum value for scaling the bars
  const maxValue = Math.max(
    ...quarters.flatMap(q => [q.income, q.expenses])
  );

  // Calculate project totals
  const totalProjectTarget = projects.reduce((sum, project) => sum + project.targetAmount, 0);
  const totalProjectCurrent = projects.reduce((sum, project) => sum + project.currentAmount, 0);
  const projectProgress = totalProjectTarget > 0 ? (totalProjectCurrent / totalProjectTarget) * 100 : 0;

  const handleGroupedTransactionClick = (groupedTransaction: GroupedYearlyTransaction) => {
    setSelectedGroupedTransaction(groupedTransaction);
    setIsDetailModalOpen(true);
  };

  const getRecurrenceText = (recurrence?: string) => {
    switch (recurrence) {
      case 'monthly': return 'Monatlich';
      case 'quarterly': return 'Quartalsweise';
      case 'yearly': return 'Jährlich';
      default: return 'Einmalig';
    }
  };

  // Separate income and expense groups
  const incomeGroups = yearlyData.groupedTransactions.filter(g => g.type === 'income');
  const expenseGroups = yearlyData.groupedTransactions.filter(g => g.type === 'expense');

  return (
    <>
      <GlassCard>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 rounded-xl">
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-lg">Jahresprognose</h3>
              <p className="text-white/60 text-sm">{yearlyData.year}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex gap-4">
              <div className="text-center">
                <p className="text-blue-400 font-bold text-lg">{formatCurrency(yearlyData.totalIncome, displayCurrency.value)}</p>
                <p className="text-white/60 text-xs">Einkommen</p>
              </div>
              <div className="text-center">
                <p className="text-red-400 font-bold text-lg">{formatCurrency(yearlyData.totalExpenses, displayCurrency.value)}</p>
                <p className="text-white/60 text-xs">Ausgaben</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-end justify-between gap-3 mb-6 h-32">
          {quarters.map((quarter) => (
            <div key={quarter.name} className="flex-1 flex flex-col items-center">
              <div className="w-full flex flex-col justify-end h-24 gap-1">
                {/* Income bar (blue) */}
                <div 
                  className="bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md transition-all duration-700 ease-out"
                  style={{ height: `${maxValue > 0 ? (quarter.income / maxValue) * 100 : 0}%` }}
                />
                {/* Expenses bar (red) - positioned below income */}
                <div 
                  className={`rounded-b-md transition-all duration-700 ease-out ${
                    quarter.expenses > quarter.income 
                      ? 'bg-gradient-to-t from-red-600 to-red-500' 
                      : 'bg-gradient-to-t from-red-500 to-red-400'
                  }`}
                  style={{ height: `${maxValue > 0 ? (quarter.expenses / maxValue) * 100 : 0}%` }}
                />
              </div>
              <p className="text-white/60 text-xs mt-2">{quarter.name}</p>
              <div className="text-center">
                <p className="text-blue-400 text-xs font-medium">{(quarter.income / 1000).toFixed(0)}k</p>
                <p className="text-red-400 text-xs font-medium">{(quarter.expenses / 1000).toFixed(0)}k</p>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-blue-400 rounded"></div>
            <span className="text-white/60 text-xs">Einkommen</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gradient-to-r from-red-500 to-red-400 rounded"></div>
            <span className="text-white/60 text-xs">Ausgaben</span>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl mb-4">
          <Target className="w-5 h-5 text-purple-400" />
          <div className="flex-1">
            <p className="text-white font-medium text-sm">Sparziele 2025</p>
            <p className="text-white/60 text-xs">
              {formatCurrency(totalProjectCurrent, displayCurrency.value)} von {formatCurrency(totalProjectTarget, displayCurrency.value)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-purple-400 font-semibold">{Math.round(projectProgress)}%</p>
            <p className="text-white/60 text-xs">erreicht</p>
          </div>
        </div>

        {/* Grouped Transactions Section */}
        <div className="border-t border-white/10 pt-4">
          <button
            onClick={() => setShowGroupedTransactions(!showGroupedTransactions)}
            className="w-full flex items-center justify-between p-3 hover:bg-white/5 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-turquoise-400" />
              <div className="text-left">
                <p className="text-white font-medium">Jahresübersicht Details</p>
                <p className="text-white/60 text-sm">
                  {yearlyData.groupedTransactions.length} kumulierte Posten
                </p>
              </div>
            </div>
            {showGroupedTransactions ? (
              <ChevronUp className="w-5 h-5 text-white/60" />
            ) : (
              <ChevronDown className="w-5 h-5 text-white/60" />
            )}
          </button>

          {showGroupedTransactions && (
            <div className="mt-4 space-y-4">
              {/* Income Groups */}
              {incomeGroups.length > 0 && (
                <div>
                  <h4 className="text-green-400 font-medium text-sm mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Einkommen ({incomeGroups.length} Posten)
                  </h4>
                  <div className="space-y-2">
                    {incomeGroups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => handleGroupedTransactionClick(group)}
                        className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-[1.01]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-500/10 rounded-lg">
                            {group.isBudgetGroup ? (
                              <PiggyBank className="w-4 h-4 text-green-400" />
                            ) : group.recurrence && group.recurrence !== 'none' ? (
                              <Repeat className="w-4 h-4 text-green-400" />
                            ) : (
                              <TrendingUp className="w-4 h-4 text-green-400" />
                            )}
                          </div>
                          <div className="text-left">
                            <p className="text-white font-medium text-sm">{group.title}</p>
                            <div className="flex items-center gap-2 text-xs text-white/60">
                              <span>{group.category}</span>
                              {group.transactionCount > 1 && (
                                <>
                                  <span>•</span>
                                  <span>{group.transactionCount}x {getRecurrenceText(group.recurrence)}</span>
                                </>
                              )}
                              {group.assignedTo && (
                                <>
                                  <span>•</span>
                                  <span>{group.assignedTo}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-green-400 font-semibold">
                            +{formatCurrency(group.totalAmount, displayCurrency.value)}
                          </p>
                          {group.transactionCount > 1 && (
                            <p className="text-white/40 text-xs">
                              {group.transactionCount} Posten
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Expense Groups */}
              {expenseGroups.length > 0 && (
                <div>
                  <h4 className="text-red-400 font-medium text-sm mb-3 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Ausgaben ({expenseGroups.length} Posten)
                  </h4>
                  <div className="space-y-2">
                    {expenseGroups.map((group) => (
                      <button
                        key={group.id}
                        onClick={() => handleGroupedTransactionClick(group)}
                        className="w-full flex items-center justify-between p-3 bg-white/5 hover:bg-white/10 rounded-xl transition-all duration-200 hover:scale-[1.01]"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-red-500/10 rounded-lg">
                            {group.isBudgetGroup ? (
                              <PiggyBank className="w-4 h-4 text-red-400" />
                            ) : group.recurrence && group.recurrence !== 'none' ? (
                              <Repeat className="w-4 h-4 text-red-400" />
                            ) : (
                              <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                          </div>
                          <div className="text-left">
                            <p className="text-white font-medium text-sm">{group.title}</p>
                            <div className="flex items-center gap-2 text-xs text-white/60">
                              <span>{group.category}</span>
                              {group.transactionCount > 1 && (
                                <>
                                  <span>•</span>
                                  <span>{group.transactionCount}x {getRecurrenceText(group.recurrence)}</span>
                                </>
                              )}
                              {group.assignedTo && (
                                <>
                                  <span>•</span>
                                  <span>{group.assignedTo}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-red-400 font-semibold">
                            -{formatCurrency(group.totalAmount, displayCurrency.value)}
                          </p>
                          {group.transactionCount > 1 && (
                            <p className="text-white/40 text-xs">
                              {group.transactionCount} Posten
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {yearlyData.groupedTransactions.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-white/40 text-sm">Keine Transaktionen für dieses Jahr geplant</p>
                </div>
              )}
            </div>
          )}
        </div>
      </GlassCard>

      {/* Detail Modal */}
      <GroupedTransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        groupedTransaction={selectedGroupedTransaction}
      />
    </>
  );
};