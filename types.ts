
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
    
    // House Specific
    q1_hasExt: string;
    q1_items: string[];
    q1_basementPartition: boolean;
    q1_hasOther: boolean;
    q1_other: string;
    q2_hasOccupancy: string;
    q2_desc: string;
    q3_hasLeak: string;
    q3_locations: string[];
    q3_hasOther: boolean;
    q3_other: string;
    q3_ceilingWrapped: boolean;
    q3_suspected: boolean;
    q3_suspectedDesc: string;
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
    q7_items: string[];
    q7_hasOther: boolean;
    q7_otherDesc: string;
    q8_stairIssue: string;
    q8_stairDesc: string;
    q9_hasIssue: string;
    q9_items: string[];
    q9_hasOther: boolean;
    q9_otherDesc: string;
    publicFacilities: string;
    publicFacilitiesReason: string;
    
    // Parking (House)
    q10_noParking: boolean;
    q10_parkTypes: string[];
    q10_rampMechLoc: string;
    q10_liftMechLoc: string;
    q10_hasParkTypeOther: boolean;
    q10_parkTypeOther: string;
    q10_parkingNumberType: string;
    q10_parkingNumberVal: string;
    q10_carUsage: string[];
    q10_carLotteryMonth: string;
    q10_hasCarUsageOther: boolean;
    q10_carUsageOther: string;
    q10_motoUsage: string[];
    q10_hasMotoUsageOther: boolean;
    q10_motoUsageOther: string;
    q10_dimL: string;
    q10_dimW: string;
    q10_dimH: string;
    q10_mechWeight: string;
    q10_entryHeight: string;
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
    q13_occupancy: string;
    q13_desc: string;
    q14_access: string;
    q14_section: string;
    q14_subSection: string;
    q14_number: string;
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
    land_q2_owner: string;
    land_q2_owner_desc: string;
    land_q2_material: string;
    land_q2_material_other: string;
    land_q2_ditch: string;
    land_q2_ditch_other: string;

    land_q3_survey: string;
    land_q3_survey_detail: string;
    land_q3_survey_other: string;
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
    land_q7_build_ownership: string; // Added field
    land_q7_build_reg_detail: string;
    land_q7_build_unreg_detail: string;
    land_q7_build_rel_detail: string;
    land_q7_build_other: string;

    land_q8_special: string;
    land_q8_special_desc: string;
}

export type SurveyType = 'house' | 'land' | 'parking';
export type MobileTab = 'edit' | 'preview';

export interface EnvCategory {
    title: string;
    items: string[];
}
