import { SurveyData } from "../../types";
import {
  PreviewResult,
  CheckRow,
  SectionHeader,
  TableHeaderRow,
  LandDisputeExproPreview,
  LandAccessPreviewBuildingStyle,
} from "./PreviewShared";
import { CommonExtraQuestions } from "./PreviewCommonBlocks";

export const LandPrintPage1 = ({ data }: { data: SurveyData }) => {
  const getLandElecSummary = () => {
    if (
      data?.land_q1_elec === "是" ||
      data?.land_q1_elec?.includes("一般用電") ||
      data?.land_q1_elec?.includes("動力用電")
    ) {
      if (data?.land_q1_elec?.includes("用電")) return data.land_q1_elec;
      return `是 （${data.land_q1_elec_detail}${data.land_q1_elec_detail === "其他未列項目" ? " - " + data.land_q1_elec_detail_other : ""}）`;
    }
    if (data?.land_q1_elec === "其他" || data?.land_q1_elec === "其他未列項目")
      return `其他：${data.land_q1_elec_other}`;
    return data?.land_q1_elec || "";
  };
  const getLandWaterSummary = () => {
    if (
      data?.land_q1_water === "否" ||
      !data?.land_q1_water ||
      data?.land_q1_water === "無"
    )
      return data?.land_q1_water || "";
    if (
      data?.land_q1_water === "其他" ||
      data?.land_q1_water === "其他未列項目"
    )
      return `其他：${data.land_q1_water_other}`;
    if (data?.land_q1_water === "是" && Array.isArray(data.land_q1_water_cat)) {
      let catStrs = data.land_q1_water_cat.map((cat) => {
        let suffix = "";
        if (cat === "自來水")
          suffix = ` - ${data.land_q1_water_tap_detail}${data.land_q1_water_tap_detail === "其他未列項目" ? " - " + data.land_q1_water_tap_other : ""}`;
        else if (cat === "地下水")
          suffix = ` - ${data.land_q1_water_ground_detail}`;
        else if (cat === "水利溝渠")
          suffix = ` - ${data.land_q1_water_irr_detail}`;
        return `${cat}${suffix}`;
      });
      return `是 （${catStrs.join("、")}）`;
    }
    return "";
  };

  return (
    <>
      <TableHeaderRow />
      <SectionHeader title="1. 電、水與其他設施使用現況" />
      <CheckRow
        checked={
          data?.land_q1_elec === "否" ||
          data?.land_q1_elec?.startsWith("無電力")
        }
      >
        <span className="font-bold mr-2">電力供應現況</span>
        <PreviewResult
          checked={
            data?.land_q1_elec !== "否" &&
            !data?.land_q1_elec?.startsWith("無電力") &&
            !!data?.land_q1_elec
          }
          label={getLandElecSummary()}
          forceSafe={true}
        />
      </CheckRow>
      <CheckRow
        checked={data?.land_q1_water === "否" || data?.land_q1_water === "無"}
      >
        <span className="font-bold mr-2">水源供應現況</span>
        <PreviewResult
          checked={
            data?.land_q1_water !== "否" &&
            data?.land_q1_water !== "無" &&
            !!data?.land_q1_water
          }
          label={getLandWaterSummary()}
          forceSafe={!getLandWaterSummary().includes("私設水井")}
        />
      </CheckRow>
      <CheckRow checked={data?.land_q1_other_new === "否"}>
        <span className="font-bold mr-2">其他設施</span>
        <PreviewResult
          checked={data?.land_q1_other_new === "是"}
          label={data.land_q1_other_desc}
        />
      </CheckRow>

      <LandDisputeExproPreview
        data={data}
        titles={{
          q3: "2. 土地鑑界與界標現況與產權與使用糾紛現況",
          q4: "3. 土地徵收預定地與重測區現況",
        }}
      />

      <SectionHeader title="4. 被越界占用與占用鄰地現況" />
      <CheckRow checked={data?.land_q5_encroached === "否"}>
        <span className="font-bold mr-2">本案遭他人越界占用</span>
        <PreviewResult
          checked={
            data?.land_q5_encroached !== "否" && !!data?.land_q5_encroached
          }
          label={
            data?.land_q5_encroached +
            (data.land_q5_encroached_desc
              ? `：${data.land_q5_encroached_desc}`
              : "")
          }
        />
      </CheckRow>
      <CheckRow checked={data?.land_q5_encroaching === "否"}>
        <span className="font-bold mr-2">本案占用鄰地現況</span>
        <PreviewResult
          checked={
            data?.land_q5_encroaching !== "否" && !!data?.land_q5_encroaching
          }
          label={
            data?.land_q5_encroaching +
            (data.land_q5_encroaching_desc
              ? `：${data.land_q5_encroaching_desc}`
              : "")
          }
        />
      </CheckRow>
    </>
  );
};

export const LandPrintPage2 = ({ data }: { data: SurveyData }) => {
  const getLandUserSummary = () => {
    if (!data?.land_q7_user) return "";
    if (data?.land_q7_user === "無") return "無";
    if (data?.land_q7_user === "所有權人自用") return "所有權人自用";
    if (data?.land_q7_user === "非所有權人使用") {
      let res = data.land_q7_user_detail;
      if (data.land_q7_user_desc) res += `：${data.land_q7_user_desc}`;
      return `非所有權人使用 （${res}）`;
    }
    return "";
  };
  const getLandCropsSummary = () => {
    if (!data?.land_q7_crops) return "";
    if (data?.land_q7_crops === "無") return "無";
    if (data?.land_q7_crops === "有農作物／植栽") {
      const types = Array.isArray(data.land_q7_crops_type)
        ? [...data.land_q7_crops_type]
        : [data.land_q7_crops_type].filter(Boolean);
      if (types.includes("其他未列項目") && data.land_q7_crops_other) {
        const idx = types.indexOf("其他未列項目");
        types[idx] = `其他未列項目：${data.land_q7_crops_other}`;
      }
      
      let formattedTypes = types.map(t => {
        if (t === "經濟作物") {
            const detail = data.land_q7_crops_econ_detail || data.land_q7_crops_detail;
            const other = data.land_q7_crops_econ_detail ? data.land_q7_crops_econ_detail_other : data.land_q7_crops_detail_other;
            if (detail) {
                return `經濟作物（處理：${detail}${detail === "其他未列項目" ? " - " + other : ""}）`;
            }
        }
        if (t === "景觀植栽") {
            const detail = data.land_q7_crops_land_detail || data.land_q7_crops_detail;
            const other = data.land_q7_crops_land_detail ? data.land_q7_crops_land_detail_other : data.land_q7_crops_detail_other;
            if (detail) {
                return `景觀植栽（處理：${detail}${detail === "其他未列項目" ? " - " + other : ""}）`;
            }
        }
        return t;
      });

      return `有 （${formattedTypes.join("、")}）`;
    }
    return "";
  };
  const getLandBuildSummary = () => {
    if (!data?.land_q7_build) return "";
    if (data?.land_q7_build === "無") return "無";
    if (data?.land_q7_build === "有建築物／工作物") {
      if (!Array.isArray(data.land_q7_build_type)) return "有";
      const parts = data.land_q7_build_type.map(type => {
        if (type === '有保存登記') {
            let status = data.land_q7_build_reg_ownership;
            if (status === "其他未列項目" || status === "其他") {
               status += `：${data.land_q7_build_reg_detail}`;
            }
            return status ? `有保存登記（${status}）` : '有保存登記';
        }
        if (type === '未保存登記') {
            let status = data.land_q7_build_unreg_ownership;
            if (status === "其他未列項目" || status === "其他") {
               status += `：${data.land_q7_build_unreg_detail}`;
            }
            return status ? `未保存登記（${status}）` : '未保存登記';
        }
        if (type === '其他未列項目' && data.land_q7_build_other) {
            return `其他（${data.land_q7_build_other}）`;
        }
        return type;
      });
      return `有 （${parts.join("、")}）`;
    }
    return "";
  };

  // Get Land Facilities Summary
  const getLandFacilitiesSummary = () => {
    const labels = [...(data?.land_q7_facilities_items || [])];
    if (data.land_q7_facilities_other)
      labels.push(`其他：${data.land_q7_facilities_other}`);
    return labels.filter((i) => i !== "其他未列項目").join("、");
  };

  return (
    <>
      <SectionHeader title="5. 土地禁建、限建現況" />
      <CheckRow checked={data?.land_q6_limit === "否" || data?.land_q6_limit === "無"}>
        <PreviewResult
          checked={data?.land_q6_limit === "是" || data?.land_q6_limit === "有"}
          label={`有 （${data.land_q6_limit_desc}）`}
        />
        <PreviewResult checked={data?.land_q6_limit === "否" || data?.land_q6_limit === "無"} label="無" />
      </CheckRow>

      <SectionHeader title="6. 土地使用現況與地上物" />
      <CheckRow checked={data?.land_q7_user === "無"}>
        <span className="font-bold mr-2">現況使用人</span>
        <PreviewResult
          checked={data?.land_q7_user !== "無" && !!data?.land_q7_user}
          label={getLandUserSummary()}
        />
      </CheckRow>
      <CheckRow checked={data?.land_q7_crops === "無"}>
        <span className="font-bold mr-2">地上定著物-農作物</span>
        <PreviewResult
          checked={data?.land_q7_crops !== "無" && !!data?.land_q7_crops}
          label={getLandCropsSummary()}
          forceSafe={true}
        />
      </CheckRow>
      <CheckRow checked={data?.land_q7_build === "無"}>
        <span className="font-bold mr-2">地上定著物-建築物／工作物</span>
        <PreviewResult
          checked={data?.land_q7_build !== "無" && !!data?.land_q7_build}
          label={getLandBuildSummary()}
          forceSafe={!getLandBuildSummary().includes("未保存登記")}
        />
      </CheckRow>
      <CheckRow checked={data?.land_q7_solar === "無"}>
        <span className="font-bold mr-2">太陽能光電發電設備</span>
        <PreviewResult
          checked={data?.land_q7_solar === "合法設置"}
          label="合法設置"
        />
        <PreviewResult
          checked={data?.land_q7_solar === "私人設置"}
          label="私人設置"
          isWarning={true}
        />
        <PreviewResult checked={data?.land_q7_solar === "無"} label="無" />
      </CheckRow>

      {/* Land Water Booster */}
      {data?.land_water_booster && (
        <CheckRow
          checked={
            data?.land_water_booster === "無" ||
            data?.land_water_booster === "無設置"
          }
        >
          <span className="font-bold mr-2">用戶加壓受水設備現況</span>
          <PreviewResult
            checked={
              data.land_water_booster === "有設置" ||
              data.land_water_booster === "有"
            }
            label={`有設置${data.land_water_booster_items && data.land_water_booster_items.length > 0 ? ` （${data.land_water_booster_items.join("、")}）` : ""}`}
            isWarning={true}
          />
          <PreviewResult
            checked={
              data?.land_water_booster === "無" ||
              data?.land_water_booster === "無設置"
            }
            label="無"
          />
        </CheckRow>
      )}

      {data?.propertyType === "工業地" && (
        <CheckRow checked={false}>
          <span className="font-bold mr-2">防火間隔與區劃現況</span>
          <PreviewResult
            checked={data?.land_q7_fire_setback === "是"}
            label="是"
          />
          <PreviewResult
            checked={data?.land_q7_fire_setback === "否"}
            label="否"
          />
        </CheckRow>
      )}

      {data?.propertyType === "其他未列項目" && (
        <CheckRow checked={false}>
          <span className="font-bold mr-2">計畫道路開闢現況</span>
          <PreviewResult
            checked={data?.land_q7_road_opened === "是"}
            label="是"
          />
          <PreviewResult
            checked={data?.land_q7_road_opened === "否"}
            label="否"
          />
        </CheckRow>
      )}

      {/* New Q7 Facilities Section for Land */}
      <SectionHeader title="7. 本案或周圍須注意設施" />
      <CheckRow checked={data?.land_q7_facilities === "否"}>
        <PreviewResult
          checked={data?.land_q7_facilities === "是"}
          label={getLandFacilitiesSummary()}
          isWarning={true}
        />
        <PreviewResult checked={data?.land_q7_facilities === "否"} label="無" />
      </CheckRow>

      <LandAccessPreviewBuildingStyle
        data={data}
        title="8. 進出通行與臨路現況"
      />

    </>
  );
};

export const LandPrintPage3 = ({ data }: { data: SurveyData }) => {
  return (
    <>
      <SectionHeader title="9. 土壤與地下埋設物現況" />
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

      <CommonExtraQuestions data={data} startIdx={10} type="land" />
    </>
  );
};

