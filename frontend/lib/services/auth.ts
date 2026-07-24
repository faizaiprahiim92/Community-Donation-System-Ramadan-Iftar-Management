import api from "./api";

export const authService = {
  async changePassword(currentPassword: string, newPassword: string): Promise<string> {
    const res = await api.post("/api/auth/change-password", {
      current_password: currentPassword,
      new_password: newPassword,
    });
    return res.data.message;
  },

  async resetPassword(userId: number, newPassword: string): Promise<string> {
    const res = await api.post("/api/auth/reset-password", {
      user_id: userId,
      new_password: newPassword,
    });
    return res.data.message;
  },
};
