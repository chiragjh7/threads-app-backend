import UserService, { CreateUserPayload } from "../../services/user";

const queries = {
  getUserToken: async(_:any, payload: {email: string, password: string}) => {
    const token = await UserService.getUserToken({
      email: payload.email,
      password: payload.password,
    });
    return token;
  }
};

const mutations = {
  createUser: async (_: any, payload: CreateUserPayload) => {
    const response = await UserService.createUser(payload);
    return response.id;
  },
};

export const resolvers = { queries, mutations };
