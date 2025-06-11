export type ApiCitizen = {
  id: number;
  citizenid: string;
  cid: number;
  license: string;
  name: string;
  money: {
    cash: number;
    bank: number;
    crypto: number;
  };
  charinfo: {
    account: string;
    birthdate: string;
    phone: string;
    lastname: string;
    cid: string;
    gender: string;
    firstname: string;
    nationality: string;
  };
  job: {
    name: string;
    type: string;
    label: string;
    isboss: boolean;
    grade: {
      isboss: boolean;
      name: string;
      payment: number;
      level: number;
    };
    onduty: boolean;
  };
  gang: {
    label: string;
    name: string;
    isboss: boolean;
    grade: {
      name: string;
      isboss: boolean;
      level: number;
    };
  };
  position: {
    x: number;
    y: number;
    z: number;
  };
  metadata: {
    inlaststand: boolean;
    ishandcuffed: boolean;
    hunger: number;
    fingerprint: string;
    status: StatusEffect[];
    l2s_dispatch: {
      busy: boolean;
      dispatch: boolean;
      callsign: string;
    };
    licences: {
      driver: boolean;
      weapon: boolean;
      business: boolean;
    };
    jailitems: InventoryItem[];
    phone: PhoneApp[];
    tracker: boolean;
    callsign: string;
    rep: { type: string; amount: number }[];
    stress: number;
    criminalrecord: {
      hasRecord: boolean;
    };
    phonedata: {
      SerialNumber: number;
      InstalledApps: PhoneApp[];
    };
    inside: {
      apartment: { id: string; name: string }[];
    };
    armor: number;
    injail: number;
    isdead: boolean;
    bloodtype: string;
    thirst: number;
    walletid: string;
  };
  inventory: InventoryItem[];
  last_updated: string;
}

export type VehicleMods = {
  color1: number;
  color2: number;
  pearlescentColor: number;
  modStruts: number;
  windowTint: number;
  plateIndex: number;
  modDial: number;
  modDashboard: number;
  modSteeringWheel: number;
  modArchCover: number;
  modSideSkirt: number;
  tireBurstState: Record<string, boolean>;
  modEngine: number;
  modBackWheels: number;
  modGrille: number;
  modFender: number;
  extras: number[];
  modTank: number;
  modHorns: number;
  tireBurstCompletely: Record<string, boolean>;
  modKit21: number;
  modTurbo: boolean;
  modAirFilter: number;
  oilLevel: number;
  modHood: number;
  modExhaust: number;
  modRearBumper: number;
  modFrontBumper: number;
  modShifterLeavers: number;
  doorStatus: Record<string, boolean>;
  modTransmission: number;
  model: number;
  bodyHealth: number;
  modDoorSpeaker: number;
  modOrnaments: number;
  modBrakes: number;
  modRoof: number;
  modHydrolic: number;
  tireHealth: Record<string, number>;
  dashboardColor: number;
  modSeats: number;
  xenonColor: number;
  modVanityPlate: number;
  modCustomTiresR: boolean;
  modRightFender: number;
  modPlateHolder: number;
  modSpoilers: number;
  liveryRoof: number;
  wheelWidth: number;
  modAerials: number;
  modLivery: number;
  modKit47: number;
  modSuspension: number;
  modFrontWheels: number;
  modCustomTiresF: boolean;
  modTrunk: number;
  modSpeakers: number;
  neonColor: [number, number, number];
  fuelLevel: number;
  interiorColor: number;
  modXenon: boolean;
  modAPlate: number;
  tankHealth: number;
  modTrimB: number;
  modArmor: number;
  modKit49: number;
  modKit19: number;
  modFrame: number;
  modTrimA: number;
  tyreSmokeColor: [number, number, number];
  windowStatus: Record<string, boolean>;
  dirtLevel: number;
  wheelColor: number;
  modWindows: number;
  wheels: number;
  neonEnabled: [boolean, boolean, boolean, boolean];
  modSmokeEnabled: boolean;
  wheelSize: number;
  engineHealth: number;
  plate: string;
  modKit17: number;
  modEngineBlock: number;
};

export type ApiVehicle = {
  id: number;
  license: string;
  citizenid: string;
  vehicle: string;
  hash: number;
  mods: string | VehicleMods;
  plate: string;
  fakeplate: string | null;
  garage: string;
  fuel: number;
  engine: number;
  body: number;
  state: number;
  depotprice: number;
  drivingdistance: number | null;
  status: string | null;
  balance: number;
  paymentamount: number;
  paymentsleft: number;
  financetime: number;
  job: string | null;
  type: string;
  stored: boolean;
  glovebox: string | null;
  trunk: string | null;
  vin: string;
  wheelclamp: boolean;
  last_update: number;
  custom_name: string | null;
  is_favorite: number;
  stored_in_gang: string | null;
  shared_garage_id: string | null;
  impoundedtime: number;
  impoundreason: string | null;
  impoundedby: string | null;
  impoundtype: string | null;
  impoundfee: number | null;
  impoundtime: number | null;
}

export type SyncConfig = {
  apiUrl: string;
  organizationId: string;
  syncInterval?: number; // en millisecondes
  lastSyncAt?: Date;
}

export type SyncStatus = {
  status: 'idle' | 'syncing' | 'error';
  lastSyncAt?: Date;
  error?: string;
  progress?: {
    total: number;
    current: number;
    type: 'citizens' | 'vehicles';
  };
}

export type StatusEffect = {
  name: string;
  value: number;
  timeLeft?: number;
};

export type PhoneApp = {
  id: string;
  name: string;
  icon?: string;
  enabled: boolean;
};

export type InventoryItem = {
  name: string;
  count: number;
  slot: number;
  metadata?: {
    [key: string]: string | number | string[] | undefined;
    registered?: string;
    durability?: number;
    ammo?: number;
    components?: string[];
    serial?: string;
  };
};

export type VehicleMod = {
  id: number;
  name: string;
  value: number | boolean;
};

export type VehicleDamage = {
  component: string;
  damage: number;
}; 