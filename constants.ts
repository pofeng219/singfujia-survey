import { SurveyData, EnvCategory } from "./types";

const getCurrentDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const INITIAL_STATE: SurveyData = {
    caseName: '', authNumber: '', storeName: '', agentName: '', address: '', 
    fillDate: getCurrentDate(), version: '1150101版',
    access: '', accessType: [], accessOther: '', 
    q1_hasExt: '', q1_items: [], q1_basementPartition: false, q1_hasOther: false, q1_other: '',         
    q2_hasOccupancy: '', q2_desc: '', 
    q3_hasLeak: '', q3_locations: [], q3_hasOther: false, q3_other: '', q3_ceilingWrapped: false, q3_suspected: false, q3_suspectedDesc: '',
    q4_hasIssue: '', q4_items: [], q4_hasOther: false, q4_otherDesc: '', q4_suspected: false, q4_suspectedDesc: '', q4_ceilingWrapped: false,
    q5_hasTilt: '', q5_desc: '', q5_suspectedDesc: '',
    q6_hasIssue: '', q6_desc: '',
    q7_hasIssue: '', q7_items: [], q7_hasOther: false, q7_otherDesc: '',
    q8_stairIssue: '', q8_stairDesc: '',
    q9_hasIssue: '', q9_items: [], q9_hasOther: false, q9_otherDesc: '',
    publicFacilities: '', publicFacilitiesReason: '',
    q10_noParking: false, q10_parkTypes: [], q10_rampMechLoc: '', q10_liftMechLoc: '', q10_hasParkTypeOther: false, q10_parkTypeOther: '',
    q10_parkingNumberType: '', q10_parkingNumberVal: '',
    q10_carUsage: [], q10_carLotteryMonth: '', q10_hasCarUsageOther: false, q10_carUsageOther: '',
    q10_motoUsage: [], q10_hasMotoUsageOther: false, q10_motoUsageOther: '',
    q10_dimL: '', q10_dimW: '', q10_dimH: '', q10_mechWeight: '', q10_entryHeight: '',
    q10_charging: '', q10_chargingOther: '',
    q11_hasIssue: '', q11_items: [], q11_hasOther: false, q11_other: '',
    q12_hasNote: '', q12_note: '',
    isNotFirstFloor: false, q13_occupancy: '', q13_desc: '',
    q14_access: '', q14_section: '', q14_subSection: '', q14_number: '',
    q15_occupy: '', q15_section: '', q15_subSection: '', q15_number: '',
    q16_noFacilities: false, q16_items: [], q16_hasOther: false, q16_other: '',
    q17_issue: '', q17_desc: '',
    land_road_smooth: '', land_road_desc: '',
    land_road_ownership: '', land_road_material: '', land_road_material_other: '',
    land_has_ditch: '', land_has_ditch_other: '',
    land_has_height_diff: '', land_has_height_diff_other: '',
    land_boundary_encroached: '', land_boundary_encroached_desc: '',
    land_boundary_encroaching: '', land_boundary_encroaching_desc: '',
    land_q1_hasBuilding: '', land_q1_items: [], land_q1_unregistered_hasOccupant: false,
    land_q1_religious_details: [], land_q1_harvestMonth: '', land_q1_cropsDesc: '', 
    land_q1_hasOther: false, land_q1_other: '',
    land_infra_electricity: '', land_infra_electricity_items: [], land_infra_electricity_other: '',
    land_infra_water: '', land_infra_water_items: [], land_infra_water_other: '',
    land_infra_other_status: '', land_infra_other_facility_desc: '', 
    land_q7_issue: '', land_q7_desc: '',

    land_q1_elec: '', land_q1_elec_detail: '', land_q1_elec_other: '',
    land_q1_water: '', land_q1_water_cat: '', land_q1_water_tap_detail: '', land_q1_water_ground_detail: '', land_q1_water_irr_detail: '', land_q1_water_other: '',
    land_q1_other_new: '', land_q1_other_desc: '',
    land_q2_access: '', land_q2_access_desc: '', land_q2_owner: '', land_q2_owner_desc: '',
    land_q2_material: '', land_q2_material_other: '', land_q2_ditch: '', land_q2_ditch_other: '',
    land_q3_survey: '', land_q3_survey_detail: '', land_q3_survey_other: '',
    land_q3_dispute: '', land_q3_dispute_desc: '', land_q3_dispute_other: '',
    land_q4_expro: '', land_q4_expro_other: '', land_q4_resurvey: '', land_q4_resurvey_other: '',
    land_q5_encroached: '', land_q5_encroached_desc: '', land_q5_encroaching: '', land_q5_encroaching_desc: '',
    land_q6_limit: '', land_q6_limit_desc: '',
    land_q7_user: '', land_q7_user_detail: '', land_q7_user_desc: '',
    land_q7_crops: '', land_q7_crops_month: '', land_q7_crops_type: '', land_q7_crops_detail: '', land_q7_crops_other: '',
    land_q7_build: '', land_q7_build_type: '', land_q7_build_ownership: '', land_q7_build_reg_detail: '', land_q7_build_unreg_detail: '', land_q7_build_rel_detail: '', land_q7_build_other: '',
    land_q8_special: '', land_q8_special_desc: '',
};

export const EXT_LIST = ["頂樓增建", "露台增建", "夾層增建", "防火巷增建", "陽台增建", "天井增建", "一樓空地增建", "地下室增建", "陽台外推", "平台外推", "上下樓層內梯"];
export const LEAK_LOCATIONS = ["屋頂", "外牆", "窗框", "冷熱水器", "浴室", "前陽台", "後陽台", "廚房", "臥室", "客廳"];
export const STRUCTURAL_ISSUES = ["水泥塊剝落", "鋼筋外露", "窗框45度角裂縫", "樑柱/牆壁有明顯環狀龜裂"];
export const UTILITY_ISSUES = ["無水錶", "無電錶", "無瓦斯掛錶", "無瓦斯管線", "使用桶裝瓦斯"];
export const FACILITY_OPTIONS = ["變電箱/桶", "基地台", "中繼水箱"];
export const ACCESS_SUB_OPTIONS = ["出租中", "屋主自住", "空屋須請屋主開門", "尚未搬空", "其他"];
export const ACCESS_SUB_OPTIONS_LAND = [
    "有他人建物阻擋出入", 
    "現況被圍籬、圍牆等圍起", 
    "需與地主聯繫才能入內", 
    "雜草叢生", 
    "地形陡峭", 
    "其他"
];
export const ACCESS_SUB_OPTIONS_PARKING = ["塔式車位", "其他"];
export const PARK_TYPES = ["坡道平面", "坡道機械", "升降平面", "一樓平面", "塔式車位", "升降機械"];
export const CAR_USAGE_OPTS = ["固定位置使用", "須承租", "須排隊等候", "每日先到先停"];
export const Q11_OPTS = ["機械式車位故障", "車位不易駛入或停放"];

export const ENV_CATEGORIES: EnvCategory[] = [
    { title: "公共行政與社會福利", items: ["警察局/派出所/分駐所", "行政機關", "消防局", "醫院", "體育場", "學校"] },
    { title: "民生與商業", items: ["公/私有市場", "超市"] },
    { title: "基礎與公用事業", items: ["機場", "台電變電用地", "高壓電塔/線", "垃圾場", "掩埋場", "焚化爐"] },
    { title: "能源易燃", items: ["加油/氣站", "瓦斯行"] },
    { title: "宗教與殯葬", items: ["寺廟/宮廟/神壇", "殯儀館", "葬儀社", "公/私墓", "火化場", "骨灰/骸存放設施"] }
];
