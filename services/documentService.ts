
// We need to add these libraries to the project
// npm install jspdf html2canvas docx
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, ImageRun } from 'docx';

export const generatePdf = async (element: HTMLElement | null, logoBase64: string | null, filename: string) => {
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;
    
    const pageImgWidth = pdfWidth - 20; // with margin
    const pageImgHeight = pageImgWidth / ratio;
    
    let heightLeft = imgHeight * (pageImgWidth / imgWidth); // scaled height
    let position = 10; // top margin
    
    pdf.addImage(imgData, 'PNG', 10, position, pageImgWidth, heightLeft);
    heightLeft -= (pdfHeight - 20); // remaining height

    while (heightLeft > 0) {
        position = - (pdfHeight - 20) * (Math.floor(imgHeight * (pageImgWidth / imgWidth) / (pdfHeight-20)) - Math.floor(heightLeft / (pdfHeight-20))) + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, pageImgWidth, imgHeight * (pageImgWidth/imgWidth));
        heightLeft -= (pdfHeight-20);
    }
    
    pdf.save(`${filename}.pdf`);
};

export const generateDocx = async (element: HTMLElement | null, logoBase64: string | null, filename: string) => {
    if (!element) return;

    const sections = [];
    
    if (logoBase64) {
        const response = await fetch(logoBase64);
        const imageBuffer = await response.arrayBuffer();
        sections.push({
            children: [
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
                }),
            ],
        });
    }

    const paragraphs = Array.from(element.querySelectorAll('p, h1, h2, h3, br'))
        .map(el => {
            // Handle line breaks by adding a new paragraph
            if (el.tagName.toLowerCase() === 'br') {
                return new Paragraph({ text: '' });
            }
            return new Paragraph({
                children: [new TextRun(el.textContent || '')],
                style: el.tagName.toLowerCase()
            });
        });
        
    sections.push({
        properties: {},
        children: paragraphs
    });

    const doc = new Document({
        sections: sections,
    });

    Packer.toBlob(doc).then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${filename}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    });
};
