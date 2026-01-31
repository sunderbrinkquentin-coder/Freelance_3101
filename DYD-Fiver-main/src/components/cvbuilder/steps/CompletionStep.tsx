function Step11_Completion() {
  const handleComplete = async () => {
    console.log("🔥 Step11: Finalisierung gestartet");
    console.log("🔥 cvData vor finaler Verarbeitung:", cvData);

    // 🔥 WICHTIG: Immer Arrays garantieren
    const finalCvData: CVBuilderData = {
      ...cvData,
      workExperiences: cvData.workExperiences ?? [],
      projects: cvData.projects ?? [],
      languages: cvData.languages ?? [],
    };

    console.log("🔥 finalCvData:", finalCvData);

    let finalCvId = cvId;

    try {
      if (finalCvId) {
        // -------------------------------------------
        // 🟦 Bestehendes CV aktualisieren
        // -------------------------------------------
        const { error } = await supabase
          .from("stored_cvs")
          .update({
            user_id: user?.id ?? null,
            cv_data: finalCvData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", finalCvId);

        if (error) {
          console.error("❌ Update-Fehler:", error);
        }
      } else {
        // -------------------------------------------
        // 🟩 Neues CV anlegen
        // -------------------------------------------
        const { data, error } = await supabase
          .from("stored_cvs")
          .insert({
            user_id: user?.id ?? null,
            cv_data: finalCvData,
            is_paid: false,
            source: "wizard",
            status: "draft",
          })
          .select("id")
          .single();

        if (error) {
          console.error("❌ Insert-Fehler:", error);
        } else {
          finalCvId = data.id;
          setCvId(finalCvId);
        }
      }

      // -------------------------------------------
      // 🟣 Weiterleitung JobTargeting
      // -------------------------------------------
      navigate("/job-targeting", {
        state: {
          cvData: finalCvData,
          cvId: finalCvId ?? null,
        },
      });
    } catch (err) {
      console.error("❌ Unerwarteter Fehler in Step11:", err);

      // Auch bei Fehler → trotzdem weiterleiten
      navigate("/job-targeting", {
        state: {
          cvData: finalCvData,
          cvId: finalCvId ?? null,
        },
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full text-center space-y-12 animate-fade-in">
        <h1 className="text-5xl font-bold text-white">Perfekt! 🎉</h1>
        <p className="text-xl text-white/70">
          Wir haben alle Daten für deinen professionellen CV gesammelt.
        </p>

        <button
          onClick={handleComplete}
          className="px-10 py-5 rounded-2xl bg-gradient-to-r from-[#66c0b6] to-[#30E3CA] text-black font-bold text-xl shadow-xl hover:scale-105 transition-all"
        >
          Weiter zu deiner Wunschstelle
        </button>
      </div>
    </div>
  );
}
