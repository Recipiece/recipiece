import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserAccount } from "../data";
import { MutationArgs, QueryArgs, useGet, usePost } from "./Request";
import { TokenManager } from "./TokenManager";

export const useGetSelfQuery = (args?: QueryArgs) => {
  const { getter } = useGet();

  const query = async (): Promise<UserAccount> => {
    const data = await getter({
      path: "/user/self",
      withAuth: "access_token",
    });
    return data.data as UserAccount;
  };

  return useQuery({
    queryFn: query,
    queryKey: ["currentUser"],
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
  const tokenResolver = TokenManager.getInstance();

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
      tokenResolver.clear();
      args?.onSuccess?.();
    },
    onError: (err) => {
      tokenResolver.clear();
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
        queryKey: ["currentUser"],
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

export const useResetPasswordMutation = (args?: MutationArgs<void>) => {
  const { poster } = usePost();

  const mutation = async (body: { readonly token: string; readonly password: string }) => {
    return await poster<typeof body, never>({
      path: "/user/reset-password",
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

export const useRequestRecipeImport = (args?: MutationArgs<void>) => {
  const { poster } = usePost();

  const mutation = async (body: { readonly file: File, readonly source: string }) => {
    const formData = new FormData();
    formData.append("file", body.file);
    formData.append("source", body.source);

    return await poster<FormData, never>({
      path: "/user/import-recipes",
      body: formData,
      withAuth: "access_token",
      extraHeaders: {
        "Content-Type": "multipart/form-data",
      }
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
