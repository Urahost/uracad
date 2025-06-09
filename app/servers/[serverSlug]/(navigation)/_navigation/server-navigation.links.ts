import type { AuthRole } from "@/lib/auth/auth-permissions";
import { 
  type NavigationGroup, 
  type NavigationLink,
  SERVER_LINKS,
  replaceSlug,
  isInRoles
} from "../permissions/routes-config";

export const getServerNavigation = (
  slug: string,
  userRoles: AuthRole[] | undefined,
  userPermissions: string[] = [],
): NavigationGroup[] => {
  // Vérifier si l'utilisateur est admin ou owner
  const isPowerUser = userRoles?.some(role => role === "owner" || role === "admin") ?? false;

  return SERVER_LINKS.map((group: NavigationGroup) => {
    return {
      ...group,
      defaultOpenStartPath: group.defaultOpenStartPath
        ? replaceSlug(group.defaultOpenStartPath, slug)
        : undefined,
      links: group.links
        .filter((link: NavigationLink) => {
          // Les utilisateurs admin et owner voient tout
          if (isPowerUser) return true;
          
          // Vérifier les rôles si nécessaire
          const hasRequiredRoles = link.roles 
            ? isInRoles(userRoles, link.roles) 
            : true;
            
          // Vérifier les permissions si nécessaire
          const hasRequiredPermissions = link.permissions
            ? link.permissions.some(perm => userPermissions.includes(perm))
            : false;
            
          // Si aucun rôle ni permission n'est spécifié, l'élément est visible par défaut
          const isDefaultAccess = !link.roles && !link.permissions;
            
          // L'élément est visible si l'utilisateur a les rôles OU les permissions requises OU s'il s'agit d'un lien sans restriction
          return Boolean(hasRequiredRoles) || Boolean(hasRequiredPermissions) || Boolean(isDefaultAccess);
        })
        .map((link: NavigationLink) => {
          return {
            ...link,
            href: replaceSlug(link.href, slug),
          };
        }),
    };
  });
};

// Réexporter les liens pour d'autres composants qui pourraient en avoir besoin
export { SERVER_LINKS } from "../permissions/routes-config";
