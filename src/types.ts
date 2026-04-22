export type DinTuru =
    | 'İslam'
    | 'Hristiyanlık'
    | 'Yahudilik'
    | 'Hinduizm'
    | 'Budizm'
    | 'Dinsiz'
    | 'Geleneksel/Animist'
    | 'Sih'
    | 'Diğer';

export interface Mezhep {
    isim: string;
    yuzde: number;
}

export interface DinVerisi {
    din: DinTuru;
    yuzde: number;
    mezhepler?: Mezhep[];
}

export type GuvenilirlikBayragi = 'yüksek' | 'orta' | 'düşük' | 'veri_yok';
export type VeriTipi = 'Sadece Din' | 'Din + Mezhep';

export interface Ulke {
    ulke: string;
    ulkeKodu: string;
    nufus: number;
    dinler: DinVerisi[];
    guvenilirlik: GuvenilirlikBayragi;
    veriTipi: VeriTipi;
    kaynakReferansi: string;
}

export type SiralamaAlani = 'ulke' | 'baskinDin' | 'yuzde' | 'nufus' | 'veriTipi';
export type SiralamaYonu = 'artan' | 'azalan';

export interface SiralamaYapisi {
    alan: SiralamaAlani;
    yon: SiralamaYonu;
}
