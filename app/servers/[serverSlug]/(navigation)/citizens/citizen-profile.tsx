"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Citizen } from "@prisma/client";
import { format } from "date-fns";

type CitizenProfileProps = {
  citizen: Citizen;
  serverSlug: string;
};

export function CitizenProfile({ citizen }: CitizenProfileProps) {
  const charinfo = typeof citizen.charinfo === 'string' ? JSON.parse(citizen.charinfo) : citizen.charinfo;
  const metadata = typeof citizen.metadata === 'string' ? JSON.parse(citizen.metadata) : citizen.metadata;

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
              <p className="text-sm text-muted-foreground">Surname</p>
              <p className="font-medium">{citizen.lastName}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Date of Birth</p>
            <p className="font-medium">
              {new Date(citizen.dateOfBirth).getFullYear() > 1900
                ? format(new Date(citizen.dateOfBirth), "PPP")
                : "Not specified"}
            </p>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Social Security Number</p>
            <p className="font-medium">{charinfo?.socialSecurityNumber ?? "Not specified"}</p>
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
              <p className="text-sm text-muted-foreground">Ethnicity</p>
              <p className="font-medium">{charinfo?.ethnicity ?? "Not specified"}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Hair Color</p>
              <p className="font-medium">{charinfo?.hairColor ?? "Not specified"}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Eye Color</p>
              <p className="font-medium">{charinfo?.eyeColor ?? "Not specified"}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Weight (kg)</p>
              <p className="font-medium">{charinfo?.weight ?? "Not specified"}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Height (cm)</p>
              <p className="font-medium">{charinfo?.height ?? "Not specified"}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <p className="font-medium">{charinfo?.address ?? "Not specified"}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Postal Code</p>
              <p className="font-medium">{charinfo?.postal ?? "Not specified"}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Phone Number</p>
              <p className="font-medium">{charinfo?.phone ?? "Not specified"}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Occupation</p>
            <p className="font-medium">{charinfo?.occupation ?? "Not specified"}</p>
          </div>
        </CardContent>
      </Card>
      
      {/* Licences */}
      <Card className="md:col-span-1">
        <CardHeader className="py-3 px-4">
          <h3 className="text-lg font-medium">Licenses</h3>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Drivers License</p>
              <p className="font-medium">{metadata?.driversLicense ?? "None"}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">DL Categories</p>
              <p className="font-medium">{metadata?.driversLicenseCategories ?? "None"}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Pilot License</p>
              <p className="font-medium">{metadata?.pilotLicense ?? "None"}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">PL Categories</p>
              <p className="font-medium">{metadata?.pilotLicenseCategories ?? "None"}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Water License</p>
              <p className="font-medium">{metadata?.waterLicense ?? "None"}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">WL Categories</p>
              <p className="font-medium">{metadata?.waterLicenseCategories ?? "None"}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Firearms License</p>
              <p className="font-medium">{metadata?.firearmsLicense ?? "None"}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">FL Categories</p>
              <p className="font-medium">{metadata?.firearmsLicenseCategories ?? "None"}</p>
            </div>
          </div>
          
          {metadata?.additionalInfo && (
            <div>
              <p className="text-sm text-muted-foreground">Additional Information</p>
              <p className="font-medium whitespace-pre-line">{metadata.additionalInfo}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 