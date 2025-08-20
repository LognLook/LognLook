export interface User {
  id: number;
  username: string;
  email: string;
}

export interface UserProfile extends User {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export default User;