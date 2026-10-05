<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;

class NipSeeder extends Seeder
{
    public function run(): void
    {
        $data = [
            ['name' => 'Muhtarom, A.Md.', 'nip' => '1984111620200801', 'no_wa' => '085749167828'],
            ['name' => 'Tri Yanuar Krismawan, S.T.', 'nip' => '1982013120200801', 'no_wa' => '081335609979'],
            ['name' => 'Bagus Iksan Sukoco, A.M.Kom.', 'nip' => '1983011520200801', 'no_wa' => '08133103316'],
            ['name' => 'Nur Aripin', 'nip' => '1975071120200801', 'no_wa' => '081335520241'],
            ['name' => 'Bambang Catur Kartika', 'nip' => '1978042120200801', 'no_wa' => '081234304866'],
            ['name' => 'Ahmat Nurwakit, S.Kom.', 'nip' => '1979040820200801', 'no_wa' => '081578763221'],
            ['name' => 'Luxsee Meirfin, A.Ma.', 'nip' => '1988100120200801', 'no_wa' => '083831775884'],
            ['name' => 'Ianrita Aprilia Pratama Putri, S.Pd.', 'nip' => '1991040520200801', 'no_wa' => '081335358113'],
            ['name' => 'Pebty Rohmaningrum, S.E.', 'nip' => '1983021420200801', 'no_wa' => '081336750602'],
            ['name' => 'Deshinta Ayu Setiarti, S.Kom.', 'nip' => '1996122520200801', 'no_wa' => '085748600456'],
            ['name' => 'Darmawan Lahru Riatma, S.Kom., M.MT.', 'nip' => '1991091420200801', 'no_wa' => '085648918953'],
            ['name' => 'Masbahah, S.Pd., M.Pd.', 'nip' => '1987052520200801', 'no_wa' => '085646773344'],
            ['name' => 'Yusuf Fadlila Rachman, S. Kom., M. Kom.', 'nip' => '1994062420210701', 'no_wa' => '085712963045'],
            ['name' => 'Nur Azizul Haqimi, S.Kom., M.Cs.', 'nip' => '1992092420200901', 'no_wa' => '082137092020'],
            ['name' => 'Trisna Ari Roshinta, S.ST.,M.T', 'nip' => '1993010520210701', 'no_wa' => '085649169959'],
            ['name' => 'Rifa Khoirunisa, M.Kom', 'nip' => '198905282024062001', 'no_wa' => '085729894321'],
            ['name' => 'Ahmad Faisal Sani, S.Kom., M.Kom.', 'nip' => '199004272024061003', 'no_wa' => '081393400030'],
            ['name' => 'Alfi Nur Rochmah, S.TP., M.Sc.', 'nip' => '1989051920200801', 'no_wa' => '085725120133'],
            ['name' => 'Yenny Febriana Ramadhan Abdi, S.Si., M.Si.', 'nip' => '1995020420200801', 'no_wa' => '0895378033823'],
            ['name' => 'Dininurilmi Putri Suleman, S.TP., M.TP., M.Sc.', 'nip' => '1995020220210701', 'no_wa' => '081938383549'],
            ['name' => 'Rizka Mulyani, S.Pt., M.Sc.', 'nip' => '1995101420210701', 'no_wa' => '081377654329'],
            ['name' => 'Fitriyah Zulfa, S.KM., M.Si.', 'nip' => '1977090720210701', 'no_wa' => '081233927308'],
            ['name' => 'Prakoso Adi, S.TP., M.Sc.', 'nip' => '1993121820210701', 'no_wa' => '08995777494'],
            ['name' => 'Prajwalita Rukmakharisma Rizki, S.TP., M.Sc.', 'nip' => '1991101520221101', 'no_wa' => '081335652404'],
            ['name' => 'Dini Nadhilah, S.Pi, M.Si', 'nip' => '1994042020221101', 'no_wa' => '082113117901'],
            ['name' => 'Labbaika Dwi Ayu Rahmawanti, S.E., M.Ak.', 'nip' => '199609262020080', 'no_wa' => '08984860798'],
            ['name' => 'Denty Arista, S.E., M.S.A.', 'nip' => '1992100920200801', 'no_wa' => '085865387940'],
            ['name' => 'Zaim Arif Eko Saputra, S.E., M. Acc.', 'nip' => '199104232024061001', 'no_wa' => '081226818875'],
            ['name' => 'Galuh Tiaramurti, M.Ak.', 'nip' => '1996083120221101', 'no_wa' => '081357626188'],
            ['name' => 'Bayu Seto, S.E., M.Acc.', 'nip' => '199205182024061001', 'no_wa' => '085253666331'],
            ['name' => 'Emy Dwi Nursulistyo, S.Pd., M.Ak.', 'nip' => '199805102024062001', 'no_wa' => '087710589590']
        ];

        $roleMappings = [
            'user1@gmail.com' => 'bendahara',
            'user2@gmail.com' => 'verifikator_spj',
            'user3@gmail.com' => 'sub_kor',
            'user5@gmail.com' => 'koordinator',
            'user6@gmail.com' => 'keuangan',
            'user7@gmail.com' => 'wakil_dekan',
            'user11@gmail.com' => 'pic_kegiatan',
            'user12@gmail.com' => 'pic_kegiatan',
            'user23@gmail.com' => 'pic_kegiatan',
            'koordinator@gmail.com' => 'koordinator',
            'tris@gmail.com' => 'wakil_dekan',
            'eko@email.com' => 'sub_kor',
            'user_test@gmail.com' => 'pic_kegiatan',
        ];

        foreach ($data as $item) {
            User::where('name', 'LIKE', '%' . trim($item['name']) . '%')
                ->orWhere('name', trim($item['name']))
                ->update([
                    'nip' => $item['nip'],
                    'no_wa' => $item['no_wa']
                ]);
        }

        foreach ($roleMappings as $email => $role) {
            User::where('email', $email)->update(['role' => $role]);
        }
    }
}
