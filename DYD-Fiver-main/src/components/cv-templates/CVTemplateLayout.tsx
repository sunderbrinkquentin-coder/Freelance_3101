// src/components/cv-templates/CVTemplateLayout.tsx
import React from 'react';

interface CVTemplateLayoutProps {
  children: React.ReactNode;
  mode?: 'preview' | 'pdf';
}

const PAGE_HEIGHT = 1123; // A4-Höhe in Pixeln @ 96dpi
const PAGE_WIDTH = 794;   // A4-Breite
const MAX_PREVIEW_PAGES = 4;

export const CVTemplateLayout: React.FC<CVTemplateLayoutProps> = ({
  children,
  mode = 'preview',
}) => {
  const isPreview = mode === 'preview';

  return (
    <div className={isPreview ? 'w-full flex justify-center bg-transparent' : ''}>
      <div
        className={[
          'relative bg-white text-black',
          `w-[${PAGE_WIDTH}px]`,
          'overflow-visible',
          'font-sans',
          isPreview ? 'shadow-2xl rounded-xl' : '',
          isPreview
            ? 'origin-top transform scale-[0.45] sm:scale-75 md:scale-90 lg:scale-100'
            : '',
        ].join(' ')}
        style={
          isPreview
            ? { minHeight: PAGE_HEIGHT * MAX_PREVIEW_PAGES }
            : { minHeight: PAGE_HEIGHT }
        }
      >

        {/* Linien anzeigen → Seite 2, 3, 4 */}
        {isPreview &&
          Array.from({ length: MAX_PREVIEW_PAGES - 1 }).map((_, idx) => {
            const top = PAGE_HEIGHT * (idx + 1);

            return (
              <React.Fragment key={idx}>
                {/* gestrichelte Linie */}
                <div
                  className="absolute left-0 right-0 border-t border-dashed border-gray-400/70 pointer-events-none"
                  style={{ top }}
                />

                {/* Textlabel */}
                <div
                  className="absolute left-4 text-[10px] text-gray-500 bg-white/80 px-2 py-0.5 rounded pointer-events-none"
                  style={{ top: top + 4 }}
                >
                  Seite {idx + 2} beginnt hier
                </div>
              </React.Fragment>
            );
          })}

        <div className="w-full min-h-[1123px]">
          {children}
        </div>

      </div>
    </div>
  );
};
