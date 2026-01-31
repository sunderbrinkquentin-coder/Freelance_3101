import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  ImageRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
} from 'docx';

const saveAs = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

interface CVData {
  name: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  profile: string;
  experience: Array<{
    position: string;
    company: string;
    timeframe: string;
    bullets: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    timeframe: string;
    details?: string;
  }>;
  skills: string[];
  languages?: Array<{
    name: string;
    level: string;
  }>;
  projects?: Array<{
    title: string;
    description: string;
  }>;
}

async function base64ToBuffer(base64: string): Promise<ArrayBuffer> {
  const base64Data = base64.split(',')[1];
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

export async function downloadAsDOCX(
  data: CVData,
  photo?: string | null,
  showPhoto: boolean = true
): Promise<void> {
  try {
    const children: any[] = [];

    if (showPhoto && photo) {
      try {
        const imageBuffer = await base64ToBuffer(photo);
        children.push(
          new Paragraph({
            children: [
              new ImageRun({
                data: imageBuffer,
                transformation: {
                  width: 100,
                  height: 100,
                },
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          })
        );
      } catch (error) {
        console.warn('Failed to add photo to DOCX:', error);
      }
    }

    children.push(
      new Paragraph({
        text: data.name,
        heading: HeadingLevel.TITLE,
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: data.jobTitle,
            color: '4ECDC4',
            size: 28,
            bold: true,
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: `${data.email} | ${data.phone} | ${data.location}`,
            size: 20,
            color: '6B7280',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
      })
    );

    children.push(
      new Paragraph({
        text: 'Profil',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
        thematicBreak: true,
      }),
      new Paragraph({
        text: data.profile,
        spacing: { after: 200 },
      })
    );

    children.push(
      new Paragraph({
        text: 'Berufserfahrung',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
        thematicBreak: true,
      })
    );

    data.experience.forEach((exp) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: exp.position,
              bold: true,
              size: 24,
            }),
          ],
          spacing: { before: 200, after: 60 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.company} | ${exp.timeframe}`,
              color: '4ECDC4',
              size: 22,
            }),
          ],
          spacing: { after: 120 },
        })
      );

      exp.bullets.forEach((bullet) => {
        children.push(
          new Paragraph({
            text: bullet,
            bullet: { level: 0 },
            spacing: { after: 80 },
          })
        );
      });
    });

    children.push(
      new Paragraph({
        text: 'Bildung',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
        thematicBreak: true,
      })
    );

    data.education.forEach((edu) => {
      children.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.degree,
              bold: true,
              size: 22,
            }),
            new TextRun({
              text: ` | ${edu.timeframe}`,
              color: '6B7280',
              size: 20,
            }),
          ],
          spacing: { before: 120, after: 60 },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: edu.institution,
              color: '4ECDC4',
              size: 20,
            }),
          ],
          spacing: { after: edu.details ? 60 : 120 },
        })
      );

      if (edu.details) {
        children.push(
          new Paragraph({
            text: edu.details,
            color: '6B7280',
            spacing: { after: 120 },
          })
        );
      }
    });

    children.push(
      new Paragraph({
        text: 'Skills & Kompetenzen',
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 240, after: 120 },
        thematicBreak: true,
      })
    );

    const skillRows: TableRow[] = [];
    for (let i = 0; i < data.skills.length; i += 3) {
      const row = new TableRow({
        children: [
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.skills[i] || '',
                    bold: i < 3,
                  }),
                ],
              }),
            ],
            width: { size: 33, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.skills[i + 1] || '',
                    bold: i + 1 < 3,
                  }),
                ],
              }),
            ],
            width: { size: 33, type: WidthType.PERCENTAGE },
          }),
          new TableCell({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: data.skills[i + 2] || '',
                    bold: i + 2 < 3,
                  }),
                ],
              }),
            ],
            width: { size: 34, type: WidthType.PERCENTAGE },
          }),
        ],
      });
      skillRows.push(row);
    }

    children.push(
      new Table({
        rows: skillRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left: { style: BorderStyle.NONE },
          right: { style: BorderStyle.NONE },
          insideHorizontal: { style: BorderStyle.NONE },
          insideVertical: { style: BorderStyle.NONE },
        },
      }),
      new Paragraph({ spacing: { after: 200 } })
    );

    if (data.languages && data.languages.length > 0) {
      children.push(
        new Paragraph({
          text: 'Sprachen',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
          thematicBreak: true,
        })
      );

      const langRows = data.languages.map(
        (lang) =>
          new TableRow({
            children: [
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: lang.name,
                        bold: true,
                      }),
                    ],
                  }),
                ],
                width: { size: 50, type: WidthType.PERCENTAGE },
              }),
              new TableCell({
                children: [
                  new Paragraph({
                    text: lang.level,
                  }),
                ],
                width: { size: 50, type: WidthType.PERCENTAGE },
              }),
            ],
          })
      );

      children.push(
        new Table({
          rows: langRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        }),
        new Paragraph({ spacing: { after: 200 } })
      );
    }

    if (data.projects && data.projects.length > 0) {
      children.push(
        new Paragraph({
          text: 'Projekte',
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
          thematicBreak: true,
        })
      );

      data.projects.forEach((project) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: project.title,
                bold: true,
                size: 22,
              }),
            ],
            spacing: { before: 120, after: 80 },
          }),
          new Paragraph({
            text: project.description,
            spacing: { after: 160 },
          })
        );
      });
    }

    const doc = new Document({
      sections: [
        {
          properties: {
            page: {
              margin: {
                top: 1134,
                right: 1134,
                bottom: 1134,
                left: 1134,
              },
            },
          },
          children,
        },
      ],
    });

    const blob = await Packer.toBlob(doc);
    const fileName = `${data.name.replace(/\s+/g, '_')}_CV.docx`;
    saveAs(blob, fileName);
  } catch (error) {
    console.error('DOCX Export Error:', error);
    throw new Error('DOCX-Generierung fehlgeschlagen');
  }
}
