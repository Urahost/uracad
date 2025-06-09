import { type ReactNode } from "react";
import { Card } from "@/components/ui/card";

type InviteContainerProps = {
  children: ReactNode;
};

export function InviteContainer({ children }: InviteContainerProps) {
  return (
    <div className="container max-w-2xl py-12 mx-auto">
      <Card>
        {children}
      </Card>
    </div>
  );
} 