import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AgbPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/70 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Zurück zur Startseite
        </button>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 sm:p-12">
          <h1 className="text-4xl font-bold text-white mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>

          <div className="space-y-6 text-white/70 leading-relaxed mb-8">
            <div>
              <p className="font-semibold text-white">DYD – Decide your Dream UG (haftungsbeschränkt)</p>
              <p>Brehmstraße 2, 40239 Düsseldorf, Deutschland</p>
              <p>E-Mail: kontakt.dyd@gmail.com</p>
              <p>Geschäftsführer: Quentin Sunderbrink</p>
            </div>
          </div>

          <div className="space-y-8 text-white/70 leading-relaxed">
            <div>
              <h2 className="text-white font-semibold mb-3 text-xl">1. Geltungsbereich</h2>
              <p className="mb-2">(1) Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für alle Verträge zwischen DYD – Decide your Dream UG (haftungsbeschränkt) (nachfolgend „DYD", „wir", „uns") und den Nutzern unserer Plattform www.decideyourdream.de (nachfolgend „Nutzer" oder „Kunde").</p>
              <p>(2) Abweichende Bedingungen werden nicht anerkannt, es sei denn, DYD stimmt ihrer Geltung ausdrücklich schriftlich zu.</p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-3 text-xl">2. Vertragsgegenstand</h2>
              <p className="mb-2">(1) DYD betreibt eine digitale Plattform, die Nutzern ermöglicht:</p>
              <ul className="list-disc ml-6 mb-2 space-y-1">
                <li>Lebensläufe (CVs) hochzuladen,</li>
                <li>eine kostenlose ATS-Analyse zu erhalten,</li>
                <li>und optional kostenpflichtige KI-basierte Optimierungen ihres Lebenslaufs zu buchen.</li>
              </ul>
              <p className="mb-2">(2) Die Optimierungen erfolgen automatisiert mithilfe künstlicher Intelligenz (KI).</p>
              <p>(3) Die Ergebnisse dienen ausschließlich der Bewerbungsvorbereitung und stellen keine Beratung im rechtlichen, psychologischen oder wirtschaftlichen Sinne dar.</p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-3 text-xl">3. Vertragsschluss</h2>
              <p className="mb-2">(1) Die Darstellung der Services auf der Website stellt kein rechtlich bindendes Angebot dar, sondern eine unverbindliche Einladung zur Bestellung.</p>
              <p className="mb-2">(2) Durch Anklicken des Buttons „Zahlungspflichtig bestellen" gibt der Nutzer ein verbindliches Angebot ab.</p>
              <p className="mb-2">(3) Der Vertrag kommt zustande, sobald DYD die Bestellung per E-Mail oder automatischer Bestätigung annimmt.</p>
              <p>(4) Der Vertragstext wird nach Abschluss gespeichert und kann vom Nutzer über sein Konto eingesehen werden.</p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-3 text-xl">4. Registrierung und Nutzerkonto</h2>
              <p className="mb-2">(1) Für kostenpflichtige Leistungen ist eine Registrierung erforderlich.</p>
              <p className="mb-2">(2) Der Nutzer ist verpflichtet, korrekte Angaben zu machen und seine Zugangsdaten geheim zu halten.</p>
              <p>(3) DYD behält sich vor, Konten zu sperren, wenn ein Missbrauch vermutet wird.</p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-3 text-xl">5. Leistungsumfang</h2>
              <p className="mb-2">(1) Nach Zahlungseingang erhält der Nutzer Zugriff auf die gebuchten KI-Dienste.</p>
              <p className="mb-2">(2) Je nach Paket umfasst die Leistung:</p>
              <ul className="list-disc ml-6 mb-2 space-y-1">
                <li>eine bestimmte Anzahl an Token (z. B. 10, 15 oder 30 CV-Optimierungen), oder</li>
                <li>eine einmalige CV-Optimierung.</li>
              </ul>
              <p className="mb-2">(3) Tokens sind nicht übertragbar und 12 Monate ab Kauf gültig.</p>
              <p className="mb-2">(4) Nach Ablauf verfallen ungenutzte Tokens ersatzlos.</p>
              <p>(5) DYD kann Funktionen technisch ändern oder erweitern, sofern der Vertragszweck erhalten bleibt.</p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-3 text-xl">6. Preise und Zahlung</h2>
              <p className="mb-2">(1) Alle Preise verstehen sich in Euro (€) inklusive gesetzlicher Umsatzsteuer (sofern erhoben).</p>
              <p className="mb-2">(2) Die Zahlung erfolgt ausschließlich über Stripe Payments Europe Ltd., Dublin 2, Irland.</p>
              <p className="mb-2">(3) Die verfügbaren Zahlungsmethoden werden auf der Website angezeigt.</p>
              <p>(4) Der Zugriff auf kostenpflichtige Dienste erfolgt erst nach erfolgreicher Zahlung.</p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-3 text-xl">7. Digitale Inhalte und Widerrufsrecht</h2>
              <p className="mb-2">(1) Die angebotenen Leistungen sind digitale Inhalte im Sinne des § 327 BGB, die nicht auf einem körperlichen Datenträger bereitgestellt werden.</p>
              <p className="mb-2">(2) Der Nutzer erklärt sich beim Kauf ausdrücklich damit einverstanden, dass DYD vor Ablauf der Widerrufsfrist mit der Ausführung der Dienstleistung beginnt.</p>
              <p className="mb-2">(3) Der Nutzer bestätigt, dass er sein Widerrufsrecht verliert, sobald DYD die Dienstleistung vollständig erbracht hat (z. B. wenn die KI-Optimierung oder Analyse durchgeführt wurde).</p>
              <p className="mb-2">(4) Ein Widerruf nach erfolgter Leistungserbringung ist ausgeschlossen.</p>
              <p>(5) Der Nutzer erhält vor Abschluss der Bestellung einen deutlichen Hinweis auf diesen Verzicht und muss aktiv zustimmen (z. B. per Checkbox im Checkout).</p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-3 text-xl">8. Pflichten des Nutzers</h2>
              <p className="mb-2">(1) Der Nutzer darf nur eigene Dokumente hochladen.</p>
              <p className="mb-2">(2) Es ist untersagt, urheberrechtlich geschützte Inhalte Dritter oder rechtswidrige Materialien zu verwenden.</p>
              <p>(3) Automatisierte Zugriffe oder Manipulationen der Plattform sind unzulässig.</p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-3 text-xl">9. Haftung</h2>
              <p className="mb-2">(1) DYD haftet unbegrenzt für Schäden aus der Verletzung von Leben, Körper oder Gesundheit, die auf vorsätzlicher oder fahrlässiger Pflichtverletzung beruhen.</p>
              <p className="mb-2">(2) Für sonstige Schäden haftet DYD nur bei Vorsatz oder grober Fahrlässigkeit.</p>
              <p className="mb-2">(3) Eine Haftung für mittelbare Schäden, Datenverlust oder entgangenen Gewinn ist ausgeschlossen, soweit gesetzlich zulässig.</p>
              <p>(4) Die Nutzung der KI-Ergebnisse erfolgt auf eigenes Risiko. DYD übernimmt keine Garantie für Richtigkeit, Vollständigkeit oder Erfolg von Bewerbungen.</p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-3 text-xl">10. Gewährleistung</h2>
              <p className="mb-2">(1) Die gesetzlichen Vorschriften zu digitalen Inhalten (§§ 434 ff. BGB) finden Anwendung.</p>
              <p>(2) DYD gewährleistet, dass die digitalen Leistungen dem vereinbarten Funktionsumfang entsprechen.</p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-3 text-xl">11. Laufzeit und Kündigung</h2>
              <p className="mb-2">(1) Das Nutzungsverhältnis besteht unbefristet.</p>
              <p className="mb-2">(2) Der Nutzer kann sein Konto jederzeit löschen.</p>
              <p>(3) Bereits erworbene Tokens bleiben bis zu ihrem Ablaufdatum gültig.</p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-3 text-xl">12. Datenschutz</h2>
              <p>Die Erhebung und Verarbeitung personenbezogener Daten erfolgt gemäß unserer Datenschutzerklärung.</p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-3 text-xl">13. Urheberrechte</h2>
              <p>Alle Inhalte (Texte, Designs, Software, Marken) sind urheberrechtlich geschützt. Jede unerlaubte Nutzung oder Vervielfältigung ist untersagt.</p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-3 text-xl">14. Streitbeilegung</h2>
              <p className="mb-2">(1) DYD ist nicht verpflichtet und nicht bereit, an einem Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.</p>
              <p>(2) Plattform der EU-Kommission zur Online-Streitbeilegung: <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noopener noreferrer" className="text-[#66c0b6] hover:underline">https://ec.europa.eu/consumers/odr</a></p>
            </div>

            <div>
              <h2 className="text-white font-semibold mb-3 text-xl">15. Schlussbestimmungen</h2>
              <p className="mb-2">(1) Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.</p>
              <p className="mb-2">(2) Erfüllungsort und Gerichtsstand ist Düsseldorf.</p>
              <p>(3) Sollten einzelne Bestimmungen dieser AGB unwirksam sein, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
