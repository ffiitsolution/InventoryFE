export class SupplierShape {
    kodeSupplier: string;
    namaSupplier: string;
    alamat1: string;
    alamat2: string;
    kota: string;
    kodePos: string;
    telepon1: string;
    telepon2: string;
    fax1: string;
    fax2: string;
    kirimData: string;
    alamatEmail: string;
    defaultGudang: string;
    kodeRsc: string;
    statusAktif: string;
}

export class UserShape {
    token: string;
    statusAktif: boolean;
    name: string;
    namUser: string;
    kodeUser: string;
    jabatan: string;
    expireAt: string;
    defaultLocation: DataLocationShape;
}

export class DataLocationShape {
    mainMenu: string;
    userUpdate: string;
    timeUpdate: string;
    statusSync: string;
    lokasiGudang: string;
    dateCreate: string;
    userCreate: string;
    timeCreate: string;
    defaultRsc: string;
    dateUpdate: string;
    kodeLocation: string;
    kodeInisial: string;
    supportTo: string;
    keteranganLokasi: string;
    kodeUser: string;
}