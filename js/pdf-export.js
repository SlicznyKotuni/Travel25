const exportToPDF = () => {
    // Użyj biblioteki jsPDF lub html2pdf
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    
    // Nagłówek
    doc.setFontSize(20);
    doc.text('Plan podróży', 105, 15, { align: 'center' });
    
    // Dla każdego dnia
    Object.entries(plannerData.sectionAssignments).forEach(([day, sections], index) => {
        if (index > 0) doc.addPage();
        
        // Nagłówek dnia
        doc.setFontSize(16);
        doc.text(`Dzień ${day}`, 14, 25);
        
        // Sekcje
        let yPosition = 35;
        sections.forEach(sectionId => {
            const section = tripData.sections.find(s => `section-${s.id}` === sectionId);
            if (!section) return;
            
            doc.setFontSize(14);
            doc.text(section.title, 14, yPosition);
            yPosition += 10;
            
            // Podsekcje
            const dayKey = `${day}-${sectionId}`;
            if (plannerData.subsectionAssignments[dayKey]) {
                plannerData.subsectionAssignments[dayKey].forEach(subsectionId => {
                    const subsection = section.subsections?.find(s => `subsection-${s.id}` === subsectionId);
                    if (subsection) {
                        doc.setFontSize(12);
                        doc.text(`- ${subsection.title}`, 20, yPosition);
                        yPosition += 7;
                    }
                });
            }
            
            yPosition += 10;
        });
    });
    
    doc.save('plan_podrozy.pdf');
};