import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, ArrowRight, Upload, FileText } from 'lucide-react';
import { FaqSchema } from '../components/seo/FaqSchema';
import { designSystem } from '../styles/designSystem';

export default function FaqPage() {
  const navigate = useNavigate();

  useEffect(() => {
    document.title = 'DYD CV-Check & Lebenslauf Generator – FAQ';

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Antworten zu CV-Analyse, ATS-Optimierung, Stripe-Bezahlung, Zertifikats-PDFs und Datenschutz bei DYD – Decide Your Dream.'
      );
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Antworten zu CV-Analyse, ATS-Optimierung, Stripe-Bezahlung, Zertifikats-PDFs und Datenschutz bei DYD – Decide Your Dream.';
      document.head.appendChild(meta);
    }
  }, []);

  const faqs = [
    {
      question: 'Was ist DYD – Decide Your Dream?',
      answer:
        'DYD ist eine KI-gestützte Plattform für CV-Analyse und Lebenslauf-Erstellung. Die Plattform nutzt fortschrittliche Analyse-Tools, um Lebensläufe auf ATS-Kompatibilität zu prüfen und optimierte CV-Vorschläge zu generieren.',
      details:
        'Das System besteht aus zwei Hauptfunktionen: CV-Check analysiert hochgeladene Lebensläufe und erstellt detaillierte Bewertungen mit Verbesserungsvorschlägen. Der CV-Wizard führt Nutzer Schritt für Schritt durch die Erstellung eines neuen Lebenslaufs mit KI-Unterstützung bei der Formulierung von Aufgaben und Erfolgen.',
    },
    {
      question: 'Wie funktioniert die CV-Analyse?',
      answer:
        'Sie laden einen Lebenslauf als PDF hoch, der automatisch analysiert wird. Das System prüft ATS-Kompatibilität, Struktur, Formulierungen und erstellt einen detaillierten Bericht.',
      details:
        'Nach dem Upload wird die Datei in Supabase Storage gespeichert und via Make.com-Webhook an die Analyse-Pipeline weitergeleitet. Die Ergebnisse umfassen ATS-Score, Kategorien-Bewertungen und konkrete Verbesserungsvorschläge. Der gesamte Prozess läuft automatisiert und liefert Ergebnisse innerhalb weniger Minuten.',
    },
    {
      question: 'Wie läuft die CV-Erstellung ab?',
      answer:
        'Der CV-Wizard führt Sie durch einen mehrstufigen Prozess mit Fragen zu persönlichen Daten, Ausbildung, Berufserfahrung und Skills. Die KI unterstützt bei der Formulierung.',
      details:
        'Sie beginnen mit der Eingabe von Kontaktdaten und Berufserfahrung. Das System generiert dann KI-gestützte Formulierungsvorschläge für Ihre Aufgaben und Erfolge. Am Ende können Sie aus verschiedenen Vorlagen wählen und erhalten einen professionell formatierten Lebenslauf als PDF oder DOCX.',
    },
    {
      question: 'Welche Rolle spielt Make.com im Prozess?',
      answer:
        'Make.com dient als Automatisierungs-Backend für CV-Analysen und KI-Generierungen. Alle Uploads und Optimierungsanfragen werden über Make-Webhooks verarbeitet.',
      details:
        'Nach jedem CV-Upload wird ein Make.com-Webhook ausgelöst, der die Datei entgegennimmt und die Analyse-Pipeline startet. Die Ergebnisse werden zurück in die Supabase-Datenbank geschrieben. Auch bei der CV-Optimierung für spezifische Stellenanzeigen wird Make.com zur Verarbeitung der KI-Anfragen genutzt.',
    },
    {
      question: 'Wie funktioniert die Bezahlung über Stripe?',
      answer:
        'Die Plattform nutzt Stripe als Zahlungsanbieter. Sie können Token-Pakete oder einzelne CV-Checks kaufen, die Zahlung erfolgt sicher über Stripe Checkout.',
      details:
        'Nach Auswahl eines Token-Pakets werden Sie zu Stripe Checkout weitergeleitet. Nach erfolgreicher Zahlung wird Ihr Token-Guthaben automatisch aktualisiert. Stripe Webhooks sorgen dafür, dass die Token-Gutschrift in Echtzeit erfolgt. Alle Zahlungsdaten werden ausschließlich bei Stripe verarbeitet.',
    },
    {
      question: 'Was passiert nach dem Kauf von Tokens?',
      answer:
        'Nach erfolgreicher Zahlung werden die Token Ihrem Account gutgeschrieben. Sie können diese für CV-Checks, Optimierungen oder Generierungen verwenden.',
      details:
        'Token werden in der Datenbank Ihrem Benutzerkonto zugeordnet und sind sofort verfügbar. Jede CV-Analyse oder Optimierung kostet ein Token. Der aktuelle Token-Stand wird im Dashboard angezeigt. Token verfallen nicht und können jederzeit verwendet werden.',
    },
    {
      question: 'Werden meine Daten gespeichert?',
      answer:
        'Ja, hochgeladene CVs und Analyseergebnisse werden in Supabase gespeichert. Bei angemeldeten Nutzern bleiben die Daten im Account verfügbar.',
      details:
        'Uploads werden in Supabase Storage abgelegt, Analyseergebnisse in der Datenbank. Für nicht-angemeldete Nutzer werden Daten session-basiert gespeichert. Angemeldete Nutzer können ihre gespeicherten Analysen und CVs jederzeit im Dashboard einsehen und erneut aufrufen.',
    },
    {
      question: 'Wie sicher sind Uploads?',
      answer:
        'Alle Uploads erfolgen über HTTPS und werden in Supabase Storage mit Row Level Security gespeichert. Nur Sie haben Zugriff auf Ihre Dateien.',
      details:
        'Die Plattform nutzt Supabase Authentication und Row Level Security Policies, um sicherzustellen, dass nur autorisierte Nutzer auf ihre eigenen Daten zugreifen können. Dateien werden verschlüsselt übertragen und gespeichert. Signierte URLs für Datei-Zugriffe sind zeitlich begrenzt.',
    },
    {
      question: 'Kann ich Zertifikate als eigene PDFs erstellen?',
      answer:
        'Die Plattform fokussiert sich auf Lebensläufe. Separate Zertifikats-PDFs sind aktuell nicht als Funktion implementiert.',
      details:
        'Im CV-Wizard können Sie Zertifikate als Abschnitt in Ihrem Lebenslauf aufführen. Eine dedizierte Funktion zum Erstellen einzelner Zertifikats-PDFs ist derzeit nicht verfügbar, könnte aber als zukünftiges Feature ergänzt werden.',
    },
    {
      question: 'Unterstützt DYD ATS-optimierte Lebensläufe?',
      answer:
        'Ja, die CV-Analyse prüft explizit auf ATS-Kompatibilität. Das System bewertet Formatierung, Keywords und Struktur nach ATS-Kriterien.',
      details:
        'ATS-Systeme scannen Lebensläufe automatisiert nach Keywords und Strukturen. Die DYD-Analyse identifiziert Schwachstellen wie fehlende Keywords, unklare Formatierung oder problematische PDF-Strukturen. Die generierten CV-Vorlagen sind ATS-optimiert gestaltet.',
    },
    {
      question: 'Welche Dateiformate werden akzeptiert?',
      answer:
        'Für CV-Uploads werden PDF-Dateien akzeptiert. Die exportierten Lebensläufe können als PDF oder DOCX heruntergeladen werden.',
      details:
        'PDF ist das Standard-Upload-Format, da es plattformübergreifend konsistent dargestellt wird. Bei der Erstellung neuer CVs können Sie zwischen PDF und DOCX wählen, um das Dokument später selbst zu bearbeiten.',
    },
    {
      question: 'Für wen ist DYD gedacht?',
      answer:
        'DYD richtet sich an Jobsuchende, Berufseinsteiger und alle, die ihren Lebenslauf professionalisieren möchten. Auch für Bewerbungscoaches geeignet.',
      details:
        'Die Plattform unterstützt verschiedene Karrierestufen: Auszubildende können strukturierte Lebensläufe erstellen, Berufserfahrene ihre CVs optimieren, und Coaches können die Tools für Klienten nutzen. Die B2B-Funktionen ermöglichen Unternehmen, das Tool für Mitarbeiter-Onboarding einzusetzen.',
    },
    {
      question: 'Gibt es eine kostenlose Version?',
      answer:
        'Der erste CV-Check kann mit eingeschränkten Features getestet werden. Für vollständige Analysen und unbegrenzte Nutzung sind Token erforderlich.',
      details:
        'Neue Nutzer können die Plattform zunächst erkunden und eine erste Analyse durchführen. Für regelmäßige Nutzung, erweiterte Analysen und die CV-Erstellung sind Token-Pakete verfügbar. Diese können einzeln oder als Mehrfach-Pakete erworben werden.',
    },
    {
      question: 'Wie schnell bekomme ich mein Ergebnis?',
      answer:
        'CV-Analysen dauern in der Regel 2-5 Minuten. Die CV-Erstellung ist sofort verfügbar, sobald Sie alle Schritte im Wizard abgeschlossen haben.',
      details:
        'Nach dem Upload wird die Datei automatisch an Make.com weitergeleitet und verarbeitet. Die Analyseergebnisse werden in Echtzeit in die Datenbank geschrieben. Sie können den Status Ihrer Analyse im Dashboard verfolgen und werden benachrichtigt, sobald das Ergebnis verfügbar ist.',
    },
  ];

  const faqSchemaData = faqs.map((faq) => ({
    question: faq.question,
    answer: `${faq.answer} ${faq.details}`,
  }));

  return (
    <>
      <FaqSchema faqs={faqSchemaData} />

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
          {/* Header */}
          <motion.div
            className="text-center mb-12 sm:mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <HelpCircle className="w-10 h-10 sm:w-12 sm:h-12 text-[#66c0b6]" />
              <h1 className={designSystem.headings.h1}>FAQ</h1>
            </div>
            <p className={`${designSystem.text.secondary} text-lg sm:text-xl max-w-2xl mx-auto`}>
              Häufig gestellte Fragen zu DYD – Decide Your Dream
            </p>
          </motion.div>

          {/* FAQ Items */}
          <div className="space-y-8 sm:space-y-10">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                className={designSystem.cards.default}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <h2 className={`${designSystem.headings.h3} mb-4`}>
                  {faq.question}
                </h2>
                <p className={`${designSystem.text.secondary} text-base sm:text-lg mb-3 leading-relaxed`}>
                  {faq.answer}
                </p>
                {faq.details && (
                  <p className={`${designSystem.text.muted} text-sm sm:text-base leading-relaxed`}>
                    {faq.details}
                  </p>
                )}
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            className="mt-16 sm:mt-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <div className={`${designSystem.cards.default} text-center`}>
              <h2 className={`${designSystem.headings.h2} mb-6`}>
                Bereit, Ihren CV zu optimieren?
              </h2>
              <p className={`${designSystem.text.secondary} text-lg mb-8 max-w-2xl mx-auto`}>
                Starten Sie jetzt mit einer professionellen CV-Analyse oder erstellen Sie einen
                neuen Lebenslauf mit KI-Unterstützung.
              </p>
              <div className={designSystem.layout.flexButtons}>
                <button
                  onClick={() => navigate('/cv-check')}
                  className={designSystem.buttons.primary}
                >
                  <Upload className="w-5 h-5" />
                  Jetzt CV analysieren
                </button>
                <button
                  onClick={() => navigate('/cv-wizard')}
                  className={designSystem.buttons.secondary}
                >
                  <FileText className="w-5 h-5" />
                  Lebenslauf erstellen
                </button>
              </div>
            </div>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
          >
            <button
              onClick={() => navigate('/')}
              className={designSystem.buttons.ghost}
            >
              Zurück zur Startseite
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
}
