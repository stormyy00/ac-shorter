import { auth } from "@/utils/auth";
import { SignIn } from "@/utils/signin";
import { headers } from "next/headers";
import Fault from "@/utils/error";
import { verifyUser } from "./actions";

type ProtectedProps = {
  children: React.ReactNode;
};

const Protected = async ({ children }: ProtectedProps) => {
  const session = await auth.api.getSession({ headers: headers() });

  if (!session) {
    return <SignIn provider="google" callbackURL="/dashboard" />;
  }

  const data = await verifyUser();

  if (data.status !== "success") {
    throw new Fault(403, "Unauthorized", "You do not have access this page");
  }

  return <>{children}</>;
};

export default Protected;
