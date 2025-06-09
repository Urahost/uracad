// To avoid calling many time same function, you can cache them with react `cache` method

import { cache } from "react";
import { getCurrentServer, getRequiredCurrentServer } from "../servers/get-server";
import { getUserPermissions } from "../../../app/servers/[serverSlug]/(navigation)/permissions/permissions.action";

export const getCurrentServerCache = cache(getCurrentServer);
export const getRequiredCurrentServerCache = cache(getRequiredCurrentServer);
export const getUserPermissionsCache = cache(getUserPermissions);
 