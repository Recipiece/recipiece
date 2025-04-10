import {
  CreatePushNotificationRequestSchema,
  CreateUserRequestSchema,
  CreateUserResponseSchema,
  IssueForgotPasswordTokenRequestSchema,
  UpdateUserRequestSchema,
  UserSchema,
  YCreateUserResponseSchema,
  YLoginResponseSchema,
  YUserSchema,
} from "@recipiece/types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Buffer } from "buffer";
import { MutationArgs, PostRequest, QueryArgs, useDelete, useGet, usePost, usePut } from "../Request";
import { TokenManager } from "../TokenManager";
import { UserQueryKeys } from "./UserQueryKeys";

export const useGetSelfQuery = (args?: QueryArgs<UserSchema>) => {
  const { getter } = useGet();

  const query = async () => {
    const data = await getter<never, UserSchema>({
      path: "/user/self",
      withAuth: "access_token",
    });
    return YUserSchema.cast(data.data);
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

export const useLoginUserMutation = (args?: MutationArgs<{ readonly access_token: string; readonly refresh_token: string }, unknown>) => {
  const { poster } = usePost();

  const mutation = async (data: { readonly username: string; readonly password: string; readonly turnstileToken?: string }) => {
    const turnstileSiteKey = process.env.RECIPIECE_TURNSTILE_SITE_KEY;
    const { username, password, turnstileToken } = data;

    const encoded = Buffer.from(`${username}:${password}`).toString("base64");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let headers: any = {
      Authorization: `Basic ${encoded}`,
    };

    if (turnstileSiteKey) {
      headers = {
        ...headers,
        "recipiece-verify-turnstile": turnstileToken,
      };
    }

    const response = await poster<unknown, { readonly access_token: string; readonly refresh_token: string }>({
      path: "/user/login",
      body: {},
      extraHeaders: { ...headers },
    });
    return YLoginResponseSchema.cast(response.data);
  };

  return useMutation({
    mutationFn: mutation,
    ...(args ?? {}),
  });
};

export const useChangePasswordMutation = (args?: MutationArgs<void, unknown>) => {
  const { poster } = usePost({
    autoLogoutOnCodes: [],
  });

  const mutation = async (data: { readonly username: string; readonly password: string; readonly new_password: string }) => {
    const encoded = Buffer.from(`${data.username}:${data.password}`).toString("base64");
    const response = await poster<unknown, never>({
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
    const response = await poster<unknown, never>({
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

export const useCreateUserMutation = (args?: MutationArgs<CreateUserResponseSchema, CreateUserRequestSchema>) => {
  const { poster } = usePost();

  const mutation = async (args: CreateUserRequestSchema & { readonly turnstileToken?: string }) => {
    const { turnstileToken, ...restArgs } = args;
    let requestSetup: PostRequest<typeof restArgs> = {
      path: "/user",
      body: { ...restArgs },
    };

    if (turnstileToken) {
      requestSetup = {
        ...requestSetup,
        extraHeaders: {
          "recipiece-verify-turnstile": turnstileToken,
        },
      };
    }

    const response = await poster({ ...requestSetup });
    return YCreateUserResponseSchema.cast(response.data);
  };

  return useMutation({
    mutationFn: mutation,
    ...(args ?? {}),
  });
};

export const useUpdateUserMutation = (args?: MutationArgs<UserSchema, UpdateUserRequestSchema>) => {
  const { putter } = usePut();
  const queryClient = useQueryClient();

  const mutation = async (args: UpdateUserRequestSchema) => {
    const response = await putter({
      path: "/user",
      body: args,
      withAuth: "access_token",
    });
    return YUserSchema.cast(response.data);
  };

  const { onSuccess, ...restArgs } = args ?? {};

  return useMutation({
    mutationFn: mutation,
    onSuccess: (data, vars, ctx) => {
      queryClient.setQueryData([UserQueryKeys.CURRENT_USER], (old: UserSchema) => {
        if (old) {
          return { ...old, username: data.username, email: data.email, preferences: { ...data.preferences } };
        }
        return undefined;
      });
      onSuccess?.(data, vars, ctx);
    },
    ...restArgs,
  });
};

export const useVerifyAccountMutation = (args?: MutationArgs<unknown, unknown>) => {
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
      queryClient.setQueryData([UserQueryKeys.CURRENT_USER], (old: UserSchema) => {
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

  return useMutation({
    mutationFn: mutation,
    ...(args ?? {}),
  });
};

export const useRequestForgotPasswordMutation = (args?: MutationArgs<void, IssueForgotPasswordTokenRequestSchema>) => {
  const { poster } = usePost();

  const mutation = async (body: IssueForgotPasswordTokenRequestSchema & { readonly turnstileToken?: string }) => {
    const { turnstileToken, ...restArgs } = body;
    let requestSetup: PostRequest<typeof restArgs> = {
      path: "/user/request-token/forgot-password",
      body: { ...restArgs },
    };
    if (turnstileToken) {
      requestSetup = {
        ...requestSetup,
        extraHeaders: {
          "recipiece-verify-turnstile": turnstileToken,
        },
      };
    }
    const response = await poster<typeof restArgs, never>({ ...requestSetup });
    return response.data;
  };

  return useMutation({
    mutationFn: mutation,
    ...(args ?? {}),
  });
};

export const useResetPasswordMutation = (args?: MutationArgs<void, unknown>) => {
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

    return await poster({
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

export const useOptIntoPushNotificationsMutation = (args?: MutationArgs<unknown, CreatePushNotificationRequestSchema>) => {
  const { poster } = usePost();

  const mutation = async (body: CreatePushNotificationRequestSchema) => {
    return await poster({
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
