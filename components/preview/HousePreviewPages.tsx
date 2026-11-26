import { SurveyData } from "../../types";
import {
  PreviewResult,
  CheckRow,
  SectionHeader,
  TableHeaderRow,
  ParkingContent,
} from "./PreviewShared";
import {
  getHouseLabels,
  CommonExtraQuestions,
} from "./PreviewCommonBlocks";

export const HousePrintPage1 = ({ data }: { data: SurveyData }) => {
  const labels = getHouseLabels(data);
  const showSolar =
    data.propertyType && ["透天／別墅／獨棟店面"].includes(data.propertyType);

  return (
    <>
      <TableHeaderRow />
      <SectionHeader title="1. 增建、占用與被占用現況" />
      <CheckRow checked={data?.q1_hasExt === "否"}>
        <span className="font-bold mr-2">增建（含違建）現況</span>
        <PreviewResult
          checked={data?.q1_hasExt === "是"}
          label={labels.q1()}
          isWarning={true}
        />
        <PreviewResult
          checked={!!(data?.q1_hasOther && data.q1_other)}
          label={data?.q1_other || ""}
          isWarning={true}
        />
      </CheckRow>

      <CheckRow checked={data?.q2_hasOccupancy === "否"}>
        <span className="font-bold mr-2">占用鄰地</span>
        <PreviewResult
          checked={data?.q2_hasOccupancy !== "否" && !!data?.q2_hasOccupancy}
          label={
            data?.q2_hasOccupancy + (data?.q2_desc ? "：" + data.q2_desc : "")
          }
          isWarning={true}
        />
      </CheckRow>
      <CheckRow checked={data?.q2_other_occupancy === "否"}>
        <span className="font-bold mr-2">被占用</span>
        <PreviewResult
          checked={
            data?.q2_other_occupancy !== "否" && !!data?.q2_other_occupancy
          }
          label={
            data?.q2_other_occupancy +
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
          checked={data?.q3_hasLeak === "是"}
          label={labels.q3()}
          isWarning={true}
        />
        <PreviewResult
          checked={data?.q3_repairHistory === "無修繕紀錄"}
          label="（無修繕紀錄）"
        />
        <PreviewResult
          checked={data?.q3_repairHistory === "有修繕紀錄"}
          label={`（曾有修繕：${data?.q3_repairDesc || ""}）`}
          isWarning={true}
        />
      </CheckRow>

      <SectionHeader title="4. 建物結構安全評估（含瑕疵與傾斜）" />
      <CheckRow checked={data?.q4_hasIssue === "否"}>
        <span className="font-bold mr-2">結構瑕疵</span>
        <PreviewResult
          checked={data?.q4_hasIssue === "是"}
          label={labels.q4()}
          isWarning={true}
        />
        <PreviewResult
          checked={!!(data?.q4_hasOther && data.q4_otherDesc)}
          label={data?.q4_otherDesc || ""}
          isWarning={true}
        />
      </CheckRow>
      <CheckRow checked={data?.q5_hasTilt === "否"}>
        <span className="font-bold mr-2">傾斜現況</span>
        <PreviewResult
          checked={data?.q5_hasTilt !== "否" && !!data?.q5_hasTilt}
          label={
            data?.q5_hasTilt +
            (data?.q5_desc ? "：" + data.q5_desc : "") +
            (data?.q5_suspectedDesc ? "：" + data.q5_suspectedDesc : "")
          }
          isWarning={true}
        />
      </CheckRow>

      <SectionHeader title="5. 電、水、瓦斯與其他設施使用現況" />

      <CheckRow checked={!!data?.q7_gasType}>
        <span className="font-bold mr-2">瓦斯供應類型</span>
        <PreviewResult checked={!!data?.q7_gasType} label={data.q7_gasType} />
      </CheckRow>

      <CheckRow checked={data?.q7_hasIssue === "否"}>
        <span className="font-bold mr-2">電、水、瓦斯與其他設施使用現況</span>
        <PreviewResult
          checked={data?.q7_hasIssue === "是"}
          label={labels.q7()}
          isWarning={true}
        />
        <PreviewResult
          checked={!!(data?.q7_hasOther && data.q7_otherDesc)}
          label={data?.q7_otherDesc || ""}
          isWarning={true}
        />
      </CheckRow>

      {showSolar && (
        <CheckRow
          checked={
            data?.house_solar_status === "無設置" ||
            data?.house_solar_status === "無"
          }
        >
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
        </CheckRow>
      )}

      {data?.water_booster && (
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
            label={`其他 （${data.water_booster_desc}）`}
          />
          <PreviewResult
            checked={
              data?.water_booster === "無" || data?.water_booster === "無設置"
            }
            label="無"
          />
        </CheckRow>
      )}
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
  const labels = getHouseLabels(data);
  return (
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
          label={`無法進入 （${data.publicFacilitiesReason}）`}
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
          label={labels.q6()}
          isWarning={true}
        />
        <PreviewResult
          checked={
            !!(
              (data?.q8_stairIssue === "是" ||
                data?.q8_stairIssue === "有異常") &&
              (data?.q8_stairItems?.includes("其他未列項目") ||
                data?.q8_stairItems?.includes("其他")) &&
              data?.q8_stairOther
            )
          }
          label={data?.q8_stairOther || ""}
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

      <SectionHeader title="9. 車位資訊" />
      <CheckRow checked={!!data?.q10_noParking}>
        <span className="font-bold mr-2">車位資訊</span>
        {!data?.q10_noParking && (
          <ParkingContent
            data={data}
            parkingSummary={parkingSummary}
            activeMode={activeMode}
          />
        )}
      </CheckRow>
      <CheckRow
        checked={
          !data?.q10_noParking &&
          (data?.q11_hasIssue === "否" || data?.q11_hasIssue === "無異常")
        }
      >
        <span className="font-bold mr-2">車位使用現況</span>
        <PreviewResult
          checked={
            data?.q11_hasIssue === "是" || data?.q11_hasIssue === "有異常"
          }
          label={
            [
              ...(data?.q11_items || []),
              data?.q11_hasOther ? `其他: ${data.q11_other}` : "",
            ]
              .filter(Boolean)
              .join("、")
          }
          isWarning={true}
        />
      </CheckRow>
      <CheckRow checked={!data?.q10_noParking && data?.q12_hasNote === "否"}>
        <span className="font-bold mr-2">車位與車道其他備註</span>
        <PreviewResult
          checked={data?.q12_hasNote === "是"}
          label={data?.q12_note || ""}
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

