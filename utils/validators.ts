
import { SurveyData, SurveyType, ValidationError } from '../types';

export const validateForm = (d: SurveyData, type: SurveyType): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    const checkEmpty = (val: string | undefined | null) => !val || !val.trim();
    const verify = (condition: boolean, id: string, msg: string, step: number) => { 
        if (condition) errors.push({ id, message: msg, step }); 
    };

    verify(checkEmpty(d?.caseName), "field-caseName", "基本資料：物件案名", 1);
    verify(checkEmpty(d?.authNumber), "field-authNumber", "基本資料：委託書編號", 1);
    verify(checkEmpty(d?.storeName), "field-storeName", "基本資料：所屬店名", 1);
    verify(checkEmpty(d?.agentName), "field-agentName", "基本資料：調查業務", 1);
    verify(checkEmpty(d?.address), "field-address", type === 'land' ? "基本資料：坐落位置" : (type === 'parking' ? "基本資料：標的位置" : "基本資料：標的地址"), 1);
    verify(!d?.access, "section-access", "基本資料：本物件現況 (可進入/不可進入)", 1);
    if (d?.access === '不可進入') {
        verify(!d?.accessType || d.accessType.length === 0, "section-access", "基本資料：請勾選不可進入原因", 1);
        verify(d.accessType?.includes('其他') && checkEmpty(d.accessOther), "section-access", "基本資料：請填寫不可進入之「其他」詳細內容", 1);
    }
    
    const validateParkingPart = (baseNum: number, startStep: number) => {
        const qInfo = `${baseNum}. 車位資訊`;
        const qAbnormal = `${baseNum}. 車位使用是否異常？`;
        const qNote = `${baseNum}. 車位現況補充`;
        const sMain = type === 'parking' ? 'section-parking-main' : 'section-house-parking-main';

        if ((d.q10_motoUsage?.length || 0) === 0 && !d.q10_hasMotoUsageOther) verify(true, sMain, `${qInfo}：機車車位-請至少勾選一項使用情況`, startStep);
        if (d.q10_hasMotoUsageOther && checkEmpty(d.q10_motoUsageOther)) verify(true, sMain, `${qInfo}：機車使用-請填寫「其他」說明內容`, startStep);

        if (!d.q10_noParking) {
            if ((d.q10_parkTypes?.length || 0) === 0 && !d.q10_hasParkTypeOther) verify(true, sMain, `${qInfo}：停車方式未填寫`, startStep);
            if (d.q10_hasParkTypeOther && checkEmpty(d.q10_parkTypeOther)) verify(true, sMain, `${qInfo}：停車方式-請填寫「其他」說明內容`, startStep);
            if (d.q10_parkTypes?.includes("坡道機械") && !d.q10_rampMechLoc) verify(true, sMain, `${qInfo}：請選擇「坡道機械」之層位`, startStep);
            if (d.q10_parkTypes?.includes("升降機械") && !d.q10_liftMechLoc) verify(true, sMain, `${qInfo}：請選擇「升降機械」之層位`, startStep);
            if (d.q10_parkTypes?.includes("塔式車位") && !d.q10_liftMechLoc) verify(true, sMain, `${qInfo}：請選擇「塔式車位」之層位`, startStep);

            const isOtherPt = d.q10_hasParkTypeOther === true; 
            if (!isOtherPt) {
                if (!d.q10_parkingNumberType) verify(true, sMain, `${qInfo}：車位編號未填寫`, startStep);
                else if (d.q10_parkingNumberType === 'number' && checkEmpty(d.q10_parkingNumberVal)) verify(true, sMain, `${qInfo}：車位編號-請填寫編號內容`, startStep);
        
                if ((d.q10_carUsage?.length || 0) === 0 && !d.q10_hasCarUsageOther) verify(true, sMain, `${qInfo}：汽車使用情況未填寫`, startStep);
                if (d.q10_carUsage?.includes("須固定抽籤") && !d.q10_carLotteryMonth) verify(true, sMain, `${qInfo}：汽車使用-請填寫抽籤月數`, startStep);
                if (d.q10_hasCarUsageOther && checkEmpty(d.q10_carUsageOther)) verify(true, sMain, `${qInfo}：汽車使用-請填寫「其他」說明內容`, startStep);
            }
            if (!d.q10_charging) verify(true, sMain, `${qInfo}：充電樁調查未填寫`, startStep);
            else if (d.q10_charging === '其他' && checkEmpty(d.q10_chargingOther)) verify(true, sMain, `${qInfo}：充電樁-請填寫「其他」說明內容`, startStep);

            if (!d.q11_hasIssue) verify(true, sMain, `${qAbnormal}：調查未填寫`, startStep);
            else if (d.q11_hasIssue === '是') {
                if ((d.q11_items?.length || 0) === 0 && !d.q11_hasOther) verify(true, sMain, `${qAbnormal}：請勾選異常原因`, startStep);
                if (d.q11_hasOther && checkEmpty(d.q11_other)) verify(true, sMain, `${qAbnormal}：請填寫「其他」說明內容`, startStep);
            }
            if (!d.q12_hasNote) verify(true, sMain, `${qNote}：調查未填寫`, startStep);
            else if (d.q12_hasNote === '是' && checkEmpty(d.q12_note)) verify(true, sMain, `${qNote}：請填寫說明內容`, startStep);
        }
    };

    const validateUtilitiesPart = (qNumStr: string, isFactory: boolean, sectionId: string, step: number) => {
        const title = isFactory ? '電、水與其他設施資訊' : '有電力、水力與其他設施？';
        if (!d?.land_q1_elec) verify(true, sectionId, `${qNumStr} (${title} - 電力供應)`, step); 
        else {
            if (isFactory) {
                if ((d.land_q1_elec.includes('一般用電') || d.land_q1_elec.includes('動力用電')) && !d.land_q1_elec_meter) verify(true, sectionId, `${qNumStr}：請選擇電錶型態`, step);
                else if (d.land_q1_elec.includes('動力用電') && !d.land_q1_elec_voltage) verify(true, sectionId, `${qNumStr}：請選擇電壓規格`, step);
                else if ((d.land_q1_elec.includes('一般用電') || d.land_q1_elec.includes('動力用電')) && !d.land_q1_elec_capacity) verify(true, sectionId, `${qNumStr}：請選擇契約容量`, step);
                else if (d.land_q1_elec === '其他' && checkEmpty(d.land_q1_elec_other)) verify(true, sectionId, `${qNumStr}：請填寫「其他」說明內容`, step);
            } else {
                if (d.land_q1_elec === '是' && !d.land_q1_elec_detail) verify(true, sectionId, `${qNumStr} (${title} - 請選擇電力類型)`, step);
                else if (d.land_q1_elec === '其他' && checkEmpty(d.land_q1_elec_other)) verify(true, sectionId, `${qNumStr} (${title} - 請填寫「其他」說明內容)`, step);
            }
        }
        if (!d?.land_q1_water) verify(true, sectionId, `${qNumStr} (${title} - 水源供應)`, step); 
        else if (d.land_q1_water === '是') {
            if (!d.land_q1_water_cat) verify(true, sectionId, `${qNumStr} (${title} - 請選擇水源細節)`, step);
            else {
                if (d.land_q1_water_cat === '自來水' && !d.land_q1_water_tap_detail) verify(true, sectionId, `${qNumStr} (${title} - 請選擇自來水細節)`, step);
                if (d.land_q1_water_cat === '地下水' && !d.land_q1_water_ground_detail) verify(true, sectionId, `${qNumStr} (${title} - 請選擇地下水細節)`, step);
                if (d.land_q1_water_cat === '水利溝渠' && !d.land_q1_water_irr_detail) verify(true, sectionId, `${qNumStr} (${title} - 請選擇水利溝渠歸屬)`, step);
            }
        } else if (d.land_q1_water === '其他' && checkEmpty(d.land_q1_water_other)) verify(true, sectionId, `${qNumStr} (${title} - 請填寫「其他」說明內容)`, step);
        if (!d?.land_q1_other_new) verify(true, sectionId, `${qNumStr} (${title} - 其他設施)`, step); 
        else if (d.land_q1_other_new === '是' && checkEmpty(d.land_q1_other_desc)) verify(true, sectionId, `${qNumStr} (${title} - 請填寫說明內容)`, step);
    }

    if (type === 'house' || type === 'factory') {
        // Define Question Numbers based on type
        const t = { 
            q3: type === 'factory' ? "3. 滲漏水" : "2. 滲漏水", 
            q4: type === 'factory' ? "4. 結構牆面" : "3. 結構牆面", 
            q5: type === 'factory' ? "4. 傾斜情況" : "3. 傾斜情況", 
            q6: type === 'factory' ? "5. 測量成果圖" : "4. 測量成果圖", 
            q7: "5. 水電使用情況", 
            pub: "公共設施"
        };

        // --- Step 1: Basic Info (Factory specific) ---
        if (type === 'factory') {
            if (!d?.propertyType) verify(true, "section-propertyType", "基本資料：本物件型態", 1);
            if (d?.propertyType === '其他' && checkEmpty(d.propertyTypeOther)) verify(true, "section-propertyType", "基本資料：本物件型態 (請填寫「其他」說明)", 1);
        }

        // --- Step 2: Internal Status ---
        
        // 1. Extension (Common)
        if (!d?.q1_hasExt) verify(true, "section-q1", `1. 是否有增建情況？`, 2); 
        else if (d.q1_hasExt === '是') {
            if ((d.q1_items?.length || 0) === 0 && !d.q1_hasOther) verify(true, "section-q1", `1. 是否有增建情況？ (請至少勾選一項增建項目)`, 2);
            if (d.q1_hasOther && checkEmpty(d.q1_other)) verify(true, "section-q1", `1. 是否有增建情況？ (請填寫「其他」說明內容)`, 2);
        }
        if (!d?.q2_hasOccupancy) verify(true, "section-q1", `1. 建物或增建部分是否有占用鄰地、道路用地？`, 2); 
        else if (d.q2_hasOccupancy !== '否' && checkEmpty(d.q2_desc)) verify(true, "section-q1", `1. 增建情況與占用/被占用情況 (請填寫占用說明內容)`, 2);

        if (!d?.q2_other_occupancy) verify(true, "section-q1", `1. 是否他戶建物占用本案之土地/本戶空間？`, 2);
        else if ((d.q2_other_occupancy === '是' || d.q2_other_occupancy === '疑似') && checkEmpty(d.q2_other_occupancy_desc)) verify(true, "section-q1", `1. 增建情況與占用/被占用情況 (請填寫他戶占用說明內容)`, 2);

        // 2. Factory Structure (Factory Only - MOVED UP)
        if (type === 'factory') {
            if (!d?.factory_height) verify(true, "section-factory-struct", "2. 廠房結構與消防安全 (滴水高度)", 2);
            if (!d?.factory_column_spacing) verify(true, "section-factory-struct", "2. 廠房結構與消防安全 (柱距)", 2);
            if (!d?.factory_floor_load) verify(true, "section-factory-struct", "2. 廠房結構與消防安全 (樓板載重)", 2);
            if (!d?.factory_floor_condition) verify(true, "section-factory-struct", "2. 廠房結構與消防安全 (地坪狀況)", 2);
            else if (d.factory_floor_condition === '其他' && checkEmpty(d.factory_floor_condition_other)) verify(true, "section-factory-struct", "2. 廠房結構與消防安全 (請填寫地坪其他說明)", 2);
            if ((d?.factory_fire_safety?.length || 0) === 0 && checkEmpty(d?.factory_fire_safety_other)) verify(true, "section-factory-struct", "2. 廠房結構與消防安全 (消防設施)", 2);
        }

        // 3. Leakage (Common)
        if (!d?.q3_hasLeak) verify(true, "section-q3", t.q3, 2); 
        else if (d.q3_hasLeak === '是') {
            if (!d.q3_leakType) verify(true, "section-q3", `${t.q3} (請選擇狀況類別)`, 2);
            if ((d.q3_locations?.length || 0) === 0 && !d.q3_hasOther && !d.q3_suspected && !d.q3_ceilingWrapped) verify(true, "section-q3", `${t.q3} (請至少勾選一項位置或說明情況)`, 2);
            if (d.q3_hasOther && checkEmpty(d.q3_other)) verify(true, "section-q3", `${t.q3} (請填寫「其他」位置說明)`, 2);
            if (d.q3_suspected && checkEmpty(d.q3_suspectedDesc)) verify(true, "section-q3", `${t.q3} (請填寫「疑似」說明內容)`, 2);
        }

        // 4. Structure & Tilt (Common)
        if (!d?.q4_hasIssue) verify(true, "section-q4", t.q4, 2); 
        else if (d.q4_hasIssue === '是') {
            if ((d.q4_items?.length || 0) === 0 && !d.q4_hasOther && !d.q4_suspected && !d.q4_ceilingWrapped) verify(true, "section-q4", `${t.q4} (請至少勾選一項項目或說明情況)`, 2);
            if (d.q4_hasOther && checkEmpty(d.q4_otherDesc)) verify(true, "section-q4", `${t.q4} (請填寫「其他」說明內容)`, 2);
            if (d.q4_suspected && checkEmpty(d.q4_suspectedDesc)) verify(true, "section-q4", `${t.q4} (請填寫「疑似」說明內容)`, 2);
        }

        if (!d?.q5_hasTilt) verify(true, "section-q4", t.q5, 2); 
        else if (d.q5_hasTilt === '是' && checkEmpty(d.q5_desc)) verify(true, "section-q4", `${t.q5} (請填寫說明內容)`, 2);
        else if (d.q5_hasTilt === '疑似' && checkEmpty(d.q5_suspectedDesc)) verify(true, "section-q4", `${t.q5} (請填寫疑似原因說明)`, 2);

        // 5/6. Measurement (Common)
        if (!d?.q6_hasIssue) verify(true, "section-q6", t.q6, 2); 
        else if ((d.q6_hasIssue === '不符 (有明顯差異)' || d.q6_hasIssue === '無法測量/其他') && checkEmpty(d.q6_desc)) verify(true, "section-q6", `${t.q6} (請填寫詳細說明內容)`, 2);

        // 6. Utilities (Factory specific or House specific)
        if (type === 'factory') {
            validateUtilitiesPart("6", true, "section-factory-q6", 2);
        } else {
            if (!d?.q7_hasIssue) verify(true, "section-q7", t.q7, 2); 
            else if (d.q7_hasIssue === '是') {
                if (!d.q7_gasType) verify(true, "section-q7", `${t.q7} (請選擇瓦斯類型)`, 2);
                if ((d.q7_items?.length || 0) === 0 && !d.q7_hasOther) verify(true, "section-q7", `${t.q7} (請勾選異常項目)`, 2);
                if (d.q7_hasOther && checkEmpty(d.q7_otherDesc)) verify(true, "section-q7", `${t.q7} (請填寫「其他」說明內容)`, 2);
            }
        }

        // Public Facilities (Common)
        if (!d?.publicFacilities) verify(true, "section-publicFacilities", t.pub, 2); 
        else if (d.publicFacilities === '無法進入' && checkEmpty(d.publicFacilitiesReason)) verify(true, "section-publicFacilities", `${t.pub} (請填寫「無法進入」之原因)`, 2);

        // --- Step 3: Hardware / Logistics (Factory) or Facilities (House) ---
        
        // Factory 7 & 8 (Moved to start of Step 3)
        if (type === 'factory') {
            if (!d?.factory_elevator) verify(true, "section-factory-hardware", "7. 廠房硬體設施 (貨梯)", 3);
            else if (d.factory_elevator === '有') {
                if (checkEmpty(d.factory_elevator_capacity)) verify(true, "section-factory-hardware", "7. 廠房硬體設施 (請填寫貨梯載重)", 3);
                if (checkEmpty(d.factory_elevator_dim)) verify(true, "section-factory-hardware", "7. 廠房硬體設施 (請填寫貨梯尺寸)", 3);
            }
            if (!d?.factory_crane) verify(true, "section-factory-hardware", "7. 廠房硬體設施 (天車)", 3);
            else if (d.factory_crane === '有') {
                if (checkEmpty(d.factory_crane_tonnage)) verify(true, "section-factory-hardware", "7. 廠房硬體設施 (請填寫天車噸數)", 3);
                if (checkEmpty(d.factory_crane_quantity)) verify(true, "section-factory-hardware", "7. 廠房硬體設施 (請填寫天車數量)", 3);
            }
            if (!d?.factory_waste) verify(true, "section-factory-hardware", "7. 廠房硬體設施 (工業排水/廢氣)", 3);
            else if (d.factory_waste === '其他' && checkEmpty(d.factory_waste_desc)) verify(true, "section-factory-hardware", "7. 廠房硬體設施 (請填寫排水/廢氣其他說明)", 3);

            if (!d?.factory_loading_dock) verify(true, "section-factory-logistics", "8. 物流動線 (卸貨碼頭)", 3);
            if (!d?.factory_truck_access) verify(true, "section-factory-logistics", "8. 物流動線 (大車進出)", 3);
        }

        // Stairs / Q8
        const q8Label = type === 'factory' ? "9. 電梯樓梯" : "6. 電梯樓梯";
        if (!d?.q8_stairIssue) verify(true, "section-q8", q8Label, 3); 
        else if (d.q8_stairIssue === '是' && checkEmpty(d.q8_stairDesc)) verify(true, "section-q8", `${q8Label} (請填寫瑕疵說明內容)`, 3);

        // Facilities / Q9
        const q9Label = type === 'factory' ? "10. 設施" : "7. 設施";
        if (!d?.q9_hasIssue) verify(true, "section-q9", q9Label, 3);
        else if (d.q9_hasIssue === '是') {
            if ((d.q9_items?.length || 0) === 0 && !d.q9_hasOther) verify(true, "section-q9", `${q9Label} (請勾選設施項目)`, 3);
            if (d.q9_hasOther && checkEmpty(d.q9_otherDesc)) verify(true, "section-q9", `${q9Label} (請填寫「其他」說明內容)`, 3);
        }

        // Parking / Q10-12
        validateParkingPart(type === 'factory' ? 11 : 8, 3);

        // --- Step 4: Environment & Other ---
        if (!d?.isNotFirstFloor) { 
            const q14Label = type === 'factory' ? "12. 經他人土地" : "9. 經他人土地";
            const q15Label = type === 'factory' ? "13. 增建占用" : "10. 增建占用";
            
            if (!d?.q14_access) verify(true, "section-q14", q14Label, 4); 
            else if (d.q14_access === '是' && (checkEmpty(d.q14_section) || checkEmpty(d.q14_number))) verify(true, "section-q14", `${q14Label} (請填寫完整的地號資訊 (段、地號))`, 4);
            if (!d?.q15_occupy) verify(true, "section-q15", q15Label, 4); 
            else if (d.q15_occupy === '是' && (checkEmpty(d.q15_section) || checkEmpty(d.q15_number))) verify(true, "section-q15", `${q15Label} (請填寫完整的地號資訊 (段、地號))`, 4);
        }

        const q16Label = type === 'factory' ? "14. 重要環境設施" : "11. 重要環境設施";
        if (!d?.q16_noFacilities && (d?.q16_items?.length || 0) === 0 && !d?.q16_hasOther) verify(true, "section-q16", q16Label, 4); 
        if (d?.q16_hasOther && checkEmpty(d.q16_other)) verify(true, "section-q16", `${q16Label} (請填寫「其他」設施說明)`, 4);

        const q17Label = type === 'factory' ? "15. 注意事項" : "12. 注意事項";
        if (!d?.q17_issue) verify(true, "section-q17", q17Label, 4);
        else if (d.q17_issue === '是' && checkEmpty(d.q17_desc)) verify(true, "section-q17", `${q17Label} (請填寫詳細說明內容)`, 4);
    }

    if (type === 'land') {
        validateUtilitiesPart("1", false, "section-land-q1", 2);
        if (!d?.land_q2_access) verify(true, "section-land-q2", "2. 土地進出通行與臨路的情況？ (通行異常)", 2); 
        else if (d.land_q2_access === '異常 (有阻礙)' && checkEmpty(d.land_q2_access_desc)) verify(true, "section-land-q2", "2. 土地進出通行與臨路的情況？ (請填寫阻礙原因說明)", 2);
        if (d.land_q2_access !== '袋地 (無路可通)' && d.land_q2_access !== '') {
            if (!d.land_q2_owner) verify(true, "section-land-q2", "2. 土地進出通行與臨路的情況？ (臨路歸屬權)", 2);
            else if (d.land_q2_owner === '私人' && checkEmpty(d.land_q2_owner_desc)) verify(true, "section-land-q2", "2. 土地進出通行與臨路的情況？ (請填寫權屬詳細內容)", 2);
            if (!d.land_q2_material) verify(true, "section-land-q2", "2. 土地進出通行與臨路的情況？ (路面材質)", 2);
            else if (d.land_q2_material === '其他' && checkEmpty(d.land_q2_material_other)) verify(true, "section-land-q2", "2. 土地進出通行與臨路的情況？ (請填寫「其他」說明)", 2);
        }
        if (!d?.land_q2_ditch) verify(true, "section-land-q2", "2. 土地進出通行與臨路的情況？ (排水溝)", 2); 
        else if (d.land_q2_ditch === '其他' && checkEmpty(d.land_q2_ditch_other)) verify(true, "section-land-q2", "2. 土地進出通行與臨路的情況？ (請填寫說明內容)", 2);

        if (!d?.land_q3_survey) verify(true, "section-land-q3", "3. 曾在兩年內進行土地鑑界/目前是否有糾紛？ (土地鑑界)", 2); 
        else if (d.land_q3_survey === '是' && !d.land_q3_survey_detail) verify(true, "section-land-q3", "3. 曾在兩年內進行土地鑑界/目前是否有糾紛？ (請選擇鑑界結果)", 2);
        if (!d?.land_q3_dispute) verify(true, "section-land-q3", "3. 曾在兩年內進行土地鑑界/目前是否有糾紛？ (糾紛調查)", 2); 
        else if (d.land_q3_dispute === '是' && checkEmpty(d.land_q3_dispute_desc)) verify(true, "section-land-q3", "3. 曾在兩年內進行土地鑑界/目前是否有糾紛？ (請填寫糾紛說明內容)", 2);
        else if ((d.land_q3_dispute === '其他' || d.land_q3_dispute === '疑似 / 處理中') && checkEmpty(d.land_q3_dispute_other)) verify(true, "section-land-q3", "3. 曾在兩年內進行土地鑑界/目前是否有糾紛？ (請填寫說明內容)", 2);

        if (!d?.land_q4_expro) verify(true, "section-land-q4", "4. 徵收地預定地/重測區域範圍內？ (徵收地預定地)", 2); 
        else if ((d.land_q4_expro === '是' || d.land_q4_expro === '其他' || d.land_q4_expro === '查詢中 / 不確定') && checkEmpty(d.land_q4_expro_other)) verify(true, "section-land-q4", "4. 徵收地預定地/重測區域範圍內？ (請填寫詳細說明)", 2);
        if (!d?.land_q4_resurvey) verify(true, "section-land-q4", "4. 徵收地預定地/重測區域範圍內？ (重測區域)", 2); 
        else if ((d.land_q4_resurvey === '是' || d.land_q4_resurvey === '其他' || d.land_q4_resurvey === '查詢中 / 不確定') && checkEmpty(d.land_q4_resurvey_other)) verify(true, "section-land-q4", "4. 徵收地預定地/重測區域範圍內？ (請填寫詳細說明)", 2);

        if (!d?.land_q5_encroached) verify(true, "section-land-q5", "5. 被越界占用/占用鄰地情況？ (被越界占用)", 4); 
        else if (d.land_q5_encroached !== '否' && checkEmpty(d.land_q5_encroached_desc)) verify(true, "section-land-q5", "5. 被越界占用/占用鄰地情況？ (請填寫說明內容)", 4);
        if (!d?.land_q5_encroaching) verify(true, "section-land-q5", "5. 被越界占用/占用鄰地情況？ (占用鄰地)", 4); 
        else if (d.land_q5_encroaching !== '否' && checkEmpty(d.land_q5_encroaching_desc)) verify(true, "section-land-q5", "5. 被越界占用/占用鄰地情況？ (請填寫說明內容)", 4);

        if (!d?.land_q6_limit) verify(true, "section-land-q6", "6. 目前是否有禁建、限建的情況？", 4); 
        else if (d.land_q6_limit !== '否' && d.land_q6_limit !== '無' && checkEmpty(d.land_q6_limit_desc)) verify(true, "section-land-q6", "6. 目前是否有禁建、限建的情況？ (請填寫說明內容)", 4);

        if (!d?.land_q7_user) verify(true, "section-land-q7", "7. 土地使用現況與地上物 (現況使用人)", 4); 
        else if (d.land_q7_user === '非所有權人使用') {
            if (!d.land_q7_user_detail) verify(true, "section-land-q7", "7. 土地使用現況與地上物 (請選擇使用詳情項目)", 4);
            else if (d.land_q7_user_detail !== '共有分管' && checkEmpty(d.land_q7_user_desc)) verify(true, "section-land-q7", "7. 土地使用現況與地上物 (請填寫詳細說明內容)", 4);
        }
        if (!d?.land_q7_crops) verify(true, "section-land-q7", "7. 土地使用現況與地上物 (地上定著物-農作物)", 4); 
        else if (d.land_q7_crops === '有農作物/植栽') {
            if (!d.land_q7_crops_type) verify(true, "section-land-q7", "7. 土地使用現況與地上物 (請選擇作物細節類型)", 4);
            else {
                if (d.land_q7_crops_type === '經濟作物' && !d.land_q7_crops_month) verify(true, "section-land-q7", "7. 土地使用現況與地上物 (請填寫收成月份)", 4);
                if ((d.land_q7_crops_type === '經濟作物' || d.land_q7_crops_type === '景觀植栽') && !d.land_q7_crops_detail) verify(true, "section-land-q7", "7. 土地使用現況與地上物 (請選擇處理方式項目)", 4);
                if (d.land_q7_crops_type === '其他' && checkEmpty(d.land_q7_crops_other)) verify(true, "section-land-q7", "7. 土地使用現況與地上物 (請填寫「其他」詳細內容)", 4);
            }
        }
        if (!d?.land_q7_build) verify(true, "section-land-q7", "7. 土地使用現況與地上物 (地上定著物-建物)", 4);
        else if (d.land_q7_build === '有建築物/工作物') {
            if (!d.land_q7_build_type) verify(true, "section-land-q7", "7. 土地使用現況與地上物 (請選擇建物類型項目)", 4);
            else {
                if ((d.land_q7_build_type === '有保存登記' || d.land_q7_build_type === '未保存登記') && !d.land_q7_build_ownership) verify(true, "section-land-q7", "7. 土地使用現況與地上物 (請選擇現況權屬)", 4);
                if (d.land_q7_build_type === '宗教/殯葬設施' && !d.land_q7_build_rel_detail) verify(true, "section-land-q7", "7. 土地使用現況與地上物 (請選擇設施類型)", 4);
                if (d.land_q7_build_type === '其他' && checkEmpty(d.land_q7_build_other)) verify(true, "section-land-q7", "7. 土地使用現況與地上物 (請填寫「其他」說明內容)", 4);
            }
        }

        if (!d?.q16_noFacilities && (d?.q16_items?.length || 0) === 0 && !d?.q16_hasOther) verify(true, "section-q16", "8. 重要環境設施", 4); 
        if (d?.q16_hasOther && checkEmpty(d.q16_other)) verify(true, "section-q16", "8. 重要環境設施 (請填寫「其他」設施說明)", 4);

        if (!d?.land_q8_special) verify(true, "section-land-q8", "9. 本案或周圍是否有須注意的事項？", 4);
        else if (d.land_q8_special === '是' && checkEmpty(d.land_q8_special_desc)) verify(true, "section-land-q8", "9. 本案或周圍是否有須注意的事項？ (請填寫詳細說明內容)", 4);
    }

    if (type === 'parking') {
        validateParkingPart(1, 2);
        if (!d?.q16_noFacilities && (d?.q16_items?.length || 0) === 0 && !d?.q16_hasOther) verify(true, "section-q16", "2. 重要環境設施", 3); 
        if (d?.q16_hasOther && checkEmpty(d.q16_other)) verify(true, "section-q16", "2. 重要環境設施 (請填寫「其他」設施說明)", 3);
        if (!d?.q17_issue) verify(true, "section-q17", "3. 本案或本社區是否有須注意的事項？", 3);
        else if (d.q17_issue === '是' && checkEmpty(d.q17_desc)) verify(true, "section-q17", "3. 本案或本社區是否有須注意的事項？ (請填寫詳細說明內容)", 3);
    }

    return errors;
};
