import type { Statements } from "better-auth/plugins/access";
import { createAccessControl } from "better-auth/plugins/access";
import {
  adminAc,
  defaultStatements,
  memberAc,
  ownerAc,
} from "better-auth/plugins/organization/access";
import { z } from "zod";

const statement = {
  ...defaultStatements,
  project: ["create", "share", "update", "delete"],
  tweet: ["create", "update", "delete"],
  videos: ["create", "update", "delete", "view"],
} as const satisfies Statements;

export const AuthPermissionSchema = z.object(
  Object.fromEntries(
    Object.entries(statement).map(([key, actions]) => [
      key,
      z
        .array(z.enum([...actions] as unknown as [string, ...string[]]))
        .optional(),
    ]),
  ) as unknown as {
    [K in keyof typeof statement]: z.ZodOptional<
      z.ZodArray<
        z.ZodEnum<
          [
            ...((typeof statement)[K] extends readonly (infer T)[]
              ? T extends string
                ? (typeof statement)[K] extends readonly [string, ...string[]]
                  ? (typeof statement)[K]
                  : never
                : never
              : never),
          ]
        >
      >
    >;
  },
);

export type AuthPermission = z.infer<typeof AuthPermissionSchema>;

export const ac = createAccessControl(statement);

const member = ac.newRole({
  project: ["create"],
  videos: ["view"],
  ...memberAc.statements,
});

const admin = ac.newRole({
  project: ["create", "update"],
  videos: ["view", "create", "update"],
  ...adminAc.statements,
});

const owner = ac.newRole({
  ...(statement as Statements),
  ...ownerAc.statements,
});

export const roles = { member, admin, owner } as const;

export const RolesKeys = ["member", "admin", "owner"] as const;

export type AuthRole = keyof typeof roles;
