import React from 'react';

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
  [key: string]: any;
}

interface ClassicCVTemplateProps {
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
}

const EditableText: React.FC<{
  value?: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  multiline?: boolean;
}> = ({ value, onChange, className = '', placeholder = '', multiline = false }) => {
  if (multiline) {
    return (
      <textarea
        className={`w-full resize-none bg-transparent outline-none border-none focus:ring-0 ${className}`}
        value={value ?? ''}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
      />
    );
  }

  return (
    <input
      className={`w-full bg-transparent outline-none border-none focus:ring-0 ${className}`}
      value={value ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export const ClassicCVTemplate: React.FC<ClassicCVTemplateProps> = ({
  personalInfo,
  summary,
  sections,
  photoUrl,
  onUpdatePersonalInfo,
  onUpdateSummary,
  onUpdateSection,
  onUpdateSectionItem,
}) => {
  // Hilfsfunktionen, um bestimmte Section-Typen zu finden
  const findSectionIndex = (type: string) =>
    sections.findIndex((s) => s.type === type);

  const experienceIndex = findSectionIndex('experience');
  const educationIndex = findSectionIndex('education');
  const projectsIndex = findSectionIndex('projects');
  const skillsIndex = findSectionIndex('skills');
  const softSkillsIndex = findSectionIndex('soft_skills');
  const languagesIndex = findSectionIndex('languages');
  const workValuesIndex = findSectionIndex('work_values');

  const renderBulletPoints = (bullets: any[] | undefined) => {
    if (!bullets || !Array.isArray(bullets) || bullets.length === 0) return null;

    return (
      <ul className="list-disc list-inside space-y-1 mt-1">
        {bullets.map((bp, idx) => {
          const text = typeof bp === 'string' ? bp : bp?.text ?? String(bp);
          if (!text) return null;
          return (
            <li key={idx} className="leading-snug">
              {text}
            </li>
          );
        })}
      </ul>
    );
  };

  const renderExperience = () => {
    if (experienceIndex === -1) return null;
    const section = sections[experienceIndex];
    const items = Array.isArray(section.items) ? section.items : [];

    return (
      <div>
        <h2 className="text-[11px] font-semibold tracking-[0.16em] uppercase text-gray-700 border-b border-gray-300 pb-1 mb-2">
          Berufserfahrung
        </h2>
        <div className="space-y-3">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="leading-tight">
              <div className="flex justify-between gap-2">
                <EditableText
                  value={item.title}
                  onChange={(val) =>
                    onUpdateSectionItem(experienceIndex, idx, 'title', val)
                  }
                  className="font-semibold text-[12px] text-gray-900"
                  placeholder="Position / Rolle"
                />
                <EditableText
                  value={
                    [item.date_from, item.date_to]
                      .filter(Boolean)
                      .join(' – ') || ''
                  }
                  onChange={(val) => {
                    const [from, to] = val.split('–').map((v) => v.trim());
                    onUpdateSectionItem(experienceIndex, idx, 'date_from', from);
                    onUpdateSectionItem(experienceIndex, idx, 'date_to', to);
                  }}
                  className="text-[10px] text-gray-500 text-right min-w-[80px]"
                  placeholder="Zeitraum"
                />
              </div>
              <EditableText
                value={item.company}
                onChange={(val) =>
                  onUpdateSectionItem(experienceIndex, idx, 'company', val)
                }
                className="text-[11px] text-gray-700"
                placeholder="Unternehmen / Ort"
              />
              {item.description && (
                <EditableText
                  value={item.description}
                  onChange={(val) =>
                    onUpdateSectionItem(
                      experienceIndex,
                      idx,
                      'description',
                      val
                    )
                  }
                  className="text-[11px] text-gray-800 mt-1"
                  multiline
                  placeholder="Beschreibung / Aufgaben"
                />
              )}
              {renderBulletPoints(item.bulletPoints)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderEducation = () => {
    if (educationIndex === -1) return null;
    const section = sections[educationIndex];
    const items = Array.isArray(section.items) ? section.items : [];

    return (
      <div>
        <h2 className="text-[11px] font-semibold tracking-[0.16em] uppercase text-gray-700 border-b border-gray-300 pb-1 mb-2 mt-4">
          Ausbildung / Studium
        </h2>
        <div className="space-y-3">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="leading-tight">
              <EditableText
                value={item.degree}
                onChange={(val) =>
                  onUpdateSectionItem(educationIndex, idx, 'degree', val)
                }
                className="font-semibold text-[12px] text-gray-900"
                placeholder="Abschluss / Studiengang"
              />
              <EditableText
                value={item.institution}
                onChange={(val) =>
                  onUpdateSectionItem(
                    educationIndex,
                    idx,
                    'institution',
                    val
                  )
                }
                className="text-[11px] text-gray-700"
                placeholder="Institution / Ort"
              />
              <EditableText
                value={
                  [item.date_from, item.date_to]
                    .filter(Boolean)
                    .join(' – ') || ''
                }
                onChange={(val) => {
                  const [from, to] = val.split('–').map((v) => v.trim());
                  onUpdateSectionItem(educationIndex, idx, 'date_from', from);
                  onUpdateSectionItem(educationIndex, idx, 'date_to', to);
                }}
                className="text-[10px] text-gray-500"
                placeholder="Zeitraum"
              />
              {item.description && (
                <EditableText
                  value={item.description}
                  onChange={(val) =>
                    onUpdateSectionItem(
                      educationIndex,
                      idx,
                      'description',
                      val
                    )
                  }
                  className="text-[11px] text-gray-800 mt-1"
                  multiline
                  placeholder="Schwerpunkte / Noten / Themen"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderProjects = () => {
    if (projectsIndex === -1) return null;
    const section = sections[projectsIndex];
    const items = Array.isArray(section.items) ? section.items : [];

    return (
      <div>
        <h2 className="text-[11px] font-semibold tracking-[0.16em] uppercase text-gray-700 border-b border-gray-300 pb-1 mb-2 mt-4">
          Projekte
        </h2>
        <div className="space-y-3">
          {items.map((item: any, idx: number) => (
            <div key={idx} className="leading-tight">
              <EditableText
                value={item.title}
                onChange={(val) =>
                  onUpdateSectionItem(projectsIndex, idx, 'title', val)
                }
                className="font-semibold text-[12px] text-gray-900"
                placeholder="Projektname"
              />
              {item.role && (
                <EditableText
                  value={item.role}
                  onChange={(val) =>
                    onUpdateSectionItem(projectsIndex, idx, 'role', val)
                  }
                  className="text-[11px] text-gray-700"
                  placeholder="Rolle / Verantwortung"
                />
              )}
              {item.description && (
                <EditableText
                  value={item.description}
                  onChange={(val) =>
                    onUpdateSectionItem(
                      projectsIndex,
                      idx,
                      'description',
                      val
                    )
                  }
                  className="text-[11px] text-gray-800 mt-1"
                  multiline
                  placeholder="Projektbeschreibung / Ergebnisse"
                />
              )}
              {renderBulletPoints(item.bulletPoints)}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderListSection = (
    label: string,
    index: number,
    options?: { showLevelsForLanguages?: boolean }
  ) => {
    if (index === -1) return null;
    const section = sections[index];
    const items = Array.isArray(section.items) ? section.items : [];

    if (!items.length) return null;

    return (
      <div className="mb-4">
        <h3 className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gray-700 mb-1">
          {label}
        </h3>
        <ul className="space-y-1">
          {items.map((item: any, idx: number) => {
            if (options?.showLevelsForLanguages) {
              const language = item.language || item.name || item.sprache || '';
              const level = item.level || item.niveau || item.proficiency || '';
              return (
                <li key={idx} className="flex justify-between gap-2 text-[10px]">
                  <EditableText
                    value={language}
                    onChange={(val) =>
                      onUpdateSectionItem(index, idx, 'language', val)
                    }
                    className="text-gray-800"
                    placeholder="Sprache"
                  />
                  <EditableText
                    value={level}
                    onChange={(val) =>
                      onUpdateSectionItem(index, idx, 'level', val)
                    }
                    className="text-gray-600 text-right min-w-[60px]"
                    placeholder="Niveau"
                  />
                </li>
              );
            }

            const text =
              typeof item === 'string'
                ? item
                : item.label || item.name || item.title || String(item);

            return (
              <li key={idx} className="text-[10px] leading-snug">
                <EditableText
                  value={text}
                  onChange={(val) =>
                    onUpdateSectionItem(index, idx, 'value', val)
                  }
                  className="text-gray-800"
                  placeholder="Eintrag"
                />
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  const renderWorkValues = () => {
    if (workValuesIndex === -1) return null;
    const section = sections[workValuesIndex];
    const items = Array.isArray(section.items) ? section.items : [];
    if (!items.length) return null;

    return (
      <div>
        <h2 className="text-[11px] font-semibold tracking-[0.16em] uppercase text-gray-700 border-b border-gray-300 pb-1 mb-2 mt-4">
          Arbeitsweise & Werte
        </h2>
        <ul className="list-disc list-inside space-y-1 text-[11px] text-gray-800">
          {items.map((item: any, idx: number) => {
            const text =
              typeof item === 'string'
                ? item
                : item.label || item.name || item.value || String(item);
            return (
              <li key={idx} className="leading-snug">
                <EditableText
                  value={text}
                  onChange={(val) =>
                    onUpdateSectionItem(workValuesIndex, idx, 'value', val)
                  }
                  className="text-gray-800"
                  placeholder="Wert / Arbeitsstil"
                />
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div
      className="h-full w-full text-[13px] text-gray-900 font-serif"
      style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
    >
      {/* Außenrand für klassischen Look */}
      <div className="h-full w-full border border-gray-300 p-6">
        <div className="flex h-full gap-6">
          {/* Linke Spalte */}
          <aside className="w-2/5 max-w-[32%] pr-4 border-r border-gray-200 flex flex-col">
            {/* Foto + Name */}
            <div className="mb-4">
              {photoUrl && (
                <div className="w-24 h-24 rounded-full overflow-hidden border border-gray-300 mb-3 mx-auto">
                  <img
                    src={photoUrl}
                    alt="Profilfoto"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="text-center">
                <EditableText
                  value={personalInfo.name}
                  onChange={(val) => onUpdatePersonalInfo('name', val)}
                  className="text-[18px] font-bold tracking-wide text-gray-900"
                  placeholder="Dein Name"
                />
                <EditableText
                  value={personalInfo.title}
                  onChange={(val) => onUpdatePersonalInfo('title', val)}
                  className="text-[11px] text-gray-600 mt-1"
                  placeholder="Berufsbezeichnung"
                />
              </div>
            </div>

            {/* Kontakt */}
            <div className="mb-4">
              <h3 className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gray-700 mb-1">
                Kontakt
              </h3>
              <div className="space-y-1 text-[10px]">
                <EditableText
                  value={personalInfo.email}
                  onChange={(val) => onUpdatePersonalInfo('email', val)}
                  className="text-gray-800"
                  placeholder="E-Mail"
                />
                <EditableText
                  value={personalInfo.phone}
                  onChange={(val) => onUpdatePersonalInfo('phone', val)}
                  className="text-gray-800"
                  placeholder="Telefon"
                />
                <EditableText
                  value={personalInfo.location}
                  onChange={(val) => onUpdatePersonalInfo('location', val)}
                  className="text-gray-800"
                  placeholder="Ort"
                />
                <EditableText
                  value={personalInfo.linkedin}
                  onChange={(val) => onUpdatePersonalInfo('linkedin', val)}
                  className="text-gray-800"
                  placeholder="LinkedIn"
                />
              </div>
            </div>

            {/* Skills / Soft Skills / Sprachen in der Sidebar */}
            {renderListSection('Fähigkeiten', skillsIndex)}
            {renderListSection('Soft Skills', softSkillsIndex)}
            {renderListSection('Sprachen', languagesIndex, {
              showLevelsForLanguages: true,
            })}

            {/* Optional: Work Values auch links anzeigen, falls du sie lieber dort hast
            {workValuesIndex !== -1 && (
              <div className="mt-2">
                {renderWorkValues()}
              </div>
            )} */}
          </aside>

          {/* Rechte Spalte */}
          <main className="flex-1 flex flex-col">
            {/* Profil / Summary */}
            <section className="mb-4">
              <h2 className="text-[11px] font-semibold tracking-[0.16em] uppercase text-gray-700 border-b border-gray-300 pb-1 mb-2">
                Profil
              </h2>
              <EditableText
                value={summary}
                onChange={onUpdateSummary}
                className="text-[11px] text-gray-800 leading-snug"
                placeholder="Kurzprofil / Zusammenfassung"
                multiline
              />
            </section>

            {renderExperience()}
            {renderEducation()}
            {renderProjects()}
            {renderWorkValues()}

            {/* Sonstige unbekannte Sections generisch rendern (falls vorhanden) */}
            {sections.map((section, index) => {
              const knownTypes = [
                'experience',
                'education',
                'projects',
                'skills',
                'soft_skills',
                'languages',
                'work_values',
              ];
              if (knownTypes.includes(section.type)) return null;

              const items = Array.isArray(section.items) ? section.items : [];
              if (!items.length) return null;

              const title =
                section.title ||
                section.type.charAt(0).toUpperCase() + section.type.slice(1);

              return (
                <section key={section.type} className="mt-4">
                  <h2 className="text-[11px] font-semibold tracking-[0.16em] uppercase text-gray-700 border-b border-gray-300 pb-1 mb-2">
                    {title}
                  </h2>
                  <div className="space-y-2 text-[11px] text-gray-800">
                    {items.map((item: any, idx: number) => {
                      const text =
                        typeof item === 'string'
                          ? item
                          : item.description ||
                            item.text ||
                            item.label ||
                            item.name ||
                            String(item);

                      return (
                        <EditableText
                          key={idx}
                          value={text}
                          onChange={(val) =>
                            onUpdateSectionItem(index, idx, 'text', val)
                          }
                          className="leading-snug"
                          multiline
                          placeholder="Eintrag"
                        />
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </main>
        </div>
      </div>
    </div>
  );
};
