import random
import streamlit as st
import os

# -----------------------------
# 0) 페이지 설정 및 CSS
# -----------------------------
st.set_page_config(
    page_title="쿨라워 꽃 성향 테스트",
    page_icon="🌸",
    layout="centered"
)

# 상단 메뉴/푸터 숨기기 (깔끔한 앱 느낌)
hide_st_style = """
            <style>
            #MainMenu {visibility: hidden;}
            footer {visibility: hidden;}
            header {visibility: hidden;}
            </style>
            """
st.markdown(hide_st_style, unsafe_allow_html=True)

# -----------------------------
# 1) 결과(꽃) 정의 - 쿨라워 동아리 버전# -----------------------------
# 1) 결과(꽃) 정의 - 쿨라워 동아리 (새내기+헌내기 저격 ver)
# -----------------------------
FLOWERS = {
    "DAISY": {
        "name": "해바라기",
        "emoji": "🌻",
        "desc": "어색한 공기는 못 참는 **인간 비타민**!<br>새내기 땐 선배들 사랑 독차지하고, 선배 되면 후배들이 '언니/오빠랑 밥 먹고 싶어요' 줄 서는 핵인싸 타입.",
        "role": "👑 추천 포지션: **모임의 중심! 오락부장 & 분위기 메이커**",
        "image": "images/sunflower.jpg",
    },
    "FORGET": {
        "name": "안개꽃",
        "emoji": "🌫️",
        "desc": "튀지 않지만 없으면 동아리 안 돌아가는 **숨은 실세**.<br>소외되는 부원 없이 세심하게 챙겨줘서, 겉으로는 조용해도 속으로 너 의지하는 애들 트럭 한 대임.",
        "role": "👑 추천 포지션: **부원들의 대나무숲! 멘토링 & 힐링 케어 담당**",
        "image": "images/babysbreath.jpg",
    },
    "DELPH": {
        "name": "목련",
        "emoji": "🤍",
        "desc": "PPT 폰트까지 맞추는 **갓생 계획러**.<br>'이거 누가 해?' 할 때 이미 다 해놓는 든든한 선배. 임원진들이 탐내는 차기 회장/총무 1순위 후보!",
        "role": "👑 추천 포지션: **동아리 살림꾼! 총무 & 행사 기획 총괄**",
        "image": "images/magnolia.jpg",
    },
    "LAV": {
        "name": "선인장",
        "emoji": "🌵",
        "desc": "일처리는 칼 같고 내 사람은 확실히 챙기는 **겉바속촉 츤데레**.<br>답답한 상황 딱 정리해주는 사이다 발언 장인이라, 후배들이 '와 멋있다...' 하고 몰래 동경함.",
        "role": "👑 추천 포지션: **위기 탈출 넘버원! 규율 관리 & 해결사**",
        "image": "images/cactus.jpg",
    },
    "ROSE": {
        "name": "난(Orchid)",
        "emoji": "🌿",
        "desc": "존재감 확실하고 센스 넘치는 **입덕몰이 아이콘**.<br>너만의 독특한 아우라가 있어서, 신입 모집할 때 네 얼굴 박힌 포스터 쓰면 지원율 급상승각.",
        "role": "👑 추천 포지션: **동아리의 간판! 홍보 모델 & 대외협력 팀장**",
        "image": "images/orchid.jpg",
    },
    "SUN": {
        "name": "장미",
        "emoji": "🌹",
        "desc": "필 꽂히면 밤새서라도 끝장을 보는 **열정의 불도저**.<br>'야, 가자!' 한마디로 전설의 MT나 축제를 만들어내는 추진력 대장. 너랑 있으면 지루할 틈이 없음.",
        "role": "👑 추천 포지션: **판을 키우는 능력자! 축제/MT 추진 위원장**",
        "image": "images/rose.jpg",
    },
}

# -----------------------------
# 2) 질문(버튼형) 정의 - 4문항
# -----------------------------
QUESTIONS = [
    {
        "q": "쿨라워 OT 날! 마음에 드는 동기/선배가 눈에 띈다. 나의 행동은?",
        "opts": {
            "A": "자연스럽게 옆에 가서 말을 건다. \"혹시 무슨 과세요?\" (선공)",
            "B": "내 쪽을 봐주길 기다리며 근처를 서성인다. (간택 대기)",
        },
    },
    {
        "q": "동기한테 카톡이 왔다. '나 오늘 우울해서 꽃 샀어...' 나의 답장은?",
        "opts": {
            "A": "헐 ㅠㅠ 무슨 일 있어? 괜찮아? (걱정)",
            "B": "오 무슨 꽃?? 사진 보여줘! (관심)",
            "C": "왜 우울해? 누가 괴롭혔어? (원인 분석)",
            "D": "꽃 살 돈이 있다니... 부자네? (장난/팩폭)",
        },
    },
    {
        "q": "테라리움 만들기 활동 중! 옆자리 부원이 (솔직히 좀 이상한) 작품을 보여주며<br>\"예쁘죠?! 저희 조 대표작으로 낼까요?\"라고 묻는다.",
        "opts": {
            "A": "응!! 엄청 예쁘다!! 너만의 감성이 있어! (일단 칭찬)",
            "B": "음, 여기 좀 수정하고... 공정하게 투표로 정하는 게 어때? (냉철한 판단)",
        },
    },
    {
        "q": "압화를 활용한 엽서 만들기 시간!<br>재료를 받자마자 나는?",
        "opts": {
            "A": "일단 핀셋 들고 꽃 배치부터 완벽하게 구상한다. (설계형)",
            "B": "필 꽂히는 대로 풀칠부터 시작한다. (직관형)",
        },
    },
]

# -----------------------------
# 3) 가중치 테이블 (질문 인덱스 -> 선택지 -> {꽃: 점수})
# -----------------------------
S = {
    0: {  # Q1. E/I (다가가기 vs 기다리기)
        "A": {"DAISY": 3, "ROSE": 3, "SUN": 2},  # E 성향
        "B": {"FORGET": 3, "LAV": 3, "DELPH": 2}, # I 성향
    },
    1: {  # Q2. T/F (우울해서 꽃 샀어)
        "A": {"FORGET": 4, "DAISY": 2},           # F(공감)
        "B": {"DAISY": 2, "SUN": 2},              # F/T(관심)
        "C": {"DELPH": 3, "ROSE": 1},             # T(원인)
        "D": {"LAV": 5, "ROSE": 2},               # T(팩폭)
    },
    2: {  # Q3. T/F (망한 테라리움 피드백)
        "A": {"FORGET": 3, "DAISY": 3, "SUN": 1}, # F(빈말/칭찬)
        "B": {"LAV": 3, "DELPH": 3, "ROSE": 2},   # T(팩트/효율)
    },
    3: {  # Q4. P/J (만들기 스타일)
        "A": {"DELPH": 5, "LAV": 2, "FORGET": 1}, # J(계획)
        "B": {"SUN": 5, "ROSE": 3, "DAISY": 2},   # P(직관)
    },
}

# -----------------------------
# 4) 함수 정의
# -----------------------------
def compute_scores(answers):
    scores = {k: 0 for k in FLOWERS.keys()}
    for qi, ch in enumerate(answers):
        if qi in S and ch in S[qi]:
            for flower, pts in S[qi][ch].items():
                scores[flower] += pts
    return scores

def pick_winner(scores, last_choice):
    # 동점 처리 로직
    max_score = max(scores.values())
    cand = [k for k, v in scores.items() if v == max_score]
    
    if len(cand) == 1:
        return cand[0]
    
    # 동점일 경우 마지막 질문 가중치로 결정
    q_last_idx = len(QUESTIONS) - 1
    if q_last_idx in S:
        q8 = S[q_last_idx].get(last_choice, {})
        bonus = {k: q8.get(k, 0) for k in cand}
        best = max(bonus.values())
        cand2 = [k for k, b in bonus.items() if b == best]
        return random.choice(cand2)
    
    return random.choice(cand)

def safe_show_image(path_or_url, caption=None):
    """
    이미지가 있으면 보여주고, 없거나 에러나면 대체 메시지를 출력하는 함수
    """
    # 1. 파일 경로인지 확인하고 존재 여부 체크
    if os.path.exists(path_or_url):
        try:
            st.image(path_or_url, caption=caption, use_container_width=True)
        except Exception:
            st.warning("앗! 꽃 사진을 불러오는 중 오류가 생겼어요 🥺")
    else:
        # 2. 파일이 없을 때 출력할 메시지
        st.info("🖼️ (아직 꽃 사진이 도착하지 않았어요!)\n\n상상력을 발휘해 주세요 ✨")

def reset():
    st.session_state.q_idx = 0
    st.session_state.answers = []
    st.session_state.done = False
    st.session_state.result = None
    st.session_state.scores = None

# -----------------------------
# 5) 메인 실행 로직
# -----------------------------

# 세션 상태 초기화
if "q_idx" not in st.session_state:
    reset()

# 헤더
st.title("🌸 쿨라워 꽃 성향 테스트")
st.caption("새내기 환영회 & 동아리 활동 스타일로 알아보는 나의 꽃은?")

# --- 결과 화면 ---
if st.session_state.done and st.session_state.result:
    key = st.session_state.result
    info = FLOWERS[key]

    st.subheader(f"{info['emoji']} 당신은 **{info['name']}**!")
    
    # 이미지 출력 (없으면 대체 메시지)
    safe_show_image(info["image"], caption=f"{info['name']} 타입")

    # 설명에 HTML 태그(br)가 포함되어 있으므로 unsafe_allow_html=True 권장
    st.markdown(info["desc"], unsafe_allow_html=True)
    st.success(info["role"])

    # 2등 보여주기
    sorted_scores = sorted(st.session_state.scores.items(), key=lambda x: -x[1])
    second = sorted_scores[1][0] if len(sorted_scores) > 1 else None
    
    if second:
        st.info(f"🤝 너랑 잘 맞는 파트너 꽃은? **{FLOWERS[second]['name']}** {FLOWERS[second]['emoji']}")

    st.divider()
    
    col1, col2 = st.columns(2)
    with col1:
        if st.button("🔁 다시하기", use_container_width=True):
            reset()
            st.rerun()
    with col2:
        st.button("📌 캡처해서 자랑하기", use_container_width=True, disabled=True)
        st.caption("결과 화면을 캡처해서 공유해보세요!")
    
    st.stop()

# --- 질문 화면 ---
q_total = len(QUESTIONS)
q_idx = st.session_state.q_idx

# 진행률
st.progress((q_idx) / q_total)
st.write(f"Question {q_idx + 1} / {q_total}")

q_obj = QUESTIONS[q_idx]
# 질문 텍스트
st.subheader(f"Q{q_idx + 1}")
st.markdown(f"**{q_obj['q']}**", unsafe_allow_html=True)

# 여백
st.write("")

# 보기 버튼
for key, text in q_obj["opts"].items():
    if st.button(f"{text}", use_container_width=True):
        st.session_state.answers.append(key)
        st.session_state.q_idx += 1

        # 마지막 질문이었으면 결과 계산
        if st.session_state.q_idx >= q_total:
            scores = compute_scores(st.session_state.answers)
            winner = pick_winner(scores, st.session_state.answers[-1])

            st.session_state.scores = scores
            st.session_state.result = winner
            st.session_state.done = True
        
        st.rerun()

st.divider()

# 하단 컨트롤
c1, c2 = st.columns(2)
with c1:
    if st.button("⬅️ 뒤로", use_container_width=True, disabled=(q_idx == 0)):
        if st.session_state.answers:
            st.session_state.answers.pop()
        st.session_state.q_idx = max(0, st.session_state.q_idx - 1)
        st.rerun()
with c2:
    if st.button("🗑️ 처음부터", use_container_width=True):
        reset()
        st.rerun()

st.caption("Made for CoolFlower 🌸")
