// Generated by https://quicktype.io

import type { ContingentVechileType } from "@prisma/client";

export interface BookingFormData {
  bookerName: string;
  bookerPhone: string;
  province: string;
  city: string;
  regionCoordinatorName: string;
  regionCoordinatorPhone: string;
  contingents: Contingent[];
}

export interface Contingent {
  name: string;
  personCount: number;
  vechileType: ContingentVechileType;
  contingentCoordinatorName: string;
  contingentCoordinatorPhone: string;
}

export interface AddressOption {
  value: string;
  label: string;
}
