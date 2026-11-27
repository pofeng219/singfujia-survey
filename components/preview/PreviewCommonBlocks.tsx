import React from "react";
import { SurveyData, SurveyType } from "../../types";
import {
  formatAccessLandAddress,
  PreviewResult,
  CheckRow,
  SectionHeader,
  PreviewBlock,
} from "./PreviewShared";

// --- LOGIC EXTRACTORS ---

export const getHouseLabels = (data: SurveyData) => {
  const q1 = () => {
    const labels =
      data?.q1_items?.map((i) =>
        i === "地下室增建" && data.q1_basementPartition
          ? "地下室增建（內含隔間）"
          : i,
      ) || [];
    return labels.join("、");
  };
  const q3 = () => {
    if (
      data?.q3_ceilingWrapped ||
      data?.q3_leakType === "全屋天花板包覆" ||
      data?.q3_leakType === "全屋天花板包覆 (無法檢查)" ||
      data?.q3_leakType === "全屋天花板包覆（無法檢查）"
    )
      return "全屋天花板包覆（無法檢查） - 因裝潢包覆無法檢視內部，需特別留意";
    const locations = [...(data?.q3_locations || [])].filter(loc => loc !== "其他未列項目");
    if (data?.q3_hasOther) {
      locations.push(
        data.q3_other ? `其他未列項目：${data.q3_other}` : "其他未列項目",
      );
    }
    if (data?.q3_suspected) {
      const suspectedLabel =
        data.q3_leakType === "滲漏水"
          ? "疑似有滲漏水"
          : data.q3_leakType === "壁癌"
            ? "疑似有壁癌"
            : "疑似有滲漏水、壁癌";
      locations.push(
        data.q3_suspectedDesc
          ? `${suspectedLabel}：${data.q3_suspectedDesc}`
          : suspectedLabel,
      );
    }
    const locStr = locations.join("、");
    let result = "";
    if (data?.q3_leakType === "兩者皆有")
      result = `兩者皆有${locStr ? "：" + locStr : ""}`;
    else if (data?.q3_leakType)
      result = `${data.q3_leakType}${locStr ? "：" + locStr : ""}`;
    else result = locStr;
    return result;
  };
  const q4 = () => {
    const labels = [...(data?.q4_items || [])];
    if (data?.q4_ceilingWrapped)
      labels.push(
        "全屋天花板包覆（無法檢查） - 因裝潢包覆無法檢視內部，需特別留意",
      );
    if (data?.q4_suspected)
      labels.push(
        data.q4_suspectedDesc
          ? `現況需待查證：${data.q4_suspectedDesc}`
          : "現況需待查證",
      );
    return labels.join("、");
  };
  const q6 = () => {
    const labels = [...(data?.q8_stairItems || [])];
    return labels
      .filter((i) => i !== "其他未列項目" && i !== "其他")
      .join("、");
  };
  const q7 = () => {
    const labels = [...(data?.q7_items || [])];
    return labels.join("、");
  };
  const q9 = () => {
    const labels =
      data?.q9_items?.map((i) => {
        if (i === "太陽能光電發電設備" && data.q9_solar_maintenance)
          return `太陽能光電發電設備（${data.q9_solar_maintenance}）`;
        if (i === "加壓受水設備") {
          const itemsStr =
            data.q9_water_booster_items &&
            data.q9_water_booster_items.length > 0
              ? data.q9_water_booster_items.join("、")
              : "";
          const maintStr = data.q9_water_booster_maintenance
            ? `維護：${data.q9_water_booster_maintenance}`
            : "";
          const parts = [itemsStr, maintStr].filter(Boolean);
          return `加壓受水設備${parts.length > 0 ? `（${parts.join("；")}）` : ""}`;
        }
        return i;
      }) || [];
    return labels.join("、");
  };
  return { q1, q3, q4, q6, q7, q9 };
};

// --- PRINT PAGE SUB-COMPONENTS ---

export const getBuildingCoreBlocks = (
  data: SurveyData,
  hideUtilities = false,
): PreviewBlock[] => {
  const labels = getHouseLabels(data);
  const blocks: PreviewBlock[] = [
    {
      id: "core-q1",
      node: (
        <>
          <SectionHeader title="1. 增建、占用與被占用現況" />
          <CheckRow checked={data?.q1_hasExt === "否"}>
            <span className="font-bold mr-2">增建（含違建）現況</span>
            <PreviewResult checked={data?.q1_hasExt === "否"} label="無" />
            <PreviewResult
              checked={data?.q1_hasExt === "是"}
              label={labels.q1() || (!data?.q1_hasOther ? "有" : "")}
              isWarning={true}
            />
            <PreviewResult
              checked={!!data?.q1_hasOther}
              label={
                data?.q1_other ? `其他未列項目：${data.q1_other}` : "其他未列項目"
              }
              isWarning={true}
            />
          </CheckRow>

          <CheckRow checked={data?.q2_hasOccupancy === "否"}>
            <span className="font-bold mr-2">占用鄰地</span>
            <PreviewResult checked={data?.q2_hasOccupancy === "否"} label="無" />
            <PreviewResult
              checked={data?.q2_hasOccupancy !== "否" && !!data?.q2_hasOccupancy}
              label={
                (data?.q2_hasOccupancy === "是" ? "有" : data?.q2_hasOccupancy) +
                (data?.q2_desc ? "：" + data.q2_desc : "")
              }
              isWarning={true}
            />
          </CheckRow>
          <CheckRow checked={data?.q2_other_occupancy === "否"}>
            <span className="font-bold mr-2">被占用</span>
            <PreviewResult
              checked={data?.q2_other_occupancy === "否"}
              label="無"
            />
            <PreviewResult
              checked={
                data?.q2_other_occupancy !== "否" && !!data?.q2_other_occupancy
              }
              label={
                (data?.q2_other_occupancy === "是"
                  ? "有"
                  : data?.q2_other_occupancy) +
                (data?.q2_other_occupancy_desc
                  ? "：" + data.q2_other_occupancy_desc
                  : "")
              }
              isWarning={true}
            />
          </CheckRow>
        </>
      ),
    },
    {
      id: "core-q2",
      node: (
        <>
          <SectionHeader title="2. 現場長寬和建物測量成果圖比對，與建物面積現況評估" />
          <CheckRow
            checked={
              data?.q6_hasIssue === "實測相符" ||
              data?.q6_hasIssue === "相符 (無明顯差異)"
            }
          >
            <span className="font-bold mr-2">面積測量</span>
            <PreviewResult
              checked={
                data?.q6_hasIssue === "實測相符" ||
                data?.q6_hasIssue === "相符 (無明顯差異)"
              }
              label="實測相符"
              forceSafe={true}
            />
            <PreviewResult
              checked={
                data?.q6_hasIssue !== "實測相符" &&
                data?.q6_hasIssue !== "相符 (無明顯差異)" &&
                !!data?.q6_hasIssue
              }
              label={data?.q6_hasIssue + (data?.q6_desc ? "：" + data.q6_desc : "")}
              isWarning={true}
            />
          </CheckRow>
        </>
      ),
    },
    {
      id: "core-q3",
      node: (
        <>
          <SectionHeader title="3. 滲漏水與壁癌現況" />
          <CheckRow checked={data?.q3_hasLeak === "否"}>
            <span className="font-bold mr-2">滲漏水／壁癌</span>
            <PreviewResult
              checked={data?.q3_hasLeak === "是"}
              label={labels.q3() || "有（含壁癌／水漬／修繕痕跡）"}
              isWarning={true}
            />
            <PreviewResult
              checked={data?.q3_hasLeak === "否"}
              label="無（現況乾燥）"
            />
            <PreviewResult
              checked={data?.q3_repairHistory === "無修繕紀錄"}
              label="（無修繕紀錄）"
            />
            <PreviewResult
              checked={data?.q3_repairHistory === "有修繕紀錄"}
              label={
                data?.q3_repairDesc
                  ? `（有修繕紀錄：${data.q3_repairDesc}）`
                  : "（有修繕紀錄）"
              }
              isWarning={true}
            />
          </CheckRow>
        </>
      ),
    },
    {
      id: "core-q4",
      node: (
        <>
          <SectionHeader title="4. 建物結構安全評估（含瑕疵與傾斜）" />
          <CheckRow checked={data?.q4_hasIssue === "否"}>
            <span className="font-bold mr-2">結構瑕疵</span>
            <PreviewResult
              checked={data?.q4_hasIssue === "是"}
              label={labels.q4() || (!data?.q4_hasOther ? "有" : "")}
              isWarning={true}
            />
            <PreviewResult
              checked={!!data?.q4_hasOther}
              label={
                data?.q4_otherDesc
                  ? `其他未列項目：${data.q4_otherDesc}`
                  : "其他未列項目"
              }
              isWarning={true}
            />
            <PreviewResult checked={data?.q4_hasIssue === "否"} label="無" />
          </CheckRow>
          <CheckRow checked={data?.q5_hasTilt === "否"}>
            <span className="font-bold mr-2">傾斜現況</span>
            <PreviewResult
              checked={data?.q5_hasTilt !== "否" && !!data?.q5_hasTilt}
              label={
                (data?.q5_hasTilt === "是"
                  ? "有"
                  : data?.q5_hasTilt === "待查證"
                    ? "待查證（待測量）"
                    : data?.q5_hasTilt) +
                (data?.q5_desc ? "：" + data.q5_desc : "") +
                (data?.q5_suspectedDesc ? "：" + data.q5_suspectedDesc : "")
              }
              isWarning={true}
            />
            <PreviewResult checked={data?.q5_hasTilt === "否"} label="無" />
          </CheckRow>
        </>
      ),
    },
  ];

  if (!hideUtilities) {
    blocks.push({
      id: "core-q5",
      node: (
        <>
          <SectionHeader title="5. 電、水、瓦斯與其他設施使用現況" />
          <CheckRow checked={data?.q7_hasIssue === "否"}>
            {data?.q7_gasType && (
              <div className="mb-1 text-black">
                <span className="font-bold">瓦斯類型</span>
                {data.q7_gasType}
              </div>
            )}
            <span className="font-bold mr-2">電、水與瓦斯設備現況</span>
            <PreviewResult checked={data?.q7_hasIssue === "否"} label="無異常" />
            <PreviewResult
              checked={data?.q7_hasIssue === "是"}
              label={labels.q7() || (!data?.q7_hasOther ? "有異常" : "")}
              isWarning={true}
            />
            <PreviewResult
              checked={!!data?.q7_hasOther}
              label={
                data?.q7_otherDesc
                  ? `其他未列項目：${data.q7_otherDesc}`
                  : "其他未列項目"
              }
              isWarning={true}
            />
          </CheckRow>
        </>
      ),
    });
  }

  return blocks;
};

export const HousePrintPage1Factory = ({
  data,
  hideUtilities = false,
}: {
  data: SurveyData;
  hideUtilities?: boolean;
}) => (
  <>
    {getBuildingCoreBlocks(data, hideUtilities).map((b) => (
      <React.Fragment key={b.id}>{b.node}</React.Fragment>
    ))}
  </>
);

export const getCommonExtraBlocks = (
  data: SurveyData,
  startIdx: number,
  type: SurveyType,
): PreviewBlock[] => {
  const blocks: PreviewBlock[] = [];

  if (type === "house") {
    const isHousePrivateRoad =
      data?.q14_ownership === "私人" || data?.q14_ownership === "私有";
    const hasHouseRoadWarning =
      ["未核定", "申請中", "須申請", "其他未列項目"].includes(
        data.q14_buildingLine || "",
      ) || data.q14_ditch === "無排水系統";

    blocks.push({
      id: "extra-access",
      node: (
        <>
          <SectionHeader title={`${startIdx}. 進出通行與臨路現況`} />
          <CheckRow
            checked={
              (data?.q14_access === "通行順暢" ||
                data?.q14_access?.includes("順暢")) &&
              !isHousePrivateRoad
            }
          >
            <span className="font-bold mr-2">進出現況</span>
            <PreviewResult
              checked={
                data?.q14_access === "通行順暢" ||
                data?.q14_access?.includes("順暢")
              }
              label={`通行順暢${data.q14_ownership || data.q14_protection || data.q14_protectionDesc ? ` [${data.q14_ownership || ""}${data.q14_protection ? "／" + data.q14_protection : ""}${data.q14_protectionDesc ? ` （${data.q14_protectionDesc}）` : ""}]` : ""}${formatAccessLandAddress(data.q14_section, data.q14_subSection, data.q14_number) ? ` ${formatAccessLandAddress(data.q14_section, data.q14_subSection, data.q14_number)}` : ""}`}
              isWarning={isHousePrivateRoad}
              forceSafe={!isHousePrivateRoad}
            />
            <PreviewResult
              checked={
                data?.q14_access === "通行受限" ||
                data?.q14_access?.includes("受限")
              }
              label={
                data.q14_abnormalDesc
                  ? `通行受限（如狹窄、有障礙物）：${data.q14_abnormalDesc}`
                  : "通行受限（如狹窄、有障礙物）"
              }
              isWarning={true}
            />
            <PreviewResult
              checked={
                data?.q14_access === "袋地" || data?.q14_access?.includes("袋地")
              }
              label={
                data.q14_abnormalDesc
                  ? `袋地（無合法出入口）：${data.q14_abnormalDesc}`
                  : "袋地（無合法出入口）"
              }
              isWarning={true}
            />
            <PreviewResult
              checked={data?.q14_access === "其他未列項目"}
              label={
                data.q14_abnormalDesc
                  ? `其他未列項目：${data.q14_abnormalDesc}`
                  : "其他未列項目"
              }
              isWarning={true}
            />
          </CheckRow>
          {(data.q14_access === "通行順暢" ||
            data.q14_access?.includes("順暢") ||
            data.q14_access === "通行受限" ||
            data.q14_access?.includes("受限") ||
            data.q14_access === "其他未列項目") &&
            (data.q14_roadMaterial ||
              data.q14_roadWidth ||
              data.q14_buildingLine ||
              data.q14_ditch) && (
              <CheckRow checked={!hasHouseRoadWarning}>
                {(() => {
                  const items = [];
                  if (data.q14_roadMaterial) {
                    items.push(
                      <PreviewResult
                        checked={true}
                        label="路面材質"
                        suffix={
                          data.q14_roadMaterial === "其他" ||
                          data.q14_roadMaterial === "其他未列項目"
                            ? `：${data.q14_roadMaterialOther ? `其他未列項目：${data.q14_roadMaterialOther}` : "其他未列項目"}`
                            : `：${data.q14_roadMaterial}`
                        }
                        forceSafe={true}
                      />,
                    );
                  }
                  if (data.q14_roadWidth) {
                    items.push(
                      <span className="font-bold border-l-0">
                        路寬：{data.q14_roadWidth}米
                      </span>,
                    );
                  }
                  if (data.q14_buildingLine) {
                    const buildingLineLabel =
                      data.q14_buildingLine === "其他未列項目"
                        ? data.q14_buildingLineOther
                          ? `其他未列項目：${data.q14_buildingLineOther}`
                          : "其他未列項目"
                        : data.q14_buildingLine;
                    const isBLWarning =
                      ["未核定", "申請中", "須申請"].includes(
                        data.q14_buildingLine,
                      ) || data.q14_buildingLine === "其他未列項目";
                    items.push(
                      <PreviewResult
                        checked={true}
                        label={`建築線：${buildingLineLabel}`}
                        isWarning={isBLWarning}
                        forceSafe={!isBLWarning}
                      />,
                    );
                  }
                  if (data.q14_ditch) {
                    const isDitchWarning = data.q14_ditch === "無排水系統";
                    items.push(
                      <PreviewResult
                        checked={true}
                        label="排水溝"
                        suffix={
                          data.q14_ditch === "其他" ||
                          data.q14_ditch === "其他未列項目"
                            ? `：${data.q14_ditchOther ? `其他未列項目：${data.q14_ditchOther}` : "其他未列項目"}`
                            : `：${data.q14_ditch}`
                        }
                        isWarning={isDitchWarning}
                        forceSafe={!isDitchWarning}
                      />,
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
      ),
    });
  }

  blocks.push({
    id: "extra-env",
    node: (
      <>
        <SectionHeader
          title={
            type === "house"
              ? `${startIdx + 1}. 重要環境設施與常見環境抗性設施`
              : type === "land"
                ? `${startIdx}. 重要環境設施與常見環境抗性設施`
                : `${type === "factory" ? startIdx : startIdx + 1}. 重要環境設施與常見環境抗性設施`
          }
        />
        <CheckRow checked={!!data?.q16_noFacilities}>
          <span className="font-bold mr-2 shrink-0">重要環境設施</span>
          {data?.q16_noFacilities && (
            <span className="font-medium">無重要環境設施</span>
          )}
          {!data?.q16_noFacilities &&
            data?.q16_items &&
            data.q16_items.length > 0 && (
              <span className="font-medium mr-2">{data.q16_items.join("、")}</span>
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
  });

  blocks.push({
    id: "extra-notes",
    node: (
      <>
        <SectionHeader
          title={
            type === "house"
              ? `${startIdx + 2}. 本案與社區特殊或影響交易事項`
              : type === "land"
                ? `${startIdx + 1}. 本案與社區特殊或影響交易事項`
                : `${type === "factory" ? startIdx + 1 : startIdx + 2}. 本案與社區特殊或影響交易事項`
          }
        />
        {type !== "land" && (
          <CheckRow
            checked={data?.q17_homicide === "否" || data?.q17_homicide === "無"}
          >
            <span className="font-bold mr-2">重大事故與非自然身故紀錄</span>
            <PreviewResult
              checked={data?.q17_homicide === "否" || data?.q17_homicide === "無"}
              label="無"
            />
            <PreviewResult
              checked={data?.q17_homicide === "是" || data?.q17_homicide === "有"}
              label={
                data?.q17_homicide_desc ? `有：${data.q17_homicide_desc}` : "有"
              }
              isWarning={true}
            />
            <PreviewResult
              checked={data?.q17_homicide === "待查證"}
              label={
                data?.q17_homicide_desc
                  ? `待查證：${data.q17_homicide_desc}`
                  : "待查證"
              }
              isWarning={true}
            />
          </CheckRow>
        )}
        <CheckRow
          checked={
            type === "land"
              ? data?.land_q8_special === "否"
              : data?.q17_issue === "否"
          }
        >
          <span className="font-bold mr-2">
            {type === "land" ? "特殊或影響交易事項" : "補充事項"}
          </span>
          <PreviewResult
            checked={
              type === "land"
                ? data?.land_q8_special === "否"
                : data?.q17_issue === "否"
            }
            label="無"
          />
          <PreviewResult
            checked={
              type === "land"
                ? data?.land_q8_special === "是"
                : data?.q17_issue === "是"
            }
            label={
              type === "land"
                ? data?.land_q8_special_desc || "有"
                : data?.q17_desc || "有"
            }
            isWarning={true}
          />
          <PreviewResult
            checked={
              type === "land"
                ? data?.land_q8_special === "待查證"
                : data?.q17_issue === "待查證"
            }
            label={(() => {
              const desc =
                type === "land" ? data?.land_q8_special_desc : data?.q17_desc;
              return desc ? `待查證：${desc}` : "待查證";
            })()}
            isWarning={true}
          />
        </CheckRow>
      </>
    ),
  });

  return blocks;
};

export const CommonExtraQuestions = ({
  data,
  startIdx,
  type,
}: {
  data: SurveyData;
  startIdx: number;
  type: SurveyType;
}) => (
  <>
    {getCommonExtraBlocks(data, startIdx, type).map((b) => (
      <React.Fragment key={b.id}>{b.node}</React.Fragment>
    ))}
  </>
);

