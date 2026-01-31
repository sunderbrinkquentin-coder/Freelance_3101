import { useState, useEffect } from 'react';
import { User, Briefcase, GraduationCap, Zap, Globe, Folder, Award } from 'lucide-react';
import { dbService } from '../../services/databaseService';
import PersonalDataSection from './profil-sections/PersonalDataSection';
import ExperienceSection from './profil-sections/ExperienceSection';
import EducationSection from './profil-sections/EducationSection';
import SkillsSection from './profil-sections/SkillsSection';
import LanguagesSection from './profil-sections/LanguagesSection';
import ProjectsSection from './profil-sections/ProjectsSection';
import CertificatesSection from './profil-sections/CertificatesSection';
import AccountSettings from './profil-sections/AccountSettings';

export default function ProfilTab() {
  const [profileData, setProfileData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const profile = await dbService.getProfile();
      const agentResponses = await dbService.getAgentResponses();

      setProfileData({
        personal: {
          vorname: profile?.vorname || '',
          nachname: profile?.nachname || '',
          email: profile?.email || '',
          telefon: profile?.telefon || '',
          ort: profile?.ort || '',
          plz: profile?.plz || '',
          linkedin: profile?.linkedin || '',
          website: profile?.website || '',
        },
        experience: agentResponses?.berufserfahrung || [],
        education: agentResponses?.bildung || [],
        skills: agentResponses?.skills || [],
        languages: agentResponses?.sprachen || [],
        projects: agentResponses?.projekte || [],
        certificates: agentResponses?.zertifikate || [],
      });
    } catch (error) {
      console.error('Failed to load profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePersonalData = async (data: any) => {
    try {
      await dbService.updateProfile(data);
      setProfileData((prev: any) => ({ ...prev, personal: data }));
    } catch (error) {
      console.error('Failed to update personal data:', error);
      throw error;
    }
  };

  const updateSection = async (section: string, data: any) => {
    try {
      await dbService.updateAgentResponse(section, data);
      setProfileData((prev: any) => ({ ...prev, [section]: data }));
    } catch (error) {
      console.error(`Failed to update ${section}:`, error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-text-secondary">Lade Profil...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Dein Profil</h1>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          <PersonalDataSection
            data={profileData?.personal}
            onUpdate={updatePersonalData}
          />

          <ExperienceSection
            data={profileData?.experience}
            onUpdate={(data) => updateSection('experience', data)}
          />

          <EducationSection
            data={profileData?.education}
            onUpdate={(data) => updateSection('education', data)}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <SkillsSection
            data={profileData?.skills}
            onUpdate={(data) => updateSection('skills', data)}
          />

          <LanguagesSection
            data={profileData?.languages}
            onUpdate={(data) => updateSection('languages', data)}
          />

          <ProjectsSection
            data={profileData?.projects}
            onUpdate={(data) => updateSection('projects', data)}
          />

          <CertificatesSection
            data={profileData?.certificates}
            onUpdate={(data) => updateSection('certificates', data)}
          />
        </div>
      </div>

      {/* Account Settings */}
      <div className="mt-8">
        <AccountSettings />
      </div>
    </div>
  );
}
