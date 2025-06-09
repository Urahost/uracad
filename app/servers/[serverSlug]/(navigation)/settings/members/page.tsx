import { getRequiredCurrentServerCache } from "@/lib/react/cache";
import { ServerMembersForm } from "./server-members-form";
import { prisma } from "@/lib/prisma";

export default async function ServerMembersPage() {
  const server = await getRequiredCurrentServerCache();
  
  const members = server.members.map(member => ({
    id: member.id,
    userId: member.userId,
    role: member.role,
    user: {
      id: member.userId,
      email: member.user.email,
      name: member.user.name,
      image: member.user.image ?? null
    }
  }));

  const rawInvitations = await prisma.invitation.findMany({
    where: {
      organizationId: server.id,
      status: "pending",
    },
  });

  const invitations = rawInvitations.map(inv => ({
    id: inv.id,
    email: inv.email,
    role: inv.role ?? "member", // Valeur par défaut si null
    status: inv.status,
    expiresAt: inv.expiresAt,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Membres du serveur</h3>
        <p className="text-sm text-muted-foreground">
          Gérez les membres de votre serveur et leurs rôles.
        </p>
      </div>

      <ServerMembersForm 
        members={members}
        invitations={invitations}
      />
    </div>
  );
}
