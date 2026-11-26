import { SurveyData } from "../../types";
import { GROUP_A_TYPES } from "../../constants";
import {
  formatAccessLandAddress,
  PreviewResult,
  CheckRow,
  SectionHeader,
  TableHeaderRow,
  ParkingContent,
  LandDisputeExproPreview,
} from "./PreviewShared";
import {
  getHouseLabels,
  HousePrintPage1Factory,
  CommonExtraQuestions,
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
      (data.factory_waste === "其他未列項目" || data.factory_waste === "其他"
        ? `：${data.factory_waste_desc}`
        : "")
    );
  };
  const getFactoryFireLabel = () => {
    const labels = [...(data?.factory_fire_safety || [])];
    if (
      (data?.factory_fire_safety?.includes("其他未列項目") ||
        data?.factory_fire_safety?.includes("其他")) &&
      data.factory_fire_safety_other
    )
      labels.push(data.factory_fire_safety_other);
    return labels.join("、");
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
      return `其他：${data.land_q1_water_other}`;
    if (data?.land_q1_water === "是" && Array.isArray(data.land_q1_water_cat)) {
      let catStrs = data.land_q1_water_cat.map((cat) => {
        let suffix = "";
        if (cat === "自來水")
          suffix = `-${data.land_q1_water_tap_detail}${data.land_q1_water_tap_detail === "其他未列項目" ? " - " + data.land_q1_water_tap_other : ""}`;
        else if (cat === "地下水")
          suffix = `-${data.land_q1_water_ground_detail}`;
        return `${cat}${suffix}`;
      });
      return `是 （${catStrs.join("、")}）`;
    }
    return "";
  };

  return (
    <>
      <SectionHeader title="5. 廠房結構與消防安全" />
      <CheckRow checked={false}>
        <div className="flex flex-col gap-2 text-black">
          <div className="flex flex-wrap gap-x-8 gap-y-1">
            <div>
              <span className="font-bold">
                {isHiRise ? "樑下淨高／樓層高度：" : "滴水高度："}
              </span>
              {data.factory_spec_unknown ? "無法確認／依使照為準" : `${data.factory_height || ""}米`}
            </div>
            <div>
              <span className="font-bold">面寬：</span>
              {data.factory_spec_unknown ? "無法確認／依使照為準" : `${data.factory_width || ""}米`}
            </div>
            <div>
              <span className="font-bold">深度：</span>
              {data.factory_spec_unknown ? "無法確認／依使照為準" : `${data.factory_depth || ""}米`}
            </div>
            <div>
              <span className="font-bold">樓板高度：</span>
              {data.factory_spec_unknown ? "無法確認／依使照為準" : `${data.factory_floor_height || ""}米`}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-1">
            <div>
              <span className="font-bold">地板狀況：</span>
              {Array.isArray(data.factory_floor_condition) 
                ? data.factory_floor_condition.map(cond => cond === '其他未列項目' || cond === '其他' ? `其他（${data.factory_floor_condition_other}）` : cond).join('、')
                : (data.factory_floor_condition +
                  (data.factory_floor_condition === "其他" || data.factory_floor_condition === "其他未列項目"
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
      <CheckRow checked={!!data?.land_q1_elec?.startsWith("無電力")}>
        <div className="flex flex-wrap items-start text-black">
          <span className="font-bold mr-2 shrink-0">供電類型</span>
          <PreviewResult
            checked={!!data?.land_q1_elec}
            label={data?.land_q1_elec}
          />
          {(data?.land_q1_elec === "其他" ||
            data?.land_q1_elec === "其他未列項目") &&
            data?.land_q1_elec_other &&
            ` （${data.land_q1_elec_other}）`}
          {(data?.land_q1_elec?.includes("一般用電") ||
            data?.land_q1_elec?.includes("動力用電")) && (
            <span className="ml-2 text-sm font-bold">
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
      <CheckRow checked={data?.land_q1_water === "否"}>
        <div className="flex items-center text-black">
          <span className="font-bold mr-2">水源供應</span>
          <PreviewResult
            checked={data?.land_q1_water !== "否" && !!data?.land_q1_water}
            label={getLandWaterSummary()}
            forceSafe={true}
          />
          <PreviewResult checked={data?.land_q1_water === "否"} label="無" />
        </div>
      </CheckRow>
      <CheckRow checked={data?.land_q1_gas === "完全無設置"}>
        <div className="flex items-center text-black">
          <span className="font-bold mr-2">瓦斯供應現況</span>
          <PreviewResult checked={!!data?.land_q1_gas} label={data?.land_q1_gas || ""} />
        </div>
      </CheckRow>
      {/* Solar for Factory */}
      {showSolar && (
        <CheckRow
          checked={
            data?.house_solar_status === "無設置" ||
            data?.house_solar_status === "無"
          }
        >
          <div className="flex items-center text-black">
            <span className="font-bold mr-2">太陽能光電發電設備</span>
            <PreviewResult
              checked={data?.house_solar_status === "合法設置"}
              label="合法設置"
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
              label="無"
            />
          </div>
        </CheckRow>
      )}
      {/* Conditional Render for Water Booster */}
      {data?.water_booster && (
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
              label={`其他 （${data.water_booster_desc}）`}
            />
            <PreviewResult
              checked={
                data?.water_booster === "無" || data?.water_booster === "無設置"
              }
              label="無"
            />
          </div>
        </CheckRow>
      )}
      <CheckRow checked={data?.land_q1_other_new === "否"}>
        <div className="flex items-center text-black">
          <span className="font-bold mr-2">其他設施</span>
          <PreviewResult
            checked={data?.land_q1_other_new === "是"}
            label={data.land_q1_other_desc}
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
      <CheckRow checked={data.factory_loading_dock === "無"}>
        <span className="font-bold mr-2">卸貨碼頭</span>
        {data.factory_loading_dock || ""}
      </CheckRow>
      <CheckRow checked={false}>
        <span className="font-bold mr-2">大車進出</span>
        {data.factory_truck_access || ""}
      </CheckRow>
      <CheckRow checked={false}>
        <span className="font-bold mr-2">迴轉空間／緩衝區</span>
        {data.factory_truck_buffer || ""}
      </CheckRow>

      <SectionHeader title="9. 車位資訊" />
      <CheckRow checked={!!data?.q10_noParking}>
        <ParkingContent
          data={data}
          parkingSummary={parkingSummary}
          activeMode={activeMode}
          isFactory={true}
        />
      </CheckRow>
    </>
  );
};

// NEW: Page 3 for ALL factory types now
export const FactoryPrintPage3 = ({ data }: { data: SurveyData }) => {
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
      <SectionHeader title={`${idx}. 本案或周圍須注意設施`} />
      <CheckRow checked={data?.q9_hasIssue === "否"}>
        <span className="font-bold mr-2">須注意設施</span>
        <PreviewResult
          checked={data?.q9_hasIssue === "是"}
          label={labels.q9()}
          isWarning={true}
        />
        <PreviewResult
          checked={!!(data?.q9_hasOther && data.q9_otherDesc)}
          label={data?.q9_otherDesc || ""}
          isWarning={true}
        />
      </CheckRow>

      <SectionHeader title={`${++idx}. 廠房進出通行與臨路現況`} />
      <CheckRow checked={data.land_q2_access?.includes("順暢")}>
        {(() => {
          const acc = data.land_q2_access;
          if (acc?.includes("順暢")) {
            const mat =
              data.land_q2_material === "其他" ||
              data.land_q2_material === "其他未列項目"
                ? data.land_q2_material_other
                : data.land_q2_material;
            const ditch =
              data.land_q2_ditch === "其他" ||
              data.land_q2_ditch === "其他未列項目"
                ? data.land_q2_ditch_other
                : data.land_q2_ditch;
            const ditchStr =
              ditch === "有" ? "有水溝" : ditch === "無" ? "無水溝" : ditch;
            const roadWidth = data.land_q2_roadWidth
              ? `路寬：${data.land_q2_roadWidth}米`
              : "";
            const buildingLineVal = data.land_q2_buildingLine === '其他未列項目' ? (data.land_q2_buildingLine_other || '') : data.land_q2_buildingLine;
            const buildingLine = data.land_q2_buildingLine
              ? `建築線：${buildingLineVal}`
              : "";

            return (
              <div>
                通行順暢
                {data.land_q2_owner
                  ? ` （${data.land_q2_owner}${data.land_q2_protection ? "／" + data.land_q2_protection : ""}）`
                  : ""}
                {mat ? ` [${mat}／` : (ditchStr ? " [-／" : "")}
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
                {formatAccessLandAddress(
                  data.land_q2_access_section,
                  data.land_q2_access_subSection,
                  data.land_q2_access_number,
                )}
              </div>
            );
          } else {
            return (
              <div>
                {acc || ""}
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
              label={`有 （${data.soil_q1_desc}）`}
            />
            <PreviewResult checked={data?.soil_q1_status === "無"} label="無" />
            <PreviewResult
              checked={
                data?.soil_q1_status === "不確定" ||
                data?.soil_q1_status === "待查證"
              }
              label={`待查證${data?.soil_q1_desc ? ` （${data.soil_q1_desc}）` : ""}`}
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

