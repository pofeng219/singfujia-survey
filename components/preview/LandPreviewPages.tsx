import { SurveyData } from "../../types";
import { useInterface } from "../InterfaceContext";
import {
  PreviewResult,
  CheckRow,
  SectionHeader,
  TableHeaderRow,
  LandDisputeExproPreview,
  LandDisputeBlock,
  LandExproBlock,
  LandAccessPreviewBuildingStyle,
  PreviewBlock,
} from "./PreviewShared";
import { CommonExtraQuestions, getCommonExtraBlocks } from "./PreviewCommonBlocks";

const LandEncroachmentSection = ({ data }: { data: SurveyData }) => (
  <>
    <SectionHeader title="4. 被越界占用與占用鄰地現況" />
    <CheckRow checked={data?.land_q5_encroached === "否"}>
      <span className="font-bold mr-2">本案遭他人越界占用</span>
      <PreviewResult checked={data?.land_q5_encroached === "否"} label="無" />
      <PreviewResult
        checked={
          data?.land_q5_encroached !== "否" && !!data?.land_q5_encroached
        }
        label={
          (data?.land_q5_encroached === "是" ? "有" : data?.land_q5_encroached) +
          (data.land_q5_encroached_desc
            ? `：${data.land_q5_encroached_desc}`
            : "")
        }
        isWarning={true}
      />
    </CheckRow>
    <CheckRow checked={data?.land_q5_encroaching === "否"}>
      <span className="font-bold mr-2">本案占用鄰地現況</span>
      <PreviewResult checked={data?.land_q5_encroaching === "否"} label="無" />
      <PreviewResult
        checked={
          data?.land_q5_encroaching !== "否" && !!data?.land_q5_encroaching
        }
        label={
          (data?.land_q5_encroaching === "是" ? "有" : data?.land_q5_encroaching) +
          (data.land_q5_encroaching_desc
            ? `：${data.land_q5_encroaching_desc}`
            : "")
        }
        isWarning={true}
      />
    </CheckRow>
  </>
);

export const LandPrintPage1 = ({ data }: { data: SurveyData }) => {
  const isStandard = useInterface() === "standard";
  const getLandElecSummary = () => {
    if (
      data?.land_q1_elec === "是" ||
      data?.land_q1_elec?.includes("一般用電") ||
      data?.land_q1_elec?.includes("動力用電")
    ) {
      if (data?.land_q1_elec?.includes("用電")) return data.land_q1_elec;
      if (!data.land_q1_elec_detail) return "有";
      return `有 （${data.land_q1_elec_detail}${data.land_q1_elec_detail === "其他未列項目" && data.land_q1_elec_detail_other ? " - " + data.land_q1_elec_detail_other : ""}）`;
    }
    if (data?.land_q1_elec === "其他" || data?.land_q1_elec === "其他未列項目")
      return data.land_q1_elec_other ? `其他未列項目：${data.land_q1_elec_other}` : "其他未列項目";
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
      return data.land_q1_water_other ? `其他未列項目：${data.land_q1_water_other}` : "其他未列項目";
    if (data?.land_q1_water === "是") {
      const cats = Array.isArray(data.land_q1_water_cat) ? data.land_q1_water_cat : [];
      if (cats.length === 0) return "有";
      const catStrs = cats.map((cat) => {
        let suffix = "";
        if (cat === "自來水" && data.land_q1_water_tap_detail)
          suffix = ` - ${data.land_q1_water_tap_detail}${data.land_q1_water_tap_detail === "其他未列項目" && data.land_q1_water_tap_other ? " - " + data.land_q1_water_tap_other : ""}`;
        else if (cat === "地下水" && data.land_q1_water_ground_detail)
          suffix = ` - ${data.land_q1_water_ground_detail}`;
        else if (cat === "水利溝渠" && data.land_q1_water_irr_detail)
          suffix = ` - ${data.land_q1_water_irr_detail}`;
        return `${cat}${suffix}`;
      });
      return `有 （${catStrs.join("、")}）`;
    }
    return "";
  };

  const isLandElecNormal =
    !!data?.land_q1_elec &&
    data.land_q1_elec !== "否" &&
    !data.land_q1_elec.startsWith("無電力") &&
    data.land_q1_elec !== "其他" &&
    data.land_q1_elec !== "其他未列項目" &&
    !data.land_q1_elec.includes("無法判斷");
  const landWaterSummary = getLandWaterSummary();
  const isLandWaterPrivateWell = landWaterSummary.includes("私設水井");
  const isLandWaterNormal =
    data?.land_q1_water === "是" && !isLandWaterPrivateWell;

  return (
    <>
      <TableHeaderRow />
      <SectionHeader title="1. 電、水與其他設施使用現況" />
      <CheckRow checked={isLandElecNormal}>
        <span className="font-bold mr-2">電力供應現況</span>
        <PreviewResult
          checked={
            data?.land_q1_elec !== "否" &&
            !data?.land_q1_elec?.startsWith("無電力") &&
            !!data?.land_q1_elec
          }
          label={getLandElecSummary()}
          isWarning={!isLandElecNormal}
          forceSafe={isLandElecNormal}
        />
        <PreviewResult
          checked={
            data?.land_q1_elec === "否" ||
            !!data?.land_q1_elec?.startsWith("無電力")
          }
          label={data?.land_q1_elec === "否" ? "無" : data?.land_q1_elec || ""}
          isWarning={true}
        />
      </CheckRow>
      <CheckRow checked={isLandWaterNormal}>
        <span className="font-bold mr-2">水源供應現況</span>
        <PreviewResult
          checked={
            data?.land_q1_water !== "否" &&
            data?.land_q1_water !== "無" &&
            !!data?.land_q1_water
          }
          label={landWaterSummary}
          isWarning={
            isLandWaterPrivateWell ||
            data?.land_q1_water === "其他" ||
            data?.land_q1_water === "其他未列項目"
          }
          forceSafe={isLandWaterNormal}
        />
        <PreviewResult
          checked={data?.land_q1_water === "否" || data?.land_q1_water === "無"}
          label="無"
          isWarning={true}
        />
      </CheckRow>
      <CheckRow checked={data?.land_q1_other_new === "否"}>
        <span className="font-bold mr-2">其他設施</span>
        <PreviewResult
          checked={data?.land_q1_other_new === "是"}
          label={data.land_q1_other_desc || "有"}
          isWarning={true}
        />
        <PreviewResult checked={data?.land_q1_other_new === "否"} label="無" />
      </CheckRow>

      <LandDisputeExproPreview
        data={data}
        titles={{
          q3: "2. 土地鑑界與界標現況與產權與使用糾紛現況",
          q4: "3. 土地徵收預定地與重測區現況",
        }}
      />

      {isStandard && <LandEncroachmentSection data={data} />}
    </>
  );
};

export const LandPrintPage2 = ({ data }: { data: SurveyData }) => {
  const isStandard = useInterface() === "standard";
  const getLandUserSummary = () => {
    if (!data?.land_q7_user) return "";
    if (data?.land_q7_user === "無") return "無";
    if (data?.land_q7_user === "所有權人自用") return "所有權人自用";
    if (data?.land_q7_user === "非所有權人使用") {
      let res = data.land_q7_user_detail || "";
      if (data.land_q7_user_desc)
        res += res ? `：${data.land_q7_user_desc}` : data.land_q7_user_desc;
      return res ? `非所有權人使用 （${res}）` : "非所有權人使用";
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
                return `經濟作物（處理：${detail}${detail === "其他未列項目" && other ? " - " + other : ""}）`;
            }
        }
        if (t === "景觀植栽") {
            const detail = data.land_q7_crops_land_detail || data.land_q7_crops_detail;
            const other = data.land_q7_crops_land_detail ? data.land_q7_crops_land_detail_other : data.land_q7_crops_detail_other;
            if (detail) {
                return `景觀植栽（處理：${detail}${detail === "其他未列項目" && other ? " - " + other : ""}）`;
            }
        }
        return t;
      });

      return formattedTypes.length > 0 ? `有農作物／植栽 （${formattedTypes.join("、")}）` : "有農作物／植栽";
    }
    return "";
  };
  const getLandBuildSummary = () => {
    if (!data?.land_q7_build) return "";
    if (data?.land_q7_build === "無") return "無";
    if (data?.land_q7_build === "有建築物／工作物") {
      if (!Array.isArray(data.land_q7_build_type)) return "有建築物／工作物";
      const parts = data.land_q7_build_type.map(type => {
        if (type === '有保存登記') {
            let status = data.land_q7_build_reg_ownership;
            if ((status === "其他未列項目" || status === "其他") && data.land_q7_build_reg_detail) {
               status += `：${data.land_q7_build_reg_detail}`;
            }
            return status ? `有保存登記（${status}）` : '有保存登記';
        }
        if (type === '未保存登記') {
            let status = data.land_q7_build_unreg_ownership;
            if ((status === "其他未列項目" || status === "其他") && data.land_q7_build_unreg_detail) {
               status += `：${data.land_q7_build_unreg_detail}`;
            }
            return status ? `未保存登記（${status}）` : '未保存登記';
        }
        if (type === '其他未列項目' && data.land_q7_build_other) {
            return `其他未列項目（${data.land_q7_build_other}）`;
        }
        return type;
      });
      return parts.length > 0 ? `有建築物／工作物 （${parts.join("、")}）` : "有建築物／工作物";
    }
    return "";
  };

  // Get Land Facilities Summary
  const getLandFacilitiesSummary = () => {
    const labels = (data?.land_q7_facilities_items || []).map((item) =>
      item === "其他未列項目"
        ? data.land_q7_facilities_other
          ? `其他未列項目：${data.land_q7_facilities_other}`
          : "其他未列項目"
        : item,
    );
    return labels.join("、");
  };

  const landBuildSummary = getLandBuildSummary();
  const hasLandBuildWarning =
    landBuildSummary.includes("未保存登記") ||
    (Array.isArray(data?.land_q7_build_type) &&
      data.land_q7_build_type.includes("其他未列項目"));

  return (
    <>
      {!isStandard && <LandEncroachmentSection data={data} />}
      <SectionHeader title="5. 土地禁建、限建現況" />
      <CheckRow checked={data?.land_q6_limit === "否" || data?.land_q6_limit === "無"}>
        <PreviewResult
          checked={data?.land_q6_limit === "是" || data?.land_q6_limit === "有"}
          label={data.land_q6_limit_desc ? `有 （${data.land_q6_limit_desc}）` : "有"}
          isWarning={true}
        />
        <PreviewResult checked={data?.land_q6_limit === "否" || data?.land_q6_limit === "無"} label="無" />
      </CheckRow>

      <SectionHeader title="6. 土地使用現況與地上物" />
      <CheckRow
        checked={
          data?.land_q7_user === "無" || data?.land_q7_user === "所有權人自用"
        }
      >
        <span className="font-bold mr-2">現況使用人</span>
        <PreviewResult checked={data?.land_q7_user === "無"} label="無" />
        <PreviewResult
          checked={data?.land_q7_user !== "無" && !!data?.land_q7_user}
          label={getLandUserSummary()}
          isWarning={data?.land_q7_user === "非所有權人使用"}
          forceSafe={data?.land_q7_user === "所有權人自用"}
        />
      </CheckRow>
      <CheckRow checked={data?.land_q7_crops === "無"}>
        <span className="font-bold mr-2">地上定著物-農作物</span>
        <PreviewResult checked={data?.land_q7_crops === "無"} label="無" />
        <PreviewResult
          checked={data?.land_q7_crops !== "無" && !!data?.land_q7_crops}
          label={getLandCropsSummary()}
          forceSafe={true}
        />
      </CheckRow>
      <CheckRow checked={data?.land_q7_build === "無"}>
        <span className="font-bold mr-2">地上定著物-建築物／工作物</span>
        <PreviewResult checked={data?.land_q7_build === "無"} label="無" />
        <PreviewResult
          checked={data?.land_q7_build !== "無" && !!data?.land_q7_build}
          label={landBuildSummary}
          isWarning={hasLandBuildWarning}
          forceSafe={!hasLandBuildWarning}
        />
      </CheckRow>
      <CheckRow
        checked={
          data?.land_q7_solar === "無" || data?.land_q7_solar === "合法設置"
        }
      >
        <span className="font-bold mr-2">太陽能光電發電設備</span>
        <PreviewResult
          checked={data?.land_q7_solar === "合法設置"}
          label="合法設置"
          forceSafe={true}
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
            label="無設置"
          />
        </CheckRow>
      )}

      {data?.propertyType === "工業地" && (
        <CheckRow checked={data?.land_q7_fire_setback === "是"}>
          <span className="font-bold mr-2">防火間隔與區劃現況</span>
          <PreviewResult
            checked={data?.land_q7_fire_setback === "是"}
            label="有"
            forceSafe={true}
          />
          <PreviewResult
            checked={data?.land_q7_fire_setback === "否"}
            label="無"
            isWarning={true}
          />
        </CheckRow>
      )}

      {data?.propertyType === "其他未列項目" && (
        <CheckRow checked={data?.land_q7_road_opened === "是"}>
          <span className="font-bold mr-2">計畫道路開闢現況</span>
          <PreviewResult
            checked={data?.land_q7_road_opened === "是"}
            label="有"
            forceSafe={true}
          />
          <PreviewResult
            checked={data?.land_q7_road_opened === "否"}
            label="無"
            isWarning={true}
          />
        </CheckRow>
      )}

      {/* New Q7 Facilities Section for Land */}
      <SectionHeader title="7. 本案或周圍須注意設施" />
      <CheckRow checked={data?.land_q7_facilities === "否"}>
        <PreviewResult
          checked={data?.land_q7_facilities === "是"}
          label={getLandFacilitiesSummary() || "有"}
          isWarning={true}
        />
        <PreviewResult checked={data?.land_q7_facilities === "否"} label="無" />
      </CheckRow>

      {isStandard && (
        <LandAccessPreviewBuildingStyle
          data={data}
          title="8. 進出通行與臨路現況"
        />
      )}

    </>
  );
};

export const LandPrintPage3 = ({ data }: { data: SurveyData }) => {
  const isStandard = useInterface() === "standard";
  return (
    <>
      {!isStandard && (
        <LandAccessPreviewBuildingStyle
          data={data}
          title="8. 進出通行與臨路現況"
        />
      )}
      <SectionHeader title="9. 土壤與地下埋設物現況" />
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

      <CommonExtraQuestions data={data} startIdx={10} type="land" />
    </>
  );
};

export const getLandPreviewBlocks = (data: SurveyData): PreviewBlock[] => {
  const getLandElecSummary = () => {
    if (
      data?.land_q1_elec === "是" ||
      data?.land_q1_elec?.includes("一般用電") ||
      data?.land_q1_elec?.includes("動力用電")
    ) {
      if (data?.land_q1_elec?.includes("用電")) return data.land_q1_elec;
      if (!data.land_q1_elec_detail) return "有";
      return `有 （${data.land_q1_elec_detail}${data.land_q1_elec_detail === "其他未列項目" && data.land_q1_elec_detail_other ? " - " + data.land_q1_elec_detail_other : ""}）`;
    }
    if (data?.land_q1_elec === "其他" || data?.land_q1_elec === "其他未列項目")
      return data.land_q1_elec_other ? `其他未列項目：${data.land_q1_elec_other}` : "其他未列項目";
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
      return data.land_q1_water_other ? `其他未列項目：${data.land_q1_water_other}` : "其他未列項目";
    if (data?.land_q1_water === "是") {
      const cats = Array.isArray(data.land_q1_water_cat) ? data.land_q1_water_cat : [];
      if (cats.length === 0) return "有";
      const catStrs = cats.map((cat) => {
        let suffix = "";
        if (cat === "自來水" && data.land_q1_water_tap_detail)
          suffix = ` - ${data.land_q1_water_tap_detail}${data.land_q1_water_tap_detail === "其他未列項目" && data.land_q1_water_tap_other ? " - " + data.land_q1_water_tap_other : ""}`;
        else if (cat === "地下水" && data.land_q1_water_ground_detail)
          suffix = ` - ${data.land_q1_water_ground_detail}`;
        else if (cat === "水利溝渠" && data.land_q1_water_irr_detail)
          suffix = ` - ${data.land_q1_water_irr_detail}`;
        return `${cat}${suffix}`;
      });
      return `有 （${catStrs.join("、")}）`;
    }
    return "";
  };
  const getLandUserSummary = () => {
    if (!data?.land_q7_user) return "";
    if (data?.land_q7_user === "無") return "無";
    if (data?.land_q7_user === "所有權人自用") return "所有權人自用";
    if (data?.land_q7_user === "非所有權人使用") {
      let res = data.land_q7_user_detail || "";
      if (data.land_q7_user_desc)
        res += res ? `：${data.land_q7_user_desc}` : data.land_q7_user_desc;
      return res ? `非所有權人使用 （${res}）` : "非所有權人使用";
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
      const formattedTypes = types.map((t) => {
        if (t === "經濟作物") {
          const detail = data.land_q7_crops_econ_detail || data.land_q7_crops_detail;
          const other = data.land_q7_crops_econ_detail
            ? data.land_q7_crops_econ_detail_other
            : data.land_q7_crops_detail_other;
          if (detail) {
            return `經濟作物（處理：${detail}${detail === "其他未列項目" && other ? " - " + other : ""}）`;
          }
        }
        if (t === "景觀植栽") {
          const detail = data.land_q7_crops_land_detail || data.land_q7_crops_detail;
          const other = data.land_q7_crops_land_detail
            ? data.land_q7_crops_land_detail_other
            : data.land_q7_crops_detail_other;
          if (detail) {
            return `景觀植栽（處理：${detail}${detail === "其他未列項目" && other ? " - " + other : ""}）`;
          }
        }
        return t;
      });
      return formattedTypes.length > 0 ? `有農作物／植栽 （${formattedTypes.join("、")}）` : "有農作物／植栽";
    }
    return "";
  };
  const getLandBuildSummary = () => {
    if (!data?.land_q7_build) return "";
    if (data?.land_q7_build === "無") return "無";
    if (data?.land_q7_build === "有建築物／工作物") {
      if (!Array.isArray(data.land_q7_build_type)) return "有建築物／工作物";
      const parts = data.land_q7_build_type.map((type) => {
        if (type === "有保存登記") {
          let status = data.land_q7_build_reg_ownership;
          if ((status === "其他未列項目" || status === "其他") && data.land_q7_build_reg_detail) {
            status += `：${data.land_q7_build_reg_detail}`;
          }
          return status ? `有保存登記（${status}）` : "有保存登記";
        }
        if (type === "未保存登記") {
          let status = data.land_q7_build_unreg_ownership;
          if ((status === "其他未列項目" || status === "其他") && data.land_q7_build_unreg_detail) {
            status += `：${data.land_q7_build_unreg_detail}`;
          }
          return status ? `未保存登記（${status}）` : "未保存登記";
        }
        if (type === "其他未列項目" && data.land_q7_build_other) {
          return `其他未列項目（${data.land_q7_build_other}）`;
        }
        return type;
      });
      return parts.length > 0 ? `有建築物／工作物 （${parts.join("、")}）` : "有建築物／工作物";
    }
    return "";
  };
  const getLandFacilitiesSummary = () => {
    const labels = (data?.land_q7_facilities_items || []).map((item) =>
      item === "其他未列項目"
        ? data.land_q7_facilities_other
          ? `其他未列項目：${data.land_q7_facilities_other}`
          : "其他未列項目"
        : item,
    );
    return labels.join("、");
  };

  const isLandElecNormal =
    !!data?.land_q1_elec &&
    data.land_q1_elec !== "否" &&
    !data.land_q1_elec.startsWith("無電力") &&
    data.land_q1_elec !== "其他" &&
    data.land_q1_elec !== "其他未列項目" &&
    !data.land_q1_elec.includes("無法判斷");
  const landWaterSummary = getLandWaterSummary();
  const isLandWaterPrivateWell = landWaterSummary.includes("私設水井");
  const isLandWaterNormal =
    data?.land_q1_water === "是" && !isLandWaterPrivateWell;
  const landBuildSummary = getLandBuildSummary();
  const hasLandBuildWarning =
    landBuildSummary.includes("未保存登記") ||
    (Array.isArray(data?.land_q7_build_type) &&
      data.land_q7_build_type.includes("其他未列項目"));

  return [
    {
      id: "land-q1",
      node: (
        <>
          <SectionHeader title="1. 電、水與其他設施使用現況" />
          <CheckRow checked={isLandElecNormal}>
            <span className="font-bold mr-2">電力供應現況</span>
            <PreviewResult
              checked={
                data?.land_q1_elec !== "否" &&
                !data?.land_q1_elec?.startsWith("無電力") &&
                !!data?.land_q1_elec
              }
              label={getLandElecSummary()}
              isWarning={!isLandElecNormal}
              forceSafe={isLandElecNormal}
            />
            <PreviewResult
              checked={
                data?.land_q1_elec === "否" ||
                !!data?.land_q1_elec?.startsWith("無電力")
              }
              label={
                data?.land_q1_elec === "否" ? "無" : data?.land_q1_elec || ""
              }
              isWarning={true}
            />
          </CheckRow>
          <CheckRow checked={isLandWaterNormal}>
            <span className="font-bold mr-2">水源供應現況</span>
            <PreviewResult
              checked={
                data?.land_q1_water !== "否" &&
                data?.land_q1_water !== "無" &&
                !!data?.land_q1_water
              }
              label={landWaterSummary}
              isWarning={
                isLandWaterPrivateWell ||
                data?.land_q1_water === "其他" ||
                data?.land_q1_water === "其他未列項目"
              }
              forceSafe={isLandWaterNormal}
            />
            <PreviewResult
              checked={
                data?.land_q1_water === "否" || data?.land_q1_water === "無"
              }
              label="無"
              isWarning={true}
            />
          </CheckRow>
          <CheckRow checked={data?.land_q1_other_new === "否"}>
            <span className="font-bold mr-2">其他設施</span>
            <PreviewResult
              checked={data?.land_q1_other_new === "是"}
              label={data.land_q1_other_desc || "有"}
              isWarning={true}
            />
            <PreviewResult checked={data?.land_q1_other_new === "否"} label="無" />
          </CheckRow>
        </>
      ),
    },
    {
      id: "land-q2",
      node: (
        <LandDisputeBlock
          data={data}
          title="2. 土地鑑界與界標現況與產權與使用糾紛現況"
        />
      ),
    },
    {
      id: "land-q3",
      node: <LandExproBlock data={data} title="3. 土地徵收預定地與重測區現況" />,
    },
    {
      id: "land-q4",
      node: <LandEncroachmentSection data={data} />,
    },
    {
      id: "land-q5",
      node: (
        <>
          <SectionHeader title="5. 土地禁建、限建現況" />
          <CheckRow
            checked={data?.land_q6_limit === "否" || data?.land_q6_limit === "無"}
          >
            <PreviewResult
              checked={data?.land_q6_limit === "是" || data?.land_q6_limit === "有"}
              label={data.land_q6_limit_desc ? `有 （${data.land_q6_limit_desc}）` : "有"}
              isWarning={true}
            />
            <PreviewResult
              checked={data?.land_q6_limit === "否" || data?.land_q6_limit === "無"}
              label="無"
            />
          </CheckRow>
        </>
      ),
    },
    {
      id: "land-q6",
      node: (
        <>
          <SectionHeader title="6. 土地使用現況與地上物" />
          <CheckRow
            checked={
              data?.land_q7_user === "無" ||
              data?.land_q7_user === "所有權人自用"
            }
          >
            <span className="font-bold mr-2">現況使用人</span>
            <PreviewResult checked={data?.land_q7_user === "無"} label="無" />
            <PreviewResult
              checked={data?.land_q7_user !== "無" && !!data?.land_q7_user}
              label={getLandUserSummary()}
              isWarning={data?.land_q7_user === "非所有權人使用"}
              forceSafe={data?.land_q7_user === "所有權人自用"}
            />
          </CheckRow>
          <CheckRow checked={data?.land_q7_crops === "無"}>
            <span className="font-bold mr-2">地上定著物-農作物</span>
            <PreviewResult checked={data?.land_q7_crops === "無"} label="無" />
            <PreviewResult
              checked={data?.land_q7_crops !== "無" && !!data?.land_q7_crops}
              label={getLandCropsSummary()}
              forceSafe={true}
            />
          </CheckRow>
          <CheckRow checked={data?.land_q7_build === "無"}>
            <span className="font-bold mr-2">地上定著物-建築物／工作物</span>
            <PreviewResult checked={data?.land_q7_build === "無"} label="無" />
            <PreviewResult
              checked={data?.land_q7_build !== "無" && !!data?.land_q7_build}
              label={landBuildSummary}
              isWarning={hasLandBuildWarning}
              forceSafe={!hasLandBuildWarning}
            />
          </CheckRow>
          <CheckRow
            checked={
              data?.land_q7_solar === "無" || data?.land_q7_solar === "合法設置"
            }
          >
            <span className="font-bold mr-2">太陽能光電發電設備</span>
            <PreviewResult
              checked={data?.land_q7_solar === "合法設置"}
              label="合法設置"
              forceSafe={true}
            />
            <PreviewResult
              checked={data?.land_q7_solar === "私人設置"}
              label="私人設置"
              isWarning={true}
            />
            <PreviewResult checked={data?.land_q7_solar === "無"} label="無" />
          </CheckRow>
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
                label="無設置"
              />
            </CheckRow>
          )}
          {data?.propertyType === "工業地" && (
            <CheckRow checked={data?.land_q7_fire_setback === "是"}>
              <span className="font-bold mr-2">防火間隔與區劃現況</span>
              <PreviewResult
                checked={data?.land_q7_fire_setback === "是"}
                label="有"
                forceSafe={true}
              />
              <PreviewResult
                checked={data?.land_q7_fire_setback === "否"}
                label="無"
                isWarning={true}
              />
            </CheckRow>
          )}
          {data?.propertyType === "其他未列項目" && (
            <CheckRow checked={data?.land_q7_road_opened === "是"}>
              <span className="font-bold mr-2">計畫道路開闢現況</span>
              <PreviewResult
                checked={data?.land_q7_road_opened === "是"}
                label="有"
                forceSafe={true}
              />
              <PreviewResult
                checked={data?.land_q7_road_opened === "否"}
                label="無"
                isWarning={true}
              />
            </CheckRow>
          )}
        </>
      ),
    },
    {
      id: "land-q7",
      node: (
        <>
          <SectionHeader title="7. 本案或周圍須注意設施" />
          <CheckRow checked={data?.land_q7_facilities === "否"}>
            <PreviewResult
              checked={data?.land_q7_facilities === "是"}
              label={getLandFacilitiesSummary() || "有"}
              isWarning={true}
            />
            <PreviewResult checked={data?.land_q7_facilities === "否"} label="無" />
          </CheckRow>
        </>
      ),
    },
    {
      id: "land-q8",
      node: (
        <LandAccessPreviewBuildingStyle
          data={data}
          title="8. 進出通行與臨路現況"
        />
      ),
    },
    {
      id: "land-q9",
      node: (
        <>
          <SectionHeader title="9. 土壤與地下埋設物現況" />
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
    },
    ...getCommonExtraBlocks(data, 10, "land"),
  ];
};

