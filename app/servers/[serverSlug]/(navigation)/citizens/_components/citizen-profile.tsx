"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Citizen } from "@prisma/client";
import { format } from "date-fns";

type CitizenProfileProps = {
  citizen: Citizen;
  serverSlug: string;
};

export function CitizenProfile({ citizen }: CitizenProfileProps) {
  // Extraire les informations des champs JSON
  const charinfo = typeof citizen.charinfo === 'string' ? JSON.parse(citizen.charinfo) : citizen.charinfo;
  const metadata = typeof citizen.metadata === 'string' ? JSON.parse(citizen.metadata) : citizen.metadata;
  const job = typeof citizen.job === 'string' ? JSON.parse(citizen.job) : citizen.job;

  const formatDate = (date: Date | null) => {
    if (!date || isNaN(date.getTime())) return "Not specified";
    return format(date, "PPP");
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Section principale */}
      <Card className="md:col-span-1">
        <CardHeader className="py-3 px-4">
          <h3 className="text-lg font-medium">Profile</h3>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-4">
          <div className="flex justify-center mb-4">
            {citizen.image ? (
              <img 
                src={citizen.image} 
                alt={`${citizen.name} ${citizen.lastName}`} 
                className="size-32 rounded-full object-cover"
              />
            ) : (
              <div className="size-32 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold">
                {citizen.name.charAt(0)}{citizen.lastName.charAt(0)}
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{citizen.name}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Last Name</p>
              <p className="font-medium">{citizen.lastName}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Date of Birth</p>
            <p className="font-medium">
              {formatDate(citizen.dateOfBirth)}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Phone</p>
            <p className="font-medium">{charinfo?.phone}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Caractéristiques Physiques */}
      <Card className="md:col-span-1">
        <CardHeader className="py-3 px-4">
          <h3 className="text-lg font-medium">Physical Characteristics</h3>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Gender</p>
              <p className="font-medium">{charinfo?.gender ?? "Not specified"}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Nationality</p>
              <p className="font-medium">{charinfo?.nationality ?? "Not specified"}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Blood Type</p>
            <p className="font-medium">{metadata?.bloodtype ?? "Not specified"}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Fingerprint</p>
            <p className="font-medium">{metadata?.fingerprint ?? "Not specified"}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <p className="font-medium">
              {metadata?.isdead ? "Deceased" : 
               metadata?.ishandcuffed ? "Handcuffed" : 
               metadata?.injail ? "In Jail" : "Active"}
            </p>
          </div>
        </CardContent>
      </Card>
      
      {/* Job Information */}
      <Card className="md:col-span-1">
        <CardHeader className="py-3 px-4">
          <h3 className="text-lg font-medium">Job Information</h3>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">Current Job</p>
            <p className="font-medium">{job?.name ?? "Unemployed"}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Job Grade</p>
            <p className="font-medium">{job?.grade?.name ?? "None"}</p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Job Label</p>
            <p className="font-medium">{job?.label ?? "None"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 