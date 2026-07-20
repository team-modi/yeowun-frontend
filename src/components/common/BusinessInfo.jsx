// 사업자 정보 (카카오 비즈니스 앱 심사 요건 — 사업자등록증 기재 사항과 동일해야 함)
import "@styles/common/BusinessInfo.css";

const PRIVACY_POLICY_URL =
  "https://velog.io/@plan11/%EA%B0%9C%EC%9D%B8%EC%A0%95%EB%B3%B4-%EC%B2%98%EB%A6%AC-%EB%B0%A9%EC%B9%A8";

const CONTACT_EMAIL = "tjtfy7028@gmail.com";

const BUSINESS_ITEMS = [
  { label: "상호", value: "여운" },
  { label: "대표자", value: "김진수" },
  { label: "사업자등록번호", value: "101-28-12803" },
  // 사업장 소재지는 자택 주소라 노출하지 않음. 카카오 심사에서 주소를 요구하면 아래를 살릴 것.
  // { label: "사업장 소재지", value: "전북특별자치도 전주시 완산구 용머리로 20, 104동 9층 902호(효자동1가, 효자현대아파트)" },
];

const BusinessInfo = () => {
  return (
    <footer className="business-info" aria-label="사업자 정보">
      <dl className="business-info-list">
        {BUSINESS_ITEMS.map(({ label, value }) => (
          <div key={label} className="business-info-row">
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>

      <p className="business-info-contact">
        문의: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>

      <p className="business-info-links">
        <a href={PRIVACY_POLICY_URL} target="_blank" rel="noopener noreferrer">
          개인정보 처리방침
        </a>
      </p>

      <p className="business-info-copyright">© 2026 여운. All rights reserved.</p>
    </footer>
  );
};

export default BusinessInfo;
