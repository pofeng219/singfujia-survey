
import { SurveyData, SurveyType, ValidationError } from '../types';
import { GROUP_A_TYPES } from '../constants';

class SurveyValidator {
    private errors: ValidationError[] = [];

    constructor(private d: SurveyData) {}

    // Generic check: adds error if condition is true
    check(condition: boolean, id: string, message: string, step: number) {
        if (condition) this.errors.push({ id, message, step });
    }

    // Required check: adds error if value is empty/null
    require(value: any, id: string, message: string, step: number) {
        const isEmpty = !value || (typeof value === 'string' && !value.trim());
        if (isEmpty) this.errors.push({ id, message, step });
    }

    // Conditional required: adds error if trigger is true AND value is empty
    requireIf(trigger: boolean, value: any, id: string, message: string, step: number) {
        if (trigger) this.require(value, id, message, step);
    }

    // Checkbox Group: adds error if trigger is true AND (items empty AND hasOther is false)
    requireCheckboxGroup(trigger: boolean, items: string[] | undefined, hasOther: boolean | undefined, id: string, message: string, step: number) {
        if (trigger) {
            const noItems = (items?.length || 0) === 0;
            if (noItems && !hasOther) this.errors.push({ id, message, step });
        }
    }

    // Other description: adds error if hasOther is true AND description is empty
    requireOther(hasOther: boolean | undefined, desc: string | undefined, id: string, message: string, step: number) {
        if (hasOther) this.require(desc, id, message, step);
    }

    getErrors() {
        return this.errors;
    }
}

export const validateForm = (d: SurveyData, type: SurveyType): ValidationError[] => {
    const v = new SurveyValidator(d);
    const isGroupA = GROUP_A_TYPES.includes(d.propertyType);

    // --- STEP 1: Basic Info (All Types) ---
    const s1Prefix = "第一步：基本資料";
    v.require(d.caseName, "field-caseName", `${s1Prefix} - 物件案名`, 1);
    v.require(d.authNumber, "field-authNumber", `${s1Prefix} - 委託書編號`, 1);
    v.require(d.storeName, "field-storeName", `${s1Prefix} - 所屬店名`, 1);
    v.require(d.agentName, "field-agentName", `${s1Prefix} - 調查業務`, 1);
    v.require(d.address, "field-address", `${s1Prefix} - ${type === 'land' ? '坐落位置' : (type === 'parking' ? '標的位置' : '標的地址')}`, 1);
    
    // Step 1: Property Type (Factory Only)
    if (type === 'factory') {
        v.require(d.propertyType, "section-propertyType", "本物件型態與現況", 1);
        v.requireIf(d.propertyType === '其他特殊工業設施', d.propertyTypeOther, "section-propertyType", "本物件型態與現況 (請填寫說明)", 1);
    }

    // Step 1: Property Type (House Only)
    if (type === 'house') {
        v.require(d.propertyType, "section-propertyType", "本物件型態與現況 - 請選擇物件型態", 1);
    }

    // Step 1: Property Type (Land Only)
    if (type === 'land') {
        v.require(d.propertyType, "section-propertyType", "本物件型態與現況 - 請選擇物件類型", 1);
    }

    // Step 1: Access
    const accessTitle = (type === 'factory' || type === 'house' || type === 'land') ? "本物件型態與現況" : "本物件現況";
    v.require(d.access, "section-access", `${accessTitle} (可進入／不可進入)`, 1);
    
    if (d.access === '不可進入') {
        const noAccessType = (!d.accessType || d.accessType.length === 0);
        v.check(noAccessType, "section-access", `${accessTitle} (請勾選不可進入原因)`, 1);
        v.requireIf(d.accessType?.includes('其他未列項目') || false, d.accessOther, "section-access", `${accessTitle} (請填寫不可進入之「其他」詳細內容)`, 1);
    }
    
    // --- Shared Helper: Parking Validation ---
    const validateParkingPart = (baseNum: number, startStep: number, sMain: string) => {
        const qInfo = `${baseNum}. 車位資訊`;

        // Moto
        const motoEmpty = (d.q10_motoUsage?.length || 0) === 0;
        v.check(motoEmpty && !d.q10_hasMotoUsageOther, sMain, `${qInfo}：機車車位-請至少勾選一項使用現況`, startStep);
        v.requireOther(d.q10_hasMotoUsageOther, d.q10_motoUsageOther, sMain, `${qInfo}：機車使用-請填寫「其他」說明內容`, startStep);

        if (!d.q10_noParking) {
            const typeEmpty = (d.q10_parkTypes?.length || 0) === 0;
            v.check(typeEmpty && !d.q10_hasParkTypeOther, sMain, `${qInfo}：停車方式未填寫`, startStep);
            v.requireOther(d.q10_hasParkTypeOther, d.q10_parkTypeOther, sMain, `${qInfo}：停車方式-請填寫「其他」說明內容`, startStep);
            
            // Validate Ramp/Lift Location
            v.check(d.q10_parkTypes?.includes("坡道機械") && !d.q10_rampMechLoc, sMain, `${qInfo}：請選擇「坡道機械」之層位`, startStep);
            v.check(d.q10_parkTypes?.includes("升降機械") && !d.q10_liftMechLoc, sMain, `${qInfo}：請選擇「升降機械」之層位`, startStep);

            const isOtherPt = d.q10_hasParkTypeOther === true; 
            const pts = d.q10_parkTypes || [];
            
            // Only skip dimensions validation for Legal Vacant Land (Front of House)
            // Ramp Plane and 1F Plane now require dimensions/height validation
            const isVacantLand = pts.includes("法定空地／自家門前");

            if (!isOtherPt) {
                // Validate Numbering
                v.require(d.q10_parkingNumberType, sMain, `${qInfo}：車位編號未填寫`, startStep);
                v.requireIf(d.q10_parkingNumberType === 'number', d.q10_parkingNumberVal, sMain, `${qInfo}：車位編號-請填寫編號內容`, startStep);
        
                // Validate Car Usage
                const carUsageEmpty = (d.q10_carUsage?.length || 0) === 0;
                v.check(carUsageEmpty && !d.q10_hasCarUsageOther, sMain, `${qInfo}：汽車使用現況未填寫`, startStep);
                v.requireIf(d.q10_carUsage?.includes("須固定抽籤") || false, d.q10_carLotteryMonth, sMain, `${qInfo}：汽車使用-請填寫抽籤月數`, startStep);
                v.requireOther(d.q10_hasCarUsageOther, d.q10_carUsageOther, sMain, `${qInfo}：汽車使用-請填寫「其他」說明內容`, startStep);

                // Dimensions - Updated logic: Check unless measure type is 'Unable' or 'Unable and no info' or it is Vacant Land
                if (d.q10_measureType !== '無法測量' && d.q10_measureType !== '無法測量也無相關資訊' && !isVacantLand) {
                    const dimMissing = !d.q10_dimL || !d.q10_dimW || !d.q10_dimH;
                    v.check(dimMissing, sMain, `${qInfo}：請填寫長寬高或選擇無法測量`, startStep);
                }

                // Mechanical Weight
                const isFactory = ['獨棟自建廠房', '倉儲物流廠房', '其他特殊工業設施'].includes(d.propertyType);
                const isPlaneType = pts.some(t => ["坡道平面", "一樓平面", "法定空地／自家門前"].includes(t));
                const isUnableToMeasure = d.q10_measureType === '無法測量也無相關資訊';
                
                if (!isFactory && !isPlaneType && !isUnableToMeasure) {
                     v.require(d.q10_mechWeight, sMain, `${qInfo}：機械載重未填寫`, startStep);
                }

                // Lane Land Number
                v.require(d.q10_laneSection, sMain, `${qInfo}：車道經過地號-段號未填寫`, startStep);
            }

            // Charging
            v.require(d.q10_charging, sMain, `${qInfo}：充電樁資訊未填寫`, startStep);

            // Abnormal
            if (d.q11_hasIssue === '是') {
                v.requireCheckboxGroup(true, d.q11_items, d.q11_hasOther, sMain, `${qInfo}：請勾選異常現況`, startStep);
                v.requireOther(d.q11_hasOther, d.q11_other, sMain, `${qInfo}：請填寫異常之「其他」說明`, startStep);
            }
        }
    };

    // --- HOUSE VALIDATION ---
    if (type === 'house') {
        const s2 = 2;
        v.require(d.q1_hasExt, "section-q1", "1. 增建現況未填寫", s2);
        v.requireCheckboxGroup(d.q1_hasExt === '是', d.q1_items, d.q1_hasOther, "section-q1", "1. 請勾選增建項目", s2);
        v.requireOther(d.q1_hasOther, d.q1_other, "section-q1", "1. 請填寫增建之「其他」說明", s2);

        v.require(d.q2_hasOccupancy, "section-q1", "1. 建物占用鄰地現況未填寫", s2);
        v.requireIf(d.q2_hasOccupancy !== '否', d.q2_desc, "section-q1", "1. 請填寫占用鄰地說明", s2);
        
        v.require(d.q2_other_occupancy, "section-q1", "1. 他戶建物占用本案現況未填寫", s2);
        v.requireIf(d.q2_other_occupancy !== '否', d.q2_other_occupancy_desc, "section-q1", "1. 請填寫他戶占用說明", s2);

        v.require(d.q6_hasIssue, "section-q6", "2. 面積測量現況未填寫", s2);
        const q6Issue = d.q6_hasIssue && d.q6_hasIssue !== '相符 (無明顯差異)';
        v.requireIf(!!q6Issue, d.q6_desc, "section-q6", "2. 請填寫面積差異／無法測量說明", s2);

        v.require(d.q3_hasLeak, "section-q3", "3. 滲漏水現況未填寫", s2);
        if (d.q3_hasLeak === '是') {
            v.require(d.q3_leakType, "section-q3", "3. 請選擇滲漏水/壁癌類別", s2);
            if (d.q3_leakType !== '全屋天花板包覆') {
                const locEmpty = (d.q3_locations?.length || 0) === 0;
                v.check(locEmpty && !d.q3_hasOther && !d.q3_suspected, "section-q3", "3. 請勾選或填寫發生位置", s2);
                v.requireOther(d.q3_hasOther, d.q3_other, "section-q3", "3. 請填寫「其他」位置說明", s2);
                v.requireOther(d.q3_suspected, d.q3_suspectedDesc, "section-q3", "3. 請填寫「疑似」位置說明", s2);
                
                // Repair History Validation
                v.require(d.q3_repairHistory, "section-q3", "3. 請選擇是否有修繕紀錄", s2);
                v.requireIf(d.q3_repairHistory === '有修繕紀錄', d.q3_repairDesc, "section-q3", "3. 請填寫修繕情況說明", s2);
            }
        }

        v.require(d.q4_hasIssue, "section-q4", "4. 結構瑕疵未填寫", s2);
        if (d.q4_hasIssue === '是') {
            const q4Empty = (d.q4_items?.length || 0) === 0;
            v.check(q4Empty && !d.q4_hasOther && !d.q4_suspected, "section-q4", "4. 請勾選或填寫結構瑕疵項目", s2);
            v.requireOther(d.q4_hasOther, d.q4_otherDesc, "section-q4", "4. 請填寫結構瑕疵「其他」說明", s2);
            v.requireOther(d.q4_suspected, d.q4_suspectedDesc, "section-q4", "4. 請填寫結構瑕疵「疑似」說明", s2);
        }
        
        v.require(d.q5_hasTilt, "section-q4", "4. 傾斜現況未填寫", s2);
        v.requireIf(d.q5_hasTilt === '是', d.q5_desc, "section-q4", "4. 請填寫傾斜說明", s2);

        v.require(d.q7_gasType, "section-q7", "5. 瓦斯類型未填寫", s2);
        
        // Added Solar Validation for Group A
        if (isGroupA) {
            v.require(d.house_solar_status, "section-q7", "5. 太陽能光電發電設備現況未填寫", s2);
        }

        // Added Water Booster Validation
        if (isGroupA) {
            v.require(d.water_booster, "section-q7", "5. 設置用戶加壓受水設備現況未填寫", s2);
            v.requireIf(d.water_booster === '其他未列項目', d.water_booster_desc, "section-q7", "5. 請填寫加壓設備「其他」說明", s2);
            if (d.water_booster === '有設置' || d.water_booster === '有') {
                v.check((d.water_booster_items?.length || 0) === 0, "section-q7", "5. 請勾選加壓受水設備細項", s2);
            }
        }

        // Updated Validation Message for Equipment Status
        v.require(d.q7_hasIssue, "section-q7", "5. 其他設施現況未填寫", s2);
        if (d.q7_hasIssue === '是') {
             v.requireCheckboxGroup(true, d.q7_items, d.q7_hasOther, "section-q7", "5. 請勾選異常項目", s2);
             v.requireOther(d.q7_hasOther, d.q7_otherDesc, "section-q7", "5. 請填寫「其他」說明", s2);
        }

        const s3 = 3;
        v.require(d.publicFacilities, "section-publicFacilities", "7. 公共設施情況未填寫", s3);
        v.requireIf(d.publicFacilities === '無法進入', d.publicFacilitiesReason, "section-publicFacilities", "7. 請填寫無法進入公設之原因", s3);

        v.require(d.q8_stairIssue, "section-q8", "8. 梯間/地下室異常未填寫", s3);
        if (d.q8_stairIssue === '是') {
            const stairEmpty = (d.q8_stairItems?.length || 0) === 0;
            v.check(stairEmpty && !d.q8_stairOther, "section-q8", "8. 請勾選或填寫異常情況", s3);
        }

        v.require(d.q9_hasIssue, "section-q9", "9. 社區須注意設施未填寫", s3);
        if (d.q9_hasIssue === '是') {
            v.requireCheckboxGroup(true, d.q9_items, d.q9_hasOther, "section-q9", "9. 請勾選或填寫設施", s3);
            v.requireOther(d.q9_hasOther, d.q9_otherDesc, "section-q9", "9. 請填寫「其他」設施說明", s3);
            // Solar PV Maintenance Validation (Group B only if selected in list)
            if (d.q9_items?.includes("太陽能光電發電設備")) {
                v.require(d.q9_solar_maintenance, "section-q9", "9. 請選擇太陽能光電發電設備現況", s3);
            }
            // Water Booster Maintenance Validation (Group B)
            if (d.q9_items?.includes("加壓受水設備")) {
                v.check((d.q9_water_booster_items?.length || 0) === 0, "section-q9", "9. 請勾選加壓受水設備細項", s3);
            }
        }

        validateParkingPart(10, s3, 'section-house-parking-main');

        const s4 = 4;
        
        // Hiding Logic for Validation
        const hideBuildingLine = ['大樓華廈', '公寓'].includes(d.propertyType);
        const hideDitch = ['大樓華廈', '公寓'].includes(d.propertyType);

        v.require(d.q14_access, "section-q14", "11. 進出通行與臨路未填寫", s4);
        if (d.q14_access === '通行順暢' || d.q14_access?.includes('順暢')) {
             v.require(d.q14_ownership, "section-q14", "11. 請選擇通行權屬 (公有／私人)", s4);
             v.require(d.q14_protection, "section-q14", "11. 請選擇保障類型", s4);
             const protectionNeedsDesc = ['分管協議約定', '取得地主同意書', '法院判決通行', '現狀通行／既成道路', '現況未明／無保障'].includes(d.q14_protection);
             v.requireIf(protectionNeedsDesc, d.q14_protectionDesc, "section-q14", "11. 請填寫保障類型說明", s4);
             v.require(d.q14_roadMaterial, "section-q14", "11. 請選擇路面材質", s4);
             v.requireIf(d.q14_roadMaterial === '其他未列項目', d.q14_roadMaterialOther, "section-q14", "11. 請填寫路面材質說明", s4);
             v.require(d.q14_roadWidth, "section-q14", "11. 現況路寬未填寫", s4);
             // Skip if hidden
             if (!hideDitch) {
                 v.require(d.q14_ditch, "section-q14", "11. 周圍排水溝現況未填寫", s4);
                 v.requireIf(d.q14_ditch === '其他未列項目', d.q14_ditchOther, "section-q14", "11. 請填寫排水溝說明", s4);
             }
             // Skip if hidden
             if (!hideBuildingLine) {
                 v.require(d.q14_buildingLine, "section-q14", "11. 建築線指定狀況未填寫", s4);
             }
        } else if (d.q14_access === '通行受限' || d.q14_access?.includes('受限')) {
             v.require(d.q14_abnormalDesc, "section-q14", "11. 請填寫受限說明", s4);
        }
        
        const noEnv = d.q16_noFacilities === false && (d.q16_items?.length || 0) === 0 && !d.q16_hasOther;
        v.check(noEnv, "section-q16", "12. 環境設施未勾選 (若無請勾選無重要環境設施)", s4);
        
        // Removed validation for q16_other as the option is removed from UI

        v.require(d.q17_issue, "section-q17", "13. 注意事項未填寫", s4);
        v.requireIf(d.q17_issue === '是', d.q17_desc, "section-q17", "13. 請填寫注意事項說明", s4);
    }
    
    // --- LAND VALIDATION ---
    else if (type === 'land') {
        const s2 = 2;
        v.require(d.land_q1_elec, "section-land-q1", "1. 電力供應未填寫", s2);
        v.requireIf(d.land_q1_elec === '其他未列項目', d.land_q1_elec_other, "section-land-q1", "1. 請填寫電力「其他」說明", s2);
        
        v.require(d.land_q1_water, "section-land-q1", "1. 水源供應未填寫", s2);
        if (d.land_q1_water === '是') {
             v.require(d.land_q1_water_cat, "section-land-q1", "1. 請選擇水源類別", s2);
             v.requireIf(d.land_q1_water_cat === '自來水', d.land_q1_water_tap_detail, "section-land-q1", "1. 請選擇自來水詳細情況", s2);
        }
        v.requireIf(d.land_q1_water === '其他未列項目', d.land_q1_water_other, "section-land-q1", "1. 請填寫水源「其他」說明", s2);

        // Old Q2 moved to Step 4, so here we validate old Q3 (now Q2)
        v.require(d.land_q3_survey, "section-land-q3", "2. 鑑界紀錄未填寫", s2);
        v.require(d.land_q3_dispute, "section-land-q3", "2. 糾紛現況未填寫", s2);

        // Old Q4 (now Q3)
        v.require(d.land_q4_expro, "section-land-q4", "3. 徵收預定地現況未填寫", s2);
        v.require(d.land_q4_resurvey, "section-land-q4", "3. 重測區域現況未填寫", s2);

        // Old Q5 (now Q4 in Step 2)
        v.require(d.land_q5_encroached, "section-land-q5", "4. 被占用現況未填寫", s2);
        v.requireIf(d.land_q5_encroached === '是', d.land_q5_encroached_desc, "section-land-q5", "4. 請填寫被占用說明", s2);
        
        v.require(d.land_q5_encroaching, "section-land-q5", "4. 占用鄰地現況未填寫", s2);
        v.requireIf(d.land_q5_encroaching === '是', d.land_q5_encroaching_desc, "section-land-q5", "4. 請填寫占用鄰地說明", s2);

        const s3 = 3;

        // Old Q6 (now Q5)
        v.require(d.land_q6_limit, "section-land-q6", "5. 禁建／限建現況未填寫", s3);
        v.requireIf(d.land_q6_limit === '是', d.land_q6_limit_desc, "section-land-q6", "5. 請填寫限建說明", s3);

        // Old Q7 (now Q6)
        v.require(d.land_q7_user, "section-land-q7", "6. 現況使用人未填寫", s3);
        v.requireIf(d.land_q7_user === '非所有權人使用', d.land_q7_user_detail, "section-land-q7", "6. 請選擇非所有權人使用現況", s3);

        v.require(d.land_q7_crops, "section-land-q7", "6. 農作物現況未填寫", s3);
        v.require(d.land_q7_build, "section-land-q7", "6. 地上建物現況未填寫", s3);
        v.require(d.land_q7_solar, "section-land-q7", "6. 太陽能光電發電設備現況未填寫", s3);

        // Added Water Booster Validation for Land (Step 3 Q6)
        v.require(d.land_water_booster, "section-land-q7", "6. 加壓受水設備現況未填寫", s3);
        if (d.land_water_booster === '有設置' || d.land_water_booster === '有') {
            v.check((d.land_water_booster_items?.length || 0) === 0, "section-land-q7", "6. 請勾選加壓受水設備細項", s3);
        }

        if (d.propertyType === '農地') {
            v.require(d.land_q7_illegal_paving, "section-land-q7", "6. 土地鋪面現況未填寫", s3);
        }
        if (d.propertyType === '工業地') {
            v.require(d.land_q7_fire_setback, "section-land-q7", "6. 防火間隔與區劃現況未填寫", s3);
        }
        if (d.propertyType === '其他(道路用地／公設地)') {
            v.require(d.land_q7_road_opened, "section-land-q7", "6. 計畫道路開闢現況未填寫", s3);
        }

        // New Q7 (Facilities)
        v.require(d.land_q7_facilities, "section-land-q7-facilities", "7. 本案或周圍須注意設施未填寫", s3);
        if (d.land_q7_facilities === '是' || d.land_q7_facilities === '有') {
            v.requireCheckboxGroup(true, d.land_q7_facilities_items, false, "section-land-q7-facilities", "7. 請勾選設施項目", s3);
            const hasOther = d.land_q7_facilities_items?.includes('其他未列項目');
            v.requireIf(hasOther || false, d.land_q7_facilities_other, "section-land-q7-facilities", "7. 請填寫設施「其他」說明", s3);
        }
        
        const s4 = 4;
        // Access becomes Q8
        v.require(d.land_q2_access, "section-land-q2", "8. 進出通行與臨路現況未填寫", s4);
        if (d.land_q2_access === '通行順暢' || d.land_q2_access?.includes('順暢')) {
             v.require(d.land_q2_owner, "section-land-q2", "8. 請選擇臨路歸屬權", s4);
             v.require(d.land_q2_protection, "section-land-q2", "8. 請選擇保障類型", s4); // Added Protection Validation
             const protectionNeedsDesc = ['分管協議約定', '取得地主同意書', '法院判決通行', '現狀通行／既成道路', '現況未明／無保障'].includes(d.land_q2_protection);
             v.requireIf(protectionNeedsDesc, d.land_q2_protectionDesc, "section-land-q2", "8. 請填寫保障類型說明", s4);
             v.require(d.land_q2_material, "section-land-q2", "8. 請選擇路面材質", s4);
             v.require(d.land_q2_roadWidth, "section-land-q2", "8. 現況路寬未填寫", s4);
             v.require(d.land_q2_buildingLine, "section-land-q2", "8. 建築線指定狀況未填寫", s4);
             v.require(d.land_q2_ditch, "section-land-q2", "8. 臨路排水溝現況未填寫", s4);
        } else if (d.land_q2_access === '通行受限' || d.land_q2_access?.includes('受限')) {
             v.require(d.land_q2_access_desc, "section-land-q2", "8. 請填寫受限說明", s4);
        }

        // Soil becomes Q9
        v.require(d.soil_q1_status, "section-soil", "9. 土壤汙染與地下掩埋物現況未填寫", s4);
        v.requireIf(d.soil_q1_status === '有', d.soil_q1_desc, "section-soil", "9. 請填寫土壤／地下物說明", s4);

        // Env becomes Q10
        const noEnv = d.q16_noFacilities === false && (d.q16_items?.length || 0) === 0 && !d.q16_hasOther;
        v.check(noEnv, "section-q16", "10. 環境設施未勾選", s4);
        
        // Notes becomes Q11
        v.require(d.land_q8_special, "section-land-q8", "11. 注意事項未填寫", s4);
        v.requireIf(d.land_q8_special === '是', d.land_q8_special_desc, "section-land-q8", "11. 請填寫注意事項說明", s4);
    }

    // --- FACTORY VALIDATION ---
    else if (type === 'factory') {
        const s2 = 2;
        
        // Q1 Extension
        v.require(d.q1_hasExt, "section-q1", "1. 增建現況未填寫", s2);
        v.requireCheckboxGroup(d.q1_hasExt === '是', d.q1_items, d.q1_hasOther, "section-q1", "1. 請勾選增建項目", s2);
        v.requireOther(d.q1_hasOther, d.q1_other, "section-q1", "1. 請填寫增建之「其他」說明", s2);

        v.require(d.q2_hasOccupancy, "section-q1", "1. 建物占用鄰地現況未填寫", s2);
        v.requireIf(d.q2_hasOccupancy !== '否', d.q2_desc, "section-q1", "1. 請填寫占用鄰地說明", s2);
        
        v.require(d.q2_other_occupancy, "section-q1", "1. 他戶建物占用本案現況未填寫", s2);
        v.requireIf(d.q2_other_occupancy !== '否', d.q2_other_occupancy_desc, "section-q1", "1. 請填寫他戶占用說明", s2);

        // Q2 Area (Stored as q6)
        v.require(d.q6_hasIssue, "section-q6", "2. 面積測量現況未填寫", s2);
        const q6Issue = d.q6_hasIssue && d.q6_hasIssue !== '相符 (無明顯差異)';
        v.requireIf(!!q6Issue, d.q6_desc, "section-q6", "2. 請填寫面積差異／無法測量說明", s2);

        // Q3 Leakage
        v.require(d.q3_hasLeak, "section-q3", "3. 滲漏水現況未填寫", s2);
        if (d.q3_hasLeak === '是') {
            v.require(d.q3_leakType, "section-q3", "3. 請選擇滲漏水／壁癌類別", s2);
            if (d.q3_leakType !== '全屋天花板包覆') {
                const locEmpty = (d.q3_locations?.length || 0) === 0;
                v.check(locEmpty && !d.q3_hasOther && !d.q3_suspected, "section-q3", "3. 請勾選或填寫發生位置", s2);
                v.requireOther(d.q3_hasOther, d.q3_other, "section-q3", "3. 請填寫「其他」位置說明", s2);
                v.requireOther(d.q3_suspected, d.q3_suspectedDesc, "section-q3", "3. 請填寫「疑似」位置說明", s2);
                
                // Repair History Validation
                v.require(d.q3_repairHistory, "section-q3", "3. 請選擇是否有修繕紀錄", s2);
                v.requireIf(d.q3_repairHistory === '有修繕紀錄', d.q3_repairDesc, "section-q3", "3. 請填寫修繕現況說明", s2);
            }
        }

        // Q4 Structure
        v.require(d.q4_hasIssue, "section-q4", "4. 結構瑕疵未填寫", s2);
        if (d.q4_hasIssue === '是') {
            const q4Empty = (d.q4_items?.length || 0) === 0;
            v.check(q4Empty && !d.q4_hasOther && !d.q4_suspected, "section-q4", "4. 請勾選或填寫結構瑕疵項目", s2);
            v.requireOther(d.q4_hasOther, d.q4_otherDesc, "section-q4", "4. 請填寫結構瑕疵「其他」說明", s2);
            v.requireOther(d.q4_suspected, d.q4_suspectedDesc, "section-q4", "4. 請填寫結構瑕疵「疑似」說明", s2);
        }
        
        v.require(d.q5_hasTilt, "section-q4", "4. 傾斜現況未填寫", s2);
        v.requireIf(d.q5_hasTilt === '是', d.q5_desc, "section-q4", "4. 請填寫傾斜說明", s2);

        const s3 = 3;
        v.require(d.factory_height, "section-factory-struct", "5. 高度未填寫", s3);
        v.require(d.factory_column_spacing, "section-factory-struct", "5. 柱距未填寫", s3);
        
        // Updated Floor Load Validation: Skip if unknown
        if (!d.factory_floor_load_unknown) {
            v.require(d.factory_floor_load, "section-factory-struct", "5. 載重未填寫", s3);
        }
        
        v.require(d.factory_floor_condition, "section-factory-struct", "5. 地坪狀況未填寫", s3);
        
        // Factory Utilities
        v.require(d.land_q1_elec, "section-factory-q6", "6. 電、水與其他設施現況未填寫 (電力)", s3);
        v.require(d.land_q1_water, "section-factory-q6", "6. 電、水與其他設施現況未填寫 (水源)", s3);

        // Added Solar Validation for Factory
        v.require(d.house_solar_status, "section-factory-q6", "6. 太陽能光電發電設備現況未填寫", s3);

        // Added Water Booster Validation
        v.require(d.water_booster, "section-factory-q6", "6. 用戶加壓受水設備現況未填寫", s3);
        v.requireIf(d.water_booster === '其他未列項目', d.water_booster_desc, "section-factory-q6", "6. 請填寫加壓設備「其他」說明", s3);
        if (d.water_booster === '有設置') {
            v.check((d.water_booster_items?.length || 0) === 0, "section-factory-q6", "6. 請勾選加壓受水設備細項", s3);
        }

        // Hardware
        v.require(d.factory_elevator, "section-factory-hardware", "7. 貨梯資訊未填寫", s3);
        v.require(d.factory_crane, "section-factory-hardware", "7. 天車資訊未填寫", s3);
        v.require(d.factory_waste, "section-factory-hardware", "7. 廢水／廢氣資訊未填寫", s3);

        // Logistics
        v.require(d.factory_loading_dock, "section-factory-logistics", "8. 卸貨碼頭資訊未填寫", s3);
        v.require(d.factory_truck_access, "section-factory-logistics", "8. 大車進出資訊未填寫", s3);

        const simpleParking = ['獨棟自建廠房', '倉儲物流廠房', '其他特殊工業設施'].includes(d.propertyType);
        if (simpleParking) {
             v.require(d.factory_parking_desc, "section-factory-parking", "9. 車位資訊說明未填寫", s3);
        } else {
             validateParkingPart(9, s3, 'section-factory-parking');
        }

        // Q10 Facilities (New)
        v.require(d.q9_hasIssue, "section-factory-q10", "10. 本案或本社區須注意的設施未填寫", s3);
        if (d.q9_hasIssue === '是') {
            v.requireCheckboxGroup(true, d.q9_items, d.q9_hasOther, "section-factory-q10", "10. 請勾選或填寫設施", s3);
            v.requireOther(d.q9_hasOther, d.q9_otherDesc, "section-factory-q10", "10. 請填寫「其他」設施說明", s3);
            // Solar PV Maintenance Validation
            if (d.q9_items?.includes("太陽能光電發電設備")) {
                const label = ['獨棟自建廠房', '倉儲物流廠房'].includes(d.propertyType) ? "設置現況" : "維護方式";
                v.require(d.q9_solar_maintenance, "section-factory-q10", `10. 請選擇太陽能光電發電設備${label}`, s3);
            }
            if (d.q9_items?.includes("加壓受水設備")) {
                v.check((d.q9_water_booster_items?.length || 0) === 0, "section-factory-q10", "10. 請勾選加壓受水設備細項", s3);
            }
        }

        const s4 = 4;
        
        // Hiding Logic for Validation
        const isHiRise = (d.propertyType === "立體化廠辦大樓"); 
        const hideLandDetails = (d.propertyType === "立體化廠辦大樓" || d.propertyType === "園區標準廠房（集合式／分租型）");
        const hideSoil = isHiRise;
        const hideBuildingLine = ['立體化廠辦大樓', '園區標準廠房（集合式／分租型）'].includes(d.propertyType);
        const hideDitch = ['立體化廠辦大樓'].includes(d.propertyType);
        
        // Numbering variables to match FormSteps
        let accessNum = 11;
        let landQ3Num = 12;
        let landQ4Num = 13;
        let soilNum = hideLandDetails ? 12 : 14;
        let envNum = hideSoil ? 12 : (hideLandDetails ? 13 : 15);
        let noteNum = envNum + 1;

        // Always validate Land Access (User Request: Do not hide access)
        v.require(d.land_q2_access, "section-land-q2", `${accessNum}. 進出通行現況未填寫`, s4);
        if (d.land_q2_access === '通行順暢' || d.land_q2_access?.includes('順暢')) {
             v.require(d.land_q2_owner, "section-land-q2", `${accessNum}. 請選擇臨路歸屬權`, s4);
             v.require(d.land_q2_protection, "section-land-q2", `${accessNum}. 請選擇保障類型`, s4); // Added
             const protectionNeedsDesc = ['分管協議約定', '取得地主同意書', '法院判決通行', '現狀通行／既成道路', '現況未明／無保障'].includes(d.land_q2_protection);
             v.requireIf(protectionNeedsDesc, d.land_q2_protectionDesc, "section-land-q2", `${accessNum}. 請填寫保障類型說明`, s4);
             v.require(d.land_q2_material, "section-land-q2", `${accessNum}. 請選擇路面材質`, s4);
             v.require(d.land_q2_roadWidth, "section-land-q2", `${accessNum}. 現況路寬未填寫`, s4);
             // Skip if hidden
             if (!hideDitch) {
                 v.require(d.land_q2_ditch, "section-land-q2", `${accessNum}. 周圍排水溝現況未填寫`, s4);
             }
             // Skip if hidden
             if (!hideBuildingLine) {
                 v.require(d.land_q2_buildingLine, "section-land-q2", `${accessNum}. 建築線指定狀況未填寫`, s4);
             }
        }
        
        if (!hideLandDetails) {
             v.require(d.land_q3_survey, "section-land-q3", `${landQ3Num}. 鑑界紀錄未填寫`, s4);
             v.require(d.land_q3_dispute, "section-land-q3", `${landQ3Num}. 糾紛現況未填寫`, s4);
             v.require(d.land_q4_expro, "section-land-q4", `${landQ4Num}. 徵收地預定地現況未填寫`, s4);
             v.require(d.land_q4_resurvey, "section-land-q4", `${landQ4Num}. 重測區域現況未填寫`, s4);
        }

        // Numbering adjusts based on hidden sections, but logic remains attached to keys
        // Soil - Validate if NOT hidden
        if (!hideSoil) {
             v.require(d.soil_q1_status, "section-soil", `${soilNum}. 土壤汙染與地下掩埋物現況未填寫`, s4);
             v.requireIf(d.soil_q1_status === '有', d.soil_q1_desc, "section-soil", `${soilNum}. 請填寫土壤汙染／地下掩埋物說明`, s4);
        }

        const noEnv = d.q16_noFacilities === false && (d.q16_items?.length || 0) === 0 && !d.q16_hasOther;
        v.check(noEnv, "section-q16", `${envNum}. 環境設施未勾選`, s4);
        
        v.require(d.q17_issue, "section-q17", `${noteNum}. 注意事項未填寫`, s4);
        v.requireIf(d.q17_issue === '是', d.q17_desc, "section-q17", `${noteNum}. 請填寫注意事項說明`, s4);
    }

    // --- PARKING VALIDATION ---
    else if (type === 'parking') {
        const s2 = 2;
        validateParkingPart(1, s2, 'section-parking-main');
        
        const s3 = 3;
        const noEnv = d.q16_noFacilities === false && (d.q16_items?.length || 0) === 0 && !d.q16_hasOther;
        v.check(noEnv, "section-q16", "2. 環境設施未勾選", s3);
        
        v.require(d.q17_issue, "section-q17", "3. 注意事項未填寫", s3);
        v.requireIf(d.q17_issue === '是', d.q17_desc, "section-q17", "3. 請填寫注意事項說明", s3);
    }

    return v.getErrors();
};
