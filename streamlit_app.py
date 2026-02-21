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

hide_st_style = """
            <style>
            #MainMenu {visibility: hidden;}
            footer {visibility: hidden;}
            header {visibility: hidden;}
            </style>
            """
st.markdown(hide_st_style, unsafe_allow_html=True)

# -----------------------------
# 1) 결과(꽃) 정의
# -----------------------------
FLOWERS = {
    "DAISY": {
        "name": "해바라기",
        "emoji": "🌻",
        "desc": "어색한 공기는 못 참는 **인간 비타민**!<br>새내기 땐 선배들 사랑 독차지하고, 선배 되면 후배들이 줄 서는 핵인싸 타입.",
        "role": "👑 추천 포지션: **모임의 중심! 오락부장 & 분위기 메이커**",
        "image": "images/sunflower.jpg",
    },
    "FORGET": {
        "name": "안개꽃",
        "emoji": "🌫️",
        "desc": "튀지 않지만 없으면 동아리 안 돌아가는 **숨은 실세**.<br>소외되는 부원 없이 세심하게 챙겨주는 힐링 타입.",
        "role": "👑 추천 포지션: **부원들의 대나무숲! 멘토링 & 힐링 케어 담당**",
        "image": "images/babysbreath.jpg",
    },
    "DELPH": {
        "name": "목련",
        "emoji": "🤍",
        "desc": "PPT 폰트까지 맞추는 **갓생 계획러**.<br>임원진들이 탐내는 차기 회장/총무 1순위 후보!",
        "role": "👑 추천 포지션: **동아리 살림꾼! 총무 & 행사 기획 총괄**",
        "image": "images/magnolia.jpg",
    },
    "LAV": {
        "name": "선인장",
        "emoji": "🌵",
        "desc": "일처리는 칼 같고 내 사람은 확실히 챙기는 **겉바속촉 츤데레**.<br>위기 상황을 딱 정리해주는 사이다 발언 장인.",
        "role": "👑 추천 포지션: **위기 탈출 넘버원! 규율 관리 & 해결사**",
        "image": "images/cactus.jpg",
    },
    "ROSE": {
        "name": "난(Orchid)",
        "emoji": "🌿",
        "desc": "존재감 확실하고 센스 넘치는 **입덕몰이 아이콘**.<br>너만의 독특한 아우라가 있는 동아리의 간판.",
        "role": "👑 추천 포지션: **동아리의 간판! 홍보 모델 & 대외협력 팀장**",
        "image": "images/orchid.jpg",
    },
    "SUN": {
        "name": "장미",
        "emoji": "🌹",
        "desc": "필 꽂히면 밤새서라도 끝장을 보는 **열정의 불도저**.<br>전설의 MT나 축제를 만들어내는 추진력 대장.",
        "role": "👑 추천 포지션: **판을 키우는 능력자! 축제/MT 추진 위원장**",
        "image": "images/rose.jpg",
    },
}

# -----------------------------
# 2) 질문 정의 (이미지 경로 추가)
# -----------------------------
QUESTIONS = [
    {
        "q": "쿨라워 OT 날! 마음에 드는 동기/선배가 눈에 띈다. 나의 행동은?",
        "img": "images/q1_party.jpg", # 질문 관련 이미지 경로 (없으면 스킵됨)
        "opts": {
            "A": "자연스럽게 옆에 가서 말을 건다. \"혹시 무슨 과세요?\"",
            "B": "내 쪽을 봐주길 기다리며 근처를 서성인다.",
        },
    },
    {
        "q": "동기한테 카톡이 왔다. '나 오늘 우울해서 꽃 샀어...' 나의 답장은?",
        "img": "images/q2_kakao.jpg",
        "opts": {
            "A": "헐 ㅠㅠ 무슨 일 있어? 괜찮아?",
            "B": "오 무슨 꽃?? 사진 보여줘!",
            "C": "왜 우울해? 누가 괴롭혔어?",
            "D": "꽃 살 돈이 있다니... 부자네?",
        },
    },
    {
        "q": "테라리움 만들기 활동 중! 옆자리 부원이 이상한 작품을 보여주며 묻는다.<br>\"예쁘죠?! 저희 조 대표작으로 낼까요?\"",
        "img": "images/q3_terrarium.jpg",
        "opts": {
            "A": "응!! 엄청 예쁘다!! 너만의 감성이 있어!",
            "B": "음, 여기 좀 수정하고... 투표로 정하는 게 어때?",
        },
    },
    {
        "q": "압화를 활용한 엽서 만들기 시간! 재료를 받자마자 나는?",
        "img": "images/q4_postcard.jpg",
        "opts": {
            "A": "일단 핀셋 들고 꽃 배치부터 완벽하게 구상한다.",
            "B": "필 꽂히는 대로 풀칠부터 시작한다.",
        },
    },
]

# -----------------------------
# 3) 가중치 및 로직 함수
# -----------------------------
S = {
    0: {"A": {"DAISY": 3, "ROSE": 3, "SUN": 2}, "B": {"FORGET": 3, "LAV": 3, "DELPH": 2}},
    1: {"A": {"FORGET": 4, "DAISY": 2}, "B": {"DAISY": 2, "SUN": 2}, "C": {"DELPH": 3, "ROSE": 1}, "D": {"LAV": 5, "ROSE": 2}},
    2: {"A": {"FORGET": 3, "DAISY": 3, "SUN": 1}, "B": {"LAV": 3, "DELPH": 3, "ROSE": 2}},
    3: {"A": {"DELPH": 5, "LAV": 2, "FORGET": 1}, "B": {"SUN": 5, "ROSE": 3, "DAISY": 2}},
}

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
    return random.choice(cand)

def safe_show_image(path_or_url, caption=None):
    if path_or_url and os.path.exists(path_or_url):
        st.image(path_or_url, caption=caption, use_container_width=True)
    elif path_or_url and path_or_url.startswith("http"):
        st.image(path_or_url, caption=caption, use_container_width=True)

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

# --- 결과 화면 ---
if st.session_state.done and st.session_state.result:
    key = st.session_state.result
    info = FLOWERS[key]

    st.subheader(f"{info['emoji']} 당신은 **{info['name']}**!")
    safe_show_image(info["image"], caption=f"{info['name']} 타입")
    st.markdown(info["desc"], unsafe_allow_html=True)
    st.success(info["role"])

    # 잘 맞는 파트너
    sorted_scores = sorted(st.session_state.scores.items(), key=lambda x: -x[1])
    second = sorted_scores[1][0] if len(sorted_scores) > 1 else None
    if second:
        st.info(f"🤝 너랑 잘 맞는 파트너 꽃은? **{FLOWERS[second]['name']}** {FLOWERS[second]['emoji']}")

    st.divider()
    
    # 마무리 멘트 및 구글 폼 링크
    st.markdown("### 💌 쿨라워가 당신을 기다려요!")
    st.write("테스트 결과가 마음에 드셨나요? 당신의 소중한 의견을 들려주세요!")
    
    # 버튼 형태의 링크 제안
    survey_url = "https://docs.google.com/forms/d/e/1FAIpQLSfjVbW6U0Goq35FS6EIJvf9NelmtupuGtWHtCWyG5UgK7s8mw/viewform"
    st.link_button("✍️ 테스트 후기 남기고 가기", survey_url, use_container_width=True)
    
    if st.button("🔁 다시하기", use_container_width=True):
        reset()
        st.rerun()
    st.stop()

# --- 질문 화면 ---
q_idx = st.session_state.q_idx
q_total = len(QUESTIONS)
q_obj = QUESTIONS[q_idx]

st.progress((q_idx) / q_total)
st.subheader(f"Q{q_idx + 1}")
st.markdown(f"**{q_obj['q']}**", unsafe_allow_html=True)

# 질문 이미지 삽입 (경로에 파일이 있을 때만 표시)
safe_show_image(q_obj.get("img"))

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

# 뒤로가기 / 처음부터
st.divider()
c1, c2 = st.columns(2)
with c1:
    if st.button("⬅️ 뒤로", use_container_width=True, disabled=(q_idx == 0)):
        st.session_state.answers.pop()
        st.session_state.q_idx -= 1
        st.rerun()
with c2:
    if st.button("🗑️ 처음부터", use_container_width=True):
        reset()
        st.rerun()

st.caption("Made for CoolFlower 🌸")
