"use server";

import { z } from "zod";
import { serverAction } from "@/lib/actions/safe-actions";
import { prisma } from "@/lib/prisma";
import { RoleSchema } from "./schema";

// Create or update role
export const saveRoleAction = serverAction
  .schema(RoleSchema.extend({
    roleId: z.string().optional(),
    serverId: z.string(),
  }))
  .action(async ({ parsedInput: input, ctx }) => {
    if (input.roleId) {
      // Update existing role
      const role = await prisma.customRole.update({
        where: {
          id: input.roleId,
          organizationId: ctx.id,
        },
        data: {
          name: input.name,
          description: input.description,
          color: input.color,
          permissions: JSON.stringify(input.permissions),
          departmentId: input.departmentId,
        },
      });
      return role;
    } else {
      // Create new role
      const maxPositionRole = await prisma.customRole.findFirst({
        where: {
          organizationId: ctx.id
        },
        orderBy: {
          position: 'desc'
        },
        select: {
          position: true
        }
      });

      const nextPosition = maxPositionRole ? maxPositionRole.position + 1 : 0;
      
      const role = await prisma.customRole.create({
        data: {
          name: input.name,
          description: input.description,
          color: input.color,
          permissions: JSON.stringify(input.permissions),
          organizationId: ctx.id,
          departmentId: input.departmentId,
          position: nextPosition,
        },
      });
      return role;
    }
  });

// Delete role
export const deleteRoleAction = serverAction
  .schema(z.object({
    roleId: z.string(),
    serverId: z.string(),
  }))
  .action(async ({ parsedInput: input, ctx }) => {
    await prisma.customRole.delete({
      where: {
        id: input.roleId,
        organizationId: ctx.id,
      },
    });
    return { success: true };
  }); 