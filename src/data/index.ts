import { asyaUlkeleri } from './asya';
import { avrupaUlkeleri } from './avrupa';
import { afrikaUlkeleri } from './afrika';
import { amerikalarUlkeleri } from './amerikalar';
import { okyanusyaUlkeleri } from './okyanusya';
import type { Ulke } from '../types';

export const tumUlkeler: Ulke[] = [
    ...asyaUlkeleri,
    ...avrupaUlkeleri,
    ...afrikaUlkeleri,
    ...amerikalarUlkeleri,
    ...okyanusyaUlkeleri,
].sort((a, b) => b.nufus - a.nufus);

export const ulkeKoduHaritasi: Record<string, Ulke> = {};
for (const ulke of tumUlkeler) {
    ulkeKoduHaritasi[ulke.ulkeKodu] = ulke;
}

export { asyaUlkeleri, avrupaUlkeleri, afrikaUlkeleri, amerikalarUlkeleri, okyanusyaUlkeleri };
