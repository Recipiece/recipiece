import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MutationArgs, QueryArgs, useGet, usePost } from "./Request";
import { useContext } from "react";
import { AuthContext } from "../context";
import { UserAccount } from "../data";

export const useGetSelfQuery = (args?: QueryArgs) => {
  const { getter } = useGet();
  const { accessToken: authToken } = useContext(AuthContext);

  const query = async (): Promise<UserAccount> => {
    const data = await getter({
      path: "/user/self",
      withAuth: "access_token",
    });
    return data.data as UserAccount;
  };

  return useQuery({
    queryFn: query,
    queryKey: ["user", authToken],
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    enabled: args?.disabled !== true,
  });
};

export const useLoginUserMutation = (args?: MutationArgs<{ readonly access_token: string; readonly refresh_token: string }>) => {
  const { poster } = usePost();

  const mutation = async (data: { readonly username: string; readonly password: string }) => {
    return await poster<
      {
        readonly username: string;
        readonly password: string;
      },
      { readonly access_token: string; readonly refresh_token: string }
    >({
      path: "/user/login",
      body: { ...data },
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (response) => {
      args?.onSuccess?.(response.data);
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useLogoutUserMutation = (args?: MutationArgs<void>) => {
  const { poster } = usePost();
  const { setAccessToken, setRefreshToken } = useContext(AuthContext);

  const mutation = async () => {
    return await poster<never, never>({
      path: "/user/logout",
      body: {} as never,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: () => {
      setAccessToken(undefined);
      setRefreshToken(undefined);
      args?.onSuccess?.();
    },
    onError: (err) => {
      setAccessToken(undefined);
      setRefreshToken(undefined);
      args?.onFailure?.(err);
    },
  });
};

export const useCreateUserMutation = (args?: MutationArgs<void>) => {
  const { poster } = usePost();

  const mutation = async (args: { readonly username: string; readonly password: string }) => {
    return await poster<typeof args, never>({
      path: "/user/create",
      body: args,
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: () => {
      args?.onSuccess?.();
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useVerifyAccountMutation = (args?: MutationArgs<void>) => {
  const { poster } = usePost();
  const queryClient = useQueryClient();
  const { accessToken: authToken } = useContext(AuthContext);

  const mutation = async (args: { readonly token: string }) => {
    return await poster<typeof args, never>({
      path: "/user/verify-email",
      body: args,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user", authToken],
      });
      args?.onSuccess?.();
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useRequestVerifyAccountMutation = (args?: MutationArgs<void>) => {
  const { poster } = usePost();

  const mutation = async () => {
    return await poster<never, never>({
      path: "/user/request-token/verify-email",
      body: {} as never,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: () => {
      args?.onSuccess?.();
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};

export const useRequestForgotPasswordMutation = (args?: MutationArgs<void>) => {
  const { poster } = usePost();

  const mutation = async (body: { readonly username: string }) => {
    return await poster<typeof body, never>({
      path: "/user/request-token/forgot-password",
      body: { ...body },
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: () => {
      args?.onSuccess?.();
    },
    onError: (err) => {
      args?.onFailure?.(err);
    },
  });
};
