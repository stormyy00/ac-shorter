"use client";

import { ErrorContext } from "better-auth/react";
import { authClient } from "./auht-client";

export const SignIn = async ({provider, callbackURL}: {provider: string, callbackURL: string}) => 
    void await authClient.signIn.social(
      {
        provider: provider,
        callbackURL: callbackURL,
      },
      {
        onSuccess: async () => {},
        onError: (ctx: ErrorContext) => {
          alert({
            title: "Something went wrong",
            description: ctx.error.message ?? "Something went wrong.",
            variant: "destructive",
          });
        },
      }
    );
