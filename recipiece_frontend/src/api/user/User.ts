import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Buffer } from "buffer";
import { UserAccount, UserPreferences } from "../../data";
import { MutationArgs, QueryArgs, useDelete, useGet, usePost, usePut } from "../Request";
import { TokenManager } from "../TokenManager";
import { UserQueryKeys } from "./UserQueryKeys";


export const useGetSelfQuery = (args?: QueryArgs<UserAccount>) => {
  const { getter } = useGet();

  const query = async () => {
    const data = await getter<never, UserAccount>({
      path: "/user/self",
      withAuth: "access_token",
    });
    return data.data;
  };

  return useQuery({
    queryFn: query,
    queryKey: [UserQueryKeys.CURRENT_USER],
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnReconnect: true,
    ...(args ?? {}),
  });
};

export const useLoginUserMutation = (args?: MutationArgs<{ readonly access_token: string; readonly refresh_token: string }, any>) => {
  const { poster } = usePost();

  const mutation = async (data: { readonly username: string; readonly password: string }) => {
    const encoded = Buffer.from(`${data.username}:${data.password}`).toString("base64");
    const response = await poster<{}, { readonly access_token: string; readonly refresh_token: string }>({
      path: "/user/login",
      body: {},
      extraHeaders: {
        Authorization: `Basic ${encoded}`,
      },
    });
    return response.data;
  };

  return useMutation({
    mutationFn: mutation,
    ...(args ?? {}),
  });
};

export const useChangePasswordMutation = (args?: MutationArgs<void, any>) => {
  const { poster } = usePost({
    autoLogoutOnCodes: [],
  });

  const mutation = async (data: { readonly username: string; readonly password: string; readonly new_password: string }) => {
    const encoded = Buffer.from(`${data.username}:${data.password}`).toString("base64");
    const response = await poster<{}, never>({
      path: "/user/change-password",
      body: { new_password: data.new_password },
      extraHeaders: {
        Authorization: `Basic ${encoded}`,
      },
    });
    return response.data;
  };

  return useMutation({
    mutationFn: mutation,
    ...(args ?? {}),
  });
};

export const useLogoutUserMutation = (args?: MutationArgs<void, void>) => {
  const { poster } = usePost();
  const tokenResolver = TokenManager.getInstance();
  const queryClient = useQueryClient();

  const mutation = async () => {
    const response = await poster<{}, never>({
      path: "/user/logout",
      body: {},
      withAuth: "access_token",
    });
    return response.data;
  };

  const { onSuccess, onError, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, vars, ctx) => {
      tokenResolver.clear();
      queryClient.clear();
      onSuccess?.(data, vars, ctx);
    },
    onError: (err, _, ctx) => {
      tokenResolver.clear();
      queryClient.clear();
      onError?.(err as AxiosError, undefined, ctx);
    },
    ...restArgs,
  });
};

export const useCreateUserMutation = (args?: MutationArgs<void, any>) => {
  const { poster } = usePost();

  const mutation = async (args: { readonly username: string; readonly password: string; readonly email: string }) => {
    const response = await poster<typeof args, never>({
      path: "/user",
      body: args,
    });
    return response.data;
  };

  return useMutation({
    mutationFn: mutation,
    ...(args ?? {}),
  });
};

export const useUpdateUserMutation = (args?: MutationArgs<UserAccount, {readonly id: number, readonly username?: string, readonly email?: string; readonly preferences?: UserPreferences}>) => {
  const { putter } = usePut();
  const queryClient = useQueryClient();

  const mutation = async (args: { readonly id: number; readonly username?: string; readonly email?: string }) => {
    const response = await putter<typeof args, UserAccount>({
      path: "/user",
      body: args,
      withAuth: "access_token",
    });
    return response.data;
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, vars, ctx) => {
      queryClient.setQueryData([UserQueryKeys.CURRENT_USER], (old: UserAccount) => {
        if (old) {
          return { ...old, username: data.username, email: data.email, preferences: {...data.preferences} };
        }
        return undefined;
      });
      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });
};

export const useVerifyAccountMutation = (args?: MutationArgs<{}, {}>) => {
  const { poster } = usePost();
  const queryClient = useQueryClient();

  const mutation = async (args: { readonly token: string }) => {
    return await poster<typeof args, never>({
      path: "/user/verify-email",
      body: args,
      withAuth: "access_token",
    });
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (_, __, ctx) => {
      queryClient.setQueryData([UserQueryKeys.CURRENT_USER], (old: UserAccount) => {
        if (old) {
          return { ...old, validated: true };
        }
        return undefined;
      });
      onSuccess?.({}, {}, ctx);
    },
    ...restArgs,
  });
};

export const useRequestVerifyAccountMutation = (args?: MutationArgs) => {
  const { poster } = usePost();

  const mutation = async () => {
    const response = await poster<never, never>({
      path: "/user/request-token/verify-email",
      body: {} as never,
      withAuth: "access_token",
    });
    return response.data;
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    ...restArgs,
  });
};

export const useRequestForgotPasswordMutation = (args?: MutationArgs<void, any>) => {
  const { poster } = usePost();

  const mutation = async (body: { readonly username: string }) => {
    const response = await poster<typeof body, never>({
      path: "/user/request-token/forgot-password",
      body: { ...body },
    });
    return response.data;
  };

  return useMutation({
    mutationFn: mutation,
    ...(args ?? {}),
  });
};

export const useResetPasswordMutation = (args?: MutationArgs<void, any>) => {
  const { poster } = usePost();

  const mutation = async (body: { readonly token: string; readonly password: string }) => {
    const response = await poster<typeof body, never>({
      path: "/user/reset-password",
      body: { ...body },
    });
    return response.data;
  };

  return useMutation({
    mutationFn: mutation,
    ...(args ?? {}),
  });
};

export const useRequestRecipeImportMutation = (args?: MutationArgs<unknown, { readonly file: File; readonly source: string }>) => {
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

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (_, vars, ctx) => {
      onSuccess?.({}, vars, ctx);
    },
    ...restArgs,
  });
};

export const useOptIntoPushNotificationsMutation = (args?: MutationArgs<unknown, { readonly subscription_data: PushSubscriptionJSON; readonly device_id: string }>) => {
  const { poster } = usePost();

  const mutation = async (body: { readonly subscription_data: PushSubscriptionJSON; readonly device_id: string }) => {
    return await poster<typeof body, never>({
      path: "/user/push-notifications/opt-in",
      body: { ...body },
      withAuth: "access_token",
    });
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (_, params, ctx) => {
      onSuccess?.({}, params, ctx);
    },
    ...restArgs,
  });
};

export const useDeleteSelfMutation = (args?: MutationArgs) => {
  const { deleter } = useDelete();
  const queryClient = useQueryClient();

  const mutation = async () => {
    return await deleter({
      path: "/user/self",
      withAuth: "access_token",
    });
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (_, __, ctx) => {
      queryClient.clear();
      onSuccess?.({}, undefined, ctx);
    },
    ...restArgs,
  });
};
