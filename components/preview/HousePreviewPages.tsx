import { SurveyData } from "../../types";
import { GROUP_A_TYPES } from "../../constants";
import { useInterface } from "../InterfaceContext";
import {
  PreviewResult,
  CheckRow,
  SectionHeader,
  TableHeaderRow,
  ParkingContent,
  PreviewBlock,
} from "./PreviewShared";
import {
  getHouseLabels,
  CommonExtraQuestions,
  getCommonExtraBlocks,
} from "./PreviewCommonBlocks";

const HouseUtilitiesSection = ({ data }: { data: SurveyData }) => {
  const labels = getHouseLabels(data);
  const isGroupA = GROUP_A_TYPES.includes(data.propertyType);
  const showSolar = isGroupA;
  const isGasNone = data?.q7_gasType === "完全無設置";

  return (
    <>
      <SectionHeader title="5. 電、水、瓦斯與其他設施使用現況" />

      <CheckRow checked={!!data?.q7_gasType && !isGasNone}>
        <span className="font-bold mr-2">瓦斯供應類型</span>
        <PreviewResult
          checked={!!data?.q7_gasType}
          label={data.q7_gasType}
          isWarning={isGasNone}
          forceSafe={!isGasNone}
        />
      </CheckRow>

      <CheckRow checked={data?.q7_hasIssue === "否"}>
        <span className="font-bold mr-2">電、水、瓦斯與其他設施使用現況</span>
        <PreviewResult checked={data?.q7_hasIssue === "否"} label="無異常" />
        <PreviewResult
          checked={data?.q7_hasIssue === "是"}
          label={labels.q7() || (!data?.q7_hasOther ? "有異常" : "")}
          isWarning={true}
        />
        <PreviewResult
          checked={!!data?.q7_hasOther}
          label={
            data?.q7_otherDesc
              ? `其他未列項目：${data.q7_otherDesc}`
              : "其他未列項目"
          }
          isWarning={true}
        />
      </CheckRow>

      {showSolar && (
        <CheckRow
          checked={
            data?.house_solar_status === "無設置" ||
            data?.house_solar_status === "無" ||
            data?.house_solar_status === "合法設置"
          }
        >
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
        </CheckRow>
      )}

      {isGroupA && data?.water_booster && (
        <CheckRow
          checked={
            data?.water_booster === "無" || data?.water_booster === "無設置"
          }
        >
          <span className="font-bold mr-2">用戶加壓受水設備現況</span>
          <PreviewResult
            checked={
              data.water_booster === "有設置" || data.water_booster === "有"
            }
            label={`有設置${data.water_booster_items && data.water_booster_items.length > 0 ? ` （${data.water_booster_items.join("、")}）` : ""}`}
            isWarning={true}
          />
          <PreviewResult
            checked={data?.water_booster === "其他未列項目"}
            label={
              data.water_booster_desc
                ? `其他未列項目 （${data.water_booster_desc}）`
                : "其他未列項目"
            }
            isWarning={true}
          />
          <PreviewResult
            checked={
              data?.water_booster === "無" || data?.water_booster === "無設置"
            }
            label="無設置"
          />
        </CheckRow>
      )}
    </>
  );
};

export const HousePrintPage1 = ({ data }: { data: SurveyData }) => {
  const isStandard = useInterface() === "standard";
  const labels = getHouseLabels(data);

  return (
    <>
      <TableHeaderRow />
      <SectionHeader title="1. 增建、占用與被占用現況" />
      <CheckRow checked={data?.q1_hasExt === "否"}>
        <span className="font-bold mr-2">增建（含違建）現況</span>
        <PreviewResult checked={data?.q1_hasExt === "否"} label="無" />
        <PreviewResult
          checked={data?.q1_hasExt === "是"}
          label={labels.q1() || (!data?.q1_hasOther ? "有" : "")}
          isWarning={true}
        />
        <PreviewResult
          checked={!!data?.q1_hasOther}
          label={
            data?.q1_other ? `其他未列項目：${data.q1_other}` : "其他未列項目"
          }
          isWarning={true}
        />
      </CheckRow>

      <CheckRow checked={data?.q2_hasOccupancy === "否"}>
        <span className="font-bold mr-2">占用鄰地</span>
        <PreviewResult checked={data?.q2_hasOccupancy === "否"} label="無" />
        <PreviewResult
          checked={data?.q2_hasOccupancy !== "否" && !!data?.q2_hasOccupancy}
          label={
            (data?.q2_hasOccupancy === "是" ? "有" : data?.q2_hasOccupancy) +
            (data?.q2_desc ? "：" + data.q2_desc : "")
          }
          isWarning={true}
        />
      </CheckRow>
      <CheckRow checked={data?.q2_other_occupancy === "否"}>
        <span className="font-bold mr-2">被占用</span>
        <PreviewResult
          checked={data?.q2_other_occupancy === "否"}
          label="無"
        />
        <PreviewResult
          checked={
            data?.q2_other_occupancy !== "否" && !!data?.q2_other_occupancy
          }
          label={
            (data?.q2_other_occupancy === "是"
              ? "有"
              : data?.q2_other_occupancy) +
            (data?.q2_other_occupancy_desc
              ? "：" + data.q2_other_occupancy_desc
              : "")
          }
          isWarning={true}
        />
      </CheckRow>

      <SectionHeader title="2. 現場長寬和建物測量成果圖比對，與建物面積現況評估" />
      <CheckRow
        checked={
          data?.q6_hasIssue === "實測相符" ||
          data?.q6_hasIssue === "相符 (無明顯差異)"
        }
      >
        <span className="font-bold mr-2">面積測量</span>
        <PreviewResult
          checked={
            data?.q6_hasIssue === "實測相符" ||
            data?.q6_hasIssue === "相符 (無明顯差異)"
          }
          label="實測相符"
          forceSafe={true}
        />
        <PreviewResult
          checked={
            data?.q6_hasIssue !== "實測相符" &&
            data?.q6_hasIssue !== "相符 (無明顯差異)" &&
            !!data?.q6_hasIssue
          }
          label={data?.q6_hasIssue + (data?.q6_desc ? "：" + data.q6_desc : "")}
          isWarning={true}
        />
      </CheckRow>

      <SectionHeader title="3. 滲漏水與壁癌現況" />
      <CheckRow checked={data?.q3_hasLeak === "否"}>
        <span className="font-bold mr-2">滲漏水／壁癌</span>
        <PreviewResult
          checked={data?.q3_hasLeak === "否"}
          label="無（現況乾燥）"
        />
        <PreviewResult
          checked={data?.q3_hasLeak === "是"}
          label={labels.q3() || "有（含壁癌／水漬／修繕痕跡）"}
          isWarning={true}
        />
        <PreviewResult
          checked={data?.q3_repairHistory === "無修繕紀錄"}
          label="（無修繕紀錄）"
        />
        <PreviewResult
          checked={data?.q3_repairHistory === "有修繕紀錄"}
          label={
            data?.q3_repairDesc
              ? `（有修繕紀錄：${data.q3_repairDesc}）`
              : "（有修繕紀錄）"
          }
          isWarning={true}
        />
      </CheckRow>

      <SectionHeader title="4. 建物結構安全評估（含瑕疵與傾斜）" />
      <CheckRow checked={data?.q4_hasIssue === "否"}>
        <span className="font-bold mr-2">結構瑕疵</span>
        <PreviewResult checked={data?.q4_hasIssue === "否"} label="無" />
        <PreviewResult
          checked={data?.q4_hasIssue === "是"}
          label={labels.q4() || (!data?.q4_hasOther ? "有" : "")}
          isWarning={true}
        />
        <PreviewResult
          checked={!!data?.q4_hasOther}
          label={
            data?.q4_otherDesc
              ? `其他未列項目：${data.q4_otherDesc}`
              : "其他未列項目"
          }
          isWarning={true}
        />
      </CheckRow>
      <CheckRow checked={data?.q5_hasTilt === "否"}>
        <span className="font-bold mr-2">傾斜現況</span>
        <PreviewResult checked={data?.q5_hasTilt === "否"} label="無" />
        <PreviewResult
          checked={data?.q5_hasTilt !== "否" && !!data?.q5_hasTilt}
          label={
            (data?.q5_hasTilt === "是"
              ? "有"
              : data?.q5_hasTilt === "待查證"
                ? "待查證（待測量）"
                : data?.q5_hasTilt) +
            (data?.q5_desc ? "：" + data.q5_desc : "") +
            (data?.q5_suspectedDesc ? "：" + data.q5_suspectedDesc : "")
          }
          isWarning={true}
        />
      </CheckRow>

      {isStandard && <HouseUtilitiesSection data={data} />}
    </>
  );
};

export const HousePrintPage2 = ({
  data,
  parkingSummary,
  activeMode,
}: {
  data: SurveyData;
  parkingSummary: any;
  activeMode: any;
}) => {
  const isStandard = useInterface() === "standard";
  const labels = getHouseLabels(data);
  return (
    <>
      {!isStandard && <HouseUtilitiesSection data={data} />}
      <SectionHeader title="6. 大樓與社區公共設施（可否進入／使用）" />
      <CheckRow
        checked={
          data?.publicFacilities === "有公共設施" ||
          data?.publicFacilities === "無公共設施"
        }
      >
        <span className="font-bold mr-2">公共設施</span>
        <PreviewResult
          checked={data?.publicFacilities === "有公共設施"}
          label="有公共設施"
        />
        <PreviewResult
          checked={data?.publicFacilities === "無公共設施"}
          label="無公共設施"
        />
        <PreviewResult
          checked={data?.publicFacilities === "無法進入"}
          label={
            data.publicFacilitiesReason
              ? `無法進入 （${data.publicFacilitiesReason}）`
              : "無法進入"
          }
          isWarning={true}
        />
      </CheckRow>

      <SectionHeader title="7. 公設空間（梯間／地下室）" />
      <CheckRow
        checked={
          data?.q8_stairIssue === "否" ||
          data?.q8_stairIssue === "無異常" ||
          data?.q8_stairIssue === "無公共設施" ||
          data?.q8_stairIssue === "有公共設施"
        }
      >
        <span className="font-bold mr-2">公設空間（梯間／地下室）</span>
        <PreviewResult
          checked={
            data?.q8_stairIssue === "是" || data?.q8_stairIssue === "有異常"
          }
          label={
            labels.q6() ||
            (!(
              data?.q8_stairItems?.includes("其他未列項目") ||
              data?.q8_stairItems?.includes("其他")
            )
              ? "有異常"
              : "")
          }
          isWarning={true}
        />
        <PreviewResult
          checked={
            !!(
              (data?.q8_stairIssue === "是" ||
                data?.q8_stairIssue === "有異常") &&
              (data?.q8_stairItems?.includes("其他未列項目") ||
                data?.q8_stairItems?.includes("其他"))
            )
          }
          label={
            data?.q8_stairOther
              ? `其他未列項目：${data.q8_stairOther}`
              : "其他未列項目"
          }
          isWarning={true}
        />
        <PreviewResult
          checked={data?.q8_stairIssue === "無公共設施"}
          label="無公共設施"
        />
        <PreviewResult
          checked={data?.q8_stairIssue === "有公共設施"}
          label="有公共設施"
        />
        <PreviewResult
          checked={
            data?.q8_stairIssue === "否" || data?.q8_stairIssue === "無異常"
          }
          label="無異常"
        />
      </CheckRow>

      <SectionHeader title="8. 物件與社區內須注意的設施" />
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

      <SectionHeader title="9. 車位資訊" />
      <CheckRow
        checked={
          !!data?.q10_noParking ||
          (data?.q10_parkTypes && data.q10_parkTypes.length > 0) ||
          !!data?.q10_hasParkTypeOther
        }
      >
        <span className="font-bold mr-2">車位資訊</span>
        <ParkingContent
          data={data}
          parkingSummary={parkingSummary}
          activeMode={activeMode}
        />
      </CheckRow>
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
            data?.q11_hasIssue === "否" || data?.q11_hasIssue === "無異常"
          }
          label="無異常"
        />
        <PreviewResult
          checked={
            data?.q11_hasIssue === "是" || data?.q11_hasIssue === "有異常"
          }
          label={
            [
              ...(data?.q11_items || []),
              data?.q11_hasOther
                ? data.q11_other
                  ? `其他未列項目：${data.q11_other}`
                  : "其他未列項目"
                : "",
            ]
              .filter(Boolean)
              .join("、") || "有異常"
          }
          isWarning={true}
        />
      </CheckRow>
      <CheckRow checked={!!data?.q10_noParking || data?.q12_hasNote === "否"}>
        <span className="font-bold mr-2">車位與車道其他備註</span>
        <PreviewResult checked={data?.q12_hasNote === "否"} label="無" />
        <PreviewResult
          checked={data?.q12_hasNote === "是"}
          label={data?.q12_note || "有"}
          isWarning={true}
        />
      </CheckRow>
    </>
  );
};

export const HousePrintPage3 = ({ data }: { data: SurveyData }) => {
  return (
    <>
      <CommonExtraQuestions data={data} startIdx={10} type="house" />
    </>
  );
};

export const getHousePreviewBlocks = (
  data: SurveyData,
  parkingSummary: any,
  activeMode: "a4" | "mobile",
): PreviewBlock[] => {
  const labels = getHouseLabels(data);
  return [
    {
      id: "house-q1",
      node: (
        <>
          <SectionHeader title="1. 增建、占用與被占用現況" />
          <CheckRow checked={data?.q1_hasExt === "否"}>
            <span className="font-bold mr-2">增建（含違建）現況</span>
            <PreviewResult checked={data?.q1_hasExt === "否"} label="無" />
            <PreviewResult
              checked={data?.q1_hasExt === "是"}
              label={labels.q1() || (!data?.q1_hasOther ? "有" : "")}
              isWarning={true}
            />
            <PreviewResult
              checked={!!data?.q1_hasOther}
              label={
                data?.q1_other
                  ? `其他未列項目：${data.q1_other}`
                  : "其他未列項目"
              }
              isWarning={true}
            />
          </CheckRow>
          <CheckRow checked={data?.q2_hasOccupancy === "否"}>
            <span className="font-bold mr-2">占用鄰地</span>
            <PreviewResult checked={data?.q2_hasOccupancy === "否"} label="無" />
            <PreviewResult
              checked={data?.q2_hasOccupancy !== "否" && !!data?.q2_hasOccupancy}
              label={
                (data?.q2_hasOccupancy === "是" ? "有" : data?.q2_hasOccupancy) +
                (data?.q2_desc ? "：" + data.q2_desc : "")
              }
              isWarning={true}
            />
          </CheckRow>
          <CheckRow checked={data?.q2_other_occupancy === "否"}>
            <span className="font-bold mr-2">被占用</span>
            <PreviewResult
              checked={data?.q2_other_occupancy === "否"}
              label="無"
            />
            <PreviewResult
              checked={
                data?.q2_other_occupancy !== "否" && !!data?.q2_other_occupancy
              }
              label={
                (data?.q2_other_occupancy === "是"
                  ? "有"
                  : data?.q2_other_occupancy) +
                (data?.q2_other_occupancy_desc
                  ? "：" + data.q2_other_occupancy_desc
                  : "")
              }
              isWarning={true}
            />
          </CheckRow>
        </>
      ),
    },
    {
      id: "house-q2",
      node: (
        <>
          <SectionHeader title="2. 現場長寬和建物測量成果圖比對，與建物面積現況評估" />
          <CheckRow
            checked={
              data?.q6_hasIssue === "實測相符" ||
              data?.q6_hasIssue === "相符 (無明顯差異)"
            }
          >
            <span className="font-bold mr-2">面積測量</span>
            <PreviewResult
              checked={
                data?.q6_hasIssue === "實測相符" ||
                data?.q6_hasIssue === "相符 (無明顯差異)"
              }
              label="實測相符"
              forceSafe={true}
            />
            <PreviewResult
              checked={
                data?.q6_hasIssue !== "實測相符" &&
                data?.q6_hasIssue !== "相符 (無明顯差異)" &&
                !!data?.q6_hasIssue
              }
              label={data?.q6_hasIssue + (data?.q6_desc ? "：" + data.q6_desc : "")}
              isWarning={true}
            />
          </CheckRow>
        </>
      ),
    },
    {
      id: "house-q3",
      node: (
        <>
          <SectionHeader title="3. 滲漏水與壁癌現況" />
          <CheckRow checked={data?.q3_hasLeak === "否"}>
            <span className="font-bold mr-2">滲漏水／壁癌</span>
            <PreviewResult
              checked={data?.q3_hasLeak === "否"}
              label="無（現況乾燥）"
            />
            <PreviewResult
              checked={data?.q3_hasLeak === "是"}
              label={labels.q3() || "有（含壁癌／水漬／修繕痕跡）"}
              isWarning={true}
            />
            <PreviewResult
              checked={data?.q3_repairHistory === "無修繕紀錄"}
              label="（無修繕紀錄）"
            />
            <PreviewResult
              checked={data?.q3_repairHistory === "有修繕紀錄"}
              label={
                data?.q3_repairDesc
                  ? `（有修繕紀錄：${data.q3_repairDesc}）`
                  : "（有修繕紀錄）"
              }
              isWarning={true}
            />
          </CheckRow>
        </>
      ),
    },
    {
      id: "house-q4",
      node: (
        <>
          <SectionHeader title="4. 建物結構安全評估（含瑕疵與傾斜）" />
          <CheckRow checked={data?.q4_hasIssue === "否"}>
            <span className="font-bold mr-2">結構瑕疵</span>
            <PreviewResult checked={data?.q4_hasIssue === "否"} label="無" />
            <PreviewResult
              checked={data?.q4_hasIssue === "是"}
              label={labels.q4() || (!data?.q4_hasOther ? "有" : "")}
              isWarning={true}
            />
            <PreviewResult
              checked={!!data?.q4_hasOther}
              label={
                data?.q4_otherDesc
                  ? `其他未列項目：${data.q4_otherDesc}`
                  : "其他未列項目"
              }
              isWarning={true}
            />
          </CheckRow>
          <CheckRow checked={data?.q5_hasTilt === "否"}>
            <span className="font-bold mr-2">傾斜現況</span>
            <PreviewResult checked={data?.q5_hasTilt === "否"} label="無" />
            <PreviewResult
              checked={data?.q5_hasTilt !== "否" && !!data?.q5_hasTilt}
              label={
                (data?.q5_hasTilt === "是"
                  ? "有"
                  : data?.q5_hasTilt === "待查證"
                    ? "待查證（待測量）"
                    : data?.q5_hasTilt) +
                (data?.q5_desc ? "：" + data.q5_desc : "") +
                (data?.q5_suspectedDesc ? "：" + data.q5_suspectedDesc : "")
              }
              isWarning={true}
            />
          </CheckRow>
        </>
      ),
    },
    {
      id: "house-q5",
      node: <HouseUtilitiesSection data={data} />,
    },
    {
      id: "house-q6",
      node: (
        <>
          <SectionHeader title="6. 大樓與社區公共設施（可否進入／使用）" />
          <CheckRow
            checked={
              data?.publicFacilities === "有公共設施" ||
              data?.publicFacilities === "無公共設施"
            }
          >
            <span className="font-bold mr-2">公共設施</span>
            <PreviewResult
              checked={data?.publicFacilities === "有公共設施"}
              label="有公共設施"
            />
            <PreviewResult
              checked={data?.publicFacilities === "無公共設施"}
              label="無公共設施"
            />
            <PreviewResult
              checked={data?.publicFacilities === "無法進入"}
              label={
                data.publicFacilitiesReason
                  ? `無法進入 （${data.publicFacilitiesReason}）`
                  : "無法進入"
              }
              isWarning={true}
            />
          </CheckRow>
        </>
      ),
    },
    {
      id: "house-q7",
      node: (
        <>
          <SectionHeader title="7. 公設空間（梯間／地下室）" />
          <CheckRow
            checked={
              data?.q8_stairIssue === "否" ||
              data?.q8_stairIssue === "無異常" ||
              data?.q8_stairIssue === "無公共設施" ||
              data?.q8_stairIssue === "有公共設施"
            }
          >
            <span className="font-bold mr-2">公設空間（梯間／地下室）</span>
            <PreviewResult
              checked={
                data?.q8_stairIssue === "是" || data?.q8_stairIssue === "有異常"
              }
              label={
                labels.q6() ||
                (!(
                  data?.q8_stairItems?.includes("其他未列項目") ||
                  data?.q8_stairItems?.includes("其他")
                )
                  ? "有異常"
                  : "")
              }
              isWarning={true}
            />
            <PreviewResult
              checked={
                !!(
                  (data?.q8_stairIssue === "是" ||
                    data?.q8_stairIssue === "有異常") &&
                  (data?.q8_stairItems?.includes("其他未列項目") ||
                    data?.q8_stairItems?.includes("其他"))
                )
              }
              label={
                data?.q8_stairOther
                  ? `其他未列項目：${data.q8_stairOther}`
                  : "其他未列項目"
              }
              isWarning={true}
            />
            <PreviewResult
              checked={data?.q8_stairIssue === "無公共設施"}
              label="無公共設施"
            />
            <PreviewResult
              checked={data?.q8_stairIssue === "有公共設施"}
              label="有公共設施"
            />
            <PreviewResult
              checked={
                data?.q8_stairIssue === "否" || data?.q8_stairIssue === "無異常"
              }
              label="無異常"
            />
          </CheckRow>
        </>
      ),
    },
    {
      id: "house-q8",
      node: (
        <>
          <SectionHeader title="8. 物件與社區內須注意的設施" />
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
    },
    {
      id: "house-q9",
      node: (
        <>
          <SectionHeader title="9. 車位資訊" />
          <CheckRow
            checked={
              !!data?.q10_noParking ||
              (data?.q10_parkTypes && data.q10_parkTypes.length > 0) ||
              !!data?.q10_hasParkTypeOther
            }
          >
            <span className="font-bold mr-2">車位資訊</span>
            <ParkingContent
              data={data}
              parkingSummary={parkingSummary}
              activeMode={activeMode}
            />
          </CheckRow>
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
                data?.q11_hasIssue === "否" || data?.q11_hasIssue === "無異常"
              }
              label="無異常"
            />
            <PreviewResult
              checked={
                data?.q11_hasIssue === "是" || data?.q11_hasIssue === "有異常"
              }
              label={
                [
                  ...(data?.q11_items || []),
                  data?.q11_hasOther
                    ? data.q11_other
                      ? `其他未列項目：${data.q11_other}`
                      : "其他未列項目"
                    : "",
                ]
                  .filter(Boolean)
                  .join("、") || "有異常"
              }
              isWarning={true}
            />
          </CheckRow>
          <CheckRow checked={!!data?.q10_noParking || data?.q12_hasNote === "否"}>
            <span className="font-bold mr-2">車位與車道其他備註</span>
            <PreviewResult checked={data?.q12_hasNote === "否"} label="無" />
            <PreviewResult
              checked={data?.q12_hasNote === "是"}
              label={data?.q12_note || "有"}
              isWarning={true}
            />
          </CheckRow>
        </>
      ),
    },
    ...getCommonExtraBlocks(data, 10, "house"),
  ];
};

