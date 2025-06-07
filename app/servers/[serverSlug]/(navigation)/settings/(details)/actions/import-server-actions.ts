"use server";

import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import type { Vehicle } from "@prisma/client";

type QBCorePlayer = {
  id: number;
  citizenid: string;
  cid: number;
  license: string;
  name: string;
  money: string;
  charinfo: string;
  job: string;
  gang: string;
  position: string;
  metadata: string;
  inventory: string;
  last_updated: string;
  vehicles?: Vehicle[];
};

type ImportResult = {
  success: boolean;
  citizensCreated: number;
  vehiclesCreated: number;
  error?: string;
};

// Fonction pour parser les données JSON des champs QBCore
function parseJSONField(field: string, fallback: Record<string, unknown> = {}) {
  try {
    return JSON.parse(field);
  } catch {
    return fallback;
  }
}

// Fonction pour convertir les données QBCore vers le format Citizen
function mapQBCoreToCitizen(player: QBCorePlayer, organizationId: string) {
  const charinfo = parseJSONField(player.charinfo);
  const metadata = parseJSONField(player.metadata);
  
  return {
    name: charinfo.firstname ?? 'Inconnu',
    surname: charinfo.lastname ?? 'Inconnu',
    dateOfBirth: new Date(charinfo.birthdate ?? '1990-01-01'),
    socialSecurityNumber: player.citizenid,
    gender: charinfo.gender === 'Homme' ? 'Male' : charinfo.gender === 'Femme' ? 'Female' : 'Other',
    ethnicity: charinfo.nationality ?? null,
    address: 'Adresse non renseignée',
    phone: charinfo.phone ?? null,
    driversLicense: metadata.licences?.driver ? 'VALID' : 'NONE',
    firearmsLicense: metadata.licences?.weapon ? 'VALID' : 'NONE',
    organizationId,
    additionalInfo: `Importé depuis QBCore - CitizenID: ${player.citizenid}`,
  };
}

// Fonction pour récupérer les véhicules d'un joueur spécifique
async function fetchPlayerVehicles(citizenid: string) {
  try {
    const apiEndpoint = process.env.URACAD_FIVEM_ENDPOINT ?? 'api-northside.uracad.com';
    const response = await fetch(`https://${apiEndpoint}/players/${citizenid}`);
    if (!response.ok) return [];
    const playerData = await response.json();
    // Supporte 'vehicle' (array) ou 'vehicles' (array)
    if (Array.isArray(playerData.vehicle)) {
      return playerData.vehicle;
    }
    if (Array.isArray(playerData.vehicles)) {
      return playerData.vehicles;
    }
    return [];
  } catch (error) {
    logger.error(`Erreur lors de la récupération des véhicules pour ${citizenid}:`, error);
    return [];
  }
}

// Fonction pour extraire les véhicules depuis les données de l'API
function extractVehiclesFromData(vehicles: Vehicle[], citizenId: string, organizationId: string, playerName: string) {
  return vehicles.map((vehicle: Vehicle) => ({
    citizenId,
    organizationId,
    make: vehicle.make || 'Dinka',
    model: vehicle.model,
    year: vehicle.year,
    licensePlate: vehicle.licensePlate,
    vin: vehicle.vin,
    color: vehicle.color,
    type: vehicle.type,
    category: vehicle.category,
    status: vehicle.status,
    registrationStatus: vehicle.registrationStatus,
    additionalInfo: `Importé depuis QBCore - Player: ${playerName}`,
  }));
}

export async function importQBCoreData(organizationId: string): Promise<ImportResult> {
  try {
    // Récupération des données depuis l'API
    const apiEndpoint = process.env.URACAD_FIVEM_ENDPOINT ?? 'api-northside.uracad.com';
    const response = await fetch(`https://${apiEndpoint}/players`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }

    const players: QBCorePlayer[] = await response.json();
    
    if (!Array.isArray(players)) {
      throw new Error('Format de réponse API invalide');
    }

    let citizensCreated = 0;
    let vehiclesCreated = 0;

    // Transaction pour créer tous les citoyens et véhicules
    await prisma.$transaction(async (tx) => {
      const results = await Promise.allSettled(
        players.map(async (player) => {
          // Vérifier si le citoyen existe déjà
          const existingCitizen = await tx.citizen.findFirst({
            where: {
              socialSecurityNumber: player.citizenid,
              organizationId,
            },
          });

          let citizen;
          let isNewCitizen = false;

          if (existingCitizen) {
            // Mettre à jour le citoyen existant
            const citizenData = mapQBCoreToCitizen(player, organizationId);
            citizen = await tx.citizen.update({
              where: { id: existingCitizen.id },
              data: citizenData,
            });
            logger.info(`Citoyen ${player.citizenid} mis à jour`);
          } else {
            // Créer un nouveau citoyen
            const citizenData = mapQBCoreToCitizen(player, organizationId);
            citizen = await tx.citizen.create({
              data: citizenData,
            });
            isNewCitizen = true;
            logger.info(`Nouveau citoyen ${player.citizenid} créé`);
          }

          // Récupérer les véhicules depuis l'endpoint spécifique
          const playerVehicles = await fetchPlayerVehicles(player.citizenid);
          
          // Supprimer les anciens véhicules du citoyen
          await tx.vehicle.deleteMany({
            where: {
              citizenId: citizen.id,
              additionalInfo: {
                contains: 'Importé depuis QBCore'
              }
            }
          });

          // Créer les nouveaux véhicules
          let vehiclesCreatedCount = 0;
          if (playerVehicles && playerVehicles.length > 0) {
            const vehiclesData = extractVehiclesFromData(playerVehicles, citizen.id, organizationId, player.name);
            
            await Promise.all(
              vehiclesData.map(async (vehicleData) => tx.vehicle.create({ data: vehicleData }))
            );
            vehiclesCreatedCount = vehiclesData.length;
          }

          return { 
            citizensCreated: isNewCitizen ? 1 : 0, 
            vehiclesCreated: vehiclesCreatedCount 
          };
        })
      );

      // Compter les résultats
      for (const result of results) {
        if (result.status === 'fulfilled') {
          citizensCreated += result.value.citizensCreated;
          vehiclesCreated += result.value.vehiclesCreated;
        } else {
          logger.error('Erreur lors de l\'import:', result.reason);
        }
      }

      // Vérification finale pour s'assurer du bon comptage
      const finalCount = await tx.citizen.count({
        where: {
          organizationId,
          additionalInfo: {
            contains: 'Importé depuis QBCore'
          }
        }
      });
      
      logger.info(`Import terminé: ${citizensCreated} citoyens traités, ${finalCount} total dans la base`);
    });

    // Compter le nombre réel de citoyens importés
    const actualCitizensCount = await prisma.citizen.count({
      where: {
        organizationId,
        additionalInfo: {
          contains: 'Importé depuis QBCore'
        }
      }
    });

    return {
      success: true,
      citizensCreated: actualCitizensCount,
      vehiclesCreated,
    };

  } catch (error) {
    logger.error('Erreur lors de l\'import QBCore:', error);
    return {
      success: false,
      citizensCreated: 0,
      vehiclesCreated: 0,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

export async function importESXData(organizationId: string): Promise<ImportResult> {
  try {
    // Pour ESX, on utilise la même API mais on adapte le mapping
    const apiEndpoint = process.env.URACAD_FIVEM_ENDPOINT ?? 'api-northside.uracad.com';
    const response = await fetch(`https://${apiEndpoint}/players`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
    }

    const players: QBCorePlayer[] = await response.json();
    
    if (!Array.isArray(players)) {
      throw new Error('Format de réponse API invalide');
    }

    let citizensCreated = 0;
    let vehiclesCreated = 0;

    // Pour ESX, on peut adapter le mapping si nécessaire
    // Pour l'instant, on utilise le même que QBCore
    await prisma.$transaction(async (tx) => {
      const results = await Promise.allSettled(
        players.map(async (player) => {
          const existingCitizen = await tx.citizen.findFirst({
            where: {
              socialSecurityNumber: player.citizenid,
              organizationId,
            },
          });

          let citizen;
          let isNewCitizen = false;

          if (existingCitizen) {
            // Mettre à jour le citoyen existant
            const citizenData = mapQBCoreToCitizen(player, organizationId);
            citizen = await tx.citizen.update({
              where: { id: existingCitizen.id },
              data: citizenData,
            });
            logger.info(`Citoyen ${player.citizenid} mis à jour`);
          } else {
            // Créer un nouveau citoyen
            const citizenData = mapQBCoreToCitizen(player, organizationId);
            citizen = await tx.citizen.create({
              data: citizenData,
            });
            isNewCitizen = true;
            logger.info(`Nouveau citoyen ${player.citizenid} créé`);
          }

          // Récupérer les véhicules depuis l'endpoint spécifique
          const playerVehicles = await fetchPlayerVehicles(player.citizenid);
          
          // Supprimer les anciens véhicules du citoyen
          await tx.vehicle.deleteMany({
            where: {
              citizenId: citizen.id,
              additionalInfo: {
                contains: 'Importé depuis'
              }
            }
          });

          // Créer les nouveaux véhicules
          let vehiclesCreatedCount = 0;
          if (playerVehicles && playerVehicles.length > 0) {
            const vehiclesData = extractVehiclesFromData(playerVehicles, citizen.id, organizationId, player.name);
            
            await Promise.all(
              vehiclesData.map(async (vehicleData) => tx.vehicle.create({ data: vehicleData }))
            );
            vehiclesCreatedCount = vehiclesData.length;
          }

          return { 
            citizensCreated: isNewCitizen ? 1 : 0, 
            vehiclesCreated: vehiclesCreatedCount 
          };
        })
      );

      // Compter les résultats
      for (const result of results) {
        if (result.status === 'fulfilled') {
          citizensCreated += result.value.citizensCreated;
          vehiclesCreated += result.value.vehiclesCreated;
        } else {
          logger.error('Erreur lors de l\'import ESX:', result.reason);
        }
      }

      // Vérification finale pour s'assurer du bon comptage
      const finalCount = await tx.citizen.count({
        where: {
          organizationId,
          additionalInfo: {
            contains: 'Importé depuis'
          }
        }
      });
      
      logger.info(`Import ESX terminé: ${citizensCreated} citoyens traités, ${finalCount} total dans la base`);
    });

    // Compter le nombre réel de citoyens importés
    const actualCitizensCount = await prisma.citizen.count({
      where: {
        organizationId,
        additionalInfo: {
          contains: 'Importé depuis'
        }
      }
    });

    return {
      success: true,
      citizensCreated: actualCitizensCount,
      vehiclesCreated,
    };

  } catch (error) {
    logger.error('Erreur lors de l\'import ESX:', error);
    return {
      success: false,
      citizensCreated: 0,
      vehiclesCreated: 0,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
} 