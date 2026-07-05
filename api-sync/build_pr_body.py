#!/usr/bin/env python3
# FE 친화 PR 본문 빌더.
#   입력: api-sync/out/{changelog.json, changelog.txt, sync-notes.md, impact.md}  +  아래 env
#   출력: api-sync/out/pr-body.md (stdout으로도 출력)
# oasdiff changelog.json(기계) 로 엔드포인트 표를 만들고, AI가 쓴 impact.md(번호순)를
# '내 코드 영향' 칸에 조인한다. 조인 불일치 시 전부 "확인 필요"로 graceful 폴백.
# 표준 라이브러리만 사용(런타임 추가 의존 없음).
import os, json, re, sys

OUT = os.environ.get("OUT_DIR", "api-sync/out")
CLASSIFICATION = os.environ.get("CLASSIFICATION", "")
GREEN = os.environ.get("GREEN") == "true"
RECOVERED = os.environ.get("RECOVERED") == "true"
REVERTED = os.environ.get("REVERTED", "")
SRC_API_CHANGED = os.environ.get("SRC_API_CHANGED", "")   # AI가 수정한 src/api 파일 목록(줄바꿈)
AUTHOR = os.environ.get("AUTHOR_NAME", "").strip()

def load(name, default=""):
    try:
        return open(os.path.join(OUT, name), encoding="utf-8").read()
    except Exception:
        return default

try:
    changes = json.loads(load("changelog.json", "[]"))
except Exception:
    changes = []

LEVEL_EMOJI = {3: "🔴", 2: "🟡", 1: "⚪"}   # ERR / WARN / INFO

def toks(text):
    return re.findall(r"`([^`]+)`", text or "")

# id → 한글 라벨(검증된 유형 + 단일-토큰 안전 확장). 미매핑은 oasdiff 영문 text 폴백.
def ko_label(c):
    i, t = c.get("id", ""), toks(c.get("text", ""))
    p = t[0] if t else ""
    t1 = t[1] if len(t) > 1 else ""
    t2 = t[2] if len(t) > 2 else ""
    m = {
        "endpoint-added":                        "엔드포인트 추가",
        "endpoint-deleted":                      "엔드포인트 삭제",
        "api-removed-without-deprecation":       "엔드포인트 삭제(비deprecated)",
        "api-deprecated":                        "엔드포인트 deprecated",
        "request-property-added":                f"요청 필드 `{p}` 추가",
        "request-property-removed":              f"요청 필드 `{p}` 제거",
        "new-required-request-property":         f"필수 요청 필드 `{p}` 추가",
        "new-optional-request-property":         f"선택 요청 필드 `{p}` 추가",
        "request-property-became-required":      f"요청 필드 `{p}` 필수로 변경",
        "request-property-became-optional":      f"요청 필드 `{p}` 선택으로 변경",
        "request-property-type-changed":         f"요청 필드 `{p}` 타입 변경",
        "request-property-max-length-decreased": f"요청 필드 `{p}` 최대길이 {t1} 축소",
        "request-property-max-length-increased": f"요청 필드 `{p}` 최대길이 {t1} 확대",
        "request-property-max-length-set":       f"요청 필드 `{p}` 최대길이 {t1} 설정",
        "request-property-min-length-decreased": f"요청 필드 `{p}` 최소길이 {t1}→{t2} 축소",
        "request-property-min-length-increased": f"요청 필드 `{p}` 최소길이 확대",
        "request-parameter-added":               f"요청 파라미터 `{p}` 추가",
        "request-parameter-removed":             f"요청 파라미터 `{p}` 제거",
        "response-property-added":               f"응답 필드 `{p}` 추가",
        "response-property-removed":              f"응답 필드 `{p}` 제거",
        "response-property-became-optional":      f"응답 필드 `{p}` 선택으로 변경",
        "response-success-status-added":         "응답 성공 상태코드 추가",
        "response-success-status-removed":       "응답 성공 상태코드 제거",
    }
    return m.get(i) or (c.get("text", "") or i)

# AI impact.md 조인: 각 줄 "N. <영향>"(N=1..len, changelog.json 배열순).
# 줄 수/번호가 정확히 일치할 때만 채택, 아니면 전부 "확인 필요"(오정렬 방지).
def load_impacts(n):
    parsed = {}
    for line in load("impact.md", "").splitlines():
        mo = re.match(r"\s*(\d+)[.)]\s*(.+)", line)
        if mo:
            parsed[int(mo.group(1))] = mo.group(2).strip()
    if n and len(parsed) == n and set(parsed) == set(range(1, n + 1)):
        return [parsed[i] for i in range(1, n + 1)], True
    return ["확인 필요"] * n, False

impacts, impact_ok = load_impacts(len(changes))

added = sum(1 for c in changes if c.get("id") == "endpoint-added")
deleted = sum(1 for c in changes if c.get("id") == "endpoint-deleted")
changed_eps = len({(c.get("operation", ""), c.get("path", ""))
                   for c in changes if c.get("id") not in ("endpoint-added", "endpoint-deleted")})

src_files = [f for f in SRC_API_CHANGED.splitlines() if f.strip()]
if not GREEN:
    status = "🚨 **AI 자동 반영 실패 — 사람 확인 필요 (draft PR)**"
elif src_files:
    status = f"✏️ AI가 `src/api` **{len(src_files)}개 파일** 수정 — 리뷰 필요"
else:
    status = "✅ 스펙만 갱신 · 프론트 코드 변경 없음"

rows = []
for idx, c in enumerate(changes, 1):
    ep = f"`{c.get('operation','')} {c.get('path','')}`"
    what = ko_label(c).replace("|", "\\|")
    lvl = LEVEL_EMOJI.get(c.get("level", 2), "🟡")
    imp = impacts[idx - 1].replace("|", "\\|")
    tag = " 🤖" if impact_ok else ""
    rows.append(f"| {ep} | {what} | {lvl} | {imp}{tag} |")

sync_notes = load("sync-notes.md").strip()
raw_changelog = load("changelog.txt").strip()

o = []
o.append(f"## 🔄 API 스펙 동기화 · `{CLASSIFICATION}`\n")
o.append("### ⚡ 한눈에")
o.append(f"> {status}  ")
o.append(f"> ➕ 추가 **{added}** · ✏️ 변경 **{changed_eps}** · ➖ 삭제 **{deleted}**"
         f"  |  백엔드 작업자: {AUTHOR if AUTHOR else '_(폴링/수동 트리거)_'}")
if RECOVERED and GREEN:
    o.append("> ♻️ 자가복구된 PR (자동 되돌리기/재수정 있었음 — 더 꼼꼼히).")
o.append("")

o.append("### 📋 변경된 엔드포인트")
if rows:
    o.append("| 메서드·경로 | 무엇이 바뀜 | breaking | 내 코드 영향 |")
    o.append("|---|---|:--:|---|")
    o += rows
    o.append("")
    o.append("> breaking: 🔴 깨짐(ERR) · 🟡 주의(WARN) · ⚪ 정보(INFO)  |  🤖 = AI 추정 (반드시 실제 코드로 재확인)")
    if not impact_ok:
        o.append("> ⚠️ AI 영향 분석 정렬 실패 → '내 코드 영향'은 직접 확인 필요.")
else:
    o.append("_(엔드포인트 레벨 변경 없음 — 스키마 내부 변경만)_")
o.append("")

o.append("### 🤖 AI sync notes")
o.append(sync_notes if sync_notes else "_수정 불필요 (스펙만 갱신)_")
o.append("")

if REVERTED.strip():
    o.append("### 🔒 가드레일이 자동 되돌린 경계 밖 변경")
    o.append("```")
    o.append(REVERTED.strip())
    o.append("```")
    o.append("")

o.append("### ✅ 검증")
o.append("- lint+build: " + ("✅ green" if GREEN else "❌ 실패 (needs-human)"))
o.append("")

if raw_changelog:
    o.append("<details><summary>📄 oasdiff 원본 changelog</summary>\n")
    o.append("```")
    o.append(raw_changelog)
    o.append("```")
    o.append("</details>")
    o.append("")

o.append("### 👀 리뷰 체크리스트")
o.append("- [ ] 변경된 엔드포인트를 소비하는 컴포넌트/스토어 확인")
o.append("- [ ] 🔴 breaking 항목이 실제 화면 동작에 영향 없는지")
o.append("- [ ] 🤖 'AI 추정' 영향칸을 신뢰하지 말고 실제 코드로 재확인")
o.append("")
o.append("> 검증은 lint+build까지만 수행됨. 동작 확인은 리뷰어의 몫입니다.")

body = "\n".join(o) + "\n"
os.makedirs(OUT, exist_ok=True)
open(os.path.join(OUT, "pr-body.md"), "w", encoding="utf-8").write(body)
sys.stdout.write(body)
