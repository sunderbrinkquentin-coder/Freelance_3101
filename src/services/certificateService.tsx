import { Document, Page, View, Text, StyleSheet, pdf } from '@react-pdf/renderer';
import React from 'react';
import { Certificate, LearningPath } from '../types/learningPath';
import { supabase } from '../lib/supabase';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 60,
    fontFamily: 'Helvetica',
  },
  border: {
    border: '8px solid #66c0b6',
    padding: 40,
    height: '100%',
    position: 'relative',
  },
  decorativeLine: {
    width: '100%',
    height: 2,
    backgroundColor: '#66c0b6',
    marginVertical: 20,
  },
  header: {
    textAlign: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#020617',
    marginBottom: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 3,
  },
  body: {
    marginTop: 30,
    marginBottom: 30,
  },
  presentedTo: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    textTransform: 'uppercase',
    letterSpacing: 2,
  },
  recipientName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#020617',
    textAlign: 'center',
    marginBottom: 30,
    borderBottom: '2px solid #66c0b6',
    paddingBottom: 10,
  },
  description: {
    fontSize: 14,
    color: '#333',
    textAlign: 'center',
    lineHeight: 1.6,
    marginBottom: 20,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#66c0b6',
    textAlign: 'center',
    marginBottom: 30,
  },
  skillsSection: {
    marginTop: 30,
    marginBottom: 30,
  },
  skillsTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#020617',
    marginBottom: 15,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  skillBadge: {
    backgroundColor: '#f0f9ff',
    border: '1px solid #66c0b6',
    borderRadius: 15,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    fontSize: 11,
    color: '#020617',
  },
  footer: {
    position: 'absolute',
    bottom: 40,
    left: 40,
    right: 40,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 40,
  },
  footerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  signatureLine: {
    width: 150,
    height: 1,
    backgroundColor: '#333',
    marginBottom: 8,
  },
  footerLabel: {
    fontSize: 10,
    color: '#666',
  },
  footerValue: {
    fontSize: 12,
    color: '#020617',
    fontWeight: 'bold',
  },
  certificateId: {
    fontSize: 9,
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  watermark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) rotate(-45deg)',
    fontSize: 120,
    color: 'rgba(102, 192, 182, 0.05)',
    fontWeight: 'bold',
  },
});

interface CertificateDocumentProps {
  certificate: Certificate;
}

const CertificateDocument: React.FC<CertificateDocumentProps> = ({ certificate }) => (
  <Document>
    <Page size="A4" orientation="landscape" style={styles.page}>
      <View style={styles.border}>
        <Text style={styles.watermark}>CERTIFIED</Text>

        <View style={styles.header}>
          <Text style={styles.title}>ZERTIFIKAT</Text>
          <Text style={styles.subtitle}>Career Vision Program</Text>
        </View>

        <View style={styles.decorativeLine} />

        <View style={styles.body}>
          <Text style={styles.presentedTo}>Hiermit wird bestätigt, dass</Text>
          <Text style={styles.recipientName}>{certificate.recipient_name}</Text>

          <Text style={styles.description}>
            erfolgreich den personalisierten Lernpfad für die Zielposition
          </Text>

          <Text style={styles.jobTitle}>{certificate.target_job}</Text>

          <Text style={styles.description}>
            abgeschlossen und alle erforderlichen Kompetenzen erworben hat.
          </Text>

          <View style={styles.skillsSection}>
            <Text style={styles.skillsTitle}>Erworbene Fähigkeiten</Text>
            <View style={styles.skillsGrid}>
              {certificate.mastered_skills.slice(0, 12).map((skill, index) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <View style={styles.footerRow}>
            <View style={styles.footerColumn}>
              <View style={styles.signatureLine} />
              <Text style={styles.footerLabel}>Datum</Text>
              <Text style={styles.footerValue}>
                {new Date(certificate.completion_date).toLocaleDateString('de-DE')}
              </Text>
            </View>

            <View style={styles.footerColumn}>
              <View style={styles.signatureLine} />
              <Text style={styles.footerLabel}>Ausgestellt von</Text>
              <Text style={styles.footerValue}>{certificate.issuer}</Text>
            </View>
          </View>

          <Text style={styles.certificateId}>Zertifikat-ID: {certificate.certificate_id}</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export class CertificateService {
  static async generateCertificate(
    learningPath: LearningPath,
    recipientName: string
  ): Promise<Blob> {
    try {
      console.log('[Certificate] Generating certificate for:', recipientName);

      const masteredSkills = learningPath.missing_skills.map((skill) => skill.name);

      const certificate: Certificate = {
        recipient_name: recipientName,
        target_job: learningPath.target_job,
        mastered_skills: masteredSkills,
        completion_date: new Date().toISOString(),
        certificate_id: `CV-${learningPath.id.substring(0, 8).toUpperCase()}`,
        issuer: 'Career Vision Platform',
      };

      const blob = await pdf(<CertificateDocument certificate={certificate} />).toBlob();

      console.log('[Certificate] ✅ Certificate generated successfully');
      return blob;
    } catch (error) {
      console.error('[Certificate] Generation failed:', error);
      throw new Error('Failed to generate certificate');
    }
  }

  static async downloadCertificate(blob: Blob, filename: string): Promise<void> {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  static async uploadCertificateToStorage(
    blob: Blob,
    learningPathId: string
  ): Promise<string> {
    try {
      const fileName = `certificates/${learningPathId}-${Date.now()}.pdf`;

      const { data, error } = await supabase.storage
        .from('cv-uploads')
        .upload(fileName, blob, {
          contentType: 'application/pdf',
          upsert: false,
        });

      if (error) throw error;

      const {
        data: { publicUrl },
      } = supabase.storage.from('cv-uploads').getPublicUrl(data.path);

      console.log('[Certificate] ✅ Uploaded to storage:', publicUrl);
      return publicUrl;
    } catch (error) {
      console.error('[Certificate] Upload failed:', error);
      throw new Error('Failed to upload certificate to storage');
    }
  }

  static async issueCertificate(
    learningPath: LearningPath,
    recipientName: string
  ): Promise<string> {
    try {
      if (learningPath.status !== 'completed') {
        throw new Error('Learning path must be completed before issuing certificate');
      }

      console.log('[Certificate] Issuing certificate for learning path:', learningPath.id);

      const blob = await this.generateCertificate(learningPath, recipientName);

      const certificateUrl = await this.uploadCertificateToStorage(blob, learningPath.id);

      const { error } = await supabase
        .from('learning_paths')
        .update({
          certificate_issued_at: new Date().toISOString(),
          certificate_url: certificateUrl,
        })
        .eq('id', learningPath.id);

      if (error) throw error;

      await this.downloadCertificate(
        blob,
        `${recipientName.replace(/\s+/g, '_')}_Certificate_${learningPath.target_job.replace(/\s+/g, '_')}.pdf`
      );

      console.log('[Certificate] ✅ Certificate issued and saved');
      return certificateUrl;
    } catch (error: any) {
      console.error('[Certificate] Issuance failed:', error);
      throw new Error(`Failed to issue certificate: ${error.message}`);
    }
  }
}

export const certificateService = CertificateService;
