// src/components/cv-templates/templates/CreativeCVTemplate.tsx
import React from 'react';

type EditorSection = { type: string; title?: string; items?: any[]; [key: string]: any; };
interface PersonalInfo { name?: string; title?: string; email?: string; phone?: string; location?: string; linkedin?: string; [key: string]: any; }
interface CreativeCVTemplateProps {
  personalInfo: PersonalInfo; summary?: string; sections: EditorSection[]; photoUrl?: string;
  onUpdatePersonalInfo: (field: string, value: string) => void; onUpdateSummary: (value: string) => void;
  onUpdateSection: (sectionIndex: number, updates: Partial<EditorSection>) => void;
  onUpdateSectionItem: (sectionIndex: number, itemIndex: number, field: string, value: any) => void;
}

const SectionTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h2 className="mt-3 mb-1.5 text-xs font-semibold tracking-[0.16em] text-[#e5e7eb] uppercase flex items-center gap-1.5">
    <span className="w-1 h-1 rounded-full bg-gradient-to-r from-[#22c1c3] to-[#66c0b6]" />{children}
  </h2>
);

export const CreativeCVTemplate: React.FC<CreativeCVTemplateProps> = ({ personalInfo, summary, sections, photoUrl, onUpdatePersonalInfo, onUpdateSummary, onUpdateSectionItem }) => {
  const experienceSectionIndex = sections.findIndex(s => s.type === 'experience');
  const educationSectionIndex = sections.findIndex(s => s.type === 'education');
  const projectsSectionIndex = sections.findIndex(s => s.type === 'projects');
  const hardSkillsSectionIndex = sections.findIndex(s => s.type === 'skills');
  const softSkillsSectionIndex = sections.findIndex(s => s.type === 'soft_skills');
  const workValuesSectionIndex = sections.findIndex(s => s.type === 'work_values' || s.type === 'values');
  const hobbiesSectionIndex = sections.findIndex(s => s.type === 'hobbies' || s.type === 'interests');
  const languagesSectionIndex = sections.findIndex(s => s.type === 'languages');
  
  const safeItems = (sec: EditorSection | null) => Array.isArray(sec?.items) ? sec!.items : [];
  const experiences = safeItems(sections[experienceSectionIndex]);
  const educations = safeItems(sections[educationSectionIndex]);
  const projects = safeItems(sections[projectsSectionIndex]);
  const hardSkills = safeItems(sections[hardSkillsSectionIndex]);
  const softSkills = safeItems(sections[softSkillsSectionIndex]);
  const workValues = safeItems(sections[workValuesSectionIndex]);
  const hobbies = safeItems(sections[hobbiesSectionIndex]);
  const languages = safeItems(sections[languagesSectionIndex]);
  
  const getBullets = (item: any): string[] => {
    if (Array.isArray(item?.bulletPoints) && item.bulletPoints.length > 0) return item.bulletPoints;
    if (typeof item?.description === 'string' && item.description.trim().length > 0) return item.description.split('\n').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
    return [];
  };
  
  const handleBulletChange = (sectionIndex: number, itemIndex: number, bulletIndex: number, value: string, currentItem: any) => {
    const currentBullets = getBullets(currentItem);
    const newBullets = [...currentBullets];
    newBullets[bulletIndex] = value;
    onUpdateSectionItem(sectionIndex, itemIndex, 'bulletPoints', newBullets);
  };
  
  const handleAddBullet = (sectionIndex: number, itemIndex: number, currentItem: any) => {
    const currentBullets = getBullets(currentItem);
    onUpdateSectionItem(sectionIndex, itemIndex, 'bulletPoints', [...currentBullets, 'Neuer Bulletpoint']);
  };
  
  return (
    <div className="cv-template-container bg-gradient-to-br from-[#020617] via-[#020617] to-[#020617] text-white font-sans flex flex-col">
      <header className="cv-template-header relative px-6 pt-4 pb-2.5 flex items-center justify-between border-b border-white/10 bg-[#020617]/95 gap-3">
        <div className="pointer-events-none absolute inset-0 opacity-25">
          <div className="absolute -top-10 -left-8 w-48 h-48 bg-[#22c1c3] blur-3xl rounded-full" />
          <div className="absolute -bottom-16 right-0 w-56 h-56 bg-[#66c0b6] blur-3xl rounded-full" />
        </div>
        <div className="relative flex-1">
          <input className="block w-full text-2xl font-bold tracking-[0.12em] uppercase outline-none bg-transparent text-white" value={personalInfo.name || ''} onChange={(e) => onUpdatePersonalInfo('name', e.target.value)} placeholder="Name" />
          <input className="mt-0.5 block w-full text-sm font-medium text-[#e5e7eb] outline-none bg-transparent" value={personalInfo.title || ''} onChange={(e) => onUpdatePersonalInfo('title', e.target.value)} placeholder="Titel" />
          <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-white">
            <div className="flex items-center gap-1.5"><span>📍</span><input className="w-full bg-transparent outline-none" value={personalInfo.location || ''} onChange={(e) => onUpdatePersonalInfo('location', e.target.value)} placeholder="Ort" /></div>
            <div className="flex items-center gap-1.5"><span>☎</span><input className="w-full bg-transparent outline-none" value={personalInfo.phone || ''} onChange={(e) => onUpdatePersonalInfo('phone', e.target.value)} placeholder="Telefon" /></div>
            <div className="flex items-center gap-1.5"><span>✉</span><input className="w-full bg-transparent outline-none" value={personalInfo.email || ''} onChange={(e) => onUpdatePersonalInfo('email', e.target.value)} placeholder="E-Mail" /></div>
            {personalInfo.linkedin && <div className="flex items-center gap-1.5"><span>in</span><input className="w-full bg-transparent outline-none" value={personalInfo.linkedin || ''} onChange={(e) => onUpdatePersonalInfo('linkedin', e.target.value)} placeholder="LinkedIn" /></div>}
          </div>
        </div>
        {photoUrl && <div className="relative flex-shrink-0"><div className="w-20 h-20 rounded-3xl overflow-hidden border-2 border-white bg-[#020617]"><img src={photoUrl} alt="Foto" className="w-full h-full object-cover" /></div></div>}
      </header>
      
      <main className="flex-1 px-6 py-3 grid grid-cols-12 gap-4 text-[#e5e7eb] bg-[#020617]">
        <section className="col-span-12 md:col-span-7 space-y-3">
          <div><SectionTitle>Profil & Story</SectionTitle><textarea className="w-full mt-0.5 text-[11px] leading-relaxed text-[#e5e7eb] bg-white/5 rounded-lg border border-white/25 outline-none resize-none px-2 py-1.5" rows={3} value={summary || ''} onChange={(e) => onUpdateSummary(e.target.value)} placeholder="Profil" /></div>
          
          {experiences.length > 0 && (
            <div><SectionTitle>Berufserfahrung</SectionTitle>
              {experiences.map((exp: any, idx: number) => {
                const bullets = getBullets(exp);
                return (
                  <div key={idx} className="mb-2.5 rounded-xl bg-[#020617] border border-white/25 px-3 py-2">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <input className="font-semibold text-[11px] outline-none w-full bg-transparent text-white" value={exp.title || exp.position || ''} onChange={(e) => onUpdateSectionItem(experienceSectionIndex, idx, 'title', e.target.value)} placeholder="Position" />
                        <input className="outline-none bg-transparent w-full text-[10px] text-[#cbd5f5] mt-0.5" value={exp.company || ''} onChange={(e) => onUpdateSectionItem(experienceSectionIndex, idx, 'company', e.target.value)} placeholder="Unternehmen" />
                      </div>
                      <div className="text-[10px] text-[#cbd5f5] whitespace-nowrap flex-shrink-0 flex items-center gap-0.5">
                        <input className="outline-none bg-transparent w-14 text-right" value={exp.date_from || ''} onChange={(e) => onUpdateSectionItem(experienceSectionIndex, idx, 'date_from', e.target.value)} placeholder="Von" />–
                        <input className="outline-none bg-transparent w-14" value={exp.date_to || ''} onChange={(e) => onUpdateSectionItem(experienceSectionIndex, idx, 'date_to', e.target.value)} placeholder="Bis" />
                      </div>
                    </div>
                    {bullets.length > 0 ? (
                      <ul className="mt-1 ml-4 space-y-0.5 text-[10px] text-[#e5e7eb]" style={{ listStyleType: 'disc', listStylePosition: 'outside' }}>
                        {bullets.map((bp: string, bIdx: number) => (<li key={bIdx} className="marker:text-[#66c0b6] pl-0.5"><input className="w-full bg-transparent outline-none" value={bp} onChange={(e) => handleBulletChange(experienceSectionIndex, idx, bIdx, e.target.value, exp)} placeholder="Aufgabe" /></li>))}
                      </ul>
                    ) : (
                      <textarea className="mt-0.5 w-full text-[10px] text-[#e5e7eb] outline-none resize-none bg-transparent" rows={2} value={exp.description || ''} onChange={(e) => onUpdateSectionItem(experienceSectionIndex, idx, 'description', e.target.value)} placeholder="Aufgaben" />
                    )}
                    <button type="button" className="mt-0.5 text-[9px] text-[#38bdf8] hover:underline" onClick={() => handleAddBullet(experienceSectionIndex, idx, exp)}>+ Punkt</button>
                  </div>
                );
              })}
            </div>
          )}
          
          {projects.length > 0 && (
            <div><SectionTitle>Portfolio-Projekte</SectionTitle>
              {projects.map((proj: any, idx: number) => {
                const bullets = getBullets(proj);
                return (
                  <div key={idx} className="mb-2 rounded-xl bg-[#020617] border border-white/25 px-3 py-2">
                    <input className="font-semibold text-[11px] outline-none w-full bg-transparent text-white" value={proj.title || proj.name || ''} onChange={(e) => onUpdateSectionItem(projectsSectionIndex, idx, 'title', e.target.value)} placeholder="Projekt" />
                    {bullets.length > 0 ? (
                      <ul className="mt-1 ml-4 space-y-0.5 text-[10px] text-[#e5e7eb]" style={{ listStyleType: 'disc', listStylePosition: 'outside' }}>
                        {bullets.map((bp: string, bIdx: number) => (<li key={bIdx} className="marker:text-[#66c0b6] pl-0.5"><input className="w-full bg-transparent outline-none" value={bp} onChange={(e) => handleBulletChange(projectsSectionIndex, idx, bIdx, e.target.value, proj)} placeholder="Detail" /></li>))}
                      </ul>
                    ) : (
                      <textarea className="mt-0.5 w-full text-[10px] text-[#e5e7eb] outline-none resize-none bg-transparent" rows={1} value={proj.description || ''} onChange={(e) => onUpdateSectionItem(projectsSectionIndex, idx, 'description', e.target.value)} placeholder="Beschreibung" />
                    )}
                    <button type="button" className="mt-0.5 text-[9px] text-[#38bdf8] hover:underline" onClick={() => handleAddBullet(projectsSectionIndex, idx, proj)}>+ Punkt</button>
                  </div>
                );
              })}
            </div>
          )}
        </section>
        
        <aside className="col-span-12 md:col-span-5 space-y-3">
          {educations.length > 0 && (
            <div><SectionTitle>Ausbildung & Studium</SectionTitle>
              {educations.map((edu: any, idx: number) => (
                <div key={idx} className="mb-2 rounded-xl bg-[#020617] border border-white/25 px-3 py-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">
                      <input className="font-semibold text-[11px] outline-none w-full bg-transparent text-white" value={edu.degree || ''} onChange={(e) => onUpdateSectionItem(educationSectionIndex, idx, 'degree', e.target.value)} placeholder="Abschluss" />
                      <input className="outline-none bg-transparent w-full text-[10px] text-[#cbd5f5] mt-0.5" value={edu.institution || ''} onChange={(e) => onUpdateSectionItem(educationSectionIndex, idx, 'institution', e.target.value)} placeholder="Institution" />
                    </div>
                    <div className="text-[10px] text-[#cbd5f5] whitespace-nowrap flex-shrink-0 flex items-center gap-0.5">
                      <input className="outline-none bg-transparent w-14 text-right" value={edu.date_from || ''} onChange={(e) => onUpdateSectionItem(educationSectionIndex, idx, 'date_from', e.target.value)} placeholder="Von" />–
                      <input className="outline-none bg-transparent w-14" value={edu.date_to || ''} onChange={(e) => onUpdateSectionItem(educationSectionIndex, idx, 'date_to', e.target.value)} placeholder="Bis" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {(hardSkills.length > 0 || softSkills.length > 0) && (
            <div><SectionTitle>Skills & Tools</SectionTitle>
              {hardSkills.length > 0 && (<div className="mb-2"><div className="mb-0.5 text-[9px] font-semibold tracking-wide text-[#cbd5f5] uppercase">Fachlich</div><div className="flex flex-wrap gap-0.5">{hardSkills.map((skill: any, idx: number) => (<input key={idx} className="px-1.5 py-0.5 bg-[#020617] text-[9px] rounded-full border border-[#38bdf8] outline-none text-[#e5e7eb]" value={typeof skill === 'string' ? skill : skill.skill || ''} onChange={(e) => onUpdateSectionItem(hardSkillsSectionIndex, idx, 'skill', e.target.value)} placeholder="Skill" />))}</div></div>)}
              {softSkills.length > 0 && (<div><div className="mb-0.5 text-[9px] font-semibold tracking-wide text-[#cbd5f5] uppercase">Persönlich</div><div className="flex flex-wrap gap-0.5">{softSkills.map((skill: any, idx: number) => (<input key={idx} className="px-1.5 py-0.5 bg-[#020617] text-[9px] rounded-full border border-[#a855f7] outline-none text-[#e5e7eb]" value={typeof skill === 'string' ? skill : skill.skill || ''} onChange={(e) => onUpdateSectionItem(softSkillsSectionIndex, idx, 'skill', e.target.value)} placeholder="Stärke" />))}</div></div>)}
            </div>
          )}
          
          {languages.length > 0 && (
            <div><SectionTitle>Sprachen</SectionTitle><div className="space-y-0.5">{languages.map((lang: any, idx: number) => (<div key={idx} className="flex justify-between items-center text-[10px] text-white"><input className="outline-none bg-transparent font-medium w-1/2" value={typeof lang === 'string' ? lang : lang.language || ''} onChange={(e) => onUpdateSectionItem(languagesSectionIndex, idx, 'language', e.target.value)} placeholder="Sprache" /><input className="outline-none bg-transparent text-white/70 w-1/2 text-right text-[9px]" value={typeof lang === 'object' ? lang.level || '' : ''} onChange={(e) => onUpdateSectionItem(languagesSectionIndex, idx, 'level', e.target.value)} placeholder="Niveau" /></div>))}</div></div>
          )}
          
          {workValues.length > 0 && (<div><SectionTitle>Arbeitsweise & Werte</SectionTitle><div className="flex flex-wrap gap-0.5">{workValues.map((val: any, idx: number) => (<input key={idx} className="px-1.5 py-0.5 bg-[#020617] text-[9px] rounded-full border border-[#22c1c3] outline-none text-[#e5e7eb]" value={typeof val === 'string' ? val : val.label || ''} onChange={(e) => onUpdateSectionItem(workValuesSectionIndex, idx, 'label', e.target.value)} placeholder="Wert" />))}</div></div>)}
          
          {hobbies.length > 0 && (<div><SectionTitle>Hobbys & Interessen</SectionTitle><div className="flex flex-wrap gap-0.5">{hobbies.map((hob: any, idx: number) => (<input key={idx} className="px-1.5 py-0.5 bg-[#020617] text-[9px] rounded-full border border-[#f97316] outline-none text-[#e5e7eb]" value={typeof hob === 'string' ? hob : hob.label || ''} onChange={(e) => onUpdateSectionItem(hobbiesSectionIndex, idx, 'label', e.target.value)} placeholder="Hobby" />))}</div></div>)}
        </aside>
      </main>
    </div>
  );
};
