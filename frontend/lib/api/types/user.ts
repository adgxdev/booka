export interface SignupBody {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  department: string;
  level: number;
  universityId: string;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface UpdateUserBody {
  name?: string;
  phoneNumber?: string;
  department?: string;
  level?: number;
}

export interface ChangePasswordBody {
  currentPassword: string;
  newPassword: string;
}