import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { HelpCircle, ArrowRight, Upload, FileText, ChevronDown, Sparkles, Target, Shield } from 'lucide-react';
import { FaqSchema } from '../components/seo/FaqSchema';
import { designSystem } from '../styles/designSystem';

export default function FaqPage() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState<number | null>(0);

  useEffect(() => {
    document.title = 'DYD CV-Check & Lebenslauf Generator – FAQ';

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute(
        'content',
        'Alle Antworten zu deinem perfekten Lebenslauf: CV-Analyse, ATS-Optimierung, Harmony KI-Assistent und vieles mehr bei DYD – Decide Your Dream.'
      );
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = 'Alle Antworten zu deinem perfekten Lebenslauf: CV-Analyse, ATS-Optimierung, Harmony KI-Assistent und vieles mehr bei DYD – Decide Your Dream.';
      document.head.appendChild(meta);
    }
  }, []);

  const faqCategories = [
    {
      title: 'Erste Schritte',
      icon: Sparkles,
      faqs: [
        {
          question: 'Was ist DYD – Decide Your Dream?',
          answer:
            'DYD ist deine intelligente Plattform für einen perfekten Lebenslauf. Mit Harmony, unserer KI, analysieren wir deinen CV und geben dir konkrete Verbesserungsvorschläge – damit dein Lebenslauf nicht nur gut aussieht, sondern auch bei ATS-Systemen durchkommt.',
          details:
            'Harmony prüft deinen Lebenslauf auf Herz und Nieren: Formatierung, Keywords, ATS-Kompatibilität und Inhalt. Du erhältst detaillierte Feedback in allen wichtigen Kategorien und konkrete Verbesserungsvorschläge. So wird aus einem guten CV ein großartiger CV.',
        },
        {
          question: 'Wer steckt hinter DYD?',
          answer:
            'DYD ist von Decide Your Dream UG entwickelt – einer Plattform, die es sich zur Aufgabe gemacht hat, deine Bewerbungschancen zu maximieren.',
          details:
            'Unser Team versteht die Herausforderungen bei der Bewerbung. Deshalb haben wir DYD mit einem einfachen Ziel entwickelt: Dir ein Werkzeug in die Hand geben, das dich wirklich weiterbringt. Professionell, einfach zu bedienen, und kostenlos zum Ausprobieren.',
        },
        {
          question: 'Kostet DYD wirklich etwas?',
          answer:
            'Du kannst dich kostenlos anmelden und einen ersten CV-Check durchführen. Für unbegrenzte Analysen und erweiterte Funktionen benötigst du Token.',
          details:
            'Token sind dein Guthaben für die Nutzung von Harmony. Du kaufst dir Token-Pakete und nutzt sie, wann immer du möchtest. So zahlst du nur für das, was du wirklich brauchst. Die Token verfallen nicht – du kannst sie jederzeit verwenden.',
        },
      ],
    },
    {
      title: 'CV-Analyse & Harmony',
      icon: Target,
      faqs: [
        {
          question: 'Wie funktioniert die CV-Analyse mit Harmony?',
          answer:
            'Du lädst deinen Lebenslauf hoch, und Harmony analysiert ihn vollautomatisch. Das dauert nur wenige Minuten.',
          details:
            'Nach dem Upload prüft Harmony deinen CV auf: ATS-Kompatibilität (passt dein CV in automatische Scanning-Systeme?), Keywords (enthältst du die relevanten Begriffe?), Struktur (ist dein CV übersichtlich?), Rechtschreibung und Formatierung. Du erhältst danach einen detaillierten Report mit Scores und konkreten Verbesserungen.',
        },
        {
          question: 'Was bedeutet ATS und warum ist das wichtig?',
          answer:
            'ATS steht für Applicant Tracking System – das sind automatische Systeme, die große Unternehmen nutzen, um Bewerbungen zu scannen. Dein CV muss erst durch dieses System, bevor ihn ein Mensch sieht.',
          details:
            'ATS-Systeme suchen nach bestimmten Keywords und Formatierungen. Wenn dein CV „falsch" formatiert ist (z.B. seltsame Fonts, Tabellen oder Grafiken), kann das System ihn nicht richtig lesen – und deine Bewerbung landet in der Tonne. Harmony optimiert deinen CV speziell für diese Systeme, sodass er zu 100% lesbar ist.',
        },
        {
          question: 'Kann Harmony mir bei der Erstellung eines neuen CVs helfen?',
          answer:
            'Ja! Mit unserem CV-Wizard führt dich Harmony Schritt für Schritt durch die Erstellung. Du antwortest auf Fragen, und Harmony hilft dir, deine Erfolge professionell zu formulieren.',
          details:
            'Der Wizard beginnt mit deinen Grunddaten, geht über deine Berufserfahrung, Ausbildung und Skills. Bei jedem Eintrag schlägt dir Harmony bessere Formulierungen vor – basierend auf erfolgreichen CVs. Am Ende erhältst du einen perfekt formatierten Lebenslauf in PDF oder Word.',
        },
        {
          question: 'Was prüft Harmony alles in meinem CV?',
          answer:
            'Harmony analysiert deinen CV in mehreren Kategorien: Struktur, Keywords, Formatierung, ATS-Kompatibilität, Rechtschreibung, Länge und Relevanz.',
          details:
            'Für jede Kategorie bekommst du einen Score und konkrete Feedback. Harmony zeigt dir auch, wo genau Probleme sind – z.B. „In der Berufserfahrung fehlen wichtige Keywords aus deiner Branche" oder „Das PDF hat eine Formatierungsproblematik bei Ort X".',
        },
      ],
    },
    {
      title: 'Lebenslauf & Technisches',
      icon: FileText,
      faqs: [
        {
          question: 'Welche CV-Vorlagen gibt es?',
          answer:
            'Du kannst aus mehreren modernen, ATS-optimierten Vorlagen wählen: Classic, Professional, Minimal, Modern und Creative. Alle sind darauf ausgerichtet, dass dein CV überall gut ankommt.',
          details:
            'Jede Vorlage wurde speziell getestet – mit realen ATS-Systemen und im Einstellungs-Prozess. Du kannst die Vorlagen jederzeit wechseln, ohne dass deine Daten verloren gehen. Die Creative-Vorlage hat etwas mehr Design-Freiheit, aber auch diese ist ATS-freundlich.',
        },
        {
          question: 'In welchen Formaten kann ich meinen CV herunterladen?',
          answer:
            'Du kannst deinen CV als PDF oder DOCX (Word) herunterladen. Das gibt dir maximale Flexibilität.',
          details:
            'PDF ist perfekt für Bewerbungsportale und E-Mail-Versand – die Formatierung bleibt überall gleich. DOCX kannst du selbst noch bearbeiten, wenn du kleine Änderungen machen möchtest. Beide Formate sind ATS-optimiert.',
        },
        {
          question: 'Wie sicher sind meine Daten gespeichert?',
          answer:
            'Deine CVs und Analyseergebnisse werden mit höchsten Sicherheitsstandards in Supabase gespeichert – einem führenden Backend-Service, dem auch große Unternehmen vertrauen.',
          details:
            'Alle Übertragungen laufen über verschlüsselte HTTPS-Verbindungen. Nur du hast Zugriff auf deine Daten – das ist durch Sicherheitsrichtlinien gewährleistet. Wenn du dich abmeldest oder dein Konto löschst, können wir deine Daten auf Wunsch vollständig löschen.',
        },
        {
          question: 'Was sind Token und wie viele brauche ich?',
          answer:
            'Token sind dein Guthaben bei DYD. Ein Token = eine Aktion (CV-Check, Optimierung, Erstellung mit KI-Assistance).',
          details:
            'Für eine einfache CV-Analyse brauchst du 1 Token. Wenn du Harmony bitten möchtest, deinen CV für eine bestimmte Stelle zu optimieren, kostet das auch 1 Token pro Job-Beschreibung. Du kaufst Token-Pakete und nutzt sie, wann du möchtest. Sie verfallen nicht.',
        },
      ],
    },
    {
      title: 'Bezahlung & Datenschutz',
      icon: Shield,
      faqs: [
        {
          question: 'Wie funktioniert die Bezahlung?',
          answer:
            'Wir nutzen Stripe – einen der sichersten Zahlungsanbieter weltweit. Du wählst dein Token-Paket und wirst zu Stripe weitergeleitet.',
          details:
            'Nach der Bezahlung wird dein Token-Guthaben sofort gutgeschrieben. Du siehst es direkt im Dashboard. Stripe speichert deine Zahlungsdaten – wir sehen diese nicht. So ist deine Sicherheit garantiert. Du kannst per Kreditkarte, PayPal oder Banküberweisung bezahlen.',
        },
        {
          question: 'Werden meine Zahlungsdaten speichert?',
          answer:
            'Nein. Deine Zahlungsdaten werden ausschließlich von Stripe verarbeitet und gespeichert – nicht von uns.',
          details:
            'Wir sehen nur, dass du erfolgreich bezahlt hast und wie viele Token du hast. Kreditkartennummern, Bankinformationen – das bleibt alles privat zwischen dir und Stripe. So kann auch nicht passieren, dass wir gehackt werden und deine Zahlungsdaten betroffen sind.',
        },
        {
          question: 'Wie lange werden meine CVs gespeichert?',
          answer:
            'Deine CVs und Analyseergebnisse bleiben in deinem Konto, solange du möchtest. Du kannst sie jederzeit herunterladen oder löschen.',
          details:
            'Wenn du dein Konto löschst, werden alle deine Daten innerhalb von 30 Tagen vollständig aus unseren Systemen entfernt. Das ist rechtlich so vorgesehen und wir halten uns dran. Du kannst jederzeit eine Kopie deiner Daten anfordern (Datenschutzrecht).',
        },
        {
          question: 'Verkauft ihr meine Daten weiter?',
          answer:
            'Definitiv nicht. Deine Daten gehören dir. Punkt.',
          details:
            'Wir nutzen deine Daten nur, um dir DYD zu ermöglichen. Wir verkaufen, teilen oder weitergeben nichts – nicht an Unternehmen, nicht an Recruiter, nicht an wen auch immer. Das steht in unserer Datenschutzerklärung und wir nehmen das ernst.',
        },
      ],
    },
    {
      title: 'Hilfe & Support',
      icon: HelpCircle,
      faqs: [
        {
          question: 'Mein CV-Check dauert länger als 5 Minuten. Was ist los?',
          answer:
            'Das kann vorkommen. Harmony muss deinen PDF erst einlesen, dann analysieren. Bei großen Dateien oder bei vielen Anfragen kann das etwas länger dauern.',
          details:
            'Die meisten Analysen sind nach 2-5 Minuten fertig. Wenn es deutlich länger dauert, überprüfe: 1) Hast du eine gute Internetverbindung? 2) Ist deine PDF-Datei zu groß (ideal: unter 5 MB)? 3) Versuche, die Seite zu aktualisieren. Wenn es immer noch nicht geht, schreib uns eine E-Mail – wir helfen gerne.',
        },
        {
          question: 'Mein PDF wird nicht hochgeladen. Woran liegt es?',
          answer:
            'Das kann mehrere Gründe haben: Die Datei ist zu groß, das Format stimmt nicht, oder dein Browser hat ein Problem.',
          details:
            'Überprüfe: 1) Ist es wirklich eine PDF-Datei (nicht Word, nicht Bild)? 2) Ist die Datei kleiner als 10 MB? 3) Versuche einen anderen Browser. 4) Leere deinen Browser-Cache. Wenn das nicht hilft, kannst du uns die Datei zur Überprüfung zuschicken.',
        },
        {
          question: 'Kann ich mein Feedback geben oder Features vorschlagen?',
          answer:
            'Ja gerne! Dein Feedback hilft uns, DYD besser zu machen. Schreib uns einfach eine E-Mail oder nutze das Feedback-Formular auf der Seite.',
          details:
            'Wir lesen wirklich jedes Feedback und arbeiten basierend auf euren Ideen. Viele Features sind bereits von Nutzer-Vorschlägen entstanden. Du möchtest also neue Funktionen sehen? Dann sag Bescheid!',
        },
      ],
    },
  ];

  const allFaqs = faqCategories.flatMap(cat => cat.faqs);
  const faqSchemaData = allFaqs.map((faq) => ({
    question: faq.question,
    answer: `${faq.answer} ${faq.details}`,
  }));

  return (
    <>
      <FaqSchema faqs={faqSchemaData} />

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pt-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
          {/* Header */}
          <motion.div
            className="text-center mb-16 sm:mb-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center justify-center gap-3 mb-6">
              <Sparkles className="w-10 h-10 sm:w-12 sm:h-12 text-[#66c0b6] animate-pulse" />
              <h1 className={designSystem.headings.h1}>Häufig gestellte Fragen</h1>
            </div>
            <p className={`${designSystem.text.secondary} text-lg sm:text-xl max-w-2xl mx-auto`}>
              Alles, was du über deinen perfekten Lebenslauf und Harmony wissen musst
            </p>
          </motion.div>

          {/* FAQ Categories */}
          <div className="space-y-12 sm:space-y-16">
            {faqCategories.map((category, categoryIndex) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={categoryIndex}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                >
                  {/* Category Header */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className="p-3 bg-gradient-to-br from-[#66c0b6] to-[#4a8b82] rounded-lg">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <h2 className={`${designSystem.headings.h2} text-2xl`}>{category.title}</h2>
                  </div>

                  {/* FAQ Items in Category */}
                  <div className="space-y-4">
                    {category.faqs.map((faq, faqIndex) => {
                      const itemId = `${categoryIndex}-${faqIndex}`;
                      const isExpanded = expandedId === itemId;

                      return (
                        <motion.div
                          key={itemId}
                          className="group"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4, delay: faqIndex * 0.05 }}
                        >
                          <button
                            onClick={() => setExpandedId(isExpanded ? null : itemId)}
                            className="w-full text-left p-6 rounded-lg bg-gradient-to-r from-white/5 to-white/0 hover:from-white/10 hover:to-white/5 border border-white/10 hover:border-[#66c0b6]/30 transition-all duration-300 group"
                          >
                            <div className="flex items-start justify-between gap-4">
                              <h3 className={`${designSystem.headings.h3} text-lg flex-1`}>
                                {faq.question}
                              </h3>
                              <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                                className="flex-shrink-0 mt-1"
                              >
                                <ChevronDown className="w-5 h-5 text-[#66c0b6] group-hover:text-[#7dd9cf]" />
                              </motion.div>
                            </div>
                          </button>

                          {/* Answer Section */}
                          <motion.div
                            initial={false}
                            animate={{
                              height: isExpanded ? 'auto' : 0,
                              opacity: isExpanded ? 1 : 0,
                              marginTop: isExpanded ? 8 : 0,
                            }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 pt-0 text-white/70 space-y-4">
                              <p className="leading-relaxed text-base">
                                {faq.answer}
                              </p>
                              {faq.details && (
                                <p className={`${designSystem.text.muted} leading-relaxed text-sm`}>
                                  {faq.details}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* CTA Section */}
          <motion.div
            className="mt-16 sm:mt-20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#66c0b6]/10 via-[#4a8b82]/10 to-transparent p-8 sm:p-12 border border-[#66c0b6]/20 hover:border-[#66c0b6]/40 transition-all duration-300">
              {/* Gradient Orb Background */}
              <div className="absolute -right-20 -top-20 w-40 h-40 bg-[#66c0b6]/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10 text-center">
                <h2 className={`${designSystem.headings.h2} mb-6`}>
                  Bereit für deinen perfekten Lebenslauf?
                </h2>
                <p className={`${designSystem.text.secondary} text-lg mb-8 max-w-2xl mx-auto`}>
                  Starte jetzt mit einer kostenlosen CV-Analyse oder erstelle mit Harmony einen neuen Lebenslauf.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <button
                    onClick={() => navigate('/cv-check')}
                    className={`${designSystem.buttons.primary} group/btn inline-flex items-center justify-center`}
                  >
                    <Upload className="w-5 h-5 mr-2 group-hover/btn:scale-110 transition-transform" />
                    Jetzt analysieren
                  </button>
                  <button
                    onClick={() => navigate('/cv-wizard')}
                    className={`${designSystem.buttons.secondary} group/btn inline-flex items-center justify-center`}
                  >
                    <Sparkles className="w-5 h-5 mr-2 group-hover/btn:scale-110 transition-transform" />
                    Mit Harmony erstellen
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Back to Home */}
          <motion.div
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <button
              onClick={() => navigate('/')}
              className={`${designSystem.buttons.ghost} hover:text-[#66c0b6]`}
            >
              Zurück zur Startseite
              <ArrowRight className="w-4 h-4 ml-2" />
            </button>
          </motion.div>
        </div>
      </div>
    </>
  );
}
