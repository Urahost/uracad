"use server";

import { z } from "zod";
import {  serverAction } from "@/lib/actions/safe-actions";
import { prisma } from "@/lib/prisma";
import { ActionError } from "@/lib/actions/safe-actions";
import { logger } from "@/lib/logger";
import { resolveActionResult } from "@/lib/actions/actions-utils";

// Schéma pour la création/mise à jour d'un rôle
const RoleSchema = z.object({
  name: z.string().min(1, "Le nom du rôle est obligatoire"),
  color: z.string(),
  permissions: z.record(z.boolean()),
});

// Schéma pour l'ajout de membres à un rôle
const AddMembersSchema = z.object({
  roleId: z.string(),
  memberIds: z.array(z.string()),
});

// Schéma pour la suppression d'un rôle
const DeleteRoleSchema = z.object({
  roleId: z.string(),
});

// Schéma pour obtenir les membres d'un serveur
const GetMembersSchema = z.object({
  query: z.string().optional(),
  roleId: z.string().optional(),
});

// Schéma pour obtenir les membres d'un rôle
const GetRoleMembersSchema = z.object({
  roleId: z.string()
});

// Schéma pour supprimer un membre d'un rôle
const RemoveMemberSchema = z.object({
  memberId: z.string(),
  roleId: z.string(),
});

// Définir un type pour le schéma updateRole
const UpdateRoleSchema = RoleSchema.extend({
  roleId: z.string(),
  departmentId: z.string().nullable().optional(),
});

// Schéma pour la création d'un département
const CreateDepartmentSchema = z.object({
  name: z.string().min(1, "Le nom est requis"),
});

// Schéma pour obtenir les départements
const GetDepartmentsSchema = z.object({
  serverId: z.string(),
});

// Schéma pour la suppression d'un département
const DeleteDepartmentSchema = z.object({
  departmentId: z.string(),
});

// Action pour créer un rôle
export const createRoleAction = serverAction
  .metadata({
    roles: ["owner", "admin"],
  })
  .schema(RoleSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    try {
      // Trouver la position maximale actuelle
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
          color: input.color,
          permissions: JSON.stringify(input.permissions),
          organizationId: ctx.id,
          position: nextPosition,
        },
      });

      return role;
    } catch (error) {
      logger.error("Erreur lors de la création du rôle:", error);
      throw new ActionError("Impossible de créer le rôle");
    }
  });

// Action pour mettre à jour un rôle
export const updateRoleAction = serverAction
  .metadata({
    roles: ["owner", "admin"],
  })
  .schema(UpdateRoleSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    try {
      // Vérifier que le rôle appartient au serveur
      const existingRole = await prisma.customRole.findFirst({
        where: {
          id: input.roleId,
          organizationId: ctx.id,
        },
      });

      if (!existingRole) {
        throw new ActionError("Rôle introuvable");
      }

      const role = await prisma.customRole.update({
        where: {
          id: input.roleId,
        },
        data: {
          name: input.name,
          color: input.color,
          permissions: JSON.stringify(input.permissions),
          departmentId: input.departmentId,
        },
      });

      return role;
    } catch (error) {
      if (error instanceof ActionError) throw error;
      
      logger.error("Erreur lors de la mise à jour du rôle:", error);
      throw new ActionError("Impossible de mettre à jour le rôle");
    }
  });

// Action pour supprimer un rôle
export const deleteRoleAction = serverAction
  .metadata({
    roles: ["owner", "admin"],
  })
  .schema(DeleteRoleSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    try {
      // Vérifier que le rôle appartient au serveur
      const existingRole = await prisma.customRole.findFirst({
        where: {
          id: input.roleId,
          organizationId: ctx.id,
        },
      });

      if (!existingRole) {
        throw new ActionError("Rôle introuvable");
      }

      await prisma.customRole.delete({
        where: {
          id: input.roleId,
        },
      });

      return { success: true };
    } catch (error) {
      if (error instanceof ActionError) throw error;
      
      logger.error("Erreur lors de la suppression du rôle:", error);
      throw new ActionError("Impossible de supprimer le rôle");
    }
  });

// Action pour obtenir tous les membres d'un serveur
export const getServerMembersAction = serverAction
  .schema(GetMembersSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    try {
      if (!ctx.id) {
        throw new ActionError("Contexte du serveur non disponible");
      }

      const members = await prisma.member.findMany({
        where: {
          organizationId: ctx.id,
          // Changer le filtre pour ne récupérer QUE les membres qui n'ont PAS ce rôle spécifique
          // ou qui n'ont PAS de rôle du tout (customRoleId est null)
          ...(input.roleId ? {
            OR: [
              { customRoleId: null },  // Membres sans rôle
              { 
                customRoleId: {
                  not: input.roleId
                }
              }  // Membres avec un autre rôle
            ]
          } : {}),
          ...(input.query ? {
            user: {
              OR: [
                { name: { contains: input.query, mode: "insensitive" } },
                { email: { contains: input.query, mode: "insensitive" } },
              ],
            }
          } : {}),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        take: 50, // Limiter le nombre de résultats pour éviter les problèmes de performance
      });
      
      // Vérification de sécurité pour s'assurer que les données sont bien formatées
      const formattedMembers = members.map(member => ({
        id: member.id,
        userId: member.userId,
        name: member.user.name || "Utilisateur sans nom",
        email: member.user.email || "",
        image: member.user.image,
      }));

      return formattedMembers;
    } catch (error) {
      logger.error("Erreur lors de la récupération des membres:", error);
      throw new ActionError("Impossible de récupérer les membres du serveur");
    }
  });

// Action pour ajouter des membres à un rôle
export const addMembersToRoleAction = serverAction
  .metadata({
    roles: ["owner", "admin"],
  })
  .schema(AddMembersSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    try {
      // Vérifier que le rôle appartient au serveur
      const existingRole = await prisma.customRole.findFirst({
        where: {
          id: input.roleId,
          organizationId: ctx.id,
        },
      });

      if (!existingRole) {
        throw new ActionError("Rôle introuvable");
      }

      // Vérifier que tous les membres appartiennent au serveur
      const validMembers = await prisma.member.findMany({
        where: {
          organizationId: ctx.id,
          id: {
            in: input.memberIds,
          },
        },
      });

      if (validMembers.length !== input.memberIds.length) {
        throw new ActionError("Certains membres n'appartiennent pas à ce serveur");
      }

      // Ajouter les membres au rôle
      const results = await Promise.all(
        validMembers.map(async member =>
          prisma.member.update({
            where: {
              id: member.id
            },
            data: {
              customRoleId: input.roleId
            },
          })
        )
      );

      return { success: true, count: results.length };
    } catch (error) {
      if (error instanceof ActionError) throw error;
      
      logger.error("Erreur lors de l'ajout des membres au rôle:", error);
      throw new ActionError("Impossible d'ajouter les membres au rôle");
    }
  });

// Action pour récupérer les membres d'un rôle spécifique
// Ajouter un cache pour éviter des requêtes redondantes
type RoleMemberData = {
  id: string;
  userId: string;
  name: string;
  email: string;
  image?: string | null;
  dateAdded?: Date;
};

const roleMembersCache = new Map<string, { data: RoleMemberData[]; timestamp: number }>();
const CACHE_TTL = 5000; // 5 secondes de durée de vie du cache

export const getRoleMembersAction = serverAction
  .metadata({
    roles: ["owner", "admin"],
  })
  .schema(GetRoleMembersSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    try {
      const cacheKey = `${ctx.id}-${input.roleId}`;
      const now = Date.now();
      const cachedData = roleMembersCache.get(cacheKey);
      
      // Utiliser les données en cache si elles existent et sont encore valides
      if (cachedData && (now - cachedData.timestamp < CACHE_TTL)) {
        return cachedData.data;
      }
      
      // Vérifier si le rôle existe avec une requête optimisée qui ne récupère que l'ID
      const role = await prisma.customRole.findFirst({
        where: {
          id: input.roleId,
          organizationId: ctx.id,
        },
        select: { id: true } // Ne sélectionner que l'ID pour optimiser
      });

      if (!role) {
        throw new ActionError("Rôle introuvable");
      }

      // Récupérer les membres ayant ce rôle avec des champs optimisés
      const members = await prisma.member.findMany({
        where: {
          organizationId: ctx.id,
          customRoleId: input.roleId,
        },
        take: 50, // Limiter à 50 membres pour éviter les requêtes trop lourdes
        select: {
          id: true,
          userId: true,
          createdAt: true,
          user: {
            select: {
              name: true,
              email: true,
              image: true
            }
          }
        }
      });

      // Formater les données pour le front-end
      const formattedMembers = members.map(member => ({
        id: member.id,
        userId: member.userId,
        name: (member.user.name as string | null) ?? "Utilisateur sans nom",
        email: member.user.email,
        image: member.user.image,
        dateAdded: member.createdAt,
      }));
      
      // Stocker les données dans le cache
      roleMembersCache.set(cacheKey, {
        data: formattedMembers,
        timestamp: now
      });
      
      return formattedMembers;
    } catch (error) {
      logger.error("Erreur lors de la récupération des membres:", error);
      throw new ActionError("Impossible de récupérer les membres du rôle");
    }
  });

// Fonction pour vider le cache des membres d'un rôle spécifique
function clearRoleMembersCache(orgId: string, roleId: string) {
  const cacheKey = `${orgId}-${roleId}`;
  roleMembersCache.delete(cacheKey);
}

// Action pour supprimer un membre d'un rôle
export const removeMemberFromRoleAction = serverAction
  .metadata({
    roles: ["owner", "admin"],
  })
  .schema(RemoveMemberSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    try {
      // Vérifier que le rôle appartient au serveur
      const existingRole = await prisma.customRole.findFirst({
        where: {
          id: input.roleId,
          organizationId: ctx.id,
        },
      });

      if (!existingRole) {
        throw new ActionError("Rôle introuvable");
      }

      // Vérifier que le membre appartient au serveur
      const member = await prisma.member.findFirst({
        where: {
          id: input.memberId,
          organizationId: ctx.id,
          customRoleId: input.roleId,
        },
      });

      if (!member) {
        throw new ActionError("Membre introuvable ou n'appartient pas à ce rôle");
      }

      // Supprimer le membre du rôle
      await prisma.member.update({
        where: {
          id: input.memberId,
        },
        data: {
          customRoleId: null,
        },
      });

      // Vider le cache pour forcer un rechargement frais des données
      clearRoleMembersCache(ctx.id, input.roleId);

      return { success: true };
    } catch (error) {
      if (error instanceof ActionError) throw error;
      
      logger.error("Erreur lors de la suppression du membre du rôle:", error);
      throw new ActionError("Impossible de supprimer le membre du rôle");
    }
  });

// Action pour créer un département
export const createDepartmentAction = serverAction
  .metadata({
    roles: ["owner", "admin"],
  })
  .schema(CreateDepartmentSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    try {
      const department = await prisma.department.create({
        data: {
          name: input.name,
          organizationId: ctx.id,
        },
      });

      return department;
    } catch (error) {
      logger.error("Erreur lors de la création du département:", error);
      throw new ActionError("Impossible de créer le département");
    }
  });

// Action pour obtenir les départements
export const getDepartmentsAction = serverAction
  .schema(GetDepartmentsSchema)
  .action(async ({ ctx }) => {
    try {
      const departments = await prisma.department.findMany({
        where: {
          organizationId: ctx.id,
        },
        orderBy: {
          name: 'asc',
        },
      });

      return departments;
    } catch (error) {
      logger.error("Erreur lors de la récupération des départements:", error);
      throw new ActionError("Impossible de récupérer les départements");
    }
  });

// Action pour supprimer un département
export const deleteDepartmentAction = serverAction
  .metadata({
    roles: ["owner", "admin"],
  })
  .schema(DeleteDepartmentSchema)
  .action(async ({ parsedInput: input, ctx }) => {
    try {
      // Vérifier que le département appartient à l'organisation
      const existingDepartment = await prisma.department.findFirst({
        where: {
          id: input.departmentId,
          organizationId: ctx.id,
        },
      });

      if (!existingDepartment) {
        throw new ActionError("Département introuvable");
      }

      // Vérifier s'il existe des rôles associés à ce département
      const rolesWithDepartment = await prisma.customRole.count({
        where: {
          departmentId: input.departmentId,
        },
      });

      if (rolesWithDepartment > 0) {
        // Mettre à jour les rôles pour enlever la référence au département
        await prisma.customRole.updateMany({
          where: {
            departmentId: input.departmentId,
          },
          data: {
            departmentId: null,
          },
        });
      }

      // Supprimer le département
      await prisma.department.delete({
        where: {
          id: input.departmentId,
        },
      });

      return { success: true };
    } catch (error) {
      if (error instanceof ActionError) throw error;
      
      logger.error("Erreur lors de la suppression du département:", error);
      throw new ActionError("Impossible de supprimer le département");
    }
  });

// Action pour rechercher des rôles
export const searchRolesAction = serverAction
  .schema(z.object({
    query: z.string(),
  }))
  .action(async ({ parsedInput: input, ctx }) => {
    try {
      if (!input.query || input.query.trim().length < 2) {
        return [];
      }

      const roles = await prisma.customRole.findMany({
        where: {
          organizationId: ctx.id,
          name: {
            contains: input.query,
            mode: "insensitive",
          },
        },
        orderBy: {
          position: 'asc',
        },
        take: 5,
      });

      return roles;
    } catch (error) {
      logger.error("Erreur lors de la recherche des rôles:", error);
      throw new ActionError("Impossible de rechercher les rôles");
    }
  });

// Versions enveloppées avec resolveActionResult pour une utilisation plus facile dans les composants
export async function createRoleServerAction(input: z.infer<typeof RoleSchema>) {
  return resolveActionResult(createRoleAction(input));
}

export async function updateRoleServerAction(input: z.infer<typeof UpdateRoleSchema>) {
  return resolveActionResult(updateRoleAction(input));
}

export async function deleteRoleServerAction(input: z.infer<typeof DeleteRoleSchema>) {
  return resolveActionResult(deleteRoleAction(input));
}

export async function addMembersToRoleServerAction(input: z.infer<typeof AddMembersSchema>) {
  return resolveActionResult(addMembersToRoleAction(input));
}

export async function getServerMembersServerAction(input: z.infer<typeof GetMembersSchema>) {
  return resolveActionResult(getServerMembersAction(input));
}

export async function getRoleMembersServerAction(input: z.infer<typeof GetRoleMembersSchema>) {
  return resolveActionResult(getRoleMembersAction(input));
}

export async function removeMemberFromRoleServerAction(input: z.infer<typeof RemoveMemberSchema>) {
  return resolveActionResult(removeMemberFromRoleAction(input));
}

export async function createDepartmentServerAction(input: z.infer<typeof CreateDepartmentSchema>) {
  return resolveActionResult(createDepartmentAction(input));
}

export async function getDepartmentsServerAction(input: z.infer<typeof GetDepartmentsSchema>) {
  return resolveActionResult(getDepartmentsAction(input));
}

export async function deleteDepartmentServerAction(input: z.infer<typeof DeleteDepartmentSchema>) {
  return resolveActionResult(deleteDepartmentAction(input));
}

export async function searchRolesServerAction(query: string) {
  return resolveActionResult(searchRolesAction({ query }));
} 