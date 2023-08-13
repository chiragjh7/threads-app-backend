import { prismaClient } from "../lib/db";
import { createHmac, randomBytes } from "node:crypto";
import jwt from "jsonwebtoken";

const JWT_SECRET = "$uperman@1234";

export interface CreateUserPayload {
  firstName: string;
  lastName?: string;
  email: string;
  password: string;
}

export interface getUserTokenPayload {
  email: string;
  password: string;
}

class UserService {
  private static generateHash(password: string, salt: string) {
    const hashedPassword = createHmac("sha256", salt)
      .update(password)
      .digest("hex");
    return hashedPassword;
  }
  public static createUser(payload: CreateUserPayload) {
    const { firstName, lastName, email, password } = payload;
    const salt = randomBytes(32).toString("hex");
    const hashedPassword = UserService.generateHash(password, salt);
    return prismaClient.user.create({
      data: {
        firstName,
        lastName,
        email,
        salt,
        password: hashedPassword,
      },
    });
  }

  private static getUserByEmail(email: string) {
    return prismaClient.user.findUnique({
      where: { email },
    });
  }

  public static getUserById(id: string) {
    return prismaClient.user.findUnique({ where: { id } });
  }

  public static decodeJwtToken(token: string) {
    return jwt.verify(token, JWT_SECRET);
  }

  public static async getUserToken(payload: getUserTokenPayload) {
    const { email, password } = payload;
    const user = await UserService.getUserByEmail(email);
    if (!user) throw new Error("user not found");

    const userSalt = user.salt;
    const userHashedPassword = UserService.generateHash(password, userSalt);
    if (userHashedPassword !== user.password) {
      throw new Error("invalid password");
    }
    // Gen token
    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET);
    return token;
  }
}

export default UserService;
