import { useMutation } from "@tanstack/react-query";
import { MutationArgs, usePost } from "./request";
import { useContext } from "react";
import { AuthContext } from "../context";

export const useLoginUserMutation = (args?: MutationArgs<void>) => {
  const { post } = usePost();
  const { setAuthToken } = useContext(AuthContext);

  const mutation = async (data: {
    readonly username: string;
    readonly password: string;
  }) => {
    return await post<
      {
        readonly username: string;
        readonly password: string;
      },
      { readonly token: string }
    >({
      path: "/user/login",
      body: {...data},
      withAuth: false,
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (response) => {
      setAuthToken(response.data.token);
      args?.onSuccess?.();
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useCreateUserMutation = (args?: MutationArgs<void>) => {
  
}
