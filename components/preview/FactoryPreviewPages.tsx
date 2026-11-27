import { SurveyData } from "../../types";
import { GROUP_A_TYPES } from "../../constants";
import { useInterface } from "../InterfaceContext";
import {
  formatAccessLandAddress,
  PreviewResult,
  CheckRow,
  SectionHeader,
  TableHeaderRow,
  ParkingContent,
  LandDisputeExproPreview,
  LandDisputeBlock,
  LandExproBlock,
  PreviewBlock,
} from "./PreviewShared";
import {
  getHouseLabels,
  HousePrintPage1Factory,
  CommonExtraQuestions,
  getBuildingCoreBlocks,
  getCommonExtraBlocks,
} from "./PreviewCommonBlocks";

export const FactoryPrintPage1 = ({ data }: { data: SurveyData }) => {
  return (
    <>
      <TableHeaderRow />
      <HousePrintPage1Factory data={data} hideUtilities={true} />
    </>
  );
};
export const FactoryPrintPage2 = ({
  data,
  parkingSummary,
  activeMode,
}: {
  data: SurveyData;
  parkingSummary: any;
  activeMode: any;
}) => {
  const isStandard = useInterface() === "standard";
  // UPDATED LOGIC TO MATCH NEW FACTORY PROPERTY TYPES
  const isHiRise =
    data.propertyType === "立體化廠辦大樓" ||
    data.propertyType === "連棟／分組式標準廠房";
  const showSolar = GROUP_A_TYPES.includes(data.propertyType);

  // Compact Helpers
  const getElevatorStr = () => {
    if (!data.factory_elevator) return "";
    if (data.factory_elevator === "無") return "無";
    const status = data.factory_elevator_status || "";
    let s = `${data.factory_elevator}${status ? ` （${status}）` : ""}`;
    const parts = [];
    if (data.factory_elevator_capacity)
      parts.push(`${data.factory_elevator_capacity}噸/kg`);
    if (data.factory_elevator_dim) parts.push(`車廂尺寸：${data.factory_elevator_dim}公分`);
    if (data.factory_elevator_door_dim) parts.push(`開門尺寸：${data.factory_elevator_door_dim}公分`);
    if (parts.length > 0) s += ` ${parts.join("、")}`;
    return s;
  };
  const getCraneStr = () => {
    if (!data.factory_crane) return "";
    if (data.factory_crane === "無") return "無";
    if (data.factory_crane === "僅預留牛腿") return "預留牛腿";
    if (data.factory_crane === "有軌道／樑，無主機") return "有軌道無主機";
    let s = "有";
    if (data.factory_crane_desc) {
      s += ` （${data.factory_crane_desc}）`;
    } else {
      const status = data.factory_crane_status || "";
      let parts = [];
      if (data.factory_crane_tonnage)
        parts.push(`${data.factory_crane_tonnage}噸`);
      if (data.factory_crane_quantity) parts.push(data.factory_crane_quantity);
      if (parts.length > 0 || status) {
        s += ` （${parts.join("／")}${parts.length > 0 && status ? ' ' : ''}${status || ''}）`;
      }
    }
    return s;
  };
  const getWasteStr = () => {
    if (!data.factory_waste) return "";
    if (data.factory_waste === "無") return "無";
    if (data.factory_waste === "有") return `有${data.factory_waste_has_detail ? ` （${data.factory_waste_has_detail}）` : ""}`;
    return (
      data.factory_waste +
      ((data.factory_waste === "其他未列項目" || data.factory_waste === "其他") &&
      data.factory_waste_desc
        ? `：${data.factory_waste_desc}`
        : "")
    );
  };
  const getFactoryFireLabel = () => {
    return (data?.factory_fire_safety || [])
      .map((item) =>
        item === "其他未列項目" || item === "其他"
          ? data.factory_fire_safety_other
            ? `其他未列項目：${data.factory_fire_safety_other}`
            : "其他未列項目"
          : item,
      )
      .join("、");
  };
  const getLandWaterSummary = () => {
    if (
      data?.land_q1_water === "否" ||
      !data?.land_q1_water ||
      data?.land_q1_water === "無"
    )
      return data?.land_q1_water || "";
    if (
      data?.land_q1_water === "其他未列項目" ||
      data?.land_q1_water === "其他"
    )
      return data.land_q1_water_other ? `其他未列項目：${data.land_q1_water_other}` : "其他未列項目";
    if (data?.land_q1_water === "是") {
      const cats = Array.isArray(data.land_q1_water_cat) ? data.land_q1_water_cat : [];
      if (cats.length === 0) return "有";
      const catStrs = cats.map((cat) => {
        let suffix = "";
        if (cat === "自來水" && data.land_q1_water_tap_detail)
          suffix = `-${data.land_q1_water_tap_detail}${data.land_q1_water_tap_detail === "其他未列項目" && data.land_q1_water_tap_other ? " - " + data.land_q1_water_tap_other : ""}`;
        else if (cat === "地下水" && data.land_q1_water_ground_detail)
          suffix = `-${data.land_q1_water_ground_detail}`;
        return `${cat}${suffix}`;
      });
      return `有 （${catStrs.join("、")}）`;
    }
    return "";
  };

  const hasFactorySpec =
    !!data.factory_spec_unknown ||
    !!data.factory_height ||
    !!data.factory_width ||
    !!data.factory_depth ||
    !!data.factory_floor_height ||
    (Array.isArray(data.factory_floor_condition)
      ? data.factory_floor_condition.length > 0
      : !!data.factory_floor_condition) ||
    !!data.factory_fire_inspection ||
    (data.factory_fire_safety && data.factory_fire_safety.length > 0);
  const isFactoryQ5Normal =
    hasFactorySpec && data.factory_fire_inspection !== "否";
  const isFactoryElecWarning =
    !data?.land_q1_elec ||
    data.land_q1_elec.startsWith("無電力") ||
    data.land_q1_elec.includes("無法判斷") ||
    data.land_q1_elec === "其他" ||
    data.land_q1_elec === "其他未列項目";
  const factoryWaterSummary = getLandWaterSummary();
  const isFactoryWaterPrivateWell = factoryWaterSummary.includes("私設水井");
  const isFactoryWaterNormal =
    data?.land_q1_water === "是" && !isFactoryWaterPrivateWell;
  const isFactoryGasNone = data?.land_q1_gas === "完全無設置";
  const isFactoryCustomParking =
    data.propertyType &&
    ["獨棟自建廠房", "倉儲物流廠房", "其他特殊工業設施"].includes(
      data.propertyType,
    );
  const hasFactoryParkingInfo = isFactoryCustomParking
    ? !!data?.factory_parking_desc
    : !!data?.q10_noParking ||
      (data?.q10_parkTypes && data.q10_parkTypes.length > 0) ||
      !!data?.q10_hasParkTypeOther;

  return (
    <>
      <SectionHeader title="5. 廠房結構與消防安全" />
      <CheckRow checked={isFactoryQ5Normal}>
        <div className="flex flex-col gap-2 text-black">
          <div className="flex flex-wrap gap-x-8 gap-y-1">
            <div>
              <span className="font-bold">
                {isHiRise ? "樑下淨高／樓層高度：" : "滴水高度："}
              </span>
              {data.factory_spec_unknown ? "無法確認／依使照為準" : (data.factory_height ? `${data.factory_height}米` : "")}
            </div>
            <div>
              <span className="font-bold">面寬：</span>
              {data.factory_spec_unknown ? "無法確認／依使照為準" : (data.factory_width ? `${data.factory_width}米` : "")}
            </div>
            <div>
              <span className="font-bold">深度：</span>
              {data.factory_spec_unknown ? "無法確認／依使照為準" : (data.factory_depth ? `${data.factory_depth}米` : "")}
            </div>
            <div>
              <span className="font-bold">樓板高度：</span>
              {data.factory_spec_unknown ? "無法確認／依使照為準" : (data.factory_floor_height ? `${data.factory_floor_height}米` : "")}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-1">
            <div>
              <span className="font-bold">地板狀況：</span>
              {Array.isArray(data.factory_floor_condition) 
                ? data.factory_floor_condition.map(cond => cond === '其他未列項目' || cond === '其他' ? (data.factory_floor_condition_other ? `其他未列項目（${data.factory_floor_condition_other}）` : '其他未列項目') : cond).join('、')
                : ((data.factory_floor_condition || "") +
                  ((data.factory_floor_condition === "其他" || data.factory_floor_condition === "其他未列項目") && data.factory_floor_condition_other
                    ? `（${data.factory_floor_condition_other}）`
                    : ""))
              }
            </div>
            <div>
              <span className="font-bold">定期做消防檢測：</span>
              {data.factory_fire_inspection}
            </div>
            <div>
              <span className="font-bold">消防設施：</span>
              {getFactoryFireLabel()}
            </div>
          </div>
        </div>
      </CheckRow>

      <SectionHeader title="6. 電、水、瓦斯與其他設施使用現況" />
      <CheckRow checked={!isFactoryElecWarning}>
        <div className="flex flex-wrap items-start text-black">
          <span className="font-bold mr-2 shrink-0">供電類型</span>
          <PreviewResult
            checked={!!data?.land_q1_elec}
            label={data?.land_q1_elec}
            isWarning={isFactoryElecWarning}
            forceSafe={!isFactoryElecWarning}
          />
          {(data?.land_q1_elec === "其他" ||
            data?.land_q1_elec === "其他未列項目") &&
            data?.land_q1_elec_other &&
            ` （${data.land_q1_elec_other}）`}
          {(data?.land_q1_elec?.includes("一般用電") ||
            data?.land_q1_elec?.includes("動力用電")) &&
            [
              data.land_q1_elec_meter,
              data.land_q1_elec_voltage,
              data.land_q1_elec_capacity,
            ].filter(Boolean).length > 0 && (
              <span className={`ml-2 ${isStandard ? "text-sm" : "text-[17px]"} font-bold`}>
                [
                {[
                  data.land_q1_elec_meter,
                  data.land_q1_elec_voltage,
                  data.land_q1_elec_capacity,
                ]
                  .filter(Boolean)
                  .join("／")}
                ]
              </span>
            )}
        </div>
      </CheckRow>
      <CheckRow checked={isFactoryWaterNormal}>
        <div className="flex items-center text-black">
          <span className="font-bold mr-2">水源供應</span>
          <PreviewResult
            checked={
              data?.land_q1_water !== "否" &&
              data?.land_q1_water !== "無" &&
              !!data?.land_q1_water
            }
            label={factoryWaterSummary}
            isWarning={
              isFactoryWaterPrivateWell ||
              data?.land_q1_water === "其他" ||
              data?.land_q1_water === "其他未列項目"
            }
            forceSafe={isFactoryWaterNormal}
          />
          <PreviewResult
            checked={data?.land_q1_water === "否" || data?.land_q1_water === "無"}
            label="無"
            isWarning={true}
          />
        </div>
      </CheckRow>
      <CheckRow checked={!!data?.land_q1_gas && !isFactoryGasNone}>
        <div className="flex items-center text-black">
          <span className="font-bold mr-2">瓦斯供應現況</span>
          <PreviewResult
            checked={!!data?.land_q1_gas}
            label={data?.land_q1_gas || ""}
            isWarning={isFactoryGasNone}
            forceSafe={!isFactoryGasNone}
          />
        </div>
      </CheckRow>
      {/* Solar for Factory */}
      {showSolar && (
        <CheckRow
          checked={
            data?.house_solar_status === "無設置" ||
            data?.house_solar_status === "無" ||
            data?.house_solar_status === "合法設置"
          }
        >
          <div className="flex items-center text-black">
            <span className="font-bold mr-2">太陽能光電發電設備</span>
            <PreviewResult
              checked={data?.house_solar_status === "合法設置"}
              label="合法設置"
              forceSafe={true}
            />
            <PreviewResult
              checked={data?.house_solar_status === "私人設置"}
              label="私人設置"
              isWarning={true}
            />
            <PreviewResult
              checked={
                data?.house_solar_status === "無設置" ||
                data?.house_solar_status === "無"
              }
              label="無設置"
            />
          </div>
        </CheckRow>
      )}
      {/* Conditional Render for Water Booster */}
      {showSolar && data?.water_booster && (
        <CheckRow
          checked={
            data?.water_booster === "無" || data?.water_booster === "無設置"
          }
        >
          <div className="flex items-center text-black">
            <span className="font-bold mr-2">加壓受水設備</span>
            <PreviewResult
              checked={
                !!data?.water_booster &&
                data.water_booster !== "無" &&
                data.water_booster !== "無設置" &&
                data.water_booster !== "其他未列項目"
              }
              label={`有設置${data.water_booster_items && data.water_booster_items.length > 0 ? ` （${data.water_booster_items.join("、")}）` : ""}`}
              isWarning={true}
            />
            <PreviewResult
              checked={data?.water_booster === "其他未列項目"}
              label={data.water_booster_desc ? `其他未列項目 （${data.water_booster_desc}）` : "其他未列項目"}
              isWarning={true}
            />
            <PreviewResult
              checked={
                data?.water_booster === "無" || data?.water_booster === "無設置"
              }
              label="無設置"
            />
          </div>
        </CheckRow>
      )}
      <CheckRow checked={data?.land_q1_other_new === "否"}>
        <div className="flex items-center text-black">
          <span className="font-bold mr-2">其他設施</span>
          <PreviewResult
            checked={data?.land_q1_other_new === "是"}
            label={data.land_q1_other_desc || "有"}
            isWarning={true}
          />
          <PreviewResult
            checked={data?.land_q1_other_new === "否"}
            label="無"
          />
        </div>
      </CheckRow>

      <SectionHeader title="7. 廠房硬體設施" />
      <CheckRow checked={data.factory_elevator === "無"}>
        <span className="font-bold mr-2">貨梯</span>
        {getElevatorStr()}
      </CheckRow>
      <CheckRow checked={data.factory_crane === "無"}>
        <span className="font-bold mr-2">天車</span>
        {getCraneStr()}
      </CheckRow>
      <CheckRow checked={data.factory_waste === "無"}>
        <span className="font-bold mr-2">廢水／氣</span>
        {getWasteStr()}
      </CheckRow>

      <SectionHeader title="8. 物流動線" />
      <CheckRow checked={!!data.factory_loading_dock}>
        <span className="font-bold mr-2">卸貨碼頭</span>
        {data.factory_loading_dock || ""}
      </CheckRow>
      <CheckRow checked={!!data.factory_truck_access}>
        <span className="font-bold mr-2">大車進出</span>
        {data.factory_truck_access || ""}
      </CheckRow>
      <CheckRow checked={!!data.factory_truck_buffer}>
        <span className="font-bold mr-2">迴轉空間／緩衝區</span>
        {data.factory_truck_buffer || ""}
      </CheckRow>

      {isStandard && (
        <>
          <SectionHeader title="9. 車位資訊" />
          <CheckRow checked={hasFactoryParkingInfo}>
            <ParkingContent
              data={data}
              parkingSummary={parkingSummary}
              activeMode={activeMode}
              isFactory={true}
            />
          </CheckRow>
          {!isFactoryCustomParking && (
            <>
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
                    data?.q11_hasIssue === "否" ||
                    data?.q11_hasIssue === "無異常"
                  }
                  label="無異常"
                />
                <PreviewResult
                  checked={
                    data?.q11_hasIssue === "是" ||
                    data?.q11_hasIssue === "有異常"
                  }
                  label={
                    [
                      ...(data?.q11_items || []),
                      ...(data?.q11_hasOther
                        ? [
                            data.q11_other
                              ? `其他未列項目：${data.q11_other}`
                              : "其他未列項目",
                          ]
                        : []),
                    ].join("、") || "有異常"
                  }
                  isWarning={true}
                />
              </CheckRow>
              <CheckRow
                checked={!!data?.q10_noParking || data?.q12_hasNote === "否"}
              >
                <span className="font-bold mr-2">車位與車道其他備註</span>
                <PreviewResult
                  checked={data?.q12_hasNote === "否"}
                  label="無"
                />
                <PreviewResult
                  checked={data?.q12_hasNote === "是"}
                  label={data?.q12_note || "有"}
                  isWarning={true}
                />
              </CheckRow>
            </>
          )}
        </>
      )}
    </>
  );
};

// NEW: Page 3 for ALL factory types now
export const FactoryPrintPage3 = ({
  data,
  parkingSummary,
  activeMode,
}: {
  data: SurveyData;
  parkingSummary?: any;
  activeMode?: any;
}) => {
  const isStandard = useInterface() === "standard";
  // Determine numbering based on what is shown/hidden
  // UPDATED LOGIC TO MATCH NEW FACTORY PROPERTY TYPES
  const hideLandDetails =
    data.propertyType === "立體化廠辦大樓" ||
    data.propertyType === "連棟／分組式標準廠房";
  const isHiRise = data.propertyType === "立體化廠辦大樓";
  const hideSoil = isHiRise;
  const labels = getHouseLabels(data); // Reuse house labels logic for q9 facilities

  let idx = 10;

  return (
    <>
      {!isStandard && parkingSummary && (
        <>
          <SectionHeader title="9. 車位資訊" />
          <CheckRow checked={!!data?.q10_noParking}>
            <ParkingContent
              data={data}
              parkingSummary={parkingSummary}
              activeMode={activeMode || "a4"}
              isFactory={true}
            />
          </CheckRow>
          {!["獨棟自建廠房", "倉儲物流廠房", "其他特殊工業設施"].includes(
            data.propertyType,
          ) && (
            <>
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
                    data?.q11_hasIssue === "否" ||
                    data?.q11_hasIssue === "無異常"
                  }
                  label="無異常"
                />
                <PreviewResult
                  checked={
                    data?.q11_hasIssue === "是" ||
                    data?.q11_hasIssue === "有異常"
                  }
                  label={
                    [
                      ...(data?.q11_items || []),
                      ...(data?.q11_hasOther
                        ? [
                            data.q11_other
                              ? `其他未列項目：${data.q11_other}`
                              : "其他未列項目",
                          ]
                        : []),
                    ].join("、") || "有異常"
                  }
                  isWarning={true}
                />
              </CheckRow>
              <CheckRow
                checked={!!data?.q10_noParking || data?.q12_hasNote === "否"}
              >
                <span className="font-bold mr-2">車位與車道其他備註</span>
                <PreviewResult
                  checked={data?.q12_hasNote === "否"}
                  label="無"
                />
                <PreviewResult
                  checked={data?.q12_hasNote === "是"}
                  label={data?.q12_note || "有"}
                  isWarning={true}
                />
              </CheckRow>
            </>
          )}
        </>
      )}
      <SectionHeader title={`${idx}. 本案或周圍須注意設施`} />
      <CheckRow checked={data?.q9_hasIssue === "否"}>
        <span className="font-bold mr-2">須注意設施</span>
        <PreviewResult checked={data?.q9_hasIssue === "否"} label="無" />
        <PreviewResult
          checked={data?.q9_hasIssue === "是"}
          label={labels.q9() || (!data?.q9_hasOther ? "有" : "")}
          isWarning={true}
        />
        <PreviewResult
          checked={!!data?.q9_hasOther}
          label={
            data?.q9_otherDesc
              ? `其他未列項目：${data.q9_otherDesc}`
              : "其他未列項目"
          }
          isWarning={true}
        />
      </CheckRow>

      <SectionHeader title={`${++idx}. 廠房進出通行與臨路現況`} />
      <CheckRow
        checked={
          !!data.land_q2_access?.includes("順暢") &&
          data.land_q2_owner !== "私人" &&
          data.land_q2_owner !== "私有"
        }
      >
        {(() => {
          const acc = data.land_q2_access;
          if (acc?.includes("順暢")) {
            const mat =
              data.land_q2_material === "其他" ||
              data.land_q2_material === "其他未列項目"
                ? data.land_q2_material_other
                  ? `其他未列項目：${data.land_q2_material_other}`
                  : "其他未列項目"
                : data.land_q2_material;
            const ditch =
              data.land_q2_ditch === "其他" ||
              data.land_q2_ditch === "其他未列項目"
                ? data.land_q2_ditch_other
                  ? `其他未列項目：${data.land_q2_ditch_other}`
                  : "其他未列項目"
                : data.land_q2_ditch;
            const ditchStr =
              ditch === "有" ? "有水溝" : ditch === "無" ? "無水溝" : ditch;
            const roadWidth = data.land_q2_roadWidth
              ? `路寬：${data.land_q2_roadWidth}米`
              : "";
            const buildingLineVal =
              data.land_q2_buildingLine === "其他未列項目"
                ? data.land_q2_buildingLine_other
                  ? `其他未列項目：${data.land_q2_buildingLine_other}`
                  : "其他未列項目"
                : data.land_q2_buildingLine;
            const buildingLine = data.land_q2_buildingLine
              ? `建築線：${buildingLineVal}`
              : "";

            return (
              <div>
                通行順暢
                {data.land_q2_owner
                  ? ` （${data.land_q2_owner}${data.land_q2_protection ? "／" + data.land_q2_protection : ""}${data.land_q2_protectionDesc ? `（${data.land_q2_protectionDesc}）` : ""}）`
                  : ""}
                {mat ? ` [${mat}${ditchStr ? "／" : ""}` : (ditchStr ? " [-／" : "")}
                {ditchStr ? (
                  <span className={ditch === "無排水系統" ? "text-red-500 font-bold" : ""}>
                    {ditchStr}
                  </span>
                ) : ""}
                {mat || ditchStr ? "]" : ""}
                {roadWidth ? ` [${roadWidth}]` : ""}
                {buildingLine ? (
                  <>
                    {" ["}
                    <span className={['未核定', '申請中', '須申請'].includes(data.land_q2_buildingLine || "") || data.land_q2_buildingLine === '其他未列項目' ? "text-red-500 font-bold" : ""}>
                      {buildingLine}
                    </span>
                    {"]"}
                  </>
                ) : ""}
                {(() => {
                  const addr = formatAccessLandAddress(
                    data.land_q2_access_section,
                    data.land_q2_access_subSection,
                    data.land_q2_access_number,
                  );
                  return addr ? ` ${addr}` : "";
                })()}
              </div>
            );
          } else {
            const accLabel =
              acc === "通行受限"
                ? "通行受限（如狹窄、有障礙物）"
                : acc === "袋地"
                  ? "袋地（無合法出入口）"
                  : acc || "";
            return (
              <div>
                {accLabel}
                {data.land_q2_access_desc
                  ? ` （${data.land_q2_access_desc}）`
                  : ""}
              </div>
            );
          }
        })()}
      </CheckRow>

      {!hideLandDetails && (
        <LandDisputeExproPreview
          data={data}
          titles={{
            q3: `${++idx}. 土地鑑界與界標現況與產權與使用糾紛現況`,
            q4: `${++idx}. 土地徵收預定地與重測區現況`,
          }}
        />
      )}

      {!hideSoil && (
        <>
          <SectionHeader title={`${++idx}. 土壤與地下埋設物現況`} />
          <CheckRow checked={data?.soil_q1_status === "無"}>
            <span className="font-bold mr-2">土壤汙染與地下掩埋物現況</span>
            <PreviewResult
              checked={data?.soil_q1_status === "有"}
              label={data.soil_q1_desc ? `有 （${data.soil_q1_desc}）` : "有"}
              isWarning={true}
            />
            <PreviewResult checked={data?.soil_q1_status === "無"} label="無" />
            <PreviewResult
              checked={
                data?.soil_q1_status === "不確定" ||
                data?.soil_q1_status === "待查證"
              }
              label={`待查證${data?.soil_q1_desc ? ` （${data.soil_q1_desc}）` : ""}`}
              isWarning={true}
            />
          </CheckRow>
        </>
      )}

      <CommonExtraQuestions
        data={data}
        startIdx={
          data.propertyType === "立體化廠辦大樓"
            ? 12
            : ["連棟／分組式標準廠房"].includes(data.propertyType)
              ? 13
              : 15
        }
        type="factory"
      />
    </>
  );
};

export const getFactoryPreviewBlocks = (
  data: SurveyData,
  parkingSummary: any,
  activeMode: "a4" | "mobile",
): PreviewBlock[] => {
  const isHiRiseSpec =
    data.propertyType === "立體化廠辦大樓" ||
    data.propertyType === "連棟／分組式標準廠房";
  const showSolar = GROUP_A_TYPES.includes(data.propertyType);
  const hideLandDetails = isHiRiseSpec;
  const hideSoil = data.propertyType === "立體化廠辦大樓";
  const labels = getHouseLabels(data);

  const getElevatorStr = () => {
    if (!data.factory_elevator) return "";
    if (data.factory_elevator === "無") return "無";
    const status = data.factory_elevator_status || "";
    let s = `${data.factory_elevator}${status ? ` （${status}）` : ""}`;
    const parts = [];
    if (data.factory_elevator_capacity)
      parts.push(`${data.factory_elevator_capacity}噸/kg`);
    if (data.factory_elevator_dim)
      parts.push(`車廂尺寸：${data.factory_elevator_dim}公分`);
    if (data.factory_elevator_door_dim)
      parts.push(`開門尺寸：${data.factory_elevator_door_dim}公分`);
    if (parts.length > 0) s += ` ${parts.join("、")}`;
    return s;
  };
  const getCraneStr = () => {
    if (!data.factory_crane) return "";
    if (data.factory_crane === "無") return "無";
    if (data.factory_crane === "僅預留牛腿") return "預留牛腿";
    if (data.factory_crane === "有軌道／樑，無主機") return "有軌道無主機";
    let s = "有";
    if (data.factory_crane_desc) {
      s += ` （${data.factory_crane_desc}）`;
    } else {
      const status = data.factory_crane_status || "";
      const parts = [];
      if (data.factory_crane_tonnage)
        parts.push(`${data.factory_crane_tonnage}噸`);
      if (data.factory_crane_quantity) parts.push(data.factory_crane_quantity);
      if (parts.length > 0 || status) {
        s += ` （${parts.join("／")}${parts.length > 0 && status ? " " : ""}${status || ""}）`;
      }
    }
    return s;
  };
  const getWasteStr = () => {
    if (!data.factory_waste) return "";
    if (data.factory_waste === "無") return "無";
    if (data.factory_waste === "有")
      return `有${data.factory_waste_has_detail ? ` （${data.factory_waste_has_detail}）` : ""}`;
    return (
      data.factory_waste +
      ((data.factory_waste === "其他未列項目" || data.factory_waste === "其他") &&
      data.factory_waste_desc
        ? `：${data.factory_waste_desc}`
        : "")
    );
  };
  const getFactoryFireLabel = () => {
    return (data?.factory_fire_safety || [])
      .map((item) =>
        item === "其他未列項目" || item === "其他"
          ? data.factory_fire_safety_other
            ? `其他未列項目：${data.factory_fire_safety_other}`
            : "其他未列項目"
          : item,
      )
      .join("、");
  };
  const getLandWaterSummary = () => {
    if (
      data?.land_q1_water === "否" ||
      !data?.land_q1_water ||
      data?.land_q1_water === "無"
    )
      return data?.land_q1_water || "";
    if (
      data?.land_q1_water === "其他未列項目" ||
      data?.land_q1_water === "其他"
    )
      return data.land_q1_water_other ? `其他未列項目：${data.land_q1_water_other}` : "其他未列項目";
    if (data?.land_q1_water === "是") {
      const cats = Array.isArray(data.land_q1_water_cat) ? data.land_q1_water_cat : [];
      if (cats.length === 0) return "有";
      const catStrs = cats.map((cat) => {
        let suffix = "";
        if (cat === "自來水" && data.land_q1_water_tap_detail)
          suffix = `-${data.land_q1_water_tap_detail}${data.land_q1_water_tap_detail === "其他未列項目" && data.land_q1_water_tap_other ? " - " + data.land_q1_water_tap_other : ""}`;
        else if (cat === "地下水" && data.land_q1_water_ground_detail)
          suffix = `-${data.land_q1_water_ground_detail}`;
        return `${cat}${suffix}`;
      });
      return `有 （${catStrs.join("、")}）`;
    }
    return "";
  };

  const hasFactorySpec =
    !!data.factory_spec_unknown ||
    !!data.factory_height ||
    !!data.factory_width ||
    !!data.factory_depth ||
    !!data.factory_floor_height ||
    (Array.isArray(data.factory_floor_condition)
      ? data.factory_floor_condition.length > 0
      : !!data.factory_floor_condition) ||
    !!data.factory_fire_inspection ||
    (data.factory_fire_safety && data.factory_fire_safety.length > 0);
  const isFactoryQ5Normal =
    hasFactorySpec && data.factory_fire_inspection !== "否";
  const isFactoryElecWarning =
    !data?.land_q1_elec ||
    data.land_q1_elec.startsWith("無電力") ||
    data.land_q1_elec.includes("無法判斷") ||
    data.land_q1_elec === "其他" ||
    data.land_q1_elec === "其他未列項目";
  const factoryWaterSummary = getLandWaterSummary();
  const isFactoryWaterPrivateWell = factoryWaterSummary.includes("私設水井");
  const isFactoryWaterNormal =
    data?.land_q1_water === "是" && !isFactoryWaterPrivateWell;
  const isFactoryGasNone = data?.land_q1_gas === "完全無設置";
  const isFactoryCustomParking =
    data.propertyType &&
    ["獨棟自建廠房", "倉儲物流廠房", "其他特殊工業設施"].includes(
      data.propertyType,
    );
  const hasFactoryParkingInfo = isFactoryCustomParking
    ? !!data?.factory_parking_desc
    : !!data?.q10_noParking ||
      (data?.q10_parkTypes && data.q10_parkTypes.length > 0) ||
      !!data?.q10_hasParkTypeOther;

  const blocks: PreviewBlock[] = [
    ...getBuildingCoreBlocks(data, true),
    {
      id: "factory-q5",
      node: (
        <>
          <SectionHeader title="5. 廠房結構與消防安全" />
          <CheckRow checked={isFactoryQ5Normal}>
            <div className="flex flex-col gap-2 text-black">
              <div className="flex flex-wrap gap-x-8 gap-y-1">
                <div>
                  <span className="font-bold">
                    {isHiRiseSpec ? "樑下淨高／樓層高度：" : "滴水高度："}
                  </span>
                  {data.factory_spec_unknown
                    ? "無法確認／依使照為準"
                    : data.factory_height
                      ? `${data.factory_height}米`
                      : ""}
                </div>
                <div>
                  <span className="font-bold">面寬：</span>
                  {data.factory_spec_unknown
                    ? "無法確認／依使照為準"
                    : data.factory_width
                      ? `${data.factory_width}米`
                      : ""}
                </div>
                <div>
                  <span className="font-bold">深度：</span>
                  {data.factory_spec_unknown
                    ? "無法確認／依使照為準"
                    : data.factory_depth
                      ? `${data.factory_depth}米`
                      : ""}
                </div>
                <div>
                  <span className="font-bold">樓板高度：</span>
                  {data.factory_spec_unknown
                    ? "無法確認／依使照為準"
                    : data.factory_floor_height
                      ? `${data.factory_floor_height}米`
                      : ""}
                </div>
              </div>
              <div className="flex flex-wrap gap-x-8 gap-y-1">
                <div>
                  <span className="font-bold">地板狀況：</span>
                  {Array.isArray(data.factory_floor_condition)
                    ? data.factory_floor_condition
                        .map((cond) =>
                          cond === "其他未列項目" || cond === "其他"
                            ? data.factory_floor_condition_other
                              ? `其他未列項目（${data.factory_floor_condition_other}）`
                              : "其他未列項目"
                            : cond,
                        )
                        .join("、")
                    : (data.factory_floor_condition || "") +
                      ((data.factory_floor_condition === "其他" ||
                        data.factory_floor_condition === "其他未列項目") &&
                      data.factory_floor_condition_other
                        ? `（${data.factory_floor_condition_other}）`
                        : "")}
                </div>
                <div>
                  <span className="font-bold">定期做消防檢測：</span>
                  {data.factory_fire_inspection}
                </div>
                <div>
                  <span className="font-bold">消防設施：</span>
                  {getFactoryFireLabel()}
                </div>
              </div>
            </div>
          </CheckRow>
        </>
      ),
    },
    {
      id: "factory-q6",
      node: (
        <>
          <SectionHeader title="6. 電、水、瓦斯與其他設施使用現況" />
          <CheckRow checked={!isFactoryElecWarning}>
            <div className="flex flex-wrap items-start text-black">
              <span className="font-bold mr-2 shrink-0">供電類型</span>
              <PreviewResult
                checked={!!data?.land_q1_elec}
                label={data?.land_q1_elec}
                isWarning={isFactoryElecWarning}
                forceSafe={!isFactoryElecWarning}
              />
              {(data?.land_q1_elec === "其他" ||
                data?.land_q1_elec === "其他未列項目") &&
                data?.land_q1_elec_other &&
                ` （${data.land_q1_elec_other}）`}
              {(data?.land_q1_elec?.includes("一般用電") ||
                data?.land_q1_elec?.includes("動力用電")) &&
                [
                  data.land_q1_elec_meter,
                  data.land_q1_elec_voltage,
                  data.land_q1_elec_capacity,
                ].filter(Boolean).length > 0 && (
                  <span className="ml-2 text-[17px] font-bold">
                    [
                    {[
                      data.land_q1_elec_meter,
                      data.land_q1_elec_voltage,
                      data.land_q1_elec_capacity,
                    ]
                      .filter(Boolean)
                      .join("／")}
                    ]
                  </span>
                )}
            </div>
          </CheckRow>
          <CheckRow checked={isFactoryWaterNormal}>
            <div className="flex items-center text-black">
              <span className="font-bold mr-2">水源供應</span>
              <PreviewResult
                checked={
                  data?.land_q1_water !== "否" &&
                  data?.land_q1_water !== "無" &&
                  !!data?.land_q1_water
                }
                label={factoryWaterSummary}
                isWarning={
                  isFactoryWaterPrivateWell ||
                  data?.land_q1_water === "其他" ||
                  data?.land_q1_water === "其他未列項目"
                }
                forceSafe={isFactoryWaterNormal}
              />
              <PreviewResult
                checked={data?.land_q1_water === "否" || data?.land_q1_water === "無"}
                label="無"
                isWarning={true}
              />
            </div>
          </CheckRow>
          <CheckRow checked={!!data?.land_q1_gas && !isFactoryGasNone}>
            <div className="flex items-center text-black">
              <span className="font-bold mr-2">瓦斯供應現況</span>
              <PreviewResult
                checked={!!data?.land_q1_gas}
                label={data?.land_q1_gas || ""}
                isWarning={isFactoryGasNone}
                forceSafe={!isFactoryGasNone}
              />
            </div>
          </CheckRow>
          {showSolar && (
            <CheckRow
              checked={
                data?.house_solar_status === "無設置" ||
                data?.house_solar_status === "無" ||
                data?.house_solar_status === "合法設置"
              }
            >
              <div className="flex items-center text-black">
                <span className="font-bold mr-2">太陽能光電發電設備</span>
                <PreviewResult
                  checked={data?.house_solar_status === "合法設置"}
                  label="合法設置"
                  forceSafe={true}
                />
                <PreviewResult
                  checked={data?.house_solar_status === "私人設置"}
                  label="私人設置"
                  isWarning={true}
                />
                <PreviewResult
                  checked={
                    data?.house_solar_status === "無設置" ||
                    data?.house_solar_status === "無"
                  }
                  label="無設置"
                />
              </div>
            </CheckRow>
          )}
          {showSolar && data?.water_booster && (
            <CheckRow
              checked={
                data?.water_booster === "無" || data?.water_booster === "無設置"
              }
            >
              <div className="flex items-center text-black">
                <span className="font-bold mr-2">加壓受水設備</span>
                <PreviewResult
                  checked={
                    !!data?.water_booster &&
                    data.water_booster !== "無" &&
                    data.water_booster !== "無設置" &&
                    data.water_booster !== "其他未列項目"
                  }
                  label={`有設置${data.water_booster_items && data.water_booster_items.length > 0 ? ` （${data.water_booster_items.join("、")}）` : ""}`}
                  isWarning={true}
                />
                <PreviewResult
                  checked={data?.water_booster === "其他未列項目"}
                  label={data.water_booster_desc ? `其他未列項目 （${data.water_booster_desc}）` : "其他未列項目"}
                  isWarning={true}
                />
                <PreviewResult
                  checked={
                    data?.water_booster === "無" ||
                    data?.water_booster === "無設置"
                  }
                  label="無設置"
                />
              </div>
            </CheckRow>
          )}
          <CheckRow checked={data?.land_q1_other_new === "否"}>
            <div className="flex items-center text-black">
              <span className="font-bold mr-2">其他設施</span>
              <PreviewResult
                checked={data?.land_q1_other_new === "是"}
                label={data.land_q1_other_desc || "有"}
                isWarning={true}
              />
              <PreviewResult
                checked={data?.land_q1_other_new === "否"}
                label="無"
              />
            </div>
          </CheckRow>
        </>
      ),
    },
    {
      id: "factory-q7",
      node: (
        <>
          <SectionHeader title="7. 廠房硬體設施" />
          <CheckRow checked={data.factory_elevator === "無"}>
            <span className="font-bold mr-2">貨梯</span>
            {getElevatorStr()}
          </CheckRow>
          <CheckRow checked={data.factory_crane === "無"}>
            <span className="font-bold mr-2">天車</span>
            {getCraneStr()}
          </CheckRow>
          <CheckRow checked={data.factory_waste === "無"}>
            <span className="font-bold mr-2">廢水／氣</span>
            {getWasteStr()}
          </CheckRow>
        </>
      ),
    },
    {
      id: "factory-q8",
      node: (
        <>
          <SectionHeader title="8. 物流動線" />
          <CheckRow checked={!!data.factory_loading_dock}>
            <span className="font-bold mr-2">卸貨碼頭</span>
            {data.factory_loading_dock || ""}
          </CheckRow>
          <CheckRow checked={!!data.factory_truck_access}>
            <span className="font-bold mr-2">大車進出</span>
            {data.factory_truck_access || ""}
          </CheckRow>
          <CheckRow checked={!!data.factory_truck_buffer}>
            <span className="font-bold mr-2">迴轉空間／緩衝區</span>
            {data.factory_truck_buffer || ""}
          </CheckRow>
        </>
      ),
    },
    {
      id: "factory-q9",
      node: (
        <>
          <SectionHeader title="9. 車位資訊" />
          <CheckRow checked={hasFactoryParkingInfo}>
            <ParkingContent
              data={data}
              parkingSummary={parkingSummary}
              activeMode={activeMode}
              isFactory={true}
            />
          </CheckRow>
          {!isFactoryCustomParking && (
            <>
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
                    data?.q11_hasIssue === "否" ||
                    data?.q11_hasIssue === "無異常"
                  }
                  label="無異常"
                />
                <PreviewResult
                  checked={
                    data?.q11_hasIssue === "是" ||
                    data?.q11_hasIssue === "有異常"
                  }
                  label={
                    [
                      ...(data?.q11_items || []),
                      ...(data?.q11_hasOther
                        ? [
                            data.q11_other
                              ? `其他未列項目：${data.q11_other}`
                              : "其他未列項目",
                          ]
                        : []),
                    ].join("、") || "有異常"
                  }
                  isWarning={true}
                />
              </CheckRow>
              <CheckRow
                checked={!!data?.q10_noParking || data?.q12_hasNote === "否"}
              >
                <span className="font-bold mr-2">車位與車道其他備註</span>
                <PreviewResult
                  checked={data?.q12_hasNote === "否"}
                  label="無"
                />
                <PreviewResult
                  checked={data?.q12_hasNote === "是"}
                  label={data?.q12_note || "有"}
                  isWarning={true}
                />
              </CheckRow>
            </>
          )}
        </>
      ),
    },
  ];

  let idx = 10;
  blocks.push({
    id: "factory-q10",
    node: (
      <>
        <SectionHeader title={`${idx}. 本案或周圍須注意設施`} />
        <CheckRow checked={data?.q9_hasIssue === "否"}>
          <span className="font-bold mr-2">須注意設施</span>
          <PreviewResult checked={data?.q9_hasIssue === "否"} label="無" />
          <PreviewResult
            checked={data?.q9_hasIssue === "是"}
            label={labels.q9() || (!data?.q9_hasOther ? "有" : "")}
            isWarning={true}
          />
          <PreviewResult
            checked={!!data?.q9_hasOther}
            label={
              data?.q9_otherDesc
                ? `其他未列項目：${data.q9_otherDesc}`
                : "其他未列項目"
            }
            isWarning={true}
          />
        </CheckRow>
      </>
    ),
  });

  blocks.push({
    id: "factory-q11",
    node: (
      <>
        <SectionHeader title={`${++idx}. 廠房進出通行與臨路現況`} />
        <CheckRow
          checked={
            !!data.land_q2_access?.includes("順暢") &&
            data.land_q2_owner !== "私人" &&
            data.land_q2_owner !== "私有"
          }
        >
          {(() => {
            const acc = data.land_q2_access;
            if (acc?.includes("順暢")) {
              const mat =
                data.land_q2_material === "其他" ||
                data.land_q2_material === "其他未列項目"
                  ? data.land_q2_material_other
                    ? `其他未列項目：${data.land_q2_material_other}`
                    : "其他未列項目"
                  : data.land_q2_material;
              const ditch =
                data.land_q2_ditch === "其他" ||
                data.land_q2_ditch === "其他未列項目"
                  ? data.land_q2_ditch_other
                    ? `其他未列項目：${data.land_q2_ditch_other}`
                    : "其他未列項目"
                  : data.land_q2_ditch;
              const ditchStr =
                ditch === "有" ? "有水溝" : ditch === "無" ? "無水溝" : ditch;
              const roadWidth = data.land_q2_roadWidth
                ? `路寬：${data.land_q2_roadWidth}米`
                : "";
              const buildingLineVal =
                data.land_q2_buildingLine === "其他未列項目"
                  ? data.land_q2_buildingLine_other
                    ? `其他未列項目：${data.land_q2_buildingLine_other}`
                    : "其他未列項目"
                  : data.land_q2_buildingLine;
              const buildingLine = data.land_q2_buildingLine
                ? `建築線：${buildingLineVal}`
                : "";

              return (
                <div>
                  通行順暢
                  {data.land_q2_owner
                    ? ` （${data.land_q2_owner}${data.land_q2_protection ? "／" + data.land_q2_protection : ""}${data.land_q2_protectionDesc ? `（${data.land_q2_protectionDesc}）` : ""}）`
                    : ""}
                  {mat ? ` [${mat}${ditchStr ? "／" : ""}` : ditchStr ? " [-／" : ""}
                  {ditchStr ? (
                    <span
                      className={
                        ditch === "無排水系統" ? "text-red-500 font-bold" : ""
                      }
                    >
                      {ditchStr}
                    </span>
                  ) : (
                    ""
                  )}
                  {mat || ditchStr ? "]" : ""}
                  {roadWidth ? ` [${roadWidth}]` : ""}
                  {buildingLine ? (
                    <>
                      {" ["}
                      <span
                        className={
                          ["未核定", "申請中", "須申請"].includes(
                            data.land_q2_buildingLine || "",
                          ) || data.land_q2_buildingLine === "其他未列項目"
                            ? "text-red-500 font-bold"
                            : ""
                        }
                      >
                        {buildingLine}
                      </span>
                      {"]"}
                    </>
                  ) : (
                    ""
                  )}
                  {(() => {
                    const addr = formatAccessLandAddress(
                      data.land_q2_access_section,
                      data.land_q2_access_subSection,
                      data.land_q2_access_number,
                    );
                    return addr ? ` ${addr}` : "";
                  })()}
                </div>
              );
            } else {
              const accLabel =
                acc === "通行受限"
                  ? "通行受限（如狹窄、有障礙物）"
                  : acc === "袋地"
                    ? "袋地（無合法出入口）"
                    : acc || "";
              return (
                <div>
                  {accLabel}
                  {data.land_q2_access_desc
                    ? ` （${data.land_q2_access_desc}）`
                    : ""}
                </div>
              );
            }
          })()}
        </CheckRow>
      </>
    ),
  });

  if (!hideLandDetails) {
    const q3Title = `${++idx}. 土地鑑界與界標現況與產權與使用糾紛現況`;
    const q4Title = `${++idx}. 土地徵收預定地與重測區現況`;
    blocks.push({
      id: "factory-land-dispute",
      node: <LandDisputeBlock data={data} title={q3Title} />,
    });
    blocks.push({
      id: "factory-land-expro",
      node: <LandExproBlock data={data} title={q4Title} />,
    });
  }

  if (!hideSoil) {
    const soilTitle = `${++idx}. 土壤與地下埋設物現況`;
    blocks.push({
      id: "factory-soil",
      node: (
        <>
          <SectionHeader title={soilTitle} />
          <CheckRow checked={data?.soil_q1_status === "無"}>
            <span className="font-bold mr-2">土壤汙染與地下掩埋物現況</span>
            <PreviewResult
              checked={data?.soil_q1_status === "有"}
              label={data.soil_q1_desc ? `有 （${data.soil_q1_desc}）` : "有"}
              isWarning={true}
            />
            <PreviewResult checked={data?.soil_q1_status === "無"} label="無" />
            <PreviewResult
              checked={
                data?.soil_q1_status === "不確定" ||
                data?.soil_q1_status === "待查證"
              }
              label={`待查證${data?.soil_q1_desc ? ` （${data.soil_q1_desc}）` : ""}`}
              isWarning={true}
            />
          </CheckRow>
        </>
      ),
    });
  }

  const extraStartIdx =
    data.propertyType === "立體化廠辦大樓"
      ? 12
      : ["連棟／分組式標準廠房"].includes(data.propertyType)
        ? 13
        : 15;
  blocks.push(...getCommonExtraBlocks(data, extraStartIdx, "factory"));

  return blocks;
};

