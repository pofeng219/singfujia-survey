
import { SurveyData, EnvCategory } from "./types";

const getCurrentDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
};

export const INITIAL_STATE: SurveyData = {
    caseName: '', authNumber: '', storeName: '', agentName: '', address: '', 
    fillDate: getCurrentDate(), version: '1150101版',
    access: '', accessType: [], accessOther: '', 
    
    propertyType: '', propertyTypeOther: '',

    land_addr_section: '', land_addr_subSection: '', land_addr_number: '',

    q1_hasExt: '', q1_items: [], q1_basementPartition: false, q1_hasOther: false, q1_other: '',         
    q2_hasOccupancy: '', q2_desc: '', q2_other_occupancy: '', q2_other_occupancy_desc: '',
    
    q3_hasLeak: '', q3_leakType: '', q3_locations: [], q3_hasOther: false, q3_other: '', q3_ceilingWrapped: false, q3_suspected: false, q3_suspectedDesc: '',
    q3_repairHistory: '', q3_repairDesc: '', // New

    q4_hasIssue: '', q4_items: [], q4_hasOther: false, q4_otherDesc: '', q4_suspected: false, q4_suspectedDesc: '', q4_ceilingWrapped: false,
    q5_hasTilt: '', q5_desc: '', q5_suspectedDesc: '',
    q6_hasIssue: '', q6_desc: '',
    
    q7_hasIssue: '', q7_gasType: '', q7_items: [], q7_hasOther: false, q7_otherDesc: '',
    
    house_solar_status: '', // New
    water_booster: '', water_booster_desc: '', water_booster_items: [], // New

    q8_stairIssue: '', q8_stairItems: [], q8_stairOther: '', q8_stairDesc: '',
    q9_hasIssue: '', q9_items: [], q9_hasOther: false, q9_otherDesc: '', q9_solar_maintenance: '', q9_water_booster_opt: '', q9_water_booster_items: [],
    publicFacilities: '', publicFacilitiesReason: '',
    

    q10_noParking: false, q10_parkTypes: [], q10_rampMechLoc: '', q10_liftMechLoc: '', q10_hasParkTypeOther: false, q10_parkTypeOther: '',
    q10_ownership: '',
    q10_parkingNumberType: '', q10_parkingNumberVal: '',
    q10_carUsage: [], q10_carLotteryMonth: '', q10_hasCarUsageOther: false, q10_carUsageOther: '',
    q10_motoUsage: [], q10_hasMotoUsageOther: false, q10_motoUsageOther: '',
    q10_measureType: '實際測量', q10_dimL: '', q10_dimW: '', q10_dimH: '', q10_mechWeight: '', q10_entryHeight: '',
    
    q10_laneSection: '', q10_laneSubSection: '', q10_laneNumber: '',

    q10_charging: '', q10_chargingOther: '',
    q11_hasIssue: '', q11_items: [], q11_hasOther: false, q11_other: '',
    q12_hasNote: '', q12_note: '',
    isNotFirstFloor: false,
    q14_access: '', q14_ownership: '', q14_protection: '', q14_protectionDesc: '', q14_abnormalDesc: '', 
    q14_section: '', q14_subSection: '', q14_number: '',
    q14_roadMaterial: '', q14_roadMaterialOther: '', q14_roadWidth: '', q14_buildingLine: '', q14_ditch: '', q14_ditchOther: '',
    
    q15_occupy: '', q15_section: '', q15_subSection: '', q15_number: '',
    q16_noFacilities: false, q16_items: [], q16_hasOther: false, q16_other: '',
    q16_2_noFacilities: false, q16_2_items: [], q16_2_hasOther: false, q16_2_other: '',
    q17_issue: '', q17_desc: '', q17_homicide: '',

    // Factory Init
    factory_height: '', factory_column_spacing: '', factory_floor_load: '', 
    // REMOVED factory_floor_load_docs
    factory_floor_load_unknown: false,
    factory_floor_condition: '', factory_floor_condition_other: '',
    factory_fire_safety: [], factory_fire_safety_other: '',
    factory_elevator: '', factory_elevator_status: '可運作', factory_elevator_working: true, factory_elevator_separate: false, factory_elevator_capacity: '', factory_elevator_dim: '',
    factory_crane: '', factory_crane_status: '可運作', factory_crane_working: true, factory_crane_tonnage: '', factory_crane_quantity: '',
    factory_waste: '', factory_waste_desc: '',
    factory_loading_dock: '', factory_truck_access: '', factory_truck_buffer: '',
    factory_parking_desc: '',
    factory_parking_lane_section: '', factory_parking_lane_subSection: '', factory_parking_lane_number: '',

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
    land_q1_elec_meter: '', land_q1_elec_voltage: '', land_q1_elec_capacity: '',
    
    land_q1_water: '', land_q1_water_cat: '', land_q1_water_tap_detail: '', land_q1_water_ground_detail: '', land_q1_water_irr_detail: '', land_q1_water_other: '',
    land_q1_other_new: '', land_q1_other_desc: '',
    land_q2_access: '', land_q2_access_desc: '', 
    land_q2_access_section: '', land_q2_access_subSection: '', land_q2_access_number: '',
    land_q2_owner: '', land_q2_protection: '', land_q2_protectionDesc: '',
    land_q2_material: '', land_q2_material_other: '', land_q2_roadWidth: '', land_q2_buildingLine: '', land_q2_ditch: '', land_q2_ditch_other: '',
    land_q3_survey: '', land_q3_survey_detail: '', land_q3_survey_other: '', land_q3_survey_date: '',
    land_q3_dispute: '', land_q3_dispute_desc: '', land_q3_dispute_other: '',
    land_q4_expro: '', land_q4_expro_other: '', land_q4_resurvey: '', land_q4_resurvey_other: '',
    land_q5_encroached: '', land_q5_encroached_desc: '', land_q5_encroaching: '', land_q5_encroaching_desc: '',
    land_q6_limit: '', land_q6_limit_desc: '',
    land_q7_user: '', land_q7_user_detail: '', land_q7_user_desc: '',
    land_q7_crops: '', land_q7_crops_month: '', land_q7_crops_type: '', land_q7_crops_detail: '', land_q7_crops_other: '',
    land_q7_build: '', land_q7_build_type: '', land_q7_build_ownership: '', land_q7_build_reg_detail: '', land_q7_build_unreg_detail: '', land_q7_build_rel_detail: '', land_q7_build_other: '', land_q7_solar: '',
    
    land_water_booster: '', land_water_booster_items: [],
    land_q7_facilities: '', land_q7_facilities_items: [], land_q7_facilities_other: '',

    land_q7_illegal_paving: '',
    land_q7_fire_setback: '',
    land_q7_road_opened: '',

    land_q8_special: '', land_q8_special_desc: '',

    soil_q1_status: '', soil_q1_desc: '', // New

    signatureImage: '',
};

export const EXT_LIST = ["頂樓增建", "露台增建", "夾層增建", "防火巷增建", "陽台增建", "天井增建", "一樓空地增建", "地下室增建", "陽台外推", "平台外推", "上下樓層內梯"];
export const LEAK_LOCATIONS = ["屋頂", "外牆", "窗框", "冷熱水器", "浴室", "前陽台", "後陽台", "廚房", "臥室", "客廳"];
export const STRUCTURAL_ISSUES = ["水泥塊剝落", "鋼筋外露", "窗框45度角裂縫", "樑柱／牆壁有明顯環狀龜裂"];
export const UTILITY_ISSUES = ["無水錶", "無電錶", "無瓦斯掛錶", "無瓦斯管線"];
export const FACILITY_OPTIONS = ["變電箱／桶", "基地台", "太陽能光電發電設備", "加壓受水設備"];
export const ACCESS_SUB_OPTIONS = ["出租中", "屋主自住", "空屋須請屋主開門", "尚未搬空", "其他未列項目"];
// Updated Factory Access Options
export const ACCESS_SUB_OPTIONS_FACTORY = ["出租中", "屋主自用", "清空須請屋主開門", "尚未搬空", "其他未列項目"];
export const ACCESS_SUB_OPTIONS_LAND = [
    "有他人建物阻擋出入", 
    "現況被圍籬、圍牆等圍起", 
    "需與地主聯繫才能入內", 
    "雜草叢生", 
    "地形陡峭", 
    "其他未列項目"
];
export const ACCESS_SUB_OPTIONS_PARKING = ["塔式車位", "其他未列項目"];
export const PARK_TYPES = ["坡道平面", "坡道機械", "升降平面", "一樓平面", "法定空地／自家門前", "塔式車位", "升降機械"];
export const CAR_USAGE_OPTS = ["固定位置使用", "須承租", "須排隊等候", "每日先到先停"];
export const Q11_OPTS = ["機械式車位故障", "車位不易駛入或停放"];
export const PROPERTY_TYPE_OPTIONS = ["透天獨棟廠房", "立體化廠辦大樓", "標準廠房(工業園區內)", "倉儲物流廠房", "其他未列項目"];
export const HOUSE_PROPERTY_TYPE_OPTIONS = ["透天別墅", "透天店面", "大樓華廈 (10樓以下有電梯)", "公寓 (5樓以下無電梯)"];
export const LAND_PROPERTY_TYPE_OPTIONS = ["農地", "建地", "工業地", "其他(道路用地／公設地)"];
// New Factory Property Type Options
export const FACTORY_PROPERTY_TYPE_OPTIONS = ["獨棟自建廠房", "立體化廠辦大樓", "園區標準廠房（集合式／分租型）", "倉儲物流廠房", "其他特殊工業設施"];

// Property Type Groups for Water Booster Logic
export const GROUP_A_TYPES = [
    '透天別墅', '透天店面', '農地', '建地', '工業地', 
    '獨棟自建廠房', '倉儲物流廠房', '其他特殊工業設施',
    '其他(道路用地／公設地)'
];
export const GROUP_B_TYPES = [
    '大樓華廈 (10樓以下有電梯)', '公寓 (5樓以下無電梯)', '立體化廠辦大樓', 
    '園區標準廠房（集合式／分租型）'
];

// Water Booster Options
export const WATER_BOOSTER_OPTS_SIMPLE = ['無設置', '有，地主／屋主自管', '其他未列項目'];
export const WATER_BOOSTER_OPTS_COMPLEX = ['無設置', '有，地主／屋主自管', '有，管委會共管', '其他未列項目'];

// New Detailed Options for Water Booster (House/Factory Group A)
export const WATER_BOOSTER_ITEMS_A = [
    "蓄水池（地下／地面）",
    "揚水馬達",
    "屋頂水塔",
    "加壓馬達",
    "臨時供水設備"
];

// For House/Factory Group B (Original)
export const WATER_BOOSTER_ITEMS_B = [
    "地下蓄水池",
    "配水機房",
    "揚水馬達",
    "中繼水箱(含加壓泵)",
    "屋頂水塔"
];

export const ACCESS_STATUS_OPTIONS = ['通行順暢', '通行受限（如狹窄、有障礙物）', '袋地（無合法出入口）'];
export const GAS_SUPPLY_OPTIONS = ['天然瓦斯（街道管線／有帳單）', '社區配管（社區大水桶／大槽）', '桶裝瓦斯 (無天然瓦斯)', '無瓦斯（全電設備／電磁爐）', '完全無設置'];
export const BUILDING_LINE_OPTIONS = ['已核定', '未核定', '申請中', '須申請'];
export const DRAINAGE_OPTIONS = ['公有排水溝（可搭排）', '水利溝渠 (灌溉溝渠)', '無排水系統'];

// Protection Options (Access)
export const PROTECTION_OPTS_PUBLIC = ['現狀通行', '已向政府承租', '計畫道路'];
export const PROTECTION_OPTS_PRIVATE = [
    '私設道路（具路權持分）',
    '設定不動產役權',
    '分管協議約定',
    '取得地主同意書',
    '法院判決通行',
    '現狀通行／既成道路',
    '現況未明／無保障'
];

// Factory Specific Option Lists
export const FACTORY_FLOOR_OPTS = ["一般水泥", "環氧樹脂(Epoxy)", "硬化地坪", "磨石子", "其他未列項目"];
export const FACTORY_FIRE_OPTS = ["自動灑水設備", "室內消防栓", "火警探測器", "滅火器", "排煙設備", "泡沫滅火設備"];
export const FACTORY_WASTE_OPTS = ["無", "有(已納管)", "工業區統一汙水處理", "有(自有處理設備)", "其他未列項目"];
export const FACTORY_DOCK_OPTS = ["無", "有(一般月台)", "有(附油壓升降板)"];
export const FACTORY_TRUCK_OPTS = ["40呎貨櫃車", "20呎貨櫃車", "僅3.5噸貨車", "機車／小客車"];
export const STAIR_ISSUES = ["龜裂", "鋼筋外露", "水泥塊剝落"];

export const ENV_CATEGORIES: EnvCategory[] = [
    { title: "公共行政與社會福利", items: ["警察局／派出所／分駐所", "行政機關", "消防局", "醫院", "體育場", "學校"] },
    { title: "民生與商業", items: ["公／私有市場", "超市"] },
    { title: "基礎與公用事業", items: ["機場", "台電變電用地", "高壓電塔／線", "垃圾場", "掩埋場", "焚化爐"] },
    { title: "能源易燃", items: ["加油／氣站", "瓦斯行"] },
    { title: "宗教與殯葬", items: ["寺廟／宮廟／神壇", "殯儀館", "葬儀社", "公／私墓", "火化場", "骨灰／骸存放設施"] }
];

// NEW CONSTANTS FOR FACILITIES
export const FACILITIES_GROUP_A = [
    "變電箱／桶", 
    "基地台", 
    "門前／車輛出入有消防栓", 
    "門前／車輛出入有電線杆"
];

// Land specific facilities base options
export const FACILITIES_LAND_BASE = [
    "變電箱／桶", 
    "基地台", 
];

export const RESISTANCE_FACILITIES_OPTIONS = [
    "光電太陽能板（光電場）",
    "資源回收廠",
    "鐵路軌道",
    "高鐵高架橋",
    "快速／高速道路高架橋",
    "污水處理廠／水資源回收中心",
    "抽水站",
    "八大行業",
    "工廠",
    "養豬／雞／鴨／牛場",
    "屠宰場",
    "動物繁殖場"
];

export const FACILITIES_LAND_FARM_EXTRA = ["鄰近工業區"];
export const FACILITIES_LAND_BUILD_IND_EXTRA = ["出入有消防栓", "出入有電線桿"];

// Land specific Water Booster Items (Same as Group A but used for Land Step 3)
export const LAND_WATER_BOOSTER_ITEMS = [
    "蓄水池（地下／地面）",
    "揚水馬達",
    "水塔",
    "加壓馬達",
    "臨時供水設備"
];
