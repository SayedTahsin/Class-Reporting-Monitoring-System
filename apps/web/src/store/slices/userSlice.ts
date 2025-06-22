import { type PayloadAction, createSlice } from "@reduxjs/toolkit"

export interface User {
  id: string
  name: string
  email: string
  isLoggedIn: boolean
  section: string
  role: string
}

interface UserState {
  user: User | null
}

const initialState: UserState = {
  user: null,
}

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser(state, action: PayloadAction<User>) {
      state.user = action.payload
    },
    clearUser(state) {
      state.user = null
    },
  },
})

export const { setUser, clearUser } = userSlice.actions
export default userSlice.reducer
