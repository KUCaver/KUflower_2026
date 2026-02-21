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

# 상단 메뉴/푸터 숨기기
hide_st_style = """
            <style>
            #MainMenu {visibility: hidden;}
            footer {visibility: hidden;}
            header {visibility: hidden;}
            </style>
            """
st.markdown(hide_st_style, unsafe_allow_html=True)

# -----------------------------
# 1) 결과(꽃) 정의 (원본 데이터 유지)
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
        "desc": "일처리는 칼 같고 내 사람은 확실히 챙기는 **겉바속촉 츤데레**.<br>답답한 상황 딱 정리해주는 사이다 발언 장인이라, 후배들이 '와 멋있다...' 하고 몰래 동경.",
        "role": "👑 추천 포지션: **위기 탈출 넘버원! 규율 관리 & 해결사**--> 당장 쿨라워 운영진 지원!!",
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
# 2) 질문 정의 (질문 데이터 유지 + 이미지 필드 추가)
# -----------------------------
QUESTIONS = [
    {
        "q": "쿨라워 OT 날! 마음에 드는 동기/선배가 눈에 띈다. 나의 행동은?",
        "q_img": "images/q1.jpg", # 질문별 이미지 경로
        "opts": {
            "A": "자연스럽게 옆에 가서 말을 건다. \"혹시 무슨 과세요?\" (선공)",
            "B": "내 쪽을 봐주길 기다리며 근처를 서성인다. (간택 대기)",
        },
    },
    {
        "q": "동기한테 카톡이 왔다. '나 오늘 우울해서 꽃 샀어...' 나의 답장은?",
        "q_img": "images/q2.jpg",
        "opts": {
            "A": "헐 ㅠㅠ 무슨 일 있어? 괜찮아? (걱정)",
            "B": "오 무슨 꽃?? 사진 보여줘! (관심)",
            "C": "왜 우울해? 누가 괴롭혔어? (원인 분석)",
            "D": "꽃 살 돈이 있다니... 부자네? (장난/팩폭)",
        },
    },
    {
        "q": "테라리움 만들기 활동 중! 옆자리 부원이 (솔직히 좀 이상한) 작품을 보여주며<br>\"예쁘죠?! 저희 조 대표작으로 낼까요?\"라고 묻는다.",
        "q_img": "images/q3.jpg",
        "opts": {
            "A": "응!! 엄청 예쁘다!! 너만의 감성이 있어! (일단 칭찬)",
            "B": "음, 여기 좀 수정하고... 공정하게 투표로 정하는 게 어때? (냉철한 판단)",
        },
    },
    {
        "q": "꽃를 활용한 석고방향제 만들기 시간!<br>재료를 받자마자 나는?",
        "q_img": "images/q4.jpg",
        "opts": {
            "A": "일단 핀셋 들고 꽃 배치부터 완벽하게 구상한다. (설계형)",
            "B": "필 꽂히는 대로 풀칠부터 시작한다. (직관형)",
        },
    },
]

# -----------------------------
# 3) 가중치 테이블 (원본 유지)
# -----------------------------
S = {
    0: {"A": {"DAISY": 3, "ROSE": 3, "SUN": 2}, "B": {"FORGET": 3, "LAV": 3, "DELPH": 2}},
    1: {"A": {"FORGET": 4, "DAISY": 2}, "B": {"DAISY": 2, "SUN": 2}, "C": {"DELPH": 3, "ROSE": 1}, "D": {"LAV": 5, "ROSE": 2}},
    2: {"A": {"FORGET": 3, "DAISY": 3, "SUN": 1}, "B": {"LAV": 3, "DELPH": 3, "ROSE": 2}},
    3: {"A": {"DELPH": 5, "LAV": 2, "FORGET": 1}, "B": {"SUN": 5, "ROSE": 3, "DAISY": 2}},
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
    max_score = max(scores.values())
    cand = [k for k, v in scores.items() if v == max_score]
    if len(cand) == 1: return cand[0]
    q_last_idx = len(QUESTIONS) - 1
    if q_last_idx in S:
        q8 = S[q_last_idx].get(last_choice, {})
        bonus = {k: q8.get(k, 0) for k in cand}
        best = max(bonus.values())
        cand2 = [k for k, b in bonus.items() if b == best]
        return random.choice(cand2)
    return random.choice(cand)

def safe_show_image(path_or_url, caption=None):
    if path_or_url and (os.path.exists(path_or_url) or path_or_url.startswith("http")):
        try:
            st.image(path_or_url, caption=caption, use_container_width=True)
        except:
            pass # 이미지 로드 실패 시 조용히 넘어감
    else:
        if not caption: # 결과 창 이미지가 없을 때만 안내 메시지 표시
            st.info("🖼️ (이미지를 준비 중입니다!)")

def reset():
    st.session_state.q_idx = 0
    st.session_state.answers = []
    st.session_state.done = False
    st.session_state.result = None
    st.session_state.scores = None

# -----------------------------
# 5) 메인 실행 로직
# -----------------------------
if "q_idx" not in st.session_state:
    reset()

st.title("🌸 쿨라워 꽃 성향 테스트")
st.caption("새내기 환영회 & 동아리 활동 스타일로 알아보는 나의 꽃은?")

# --- 결과 화면 ---
if st.session_state.done and st.session_state.result:
    key = st.session_state.result
    info = FLOWERS[key]

    st.subheader(f"{info['emoji']} 당신은 **{info['name']}**!")
    safe_show_image(info["image"], caption=f"{info['name']} 타입")
    st.markdown(info["desc"], unsafe_allow_html=True)
    st.success(info["role"])

    sorted_scores = sorted(st.session_state.scores.items(), key=lambda x: -x[1])
    second = sorted_scores[1][0] if len(sorted_scores) > 1 else None
    
    if second:
        st.info(f"🤝 너랑 잘 맞는 파트너 꽃은? **{FLOWERS[second]['name']}** {FLOWERS[second]['emoji']}")

    st.divider()

    # 구글 폼 연동 마무리 멘트
    st.markdown("### 💌 테스트가 즐거우셨나요?")
    st.write("여러분의 소중한 한 학기를 더 재미있는 쿨라워에서 만들어가고 싶어요!!")
    
    survey_url = "https://docs.google.com/forms/d/e/1FAIpQLSfjVbW6U0Goq35FS6EIJvf9NelmtupuGtWHtCWyG5UgK7s8mw/viewform"
    st.link_button("✍️ 쿨라워에게 지원하기!! (구글 폼)", survey_url, use_container_width=True)

    st.write("")
    col1, col2 = st.columns(2)
    with col1:
        if st.button("🔁 다시하기", use_container_width=True):
            reset()
            st.rerun()
    with col2:
        st.button("📌 캡처해서 자랑하기", use_container_width=True, disabled=True)
    
    st.stop()

# --- 질문 화면 ---
q_total = len(QUESTIONS)
q_idx = st.session_state.q_idx
q_obj = QUESTIONS[q_idx]

st.progress((q_idx) / q_total)
st.write(f"Question {q_idx + 1} / {q_total}")

st.subheader(f"Q{q_idx + 1}")
st.markdown(f"**{q_obj['q']}**", unsafe_allow_html=True)

# 질문 이미지 삽입 (이미지가 존재할 경우 표시)
safe_show_image(q_obj.get("q_img"))

st.write("")
for key, text in q_obj["opts"].items():
    if st.button(f"{text}", key=f"btn_{q_idx}_{key}", use_container_width=True):
        st.session_state.answers.append(key)
        st.session_state.q_idx += 1
        if st.session_state.q_idx >= q_total:
            scores = compute_scores(st.session_state.answers)
            winner = pick_winner(scores, st.session_state.answers[-1])
            st.session_state.scores = scores
            st.session_state.result = winner
            st.session_state.done = True
        st.rerun()

st.divider()
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
