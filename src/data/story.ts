export const DISCLAIMER =
  'Permainan ini ialah demonstrasi fiksyen yang diinspirasikan oleh sejarah dan warisan Silat Seni Gayong. Beberapa watak, dialog dan peristiwa telah didramatisasikan untuk tujuan permainan.';
export type Line = { name: string; text: string };
export const mentor: Line[] = [
  { name: 'ARIF', text: 'Angin terasa lain hari ini, tuan.' },
  {
    name: 'MEOR ABDUL RAHMAN',
    text: 'Dalam gelisah, tenangkan langkah. Kita masih punya tanggungjawab kepada kampung ini.',
  },
  {
    name: 'MEOR ABDUL RAHMAN',
    text: 'Kekuatan bukan untuk menunjuk gagah. Ilmu datang bersama amanah.',
  },
  { name: 'MEOR ABDUL RAHMAN', text: 'Mari. Kenali jarak, jaga imbangan. Kita mula dengan asas.' },
];
export const alarm: Line[] = [
  { name: 'NELAYAN', text: 'Ada kekacauan dekat jeti! Orang kampung perlukan bantuan.' },
  { name: 'MEOR ABDUL RAHMAN', text: 'Arif, pastikan mereka selamat. Jangan kejar amarah.' },
];
export const conclusion: Line[] = [
  { name: 'ARIF', text: 'Mereka sudah berundur. Orang kampung selamat.' },
  { name: 'MEOR ABDUL RAHMAN', text: 'Gayong bukan sekadar gerak tubuh.' },
  { name: 'MEOR ABDUL RAHMAN', text: 'Yang kita pertahankan ialah maruah, keluarga dan amanah.' },
];
export const training = [
  {
    title: 'Langkah pertama · Serangan ringan',
    text: 'Dekati rakan latihan. Tekan J tiga kali untuk melengkapkan kombo.',
    key: 'J × 3',
  },
  {
    title: 'Pecahkan pertahanan',
    text: 'Tekan K untuk serangan berat. Gerak ini lebih lambat, tetapi memecahkan blok.',
    key: 'K',
  },
  {
    title: 'Jaga pertahanan',
    text: 'Tahan L ketika rakan menyerang. Hadap ke arah serangan.',
    key: 'TAHAN L',
  },
  {
    title: 'Baca gerak · Tangkis',
    text: 'Lepaskan L. Tekan semula ketika serangan hampir tiba — tanda putih muncul.',
    key: 'L · TEPAT MASA',
  },
  {
    title: 'Keluar dari garis serangan',
    text: 'Tekan Q ketika serangan hampir tiba untuk mengelak.',
    key: 'Q',
  },
  {
    title: 'Tamatkan pertarungan',
    text: 'Dekati rakan yang goyah. Tekan F untuk jatuhan terkawal.',
    key: 'F',
  },
] as const;
