import { logger } from "@/lib/logger";

/**
 * Type définissant la structure d'une permission
 */
export type Permission = {
  id: string;
  name: string;
  description?: string;
};

/**
 * Type définissant la structure d'une catégorie de permissions
 */
export type PermissionCategory = {
  id: string;
  name: string;
  description?: string;
  permissions: Permission[];
};

/**
 * Obtenir la description d'une permission
 * @param permissionId ID de la permission
 * @returns Description de la permission ou message par défaut
 */
export function getPermissionDescription(permissionId: string, t?: (key: string) => string): string {
  try {
    return t?.(`description.${permissionId}`) ?? t?.("description.DEFAULT") ?? "Allows using this feature on the server.";
  } catch (error) {
    logger.error(error);
    return "Allows using this feature on the server.";
  }
}

/**
 * Catégories de permissions.
 * Définit les groupes de permissions et leurs options
 * Note: These names are now translated at runtime where they're used
 */
export const permissionCategories: PermissionCategory[] = [
  {
    id: "members",
    name: "Members",
    permissions: [
      { id: "VIEW_MEMBERS", name: "View Members" },
      { id: "MANAGE_MEMBERS", name: "Manage Members" },
      { id: "KICK_MEMBERS", name: "Kick Members" },
      { id: "BAN_MEMBERS", name: "Ban Members" },
    ],
  },
  {
    id: "leo",
    name: "LEO",
    permissions: [
      { id: "VIEW_LEO", name: "View Officers" },
      { id: "MANAGE_LEO", name: "Manage Officers" },
      { id: "CREATE_ARREST_REPORTS", name: "Create Arrest Reports" },
      { id: "CREATE_BOLOS", name: "Create BOLOs" },
      { id: "NAME_SEARCH", name: "Name Search" },
      { id: "PLATE_SEARCH", name: "Plate Search" },
      { id: "WEAPON_SEARCH", name: "Weapon Search" },
      { id: "MANAGE_WARRANTS", name: "Manage Warrants" },
      { id: "VIEW_WARRANT", name: "View Warrants" },
      { id: "VIEW_JUDICIAL_CASE", name: "View Judicial Cases" },
      { id: "CREATE_FINE", name: "Create Fine" },
      { id: "VIEW_FINE", name: "View Fines" },
      { id: "EDIT_FINE", name: "Edit Fines" },
      { id: "DELETE_FINE", name: "Delete Fines" },
      { id: "MANAGE_PENAL_CODE", name: "Manage Penal Code" },

    ],
  },
  {
    id: "doj",
    name: "DOJ",
    description: "Permissions pour le système judiciaire (Department of Justice)",
    permissions: [

      { 
        id: "VIEW_JUDICIAL_CASES", 
        name: "View Judicial Cases"
      },
      { 
        id: "CREATE_WARRANT_DRAFT", 
        name: "Create Warrant Draft"
      },
      { 
        id: "VALIDATE_WARRANT", 
        name: "Validate Warrant"
      },
      { 
        id: "EDIT_JUDICIAL_CASE", 
        name: "Edit Judicial Case"
      },
      { 
        id: "CLOSE_PROCEDURE", 
        name: "Close Procedure"
      },
      { 
        id: "VIEW_SENSITIVE_CASES", 
        name: "View Sensitive Cases"
      },
      { 
        id: "LOCK_JUDICIAL_CASE", 
        name: "Lock Judicial Case"
      },
      { 
        id: "DELETE_JUDICIAL_CASE", 
        name: "Delete Judicial Case"
      },
      { 
        id: "VIEW_JUDICIAL_LOGS", 
        name: "View Judicial Logs"
      },
      { 
        id: "MANAGE_DOJ_ACCESS", 
        name: "Manage DOJ Access"
      },
      { 
        id: "SUSPEND_MDT_ACCESS", 
        name: "Suspend MDT Access"
      },

    ],
  },
  {
    id: "ems",
    name: "EMS",
    description: "Permissions for the medical system",
    permissions: [
      {
        id: "READ_EMS",
        name: "Search Patient",
        description: "Allows searching for a patient in the EMS system",
      },
      {
        id: "CREATE_EMS",
        name: "Create Medical Record",
        description: "Allows creating a new medical record",
      },
      {
        id: "EDIT_EMS",
        name: "Edit Own Records",
        description: "Allows editing their own medical records",
      },
      {
        id: "UPDATE_OTHERS_RECORDS",
        name: "Edit Others' Records",
        description: "Allows editing medical records created by other members",
      },
      {
        id: "DELETE_RECORD",
        name: "Delete Medical Record",
        description: "Allows deleting a medical record",
      },
      {
        id: "DECLARE_DEATH",
        name: "Declare RP Death",
        description: "Allows declaring a death in the system",
      },
      {
        id: "MARK_CONFIDENTIAL",
        name: "Mark Confidential",
        description: "Allows marking a record as confidential",
      },
      {
        id: "VIEW_CONFIDENTIAL",
        name: "View Confidential",
        description: "Allows viewing records marked as confidential",
      },
      {
        id: "RESTRICT_ACCESS",
        name: "Restrict Access",
        description: "Allows restricting access to certain medical records",
      },
      {
        id: "AUTHORIZE_POLICE",
        name: "Authorize Police",
        description: "Allows authorizing police visibility for a record",
      },
      {
        id: "VIEW_RESTRICTED",
        name: "View Restricted",
        description: "Allows viewing restricted access records",
      },
      {
        id: "VIEW_LOGS",
        name: "Access Medical Logs",
        description: "Allows accessing medical record logs",
      },
      {
        id: "MANAGE_ACCESS",
        name: "Manage EMS Access",
        description: "Allows managing EMS access and roles",
      },
    ],
  },
  {
    id: "dispatch",
    name: "Dispatch",
    permissions: [
      { id: "VIEW_DISPATCH", name: "View Dispatch" },
      { id: "MANAGE_DISPATCH", name: "Manage Dispatch" },
      { id: "MANAGE_CALLS", name: "Manage Calls" },
      { id: "UPDATE_AOP", name: "Update AOP" },
      { id: "USE_SIGNAL100", name: "Use Signal 100" },
    ],
  },
  {
    id: "citizen",
    name: "Citizen",
    permissions: [
      { id: "CREATE_CITIZEN", name: "Create Citizens" },
      { id: "READ_CITIZEN", name: "View Citizens" },
      { id: "EDIT_CITIZEN", name: "Edit Citizens" },
      { id: "DELETE_CITIZEN", name: "Delete Citizens" },
      { id: "CREATE_VEHICLE", name: "Create Vehicles" },
      { id: "VIEW_VEHICLE", name: "View Vehicles" },
      { id: "EDIT_VEHICLE", name: "Edit Vehicles" },
      { id: "DELETE_VEHICLE", name: "Delete Vehicles" },

      { id: "VIEW_WARRANT", name: "View Warrants" },
      { id: "VIEW_JUDICIAL_CASE", name: "View Judicial Cases" },
      { id: "VIEW_FINE", name: "View Fines" },

    ],
  },
];

/**
 * Données des permissions disponibles par catégorie
 */
export const availablePermissionCategories: PermissionCategory[] = [
  {
    id: "general",
    name: "General",
    permissions: [
      { id: "VIEW_SERVER", name: "View Server" },
      { id: "MANAGE_SERVER", name: "Manage Server" },
      { id: "MANAGE_ROLES", name: "Manage Roles" },
      { id: "MANAGE_CHANNELS", name: "Manage Channels" }
    ]
  },
  {
    id: "messaging",
    name: "Messaging",
    permissions: [
      { id: "SEND_MESSAGES", name: "Send Messages" },
      { id: "READ_MESSAGES", name: "Read Messages" },
      { id: "MANAGE_MESSAGES", name: "Manage Messages" },
      { id: "EMBED_LINKS", name: "Embed Links" },
      { id: "ATTACH_FILES", name: "Attach Files" },
      { id: "MENTION_EVERYONE", name: "Mention Everyone" }
    ]
  },
  {
    id: "voice",
    name: "Voice",
    permissions: [
      { id: "CONNECT", name: "Connect" },
      { id: "SPEAK", name: "Speak" },
      { id: "VIDEO", name: "Video" },
      { id: "MUTE_MEMBERS", name: "Mute Members" },
      { id: "DEAFEN_MEMBERS", name: "Deafen Members" },
      { id: "MOVE_MEMBERS", name: "Move Members" }
    ]
  },
  {
    id: "advanced",
    name: "Advanced",
    permissions: [
      { id: "OWNER", name: "Owner" },
      { id: "ADMINISTRATOR", name: "Administrator" },
      { id: "VIEW_AUDIT_LOG", name: "View Audit Log" },
      { id: "MANAGE_WEBHOOKS", name: "Manage Webhooks" },
      { id: "MANAGE_EMOJIS", name: "Manage Emojis" }
    ]
  }
];

export const PERMISSIONS_GROUPS = [
  {
    name: "Citizens",
    permissions: [
      { id: "CREATE_CITIZEN", name: "Create Citizens" },
      { id: "READ_CITIZEN", name: "View Citizens" },
      { id: "EDIT_CITIZEN", name: "Edit Citizens" },
      { id: "DELETE_CITIZEN", name: "Delete Citizens" },
    ],
  },
  {
    name: "EMS",
    permissions: [
      { id: "CREATE_EMS", name: "Create Medical Records" },
      { id: "READ_EMS", name: "View Medical Records" },
      { id: "EDIT_EMS", name: "Edit Medical Records" },
      { id: "DELETE_EMS", name: "Delete Medical Records" },
    ],
  },
  {
    name: "Vehicles",
    permissions: [
      { id: "CREATE_VEHICLE", name: "Create Vehicles" },
      { id: "VIEW_VEHICLE", name: "View Vehicles" },
      { id: "EDIT_VEHICLE", name: "Edit Vehicles" },
      { id: "DELETE_VEHICLE", name: "Delete Vehicles" },

    ],
  },
  {
    name: "Law Enforcement",
    permissions: [
      { id: "VIEW_LEO", name: "View Law Enforcement" },
      { id: "MANAGE_LEO", name: "Manage Law Enforcement" },
      { id: "VIEW_WARRANT", name: "View Warrants" }, 
      { id: "MANAGE_WARRANTS", name: "Manage Warrants" },
      { id: "VIEW_JUDICIAL_CASE", name: "View Judicial Cases" },
      { id: "VIEW_FINE", name: "View Fines" },
      { id: "CREATE_FINE", name: "Create Fine" },
    ],
  },
]; 