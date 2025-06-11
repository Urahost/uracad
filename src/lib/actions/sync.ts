'use server';

import { revalidatePath } from 'next/cache';
import type { ApiVehicle, SyncConfig, ESXCitizen, QBCoreCitizen, ESXAccount, InventoryItem } from '@/types/api';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import type { Prisma as PrismaTypes } from '@prisma/client';
import { logger } from '@/lib/logger';

const SYNC_BATCH_SIZE = 10; // Nombre d'éléments à traiter par lot

async function fetchApiData<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json',
    },
    next: { revalidate: 0 }, // Désactive le cache
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

type SyncApiCitizen = {
  citizenid: string;
  name?: string;
  charinfo: string | {
    firstname?: string;
    lastname?: string;
    birthdate?: string;
    phone?: string;
    gender?: string;
    nationality?: string;
  };
  metadata: string | {
    fingerprint?: string;
    bloodtype?: string;
    isdead?: boolean;
    ishandcuffed?: boolean;
    injail?: number;
  };
  money: string | object;
  job: string | object;
  gang: string | object;
  position: string | object;
  inventory: string | object;
};

async function processCitizenBatch(citizens: SyncApiCitizen[], organizationId: string) {
  const results = {
    created: 0,
    updated: 0,
    errors: 0
  };

  const operations = citizens.map(async (citizen) => {
    try {
      const charinfo = typeof citizen.charinfo === 'string' 
        ? JSON.parse(citizen.charinfo) 
        : citizen.charinfo;

      const metadata = typeof citizen.metadata === 'string'
        ? JSON.parse(citizen.metadata)
        : citizen.metadata;

      // Extract birthdate from charinfo and validate it
      const birthdate = charinfo?.birthdate ? new Date(charinfo.birthdate) : null;
      if (birthdate && isNaN(birthdate.getTime())) {
        logger.warn(`Invalid birthdate for citizen ${citizen.citizenid}: ${charinfo.birthdate}`);
      }

      const citizenData = {
        id: citizen.citizenid,
        citizenId: citizen.citizenid,
        name: citizen.name ?? charinfo?.firstname ?? 'Unknown',
        firstName: charinfo?.firstname ?? null,
        lastName: charinfo?.lastname ?? null,
        dateOfBirth: birthdate && !isNaN(birthdate.getTime()) ? birthdate : new Date('2000-01-01'),
        phone: charinfo?.phone ?? null,
        gender: charinfo?.gender ?? 'Unknown',
        nationality: charinfo?.nationality ?? null,
        organization: {
          connect: {
            id: organizationId
          }
        },
        money: typeof citizen.money === 'string' ? citizen.money : JSON.stringify(citizen.money),
        charinfo: typeof citizen.charinfo === 'string' ? citizen.charinfo : JSON.stringify(citizen.charinfo),
        job: typeof citizen.job === 'string' ? citizen.job : JSON.stringify(citizen.job),
        gang: typeof citizen.gang === 'string' ? citizen.gang : JSON.stringify(citizen.gang),
        position: typeof citizen.position === 'string' ? citizen.position : JSON.stringify(citizen.position),
        metadata: typeof citizen.metadata === 'string' ? citizen.metadata : JSON.stringify(citizen.metadata),
        inventory: typeof citizen.inventory === 'string' ? citizen.inventory : JSON.stringify(citizen.inventory),
        fingerprint: metadata?.fingerprint ?? null,
        bloodType: metadata?.bloodtype ?? null,
        isDead: metadata?.isdead ?? false,
        isHandcuffed: metadata?.ishandcuffed ?? false,
        inJail: metadata?.injail ?? 0,
        lastSyncedAt: new Date()
      } satisfies Prisma.CitizenCreateInput;

      await prisma.citizen.upsert({
        where: {
          citizenId: citizen.citizenid
        },
        create: citizenData,
        update: {
          ...citizenData,
          organization: undefined // Remove organization from update to prevent relation errors
        }
      });

      results.updated++;
    } catch (error) {
      console.error(`Error processing citizen ${citizen.citizenid}:`, error);
      results.errors++;
    }
  });

  await Promise.all(operations);
  return results;
}

async function processVehicleBatch(
  vehicles: ApiVehicle[],
  citizenId: string,
  organizationId: string,
  onProgress?: (current: number, total: number) => void
) {
  const results = {
    created: 0,
    updated: 0,
    errors: 0
  };

  const operations = vehicles.map(async (vehicle) => {
    try {
      // Utiliser directement vehicle comme modèle
      const modelName = vehicle.vehicle ? vehicle.vehicle.toUpperCase() : 'Unknown';

      // Convertir l'état en chaîne de caractères
      const stateMap: Record<number, string> = {
        0: 'out',
        1: 'in',
        2: 'impound'
      };

      // Convertir l'état en nombre si c'est une chaîne
      const stateValue = typeof vehicle.state === 'string' 
        ? parseInt(vehicle.state, 10) 
        : vehicle.state;

      // Convertir les timestamps en dates
      const lastUpdate = vehicle.last_update ? new Date(vehicle.last_update * 1000) : null;
      const impoundedTime = vehicle.impoundedtime ? new Date(vehicle.impoundedtime * 1000) : null;
      const impoundTime = vehicle.impoundtime ? new Date(vehicle.impoundtime * 1000) : null;
      const financeTime = vehicle.financetime ? new Date(vehicle.financetime * 1000) : null;

      // Extraire les données de couleur et de dommages
      let colorData: Prisma.InputJsonValue = {};
      let damageData: Prisma.InputJsonValue = {};

      if (vehicle.mods) {
        try {
          const modsData = typeof vehicle.mods === 'string' ? JSON.parse(vehicle.mods) : vehicle.mods;
          
          // Extraire les couleurs
          if (modsData.color1 !== undefined || modsData.color2 !== undefined || modsData.pearlescentColor !== undefined) {
            colorData = {
              primary: modsData.color1,
              secondary: modsData.color2,
              pearlescent: modsData.pearlescentColor
            };
          }

          // Extraire les dommages
          if (modsData.bodyHealth !== undefined || modsData.engineHealth !== undefined || 
              modsData.tankHealth !== undefined || modsData.tireHealth !== undefined) {
            damageData = {
              body: modsData.bodyHealth,
              engine: modsData.engineHealth,
              tank: modsData.tankHealth,
              wheels: modsData.tireHealth
            };
          }
        } catch (error) {
          logger.error(`Error parsing vehicle mods for ${vehicle.plate}:`, error);
        }
      }

      const vehicleData = {
        id: vehicle.plate,
        plate: vehicle.plate,
        vin: vehicle.vin,
        hash: vehicle.hash.toString(),
        vehicle: vehicle.vehicle,
        model: modelName,
        brand: 'Unknown',
        type: vehicle.type,
        class: 'Unknown',
        fuel: vehicle.fuel,
        engineHealth: vehicle.engine,
        bodyHealth: vehicle.body,
        mileage: vehicle.drivingdistance,
        color: colorData,
        state: stateMap[stateValue] ?? 'unknown',
        garage: vehicle.garage,
        garageState: vehicle.status,
        stored: vehicle.stored,
        wheelclamp: vehicle.wheelclamp,
        mods: vehicle.mods ? (typeof vehicle.mods === 'string' ? vehicle.mods : JSON.stringify(vehicle.mods)) : Prisma.JsonNull,
        extras: vehicle.mods ? (() => {
          try {
            const modsData = typeof vehicle.mods === 'string' ? JSON.parse(vehicle.mods) : vehicle.mods;
            return modsData.extras ? JSON.stringify(modsData.extras) : Prisma.JsonNull;
          } catch {
            return Prisma.JsonNull;
          }
        })() : Prisma.JsonNull,
        damage: damageData,
        customName: vehicle.custom_name,
        isFavorite: vehicle.is_favorite === 1,
        depotPrice: vehicle.depotprice,
        drivingDistance: vehicle.drivingdistance,
        balance: vehicle.balance,
        paymentAmount: vehicle.paymentamount,
        paymentsLeft: vehicle.paymentsleft,
        financeTime: financeTime,
        impoundedTime: impoundedTime,
        impoundReason: vehicle.impoundreason,
        impoundedBy: vehicle.impoundedby,
        impoundType: vehicle.impoundtype,
        impoundFee: vehicle.impoundfee,
        impoundTime: impoundTime,
        glovebox: vehicle.glovebox ? (typeof vehicle.glovebox === 'string' ? vehicle.glovebox : JSON.stringify(vehicle.glovebox)) : Prisma.JsonNull,
        trunk: vehicle.trunk ? (typeof vehicle.trunk === 'string' ? vehicle.trunk : JSON.stringify(vehicle.trunk)) : Prisma.JsonNull,
        job: vehicle.job,
        storedInGang: vehicle.stored_in_gang,
        sharedGarageId: vehicle.shared_garage_id ? vehicle.shared_garage_id.toString() : null,
        lastPosition: vehicle.mods ? (() => {
          try {
            const modsData = typeof vehicle.mods === 'string' ? JSON.parse(vehicle.mods) : vehicle.mods;
            return modsData.lastPosition ? JSON.stringify(modsData.lastPosition) : Prisma.JsonNull;
          } catch {
            return Prisma.JsonNull;
          }
        })() : Prisma.JsonNull,
        citizen: { connect: { citizenId: citizenId } },
        organization: { connect: { id: organizationId } },
        lastSyncedAt: new Date(),
        lastUpdated: lastUpdate ?? new Date(),
      } satisfies PrismaTypes.VehicleCreateInput;

      await prisma.vehicle.upsert({
        where: { plate: vehicle.plate },
        create: vehicleData,
        update: {
          ...vehicleData,
          citizen: undefined,
          organization: undefined,
        } satisfies PrismaTypes.VehicleUpdateInput,
      });

      results.updated++;
    } catch (error) {
      logger.error(`Error processing vehicle ${vehicle.plate}:`, error);
      results.errors++;
    }
  });

  await Promise.all(operations);
  onProgress?.(vehicles.length, vehicles.length);
  return results;
}

type SyncStats = {
  created: number;
  updated: number;
  errors: number;
};

type SyncStatusResult = {
  status: 'idle' | 'error';
  lastSyncAt?: Date;
  error?: string;
  stats?: {
    citizens: SyncStats;
    vehicles: SyncStats;
  };
};

async function fetchESXCitizens(config: SyncConfig['esx']): Promise<ESXCitizen[]> {
  if (!config?.baseUrl) throw new Error('ESX base URL not configured');
  
  const response = await fetch(`${config.baseUrl}/esx/citizens`);
  if (!response.ok) throw new Error('Failed to fetch ESX citizens');
  return response.json();
}

async function fetchQBCoreCitizens(config: SyncConfig['qbcore']): Promise<QBCoreCitizen[]> {
  if (!config?.baseUrl) throw new Error('QBCore base URL not configured');
  
  const response = await fetch(`${config.baseUrl}/qbcore/citizens`);
  if (!response.ok) throw new Error('Failed to fetch QBCore citizens');
  return response.json();
}

type ESXStatus = {
  name: string;
  percent: number;
  val: number;
};

function mapESXCitizenToDatabase(esxCitizen: ESXCitizen, organizationId: string): Prisma.CitizenUncheckedCreateInput {
  const accounts = JSON.parse(esxCitizen.accounts) as ESXAccount;
  const metadata = JSON.parse(esxCitizen.metadata) as Record<string, unknown>;
  const position = JSON.parse(esxCitizen.position) as { x: number; y: number; z: number };
  const status = JSON.parse(esxCitizen.status) as ESXStatus[];
  
  const hunger = status.find((s) => s.name === 'hunger')?.percent ?? 0;
  const thirst = status.find((s) => s.name === 'thirst')?.percent ?? 0;
  
  const fingerprint = typeof metadata.fingerprint === 'string' ? metadata.fingerprint : null;
  const bloodType = typeof metadata.bloodtype === 'string' ? metadata.bloodtype : null;
  
  return {
    citizenId: esxCitizen.identifier,
    organizationId,
    name: `${esxCitizen.firstname} ${esxCitizen.lastname}`,
    firstName: esxCitizen.firstname,
    lastName: esxCitizen.lastname,
    dateOfBirth: new Date(esxCitizen.dateofbirth),
    gender: esxCitizen.sex,
    phone: esxCitizen.phone_number ?? '',
    nationality: 'Unknown', // ESX doesn't have this
    money: JSON.stringify({
      cash: accounts.money,
      bank: accounts.bank,
      crypto: accounts.black_money, // Using black_money as crypto for ESX
    }),
    charinfo: JSON.stringify({
      firstname: esxCitizen.firstname,
      lastname: esxCitizen.lastname,
      birthdate: esxCitizen.dateofbirth,
      gender: esxCitizen.sex,
      nationality: 'Unknown',
      phone: esxCitizen.phone_number ?? '',
    }),
    job: JSON.stringify({
      name: esxCitizen.job,
      grade: esxCitizen.job_grade,
    }),
    gang: Prisma.JsonNull,
    position: JSON.stringify(position),
    metadata: JSON.stringify({
      ...metadata,
      hunger,
      thirst,
      health: metadata.health ?? 100,
      armor: metadata.armor ?? 0,
      stress: metadata.stress ?? 0,
    }),
    inventory: JSON.stringify(JSON.parse(esxCitizen.inventory) as InventoryItem[]),
    fingerprint,
    bloodType,
    isDead: esxCitizen.is_dead,
    isHandcuffed: false, // ESX doesn't have this
    inJail: 0, // ESX doesn't have this
    lastUpdated: new Date(),
    lastSyncedAt: new Date(),
  };
}

function mapQBCoreCitizenToDatabase(qbCitizen: QBCoreCitizen, organizationId: string): Prisma.CitizenUncheckedCreateInput {
  const metadata = qbCitizen.metadata as {
    health: number;
    armor: number;
    hunger: number;
    thirst: number;
    stress: number;
    fingerprint?: string;
    bloodtype?: string;
  };

  return {
    citizenId: qbCitizen.citizenid,
    organizationId,
    name: `${qbCitizen.charinfo.firstname} ${qbCitizen.charinfo.lastname}`,
    firstName: qbCitizen.charinfo.firstname,
    lastName: qbCitizen.charinfo.lastname,
    dateOfBirth: new Date(qbCitizen.charinfo.birthdate),
    gender: qbCitizen.charinfo.gender,
    phone: qbCitizen.charinfo.phone,
    nationality: qbCitizen.charinfo.nationality,
    money: JSON.stringify({
      cash: qbCitizen.money.cash,
      bank: qbCitizen.money.bank,
      crypto: qbCitizen.money.crypto,
    }),
    charinfo: JSON.stringify(qbCitizen.charinfo),
    job: JSON.stringify(qbCitizen.job),
    gang: JSON.stringify(qbCitizen.gang),
    position: JSON.stringify(qbCitizen.position),
    metadata: JSON.stringify({
      health: metadata.health,
      armor: metadata.armor,
      hunger: metadata.hunger,
      thirst: metadata.thirst,
      stress: metadata.stress,
    }),
    inventory: JSON.stringify(qbCitizen.inventory),
    fingerprint: metadata.fingerprint ?? null,
    bloodType: metadata.bloodtype ?? null,
    isDead: qbCitizen.isDead,
    isHandcuffed: qbCitizen.isHandcuffed,
    inJail: qbCitizen.inJail,
    lastUpdated: new Date(),
    lastSyncedAt: new Date(),
  };
}

export async function syncCitizens(config: SyncConfig): Promise<SyncStatusResult> {
  try {
    let citizens;
    let mappedCitizens: Prisma.CitizenUncheckedCreateInput[];

    if (config.system === 'esx') {
      citizens = await fetchESXCitizens(config.esx);
      mappedCitizens = citizens.map(c => mapESXCitizenToDatabase(c, config.organizationId));
    } else {
      citizens = await fetchQBCoreCitizens(config.qbcore);
      mappedCitizens = citizens.map(c => mapQBCoreCitizenToDatabase(c, config.organizationId));
    }

    const batches = Array.from({ length: Math.ceil(mappedCitizens.length / SYNC_BATCH_SIZE) }, (_, i) =>
      mappedCitizens.slice(i * SYNC_BATCH_SIZE, (i + 1) * SYNC_BATCH_SIZE)
    );

    const citizenResults = {
      created: 0,
      updated: 0,
      errors: 0
    };

    // Process citizens in batches
    const citizenBatchResults = await Promise.all(
      batches.map(async (batch) => {
        const results = {
          created: 0,
          updated: 0,
          errors: 0
        };

        await Promise.all(batch.map(async (citizen) => {
          try {
            await prisma.citizen.upsert({
              where: { 
                citizenId: citizen.citizenId
              },
              create: citizen,
              update: {
                ...citizen,
                organizationId: undefined // Remove organizationId from update to prevent relation errors
              },
            });
            results.updated++;
          } catch (error) {
            console.error(`Error processing citizen ${citizen.citizenId}:`, error);
            results.errors++;
          }
        }));

        return results;
      })
    );

    // Aggregate citizen results
    citizenBatchResults.forEach(results => {
      citizenResults.created += results.created;
      citizenResults.updated += results.updated;
      citizenResults.errors += results.errors;
    });

    const vehicleResults = {
      created: 0,
      updated: 0,
      errors: 0
    };

    // Process vehicles for each citizen
    const vehiclePromises = citizens.map(async (citizen) => {
      try {
        const citizenId = 'citizenid' in citizen ? citizen.citizenid : citizen.identifier;
        const vehicles = await fetchApiData<ApiVehicle[]>(
          `${config.system === 'esx' ? config.esx?.baseUrl : config.qbcore?.baseUrl}/vehicles/${citizenId}`
        );
        
        if (vehicles.length === 0) {
          logger.info(`No vehicles found for citizen ${citizenId}`);
          return;
        }

        const batches = Array.from({ length: Math.ceil(vehicles.length / SYNC_BATCH_SIZE) }, (_, i) =>
          vehicles.slice(i * SYNC_BATCH_SIZE, (i + 1) * SYNC_BATCH_SIZE)
        );

        const batchResults = await Promise.all(
          batches.map(async (batch) => 
            processVehicleBatch(
              batch, 
              citizenId, 
              config.organizationId,
              (current, total) => {
                logger.info(`Processing vehicles batch for ${citizenId}: ${current}/${total}`);
              }
            )
          )
        );

        // Aggregate batch results
        batchResults.forEach(results => {
          vehicleResults.created += results.created;
          vehicleResults.updated += results.updated;
          vehicleResults.errors += results.errors;
        });
      } catch (error) {
        const citizenId = 'citizenid' in citizen ? citizen.citizenid : citizen.identifier;
        logger.error(`Error syncing vehicles for citizen ${citizenId}:`, error);
        vehicleResults.errors++;
      }
    });

    await Promise.all(vehiclePromises);

    logger.info('Sync completed', {
      citizens: citizenResults,
      vehicles: vehicleResults
    });

    // Revalidate pages
    revalidatePath('/citizens');
    revalidatePath('/vehicles');

    return {
      status: 'idle',
      lastSyncAt: new Date(),
      stats: {
        citizens: citizenResults,
        vehicles: vehicleResults
      }
    };
  } catch (error) {
    logger.error('Sync error:', error);
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
}

export async function getSyncStatus(organizationId: string): Promise<SyncStatusResult> {
  try {
    const lastCitizen = await prisma.citizen.findFirst({
      where: { organizationId },
      orderBy: { updatedAt: 'desc' },
      select: { updatedAt: true },
    });

    return {
      status: 'idle',
      lastSyncAt: lastCitizen?.updatedAt,
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : 'Unknown error occurred',
    };
  }
} 