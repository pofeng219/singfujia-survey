
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface ExportOptions {
    fileName: string;
    page1Ref?: HTMLElement | null;
    page2Ref?: HTMLElement | null;
    page3Ref?: HTMLElement | null;
    pageRefs?: HTMLElement[];
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

const PAGE_LABELS = ['第一頁', '第二頁', '第三頁', '第四頁', '第五頁', '第六頁', '第七頁', '第八頁'];

const getPageLabel = (idx: number) => PAGE_LABELS[idx] || `第${idx + 1}頁`;

const resolvePageElements = (opts: ExportOptions): HTMLElement[] => {
    if (opts.pageRefs && opts.pageRefs.length > 0) {
        return opts.pageRefs.filter((el): el is HTMLElement => !!el);
    }
    return [opts.page1Ref, opts.page2Ref, opts.page3Ref].filter((el): el is HTMLElement => !!el);
};

/**
 * Helper to generate canvases from refs
 */
const getCanvases = async (pages: HTMLElement[]) => {
    const canvases: HTMLCanvasElement[] = [];
    for (const page of pages) {
        canvases.push(await html2canvas(page, HTML2CANVAS_OPTS));
    }
    return canvases;
};

/**
 * Handles JPG Export
 * Returns the dataURL if mobile (to show modal), or triggers download if desktop.
 */
export const exportToJPG = async (opts: ExportOptions): Promise<string[] | null> => {
    const { fileName, isMobile, onSuccess, onError } = opts;
    try {
        const pages = resolvePageElements(opts);
        if (pages.length === 0) throw new Error('No pages to export');

        const canvases = await getCanvases(pages);
        const dataUrls = canvases.map((c) => c.toDataURL('image/jpeg', 0.9));

        if (isMobile) {
            if (onSuccess) onSuccess("✅ 圖片已產生，請長按圖片儲存");
            return dataUrls; // Return URLs for modal display
        } else {
            dataUrls.forEach((url, idx) => {
                const triggerDownload = () => {
                    const link = document.createElement('a');
                    link.download = `${getPageLabel(idx)}_${fileName}.jpg`;
                    link.href = url;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                };
                if (idx === 0) {
                    triggerDownload();
                } else {
                    setTimeout(triggerDownload, idx * 450);
                }
            });

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
export const exportToPDF = async (opts: ExportOptions) => {
    const { fileName, isMobile, onSuccess, onError } = opts;
    try {
        const pages = resolvePageElements(opts);
        if (pages.length === 0) throw new Error('No pages to export');

        const canvases = await getCanvases(pages);
        
        const pdf = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4', compress: true });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();

        const addScaledImage = (c: HTMLCanvasElement) => {
            const imgData = c.toDataURL('image/jpeg', 0.9);
            const ratio = c.height / c.width;
            let finalWidth = pdfWidth;
            let finalHeight = pdfWidth * ratio;

            // If the content is taller than A4 ratio due to dynamic expansion, scale it down to fit without distortion
            if (finalHeight > pdfHeight) {
                finalHeight = pdfHeight;
                finalWidth = pdfHeight / ratio;
            }
            
            // Center horizontally if scaled down
            const xOffset = (pdfWidth - finalWidth) / 2;
            
            pdf.addImage(imgData, 'JPEG', xOffset, 0, finalWidth, finalHeight, undefined, 'FAST');
        };

        canvases.forEach((canvas, idx) => {
            if (idx > 0) pdf.addPage();
            addScaledImage(canvas);
        });

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
