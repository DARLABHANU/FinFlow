import User, { IUser } from '../models/User';

export class UserRepository {
  async createUser(userData: Partial<IUser>): Promise<IUser> {
    const user = new User(userData);
    return await user.save();
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async updateBiometrics(id: string, isEnabled: boolean): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, { isBiometricEnabled: isEnabled }, { new: true });
  }

  async update(id: string, updateData: Partial<IUser>): Promise<IUser | null> {
    return await User.findByIdAndUpdate(id, updateData, { new: true });
  }
}

export default new UserRepository();
