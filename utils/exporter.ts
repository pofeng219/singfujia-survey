
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ExportOptions {
    fileName: string;
    page1Ref: HTMLElement;
    page2Ref?: HTMLElement | null;
    page3Ref?: HTMLElement | null;
    isMobile: boolean;
    onSuccess?: (msg: string) => void;
    onError?: (err: any) => void;
}

const HTML2CANVAS_OPTS = {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    windowWidth: 1200,
    scrollY: 0,
    logging: false,
    ignoreElements: (el: Element) => el.classList.contains('no-print')
};

/**
 * Helper to generate canvases from refs
 */
const getCanvases = async (page1Ref: HTMLElement, page2Ref?: HTMLElement | null, page3Ref?: HTMLElement | null) => {
    const canvas1 = await html2canvas(page1Ref, HTML2CANVAS_OPTS);
    let canvas2 = null;
    let canvas3 = null;
    
    if (page2Ref) {
        canvas2 = await html2canvas(page2Ref, HTML2CANVAS_OPTS);
    }
    
    if (page3Ref) {
        canvas3 = await html2canvas(page3Ref, HTML2CANVAS_OPTS);
    }
    
    return { canvas1, canvas2, canvas3 };
};

/**
 * Handles JPG Export
 * Returns the dataURL if mobile (to show modal), or triggers download if desktop.
 */
export const exportToJPG = async ({ fileName, page1Ref, page2Ref, page3Ref, isMobile, onSuccess, onError }: ExportOptions): Promise<string | null> => {
    try {
        const { canvas1, canvas2, canvas3 } = await getCanvases(page1Ref, page2Ref, page3Ref);
        const dataUrl1 = canvas1.toDataURL('image/jpeg', 0.9);

        if (isMobile) {
            if (onSuccess) onSuccess("✅ 圖片已產生，請長按圖片儲存");
            return dataUrl1; // Return URL for modal display
        } else {
            // Desktop: Download Page 1
            const link1 = document.createElement('a');
            link1.download = `正面_${fileName}.jpg`;
            link1.href = dataUrl1;
            document.body.appendChild(link1);
            link1.click();
            document.body.removeChild(link1);

            // Desktop: Download Page 2 (if exists)
            if (canvas2) {
                setTimeout(() => {
                    const link2 = document.createElement('a');
                    link2.download = `背面_${fileName}.jpg`;
                    link2.href = canvas2.toDataURL('image/jpeg', 0.9);
                    document.body.appendChild(link2);
                    link2.click();
                    document.body.removeChild(link2);
                }, 500);
            }

            // Desktop: Download Page 3 (if exists)
            if (canvas3) {
                setTimeout(() => {
                    const link3 = document.createElement('a');
                    link3.download = `第三頁_${fileName}.jpg`;
                    link3.href = canvas3.toDataURL('image/jpeg', 0.9);
                    document.body.appendChild(link3);
                    link3.click();
                    document.body.removeChild(link3);
                }, 1000);
            }

            if (onSuccess) onSuccess("✅ 圖片下載中...");
            return null;
        }
    } catch (e) {
        if (onError) onError(e);
        return null;
    }
};

/**
 * Handles PDF Export
 */
export const exportToPDF = async ({ fileName, page1Ref, page2Ref, page3Ref, isMobile, onSuccess, onError }: ExportOptions) => {
    try {
        const { canvas1, canvas2, canvas3 } = await getCanvases(page1Ref, page2Ref, page3Ref);
        
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const addScaledImage = (c: HTMLCanvasElement) => {
            const imgData = c.toDataURL('image/jpeg', 0.9);
            pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');
        };

        addScaledImage(canvas1);
        
        if (canvas2) {
            pdf.addPage();
            addScaledImage(canvas2);
        }

        if (canvas3) {
            pdf.addPage();
            addScaledImage(canvas3);
        }

        const fullFileName = `${fileName}.pdf`;

        if (isMobile) {
            const pdfBlob = pdf.output('blob');
            const file = new File([pdfBlob], fullFileName, { type: 'application/pdf' });
            
            if (navigator.canShare && navigator.canShare({ files: [file] })) {
                try {
                    await navigator.share({
                        files: [file],
                        title: '幸福家現況調查表',
                        text: fileName
                    });
                    if (onSuccess) onSuccess("✅ 已喚起分享選單");
                } catch (shareErr) {
                    if ((shareErr as Error).name !== 'AbortError') {
                        pdf.save(fullFileName);
                        if (onSuccess) onSuccess("✅ PDF 已開始下載");
                    }
                }
            } else {
                pdf.save(fullFileName);
                if (onSuccess) onSuccess("✅ PDF 已開始下載");
            }
        } else {
            pdf.save(fullFileName);
            if (onSuccess) onSuccess("✅ PDF 已下載至電腦");
        }
    } catch (e) {
        if (onError) onError(e);
    }
};
