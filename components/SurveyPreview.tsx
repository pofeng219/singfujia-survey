import { SurveyData, SurveyType } from "../types";
import { formatDateROC } from "./ROCDatePicker";
import React, { useMemo, useState, useEffect, useLayoutEffect, useRef, useCallback } from "react";
import { useInterface } from "./InterfaceContext";
import {
  PreviewResult,
  CheckRow,
  SectionHeader,
  TableHeaderRow,
  Watermark,
  ParkingContent,
  Footer,
  PreviewBlock,
} from "./preview/PreviewShared";
import { getHousePreviewBlocks } from "./preview/HousePreviewPages";
import { getLandPreviewBlocks } from "./preview/LandPreviewPages";
import { getFactoryPreviewBlocks } from "./preview/FactoryPreviewPages";

interface SurveyPreviewProps {
  data: SurveyData;
  type: SurveyType;
  exporting: boolean;
  previewScale: number;
  previewPage: number;
  setPreviewPage: (page: number) => void;
  page1Ref: React.RefObject<HTMLDivElement | null>;
  page2Ref: React.RefObject<HTMLDivElement | null>;
  page3Ref?: React.RefObject<HTMLDivElement | null>;
  dynamicPageRefs?: React.MutableRefObject<(HTMLDivElement | null)[]>;
  isMobile?: boolean;
}

const CHINESE_PAGE_LABELS = [
  "第一頁",
  "第二頁",
  "第三頁",
  "第四頁",
  "第五頁",
  "第六頁",
  "第七頁",
  "第八頁",
];

const getPageLabel = (pageNum: number) =>
  CHINESE_PAGE_LABELS[pageNum - 1] || `第${pageNum}頁`;

const getParkingPreviewBlocks = (
  data: SurveyData,
  parkingSummary: any,
  activeMode: "a4" | "mobile",
): PreviewBlock[] => [
  {
    id: "parking-q1",
    node: (
      <>
        <SectionHeader title="1. 車位資訊" />
        <CheckRow
          checked={
            !!data?.q10_noParking ||
            (data?.q10_parkTypes && data.q10_parkTypes.length > 0) ||
            !!data?.q10_hasParkTypeOther
          }
        >
          <span className="font-bold mr-2">車位資訊</span>
          <ParkingContent
            data={data}
            parkingSummary={parkingSummary}
            activeMode={activeMode}
          />
        </CheckRow>
        <CheckRow
          checked={
            !!data?.q10_noParking ||
            data?.q11_hasIssue === "否" ||
            data?.q11_hasIssue === "無異常"
          }
        >
          <span className="font-bold mr-2">車位使用現況</span>
          <PreviewResult
            checked={
              data?.q11_hasIssue === "否" || data?.q11_hasIssue === "無異常"
            }
            label="無異常"
          />
          <PreviewResult
            checked={
              data?.q11_hasIssue === "是" || data?.q11_hasIssue === "有異常"
            }
            label={
              [
                ...(data?.q11_items || []),
                data?.q11_hasOther
                  ? data.q11_other
                    ? `其他未列項目：${data.q11_other}`
                    : "其他未列項目"
                  : "",
              ]
                .filter(Boolean)
                .join("、") || "有異常"
            }
            isWarning={true}
          />
        </CheckRow>
        <CheckRow checked={!!data?.q10_noParking || data?.q12_hasNote === "否"}>
          <span className="font-bold mr-2">車位與車道其他備註</span>
          <PreviewResult checked={data?.q12_hasNote === "否"} label="無" />
          <PreviewResult
            checked={data?.q12_hasNote === "是"}
            label={data?.q12_note || "有"}
            isWarning={true}
          />
        </CheckRow>
      </>
    ),
  },
  {
    id: "parking-q2",
    node: (
      <>
        <SectionHeader title="2. 重要環境設施與常見環境抗性設施" />
        <CheckRow checked={!!data?.q16_noFacilities}>
          <span className="font-bold mr-2 shrink-0">重要環境設施</span>
          {data?.q16_noFacilities && (
            <span className="font-medium">無重要環境設施</span>
          )}
          {!data?.q16_noFacilities &&
            data?.q16_items &&
            data.q16_items.length > 0 && (
              <span className="font-medium mr-2">
                {data.q16_items.join("、")}
              </span>
            )}
          {data?.q16_hasOther && (
            <PreviewResult
              checked={!!data?.q16_hasOther}
              label={
                data.q16_other
                  ? `其他未列項目：${data.q16_other}`
                  : "其他未列項目"
              }
              isWarning={true}
            />
          )}
        </CheckRow>
        <CheckRow checked={!!data?.q16_2_noFacilities}>
          <span className="font-bold mr-2 shrink-0">常見環境抗性設施</span>
          {data?.q16_2_noFacilities && (
            <span className="font-medium">無常見環境抗性設施</span>
          )}
          {!data?.q16_2_noFacilities &&
            data?.q16_2_items &&
            data.q16_2_items.length > 0 && (
              <span className="font-medium inline-block mr-2">
                {data.q16_2_items.join("、")}
              </span>
            )}
          {data?.q16_2_hasOther && (
            <PreviewResult
              checked={!!data?.q16_2_hasOther}
              label={
                data.q16_2_other
                  ? `其他未列項目：${data.q16_2_other}`
                  : "其他未列項目"
              }
              isWarning={true}
            />
          )}
        </CheckRow>
      </>
    ),
  },
  {
    id: "parking-q3",
    node: (
      <>
        <SectionHeader title="3. 本案或本社區須注意的事項" />
        <CheckRow checked={data?.q17_issue === "否"}>
          <span className="font-bold mr-2">其他應注意事項</span>
          <PreviewResult checked={data?.q17_issue === "否"} label="無" />
          <PreviewResult
            checked={data?.q17_issue === "是"}
            label={data?.q17_desc || "有"}
            isWarning={true}
          />
          <PreviewResult
            checked={data?.q17_issue === "待查證"}
            label={data?.q17_desc ? `待查證：${data.q17_desc}` : "待查證"}
            isWarning={true}
          />
        </CheckRow>
      </>
    ),
  },
];

interface ScaledA4PageProps {
  children?: React.ReactNode;
  pageNum: number;
  previewPage: number;
  previewScale: number;
  exporting: boolean;
  setPageRef: (el: HTMLDivElement | null) => void;
}

const ScaledA4Page: React.FC<ScaledA4PageProps> = ({
  children,
  pageNum,
  previewPage,
  previewScale,
  exporting,
  setPageRef,
}) => {
  const localRef = useRef<HTMLDivElement | null>(null);
  const [actualHeight, setActualHeight] = useState<number | null>(null);

  const attachRef = useCallback(
    (el: HTMLDivElement | null) => {
      localRef.current = el;
      setPageRef(el);
    },
    [setPageRef],
  );

  useEffect(() => {
    const el = localRef.current;
    if (!el || exporting) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target instanceof HTMLElement && entry.target.offsetHeight > 0) {
          setActualHeight(entry.target.offsetHeight);
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [exporting]);

  const computedHeight =
    actualHeight !== null && !exporting
      ? `${actualHeight * previewScale}px`
      : exporting
        ? "auto"
        : `${297 * previewScale}mm`;

  return (
    <div
      style={{
        width: exporting ? "210mm" : `${210 * previewScale}mm`,
        height: computedHeight,
        flexShrink: 0,
        boxShadow: exporting
          ? "none"
          : "0 25px 50px -12px rgb(0 0 0 / 0.25)",
        backgroundColor: "white",
        marginBottom: exporting ? 0 : "2rem",
        overflow: exporting ? "visible" : "hidden",
        display: previewPage === pageNum || exporting ? "block" : "none",
        pageBreakAfter: exporting ? "always" : "auto",
      }}
      className={
        exporting
          ? "print-page transition-none"
          : "transition-all duration-300 transform-gpu"
      }
    >
      <div
        ref={attachRef}
        className="a4-page relative"
        style={{
          transform: `scale(${exporting ? 1 : previewScale})`,
          transformOrigin: "top left",
          width: "210mm",
          minHeight: "297mm",
          margin: 0,
          padding: "10mm 10mm", // Use 10mm padding consistently to match export
        }}
      >
        <Watermark />
        <div className="relative z-10 flex-grow flex flex-col">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- MAIN PREVIEW COMPONENT ---

export const SurveyPreview = React.memo<SurveyPreviewProps>(
  ({
    data,
    type,
    exporting,
    previewScale,
    previewPage,
    setPreviewPage,
    page1Ref,
    page2Ref,
    page3Ref,
    dynamicPageRefs,
    isMobile = false,
  }) => {
    const isStandard = useInterface() === "standard";
    const activeMode = "a4";

    const parkingSummary = useMemo(() => {
      const isNoParking = data?.q10_noParking === true;
      const pts = data?.q10_parkTypes || [];
      const isOtherPt = data?.q10_hasParkTypeOther === true;
      const isPlaneType =
        pts.includes("坡道平面") ||
        pts.includes("一樓平面") ||
        pts.includes("法定空地／自家門前");

      return {
        isNoParking,
        showMethod: !isNoParking,
        showNumber:
          !isNoParking &&
          !isOtherPt &&
          (data?.q10_parkingNumberType === "number" ||
            data?.q10_parkingNumberType === "none"),
        showCarStatus:
          !isNoParking &&
          !isOtherPt &&
          ((data?.q10_carUsage || []).length > 0 || data?.q10_hasCarUsageOther),
        showCarSize:
          !isNoParking &&
          !isOtherPt &&
          !pts.includes("法定空地／自家門前") &&
          !!data?.q10_measureType,
        showWeight:
          !isNoParking &&
          !isOtherPt &&
          !isPlaneType &&
          data?.q10_mechWeight &&
          data?.q10_measureType !== "無法測量也無相關資訊",
        showHeight:
          !isNoParking &&
          !isOtherPt &&
          !pts.includes("法定空地／自家門前") &&
          data?.q10_entryHeight,
        showCharging: !isNoParking,
        showAbnormal: !isNoParking && data?.q11_hasIssue === "是",
        showSupplement: !isNoParking && data?.q12_hasNote === "是",
      };
    }, [data]);

    // Atomic blocks for Smart Auto-Pagination (both Standard Mode and Friendly Mode)
    const friendlyBlocks = useMemo<PreviewBlock[]>(() => {
      if (type === "house") return getHousePreviewBlocks(data, parkingSummary, activeMode);
      if (type === "factory") return getFactoryPreviewBlocks(data, parkingSummary, activeMode, isStandard);
      if (type === "land") return getLandPreviewBlocks(data);
      return getParkingPreviewBlocks(data, parkingSummary, activeMode);
    }, [isStandard, type, data, parkingSummary]);

    // Measurement refs for Smart Auto-Pagination
    const budgetRulerRef = useRef<HTMLDivElement | null>(null);
    const p1ChromeRef = useRef<HTMLDivElement | null>(null);
    const pOtherChromeRef = useRef<HTMLDivElement | null>(null);
    const footerNormalRef = useRef<HTMLDivElement | null>(null);
    const footerSigRef = useRef<HTMLDivElement | null>(null);
    const measureBlockRefs = useRef<(HTMLDivElement | null)[]>([]);

    const [pageGroups, setPageGroups] = useState<number[][]>(() =>
      friendlyBlocks.length > 0 ? [friendlyBlocks.map((_, i) => i)] : [[0]],
    );

    const recalculatePages = useCallback(() => {
      if (friendlyBlocks.length === 0) return;
      const rulerEl = budgetRulerRef.current;
      const p1El = p1ChromeRef.current;
      const pOtherEl = pOtherChromeRef.current;
      const fNormalEl = footerNormalRef.current;
      const fSigEl = footerSigRef.current;
      if (!rulerEl || !p1El || !pOtherEl || !fNormalEl || !fSigEl) return;

      const pageBudget = rulerEl.getBoundingClientRect().height;
      // If ancestor is hidden (e.g. mobile form tab), defer until visible
      if (pageBudget <= 50) return;

      const p1ChromeH = p1El.getBoundingClientRect().height;
      const pOtherChromeH = pOtherEl.getBoundingClientRect().height;
      const footerNormalH = fNormalEl.getBoundingClientRect().height;
      const footerSigH = fSigEl.getBoundingClientRect().height;

      // Safety margins account for table border (4px) + bottom margin (16px/8px) + minor subpixel rounding
      const availPage1 = Math.max(120, pageBudget - p1ChromeH - footerNormalH - (isStandard ? 20 : 28));
      const availOther = Math.max(120, pageBudget - pOtherChromeH - footerNormalH - 20);

      const blockHeights = friendlyBlocks.map((_, idx) => {
        const el = measureBlockRefs.current[idx];
        // Add +4px to account for SectionHeader's mt-1 inside the real table container
        return el ? el.getBoundingClientRect().height + 4 : 0;
      });

      const groups: number[][] = [];
      let currentGroup: number[] = [];
      let currentHeight = 0;

      for (let i = 0; i < friendlyBlocks.length; i++) {
        const h = blockHeights[i];
        const pageIdx = groups.length;
        const avail = pageIdx === 0 ? availPage1 : availOther;
        if (currentGroup.length > 0 && currentHeight + h > avail) {
          groups.push(currentGroup);
          currentGroup = [i];
          currentHeight = h;
        } else {
          currentGroup.push(i);
          currentHeight += h;
        }
      }
      if (currentGroup.length > 0) {
        groups.push(currentGroup);
      }

      // Ensure the last page (which renders the taller Signature Footer) does not overflow A4 height
      while (groups.length > 0) {
        const lastIdx = groups.length - 1;
        const lastAvail = Math.max(
          120,
          (lastIdx === 0
            ? pageBudget - p1ChromeH - (isStandard ? 20 : 28)
            : pageBudget - pOtherChromeH - 20) - footerSigH,
        );
        const lastGroup = groups[lastIdx];
        let lastSum = lastGroup.reduce((acc, idx) => acc + blockHeights[idx], 0);
        if (lastGroup.length <= 1 || lastSum <= lastAvail) break;

        const overflow: number[] = [];
        while (lastGroup.length > 1 && lastSum > lastAvail) {
          const popped = lastGroup.pop()!;
          overflow.unshift(popped);
          lastSum -= blockHeights[popped];
        }
        if (overflow.length > 0) {
          groups.push(overflow);
        } else {
          break;
        }
      }

      setPageGroups((prev) => {
        if (
          prev.length === groups.length &&
          prev.every(
            (g, idx) =>
              g.length === groups[idx].length &&
              g.every((val, j) => val === groups[idx][j]),
          )
        ) {
          return prev;
        }
        return groups;
      });
    }, [isStandard, friendlyBlocks]);

    useLayoutEffect(() => {
      measureBlockRefs.current.length = friendlyBlocks.length;
      recalculatePages();
      let rafId = 0;
      if (typeof window !== "undefined" && typeof window.requestAnimationFrame === "function") {
        rafId = window.requestAnimationFrame(() => {
          recalculatePages();
        });
      }
      return () => {
        if (rafId && typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function") {
          window.cancelAnimationFrame(rafId);
        }
      };
    }, [isStandard, friendlyBlocks, data, type, recalculatePages]);

    // Re-measure when web fonts finish loading, window resizes, or preview container becomes visible
    useEffect(() => {
      let cancelled = false;
      if (typeof document !== "undefined" && (document as any).fonts?.ready) {
        (document as any).fonts.ready.then(() => {
          if (!cancelled) recalculatePages();
        });
      }
      const handleResize = () => recalculatePages();
      window.addEventListener("resize", handleResize);

      let ro: ResizeObserver | null = null;
      if (budgetRulerRef.current && typeof ResizeObserver !== "undefined") {
        ro = new ResizeObserver(() => {
          recalculatePages();
        });
        ro.observe(budgetRulerRef.current);
      }

      return () => {
        cancelled = true;
        window.removeEventListener("resize", handleResize);
        if (ro) ro.disconnect();
      };
    }, [recalculatePages]);

    const effectivePageGroups = useMemo(() => {
      if (friendlyBlocks.length === 0) return pageGroups;
      const covered = new Set<number>();
      let totalCount = 0;
      let valid = pageGroups.length > 0;
      for (const group of pageGroups) {
        if (group.length === 0) {
          valid = false;
          break;
        }
        for (const idx of group) {
          if (idx < 0 || idx >= friendlyBlocks.length || covered.has(idx)) {
            valid = false;
            break;
          }
          covered.add(idx);
          totalCount++;
        }
        if (!valid) break;
      }
      if (valid && totalCount === friendlyBlocks.length && covered.size === friendlyBlocks.length) {
        return pageGroups;
      }
      return [friendlyBlocks.map((_, i) => i)];
    }, [friendlyBlocks, pageGroups]);

    // Keep dynamicPageRefs and legacy page refs synced to current page count
    useEffect(() => {
      if (dynamicPageRefs) {
        dynamicPageRefs.current.length = effectivePageGroups.length;
      }
      if (effectivePageGroups.length < 2) {
        (page2Ref as React.MutableRefObject<HTMLDivElement | null>).current = null;
      }
      if (effectivePageGroups.length < 3 && page3Ref) {
        (page3Ref as React.MutableRefObject<HTMLDivElement | null>).current = null;
      }
    }, [effectivePageGroups.length, dynamicPageRefs, page2Ref, page3Ref]);

    // Clamp previewPage if page count decreases
    const totalPages = Math.max(1, effectivePageGroups.length);

    useEffect(() => {
      if (previewPage > totalPages) {
        setPreviewPage(totalPages);
      }
    }, [previewPage, totalPages, setPreviewPage]);

    const renderPageHeader = (pageNum: number, showVersion: boolean) => (
      <div
        className={`flex justify-between items-end border-b-[5px] border-[#009FE3] pb-0 ${isStandard ? "mb-4 mt-4" : "mb-3 mt-3"} relative w-full shrink-0`}
      >
        <h1
          className={`font-bold tracking-widest text-black ${isStandard ? "leading-tight mb-3 text-[36px]" : "leading-tight mb-2 text-[36px]"}`}
        >
          <>
            幸福家不動產
            <br />
            －業務版現況調查表
          </>
        </h1>
        <div
          className={`${isStandard ? "text-[16px] py-1.5" : "text-[18px] py-1.5"} font-bold text-white bg-[#009FE3] px-4 rounded-t-lg translate-y-[5px]`}
        >
          【{getPageLabel(pageNum)}】{showVersion ? data?.version : ""}
        </div>
      </div>
    );

    const renderMetadataTable = () => (
      <table
        className={`excel-table ${isStandard ? "mb-2" : "mb-2"} w-full table-fixed text-black border-collapse border-2 border-[#009FE3] shrink-0`}
      >
        <colgroup>
          <col className="w-[10%]" />
          <col className="w-[30%]" />
          <col className="w-[12%]" />
          <col className="w-[18%]" />
          <col className="w-[10%]" />
          <col className="w-[20%]" />
        </colgroup>
        <tbody>
          <tr className="border-b border-[#7dd3fc]">
            <td
              className={`bg-[#f0f9ff] text-[#0369a1] w-[10%] whitespace-nowrap font-bold py-1.5 px-2 ${isStandard ? "text-[16px]" : "text-[19px]"}`}
            >
              案名
            </td>
            <td
              className={`w-[30%] font-bold text-black py-1.5 px-2 break-words [word-break:break-word] [overflow-wrap:anywhere] ${isStandard ? "text-[16px]" : "text-[19px]"}`}
            >
              {data?.caseName}
            </td>
            <td
              className={`bg-[#f0f9ff] text-[#0369a1] w-[12%] whitespace-nowrap font-bold py-1.5 px-2 ${isStandard ? "text-[16px]" : "text-[19px]"}`}
            >
              {type === "land"
                ? "坐落"
                : type === "parking"
                  ? "位置"
                  : "地址"}
            </td>
            <td
              colSpan={3}
              className={`w-[48%] font-bold text-black py-1.5 px-2 break-words [word-break:break-word] [overflow-wrap:anywhere] ${isStandard ? "text-[16px]" : "text-[19px]"}`}
            >
              {data?.address}
            </td>
          </tr>
          <tr className="border-b border-[#7dd3fc]">
            <td
              className={`bg-[#f0f9ff] text-[#0369a1] w-[10%] whitespace-nowrap font-bold py-1.5 px-2 ${isStandard ? "text-[16px]" : "text-[19px]"}`}
            >
              店名
            </td>
            <td
              className={`w-[30%] text-black py-1.5 px-2 break-words [word-break:break-word] [overflow-wrap:anywhere] ${isStandard ? "text-[16px]" : "text-[19px]"}`}
            >
              {data?.storeName}
            </td>
            <td
              className={`bg-[#f0f9ff] text-[#0369a1] w-[12%] whitespace-nowrap font-bold py-1.5 px-2 ${isStandard ? "text-[16px]" : "text-[19px]"}`}
            >
              業務
            </td>
            <td
              className={`w-[18%] font-bold text-black py-1.5 px-2 break-words [word-break:break-word] [overflow-wrap:anywhere] ${isStandard ? "text-[16px]" : "text-[19px]"}`}
            >
              {data?.agentName}
            </td>
            <td
              className={`bg-[#f0f9ff] text-[#0369a1] w-[10%] whitespace-nowrap font-bold py-1.5 px-2 ${isStandard ? "text-[16px]" : "text-[19px]"}`}
            >
              日期
            </td>
            <td
              className={`w-[20%] text-left font-mono whitespace-nowrap text-black py-1.5 px-2 ${isStandard ? "text-[16px]" : "text-[19px]"}`}
            >
              {formatDateROC(data?.fillDate || "")}
            </td>
          </tr>
        </tbody>
      </table>
    );

    const renderBasicInfoTable = () => (
      <div
        className={`${isStandard ? "mb-1" : "mb-1.5"} w-full bg-white border-2 border-gray-300 rounded-lg overflow-hidden shrink-0`}
      >
        <div
          className={`px-2 ${isStandard ? "py-1 gap-x-2 gap-y-0.5 text-[15px]" : "py-1.5 gap-x-2 gap-y-1 text-[18px]"} flex flex-wrap items-center min-w-0 max-w-full [&>*]:min-w-0 [&>*]:max-w-full break-words [word-break:break-word] [overflow-wrap:anywhere] leading-snug text-black`}
        >
          <span
            className={`font-bold text-black ${isStandard ? "text-[16px]" : "text-[19px]"}`}
          >
            {type === "factory" || type === "house" || type === "land"
              ? "本物件型態與現況："
              : "本物件現況："}
          </span>
          {(type === "factory" || type === "house" || type === "land") && (
            <PreviewResult
              checked={!!data?.propertyType}
              label={data?.propertyType}
              forceSafe={true}
              suffix={
                (data?.propertyType === "其他特殊工業設施" ||
                  data?.propertyType === "其他" ||
                  data?.propertyType === "其他未列項目") &&
                data?.propertyTypeOther
                  ? `：${data.propertyTypeOther}`
                  : ""
              }
            />
          )}
          <PreviewResult checked={data?.access === "可進入"} label="可進入" />
          {data?.access === "不可進入" && (
            <>
              <PreviewResult
                checked={true}
                label={
                  (data?.accessType || []).length > 0 ? "不可進入：" : "不可進入"
                }
                isWarning={true}
              />
              {(data?.accessType || []).map((opt) => (
                <PreviewResult
                  key={opt}
                  checked={true}
                  isWarning={true}
                  label={
                    opt +
                    ((opt === "其他" || opt === "其他未列項目") &&
                    data?.accessOther
                      ? "："
                      : "")
                  }
                  suffix={
                    opt === "其他" || opt === "其他未列項目"
                      ? data.accessOther
                      : ""
                  }
                />
              ))}
            </>
          )}
        </div>
      </div>
    );

    const renderPageSwitcher = () => {
      if (effectivePageGroups.length <= 1) return null;
      return (
        <div className="flex bg-white rounded-2xl shadow-md p-2 gap-2 border border-slate-200 no-print w-full dark:bg-slate-800 dark:border-slate-700 overflow-x-auto">
          {effectivePageGroups.map((_, idx) => {
            const pNum = idx + 1;
            return (
              <button
                key={pNum}
                onClick={() => setPreviewPage(pNum)}
                className={`flex-1 min-w-[88px] py-4 rounded-xl font-bold text-xl transition-all duration-150 border-b-[5px] active:border-b-0 active:translate-y-[5px] whitespace-nowrap ${previewPage === pNum ? "bg-slate-800 text-white border-slate-950 dark:bg-slate-700 dark:border-slate-900" : "text-slate-500 hover:bg-slate-100 border-transparent bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"}`}
              >
                {getPageLabel(pNum)}
              </button>
            );
          })}
        </div>
      );
    };

    // --- RENDER ---

    return (
      <div className="flex flex-col items-center w-full">
        {isMobile ? (
          <div className="w-full max-w-[210mm] flex flex-col gap-4 mb-6 no-print">
            <div className="mb-0 animate-in fade-in slide-in-from-top-2">
              <p className="text-slate-600 font-bold text-base bg-amber-100/80 border-2 border-amber-200 py-3 px-4 rounded-xl text-center shadow-sm dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-200">
                💡 手機版：可左右拖曳，亦可雙指放大縮小檢視
              </p>
            </div>
            {renderPageSwitcher()}
          </div>
        ) : (
          <div className="w-full max-w-[210mm] mb-8 no-print">
            {renderPageSwitcher()}
          </div>
        )}

        <>
          {/* Hidden Off-Screen Measurement Stage for Smart Auto-Pagination */}
          <div
            aria-hidden="true"
            className="no-print"
            style={{
              position: "fixed",
              left: "-99999px",
              top: 0,
              width: "210mm",
              padding: "10mm 10mm",
              boxSizing: "border-box",
              visibility: "hidden",
              pointerEvents: "none",
              zIndex: -1,
            }}
          >
            <div
              ref={budgetRulerRef}
              style={{
                height: "277mm",
                width: "1px",
                position: "absolute",
                top: 0,
                left: 0,
              }}
            />
            <div ref={p1ChromeRef} className="w-full flex flex-col text-black">
              {renderPageHeader(1, true)}
              {renderMetadataTable()}
              <div
                className={`bg-[#009FE3] text-white px-4 ${isStandard ? "py-1 text-[16px] mb-1" : "py-1.5 text-[19px] mb-1.5"} font-bold self-start rounded-r-full shadow-md tracking-wide shrink-0`}
              >
                【調查現況】
              </div>
              {renderBasicInfoTable()}
              <div className="w-full flex flex-col rounded-t-xl border-x-2 border-t-2 border-slate-200 bg-white">
                <TableHeaderRow />
              </div>
            </div>
            <div ref={pOtherChromeRef} className="w-full flex flex-col text-black">
              {renderPageHeader(2, false)}
              <div className="w-full flex flex-col rounded-t-xl border-x-2 border-t-2 border-slate-200 bg-white">
                <TableHeaderRow />
              </div>
            </div>
            <div ref={footerNormalRef} className="w-full">
              <Footer showSignature={false} signatureImage={data.signatureImage} />
            </div>
            <div ref={footerSigRef} className="w-full">
              <Footer showSignature={true} signatureImage={data.signatureImage} />
            </div>
            <div className="w-full flex flex-col">
              {friendlyBlocks.map((block, idx) => (
                <div
                  key={block.id}
                  ref={(el) => {
                    measureBlockRefs.current[idx] = el;
                  }}
                  className="w-full flex flex-col border-x-2 border-slate-200 bg-white text-black"
                >
                  {block.node}
                </div>
              ))}
            </div>
          </div>

          {/* Dynamically Paginated A4 Pages (Standard Mode & Friendly Mode) */}
          {effectivePageGroups.map((blockIndices, pageIdx) => {
            const pNum = pageIdx + 1;
            const isFirst = pageIdx === 0;
            const isLast = pageIdx === effectivePageGroups.length - 1;
            const validBlocks = blockIndices
              .map((bIdx) => friendlyBlocks[bIdx])
              .filter((b): b is PreviewBlock => !!b);

            return (
              <ScaledA4Page
                key={`preview-page-${pNum}`}
                pageNum={pNum}
                previewPage={previewPage}
                previewScale={previewScale}
                exporting={exporting}
                setPageRef={(el) => {
                  if (dynamicPageRefs) {
                    dynamicPageRefs.current[pageIdx] = el;
                  }
                  if (pageIdx === 0) {
                    (page1Ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
                  } else if (pageIdx === 1) {
                    (page2Ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
                  } else if (pageIdx === 2 && page3Ref) {
                    (page3Ref as React.MutableRefObject<HTMLDivElement | null>).current = el;
                  }
                }}
              >
                <div className="flex-grow flex flex-col h-full text-black pb-0">
                  {renderPageHeader(pNum, isFirst)}
                  {isFirst && (
                    <>
                      {renderMetadataTable()}
                      <div
                        className={`bg-[#009FE3] text-white px-4 ${isStandard ? "py-1 text-[16px] mb-1" : "py-1.5 text-[19px] mb-1.5"} font-bold self-start rounded-r-full shadow-md tracking-wide shrink-0`}
                      >
                        【調查現況】
                      </div>
                      {renderBasicInfoTable()}
                    </>
                  )}
                  <div
                    className={`${isStandard ? "mb-2" : isFirst ? "mb-4" : "mb-2"} w-full text-black flex flex-col rounded-xl border-2 border-slate-200 shadow-sm bg-white overflow-hidden shrink-0`}
                  >
                    <TableHeaderRow />
                    {validBlocks.map((block) => (
                      <React.Fragment key={block.id}>{block.node}</React.Fragment>
                    ))}
                  </div>
                  <Footer
                    showSignature={isLast}
                    signatureImage={data.signatureImage}
                  />
                </div>
              </ScaledA4Page>
            );
          })}
        </>
      </div>
    );
  },
);

