# PROMPT:
#
# Create a new file tic-tac-toe.py and use Python's Streamlit library to build
# a tic-tac-toe game.
#
# RUN:
#
# streamlit run tic_tac_toe.py
#

import streamlit as st

st.set_page_config(page_title="Tic-Tac-Toe", page_icon="🎮")

st.title("🎮 Tic-Tac-Toe")


def init_game():
    """Initialize or reset the game state."""
    st.session_state.board = [""] * 9
    st.session_state.current_player = "X"
    st.session_state.winner = None
    st.session_state.game_over = False


def check_winner(board):
    """Check if there's a winner or a tie."""
    winning_combinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],  # Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8],  # Columns
        [0, 4, 8], [2, 4, 6]              # Diagonals
    ]

    for combo in winning_combinations:
        if board[combo[0]] == board[combo[1]] == board[combo[2]] != "":
            return board[combo[0]]

    if "" not in board:
        return "Tie"

    return None


def make_move(position):
    """Handle a move at the given position."""
    if (st.session_state.board[position] == "" and
            not st.session_state.game_over):
        st.session_state.board[position] = st.session_state.current_player
        winner = check_winner(st.session_state.board)

        if winner:
            st.session_state.winner = winner
            st.session_state.game_over = True
        else:
            st.session_state.current_player = (
                "O" if st.session_state.current_player == "X" else "X"
            )


if "board" not in st.session_state:
    init_game()

if st.session_state.game_over:
    if st.session_state.winner == "Tie":
        st.info("🤝 It's a tie!")
    else:
        st.success(f"🎉 Player {st.session_state.winner} wins!")
else:
    st.write(f"Current player: **{st.session_state.current_player}**")

st.markdown("""
<style>
    .stButton > button {
        width: 100px;
        height: 100px;
        font-size: 40px;
        font-weight: bold;
        margin: 0 !important;
    }
    [data-testid="stHorizontalBlock"] {
        gap: 10px !important;
    }
    [data-testid="stVerticalBlock"] {
        gap: 0 !important;
    }
    .stButton {
        margin-bottom: 10px !important;
    }
</style>
""", unsafe_allow_html=True)

for row in range(3):
    cols = st.columns(3, gap="small")
    for col in range(3):
        position = row * 3 + col
        with cols[col]:
            cell_value = st.session_state.board[position]
            display = cell_value if cell_value else " "
            if st.button(display, key=f"cell_{position}"):
                make_move(position)
                st.rerun()

st.write("")
if st.button("🔄 New Game"):
    init_game()
    st.rerun()
