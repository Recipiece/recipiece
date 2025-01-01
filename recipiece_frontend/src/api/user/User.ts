import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { UserAccount } from "../../data";
import { MutationArgs, QueryArgs, useGet, usePost, usePut } from "../Request";
import { TokenManager } from "../TokenManager";
import { UserQueryKeys } from "./UserQueryKeys";
import { Buffer } from "buffer";

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
    queryKey: [UserQueryKeys.CURRENT_USER],
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    enabled: args?.disabled !== true,
  });
};

export const useLoginUserMutation = (args?: MutationArgs<{ readonly access_token: string; readonly refresh_token: string }>) => {
  const { poster } = usePost();

  const mutation = async (data: { readonly username: string; readonly password: string }) => {
    const encoded = Buffer.from(`${data.username}:${data.password}`).toString("base64");
    return await poster<{}, { readonly access_token: string; readonly refresh_token: string }>({
      path: "/user/login",
      body: {},
      extraHeaders: {
        Authorization: `Basic ${encoded}`,
      },
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

export const useChangePasswordMutation = (args?: MutationArgs<void>) => {
  const { poster } = usePost({
    autoLogoutOnCodes: [],
  });

  const mutation = async (data: { readonly username: string; readonly password: string; readonly new_password: string }) => {
    const encoded = Buffer.from(`${data.username}:${data.password}`).toString("base64");
    return await poster<{}, never>({
      path: "/user/change-password",
      body: { new_password: data.new_password },
      extraHeaders: {
        Authorization: `Basic ${encoded}`,
      },
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

  const mutation = async (args: { readonly username: string; readonly password: string; readonly email: string }) => {
    return await poster<typeof args, never>({
      path: "/user",
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

export const useUpdateUserMutation = (args?: MutationArgs<void>) => {
  const { putter } = usePut();
  const queryClient = useQueryClient();

  const mutation = async (args: { readonly id: number; readonly username?: string; readonly email?: string }) => {
    return await putter<typeof args, UserAccount>({
      path: "/user",
      body: args,
      withAuth: "access_token",
    });
  };

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data) => {
      queryClient.setQueryData([UserQueryKeys.CURRENT_USER], (old: UserAccount) => {
        if (old) {
          return { ...old, username: data.data.username };
        }
        return undefined;
      });
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
      queryClient.setQueryData([UserQueryKeys.CURRENT_USER], (old: UserAccount) => {
        if (old) {
          return { ...old, validated: true };
        }
        return undefined;
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

  const mutation = async (body: { readonly file: File; readonly source: string }) => {
    const formData = new FormData();
    formData.append("file", body.file);
    formData.append("source", body.source);

    return await poster<FormData, never>({
      path: "/user/import-recipes",
      body: formData,
      withAuth: "access_token",
      extraHeaders: {
        "Content-Type": "multipart/form-data",
      },
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

export const useOptIntoPushNotificationsMutation = (args?: MutationArgs<void>) => {
  const { poster } = usePost();

  const mutation = async (body: { readonly subscription_data: PushSubscriptionJSON; readonly device_id: string }) => {
    return await poster<typeof body, never>({
      path: "/user/push-notifications/opt-in",
      body: { ...body },
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
    mutationKey: ["pushNotificationOptIn"],
  });
};
