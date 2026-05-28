// =============================================================
// SFL — Street Football League
// types/next-auth.d.ts
//
// Расширяем встроенные типы Auth.js, чтобы TypeScript знал
// о наших кастомных полях (role, firstName, lastName, photoUrl)
// в объектах Session и JWT.
// =============================================================

import type { DefaultSession, DefaultUser } from "next-auth";
import type { DefaultJWT }                  from "next-auth/jwt";
import type { Role }                        from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id:        string;
      role:      Role;
      firstName: string;
      lastName:  string;
      photoUrl:  string | null;
    } & DefaultSession["user"];
  }

  interface User extends DefaultUser {
    role:      Role;
    firstName: string;
    lastName:  string;
    photoUrl:  string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id:        string;
    role:      Role;
    firstName: string;
    lastName:  string;
    photoUrl:  string | null;
  }
}
