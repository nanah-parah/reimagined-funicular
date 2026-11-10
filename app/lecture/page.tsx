import type { Metadata } from "next";
import "./lecture.css";
import {
  ASSIGN_RATES,
  ASSIGN_STEPS,
  BOYS,
  CURRICULUM,
  GIRLS,
  IB,
  LECTURE_TITLE,
  PLACE,
  PREFERENCE_NOTE,
  PREFERENCE_SOURCE,
  PROFILE,
  QUESTIONS,
  SCHEDULE,
  SENTENCE_A,
  SENTENCE_B,
  SESSIONS,
  SMS,
  SPECIAL,
  TEL,
  type BarRow,
  type StackRow,
} from "./data";

const TITLE = "남동구 고입 선호도 조사 정리 | 중3 학부모 생기부 강의 (11/22)";
const DESCRIPTION =
  "인천시교육청이 공개한 2027 고입 일정과 선호도 조사 2차 결과를 남동구 학교 중심으로 정리했습니다. 11월 22일(일) 중3 학부모 생기부 강의 안내.";

export const metadata: Metadata = {
  metadataBase: new URL("https://parah-app.vercel.app"),
  alternates: { canonical: "/lecture" },
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    type: "website",
    url: "/lecture",
    locale: "ko_KR",
  },
};

const jsonLd = SESSIONS.map((s) => ({
  "@context": "https://schema.org",
  "@type": "Event",
  name: LECTURE_TITLE,
  description: "중3 학부모 생기부 강의 · 두 회차, 내용은 같습니다",
  startDate: s.start,
  endDate: s.end,
  eventStatus: "https://schema.org/EventScheduled",
  eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
  inLanguage: "ko",
  location: { "@type": "Place", name: PLACE },
  organizer: { "@type": "Organization", name: "파라수학" },
}));

const digits = (v: string) => v.replace(/\D/g, "");
const signed = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : "0");

// 그룹이 바뀌는 행 앞에 그룹 이름을 한 줄 둔다
function withGroups<T extends { group?: string }>(rows: T[]) {
  return rows.map((r, i) => ({ r, head: r.group && r.group !== rows[i - 1]?.group ? r.group : null }));
}

function Ticks({ max, step }: { max: number; step: number }) {
  const ticks: number[] = [];
  for (let t = 0; t <= max; t += step) ticks.push(t);
  return (
    <div className="lx-axis" aria-hidden="true">
      <span />
      <span className="lx-ticks">
        {ticks.map((t) => (
          <i key={t} style={{ left: `${(t / max) * 100}%` }}>
            {t}
          </i>
        ))}
      </span>
      <span />
    </div>
  );
}

function BarChart({
  rows,
  max,
  step,
  barLabel,
  capLabel,
}: {
  rows: BarRow[];
  max: number;
  step: number;
  barLabel: string;
  capLabel: string;
}) {
  return (
    <figure className="lx-chart">
      <div className="lx-legend">
        <span>
          <b className="sw bar" />
          {barLabel}
        </span>
        <span>
          <b className="sw cap" />
          {capLabel}
        </span>
        <span className="lx-legend-r">오른쪽 숫자 : 응답 인원 · 차이(응답 − {capLabel})</span>
      </div>
      <div className="lx-rows">
        {withGroups(rows).map(({ r, head }) => (
          <div key={r.name}>
            {head && <div className="lx-grp">{head}</div>}
            <div
              className="lx-row"
              role="img"
              aria-label={`${r.name} ${barLabel} ${r.value}명, ${capLabel} ${r.cap}명, 차이 ${signed(r.value - r.cap)}`}
            >
              <span className="lx-nm">{r.name}</span>
              <span className="lx-tr">
                <span className="lx-fl" style={{ width: `${(Math.min(r.value, max) / max) * 100}%` }} />
                <span className="lx-cap" style={{ left: `${(r.cap / max) * 100}%` }} />
              </span>
              <span className="lx-vv">
                <b>{r.value}</b>
                <em className={r.value > r.cap ? "up" : undefined}>{signed(r.value - r.cap)}</em>
              </span>
            </div>
          </div>
        ))}
      </div>
      <Ticks max={max} step={step} />
    </figure>
  );
}

function StackChart({ rows, max, step }: { rows: StackRow[]; max: number; step: number }) {
  return (
    <figure className="lx-chart">
      <div className="lx-legend">
        <span>
          <b className="sw fixed" />
          학교 지정
        </span>
        <span>
          <b className="sw bar" />
          학생 선택
        </span>
      </div>
      <div className="lx-rows">
        {withGroups(rows).map(({ r, head }) => {
          const total = r.fixed + r.choice;
          return (
            <div key={r.name}>
              {head && <div className="lx-grp">{head}</div>}
              <div
                className="lx-row"
                role="img"
                aria-label={`${r.name} 학교 지정 ${r.fixed}, 학생 선택 ${r.choice}, 전체 ${total}`}
              >
                <span className="lx-nm">{r.name}</span>
                <span className="lx-tr">
                  <span className="lx-stack" style={{ width: `${(total / max) * 100}%` }}>
                    <span className="lx-seg fixed" style={{ flexGrow: r.fixed }} />
                    <span className="lx-seg" style={{ flexGrow: r.choice }} />
                  </span>
                </span>
                <span className="lx-vv">
                  <b>{r.choice}</b>
                  <em>/ {total}</em>
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <Ticks max={max} step={step} />
    </figure>
  );
}

function SecHead({ title, sub, meta }: { title: string; sub?: string; meta?: string }) {
  return (
    <header className="lx-hd">
      <h2>{title}</h2>
      {sub && <p className="lx-sub">{sub}</p>}
      {meta && <p className="lx-meta">{meta}</p>}
    </header>
  );
}

export default function LecturePage() {
  return (
    <div className="lx">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Gothic+A1:wght@400;500;600;700;800&display=swap"
        precedence="default"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />

      <div className="lx-col">
        <div className="lx-mast">
          <b>parah maths</b>
          <span>중3 학부모</span>
        </div>

        {/* ═══ A. 2027 고입 공개 자료 ═══ */}
        <div className="lx-part">
          <h1>2027 고입 공개 자료</h1>
          <span className="lx-bar" />
        </div>

        <section className="lx-sec">
          <SecHead
            title="후기고 입학전형 일정"
            sub="성적 확정부터 배정 발표까지"
            meta="2026년 11월부터 2027년 1월까지 · 인천 후기고"
          />
          <div className="lx-tbl">
            {SCHEDULE.map((s) => (
              <div className={`lx-tr3${s.hi ? " hi" : ""}`} key={s.date + s.item}>
                <span className="lx-k">{s.date}</span>
                <span>
                  <span className="lx-v">{s.item}</span>
                  {s.desc && <span className="lx-d">{s.desc}</span>}
                </span>
              </div>
            ))}
          </div>
          <p className="lx-note">
            출처 : 인천광역시교육청 「2027학년도 고등학교 신입생 입학전형 주요 일정」
            <br />
            일정은 바뀔 수 있으며, 학교별 세부 사항은 모집요강에서 확인합니다.
          </p>
        </section>

        <section className="lx-sec">
          <SecHead title="평준화 일반고 배정 방식" sub="1지망이 정원을 넘으면" />
          <ol className="lx-steps">
            {ASSIGN_STEPS.map((s, i) => (
              <li key={s.head}>
                <span className="lx-n">{i + 1}</span>
                <span>
                  <b>{s.head}</b>
                  <span>{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
          <div className="lx-mets">
            {ASSIGN_RATES.map((m) => (
              <div className="lx-met" key={m.v}>
                <div className="v">{m.v}</div>
                <div className="k">{m.k}</div>
              </div>
            ))}
          </div>
          <p className="lx-text">
            열 명 중 한 명 남짓은 2지망 이하의 학교로 갑니다.
            <br />
            2지망 학교도 1지망만큼 들여다볼 이유가 여기에 있습니다.
          </p>
          <p className="lx-note">
            출처 : 2027학년도 인천광역시 고등학교 입학전형 기본계획 · 인천시교육청 배정 결과
            발표(언론 보도)
          </p>
        </section>

        <section className="lx-sec">
          <SecHead title="고입 선호도 조사 2차 · 남학생" sub="남동구 남학생이 지원하는 평준화 일반고" />
          <BarChart rows={BOYS} max={450} step={100} barLabel="1지망 응답 인원" capLabel="배정 예정 인원" />
          <p className="lx-note">
            {PREFERENCE_NOTE[0]} {PREFERENCE_NOTE[1]}
            <br />
            출처 : {PREFERENCE_SOURCE}
          </p>
        </section>

        <section className="lx-sec">
          <SecHead title="고입 선호도 조사 2차 · 여학생" sub="남동구 여학생이 지원하는 평준화 일반고" />
          <BarChart rows={GIRLS} max={450} step={100} barLabel="1지망 응답 인원" capLabel="배정 예정 인원" />
          <p className="lx-note">
            {PREFERENCE_NOTE[0]} {PREFERENCE_NOTE[1]}
            <br />
            출처 : {PREFERENCE_SOURCE}
          </p>
        </section>

        <section className="lx-sec">
          <SecHead title="고입 선호도 조사 2차 · 후기 특목고" sub="외고 · 국제고 · 자사고" />
          <p className="lx-cap-note">세로 표식은 「모집 정원」입니다.</p>
          <BarChart rows={SPECIAL} max={450} step={100} barLabel="1지망 응답 인원" capLabel="모집 정원" />
          <p className="lx-text">
            다섯 학교 모두 응답이 정원을 넘습니다.
            <br />
            이 학교들의 불합격자는 평준화 일반고 2지망부터 배정됩니다.
          </p>
          <p className="lx-note">
            인천포스코고 · 인천하늘고는 자율형 사립고입니다. 선호도 응답이며 실제 원서 지원 현황이
            아닙니다.
            <br />
            출처 : {PREFERENCE_SOURCE}
          </p>
        </section>

        <section className="lx-sec">
          <SecHead title="평준화 일반고 · IB 중점과정" sub="IB 중점과정을 운영하는 인천의 네 학교" />
          <p className="lx-cap-note">막대 = 0지망 응답 인원, 세로 표식 = 중점과정 정원.</p>
          <BarChart rows={IB} max={60} step={10} barLabel="0지망 응답 인원" capLabel="중점과정 정원" />
          <ul className="lx-list">
            <li>
              평준화 일반고 1지망에 앞서 0지망으로 한 학교를 지원하며, 거주지 학교군과 관계없이
              인천 전역에서 지원할 수 있습니다.
            </li>
            <li>
              지원자가 최소 인원에 못 미치면 그 과정은 배정하지 않고, 지원자는 1지망부터 일반
              학생과 같이 배정합니다.
            </li>
            <li>
              배정된 학생은 해당 중점과정을 이수해야 하며, 외고 · 국제고 · 자사고 동시 지원자는
              중점과정에 지원할 수 없습니다.
            </li>
          </ul>
          <p className="lx-text">
            네 학교는 IB 디플로마 프로그램(DP) 후보학교로, 2026년 11월 현재 월드스쿨 인증 절차를
            밟고 있습니다(헤럴드경제 보도, 2026. 11. 4.).
          </p>
          <p className="lx-note">
            출처 : 2027 고입 선호도 조사(2차) 결과 · 2027 인천광역시 고등학교 입학전형 기본계획
          </p>
        </section>

        <section className="lx-sec">
          <SecHead
            title="3개년 교육과정 편성표"
            sub="학생이 고를 수 있는 과목의 수"
            meta="2026학년도 입학생(현 고1)의 3개년 편성표 · 남동구와 인근 8개교"
          />
          <p className="lx-cap-note">
            누적 막대 = 학교 지정 과목 + 학생 선택 과목. 오른쪽 숫자 = 학생 선택 / 전체.
          </p>
          <StackChart rows={CURRICULUM} max={120} step={20} />
          <p className="lx-text">
            여덟 학교 모두 3년 동안 174학점을 이수하지만,
            <br />
            학생이 직접 고르는 과목의 수는 <strong>56개에서 81개</strong>까지 다릅니다.
          </p>
          <p className="lx-note">
            편성표에 올랐다고 모두 열리지는 않습니다. 신청 인원이 적으면 개설되지 않습니다.
            2027학년도 입학생 편성표는 학교별로 다시 확인해야 합니다.
            <br />
            출처 : 인천시교육청 교육과정편성시스템 · 각 학교 학교교육과정 편성·운영·평가 계획
          </p>
        </section>
      </div>

      {/* ═══ B. 강의 안내 ═══ */}
      <section className="lx-dark lx-cover">
        <div className="lx-col">
          <div className="lx-kick">생기부를 함께 읽는 시간</div>
          <h2>
            합격하는 생기부는
            <br />
            어떻게 구성되며,
            <br />
            어떻게 평가될까?
          </h2>
          <p className="lx-cover-meta">
            11월 22일 (일)
            <br />
            <span className="lx-nw">오후 3시부터 5시까지</span> · <span className="lx-nw">오후 6시부터 8시까지</span>
            <br />
            두 회차, 내용은 같습니다
          </p>
        </div>
      </section>

      <div className="lx-col">
        <section className="lx-sec">
          <SecHead title="11월에 중3 학부모님을 모신 이유" />
          <div className="lx-two">
            <div className="lx-half">
              <div className="big">12월</div>
              <h3>고등학교 원서 접수가 12월 초에 있습니다</h3>
              <p className="txt">
                지망 학교의 교육과정 편성표를 보면, 아이가 3년 동안 들을 수 있는 과목이 보입니다
              </p>
              <p className="sm">평준화 일반고 원서 접수 12월 7일부터 11일까지</p>
            </div>
            <div className="lx-half">
              <div className="big">3월</div>
              <h3>고1 첫 학기 생활기록부는 첫 수업부터 관찰됩니다</h3>
              <p className="txt">
                생활기록부의 어떤 항목이 어느 학기에 결정되는지 미리 알면, 고등학교의 첫 학기를
                설계할 수 있습니다
              </p>
              <p className="sm">2 · 3학년에 들을 과목도 고1 때 신청합니다</p>
            </div>
          </div>
          <p className="lx-text">
            고교학점제와 내신 5등급제 아래에서는 교과 성적만으로 서로가 구분되지 않는 구간이
            넓어졌고,{" "}
            <strong>그만큼 생활기록부에 기재된 진술이 평가에서 차지하는 비중이 커졌습니다.</strong>
            <br />
            고등학교를 정하기 전인 지금, 3년 동안 무엇이 어느 칸에 기재되는지 먼저 확인해 두실 수
            있습니다.
          </p>
        </section>

        <section className="lx-sec">
          <SecHead title="두 문장" />
          <p className="lx-text">
            같은 학년, 같은 과목의 <strong>교과 세부능력 및 특기사항</strong>입니다.
          </p>
          <figure className="lx-quote">
            <div className="cap">문장 A</div>
            <blockquote>{SENTENCE_A}</blockquote>
            <figcaption>실제 기록을 바탕으로 재구성한 예시입니다.</figcaption>
          </figure>
          <p className="lx-text">그리고 이것이 다른 한 문장입니다.</p>
          <figure className="lx-quote">
            <div className="cap">문장 B</div>
            <blockquote>{SENTENCE_B}</blockquote>
            <figcaption>실제 기록을 바탕으로 재구성한 예시입니다.</figcaption>
          </figure>
        </section>
      </div>

      <section className="lx-dark lx-say">
        <div className="lx-col">
          <div className="lx-kick">그날 함께 읽습니다</div>
          <h2>
            어느 쪽이
            <br />
            합격한 아이의
            <br />
            문장일까요?
          </h2>
          <p>
            두 문장 모두 실제 생활기록부에 기재되는 형태입니다.
            <br />
            저는 이런 문장을 <strong>다섯 가지 항목</strong>으로 읽습니다.
            <br />
            판단의 기준은 문장의 길이나 용어의 수준이 아닙니다.
          </p>
        </div>
      </section>

      <div className="lx-col">
        <section className="lx-sec">
          <SecHead title="두 시간 동안 여는 여섯 물음" />
          <div className="lx-tbl">
            {QUESTIONS.map((q) => (
              <div className="lx-qrow" key={q.no}>
                <span className="lx-qn">{q.no}</span>
                <span className="lx-qt">{q.tag}</span>
                <span className="lx-qq">{q.q}</span>
              </div>
            ))}
          </div>
          <p className="lx-note">
            질의응답을 포함해 두 시간입니다.
            <br />
            강의를 마친 뒤에는 현장 상황에 따라 개별 질의응답 시간을 가질 예정입니다.
          </p>
        </section>

        <section className="lx-sec">
          <SecHead title="사전 질문지" sub="적어 주신 내용으로 가정마다 따로 준비합니다" />
          <div className="lx-two">
            <div className="lx-half">
              <div className="tag">비교</div>
              <h3>1지망과 2지망 고등학교를 비교합니다</h3>
              <p className="txt">
                과목별 성취도 분포와 과목평균, 그리고 3개년 교육과정 편성표의 진로선택 · 융합선택
                개설 과목 수
              </p>
              <p className="sm">출처 : 학교알리미 · 인천시교육청</p>
            </div>
            <div className="lx-half">
              <div className="tag">과목</div>
              <h3>관심 계열에 필요한 과목이 두 학교에 개설되어 있는지 확인합니다</h3>
              <p className="txt">계열별 권장 과목과 지망 학교의 편성표를 나란히 놓고 점검합니다</p>
            </div>
          </div>
          <p className="lx-text">
            비교의 기준은 <strong>우열이 아니라 차이</strong>입니다.
            <br />
            어느 학교가 낫다는 판단이 아니라, 두 학교가 서로 무엇이 다른지를 공개된 자료로
            확인합니다.
          </p>
        </section>

        <section className="lx-sec">
          <SecHead title="강사 소개" sub="파라수학 원장 · 고등부 강의 18년차" />
          <div className="lx-tbl">
            {PROFILE.map((p) => (
              <div className="lx-tr3" key={p.k}>
                <span className="lx-k">{p.k}</span>
                <span>
                  <span className="lx-v">{p.v}</span>
                  {p.sub.map((x) => (
                    <span className="lx-d" key={x}>
                      {x}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
          <p className="lx-text">
            저는 건축과 도시설계공학을 공부했습니다.
            <br />
            그래서 생활기록부를 목록이 아니라 <strong>구조로 봅니다.</strong>
            <br />
            어느 항목이 비어 있는지, 무엇과 무엇이 이어져야 하는지를 먼저 검토합니다.
          </p>
        </section>

        <section className="lx-sec">
          <SecHead title="준비하며" />
          <div className="lx-prose">
            <p>
              생활기록부에 관한 질문을 상담 자리에서 자주 받습니다.
              <br />
              한 번에 한 분씩 답해 드리다 보니, 정작 필요한 내용을 충분히 다루지 못하고 끝난 적이
              많았습니다.
            </p>
            <p>
              그래서 한자리에서 두 시간 동안 정리해 드리기로 했습니다.
              <br />
              다루는 내용은 공개된 자료와 제가 현장에서 확인해 온 것들입니다.
              <br />
              이미 알고 계신 분께는 확인이 되고, 이제 시작하시는 분께는{" "}
              <strong>앞으로 3년의 판단 기준을 세우는 시간</strong>이 되리라 생각합니다.
            </p>
            <p>
              합격을 보장하는 방법을 말씀드리는 자리는 아닙니다.
              <br />
              합격한 기록들이 어떤 구조를 공통으로 갖고 있었는지를 봅니다.
            </p>
            <p>
              <strong>참가비는 받지 않습니다.</strong>
              <br />
              참석하신 분들께는 재원생 학부모님께 드렸던 40쪽 분량의 자료를 드립니다.
              <br />
              자료가 도움이 되셨으면 하는 바람으로 준비했습니다.
            </p>
          </div>
        </section>

        <section className="lx-sec lx-apply">
          <SecHead title="일시 · 신청" />
          <div className="lx-tbl">
            <div className="lx-tr3">
              <span className="lx-k">일시</span>
              <span>
                <span className="lx-v">11월 22일(일)</span>
                <span className="lx-d"><span className="lx-nw">오후 3시부터 5시까지</span> · <span className="lx-nw">오후 6시부터 8시까지</span></span>
                <span className="lx-d">두 회차, 내용은 같습니다</span>
              </span>
            </div>
            <div className="lx-tr3">
              <span className="lx-k">대상</span>
              <span className="lx-v">중3 학부모</span>
            </div>
            <div className="lx-tr3">
              <span className="lx-k">인원</span>
              <span>
                <span className="lx-v">회차당 4명</span>
                <span className="lx-d">학부모님을 모십니다</span>
              </span>
            </div>
            <div className="lx-tr3">
              <span className="lx-k">장소</span>
              <span className="lx-v">{PLACE}</span>
            </div>
            <div className="lx-tr3">
              <span className="lx-k">준비물</span>
              <span className="lx-v">필기도구</span>
            </div>
            <div className="lx-tr3 hi">
              <span className="lx-k">신청</span>
              <span>
                <span className="lx-v">
                  문자 <a href={`sms:${digits(SMS)}`}>{SMS}</a>
                </span>
                <span className="lx-d">
                  [학교 · 이름 · 희망 회차]를 적어 11월 21일(토) 오후 9시까지 보내 주세요
                </span>
              </span>
            </div>
            <div className="lx-tr3">
              <span className="lx-k">질문지</span>
              <span>
                <span className="lx-v">문자로 신청하신 분께 링크를 보내 드립니다</span>
                <span className="lx-d">
                  11월 21일(토) 오후 9시까지 보내 주신 답변으로 그날 자료를 준비합니다
                </span>
              </span>
            </div>
            <div className="lx-tr3">
              <span className="lx-k">문의</span>
              <span className="lx-v">
                <a href={`tel:${digits(TEL)}`}>{TEL}</a>
              </span>
            </div>
          </div>
        </section>

        <footer className="lx-foot">
          <b>parah maths</b>
        </footer>
      </div>
    </div>
  );
}
