import React, { useState } from 'react';
import { X, Database, Download, Trash2, FileText, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { useTranslation } from '../../i18n';
import { useAuth } from '../../context/AuthContext';

interface DataManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataManagementModal: React.FC<DataManagementModalProps> = ({
  isOpen,
  onClose
}) => {
  const { t } = useTranslation();
  const { deleteAccount } = useAuth();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  // Mock data - in real app this would come from API
  const [dataInfo, setDataInfo] = useState({
    lastExport: '2024-12-01',
    totalTransactions: 156,
    totalBudgets: 8,
    totalProjects: 3,
    dataSize: '2.4 MB'
  });

  if (!isOpen) return null;

  const handleExportData = async () => {
    setIsExporting(true);
    
    // Mock export process
    setTimeout(() => {
      // Create mock data
      const exportData = {
        exportDate: new Date().toISOString(),
        user: {
          name: 'Demo Benutzer',
          email: 'demo@finanzapp.at'
        },
        transactions: [
          { id: '1', title: 'Gehalt Max', amount: 3500, date: '2025-01-15', type: 'income' },
          { id: '2', title: 'Miete', amount: -1200, date: '2025-01-01', type: 'expense' }
        ],
        budgets: [
          { id: '1', name: 'Lebensmittel', budgetedAmount: 600, spentAmount: 450 }
        ],
        projects: [
          { id: '1', title: 'Urlaub nach Italien', targetAmount: 2500, currentAmount: 1200 }
        ]
      };

      // Create and download file
      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `finanzapp-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setDataInfo(prev => ({ ...prev, lastExport: new Date().toISOString().split('T')[0] }));
      setIsExporting(false);
      setActiveSection(null);
    }, 2000);
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText === 'LÖSCHEN') {
      setIsDeletingAccount(true);
      setDeleteError(null);
      
      try {
        const { error } = await deleteAccount();
        
        if (error) {
          setDeleteError(error);
          setIsDeletingAccount(false);
        } else {
          // Account deletion successful - user will be automatically logged out
          // No need to do anything else as the AuthContext will handle the logout
        }
      } catch (error) {
        setDeleteError('Ein unerwarteter Fehler ist aufgetreten');
        setIsDeletingAccount(false);
      }
    }
  };

  const DataSection: React.FC<{ 
    id: string; 
    title: string; 
    description: string; 
    status: string; 
    statusColor: string;
    icon: React.ReactNode;
    action: () => void;
    buttonText: string;
    buttonColor?: string;
  }> = ({ id, title, description, status, statusColor, icon, action, buttonText, buttonColor = 'bg-turquoise-500/20 text-turquoise-400 hover:bg-turquoise-500/30' }) => (
    <div className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/10 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-white font-medium">{title}</p>
          <p className="text-white/60 text-sm">{description}</p>
          <p className={`text-xs font-medium ${statusColor}`}>{status}</p>
        </div>
      </div>
      <button
        onClick={action}
        className={`px-4 py-2 rounded-xl font-medium transition-colors ${buttonColor}`}
      >
        {buttonText}
      </button>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-900/95 backdrop-blur-xl border border-white/10 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-turquoise-500/10 rounded-xl">
              <Database className="w-6 h-6 text-turquoise-400" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{t('settings.privacy.dataManagement.title')}</h2>
              <p className="text-white/60 text-sm">{t('settings.privacy.dataManagement.subtitle')}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-white/60" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!activeSection ? (
            <div className="space-y-6">
              {/* Data Overview */}
              <div className="bg-white/5 rounded-xl p-6">
                <h3 className="text-white font-semibold text-lg mb-4">Datenübersicht</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-turquoise-400">{dataInfo.totalTransactions}</p>
                    <p className="text-white/60 text-sm">Transaktionen</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-purple-400">{dataInfo.totalBudgets}</p>
                    <p className="text-white/60 text-sm">Budgets</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-400">{dataInfo.totalProjects}</p>
                    <p className="text-white/60 text-sm">Projekte</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-400">{dataInfo.dataSize}</p>
                    <p className="text-white/60 text-sm">Datengröße</p>
                  </div>
                </div>
              </div>

              {/* Data Management Options */}
              <div className="space-y-4">
                <DataSection
                  id="export"
                  title={t('settings.privacy.dataManagement.exportData')}
                  description={t('settings.privacy.dataManagement.exportDescription')}
                  status={dataInfo.lastExport ? t('settings.privacy.dataManagement.lastExport', { date: dataInfo.lastExport }) : t('settings.privacy.dataManagement.noExports')}
                  statusColor="text-blue-400"
                  icon={<Download className="w-5 h-5 text-white/60" />}
                  action={() => setActiveSection('export')}
                  buttonText={t('common.download')}
                />

                <DataSection
                  id="delete"
                  title={t('settings.privacy.dataManagement.deleteAccount')}
                  description={t('settings.privacy.dataManagement.deleteDescription')}
                  status="Permanent und unwiderruflich"
                  statusColor="text-red-400"
                  icon={<Trash2 className="w-5 h-5 text-white/60" />}
                  action={() => setActiveSection('delete')}
                  buttonText={t('common.delete')}
                  buttonColor="bg-red-500/20 text-red-400 hover:bg-red-500/30"
                />
              </div>

              {/* Legal Links */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold text-lg">Rechtliche Dokumente</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200">
                    <FileText className="w-5 h-5 text-white/60" />
                    <div className="text-left">
                      <p className="text-white font-medium">{t('settings.privacy.dataManagement.privacyPolicy')}</p>
                      <p className="text-white/60 text-sm">Wie wir deine Daten schützen</p>
                    </div>
                  </button>

                  <button className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all duration-200">
                    <FileText className="w-5 h-5 text-white/60" />
                    <div className="text-left">
                      <p className="text-white font-medium">{t('settings.privacy.dataManagement.termsOfService')}</p>
                      <p className="text-white/60 text-sm">Nutzungsbedingungen der App</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* GDPR Info */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <h4 className="text-blue-400 font-medium mb-1">DSGVO-Rechte</h4>
                    <p className="text-blue-300/80 text-sm">
                      Du hast das Recht auf Auskunft, Berichtigung, Löschung und Datenübertragbarkeit deiner personenbezogenen Daten. 
                      Nutze die obigen Funktionen oder kontaktiere uns für weitere Informationen.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Back Button */}
              <button
                onClick={() => setActiveSection(null)}
                className="flex items-center gap-2 text-turquoise-400 hover:text-turquoise-300 transition-colors"
              >
                <X className="w-4 h-4" />
                Zurück zur Übersicht
              </button>

              {/* Export Section */}
              {activeSection === 'export' && (
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-white font-semibold text-lg mb-4">Daten exportieren</h3>
                  
                  {!isExporting ? (
                    <div className="space-y-4">
                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                        <h4 className="text-blue-400 font-medium mb-2">Was wird exportiert?</h4>
                        <ul className="text-blue-300/80 text-sm space-y-1">
                          <li>• Alle deine Transaktionen</li>
                          <li>• Budgets und Ausgaben</li>
                          <li>• Sparziele und Projekte</li>
                          <li>• Persönliche Einstellungen</li>
                          <li>• Familienmitgliedschaften</li>
                        </ul>
                      </div>

                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-yellow-400 font-medium mb-1">Wichtiger Hinweis</h4>
                            <p className="text-yellow-300/80 text-sm">
                              Die exportierte Datei enthält alle deine persönlichen Finanzdaten. 
                              Bewahre sie sicher auf und teile sie nicht mit Dritten.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setActiveSection(null)}
                          className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition-all duration-200"
                        >
                          Abbrechen
                        </button>
                        <button
                          onClick={handleExportData}
                          className="flex-1 bg-gradient-to-r from-blue-500 to-blue-400 text-white font-semibold py-3 rounded-xl hover:from-blue-600 hover:to-blue-500 transition-all duration-200"
                        >
                          Export starten
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <div className="animate-spin w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full mx-auto mb-4"></div>
                      <p className="text-white font-medium mb-2">Daten werden exportiert...</p>
                      <p className="text-white/60 text-sm">Dies kann einen Moment dauern</p>
                    </div>
                  )}
                </div>
              )}

              {/* Delete Account Section */}
              {activeSection === 'delete' && (
                <div className="bg-white/5 rounded-xl p-6">
                  <h3 className="text-white font-semibold text-lg mb-4">Konto löschen</h3>
                  
                  {isDeletingAccount ? (
                    <div className="text-center py-8">
                      <div className="animate-spin w-12 h-12 border-4 border-red-500/20 border-t-red-500 rounded-full mx-auto mb-4"></div>
                      <p className="text-white font-medium mb-2">Konto wird gelöscht...</p>
                      <p className="text-white/60 text-sm">Dies kann einen Moment dauern</p>
                      <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <p className="text-red-400/80 text-xs">
                          <strong>Wichtig:</strong> Schließe diese Seite nicht, bis der Vorgang abgeschlossen ist.
                        </p>
                      </div>
                    </div>
                  ) : !showDeleteConfirmation ? (
                    <div className="space-y-4">
                      {/* Delete Error Message */}
                      {deleteError && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                          <div className="flex items-start gap-3">
                            <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <h4 className="text-red-400 font-medium mb-1">Fehler beim Löschen</h4>
                              <p className="text-red-300/80 text-sm">{deleteError}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-red-400 font-medium mb-1">Achtung: Unwiderrufliche Aktion</h4>
                            <p className="text-red-300/80 text-sm mb-3">
                              Das Löschen deines Kontos ist permanent und kann nicht rückgängig gemacht werden.
                            </p>
                            <ul className="text-red-300/80 text-sm space-y-1">
                              <li>• Alle deine Transaktionen werden gelöscht</li>
                              <li>• Budgets und Sparziele gehen verloren</li>
                              <li>• Familienmitgliedschaften werden beendet</li>
                              <li>• Persönliche Einstellungen werden entfernt</li>
                            </ul>
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                        <h4 className="text-blue-400 font-medium mb-2">Alternativen</h4>
                        <ul className="text-blue-300/80 text-sm space-y-1">
                          <li>• Exportiere deine Daten vor der Löschung</li>
                          <li>• Deaktiviere dein Konto temporär</li>
                          <li>• Kontaktiere den Support für Hilfe</li>
                        </ul>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setActiveSection(null)}
                          className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition-all duration-200"
                        >
                          Abbrechen
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirmation(true)}
                          className="flex-1 bg-gradient-to-r from-red-500 to-red-400 text-white font-semibold py-3 rounded-xl hover:from-red-600 hover:to-red-500 transition-all duration-200"
                        >
                          Konto löschen
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                        <h4 className="text-red-400 font-medium mb-2">Bestätigung erforderlich</h4>
                        <p className="text-red-300/80 text-sm mb-4">
                          Um dein Konto zu löschen, gib "LÖSCHEN" in das Feld unten ein:
                        </p>
                        <input
                          type="text"
                          value={deleteConfirmText}
                          onChange={(e) => setDeleteConfirmText(e.target.value)}
                          className="w-full bg-white/5 border border-red-500/30 rounded-xl px-4 py-3 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-red-500"
                          placeholder="LÖSCHEN eingeben"
                          disabled={isDeletingAccount}
                        />
                      </div>

                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                        <div className="flex items-start gap-3">
                          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div>
                            <h4 className="text-yellow-400 font-medium mb-1">Letzte Warnung</h4>
                            <p className="text-yellow-300/80 text-sm">
                              Diese Aktion löscht dein Konto und ALLE deine Daten permanent. 
                              Stelle sicher, dass du deine Daten exportiert hast, falls du sie behalten möchtest.
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => {
                            setShowDeleteConfirmation(false);
                            setDeleteConfirmText('');
                            setDeleteError(null);
                          }}
                          disabled={isDeletingAccount}
                          className="flex-1 bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-xl transition-all duration-200"
                        >
                          Abbrechen
                        </button>
                        <button
                          onClick={handleDeleteAccount}
                          disabled={deleteConfirmText !== 'LÖSCHEN' || isDeletingAccount}
                          className={`flex-1 font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 ${
                            deleteConfirmText === 'LÖSCHEN' && !isDeletingAccount
                              ? 'bg-gradient-to-r from-red-500 to-red-400 text-white hover:from-red-600 hover:to-red-500'
                              : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {isDeletingAccount ? (
                            <>
                              <div className="animate-spin w-4 h-4 border-2 border-white/20 border-t-white rounded-full"></div>
                              Wird gelöscht...
                            </>
                          ) : (
                            'Konto endgültig löschen'
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex-shrink-0">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-turquoise-500 to-turquoise-400 text-white font-semibold py-3 px-6 rounded-xl hover:from-turquoise-600 hover:to-turquoise-500 transition-all duration-200 active:scale-[0.98]"
            >
              {t('common.close')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};