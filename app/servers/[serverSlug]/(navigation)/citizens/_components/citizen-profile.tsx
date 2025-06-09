"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Citizen } from "@prisma/client";
import { format } from "date-fns";

type CitizenProfileProps = {
  citizen: Citizen;
  serverSlug: string;
};

export function CitizenProfile({ citizen }: CitizenProfileProps) {
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
                alt={`${citizen.name} ${citizen.surname}`} 
                className="size-32 rounded-full object-cover"
              />
            ) : (
              <div className="size-32 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold">
                {citizen.name.charAt(0)}{citizen.surname.charAt(0)}
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
              <p className="font-medium">{citizen.surname}</p>
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
            <p className="font-medium">{citizen.socialSecurityNumber ?? "Not specified"}</p>
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
              <p className="font-medium">{citizen.gender}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Ethnicity</p>
              <p className="font-medium">{citizen.ethnicity ?? "Not specified"}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Hair Color</p>
              <p className="font-medium">{citizen.hairColor ?? "Not specified"}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Eye Color</p>
              <p className="font-medium">{citizen.eyeColor ?? "Not specified"}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Weight (kg)</p>
              <p className="font-medium">{citizen.weight ?? "Not specified"}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Height (cm)</p>
              <p className="font-medium">{citizen.height ?? "Not specified"}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Address</p>
            <p className="font-medium">{citizen.address}</p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Postal Code</p>
              <p className="font-medium">{citizen.postal ?? "Not specified"}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">Phone Number</p>
              <p className="font-medium">{citizen.phone ?? "Not specified"}</p>
            </div>
          </div>
          
          <div>
            <p className="text-sm text-muted-foreground">Occupation</p>
            <p className="font-medium">{citizen.occupation ?? "Not specified"}</p>
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
              <p className="font-medium">{citizen.driversLicense}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">DL Categories</p>
              <p className="font-medium">{citizen.driversLicenseCategories ?? "None"}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Pilot License</p>
              <p className="font-medium">{citizen.pilotLicense ?? "None"}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">PL Categories</p>
              <p className="font-medium">{citizen.pilotLicenseCategories ?? "None"}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Water License</p>
              <p className="font-medium">{citizen.waterLicense ?? "None"}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">WL Categories</p>
              <p className="font-medium">{citizen.waterLicenseCategories ?? "None"}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Firearms License</p>
              <p className="font-medium">{citizen.firearmsLicense ?? "None"}</p>
            </div>
            
            <div>
              <p className="text-sm text-muted-foreground">FL Categories</p>
              <p className="font-medium">{citizen.firearmsLicenseCategories ?? "None"}</p>
            </div>
          </div>
          
          {citizen.additionalInfo && (
            <div>
              <p className="text-sm text-muted-foreground">Additional Information</p>
              <p className="font-medium whitespace-pre-line">{citizen.additionalInfo}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 