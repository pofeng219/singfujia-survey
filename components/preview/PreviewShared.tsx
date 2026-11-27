import React from "react";
import { Check } from "lucide-react";
import { SurveyData } from "../../types";
import { useInterface } from "../InterfaceContext";

// --- SHARED HELPER COMPONENTS ---

export interface PreviewBlock {
  id: string;
  node: React.ReactNode;
}

export const formatAccessLandAddress = (
  section?: string,
  subSection?: string,
  number?: string,
) => {
  if (!section && !subSection && !number) return "";
  const sec = section ? `${section}段` : "";
  const sub = subSection ? `${sec ? " " : ""}${subSection}小段` : "";
  const num = number ? `${sec || sub ? " " : ""}${number}號` : "";
  return `地號：${sec}${sub}${num}`;
};

// Local PreviewResult: High contrast, larger text, less vibrant
export const PreviewResult: React.FC<{
  checked: boolean;
  label: string;
  suffix?: string;
  variant?: string;
  isWarning?: boolean;
  forceSafe?: boolean;
}> = ({ checked, label, suffix, isWarning, forceSafe }) => {
  const isStandard = useInterface() === "standard";
  if (!checked) return null;
  if (!label) return null;

  // Highlight "有" (Yes/Has issue) or "是" options in red for quick scanning
  // Also include common issue keywords to ensure they are caught even without "有/是" prefix
  const warningKeywords = [
    "滲漏水",
    "壁癌",
    "瑕疵",
    "異常",
    "不符",
    "占用",
    "剝落",
    "外露",
    "龜裂",
    "傾斜",
    "待查證",
    "受限",
    "袋地",
    "糾紛",
    "越界",
    "海砂",
    "輻射",
    "非自然",
    "事故",
    "違建",
    "私下",
    "不明",
    "不確定",
    "無法",
    "外推",
    "加蓋",
    "夾層",
    "增建",
    "改建",
    "損壞",
    "危險",
    "破壞",
    "漏水",
    "阻塞",
    "不通",
  ];

  // Check if the label explicitly negates the warning
  const safeKeywords = [
    "無異常",
    "無瑕疵",
    "無滲漏水",
    "無壁癌",
    "未發現",
    "無增建",
    "無外推",
    "無占用",
    "無破壞",
    "無損壞",
  ];
  const hasSafeKeyword = safeKeywords.some((kw) => label.includes(kw));

  const hasWarningKeyword =
    !hasSafeKeyword && warningKeywords.some((kw) => label.includes(kw));

  const isWarningOption =
    !forceSafe && (Boolean(isWarning) || hasWarningKeyword);

  return (
    <div
      className={`flex items-start ${isStandard ? "gap-1 mr-3 my-0.5" : "gap-1.5 mr-3 my-0.5"}`}
    >
      <div
        className={`${isStandard ? "w-4 h-4 mt-0.5" : "w-5 h-5 mt-1"} rounded-sm border flex items-center justify-center shrink-0 shadow-sm ${isWarningOption ? "border-rose-500 bg-rose-500" : "border-sky-600 bg-sky-600"}`}
      >
        <Check size={isStandard ? 12 : 14} strokeWidth={4} className="text-white" />
      </div>
      <span
        className={`${isStandard ? "text-[15px]" : "text-[18px]"} font-bold leading-snug tracking-wide ${isWarningOption ? "text-rose-600" : "text-slate-800"}`}
      >
        {label}
        {suffix}
      </span>
    </div>
  );
};

// Modernized CheckRow: Clean, high readability with card-like row, highlights abnormal fields
export const CheckRow: React.FC<{ checked: boolean; children: React.ReactNode }> = ({
  checked,
  children,
}) => {
  const isStandard = useInterface() === "standard";
  // If NOT checked, it means there's an abnormality (needs explanation)
  const isAbnormal = !checked;

  return (
    <div
      className={`flex border-b border-slate-200 last:border-0 transition-colors shrink-0 max-w-full ${isAbnormal ? "bg-rose-50/80 hover:bg-rose-100/80" : "bg-white hover:bg-slate-50"}`}
    >
      <div
        className={`w-[85px] md:w-[100px] shrink-0 flex justify-center items-start ${isStandard ? "pt-2" : "pt-2.5"} border-r ${isAbnormal ? "border-rose-200 bg-rose-100/50" : "border-slate-100 bg-slate-50/50"}`}
      >
        <div
          className={`${isStandard ? "w-3.5 h-3.5" : "w-4 h-4"} shrink-0 rounded-full border-2 flex items-center justify-center transition-all ${checked ? "border-sky-500 bg-sky-500 shadow-sm" : "border-slate-300 bg-white"}`}
        >
          {checked && (
            <Check size={isStandard ? 10 : 12} strokeWidth={3} className="text-white shrink-0" />
          )}
        </div>
      </div>
      <div
        className={`flex-grow ${isStandard ? "py-1 text-[15px]" : "py-1.5 text-[18px]"} px-2 text-left`}
      >
        <div
          className={`flex flex-col md:flex-row md:flex-wrap items-start ${isStandard ? "gap-x-1 gap-y-1" : "gap-x-2 gap-y-1"}`}
        >
          {/* Apply question label style to the first span child */}
          <div
            className={`${isStandard ? "[&>span:first-child]:text-[14px]" : "[&>span:first-child]:text-[18px]"} [&>span:first-child]:font-bold [&>span:first-child]:text-slate-800 [&>span:first-child]:block [&>span:first-child]:mb-0 md:[&>span:first-child]:mb-0 md:[&>span:first-child]:inline-block flex flex-wrap items-start ${isStandard ? "gap-x-1 gap-y-1" : "gap-x-2 gap-y-1"} w-full leading-normal text-slate-800`}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

// Professional Section Header: Card Header Style
export const SectionHeader: React.FC<{ title: string }> = ({ title }) => {
  const isStandard = useInterface() === "standard";
  return (
    <div
      className={`shrink-0 mt-1 first:mt-0 bg-slate-100 border-b border-slate-200 rounded-t-xl overflow-hidden shadow-sm ${isStandard ? "" : "py-0.5"}`}
    >
      <div
        className={`px-2 ${isStandard ? "py-1 gap-1.5" : "py-1 gap-2"} flex items-start`}
      >
        <div
          className={`bg-sky-500 rounded-full shrink-0 ${isStandard ? "w-1 h-3 mt-1.5" : "w-1.5 h-4 mt-1.5"}`}
        ></div>
        <span
          className={`font-bold text-slate-800 ${isStandard ? "text-[16px]" : "text-[19px]"} tracking-widest leading-snug whitespace-normal break-words`}
        >
          {title}
        </span>
      </div>
    </div>
  );
};

// Clean Table Header
export const TableHeaderRow: React.FC = () => {
  const isStandard = useInterface() === "standard";
  return (
    <div className="flex border-b-2 border-sky-300 bg-sky-50 rounded-t-xl overflow-hidden shadow-sm shrink-0">
      <div
        className={`w-[85px] md:w-[100px] shrink-0 text-center font-bold text-sky-800 ${isStandard ? "py-1 text-[14px]" : "py-1.5 text-[16px]"} whitespace-nowrap tracking-wider border-r border-sky-200`}
      >
        確認無須
        <br />
        新增說明
      </div>
      <div
        className={`flex-grow ${isStandard ? "py-1 text-[15px]" : "py-1.5 text-[18px]"} px-2 font-bold text-left text-sky-800 tracking-[0.2em] flex items-center`}
      >
        說明／檢查項目
      </div>
    </div>
  );
};

// removed BulletItem

export const SingfujiaLogo = ({
  className = "",
  textClassName = "",
  subTextClassName = "",
}: {
  className?: string;
  textClassName?: string;
  subTextClassName?: string;
}) => (
  <div className={`flex flex-col items-center justify-center ${className}`}>
    <div
      className={`font-bold tracking-widest text-[#009FE3] leading-tight whitespace-nowrap ${textClassName}`}
      style={{ fontFamily: '"Microsoft JhengHei", "Heiti TC", sans-serif' }}
    >
      幸福家不動產
    </div>
    <div
      className={`font-bold tracking-[0.1em] text-[#009FE3] leading-tight whitespace-nowrap ${subTextClassName}`}
    >
      SINGFUJIA REALTY INC.
    </div>
  </div>
);

export const Watermark = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 select-none overflow-hidden mix-blend-multiply">
    <div className="transform -rotate-45 opacity-[0.06] grayscale-0">
      <SingfujiaLogo
        className="scale-150"
        textClassName="text-[100px]"
        subTextClassName="text-[32px] mt-6"
      />
    </div>
  </div>
);

// --- CONTENT HELPER COMPONENTS ---

export const ParkingContent: React.FC<{
  data: SurveyData;
  parkingSummary: any;
  activeMode: "a4" | "mobile";
  isFactory?: boolean;
}> = ({ data, parkingSummary, activeMode, isFactory }) => {
  const prVariant = activeMode === "mobile" ? "mobile" : "default";
  const textColor =
    activeMode === "mobile"
      ? "text-slate-800 dark:text-slate-200"
      : "text-black";

  if (
    isFactory &&
    data.propertyType &&
    ["獨棟自建廠房", "倉儲物流廠房", "其他特殊工業設施"].includes(
      data.propertyType,
    )
  ) {
    return (
      <div className={`space-y-1 ${textColor}`}>
        <span className="font-bold mr-2">車位資訊</span>
        {data.factory_parking_desc || ""}
      </div>
    );
  }

  const getParkingTypeLabel = (pt: string) => {
    if (pt === "坡道機械" && data?.q10_rampMechLoc)
      return `${pt}（${data.q10_rampMechLoc}）`;
    if (pt === "升降機械" && data?.q10_liftMechLoc)
      return `${pt}（${data.q10_liftMechLoc}）`;
    if (pt === "塔式車位" && data?.q10_liftMechLoc)
      return `${pt}（${data.q10_liftMechLoc}）`;
    return pt;
  };

  const getParkingCarUsageLabel = () => {
    let labels = (data?.q10_carUsage || []).map((u) =>
      u === "須固定抽籤"
        ? `須固定抽籤${data.q10_carLotteryMonth ? `（每${data.q10_carLotteryMonth}個月）` : ""}`
        : u,
    );
    if (data?.q10_hasCarUsageOther)
      labels.push(
        data.q10_carUsageOther
          ? `其他未列項目：${data.q10_carUsageOther}`
          : "其他未列項目",
      );
    return labels.join("、");
  };
  const getParkingMotoUsageLabel = () => {
    let labels = [...(data?.q10_motoUsage || [])];
    if (data?.q10_hasMotoUsageOther)
      labels.push(
        data.q10_motoUsageOther
          ? `其他未列項目：${data.q10_motoUsageOther}`
          : "其他未列項目",
      );
    return labels.join("、");
  };

  return (
    <div className={`flex flex-col gap-y-1.5 ${textColor}`}>
      {parkingSummary.isNoParking && (
        <div>
          <span className="font-bold mr-2">停車方式</span>
          <PreviewResult checked={true} label="無車位" variant={prVariant} />
        </div>
      )}
      {parkingSummary.showMethod && (
        <div>
          <span className="font-bold mr-2">停車方式</span>
          {(data?.q10_parkTypes || []).map((pt) => (
            <PreviewResult
              key={pt}
              checked={true}
              label={getParkingTypeLabel(pt)}
              variant={prVariant}
            />
          ))}
          <PreviewResult
            checked={data?.q10_hasParkTypeOther}
            label="其他未列項目"
            suffix={data?.q10_parkTypeOther ? "：" + data.q10_parkTypeOther : ""}
            variant={prVariant}
          />
        </div>
      )}
      {parkingSummary.showNumber && (
        <div>
          <span className="font-bold mr-2">車位編號</span>
          <PreviewResult
            checked={data?.q10_parkingNumberType === "number"}
            label="有車位編號"
            suffix={
              data?.q10_parkingNumberVal ? "：" + data.q10_parkingNumberVal : ""
            }
            variant={prVariant}
          />
          <PreviewResult
            checked={data?.q10_parkingNumberType === "none"}
            label="無車位編號"
            variant={prVariant}
          />
        </div>
      )}
      {parkingSummary.showCarStatus && getParkingCarUsageLabel() && (
        <div>
          <span className="font-bold mr-2">汽車車位使用現況</span>
          <span className="font-medium">{getParkingCarUsageLabel()}</span>
        </div>
      )}
      {getParkingMotoUsageLabel() && (
        <div>
          <span className="font-bold mr-2">機車車位使用現況</span>
          <span className="font-medium">{getParkingMotoUsageLabel()}</span>
        </div>
      )}
      {(parkingSummary.showCarSize ||
        parkingSummary.showWeight ||
        parkingSummary.showHeight) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1">
          <span className="font-bold">汽車車位尺寸</span>
          {/* NEW TYPES */}
          {data?.q10_measureType === "實際測量" && (
            <span className="font-medium">[實際測量]</span>
          )}
          {data?.q10_measureType === "依謄本登記" && (
            <span className="font-medium">[依謄本登記]</span>
          )}
          {data?.q10_measureType === "依車位資訊告示牌" && (
            <span className="font-medium">[依車位資訊告示牌]</span>
          )}
          {(data?.q10_measureType === "無法測量" ||
            data?.q10_measureType === "無法測量也無相關資訊") && (
            <span className="font-medium">[無法測量也無相關資訊]</span>
          )}

          {(data?.q10_measureType === "實際測量" ||
            data?.q10_measureType === "依車位資訊告示牌") &&
            parkingSummary.showCarSize && (
              <>
                <span>長：{data?.q10_dimL || "_"}m</span>
                <span>寬：{data?.q10_dimW || "_"}m</span>
                <span>高：{data?.q10_dimH || "_"}m</span>
              </>
            )}
          {parkingSummary.showWeight && !isFactory && (
            <span>機械載重：{data?.q10_mechWeight || "_"}kg</span>
          )}
          {parkingSummary.showHeight && (
            <span>
              車道出入口高度：{data?.q10_entryHeight || "_"}
              {data?.q10_entryHeight === "無資訊告示牌" && data?.q10_entryHeight_desc
                ? ` （${data.q10_entryHeight_desc}）`
                : ""}
            </span>
          )}
        </div>
      )}
      {(data?.q10_laneSection || data?.q10_laneSubSection || data?.q10_laneNumber) && (
        <div>
          <span className="font-bold mr-2">車道經過地號</span>
          <span className="font-medium">
            {formatAccessLandAddress(
              data.q10_laneSection,
              data.q10_laneSubSection,
              data.q10_laneNumber,
            ).replace(/^地號[:：]\s*/, "")}
          </span>
        </div>
      )}
      {parkingSummary.showCharging && (
        <div>
          <span className="font-bold mr-2">車位充電設備配置</span>
          <PreviewResult
            checked={data?.q10_charging === "有" || data?.q10_charging === "是"}
            label="有"
            variant={prVariant}
          />
          <PreviewResult
            checked={data?.q10_charging === "無" || data?.q10_charging === "否"}
            label="無"
            variant={prVariant}
          />
          <PreviewResult
            checked={data?.q10_charging === "僅預留管線／孔位"}
            label="僅預留管線／孔位"
            variant={prVariant}
          />
          <PreviewResult
            checked={data?.q10_charging === "須經管委會同意"}
            label="須經管委會同意"
            variant={prVariant}
          />
          <PreviewResult
            checked={
              data?.q10_charging === "其他" ||
              data?.q10_charging === "其他未列項目"
            }
            label="其他未列項目"
            suffix={data?.q10_chargingOther ? "：" + data.q10_chargingOther : ""}
            variant={prVariant}
          />
        </div>
      )}
    </div>
  );
};

export const LandDisputeBlock = ({
  data,
  title,
}: {
  data: SurveyData;
  title: string;
}) => (
  <>
    <SectionHeader title={title} />
    <CheckRow
      checked={
        data?.land_q3_survey === "已鑑界 (標完好)" ||
        data?.land_q3_survey === "是" ||
        data?.land_q3_survey === "界標完整"
      }
    >
      <span className="font-bold mr-2">土地鑑界與界標現況</span>

      <PreviewResult
        checked={
          data?.land_q3_survey === "已鑑界 (標完好)" ||
          data?.land_q3_survey === "是" ||
          data?.land_q3_survey === "界標完整"
        }
        label={`近期已鑑界 (附土地複丈成果圖)${data.land_q3_survey_detail ? "（" + data.land_q3_survey_detail + "）" : ""}${data.land_q3_survey_date ? `，最近一次鑑界時間 (年份)：${data.land_q3_survey_date}年` : ""}`}
        forceSafe={true}
      />

      <PreviewResult
        checked={
          data?.land_q3_survey === "待查證" ||
          data?.land_q3_survey === "不確定／不知道"
        }
        label={`待查證 (標位不明／須重測)${data?.land_q3_survey_other ? " （" + data.land_q3_survey_other + "）" : ""}`}
        isWarning={true}
      />

      <PreviewResult
        checked={
          data?.land_q3_survey === "標位不明 (需重測)" ||
          data?.land_q3_survey === "須重新鑑界" ||
          data?.land_q3_survey === "是 (但界釘已不明顯／須重新鑑界)"
        }
        label="標位不明（需重測）"
        isWarning={true}
      />

      <PreviewResult
        checked={
          data?.land_q3_survey === "從未鑑界" || data?.land_q3_survey === "否"
        }
        label={data?.land_q3_survey === "否" ? "否 (或年代久遠)" : "從未鑑界"}
        isWarning={true}
      />
    </CheckRow>
    <CheckRow
      checked={data?.land_q3_dispute === "否" || data?.land_q3_dispute === "無"}
    >
      <span className="font-bold mr-2">產權與使用糾紛現況</span>
      <PreviewResult
        checked={data?.land_q3_dispute === "否" || data?.land_q3_dispute === "無"}
        label="無"
      />
      <PreviewResult
        checked={
          data?.land_q3_dispute === "是" || data?.land_q3_dispute === "有"
        }
        label={data.land_q3_dispute_desc ? `有（${data.land_q3_dispute_desc}）` : "有"}
        isWarning={true}
      />
      <PreviewResult
        checked={
          data?.land_q3_dispute === "待查證" ||
          data?.land_q3_dispute === "疑似／處理中"
        }
        label={data.land_q3_dispute_other ? `待查證（${data.land_q3_dispute_other}）` : "待查證"}
        isWarning={true}
      />
    </CheckRow>
  </>
);

export const LandExproBlock = ({
  data,
  title,
}: {
  data: SurveyData;
  title: string;
}) => (
  <>
    <SectionHeader title={title} />
    <CheckRow
      checked={
        data?.land_q4_expro === "否" || data?.land_q4_expro === "非範圍內"
      }
    >
      <span className="font-bold mr-2">位於政府徵收預定地</span>
      <PreviewResult
        checked={
          data?.land_q4_expro === "否" || data?.land_q4_expro === "非範圍內"
        }
        label="非範圍內"
      />
      <PreviewResult
        checked={
          data?.land_q4_expro === "是" || data?.land_q4_expro === "屬範圍內"
        }
        label={`屬範圍內${data?.land_q4_expro_other ? ` （${data.land_q4_expro_other}）` : ""}`}
        isWarning={true}
      />
      <PreviewResult
        checked={
          data?.land_q4_expro === "待查證" ||
          data?.land_q4_expro === "查詢中／不確定"
        }
        label={`待查證${data?.land_q4_expro_other ? ` （${data.land_q4_expro_other}）` : ""}`}
        isWarning={true}
      />
    </CheckRow>
    <CheckRow
      checked={
        data?.land_q4_resurvey === "否" || data?.land_q4_resurvey === "非範圍內"
      }
    >
      <span className="font-bold mr-2">位於重測區域範圍</span>
      <PreviewResult
        checked={
          data?.land_q4_resurvey === "否" || data?.land_q4_resurvey === "非範圍內"
        }
        label="非範圍內"
      />
      <PreviewResult
        checked={
          data?.land_q4_resurvey === "是" ||
          data?.land_q4_resurvey === "屬範圍內"
        }
        label={`屬範圍內${data?.land_q4_resurvey_other ? ` （${data.land_q4_resurvey_other}）` : ""}`}
        isWarning={true}
      />
      <PreviewResult
        checked={
          data?.land_q4_resurvey === "待查證" ||
          data?.land_q4_resurvey === "查詢中／不確定"
        }
        label={`待查證${data?.land_q4_resurvey_other ? ` （${data.land_q4_resurvey_other}）` : ""}`}
        isWarning={true}
      />
    </CheckRow>
  </>
);

export const LandDisputeExproPreview = ({
  data,
  titles,
}: {
  data: SurveyData;
  titles: { q3: string; q4: string };
}) => (
  <>
    <LandDisputeBlock data={data} title={titles.q3} />
    <LandExproBlock data={data} title={titles.q4} />
  </>
);

export const LandAccessPreviewBuildingStyle = ({
  data,
  title,
}: {
  data: SurveyData;
  title: string;
}) => {
  // New Logic: Check for '正常' instead of '正常 (可自由通行)'
  const access = data?.land_q2_access;
  const ownership = data?.land_q2_owner;
  const protection = data?.land_q2_protection;
  const protectionDesc = data?.land_q2_protectionDesc;
  const abnormalDesc = data?.land_q2_access_desc;

  const roadMat = data?.land_q2_material;
  const roadMatOther = data?.land_q2_material_other;
  const roadWidth = data?.land_q2_roadWidth;
  const buildingLine = data?.land_q2_buildingLine;
  const buildingLineOther = data?.land_q2_buildingLine_other;
  const ditch = data?.land_q2_ditch;
  const ditchOther = data?.land_q2_ditch_other;

  const isNormal = access === "通行順暢" || access?.includes("順暢");
  const isAbnormal = access === "通行受限" || access?.includes("受限");
  const isLandlocked = access === "袋地" || access?.includes("袋地");
  const isPrivateRoad = ownership === "私人" || ownership === "私有";
  const hasRoadWarning =
    ["未核定", "申請中", "須申請", "其他未列項目"].includes(buildingLine || "") ||
    ditch === "無排水系統";

  return (
    <>
      <SectionHeader title={title} />
      <CheckRow checked={isNormal && !isPrivateRoad}>
        <span className="font-bold mr-2">進出現況</span>
        <PreviewResult
          checked={isNormal}
          label={`通行順暢${ownership || protection || protectionDesc ? ` [${ownership || ""}${protection ? "／" + protection : ""}${protectionDesc ? ` （${protectionDesc}）` : ""}]` : ""}${formatAccessLandAddress(data.land_q2_access_section, data.land_q2_access_subSection, data.land_q2_access_number) ? ` ${formatAccessLandAddress(data.land_q2_access_section, data.land_q2_access_subSection, data.land_q2_access_number)}` : ""}`}
          isWarning={isPrivateRoad}
          forceSafe={!isPrivateRoad}
        />
        <PreviewResult
          checked={isAbnormal}
          label={
            abnormalDesc
              ? `通行受限（如狹窄、有障礙物）：${abnormalDesc}`
              : "通行受限（如狹窄、有障礙物）"
          }
          isWarning={true}
        />
        <PreviewResult
          checked={isLandlocked}
          label={
            abnormalDesc
              ? `袋地（無合法出入口）：${abnormalDesc}`
              : "袋地（無合法出入口）"
          }
          isWarning={true}
        />
      </CheckRow>
      {(isNormal || isAbnormal) && (roadMat || roadWidth || buildingLine || ditch) && (
        <CheckRow checked={!hasRoadWarning}>
          {(() => {
            const items = [];
            if (roadMat) {
               items.push(
                 <PreviewResult
                   checked={!!roadMat}
                   label="路面材質"
                   suffix={
                     roadMat === "其他未列項目" || roadMat === "其他"
                       ? `: ${roadMatOther ? `其他未列項目：${roadMatOther}` : "其他未列項目"}`
                       : `: ${roadMat}`
                   }
                   forceSafe={true}
                 />
               );
            }
            if (roadWidth) items.push(<span className="font-bold border-l-0">路寬:{roadWidth}米</span>);
            if (buildingLine) {
              const buildingLineLabel =
                buildingLine === "其他未列項目"
                  ? buildingLineOther
                    ? `其他未列項目：${buildingLineOther}`
                    : "其他未列項目"
                  : buildingLine;
              const isBLWarning = ['未核定', '申請中', '須申請'].includes(buildingLine) || buildingLine === '其他未列項目';
              items.push(
                <PreviewResult
                  checked={true}
                  label={`建築線:${buildingLineLabel}`}
                  isWarning={isBLWarning}
                  forceSafe={!isBLWarning}
                />
              );
            }
            if (ditch) {
               const isDitchWarning = ditch === "無排水系統";
               items.push(
                 <PreviewResult
                   checked={!!ditch}
                   label="排水溝"
                   suffix={
                     ditch === "其他未列項目" || ditch === "其他"
                       ? `: ${ditchOther ? `其他未列項目：${ditchOther}` : "其他未列項目"}`
                       : `: ${ditch}`
                   }
                   isWarning={isDitchWarning}
                   forceSafe={!isDitchWarning}
                 />
               );
            }
            return items.map((item, index) => (
              <React.Fragment key={index}>
                 {item}
                 {index < items.length - 1 && <span className="mx-2">／</span>}
              </React.Fragment>
            ));
          })()}
        </CheckRow>
      )}
    </>
  );
};

export const Footer = ({
  showSignature,
  hideBranding = false,
  signatureImage,
}: {
  showSignature: boolean;
  hideBranding?: boolean;
  signatureImage?: string;
}) => {
  const isStandard = useInterface() === "standard";
  const timestamp = new Date().toLocaleString("zh-TW", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="mt-auto pt-2 pb-1 border-t-4 border-[#009FE3] flex flex-row justify-between items-end text-slate-900 z-50 bg-white relative w-full shrink-0">
      {showSignature ? (
        <div className="flex flex-col items-start shrink-0">
          <span className={`text-slate-900 font-bold mb-1 ${isStandard ? "text-[14px]" : "text-[16px]"}`}>
            調查業務人員簽章：
          </span>
          <div className="w-[240px] border-b-2 border-slate-800 flex items-end relative h-[4rem]">
            {signatureImage ? (
              <img
                src={signatureImage}
                alt="Signature"
                className="absolute bottom-1 left-0 max-h-[4rem] max-w-full object-contain"
              />
            ) : null}
          </div>
        </div>
      ) : (
        <div className="w-10 shrink-0"></div>
      )}
      {!hideBranding && (
        <div className="flex flex-col items-end shrink-0 text-right max-w-[70%]">
          <div className="flex flex-col items-center select-none opacity-100 mb-2">
            <SingfujiaLogo
              className="h-8"
              textClassName="text-[1.5rem]"
              subTextClassName="text-[0.6rem] mt-1"
            />
          </div>
          <span className={`${isStandard ? "text-[14px]" : "text-[15px]"} font-bold text-red-600 tracking-wider block leading-tight`}>
            ※本資訊僅供評估參考，所有細節請以權責機關所核發之文件與現場所見實況為最終依據。
          </span>
          <span className="text-[10px] text-gray-500 font-mono tracking-tighter mt-1 leading-none">
            產出日期與時間： {timestamp}
          </span>
        </div>
      )}
    </div>
  );
};

