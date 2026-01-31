// src/components/cv-templates/templates/ModernCVTemplate.tsx

import React, { useEffect, useRef } from 'react';

type EditorSection = {
  type: string;
  title?: string;
  items?: any[];
  [key: string]: any;
};

interface PersonalInfo {
  name?: string;
  title?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  footerLocation?: string;
  [key: string]: any;
}

interface ModernCVTemplateProps {
  personalInfo: PersonalInfo;
  summary?: string;
  sections: EditorSection[];
  photoUrl?: string;
  onUpdatePersonalInfo: (field: string, value: string) => void;
  onUpdateSummary: (value: string) => void;
  onUpdateSection: (sectionIndex: number, updates: Partial<EditorSection>) => void;
  onUpdateSectionItem: (
    sectionIndex: number,
    itemIndex: number,
    field: string,
    value: any
  ) => void;
  onDeleteSectionItem: (sectionIndex: number, itemIndex: number) => void;
}

const CI = {
  primary: '#30E3CA',
  primaryDark: '#30A9A1',
  tint: '#e9f9f6',
  border: '#cdeee8',
  bg: '#f3fbfa',
};

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="mt-4 mb-2 text-[11px] font-bold tracking-[0.14em] text-slate-900 uppercase flex items-center gap-2">
    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CI.primary }} />
    {children}
  </h2>
);

const normalizeBullet = (s: string) =>
  (s ?? '')
    .replace(/\r/g, '')
    .replace(/^[-•\u2022]\s*/, '')
    .trim();

const splitToBullets = (text: string): string[] => {
  const t = (text ?? '').replace(/\r/g, '').trim();
  if (!t) return [];

  // Split by newline, but also handle cases where someone pasted bullets in one line
  const lines = t
    .split('\n')
    .map((l) => normalizeBullet(l))
    .filter((l) => l.length > 0);

  return lines;
};

/**
 * Single Source of Truth:
 * - If bulletPoints exists (even empty array), we treat it as the canonical bullet list.
 * - Else we fall back to description split by newline.
 */
const getBullets = (item: any): string[] => {
  if (Array.isArray(item?.bulletPoints)) {
    return item.bulletPoints.map((b: any) => String(b ?? ''));
  }
  if (typeof item?.description === 'string') {
    return splitToBullets(item.description);
  }
  return [];
};

const autoSize = (el: HTMLTextAreaElement) => {
  el.style.height = 'auto';
  el.style.height = `${el.scrollHeight}px`;
};

const normalizeMMYYYY = (raw: string): string => {
  const digits = (raw || '').replace(/\D/g, '').slice(0, 6); // MMYYYY
  const mm = digits.slice(0, 2);
  const yyyy = digits.slice(2, 6);

  if (!mm) return '';
  let mNum = parseInt(mm, 10);
  if (Number.isNaN(mNum)) return '';
  mNum = Math.min(12, Math.max(1, mNum));

  const mmFixed = String(mNum).padStart(2, '0');
  if (!yyyy) return `${mmFixed}/`;
  return `${mmFixed}/${yyyy}`;
};

export const ModernCVTemplate: React.FC<ModernCVTemplateProps> = ({
  personalInfo,
  summary,
  sections,
  photoUrl,
  onUpdatePersonalInfo,
  onUpdateSummary,
  onUpdateSectionItem,
  onDeleteSectionItem,
}) => {
  const summaryRef = useRef<HTMLTextAreaElement | null>(null);

  const today = new Date().toLocaleDateString('de-DE');
  const footerLocation = (personalInfo.footerLocation ?? personalInfo.location ?? '').toString();

  useEffect(() => {
    if (summaryRef.current) autoSize(summaryRef.current);
  }, [summary]);

  const renderExperienceOrProjects = (
    section: EditorSection,
    sectionIndex: number,
    isProject: boolean
  ) => {
    const items = Array.isArray(section.items) ? section.items : [];
    if (items.length === 0) return null;

    const title = section.title || (isProject ? 'Projekte' : 'Berufserfahrung');

    return (
      <div key={`${section.type}-${sectionIndex}`}>
        <SectionTitle>{title}</SectionTitle>

        <div className="space-y-3">
          {items.map((item: any, idx: number) => {
            const bullets = getBullets(item);
            const hasBulletArray = Array.isArray(item?.bulletPoints);

            return (
              <div
                key={idx}
                className="border rounded-2xl px-4 py-3 bg-white shadow-sm"
                style={{ borderColor: CI.border }}
              >
                <div className="flex justify-between gap-3 items-start">
                  <div className="flex-1 min-w-0">
                    <input
                      className="w-full text-[11px] font-semibold text-slate-900 bg-transparent outline-none"
                      value={isProject ? item.title || item.name || '' : item.title || item.position || item.role || ''}
                      onChange={(e) =>
                        onUpdateSectionItem(
                          sectionIndex,
                          idx,
                          isProject ? 'title' : 'title',
                          e.target.value
                        )
                      }
                      placeholder={isProject ? 'Projekt / Titel' : 'Position / Rolle'}
                    />

                    <input
                      className="mt-0.5 w-full text-[10px] text-slate-600 bg-transparent outline-none"
                      value={
                        isProject
                          ? item.role || ''
                          : item.company || item.employer || ''
                      }
                      onChange={(e) =>
                        onUpdateSectionItem(
                          sectionIndex,
                          idx,
                          isProject ? 'role' : 'company',
                          e.target.value
                        )
                      }
                      placeholder={isProject ? 'Rolle' : 'Unternehmen'}
                    />
                  </div>

                  <div className="flex-shrink-0">
                    <div
                      className="inline-flex items-center gap-1 text-[10px] text-slate-800 rounded-full px-2 py-1 border"
                      style={{ backgroundColor: CI.tint, borderColor: CI.border }}
                    >
                      <input
                        className="bg-transparent outline-none w-[52px] text-right"
                        value={item.date_from || ''}
                        onChange={(e) =>
                          onUpdateSectionItem(
                            sectionIndex,
                            idx,
                            'date_from',
                            normalizeMMYYYY(e.target.value)
                          )
                        }
                        placeholder="MM/JJ"
                      />
                      <span className="text-slate-500">–</span>
                      <input
                        className="bg-transparent outline-none w-[52px] text-right"
                        value={item.date_to || ''}
                        onChange={(e) =>
                          onUpdateSectionItem(
                            sectionIndex,
                            idx,
                            'date_to',
                            normalizeMMYYYY(e.target.value)
                          )
                        }
                        placeholder="MM/JJ"
                      />
                    </div>
                  </div>
                </div>

                {/* BULLETS (WYSIWYG, korrekt getrennt, kein doppeltes Bullet) */}
                {bullets.length > 0 || hasBulletArray ? (
                  <ul className="mt-3 space-y-2 text-[11px] text-slate-900">
                    {(bullets.length > 0 ? bullets : ['']).map((bp: string, bIdx: number) => (
                      <li key={bIdx} className="flex items-start gap-2">
                        <span
                          className="mt-[7px] h-[6px] w-[6px] rounded-full flex-shrink-0"
                          style={{ backgroundColor: CI.primaryDark }}
                        />
                        <textarea
                          className="flex-1 bg-transparent outline-none text-slate-900 text-[11px] leading-snug resize-none"
                          rows={1}
                          value={bp}
                          onFocus={(e) => autoSize(e.currentTarget)}
                          onInput={(e) => autoSize(e.currentTarget as HTMLTextAreaElement)}
                          onChange={(e) => {
                            const v = e.target.value;
                           const newBullets =
  Array.isArray(item?.bulletPoints) && item.bulletPoints.length > 0
    ? [...item.bulletPoints]
    : [...bullets];

                            // ensure length
                            while (newBullets.length < (bullets.length > 0 ? bullets.length : 1)) newBullets.push('');
                            newBullets[bIdx] = v;
                            onUpdateSectionItem(sectionIndex, idx, 'bulletPoints', newBullets);
                            // Keep description empty once bulletPoints is the source of truth
                            if (!Array.isArray(item?.bulletPoints)) {
                              onUpdateSectionItem(sectionIndex, idx, 'description', '');
                            }
                          }}
                          placeholder="Aufgabe / Ergebnis"
                          style={{ overflow: 'hidden' }}
                        />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <textarea
                    className="mt-3 w-full text-[11px] text-slate-900 bg-transparent outline-none resize-none leading-snug"
                    rows={2}
                    value={item.description || ''}
                    onFocus={(e) => autoSize(e.currentTarget)}
                    onInput={(e) => autoSize(e.currentTarget as HTMLTextAreaElement)}
                    onChange={(e) => {
                      onUpdateSectionItem(sectionIndex, idx, 'description', e.target.value);
                    }}
                    placeholder="Kurz die wichtigsten Aufgaben und Erfolge beschreiben"
                    style={{ overflow: 'hidden' }}
                  />
                )}

                <div className="mt-2 flex justify-between items-center">
                  <button
                    type="button"
                    className="text-[10px] font-semibold hover:underline"
                    style={{ color: CI.primaryDark }}
                    onClick={() => {
                      // migrate description -> bullets (if needed), then append empty bullet
                      const base =
                        Array.isArray(item?.bulletPoints)
                          ? item.bulletPoints
                          : typeof item?.description === 'string'
                            ? splitToBullets(item.description)
                            : [];

                      onUpdateSectionItem(sectionIndex, idx, 'bulletPoints', [...base, '']);
                      onUpdateSectionItem(sectionIndex, idx, 'description', '');
                    }}
                  >
                    + Bullet hinzufügen
                  </button>

                  <button
                    type="button"
                    className="text-[10px] font-semibold text-rose-600 hover:underline"
                    onClick={() => onDeleteSectionItem(sectionIndex, idx)}
                  >
                    Eintrag löschen
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderSection = (section: EditorSection, sectionIndex: number) => {
    const items = Array.isArray(section.items) ? section.items : [];

    switch (section.type) {
      case 'experience':
        return renderExperienceOrProjects(section, sectionIndex, false);
      case 'projects':
        return renderExperienceOrProjects(section, sectionIndex, true);

      case 'education':
        if (items.length === 0) return null;
        return (
          <div key={`education-${sectionIndex}`}>
            <SectionTitle>{section.title || 'Ausbildung & Studium'}</SectionTitle>
            <div className="space-y-3">
              {items.map((edu: any, idx: number) => (
                <div
                  key={idx}
                  className="border rounded-2xl px-4 py-3 bg-white shadow-sm"
                  style={{ borderColor: CI.border }}
                >
                  <input
                    className="w-full text-[11px] font-semibold text-slate-900 bg-transparent outline-none"
                    value={edu.degree || edu.title || ''}
                    onChange={(e) =>
                      onUpdateSectionItem(sectionIndex, idx, 'degree', e.target.value)
                    }
                    placeholder="Abschluss"
                  />
                  <input
                    className="mt-0.5 w-full text-[10px] text-slate-600 bg-transparent outline-none"
                    value={edu.institution || edu.school || edu.university || ''}
                    onChange={(e) =>
                      onUpdateSectionItem(sectionIndex, idx, 'institution', e.target.value)
                    }
                    placeholder="Institution"
                  />

                  <div className="mt-2 flex justify-end">
                    <div
                      className="inline-flex items-center gap-1 text-[10px] text-slate-800 rounded-full px-2 py-1 border"
                      style={{ backgroundColor: CI.tint, borderColor: CI.border }}
                    >
                      <input
                        className="bg-transparent outline-none w-[52px] text-right"
                        value={edu.date_from || ''}
                        onChange={(e) =>
                          onUpdateSectionItem(sectionIndex, idx, 'date_from', normalizeMMYYYY(e.target.value))
                        }
                        placeholder="MM/JJ"
                      />
                      <span className="text-slate-500">–</span>
                      <input
                        className="bg-transparent outline-none w-[52px] text-right"
                        value={edu.date_to || ''}
                        onChange={(e) =>
                          onUpdateSectionItem(sectionIndex, idx, 'date_to', normalizeMMYYYY(e.target.value))
                        }
                        placeholder="MM/JJ"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'languages':
        if (items.length === 0) return null;
        return (
          <div key={`languages-${sectionIndex}`}>
            <SectionTitle>Sprachen</SectionTitle>
            <div className="space-y-2">
              {items.map((lang: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 border rounded-xl px-3 py-2 bg-white"
                  style={{ borderColor: CI.border }}
                >
                  <input
                    className="bg-transparent outline-none flex-1 text-[11px] text-slate-900"
                    value={typeof lang === 'string' ? lang : lang.language || lang.name || ''}
                    onChange={(e) =>
                      onUpdateSectionItem(sectionIndex, idx, 'language', e.target.value)
                    }
                    placeholder="Sprache"
                  />
                  <input
                    className="bg-transparent outline-none w-[90px] text-right text-[10px] text-slate-600"
                    value={typeof lang === 'object' && lang !== null ? (lang.level || lang.niveau || '') : ''}
                    onChange={(e) =>
                      onUpdateSectionItem(sectionIndex, idx, 'level', e.target.value)
                    }
                    placeholder="Niveau"
                  />
                </div>
              ))}
            </div>
          </div>
        );

      case 'skills': {
        if (items.length === 0) return null;

        // ✅ Skills-Block komplett in CI-Farbe (Kontrast hoch!)
        return (
          <div key={`skills-${sectionIndex}`}>
            <SectionTitle>{section.title || 'Fähigkeiten'}</SectionTitle>
            <div
              className="rounded-2xl p-4 border shadow-sm"
              style={{ backgroundColor: CI.primary, borderColor: CI.primaryDark }}
            >
              <div className="grid grid-cols-2 gap-2">
                {items.map((skill: any, idx: number) => (
                  <input
                    key={idx}
                    className="
                      w-full px-3 py-2 rounded-full
                      border border-white/35
                      bg-white/15
                      text-[11px] font-semibold
                      text-white placeholder-white/70
                      outline-none
                      focus:bg-white/20
                    "
                    value={typeof skill === 'string' ? skill : skill.skill || ''}
                    onChange={(e) =>
                      onUpdateSectionItem(sectionIndex, idx, 'skill', e.target.value)
                    }
                    placeholder="Skill"
                  />
                ))}
              </div>
              <div className="mt-3 text-[10px] text-white/85">
                Tipp: Skills kurz halten (1–3 Wörter) für ATS & Optik.
              </div>
            </div>
          </div>
        );
      }

      case 'soft_skills':
        if (items.length === 0) return null;
        return (
          <div key={`soft-${sectionIndex}`}>
            <SectionTitle>{section.title || 'Soft Skills'}</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {items.map((skill: any, idx: number) => (
                <input
                  key={idx}
                  className="
                    px-3 py-2 rounded-full
                    border
                    text-[11px] font-semibold
                    outline-none
                    bg-white
                    text-slate-900
                  "
                  style={{ borderColor: CI.border }}
                  value={typeof skill === 'string' ? skill : skill.skill || ''}
                  onChange={(e) =>
                    onUpdateSectionItem(sectionIndex, idx, 'skill', e.target.value)
                  }
                  placeholder="Stärke"
                />
              ))}
            </div>
          </div>
        );

      case 'work_values':
      case 'values':
        if (items.length === 0) return null;
        return (
          <div key={`values-${sectionIndex}`}>
            <SectionTitle>Arbeitsweise & Werte</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {items.map((val: any, idx: number) => (
                <input
                  key={idx}
                  className="
                    px-3 py-2 rounded-full
                    border
                    text-[11px] font-semibold
                    outline-none
                    bg-white
                    text-slate-900
                  "
                  style={{ borderColor: CI.border }}
                  value={typeof val === 'string' ? val : val.label || ''}
                  onChange={(e) =>
                    onUpdateSectionItem(sectionIndex, idx, 'label', e.target.value)
                  }
                  placeholder="Wert"
                />
              ))}
            </div>
          </div>
        );

      case 'hobbies':
      case 'interests':
        if (items.length === 0) return null;
        return (
          <div key={`hobbies-${sectionIndex}`}>
            <SectionTitle>Hobbys & Interessen</SectionTitle>
            <div className="flex flex-wrap gap-2">
              {items.map((hob: any, idx: number) => (
                <input
                  key={idx}
                  className="
                    px-3 py-2 rounded-full
                    border
                    text-[11px] font-semibold
                    outline-none
                    bg-white
                    text-slate-900
                  "
                  style={{ borderColor: CI.border }}
                  value={typeof hob === 'string' ? hob : hob.label || ''}
                  onChange={(e) =>
                    onUpdateSectionItem(sectionIndex, idx, 'label', e.target.value)
                  }
                  placeholder="Hobby"
                />
              ))}
            </div>
          </div>
        );

      default:
        if (items.length === 0) return null;
        return (
          <div key={`${section.type}-${sectionIndex}`}>
            <SectionTitle>{section.title || section.type}</SectionTitle>
            <div className="space-y-2">
              {items.map((it: any, idx: number) => {
                const value =
                  typeof it === 'string'
                    ? it
                    : it.name || it.title || it.label || '';
                return (
                  <div
                    key={idx}
                    className="border rounded-xl px-3 py-2 bg-white"
                    style={{ borderColor: CI.border }}
                  >
                    <input
                      className="w-full bg-transparent outline-none text-[11px] text-slate-900"
                      value={value}
                      onChange={(e) =>
                        onUpdateSectionItem(sectionIndex, idx, 'name', e.target.value)
                      }
                      placeholder="Eintrag"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        );
    }
  };

  // Layout wie bei deinem vollständigen Template
  const leftTypes = ['experience', 'projects'];
  const rightTypes = [
    'education',
    'skills',
    'soft_skills',
    'languages',
    'work_values',
    'values',
    'hobbies',
    'interests',
  ];

  const leftSections = sections.filter((s) => leftTypes.includes(s.type));
  const rightSections = sections.filter((s) => rightTypes.includes(s.type));
  const otherSections = sections.filter(
    (s) => !leftTypes.includes(s.type) && !rightTypes.includes(s.type)
  );

  return (
    <div className="w-full flex justify-center px-2 sm:px-0">
      {/* ✅ Kein internes Scrolling: keine overflow-Klassen hier */}
      <div
        className="
          text-slate-900 font-sans w-full max-w-[210mm]
          min-h-[297mm]
          shadow-md flex flex-col rounded-2xl
          border border-l-4
        "
        style={{
          background: `linear-gradient(180deg, ${CI.bg} 0%, #ffffff 45%, ${CI.bg} 100%)`,
          borderColor: CI.border,
          borderLeftColor: CI.primary,
        }}
      >
        {/* HEADER */}
        <header
          className="px-8 pt-6 pb-4 border-b flex justify-between gap-6 rounded-t-2xl"
          style={{ backgroundColor: CI.bg, borderColor: CI.border }}
        >
          <div className="flex-1 min-w-0">
            <input
              className="w-full text-3xl font-extrabold tracking-wide text-slate-900 bg-transparent outline-none"
              value={personalInfo.name || ''}
              onChange={(e) => onUpdatePersonalInfo('name', e.target.value)}
              placeholder="Name"
            />
            <input
              className="mt-1 w-full text-[13px] font-bold bg-transparent outline-none"
              style={{ color: CI.primaryDark }}
              value={personalInfo.title || ''}
              onChange={(e) => onUpdatePersonalInfo('title', e.target.value)}
              placeholder="Zielposition / Profil"
            />

            <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2 text-[12px] text-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-slate-700">📍</span>
                <input
                  className="bg-transparent outline-none flex-1 text-slate-900"
                  value={personalInfo.location || ''}
                  onChange={(e) => onUpdatePersonalInfo('location', e.target.value)}
                  placeholder="Ort"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-700">☎</span>
                <input
                  className="bg-transparent outline-none flex-1 text-slate-900"
                  value={personalInfo.phone || ''}
                  onChange={(e) => onUpdatePersonalInfo('phone', e.target.value)}
                  placeholder="Telefon"
                />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-slate-700">✉</span>
                <input
                  className="bg-transparent outline-none flex-1 text-slate-900"
                  value={personalInfo.email || ''}
                  onChange={(e) => onUpdatePersonalInfo('email', e.target.value)}
                  placeholder="E-Mail"
                />
              </div>

              <div className="flex items-center gap-2">
                {personalInfo.linkedin ? (
                  <span className="text-[12px] font-extrabold" style={{ color: '#0A66C2' }}>
                    in
                  </span>
                ) : (
                  <span className="w-4" />
                )}
                <input
                  className="bg-transparent outline-none flex-1 text-slate-900"
                  value={personalInfo.linkedin || ''}
                  onChange={(e) => onUpdatePersonalInfo('linkedin', e.target.value)}
                  placeholder="LinkedIn (optional)"
                />
              </div>
            </div>
          </div>

          {photoUrl && (
            <div className="flex-shrink-0">
              <div
                className="w-24 h-24 rounded-2xl overflow-hidden border shadow-sm bg-slate-100"
                style={{ borderColor: CI.border }}
              >
                <img src={photoUrl} alt="Foto" className="w-full h-full object-cover" />
              </div>
            </div>
          )}
        </header>

        {/* CONTENT */}
        <main className="flex-1 px-8 py-5 grid grid-cols-12 gap-7">
          {/* LINKS */}
          <section className="col-span-12 md:col-span-7 space-y-4">
            <div>
              <SectionTitle>Profil</SectionTitle>
              <textarea
                ref={summaryRef}
                className="w-full text-[12px] leading-relaxed text-slate-900 border rounded-2xl px-4 py-3 outline-none resize-none"
                style={{ backgroundColor: CI.tint, borderColor: CI.border, overflow: 'hidden' }}
                value={summary || ''}
                onFocus={(e) => autoSize(e.currentTarget)}
                onInput={(e) => autoSize(e.currentTarget as HTMLTextAreaElement)}
                onChange={(e) => {
                  if (summaryRef.current) autoSize(summaryRef.current);
                  onUpdateSummary(e.target.value);
                }}
                placeholder="Kurzprofil: Wichtige Erfahrungen, Stärken und dein Mehrwert für die Rolle."
              />
            </div>

            {leftSections.map((section) => {
              const index = sections.findIndex((s) => s === section);
              return renderSection(section, index);
            })}
          </section>

          {/* RECHTS */}
          <aside className="col-span-12 md:col-span-5 space-y-4">
            {rightSections.map((section) => {
              const index = sections.findIndex((s) => s === section);
              return renderSection(section, index);
            })}
          </aside>
        </main>

        {otherSections.length > 0 && (
          <div className="px-8 pb-4 space-y-4">
            {otherSections.map((section) => {
              const index = sections.findIndex((s) => s === section);
              return renderSection(section, index);
            })}
          </div>
        )}

        {/* ✅ FOOTER wieder fix am Ende (kein Scroll-Glitch) */}
        <footer
          className="mt-auto px-8 py-3 border-t text-[11px] text-slate-700 flex items-center justify-between"
          style={{ borderColor: CI.border }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="whitespace-nowrap font-semibold text-slate-700">Ort:</span>
            <input
              className="bg-transparent outline-none border-b min-w-0 flex-1 text-slate-900"
              style={{ borderColor: '#d1d5db' }}
              value={footerLocation}
              onChange={(e) => onUpdatePersonalInfo('footerLocation', e.target.value)}
              placeholder="Ort (für Footer)"
            />
          </div>

          <div className="whitespace-nowrap font-semibold text-slate-700">{today}</div>
        </footer>
      </div>
    </div>
  );
};
