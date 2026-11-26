import { SurveyData, SurveyType } from "../types";
import { formatDateROC } from "./ROCDatePicker";
import React, { useMemo, useState, useEffect } from "react";
import {
  PreviewResult,
  CheckRow,
  SectionHeader,
  TableHeaderRow,
  Watermark,
  ParkingContent,
  Footer,
} from "./preview/PreviewShared";
import {
  HousePrintPage1,
  HousePrintPage2,
  HousePrintPage3,
} from "./preview/HousePreviewPages";
import {
  LandPrintPage1,
  LandPrintPage2,
  LandPrintPage3,
} from "./preview/LandPreviewPages";
import {
  FactoryPrintPage1,
  FactoryPrintPage2,
  FactoryPrintPage3,
} from "./preview/FactoryPreviewPages";

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
  isMobile?: boolean;
}

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
    isMobile = false,
  }) => {
    const isStandard = true;
    // Removed viewMode state as we are defaulting to A4 view for consistency
    const activeMode = "a4";

    // Detect if we need page 3 (All factory types now use 3 pages)
    const hasPage3 = type === "factory" || type === "house" || type === "land";

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

    const PageSwitcher = () =>
      type !== "parking" ? (
        <div className="flex bg-white rounded-2xl shadow-md p-2 gap-2 border border-slate-200 no-print w-full dark:bg-slate-800 dark:border-slate-700 overflow-x-auto">
          <button
            onClick={() => setPreviewPage(1)}
            className={`flex-1 min-w-[80px] py-4 rounded-xl font-bold text-xl transition-all duration-150 border-b-[5px] active:border-b-0 active:translate-y-[5px] ${previewPage === 1 ? "bg-slate-800 text-white border-slate-950 dark:bg-slate-700 dark:border-slate-900" : "text-slate-500 hover:bg-slate-100 border-transparent bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"}`}
          >
            第一頁
          </button>
          <button
            onClick={() => setPreviewPage(2)}
            className={`flex-1 min-w-[80px] py-4 rounded-xl font-bold text-xl transition-all duration-150 border-b-[5px] active:border-b-0 active:translate-y-[5px] ${previewPage === 2 ? "bg-slate-800 text-white border-slate-950 dark:bg-slate-700 dark:border-slate-900" : "text-slate-500 hover:bg-slate-100 border-transparent bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"}`}
          >
            第二頁
          </button>
          {hasPage3 && (
            <button
              onClick={() => setPreviewPage(3)}
              className={`flex-1 min-w-[80px] py-4 rounded-xl font-bold text-xl transition-all duration-150 border-b-[5px] active:border-b-0 active:translate-y-[5px] ${previewPage === 3 ? "bg-slate-800 text-white border-slate-950 dark:bg-slate-700 dark:border-slate-900" : "text-slate-500 hover:bg-slate-100 border-transparent bg-slate-50 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800"}`}
            >
              第三頁
            </button>
          )}
        </div>
      ) : null;

    const ScaledA4Wrapper = ({
      children,
      pageNum,
    }: {
      children?: React.ReactNode;
      pageNum: number;
    }) => {
      const pageRef = (
        pageNum === 1 ? page1Ref : pageNum === 2 ? page2Ref : page3Ref
      ) as React.RefObject<HTMLDivElement>;
      const [actualHeight, setActualHeight] = useState<number | null>(null);

      useEffect(() => {
        if (!pageRef.current || exporting) return;
        const ro = new ResizeObserver((entries) => {
          for (let entry of entries) {
            if (entry.target instanceof HTMLElement) {
              setActualHeight(entry.target.offsetHeight);
            }
          }
        });
        ro.observe(pageRef.current);
        return () => ro.disconnect();
      }, [pageRef, exporting]);

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
            ref={pageRef}
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

    const BasicInfoTable = () => {
      const isStandard = true;
      return (
        <div
          className={`${isStandard ? "mb-1" : "mb-2"} w-full bg-white border-2 border-gray-300 rounded-lg overflow-hidden shrink-0`}
        >
          <div
            className={`px-2 ${isStandard ? "py-1 gap-x-2 gap-y-0.5" : "py-1.5 gap-x-2 gap-y-1"} flex flex-wrap items-center ${isStandard ? "text-[15px]" : "text-[17px]"} leading-snug text-black`}
          >
            <span
              className={`font-bold text-black ${isStandard ? "text-[16px]" : "text-[18px]"}`}
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
                  data?.propertyType === "其他特殊工業設施" ||
                  data?.propertyType === "其他" ||
                  data?.propertyType === "其他未列項目"
                    ? `：${data.propertyTypeOther}`
                    : ""
                }
              />
            )}
            <PreviewResult checked={data?.access === "可進入"} label="可進入" />
            {data?.access === "不可進入" && (
              <>
                <PreviewResult checked={true} label="不可進入：" isWarning={true} />
                {(data?.accessType || []).map((opt) => (
                  <PreviewResult
                    key={opt}
                    checked={true}
                    isWarning={true}
                    label={
                      opt +
                      (opt === "其他" || opt === "其他未列項目" ? "：" : "")
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
    };

    // --- RENDER ---
    // (Mobile view skipped for brevity as logic mostly impacts A4 layout rendering of Water Booster)

    return (
      <div className="flex flex-col items-center w-full">
        {isMobile ? (
          <div className="w-full max-w-[210mm] flex flex-col gap-4 mb-6 no-print">
            <div className="mb-0 animate-in fade-in slide-in-from-top-2">
              <p className="text-slate-600 font-bold text-base bg-amber-100/80 border-2 border-amber-200 py-3 px-4 rounded-xl text-center shadow-sm dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-200">
                💡 手機版：可左右拖曳，亦可雙指放大縮小檢視
              </p>
            </div>
            <PageSwitcher />
          </div>
        ) : (
          <div className="w-full max-w-[210mm] mb-8 no-print">
            <PageSwitcher />
          </div>
        )}

        <ScaledA4Wrapper pageNum={1}>
          <div className="flex-grow flex flex-col h-full text-black pb-0">
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
                className={`${isStandard ? "text-[16px] py-1.5" : "text-[16px] py-1.5"} font-bold text-white bg-[#009FE3] px-4 rounded-t-lg translate-y-[5px]`}
              >
                【第一頁】{data?.version}
              </div>
            </div>
            <table
              className={`excel-table ${isStandard ? "mb-2" : "mb-2"} w-full text-black border-collapse border-2 border-[#009FE3] shrink-0`}
            >
              <tbody>
                <tr className="border-b border-[#7dd3fc]">
                  <td
                    className={`bg-[#f0f9ff] text-[#0369a1] w-[10%] whitespace-nowrap font-bold ${isStandard ? "py-1.5" : "py-1.5"} px-2 ${isStandard ? "text-[16px]" : "text-[17px]"}`}
                  >
                    案名
                  </td>
                  <td
                    className={`w-[30%] font-bold text-black ${isStandard ? "py-1.5" : "py-1.5"} px-2 ${isStandard ? "text-[16px]" : "text-[17px]"}`}
                  >
                    {data?.caseName}
                  </td>
                  <td
                    className={`bg-[#f0f9ff] text-[#0369a1] w-[12%] whitespace-nowrap font-bold ${isStandard ? "py-1.5" : "py-1.5"} px-2 ${isStandard ? "text-[16px]" : "text-[17px]"}`}
                  >
                    {type === "land"
                      ? "坐落"
                      : type === "parking"
                        ? "位置"
                        : "地址"}
                  </td>
                  <td
                    colSpan={3}
                    className={`w-[48%] font-bold text-black ${isStandard ? "py-1.5" : "py-1.5"} px-2 ${isStandard ? "text-[16px]" : "text-[17px]"}`}
                  >
                    {data?.address}
                  </td>
                </tr>
                <tr className="border-b border-[#7dd3fc]">
                  <td
                    className={`bg-[#f0f9ff] text-[#0369a1] w-[10%] whitespace-nowrap font-bold ${isStandard ? "py-1.5" : "py-1.5"} px-2 ${isStandard ? "text-[16px]" : "text-[17px]"}`}
                  >
                    店名
                  </td>
                  <td
                    className={`w-[30%] text-black ${isStandard ? "py-1.5" : "py-1.5"} px-2 ${isStandard ? "text-[16px]" : "text-[17px]"}`}
                  >
                    {data?.storeName}
                  </td>
                  <td
                    className={`bg-[#f0f9ff] text-[#0369a1] w-[12%] whitespace-nowrap font-bold ${isStandard ? "py-1.5" : "py-1.5"} px-2 ${isStandard ? "text-[16px]" : "text-[17px]"}`}
                  >
                    業務
                  </td>
                  <td
                    className={`w-[18%] font-bold text-black ${isStandard ? "py-1.5" : "py-1.5"} px-2 ${isStandard ? "text-[16px]" : "text-[17px]"}`}
                  >
                    {data?.agentName}
                  </td>
                  <td
                    className={`bg-[#f0f9ff] text-[#0369a1] w-[10%] whitespace-nowrap font-bold ${isStandard ? "py-1.5" : "py-1.5"} px-2 ${isStandard ? "text-[16px]" : "text-[17px]"}`}
                  >
                    日期
                  </td>
                  <td
                    className={`w-[20%] text-left font-mono whitespace-nowrap text-black ${isStandard ? "py-1.5" : "py-1.5"} px-2 ${isStandard ? "text-[16px]" : "text-[17px]"}`}
                  >
                    {formatDateROC(data?.fillDate || "")}
                  </td>
                </tr>
              </tbody>
            </table>
            <div
              className={`bg-[#009FE3] text-white px-4 ${isStandard ? "py-1 px-4" : "py-1.5 px-4"} ${isStandard ? "text-[16px]" : "text-[18px]"} font-bold ${isStandard ? "mb-1" : "mb-2"} self-start rounded-r-full shadow-md tracking-wide shrink-0`}
            >
              【調查現況】
            </div>

            <BasicInfoTable />

            <div
              className={`${isStandard ? "mb-2" : "mb-4"} w-full text-black flex flex-col rounded-xl border-2 border-slate-200 shadow-sm bg-white overflow-hidden shrink-0`}
            >
              {type === "house" && <HousePrintPage1 data={data} />}
              {type === "land" && <LandPrintPage1 data={data} />}
              {type === "factory" && <FactoryPrintPage1 data={data} />}
              {type === "parking" && (
                <>
                  <TableHeaderRow />
                  <SectionHeader title="1. 車位資訊" />
                  <CheckRow checked={!!data?.q10_noParking}>
                    <span className="font-bold mr-2">車位資訊</span>
                    {!data?.q10_noParking && (
                      <ParkingContent
                        data={data}
                        parkingSummary={parkingSummary}
                        activeMode={activeMode}
                      />
                    )}
                  </CheckRow>
                  <CheckRow
                    checked={
                      !data?.q10_noParking &&
                      (data?.q11_hasIssue === "否" ||
                        data?.q11_hasIssue === "無異常")
                    }
                  >
                    <span className="font-bold mr-2">車位使用現況</span>
                    <PreviewResult
                      checked={
                        data?.q11_hasIssue === "是" ||
                        data?.q11_hasIssue === "有異常"
                      }
                      label={
                        [
                          ...(data?.q11_items || []),
                          data?.q11_hasOther ? `其他：${data.q11_other}` : "",
                        ]
                          .filter(Boolean)
                          .join("、")
                      }
                      isWarning={true}
                    />
                  </CheckRow>
                  <CheckRow
                    checked={!data?.q10_noParking && data?.q12_hasNote === "否"}
                  >
                    <span className="font-bold mr-2">車位與車道其他備註</span>
                    <PreviewResult
                      checked={data?.q12_hasNote === "是"}
                      label={data?.q12_note || ""}
                      isWarning={true}
                    />
                  </CheckRow>
                  <SectionHeader title="2. 重要環境設施與常見環境抗性設施" />
                  <CheckRow checked={!!data?.q16_noFacilities}>
                    <span className="font-bold mr-2 shrink-0">
                      重要環境設施
                    </span>
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
                        checked={!!(data?.q16_hasOther && data?.q16_other)}
                        label={data.q16_other || ""}
                        isWarning={true}
                      />
                    )}
                  </CheckRow>
                  <CheckRow checked={!!data?.q16_2_noFacilities}>
                    <span className="font-bold mr-2 shrink-0">
                      常見環境抗性設施
                    </span>
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
                        checked={!!(data?.q16_2_hasOther && data?.q16_2_other)}
                        label={data.q16_2_other || ""}
                        isWarning={true}
                      />
                    )}
                  </CheckRow>
                  <SectionHeader title="3. 本案或本社區須注意的事項" />
                  <CheckRow
                    checked={
                      data?.q17_homicide === "否" || data?.q17_homicide === "無"
                    }
                  >
                    <span className="font-bold mr-2">
                      是否曾發生非自然死亡情事
                    </span>
                    <PreviewResult
                      checked={
                        data?.q17_homicide === "否" ||
                        data?.q17_homicide === "無"
                      }
                      label="無"
                    />
                    <PreviewResult
                      checked={
                        data?.q17_homicide === "是" ||
                        data?.q17_homicide === "有"
                      }
                      label={`有：${data?.q17_homicide_desc || ""}`}
                      isWarning={true}
                    />
                    <PreviewResult
                      checked={data?.q17_homicide === "待查證"}
                      label={`待查證：${data?.q17_homicide_desc || ""}`}
                      isWarning={true}
                    />
                  </CheckRow>
                  <CheckRow checked={data?.q17_issue === "否"}>
                    <span className="font-bold mr-2">其他應注意事項</span>
                    <PreviewResult
                      checked={data?.q17_issue === "是"}
                      label={data?.q17_desc || ""}
                      isWarning={true}
                    />
                    <PreviewResult
                      checked={data?.q17_issue === "待查證"}
                      label={`待查證：${data?.q17_desc || ""}`}
                      isWarning={true}
                    />
                  </CheckRow>
                </>
              )}
            </div>

            <Footer
              showSignature={type === "parking"}
              signatureImage={data.signatureImage}
            />
          </div>
        </ScaledA4Wrapper>

        {(type !== "parking" || previewPage === 2) && (
          <ScaledA4Wrapper pageNum={2}>
            <div className="flex-grow flex flex-col h-full text-black pb-0">
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
                  className={`${isStandard ? "text-[16px] py-1.5" : "text-[16px] py-1.5"} font-bold text-white bg-[#009FE3] px-4 rounded-t-lg translate-y-[5px]`}
                >
                  【第二頁】
                </div>
              </div>
              <div
                className={`${isStandard ? "mb-2" : "mb-2"} w-full text-black flex flex-col rounded-xl border-2 border-slate-200 shadow-sm bg-white overflow-hidden shrink-0`}
              >
                <TableHeaderRow />
                {type === "house" && (
                  <HousePrintPage2
                    data={data}
                    parkingSummary={parkingSummary}
                    activeMode={activeMode}
                  />
                )}
                {type === "land" && <LandPrintPage2 data={data} />}
                {type === "factory" && (
                  <FactoryPrintPage2
                    data={data}
                    parkingSummary={parkingSummary}
                    activeMode={activeMode}
                  />
                )}
              </div>
              <Footer
                showSignature={false}
                signatureImage={data.signatureImage}
              />
            </div>
          </ScaledA4Wrapper>
        )}

        {hasPage3 && (previewPage === 3 || exporting) && (
          <ScaledA4Wrapper pageNum={3}>
            <div className="flex-grow flex flex-col h-full text-black pb-0">
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
                  className={`${isStandard ? "text-[16px] py-1.5" : "text-[16px] py-1.5"} font-bold text-white bg-[#009FE3] px-4 rounded-t-lg translate-y-[5px]`}
                >
                  【第三頁】
                </div>
              </div>
              <div
                className={`${isStandard ? "mb-2" : "mb-2"} w-full text-black flex flex-col rounded-xl border-2 border-slate-200 shadow-sm bg-white overflow-hidden shrink-0`}
              >
                <TableHeaderRow />
                {type === "factory" && <FactoryPrintPage3 data={data} />}
                {type === "house" && <HousePrintPage3 data={data} />}
                {type === "land" && <LandPrintPage3 data={data} />}
              </div>
              <Footer
                showSignature={true}
                signatureImage={data.signatureImage}
              />
            </div>
          </ScaledA4Wrapper>
        )}
      </div>
    );
  },
);

