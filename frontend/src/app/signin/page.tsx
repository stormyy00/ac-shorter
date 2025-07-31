"use client";
import { Button } from "@/components/ui/button";
import { authClient } from "@/utils/auht-client";
import { ErrorContext } from "better-auth/react";
import Image from "next/image";
import React from "react";

const page = () => {
  const signIn = async (provider: string) => {
    await authClient.signIn.social(
      {
        provider: provider,
        callbackURL: "/",
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
  };
  return (
    <div className="flex justify-center items-center min-h-screen w-full py-6">
      <Button
        onClick={() => signIn("google")}
        className="
      w-full max-w-xs
      flex items-center justify-center gap-3
      bg-white border border-gray-200
      shadow-md
      rounded-xl
      py-3
      text-gray-700 text-base font-semibold
      hover:bg-gray-50 hover:shadow-lg
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
      transition-all
    "
      >
        <Image
          src="https://www.svgrepo.com/show/475656/google-color.svg"
          alt="Google"
          width={24}
          height={24}
          className="inline-block"
        />
        <span>Sign in with Google</span>
      </Button>
    </div>
  );
};

export default page;
