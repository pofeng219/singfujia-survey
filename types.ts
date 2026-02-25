
export type SurveyType = 'house' | 'land' | 'factory' | 'parking';

export type MobileTab = 'edit' | 'preview';

export interface ValidationError {
    id: string;
    message: string;
    step: number;
}

export interface EnvCategory {
    title: string;
    items: string[];
}

export interface SurveyData {
    caseName: string;
    authNumber: string;
    storeName: string;
    agentName: string;
    address: string;
    fillDate: string;
    version: string;
    access: string;
    accessType: string[];
    accessOther: string;
    
    // New Field: Property Type (for Factory)
    propertyType: string;
    propertyTypeOther: string;
    
    // Land Address Specific (New for Phase 1)
    land_addr_section: string;
    land_addr_subSection: string;
    land_addr_number: string;

    // House Specific
    q1_hasExt: string;
    q1_items: string[];
    q1_basementPartition: boolean;
    q1_hasOther: boolean;
    q1_other: string;
    q2_hasOccupancy: string;
    q2_desc: string;
    q2_other_occupancy: string; // New: Other occupying me
    q2_other_occupancy_desc: string; // New: Description for above
    
    q3_hasLeak: string;
    q3_leakType: string; // New: Leak vs Wall Cancer vs Both
    q3_locations: string[];
    q3_hasOther: boolean;
    q3_other: string;
    q3_ceilingWrapped: boolean;
    q3_suspected: boolean;
    q3_suspectedDesc: string;
    // New: Leakage Repair Record
    q3_repairHistory: string;
    q3_repairDesc: string;

    q4_hasIssue: string;
    q4_items: string[];
    q4_hasOther: boolean;
    q4_otherDesc: string;
    q4_suspected: boolean;
    q4_suspectedDesc: string;
    q4_ceilingWrapped: boolean;
    q5_hasTilt: string;
    q5_desc: string;
    q5_suspectedDesc: string;
    q6_hasIssue: string;
    q6_desc: string;
    
    q7_hasIssue: string;
    q7_gasType: string; // New: Gas type
    q7_items: string[];
    q7_hasOther: boolean;
    q7_otherDesc: string;

    // New: House/Factory Step 2 Solar Status (Group A)
    house_solar_status: string;

    // New: Water Booster Field (Legacy/Group A)
    water_booster: string;
    water_booster_desc: string;
    water_booster_items: string[]; // New: Detailed items for Group A

    q8_stairIssue: string;
    q8_stairItems: string[]; // New: Detailed stair issues
    q8_stairOther: string; // New: Other stair issue
    q8_stairDesc: string; // Legacy/Fallback
    
    q9_hasIssue: string;
    q9_items: string[];
    q9_hasOther: boolean;
    q9_otherDesc: string;
    q9_solar_maintenance: string; // New: Solar PV maintenance type (Group B / Original logic)
    q9_water_booster_opt: string; // Legacy: Water booster sub-option for Facilities section (Group B)
    q9_water_booster_items: string[]; // New: Multiple selection for Group B

    publicFacilities: string;
    publicFacilitiesReason: string;
    
    // New: Garbage Treatment (Phase 3)
    garbageTreatment: string;
    garbageTreatmentOther: string;

    // Parking (House)
    q10_noParking: boolean;
    q10_parkTypes: string[];
    q10_rampMechLoc: string;
    q10_liftMechLoc: string;
    q10_hasParkTypeOther: boolean;
    q10_parkTypeOther: string;
    q10_ownership: string; // New: Ownership type (Independent/Common)
    q10_parkingNumberType: string;
    q10_parkingNumberVal: string;
    q10_carUsage: string[];
    q10_carLotteryMonth: string;
    q10_hasCarUsageOther: boolean;
    q10_carUsageOther: string;
    q10_motoUsage: string[];
    q10_hasMotoUsageOther: boolean;
    q10_motoUsageOther: string;
    
    q10_measureType: string; // New: Measurement method
    q10_dimL: string;
    q10_dimW: string;
    q10_dimH: string;
    q10_mechWeight: string;
    q10_entryHeight: string;
    
    // New: Parking Lane Land Number
    q10_laneSection: string;
    q10_laneSubSection: string;
    q10_laneNumber: string;

    q10_charging: string;
    q10_chargingOther: string;
    q11_hasIssue: string;
    q11_items: string[];
    q11_hasOther: boolean;
    q11_other: string;
    q12_hasNote: string;
    q12_note: string;
    
    // House Final
    isNotFirstFloor: boolean;
    q14_access: string;
    q14_ownership: string; // New
    q14_protection: string; // New
    q14_abnormalDesc: string; // New
    q14_section: string;
    q14_subSection: string;
    q14_number: string;
    // House Q14 New Fields (Physical Status)
    q14_roadMaterial: string;
    q14_roadMaterialOther: string;
    q14_roadWidth: string; // New: Road width
    q14_buildingLine: string; // New: Building line designation
    q14_ditch: string;
    q14_ditchOther: string;

    q15_occupy: string;
    q15_section: string;
    q15_subSection: string;
    q15_number: string;
    q16_noFacilities: boolean;
    q16_items: string[];
    q16_hasOther: boolean;
    q16_other: string;
    q17_issue: string;
    q17_desc: string;
    q17_homicide: string; // New: Homicide question

    // Factory Specific - Phase 1 Expansion
    factory_height: string; // 滴水高度
    factory_column_spacing: string; // 柱距
    factory_floor_load: string; // 樓板載重
    factory_floor_load_unknown: boolean; // New: Floor load unknown/refer to license
    // REMOVED: factory_floor_load_docs: boolean; 
    factory_floor_condition: string; // 地坪狀況
    factory_floor_condition_other: string;
    factory_fire_safety: string[]; // 消防設施
    factory_fire_safety_other: string;
    
    factory_elevator: string; // 貨梯
    factory_elevator_status: string; // New: Status string (Working/Broken/Off)
    factory_elevator_working: boolean; // Legacy: Working status (Keep for compatibility)
    factory_elevator_separate: boolean; // New: 客貨梯分離
    factory_elevator_capacity: string;
    factory_elevator_dim: string;
    
    factory_crane: string; // 天車
    factory_crane_status: string; // New: Status string (Working/Broken/Off)
    factory_crane_working: boolean; // Legacy: Working status
    factory_crane_tonnage: string;
    factory_crane_quantity: string;
    
    factory_waste: string; // 工業排水／廢氣
    factory_waste_desc: string;
    
    factory_loading_dock: string; // 卸貨碼頭
    factory_truck_access: string; // 大車進出
    factory_truck_buffer: string; // New: 迴轉空間／緩衝區

    factory_parking_desc: string; // New: Factory simple parking description
    // Factory Parking Lane Land Number
    factory_parking_lane_section: string;
    factory_parking_lane_subSection: string;
    factory_parking_lane_number: string;

    // Land Specific (Legacy - Kept for compatibility)
    land_road_smooth: string;
    land_road_desc: string;
    land_road_ownership: string;
    land_road_material: string;
    land_road_material_other: string;
    land_has_ditch: string;
    land_has_ditch_other: string;
    land_has_height_diff: string;
    land_has_height_diff_other: string;
    land_boundary_encroached: string;
    land_boundary_encroached_desc: string;
    land_boundary_encroaching: string;
    land_boundary_encroaching_desc: string;
    land_q1_hasBuilding: string;
    land_q1_items: string[];
    land_q1_unregistered_hasOccupant: boolean;
    land_q1_religious_details: string[];
    land_q1_harvestMonth: string;
    land_q1_cropsDesc: string; 
    land_q1_hasOther: boolean;
    land_q1_other: string;
    land_infra_electricity: string;
    land_infra_electricity_items: string[];
    land_infra_electricity_other: string;
    land_infra_water: string;
    land_infra_water_items: string[];
    land_infra_water_other: string;
    land_infra_other_status: string;
    land_infra_other_facility_desc: string;
    land_q7_issue: string;
    land_q7_desc: string;

    // Land Category - NEW GRANULAR FIELDS (v2)
    land_q1_elec: string; 
    land_q1_elec_detail: string; 
    land_q1_elec_other: string;
    land_q1_elec_meter: string; // New: Meter Type
    land_q1_elec_voltage: string; // New: Voltage
    land_q1_elec_capacity: string; // New: Contract Capacity

    land_q1_water: string;
    land_q1_water_cat: string; 
    land_q1_water_tap_detail: string;
    land_q1_water_ground_detail: string;
    land_q1_water_irr_detail: string;
    land_q1_water_other: string;
    land_q1_other_new: string;
    land_q1_other_desc: string;

    land_q2_access: string; 
    land_q2_access_desc: string;
    // Land/Factory Q2/Q10 Access Land Number
    land_q2_access_section: string;
    land_q2_access_subSection: string;
    land_q2_access_number: string;

    land_q2_owner: string;
    land_q2_owner_desc: string;
    land_q2_protection: string; // New: Protection Type (Easement/Lease etc)

    land_q2_material: string;
    land_q2_material_other: string;
    land_q2_roadWidth: string; // New: Road width for land
    land_q2_buildingLine: string; // New: Building line designation
    land_q2_ditch: string;
    land_q2_ditch_other: string;

    land_q3_survey: string;
    land_q3_survey_detail: string;
    land_q3_survey_other: string;
    land_q3_survey_date: string; // New: Survey date
    land_q3_dispute: string;
    land_q3_dispute_desc: string;
    land_q3_dispute_other: string;

    land_q4_expro: string;
    land_q4_expro_other: string;
    land_q4_resurvey: string;
    land_q4_resurvey_other: string;

    land_q5_encroached: string;
    land_q5_encroached_desc: string;
    land_q5_encroaching: string;
    land_q5_encroaching_desc: string;

    land_q6_limit: string;
    land_q6_limit_desc: string;

    land_q7_user: string;
    land_q7_user_detail: string;
    land_q7_user_desc: string;

    land_q7_crops: string;
    land_q7_crops_month: string;
    land_q7_crops_type: string;
    land_q7_crops_detail: string;
    land_q7_crops_other: string;

    land_q7_build: string;
    land_q7_build_type: string;
    land_q7_build_ownership: string;
    land_q7_build_reg_detail: string;
    land_q7_build_unreg_detail: string;
    land_q7_build_rel_detail: string;
    land_q7_build_other: string;
    land_q7_solar: string; // New: Solar PV status

    // New: Land Step 3 Water Booster
    land_water_booster: string;
    land_water_booster_items: string[];

    // New: Land Step 3 Facilities
    land_q7_facilities: string;
    land_q7_facilities_items: string[];
    land_q7_facilities_other: string;

    // New fields for Land Survey Step 3 specific property types
    land_q7_illegal_paving: string;
    land_q7_fire_setback: string;
    land_q7_road_opened: string;

    land_q8_special: string;
    land_q8_special_desc: string;

    soil_q1_status: string;
    soil_q1_desc: string; // New

    signatureImage: string;
}
